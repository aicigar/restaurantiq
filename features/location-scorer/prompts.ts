/**
 * Location Scorer — Claude Prompt
 *
 * To modify what Claude analyses, edit the prompt string below.
 * To add a new factor, add it to the factors array description.
 * To change scoring weights, update the prompt instructions.
 */

export function buildLocationPrompt(address: string, concept: string): string {
  return `Analyse this restaurant location for a ${concept}: '${address}'.

Search for real US Census demographics, halal/Muslim community data, income levels,
South Asian population percentage, and nearby competitors in this category.

Return this exact JSON structure with no markdown, no explanation, just the JSON:
{
  "location_name": string,
  "concept": string,
  "overall_score": integer 0-100,
  "verdict": "GO" | "PROCEED WITH CAUTION" | "NO-GO",
  "verdict_reason": string,
  "factors": [
    { "name": string, "score": integer 0-10, "value": string, "note": string }
  ],
  "key_strengths": [string, string, string],
  "key_risks": [string, string],
  "competitors_nearby": [
    { "name": string, "type": string, "distance": string, "rating": float, "threat": "low"|"medium"|"high" }
  ],
  "alternative_locations": [
    { "name": string, "reason": string, "score": integer 0-100 }
  ],
  "strategic_summary": string
}

The 8 required factors are:
1. Median Household Income
2. Muslim/Halal Demand
3. South Asian Population
4. Competitor Gap
5. Population & Density
6. Foot Traffic & Access
7. Area Growth Trend
8. Buying Power Index`;
}

/**
 * FUTURE IDEAS — prompts you could add here:
 *
 * buildLocationPromptDetailed()  — deeper 16-factor analysis
 * buildLocationPromptQuick()     — fast 3-factor summary for free plan
 * buildRentEstimatePrompt()      — estimate commercial rent for the area
 * buildPermitRiskPrompt()        — check zoning and permit difficulty
 */
