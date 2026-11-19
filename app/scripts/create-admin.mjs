// One-off admin provisioning script.
//
// Usage (never commit credentials; pass them via the environment):
//   NEXT_PUBLIC_SUPABASE_URL=... \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   ADMIN_EMAIL=admin@example.com \
//   ADMIN_PASSWORD=... \
//   node scripts/create-admin.mjs
//
// Creates (or updates) the Supabase Auth user and grants the trusted
// app_metadata.role = "admin" claim required by /api/admin/login.

import { createClient } from "@supabase/supabase-js";

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = process.env;

for (const [name, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
})) {
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error(`Unable to list users: ${listError.message}`);
  process.exit(1);
}

const existing = list.users.find(
  (user) => user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
);

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, {
    password: ADMIN_PASSWORD,
    app_metadata: { ...existing.app_metadata, role: "admin" },
  });
  if (error) {
    console.error(`Unable to update user: ${error.message}`);
    process.exit(1);
  }
  console.log(`Updated existing admin user ${ADMIN_EMAIL} (${existing.id}).`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (error) {
    console.error(`Unable to create user: ${error.message}`);
    process.exit(1);
  }
  console.log(`Created admin user ${ADMIN_EMAIL} (${data.user.id}).`);
}

console.log("Done. Set ADMIN_USERNAME and ADMIN_EMAIL in Vercel to enable /admin/login.");
