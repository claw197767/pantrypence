import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = request.nextUrl.searchParams.get("next") ?? "/welcome";
  const safeNextPath = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/welcome";

  if (!code) return NextResponse.redirect(new URL("/login?error=verification", request.url));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=verification", request.url));

  return NextResponse.redirect(new URL(safeNextPath, request.url));
}
