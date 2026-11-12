"use client";

import { Suspense, type FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#111318] px-6 py-16 text-[#f4f1ea]">
          <p role="status" className="text-sm text-[#b3b5bb]">Loading secure sign-in…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next") ?? "/welcome";
  const nextPath = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/welcome";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", nextPath);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl.toString(), shouldCreateUser: true },
      });
      setMessage(error ? error.message : "Check your email for a secure sign-in link. If you are new, this will create your account.");
    } catch {
      setMessage("Unable to send a sign-in link. Please check the Supabase auth configuration and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111318] px-6 py-16 text-[#f4f1ea]">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1b1e25] p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">PantryPence membership</p>
        <h1 className="mt-4 text-3xl font-semibold">Sign in or create your account</h1>
        <p className="mt-3 leading-7 text-[#b3b5bb]">We’ll email you a secure link. Sign in before checkout so your payment and private member area are tied to the right account.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label htmlFor="email" className="block text-sm font-semibold">Email address</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-white/15 bg-[#111318] px-4 py-3 text-white outline-none focus:border-[#d6b36a]" />
          <button type="submit" disabled={sending} className="w-full rounded-full bg-[#d6b36a] px-6 py-3 font-bold text-[#171717] disabled:opacity-60">{sending ? "Sending link…" : "Email me a sign-in link"}</button>
        </form>
        {message ? <p role="status" className="mt-5 text-sm leading-6 text-[#e2c681]">{message}</p> : null}
        <a href="/" className="mt-6 inline-block text-sm text-[#b3b5bb] underline decoration-white/20 underline-offset-4 hover:text-white">Back to home</a>
      </section>
    </main>
  );
}
