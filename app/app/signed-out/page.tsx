import { Suspense } from "react";
import Link from "next/link";

export default function SignedOutPage(props: PageProps<"/signed-out">) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7f7ef] px-6 py-16 text-[#183b2b]">
          <p role="status">Loading sign-out status…</p>
        </main>
      }
    >
      <SignedOutContent {...props} />
    </Suspense>
  );
}

async function SignedOutContent({
  searchParams,
}: PageProps<"/signed-out">) {
  const { status } = await searchParams;
  const signOutFailed = status === "error";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7ef] px-6 py-16 text-[#183b2b]">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl sm:p-12">
        <div
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e7ead8] text-3xl text-[#536b37]"
        >
          {signOutFailed ? "!" : "✓"}
        </div>
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-[#8a9b50]">
          PantryPence
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {signOutFailed ? "We couldn’t sign you out" : "You’re signed out"}
        </h1>
        <p className="mx-auto mt-4 max-w-sm leading-7 text-[#647266]">
          {signOutFailed
            ? "Something went wrong ending your session. Please try again."
            : "Your PantryPence session has ended. Thanks for stopping by — your business insights will be here when you return."}
        </p>
        {signOutFailed ? (
          <form action="/api/auth/sign-out" method="post" className="mt-8">
            <button
              type="submit"
              className="inline-flex rounded-full bg-[#183b2b] px-7 py-3 font-bold text-white transition hover:bg-[#102a1e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a9b50]"
            >
              Try signing out again
            </button>
          </form>
        ) : (
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-[#183b2b] px-7 py-3 font-bold text-white transition hover:bg-[#102a1e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a9b50]"
          >
            Back to PantryPence
          </Link>
        )}
      </section>
    </main>
  );
}
