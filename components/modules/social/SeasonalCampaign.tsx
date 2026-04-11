"use client";
import { useState } from "react";
import { SeasonalCampaignData } from "@/types/social";

interface SeasonalCampaignProps {
  campaign: SeasonalCampaignData
}

export default function SeasonalCampaign({ campaign }: SeasonalCampaignProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!campaign || campaign.type === "none") return null;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const isRamadan = campaign.type === "ramadan";
  const icon = isRamadan ? "🌙" : "☪️";
  const label = isRamadan ? "Ramadan Campaign" : "Eid Campaign";
  const accentColor = isRamadan ? "#FFB547" : "#E040FB";
  const hooks = isRamadan ? campaign.ramadan_specific_hooks : campaign.eid_specific_hooks;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
      {/* Header banner */}
      <div className="px-5 py-4 flex items-center gap-3"
        style={{ background: `${accentColor}12`, borderBottom: `1px solid ${accentColor}30` }}>
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-white font-bold text-base">{label}</div>
          <div className="text-gray-400 text-xs mt-0.5">{campaign.campaign_overview}</div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Content plan phases */}
        {campaign.content_plan?.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Content Plan</div>
            <div className="space-y-3">
              {campaign.content_plan.map((phase, i) => (
                <div key={i} className="rounded-xl p-4"
                  style={{ background: "rgba(22,32,56,0.6)", border: "1px solid rgba(30,45,74,0.8)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-bold text-sm">{phase.phase}</div>
                    <span className="text-xs text-gray-500">{phase.posting_schedule}</span>
                  </div>
                  {phase.key_message && (
                    <div className="text-xs italic mb-3" style={{ color: accentColor }}>{phase.key_message}</div>
                  )}
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Content Ideas</div>
                    <ul className="space-y-1">
                      {phase.content_ideas.map((idea, j) => (
                        <li key={j} className="text-xs text-gray-300 flex items-start gap-1.5">
                          <span style={{ color: accentColor }} className="flex-shrink-0">•</span>{idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {phase.best_formats?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {phase.best_formats.map((f, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ color: "#A78BFA", background: "rgba(167,139,250,0.1)" }}>{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hooks */}
        {hooks?.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
              {isRamadan ? "Ramadan" : "Eid"} Hooks
            </div>
            <div className="space-y-2">
              {hooks.map((h, i) => (
                <div key={i} className="rounded-xl p-3 flex items-start justify-between gap-3"
                  style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                  <div className="text-gray-300 text-xs leading-relaxed">{h}</div>
                  <button onClick={() => copy(h, `hook-${i}`)}
                    className="text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0"
                    style={{ color: accentColor, background: `${accentColor}15` }}>
                    {copied === `hook-${i}` ? "✓" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community engagement */}
        {campaign.community_engagement_ideas?.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Community Engagement</div>
            <div className="space-y-2">
              {campaign.community_engagement_ideas.map((idea, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-300 rounded-xl p-3"
                  style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.2)" }}>
                  <span className="text-teal flex-shrink-0 mt-0.5">→</span>{idea}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
