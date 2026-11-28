import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresh the Supabase session on every request and write any rotated
// cookies back to the browser.
//
// Server Components can read cookies but cannot write them, so without this
// step an expired access token is refreshed in-memory for the page render but
// the browser keeps the stale token — and the next API call (for example
// /api/membership) then fails its auth check. Running the refresh here, where
// the response cookies CAN be set, keeps the browser session and every
// downstream auth check in sync.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // If Supabase is not configured, never block the request.
  if (!supabaseUrl || !supabasePublishableKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Validates the user against the Auth server and triggers a token refresh
  // when needed; any new cookies are written out via setAll above. Do not add
  // logic between creating the client and this call.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico and common image/icon files in /public
     * API routes are intentionally included so the session is refreshed
     * before their auth checks run.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
