import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUsageLimit } from "@/lib/usage";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function streamClaude(
  prompt: string,
  system: string,
  maxTokens: number,
  useSearch: boolean
): Promise<string> {
  const tools = useSearch
    ? [{ type: "web_search_20250305", name: "web_search" } as any]
    : [];

  const stream = await anthropic.messages.create(
    {
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system,
      ...(tools.length > 0 ? { tools } : {}),
      messages: [{ role: "user", content: prompt }],
      stream: true,
    },
    { timeout: 280000 }
  );

  let text = "";
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      (event.delta as any).type === "text_delta"
    ) {
      text += (event.delta as any).text;
    }
  }
  return text;
}

function parseJSON(raw: string): any {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  return JSON.parse(raw.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return jsonResponse({ error: "Unauthorized", code: "UNAUTHORIZED" }, 401);

  const usage = await checkUsageLimit(user.id);
  if (!usage.allowed) {
    return jsonResponse({ error: "Plan limit reached. Please upgrade.", code: "PLAN_LIMIT", used: usage.used, limit: usage.limit, plan: usage.plan }, 403);
  }

  const { restaurant_name, city, concept, instagram_handle, tiktok_handle, competitor_handles, is_new_opening, seasonal_campaign } = await req.json();
  if (!restaurant_name || !city) return jsonResponse({ error: "restaurant_name and city are required", code: "VALIDATION_ERROR" }, 400);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // ── PHASE 1: Core intel (with web search) ────────────────────────────
        send({ type: "status", step: 1, message: "Searching social profiles & competitors..." });

        const phase1System = `You are RestaurantIQ's Social Intelligence Engine. Do exactly 2 web searches, then return ONLY valid JSON. No markdown, no text outside the JSON.`;

        const phase1Prompt = `Analyse social media for "${restaurant_name}" in "${city}" (${concept || "restaurant"}).
${instagram_handle ? `Instagram: @${instagram_handle}` : "Find their Instagram."}
${tiktok_handle ? `TikTok: @${tiktok_handle}` : "Find their TikTok."}
Competitors: ${competitor_handles || "top halal food competitor in " + city}

Do exactly 2 searches:
1. "${restaurant_name}" ${city} Instagram TikTok followers engagement
2. Trending halal food TikTok Instagram viral formats ${city} 2025

Return this JSON immediately after the 2 searches:

{"restaurant_name":"${restaurant_name}","city":"${city}","concept":"${concept || "restaurant"}","analysis_date":"<YYYY-MM-DD>","overall_social_score":<0-100>,"social_grade":"<A|B|C|D|F>","data_sources_searched":["<s1>","<s2>"],"summary":"<2-3 sentences on social standing and top priority>","own_presence":{"instagram":{"handle":"<@handle or not found>","followers":"<n>","following":"<n>","post_count":"<n>","estimated_engagement_rate":"<x%>","posting_frequency":"<x/week>","content_themes":["<t1>","<t2>","<t3>"],"formats_used":["<f1>","<f2>"],"what_is_working":"<string>","what_is_missing":"<string>","profile_completeness_score":<0-10>,"bio_assessment":"<string>","link_in_bio_status":"<has link|no link>","reels_strategy":"<string>","stories_frequency":"<daily|weekly|never>","growth_trend":"<growing|stagnant|declining|unknown>"},"tiktok":{"handle":"<@handle or not found>","followers":"<n>","total_likes":"<n>","video_count":"<n>","estimated_avg_views":"<n>","estimated_top_video_views":"<n>","formats_used":["<f1>","<f2>"],"posting_frequency":"<string>","profile_score":<0-10>,"viral_potential":"<low|medium|high>","trending_sounds_used":<true|false>,"what_is_working":"<string>","what_is_missing":"<string>","growth_trend":"<growing|stagnant|declining|unknown>"},"combined_monthly_reach_estimate":"<string>","social_vs_competitor_gap":"<string>"},"competitor_analysis":[{"name":"<name>","instagram_handle":"<@h>","tiktok_handle":"<@h>","instagram_followers":"<n>","tiktok_followers":"<n>","posting_frequency":"<string>","top_content_formats":["<f1>","<f2>"],"what_they_do_better":["<i1>","<i2>"],"their_content_gaps":["<g1>","<g2>"],"halal_messaging":<true|false>,"threat_level":"<low|medium|high>","key_strategic_insight":"<sentence>","opportunity_to_steal_audience":"<sentence>"}],"viral_content_intelligence":{"trending_formats_right_now":[{"format_name":"<name>","description":"<brief>","why_algorithm_loves_it":"<reason>","how_to_apply_to_restaurant":"<how>","difficulty":"<easy|moderate|hard>","estimated_reach_potential":"<string>"},{"format_name":"<name>","description":"<brief>","why_algorithm_loves_it":"<reason>","how_to_apply_to_restaurant":"<how>","difficulty":"<easy|moderate|hard>","estimated_reach_potential":"<string>"}],"trending_sounds_to_use":["<s1>","<s2>","<s3>"],"trending_hashtags":{"mega_tags":["<t1>","<t2>","<t3>"],"macro_tags":["<t1>","<t2>","<t3>"],"niche_halal_tags":["<t1>","<t2>","<t3>"],"location_tags":["<t1>","<t2>"],"recommended_mix":"<strategy>"},"best_posting_times":{"instagram_weekday":"<time>","instagram_weekend":"<time>","tiktok_weekday":"<time>","tiktok_weekend":"<time>","ramadan_special":"<time>"},"algorithm_insights":["<i1>","<i2>","<i3>"],"content_gap_in_market":"<string>"},"sentiment_analysis":{"instagram_sentiment":"<very positive|positive|mixed|negative|unknown>","tiktok_sentiment":"<very positive|positive|mixed|negative|unknown>","positive_themes":["<t1>","<t2>","<t3>"],"negative_themes":["<t1>","<t2>"],"customer_language_patterns":["<p1>","<p2>","<p3>"],"viral_trigger_phrases":["<p1>","<p2>","<p3>"],"brand_perception":"<sentence>","community_feeling":"<sentence>","sentiment_opportunity":"<sentence>"},"quick_wins":[{"action":"<action>","platform":"<platform>","specific_steps":["<s1>","<s2>","<s3>"],"effort":"easy","estimated_impact":"<impact>","do_today":true,"zero_cost":true},{"action":"<action>","platform":"<platform>","specific_steps":["<s1>","<s2>","<s3>"],"effort":"easy","estimated_impact":"<impact>","do_today":true,"zero_cost":true},{"action":"<action>","platform":"<platform>","specific_steps":["<s1>","<s2>"],"effort":"moderate","estimated_impact":"<impact>","do_today":false,"zero_cost":false}],"viral_opportunity":{"headline":"<punchy headline>","opportunity_description":"<2 sentences>","why_right_now":"<sentence>","exact_steps":["<s1>","<s2>","<s3>","<s4>"],"estimated_reach_if_executed":"<string>","time_sensitive":true}}`;

        const phase1Raw = await streamClaude(phase1Prompt, phase1System, 6000, true);
        console.log("Phase1 raw length (chars):", phase1Raw.length, "approx tokens:", Math.round(phase1Raw.length / 4));
        const phase1 = parseJSON(phase1Raw);

        // Send phase 1 immediately so UI renders
        send({ type: "phase1", data: phase1 });

        // ── PHASE 2: Strategy (no web search, uses phase 1 context) ──────────
        send({ type: "status", step: 2, message: "Building content calendar & growth plan..." });

        const phase2System = `You are a social media strategist. Return ONLY valid JSON. No markdown, no text outside the JSON.`;

        const phase2Prompt = `Create a content strategy for "${restaurant_name}" (${concept || "restaurant"}) in "${city}".

Context from analysis:
- Social grade: ${phase1.social_grade}, score: ${phase1.overall_social_score}/100
- Summary: ${phase1.summary}
- Top trending format: ${phase1.viral_content_intelligence?.trending_formats_right_now?.[0]?.format_name || "short-form video"}
- Content gap: ${phase1.viral_content_intelligence?.content_gap_in_market || "none identified"}
- Recommended hashtags: ${JSON.stringify(phase1.viral_content_intelligence?.trending_hashtags?.niche_halal_tags || [])}
${is_new_opening ? "- This is a NEW OPENING." : ""}
${seasonal_campaign && seasonal_campaign !== "none" ? `- Seasonal campaign: ${seasonal_campaign}` : ""}

Return this JSON:

{"content_calendar":[{"week":1,"day":"Monday","platform":"TikTok","content_type":"<type e.g. Food Reveal>","format":"TikTok","hook":"<scroll-stopping opening line>","concept":"<one sentence: what to film>","hashtags":["<t1>","<t2>","<t3>","<t4>","<t5>"],"best_time_to_post":"<time>","viral_potential":"<low|medium|high>","effort_level":"<easy|moderate|hard>","call_to_action":"<cta>"},{"week":1,"day":"Thursday","platform":"Instagram","content_type":"<type>","format":"Reel","hook":"<hook>","concept":"<concept>","hashtags":["<t1>","<t2>","<t3>","<t4>","<t5>"],"best_time_to_post":"<time>","viral_potential":"<low|medium|high>","effort_level":"<easy|moderate|hard>","call_to_action":"<cta>"},{"week":2,"day":"Tuesday","platform":"Both","content_type":"<type>","format":"Reel","hook":"<hook>","concept":"<concept>","hashtags":["<t1>","<t2>","<t3>","<t4>","<t5>"],"best_time_to_post":"<time>","viral_potential":"<low|medium|high>","effort_level":"<easy|moderate|hard>","call_to_action":"<cta>"},{"week":2,"day":"Friday","platform":"TikTok","content_type":"<type>","format":"TikTok","hook":"<hook>","concept":"<concept>","hashtags":["<t1>","<t2>","<t3>","<t4>","<t5>"],"best_time_to_post":"<time>","viral_potential":"<low|medium|high>","effort_level":"<easy|moderate|hard>","call_to_action":"<cta>"}],"content_ideas_deep_dive":[],"growth_roadmap":{"current_estimated_reach":"<string>","days_30":{"goal":"<one sentence goal>","key_actions":["<a1>","<a2>","<a3>"],"follower_target":"<n>"},"days_60":{"goal":"<one sentence goal>","key_actions":["<a1>","<a2>","<a3>"],"follower_target":"<n>"},"days_90":{"goal":"<one sentence goal>","key_actions":["<a1>","<a2>","<a3>"],"follower_target":"<n>"},"success_metrics":["<m1>","<m2>","<m3>","<m4>"]},"grand_opening_pack":{"include":${is_new_opening ? "true" : "false"},"pre_launch_7_days":[],"opening_day_sequence":[],"free_food_promo_announcement_script":"","queue_video_strategy":"","post_launch_week_1":[]},"seasonal_campaign":{"type":"${seasonal_campaign && seasonal_campaign !== "none" ? seasonal_campaign : "none"}","campaign_overview":"","content_plan":[],"ramadan_specific_hooks":[],"eid_specific_hooks":[],"community_engagement_ideas":[]}}`;

        const phase2Raw = await streamClaude(phase2Prompt, phase2System, 3000, false);
        const phase2 = parseJSON(phase2Raw);

        // Merge both phases
        const result = { ...phase1, ...phase2 };

        // Save to DB
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

        send({ type: "done", result, reportId: report?.id });
        controller.close();
      } catch (err: any) {
        console.error("Social analysis error:", err);
        send({ type: "error", error: err.message || "Internal server error", code: "API_ERROR" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
