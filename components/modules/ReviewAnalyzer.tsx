"use client";
import { useState } from "react";
import ScoreRing from "@/components/ScoreRing";
import BarRow from "@/components/BarRow";
import ExportToolbar from "@/components/ExportToolbar";
import { COUNTRIES, CountryCode } from "@/lib/countries";

interface ReviewAnalyzerProps {
  onResult?: (result: any) => void;
}

const INPUT = "input-field w-full px-3 py-2.5 text-sm";
const SELECT = "input-field w-full px-3 py-2.5 text-sm";
const LABEL = "block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold";

export default function ReviewAnalyzer({ onResult }: ReviewAnalyzerProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState<CountryCode>("US");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const selectedCountry = COUNTRIES.find((c) => c.code === country)!;

  const handleRun = async () => {
    if (!name.trim() || !city.trim()) return;
    setLoading(true); setStatus("loading"); setError(null); setResult(null);
    const res = await fetch("/api/analyse/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, city, country }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data); setStatus("error"); }
    else { setResult(data); setStatus("done"); onResult?.(data); }
  };

  const severityStyle: Record<string, { color: string; bg: string; border: string }> = {
    high:   { color: "#FF4D6D", bg: "rgba(255,77,109,0.08)",  border: "rgba(255,77,109,0.25)" },
    medium: { color: "#FFB547", bg: "rgba(255,181,71,0.08)",  border: "rgba(255,181,71,0.25)" },
    low:    { color: "#22C55E", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)" },
  };

  return (
    <div className="flex h-full">
      {/* ── Input Panel ── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-brd/60"
        style={{ background: "linear-gradient(180deg, #0F1626 0%, #0A1020 100%)" }}>

        <div className="p-5 border-b border-brd/60"
          style={{ background: "linear-gradient(135deg, rgba(0,201,167,0.08), rgba(0,168,224,0.04))" }}>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 px-2.5 py-1 rounded-full"
            style={{ background: "linear-gradient(135deg, #00C9A7, #00A8E0)", color: "white" }}>
            ⭐ Module 2
          </div>
          <h2 className="text-white text-xl font-bold">Review Analyzer</h2>
          <p className="text-gray-500 text-xs mt-1">Live sentiment from all major platforms</p>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">
          <div>
            <label className={LABEL}>Country</label>
            <select value={country} onChange={(e) => setCountry(e.target.value as CountryCode)} className={SELECT}
              style={{ background: "rgba(22,32,56,0.8)", color: "white" }}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>Restaurant Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Burger Joint" className={INPUT} />
          </div>

          <div>
            <label className={LABEL}>City / Area</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRun()}
              placeholder={selectedCountry.cityPlaceholder} className={INPUT} />
          </div>

          <button onClick={handleRun} disabled={loading || !name.trim() || !city.trim()}
            className="btn-teal w-full text-navy font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" /> Analysing...</>
              : "Analyse Reviews"}
          </button>

          <div className="rounded-xl p-3.5 text-xs" style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.15)" }}>
            <div className="font-semibold text-gray-300 mb-2">Searches across:</div>
            <ul className="space-y-1 text-gray-500">
              {selectedCountry.reviewPlatforms.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#00C9A7,#00A8E0)" }} />
                  {p}
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
            {status === "idle" ? "Ready" : status === "loading" ? "Searching reviews..." : status === "done" ? `Analysis complete — ${result?.restaurant_name}` : "Analysis failed"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
                style={{ background: "linear-gradient(135deg, rgba(0,201,167,0.15), rgba(0,168,224,0.08))", border: "1px solid rgba(0,201,167,0.2)" }}>⭐</div>
              <h3 className="text-white text-xl font-bold mb-2">Review Intelligence</h3>
              <p className="text-gray-500 max-w-sm text-sm">Select a country, enter a restaurant name and city to get real sentiment analysis from local review and delivery platforms.</p>
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full mb-6 animate-spin" style={{ border: "3px solid rgba(30,45,74,0.8)", borderTopColor: "#00C9A7" }} />
              <h3 className="text-white text-lg font-bold mb-2">Searching review platforms...</h3>
              <p className="text-gray-500 text-sm">Scanning {selectedCountry.reviewPlatforms.join(", ")}. 20–40 seconds.</p>
            </div>
          )}

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
                  <button onClick={handleRun} className="btn-teal text-navy font-bold px-6 py-2.5 rounded-xl">Try Again</button>
                </div>
              )}
            </div>
          )}

          {status === "done" && result && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Score header */}
              <div className="rounded-2xl p-6 flex items-center gap-6"
                style={{ background: "linear-gradient(135deg, rgba(0,201,167,0.1), rgba(15,22,38,0.9))", border: "1px solid rgba(0,201,167,0.25)" }}>
                <ScoreRing score={result.overall_score} size={88} />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-grad-teal">
                    {selectedCountry.flag} {result.country || selectedCountry.name}
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-1">{result.restaurant_name}</h2>
                  <div className="text-gray-400 text-sm mb-2">{result.location}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber font-semibold">⭐ {result.average_rating}/5</span>
                    <span className="text-gray-500 text-sm">{result.total_reviews_found} reviews</span>
                  </div>
                </div>
              </div>

              {/* Platforms found */}
              {result.platforms_searched?.length > 0 && (
                <div className="card p-4 flex flex-wrap gap-2">
                  {result.platforms_searched.map((p: string) => (
                    <span key={p} className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.2)", color: "#00C9A7" }}>{p}</span>
                  ))}
                </div>
              )}

              {/* Sentiment */}
              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">Sentiment Categories</h3>
                {(result.sentiment_categories || []).map((c: any) => (
                  <div key={c.category}>
                    <BarRow label={`${c.category} (${c.positive_pct}% positive)`} score={c.score} />
                    <p className="text-xs text-gray-500 -mt-3 mb-3">{c.summary}</p>
                  </div>
                ))}
              </div>

              {/* Top Praised */}
              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">Top Praised Items</h3>
                <div className="space-y-3">
                  {(result.top_praised || []).map((p: any, i: number) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: "rgba(0,201,167,0.05)", border: "1px solid rgba(0,201,167,0.15)" }}>
                      <div className="flex justify-between mb-1">
                        <span className="text-grad-teal font-bold">{p.item}</span>
                        <span className="text-gray-500 text-xs">{p.mentions} mentions</span>
                      </div>
                      <p className="text-gray-400 text-sm italic">"{p.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Urgent Issues */}
              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">Urgent Issues</h3>
                <div className="space-y-3">
                  {(result.urgent_issues || []).map((issue: any, i: number) => {
                    const s = severityStyle[issue.severity] || severityStyle.medium;
                    return (
                      <div key={i} className="rounded-xl p-4" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold" style={{ color: s.color }}>{issue.issue}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full border uppercase"
                            style={{ color: s.color, borderColor: s.border, background: `${s.bg}` }}>
                            {issue.severity}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Frequency: {issue.frequency}</div>
                        <div className="text-sm text-gray-300">Fix: {issue.fix}</div>
                        <div className="text-xs text-gray-500 mt-1">Revenue Impact: {issue.revenue_impact}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">Improvement Action Plan</h3>
                <div className="space-y-3">
                  {(result.improvement_actions || []).map((a: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start p-4 rounded-xl" style={{ background: "rgba(22,32,56,0.6)", border: "1px solid rgba(30,45,74,0.8)" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #FF6B35, #FFB547)" }}>{i + 1}</div>
                      <div>
                        <div className="text-white font-semibold mb-0.5">{a.action}</div>
                        <div className="text-gray-500 text-xs">
                          Priority: <span style={{ color: a.priority === "high" ? "#FF4D6D" : a.priority === "medium" ? "#FFB547" : "#22C55E" }}>{a.priority}</span>
                          {" "}· Effort: {a.effort}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">{a.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-white font-bold mb-3">Summary</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{result.summary}</p>
              </div>
            </div>
          )}
        </div>

        {status === "done" && result && <ExportToolbar result={result} module="reviews" reportId={result.reportId} />}
      </div>
    </div>
  );
}
