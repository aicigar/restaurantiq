"use client";
import { useState } from "react";
import { HashtagResult } from "@/types/social";

const CONCEPTS = ["Halal Fried Chicken","Halal Burgers","Halal Pizza","South Asian","Middle Eastern","Turkish","Pakistani","Bangladeshi","Lebanese","Ethiopian","Caribbean","Nigerian","Other"];

const TIER_CONFIG: Array<{ key: keyof HashtagResult["hashtag_sets"]; label: string; color: string }> = [
  { key: "mega",     label: "Mega (1B+)",     color: "#FF4D6D" },
  { key: "macro",    label: "Macro (100M+)",  color: "#FFB547" },
  { key: "micro",    label: "Micro (1M+)",    color: "#E040FB" },
  { key: "niche",    label: "Niche (targeted)", color: "#00C9A7" },
  { key: "location", label: "Location",       color: "#3B82F6" },
];

export default function HashtagTool() {
  const [topic, setTopic] = useState("");
  const [location, setLocation] = useState("");
  const [concept, setConcept] = useState(CONCEPTS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const research = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/analyse/social-hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, location, concept }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
      <div className="px-5 pt-4 pb-3 border-b border-brd/60">
        <h3 className="text-white font-bold text-base">#️⃣ Hashtag Research Tool</h3>
        <p className="text-gray-500 text-xs mt-0.5">Find the best hashtags for any post</p>
      </div>

      <div className="p-5">
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Post Topic</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. spicy chicken wings..."
              className="input-field w-full px-3 py-2.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Philadelphia, PA"
                className="input-field w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Concept</label>
              <select value={concept} onChange={(e) => setConcept(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm">
                {CONCEPTS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button onClick={research} disabled={loading || !topic.trim()}
            className="w-full font-bold py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#7C6FFF,#A855F7)", boxShadow: "0 4px 16px rgba(124,111,255,0.25)" }}>
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Researching...</> : "#️⃣ Research Hashtags"}
          </button>
        </div>

        {error && (
          <div className="text-coral text-xs p-3 rounded-xl mb-4" style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)" }}>
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Tier sections */}
            {TIER_CONFIG.map(({ key, label, color }) => {
              const tags = result.hashtag_sets?.[key] || [];
              if (!tags.length) return null;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest" style={{ color }}>{label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: "#8B9BB4", background: "rgba(139,155,180,0.08)" }}>
                        {tags.length} tags
                      </span>
                    </div>
                    <button onClick={() => copy(tags.map((t) => t.tag).join(" "), `tier-${key}`)}
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color, background: `${color}18` }}>
                      {copied === `tier-${key}` ? "✓ Copied" : "Copy All"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t, i) => (
                      <button key={i} onClick={() => copy(t.tag, `tag-${key}-${i}`)}
                        className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all hover:opacity-80"
                        style={{ color, background: `${color}12`, border: `1px solid ${color}30` }}>
                        {copied === `tag-${key}-${i}` ? "✓" : t.tag}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Recommended mix */}
            {result.recommended_mix && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Copy-Ready Blocks</div>
                <div className="space-y-2">
                  {[
                    { label: "Instagram (small — 10 tags)", value: result.copy_ready_blocks?.instagram_small, key: "ig-small" },
                    { label: "Instagram (full — 25 tags)", value: result.copy_ready_blocks?.instagram_large, key: "ig-large" },
                    { label: "TikTok (6 tags)", value: result.copy_ready_blocks?.tiktok, key: "tt" },
                  ].map((block) => block.value ? (
                    <div key={block.key} className="rounded-xl p-3 relative"
                      style={{ background: "rgba(11,17,32,0.6)", border: "1px solid rgba(30,45,74,0.8)", fontFamily: "monospace" }}>
                      <div className="text-xs text-gray-500 mb-1">{block.label}</div>
                      <div className="text-xs text-gray-300 pr-14 break-all leading-relaxed">{block.value}</div>
                      <button onClick={() => copy(block.value, `block-${block.key}`)}
                        className="absolute top-3 right-2 text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)" }}>
                        {copied === `block-${block.key}` ? "✓" : "Copy"}
                      </button>
                    </div>
                  ) : null)}
                </div>
                {result.recommended_mix.strategy_note && (
                  <div className="mt-2 text-xs text-gray-500 italic">{result.recommended_mix.strategy_note}</div>
                )}
              </div>
            )}

            {/* Trending */}
            {result.trending_right_now?.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Trending Right Now</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.trending_right_now.map((t, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ color: "#FFB547", background: "rgba(255,181,71,0.08)", border: "1px solid rgba(255,181,71,0.2)" }}>
                      📈 {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Avoid */}
            {result.avoid_these?.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Avoid These</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.avoid_these.map((t, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full line-through"
                      style={{ color: "#FF4D6D", background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.2)" }}>
                      ⛔ {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
