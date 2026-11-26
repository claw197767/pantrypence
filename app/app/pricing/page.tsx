import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen shimmer-surface bg-[#0a1f14] px-6 py-16 text-[#f4f1ea]">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">Pricing</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">One membership, £49 a month.</h1>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-[#aeb1b8]">
          A monthly profit &amp; margin audit for your hospitality business — no setup fee, cancel anytime.
        </p>
        <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-[#d6b36a]/30 bg-[#12311f] p-8 text-left shadow-xl">
          <p className="text-5xl font-semibold">£49<span className="text-xl font-normal text-[#aeb1b8]"> / month</span></p>
          <ul className="mt-7 space-y-3 text-[#e7e4dc]">
            <li>✓ Monthly profit &amp; margin audit</li>
            <li>✓ Private members area, just for your business</li>
            <li>✓ Secure document uploads — invoices, costs and figures</li>
            <li>✓ Admin review of your documents</li>
            <li>✓ A practical plan based on your numbers</li>
          </ul>
          <a
            href="/login?next=%2Fapi%2Fcheckout"
            className="mt-8 inline-flex rounded-full bg-[#d6b36a] px-8 py-4 font-bold text-[#171717] transition hover:bg-[#e4c989]"
          >
            Get started
          </a>
        </div>
        <p className="mt-6 text-sm text-[#858991]">
          Already a member? <a href="/login?next=%2Fmembers" className="font-semibold text-[#e2c681] hover:underline">Log in</a>
        </p>
        <Link href="/" className="mt-8 inline-block text-sm font-semibold text-[#b3b5bb] transition hover:text-[#e2c681]">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
