import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFileAccess } from "@/lib/membership";

export default function MembersPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#111318] px-6 py-16 text-[#f4f1ea]">
          <div className="mx-auto max-w-5xl">
            <p role="status" className="text-sm text-[#b3b5bb]">
              Checking your membership…
            </p>
          </div>
        </main>
      }
    >
      <MembersContent />
    </Suspense>
  );
}

async function MembersContent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fmembers");

  if (user.app_metadata?.role === "admin") redirect("/admin/files");
  const { active } = await getFileAccess(supabase, user);
  if (!active) redirect("/welcome");

  return (
    <main className="min-h-screen bg-[#111318] px-6 py-16 text-[#f4f1ea]">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">Members area</p>
        <h1 className="mt-3 text-4xl font-semibold">Welcome back</h1>
        <p className="mt-3 text-[#b3b5bb]">Signed in as {user.email}. Your documents are private to you and authorized PantryPence administrators.</p>
        <Link href="/account/password" className="mt-4 inline-block text-sm text-[#e2c681] underline underline-offset-4">Set or change password</Link>
        <section className="mt-10 rounded-3xl border border-white/10 bg-[#1b1e25] p-8">
          <h2 className="text-2xl font-semibold">Your documents</h2>
          <p className="mt-3 max-w-2xl leading-7 text-[#b3b5bb]">Upload supplier invoices, costs and business documents securely. Only your account and authorized administrators can access them.</p>
          <Link href="/files" className="mt-6 inline-flex rounded-full bg-[#d6b36a] px-7 py-3 font-bold text-[#171717]">Open private files</Link>
        </section>
      </div>
    </main>
  );
}
