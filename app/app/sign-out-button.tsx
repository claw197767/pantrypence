"use client";

// Signs the user out via POST /api/auth/sign-out, which clears the
// Supabase session and redirects to /signed-out.
export function SignOutButton() {
  return (
    <form action="/api/auth/sign-out" method="post">
      <button
        type="submit"
        className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold transition hover:border-[#d6b36a] hover:text-[#e2c681]"
      >
        Sign out
      </button>
    </form>
  );
}
