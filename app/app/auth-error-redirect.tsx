"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Supabase falls back to the Site URL (root) when an email link fails
// verification, appending error params to the query string and/or fragment.
// Forward those to the login page so the user sees a helpful message.
export function AuthErrorRedirect() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let error = params.get("error");
    let errorCode = params.get("error_code");

    if (!error && window.location.hash.includes("error=")) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      error = hashParams.get("error");
      errorCode = hashParams.get("error_code");
    }

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(errorCode ?? error)}`);
    }
  }, [router]);

  return null;
}
