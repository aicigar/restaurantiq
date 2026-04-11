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

    const systemPrompt = `You are RestaurantIQ's Social Intelligence Engine — expert in food content strategy, viral social media, and halal restaurant marketing. Do exactly 3 web searches then write JSON immediately. Return ONLY valid JSON, no markdown fences, no text outside the JSON.`;

    const igPart = instagram_handle ? `@${instagram_handle}` : `unknown (search for it)`;
    const ttPart = tiktok_handle ? `@${tiktok_handle}` : `unknown (search for it)`;
    const compPart = competitor_handles || `top 2 halal competitors in ${city}`;

    const userPrompt = `Social media analysis for "${restaurant_name}" in "${city}" (${concept || "restaurant"}).
Instagram: ${igPart} | TikTok: ${ttPart} | Competitors: ${compPart}
${is_new_opening ? "Include grand opening content pack." : ""}
${seasonal_campaign && seasonal_campaign !== "none" ? `Include ${seasonal_campaign} seasonal campaign.` : ""}

Do exactly 3 searches:
1. Search Instagram/TikTok for "${restaurant_name}" ${city} social media presence
2. Search for top halal food content trends on TikTok and Instagram right now
3. Search for competitor social accounts: ${compPart}

Then immediately return this JSON (no extra searches):

{
  "restaurant_name": "${restaurant_name}",
  "city": "${city}",
  "concept": "${concept || "restaurant"}",
  "analysis_date": "<YYYY-MM-DD>",
  "overall_social_score": <0-100>,
  "social_grade": "<A|B|C|D|F>",
  "data_sources_searched": ["<source1>", "<source2>", "<source3>"],
  "own_presence": {
    "instagram": {
      "handle": "<string>",
      "followers": "<string>",
      "following": "<string>",
      "post_count": "<string>",
      "estimated_engagement_rate": "<string>",
      "posting_frequency": "<string>",
      "content_themes": ["<theme1>", "<theme2>", "<theme3>"],
      "formats_used": ["<format1>", "<format2>"],
      "what_is_working": "<string>",
      "what_is_missing": "<string>",
      "best_performing_content_type": "<string>",
      "profile_completeness_score": <0-10>,
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
      "top_content_formats": ["<format1>", "<format2>"],
      "content_themes_that_perform": ["<theme1>", "<theme2>"],
      "estimated_avg_engagement_rate": "<string>",
      "what_they_do_better": ["<item1>", "<item2>"],
      "their_content_gaps": ["<gap1>", "<gap2>"],
      "their_tone": "<string>",
      "halal_messaging": <true|false>,
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
      },
      {
        "format_name": "<string>",
        "description": "<string>",
        "why_algorithm_loves_it": "<string>",
        "real_world_example": "<string>",
        "how_to_apply_to_restaurant": "<string>",
        "difficulty": "<easy|moderate|hard>",
        "estimated_reach_potential": "<string>"
      },
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
    "trending_sounds_to_use": ["<sound1>", "<sound2>", "<sound3>"],
    "trending_hashtags": {
      "mega_tags": ["<tag1>", "<tag2>", "<tag3>"],
      "macro_tags": ["<tag1>", "<tag2>", "<tag3>"],
      "niche_halal_tags": ["<tag1>", "<tag2>", "<tag3>"],
      "location_tags": ["<tag1>", "<tag2>"],
      "recommended_mix": "<string>"
    },
    "best_posting_times": {
      "instagram_weekday": "<string>",
      "instagram_weekend": "<string>",
      "tiktok_weekday": "<string>",
      "tiktok_weekend": "<string>",
      "ramadan_special": "<string>"
    },
    "algorithm_insights": ["<insight1>", "<insight2>", "<insight3>"],
    "content_gap_in_market": "<string>"
  },
  "sentiment_analysis": {
    "instagram_sentiment": "<very positive|positive|mixed|negative|unknown>",
    "tiktok_sentiment": "<very positive|positive|mixed|negative|unknown>",
    "positive_themes": ["<theme1>", "<theme2>", "<theme3>"],
    "negative_themes": ["<theme1>", "<theme2>"],
    "customer_language_patterns": ["<phrase1>", "<phrase2>", "<phrase3>"],
    "viral_trigger_phrases": ["<phrase1>", "<phrase2>", "<phrase3>"],
    "brand_perception": "<string>",
    "community_feeling": "<string>",
    "sentiment_opportunity": "<string>"
  },
  "content_calendar": [
    { "week": 1, "day": "Monday", "platform": "TikTok", "content_type": "<string>", "format": "<string>", "hook": "<string>", "concept": "<string>", "what_to_film": "<string>", "caption_starter": "<string>", "hashtags": ["<tag1>","<tag2>","<tag3>"], "best_time_to_post": "<string>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" },
    { "week": 1, "day": "Thursday", "platform": "Instagram", "content_type": "<string>", "format": "<string>", "hook": "<string>", "concept": "<string>", "what_to_film": "<string>", "caption_starter": "<string>", "hashtags": ["<tag1>","<tag2>","<tag3>"], "best_time_to_post": "<string>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" },
    { "week": 2, "day": "Tuesday", "platform": "Both", "content_type": "<string>", "format": "<string>", "hook": "<string>", "concept": "<string>", "what_to_film": "<string>", "caption_starter": "<string>", "hashtags": ["<tag1>","<tag2>","<tag3>"], "best_time_to_post": "<string>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" },
    { "week": 2, "day": "Friday", "platform": "TikTok", "content_type": "<string>", "format": "<string>", "hook": "<string>", "concept": "<string>", "what_to_film": "<string>", "caption_starter": "<string>", "hashtags": ["<tag1>","<tag2>","<tag3>"], "best_time_to_post": "<string>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" },
    { "week": 3, "day": "Wednesday", "platform": "Instagram", "content_type": "<string>", "format": "<string>", "hook": "<string>", "concept": "<string>", "what_to_film": "<string>", "caption_starter": "<string>", "hashtags": ["<tag1>","<tag2>","<tag3>"], "best_time_to_post": "<string>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" },
    { "week": 3, "day": "Saturday", "platform": "TikTok", "content_type": "<string>", "format": "<string>", "hook": "<string>", "concept": "<string>", "what_to_film": "<string>", "caption_starter": "<string>", "hashtags": ["<tag1>","<tag2>","<tag3>"], "best_time_to_post": "<string>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" },
    { "week": 4, "day": "Monday", "platform": "Both", "content_type": "<string>", "format": "<string>", "hook": "<string>", "concept": "<string>", "what_to_film": "<string>", "caption_starter": "<string>", "hashtags": ["<tag1>","<tag2>","<tag3>"], "best_time_to_post": "<string>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" },
    { "week": 4, "day": "Friday", "platform": "Instagram", "content_type": "<string>", "format": "<string>", "hook": "<string>", "concept": "<string>", "what_to_film": "<string>", "caption_starter": "<string>", "hashtags": ["<tag1>","<tag2>","<tag3>"], "best_time_to_post": "<string>", "viral_potential": "<low|medium|high>", "effort_level": "<easy|moderate|hard>", "trending_element_used": "<string>", "why_this_will_perform": "<string>", "call_to_action": "<string>" }
  ],
  "content_ideas_deep_dive": [
    {
      "title": "<string>",
      "platform": "<string>",
      "format": "<string>",
      "hook_line": "<string>",
      "full_concept": "<string>",
      "what_to_film_step_by_step": ["<step1>", "<step2>", "<step3>", "<step4>"],
      "production_requirements": "<string>",
      "estimated_reach_potential": "<string>",
      "best_posting_time": "<string>",
      "caption_template": "<string>",
      "hashtag_set": ["<tag1>","<tag2>","<tag3>","<tag4>","<tag5>"],
      "call_to_action": "<string>",
      "trending_element": "<string>",
      "why_this_will_go_viral": "<string>"
    },
    {
      "title": "<string>",
      "platform": "<string>",
      "format": "<string>",
      "hook_line": "<string>",
      "full_concept": "<string>",
      "what_to_film_step_by_step": ["<step1>", "<step2>", "<step3>", "<step4>"],
      "production_requirements": "<string>",
      "estimated_reach_potential": "<string>",
      "best_posting_time": "<string>",
      "caption_template": "<string>",
      "hashtag_set": ["<tag1>","<tag2>","<tag3>","<tag4>","<tag5>"],
      "call_to_action": "<string>",
      "trending_element": "<string>",
      "why_this_will_go_viral": "<string>"
    }
  ],
  "quick_wins": [
    { "action": "<string>", "platform": "<string>", "specific_steps": ["<step1>", "<step2>", "<step3>"], "effort": "<easy|moderate|hard>", "estimated_impact": "<string>", "do_today": true, "zero_cost": true },
    { "action": "<string>", "platform": "<string>", "specific_steps": ["<step1>", "<step2>", "<step3>"], "effort": "<easy|moderate|hard>", "estimated_impact": "<string>", "do_today": true, "zero_cost": true },
    { "action": "<string>", "platform": "<string>", "specific_steps": ["<step1>", "<step2>"], "effort": "<easy|moderate|hard>", "estimated_impact": "<string>", "do_today": false, "zero_cost": false },
    { "action": "<string>", "platform": "<string>", "specific_steps": ["<step1>", "<step2>"], "effort": "<easy|moderate|hard>", "estimated_impact": "<string>", "do_today": false, "zero_cost": true }
  ],
  "growth_roadmap": {
    "current_estimated_reach": "<string>",
    "days_30": { "goal": "<string>", "key_actions": ["<action1>", "<action2>", "<action3>"], "follower_target": "<string>" },
    "days_60": { "goal": "<string>", "key_actions": ["<action1>", "<action2>", "<action3>"], "follower_target": "<string>" },
    "days_90": { "goal": "<string>", "key_actions": ["<action1>", "<action2>", "<action3>"], "follower_target": "<string>" },
    "success_metrics": ["<metric1>", "<metric2>", "<metric3>", "<metric4>"]
  },
  "viral_opportunity": {
    "headline": "<string>",
    "opportunity_description": "<string>",
    "why_right_now": "<string>",
    "exact_steps": ["<step1>", "<step2>", "<step3>", "<step4>"],
    "estimated_reach_if_executed": "<string>",
    "time_sensitive": <true|false>
  },
  "grand_opening_pack": {
    "include": ${is_new_opening ? "true" : "false"},
    "pre_launch_7_days": ${is_new_opening ? `[
      { "day": "-7", "platform": "Instagram", "content_type": "<string>", "concept": "<string>", "hook": "<string>", "caption": "<string>", "goal": "Build anticipation" },
      { "day": "-5", "platform": "TikTok", "content_type": "<string>", "concept": "<string>", "hook": "<string>", "caption": "<string>", "goal": "Go viral" },
      { "day": "-3", "platform": "Both", "content_type": "<string>", "concept": "<string>", "hook": "<string>", "caption": "<string>", "goal": "Drive pre-orders" },
      { "day": "-1", "platform": "TikTok", "content_type": "<string>", "concept": "<string>", "hook": "<string>", "caption": "<string>", "goal": "Last push" }
    ]` : "[]"},
    "opening_day_sequence": ${is_new_opening ? `[
      { "time": "7:00 AM", "platform": "Instagram", "content": "<string>", "goal": "Announce open" },
      { "time": "12:00 PM", "platform": "TikTok", "content": "<string>", "goal": "Show the queue" },
      { "time": "5:00 PM", "platform": "Both", "content": "<string>", "goal": "Evening rush" }
    ]` : "[]"},
    "free_food_promo_announcement_script": ${is_new_opening ? '"<announcement script>"' : '""'},
    "queue_video_strategy": ${is_new_opening ? '"<queue video tips>"' : '""'},
    "post_launch_week_1": ${is_new_opening ? '["<action1>","<action2>","<action3>","<action4>","<action5>"]' : '[]'}
  },
  "seasonal_campaign": {
    "type": "${seasonal_campaign && seasonal_campaign !== "none" ? seasonal_campaign : "none"}",
    "campaign_overview": "<string>",
    "content_plan": ${seasonal_campaign && seasonal_campaign !== "none" ? `[
      { "phase": "Week 1 — Launch", "content_ideas": ["<idea1>", "<idea2>", "<idea3>"], "best_formats": ["Reels", "TikTok"], "key_message": "<string>", "posting_schedule": "Daily" },
      { "phase": "Week 2 — Peak", "content_ideas": ["<idea1>", "<idea2>", "<idea3>"], "best_formats": ["Stories", "TikTok"], "key_message": "<string>", "posting_schedule": "2x daily" }
    ]` : "[]"},
    "ramadan_specific_hooks": ${seasonal_campaign === "ramadan" ? '["<hook1>","<hook2>","<hook3>"]' : '[]'},
    "eid_specific_hooks": ${seasonal_campaign === "eid" ? '["<hook1>","<hook2>","<hook3>"]' : '[]'},
    "community_engagement_ideas": ${seasonal_campaign && seasonal_campaign !== "none" ? '["<idea1>","<idea2>","<idea3>"]' : '[]'}
  },
  "summary": "<2-3 sentence overall assessment and top priority action>"
}`;

    const rawText = await callClaudeWithSearch(userPrompt, systemPrompt, 90000, 8000);

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
