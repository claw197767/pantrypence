import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen shimmer-surface bg-[#0a1f14] px-6 py-16 text-[#f4f1ea]">
          <div className="mx-auto max-w-6xl">
            <p role="status" className="text-sm text-[#b3b5bb]">
              Checking administrator access…
            </p>
          </div>
        </main>
      }
    >
      <AdminRedirect />
    </Suspense>
  );
}

async function AdminRedirect() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");
  if (user.app_metadata?.role !== "admin") redirect("/members");
  redirect("/admin/files");
  // Unreachable: every path above redirects.
  return null;
}
