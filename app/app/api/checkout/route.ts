import Stripe from "stripe";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function siteUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
}

async function startCheckout(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  const baseUrl = siteUrl(request);

  if (error || !user) {
    return NextResponse.redirect(new URL("/login?next=%2Fapi%2Fcheckout", baseUrl), 303);
  }

  const { data: membership } = await supabase
    .from("user_subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    membership &&
    ["active", "trialing"].includes(membership.status) &&
    (!membership.current_period_end || new Date(membership.current_period_end) > new Date())
  ) {
    return NextResponse.redirect(new URL("/members", baseUrl), 303);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Payment configuration is incomplete." }, { status: 500 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: 4900,
            recurring: { interval: "month" },
            product_data: {
              name: "PantryPence Monthly Membership",
              description: "Private member area and monthly profit and margin review",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
      success_url: `${baseUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout could not be started." }, { status: 500 });
    }
    return NextResponse.redirect(session.url, 303);
  } catch {
    return NextResponse.json({ error: "Unable to create checkout session." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return startCheckout(request);
}

export async function POST(request: NextRequest) {
  return startCheckout(request);
}
