import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PasswordForm from "./password-form";

export default function PasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#111318] p-8 text-[#f4f1ea]">Checking your account…</main>}>
      <PasswordContent />
    </Suspense>
  );
}

async function PasswordContent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?next=%2Faccount%2Fpassword");

  return <PasswordForm email={user.email ?? ""} />;
}
