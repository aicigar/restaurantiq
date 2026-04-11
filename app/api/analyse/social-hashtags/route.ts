import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaudeWithSearch } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { topic, location, concept } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "topic is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const systemPrompt = `You are a social media hashtag strategist for food and restaurant content. Use web search to find real hashtag data. Return ONLY valid JSON with no markdown fences and no text outside the JSON object.`;

    const userPrompt = `Research the best hashtags for a ${concept || "restaurant"} restaurant${location ? ` in ${location}` : ""} posting about: '${topic}'
Search for real hashtag performance data on Instagram and TikTok.

Return ONLY this JSON:
{
  "topic": "${topic}",
  "hashtag_sets": {
    "mega": [
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "very high", "competition": "very high" },
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "very high", "competition": "very high" },
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "very high", "competition": "very high" }
    ],
    "macro": [
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "high", "competition": "high" },
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "high", "competition": "high" },
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "high", "competition": "high" }
    ],
    "micro": [
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "medium", "competition": "medium" },
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "medium", "competition": "medium" },
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "medium", "competition": "medium" }
    ],
    "niche": [
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "targeted", "competition": "low" },
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "targeted", "competition": "low" },
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "targeted", "competition": "low" }
    ],
    "location": [
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "local", "competition": "low" },
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "local", "competition": "low" },
      { "tag": "<string>", "estimated_posts": "<string>", "reach": "local", "competition": "low" }
    ]
  },
  "recommended_mix": {
    "instagram_set_small": ["<10 tags>"],
    "instagram_set_large": ["<25 tags>"],
    "tiktok_set": ["<6 tags>"],
    "strategy_note": "<string>"
  },
  "trending_right_now": ["<string>", "<string>", "<string>", "<string>", "<string>"],
  "avoid_these": ["<string>", "<string>", "<string>"],
  "copy_ready_blocks": {
    "instagram_small": "<all 10 tags space-separated>",
    "instagram_large": "<all 25 tags space-separated>",
    "tiktok": "<all 6 tags space-separated>"
  }
}`;

    const rawText = await callClaudeWithSearch(userPrompt, systemPrompt, 30000);

    let result: any;
    try {
      const start = rawText.indexOf("{");
      const end = rawText.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("No JSON found");
      result = JSON.parse(rawText.slice(start, end + 1));
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response. Please try again.", code: "PARSE_ERROR" }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Hashtag research error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error", code: "API_ERROR" },
      { status: 500 }
    );
  }
}
