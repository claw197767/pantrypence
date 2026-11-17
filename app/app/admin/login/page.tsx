"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Unable to sign in. Please try again.";
        setMessage(errorMessage);
        return;
      }

      router.replace("/admin/files");
    } catch {
      setMessage("Unable to sign in. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111318] px-6 py-16 text-[#f4f1ea]">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1b1e25] p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b36a]">
          PantryPence administration
        </p>
        <h1 className="mt-4 text-3xl font-semibold">Admin sign in</h1>
        <p className="mt-3 leading-7 text-[#b3b5bb]">
          Sign in with your administrator username and password.
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-[#111318] px-4 py-3 text-white outline-none focus:border-[#d6b36a]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-[#111318] px-4 py-3 text-white outline-none focus:border-[#d6b36a]"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full bg-[#d6b36a] px-6 py-3 font-bold text-[#171717] disabled:opacity-60"
          >
            {sending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {message ? (
          <p role="status" className="mt-5 text-sm leading-6 text-[#e2c681]">
            {message}
          </p>
        ) : null}
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-[#b3b5bb] underline decoration-white/20 underline-offset-4 hover:text-white"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
