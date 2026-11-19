// Grant a complimentary (free, non-Stripe) membership to a user.
//
// Usage (never commit credentials; pass them via the environment):
//   NEXT_PUBLIC_SUPABASE_URL=... \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   MEMBER_EMAIL=customer@example.com \
//   node scripts/grant-complimentary-membership.mjs
//
// Optional:
//   MEMBER_PERIOD_END=2027-01-01   (ISO date; omit for no expiry)
//
// Creates the Supabase Auth user if they do not exist yet (they sign in
// with the usual email OTP flow), then upserts an active row into
// public.user_subscriptions with a synthetic "comp_" subscription id so
// has_active_membership() grants access without any Stripe billing.

import { createClient } from "@supabase/supabase-js";

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  MEMBER_EMAIL,
  MEMBER_PERIOD_END,
} = process.env;

for (const [name, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  MEMBER_EMAIL,
})) {
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const email = MEMBER_EMAIL.toLowerCase();
const periodEnd = MEMBER_PERIOD_END ? new Date(MEMBER_PERIOD_END) : null;
if (MEMBER_PERIOD_END && Number.isNaN(periodEnd.getTime())) {
  console.error(`MEMBER_PERIOD_END is not a valid date: ${MEMBER_PERIOD_END}`);
  process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Find or create the Auth user.
let userId = null;
for (let page = 1; ; page += 1) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) {
    console.error(`Unable to list users: ${error.message}`);
    process.exit(1);
  }
  const match = data.users.find((user) => user.email?.toLowerCase() === email);
  if (match) {
    userId = match.id;
    break;
  }
  if (data.users.length < 1000) break;
}

if (userId) {
  console.log(`Found existing user ${email} (${userId}).`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error) {
    console.error(`Unable to create user: ${error.message}`);
    process.exit(1);
  }
  userId = data.user.id;
  console.log(`Created user ${email} (${userId}). They can sign in with email OTP.`);
}

// Upsert the complimentary membership.
const { error: upsertError } = await supabase.from("user_subscriptions").upsert(
  {
    user_id: userId,
    stripe_customer_id: null,
    stripe_subscription_id: `comp_${email}`,
    status: "active",
    current_period_end: periodEnd ? periodEnd.toISOString() : null,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "user_id" },
);
if (upsertError) {
  console.error(`Unable to record membership: ${upsertError.message}`);
  process.exit(1);
}

console.log(
  `Complimentary membership active for ${email}` +
    (periodEnd ? ` until ${periodEnd.toISOString()}.` : " with no expiry."),
);
