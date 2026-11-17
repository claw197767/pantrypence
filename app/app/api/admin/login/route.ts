import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }

  const username = body.username;
  const password = body.password;
  if (
    typeof username !== "string" ||
    username.length === 0 ||
    username.length > 128 ||
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > 1024
  ) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const configuredUsername = process.env.ADMIN_USERNAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!configuredUsername || !adminEmail) {
    return NextResponse.json(
      { error: "Admin sign-in is not configured." },
      { status: 503 },
    );
  }

  if (username !== configuredUsername) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password,
  });

  if (error || !data.user || data.user.app_metadata?.role !== "admin") {
    if (data.user) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        return NextResponse.json(
          { error: "Unable to complete sign-in. Please try again." },
          { status: 500 },
        );
      }
    }
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
