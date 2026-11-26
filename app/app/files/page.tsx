import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import FilesClient from "./files-client";

export default function FilesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen shimmer-surface bg-[#0a1f14] px-6 py-16 text-[#f4f1ea]">
          <div className="mx-auto max-w-5xl">
            <p role="status" className="text-sm text-[#b3b5bb]">
              Checking your membership…
            </p>
          </div>
        </main>
      }
    >
      <FilesContent />
    </Suspense>
  );
}

async function FilesContent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Ffiles");

  const { data: membership } = await supabase
    .from("user_subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  const active = Boolean(
    membership &&
      ["active", "trialing"].includes(membership.status) &&
      (!membership.current_period_end || new Date(membership.current_period_end) > new Date()),
  );
  if (!active) redirect("/welcome");

  return <FilesClient />;
}
