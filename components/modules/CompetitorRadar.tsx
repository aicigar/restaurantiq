"use client";
import { useState } from "react";
import ScoreRing from "@/components/ScoreRing";
import ThreatBadge from "@/components/ThreatBadge";
import ExportToolbar from "@/components/ExportToolbar";
import { COUNTRIES, FOOD_CONCEPTS, CountryCode } from "@/lib/countries";

interface CompetitorRadarProps {
  onResult?: (result: any) => void;
}

const INPUT = "input-field w-full px-3 py-2.5 text-sm";
const SELECT = "input-field w-full px-3 py-2.5 text-sm";
const LABEL = "block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold";

export default function CompetitorRadar({ onResult }: CompetitorRadarProps) {
  const [location, setLocation] = useState("");
  const [concept, setConcept] = useState(FOOD_CONCEPTS[0]);
  const [country, setCountry] = useState<CountryCode>("US");
  const [radius, setRadius] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const selectedCountry = COUNTRIES.find((c) => c.code === country)!;
  const unit = selectedCountry.distanceUnit;
  const maxRadius = unit === "km" ? 10 : 5;

  const handleRun = async () => {
    if (!location.trim()) return;
    setLoading(true); setStatus("loading"); setError(null); setResult(null);
    const res = await fetch("/api/analyse/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, concept, radius, country }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data); setStatus("error"); }
    else { setResult(data); setStatus("done"); onResult?.(data); }
  };

  const satStyle: Record<string, { color: string; bg: string; border: string }> = {
    low:    { color: "#22C55E", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)" },
    medium: { color: "#FFB547", bg: "rgba(255,181,71,0.1)",  border: "rgba(255,181,71,0.3)" },
    high:   { color: "#FF4D6D", bg: "rgba(255,77,109,0.1)",  border: "rgba(255,77,109,0.3)" },
  };

  return (
    <div className="flex h-full">
      {/* ── Input Panel ── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-brd/60"
        style={{ background: "linear-gradient(180deg, #0F1626 0%, #0A1020 100%)" }}>

        <div className="p-5 border-b border-brd/60"
          style={{ background: "linear-gradient(135deg, rgba(255,77,109,0.08), rgba(255,107,53,0.04))" }}>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 px-2.5 py-1 rounded-full"
            style={{ background: "linear-gradient(135deg, #FF4D6D, #FF6B35)", color: "white" }}>
            🔍 Module 3
          </div>
          <h2 className="text-white text-xl font-bold">Competitor Radar</h2>
          <p className="text-gray-500 text-xs mt-1">Map competitors & identify market gaps</p>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">
          <div>
            <label className={LABEL}>Country</label>
            <select value={country} onChange={(e) => { setCountry(e.target.value as CountryCode); setRadius(2); }} className={SELECT}
              style={{ background: "rgba(22,32,56,0.8)", color: "white" }}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>Location / Area</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={selectedCountry.locationPlaceholder} className={INPUT} />
          </div>

          <div>
            <label className={LABEL}>Concept Type</label>
            <select value={concept} onChange={(e) => setConcept(e.target.value)} className={SELECT}
              style={{ background: "rgba(22,32,56,0.8)", color: "white" }}>
              {FOOD_CONCEPTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Radius */}
          <div>
            <label className={LABEL}>Search Radius: {radius} {unit}</label>
            <div className="relative">
              <input type="range" min={1} max={maxRadius} value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #FF4D6D ${((radius - 1) / (maxRadius - 1)) * 100}%, rgba(30,45,74,0.8) 0%)`, accentColor: "#FF4D6D" }} />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1{unit}</span><span>{Math.round(maxRadius / 2)}{unit}</span><span>{maxRadius}{unit}</span>
            </div>
          </div>

          <button onClick={handleRun} disabled={loading || !location.trim()}
            className="btn-coral w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning...</>
              : "Scan Competitors"}
          </button>

          <div className="rounded-xl p-3.5 text-xs" style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.15)" }}>
            <div className="font-semibold text-gray-300 mb-2">AI maps:</div>
            <ul className="space-y-1 text-gray-500">
              {["Real competitor listings", "Ratings & price ranges", "Threat level scoring", "Market gaps & opportunities", "Local delivery landscape"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF4D6D,#FF6B35)" }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-2 pt-2 border-t border-brd/40 text-gray-600">
              via {selectedCountry.mapPlatforms.join(", ")}
            </div>
          </div>
        </div>
      </div>

      {/* ── Output Panel ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: "linear-gradient(160deg, #080D1A 0%, #0A1020 100%)" }}>
        <div className="px-6 py-3.5 border-b border-brd/60 flex items-center gap-3" style={{ background: "rgba(15,22,38,0.8)" }}>
          <div className={`w-2 h-2 rounded-full ${status === "loading" ? "animate-pulse" : ""}`}
            style={{ background: status === "idle" ? "#2A3A5C" : status === "loading" ? "#FFB547" : status === "done" ? "#FF4D6D" : "#FF4D6D" }} />
          <span className="text-gray-400 text-sm">
            {status === "idle" ? "Ready" : status === "loading" ? "Scanning competitors..." : status === "done" ? `Scan complete — ${result?.competitors?.length} competitors found` : "Scan failed"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
                style={{ background: "linear-gradient(135deg, rgba(255,77,109,0.15), rgba(255,107,53,0.08))", border: "1px solid rgba(255,77,109,0.2)" }}>🔍</div>
              <h3 className="text-white text-xl font-bold mb-2">Competitive Intelligence</h3>
              <p className="text-gray-500 max-w-sm text-sm">Select a country, enter a location and concept to map real competitors and identify market gaps.</p>
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full mb-6 animate-spin" style={{ border: "3px solid rgba(30,45,74,0.8)", borderTopColor: "#FF4D6D" }} />
              <h3 className="text-white text-lg font-bold mb-2">Mapping competitors...</h3>
              <p className="text-gray-500 text-sm">Searching {selectedCountry.mapPlatforms.join(" & ")} in {selectedCountry.name}. 20–40 seconds.</p>
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
                  <h3 className="text-white font-bold mb-2">Scan failed</h3>
                  <p className="text-gray-400 mb-5 text-sm">{error.error}</p>
                  <button onClick={handleRun} className="btn-coral text-white font-bold px-6 py-2.5 rounded-xl">Try Again</button>
                </div>
              )}
            </div>
          )}

          {status === "done" && result && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Score header */}
              <div className="rounded-2xl p-6 flex items-center gap-6"
                style={{ background: "linear-gradient(135deg, rgba(255,77,109,0.1), rgba(15,22,38,0.9))", border: "1px solid rgba(255,77,109,0.25)" }}>
                <ScoreRing score={result.opportunity_score} size={88} />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-grad-coral">
                    {result.concept} · {result.radius ?? radius}{result.radius_unit ?? unit} radius · {selectedCountry.flag} {result.country || selectedCountry.name}
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-2">{result.location}</h2>
                  {(() => {
                    const s = satStyle[result.market_saturation] || satStyle.medium;
                    return (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full border"
                        style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                        Market Saturation: {result.market_saturation?.toUpperCase()}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Competitors */}
              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">{result.competitors?.length} Competitors Found</h3>
                <div className="space-y-4">
                  {(result.competitors || []).map((c: any, i: number) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: "rgba(22,32,56,0.6)", border: "1px solid rgba(30,45,74,0.8)" }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-bold">{c.name}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{c.address}</div>
                        </div>
                        <ThreatBadge level={c.threat_level} />
                      </div>
                      <div className="flex gap-3 text-xs text-gray-400 mb-2 flex-wrap">
                        <span>⭐ {c.rating}</span><span>{c.price_range}</span><span>{c.distance}</span><span>{c.review_count} reviews</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{c.threat_reason}</div>
                      {c.weaknesses?.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {c.weaknesses.map((w: string, j: number) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: "rgba(255,77,109,0.12)", color: "#FF4D6D", border: "1px solid rgba(255,77,109,0.2)" }}>{w}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Gaps */}
              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">Market Gaps</h3>
                <div className="space-y-3">
                  {(result.market_gaps || []).map((g: any, i: number) => (
                    <div key={i} className="rounded-xl p-4"
                      style={{ background: "rgba(124,111,255,0.07)", border: "1px solid rgba(124,111,255,0.2)" }}>
                      <div className="flex justify-between mb-1">
                        <span className="text-grad-purple font-bold">{g.gap}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase"
                          style={{
                            color: g.size === "large" ? "#22C55E" : g.size === "medium" ? "#FFB547" : "#8B9BB4",
                            background: g.size === "large" ? "rgba(34,197,94,0.1)" : g.size === "medium" ? "rgba(255,181,71,0.1)" : "rgba(30,45,74,0.8)",
                            border: `1px solid ${g.size === "large" ? "rgba(34,197,94,0.3)" : g.size === "medium" ? "rgba(255,181,71,0.3)" : "rgba(30,45,74,1)"}`,
                          }}>{g.size}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{g.opportunity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threat / Opportunity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-4" style={{ background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.2)" }}>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-2 text-grad-coral">Biggest Threat</div>
                  <p className="text-gray-300 text-sm">{result.biggest_threat}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-2 text-green">Biggest Opportunity</div>
                  <p className="text-gray-300 text-sm">{result.biggest_opportunity}</p>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-white font-bold mb-3">Positioning Advice</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{result.positioning_advice}</p>
              </div>
              <div className="card p-5">
                <h3 className="text-white font-bold mb-3">Delivery Landscape</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{result.delivery_landscape}</p>
              </div>
            </div>
          )}
        </div>

        {status === "done" && result && <ExportToolbar result={result} module="competitors" reportId={result.reportId} />}
      </div>
    </div>
  );
}
