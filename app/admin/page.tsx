import { redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// ── helpers ──────────────────────────────────────────────────────────────────
const PLAN_COLOR: Record<string, string> = {
  free: "#8B9BB4", starter: "#FF6B35", growth: "#00C9A7", chain: "#A78BFA", enterprise: "#F59E0B",
};
const PLAN_PRICE: Record<string, number> = {
  free: 0, starter: 49, growth: 149, chain: 399, enterprise: 0,
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── page ─────────────────────────────────────────────────────────────────────
export default async function AdminPage() {
  // Auth gate — only allow the owner email
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect("/login");

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
  if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL) redirect("/dashboard");

  // Admin data via service-role client
  const admin = createAdminClient();

  const [
    { data: profiles },
    { data: reports },
    { data: authUsersRaw },
  ] = await Promise.all([
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("reports").select("id, user_id, module, score, verdict, created_at").order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const authUsers = authUsersRaw?.users || [];

  // ── aggregate stats ───────────────────────────────────────────────────────
  const totalUsers     = profiles?.length || 0;
  const totalReports   = reports?.length || 0;
  const paidUsers      = profiles?.filter((p: any) => p.plan && p.plan !== "free").length || 0;
  const freeUsers      = totalUsers - paidUsers;

  const planBreakdown: Record<string, number> = {};
  profiles?.forEach((p: any) => {
    const plan = p.plan || "free";
    planBreakdown[plan] = (planBreakdown[plan] || 0) + 1;
  });

  const mrr = Object.entries(planBreakdown).reduce((sum, [plan, count]) => {
    return sum + (PLAN_PRICE[plan] || 0) * count;
  }, 0);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const newThisMonth = authUsers.filter((u: any) =>
    u.created_at && new Date(u.created_at) >= thisMonthStart
  ).length;

  const reportsThisMonth = reports?.filter((r: any) =>
    r.created_at && new Date(r.created_at) >= thisMonthStart
  ).length || 0;

  const reportsLastMonth = reports?.filter((r: any) => {
    const d = r.created_at ? new Date(r.created_at) : null;
    return d && d >= lastMonthStart && d < thisMonthStart;
  }).length || 0;

  // Module breakdown
  const moduleCount: Record<string, number> = { location: 0, reviews: 0, competitors: 0 };
  reports?.forEach((r: any) => { if (r.module in moduleCount) moduleCount[r.module]++; });

  // Avg score
  const scoredReports = reports?.filter((r: any) => r.score != null) || [];
  const avgScore = scoredReports.length > 0
    ? Math.round(scoredReports.reduce((s: number, r: any) => s + r.score, 0) / scoredReports.length)
    : 0;

  const goCount   = reports?.filter((r: any) => r.verdict === "GO").length || 0;
  const noGoCount = reports?.filter((r: any) => r.verdict === "NO-GO").length || 0;

  // Build user rows (join profiles + auth users)
  const authMap: Record<string, any> = {};
  authUsers.forEach((u: any) => { authMap[u.id] = u; });

  const userRows = (profiles || []).map((p: any) => {
    const au = authMap[p.id];
    const userReports = reports?.filter((r: any) => r.user_id === p.id) || [];
    return {
      id: p.id,
      email: au?.email || "—",
      plan: p.plan || "free",
      reportsUsed: p.reports_used_this_month || 0,
      totalReports: userReports.length,
      stripeCustomer: p.stripe_customer_id || null,
      createdAt: p.created_at || au?.created_at || null,
      lastSignIn: au?.last_sign_in_at || null,
    };
  });

  // Recent reports (last 20)
  const recentReports = (reports || []).slice(0, 20);
  const profileMap: Record<string, string> = {};
  authUsers.forEach((u: any) => { profileMap[u.id] = u.email || u.id.slice(0, 8) + "..."; });

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #080D1A 0%, #0A1020 100%)" }}>

      {/* Header */}
      <div className="border-b border-brd/60 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(15,22,38,0.95)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg"
            style={{ background: "linear-gradient(135deg,#FF6B35,#FFB547)" }}>
            R
          </div>
          <div>
            <div className="text-white font-bold">Admin Dashboard</div>
            <div className="text-gray-500 text-xs">RestaurantIQ Business Intelligence</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full font-bold"
            style={{ background: "rgba(255,107,53,0.15)", color: "#FF6B35", border: "1px solid rgba(255,107,53,0.3)" }}>
            ADMIN
          </span>
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users",     value: totalUsers,        sub: `${newThisMonth} new this month`,    color: "#FF6B35", icon: "👥" },
            { label: "Monthly Revenue", value: `$${mrr.toLocaleString()}`, sub: `${paidUsers} paid · ${freeUsers} free`, color: "#00C9A7", icon: "💰" },
            { label: "Total Reports",   value: totalReports,      sub: `${reportsThisMonth} this month`,    color: "#A78BFA", icon: "📊" },
            { label: "Avg Score",       value: avgScore || "—",   sub: `${goCount} GO · ${noGoCount} NO-GO`, color: "#FFB547", icon: "🎯" },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl p-5"
              style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
              <div className="text-2xl mb-2">{k.icon}</div>
              <div className="text-3xl font-black mb-1" style={{ color: k.color }}>{k.value}</div>
              <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">{k.label}</div>
              <div className="text-gray-600 text-xs">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Plan & Module Breakdown ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Plan distribution */}
          <div className="rounded-2xl p-6"
            style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">Subscription Breakdown</div>
            <div className="space-y-3">
              {["chain", "growth", "starter", "free"].map((plan) => {
                const count = planBreakdown[plan] || 0;
                const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                const revenue = (PLAN_PRICE[plan] || 0) * count;
                return (
                  <div key={plan}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold capitalize" style={{ color: PLAN_COLOR[plan] }}>{plan}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{count} users</span>
                        {revenue > 0 && <span className="text-xs font-bold text-white">${revenue.toLocaleString()}/mo</span>}
                        <span className="text-xs text-gray-600">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(30,45,74,0.8)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PLAN_COLOR[plan] }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-brd/40 flex justify-between">
              <span className="text-gray-500 text-sm">Estimated MRR</span>
              <span className="text-2xl font-black" style={{ color: "#00C9A7" }}>${mrr.toLocaleString()}</span>
            </div>
          </div>

          {/* Module & report stats */}
          <div className="rounded-2xl p-6"
            style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">Report Activity</div>

            {/* This vs last month */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "This Month", value: reportsThisMonth, color: "#FF6B35" },
                { label: "Last Month", value: reportsLastMonth, color: "#8B9BB4" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-4 text-center"
                  style={{ background: "rgba(22,32,56,0.6)", border: "1px solid rgba(30,45,74,0.8)" }}>
                  <div className="text-2xl font-black mb-1" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs text-gray-500">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Module breakdown */}
            <div className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">By Module</div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Location",    count: moduleCount.location,    color: "#FF6B35", icon: "📍" },
                { label: "Reviews",     count: moduleCount.reviews,     color: "#00C9A7", icon: "⭐" },
                { label: "Competitors", count: moduleCount.competitors, color: "#FF4D6D", icon: "🔍" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(22,32,56,0.6)", border: "1px solid rgba(30,45,74,0.8)" }}>
                  <div className="text-lg mb-0.5">{m.icon}</div>
                  <div className="text-xl font-bold text-white">{m.count}</div>
                  <div className="text-xs text-gray-500">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Verdict split */}
            <div className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Verdict Split</div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#22C55E" }} />
                <span className="text-sm text-gray-300">{goCount} GO</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#FF4D6D" }} />
                <span className="text-sm text-gray-300">{noGoCount} NO-GO</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#FFB547" }} />
                <span className="text-sm text-gray-300">{totalReports - goCount - noGoCount} Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── User Table ── */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">All Users ({totalUsers})</div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D4A" }}>
                    {["Email", "Plan", "This Month", "All Time", "Stripe", "Joined", "Last Active"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-600 uppercase tracking-wide px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {userRows.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: "1px solid rgba(30,45,74,0.5)" }}>
                      <td className="px-5 py-3 text-sm text-gray-200 max-w-[200px] truncate">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-bold px-2 py-1 rounded-full capitalize"
                          style={{ color: PLAN_COLOR[u.plan], background: `${PLAN_COLOR[u.plan]}18`, border: `1px solid ${PLAN_COLOR[u.plan]}44` }}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-white">{u.reportsUsed}</td>
                      <td className="px-5 py-3 text-sm text-gray-300">{u.totalReports}</td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {u.stripeCustomer
                          ? <span className="text-teal">{u.stripeCustomer.slice(0, 14)}…</span>
                          : <span className="text-gray-700">—</span>}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(u.lastSignIn)}</td>
                    </tr>
                  ))}
                  {userRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-600 text-sm">No users yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Recent Reports ── */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Recent Reports (last 20)</div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D4A" }}>
                    {["Date", "User", "Module", "Score", "Verdict"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-600 uppercase tracking-wide px-5 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((r: any) => {
                    const modConfig: Record<string, any> = {
                      location:    { icon: "📍", color: "#FF6B35" },
                      reviews:     { icon: "⭐", color: "#00C9A7" },
                      competitors: { icon: "🔍", color: "#FF4D6D" },
                    };
                    const mc = modConfig[r.module] || { icon: "📄", color: "#8B9BB4" };
                    const sc = r.score >= 75 ? "#22C55E" : r.score >= 50 ? "#FFB547" : "#FF4D6D";
                    const userEmail = profileMap[r.user_id] || r.user_id?.slice(0, 10) + "…";
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors"
                        style={{ borderBottom: "1px solid rgba(30,45,74,0.5)" }}>
                        <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                        <td className="px-5 py-3 text-xs text-gray-300 max-w-[160px] truncate">{userEmail}</td>
                        <td className="px-5 py-3">
                          <span className="text-sm font-semibold" style={{ color: mc.color }}>{mc.icon} {r.module}</span>
                        </td>
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
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Quick Actions</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="https://dashboard.stripe.com/customers" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(145deg,rgba(99,91,255,0.1),#0F1626)", border: "1px solid rgba(99,91,255,0.25)" }}>
              <span className="text-3xl">💳</span>
              <div>
                <div className="text-white font-bold text-sm">Stripe Customers</div>
                <div className="text-gray-500 text-xs">Manage billing & subscriptions</div>
              </div>
            </a>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(145deg,rgba(0,201,167,0.08),#0F1626)", border: "1px solid rgba(0,201,167,0.2)" }}>
              <span className="text-3xl">🗄️</span>
              <div>
                <div className="text-white font-bold text-sm">Supabase Dashboard</div>
                <div className="text-gray-500 text-xs">Database, auth & logs</div>
              </div>
            </a>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(145deg,rgba(255,107,53,0.08),#0F1626)", border: "1px solid rgba(255,107,53,0.2)" }}>
              <span className="text-3xl">🚀</span>
              <div>
                <div className="text-white font-bold text-sm">Vercel Deployments</div>
                <div className="text-gray-500 text-xs">Deployment logs & settings</div>
              </div>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
