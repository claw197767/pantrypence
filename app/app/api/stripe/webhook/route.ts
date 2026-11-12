import Stripe from "stripe";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase webhook configuration is missing.");
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function asId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

async function storeSubscription(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  userIdHint?: string | null,
) {
  const userId = userIdHint ?? subscription.metadata?.supabase_user_id;
  if (!userId) throw new Error("Subscription is missing its PantryPence user ID.");

  // With the Stripe API version used by this project, billing periods are exposed
  // on subscription items rather than on the subscription object itself.
  const periodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((timestamp): timestamp is number => typeof timestamp === "number");
  const currentPeriodEnd = periodEnds.length
    ? new Date(Math.max(...periodEnds) * 1000).toISOString()
    : null;

  const supabase = getAdminSupabase();
  const { error } = await supabase.from("user_subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: asId(subscription.customer),
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Webhook configuration is missing." }, { status: 500 });
  }

  const stripe = new Stripe(secretKey);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = asId(session.subscription as string | { id: string } | null);
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await storeSubscription(stripe, subscription, session.metadata?.supabase_user_id ?? session.client_reference_id);
      }
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await storeSubscription(stripe, event.data.object as Stripe.Subscription);
    }
  } catch {
    // Return a failure so Stripe retries transient DB/API errors.
    return NextResponse.json({ error: "Could not record subscription." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
