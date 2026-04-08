import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_placeholder", {
  apiVersion: "2024-06-20",
});

export const PLAN_LIMITS: Record<string, number> = {
  free: 0,
  starter: 5,
  growth: 25,
  chain: Infinity,
  enterprise: Infinity,
};

export const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER || ""]: "starter",
  [process.env.STRIPE_PRICE_GROWTH || ""]: "growth",
  [process.env.STRIPE_PRICE_CHAIN || ""]: "chain",
};
