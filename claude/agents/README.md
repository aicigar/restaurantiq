# Claude Agents

Agents are multi-step Claude workflows where one analysis feeds into the next automatically.

## What to put here

Each agent is a `.ts` file that chains multiple Claude calls together.
Unlike single API routes, agents run several prompts in sequence to produce a richer output.

## Agents to build

| File | What it does | Calls |
|------|-------------|-------|
| `expansion-agent.ts` | Full expansion report: score 5 cities, pick the best | Location × 5 → Competitor × 1 |
| `launch-agent.ts` | Full pre-launch package: location + reviews of similar + competitors | Location + Reviews + Competitors |
| `weekly-monitor-agent.ts` | Weekly digest: check reviews + flag new competitors | Reviews + Competitors |
| `turnaround-agent.ts` | Struggling restaurant rescue plan | Reviews → Action Plan → Email draft |

## Example agent

```ts
// claude/agents/launch-agent.ts
import { callClaudeWithSearch } from "@/lib/anthropic";
import { buildLocationPrompt } from "@/features/location-scorer/prompts";
import { buildReviewPrompt } from "@/features/review-analyzer/prompts";
import { buildCompetitorPrompt } from "@/features/competitor-radar/prompts";

export async function runLaunchAgent(address: string, concept: string) {
  // Step 1 — score the location
  const locationRaw = await callClaudeWithSearch(buildLocationPrompt(address, concept));

  // Step 2 — analyse reviews of the top existing competitor
  const competitorRaw = await callClaudeWithSearch(buildCompetitorPrompt(address, concept, 2));
  const topCompetitor = JSON.parse(competitorRaw).competitors[0]?.name;
  const reviewRaw = topCompetitor
    ? await callClaudeWithSearch(buildReviewPrompt(topCompetitor, address))
    : null;

  return { location: locationRaw, competitor: competitorRaw, review: reviewRaw };
}
```

## How to expose an agent as an API route

Create `app/api/agents/launch/route.ts` and call `runLaunchAgent()` from it.
