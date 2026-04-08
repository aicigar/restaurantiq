"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for single-location operators",
    features: [
      "5 reports per month",
      "1 competitor tracked",
      "Review monitoring (1 location)",
      "Weekly email digest",
      "PDF report exports",
      "Email support",
    ],
    popular: false,
    cta: "Start Starter",
  },
  {
    id: "growth",
    name: "Growth",
    price: "$149",
    period: "/month",
    description: "For growing restaurant businesses",
    features: [
      "25 reports per month",
      "5 competitors tracked",
      "Review monitoring (3 locations)",
      "AI improvement advisor",
      "Revenue projections",
      "Delivery optimizer",
      "PDF report exports",
      "Priority email support",
    ],
    popular: true,
    cta: "Start Growth",
  },
  {
    id: "chain",
    name: "Chain",
    price: "$399",
    period: "/month",
    description: "For multi-location restaurant groups",
    features: [
      "Unlimited reports",
      "20 competitors tracked",
      "All locations monitoring",
      "Expansion planner",
      "Competitor movement alerts",
      "White-label reports",
      "Multi-user (5 seats)",
      "Dedicated account manager",
    ],
    popular: false,
    cta: "Start Chain",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large chains and franchises",
    features: [
      "Everything in Chain",
      "API access",
      "POS integration",
      "Custom reporting",
      "SLA & uptime guarantee",
      "Dedicated account manager",
      "Custom onboarding",
      "Unlimited seats",
    ],
    popular: false,
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === "enterprise") {
      window.location.href = "mailto:sales@restaurantiq.com";
      return;
    }
    setLoading(planId);
    const priceIds: Record<string, string> = {
      starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "",
      growth: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH || "",
      chain: process.env.NEXT_PUBLIC_STRIPE_PRICE_CHAIN || "",
    };
    const priceId = priceIds[planId];
    if (!priceId) {
      router.push(`/signup?plan=${planId}`);
      return;
    }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.url) {
      window.location.href = data.url;
    } else if (res.status === 401) {
      router.push(`/signup?plan=${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-navy">
      {/* Nav */}
      <nav className="border-b border-brd px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center font-black text-white">R</div>
          <span className="text-white font-bold text-lg">RestaurantIQ</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Sign In</Link>
          <Link href="/signup" className="bg-orange text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange/90 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-400 text-lg">Choose the plan that fits your restaurant operation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-navy2 border-2 rounded-2xl p-6 flex flex-col ${
                plan.popular ? "border-orange shadow-lg shadow-orange/10" : "border-brd"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-orange text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-500 text-sm">{plan.period}</span>}
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                  plan.popular
                    ? "bg-orange hover:bg-orange/90 text-white"
                    : "border border-brd text-gray-300 hover:text-white hover:border-gray-500"
                }`}
              >
                {loading === plan.id ? "Loading..." : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-sm mt-8">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
