"use client";
import { GrowthRoadmapData } from "@/types/social";

interface GrowthRoadmapProps {
  roadmap: GrowthRoadmapData
}

export default function GrowthRoadmap({ roadmap }: GrowthRoadmapProps) {
  if (!roadmap) return null;

  const milestones = [
    { label: "30 Days",  data: roadmap.days_30, border: "#00C9A7", color: "#00C9A7" },
    { label: "60 Days",  data: roadmap.days_60, border: "#FFB547", color: "#FFB547" },
    { label: "90 Days",  data: roadmap.days_90, border: "#E040FB", color: "#E040FB" },
  ];

  return (
    <div>
      <h3 className="text-white font-bold text-base mb-3">📈 90-Day Growth Roadmap</h3>

      {/* Current reach */}
      <div className="text-center mb-5">
        <span className="text-gray-500 text-sm">Current estimated reach: </span>
        <span className="font-bold text-lg" style={{ color: "#E040FB" }}>{roadmap.current_estimated_reach}</span>
        <span className="text-gray-500 text-sm"> per month</span>
      </div>

      {/* Milestones */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {milestones.map(({ label, data, border, color }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: "linear-gradient(145deg,#0F1626,#162038)", borderTop: `3px solid ${border}`, border: `1px solid #1E2D4A` }}>
            <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color }}>{label}</div>
            <div className="text-white font-bold text-sm mb-2 leading-snug">{data?.goal}</div>
            <div className="font-black text-2xl mb-3" style={{ color }}>{data?.follower_target}</div>
            <ul className="space-y-1.5">
              {(data?.key_actions || []).map((a, i) => (
                <li key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
                  <span className="flex-shrink-0 text-green">✓</span>{a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Success metrics */}
      {roadmap.success_metrics?.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Success Metrics</div>
          <div className="flex flex-wrap gap-2">
            {roadmap.success_metrics.map((m, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ color: "#E040FB", background: "rgba(224,64,251,0.08)", border: "1px solid rgba(224,64,251,0.2)" }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
