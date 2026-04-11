import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaudeWithSearch } from "@/lib/anthropic";
import { checkUsageLimit } from "@/lib/usage";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const usage = await checkUsageLimit(user.id);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: "Plan limit reached. Please upgrade.", code: "PLAN_LIMIT", used: usage.used, limit: usage.limit, plan: usage.plan },
        { status: 403 }
      );
    }

    const { restaurant_name, city, competitor_name, zip_codes } = await req.json();
    if (!restaurant_name || !city) {
      return NextResponse.json({ error: "restaurant_name and city are required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const systemPrompt = `You are RestaurantIQ's AI Improvement Advisor. Generate hyper-specific ranked action items with real revenue estimates. Do a MAXIMUM of 3 web searches total, then write the JSON immediately. Return ONLY valid JSON — no markdown, no text outside the JSON.`;

    const competitorPart = competitor_name ? `Competitor to benchmark: "${competitor_name}".` : "";
    const zipPart = zip_codes ? `Check delivery gaps in zip codes: ${zip_codes}.` : "";

    const userPrompt = `Analyse "${restaurant_name}" in "${city}". ${competitorPart} ${zipPart}

Do exactly 3 web searches:
1. Search for reviews of "${restaurant_name}" in "${city}"
2. Search for ratings/reviews of "${competitor_name || "top nearby competitor"}" in "${city}"
3. Search for food delivery options near "${city}" ${zip_codes ? `zip codes ${zip_codes}` : ""}

Then immediately return this JSON (no extra searches after these 3):

{
  "restaurant_name": "${restaurant_name}",
  "city": "${city}",
  "overall_health_score": <integer 0-100>,
  "analysis_date": "<YYYY-MM-DD>",
  "data_sources": ["<what you searched>", "<what you found>"],
  "summary": "<2-3 sentences: overall assessment and top priority>",
  "action_items": [
    {
      "rank": 1,
      "category": "<reviews|operations|delivery|competitive|marketing>",
      "problem": "<specific problem with real numbers e.g. '4 of last 10 reviews mention slow delivery'>",
      "evidence": "<exact data found e.g. '3.8 stars on Google, 12 one-star reviews mention cold food'>",
      "fix": "<specific action e.g. 'Switch to insulated packaging for delivery orders over 2 miles'>",
      "estimated_impact": "<e.g. '+$600-900/week' or '+0.3 stars in 60 days'>",
      "effort": "<easy|moderate|hard>",
      "timeframe": "<e.g. 'This week' or 'Within 30 days'>",
      "priority_reason": "<why this is rank 1>"
    }
  ],
  "competitor_intelligence": {
    "competitor_name": "<name>",
    "their_rating": <float>,
    "their_recent_trend": "<rising|falling|stable — with one line of evidence>",
    "their_top_weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "your_window": "<specific action to exploit their weakness now>"
  },
  "delivery_gaps": [
    {
      "zip_code": "<zip>",
      "distance_miles": <float>,
      "population_note": "<brief demographic note>",
      "estimated_monthly_revenue": "<e.g. '$1,500-2,500/month'>",
      "action": "<e.g. 'Expand DoorDash radius to this zip — $0 cost'>"
    }
  ],
  "quick_wins": ["<do today #1>", "<do today #2>", "<do today #3>"],
  "review_response_needed": <integer>,
  "suggested_responses": [
    {
      "review_summary": "<paraphrase of negative review>",
      "suggested_response": "<professional owner reply — 2-3 sentences>"
    }
  ]
}

Generate 4-5 action_items. Be specific with numbers from your searches. If you cannot find real data for a field, make a realistic estimate based on industry averages for similar restaurants.`;

    const rawText = await callClaudeWithSearch(userPrompt, systemPrompt, 90000);

    let result: any;
    try {
      const start = rawText.indexOf("{");
      const end = rawText.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("No JSON found");
      result = JSON.parse(rawText.slice(start, end + 1));
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response. Please try again.", code: "PARSE_ERROR" }, { status: 422 });
    }

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        module: "advisor",
        title: restaurant_name,
        input_data: { restaurant_name, city, competitor_name, zip_codes },
        result_data: result,
        score: result.overall_health_score,
        verdict: null,
      })
      .select()
      .single();

    if (reportError) console.error("Report save error:", reportError);

    await supabase
      .from("profiles")
      .update({ reports_used_this_month: usage.used + 1 })
      .eq("id", user.id);

    return NextResponse.json({ ...result, reportId: report?.id });
  } catch (err: any) {
    console.error("Advisor analysis error:", err);
    const isTimeout = err.message?.includes("timeout") || err.code === "ETIMEDOUT";
    return NextResponse.json(
      { error: isTimeout ? "Analysis timed out. Try with fewer details or a more well-known restaurant." : (err.message || "Internal server error"), code: isTimeout ? "TIMEOUT" : "API_ERROR" },
      { status: 500 }
    );
  }
}
