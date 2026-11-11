# Private user file storage

The `/api/files` endpoint provides authenticated uploads and listings, plus short-lived download URLs. Uploads are stored in the private Supabase Storage bucket `user-files` under a UUID-owned folder (`<auth-user-id>/<random-id>-<sanitized-original-name>`). File metadata records the owner ID, the verified account email at upload time, original name, type, size, and upload time. The owner and authorized admins can identify records; other users cannot access their metadata or object contents.

## Setup

1. Apply `supabase/migrations/20261111000000_private_user_files.sql` to the Supabase project connected to this app (for example, with the Supabase CLI or SQL editor).
2. Admin authorization is based only on the trusted JWT `app_metadata.role` claim being exactly `admin`. Assign that claim only through a trusted Supabase admin process using a service-role credential; never let a browser/client edit it, and do not use `user_metadata` for authorization.
3. Authenticated users can `POST` multipart form data with a `file` field to `/api/files` (PDF, CSV, XLSX, JPEG, or PNG; maximum 10 MB). `GET /api/files` lists records visible to the caller. `GET /api/files?id=<file-id>` returns metadata and a signed download URL that expires after 60 seconds.

The bucket is private and Storage RLS checks the owner folder or trusted admin claim. The metadata table has separate RLS policies. Do not make the bucket public or expose a service-role key to the client.
