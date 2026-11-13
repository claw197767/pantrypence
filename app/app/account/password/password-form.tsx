"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/safe-next-path";

export default function PasswordForm({ email }: { email: string }) {
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setMessage("The passwords do not match.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
      } else {
        setPassword("");
        setConfirmation("");
        setSaved(true);
        setMessage("Your password has been saved. You can now sign in with your email and password.");
      }
    } catch {
      setMessage("Unable to save your password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111318] px-6 py-16 text-[#f4f1ea]">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1b1e25] p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">PantryPence account</p>
        <h1 className="mt-4 text-3xl font-semibold">Set your password</h1>
        <p className="mt-3 leading-7 text-[#b3b5bb]">Set a password for {email || "your account"}. Email-link sign-in will still be available.</p>
        {!saved ? (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label htmlFor="new-password" className="block text-sm font-semibold">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-white/15 bg-[#111318] px-4 py-3 text-white outline-none focus:border-[#d6b36a]" />
            <p className="text-sm text-[#b3b5bb]">Use at least 8 characters.</p>
            <label htmlFor="confirm-password" className="block text-sm font-semibold">Confirm password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-xl border border-white/15 bg-[#111318] px-4 py-3 text-white outline-none focus:border-[#d6b36a]" />
            <button type="submit" disabled={saving} className="w-full rounded-full bg-[#d6b36a] px-6 py-3 font-bold text-[#171717] disabled:opacity-60">{saving ? "Saving…" : "Save password"}</button>
          </form>
        ) : null}
        {message ? <p role="status" className="mt-5 text-sm leading-6 text-[#e2c681]">{message}</p> : null}
        <Link href={nextPath} prefetch={false} className="mt-6 inline-block text-sm text-[#b3b5bb] underline decoration-white/20 underline-offset-4 hover:text-white">Continue to your account</Link>
      </section>
    </main>
  );
}
