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

    const { restaurant_name, city, concept, instagram_handle, tiktok_handle, competitor_handles, is_new_opening, seasonal_campaign } = await req.json();

    if (!restaurant_name || !city) {
      return NextResponse.json({ error: "restaurant_name and city are required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const systemPrompt = `You are RestaurantIQ's Social Intelligence Engine. Do exactly 2 web searches, then immediately return valid JSON. No markdown, no text outside JSON.`;

    const userPrompt = `Analyse social media for "${restaurant_name}" in "${city}" (${concept || "restaurant"}).
${instagram_handle ? `Instagram: @${instagram_handle}` : ""} ${tiktok_handle ? `TikTok: @${tiktok_handle}` : ""}
Competitors to benchmark: ${competitor_handles || "top halal food competitors in " + city}

Do exactly 2 searches:
1. "${restaurant_name}" ${city} Instagram TikTok social media followers engagement
2. Trending halal food TikTok Instagram content formats ${city} 2025

Then immediately return this JSON (no more searches):

{
  "restaurant_name": "${restaurant_name}",
  "city": "${city}",
  "concept": "${concept || "restaurant"}",
  "analysis_date": "<YYYY-MM-DD>",
  "overall_social_score": <0-100>,
  "social_grade": "<A|B|C|D|F>",
  "data_sources_searched": ["<source1>", "<source2>"],
  "summary": "<2-3 sentences on social standing and top priority>",
  "own_presence": {
    "instagram": {
      "handle": "<@handle or not found>", "followers": "<number>", "following": "<number>", "post_count": "<number>",
      "estimated_engagement_rate": "<x%>", "posting_frequency": "<x/week>",
      "content_themes": ["<theme1>","<theme2>","<theme3>"], "formats_used": ["<format1>","<format2>"],
      "what_is_working": "<strength>", "what_is_missing": "<gap>",
      "profile_completeness_score": <0-10>, "bio_assessment": "<brief>", "link_in_bio_status": "<has/no link>",
      "reels_strategy": "<brief>", "stories_frequency": "<daily/weekly/never>", "growth_trend": "<growing|stagnant|declining|unknown>"
    },
    "tiktok": {
      "handle": "<@handle or not found>", "followers": "<number>", "total_likes": "<number>", "video_count": "<number>",
      "estimated_avg_views": "<number>", "estimated_top_video_views": "<number>",
      "formats_used": ["<format1>","<format2>"], "posting_frequency": "<string>",
      "profile_score": <0-10>, "viral_potential": "<low|medium|high>",
      "trending_sounds_used": <true|false>, "what_is_working": "<string>", "what_is_missing": "<string>",
      "growth_trend": "<growing|stagnant|declining|unknown>"
    },
    "combined_monthly_reach_estimate": "<string>",
    "social_vs_competitor_gap": "<string>"
  },
  "competitor_analysis": [
    {
      "name": "<name>", "instagram_handle": "<@handle>", "tiktok_handle": "<@handle>",
      "instagram_followers": "<number>", "tiktok_followers": "<number>",
      "posting_frequency": "<string>", "top_content_formats": ["<f1>","<f2>"],
      "what_they_do_better": ["<item1>","<item2>"], "their_content_gaps": ["<gap1>","<gap2>"],
      "halal_messaging": <true|false>, "threat_level": "<low|medium|high>",
      "key_strategic_insight": "<one sentence>", "opportunity_to_steal_audience": "<one sentence>"
    }
  ],
  "viral_content_intelligence": {
    "trending_formats_right_now": [
      { "format_name": "<name>", "description": "<brief>", "why_algorithm_loves_it": "<reason>", "how_to_apply_to_restaurant": "<how>", "difficulty": "<easy|moderate|hard>", "estimated_reach_potential": "<string>" },
      { "format_name": "<name>", "description": "<brief>", "why_algorithm_loves_it": "<reason>", "how_to_apply_to_restaurant": "<how>", "difficulty": "<easy|moderate|hard>", "estimated_reach_potential": "<string>" }
    ],
    "trending_sounds_to_use": ["<sound1>","<sound2>","<sound3>"],
    "trending_hashtags": {
      "mega_tags": ["<tag1>","<tag2>","<tag3>"], "macro_tags": ["<tag1>","<tag2>","<tag3>"],
      "niche_halal_tags": ["<tag1>","<tag2>","<tag3>"], "location_tags": ["<tag1>","<tag2>"],
      "recommended_mix": "<strategy>"
    },
    "best_posting_times": {
      "instagram_weekday": "<time>", "instagram_weekend": "<time>",
      "tiktok_weekday": "<time>", "tiktok_weekend": "<time>", "ramadan_special": "<time>"
    },
    "algorithm_insights": ["<insight1>","<insight2>","<insight3>"],
    "content_gap_in_market": "<what nobody is doing>"
  },
  "sentiment_analysis": {
    "instagram_sentiment": "<very positive|positive|mixed|negative|unknown>",
    "tiktok_sentiment": "<very positive|positive|mixed|negative|unknown>",
    "positive_themes": ["<t1>","<t2>","<t3>"], "negative_themes": ["<t1>","<t2>"],
    "customer_language_patterns": ["<p1>","<p2>","<p3>"],
    "viral_trigger_phrases": ["<p1>","<p2>","<p3>"],
    "brand_perception": "<one sentence>", "community_feeling": "<one sentence>",
    "sentiment_opportunity": "<one sentence>"
  },
  "content_calendar": [
    { "week": 1, "day": "Monday",   "platform": "TikTok",    "content_type": "<type>", "format": "TikTok", "hook": "<opening line>", "concept": "<what to film>", "what_to_film": "<instructions>", "caption_starter": "<first line>", "hashtags": ["<t1>","<t2>","<t3>","<t4>","<t5>"], "best_time_to_post": "<time>", "viral_potential": "high",   "effort_level": "easy",     "trending_element_used": "<element>", "why_this_will_perform": "<reason>", "call_to_action": "<cta>" },
    { "week": 1, "day": "Thursday", "platform": "Instagram", "content_type": "<type>", "format": "Reel",   "hook": "<opening line>", "concept": "<what to film>", "what_to_film": "<instructions>", "caption_starter": "<first line>", "hashtags": ["<t1>","<t2>","<t3>","<t4>","<t5>"], "best_time_to_post": "<time>", "viral_potential": "medium", "effort_level": "easy",     "trending_element_used": "<element>", "why_this_will_perform": "<reason>", "call_to_action": "<cta>" },
    { "week": 2, "day": "Tuesday",  "platform": "Both",      "content_type": "<type>", "format": "Reel",   "hook": "<opening line>", "concept": "<what to film>", "what_to_film": "<instructions>", "caption_starter": "<first line>", "hashtags": ["<t1>","<t2>","<t3>","<t4>","<t5>"], "best_time_to_post": "<time>", "viral_potential": "high",   "effort_level": "moderate", "trending_element_used": "<element>", "why_this_will_perform": "<reason>", "call_to_action": "<cta>" }
  ],
  "content_ideas_deep_dive": [],
  "quick_wins": [
    { "action": "<action>", "platform": "<platform>", "specific_steps": ["<s1>","<s2>","<s3>"], "effort": "easy",     "estimated_impact": "<impact>", "do_today": true,  "zero_cost": true  },
    { "action": "<action>", "platform": "<platform>", "specific_steps": ["<s1>","<s2>","<s3>"], "effort": "easy",     "estimated_impact": "<impact>", "do_today": true,  "zero_cost": true  },
    { "action": "<action>", "platform": "<platform>", "specific_steps": ["<s1>","<s2>"],        "effort": "moderate", "estimated_impact": "<impact>", "do_today": false, "zero_cost": false }
  ],
  "growth_roadmap": {
    "current_estimated_reach": "<string>",
    "days_30": { "goal": "<goal>", "key_actions": ["<a1>","<a2>","<a3>"], "follower_target": "<number>" },
    "days_60": { "goal": "<goal>", "key_actions": ["<a1>","<a2>","<a3>"], "follower_target": "<number>" },
    "days_90": { "goal": "<goal>", "key_actions": ["<a1>","<a2>","<a3>"], "follower_target": "<number>" },
    "success_metrics": ["<m1>","<m2>","<m3>","<m4>"]
  },
  "viral_opportunity": {
    "headline": "<punchy headline>",
    "opportunity_description": "<2 sentences>",
    "why_right_now": "<one sentence>",
    "exact_steps": ["<s1>","<s2>","<s3>","<s4>"],
    "estimated_reach_if_executed": "<string>",
    "time_sensitive": true
  },
  "grand_opening_pack": { "include": ${is_new_opening ? "true" : "false"}, "pre_launch_7_days": [], "opening_day_sequence": [], "free_food_promo_announcement_script": "", "queue_video_strategy": "", "post_launch_week_1": [] },
  "seasonal_campaign": { "type": "${seasonal_campaign && seasonal_campaign !== "none" ? seasonal_campaign : "none"}", "campaign_overview": "", "content_plan": [], "ramadan_specific_hooks": [], "eid_specific_hooks": [], "community_engagement_ideas": [] }
}

Be specific with real data from your searches. Estimate realistically where data is unavailable.`;

    const rawText = await callClaudeWithSearch(userPrompt, systemPrompt, 90000, 7000);

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
      { error: isTimeout ? "Analysis timed out. Try again." : (err.message || "Internal server error"), code: isTimeout ? "TIMEOUT" : "API_ERROR" },
      { status: 500 }
    );
  }
}
