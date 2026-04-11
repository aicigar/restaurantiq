"use client";
import { useState } from "react";
import { ContentIdeaData } from "@/types/social";

interface ContentIdeasProps {
  ideas: ContentIdeaData[]
}

export default function ContentIdeas({ ideas }: ContentIdeasProps) {
  const [expandedCaption, setExpandedCaption] = useState<number | null>(null);
  const [expandedTags, setExpandedTags] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!ideas?.length) return null;

  return (
    <div className="space-y-4">
      {ideas.map((idea, i) => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
          <div className="p-5">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#E040FB,#A855F7)" }}>
                {i + 1}
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)", border: "1px solid rgba(224,64,251,0.25)" }}>
                {idea.platform}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ color: "#A78BFA", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)" }}>
                {idea.format}
              </span>
            </div>

            {/* Hook — most prominent */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">The Hook That Stops the Scroll</div>
              <div className="font-black leading-tight" style={{ fontSize: 18, color: "#E040FB" }}>{idea.hook_line}</div>
            </div>

            <div className="text-gray-300 text-sm mb-4 leading-relaxed">{idea.full_concept}</div>

            {/* What to film */}
            {idea.what_to_film_step_by_step?.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">What to Film — Step by Step</div>
                <ol className="space-y-1">
                  {idea.what_to_film_step_by_step.map((step, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: "rgba(224,64,251,0.15)", color: "#E040FB" }}>{j + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Production + reach + time */}
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.production_requirements && (
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ color: "#8B9BB4", background: "rgba(139,155,180,0.08)", border: "1px solid rgba(30,45,74,0.8)" }}>
                  📱 {idea.production_requirements}
                </span>
              )}
              {idea.estimated_reach_potential && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                  style={{ color: "#22C55E", background: "rgba(34,197,94,0.1)" }}>
                  {idea.estimated_reach_potential}
                </span>
              )}
              {idea.best_posting_time && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold text-amber"
                  style={{ background: "rgba(255,181,71,0.08)" }}>
                  ⏰ {idea.best_posting_time}
                </span>
              )}
            </div>

            {/* Caption template */}
            <div className="mb-3">
              <button onClick={() => setExpandedCaption(expandedCaption === i ? null : i)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full mr-2 transition-all"
                style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)", border: "1px solid rgba(224,64,251,0.2)" }}>
                {expandedCaption === i ? "▲ Hide Caption" : "▼ Show Caption Template"}
              </button>
              {expandedCaption === i && (
                <div className="mt-2 rounded-xl p-3 relative"
                  style={{ background: "rgba(11,17,32,0.8)", border: "1px solid rgba(30,45,74,0.8)", fontFamily: "monospace" }}>
                  <div className="text-xs text-gray-300 leading-relaxed pr-12">{idea.caption_template}</div>
                  <button
                    onClick={() => copy(idea.caption_template, `cap-${i}`)}
                    className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)" }}>
                    {copied === `cap-${i}` ? "✓" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            {/* Hashtags */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setExpandedTags(expandedTags === i ? null : i)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                  style={{ color: "#A78BFA", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  {expandedTags === i ? "▲ Hide Hashtags" : "▼ Show Hashtags"}
                </button>
                {expandedTags === i && (
                  <button onClick={() => copy((idea.hashtag_set || []).join(" "), `tags-${i}`)}
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)" }}>
                    {copied === `tags-${i}` ? "✓ Copied" : "Copy All"}
                  </button>
                )}
              </div>
              {expandedTags === i && (
                <div className="flex flex-wrap gap-1">
                  {(idea.hashtag_set || []).map((h, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ color: "#E040FB", background: "rgba(224,64,251,0.08)" }}>{h}</span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA + Trending */}
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.call_to_action && (
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ color: "#00C9A7", background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)" }}>
                  CTA: {idea.call_to_action}
                </span>
              )}
              {idea.trending_element && (
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ color: "#FFB547", background: "rgba(255,181,71,0.08)", border: "1px solid rgba(255,181,71,0.2)" }}>
                  🔥 {idea.trending_element}
                </span>
              )}
            </div>

            {/* Why viral */}
            {idea.why_this_will_go_viral && (
              <div className="rounded-xl p-3 italic text-xs"
                style={{ color: "#A78BFA", background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
                {idea.why_this_will_go_viral}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
