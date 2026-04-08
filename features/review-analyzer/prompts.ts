/**
 * Review Analyzer — Claude Prompt
 *
 * To add more platforms to search, add them to the platform list.
 * To change sentiment categories, update the categories list below.
 * To add competitor review comparison, see FUTURE IDEAS.
 */

export function buildReviewPrompt(name: string, city: string): string {
  return `Search for real customer reviews of '${name}' in '${city}' on:
- Google Reviews
- Yelp
- TripAdvisor
- DoorDash
- Uber Eats

Analyse all reviews found and return this exact JSON with no markdown:
{
  "restaurant_name": string,
  "location": string,
  "overall_score": integer 0-100,
  "average_rating": float 1-5,
  "total_reviews_found": integer,
  "sentiment_categories": [
    { "category": string, "score": integer 0-10, "positive_pct": integer 0-100, "summary": string }
  ],
  "top_praised": [
    { "item": string, "mentions": integer, "quote": string }
  ],
  "urgent_issues": [
    { "issue": string, "severity": "low"|"medium"|"high", "frequency": string, "fix": string, "revenue_impact": string }
  ],
  "improvement_actions": [
    { "action": string, "priority": "high"|"medium"|"low", "impact": string, "effort": "easy"|"moderate"|"hard" }
  ],
  "summary": string
}

The 6 required sentiment categories are:
1. Food Quality
2. Service & Staff
3. Wait Times
4. Value for Money
5. Delivery Quality
6. Cleanliness

Important: quotes must be paraphrased — never copy direct review text verbatim.`;
}

/**
 * FUTURE IDEAS — prompts you could add here:
 *
 * buildReviewTrendPrompt()          — track score changes over 3/6/12 months
 * buildCompetitorReviewPrompt()     — compare reviews vs top 3 competitors
 * buildOwnerResponsePrompt()        — generate draft owner responses to bad reviews
 * buildMenuSentimentPrompt()        — score individual menu items from reviews
 * buildDeliveryReviewPrompt()       — delivery-only deep dive (DoorDash/Uber Eats)
 */
