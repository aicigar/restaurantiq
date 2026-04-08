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

    const { location, concept, radius, country = "US" } = await req.json();
    if (!location || !concept || !radius) {
      return NextResponse.json({ error: "location, concept, and radius are required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const countryConfig = COUNTRY_MAP[country as CountryCode] ?? COUNTRY_MAP["US"];
    const { name: countryName, distanceUnit, mapPlatforms, reviewPlatforms } = countryConfig;

    const prompt = `Search ${mapPlatforms.join(" and ")} for real ${concept} restaurants within ${radius} ${distanceUnit} of '${location}' in ${countryName}. Return this exact JSON with no markdown, no explanation, just the JSON:
{
  "location": string,
  "concept": string,
  "country": "${countryName}",
  "radius": ${radius},
  "radius_unit": "${distanceUnit}",
  "market_saturation": "low" or "medium" or "high",
  "opportunity_score": integer 0-100,
  "competitors": [{"name": string, "type": string, "address": string, "distance": string (include unit: ${distanceUnit}), "rating": float, "review_count": integer, "price_range": "$" or "$$" or "$$$", "threat_level": "low" or "medium" or "high", "threat_reason": string, "weaknesses": [strings]}] with 3-6 real competitors,
  "market_gaps": [{"gap": string, "opportunity": string, "size": "small" or "medium" or "large"}] with 2-3 gaps,
  "biggest_threat": string,
  "biggest_opportunity": string,
  "positioning_advice": string,
  "delivery_landscape": string (mention relevant local platforms: ${reviewPlatforms.filter(p => ["DoorDash","Uber Eats","Grubhub","SkipTheDishes","Just Eat","Deliveroo","Zomato","Talabat","Careem Now","Foodpanda","Careem Food","Cheetay","Swiggy"].includes(p)).join(", ")})
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
        module: "competitors",
        title: location,
        input_data: { location, concept, radius, country },
        result_data: result,
        score: result.opportunity_score,
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
    console.error("Competitors analysis error:", err);
    return NextResponse.json({ error: err.message || "Internal server error", code: "API_ERROR" }, { status: 500 });
  }
}
