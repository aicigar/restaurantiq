"use client";
import { useState, useRef } from "react";
import ScoreRing from "@/components/ScoreRing";
import ExportToolbar from "@/components/ExportToolbar";
import OwnPresence from "@/components/modules/social/OwnPresence";
import CompetitorCards from "@/components/modules/social/CompetitorCards";
import ViralIntelligence from "@/components/modules/social/ViralIntelligence";
import SentimentPanel from "@/components/modules/social/SentimentPanel";
import ContentCalendar from "@/components/modules/social/ContentCalendar";
import ContentIdeas from "@/components/modules/social/ContentIdeas";
import QuickWins from "@/components/modules/social/QuickWins";
import GrowthRoadmap from "@/components/modules/social/GrowthRoadmap";
import ViralOpportunityAlert from "@/components/modules/social/ViralOpportunityAlert";
import HookGenerator from "@/components/modules/social/HookGenerator";
import HashtagTool from "@/components/modules/social/HashtagTool";
import SeasonalCampaign from "@/components/modules/social/SeasonalCampaign";
import GrandOpeningPack from "@/components/modules/social/GrandOpeningPack";
import { SocialAnalysisResult } from "@/types/social";

const INPUT = "input-field w-full px-3 py-2.5 text-sm";
const LABEL = "block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold";

const CONCEPTS = [
  "Halal Fried Chicken","Halal Burgers","Halal Pizza","South Asian",
  "Middle Eastern","Turkish","Pakistani","Bangladeshi","Lebanese",
  "Ethiopian","Caribbean","Nigerian","Other",
];

