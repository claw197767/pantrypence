# Membership, payments, and private documents

## Required configuration

Keep these server-side environment variables in Vercel (never prefix the service key or webhook secret with `NEXT_PUBLIC_`):

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL` (production site origin, e.g. `https://www.pantrypence.co.uk`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

In Stripe, add a webhook endpoint at `https://YOUR_DOMAIN/api/stripe/webhook` and subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. Set the endpoint signing secret as `STRIPE_WEBHOOK_SECRET`.

## Setup steps

1. Apply both migrations in order: `supabase/migrations/20261111000000_private_user_files.sql` and `supabase/migrations/20261112000000_paid_memberships.sql`.
2. Configure Supabase Auth email/OTP redirect URLs to include `https://YOUR_DOMAIN/auth/callback` and your local development callback.
3. Set the required environment variables in Vercel and redeploy. Configure the Stripe webhook secret after creating the endpoint.
4. In Supabase, grant `app_metadata.role = admin` only to trusted administrator accounts using a secure server-side admin process. Never authorize from editable `user_metadata`.
5. Customers begin at `/login`, open their sign-in link in the same browser, then complete checkout at £49/month. Stripe webhook events record subscription state. Active/trialing members can enter `/members` and use their private files. Admins are directed to `/admin/files` and can view all users' files without a subscription. See [private user files](private-user-files.md) for role setup and access details.

The success page waits for a verified Stripe webhook-backed membership record; the browser redirect alone never grants access. The API and database/storage RLS both enforce active membership and owner/admin boundaries.
