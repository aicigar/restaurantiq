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

    const { topic, concept, platform } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "topic is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const systemPrompt = `You are a viral food content strategist specialising in halal and ethnic restaurant marketing. Generate scroll-stopping hooks. Return ONLY valid JSON with no markdown fences and no text outside the JSON object.`;

    const userPrompt = `Generate 10 viral hooks for a ${concept || "restaurant"} restaurant promoting: '${topic}'
5 hooks for TikTok video openers, 5 hooks for Instagram captions.
Each hook must use a different psychological trigger:
1. Curiosity gap
2. Community pride
3. Controversy or bold claim
4. Behind the scenes
5. Social proof

Return ONLY this JSON:
{
  "topic": "${topic}",
  "tiktok_hooks": [
    { "hook": "<string>", "trigger_type": "<string>", "why_it_works": "<string>", "example_continuation": "<string>" },
    { "hook": "<string>", "trigger_type": "<string>", "why_it_works": "<string>", "example_continuation": "<string>" },
    { "hook": "<string>", "trigger_type": "<string>", "why_it_works": "<string>", "example_continuation": "<string>" },
    { "hook": "<string>", "trigger_type": "<string>", "why_it_works": "<string>", "example_continuation": "<string>" },
    { "hook": "<string>", "trigger_type": "<string>", "why_it_works": "<string>", "example_continuation": "<string>" }
  ],
  "instagram_hooks": [
    { "hook": "<string>", "trigger_type": "<string>", "why_it_works": "<string>", "caption_continuation": "<string>" },
    { "hook": "<string>", "trigger_type": "<string>", "why_it_works": "<string>", "caption_continuation": "<string>" },
    { "hook": "<string>", "trigger_type": "<string>", "why_it_works": "<string>", "caption_continuation": "<string>" },
    { "hook": "<string>", "trigger_type": "<string>", "why_it_works": "<string>", "caption_continuation": "<string>" },
    { "hook": "<string>", "trigger_type": "<string>", "why_it_works": "<string>", "caption_continuation": "<string>" }
  ],
  "bonus_cta_options": ["<string>", "<string>", "<string>", "<string>", "<string>"]
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
    console.error("Hook generator error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error", code: "API_ERROR" },
      { status: 500 }
    );
  }
}
