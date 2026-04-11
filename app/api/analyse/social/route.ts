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

    const {
      restaurant_name,
      city,
      concept,
      instagram_handle,
      tiktok_handle,
      competitor_handles,
      is_new_opening,
      seasonal_campaign,
    } = await req.json();

    if (!restaurant_name || !city) {
      return NextResponse.json({ error: "restaurant_name and city are required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const systemPrompt = `You are RestaurantIQ's Social Intelligence Engine — an expert in food content strategy, viral social media, and halal and ethnic restaurant marketing. Use web search extensively to find real, current data about the restaurant's Instagram and TikTok presence, competitor accounts, and what is trending right now in the halal and ethnic food content space. Every insight must be grounded in real searched data. Return ONLY valid JSON with no markdown fences and no text outside the JSON object.`;

    const instagramPart = instagram_handle
      ? `Instagram handle: @${instagram_handle}`
      : `Instagram handle: not provided — search Instagram for this restaurant`;
    const tiktokPart = tiktok_handle
      ? `TikTok handle: @${tiktok_handle}`
      : `TikTok handle: not provided — search TikTok for this restaurant`;
    const competitorPart = competitor_handles
      ? `Competitors to analyse: ${competitor_handles}`
      : `Competitors to analyse: search for the top 2-3 competitors in the same halal or ethnic food category in this city and analyse their social media`;
    const openingPart = is_new_opening
      ? `New location opening: YES — include a full Grand Opening Content Pack`
      : `New location opening: no`;
    const seasonalPart = seasonal_campaign && seasonal_campaign !== "none"
      ? `Seasonal campaign: ${seasonal_campaign} — include a full seasonal content calendar`
      : `Seasonal campaign: none`;

    const userPrompt = `Conduct a full social media intelligence analysis for:

Restaurant: '${restaurant_name}' in '${city}' — ${concept || "restaurant"}
${instagramPart}
${tiktokPart}
${competitorPart}
${openingPart}
${seasonalPart}

Use web search to find:
1. The restaurant's real Instagram profile data — follower count, posting frequency, engagement patterns, what content formats they use, what is working versus what is missing
2. The restaurant's real TikTok profile — follower count, video count, estimated views, formats used, viral potential
3. For each competitor — their follower counts on both platforms, what content is performing for them, their posting patterns, their weaknesses and content gaps
4. What is trending RIGHT NOW in halal food content on TikTok and Instagram — search for viral halal food videos, trending audio used by food creators, hashtag performance in the ethnic food niche
5. Comment sentiment on their social posts — what do people praise, what do they complain about, what language and phrases do they use

Return ONLY this exact JSON structure. All fields required:

{
  "restaurant_name": "${restaurant_name}",
  "city": "${city}",
  "concept": "${concept || "restaurant"}",
  "analysis_date": "<YYYY-MM-DD>",
  "overall_social_score": <integer 0-100>,
  "social_grade": "<A|B|C|D|F>",
  "data_sources_searched": ["<every URL or source searched>"],
  "own_presence": {
    "instagram": {
      "handle": "<string>",
      "followers": "<string>",
      "following": "<string>",
      "post_count": "<string>",
      "estimated_engagement_rate": "<string>",
      "posting_frequency": "<string>",
      "content_themes": ["<string>"],
      "formats_used": ["<string>"],
      "what_is_working": "<string>",
      "what_is_missing": "<string>",
      "best_performing_content_type": "<string>",
      "profile_completeness_score": <integer 0-10>,
      "bio_assessment": "<string>",
      "link_in_bio_status": "<string>",
      "reels_strategy": "<string>",
      "stories_frequency": "<string>",
      "growth_trend": "<growing|stagnant|declining|unknown>"
    },
    "tiktok": {
      "handle": "<string>",
      "followers": "<string>",
      "total_likes": "<string>",
      "video_count": "<string>",
      "estimated_avg_views": "<string>",
      "estimated_top_video_views": "<string>",
      "formats_used": ["<string>"],
      "posting_frequency": "<string>",
      "profile_score": <integer 0-10>,
      "viral_potential": "<low|medium|high>",
      "duet_stitch_usage": "<string>",
      "trending_sounds_used": <boolean>,
      "what_is_working": "<string>",
      "what_is_missing": "<string>",
      "growth_trend": "<growing|stagnant|declining|unknown>"
    },
    "combined_monthly_reach_estimate": "<string>",
    "social_vs_competitor_gap": "<string>"
  },
  "competitor_analysis": [
    {
      "name": "<string>",
      "instagram_handle": "<string>",
      "tiktok_handle": "<string>",
      "instagram_followers": "<string>",
      "tiktok_followers": "<string>",
      "estimated_monthly_reach": "<string>",
      "posting_frequency": "<string>",
      "top_content_formats": ["<string>"],
      "content_themes_that_perform": ["<string>"],
      "estimated_avg_engagement_rate": "<string>",
      "what_they_do_better": ["<string>"],
      "their_content_gaps": ["<string>"],
      "their_tone": "<string>",
      "halal_messaging": <boolean>,
      "community_engagement": "<string>",
      "threat_level": "<low|medium|high>",
      "key_strategic_insight": "<string>",
      "opportunity_to_steal_audience": "<string>"
    }
  ],
  "viral_content_intelligence": {
    "trending_formats_right_now": [
      {
        "format_name": "<string>",
        "description": "<string>",
        "why_algorithm_loves_it": "<string>",
        "real_world_example": "<string>",
        "how_to_apply_to_restaurant": "<string>",
        "difficulty": "<easy|moderate|hard>",
        "estimated_reach_potential": "<string>"
      }
    ],
    "trending_sounds_to_use": ["<string>"],
    "trending_hashtags": {
      "mega_tags": ["<string>"],
      "macro_tags": ["<string>"],
      "niche_halal_tags": ["<string>"],
      "location_tags": ["<string>"],
      "recommended_mix": "<string>"
    },
    "best_posting_times": {
      "instagram_weekday": "<string>",
      "instagram_weekend": "<string>",
      "tiktok_weekday": "<string>",
      "tiktok_weekend": "<string>",
      "ramadan_special": "<string>"
    },
    "algorithm_insights": ["<string>"],
    "content_gap_in_market": "<string>"
  },
  "sentiment_analysis": {
    "instagram_sentiment": "<very positive|positive|mixed|negative|unknown>",
    "tiktok_sentiment": "<very positive|positive|mixed|negative|unknown>",
    "positive_themes": ["<string>"],
    "negative_themes": ["<string>"],
    "customer_language_patterns": ["<string>"],
    "viral_trigger_phrases": ["<string>"],
    "brand_perception": "<string>",
    "community_feeling": "<string>",
    "sentiment_opportunity": "<string>"
  },
  "content_calendar": [
    {
      "week": <1-4>,
      "day": "<string>",
      "platform": "<Instagram|TikTok|Both>",
      "content_type": "<string>",
      "format": "<string>",
      "hook": "<string>",
      "concept": "<string>",
      "what_to_film": "<string>",
      "caption_starter": "<string>",
      "hashtags": ["<string>"],
      "best_time_to_post": "<string>",
      "viral_potential": "<low|medium|high>",
      "effort_level": "<easy|moderate|hard>",
      "trending_element_used": "<string>",
      "why_this_will_perform": "<string>",
      "call_to_action": "<string>"
    }
  ],
  "content_ideas_deep_dive": [
    {
      "title": "<string>",
      "platform": "<string>",
      "format": "<string>",
      "hook_line": "<string>",
      "full_concept": "<string>",
      "what_to_film_step_by_step": ["<string>"],
      "production_requirements": "<string>",
      "estimated_reach_potential": "<string>",
      "best_posting_time": "<string>",
      "caption_template": "<string>",
      "hashtag_set": ["<string>"],
      "call_to_action": "<string>",
      "trending_element": "<string>",
      "why_this_will_go_viral": "<string>"
    }
  ],
  "quick_wins": [
    {
      "action": "<string>",
      "platform": "<string>",
      "specific_steps": ["<string>"],
      "effort": "<easy|moderate|hard>",
      "estimated_impact": "<string>",
      "do_today": <boolean>,
      "zero_cost": <boolean>
    }
  ],
  "growth_roadmap": {
    "current_estimated_reach": "<string>",
    "days_30": { "goal": "<string>", "key_actions": ["<string>"], "follower_target": "<string>" },
    "days_60": { "goal": "<string>", "key_actions": ["<string>"], "follower_target": "<string>" },
    "days_90": { "goal": "<string>", "key_actions": ["<string>"], "follower_target": "<string>" },
    "success_metrics": ["<string>"]
  },
  "viral_opportunity": {
    "headline": "<string>",
    "opportunity_description": "<string>",
    "why_right_now": "<string>",
    "exact_steps": ["<string>"],
    "estimated_reach_if_executed": "<string>",
    "time_sensitive": <boolean>
  },
  "grand_opening_pack": {
    "include": <boolean>,
    "pre_launch_7_days": [{ "day": "<string>", "platform": "<string>", "content_type": "<string>", "concept": "<string>", "hook": "<string>", "caption": "<string>", "goal": "<string>" }],
    "opening_day_sequence": [{ "time": "<string>", "platform": "<string>", "content": "<string>", "goal": "<string>" }],
    "free_food_promo_announcement_script": "<string>",
    "queue_video_strategy": "<string>",
    "post_launch_week_1": ["<string>"]
  },
  "seasonal_campaign": {
    "type": "<ramadan|eid|none>",
    "campaign_overview": "<string>",
    "content_plan": [{ "phase": "<string>", "content_ideas": ["<string>"], "best_formats": ["<string>"], "key_message": "<string>", "posting_schedule": "<string>" }],
    "ramadan_specific_hooks": ["<string>"],
    "eid_specific_hooks": ["<string>"],
    "community_engagement_ideas": ["<string>"]
  },
  "summary": "<string>"
}

Generate 3 trending formats, 8 content calendar entries (2 per week), 3 content ideas deep dive, 5 quick wins. Be specific with real data from your searches.`;

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
        module: "social",
        title: restaurant_name,
        input_data: { restaurant_name, city, concept, instagram_handle, tiktok_handle, competitor_handles, is_new_opening, seasonal_campaign },
        result_data: result,
        score: result.overall_social_score,
        verdict: result.social_grade,
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
    console.error("Social analysis error:", err);
    const isTimeout = err.message?.includes("timeout") || err.code === "ETIMEDOUT";
    return NextResponse.json(
      { error: isTimeout ? "Analysis timed out. Try again — social data searches can take longer." : (err.message || "Internal server error"), code: isTimeout ? "TIMEOUT" : "API_ERROR" },
      { status: 500 }
    );
  }
}