const GRADE_STYLE: Record<string, { color: string; bg: string }> = {
  A: { color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
  B: { color: "#00C9A7", bg: "rgba(0,201,167,0.12)" },
  C: { color: "#FFB547", bg: "rgba(255,181,71,0.12)" },
  D: { color: "#FF8C42", bg: "rgba(255,140,66,0.12)" },
  F: { color: "#FF4D6D", bg: "rgba(255,77,109,0.12)" },
};

type ActiveTab = "analysis" | "calendar" | "tools";

export default function SocialIntel() {
  const [restaurantName, setRestaurantName] = useState("");
  const [city, setCity] = useState("");
  const [concept, setConcept] = useState(CONCEPTS[0]);
  const [instagramHandle, setInstagramHandle] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [competitorHandles, setCompetitorHandles] = useState("");
  const [isNewOpening, setIsNewOpening] = useState(false);
  const [seasonalCampaign, setSeasonalCampaign] = useState<"none"|"ramadan"|"eid">("none");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SocialAnalysisResult | null>(null);
  const [error, setError] = useState<any>(null);
  const [status, setStatus] = useState<"idle"|"loading"|"phase1done"|"done"|"error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("analysis");
  const [elapsed, setElapsed] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleRun = async () => {
    if (!restaurantName.trim() || !city.trim()) return;
    setLoading(true); setStatus("loading"); setError(null); setResult(null);
    setStatusMsg("Searching social profiles & competitors...");
    setElapsed(0); setActiveStep(0);
    elapsedRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    const finish = () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      setLoading(false);
    };

    try {
      const res = await fetch("/api/analyse/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_name: restaurantName,
          city,
          concept,
          instagram_handle: instagramHandle || undefined,
          tiktok_handle: tiktokHandle || undefined,
          competitor_handles: competitorHandles || undefined,
          is_new_opening: isNewOpening,
          seasonal_campaign: seasonalCampaign,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        finish(); setError(data); setStatus("error");
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let phase1Data: any = null;

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const msg = JSON.parse(part.slice(6));

            if (msg.type === "status") {
              setStatusMsg(msg.message);
              if (msg.step === 2) setActiveStep(1);
            }

            if (msg.type === "phase1") {
              // Show core intel immediately — don't wait for calendar
              phase1Data = msg.data;
              setResult(phase1Data);
              setStatus("phase1done");
              setActiveTab("analysis");
              setActiveStep(2);
              setStatusMsg("Building content calendar & growth plan...");
            }

            if (msg.type === "error") {
              finish();
              // If Phase 1 already rendered results, keep them — just stop loading
              if (phase1Data) {
                setStatus("done");
              } else {
                setError({ error: msg.error, code: msg.code });
                setStatus("error");
              }
              return;
            }

            if (msg.type === "done") {
              finish();
              setResult({ ...msg.result, reportId: msg.reportId });
              setStatus("done");
              setActiveTab("analysis");
              return;
            }
          } catch {
            // malformed chunk, keep going
          }
        }
      }

      finish();
      if (!phase1Data) {
        setError({ error: "No response received. Please try again.", code: "API_ERROR" });
        setStatus("error");
      }
    } catch (err: any) {
      finish();
      setError({ error: err.message || "Network error", code: "API_ERROR" });
      setStatus("error");
    }
  };

  const gradeStyle = result ? (GRADE_STYLE[result.social_grade] || GRADE_STYLE.C) : null;

  return (
    <div className="flex h-full">
      {/* ── Input Panel ── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-brd/60"
        style={{ background: "linear-gradient(180deg, #0F1626 0%, #0A1020 100%)" }}>

        <div className="p-5 border-b border-brd/60"
          style={{ background: "linear-gradient(135deg, rgba(224,64,251,0.1), rgba(168,85,247,0.05))" }}>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 px-2.5 py-1 rounded-full"
            style={{ background: "linear-gradient(135deg, #E040FB, #A855F7)", color: "white" }}>
            📱 Module 5
          </div>
          <h2 className="text-white text-xl font-bold">Social Intelligence</h2>
          <p className="text-gray-500 text-xs mt-1">Instagram · TikTok · Content Strategy</p>
        </div>

        <div className="p-5 flex flex-col gap-3.5 flex-1 overflow-y-auto">
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
            <label className={LABEL}>Concept</label>
            <select value={concept} onChange={(e) => setConcept(e.target.value)} className={INPUT}>
              {CONCEPTS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Instagram Handle <span className="text-gray-600 normal-case">(optional)</span></label>
            <input value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="asadshotchicken — no @ needed" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>TikTok Handle <span className="text-gray-600 normal-case">(optional)</span></label>
            <input value={tiktokHandle} onChange={(e) => setTiktokHandle(e.target.value)}
              placeholder="asadshotchicken — no @ needed" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Competitors <span className="text-gray-600 normal-case">(optional)</span></label>
            <input value={competitorHandles} onChange={(e) => setCompetitorHandles(e.target.value)}
              placeholder="daveshotchicken, raisingcanes" className={INPUT} />
            <div className="text-[10px] text-gray-600 mt-1">Comma-separated handles or names</div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between rounded-xl px-3 py-2.5"
            style={{ background: "rgba(224,64,251,0.06)", border: "1px solid rgba(224,64,251,0.2)" }}>
            <span className="text-xs font-semibold text-gray-300">New Location Opening?</span>
            <button
              onClick={() => setIsNewOpening(!isNewOpening)}
              className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
              style={{ background: isNewOpening ? "#E040FB" : "rgba(30,45,74,0.8)" }}>
              <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                style={{ left: isNewOpening ? "calc(100% - 18px)" : "2px" }} />
            </button>
          </div>

          <div className="rounded-xl px-3 py-2.5"
            style={{ background: "rgba(224,64,251,0.06)", border: "1px solid rgba(224,64,251,0.2)" }}>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">Seasonal Campaign</label>
            <select value={seasonalCampaign}
              onChange={(e) => setSeasonalCampaign(e.target.value as "none"|"ramadan"|"eid")}
              className="w-full text-xs bg-transparent text-gray-300 border-0 outline-none">
              <option value="none">None</option>
              <option value="ramadan">🌙 Ramadan</option>
              <option value="eid">☪️ Eid</option>
            </select>
          </div>

          <button onClick={handleRun} disabled={loading || !restaurantName.trim() || !city.trim()}
            className="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#E040FB,#A855F7)", boxShadow: "0 4px 16px rgba(224,64,251,0.3)" }}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing...</>
              : "▶  Run Social Analysis"}
          </button>

          {/* Info box */}
          <div className="rounded-xl p-3.5 text-xs" style={{ background: "rgba(224,64,251,0.06)", border: "1px solid rgba(224,64,251,0.15)" }}>
            <div className="font-semibold text-gray-300 mb-2">AI analyses:</div>
            <ul className="space-y-1.5 text-gray-500">
              {[
                "Real Instagram & TikTok presence",
                "Competitor social accounts",
                "Trending formats & sounds",
                "Halal hashtag performance",
                "4-week content calendar",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0" style={{ color: "#E040FB" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mini tools */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setActiveTab("tools")}
              className="text-xs font-semibold py-2 px-2 rounded-xl text-center transition-all hover:opacity-80"
              style={{ background: "rgba(224,64,251,0.1)", color: "#E040FB", border: "1px solid rgba(224,64,251,0.25)" }}>
              ⚡ Viral Hooks
            </button>
            <button onClick={() => setActiveTab("tools")}
              className="text-xs font-semibold py-2 px-2 rounded-xl text-center transition-all hover:opacity-80"
              style={{ background: "rgba(124,111,255,0.1)", color: "#A78BFA", border: "1px solid rgba(124,111,255,0.25)" }}>
              #️⃣ Hashtags
            </button>
          </div>
        </div>
      </div>

      {/* ── Output Panel ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: "linear-gradient(160deg, #060C18 0%, #0A1020 60%, #0D1428 100%)" }}>
        {/* Status bar */}
        <div className="px-6 py-3.5 border-b border-brd/60 flex items-center gap-3" style={{ background: "rgba(15,22,38,0.8)" }}>
          <div className={`w-2 h-2 rounded-full ${status === "loading" || status === "phase1done" ? "animate-pulse" : ""}`}
            style={{ background: status === "idle" ? "#2A3A5C" : status === "loading" ? "#E040FB" : status === "phase1done" ? "#FFB547" : status === "done" ? "#00C9A7" : "#FF4D6D" }} />
          <span className="text-gray-400 text-sm">
            {status === "idle" ? "Ready"
              : status === "loading" ? statusMsg
              : status === "phase1done" ? `Core analysis ready · ${statusMsg}`
              : status === "done" ? `Analysis complete — ${result?.restaurant_name}`
              : "Analysis failed"}
          </span>

          {/* Tab switcher (show once phase 1 is done) */}
          {(status === "done" || status === "phase1done") && result && (
            <div className="ml-auto flex gap-1">
              {(["analysis","calendar","tools"] as ActiveTab[]).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-all"
                  style={activeTab === tab
                    ? { background: "rgba(224,64,251,0.15)", color: "#E040FB", border: "1px solid rgba(224,64,251,0.35)" }
                    : { color: "#4B5A75", border: "1px solid transparent" }}>
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Idle ── */}
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
                style={{ background: "linear-gradient(135deg, rgba(224,64,251,0.15), rgba(168,85,247,0.08))", border: "1px solid rgba(224,64,251,0.2)" }}>📱</div>
              <h3 className="text-white text-xl font-bold mb-2">Social Intelligence Engine</h3>
              <p className="text-gray-500 max-w-sm text-sm">Enter your restaurant name and city. The AI searches live Instagram and TikTok data, competitor accounts, and trending content to generate your complete social media strategy.</p>
            </div>
          )}

          {/* ── Loading ── */}
          {(status === "loading") && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full relative"
                  style={{ border: "2px solid rgba(30,45,74,0.6)", borderTopColor: "#E040FB", borderRightColor: "rgba(224,64,251,0.4)", animation: "spin 1.2s linear infinite" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full animate-pulse flex items-center justify-center text-lg"
                    style={{ background: "linear-gradient(135deg, rgba(224,64,251,0.2), rgba(168,85,247,0.1))", border: "1px solid rgba(224,64,251,0.3)" }}>
                    📱
                  </div>
                </div>
              </div>

              <h3 className="text-white text-xl font-bold mb-1">Running social intelligence scan...</h3>
              <p className="text-gray-500 text-sm mb-1">Live data · Instagram + TikTok · Competitor analysis</p>
              <div className="mb-7">
                <span className="text-xs font-mono px-3 py-1 rounded-full"
                  style={{ background: "rgba(224,64,251,0.08)", border: "1px solid rgba(224,64,251,0.2)", color: "#E040FB" }}>
                  {elapsed < 60 ? `${elapsed}s elapsed` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s elapsed`}
                </span>
              </div>

              <div className="space-y-3 text-left w-full max-w-sm">
                {[
                  { label: "Searching Instagram & TikTok profiles", icon: "📱", color: "#E040FB" },
                  { label: "Analysing competitor social accounts", icon: "🔍", color: "#FF4081" },
                  { label: "Finding trending formats & sounds", icon: "⚡", color: "#FFB547" },
                  { label: "Building content calendar & strategy", icon: "📅", color: "#22C55E" },
                ].map((step, i) => {
                  const done   = i < activeStep;
                  const active = i === activeStep;
                  const future = i > activeStep;
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500"
                      style={{
                        background: done ? "rgba(34,197,94,0.06)" : active ? `${step.color}10` : "rgba(22,32,56,0.4)",
                        border: `1px solid ${done ? "rgba(34,197,94,0.2)" : active ? `${step.color}35` : "rgba(30,45,74,0.5)"}`,
                        opacity: future ? 0.4 : 1,
                        transform: active ? "scale(1.02)" : "scale(1)",
                      }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                        style={{ background: done ? "rgba(34,197,94,0.2)" : active ? `${step.color}20` : "rgba(30,45,74,0.8)" }}>
                        {done ? <span style={{ color: "#22C55E" }}>✓</span>
                          : active ? <span className="w-3 h-3 rounded-full animate-ping block" style={{ background: step.color, animationDuration: "1s" }} />
                          : <span className="w-2 h-2 rounded-full block" style={{ background: "rgba(139,155,180,0.3)" }} />}
                      </div>
                      <span className="text-base flex-shrink-0">{step.icon}</span>
                      <span className="text-sm font-medium" style={{ color: done ? "#22C55E" : active ? step.color : "#4B5A75" }}>
                        {step.label}{active && <span className="inline-block ml-1 animate-pulse">...</span>}
                      </span>
                      {done && (
                        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}>
                          Done
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-gray-600 text-xs mt-6">Usually 30–60 seconds · Do not close this tab</p>
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
                  <button onClick={handleRun} className="text-white font-bold px-6 py-2.5 rounded-xl"
                    style={{ background: "linear-gradient(135deg,#E040FB,#A855F7)" }}>Try Again</button>
                </div>
              )}
            </div>
          )}

          {/* ── Results ── */}
          {(status === "done" || status === "phase1done") && result && (
            <>
              {/* Analysis tab */}
              {activeTab === "analysis" && (
                <div className="max-w-2xl mx-auto space-y-5">
                  {/* Hero card */}
                  <div className="rounded-2xl p-6 flex items-center gap-6"
                    style={{ background: "linear-gradient(135deg, rgba(224,64,251,0.08), rgba(15,22,38,0.9))", border: "1px solid rgba(224,64,251,0.3)" }}>
                    <ScoreRing score={result.overall_social_score} size={88} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#E040FB" }}>Social Score</div>
                        {gradeStyle && (
                          <span className="font-black text-2xl px-3 py-0.5 rounded-full"
                            style={{ color: gradeStyle.color, background: gradeStyle.bg }}>
                            {result.social_grade}
                          </span>
                        )}
                      </div>
                      <h2 className="text-white text-2xl font-bold mb-1">{result.restaurant_name}</h2>
                      <div className="text-gray-400 text-sm mb-3">{result.city} · {result.analysis_date}</div>
                      <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
                    </div>
                  </div>

                  {/* Data sources */}
                  {result.data_sources_searched?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.data_sources_searched.slice(0, 6).map((s, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(224,64,251,0.08)", border: "1px solid rgba(224,64,251,0.2)", color: "#E040FB" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <OwnPresence
                    instagram={result.own_presence.instagram}
                    tiktok={result.own_presence.tiktok}
                    combined_reach={result.own_presence.combined_monthly_reach_estimate}
                    social_vs_competitor_gap={result.own_presence.social_vs_competitor_gap}
                  />

                  <CompetitorCards competitors={result.competitor_analysis} />

                  <ViralIntelligence data={result.viral_content_intelligence} />

                  <SentimentPanel sentiment={result.sentiment_analysis} />

                  <QuickWins quick_wins={result.quick_wins} />

                  <GrowthRoadmap roadmap={result.growth_roadmap} />

                  <ViralOpportunityAlert opportunity={result.viral_opportunity} />

                  {isNewOpening && result.grand_opening_pack?.include && (
                    <GrandOpeningPack pack={result.grand_opening_pack} />
                  )}

                  {seasonalCampaign !== "none" && result.seasonal_campaign?.type !== "none" && (
                    <SeasonalCampaign campaign={result.seasonal_campaign} />
                  )}

                  {/* Content ideas deep dive */}
                  {result.content_ideas_deep_dive?.length > 0 && (
                    <div>
                      <h3 className="text-white font-bold text-base mb-3">💡 Content Ideas Deep Dive</h3>
                      <ContentIdeas ideas={result.content_ideas_deep_dive} />
                    </div>
                  )}
                </div>
              )}

              {/* Calendar tab */}
              {activeTab === "calendar" && (
                <div className="max-w-full">
                  {status === "phase1done" ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(224,64,251,0.3)", borderTopColor: "#E040FB" }} />
                      <p className="text-gray-400 text-sm">Building your content calendar...</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-white font-bold text-base mb-4">📅 Content Calendar</h3>
                      <ContentCalendar calendar={result.content_calendar} restaurant_name={result.restaurant_name} />
                    </>
                  )}
                </div>
              )}

              {/* Tools tab */}
              {activeTab === "tools" && (
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-2 gap-5">
                    <HookGenerator />
                    <HashtagTool />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tools always accessible from idle/error states too */}
          {status !== "done" && status !== "loading" && activeTab === "tools" && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 gap-5">
                <HookGenerator />
                <HashtagTool />
              </div>
            </div>
          )}
        </div>

        {(status === "done" || status === "phase1done") && result && <ExportToolbar result={result} module="social" reportId={(result as any).reportId} />}
      </div>
    </div>
  );
}
