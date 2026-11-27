import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const authError = request.nextUrl.searchParams.get("error");
  const authErrorCode = request.nextUrl.searchParams.get("error_code");
  const nextPath = request.nextUrl.searchParams.get("next") ?? "/welcome";
  const safeNextPath = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/welcome";

  const supabase = await createSupabaseServerClient();

  // Already signed in (e.g. this one-time link was already used, then presented again by a double-tap or a link scanner): send them on instead of showing a verification error.
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return NextResponse.redirect(new URL(safeNextPath, request.url));

  if (authError) {
    const reason = encodeURIComponent(authErrorCode ?? authError);
    return NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));
  }

  if (!code) return NextResponse.redirect(new URL("/login?error=verification", request.url));

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // The exchange can fail because the link was already used — re-check for a session before showing the error.
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    if (freshSession) return NextResponse.redirect(new URL(safeNextPath, request.url));
    return NextResponse.redirect(new URL("/login?error=verification", request.url));
  }

  return NextResponse.redirect(new URL(safeNextPath, request.url));
}
