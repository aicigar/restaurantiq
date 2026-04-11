"use client";
import { SentimentData } from "@/types/social";

interface SentimentPanelProps {
  sentiment: SentimentData
}

const SENT_WIDTH: Record<string, number> = {
  "very positive": 95, positive: 75, mixed: 50, negative: 25, unknown: 0,
};
const SENT_COLOR: Record<string, string> = {
  "very positive": "#22C55E", positive: "#22C55E", mixed: "#FFB547", negative: "#FF4D6D", unknown: "#8B9BB4",
};

export default function SentimentPanel({ sentiment }: SentimentPanelProps) {
  if (!sentiment) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
      <div className="px-5 pt-4 pb-3 border-b border-brd/60">
        <h3 className="text-white font-bold text-base">💬 Sentiment Analysis</h3>
      </div>
      <div className="p-5">
        {/* Platform gauges */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label: "Instagram Sentiment", value: sentiment.instagram_sentiment },
            { label: "TikTok Sentiment", value: sentiment.tiktok_sentiment },
          ].map((p) => {
            const color = SENT_COLOR[p.value] || "#8B9BB4";
            const width = SENT_WIDTH[p.value] || 0;
            return (
              <div key={p.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">{p.label}</span>
                  <span className="text-xs font-bold capitalize" style={{ color }}>{p.value}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(30,45,74,0.8)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${width}%`, background: `linear-gradient(90deg, #FF4D6D, ${color})` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Positive / Negative themes */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl p-3.5" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <div className="text-xs font-bold text-green mb-2">Positive Themes</div>
            <ul className="space-y-1.5">
              {(sentiment.positive_themes || []).map((t, i) => (
                <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                  <span className="text-green flex-shrink-0">●</span>{t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-3.5" style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.2)" }}>
            <div className="text-xs font-bold text-coral mb-2">Negative Themes</div>
            <ul className="space-y-1.5">
              {(sentiment.negative_themes || []).map((t, i) => (
                <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                  <span className="text-coral flex-shrink-0">●</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Customer language chips */}
        {sentiment.customer_language_patterns?.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
              Customer Language — <span className="normal-case text-gray-600">Use these exact phrases in your captions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sentiment.customer_language_patterns.map((p, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(22,32,56,0.8)", border: "1px solid rgba(30,45,74,0.8)", color: "#CBD5E1" }}>
                  <span style={{ color: "#E040FB" }}>"</span>{p}<span style={{ color: "#E040FB" }}>"</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Viral trigger phrases */}
        {sentiment.viral_trigger_phrases?.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Viral Trigger Phrases</div>
            <div className="flex flex-wrap gap-1.5">
              {sentiment.viral_trigger_phrases.map((p, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ color: "#E040FB", background: "rgba(224,64,251,0.12)", border: "1px solid rgba(224,64,251,0.25)" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Brand perception */}
        {sentiment.brand_perception && (
          <div className="rounded-xl p-3 mb-3 text-sm text-gray-400 italic"
            style={{ background: "rgba(22,32,56,0.4)", border: "1px solid rgba(30,45,74,0.6)" }}>
            {sentiment.brand_perception}
          </div>
        )}

        {/* Sentiment opportunity */}
        {sentiment.sentiment_opportunity && (
          <div className="rounded-xl p-3.5"
            style={{ background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)" }}>
            <div className="text-xs font-bold text-teal mb-1">Sentiment Opportunity</div>
            <div className="text-gray-200 text-sm font-semibold">{sentiment.sentiment_opportunity}</div>
          </div>
        )}
      </div>
    </div>
  );
}
