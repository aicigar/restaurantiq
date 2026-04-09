import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PLAN_LIMITS: Record<string, number | string> = {
  free: 0, starter: 5, growth: 25, chain: "∞", enterprise: "∞",
};

const PLAN_PRICE: Record<string, string> = {
  free: "$0/mo", starter: "$49/mo", growth: "$149/mo", chain: "$399/mo", enterprise: "Custom",
};

const PLAN_COLOR: Record<string, string> = {
  free: "text-gray-400", starter: "text-orange", growth: "text-teal", chain: "text-purple", enterprise: "text-amber",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: reports }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("reports").select("id, module, score, verdict, created_at, title").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const used  = profile?.reports_used_this_month || 0;
  const limit = PLAN_LIMITS[profile?.plan || "free"];
  const usagePct = typeof limit === "number" && limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const remaining = typeof limit === "number" ? Math.max(limit - used, 0) : "∞";
  const resetDate = profile?.reports_reset_date
    ? new Date(profile.reports_reset_date).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : "—";

  const totalReports   = reports?.length || 0;
  const locationCount  = reports?.filter((r: any) => r.module === "location").length || 0;
  const reviewCount    = reports?.filter((r: any) => r.module === "reviews").length || 0;
  const competitorCount= reports?.filter((r: any) => r.module === "competitors").length || 0;
  const avgScore = reports && reports.length > 0
    ? Math.round(reports.filter((r: any) => r.score != null).reduce((s: number, r: any) => s + r.score, 0) / (reports.filter((r: any) => r.score != null).length || 1))
    : 0;
  const goCount   = reports?.filter((r: any) => r.verdict === "GO").length || 0;
  const noGoCount = reports?.filter((r: any) => r.verdict === "NO-GO").length || 0;

  const handlePortalAction = "/api/stripe/portal";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "—";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #080D1A 0%, #0A1020 100%)" }}>

      {/* Header */}
      <div className="border-b border-brd/60 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(15,22,38,0.9)" }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard"
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg"
            style={{ background: "linear-gradient(135deg,#FF6B35,#FFB547)" }}>
            R
          </Link>
          <div>
            <div className="text-white font-bold">My Account</div>
            <div className="text-gray-500 text-xs">{user.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Back to Dashboard
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit"
              className="text-sm px-4 py-1.5 rounded-lg border border-brd/60 text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Plan & Usage ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Plan card */}
          <div className="md:col-span-1 rounded-2xl p-6"
            style={{ background: "linear-gradient(145deg,rgba(255,107,53,0.1),#0F1626)", border: "1px solid rgba(255,107,53,0.25)" }}>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Current Plan</div>
            <div className={`text-3xl font-black capitalize mb-1 ${PLAN_COLOR[profile?.plan || "free"]}`}>
              {profile?.plan || "Free"}
            </div>
            <div className="text-gray-400 text-sm mb-4">{PLAN_PRICE[profile?.plan || "free"]}</div>
            {profile?.plan === "free" || !profile?.plan ? (
              <Link href="/pricing"
                className="block w-full text-center text-white font-bold py-2.5 rounded-xl text-sm"
                style={{ background: "linear-gradient(135deg,#FF6B35,#FFB547)" }}>
                Upgrade Plan
              </Link>
            ) : (
              <form action={handlePortalAction} method="POST">
                <button type="submit"
                  className="w-full text-white font-semibold py-2.5 rounded-xl text-sm border border-brd/60 hover:border-orange/40 transition-colors">
                  Manage Billing
                </button>
              </form>
            )}
            <div className="text-gray-600 text-xs mt-3">Member since {memberSince}</div>
          </div>

          {/* Usage card */}
          <div className="md:col-span-2 rounded-2xl p-6"
            style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Report Usage — This Month</div>

            <div className="flex items-end gap-3 mb-3">
              <span className="text-5xl font-black" style={{ color: usagePct >= 90 ? "#FF4D6D" : usagePct >= 70 ? "#FFB547" : "#22C55E" }}>
                {used}
              </span>
              <span className="text-gray-500 text-lg mb-2">/ {limit} used</span>
              <span className="ml-auto text-right">
                <span className="text-2xl font-bold text-white">{remaining}</span>
                <div className="text-gray-500 text-xs">remaining</div>
              </span>
            </div>

            {typeof limit === "number" && limit > 0 ? (
              <>
                <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "rgba(30,45,74,0.8)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${usagePct}%`,
                      background: usagePct >= 90
                        ? "linear-gradient(90deg,#FF4D6D,#FF6B35)"
                        : usagePct >= 70
                        ? "linear-gradient(90deg,#FF8C42,#FFB547)"
                        : "linear-gradient(90deg,#22C55E,#00C9A7)"
                    }} />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{Math.round(usagePct)}% used</span>
                  <span>Resets {resetDate}</span>
                </div>
              </>
            ) : limit === 0 ? (
              <div className="text-sm text-gray-500">
                <Link href="/pricing" className="text-orange hover:underline">Upgrade</Link> to run analyses
              </div>
            ) : (
              <div className="text-sm text-green font-medium">Unlimited reports ✓</div>
            )}

            {/* Module breakdown */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: "Location", count: locationCount, color: "#FF6B35", icon: "📍" },
                { label: "Reviews",  count: reviewCount,   color: "#00C9A7", icon: "⭐" },
                { label: "Competitors", count: competitorCount, color: "#FF4D6D", icon: "🔍" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(22,32,56,0.6)", border: "1px solid rgba(30,45,74,0.8)" }}>
                  <div className="text-lg mb-0.5">{m.icon}</div>
                  <div className="text-xl font-bold text-white">{m.count}</div>
                  <div className="text-xs text-gray-500">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Lifetime Stats ── */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Lifetime Statistics</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Reports", value: totalReports, color: "#FF6B35", icon: "📊" },
              { label: "Avg Score",     value: avgScore || "—", color: "#00C9A7", icon: "🎯" },
              { label: "GO Verdicts",   value: goCount,   color: "#22C55E", icon: "✅" },
              { label: "NO-GO Verdicts",value: noGoCount, color: "#FF4D6D", icon: "❌" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-5"
                style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-gray-500 text-xs uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Reports ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Recent Reports</div>
            <Link href="/dashboard/history" className="text-xs text-orange hover:underline">View all →</Link>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
            {!reports || reports.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No reports yet — run your first analysis</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D4A" }}>
                    {["Date", "Module", "Title", "Score", "Verdict"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-600 uppercase tracking-wide px-5 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(reports || []).slice(0, 8).map((r: any) => {
                    const modConfig: Record<string, any> = {
                      location:    { icon: "📍", color: "#FF6B35" },
                      reviews:     { icon: "⭐", color: "#00C9A7" },
                      competitors: { icon: "🔍", color: "#FF4D6D" },
                    };
                    const mc = modConfig[r.module] || { icon: "📄", color: "#8B9BB4" };
                    const sc = r.score >= 75 ? "#22C55E" : r.score >= 50 ? "#FFB547" : "#FF4D6D";
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors"
                        style={{ borderBottom: "1px solid rgba(30,45,74,0.5)" }}>
                        <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm font-semibold" style={{ color: mc.color }}>{mc.icon} {r.module}</span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-200 max-w-[180px] truncate">{r.title}</td>
                        <td className="px-5 py-3">
                          {r.score != null
                            ? <span className="text-base font-bold" style={{ color: sc }}>{r.score}</span>
                            : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-5 py-3">
                          {r.verdict ? (
                            <span className="text-xs font-bold px-2 py-1 rounded-full"
                              style={{
                                color: r.verdict === "GO" ? "#22C55E" : r.verdict === "NO-GO" ? "#FF4D6D" : "#FFB547",
                                background: r.verdict === "GO" ? "rgba(34,197,94,0.1)" : r.verdict === "NO-GO" ? "rgba(255,77,109,0.1)" : "rgba(255,181,71,0.1)",
                              }}>
                              {r.verdict}
                            </span>
                          ) : <span className="text-gray-600 text-xs">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Account Info ── */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Account Details</div>
          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
            {[
              { label: "Email",         value: user.email || "—" },
              { label: "Account ID",    value: user.id.slice(0, 16) + "..." },
              { label: "Member Since",  value: memberSince },
              { label: "Plan",          value: `${profile?.plan || "Free"} — ${PLAN_PRICE[profile?.plan || "free"]}` },
              { label: "Stripe Customer", value: profile?.stripe_customer_id ? profile.stripe_customer_id.slice(0, 18) + "..." : "Not connected" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2"
                style={{ borderBottom: "1px solid rgba(30,45,74,0.6)" }}>
                <span className="text-gray-500 text-sm">{row.label}</span>
                <span className="text-gray-200 text-sm font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Upgrade CTA if on low plan ── */}
        {(profile?.plan === "free" || profile?.plan === "starter") && (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: "linear-gradient(145deg,rgba(255,107,53,0.1),rgba(255,181,71,0.05))", border: "1px solid rgba(255,107,53,0.2)" }}>
            <div className="text-2xl font-bold text-white mb-2">Need more reports?</div>
            <p className="text-gray-400 text-sm mb-5">
              {profile?.plan === "free"
                ? "Upgrade to Starter and get 5 reports/month with full AI analysis."
                : "Upgrade to Growth for 25 reports/month — perfect for multi-location operators."}
            </p>
            <Link href="/pricing"
              className="inline-block text-white font-bold px-8 py-3 rounded-xl"
              style={{ background: "linear-gradient(135deg,#FF6B35,#FFB547)", boxShadow: "0 4px 20px rgba(255,107,53,0.35)" }}>
              View Pricing Plans
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
