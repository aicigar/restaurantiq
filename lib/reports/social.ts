import { SocialAnalysisResult } from "@/types/social";
import { jsPDF } from "jspdf";

export function buildSocialTextReport(data: SocialAnalysisResult): string {
  const lines: string[] = [];
  const divider = "═".repeat(60);
  const sub = "─".repeat(60);

  lines.push(divider);
  lines.push("  RESTAURANTIQ SOCIAL INTELLIGENCE REPORT");
  lines.push(divider);
  lines.push("");
  lines.push(`RESTAURANT:    ${data.restaurant_name}`);
  lines.push(`CITY:          ${data.city}`);
  lines.push(`CONCEPT:       ${data.concept}`);
  lines.push(`SOCIAL SCORE:  ${data.overall_social_score}/100 (Grade: ${data.social_grade})`);
  lines.push(`DATE:          ${data.analysis_date}`);
  lines.push("");
  lines.push(sub);
  lines.push("SUMMARY");
  lines.push(sub);
  lines.push(data.summary || "");
  lines.push("");

  // Instagram
  const ig = data.own_presence?.instagram;
  if (ig) {
    lines.push(sub);
    lines.push("INSTAGRAM");
    lines.push(sub);
    lines.push(`  Handle:      @${ig.handle}`);
    lines.push(`  Followers:   ${ig.followers}`);
    lines.push(`  Posts:       ${ig.post_count}`);
    lines.push(`  Engagement:  ${ig.estimated_engagement_rate}`);
    lines.push(`  Frequency:   ${ig.posting_frequency}`);
    lines.push(`  Growth:      ${ig.growth_trend}`);
    lines.push(`  Working:     ${ig.what_is_working}`);
    lines.push(`  Missing:     ${ig.what_is_missing}`);
    lines.push("");
  }

  // TikTok
  const tt = data.own_presence?.tiktok;
  if (tt) {
    lines.push(sub);
    lines.push("TIKTOK");
    lines.push(sub);
    lines.push(`  Handle:      @${tt.handle}`);
    lines.push(`  Followers:   ${tt.followers}`);
    lines.push(`  Videos:      ${tt.video_count}`);
    lines.push(`  Avg Views:   ${tt.estimated_avg_views}`);
    lines.push(`  Viral Pot:   ${tt.viral_potential}`);
    lines.push(`  Growth:      ${tt.growth_trend}`);
    lines.push(`  Working:     ${tt.what_is_working}`);
    lines.push(`  Missing:     ${tt.what_is_missing}`);
    lines.push("");
    lines.push(`  Combined Monthly Reach: ${data.own_presence.combined_monthly_reach_estimate}`);
    lines.push(`  vs Competitors: ${data.own_presence.social_vs_competitor_gap}`);
    lines.push("");
  }

  // Competitors
  if (data.competitor_analysis?.length) {
    lines.push(sub);
    lines.push("COMPETITORS");
    lines.push(sub);
    data.competitor_analysis.forEach((c) => {
      lines.push(`  ${c.name} | IG: ${c.instagram_followers} | TT: ${c.tiktok_followers} | Threat: ${c.threat_level.toUpperCase()}`);
      lines.push(`  Monthly Reach: ${c.estimated_monthly_reach}`);
      lines.push(`  Insight: ${c.key_strategic_insight}`);
      lines.push(`  Opportunity: ${c.opportunity_to_steal_audience}`);
      lines.push("");
    });
  }

  // Viral Intelligence
  const vi = data.viral_content_intelligence;
  if (vi) {
    lines.push(sub);
    lines.push("VIRAL INTELLIGENCE");
    lines.push(sub);
    (vi.trending_formats_right_now || []).forEach((f) => {
      lines.push(`  ${f.format_name} (${f.difficulty}) — ${f.estimated_reach_potential}`);
      lines.push(`  ${f.how_to_apply_to_restaurant}`);
    });
    lines.push("");
    lines.push(`  Trending Sounds: ${(vi.trending_sounds_to_use || []).join(", ")}`);
    lines.push(`  Top Hashtags: ${[...(vi.trending_hashtags?.mega_tags || []), ...(vi.trending_hashtags?.macro_tags || [])].slice(0, 10).join(" ")}`);
    lines.push(`  Niche/Halal Tags: ${(vi.trending_hashtags?.niche_halal_tags || []).join(" ")}`);
    lines.push(`  Posting Times: IG Weekday ${vi.best_posting_times?.instagram_weekday} | TT Weekday ${vi.best_posting_times?.tiktok_weekday}`);
    lines.push(`  Market Gap: ${vi.content_gap_in_market}`);
    lines.push("");
  }

  // Hashtags
  lines.push(sub);
  lines.push("HASHTAGS");
  lines.push(sub);
  lines.push(`  Recommended Mix: ${vi?.trending_hashtags?.recommended_mix || ""}`);
  lines.push("");

  // Sentiment
  const sent = data.sentiment_analysis;
  if (sent) {
    lines.push(sub);
    lines.push("SENTIMENT ANALYSIS");
    lines.push(sub);
    lines.push(`  Instagram: ${sent.instagram_sentiment} | TikTok: ${sent.tiktok_sentiment}`);
    lines.push(`  Positive Themes: ${(sent.positive_themes || []).join(", ")}`);
    lines.push(`  Negative Themes: ${(sent.negative_themes || []).join(", ")}`);
    lines.push(`  Customer Language: ${(sent.customer_language_patterns || []).join(", ")}`);
    lines.push(`  Viral Phrases: ${(sent.viral_trigger_phrases || []).join(", ")}`);
    lines.push(`  Opportunity: ${sent.sentiment_opportunity}`);
    lines.push("");
  }

  // Content Calendar
  if (data.content_calendar?.length) {
    lines.push(sub);
    lines.push("4-WEEK CONTENT CALENDAR");
    lines.push(sub);
    lines.push("  Week\tDay\tPlatform\tType\tHook");
    data.content_calendar.forEach((item) => {
      lines.push(`  ${item.week}\t${item.day}\t${item.platform}\t${item.content_type}\t${item.hook}`);
    });
    lines.push("");
  }

  // Content Ideas
  if (data.content_ideas_deep_dive?.length) {
    lines.push(sub);
    lines.push("CONTENT IDEAS");
    lines.push(sub);
    data.content_ideas_deep_dive.forEach((idea, i) => {
      lines.push(`  ${i + 1}. ${idea.title} (${idea.platform} — ${idea.format})`);
      lines.push(`     Hook: ${idea.hook_line}`);
      lines.push(`     Why viral: ${idea.why_this_will_go_viral}`);
      lines.push(`     Reach: ${idea.estimated_reach_potential}`);
      lines.push("");
    });
  }

  // Quick Wins
  if (data.quick_wins?.length) {
    lines.push(sub);
    lines.push("QUICK WINS");
    lines.push(sub);
    data.quick_wins.forEach((w, i) => {
      const badges = [w.do_today ? "DO TODAY" : "", w.zero_cost ? "ZERO COST" : ""].filter(Boolean).join(" · ");
      lines.push(`  ${i + 1}. [${w.platform}] ${w.action}${badges ? ` — ${badges}` : ""}`);
      lines.push(`     Impact: ${w.estimated_impact}`);
    });
    lines.push("");
  }

  // Roadmap
  const rm = data.growth_roadmap;
  if (rm) {
    lines.push(sub);
    lines.push("90-DAY GROWTH ROADMAP");
    lines.push(sub);
    lines.push(`  Current Reach: ${rm.current_estimated_reach}`);
    lines.push(`  30 Days: ${rm.days_30?.goal} (Target: ${rm.days_30?.follower_target})`);
    lines.push(`  60 Days: ${rm.days_60?.goal} (Target: ${rm.days_60?.follower_target})`);
    lines.push(`  90 Days: ${rm.days_90?.goal} (Target: ${rm.days_90?.follower_target})`);
    lines.push("");
  }

  // Viral Opportunity
  const vo = data.viral_opportunity;
  if (vo) {
    lines.push(sub);
    lines.push("VIRAL OPPORTUNITY");
    lines.push(sub);
    lines.push(`  ${vo.headline}`);
    lines.push(`  ${vo.opportunity_description}`);
    lines.push(`  Why now: ${vo.why_right_now}`);
    lines.push(`  Est. Reach: ${vo.estimated_reach_if_executed}`);
    lines.push("");
  }

  lines.push(divider);
  lines.push(`  Generated by RestaurantIQ — ${new Date().toLocaleDateString()}`);
  lines.push(divider);

  return lines.join("\n");
}

