import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import WelcomeStatus from "./welcome-status";

export default async function WelcomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fwelcome");

  return <WelcomeStatus email={user.email ?? ""} />;
}
