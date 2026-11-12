import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminFilesList from "./admin-files-list";

export default async function AdminFilesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fadmin%2Ffiles");
  if (user.app_metadata?.role !== "admin") redirect("/members");
  return <AdminFilesList />;
}
