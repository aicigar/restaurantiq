"use client";
import { useState } from "react";
import BarRow from "@/components/BarRow";
import { InstagramData, TikTokData } from "@/types/social";

interface OwnPresenceProps {
  instagram: InstagramData
  tiktok: TikTokData
  combined_reach: string
  social_vs_competitor_gap: string
}

const TREND_STYLE: Record<string, { color: string; bg: string }> = {
  growing:   { color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  stagnant:  { color: "#FFB547", bg: "rgba(255,181,71,0.12)" },
  declining: { color: "#FF4D6D", bg: "rgba(255,77,109,0.12)" },
  unknown:   { color: "#8B9BB4", bg: "rgba(139,155,180,0.12)" },
};

export default function OwnPresence({ instagram, tiktok, combined_reach, social_vs_competitor_gap }: OwnPresenceProps) {
  const [tab, setTab] = useState<"instagram" | "tiktok">("instagram");

  const ig = instagram;
  const tt = tiktok;

  const TAG_BG = "rgba(224,64,251,0.1)";
  const TAG_COLOR = "#E040FB";
  const FORMAT_BG = "rgba(167,139,250,0.1)";
  const FORMAT_COLOR = "#A78BFA";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0F1626,#162038)", border: "1px solid #1E2D4A" }}>
      <div className="px-5 pt-4 pb-3 border-b border-brd/60">
        <h3 className="text-white font-bold text-base mb-3">📱 Your Social Presence</h3>
        <div className="flex gap-1">
          {(["instagram", "tiktok"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 text-xs font-bold rounded-full capitalize transition-all"
              style={tab === t
                ? { background: "rgba(224,64,251,0.15)", color: "#E040FB", borderBottom: "2px solid #E040FB" }
                : { color: "#4B5A75" }}
            >
              {t === "instagram" ? "📸 Instagram" : "🎵 TikTok"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {tab === "instagram" && ig && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white font-bold text-base">@{ig.handle}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                style={{ color: TREND_STYLE[ig.growth_trend]?.color || "#8B9BB4", background: TREND_STYLE[ig.growth_trend]?.bg || "rgba(139,155,180,0.1)" }}>
                {ig.growth_trend}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: "Followers", value: ig.followers },
                { label: "Engagement", value: ig.estimated_engagement_rate },
                { label: "Posts", value: ig.post_count },
                { label: "Frequency", value: ig.posting_frequency },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(224,64,251,0.08)", border: "1px solid rgba(224,64,251,0.2)" }}>
                  <div className="text-white font-bold text-sm">{stat.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <BarRow label="Profile Completeness" score={ig.profile_completeness_score} />
            </div>

            {ig.content_themes?.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Content Themes</div>
                <div className="flex flex-wrap gap-1.5">
                  {ig.content_themes.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ color: TAG_COLOR, background: TAG_BG }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {ig.formats_used?.length > 0 && (
              <div className="mb-5">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Formats Used</div>
                <div className="flex flex-wrap gap-1.5">
                  {ig.formats_used.map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ color: FORMAT_COLOR, background: FORMAT_BG }}>{f}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-3.5" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div className="text-xs font-bold text-green mb-2">What's Working</div>
                <div className="text-gray-300 text-xs leading-relaxed flex items-start gap-1.5">
                  <span className="text-green flex-shrink-0">✓</span>{ig.what_is_working}
                </div>
              </div>
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.2)" }}>
                <div className="text-xs font-bold text-coral mb-2">What's Missing</div>
                <div className="text-gray-300 text-xs leading-relaxed flex items-start gap-1.5">
                  <span className="text-coral flex-shrink-0">→</span>{ig.what_is_missing}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span>Bio: <span className="text-gray-300">{ig.bio_assessment}</span></span>
              <span className="text-brd">|</span>
              <span>Link: <span className="text-gray-300">{ig.link_in_bio_status}</span></span>
            </div>
          </div>
        )}

        {tab === "tiktok" && tt && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white font-bold text-base">@{tt.handle}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                style={{ color: TREND_STYLE[tt.growth_trend]?.color || "#8B9BB4", background: TREND_STYLE[tt.growth_trend]?.bg || "rgba(139,155,180,0.1)" }}>
                {tt.growth_trend}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                style={{
                  color: tt.viral_potential === "high" ? "#22C55E" : tt.viral_potential === "medium" ? "#FFB547" : "#FF4D6D",
                  background: tt.viral_potential === "high" ? "rgba(34,197,94,0.12)" : tt.viral_potential === "medium" ? "rgba(255,181,71,0.12)" : "rgba(255,77,109,0.12)",
                }}>
                {tt.viral_potential} viral potential
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: "Followers", value: tt.followers },
                { label: "Avg Views", value: tt.estimated_avg_views },
                { label: "Videos", value: tt.video_count },
                { label: "Total Likes", value: tt.total_likes },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(255,64,129,0.08)", border: "1px solid rgba(255,64,129,0.2)" }}>
                  <div className="text-white font-bold text-sm">{stat.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <BarRow label="Profile Score" score={tt.profile_score} />
            </div>

            {tt.formats_used?.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Formats Used</div>
                <div className="flex flex-wrap gap-1.5">
                  {tt.formats_used.map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ color: FORMAT_COLOR, background: FORMAT_BG }}>{f}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-3.5" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div className="text-xs font-bold text-green mb-2">What's Working</div>
                <div className="text-gray-300 text-xs leading-relaxed flex items-start gap-1.5">
                  <span className="text-green flex-shrink-0">✓</span>{tt.what_is_working}
                </div>
              </div>
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.2)" }}>
                <div className="text-xs font-bold text-coral mb-2">What's Missing</div>
                <div className="text-gray-300 text-xs leading-relaxed flex items-start gap-1.5">
                  <span className="text-coral flex-shrink-0">→</span>{tt.what_is_missing}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span>Trending Sounds: <span className={tt.trending_sounds_used ? "text-green" : "text-coral"}>{tt.trending_sounds_used ? "Yes" : "No"}</span></span>
              <span className="text-brd">|</span>
              <span>Duet/Stitch: <span className="text-gray-300">{tt.duet_stitch_usage}</span></span>
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-brd/60 flex flex-wrap gap-4 text-xs">
          <div>
            <span className="text-gray-500">Combined Monthly Reach: </span>
            <span className="text-white font-bold" style={{ color: "#E040FB" }}>{combined_reach}</span>
          </div>
          {social_vs_competitor_gap && (
            <div>
              <span className="text-gray-500">vs Competitors: </span>
              <span className="text-gray-300">{social_vs_competitor_gap}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
