# Feature Documentation

## Current Features

### 1. Location Scorer
- **Folder:** `features/location-scorer/`
- **UI:** `components/modules/LocationScorer.tsx`
- **API:** `app/api/analyse/location/route.ts`
- **Prompt:** `features/location-scorer/prompts.ts`
- **Types:** `features/location-scorer/types.ts`

Scores any US address for a restaurant concept using 8 demographic factors.
Returns a GO / PROCEED WITH CAUTION / NO-GO verdict with alternatives.

### 2. Review Analyzer
- **Folder:** `features/review-analyzer/`
- **UI:** `components/modules/ReviewAnalyzer.tsx`
- **API:** `app/api/analyse/reviews/route.ts`
- **Prompt:** `features/review-analyzer/prompts.ts`
- **Types:** `features/review-analyzer/types.ts`

Searches live reviews across 5 platforms and returns sentiment scores,
urgent issues, and a prioritised improvement plan.

### 3. Competitor Radar
- **Folder:** `features/competitor-radar/`
- **UI:** `components/modules/CompetitorRadar.tsx`
- **API:** `app/api/analyse/competitors/route.ts`
- **Prompt:** `features/competitor-radar/prompts.ts`
- **Types:** `features/competitor-radar/types.ts`

Maps real competitors within a radius, scores threat levels,
identifies market gaps and gives positioning advice.

---

## Planned Features

| Feature | Module | Priority |
|---------|--------|----------|
| Expansion Planner | New module | High |
| Menu Optimizer | New module | Medium |
| Social Media Analyzer | Review Analyzer extension | Medium |
| Rent Estimator | Location Scorer extension | Low |
| Franchise Finder | Competitor Radar extension | Low |

## How to add a new feature

1. Create folder: `features/your-feature/`
2. Add `types.ts`, `prompts.ts`, `parser.ts`
3. Create API route: `app/api/analyse/your-feature/route.ts`
4. Create UI component: `components/modules/YourFeature.tsx`
5. Add to sidebar in `components/Sidebar.tsx`
6. Add to dashboard in `app/dashboard/page.tsx`
