import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!secretKey || !siteUrl) {
    return NextResponse.json(
      { error: "Payment configuration is incomplete." },
      { status: 500 }
    );
  }

  try {
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: 2900,
            recurring: { interval: "month" },
            product_data: {
              name: "PantryPence Monthly Subscription",
              description: "Monthly PantryPence membership",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?checkout=cancelled`,
    });

 if (!session.url) {
  return NextResponse.json(
    { error: 'Checkout failed.'},
    { status: 500 }
  );
}

return NextResponse.redirect(session.url, 303);
  } catch {
    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}
