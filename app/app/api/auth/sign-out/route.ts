import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.redirect(
      new URL("/signed-out?status=error", request.url),
      303,
    );
  }

  return NextResponse.redirect(new URL("/signed-out", request.url), 303);
}
