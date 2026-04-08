import type { ReviewResult } from "./types";

export function parseReviewResult(rawText: string): ReviewResult {
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in Claude response");
  }
  const parsed = JSON.parse(rawText.slice(start, end + 1));

  if (typeof parsed.overall_score !== "number") {
    throw new Error("Missing overall_score in response");
  }
  if (!Array.isArray(parsed.sentiment_categories)) {
    throw new Error("Missing sentiment_categories in response");
  }

  return parsed as ReviewResult;
}
