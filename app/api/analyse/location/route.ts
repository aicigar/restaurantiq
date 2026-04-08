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

    const { address, concept, country = "US" } = await req.json();
    if (!address || !concept) {
      return NextResponse.json({ error: "address and concept are required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const countryConfig = COUNTRY_MAP[country as CountryCode] ?? COUNTRY_MAP["US"];
    const { name: countryName, distanceUnit, demographicSource, locationFactors } = countryConfig;

    const prompt = `Analyse this restaurant location for a ${concept}: '${address}' in ${countryName}.

Search for real demographic and market data from ${demographicSource} including income levels, population density, and community composition relevant to a ${concept} restaurant. Also search for nearby competitors in this category on ${countryConfig.mapPlatforms.join(" and ")}.

Return this exact JSON with no markdown, no explanation, just the JSON:
{
  "location_name": string,
  "concept": string,
  "country": "${countryName}",
  "overall_score": integer 0-100,
  "verdict": "GO" or "PROCEED WITH CAUTION" or "NO-GO",
  "verdict_reason": string,
  "factors": [{"name": string, "score": integer 0-10, "value": string, "note": string}] — exactly 8 factors named: "${locationFactors.join('", "')}",
  "key_strengths": [3 strings],
  "key_risks": [2 strings],
  "competitors_nearby": [{"name": string, "type": string, "distance": string (use ${distanceUnit}), "rating": float, "threat": "low" or "medium" or "high"}],
  "alternative_locations": [{"name": string, "reason": string, "score": integer 0-100}] with 2 alternatives,
  "strategic_summary": string
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
        module: "location",
        title: address,
        input_data: { address, concept, country },
        result_data: result,
        score: result.overall_score,
        verdict: result.verdict,
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
    console.error("Location analysis error:", err);
    return NextResponse.json({ error: err.message || "Internal server error", code: "API_ERROR" }, { status: 500 });
  }
}
