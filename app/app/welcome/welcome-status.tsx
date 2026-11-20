"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type State = "checking" | "active" | "pending" | "error" | "inactive";

const content: Record<State, { icon: string; title: string; body: string }> = {
  checking: {
    icon: "…",
    title: "Confirming your membership…",
    body: "We’re securely checking the payment confirmation from Stripe. This usually takes a few seconds.",
  },
  active: {
    icon: "✓",
    title: "Welcome to your membership",
    body: "Your membership is active. Your private member area is ready.",
  },
  pending: {
    icon: "…",
    title: "Payment confirmation is taking longer",
    body: "Your payment may have completed, but confirmation is still processing. Please refresh shortly or contact us if this continues.",
  },
  error: {
    icon: "!",
    title: "We couldn’t verify your membership",
    body: "Please sign in again, then refresh this page. Contact us if you need help.",
  },
  inactive: {
    icon: "→",
    title: "Start your membership",
    body: "Your account is ready. Membership is £49/month and unlocks your private member area and monthly profit review. We’re taking you to our secure Stripe checkout now.",
  },
};

export default function WelcomeStatus({
  email,
  hasSessionId,
}: {
  email: string;
  hasSessionId: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    // A session_id means we just came back from Stripe, so poll while the
    // webhook confirms payment. Otherwise a single check is enough.
    const maxAttempts = hasSessionId ? 12 : 1;

    async function check() {
      const response = await fetch("/api/membership", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!mounted) return;
      if (response.ok && data.active) {
        setState("active");
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) timer = setTimeout(check, 2500);
      else if (!response.ok) setState("error");
      else setState(hasSessionId ? "pending" : "inactive");
    }

    void check();
    return () => { mounted = false; clearTimeout(timer); };
  }, [hasSessionId]);

  // Non-members are forwarded to Stripe checkout to start their membership.
  useEffect(() => {
    if (state !== "inactive") return;
    const timer = setTimeout(() => {
      router.push("/api/checkout");
    }, 2500);
    return () => clearTimeout(timer);
  }, [state, router]);

  const { icon, title, body } = content[state];

  return (
    <main className="flex min-h-screen items-center justify-center shimmer-surface bg-[#0a1f14] px-6 py-16 text-[#f4f1ea]">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#12311f] p-8 text-center shadow-2xl sm:p-12">
        <div aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d6b36a]/15 text-3xl text-[#d6b36a]">{icon}</div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">PantryPence</p>
        <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-[#b3b5bb]">
          {state === "active" && email ? `Your membership is active for ${email}. Your private member area is ready.` : body}
        </p>
        {state === "active" ? (
          <a href="/members" className="mt-8 inline-flex rounded-full bg-[#d6b36a] px-7 py-3 font-bold text-[#171717]">Enter members area</a>
        ) : state === "inactive" ? (
          <a href="/api/checkout" className="mt-8 inline-flex rounded-full bg-[#d6b36a] px-7 py-3 font-bold text-[#171717]">Continue to secure payment</a>
        ) : (
          <a href="/welcome" className="mt-8 inline-flex rounded-full border border-white/20 px-7 py-3 font-bold hover:border-[#d6b36a]">Check again</a>
        )}
      </section>
    </main>
  );
}