export function buildSocialHTMLReport(data: SocialAnalysisResult): string {
  const scoreColor = (score: number) => {
    if (score >= 75) return "#22C55E";
    if (score >= 50) return "#FFB547";
    return "#FF4D6D";
  };

  const gradeBadge = (grade: string) => {
    const colors: Record<string, string> = { A: "#22C55E", B: "#00C9A7", C: "#FFB547", D: "#FF8C42", F: "#FF4D6D" };
    const c = colors[grade] || "#8B9BB4";
    return `<span style="background:${c}22;color:${c};border:1px solid ${c}44;padding:4px 14px;border-radius:20px;font-size:20px;font-weight:900;">${grade}</span>`;
  };

  const chip = (text: string, color: string) =>
    `<span style="background:${color}18;color:${color};border:1px solid ${color}35;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;margin:2px;display:inline-block;">${text}</span>`;

  const ig = data.own_presence?.instagram;
  const tt = data.own_presence?.tiktok;
  const vi = data.viral_content_intelligence;
  const sent = data.sentiment_analysis;
  const rm = data.growth_roadmap;
  const vo = data.viral_opportunity;

  const trendColor = (t: string) =>
    t === "growing" ? "#22C55E" : t === "stagnant" ? "#FFB547" : t === "declining" ? "#FF4D6D" : "#8B9BB4";

  const sentColor = (s: string) =>
    s === "very positive" || s === "positive" ? "#22C55E" : s === "mixed" ? "#FFB547" : s === "negative" ? "#FF4D6D" : "#8B9BB4";

  const body = `
    <!-- Hero -->
    <div style="display:flex;align-items:center;gap:24px;margin-bottom:24px;padding:20px;background:#1A2540;border-radius:12px;border:1px solid rgba(224,64,251,0.3);">
      <div style="text-align:center;">
        <div style="font-size:48px;font-weight:900;color:${scoreColor(data.overall_social_score)};">${data.overall_social_score}</div>
        <div style="color:#8B9BB4;font-size:11px;">/100</div>
      </div>
      <div style="flex:1;">
        <div style="color:#E040FB;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Social Intelligence Score</div>
        <h2 style="color:white;margin:0 0 4px;font-size:22px;">${data.restaurant_name}</h2>
        <div style="color:#8B9BB4;font-size:13px;margin-bottom:8px;">${data.city} · ${data.analysis_date}</div>
        <div style="margin-bottom:10px;">${gradeBadge(data.social_grade)}</div>
        <p style="color:#CBD5E1;margin:0;font-size:13px;line-height:1.6;">${data.summary}</p>
      </div>
    </div>

    ${data.data_sources_searched?.length ? `
    <div style="margin-bottom:20px;">
      ${data.data_sources_searched.slice(0, 6).map((s) => chip(s, "#E040FB")).join("")}
    </div>` : ""}

    <!-- Own Presence -->
    <h3 style="color:white;margin:0 0 12px;font-size:16px;">📱 Your Social Presence</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
      ${ig ? `
      <div style="background:#1A2540;padding:16px;border-radius:12px;border-top:3px solid #E040FB;">
        <div style="color:#E040FB;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Instagram @${ig.handle}</div>
        <div style="display:flex;gap:12px;margin-bottom:10px;flex-wrap:wrap;">
          ${chip(ig.followers + " followers", "#E040FB")}
          ${chip(ig.estimated_engagement_rate + " engagement", "#00C9A7")}
          ${chip(ig.posting_frequency, "#FFB547")}
          ${chip(ig.growth_trend, trendColor(ig.growth_trend))}
        </div>
        <div style="color:#22C55E;font-size:12px;margin-bottom:4px;">✓ ${ig.what_is_working}</div>
        <div style="color:#FF4D6D;font-size:12px;">→ Missing: ${ig.what_is_missing}</div>
      </div>` : ""}
      ${tt ? `
      <div style="background:#1A2540;padding:16px;border-radius:12px;border-top:3px solid #FF4081;">
        <div style="color:#FF4081;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:8px;">TikTok @${tt.handle}</div>
        <div style="display:flex;gap:12px;margin-bottom:10px;flex-wrap:wrap;">
          ${chip(tt.followers + " followers", "#FF4081")}
          ${chip(tt.estimated_avg_views + " avg views", "#00C9A7")}
          ${chip("Viral: " + tt.viral_potential, tt.viral_potential === "high" ? "#22C55E" : tt.viral_potential === "medium" ? "#FFB547" : "#FF4D6D")}
          ${chip(tt.growth_trend, trendColor(tt.growth_trend))}
        </div>
        <div style="color:#22C55E;font-size:12px;margin-bottom:4px;">✓ ${tt.what_is_working}</div>
        <div style="color:#FF4D6D;font-size:12px;">→ Missing: ${tt.what_is_missing}</div>
      </div>` : ""}
    </div>

    <!-- Competitors -->
    ${data.competitor_analysis?.length ? `
    <h3 style="color:white;margin:0 0 12px;font-size:16px;">🔍 Competitor Analysis</h3>
    <div style="margin-bottom:20px;">
      ${data.competitor_analysis.map((c) => {
        const tc = c.threat_level === "high" ? "#FF4D6D" : c.threat_level === "medium" ? "#FFB547" : "#22C55E";
        return `<div style="background:#1A2540;padding:16px;border-radius:12px;margin-bottom:10px;border-left:3px solid ${tc};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="color:white;font-weight:700;">${c.name}</div>
            <span style="background:${tc}18;color:${tc};padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">${c.threat_level.toUpperCase()} THREAT</span>
          </div>
          <div style="display:flex;gap:12px;margin-bottom:8px;">
            ${chip("IG: " + c.instagram_followers, "#E040FB")}
            ${chip("TT: " + c.tiktok_followers, "#FF4081")}
            ${chip(c.estimated_monthly_reach + " reach/mo", "#00C9A7")}
          </div>
          <div style="color:#CBD5E1;font-size:13px;margin-bottom:6px;">${c.key_strategic_insight}</div>
          <div style="background:rgba(0,201,167,0.08);border:1px solid rgba(0,201,167,0.2);border-radius:8px;padding:10px;font-size:12px;color:#00C9A7;">→ ${c.opportunity_to_steal_audience}</div>
        </div>`;
      }).join("")}
    </div>` : ""}

    <!-- Viral Intelligence -->
    ${vi ? `
    <h3 style="color:white;margin:0 0 12px;font-size:16px;">⚡ Viral Content Intelligence</h3>
    <div style="margin-bottom:20px;">
      ${(vi.trending_formats_right_now || []).map((f) => {
        const dc = f.difficulty === "easy" ? "#22C55E" : f.difficulty === "moderate" ? "#FFB547" : "#FF4D6D";
        return `<div style="background:#1A2540;padding:14px;border-radius:10px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div style="color:white;font-weight:700;">${f.format_name}</div>
            <div style="display:flex;gap:8px;">
              ${chip(f.difficulty, dc)}
              <span style="color:#E040FB;font-weight:700;font-size:13px;">${f.estimated_reach_potential}</span>
            </div>
          </div>
          <div style="color:#8B9BB4;font-size:12px;font-style:italic;margin-bottom:4px;">${f.why_algorithm_loves_it}</div>
          <div style="color:#00C9A7;font-size:12px;">→ ${f.how_to_apply_to_restaurant}</div>
        </div>`;
      }).join("")}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:#1A2540;padding:12px;border-radius:10px;">
        <div style="color:#E040FB;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Trending Sounds</div>
        ${(vi.trending_sounds_to_use || []).map((s) => `<div style="color:#CBD5E1;font-size:12px;margin-bottom:4px;">🎵 ${s}</div>`).join("")}
      </div>
      <div style="background:#1A2540;padding:12px;border-radius:10px;">
        <div style="color:#E040FB;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Top Hashtags</div>
        ${[...(vi.trending_hashtags?.mega_tags || []), ...(vi.trending_hashtags?.macro_tags || [])].slice(0, 8).map((h) => chip(h, "#E040FB")).join("")}
      </div>
      <div style="background:#1A2540;padding:12px;border-radius:10px;">
        <div style="color:#E040FB;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Niche Halal Tags</div>
        ${(vi.trending_hashtags?.niche_halal_tags || []).map((h) => chip(h, "#00C9A7")).join("")}
      </div>
    </div>` : ""}

    <!-- Sentiment -->
    ${sent ? `
    <h3 style="color:white;margin:0 0 12px;font-size:16px;">💬 Sentiment Analysis</h3>
    <div style="background:#1A2540;padding:16px;border-radius:12px;margin-bottom:20px;">
      <div style="display:flex;gap:16px;margin-bottom:14px;">
        <div style="flex:1;text-align:center;padding:10px;background:#0B1120;border-radius:8px;">
          <div style="color:#8B9BB4;font-size:10px;margin-bottom:4px;">INSTAGRAM</div>
          <div style="color:${sentColor(sent.instagram_sentiment)};font-weight:700;">${sent.instagram_sentiment}</div>
        </div>
        <div style="flex:1;text-align:center;padding:10px;background:#0B1120;border-radius:8px;">
          <div style="color:#8B9BB4;font-size:10px;margin-bottom:4px;">TIKTOK</div>
          <div style="color:${sentColor(sent.tiktok_sentiment)};font-weight:700;">${sent.tiktok_sentiment}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
        <div>
          <div style="color:#22C55E;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:6px;">Positive Themes</div>
          ${(sent.positive_themes || []).map((t) => `<div style="color:#CBD5E1;font-size:12px;margin-bottom:4px;display:flex;gap:6px;"><span style="color:#22C55E;">●</span>${t}</div>`).join("")}
        </div>
        <div>
          <div style="color:#FF4D6D;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:6px;">Negative Themes</div>
          ${(sent.negative_themes || []).map((t) => `<div style="color:#CBD5E1;font-size:12px;margin-bottom:4px;display:flex;gap:6px;"><span style="color:#FF4D6D;">●</span>${t}</div>`).join("")}
        </div>
      </div>
      <div style="background:rgba(0,201,167,0.08);border:1px solid rgba(0,201,167,0.2);border-radius:8px;padding:10px;">
        <div style="color:#00C9A7;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Opportunity</div>
        <div style="color:#CBD5E1;font-size:13px;">${sent.sentiment_opportunity}</div>
      </div>
    </div>` : ""}

    <!-- Content Calendar -->
    ${data.content_calendar?.length ? `
    <h3 style="color:white;margin:0 0 12px;font-size:16px;">📅 4-Week Content Calendar</h3>
    <div style="overflow-x:auto;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#1A2540;">
            <th style="padding:8px 10px;text-align:left;color:#8B9BB4;font-size:10px;text-transform:uppercase;">Week</th>
            <th style="padding:8px 10px;text-align:left;color:#8B9BB4;font-size:10px;text-transform:uppercase;">Day</th>
            <th style="padding:8px 10px;text-align:left;color:#8B9BB4;font-size:10px;text-transform:uppercase;">Platform</th>
            <th style="padding:8px 10px;text-align:left;color:#8B9BB4;font-size:10px;text-transform:uppercase;">Type</th>
            <th style="padding:8px 10px;text-align:left;color:#8B9BB4;font-size:10px;text-transform:uppercase;">Hook</th>
            <th style="padding:8px 10px;text-align:left;color:#8B9BB4;font-size:10px;text-transform:uppercase;">Viral</th>
          </tr>
        </thead>
        <tbody>
          ${data.content_calendar.map((item) => {
            const bgColor = item.platform === "Instagram" ? "rgba(224,64,251,0.05)" : item.platform === "TikTok" ? "rgba(255,64,129,0.05)" : "rgba(255,181,71,0.05)";
            const vpColor = item.viral_potential === "high" ? "#E040FB" : item.viral_potential === "medium" ? "#FFB547" : "#8B9BB4";
            return `<tr style="background:${bgColor};border-bottom:1px solid #1E2D4A;">
              <td style="padding:8px 10px;color:#CBD5E1;font-weight:700;">${item.week}</td>
              <td style="padding:8px 10px;color:#CBD5E1;">${item.day}</td>
              <td style="padding:8px 10px;">${chip(item.platform, item.platform === "Instagram" ? "#E040FB" : "#FF4081")}</td>
              <td style="padding:8px 10px;color:#CBD5E1;">${item.content_type}</td>
              <td style="padding:8px 10px;color:#CBD5E1;max-width:200px;">${item.hook}</td>
              <td style="padding:8px 10px;color:${vpColor};font-weight:700;">${item.viral_potential}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>` : ""}

    <!-- Content Ideas -->
    ${data.content_ideas_deep_dive?.length ? `
    <h3 style="color:white;margin:0 0 12px;font-size:16px;">💡 Content Ideas Deep Dive</h3>
    <div style="margin-bottom:20px;">
      ${data.content_ideas_deep_dive.map((idea, i) => `
        <div style="background:#1A2540;border-radius:12px;margin-bottom:12px;overflow:hidden;">
          <div style="padding:16px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <div style="width:30px;height:30px;border-radius:50%;background:#E040FB;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;flex-shrink:0;">${i + 1}</div>
              ${chip(idea.platform, "#E040FB")}
              ${chip(idea.format, "#A78BFA")}
            </div>
            <div style="color:#E040FB;font-size:16px;font-weight:800;margin-bottom:8px;">${idea.hook_line}</div>
            <div style="color:#CBD5E1;font-size:13px;margin-bottom:10px;">${idea.full_concept}</div>
            <div style="display:flex;align-items:center;gap:16px;">
              <span style="color:#22C55E;font-weight:700;">${idea.estimated_reach_potential}</span>
              <span style="color:#FFB547;font-size:12px;">${idea.best_posting_time}</span>
            </div>
          </div>
        </div>
      `).join("")}
    </div>` : ""}

    <!-- Quick Wins -->
    ${data.quick_wins?.length ? `
    <h3 style="color:white;margin:0 0 4px;font-size:16px;">⚡ Quick Wins</h3>
    <div style="color:#8B9BB4;font-size:12px;margin-bottom:12px;">Do today · Zero cost</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
      ${data.quick_wins.map((w) => `
        <div style="background:#1A2540;padding:14px;border-radius:10px;border:1px solid ${w.do_today ? "rgba(224,64,251,0.3)" : "#1E2D4A"};">
          ${w.do_today ? `<span style="background:rgba(224,64,251,0.15);color:#E040FB;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;margin-bottom:8px;display:inline-block;">DO TODAY</span>` : ""}
          ${w.zero_cost ? `<span style="background:rgba(34,197,94,0.15);color:#22C55E;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;margin-bottom:8px;display:inline-block;margin-left:4px;">ZERO COST</span>` : ""}
          <div style="color:white;font-weight:700;font-size:13px;margin-bottom:6px;margin-top:4px;">${w.action}</div>
          <div style="color:#22C55E;font-size:12px;">${w.estimated_impact}</div>
        </div>
      `).join("")}
    </div>` : ""}

    <!-- Growth Roadmap -->
    ${rm ? `
    <h3 style="color:white;margin:0 0 12px;font-size:16px;">📈 90-Day Growth Roadmap</h3>
    <div style="text-align:center;margin-bottom:14px;">
      <span style="color:#8B9BB4;font-size:12px;">Current reach: </span>
      <span style="color:#E040FB;font-weight:700;font-size:16px;">${rm.current_estimated_reach}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:#1A2540;padding:14px;border-radius:10px;border-top:3px solid #00C9A7;">
        <div style="color:#00C9A7;font-size:10px;font-weight:700;margin-bottom:4px;">30 DAYS</div>
        <div style="color:white;font-weight:700;font-size:13px;margin-bottom:6px;">${rm.days_30?.goal}</div>
        <div style="color:#E040FB;font-weight:900;font-size:18px;margin-bottom:8px;">${rm.days_30?.follower_target}</div>
        ${(rm.days_30?.key_actions || []).map((a) => `<div style="color:#CBD5E1;font-size:11px;margin-bottom:3px;">✓ ${a}</div>`).join("")}
      </div>
      <div style="background:#1A2540;padding:14px;border-radius:10px;border-top:3px solid #FFB547;">
        <div style="color:#FFB547;font-size:10px;font-weight:700;margin-bottom:4px;">60 DAYS</div>
        <div style="color:white;font-weight:700;font-size:13px;margin-bottom:6px;">${rm.days_60?.goal}</div>
        <div style="color:#E040FB;font-weight:900;font-size:18px;margin-bottom:8px;">${rm.days_60?.follower_target}</div>
        ${(rm.days_60?.key_actions || []).map((a) => `<div style="color:#CBD5E1;font-size:11px;margin-bottom:3px;">✓ ${a}</div>`).join("")}
      </div>
      <div style="background:#1A2540;padding:14px;border-radius:10px;border-top:3px solid #E040FB;">
        <div style="color:#E040FB;font-size:10px;font-weight:700;margin-bottom:4px;">90 DAYS</div>
        <div style="color:white;font-weight:700;font-size:13px;margin-bottom:6px;">${rm.days_90?.goal}</div>
        <div style="color:#E040FB;font-weight:900;font-size:18px;margin-bottom:8px;">${rm.days_90?.follower_target}</div>
        ${(rm.days_90?.key_actions || []).map((a) => `<div style="color:#CBD5E1;font-size:11px;margin-bottom:3px;">✓ ${a}</div>`).join("")}
      </div>
    </div>` : ""}

    <!-- Viral Opportunity -->
    ${vo ? `
    <div style="background:rgba(224,64,251,0.08);border:1px solid rgba(224,64,251,0.35);border-left:4px solid #E040FB;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="font-size:18px;">⚡</span>
        <span style="color:white;font-weight:700;font-size:16px;">Your Biggest Viral Opportunity</span>
        ${vo.time_sensitive ? `<span style="background:rgba(224,64,251,0.2);color:#E040FB;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">TIME SENSITIVE</span>` : ""}
      </div>
      <div style="color:#E040FB;font-size:18px;font-weight:800;margin-bottom:8px;">${vo.headline}</div>
      <div style="color:#CBD5E1;font-size:13px;margin-bottom:12px;line-height:1.7;">${vo.opportunity_description}</div>
      <div style="background:rgba(0,201,167,0.08);border-left:3px solid #00C9A7;padding:10px;border-radius:6px;margin-bottom:12px;">
        <div style="color:#00C9A7;font-size:12px;font-style:italic;">${vo.why_right_now}</div>
      </div>
      <div style="margin-bottom:10px;">
        ${(vo.exact_steps || []).map((s, i) => `<div style="display:flex;gap:10px;margin-bottom:6px;">
          <div style="width:22px;height:22px;border-radius:50%;background:#E040FB;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;flex-shrink:0;">${i + 1}</div>
          <span style="color:#CBD5E1;font-size:13px;">${s}</span>
        </div>`).join("")}
      </div>
      <div style="color:#22C55E;font-weight:700;font-size:16px;">Est. Reach: ${vo.estimated_reach_if_executed}</div>
    </div>` : ""}
  `;

  return `<div style="font-family:Arial,sans-serif;color:#CBD5E1;background:#0B1120;padding:0;">${body}</div>`;
}

// Strip emoji and non-latin characters that jsPDF/helvetica cannot render
function safe(text: string | undefined | null): string {
  if (!text) return "";
  // Remove characters outside latin extended range (covers emoji, symbols, etc.)
  return text
    .replace(/[\u0250-\uFFFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSocialPDFReport(data: SocialAnalysisResult): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const C = {
    bg:       [8,   13,  26]  as [number,number,number],
    panel:    [15,  22,  38]  as [number,number,number],
    card:     [22,  32,  56]  as [number,number,number],
    border:   [30,  45,  74]  as [number,number,number],
    magenta:  [224, 64,  251] as [number,number,number],
    pink:     [255, 64,  129] as [number,number,number],
    green:    [34,  197, 94]  as [number,number,number],
    coral:    [255, 77,  109] as [number,number,number],
    teal:     [0,   201, 167] as [number,number,number],
    amber:    [255, 181, 71]  as [number,number,number],
    white:    [255, 255, 255] as [number,number,number],
    gray:     [220, 228, 240] as [number,number,number],
    dimgray:  [160, 175, 200] as [number,number,number],
  };

  const MARGIN = 40;
  const INNER  = W - MARGIN * 2;
  const FOOTER = 28;
  let y = 0;

  const drawPageBg = () => {
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, W, H, "F");
  };

  const drawFooter = () => {
    doc.setFillColor(...C.panel);
    doc.rect(0, H - FOOTER, W, FOOTER, "F");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.5);
    doc.line(0, H - FOOTER, W, H - FOOTER);
    doc.setFontSize(7.5);
    doc.setTextColor(...C.dimgray);
    doc.setFont("helvetica", "normal");
    doc.text("RestaurantIQ — Social Intelligence Report", MARGIN, H - 9);
    doc.text(
      `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      W - MARGIN, H - 9, { align: "right" }
    );
  };

  const newPage = () => {
    drawFooter();
    doc.addPage();
    drawPageBg();
    y = MARGIN;
  };

  const guard = (needed: number) => {
    if (y + needed > H - FOOTER - 16) newPage();
  };

  const sectionHeader = (title: string) => {
    guard(36);
    y += 6;
    doc.setFillColor(...C.magenta);
    doc.rect(MARGIN, y, 3, 18, "F");
    doc.setFillColor(...C.panel);
    doc.rect(MARGIN + 3, y, INNER - 3, 18, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.magenta);
    doc.text(title.toUpperCase(), MARGIN + 14, y + 12.5);
    y += 26;
  };


  // Page 1 background + header
  drawPageBg();

  const HEADER_H = 64;
  doc.setFillColor(...C.panel);
  doc.rect(0, 0, W, HEADER_H, "F");
  doc.setFillColor(...C.border);
  doc.rect(0, HEADER_H, W, 1, "F");

  // Logo
  doc.setFillColor(...C.magenta);
  doc.roundedRect(MARGIN, 14, 36, 36, 6, 6, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("R", MARGIN + 18, 38, { align: "center" });

  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("RestaurantIQ", MARGIN + 46, 33);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.dimgray);
  doc.text("Social Intelligence Report", MARGIN + 46, 47);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.magenta);
  doc.text("SOCIAL INTELLIGENCE", W - MARGIN, 30, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.dimgray);
  doc.text(
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    W - MARGIN, 44, { align: "right" }
  );

  y = HEADER_H + 20;

  // Hero card — dynamic height based on summary
  const scoreColor: [number,number,number] =
    data.overall_social_score >= 75 ? C.green :
    data.overall_social_score >= 50 ? C.amber : C.coral;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(safe(data.summary), INNER - 160);
  const heroH = Math.max(88, summaryLines.length * 11 + 62);

  doc.setFillColor(...C.panel);
  doc.roundedRect(MARGIN, y, INNER, heroH, 8, 8, "F");
  doc.setDrawColor(...C.magenta);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, INNER, heroH, 8, 8, "S");

  doc.setFillColor(...C.card);
  doc.circle(MARGIN + 52, y + heroH / 2, 32, "F");
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...scoreColor);
  doc.text(String(data.overall_social_score), MARGIN + 52, y + heroH / 2 + 6, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(...C.dimgray);
  doc.text("/100", MARGIN + 52, y + heroH / 2 + 18, { align: "center" });

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.magenta);
  doc.text(data.social_grade || "—", MARGIN + 110, y + heroH / 2 + 8);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text(safe(data.restaurant_name), MARGIN + 140, y + 24);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.dimgray);
  doc.text(`${safe(data.city)}  ${data.analysis_date}`, MARGIN + 140, y + 36);
  doc.setFontSize(8);
  doc.setTextColor(...C.gray);
  doc.text(summaryLines, MARGIN + 140, y + 50);

  y += heroH + 16;

  // Instagram & TikTok presence
  sectionHeader("Your Social Presence");
  const ig = data.own_presence?.instagram;
  const tt = data.own_presence?.tiktok;

  const halfW = (INNER / 2) - 6;
  const cardTextW = halfW - 16;

  const drawPresenceCard = (
    handle: string, platform: "Instagram" | "TikTok",
    line2: string, working: string, missing: string,
    xPos: number, color: [number,number,number]
  ) => {
    doc.setFontSize(7.5);
    const wLines = doc.splitTextToSize(`Working: ${safe(working)}`, cardTextW);
    const mLines = doc.splitTextToSize(`Missing: ${safe(missing)}`, cardTextW);
    const statLines = doc.splitTextToSize(safe(line2), cardTextW);
    const cardH = 16 + statLines.length * 11 + 8 + wLines.length * 10 + 6 + mLines.length * 10 + 10;
    guard(cardH + 4);
    doc.setFillColor(...C.card);
    doc.roundedRect(xPos, y, halfW, cardH, 6, 6, "F");
    doc.setFillColor(...color);
    doc.rect(xPos, y, halfW, 3, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(`${platform}  @${safe(handle)}`, xPos + 8, y + 16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    doc.text(statLines, xPos + 8, y + 28);
    let cy = y + 28 + statLines.length * 11 + 6;
    doc.setFontSize(7.5);
    doc.setTextColor(...C.dimgray);
    doc.text(wLines, xPos + 8, cy);
    cy += wLines.length * 10 + 6;
    doc.setTextColor(...C.coral);
    doc.text(mLines, xPos + 8, cy);
    return cardH;
  };

  let igH = 0, ttH = 0;
  const rowY = y;
  if (ig) {
    igH = drawPresenceCard(
      ig.handle, "Instagram",
      `Followers: ${ig.followers}  |  Engagement: ${ig.estimated_engagement_rate}  |  ${ig.posting_frequency}  |  ${ig.growth_trend}`,
      ig.what_is_working, ig.what_is_missing,
      MARGIN, C.magenta
    );
  }
  y = rowY;
  if (tt) {
    ttH = drawPresenceCard(
      tt.handle, "TikTok",
      `Followers: ${tt.followers}  |  Avg Views: ${tt.estimated_avg_views}  |  ${tt.posting_frequency}  |  ${tt.growth_trend}`,
      tt.what_is_working, tt.what_is_missing,
      MARGIN + halfW + 12, C.pink
    );
  }
  y = rowY + Math.max(igH, ttH) + 10;

  // Competitors
  if (data.competitor_analysis?.length) {
    sectionHeader("Competitor Analysis");
    data.competitor_analysis.forEach((c) => {
      const tc: [number,number,number] = c.threat_level === "high" ? C.coral : c.threat_level === "medium" ? C.amber : C.green;
      doc.setFontSize(7.5);
      const statLine = doc.splitTextToSize(
        `IG: ${c.instagram_followers}  |  TT: ${c.tiktok_followers}  |  Reach: ${c.estimated_monthly_reach || "unknown"}/mo  |  Threat: ${(c.threat_level || "").toUpperCase()}`,
        INNER - 24
      );
      const insightLines = doc.splitTextToSize(c.key_strategic_insight || "", INNER - 24);
      const oppLines = doc.splitTextToSize(`Opportunity: ${c.opportunity_to_steal_audience || ""}`, INNER - 24);
      const cardH = 18 + statLine.length * 10 + insightLines.length * 10 + oppLines.length * 10 + 20;
      guard(cardH + 6);
      doc.setFillColor(...C.card);
      doc.roundedRect(MARGIN, y, INNER, cardH, 6, 6, "F");
      doc.setFillColor(...tc);
      doc.rect(MARGIN, y, 3, cardH, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.white);
      doc.text(c.name || "Competitor", MARGIN + 12, y + 14);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.dimgray);
      let cy = y + 26;
      doc.text(statLine, MARGIN + 12, cy);
      cy += statLine.length * 10 + 6;
      doc.setTextColor(...C.gray);
      doc.text(insightLines, MARGIN + 12, cy);
      cy += insightLines.length * 10 + 6;
      doc.setTextColor(...C.teal);
      doc.text(oppLines, MARGIN + 12, cy);
      y += cardH + 8;
    });
  }

  // Viral Content Intelligence
  const vi = data.viral_content_intelligence;
  if (vi) {
    newPage();
    sectionHeader("Viral Content Intelligence");

    // Trending formats
    (vi.trending_formats_right_now || []).forEach((f) => {
      const nameL = doc.splitTextToSize(safe(f.format_name), INNER - 100);
      const howL  = doc.splitTextToSize(safe(f.how_to_apply_to_restaurant), INNER - 16);
      const whyL  = doc.splitTextToSize(safe(f.why_algorithm_loves_it), INNER - 16);
      const cardH = nameL.length * 11 + howL.length * 10 + whyL.length * 10 + 28;
      guard(cardH + 6);
      doc.setFillColor(...C.card);
      doc.roundedRect(MARGIN, y, INNER, cardH, 6, 6, "F");
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.magenta);
      doc.text(nameL, MARGIN + 8, y + 14);
      const diffColor: [number,number,number] = f.difficulty === "easy" ? C.green : f.difficulty === "moderate" ? C.amber : C.coral;
      doc.setFontSize(7);
      doc.setTextColor(...diffColor);
      doc.text((f.difficulty || "").toUpperCase(), W - MARGIN - 8, y + 14, { align: "right" });
      doc.setFontSize(7);
      doc.setTextColor(...C.teal);
      doc.text(safe(f.estimated_reach_potential), W - MARGIN - 8, y + 24, { align: "right" });
      let cy = y + nameL.length * 11 + 14;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.dimgray);
      doc.text(whyL, MARGIN + 8, cy);
      cy += whyL.length * 10 + 4;
      doc.setTextColor(...C.teal);
      doc.text(howL, MARGIN + 8, cy);
      y += cardH + 6;
    });

    // Hashtags
    sectionHeader("Recommended Hashtags");
    const ht = vi.trending_hashtags;
    if (ht) {
      const allTags = [
        ...(ht.mega_tags || []).map(t => `#${t}`),
        ...(ht.macro_tags || []).map(t => `#${t}`),
        ...(ht.niche_halal_tags || []).map(t => `#${t}`),
        ...(ht.location_tags || []).map(t => `#${t}`),
      ];
      const tagLine = doc.splitTextToSize(allTags.join("  "), INNER - 16);
      const mixLine = doc.splitTextToSize(`Strategy: ${safe(ht.recommended_mix)}`, INNER - 16);
      const tagCardH = tagLine.length * 11 + mixLine.length * 11 + 24;
      guard(tagCardH + 6);
      doc.setFillColor(...C.card);
      doc.roundedRect(MARGIN, y, INNER, tagCardH, 6, 6, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.magenta);
      doc.text(tagLine, MARGIN + 8, y + 14);
      doc.setTextColor(...C.dimgray);
      doc.text(mixLine, MARGIN + 8, y + 14 + tagLine.length * 11 + 6);
      y += tagCardH + 8;
    }

    // Best posting times
    const pt = vi.best_posting_times;
    if (pt) {
      guard(60);
      doc.setFillColor(...C.card);
      doc.roundedRect(MARGIN, y, INNER, 52, 6, 6, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.magenta);
      doc.text("BEST POSTING TIMES", MARGIN + 8, y + 14);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(`Instagram: Weekday ${safe(pt.instagram_weekday)}  |  Weekend ${safe(pt.instagram_weekend)}`, MARGIN + 8, y + 28);
      doc.text(`TikTok:    Weekday ${safe(pt.tiktok_weekday)}  |  Weekend ${safe(pt.tiktok_weekend)}`, MARGIN + 8, y + 40);
      if (pt.ramadan_special) {
        doc.setTextColor(...C.amber);
        doc.text(`Ramadan: ${safe(pt.ramadan_special)}`, MARGIN + 8, y + 52);
      }
      y += 62;
    }

    // Algorithm insights
    if ((vi.algorithm_insights || []).length) {
      guard(30);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.dimgray);
      doc.text("ALGORITHM INSIGHTS", MARGIN, y);
      y += 14;
      vi.algorithm_insights.forEach((ins) => {
        const l = doc.splitTextToSize(`• ${safe(ins)}`, INNER - 16);
        guard(l.length * 10 + 4);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.gray);
        doc.text(l, MARGIN + 8, y);
        y += l.length * 10 + 4;
      });
      y += 6;
    }
  }

  // Sentiment Analysis
  const sent = data.sentiment_analysis;
  if (sent) {
    sectionHeader("Sentiment Analysis");
    guard(50);
    doc.setFillColor(...C.card);
    doc.roundedRect(MARGIN, y, INNER, 44, 6, 6, "F");
    const sentColor = (s: string): [number,number,number] =>
      s === "very positive" || s === "positive" ? C.green : s === "mixed" ? C.amber : s === "negative" ? C.coral : C.dimgray;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...sentColor(sent.instagram_sentiment));
    doc.text(`Instagram: ${safe(sent.instagram_sentiment)}`, MARGIN + 8, y + 16);
    doc.setTextColor(...sentColor(sent.tiktok_sentiment));
    doc.text(`TikTok: ${safe(sent.tiktok_sentiment)}`, MARGIN + 8, y + 32);
    doc.setTextColor(...C.green);
    doc.text("POSITIVE THEMES", MARGIN + INNER / 2, y + 16);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    doc.text((sent.positive_themes || []).map(t => safe(t)).join("  |  "), MARGIN + INNER / 2, y + 28);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.coral);
    doc.text("NEGATIVE THEMES", MARGIN + INNER / 2, y + 16 + 20);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    doc.text((sent.negative_themes || []).map(t => safe(t)).join("  |  "), MARGIN + INNER / 2, y + 16 + 32);
    y += 52;

    // Customer language & viral phrases
    const langLines = doc.splitTextToSize(`Customer language: ${(sent.customer_language_patterns || []).map(safe).join(", ")}`, INNER);
    const phraseLines = doc.splitTextToSize(`Viral trigger phrases: ${(sent.viral_trigger_phrases || []).map(safe).join(", ")}`, INNER);
    const oppLines2 = doc.splitTextToSize(`Opportunity: ${safe(sent.sentiment_opportunity)}`, INNER);
    const sentH = langLines.length * 10 + phraseLines.length * 10 + oppLines2.length * 10 + 20;
    guard(sentH);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.dimgray);
    doc.text(langLines, MARGIN, y);
    y += langLines.length * 10 + 4;
    doc.text(phraseLines, MARGIN, y);
    y += phraseLines.length * 10 + 4;
    doc.setTextColor(...C.teal);
    doc.text(oppLines2, MARGIN, y);
    y += oppLines2.length * 10 + 10;
  }

  // Viral Opportunity
  if (data.viral_opportunity) {
    newPage();
    sectionHeader("Your Biggest Viral Opportunity");
    const vo = data.viral_opportunity;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const headLines = doc.splitTextToSize(safe(vo.headline), INNER - 20);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(safe(vo.opportunity_description), INNER - 20);
    const whyLines = doc.splitTextToSize(safe(vo.why_right_now), INNER - 20);
    const cardH = headLines.length * 14 + descLines.length * 11 + whyLines.length * 11 + 50;
    guard(cardH);
    doc.setFillColor(...C.panel);
    doc.roundedRect(MARGIN, y, INNER, cardH, 6, 6, "F");
    doc.setFillColor(...C.magenta);
    doc.rect(MARGIN, y, 4, cardH, "F");
    let cy = y + 16;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.magenta);
    doc.text(headLines, MARGIN + 12, cy);
    cy += headLines.length * 14 + 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    doc.text(descLines, MARGIN + 12, cy);
    cy += descLines.length * 11 + 8;
    doc.setTextColor(...C.teal);
    doc.text(whyLines, MARGIN + 12, cy);
    cy += whyLines.length * 11 + 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.green);
    doc.text(`Est. Reach: ${safe(vo.estimated_reach_if_executed)}`, MARGIN + 12, cy);
    y += cardH + 10;
    vo.exact_steps?.forEach((step, i) => {
      guard(22);
      doc.setFillColor(...C.magenta);
      doc.circle(MARGIN + 8, y + 6, 7, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.white);
      doc.text(String(i + 1), MARGIN + 8, y + 9, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      const sl = doc.splitTextToSize(safe(step), INNER - 28);
      doc.text(sl, MARGIN + 22, y + 9);
      y += Math.max(sl.length * 11, 18);
    });
  }

  // Content Calendar
  if (data.content_calendar?.length) {
    newPage();
    sectionHeader("4-Week Content Calendar");
    const colW = [30, 60, 70, 90, 220, 60];
    const headers = ["Wk", "Day", "Platform", "Type", "Hook", "Viral"];
    guard(20);
    doc.setFillColor(...C.panel);
    doc.rect(MARGIN, y, INNER, 16, "F");
    let cx = MARGIN + 4;
    headers.forEach((h, i) => {
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.dimgray);
      doc.text(h, cx, y + 11);
      cx += colW[i];
    });
    y += 18;
    data.content_calendar.forEach((item) => {
      const vpColor: [number,number,number] = item.viral_potential === "high" ? C.magenta : item.viral_potential === "medium" ? C.amber : C.dimgray;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      // Pre-calculate wrapped hook to determine row height
      const hookLines = doc.splitTextToSize(item.hook || "", colW[4] - 6);
      const rowH = Math.max(hookLines.length * 10 + 8, 16);
      guard(rowH + 2);
      const rowBg: [number,number,number] = item.platform === "Instagram" ? [22,15,35] : item.platform === "TikTok" ? [25,12,22] : [22,22,15];
      doc.setFillColor(...rowBg);
      doc.rect(MARGIN, y, INNER, rowH, "F");
      cx = MARGIN + 4;
      const cells: { text: string; color: [number,number,number]; wrap: boolean }[] = [
        { text: String(item.week),            color: C.gray,    wrap: false },
        { text: item.day || "",               color: C.gray,    wrap: false },
        { text: item.platform || "",          color: item.platform === "Instagram" ? C.magenta : C.pink, wrap: false },
        { text: item.content_type || "",      color: C.dimgray, wrap: false },
        { text: item.hook || "",              color: C.gray,    wrap: true  },
        { text: item.viral_potential || "",   color: vpColor,   wrap: false },
      ];
      cells.forEach((cell, i) => {
        doc.setTextColor(...cell.color);
        if (cell.wrap) {
          const wl = doc.splitTextToSize(cell.text, colW[i] - 6);
          doc.text(wl, cx, y + 9);
        } else {
          const t = doc.splitTextToSize(cell.text, colW[i] - 6)[0] || "";
          doc.text(t, cx, y + 9);
        }
        cx += colW[i];
      });
      y += rowH + 2;
    });
    y += 10;
  }

  // Quick Wins
  if (data.quick_wins?.length) {
    sectionHeader("Quick Wins");
    data.quick_wins.forEach((w) => {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      const aLines = doc.splitTextToSize(safe(w.action), INNER - 130);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      const impactLines = doc.splitTextToSize(safe(w.estimated_impact), INNER - 24);
      const cardH = aLines.length * 12 + impactLines.length * 10 + 22;
      guard(cardH + 6);
      doc.setFillColor(...C.card);
      doc.roundedRect(MARGIN, y, INNER, cardH, 4, 4, "F");
      if (w.do_today) {
        doc.setFillColor(...C.magenta);
        doc.rect(MARGIN, y, INNER, 3, "F");
      }
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.white);
      doc.text(aLines, MARGIN + 8, y + 14);
      if (w.do_today) {
        doc.setFontSize(7);
        doc.setTextColor(...C.magenta);
        doc.text("DO TODAY", W - MARGIN - 6, y + 14, { align: "right" });
        if (w.zero_cost) {
          doc.setTextColor(...C.green);
          doc.text("ZERO COST", W - MARGIN - 6, y + 24, { align: "right" });
        }
      }
      const impactY = y + aLines.length * 12 + 14;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.green);
      doc.text(impactLines, MARGIN + 8, impactY);
      y += cardH + 6;
    });
  }

  // Growth Roadmap
  const rm = data.growth_roadmap;
  if (rm) {
    sectionHeader("90-Day Growth Roadmap");
    const colW2 = (INNER - 20) / 3;
    const milestones = [
      { label: "30 DAYS", data: rm.days_30, color: C.teal },
      { label: "60 DAYS", data: rm.days_60, color: C.amber },
      { label: "90 DAYS", data: rm.days_90, color: C.magenta },
    ];
    // Pre-calculate max card height across all 3 columns
    let maxCardH = 0;
    milestones.forEach(({ data: d }) => {
      doc.setFontSize(7.5);
      const goalL = doc.splitTextToSize(safe(d?.goal), colW2 - 16);
      const actionsH = (d?.key_actions || []).reduce((sum, a) => {
        return sum + doc.splitTextToSize(`- ${safe(a)}`, colW2 - 16).length * 10;
      }, 0);
      const h = goalL.length * 11 + actionsH + 56;
      if (h > maxCardH) maxCardH = h;
    });
    guard(maxCardH + 10);
    milestones.forEach(({ label, data: d, color }, i) => {
      const x = MARGIN + i * (colW2 + 10);
      doc.setFillColor(...C.card);
      doc.roundedRect(x, y, colW2, maxCardH, 6, 6, "F");
      doc.setFillColor(...color);
      doc.rect(x, y, colW2, 3, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      doc.text(label, x + 8, y + 16);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.white);
      const goalLines = doc.splitTextToSize(safe(d?.goal), colW2 - 16);
      doc.text(goalLines, x + 8, y + 28);
      let cy = y + 28 + goalLines.length * 11 + 4;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      doc.text(safe(d?.follower_target), x + 8, cy + 12);
      cy += 20;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.dimgray);
      (d?.key_actions || []).forEach((a) => {
        const al = doc.splitTextToSize(`- ${safe(a)}`, colW2 - 16);
        doc.text(al, x + 8, cy);
        cy += al.length * 10 + 2;
      });
    });
    y += maxCardH + 10;
  }

  drawFooter();
  return doc;
}
