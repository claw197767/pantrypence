import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminFilesList from "./admin-files-list";

export default function AdminFilesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#111318] px-6 py-16 text-[#f4f1ea]">
          <div className="mx-auto max-w-6xl">
            <p role="status" className="text-sm text-[#b3b5bb]">
              Checking administrator access…
            </p>
          </div>
        </main>
      }
    >
      <AdminFilesContent />
    </Suspense>
  );
}

async function AdminFilesContent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fadmin%2Ffiles");
  if (user.app_metadata?.role !== "admin") redirect("/members");

  return <AdminFilesList />;
}
