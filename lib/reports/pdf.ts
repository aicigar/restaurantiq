import { jsPDF } from "jspdf";

export function buildPDFReport(data: any, module: string): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = 0;

  const orange = [255, 107, 53] as [number, number, number];
  const dark = [11, 17, 32] as [number, number, number];
  const mid = [26, 37, 64] as [number, number, number];
  const light = [203, 213, 225] as [number, number, number];
  const white = [255, 255, 255] as [number, number, number];

  const addPage = () => {
    doc.addPage();
    y = 40;
    // Footer
    doc.setFillColor(...dark);
    doc.rect(0, H - 30, W, 30, "F");
    doc.setFontSize(8);
    doc.setTextColor(...light);
    doc.text("RestaurantIQ — AI-Powered Restaurant Intelligence", W / 2, H - 10, { align: "center" });
  };

  const checkY = (needed: number) => {
    if (y + needed > H - 50) addPage();
  };

  const section = (title: string) => {
    checkY(30);
    doc.setFillColor(...mid);
    doc.rect(40, y, W - 80, 24, "F");
    doc.setFontSize(11);
    doc.setTextColor(...orange);
    doc.setFont("helvetica", "bold");
    doc.text(title, 52, y + 16);
    y += 34;
  };

  // Header
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 70, "F");
  doc.setFillColor(...orange);
  doc.roundedRect(40, 15, 40, 40, 6, 6, "F");
  doc.setFontSize(22);
  doc.setTextColor(...white);
  doc.setFont("helvetica", "bold");
  doc.text("R", 60, 42, { align: "center" });
  doc.setFontSize(18);
  doc.text("RestaurantIQ", 92, 38);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...light);
  doc.text("AI-Powered Restaurant Intelligence Report", 92, 54);

  // Date
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), W - 40, 54, { align: "right" });

  y = 90;

  if (module === "location") {
    // Score block
    doc.setFillColor(...mid);
    doc.roundedRect(40, y, W - 80, 80, 8, 8, "F");
    doc.setFontSize(36);
    doc.setTextColor(...orange);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.overall_score}`, 100, y + 48, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(...light);
    doc.text("/100", 100, y + 62, { align: "center" });
    doc.setFontSize(16);
    doc.setTextColor(...white);
    doc.text(data.location_name || data.location, 130, y + 26);
    doc.setFontSize(11);
    doc.setTextColor(...light);
    doc.text(data.concept, 130, y + 42);
    const verdictColors: Record<string, [number,number,number]> = {
      "GO": [34, 197, 94],
      "PROCEED WITH CAUTION": [255, 181, 71],
      "NO-GO": [255, 77, 109],
    };
    const vc = verdictColors[data.verdict] || light;
    doc.setTextColor(...vc);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(data.verdict, 130, y + 58);
    y += 100;

    section("FACTOR ANALYSIS");
    (data.factors || []).forEach((f: any) => {
      checkY(30);
      doc.setFontSize(9);
      doc.setTextColor(...light);
      doc.setFont("helvetica", "normal");
      doc.text(f.name, 52, y + 10);
      doc.text(`${f.score}/10`, W - 52, y + 10, { align: "right" });
      doc.setFillColor(35, 47, 74);
      doc.rect(52, y + 14, W - 104, 6, "F");
      const barColor: [number, number, number] = f.score >= 7 ? [34, 197, 94] : f.score >= 4 ? [255, 181, 71] : [255, 77, 109];
      doc.setFillColor(...barColor);
      doc.rect(52, y + 14, ((W - 104) * f.score) / 10, 6, "F");
      y += 28;
    });

    section("KEY STRENGTHS");
    (data.key_strengths || []).forEach((s: string) => {
      checkY(20);
      doc.setFontSize(9);
      doc.setTextColor(34, 197, 94);
      doc.text("✓", 52, y + 10);
      doc.setTextColor(...light);
      const lines = doc.splitTextToSize(s, W - 120);
      doc.text(lines, 66, y + 10);
      y += lines.length * 14 + 6;
    });

    section("KEY RISKS");
    (data.key_risks || []).forEach((r: string) => {
      checkY(20);
      doc.setFontSize(9);
      doc.setTextColor(255, 77, 109);
      doc.text("⚠", 52, y + 10);
      doc.setTextColor(...light);
      const lines = doc.splitTextToSize(r, W - 120);
      doc.text(lines, 66, y + 10);
      y += lines.length * 14 + 6;
    });

    section("NEARBY COMPETITORS");
    (data.competitors_nearby || []).forEach((c: any) => {
      checkY(36);
      doc.setFillColor(...mid);
      doc.roundedRect(52, y, W - 104, 28, 4, 4, "F");
      doc.setFontSize(9);
      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.text(c.name, 62, y + 12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...light);
      doc.text(`${c.type} · ${c.distance} · ⭐ ${c.rating}`, 62, y + 22);
      const tColors: Record<string, [number,number,number]> = { high: [255, 77, 109], medium: [255, 181, 71], low: [34, 197, 94] };
      doc.setTextColor(...(tColors[c.threat] || light));
      doc.text(`${c.threat?.toUpperCase()} THREAT`, W - 62, y + 17, { align: "right" });
      y += 36;
    });

    section("STRATEGIC SUMMARY");
    checkY(40);
    doc.setFontSize(9);
    doc.setTextColor(...light);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(data.strategic_summary || "", W - 104);
    doc.text(summaryLines, 52, y + 10);
    y += summaryLines.length * 14 + 16;

  } else if (module === "reviews") {
    doc.setFillColor(...mid);
    doc.roundedRect(40, y, W - 80, 80, 8, 8, "F");
    doc.setFontSize(36);
    doc.setTextColor(...orange);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.overall_score}`, 100, y + 48, { align: "center" });
    doc.setFontSize(16);
    doc.setTextColor(...white);
    doc.text(data.restaurant_name, 130, y + 26);
    doc.setFontSize(11);
    doc.setTextColor(...light);
    doc.text(data.location, 130, y + 42);
    doc.setTextColor(255, 181, 71);
    doc.text(`⭐ ${data.average_rating}/5 · ${data.total_reviews_found} reviews`, 130, y + 58);
    y += 100;

    section("SENTIMENT ANALYSIS");
    (data.sentiment_categories || []).forEach((c: any) => {
      checkY(30);
      doc.setFontSize(9);
      doc.setTextColor(...light);
      doc.setFont("helvetica", "normal");
      doc.text(`${c.category} (${c.positive_pct}% positive)`, 52, y + 10);
      doc.text(`${c.score}/10`, W - 52, y + 10, { align: "right" });
      doc.setFillColor(35, 47, 74);
      doc.rect(52, y + 14, W - 104, 6, "F");
      const barColor: [number, number, number] = c.score >= 7 ? [34, 197, 94] : c.score >= 4 ? [255, 181, 71] : [255, 77, 109];
      doc.setFillColor(...barColor);
      doc.rect(52, y + 14, ((W - 104) * c.score) / 10, 6, "F");
      y += 28;
    });

    section("URGENT ISSUES");
    (data.urgent_issues || []).forEach((issue: any) => {
      checkY(50);
      const sColors: Record<string, [number,number,number]> = { high: [255, 77, 109], medium: [255, 181, 71], low: [34, 197, 94] };
      doc.setFillColor(...mid);
      doc.roundedRect(52, y, W - 104, 44, 4, 4, "F");
      doc.setFontSize(9);
      doc.setTextColor(...(sColors[issue.severity] || light));
      doc.setFont("helvetica", "bold");
      doc.text(`[${issue.severity?.toUpperCase()}] ${issue.issue}`, 62, y + 12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...light);
      const fixLines = doc.splitTextToSize(`Fix: ${issue.fix}`, W - 130);
      doc.text(fixLines, 62, y + 24);
      doc.setTextColor(255, 77, 109);
      doc.text(`Revenue Impact: ${issue.revenue_impact}`, 62, y + 36);
      y += 52;
    });

    section("IMPROVEMENT ACTIONS");
    (data.improvement_actions || []).forEach((a: any, i: number) => {
      checkY(40);
      doc.setFillColor(...orange);
      doc.circle(62, y + 12, 8, "F");
      doc.setFontSize(8);
      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}`, 62, y + 15, { align: "center" });
      doc.setFontSize(9);
      doc.setTextColor(...white);
      doc.text(a.action, 78, y + 12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...light);
      doc.text(`Priority: ${a.priority} · Effort: ${a.effort}`, 78, y + 24);
      y += 36;
    });

  } else if (module === "competitors") {
    doc.setFillColor(...mid);
    doc.roundedRect(40, y, W - 80, 80, 8, 8, "F");
    doc.setFontSize(36);
    doc.setTextColor(...orange);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.opportunity_score}`, 100, y + 48, { align: "center" });
    doc.setFontSize(16);
    doc.setTextColor(...white);
    doc.text(data.location, 130, y + 26);
    doc.setFontSize(11);
    doc.setTextColor(...light);
    doc.text(`${data.concept} · ${data.radius_miles}mi radius`, 130, y + 42);
    doc.setTextColor(124, 111, 255);
    doc.text(`Market Saturation: ${data.market_saturation?.toUpperCase()}`, 130, y + 58);
    y += 100;

    section("COMPETITORS");
    (data.competitors || []).forEach((c: any) => {
      checkY(50);
      doc.setFillColor(...mid);
      doc.roundedRect(52, y, W - 104, 44, 4, 4, "F");
      doc.setFontSize(9);
      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.text(c.name, 62, y + 12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...light);
      doc.text(`${c.address} · ${c.distance}`, 62, y + 22);
      doc.text(`⭐ ${c.rating} · ${c.price_range} · ${c.review_count} reviews${c.halal ? " · Halal" : ""}`, 62, y + 32);
      const tColors: Record<string, [number,number,number]> = { high: [255, 77, 109], medium: [255, 181, 71], low: [34, 197, 94] };
      doc.setTextColor(...(tColors[c.threat_level] || light));
      doc.text(`${c.threat_level?.toUpperCase()} THREAT`, W - 62, y + 17, { align: "right" });
      y += 52;
    });

    section("POSITIONING ADVICE");
    checkY(40);
    doc.setFontSize(9);
    doc.setTextColor(...light);
    doc.setFont("helvetica", "normal");
    const posLines = doc.splitTextToSize(data.positioning_advice || "", W - 104);
    doc.text(posLines, 52, y + 10);
    y += posLines.length * 14 + 16;
  }

  // Footer on last page
  doc.setFillColor(...dark);
  doc.rect(0, H - 30, W, 30, "F");
  doc.setFontSize(8);
  doc.setTextColor(...light);
  doc.text("RestaurantIQ — AI-Powered Restaurant Intelligence", W / 2, H - 10, { align: "center" });

  return doc;
}
