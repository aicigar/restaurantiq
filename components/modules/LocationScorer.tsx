"use client";
import { useState } from "react";
import ScoreRing from "@/components/ScoreRing";
import BarRow from "@/components/BarRow";
import ThreatBadge from "@/components/ThreatBadge";
import ExportToolbar from "@/components/ExportToolbar";
import { COUNTRIES, FOOD_CONCEPTS, CountryCode } from "@/lib/countries";

interface LocationScorerProps {
  onResult?: (result: any) => void;
}

const INPUT = "input-field w-full px-3 py-2.5 text-sm";
const SELECT = "input-field w-full px-3 py-2.5 text-sm";
const LABEL = "block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold";

export default function LocationScorer({ onResult }: LocationScorerProps) {
  const [address, setAddress] = useState("");
  const [concept, setConcept] = useState(FOOD_CONCEPTS[0]);
  const [country, setCountry] = useState<CountryCode>("US");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const selectedCountry = COUNTRIES.find((c) => c.code === country)!;

  const handleRun = async () => {
    if (!address.trim()) return;
    setLoading(true); setStatus("loading"); setError(null); setResult(null);
    const res = await fetch("/api/analyse/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, concept, country }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data); setStatus("error"); }
    else { setResult(data); setStatus("done"); onResult?.(data); }
  };

  const verdictStyle: Record<string, { color: string; bg: string }> = {
    "GO":                   { color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
    "PROCEED WITH CAUTION": { color: "#FFB547", bg: "rgba(255,181,71,0.12)" },
    "NO-GO":                { color: "#FF4D6D", bg: "rgba(255,77,109,0.12)" },
  };

  return (
    <div className="flex h-full">
      {/* ── Input Panel ── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-brd/60"
        style={{ background: "linear-gradient(180deg, #0F1626 0%, #0A1020 100%)" }}>

        {/* Header */}
        <div className="p-5 border-b border-brd/60"
          style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.08), rgba(255,181,71,0.04))" }}>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 px-2.5 py-1 rounded-full"
            style={{ background: "linear-gradient(135deg, #FF6B35, #FFB547)", color: "white" }}>
            📍 Module 1
          </div>
          <h2 className="text-white text-xl font-bold">Location Scorer</h2>
          <p className="text-gray-500 text-xs mt-1">AI-powered go/no-go analysis worldwide</p>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">
          {/* Country */}
          <div>
            <label className={LABEL}>Country</label>
            <select value={country} onChange={(e) => setCountry(e.target.value as CountryCode)} className={SELECT}
              style={{ background: "rgba(22,32,56,0.8)", color: "white" }}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className={LABEL}>Address {selectedCountry.distanceUnit === "km" ? "/ Area" : "/ ZIP Code"}</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRun()}
              placeholder={selectedCountry.addressPlaceholder}
              className={INPUT} />
          </div>

          {/* Concept */}
          <div>
            <label className={LABEL}>Restaurant Concept</label>
            <select value={concept} onChange={(e) => setConcept(e.target.value)} className={SELECT}
              style={{ background: "rgba(22,32,56,0.8)", color: "white" }}>
              {FOOD_CONCEPTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button onClick={handleRun} disabled={loading || !address.trim()}
            className="btn-orange w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing...</>
              : "Run Location Analysis"}
          </button>

          {/* Info box */}
          <div className="rounded-xl p-3.5 text-xs" style={{ background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.15)" }}>
            <div className="font-semibold text-gray-300 mb-2">AI analyses:</div>
            <ul className="space-y-1 text-gray-500">
              {selectedCountry.locationFactors.map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6B35,#FFB547)" }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Output Panel ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: "linear-gradient(160deg, #080D1A 0%, #0A1020 100%)" }}>
        {/* Status bar */}
        <div className="px-6 py-3.5 border-b border-brd/60 flex items-center gap-3"
          style={{ background: "rgba(15,22,38,0.8)" }}>
          <div className={`w-2 h-2 rounded-full ${status === "loading" ? "animate-pulse" : ""}`}
            style={{ background: status === "idle" ? "#2A3A5C" : status === "loading" ? "#FFB547" : status === "done" ? "#22C55E" : "#FF4D6D" }} />
          <span className="text-gray-400 text-sm">
            {status === "idle" ? "Ready" : status === "loading" ? "Analysing..." : status === "done" ? `Analysis complete — ${result?.location_name || address}` : "Analysis failed"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Idle */}
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
                style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,181,71,0.08))", border: "1px solid rgba(255,107,53,0.2)" }}>📍</div>
              <h3 className="text-white text-xl font-bold mb-2">Location Intelligence</h3>
              <p className="text-gray-500 max-w-sm text-sm">Select a country, enter an address and concept to get a comprehensive scored analysis powered by live data.</p>
            </div>
          )}

          {/* Loading */}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full mb-6 animate-spin" style={{ border: "3px solid rgba(30,45,74,0.8)", borderTopColor: "#FF6B35" }} />
              <h3 className="text-white text-lg font-bold mb-2">Searching live data...</h3>
              <p className="text-gray-500 text-sm">Scanning demographics & competitors for {selectedCountry.name}. This takes 20–40 seconds.</p>
            </div>
          )}

          {/* Error */}
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

          {/* Result */}
          {status === "done" && result && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Score header */}
              <div className="rounded-2xl p-6 flex items-center gap-6"
                style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(15,22,38,0.9))", border: "1px solid rgba(255,107,53,0.25)" }}>
                <ScoreRing score={result.overall_score} size={88} />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-grad-orange">
                    {result.concept} · {selectedCountry.flag} {result.country || selectedCountry.name}
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-1">{result.location_name}</h2>
                  {result.verdict && (() => {
                    const vs = verdictStyle[result.verdict] || { color: "#fff", bg: "transparent" };
                    return (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold"
                        style={{ color: vs.color, background: vs.bg, border: `1px solid ${vs.color}30` }}>
                        {result.verdict}
                      </div>
                    );
                  })()}
                  <p className="text-gray-400 text-xs mt-2 max-w-xs">{result.verdict_reason}</p>
                </div>
              </div>

              {/* Factors */}
              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">Factor Analysis</h3>
                {(result.factors || []).map((f: any) => <BarRow key={f.name} label={f.name} score={f.score} value={f.value} note={f.note} />)}
              </div>

              {/* Strengths & Risks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-green">Key Strengths</h3>
                  {(result.key_strengths || []).map((s: string, i: number) => (
                    <div key={i} className="flex gap-2 text-sm text-gray-300 mb-2">
                      <span className="text-green mt-0.5 flex-shrink-0">✓</span>{s}
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.2)" }}>
                  <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-coral">Key Risks</h3>
                  {(result.key_risks || []).map((r: string, i: number) => (
                    <div key={i} className="flex gap-2 text-sm text-gray-300 mb-2">
                      <span className="text-coral mt-0.5 flex-shrink-0">⚠</span>{r}
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitors */}
              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">Nearby Competitors</h3>
                <div className="space-y-3">
                  {(result.competitors_nearby || []).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-brd/40 last:border-0">
                      <div>
                        <div className="text-white font-medium">{c.name}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{c.type} · {c.distance} · ⭐ {c.rating}</div>
                      </div>
                      <ThreatBadge level={c.threat} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternatives */}
              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">Alternative Locations</h3>
                <div className="space-y-3">
                  {(result.alternative_locations || []).map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-brd/40 last:border-0">
                      <div>
                        <div className="text-grad-orange font-semibold">#{i + 1} {a.name}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{a.reason}</div>
                      </div>
                      <div className="text-2xl font-black" style={{ color: a.score >= 75 ? "#22C55E" : a.score >= 50 ? "#FFB547" : "#FF4D6D" }}>{a.score}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="card p-5">
                <h3 className="text-white font-bold mb-3">Strategic Summary</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{result.strategic_summary}</p>
              </div>
            </div>
          )}
        </div>

        {status === "done" && result && <ExportToolbar result={result} module="location" reportId={result.reportId} />}
      </div>
    </div>
  );
}
