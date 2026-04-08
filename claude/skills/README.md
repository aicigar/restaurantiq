# Claude Skills

Skills are reusable prompt templates or chains you can plug into any feature.

## What to put here

Each skill is a `.ts` file that exports a function returning a prompt string.
Unlike feature prompts (which are tied to one module), skills are shared utilities.

## Skills to build

| File | Purpose | Status |
|------|---------|--------|
| `summarize.ts` | Summarise any long text to 3 bullet points | 📋 Planned |
| `translate.ts` | Translate a report into another language | 📋 Planned |
| `score-explainer.ts` | Plain-English explanation of any score | 📋 Planned |
| `action-ranker.ts` | Rank a list of actions by ROI | 📋 Planned |
| `email-writer.ts` | Write a professional email from report data | 📋 Planned |

## Example skill

```ts
// claude/skills/summarize.ts
export function buildSummarizeSkill(text: string): string {
  return `Summarise the following in exactly 3 bullet points.
Be concise. No intro sentence. Just the bullets.

Text to summarise:
${text}`;
}
```

## How to use a skill

Import it in any API route and pass it to `callClaudeWithSearch()`:

```ts
import { buildSummarizeSkill } from "@/claude/skills/summarize";
const summary = await callClaudeWithSearch(buildSummarizeSkill(reportText));
```
