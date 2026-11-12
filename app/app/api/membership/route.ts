import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data, error: membershipError } = await supabase
    .from("user_subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) return NextResponse.json({ error: "Unable to check membership." }, { status: 500 });
  const isActive = Boolean(
    data &&
      ["active", "trialing"].includes(data.status) &&
      (!data.current_period_end || new Date(data.current_period_end) > new Date()),
  );
  return NextResponse.json({ active: isActive, email: user.email });
}
