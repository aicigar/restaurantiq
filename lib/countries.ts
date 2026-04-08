export type CountryCode = "US" | "CA" | "GB" | "AE" | "PK" | "IN";

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  distanceUnit: "miles" | "km";
  currency: string;
  reviewPlatforms: string[];
  mapPlatforms: string[];
  demographicSource: string;
  locationFactors: string[];
  addressPlaceholder: string;
  cityPlaceholder: string;
  locationPlaceholder: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    distanceUnit: "miles",
    currency: "USD",
    reviewPlatforms: ["Google Reviews", "Yelp", "TripAdvisor", "DoorDash", "Uber Eats", "Grubhub"],
    mapPlatforms: ["Google Maps", "Yelp"],
    demographicSource: "US Census Bureau",
    locationFactors: [
      "Median Household Income",
      "Target Demographic Density",
      "Competitor Gap",
      "Population & Density",
      "Foot Traffic & Access",
      "Area Growth Trend",
      "Buying Power Index",
      "Delivery Platform Presence",
    ],
    addressPlaceholder: "e.g. 4521 Main St, Chicago IL 60601",
    cityPlaceholder: "e.g. Chicago, IL",
    locationPlaceholder: "e.g. Jackson Heights, Queens NY",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    distanceUnit: "km",
    currency: "CAD",
    reviewPlatforms: ["Google Reviews", "Yelp", "TripAdvisor", "SkipTheDishes", "DoorDash", "Uber Eats"],
    mapPlatforms: ["Google Maps", "Yelp"],
    demographicSource: "Statistics Canada",
    locationFactors: [
      "Median Household Income",
      "Target Demographic Density",
      "Competitor Gap",
      "Population & Density",
      "Foot Traffic & Access",
      "Area Growth Trend",
      "Buying Power Index",
      "Delivery Platform Presence",
    ],
    addressPlaceholder: "e.g. 123 King St W, Toronto ON M5H 1J9",
    cityPlaceholder: "e.g. Toronto, ON",
    locationPlaceholder: "e.g. Kensington Market, Toronto ON",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    distanceUnit: "miles",
    currency: "GBP",
    reviewPlatforms: ["Google Reviews", "TripAdvisor", "Just Eat", "Deliveroo", "Uber Eats"],
    mapPlatforms: ["Google Maps", "TripAdvisor"],
    demographicSource: "Office for National Statistics (ONS)",
    locationFactors: [
      "Average Household Income",
      "Target Demographic Density",
      "Competitor Gap",
      "Population & Density",
      "Foot Traffic & Access",
      "Area Growth Trend",
      "Spending Power Index",
      "Delivery Platform Presence",
    ],
    addressPlaceholder: "e.g. 45 Oxford Street, London W1D 2DZ",
    cityPlaceholder: "e.g. London",
    locationPlaceholder: "e.g. Brick Lane, Tower Hamlets, London",
  },
  {
    code: "AE",
    name: "UAE / Dubai",
    flag: "🇦🇪",
    distanceUnit: "km",
    currency: "AED",
    reviewPlatforms: ["Google Reviews", "TripAdvisor", "Zomato", "Talabat", "Careem Now"],
    mapPlatforms: ["Google Maps", "Zomato"],
    demographicSource: "Dubai Statistics Center / UAE Federal Competitiveness and Statistics Centre",
    locationFactors: [
      "Average Spending Power",
      "Tourist & Expat Density",
      "Competitor Gap",
      "Mall & Strip Presence",
      "Residential vs Commercial Mix",
      "Area Growth Trend",
      "Delivery Platform Presence",
      "Community Demographic Fit",
    ],
    addressPlaceholder: "e.g. JBR Walk, Jumeirah Beach Residence, Dubai",
    cityPlaceholder: "e.g. Dubai",
    locationPlaceholder: "e.g. JBR Walk, Jumeirah Beach Residence, Dubai",
  },
  {
    code: "PK",
    name: "Pakistan",
    flag: "🇵🇰",
    distanceUnit: "km",
    currency: "PKR",
    reviewPlatforms: ["Google Reviews", "TripAdvisor", "Foodpanda", "Careem Food", "Cheetay"],
    mapPlatforms: ["Google Maps"],
    demographicSource: "Pakistan Bureau of Statistics",
    locationFactors: [
      "Average Household Income",
      "Middle/Upper-Class Density",
      "Competitor Gap",
      "Population & Density",
      "Foot Traffic & Access",
      "Area Growth Trend",
      "Delivery Platform Presence",
      "Brand Visibility Potential",
    ],
    addressPlaceholder: "e.g. Main Boulevard, Gulberg III, Lahore",
    cityPlaceholder: "e.g. Lahore",
    locationPlaceholder: "e.g. Zamzama, DHA Phase 5, Karachi",
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    distanceUnit: "km",
    currency: "INR",
    reviewPlatforms: ["Google Reviews", "Zomato", "Swiggy", "TripAdvisor"],
    mapPlatforms: ["Google Maps", "Zomato"],
    demographicSource: "Census of India / Ministry of Statistics and Programme Implementation",
    locationFactors: [
      "Average Household Income",
      "Middle-Class Density",
      "Competitor Gap",
      "Population & Density",
      "Foot Traffic & Access",
      "Area Growth Trend",
      "Delivery Platform Presence",
      "Dietary Preference Match",
    ],
    addressPlaceholder: "e.g. 12 MG Road, Bangalore 560001",
    cityPlaceholder: "e.g. Mumbai",
    locationPlaceholder: "e.g. Koramangala, Bangalore",
  },
];

export const COUNTRY_MAP: Record<CountryCode, CountryConfig> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
) as Record<CountryCode, CountryConfig>;

export const FOOD_CONCEPTS = [
  "Burgers & American",
  "Pizza",
  "South Asian (Pakistani/Indian)",
  "Middle Eastern / Lebanese",
  "Chinese",
  "Japanese / Sushi",
  "Mexican / Tex-Mex",
  "Italian",
  "Mediterranean",
  "Fried Chicken",
  "Dessert & Café",
  "Fast Casual",
  "BBQ & Grill",
  "Seafood",
  "Thai / Asian Fusion",
  "Turkish",
  "Persian / Iranian",
  "African",
  "Steakhouse",
  "Sandwiches & Wraps",
  "Vegan / Plant-Based",
  "Halal Specialist",
  "Other",
];
