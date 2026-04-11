"use client";
import { useState } from "react";
import ScoreRing from "@/components/ScoreRing";
import ExportToolbar from "@/components/ExportToolbar";

const INPUT = "input-field w-full px-3 py-2.5 text-sm";
const LABEL = "block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold";

const CATEGORY_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  reviews:     { color: "#00C9A7", bg: "rgba(0,201,167,0.1)",   border: "rgba(0,201,167,0.25)" },
  operations:  { color: "#FFB547", bg: "rgba(255,181,71,0.1)",  border: "rgba(255,181,71,0.25)" },
  delivery:    { color: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)" },
  competitive: { color: "#FF4D6D", bg: "rgba(255,77,109,0.1)",  border: "rgba(255,77,109,0.25)" },
  marketing:   { color: "#3B82F6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)" },
};

const RANK_COLOR = (rank: number) =>
  rank === 1 ? "linear-gradient(135deg,#FF4D6D,#FF6B35)"
  : rank === 2 ? "linear-gradient(135deg,#FFB547,#FF8C42)"
  : "linear-gradient(135deg,#00C9A7,#00A8E0)";

const EFFORT_COLOR: Record<string, string> = {
  easy: "#22C55E", moderate: "#FFB547", hard: "#FF4D6D",
};

export default function AdvisorModule() {
  const [restaurantName, setRestaurantName] = useState("");
  const [city, setCity] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [zipCodes, setZipCodes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [expandedRanks, setExpandedRanks] = useState<Set<number>>(new Set());
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleRun = async () => {
    if (!restaurantName.trim() || !city.trim()) return;
    setLoading(true); setStatus("loading"); setError(null); setResult(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 95000); // 95s client timeout

    try {
      const res = await fetch("/api/analyse/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_name: restaurantName,
          city,
          competitor_name: competitor || undefined,
          zip_codes: zipCodes || undefined,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data); setStatus("error"); }
      else { setResult(data); setStatus("done"); }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setLoading(false);
      if (err.name === "AbortError") {
        setError({ error: "Analysis timed out after 90 seconds. Try again — results vary by restaurant name recognition.", code: "TIMEOUT" });
      } else {
        setError({ error: err.message || "Network error", code: "API_ERROR" });
      }
      setStatus("error");
    }
  };

  const toggleExpand = (rank: number) => {
    setExpandedRanks((prev) => {
      const next = new Set(prev);
      if (next.has(rank)) { next.delete(rank); } else { next.add(rank); }
      return next;
    });
  };

  const copyResponse = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex h-full">
      {/* ── Input Panel ── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-brd/60"
        style={{ background: "linear-gradient(180deg, #0F1626 0%, #0A1020 100%)" }}>

        <div className="p-5 border-b border-brd/60"
          style={{ background: "linear-gradient(135deg, rgba(255,181,71,0.1), rgba(255,107,53,0.05))" }}>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 px-2.5 py-1 rounded-full"
            style={{ background: "linear-gradient(135deg, #FFB547, #FF6B35)", color: "white" }}>
            🧠 Module 4
          </div>
          <h2 className="text-white text-xl font-bold">AI Improvement Advisor</h2>
          <p className="text-gray-500 text-xs mt-1">Ranked actions with revenue impact</p>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">
          <div>
            <label className={LABEL}>Restaurant Name</label>
            <input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="e.g. Asad's Hot Chicken" className={INPUT} />
          </div>

          <div>
            <label className={LABEL}>City / Location</label>
            <input value={city} onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Philadelphia, PA" className={INPUT} />
          </div>

          <div>
            <label className={LABEL}>Main Competitor <span className="text-gray-600 normal-case">(optional)</span></label>
            <input value={competitor} onChange={(e) => setCompetitor(e.target.value)}
              placeholder="e.g. Dave's Hot Chicken" className={INPUT} />
          </div>

          <div>
            <label className={LABEL}>Nearby Zip Codes <span className="text-gray-600 normal-case">(optional)</span></label>
            <input value={zipCodes} onChange={(e) => setZipCodes(e.target.value)}
              placeholder="e.g. 08837, 08820" className={INPUT} />
            <div className="text-[10px] text-gray-600 mt-1">For delivery gap detection</div>
          </div>

          <button onClick={handleRun} disabled={loading || !restaurantName.trim() || !city.trim()}
            className="btn-orange w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing...</>
              : "▶  Run AI Advisor"}
          </button>

          <div className="rounded-xl p-3.5 text-xs" style={{ background: "rgba(255,181,71,0.06)", border: "1px solid rgba(255,181,71,0.15)" }}>
            <div className="font-semibold text-gray-300 mb-2">AI analyses:</div>
            <ul className="space-y-1.5 text-gray-500">
              {[
                "Live review sentiment across all platforms",
                "Competitor weakness analysis",
                "Delivery coverage gap detection",
                "Unanswered review identification",
                "Copy-paste response suggestions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="text-amber mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Output Panel ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: "linear-gradient(160deg, #080D1A 0%, #0A1020 100%)" }}>
        <div className="px-6 py-3.5 border-b border-brd/60 flex items-center gap-3" style={{ background: "rgba(15,22,38,0.8)" }}>
          <div className={`w-2 h-2 rounded-full ${status === "loading" ? "animate-pulse" : ""}`}
            style={{ background: status === "idle" ? "#2A3A5C" : status === "loading" ? "#FFB547" : status === "done" ? "#00C9A7" : "#FF4D6D" }} />
          <span className="text-gray-400 text-sm">
            {status === "idle" ? "Ready" : status === "loading" ? "Searching reviews, competitors, delivery data..." : status === "done" ? `Analysis complete — ${result?.restaurant_name}` : "Analysis failed"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* ── Idle ── */}
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
                style={{ background: "linear-gradient(135deg, rgba(255,181,71,0.15), rgba(255,107,53,0.08))", border: "1px solid rgba(255,181,71,0.2)" }}>🧠</div>
              <h3 className="text-white text-xl font-bold mb-2">AI Improvement Advisor</h3>
              <p className="text-gray-500 max-w-sm text-sm">Enter your restaurant name and city. The AI searches live review data, competitor ratings, and delivery coverage to generate ranked action items with real revenue impact.</p>
            </div>
          )}

          {/* ── Loading ── */}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full mb-6 animate-spin" style={{ border: "3px solid rgba(30,45,74,0.8)", borderTopColor: "#FFB547" }} />
              <h3 className="text-white text-lg font-bold mb-2">Running deep analysis...</h3>
              <p className="text-gray-500 text-sm mb-6">Running 3 live searches then generating your action plan. Usually 30–60 seconds.</p>
              <div className="space-y-2 text-left max-w-xs w-full">
                {["Searching reviews on Google, Yelp, DoorDash...", "Benchmarking competitor ratings...", "Checking delivery gaps...", "Writing ranked action plan..."].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-4 h-4 rounded-full animate-pulse flex-shrink-0" style={{ background: "rgba(255,181,71,0.3)" }} />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {status === "error" && error && (
            <div className="max-w-lg mx-auto mt-8">
              {error.code === "PLAN_LIMIT" ? (
                <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)" }}>
                  <div className="text-4xl mb-3">🔒</div>
                  <h3 className="text-white font-bold text-lg mb-2">Report limit reached</h3>
                  <p className="text-gray-400 mb-5">You've used all {error.used} reports this month.</p>
                  <a href="/pricing" className="inline-block btn-orange text-white font-bold px-7 py-2.5 rounded-xl">Upgrade Now</a>
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)" }}>
                  <div className="text-4xl mb-3">⚠️</div>
                  <h3 className="text-white font-bold mb-2">{error.code === "PARSE_ERROR" ? "AI returned unexpected format" : "Analysis failed"}</h3>
                  <p className="text-gray-400 mb-5 text-sm">{error.error}</p>
                  <button onClick={handleRun} className="btn-orange text-white font-bold px-6 py-2.5 rounded-xl">Try Again</button>
                </div>
              )}
            </div>
          )}

          {/* ── Results ── */}
          {status === "done" && result && (
            <div className="max-w-2xl mx-auto space-y-5">

              {/* ── Section 1: Health Score Hero ── */}
              <div className="rounded-2xl p-6 flex items-center gap-6"
                style={{ background: "linear-gradient(135deg, rgba(255,181,71,0.1), rgba(15,22,38,0.9))", border: "1px solid rgba(255,181,71,0.25)" }}>
                <ScoreRing score={result.overall_health_score} size={88} />
                <div className="flex-1">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#FFB547" }}>AI Health Score</div>
                  <h2 className="text-white text-2xl font-bold mb-1">{result.restaurant_name}</h2>
                  <div className="text-gray-400 text-sm mb-3">{result.city} · {result.analysis_date}</div>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Data sources */}
              {result.data_sources?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.data_sources.map((s: string, i: number) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,181,71,0.08)", border: "1px solid rgba(255,181,71,0.2)", color: "#FFB547" }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Section 2: Action Items ── */}
              <div>
                <h3 className="text-white font-bold text-lg mb-3">🎯 Ranked Action Plan</h3>
                <div className="space-y-3">
                  {(result.action_items || []).map((item: any) => {
                    const cs = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.operations;
                    const isExpanded = expandedRanks.has(item.rank);
                    return (
                      <div key={item.rank} className="rounded-2xl overflow-hidden"
                        style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
                        <div className="p-5">
                          {/* Rank + category row */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                              style={{ background: RANK_COLOR(item.rank) }}>
                              {item.rank}
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                              style={{ color: cs.color, background: cs.bg, border: `1px solid ${cs.border}` }}>
                              {item.category}
                            </span>
                          </div>

                          {/* Problem */}
                          <div className="text-white font-bold text-sm mb-2">{item.problem}</div>

                          {/* Evidence */}
                          <div className="text-gray-500 text-xs italic mb-3">{item.evidence}</div>

                          {/* Fix */}
                          <div className="flex items-start gap-2 mb-4">
                            <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: "#00C9A7" }}>FIX →</span>
                            <span className="text-gray-300 text-sm">{item.fix}</span>
                          </div>

                          {/* Bottom row */}
                          <div className="flex items-center flex-wrap gap-3">
                            <span className="text-sm font-bold" style={{ color: "#FFB547" }}>💰 {item.estimated_impact}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ color: EFFORT_COLOR[item.effort] || "#8B9BB4", background: `${EFFORT_COLOR[item.effort] || "#8B9BB4"}15`, border: `1px solid ${EFFORT_COLOR[item.effort] || "#8B9BB4"}30` }}>
                              {item.effort}
                            </span>
                            <span className="text-xs text-gray-500">{item.timeframe}</span>
                            <button onClick={() => toggleExpand(item.rank)}
                              className="ml-auto text-xs text-gray-600 hover:text-gray-400 transition-colors">
                              {isExpanded ? "▲ Hide reason" : "▼ Why this rank?"}
                            </button>
                          </div>
                        </div>

                        {/* Expanded priority reason */}
                        {isExpanded && (
                          <div className="px-5 pb-4 pt-0">
                            <div className="rounded-xl p-3 text-xs text-gray-400" style={{ background: "rgba(30,45,74,0.5)" }}>
                              <span className="font-bold text-gray-300">Why rank {item.rank}:</span> {item.priority_reason}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Section 3: Competitor Intelligence ── */}
              {result.competitor_intelligence && (
                <div className="rounded-2xl p-5" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid rgba(255,77,109,0.3)", borderLeft: "4px solid #FF4D6D" }}>
                  <h3 className="text-white font-bold text-lg mb-4">🔍 Competitor Intelligence</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <div className="text-white font-bold text-lg">{result.competitor_intelligence.competitor_name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-amber font-bold">⭐ {result.competitor_intelligence.their_rating}/5</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            color: result.competitor_intelligence.their_recent_trend?.toLowerCase().includes("fall") ? "#22C55E"
                              : result.competitor_intelligence.their_recent_trend?.toLowerCase().includes("ris") ? "#FF4D6D" : "#FFB547",
                            background: result.competitor_intelligence.their_recent_trend?.toLowerCase().includes("fall") ? "rgba(34,197,94,0.1)"
                              : result.competitor_intelligence.their_recent_trend?.toLowerCase().includes("ris") ? "rgba(255,77,109,0.1)" : "rgba(255,181,71,0.1)",
                          }}>
                          {result.competitor_intelligence.their_recent_trend}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Their Weaknesses → Your Opportunity</div>
                    <div className="space-y-2">
                      {(result.competitor_intelligence.their_top_weaknesses || []).map((w: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-coral flex-shrink-0 mt-0.5">→</span>
                          <span className="text-gray-300">{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl p-4" style={{ background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)" }}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#00C9A7" }}>Your Window Right Now</div>
                    <div className="text-gray-200 text-sm">{result.competitor_intelligence.your_window}</div>
                  </div>
                </div>
              )}

              {/* ── Section 4: Delivery Gaps ── */}
              {result.delivery_gaps?.length > 0 && (
                <div>
                  <h3 className="text-white font-bold text-lg mb-3">📦 Delivery Coverage Gaps</h3>
                  <div className="space-y-3">
                    {result.delivery_gaps.map((gap: any, i: number) => (
                      <div key={i} className="rounded-2xl p-5"
                        style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid rgba(167,139,250,0.3)", borderLeft: "4px solid #A78BFA" }}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-white font-black text-xl">{gap.zip_code}</span>
                            <span className="text-gray-500 text-sm ml-2">{gap.distance_miles} mi away</span>
                          </div>
                          <span className="text-lg font-bold" style={{ color: "#22C55E" }}>{gap.estimated_monthly_revenue}</span>
                        </div>
                        <div className="text-gray-400 text-sm mb-2">{gap.population_note}</div>
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: "#00C9A7" }}>
                          <span>→</span> {gap.action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section 5: Quick Wins ── */}
              {result.quick_wins?.length > 0 && (
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">⚡ Quick Wins</h3>
                  <div className="text-xs text-gray-600 mb-3">Zero cost · Do today</div>
                  <div className="space-y-2">
                    {result.quick_wins.map((win: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl p-4"
                        style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ border: "2px solid rgba(34,197,94,0.4)" }}>
                          <div className="w-2 h-2 rounded-sm" style={{ background: "rgba(34,197,94,0.5)" }} />
                        </div>
                        <span className="text-gray-200 text-sm">{win}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section 6: Review Responses ── */}
              {result.review_response_needed > 0 && result.suggested_responses?.length > 0 && (
                <div>
                  <div className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
                    style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)" }}>
                    <span className="text-2xl">💬</span>
                    <div>
                      <div className="text-white font-bold">You have {result.review_response_needed} unanswered negative reviews</div>
                      <div className="text-gray-500 text-xs">Responding lifts average rating by ~0.2 stars within 90 days</div>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-lg mb-3">Suggested Responses</h3>
                  <div className="space-y-4">
                    {result.suggested_responses.map((sr: any, i: number) => (
                      <div key={i} className="rounded-2xl p-5"
                        style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Reviewer said:</div>
                        <div className="text-gray-400 text-sm italic mb-4">"{sr.review_summary}"</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Suggested response:</div>
                        <div className="rounded-xl p-3 text-sm text-gray-300 leading-relaxed mb-3"
                          style={{ background: "rgba(22,32,56,0.8)", border: "1px solid rgba(30,45,74,0.8)", fontFamily: "monospace" }}>
                          {sr.suggested_response}
                        </div>
                        <button onClick={() => copyResponse(sr.suggested_response, i)}
                          className="text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                          style={{
                            background: copiedIdx === i ? "rgba(34,197,94,0.15)" : "rgba(0,201,167,0.1)",
                            border: `1px solid ${copiedIdx === i ? "rgba(34,197,94,0.4)" : "rgba(0,201,167,0.25)"}`,
                            color: copiedIdx === i ? "#22C55E" : "#00C9A7",
                          }}>
                          {copiedIdx === i ? "✓ Copied!" : "Copy Response"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {status === "done" && result && <ExportToolbar result={result} module="advisor" reportId={result.reportId} />}
      </div>
    </div>
  );
}
