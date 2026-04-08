import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const moduleConfig: Record<string, { icon: string; label: string; color: string }> = {
  location: { icon: "📍", label: "Location", color: "text-orange" },
  reviews: { icon: "⭐", label: "Reviews", color: "text-teal" },
  competitors: { icon: "🔍", label: "Competitors", color: "text-coral" },
};

const PLAN_LIMITS: Record<string, number | string> = {
  free: 0,
  starter: 5,
  growth: 25,
  chain: "∞",
  enterprise: "∞",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: reports }, { data: profile }] = await Promise.all([
    supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("plan, reports_used_this_month")
      .eq("id", user.id)
      .single(),
  ]);

  const used = profile?.reports_used_this_month || 0;
  const limit = PLAN_LIMITS[profile?.plan || "free"];
  const usagePct =
    typeof limit === "number" && limit > 0
      ? Math.min((used / limit) * 100, 100)
      : 0;

  return (
    <div className="min-h-screen bg-navy">
      <div className="border-b border-brd px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center font-black text-white"
          >
            R
          </Link>
          <span className="text-white font-semibold">Report History</span>
        </div>
        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Usage bar */}
        <div className="bg-navy2 border border-brd rounded-2xl p-5 mb-8">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-white font-semibold">{used}</span>
              <span className="text-gray-500"> of </span>
              <span className="text-white font-semibold">{limit}</span>
              <span className="text-gray-500"> reports used this month</span>
            </div>
            <span className="text-xs font-semibold uppercase px-3 py-1 bg-orange/10 text-orange rounded-full">
              {profile?.plan || "free"} plan
            </span>
          </div>
          {typeof limit === "number" && limit > 0 && (
            <div className="h-2 bg-brd rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${usagePct}%`,
                  backgroundColor:
                    usagePct >= 90
                      ? "#FF4D6D"
                      : usagePct >= 70
                      ? "#FFB547"
                      : "#22C55E",
                }}
              />
            </div>
          )}
          {limit === 0 && (
            <Link
              href="/pricing"
              className="inline-block mt-2 text-orange text-sm hover:underline"
            >
              Upgrade to run analyses →
            </Link>
          )}
        </div>

        {/* Reports table */}
        {!reports || reports.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-white text-xl font-semibold mb-2">
              No reports yet
            </h3>
            <p className="text-gray-500 mb-6">
              Run your first analysis to see it here.
            </p>
            <Link
              href="/dashboard"
              className="bg-orange text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange/90 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-navy2 border border-brd rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brd">
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wide px-5 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wide px-5 py-3">
                    Module
                  </th>
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wide px-5 py-3">
                    Title
                  </th>
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wide px-5 py-3">
                    Score
                  </th>
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wide px-5 py-3">
                    Verdict
                  </th>
                  <th className="text-right text-xs text-gray-500 uppercase tracking-wide px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: any) => {
                  const mod = moduleConfig[report.module] || {
                    icon: "📄",
                    label: report.module,
                    color: "text-gray-400",
                  };
                  const date = new Date(report.created_at);
                  const scoreColor =
                    report.score >= 75
                      ? "text-green"
                      : report.score >= 50
                      ? "text-amber"
                      : "text-coral";
                  return (
                    <tr
                      key={report.id}
                      className="border-b border-brd last:border-0 hover:bg-navy3/50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        <div className="text-xs text-gray-600">
                          {date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-medium ${mod.color}`}>
                          {mod.icon} {mod.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-white max-w-[200px] truncate">
                        {report.title}
                      </td>
                      <td className="px-5 py-4">
                        {report.score != null ? (
                          <span className={`text-lg font-bold ${scoreColor}`}>
                            {report.score}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {report.verdict ? (
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              report.verdict === "GO"
                                ? "bg-green/10 text-green"
                                : report.verdict === "NO-GO"
                                ? "bg-coral/10 text-coral"
                                : "bg-amber/10 text-amber"
                            }`}
                          >
                            {report.verdict}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard?reportId=${report.id}`}
                          className="text-xs text-orange hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
