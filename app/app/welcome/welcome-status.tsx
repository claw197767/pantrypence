"use client";

import { useEffect, useState } from "react";

export default function WelcomeStatus({ email, awaitingPayment }: { email: string; awaitingPayment: boolean }) {
  const [state, setState] = useState<"checking" | "active" | "inactive" | "pending" | "error">("checking");

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    async function check() {
      try {
        const response = await fetch("/api/membership", { cache: "no-store" });
        const data = await response.json();
        if (!mounted) return;
        if (!response.ok || typeof data.active !== "boolean") {
          setState("error");
          return;
        }
        if (data.active) {
          setState("active");
          return;
        }
        if (!awaitingPayment) {
          setState("inactive");
          return;
        }
        attempts += 1;
        if (attempts < 12) timer = setTimeout(check, 2500);
        else setState("pending");
      } catch {
        if (mounted) setState("error");
      }
    }

    void check();
    return () => { mounted = false; clearTimeout(timer); };
  }, [awaitingPayment]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111318] px-6 py-16 text-[#f4f1ea]">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#1b1e25] p-8 text-center shadow-2xl sm:p-12">
        <div aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d6b36a]/15 text-3xl text-[#d6b36a]">{state === "active" ? "✓" : "…"}</div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">PantryPence</p>
        <h1 className="mt-3 text-3xl font-semibold">{state === "active" ? "Welcome to your membership" : state === "inactive" ? "Membership required" : state === "pending" ? "Payment confirmation is taking longer" : state === "error" ? "We couldn’t verify your membership" : "Confirming your membership…"}</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-[#b3b5bb]">
          {state === "active" ? `Your membership is active${email ? ` for ${email}` : ""}. Your private member area is ready.` : state === "inactive" ? "You’re signed in, but this account does not have an active membership. Start checkout to access the members area." : state === "pending" ? "Your payment may have completed, but confirmation is still processing. Please refresh shortly or contact us if this continues." : state === "error" ? "Please sign in again, then refresh this page. Contact us if you need help." : "We’re securely checking your membership. This usually takes a few seconds."}
        </p>
        {state === "active" ? <a href="/members" className="mt-8 inline-flex rounded-full bg-[#d6b36a] px-7 py-3 font-bold text-[#171717]">Enter members area</a> : state === "inactive" ? <form action="/api/checkout" method="post"><button type="submit" className="mt-8 inline-flex rounded-full bg-[#d6b36a] px-7 py-3 font-bold text-[#171717]">Start membership</button></form> : <button type="button" onClick={() => window.location.reload()} className="mt-8 inline-flex rounded-full border border-white/20 px-7 py-3 font-bold hover:border-[#d6b36a]">Check again</button>}
      </section>
    </main>
  );
}
