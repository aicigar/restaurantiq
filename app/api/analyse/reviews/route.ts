import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaudeWithSearch } from "@/lib/anthropic";
import { checkUsageLimit } from "@/lib/usage";
import { COUNTRY_MAP, CountryCode } from "@/lib/countries";

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

    const { name, city, country = "US" } = await req.json();
    if (!name || !city) {
      return NextResponse.json({ error: "name and city are required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const countryConfig = COUNTRY_MAP[country as CountryCode] ?? COUNTRY_MAP["US"];
    const { name: countryName, reviewPlatforms } = countryConfig;
    const platformList = reviewPlatforms.join(", ");

    const prompt = `Search for real customer reviews of '${name}' in '${city}', ${countryName} on: ${platformList}. Analyse the reviews and return this exact JSON with no markdown, no explanation, just the JSON:
{
  "restaurant_name": string,
  "location": string,
  "country": "${countryName}",
  "overall_score": integer 0-100,
  "average_rating": float 1-5,
  "total_reviews_found": integer,
  "platforms_searched": [list of platforms actually found reviews on],
  "sentiment_categories": [{"category": string, "score": integer 0-10, "positive_pct": integer 0-100, "summary": string}] with exactly 6 categories: "Food Quality", "Service & Staff", "Wait Times", "Value for Money", "Delivery Quality", "Cleanliness",
  "top_praised": [{"item": string, "mentions": integer, "quote": string (paraphrase only, never a direct quote)}] with 2 items,
  "urgent_issues": [{"issue": string, "severity": "low" or "medium" or "high", "frequency": string, "fix": string, "revenue_impact": string}] with 2-3 issues,
  "improvement_actions": [{"action": string, "priority": "high" or "medium" or "low", "impact": string, "effort": "easy" or "moderate" or "hard"}] with 3 actions,
  "summary": string
}`;

    const rawText = await callClaudeWithSearch(prompt);

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
        module: "reviews",
        title: name,
        input_data: { name, city, country },
        result_data: result,
        score: result.overall_score,
        verdict: null,
      })
      .select()
      .single();

    if (reportError) {
      console.error("Report save error:", reportError);
    }

    await supabase
      .from("profiles")
      .update({ reports_used_this_month: usage.used + 1 })
      .eq("id", user.id);

    return NextResponse.json({ ...result, reportId: report?.id });
  } catch (err: any) {
    console.error("Reviews analysis error:", err);
    return NextResponse.json({ error: err.message || "Internal server error", code: "API_ERROR" }, { status: 500 });
  }
}
