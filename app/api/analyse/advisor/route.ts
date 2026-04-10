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

    const competitorLine = competitor_name ? `Their main competitor is: ${competitor_name}` : "";
    const zipLine = zip_codes ? `Nearby zip codes to check for delivery gaps: ${zip_codes}` : "";

    const systemPrompt = `You are RestaurantIQ's AI Improvement Advisor. You analyse a restaurant's reviews, competitor performance, and delivery data to generate hyper-specific, ranked action items with real revenue impact estimates. Always use web search to find actual current data. Every recommendation must reference specific numbers, named competitors, real zip codes, or actual review quotes (paraphrased). Never give generic advice. Return ONLY valid JSON with no markdown or text outside the JSON object.`;

    const userPrompt = `You are analysing '${restaurant_name}' in '${city}'.
${competitorLine}
${zipLine}

Use web search to:
1. Find recent reviews for '${restaurant_name}' on Google, Yelp, DoorDash, Uber Eats — note specific complaints and patterns
2. Find the rating and recent reviews for their competitor '${competitor_name || "nearest similar restaurant"}' — identify where the competitor is weaker
3. Check what food delivery options exist in the nearby zip codes provided
4. Identify any delivery radius gaps or underserved zones

Return ONLY this exact JSON (no markdown, no text outside the JSON):

{
  "restaurant_name": "string",
  "city": "string",
  "overall_health_score": 0,
  "analysis_date": "string (today's date YYYY-MM-DD)",
  "data_sources": ["strings listing what was searched and found"],
  "action_items": [
    {
      "rank": 1,
      "category": "reviews",
      "problem": "string (specific problem with real data — mention actual star counts, frequencies, specific complaints found in reviews)",
      "evidence": "string (what the data shows — e.g. '3 of last 12 one-star reviews mention cold fries on delivery')",
      "fix": "string (specific operational action — not vague, mention exact changes like hours, packaging type, platform settings)",
      "estimated_impact": "string (dollar amount per week or rating improvement — e.g. '+$800-1,200/week in retained orders' or '+0.3 stars over 60 days')",
      "effort": "easy",
      "timeframe": "string (e.g. 'Implement this week' or 'Within 30 days')",
      "priority_reason": "string (why this ranks where it does)"
    }
  ],
  "competitor_intelligence": {
    "competitor_name": "string",
    "their_rating": 0.0,
    "their_recent_trend": "string (rising / falling / stable with evidence)",
    "their_top_weaknesses": ["strings — specific complaints from their reviews"],
    "your_window": "string (specific opportunity to exploit their weakness right now)"
  },
  "delivery_gaps": [
    {
      "zip_code": "string",
      "distance_miles": 0.0,
      "population_note": "string (brief demographic note)",
      "estimated_monthly_revenue": "string (e.g. '$1,500-2,500/month')",
      "action": "string (e.g. 'Expand DoorDash delivery radius to include this zip — costs $0')"
    }
  ],
  "quick_wins": ["strings — 3 things the owner can do TODAY with zero cost that will improve their score"],
  "review_response_needed": 0,
  "suggested_responses": [
    {
      "review_summary": "string (what the negative review said, paraphrased)",
      "suggested_response": "string (professional response the owner can copy-paste)"
    }
  ],
  "summary": "string (2-3 sentence overall assessment of the restaurant's health and top priority)"
}

QUALITY STANDARD — every action item must be this specific:
- BAD: "Improve your service quality"
- GOOD: "Your Friday evening wait time reviews are 2.1x worse than your top competitor. Consider adding a second cashier from 6-9 PM or enabling pre-ordering. Estimated impact: +$800-1,200/week in retained orders."
- BAD: "Respond to your negative reviews"
- GOOD: "3 of your last 12 one-star reviews mention cold fries on delivery. Switch to vented delivery packaging for fries. Estimated delivery rating improvement: +0.3 stars over 60 days."

Generate at least 5 action items. Be hyper-specific with real data from your search.`;

    const rawText = await callClaudeWithSearch(userPrompt, systemPrompt, 6);

    let result: any;
    try {
      const start = rawText.indexOf("{");
      const end = rawText.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("No JSON found");
      result = JSON.parse(rawText.slice(start, end + 1));
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response", code: "PARSE_ERROR" }, { status: 422 });
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
    return NextResponse.json({ error: err.message || "Internal server error", code: "API_ERROR" }, { status: 500 });
  }
}
