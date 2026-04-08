export interface SentimentCategory {
  category: string;
  score: number; // 0-10
  positive_pct: number; // 0-100
  summary: string;
}

export interface PraisedItem {
  item: string;
  mentions: number;
  quote: string; // paraphrase only
}

export interface UrgentIssue {
  issue: string;
  severity: "low" | "medium" | "high";
  frequency: string;
  fix: string;
  revenue_impact: string;
}

export interface ImprovementAction {
  action: string;
  priority: "high" | "medium" | "low";
  impact: string;
  effort: "easy" | "moderate" | "hard";
}

export interface ReviewResult {
  restaurant_name: string;
  location: string;
  overall_score: number; // 0-100
  average_rating: number; // 1-5
  total_reviews_found: number;
  sentiment_categories: SentimentCategory[]; // 6 categories
  top_praised: PraisedItem[]; // 2 items
  urgent_issues: UrgentIssue[]; // 2-3 items
  improvement_actions: ImprovementAction[]; // 3 items
  summary: string;
}

export interface ReviewInput {
  name: string;
  city: string;
}
