# Claude API Reference

Quick reference for the Claude API features used in this project.

## Model used

```
claude-sonnet-4-6
```

Swap the model in `lib/anthropic.ts` to upgrade or downgrade.

| Model | Speed | Intelligence | Cost |
|-------|-------|-------------|------|
| `claude-haiku-4-5-20251001` | Fastest | Good | Cheapest |
| `claude-sonnet-4-6` ← current | Fast | Very High | Mid |
| `claude-opus-4-6` | Slower | Best | Most expensive |

---

## Web Search Tool

Used in all 3 modules to fetch live data.

```ts
tools: [{ type: "web_search_20250305", name: "web_search" }]
```

**When Claude uses it:** automatically when it needs current data (ratings, census figures, competitor listings).

**Cost:** each search call counts as additional tokens.

---

## Key API parameters

| Parameter | Current value | What it does |
|-----------|--------------|-------------|
| `max_tokens` | 4000 | Max length of Claude's reply — increase if responses get cut off |
| `model` | `claude-sonnet-4-6` | The Claude model version |
| `system` | RestaurantIQ system prompt | Sets Claude's persona and output rules |

---

## Useful Claude API features to explore

### Extended Thinking
Makes Claude reason through problems step by step before answering.
Good for: complex location decisions, multi-factor trade-offs.
```ts
thinking: { type: "enabled", budget_tokens: 5000 }
```

### Streaming
Stream Claude's response token by token so users see output immediately.
Good for: reducing perceived wait time on 30-40 second analyses.
```ts
stream: true
```

### Prompt Caching
Cache the system prompt to reduce cost on repeated calls.
Good for: cutting API costs by up to 90% on the system prompt.
```ts
{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }
```

### Vision / Image Input
Send images to Claude (e.g. photos of a storefront, menu, or competitor signage).
Good for: "analyse this location photo" feature.
```ts
{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: "..." } }
```

---

## Official docs

- API reference: https://docs.anthropic.com/en/api
- Tool use: https://docs.anthropic.com/en/docs/tool-use
- Models: https://docs.anthropic.com/en/docs/models-overview
- Prompt caching: https://docs.anthropic.com/en/docs/prompt-caching
