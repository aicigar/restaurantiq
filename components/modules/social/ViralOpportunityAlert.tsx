"use client";
import { ViralOpportunityData } from "@/types/social";

interface ViralOpportunityAlertProps {
  opportunity: ViralOpportunityData
}

export default function ViralOpportunityAlert({ opportunity }: ViralOpportunityAlertProps) {
  if (!opportunity) return null;

  return (
    <div className="rounded-2xl p-5"
      style={{
        background: "rgba(224,64,251,0.06)",
        borderLeft: "4px solid #E040FB",
        border: "1px solid rgba(224,64,251,0.35)",
        borderLeftWidth: 4,
      }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⚡</span>
        <span className="text-white font-bold text-base">Your Biggest Viral Opportunity Right Now</span>
        {opportunity.time_sensitive && (
          <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full animate-pulse"
            style={{ color: "#E040FB", background: "rgba(224,64,251,0.2)", border: "1px solid rgba(224,64,251,0.4)" }}>
            TIME SENSITIVE
          </span>
        )}
      </div>

      {/* Headline */}
      <div className="font-black leading-snug mb-3" style={{ fontSize: 18, color: "#E040FB" }}>
        {opportunity.headline}
      </div>

      {/* Description */}
      <div className="text-gray-300 text-sm leading-relaxed mb-4" style={{ lineHeight: 1.7 }}>
        {opportunity.opportunity_description}
      </div>

      {/* Why right now */}
      {opportunity.why_right_now && (
        <div className="rounded-xl p-3 mb-4"
          style={{ borderLeft: "3px solid #00C9A7", background: "rgba(0,201,167,0.06)" }}>
          <div className="text-teal text-sm italic">{opportunity.why_right_now}</div>
        </div>
      )}

      {/* Exact steps */}
      {opportunity.exact_steps?.length > 0 && (
        <div className="space-y-2 mb-4">
          {opportunity.exact_steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                style={{ background: "#E040FB" }}>{i + 1}</div>
              <span className="text-gray-300 text-sm">{step}</span>
            </div>
          ))}
        </div>
      )}

      {/* Estimated reach */}
      {opportunity.estimated_reach_if_executed && (
        <div className="text-lg font-bold" style={{ color: "#22C55E" }}>
          Est. reach if executed: {opportunity.estimated_reach_if_executed}
        </div>
      )}
    </div>
  );
}
