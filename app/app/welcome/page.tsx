import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7ef] px-6 py-16 text-[#183b2b]">
      <section className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl sm:p-12">
        <div
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e7ead8] text-3xl text-[#536b37]"
        >
          ✓
        </div>
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-[#8a9b50]">
          PantryPence
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Welcome aboard!
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-[#647266]">
          Your email address is verified and your PantryPence account is ready.
          We’re looking forward to helping you make every penny count.
        </p>

        <div className="mt-8 rounded-2xl bg-[#f7f7ef] p-6 text-left">
          <h2 className="font-bold">What happens next?</h2>
          <p className="mt-2 leading-7 text-[#647266]">
            When you’re ready, get in touch to arrange your first monthly review
            of supplier costs, menu margins and waste.
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex justify-center rounded-full bg-[#183b2b] px-7 py-3 font-bold text-white transition hover:bg-[#102a1e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a9b50]"
          >
            Explore PantryPence
          </Link>
          <a
            href="mailto:hello@pantrypence.co.uk"
            className="inline-flex justify-center rounded-full border border-[#183b2b] px-7 py-3 font-bold transition hover:bg-[#f7f7ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a9b50]"
          >
            Get in touch
          </a>
        </div>
      </section>
    </main>
  );
}
