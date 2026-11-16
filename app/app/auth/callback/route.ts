import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EmailOtpType = "email" | "invite" | "magiclink" | "signup";

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value === "email" || value === "invite" || value === "magiclink" || value === "signup";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  let requestedNext = request.nextUrl.searchParams.get("next");
  const redirectTo = request.nextUrl.searchParams.get("redirect_to");
  if (!requestedNext && redirectTo) {
    try {
      const redirectUrl = new URL(redirectTo, request.url);
      if (redirectUrl.origin === request.nextUrl.origin) {
        requestedNext = redirectUrl.searchParams.get("next");
      }
    } catch {
      requestedNext = null;
    }
  }
  const safeNextPath = getSafeNextPath(requestedNext);
  const failureUrl = new URL("/login", request.url);
  failureUrl.searchParams.set("error", "verification");
  failureUrl.searchParams.set("next", safeNextPath);

  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const otpType = request.nextUrl.searchParams.get("type");
  const supabase = await createSupabaseServerClient();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(failureUrl);
  } else {
    if (!tokenHash || !isEmailOtpType(otpType)) {
      return NextResponse.redirect(failureUrl);
    }

    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType });
    if (error) return NextResponse.redirect(failureUrl);
  }

  return NextResponse.redirect(new URL(safeNextPath, request.url));
}
