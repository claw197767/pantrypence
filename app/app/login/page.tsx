"use client";

import { Suspense, type FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/safe-next-path";
import { passwordRecoveryRedirect } from "@/lib/password-recovery";

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
  const nextPath = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"link" | "password" | "reset">("link");
  const [message, setMessage] = useState(searchParams.get("error") === "verification" ? "The sign-in link could not be verified. Request a new link and open it in the same browser." : "");
  const [sending, setSending] = useState(false);

  function changeMode(nextMode: "link" | "password" | "reset") {
    setMode(nextMode);
    setPassword("");
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage(error.message);
        else window.location.assign(nextPath);
      } else {
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        if (mode === "reset") {
          const redirectTo = passwordRecoveryRedirect(window.location.origin, nextPath);
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
          setMessage(error ? error.message : "If an account exists for this address, check your email for a password setup link. Open it in this browser.");
        } else {
          callbackUrl.searchParams.set("next", nextPath);
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: callbackUrl.toString(), shouldCreateUser: true },
          });
          setMessage(error ? error.message : "Check your email for a secure sign-in link. Open it in this browser. If you are new, this will create your account.");
        }
      }
    } catch {
      setMessage("Unable to complete your request. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111318] px-6 py-16 text-[#f4f1ea]">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1b1e25] p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">PantryPence membership</p>
        <h1 className="mt-4 text-3xl font-semibold">Sign in or create your account</h1>
        <p className="mt-3 leading-7 text-[#b3b5bb]">{mode === "reset" ? "We’ll email you a link to set or reset your password." : "Sign in before checkout so your payment and private member area are tied to the right account."}</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label htmlFor="email" className="block text-sm font-semibold">Email address</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-white/15 bg-[#111318] px-4 py-3 text-white outline-none focus:border-[#d6b36a]" />
          {mode === "password" ? (
            <>
              <label htmlFor="password" className="block text-sm font-semibold">Password</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-white/15 bg-[#111318] px-4 py-3 text-white outline-none focus:border-[#d6b36a]" />
            </>
          ) : null}
          <button type="submit" disabled={sending} className="w-full rounded-full bg-[#d6b36a] px-6 py-3 font-bold text-[#171717] disabled:opacity-60">{sending ? "Please wait…" : mode === "password" ? "Sign in with password" : mode === "reset" ? "Email me a password link" : "Email me a sign-in link"}</button>
        </form>
        {message ? <p role="status" className="mt-5 text-sm leading-6 text-[#e2c681]">{message}</p> : null}
        <div className="mt-6 flex flex-col items-start gap-3 text-sm text-[#e2c681]">
          {mode !== "password" ? <button type="button" disabled={sending} onClick={() => changeMode("password")} className="underline underline-offset-4">Sign in with email and password</button> : null}
          {mode !== "link" ? <button type="button" disabled={sending} onClick={() => changeMode("link")} className="underline underline-offset-4">Sign in with an email link</button> : null}
          {mode !== "reset" ? <button type="button" disabled={sending} onClick={() => changeMode("reset")} className="underline underline-offset-4">Set or reset your password</button> : null}
        </div>
        <Link href="/" className="mt-6 inline-block text-sm text-[#b3b5bb] underline decoration-white/20 underline-offset-4 hover:text-white">Back to home</Link>
      </section>
    </main>
  );
}
