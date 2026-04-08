import type { LocationResult } from "./types";

/**
 * Extracts and validates the JSON from Claude's raw response.
 * Claude sometimes adds surrounding text — we find the first { to last }.
 */
export function parseLocationResult(rawText: string): LocationResult {
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in Claude response");
  }
  const parsed = JSON.parse(rawText.slice(start, end + 1));

  // Basic validation
  if (typeof parsed.overall_score !== "number") {
    throw new Error("Missing overall_score in response");
  }
  if (!["GO", "PROCEED WITH CAUTION", "NO-GO"].includes(parsed.verdict)) {
    throw new Error("Invalid verdict in response");
  }

  return parsed as LocationResult;
}
