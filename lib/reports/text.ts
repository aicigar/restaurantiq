export function buildTextReport(data: any, module: string): string {
  const lines: string[] = [];
  const divider = "═".repeat(60);
  const subDivider = "─".repeat(60);

  lines.push(divider);
  lines.push("  RESTAURANTIQ ANALYSIS REPORT");
  lines.push(divider);
  lines.push("");

  if (module === "location") {
    lines.push(`LOCATION: ${data.location_name || data.location}`);
    lines.push(`CONCEPT:  ${data.concept}`);
    lines.push(`SCORE:    ${data.overall_score}/100`);
    lines.push(`VERDICT:  ${data.verdict}`);
    lines.push(`REASON:   ${data.verdict_reason}`);
    lines.push("");
    lines.push(subDivider);
    lines.push("FACTOR ANALYSIS");
    lines.push(subDivider);
    (data.factors || []).forEach((f: any) => {
      const bar = "█".repeat(Math.round(f.score)) + "░".repeat(10 - Math.round(f.score));
      lines.push(`${f.name.padEnd(28)} ${bar} ${f.score}/10`);
      lines.push(`  Value: ${f.value}`);
      lines.push(`  Note:  ${f.note}`);
      lines.push("");
    });
    lines.push(subDivider);
    lines.push("KEY STRENGTHS");
    lines.push(subDivider);
    (data.key_strengths || []).forEach((s: string, i: number) => {
      lines.push(`  ${i + 1}. ${s}`);
    });
    lines.push("");
    lines.push(subDivider);
    lines.push("KEY RISKS");
    lines.push(subDivider);
    (data.key_risks || []).forEach((r: string, i: number) => {
      lines.push(`  ${i + 1}. ${r}`);
    });
    lines.push("");
    lines.push(subDivider);
    lines.push("NEARBY COMPETITORS");
    lines.push(subDivider);
    (data.competitors_nearby || []).forEach((c: any) => {
      lines.push(`  ${c.name} (${c.type})`);
      lines.push(`    Distance: ${c.distance} | Rating: ${c.rating}/5 | Threat: ${c.threat?.toUpperCase()}`);
    });
    lines.push("");
    lines.push(subDivider);
    lines.push("ALTERNATIVE LOCATIONS");
    lines.push(subDivider);
    (data.alternative_locations || []).forEach((a: any, i: number) => {
      lines.push(`  ${i + 1}. ${a.name} (Score: ${a.score}/100)`);
      lines.push(`     ${a.reason}`);
    });
    lines.push("");
    lines.push(subDivider);
    lines.push("STRATEGIC SUMMARY");
    lines.push(subDivider);
    lines.push(data.strategic_summary || "");
  } else if (module === "reviews") {
    lines.push(`RESTAURANT: ${data.restaurant_name}`);
    lines.push(`LOCATION:   ${data.location}`);
    lines.push(`SCORE:      ${data.overall_score}/100`);
    lines.push(`AVG RATING: ${data.average_rating}/5`);
    lines.push(`REVIEWS:    ${data.total_reviews_found} found`);
    lines.push("");
    lines.push(subDivider);
    lines.push("SENTIMENT CATEGORIES");
    lines.push(subDivider);
    (data.sentiment_categories || []).forEach((c: any) => {
      const bar = "█".repeat(Math.round(c.score)) + "░".repeat(10 - Math.round(c.score));
      lines.push(`${c.category.padEnd(24)} ${bar} ${c.score}/10 (${c.positive_pct}% positive)`);
      lines.push(`  ${c.summary}`);
      lines.push("");
    });
    lines.push(subDivider);
    lines.push("TOP PRAISED ITEMS");
    lines.push(subDivider);
    (data.top_praised || []).forEach((p: any) => {
      lines.push(`  ${p.item} — ${p.mentions} mentions`);
      lines.push(`  "${p.quote}"`);
    });
    lines.push("");
    lines.push(subDivider);
    lines.push("URGENT ISSUES");
    lines.push(subDivider);
    (data.urgent_issues || []).forEach((issue: any, i: number) => {
      lines.push(`  ${i + 1}. [${issue.severity?.toUpperCase()}] ${issue.issue}`);
      lines.push(`     Frequency: ${issue.frequency}`);
      lines.push(`     Fix: ${issue.fix}`);
      lines.push(`     Revenue Impact: ${issue.revenue_impact}`);
    });
    lines.push("");
    lines.push(subDivider);
    lines.push("IMPROVEMENT ACTIONS");
    lines.push(subDivider);
    (data.improvement_actions || []).forEach((a: any, i: number) => {
      lines.push(`  ${i + 1}. [${a.priority?.toUpperCase()}] ${a.action}`);
      lines.push(`     Impact: ${a.impact} | Effort: ${a.effort}`);
    });
    lines.push("");
    lines.push(subDivider);
    lines.push("SUMMARY");
    lines.push(subDivider);
    lines.push(data.summary || "");
  } else if (module === "competitors") {
    lines.push(`LOCATION:    ${data.location}`);
    lines.push(`CONCEPT:     ${data.concept}`);
    lines.push(`RADIUS:      ${data.radius_miles} miles`);
    lines.push(`SATURATION:  ${data.market_saturation?.toUpperCase()}`);
    lines.push(`OPPORTUNITY: ${data.opportunity_score}/100`);
    lines.push("");
    lines.push(subDivider);
    lines.push("COMPETITORS");
    lines.push(subDivider);
    (data.competitors || []).forEach((c: any) => {
      lines.push(`  ${c.name} (${c.type})`);
      lines.push(`    Address: ${c.address}`);
      lines.push(`    Distance: ${c.distance} | Rating: ${c.rating}/5 | Price: ${c.price_range}`);
      lines.push(`    Halal: ${c.halal ? "Yes" : "No"} | Threat: ${c.threat_level?.toUpperCase()}`);
      lines.push(`    Threat Reason: ${c.threat_reason}`);
      if (c.weaknesses?.length) {
        lines.push(`    Weaknesses: ${c.weaknesses.join(", ")}`);
      }
      lines.push("");
    });
    lines.push(subDivider);
    lines.push("MARKET GAPS");
    lines.push(subDivider);
    (data.market_gaps || []).forEach((g: any, i: number) => {
      lines.push(`  ${i + 1}. [${g.size?.toUpperCase()}] ${g.gap}`);
      lines.push(`     Opportunity: ${g.opportunity}`);
    });
    lines.push("");
    lines.push(subDivider);
    lines.push("STRATEGIC INSIGHTS");
    lines.push(subDivider);
    lines.push(`Biggest Threat:      ${data.biggest_threat}`);
    lines.push(`Biggest Opportunity: ${data.biggest_opportunity}`);
    lines.push("");
    lines.push("Positioning Advice:");
    lines.push(data.positioning_advice || "");
    lines.push("");
    lines.push("Delivery Landscape:");
    lines.push(data.delivery_landscape || "");
  } else if (module === "advisor") {
    lines.push(`RESTAURANT:   ${data.restaurant_name}`);
    lines.push(`CITY:         ${data.city}`);
    lines.push(`HEALTH SCORE: ${data.overall_health_score}/100`);
    lines.push(`DATE:         ${data.analysis_date}`);
    lines.push("");
    lines.push(subDivider);
    lines.push("SUMMARY");
    lines.push(subDivider);
    lines.push(data.summary || "");
    lines.push("");
    lines.push(subDivider);
    lines.push("RANKED ACTION PLAN");
    lines.push(subDivider);
    (data.action_items || []).forEach((item: any) => {
      lines.push(`  #${item.rank} [${item.category?.toUpperCase()}] — ${item.effort?.toUpperCase()} effort`);
      lines.push(`  PROBLEM:  ${item.problem}`);
      lines.push(`  EVIDENCE: ${item.evidence}`);
      lines.push(`  FIX:      ${item.fix}`);
      lines.push(`  IMPACT:   ${item.estimated_impact}`);
      lines.push(`  WHEN:     ${item.timeframe}`);
      lines.push("");
    });
    if (data.competitor_intelligence) {
      const ci = data.competitor_intelligence;
      lines.push(subDivider);
      lines.push("COMPETITOR INTELLIGENCE");
      lines.push(subDivider);
      lines.push(`  Competitor:    ${ci.competitor_name}`);
      lines.push(`  Their Rating:  ${ci.their_rating}/5`);
      lines.push(`  Recent Trend:  ${ci.their_recent_trend}`);
      lines.push(`  Weaknesses:`);
      (ci.their_top_weaknesses || []).forEach((w: string) => lines.push(`    → ${w}`));
      lines.push(`  Your Window:   ${ci.your_window}`);
      lines.push("");
    }
    if (data.delivery_gaps?.length) {
      lines.push(subDivider);
      lines.push("DELIVERY COVERAGE GAPS");
      lines.push(subDivider);
      data.delivery_gaps.forEach((gap: any) => {
        lines.push(`  Zip: ${gap.zip_code} (${gap.distance_miles} mi)`);
        lines.push(`  Note: ${gap.population_note}`);
        lines.push(`  Est. Revenue: ${gap.estimated_monthly_revenue}`);
        lines.push(`  Action: ${gap.action}`);
        lines.push("");
      });
    }
    lines.push(subDivider);
    lines.push("QUICK WINS — DO TODAY (zero cost)");
    lines.push(subDivider);
    (data.quick_wins || []).forEach((w: string, i: number) => {
      lines.push(`  ${i + 1}. ${w}`);
    });
    lines.push("");
    if (data.suggested_responses?.length) {
      lines.push(subDivider);
      lines.push(`REVIEW RESPONSES (${data.review_response_needed} unanswered)`);
      lines.push(subDivider);
      data.suggested_responses.forEach((sr: any, i: number) => {
        lines.push(`  ${i + 1}. Reviewer said: "${sr.review_summary}"`);
        lines.push(`     Your response:`);
        lines.push(`     ${sr.suggested_response}`);
        lines.push("");
      });
    }
  }

  lines.push("");
  lines.push(divider);
  lines.push(`  Generated by RestaurantIQ — ${new Date().toLocaleDateString()}`);
  lines.push(divider);

  return lines.join("\n");
}
