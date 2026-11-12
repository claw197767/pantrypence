import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fmembers");

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

  return (
    <main className="min-h-screen bg-[#111318] px-6 py-16 text-[#f4f1ea]">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">Members area</p>
        <h1 className="mt-3 text-4xl font-semibold">Welcome back</h1>
        <p className="mt-3 text-[#b3b5bb]">Signed in as {user.email}. Your documents are private to you and authorized PantryPence administrators.</p>
        <section className="mt-10 rounded-3xl border border-white/10 bg-[#1b1e25] p-8">
          <h2 className="text-2xl font-semibold">Your documents</h2>
          <p className="mt-3 max-w-2xl leading-7 text-[#b3b5bb]">Upload supplier invoices, costs and business documents securely. Only your account and authorized administrators can access them.</p>
          <Link href="/files" className="mt-6 inline-flex rounded-full bg-[#d6b36a] px-7 py-3 font-bold text-[#171717]">Open private files</Link>
        </section>
      </div>
    </main>
  );
}
