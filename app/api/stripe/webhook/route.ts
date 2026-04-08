import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_TO_PLAN } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const priceId = sub.items.data[0]?.price?.id;
        const plan = PRICE_TO_PLAN[priceId] || "starter";
        const { data: profile } = await getSupabaseAdmin()
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", sub.customer)
          .single();
        if (profile) {
          await getSupabaseAdmin()
            .from("profiles")
            .update({ plan, stripe_subscription_id: sub.id })
            .eq("id", profile.id);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        await getSupabaseAdmin()
          .from("profiles")
          .update({ plan: "free", stripe_subscription_id: null })
          .eq("stripe_customer_id", sub.customer);
        break;
      }
      case "invoice.payment_failed": {
        // Optional: send email notification
        console.log("Payment failed for customer:", (event.data.object as any).customer);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
