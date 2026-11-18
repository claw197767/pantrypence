import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return NextResponse.json({ error: "Member lookup is not configured." }, { status: 500 });
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: subscriptions, error: subscriptionsError } = await admin
    .from("user_subscriptions")
    .select("user_id, status, current_period_end");

  if (subscriptionsError) {
    return NextResponse.json({ error: "Unable to load members." }, { status: 500 });
  }

  const now = Date.now();
  const activeUserIds = new Set(
    subscriptions
      .filter(
        (subscription) =>
          ["active", "trialing"].includes(subscription.status) &&
          (!subscription.current_period_end ||
            new Date(subscription.current_period_end).getTime() > now),
      )
      .map((subscription) => subscription.user_id),
  );

  const members: { id: string; email: string }[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      return NextResponse.json({ error: "Unable to load member accounts." }, { status: 500 });
    }

    members.push(
      ...data.users
        .filter((member) => activeUserIds.has(member.id) && member.email)
        .map((member) => ({ id: member.id, email: member.email! })),
    );
    if (data.users.length < 1000) break;
  }

  return NextResponse.json({ members });
}
