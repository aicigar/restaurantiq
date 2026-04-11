"use client";
import { useState } from "react";
import { HookGeneratorResult } from "@/types/social";

const CONCEPTS = ["Halal Fried Chicken","Halal Burgers","Halal Pizza","South Asian","Middle Eastern","Turkish","Pakistani","Bangladeshi","Lebanese","Ethiopian","Caribbean","Nigerian","Other"];

export default function HookGenerator() {
  const [topic, setTopic] = useState("");
  const [concept, setConcept] = useState(CONCEPTS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HookGeneratorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/analyse/social-hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, concept }),
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
        <h3 className="text-white font-bold text-base">⚡ Viral Hook Generator</h3>
        <p className="text-gray-500 text-xs mt-0.5">Generate scroll-stopping hooks for any promotion</p>
      </div>

      <div className="p-5">
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">What are you promoting?</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. our new spicy chicken sandwich..."
              className="input-field w-full px-3 py-2.5 text-sm"
              onKeyDown={(e) => e.key === "Enter" && generate()}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Concept</label>
            <select value={concept} onChange={(e) => setConcept(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm">
              {CONCEPTS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={loading || !topic.trim()}
            className="w-full font-bold py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#E040FB,#A855F7)", boxShadow: "0 4px 16px rgba(224,64,251,0.25)" }}>
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</> : "⚡ Generate Hooks"}
          </button>
        </div>

        {error && (
          <div className="text-coral text-xs p-3 rounded-xl mb-4" style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)" }}>
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* TikTok hooks */}
            <div>
              <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#E040FB" }}>TikTok Video Openers</div>
              <div className="space-y-2">
                {(result.tiktok_hooks || []).map((h, i) => (
                  <div key={i} className="rounded-xl p-3 relative" style={{ background: "rgba(224,64,251,0.06)", border: "1px solid rgba(224,64,251,0.2)" }}>
                    <button onClick={() => copy(h.hook, `tt-${i}`)}
                      className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)" }}>
                      {copied === `tt-${i}` ? "✓" : "Copy"}
                    </button>
                    <div className="text-white font-bold text-sm pr-12">{h.hook}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ color: "#A78BFA", background: "rgba(167,139,250,0.1)" }}>{h.trigger_type}</span>
                    </div>
                    <div className="text-gray-500 text-xs italic mt-1">{h.why_it_works}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instagram hooks */}
            <div>
              <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#FF4081" }}>Instagram Caption Hooks</div>
              <div className="space-y-2">
                {(result.instagram_hooks || []).map((h, i) => (
                  <div key={i} className="rounded-xl p-3 relative" style={{ background: "rgba(255,64,129,0.06)", border: "1px solid rgba(255,64,129,0.2)" }}>
                    <button onClick={() => copy(h.hook, `ig-${i}`)}
                      className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ color: "#FF4081", background: "rgba(255,64,129,0.1)" }}>
                      {copied === `ig-${i}` ? "✓" : "Copy"}
                    </button>
                    <div className="text-white font-bold text-sm pr-12">{h.hook}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ color: "#A78BFA", background: "rgba(167,139,250,0.1)" }}>{h.trigger_type}</span>
                    </div>
                    <div className="text-gray-500 text-xs italic mt-1">{h.why_it_works}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus CTAs */}
            {result.bonus_cta_options?.length > 0 && (
              <div>
                <div className="text-xs font-black uppercase tracking-widest mb-2 text-gray-500">Bonus CTA Options</div>
                <div className="flex flex-wrap gap-2">
                  {result.bonus_cta_options.map((cta, i) => (
                    <button key={i} onClick={() => copy(cta, `cta-${i}`)}
                      className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:opacity-80"
                      style={{ color: "#00C9A7", background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)" }}>
                      {copied === `cta-${i}` ? "✓ Copied" : cta}
                    </button>
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
