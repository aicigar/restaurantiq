/**
 * Competitor Radar — Claude Prompt
 *
 * To expand search sources, add them to the source list.
 * To track competitor changes over time, see FUTURE IDEAS.
 */

export function buildCompetitorPrompt(
  location: string,
  concept: string,
  radius: number
): string {
  return `Search Google Maps and Yelp for real ${concept} restaurants within ${radius} miles of '${location}'.

Return this exact JSON with no markdown:
{
  "location": string,
  "concept": string,
  "radius_miles": number,
  "market_saturation": "low" | "medium" | "high",
  "opportunity_score": integer 0-100,
  "competitors": [
    {
      "name": string,
      "type": string,
      "address": string,
      "distance": string,
      "rating": float,
      "review_count": integer,
      "price_range": "$" | "$$" | "$$$",
      "halal": boolean,
      "threat_level": "low" | "medium" | "high",
      "threat_reason": string,
      "weaknesses": [string]
    }
  ],
  "market_gaps": [
    { "gap": string, "opportunity": string, "size": "small" | "medium" | "large" }
  ],
  "biggest_threat": string,
  "biggest_opportunity": string,
  "positioning_advice": string,
  "delivery_landscape": string
}

Include 3-6 real competitors and 2-3 market gaps.`;
}

/**
 * FUTURE IDEAS — prompts you could add here:
 *
 * buildCompetitorAlertPrompt()      — detect new competitors that opened recently
 * buildCompetitorMenuPrompt()       — compare menus and pricing vs competitors
 * buildCompetitorReviewPrompt()     — scrape and compare competitor review scores
 * buildExpansionPrompt()            — find best cities/areas to expand into next
 * buildFranchiseMapPrompt()         — map all franchise locations for a brand
 */
