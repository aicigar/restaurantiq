export interface LocationFactor {
  name: string;
  score: number; // 0-10
  value: string;
  note: string;
}

export interface NearbyCompetitor {
  name: string;
  type: string;
  distance: string;
  rating: number;
  threat: "low" | "medium" | "high";
}

export interface AlternativeLocation {
  name: string;
  reason: string;
  score: number; // 0-100
}

export interface LocationResult {
  location_name: string;
  concept: string;
  overall_score: number; // 0-100
  verdict: "GO" | "PROCEED WITH CAUTION" | "NO-GO";
  verdict_reason: string;
  factors: LocationFactor[]; // 8 factors
  key_strengths: string[]; // 3 items
  key_risks: string[]; // 2 items
  competitors_nearby: NearbyCompetitor[];
  alternative_locations: AlternativeLocation[]; // 2 items
  strategic_summary: string;
}

export interface LocationInput {
  address: string;
  concept: string;
}
