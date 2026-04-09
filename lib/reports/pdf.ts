import { jsPDF } from "jspdf";

export function buildPDFReport(data: any, module: string): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── Colour palette ──────────────────────────────────────────────
  const C = {
    bg:       [8,   13,  26]  as [number,number,number],
    panel:    [15,  22,  38]  as [number,number,number],
    card:     [22,  32,  56]  as [number,number,number],
    border:   [30,  45,  74]  as [number,number,number],
    orange:   [255, 107, 53]  as [number,number,number],
    amber:    [255, 181, 71]  as [number,number,number],
    green:    [34,  197, 94]  as [number,number,number],
    coral:    [255, 77,  109] as [number,number,number],
    teal:     [0,   201, 167] as [number,number,number],
    purple:   [124, 111, 255] as [number,number,number],
    white:    [255, 255, 255] as [number,number,number],
    gray:     [220, 228, 240] as [number,number,number],
    dimgray:  [160, 175, 200] as [number,number,number],
  };

  const MARGIN = 40;
  const INNER  = W - MARGIN * 2;
  const FOOTER = 28;
  let y = 0;

  // ── Helpers ─────────────────────────────────────────────────────

  const newPage = () => {
    drawFooter();
    doc.addPage();
    drawPageBg();
    y = MARGIN;
  };

  const guard = (needed: number) => {
    if (y + needed > H - FOOTER - 16) newPage();
  };

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
    doc.text("RestaurantIQ — AI-Powered Restaurant Intelligence", MARGIN, H - 9);
    doc.text(
      `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      W - MARGIN, H - 9, { align: "right" }
    );
  };

  const sectionHeader = (title: string, accentColor: [number,number,number] = C.orange) => {
    guard(36);
    y += 6;
    // accent line left
    doc.setFillColor(...accentColor);
    doc.rect(MARGIN, y, 3, 18, "F");
    // background
    doc.setFillColor(...C.panel);
    doc.rect(MARGIN + 3, y, INNER - 3, 18, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accentColor);
    doc.text(title.toUpperCase(), MARGIN + 14, y + 12.5);
    y += 26;
  };

  const scoreBar = (label: string, pct: string, score: number, maxScore: number = 10) => {
    guard(32);
    const barW = INNER - 100;
    const fill = (score / maxScore) * barW;
    const barColor: [number,number,number] = score >= 7 ? C.green : score >= 4 ? C.amber : C.coral;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    const labelLines = doc.splitTextToSize(label, 200);
    doc.text(labelLines, MARGIN, y + 9);

    // score badge
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...barColor);
    doc.text(`${score}/${maxScore}`, W - MARGIN, y + 9, { align: "right" });

    // track
    const barY = y + (labelLines.length > 1 ? labelLines.length * 11 : 14);
    doc.setFillColor(...C.border);
    doc.roundedRect(MARGIN, barY, barW, 5, 2, 2, "F");
    // fill
    if (fill > 0) {
      doc.setFillColor(...barColor);
      doc.roundedRect(MARGIN, barY, fill, 5, 2, 2, "F");
    }
    // pct label
    if (pct) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.dimgray);
      doc.text(pct, MARGIN + barW + 6, barY + 4.5);
    }

    y += (labelLines.length > 1 ? labelLines.length * 11 : 14) + 12;
  };

  const chip = (text: string, color: [number,number,number], bgAlpha = 0.15, x: number, chipY: number) => {
    const pad = 6;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    const tw = doc.getTextWidth(text);
    doc.setFillColor(
      Math.round(color[0] + (C.panel[0] - color[0]) * (1 - bgAlpha)),
      Math.round(color[1] + (C.panel[1] - color[1]) * (1 - bgAlpha)),
      Math.round(color[2] + (C.panel[2] - color[2]) * (1 - bgAlpha)),
    );
    doc.roundedRect(x, chipY - 9, tw + pad * 2, 13, 3, 3, "F");
    doc.setTextColor(...color);
    doc.text(text, x + pad, chipY);
    return tw + pad * 2 + 6;
  };

  // ── Page 1 background ───────────────────────────────────────────
  drawPageBg();

  // ── Header bar ──────────────────────────────────────────────────
  const HEADER_H = 64;
  doc.setFillColor(...C.panel);
  doc.rect(0, 0, W, HEADER_H, "F");
  doc.setFillColor(...C.border);
  doc.rect(0, HEADER_H, W, 1, "F");

  // Logo
  doc.setFillColor(...C.orange);
  doc.roundedRect(MARGIN, 14, 36, 36, 6, 6, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("R", MARGIN + 18, 38, { align: "center" });

  // Brand
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("RestaurantIQ", MARGIN + 46, 33);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.dimgray);
  doc.text("AI-Powered Restaurant Intelligence Report", MARGIN + 46, 47);

  // Date + module badge
  const moduleLabel = module === "location" ? "Location Analysis" : module === "reviews" ? "Review Analysis" : "Competitor Analysis";
  const badgeColor = module === "location" ? C.orange : module === "reviews" ? C.teal : C.coral;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...badgeColor);
  doc.text(moduleLabel.toUpperCase(), W - MARGIN, 30, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.dimgray);
  doc.text(
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    W - MARGIN, 44, { align: "right" }
  );

  y = HEADER_H + 20;

  // ════════════════════════════════════════════════════════════════
  // LOCATION MODULE
  // ════════════════════════════════════════════════════════════════
  if (module === "location") {
    const verdictColor: Record<string, [number,number,number]> = {
      "GO": C.green,
      "PROCEED WITH CAUTION": C.amber,
      "NO-GO": C.coral,
    };
    const vc = verdictColor[data.verdict] || C.gray;

    // ── Hero card ──
    doc.setFillColor(...C.panel);
    doc.roundedRect(MARGIN, y, INNER, 90, 8, 8, "F");
    doc.setFillColor(...C.border);
    doc.roundedRect(MARGIN, y, INNER, 90, 8, 8, "S");

    // Score circle
    doc.setFillColor(...C.card);
    doc.circle(MARGIN + 52, y + 45, 34, "F");
    doc.setFillColor(...vc);
    doc.circle(MARGIN + 52, y + 45, 34, "S");
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...vc);
    doc.text(`${data.overall_score}`, MARGIN + 52, y + 40, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.dimgray);
    doc.text("/100", MARGIN + 52, y + 53, { align: "center" });

    // Text info
    const tx = MARGIN + 102;
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.white);
    const nameLines = doc.splitTextToSize(data.location_name || data.location || "", W - tx - MARGIN - 10);
    doc.text(nameLines, tx, y + 22);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    doc.text(data.concept || "", tx, y + 22 + nameLines.length * 18);

    // Verdict chip
    chip(data.verdict || "", vc, 0.2, tx, y + 22 + nameLines.length * 18 + 16);

    // Country badge
    if (data.country) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.dimgray);
      doc.text(data.country, W - MARGIN - 10, y + 22, { align: "right" });
    }

    y += 106;

    // Verdict reason
    if (data.verdict_reason) {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...C.gray);
      const vlines = doc.splitTextToSize(`"${data.verdict_reason}"`, INNER);
      doc.text(vlines, MARGIN, y);
      y += vlines.length * 13 + 10;
    }

    // ── Factor Analysis ──
    sectionHeader("Factor Analysis", C.orange);
    (data.factors || []).forEach((f: any) => {
      scoreBar(f.name, f.value ? `${f.value}` : "", f.score, 10);
      if (f.note) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.gray);
        const nlines = doc.splitTextToSize(f.note, INNER - 100);
        doc.text(nlines, MARGIN, y);
        y += nlines.length * 12 + 4;
      }
    });

    // ── Strengths & Risks side by side ──
    sectionHeader("Key Strengths & Risks", C.orange);
    const colW = (INNER - 12) / 2;
    const strengthsX = MARGIN;
    const risksX = MARGIN + colW + 12;
    let syL = y, syR = y;

    // Strengths
    (data.key_strengths || []).forEach((s: string) => {
      const lines = doc.splitTextToSize(s, colW - 18);
      const h = lines.length * 12 + 18;
      guard(h);
      doc.setFillColor(...C.card);
      doc.roundedRect(strengthsX, syL, colW, h, 4, 4, "F");
      doc.setFillColor(...C.green);
      doc.rect(strengthsX, syL, 3, h, "F");
      doc.setFontSize(9);
      doc.setTextColor(...C.green);
      doc.text("✓", strengthsX + 10, syL + 13);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(lines, strengthsX + 20, syL + 13);
      syL += h + 6;
    });

    // Risks
    (data.key_risks || []).forEach((r: string) => {
      const lines = doc.splitTextToSize(r, colW - 18);
      const h = lines.length * 12 + 18;
      guard(h);
      doc.setFillColor(...C.card);
      doc.roundedRect(risksX, syR, colW, h, 4, 4, "F");
      doc.setFillColor(...C.coral);
      doc.rect(risksX, syR, 3, h, "F");
      doc.setFontSize(9);
      doc.setTextColor(...C.coral);
      doc.text("!", risksX + 10, syR + 13);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(lines, risksX + 20, syR + 13);
      syR += h + 6;
    });
    y = Math.max(syL, syR) + 6;

    // ── Nearby Competitors ──
    sectionHeader("Nearby Competitors", C.orange);
    (data.competitors_nearby || []).forEach((c: any) => {
      const tColors: Record<string, [number,number,number]> = { high: C.coral, medium: C.amber, low: C.green };
      const tc = tColors[c.threat] || C.gray;
      guard(40);
      doc.setFillColor(...C.card);
      doc.roundedRect(MARGIN, y, INNER, 34, 4, 4, "F");
      doc.setFillColor(...tc);
      doc.rect(MARGIN, y, 3, 34, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.white);
      doc.text(c.name, MARGIN + 12, y + 13);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(`${c.type}  ·  ${c.distance}  ·  ★ ${c.rating}`, MARGIN + 12, y + 25);

      chip(`${(c.threat || "").toUpperCase()} THREAT`, tc, 0.2, W - MARGIN - 80, y + 14);
      y += 42;
    });

    // ── Alternative Locations ──
    if ((data.alternative_locations || []).length > 0) {
      sectionHeader("Alternative Locations", C.orange);
      (data.alternative_locations || []).forEach((a: any, i: number) => {
        const scoreColor: [number,number,number] = a.score >= 75 ? C.green : a.score >= 50 ? C.amber : C.coral;
        const reasonLines = doc.splitTextToSize(a.reason || "", INNER - 80);
        const h = reasonLines.length * 12 + 26;
        guard(h);
        doc.setFillColor(...C.card);
        doc.roundedRect(MARGIN, y, INNER, h, 4, 4, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.purple);
        doc.text(`#${i + 1}  ${a.name}`, MARGIN + 12, y + 14);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.gray);
        doc.text(reasonLines, MARGIN + 12, y + 26);

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...scoreColor);
        doc.text(`${a.score}`, W - MARGIN - 12, y + 20, { align: "right" });
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.dimgray);
        doc.text("/100", W - MARGIN - 12, y + 30, { align: "right" });

        y += h + 8;
      });
    }

    // ── Strategic Summary ──
    sectionHeader("Strategic Summary", C.orange);
    doc.setFillColor(...C.card);
    const sumLines = doc.splitTextToSize(data.strategic_summary || "", INNER - 24);
    const sumH = sumLines.length * 13 + 20;
    guard(sumH);
    doc.roundedRect(MARGIN, y, INNER, sumH, 4, 4, "F");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    doc.text(sumLines, MARGIN + 12, y + 14);
    y += sumH + 10;

  // ════════════════════════════════════════════════════════════════
  // REVIEWS MODULE
  // ════════════════════════════════════════════════════════════════
  } else if (module === "reviews") {

    // ── Hero card ──
    doc.setFillColor(...C.panel);
    doc.roundedRect(MARGIN, y, INNER, 90, 8, 8, "F");
    doc.setFillColor(...C.border);
    doc.roundedRect(MARGIN, y, INNER, 90, 8, 8, "S");

    // Score
    doc.setFillColor(...C.card);
    doc.circle(MARGIN + 52, y + 45, 34, "F");
    doc.setFillColor(...C.teal);
    doc.circle(MARGIN + 52, y + 45, 34, "S");
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.teal);
    doc.text(`${data.overall_score}`, MARGIN + 52, y + 40, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.dimgray);
    doc.text("/100", MARGIN + 52, y + 53, { align: "center" });

    const tx = MARGIN + 102;
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.white);
    const nameLines = doc.splitTextToSize(data.restaurant_name || "", W - tx - MARGIN - 10);
    doc.text(nameLines, tx, y + 22);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    doc.text(data.location || "", tx, y + 22 + nameLines.length * 18);

    doc.setFontSize(10);
    doc.setTextColor(...C.amber);
    doc.text(`★ ${data.average_rating}/5`, tx, y + 22 + nameLines.length * 18 + 16);
    doc.setFontSize(8.5);
    doc.setTextColor(...C.dimgray);
    doc.text(`  ·  ${data.total_reviews_found} reviews`, tx + 42, y + 22 + nameLines.length * 18 + 16);

    if (data.country) {
      doc.setFontSize(8);
      doc.setTextColor(...C.dimgray);
      doc.text(data.country, W - MARGIN - 10, y + 22, { align: "right" });
    }

    y += 106;

    // Platforms searched
    if ((data.platforms_searched || []).length > 0) {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.dimgray);
      doc.text("Platforms searched:", MARGIN, y);
      doc.setTextColor(...C.teal);
      doc.text(data.platforms_searched.join("  ·  "), MARGIN + 90, y);
      y += 18;
    }

    // ── Sentiment ──
    sectionHeader("Sentiment Analysis", C.teal);
    (data.sentiment_categories || []).forEach((c: any) => {
      scoreBar(`${c.category}`, `${c.positive_pct}% positive`, c.score, 10);
      if (c.summary) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.gray);
        const sl = doc.splitTextToSize(c.summary, INNER - 100);
        doc.text(sl, MARGIN, y);
        y += sl.length * 12 + 6;
      }
    });

    // ── Top Praised ──
    if ((data.top_praised || []).length > 0) {
      sectionHeader("Top Praised Items", C.teal);
      (data.top_praised || []).forEach((p: any) => {
        const quoteLines = doc.splitTextToSize(`"${p.quote}"`, INNER - 24);
        const h = quoteLines.length * 13 + 32;
        guard(h);
        doc.setFillColor(...C.card);
        doc.roundedRect(MARGIN, y, INNER, h, 4, 4, "F");
        doc.setFillColor(...C.teal);
        doc.rect(MARGIN, y, 3, h, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.teal);
        doc.text(p.item, MARGIN + 12, y + 14);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.dimgray);
        doc.text(`${p.mentions} mentions`, W - MARGIN - 10, y + 14, { align: "right" });

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...C.gray);
        doc.text(quoteLines, MARGIN + 12, y + 26);
        y += h + 8;
      });
    }

    // ── Urgent Issues ──
    sectionHeader("Urgent Issues", C.coral);
    (data.urgent_issues || []).forEach((issue: any) => {
      const sColors: Record<string, [number,number,number]> = { high: C.coral, medium: C.amber, low: C.green };
      const sc = sColors[issue.severity] || C.gray;

      const titleLines = doc.splitTextToSize(issue.issue || "", INNER - 100);
      const fixLines   = doc.splitTextToSize(`Fix: ${issue.fix || ""}`, INNER - 24);
      const impLines   = doc.splitTextToSize(`Revenue impact: ${issue.revenue_impact || ""}`, INNER - 24);
      const h = titleLines.length * 12 + fixLines.length * 12 + impLines.length * 12 + 36;
      guard(h);

      doc.setFillColor(...C.card);
      doc.roundedRect(MARGIN, y, INNER, h, 4, 4, "F");
      doc.setFillColor(...sc);
      doc.rect(MARGIN, y, 3, h, "F");

      // Severity chip
      chip(issue.severity?.toUpperCase() || "", sc, 0.2, MARGIN + 12, y + 14);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.white);
      doc.text(titleLines, MARGIN + 12 + doc.getTextWidth((issue.severity?.toUpperCase() || "") + "  ") + 6, y + 14);

      let iy = y + titleLines.length * 12 + 18;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(fixLines, MARGIN + 12, iy);
      iy += fixLines.length * 12 + 5;

      doc.setFont("helvetica", "italic");
      doc.setTextColor(...C.dimgray);
      doc.text(impLines, MARGIN + 12, iy);
      doc.setFontSize(7.5);
      doc.text(`Frequency: ${issue.frequency || ""}`, W - MARGIN - 10, y + 14, { align: "right" });

      y += h + 8;
    });

    // ── Improvement Actions ──
    sectionHeader("Improvement Action Plan", C.orange);
    (data.improvement_actions || []).forEach((a: any, i: number) => {
      const actionLines = doc.splitTextToSize(a.action || "", INNER - 60);
      const impLines    = doc.splitTextToSize(a.impact || "", INNER - 60);
      const h = actionLines.length * 13 + impLines.length * 12 + 30;
      guard(h);

      doc.setFillColor(...C.card);
      doc.roundedRect(MARGIN, y, INNER, h, 4, 4, "F");

      // Number circle
      doc.setFillColor(...C.orange);
      doc.circle(MARGIN + 20, y + h / 2, 10, "F");
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.white);
      doc.text(`${i + 1}`, MARGIN + 20, y + h / 2 + 3, { align: "center" });

      const ax = MARGIN + 36;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.white);
      doc.text(actionLines, ax, y + 14);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(impLines, ax, y + 14 + actionLines.length * 13 + 4);

      // Priority + Effort chips
      const priorityColor: Record<string, [number,number,number]> = { high: C.coral, medium: C.amber, low: C.green };
      const pc = priorityColor[a.priority] || C.gray;
      const chipY = y + h - 10;
      const cw1 = chip(`PRIORITY: ${(a.priority || "").toUpperCase()}`, pc, 0.2, ax, chipY);
      chip(`EFFORT: ${(a.effort || "").toUpperCase()}`, C.purple, 0.2, ax + cw1, chipY);

      y += h + 8;
    });

    // ── Summary ──
    if (data.summary) {
      sectionHeader("Summary", C.teal);
      doc.setFillColor(...C.card);
      const sumLines = doc.splitTextToSize(data.summary, INNER - 24);
      const sumH = sumLines.length * 13 + 20;
      guard(sumH);
      doc.roundedRect(MARGIN, y, INNER, sumH, 4, 4, "F");
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(sumLines, MARGIN + 12, y + 14);
      y += sumH + 10;
    }

  // ════════════════════════════════════════════════════════════════
  // COMPETITORS MODULE
  // ════════════════════════════════════════════════════════════════
  } else if (module === "competitors") {

    // ── Hero card ──
    doc.setFillColor(...C.panel);
    doc.roundedRect(MARGIN, y, INNER, 90, 8, 8, "F");
    doc.setFillColor(...C.border);
    doc.roundedRect(MARGIN, y, INNER, 90, 8, 8, "S");

    doc.setFillColor(...C.card);
    doc.circle(MARGIN + 52, y + 45, 34, "F");
    doc.setFillColor(...C.coral);
    doc.circle(MARGIN + 52, y + 45, 34, "S");
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.coral);
    doc.text(`${data.opportunity_score}`, MARGIN + 52, y + 40, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.dimgray);
    doc.text("opp.", MARGIN + 52, y + 53, { align: "center" });

    const tx = MARGIN + 102;
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.white);
    const locLines = doc.splitTextToSize(data.location || "", W - tx - MARGIN - 10);
    doc.text(locLines, tx, y + 22);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    const radius = data.radius ?? data.radius_miles ?? "";
    const unit   = data.radius_unit ?? (data.radius_miles ? "mi" : "km");
    doc.text(`${data.concept}  ·  ${radius}${unit} radius`, tx, y + 22 + locLines.length * 18);

    const satColors: Record<string, [number,number,number]> = { low: C.green, medium: C.amber, high: C.coral };
    const sc = satColors[data.market_saturation] || C.gray;
    chip(`SATURATION: ${(data.market_saturation || "").toUpperCase()}`, sc, 0.2, tx, y + 22 + locLines.length * 18 + 18);

    if (data.country) {
      doc.setFontSize(8);
      doc.setTextColor(...C.dimgray);
      doc.text(data.country, W - MARGIN - 10, y + 22, { align: "right" });
    }

    y += 106;

    // ── Competitors ──
    sectionHeader("Competitors Found", C.coral);
    (data.competitors || []).forEach((c: any) => {
      const tColors: Record<string, [number,number,number]> = { high: C.coral, medium: C.amber, low: C.green };
      const tc = tColors[c.threat_level] || C.gray;

      const reasonLines   = doc.splitTextToSize(c.threat_reason || "", INNER - 100);
      const weakStr       = (c.weaknesses || []).join("  ·  ");
      const weakLines     = weakStr ? doc.splitTextToSize(`Weaknesses: ${weakStr}`, INNER - 24) : [];
      const h = 30 + reasonLines.length * 12 + (weakLines.length ? weakLines.length * 11 + 8 : 0) + 14;
      guard(h);

      doc.setFillColor(...C.card);
      doc.roundedRect(MARGIN, y, INNER, h, 4, 4, "F");
      doc.setFillColor(...tc);
      doc.rect(MARGIN, y, 3, h, "F");

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.white);
      doc.text(c.name, MARGIN + 12, y + 14);

      chip(`${(c.threat_level || "").toUpperCase()} THREAT`, tc, 0.2, W - MARGIN - 75, y + 9);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.dimgray);
      doc.text(
        [c.address, c.distance, `★ ${c.rating}`, c.price_range, `${c.review_count} reviews`].filter(Boolean).join("  ·  "),
        MARGIN + 12, y + 26
      );

      let cy2 = y + 38;
      doc.setTextColor(...C.gray);
      doc.text(reasonLines, MARGIN + 12, cy2);
      cy2 += reasonLines.length * 12 + 5;

      if (weakLines.length) {
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...C.dimgray);
        doc.text(weakLines, MARGIN + 12, cy2);
      }

      y += h + 8;
    });

    // ── Market Gaps ──
    if ((data.market_gaps || []).length > 0) {
      sectionHeader("Market Gaps", C.purple);
      (data.market_gaps || []).forEach((g: any) => {
        const gapLines = doc.splitTextToSize(g.opportunity || "", INNER - 24);
        const h = gapLines.length * 12 + 30;
        guard(h);
        doc.setFillColor(...C.card);
        doc.roundedRect(MARGIN, y, INNER, h, 4, 4, "F");
        doc.setFillColor(...C.purple);
        doc.rect(MARGIN, y, 3, h, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.purple);
        doc.text(g.gap, MARGIN + 12, y + 14);

        const sizeColor: Record<string, [number,number,number]> = { large: C.green, medium: C.amber, small: C.gray };
        chip((g.size || "").toUpperCase(), sizeColor[g.size] || C.gray, 0.2, W - MARGIN - 60, y + 9);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.gray);
        doc.text(gapLines, MARGIN + 12, y + 26);
        y += h + 8;
      });
    }

    // ── Threat / Opportunity ──
    sectionHeader("Biggest Threat & Opportunity", C.coral);
    const colW = (INNER - 12) / 2;

    if (data.biggest_threat) {
      const tLines = doc.splitTextToSize(data.biggest_threat, colW - 20);
      const h = tLines.length * 13 + 24;
      guard(h);
      doc.setFillColor(...C.card);
      doc.roundedRect(MARGIN, y, colW, h, 4, 4, "F");
      doc.setFillColor(...C.coral);
      doc.rect(MARGIN, y, 3, h, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.coral);
      doc.text("BIGGEST THREAT", MARGIN + 10, y + 12);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(tLines, MARGIN + 10, y + 24);

      if (data.biggest_opportunity) {
        const oLines = doc.splitTextToSize(data.biggest_opportunity, colW - 20);
        const oh = Math.max(h, oLines.length * 13 + 24);
        doc.setFillColor(...C.card);
        doc.roundedRect(MARGIN + colW + 12, y, colW, oh, 4, 4, "F");
        doc.setFillColor(...C.green);
        doc.rect(MARGIN + colW + 12, y, 3, oh, "F");
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.green);
        doc.text("BIGGEST OPPORTUNITY", MARGIN + colW + 22, y + 12);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.gray);
        doc.text(oLines, MARGIN + colW + 22, y + 24);
        y += Math.max(h, oh) + 10;
      } else {
        y += h + 10;
      }
    }

    // ── Positioning Advice ──
    if (data.positioning_advice) {
      sectionHeader("Positioning Advice", C.coral);
      doc.setFillColor(...C.card);
      const posLines = doc.splitTextToSize(data.positioning_advice, INNER - 24);
      const posH = posLines.length * 13 + 20;
      guard(posH);
      doc.roundedRect(MARGIN, y, INNER, posH, 4, 4, "F");
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(posLines, MARGIN + 12, y + 14);
      y += posH + 10;
    }

    // ── Delivery Landscape ──
    if (data.delivery_landscape) {
      sectionHeader("Delivery Landscape", C.teal);
      doc.setFillColor(...C.card);
      const delLines = doc.splitTextToSize(data.delivery_landscape, INNER - 24);
      const delH = delLines.length * 13 + 20;
      guard(delH);
      doc.roundedRect(MARGIN, y, INNER, delH, 4, 4, "F");
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(delLines, MARGIN + 12, y + 14);
      y += delH + 10;
    }
  }

  // ── Footer on last page ──────────────────────────────────────────
  drawFooter();

  return doc;
}
