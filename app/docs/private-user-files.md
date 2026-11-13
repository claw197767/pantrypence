# Private user file storage

The `/api/files` endpoint provides authenticated uploads and listings, plus short-lived download URLs. Uploads are stored in the private Supabase Storage bucket `user-files` under a UUID-owned folder (`<auth-user-id>/<random-id>-<sanitized-original-name>`). File metadata records the owner ID, the verified account email at upload time, original name, type, size, and upload time. The owner and authorized admins can identify records; other users cannot access their metadata or object contents.

## Setup

1. Apply both migrations in order: `supabase/migrations/20261111000000_private_user_files.sql`, then `20261112000000_paid_memberships.sql`.
2. Admin authorization is based only on trusted `app_metadata.role` being exactly `admin`. Assign or revoke it using a trusted Supabase admin process; never let a browser/client edit it, and do not use `user_metadata` for authorization. After changing a role, the user must sign in again to refresh their JWT.
3. Members sign in with their account email, open the email link in the same browser, and use `/members` then `/files`. Administrators are directed to `/admin/files`, where they can view and download files belonging to all users, including inactive members. An administrator does not need a subscription to read files.
4. Active or trialing members can `POST` multipart form data with a `file` field to `/api/files` (PDF, CSV, XLSX, JPEG, or PNG; maximum 10 MB). `GET /api/files?page=0` lists up to 50 records visible to the caller and returns `hasMore`; increment `page` for subsequent pages. Add `scope=own` to restrict the list to the caller's files. `GET /api/files?id=<file-id>` returns metadata and a signed download URL that expires after 60 seconds. Admins may read files without a subscription, but uploads require an active or trialing membership.

The bucket is private and Storage RLS checks the owner folder or trusted admin claim. The metadata table has separate RLS policies. Do not make the bucket public or expose a service-role key to the client.

For example, a trusted operator can grant admin access in the Supabase SQL editor using the account's UUID:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where id = 'REPLACE_WITH_USER_UUID';
```

To revoke access, remove the `role` key through the same trusted process. JWT role changes take effect after the user signs in again or their token refreshes; already-issued signed URLs remain valid until they expire.
