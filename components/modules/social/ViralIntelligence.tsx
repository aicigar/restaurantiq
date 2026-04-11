"use client";
import { useState } from "react";
import { ViralIntelligenceData } from "@/types/social";

interface ViralIntelligenceProps {
  data: ViralIntelligenceData
}

const DIFF_COLOR: Record<string, string> = {
  easy: "#22C55E", moderate: "#FFB547", hard: "#FF4D6D",
};

export default function ViralIntelligence({ data }: ViralIntelligenceProps) {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedSound, setCopiedSound] = useState<string | null>(null);

  const copy = (text: string, key: string, setCopied: (v: string | null) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = (tags: string[], label: string) => {
    navigator.clipboard.writeText(tags.join(" "));
    setCopiedTag(label);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Section A — Trending Formats */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
        <div className="px-5 pt-4 pb-3 border-b border-brd/60">
          <h3 className="text-white font-bold text-base">⚡ Trending Formats Right Now</h3>
        </div>
        <div className="p-5 space-y-4">
          {(data.trending_formats_right_now || []).map((f, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "rgba(22,32,56,0.6)", border: "1px solid rgba(30,45,74,0.8)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-bold text-sm">{f.format_name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                    style={{ color: DIFF_COLOR[f.difficulty], background: `${DIFF_COLOR[f.difficulty]}18` }}>
                    {f.difficulty}
                  </span>
                  <span className="text-sm font-bold" style={{ color: "#E040FB" }}>{f.estimated_reach_potential}</span>
                </div>
              </div>
              <div className="text-gray-400 text-xs mb-2">{f.description}</div>
              <div className="text-xs italic mb-2" style={{ color: "#A78BFA" }}>{f.why_algorithm_loves_it}</div>
              <div className="text-xs text-teal flex items-start gap-1.5">
                <span className="flex-shrink-0">→</span>{f.how_to_apply_to_restaurant}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section B — Trending Now */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
        <div className="px-5 pt-4 pb-3 border-b border-brd/60">
          <h3 className="text-white font-bold text-base">🔥 Trending Now</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Trending Sounds */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Trending Sounds</div>
              <div className="space-y-1.5">
                {(data.trending_sounds_to_use || []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs rounded-lg px-3 py-2"
                    style={{ background: "rgba(224,64,251,0.06)", border: "1px solid rgba(224,64,251,0.2)" }}>
                    <span className="text-gray-300 flex items-center gap-1.5"><span>🎵</span>{s}</span>
                    <button
                      onClick={() => copy(s, `sound-${i}`, setCopiedSound)}
                      className="text-gray-500 hover:text-gray-300 ml-2 flex-shrink-0"
                    >
                      {copiedSound === `sound-${i}` ? "✓" : "⎘"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Hashtags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Primary Tags</div>
                <button
                  onClick={() => copyAll([...(data.trending_hashtags?.mega_tags || []), ...(data.trending_hashtags?.macro_tags || [])], "primary")}
                  className="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors"
                  style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)" }}>
                  {copiedTag === "primary" ? "Copied!" : "Copy All"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...(data.trending_hashtags?.mega_tags || []), ...(data.trending_hashtags?.macro_tags || [])].map((h, i) => (
                  <button key={i}
                    onClick={() => copy(h, `ptag-${i}`, setCopiedTag)}
                    className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all hover:opacity-80"
                    style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)", border: "1px solid rgba(224,64,251,0.25)" }}>
                    {copiedTag === `ptag-${i}` ? "✓" : h}
                  </button>
                ))}
              </div>
            </div>

            {/* Niche + Location Tags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Niche + Location</div>
                <button
                  onClick={() => copyAll([...(data.trending_hashtags?.niche_halal_tags || []), ...(data.trending_hashtags?.location_tags || [])], "niche")}
                  className="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors"
                  style={{ color: "#00C9A7", background: "rgba(0,201,167,0.1)" }}>
                  {copiedTag === "niche" ? "Copied!" : "Copy All"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...(data.trending_hashtags?.niche_halal_tags || []), ...(data.trending_hashtags?.location_tags || [])].map((h, i) => (
                  <button key={i}
                    onClick={() => copy(h, `ntag-${i}`, setCopiedTag)}
                    className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all hover:opacity-80"
                    style={{ color: "#00C9A7", background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)" }}>
                    {copiedTag === `ntag-${i}` ? "✓" : h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {data.trending_hashtags?.recommended_mix && (
            <div className="rounded-xl p-3 text-xs text-gray-400"
              style={{ background: "rgba(30,45,74,0.5)", border: "1px solid rgba(30,45,74,0.8)" }}>
              <span className="font-bold text-gray-300">Recommended Mix: </span>{data.trending_hashtags.recommended_mix}
            </div>
          )}
        </div>
      </div>

      {/* Section C — Best Posting Times */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
        <div className="px-5 pt-4 pb-3 border-b border-brd/60">
          <h3 className="text-white font-bold text-base">⏰ Best Posting Times</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label: "Instagram Weekday", value: data.best_posting_times?.instagram_weekday },
              { label: "Instagram Weekend", value: data.best_posting_times?.instagram_weekend },
              { label: "TikTok Weekday", value: data.best_posting_times?.tiktok_weekday },
              { label: "TikTok Weekend", value: data.best_posting_times?.tiktok_weekend },
            ].map((t) => (
              <div key={t.label} className="rounded-xl p-3"
                style={{ background: "rgba(22,32,56,0.6)", border: "1px solid rgba(30,45,74,0.8)" }}>
                <div className="text-gray-500 text-xs mb-1">{t.label}</div>
                <div className="text-amber font-bold text-sm">{t.value || "—"}</div>
              </div>
            ))}
          </div>
          {data.best_posting_times?.ramadan_special && (
            <div className="rounded-xl p-3"
              style={{ background: "rgba(255,181,71,0.06)", border: "1px solid rgba(255,181,71,0.25)" }}>
              <div className="text-xs font-bold text-amber mb-1">🌙 Ramadan Special</div>
              <div className="text-amber font-bold text-sm">{data.best_posting_times.ramadan_special}</div>
            </div>
          )}

          {data.algorithm_insights?.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Algorithm Insights</div>
              {data.algorithm_insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-300 rounded-xl p-3"
                  style={{ background: "rgba(22,32,56,0.4)", border: "1px solid rgba(30,45,74,0.6)" }}>
                  <span style={{ color: "#FFB547" }}>⚡</span>{insight}
                </div>
              ))}
            </div>
          )}

          {data.content_gap_in_market && (
            <div className="mt-3 rounded-xl p-3.5"
              style={{ background: "rgba(224,64,251,0.08)", border: "1px solid rgba(224,64,251,0.25)" }}>
              <div className="text-xs font-bold mb-1" style={{ color: "#E040FB" }}>Content Gap in Market</div>
              <div className="text-gray-200 text-sm">{data.content_gap_in_market}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
