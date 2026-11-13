import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function getFileAccess(supabase: SupabaseClient, user: User) {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error("Unable to check membership.", { cause: error });

  const active = Boolean(
    data &&
      ["active", "trialing"].includes(data.status) &&
      (!data.current_period_end || new Date(data.current_period_end) > new Date()),
  );
  const isAdmin = user.app_metadata?.role === "admin";
  return { active, isAdmin, canRead: active || isAdmin };
}
