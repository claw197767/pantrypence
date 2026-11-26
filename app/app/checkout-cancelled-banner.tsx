"use client";

import { useEffect, useState } from "react";

// Stripe sends cancelled checkouts back to the homepage with
// ?checkout=cancelled. Show a short banner so the visitor knows
// nothing was charged, instead of landing silently on the homepage.
export function CheckoutCancelledBanner() {
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "cancelled") {
      // Client-only after mount: reading the query string during render
      // would differ between server and client and cause a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCancelled(true);
    }
  }, []);

  if (!cancelled) return null;

  return (
    <div role="status" className="border-b border-[#d6b36a]/30 bg-[#d6b36a]/10 px-6 py-4 text-center text-sm font-semibold text-[#e2c681]">
      Checkout was cancelled — nothing was charged.
    </div>
  );
}
