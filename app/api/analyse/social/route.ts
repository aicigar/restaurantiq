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

    const systemPrompt = `You are RestaurantIQ's Social Intelligence Engine. Do exactly 3 web searches, then immediately return valid JSON. No markdown, no text outside JSON.`;

    const userPrompt = `Analyse social media for "${restaurant_name}" in "${city}" (${concept || "restaurant"}).
Instagram: ${instagram_handle ? "@" + instagram_handle : "find it"} | TikTok: ${tiktok_handle ? "@" + tiktok_handle : "find it"} | Competitors: ${competitor_handles || "top 2 halal competitors in " + city}

Do exactly 3 searches:
1. "${restaurant_name}" Instagram and TikTok social media presence
2. Trending halal food content TikTok Instagram 2025
3. ${competitor_handles || "halal food competitors " + city} social media

Then return this JSON immediately. Fill every field with real data from your searches:

{
  "restaurant_name": "${restaurant_name}",
  "city": "${city}",
  "concept": "${concept || "restaurant"}",
  "analysis_date": "<today YYYY-MM-DD>",
  "overall_social_score": <0-100>,
  "social_grade": "<A|B|C|D|F>",
  "data_sources_searched": ["<url or source 1>", "<url or source 2>", "<url or source 3>"],
  "summary": "<2-3 sentences: current social standing and #1 priority action>",
  "own_presence": {
    "instagram": {
      "handle": "<@handle or not found>",
      "followers": "<number or estimate>",
      "following": "<number>",
      "post_count": "<number>",
      "estimated_engagement_rate": "<e.g. 3.2%>",
      "posting_frequency": "<e.g. 3x/week>",
      "content_themes": ["<theme1>", "<theme2>", "<theme3>"],
      "formats_used": ["<Reels>", "<Stories>"],
      "what_is_working": "<specific strength>",
      "what_is_missing": "<specific gap>",
      "best_performing_content_type": "<string>",
      "profile_completeness_score": <0-10>,
      "bio_assessment": "<short assessment>",
      "link_in_bio_status": "<has link / no link>",
      "reels_strategy": "<brief>",
      "stories_frequency": "<daily/weekly/never>",
      "growth_trend": "<growing|stagnant|declining|unknown>"
    },
    "tiktok": {
      "handle": "<@handle or not found>",
      "followers": "<number or estimate>",
      "total_likes": "<number>",
      "video_count": "<number>",
      "estimated_avg_views": "<number>",
      "estimated_top_video_views": "<number>",
      "formats_used": ["<format1>", "<format2>"],
      "posting_frequency": "<string>",
      "profile_score": <0-10>,
      "viral_potential": "<low|medium|high>",
      "duet_stitch_usage": "<string>",
      "trending_sounds_used": <true|false>,
      "what_is_working": "<string>",
      "what_is_missing": "<string>",
      "growth_trend": "<growing|stagnant|declining|unknown>"
    },
    "combined_monthly_reach_estimate": "<e.g. 8,000 people/month>",
    "social_vs_competitor_gap": "<e.g. 3x behind top competitor>"
  },
  "competitor_analysis": [
    {
      "name": "<competitor name>",
      "instagram_handle": "<@handle>",
      "tiktok_handle": "<@handle>",
      "instagram_followers": "<number>",
      "tiktok_followers": "<number>",
      "estimated_monthly_reach": "<string>",
      "posting_frequency": "<string>",
      "top_content_formats": ["<format1>", "<format2>"],
      "content_themes_that_perform": ["<theme1>", "<theme2>"],
      "estimated_avg_engagement_rate": "<string>",
      "what_they_do_better": ["<item1>", "<item2>"],
      "their_content_gaps": ["<gap1>", "<gap2>"],
      "their_tone": "<casual/professional/hype>",
      "halal_messaging": <true|false>,
      "community_engagement": "<string>",
      "threat_level": "<low|medium|high>",
      "key_strategic_insight": "<one sentence>",
      "opportunity_to_steal_audience": "<one sentence>"
    }
  ],
  "viral_content_intelligence": {
    "trending_formats_right_now": [
      { "format_name": "<string>", "description": "<string>", "why_algorithm_loves_it": "<string>", "real_world_example": "<string>", "how_to_apply_to_restaurant": "<string>", "difficulty": "<easy|moderate|hard>", "estimated_reach_potential": "<string>" },
      { "format_name": "<string>", "description": "<string>", "why_algorithm_loves_it": "<string>", "real_world_example": "<string>", "how_to_apply_to_restaurant": "<string>", "difficulty": "<easy|moderate|hard>", "estimated_reach_potential": "<string>" },
      { "format_name": "<string>", "description": "<string>", "why_algorithm_loves_it": "<string>", "real_world_example": "<string>", "how_to_apply_to_restaurant": "<string>", "difficulty": "<easy|moderate|hard>", "estimated_reach_potential": "<string>" }
    ],
    "trending_sounds_to_use": ["<sound1>", "<sound2>", "<sound3>"],
    "trending_hashtags": {
      "mega_tags": ["<tag1>", "<tag2>", "<tag3>"],
      "macro_tags": ["<tag1>", "<tag2>", "<tag3>"],
      "niche_halal_tags": ["<tag1>", "<tag2>", "<tag3>"],
      "location_tags": ["<tag1>", "<tag2>"],
      "recommended_mix": "<strategy in one sentence>"
    },
    "best_posting_times": {
      "instagram_weekday": "<e.g. 6-8 PM>",
      "instagram_weekend": "<e.g. 11 AM-1 PM>",
      "tiktok_weekday": "<e.g. 7-9 PM>",
      "tiktok_weekend": "<e.g. 10 AM-12 PM>",
      "ramadan_special": "<e.g. After iftar 8-10 PM>"
    },
    "algorithm_insights": ["<insight1>", "<insight2>", "<insight3>"],
    "content_gap_in_market": "<what nobody is doing that you should>"
  },
  "sentiment_analysis": {
    "instagram_sentiment": "<very positive|positive|mixed|negative|unknown>",
    "tiktok_sentiment": "<very positive|positive|mixed|negative|unknown>",
    "positive_themes": ["<theme1>", "<theme2>", "<theme3>"],
    "negative_themes": ["<theme1>", "<theme2>"],
    "customer_language_patterns": ["<phrase1>", "<phrase2>", "<phrase3>"],
    "viral_trigger_phrases": ["<phrase1>", "<phrase2>", "<phrase3>"],
    "brand_perception": "<one sentence>",
    "community_feeling": "<one sentence>",
    "sentiment_opportunity": "<actionable one sentence>"
  },
  "content_calendar": [
    { "week": 1, "day": "Monday",   "platform": "TikTok",    "content_type": "<string>", "format": "<TikTok/Reel>", "hook": "<opening line>", "concept": "<what to film>", "what_to_film": "<specific instructions>", "caption_starter": "<first line>", "hashtags": ["<tag1>","<tag2>","<tag3>","<tag4>","<tag5>"], "best_time_to_post": "<time>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" },
    { "week": 1, "day": "Thursday", "platform": "Instagram", "content_type": "<string>", "format": "<Reel/Story>",  "hook": "<opening line>", "concept": "<what to film>", "what_to_film": "<specific instructions>", "caption_starter": "<first line>", "hashtags": ["<tag1>","<tag2>","<tag3>","<tag4>","<tag5>"], "best_time_to_post": "<time>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" },
    { "week": 2, "day": "Tuesday",  "platform": "Both",      "content_type": "<string>", "format": "<Reel/TikTok>", "hook": "<opening line>", "concept": "<what to film>", "what_to_film": "<specific instructions>", "caption_starter": "<first line>", "hashtags": ["<tag1>","<tag2>","<tag3>","<tag4>","<tag5>"], "best_time_to_post": "<time>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" },
    { "week": 2, "day": "Friday",   "platform": "TikTok",    "content_type": "<string>", "format": "<TikTok/Reel>", "hook": "<opening line>", "concept": "<what to film>", "what_to_film": "<specific instructions>", "caption_starter": "<first line>", "hashtags": ["<tag1>","<tag2>","<tag3>","<tag4>","<tag5>"], "best_time_to_post": "<time>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" }
  ],
  "content_ideas_deep_dive": [
    { "title": "<string>", "platform": "<string>", "format": "<string>", "hook_line": "<scroll-stopping hook>", "full_concept": "<string>", "what_to_film_step_by_step": ["<step1>","<step2>","<step3>","<step4>"], "production_requirements": "<phone only / ring light / etc>", "estimated_reach_potential": "<string>", "best_posting_time": "<string>", "caption_template": "<full caption>", "hashtag_set": ["<tag1>","<tag2>","<tag3>","<tag4>","<tag5>"], "call_to_action": "<string>", "trending_element": "<string>", "why_this_will_go_viral": "<string>" }
  ],
  "quick_wins": [
    { "action": "<string>", "platform": "<string>", "specific_steps": ["<step1>","<step2>","<step3>"], "effort": "easy", "estimated_impact": "<string>", "do_today": true, "zero_cost": true },
    { "action": "<string>", "platform": "<string>", "specific_steps": ["<step1>","<step2>","<step3>"], "effort": "easy", "estimated_impact": "<string>", "do_today": true, "zero_cost": true },
    { "action": "<string>", "platform": "<string>", "specific_steps": ["<step1>","<step2>"], "effort": "moderate", "estimated_impact": "<string>", "do_today": false, "zero_cost": false },
    { "action": "<string>", "platform": "<string>", "specific_steps": ["<step1>","<step2>"], "effort": "easy", "estimated_impact": "<string>", "do_today": false, "zero_cost": true }
  ],
  "growth_roadmap": {
    "current_estimated_reach": "<string>",
    "days_30": { "goal": "<string>", "key_actions": ["<action1>","<action2>","<action3>"], "follower_target": "<string>" },
    "days_60": { "goal": "<string>", "key_actions": ["<action1>","<action2>","<action3>"], "follower_target": "<string>" },
    "days_90": { "goal": "<string>", "key_actions": ["<action1>","<action2>","<action3>"], "follower_target": "<string>" },
    "success_metrics": ["<metric1>","<metric2>","<metric3>","<metric4>"]
  },
  "viral_opportunity": {
    "headline": "<punchy headline>",
    "opportunity_description": "<2 sentences>",
    "why_right_now": "<one sentence>",
    "exact_steps": ["<step1>","<step2>","<step3>","<step4>"],
    "estimated_reach_if_executed": "<string>",
    "time_sensitive": <true|false>
  },
  "grand_opening_pack": {
    "include": ${is_new_opening ? "true" : "false"},
    "pre_launch_7_days": [],
    "opening_day_sequence": [],
    "free_food_promo_announcement_script": "",
    "queue_video_strategy": "",
    "post_launch_week_1": []
  },
  "seasonal_campaign": {
    "type": "${seasonal_campaign && seasonal_campaign !== "none" ? seasonal_campaign : "none"}",
    "campaign_overview": "",
    "content_plan": [],
    "ramadan_specific_hooks": [],
    "eid_specific_hooks": [],
    "community_engagement_ideas": []
  }
}`;

    const rawText = await callClaudeWithSearch(userPrompt, systemPrompt, 90000, 12000);

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
