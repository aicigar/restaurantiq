"use client";
import ThreatBadge from "@/components/ThreatBadge";
import { CompetitorSocialData } from "@/types/social";

interface CompetitorCardsProps {
  competitors: CompetitorSocialData[]
}

export default function CompetitorCards({ competitors }: CompetitorCardsProps) {
  if (!competitors?.length) return null;

  return (
    <div>
      <h3 className="text-white font-bold text-base mb-3">🔍 Competitor Social Analysis</h3>
      <div className="space-y-4">
        {competitors.map((c, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-white font-bold text-base">{c.name}</h4>
                  {c.halal_messaging && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ color: "#00C9A7", background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)" }}>
                      Halal Messaging
                    </span>
                  )}
                </div>
                <ThreatBadge level={c.threat_level} />
              </div>

              {/* Follower chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ color: "#E040FB", background: "rgba(224,64,251,0.1)", border: "1px solid rgba(224,64,251,0.25)" }}>
                  IG @{c.instagram_handle}: {c.instagram_followers}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ color: "#FF4081", background: "rgba(255,64,129,0.1)", border: "1px solid rgba(255,64,129,0.25)" }}>
                  TT @{c.tiktok_handle}: {c.tiktok_followers}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ color: "#E040FB", background: "rgba(224,64,251,0.08)" }}>
                  {c.estimated_monthly_reach}/mo reach
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ color: "#8B9BB4", background: "rgba(139,155,180,0.08)" }}>
                  {c.posting_frequency}
                </span>
              </div>

              {/* Two column grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl p-3.5" style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.2)" }}>
                  <div className="text-xs font-bold text-coral mb-2">What They Do Better</div>
                  <ul className="space-y-1.5">
                    {(c.what_they_do_better || []).map((w, j) => (
                      <li key={j} className="text-xs text-gray-300 flex items-start gap-1.5">
                        <span className="text-coral flex-shrink-0 mt-0.5">→</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl p-3.5" style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.2)" }}>
                  <div className="text-xs font-bold text-teal mb-2">Their Content Gaps → Your Opportunities</div>
                  <ul className="space-y-1.5">
                    {(c.their_content_gaps || []).map((g, j) => (
                      <li key={j} className="text-xs text-gray-300 flex items-start gap-1.5">
                        <span className="text-teal flex-shrink-0 mt-0.5">✓</span>{g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key insight */}
              <div className="rounded-xl p-3.5 mb-3"
                style={{ borderLeft: "3px solid #E040FB", background: "rgba(224,64,251,0.06)" }}>
                <div className="text-xs font-bold mb-1" style={{ color: "#E040FB" }}>Key Strategic Insight</div>
                <div className="text-gray-300 text-sm">{c.key_strategic_insight}</div>
              </div>

              {/* Opportunity */}
              <div className="rounded-xl p-3.5"
                style={{ background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)" }}>
                <div className="text-xs font-bold text-teal mb-1">Steal Their Audience</div>
                <div className="text-gray-200 text-sm">{c.opportunity_to_steal_audience}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
