export function buildHTMLReport(data: any, module: string): string {
  const scoreColor = (score: number, max = 100) => {
    const pct = (score / max) * 100;
    if (pct >= 75) return "#22C55E";
    if (pct >= 50) return "#FFB547";
    return "#FF4D6D";
  };

  const threatColor = (t: string) => {
    if (t === "high") return { bg: "rgba(255,77,109,0.1)", text: "#FF4D6D" };
    if (t === "medium") return { bg: "rgba(255,181,71,0.1)", text: "#FFB547" };
    return { bg: "rgba(34,197,94,0.1)", text: "#22C55E" };
  };

  const scoreCircle = (score: number) => {
    const color = scoreColor(score);
    const circ = 2 * Math.PI * 30;
    const dash = (score / 100) * circ;
    return `
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="30" fill="none" stroke="#232F4A" stroke-width="6"/>
        <circle cx="40" cy="40" r="30" fill="none" stroke="${color}" stroke-width="6"
          stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ / 4}"
          stroke-linecap="round" transform="rotate(-90 40 40)"/>
        <text x="40" y="38" text-anchor="middle" fill="${color}" font-size="18" font-weight="700" font-family="Arial">${score}</text>
        <text x="40" y="52" text-anchor="middle" fill="#8B9BB4" font-size="10" font-family="Arial">/100</text>
      </svg>
    `;
  };

  const barRow = (label: string, score: number, value?: string) => {
    const color = scoreColor(score, 10);
    const pct = (score / 10) * 100;
    return `
      <div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#CBD5E1;font-size:13px;">${label}</span>
          <span style="color:${color};font-size:13px;font-weight:600;">${score}/10${value ? ` — ${value}` : ""}</span>
        </div>
        <div style="background:#232F4A;height:6px;border-radius:3px;overflow:hidden;">
          <div style="background:${color};width:${pct}%;height:100%;border-radius:3px;"></div>
        </div>
      </div>
    `;
  };

  let body = "";

  if (module === "location") {
    const verdictColors: Record<string, string> = {
      "GO": "#22C55E",
      "PROCEED WITH CAUTION": "#FFB547",
      "NO-GO": "#FF4D6D",
    };
    const vc = verdictColors[data.verdict] || "#8B9BB4";

    body = `
      <div style="display:flex;align-items:center;gap:24px;margin-bottom:24px;padding:20px;background:#1A2540;border-radius:12px;">
        ${scoreCircle(data.overall_score)}
        <div>
          <div style="color:#FF6B35;font-size:13px;font-weight:600;text-transform:uppercase;margin-bottom:4px;">${data.concept}</div>
          <h2 style="color:white;margin:0 0 6px;font-size:22px;">${data.location_name || data.location}</h2>
          <span style="background:${vc}22;color:${vc};padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700;">${data.verdict}</span>
          <p style="color:#CBD5E1;margin:8px 0 0;font-size:13px;">${data.verdict_reason}</p>
        </div>
      </div>

      <h3 style="color:white;margin:0 0 12px;font-size:16px;">Factor Analysis</h3>
      <div style="background:#1A2540;padding:16px;border-radius:12px;margin-bottom:20px;">
        ${(data.factors || []).map((f: any) => barRow(f.name, f.score, f.value)).join("")}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="background:#1A2540;padding:16px;border-radius:12px;">
          <h4 style="color:#22C55E;margin:0 0 10px;font-size:14px;">Key Strengths</h4>
          ${(data.key_strengths || []).map((s: string) => `<div style="color:#CBD5E1;font-size:13px;margin-bottom:6px;display:flex;gap:6px;"><span style="color:#22C55E;">✓</span>${s}</div>`).join("")}
        </div>
        <div style="background:#1A2540;padding:16px;border-radius:12px;">
          <h4 style="color:#FF4D6D;margin:0 0 10px;font-size:14px;">Key Risks</h4>
          ${(data.key_risks || []).map((r: string) => `<div style="color:#CBD5E1;font-size:13px;margin-bottom:6px;display:flex;gap:6px;"><span style="color:#FF4D6D;">⚠</span>${r}</div>`).join("")}
        </div>
      </div>

      <h3 style="color:white;margin:0 0 12px;font-size:16px;">Nearby Competitors</h3>
      <div style="margin-bottom:20px;">
        ${(data.competitors_nearby || []).map((c: any) => {
          const tc = threatColor(c.threat);
          return `<div style="background:#1A2540;padding:14px;border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="color:white;font-weight:600;font-size:14px;">${c.name}</div>
              <div style="color:#8B9BB4;font-size:12px;">${c.type} · ${c.distance} · ⭐ ${c.rating}</div>
            </div>
            <span style="background:${tc.bg};color:${tc.text};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;">${c.threat} threat</span>
          </div>`;
        }).join("")}
      </div>

      <h3 style="color:white;margin:0 0 12px;font-size:16px;">Alternative Locations</h3>
      <div style="margin-bottom:20px;">
        ${(data.alternative_locations || []).map((a: any, i: number) => `
          <div style="background:#1A2540;padding:14px;border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="color:#7C6FFF;font-weight:600;font-size:14px;">#${i+1} ${a.name}</div>
              <div style="color:#8B9BB4;font-size:12px;">${a.reason}</div>
            </div>
            <div style="color:${scoreColor(a.score)};font-weight:700;font-size:18px;">${a.score}</div>
          </div>
        `).join("")}
      </div>

      <div style="background:#1A2540;padding:16px;border-radius:12px;">
        <h3 style="color:white;margin:0 0 8px;font-size:16px;">Strategic Summary</h3>
        <p style="color:#CBD5E1;margin:0;font-size:14px;line-height:1.6;">${data.strategic_summary}</p>
      </div>
    `;
  } else if (module === "reviews") {
    body = `
      <div style="display:flex;align-items:center;gap:24px;margin-bottom:24px;padding:20px;background:#1A2540;border-radius:12px;">
        ${scoreCircle(data.overall_score)}
        <div>
          <h2 style="color:white;margin:0 0 6px;font-size:22px;">${data.restaurant_name}</h2>
          <div style="color:#8B9BB4;font-size:13px;">${data.location}</div>
          <div style="color:#FFB547;font-size:14px;margin-top:6px;">⭐ ${data.average_rating}/5 · ${data.total_reviews_found} reviews found</div>
        </div>
      </div>

      <h3 style="color:white;margin:0 0 12px;font-size:16px;">Sentiment Analysis</h3>
      <div style="background:#1A2540;padding:16px;border-radius:12px;margin-bottom:20px;">
        ${(data.sentiment_categories || []).map((c: any) => `
          ${barRow(c.category, c.score)}
          <div style="color:#8B9BB4;font-size:12px;margin-top:-8px;margin-bottom:14px;">${c.summary}</div>
        `).join("")}
      </div>

      <h3 style="color:white;margin:0 0 12px;font-size:16px;">Top Praised Items</h3>
      <div style="margin-bottom:20px;">
        ${(data.top_praised || []).map((p: any) => `
          <div style="background:#1A2540;padding:14px;border-radius:10px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="color:#00C9A7;font-weight:600;">${p.item}</span>
              <span style="color:#8B9BB4;font-size:12px;">${p.mentions} mentions</span>
            </div>
            <p style="color:#CBD5E1;font-size:13px;margin:0;font-style:italic;">"${p.quote}"</p>
          </div>
        `).join("")}
      </div>

      <h3 style="color:white;margin:0 0 12px;font-size:16px;">Urgent Issues</h3>
      <div style="margin-bottom:20px;">
        ${(data.urgent_issues || []).map((issue: any) => {
          const tc = threatColor(issue.severity);
          return `<div style="background:#1A2540;padding:14px;border-radius:10px;margin-bottom:8px;border-left:3px solid ${tc.text};">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="color:white;font-weight:600;">${issue.issue}</span>
              <span style="background:${tc.bg};color:${tc.text};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">${issue.severity?.toUpperCase()}</span>
            </div>
            <div style="color:#8B9BB4;font-size:12px;">Frequency: ${issue.frequency}</div>
            <div style="color:#CBD5E1;font-size:13px;margin-top:4px;">Fix: ${issue.fix}</div>
            <div style="color:#FF4D6D;font-size:12px;margin-top:4px;">Revenue Impact: ${issue.revenue_impact}</div>
          </div>`;
        }).join("")}
      </div>

      <h3 style="color:white;margin:0 0 12px;font-size:16px;">Action Plan</h3>
      <div style="margin-bottom:20px;">
        ${(data.improvement_actions || []).map((a: any, i: number) => {
          const tc = threatColor(a.priority === "high" ? "high" : a.priority === "medium" ? "medium" : "low");
          return `<div style="background:#1A2540;padding:14px;border-radius:10px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
              <span style="background:#FF6B35;color:white;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">${i+1}</span>
              <span style="color:white;font-weight:600;">${a.action}</span>
              <span style="background:${tc.bg};color:${tc.text};padding:2px 8px;border-radius:12px;font-size:11px;">${a.priority}</span>
            </div>
            <div style="color:#8B9BB4;font-size:12px;padding-left:32px;">Impact: ${a.impact} · Effort: ${a.effort}</div>
          </div>`;
        }).join("")}
      </div>

      <div style="background:#1A2540;padding:16px;border-radius:12px;">
        <h3 style="color:white;margin:0 0 8px;font-size:16px;">Summary</h3>
        <p style="color:#CBD5E1;margin:0;font-size:14px;line-height:1.6;">${data.summary}</p>
      </div>
    `;
  } else if (module === "competitors") {
    body = `
      <div style="display:flex;align-items:center;gap:24px;margin-bottom:24px;padding:20px;background:#1A2540;border-radius:12px;">
        ${scoreCircle(data.opportunity_score)}
        <div>
          <div style="color:#FF6B35;font-size:13px;font-weight:600;text-transform:uppercase;margin-bottom:4px;">${data.concept} · ${data.radius_miles}mi radius</div>
          <h2 style="color:white;margin:0 0 6px;font-size:22px;">${data.location}</h2>
          <span style="background:#7C6FFF22;color:#7C6FFF;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700;">Market Saturation: ${data.market_saturation?.toUpperCase()}</span>
        </div>
      </div>

      <h3 style="color:white;margin:0 0 12px;font-size:16px;">Competitors</h3>
      <div style="margin-bottom:20px;">
        ${(data.competitors || []).map((c: any) => {
          const tc = threatColor(c.threat_level);
          return `<div style="background:#1A2540;padding:14px;border-radius:10px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <div>
                <div style="color:white;font-weight:600;">${c.name}</div>
                <div style="color:#8B9BB4;font-size:12px;">${c.address} · ${c.distance}</div>
              </div>
              <span style="background:${tc.bg};color:${tc.text};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">${c.threat_level?.toUpperCase()} THREAT</span>
            </div>
            <div style="display:flex;gap:16px;font-size:12px;color:#8B9BB4;">
              <span>⭐ ${c.rating}</span>
              <span>${c.price_range}</span>
              ${c.halal ? '<span style="color:#22C55E;">✓ Halal</span>' : ""}
              <span>${c.review_count} reviews</span>
            </div>
            ${c.weaknesses?.length ? `<div style="margin-top:6px;color:#FF4D6D;font-size:12px;">Weaknesses: ${c.weaknesses.join(" · ")}</div>` : ""}
          </div>`;
        }).join("")}
      </div>

      <h3 style="color:white;margin:0 0 12px;font-size:16px;">Market Gaps</h3>
      <div style="margin-bottom:20px;">
        ${(data.market_gaps || []).map((g: any) => `
          <div style="background:#1A2540;padding:14px;border-radius:10px;margin-bottom:8px;border-left:3px solid #7C6FFF;">
            <div style="color:#7C6FFF;font-weight:600;margin-bottom:4px;">${g.gap} <span style="font-size:11px;background:#7C6FFF22;padding:2px 8px;border-radius:12px;">${g.size}</span></div>
            <div style="color:#CBD5E1;font-size:13px;">${g.opportunity}</div>
          </div>
        `).join("")}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="background:#1A2540;padding:16px;border-radius:12px;">
          <div style="color:#FF4D6D;font-size:12px;margin-bottom:6px;">BIGGEST THREAT</div>
          <p style="color:#CBD5E1;margin:0;font-size:13px;">${data.biggest_threat}</p>
        </div>
        <div style="background:#1A2540;padding:16px;border-radius:12px;">
          <div style="color:#22C55E;font-size:12px;margin-bottom:6px;">BIGGEST OPPORTUNITY</div>
          <p style="color:#CBD5E1;margin:0;font-size:13px;">${data.biggest_opportunity}</p>
        </div>
      </div>

      <div style="background:#1A2540;padding:16px;border-radius:12px;margin-bottom:16px;">
        <h3 style="color:white;margin:0 0 8px;font-size:16px;">Positioning Advice</h3>
        <p style="color:#CBD5E1;margin:0;font-size:14px;line-height:1.6;">${data.positioning_advice}</p>
      </div>
      <div style="background:#1A2540;padding:16px;border-radius:12px;">
        <h3 style="color:white;margin:0 0 8px;font-size:16px;">Delivery Landscape</h3>
        <p style="color:#CBD5E1;margin:0;font-size:14px;line-height:1.6;">${data.delivery_landscape}</p>
      </div>
    `;
  }

  return `
    <div style="font-family:Arial,sans-serif;color:#CBD5E1;background:#0B1120;padding:0;">
      ${body}
    </div>
  `;
}
