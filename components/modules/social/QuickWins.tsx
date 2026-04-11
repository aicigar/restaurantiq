"use client";
import { QuickWinData } from "@/types/social";

interface QuickWinsProps {
  quick_wins: QuickWinData[]
}

const EFFORT_COLOR: Record<string, string> = {
  easy: "#22C55E", moderate: "#FFB547", hard: "#FF4D6D",
};

export default function QuickWins({ quick_wins }: QuickWinsProps) {
  if (!quick_wins?.length) return null;

  return (
    <div>
      <h3 className="text-white font-bold text-base mb-3">⚡ Quick Wins</h3>
      <div className="grid grid-cols-2 gap-3">
        {quick_wins.map((w, i) => (
          <div key={i} className="rounded-2xl p-4 relative"
            style={{
              background: "linear-gradient(145deg,#0F1626,#162038)",
              border: `1px solid ${w.do_today ? "rgba(224,64,251,0.35)" : "#1E2D4A"}`,
            }}>
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {w.do_today && (
                <span className="text-xs px-2 py-0.5 rounded-full font-black uppercase"
                  style={{ color: "#E040FB", background: "rgba(224,64,251,0.15)", border: "1px solid rgba(224,64,251,0.3)" }}>
                  DO TODAY
                </span>
              )}
              {w.zero_cost && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ color: "#22C55E", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
                  Zero Cost
                </span>
              )}
            </div>

            <div className="text-white font-bold text-sm mb-2">{w.action}</div>

            {/* Platform chip */}
            <div className="mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ color: "#A78BFA", background: "rgba(167,139,250,0.08)" }}>
                {w.platform}
              </span>
            </div>

            {/* Steps */}
            {w.specific_steps?.length > 0 && (
              <ol className="space-y-1 mb-3">
                {w.specific_steps.map((s, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs text-gray-400">
                    <span className="font-bold text-gray-600 flex-shrink-0">{j + 1}.</span>{s}
                  </li>
                ))}
              </ol>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: "#22C55E" }}>{w.estimated_impact}</span>
              <span className="text-xs font-semibold capitalize" style={{ color: EFFORT_COLOR[w.effort] || "#8B9BB4" }}>
                {w.effort}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
