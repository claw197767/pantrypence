import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const safeNextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));
  const failureUrl = new URL("/login", request.url);
  failureUrl.searchParams.set("error", "verification");
  failureUrl.searchParams.set("next", safeNextPath);

  if (!code) return NextResponse.redirect(failureUrl);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(failureUrl);

  return NextResponse.redirect(new URL(safeNextPath, request.url));
}
