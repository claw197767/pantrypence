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

1. Apply `supabase/migrations/20261112000000_paid_memberships.sql` to the connected Supabase project.
2. Set the Supabase Auth Site URL to `https://YOUR_DOMAIN` and allow `https://YOUR_DOMAIN/auth/callback` (and your local callback) in its redirect URL list. For email links that work when opened from a different browser or device, update both the **Confirm signup** and **Magic Link** email templates to link directly to the app callback using `{{ .TokenHash }}`:
   - Confirm signup: `<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup&redirect_to={{ .RedirectTo }}">Confirm your email</a>`
   - Magic Link: `<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to={{ .RedirectTo }}">Sign in</a>`

   The callback also accepts Supabase PKCE `code` links that use `{{ .ConfirmationURL }}`, but those links must be opened in the same browser and device where sign-in was requested.
3. Set the required environment variables in Vercel and redeploy. Configure the Stripe webhook secret after creating the endpoint.
4. In Supabase, grant `app_metadata.role = admin` only to trusted administrator accounts using a secure server-side admin process. Never authorize from editable `user_metadata`.
5. Customers begin at `/login` or checkout and verify their email. Existing active members go to `/members`; customers starting checkout continue to the £49/month payment page. Stripe webhook events record subscription state. Only active/trialing members can enter `/members` and use private files. Admins can view files at `/admin/files`.

The success page waits for a verified Stripe webhook-backed membership record; the browser redirect alone never grants access. The API and database/storage RLS both enforce active membership and owner/admin boundaries.
