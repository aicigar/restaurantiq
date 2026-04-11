import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getClient() {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _anthropic;
}

const SYSTEM_PROMPT =
  "You are RestaurantIQ, an expert restaurant intelligence analyst. Always use web search to find real, current data before answering. Return ONLY valid JSON with no markdown fences, no explanation, and no text outside the JSON object.";

export async function callClaudeWithSearch(
  prompt: string,
  systemPrompt: string = SYSTEM_PROMPT,
  timeoutMs: number = 55000
): Promise<string> {
  const response = await getClient().messages.create(
    {
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      system: systemPrompt,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        } as any,
      ],
      messages: [{ role: "user", content: prompt }],
    },
    { timeout: timeoutMs }
  );

  const textBlocks = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block as any).text)
    .join("");

  return textBlocks;
}
