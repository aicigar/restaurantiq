import type { CompetitorResult } from "./types";

export function parseCompetitorResult(rawText: string): CompetitorResult {
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in Claude response");
  }
  const parsed = JSON.parse(rawText.slice(start, end + 1));

  if (typeof parsed.opportunity_score !== "number") {
    throw new Error("Missing opportunity_score in response");
  }
  if (!Array.isArray(parsed.competitors)) {
    throw new Error("Missing competitors array in response");
  }

  return parsed as CompetitorResult;
}
