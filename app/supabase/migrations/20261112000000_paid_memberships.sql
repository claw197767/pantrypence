-- Subscription entitlements and paid-member-only access to private documents.
create table public.user_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text not null unique,
  status text not null,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

create policy "Members can read their own subscription"
  on public.user_subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Admins can read subscriptions"
  on public.user_subscriptions for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.has_active_membership(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_subscriptions s
    where s.user_id = check_user_id
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

revoke all on function public.has_active_membership(uuid) from public;
grant execute on function public.has_active_membership(uuid) to authenticated;

-- Replace the initial authenticated-only policies with paid-owner/admin policies.
drop policy if exists "Owners and admins can view file metadata" on public.user_files;
drop policy if exists "Owners can register their own files" on public.user_files;
drop policy if exists "Owners and admins can read private file objects" on storage.objects;
drop policy if exists "Owners can upload to their own private folder" on storage.objects;
drop policy if exists "Owners and admins can delete private file objects" on storage.objects;

create policy "Paid owners and admins can view file metadata"
  on public.user_files for select to authenticated
  using (
    (owner_id = (select auth.uid()) and public.has_active_membership((select auth.uid())))
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Paid owners can register their own files"
  on public.user_files for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and public.has_active_membership((select auth.uid()))
    and uploaded_by_email = coalesce((select auth.jwt() ->> 'email'), '')
  );

create policy "Paid owners and admins can read private file objects"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'user-files'
    and (
      ((storage.foldername(name))[1] = (select auth.uid())::text
       and public.has_active_membership((select auth.uid())))
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

create policy "Paid owners can upload to their own private folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.has_active_membership((select auth.uid()))
  );

create policy "Paid owners and admins can delete private file objects"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'user-files'
    and (
      ((storage.foldername(name))[1] = (select auth.uid())::text
       and public.has_active_membership((select auth.uid())))
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
