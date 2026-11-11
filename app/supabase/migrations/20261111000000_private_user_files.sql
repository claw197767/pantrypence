-- Private per-user document storage for invoices, costs, and business records.
-- Admin access is granted only by the trusted app_metadata.role claim.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-files',
  'user-files',
  false,
  10485760,
  array[
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table public.user_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  uploaded_by_email text not null default '',
  original_filename text not null,
  object_path text not null unique,
  content_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  created_at timestamptz not null default now(),
  constraint user_files_path_matches_owner check (
    split_part(object_path, '/', 1) = owner_id::text
  )
);

create index user_files_owner_created_at_idx
  on public.user_files (owner_id, created_at desc);

alter table public.user_files enable row level security;

create policy "Owners and admins can view file metadata"
  on public.user_files for select to authenticated
  using (
    owner_id = (select auth.uid())
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Owners can register their own files"
  on public.user_files for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and uploaded_by_email = coalesce((select auth.jwt() ->> 'email'), '')
    and (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin'
    or (
      owner_id = (select auth.uid())
      and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

create policy "Owners and admins can read private file objects"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'user-files'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

create policy "Owners can upload to their own private folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners and admins can delete private file objects"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'user-files'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
