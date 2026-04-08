export interface Competitor {
  name: string;
  type: string;
  address: string;
  distance: string;
  rating: number;
  review_count: number;
  price_range: "$" | "$$" | "$$$";
  halal: boolean;
  threat_level: "low" | "medium" | "high";
  threat_reason: string;
  weaknesses: string[];
}

export interface MarketGap {
  gap: string;
  opportunity: string;
  size: "small" | "medium" | "large";
}

export interface CompetitorResult {
  location: string;
  concept: string;
  radius_miles: number;
  market_saturation: "low" | "medium" | "high";
  opportunity_score: number; // 0-100
  competitors: Competitor[]; // 3-6 real competitors
  market_gaps: MarketGap[]; // 2-3 gaps
  biggest_threat: string;
  biggest_opportunity: string;
  positioning_advice: string;
  delivery_landscape: string;
}

export interface CompetitorInput {
  location: string;
  concept: string;
  radius: number; // miles, 1-5
}
