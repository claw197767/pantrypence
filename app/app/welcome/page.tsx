import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import WelcomeStatus from "./welcome-status";

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#111318] px-6 py-16 text-[#f4f1ea]">
          <p role="status" className="text-sm text-[#b3b5bb]">
            Checking your account…
          </p>
        </main>
      }
    >
      <WelcomeContent />
    </Suspense>
  );
}

async function WelcomeContent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fwelcome");
  if (user.app_metadata?.role === "admin") redirect("/admin/files");

  return <WelcomeStatus email={user.email ?? ""} />;
}
