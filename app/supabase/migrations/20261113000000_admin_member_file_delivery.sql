-- Allow trusted admins to upload files into active members' private folders.
create policy "Admins can register member files"
  on public.user_files for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can upload member files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'user-files'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
