# API Reference

All API routes live under `app/api/`.

## Analysis Routes

### POST /api/analyse/location
```json
Request:  { "address": "123 Main St, Chicago IL", "concept": "Halal Chicken & Burgers" }
Response: { LocationResult + "reportId": "uuid" }
```

### POST /api/analyse/reviews
```json
Request:  { "name": "Halal Guys", "city": "New York, NY" }
Response: { ReviewResult + "reportId": "uuid" }
```

### POST /api/analyse/competitors
```json
Request:  { "location": "Jackson Heights, Queens NY", "concept": "South Asian", "radius": 2 }
Response: { CompetitorResult + "reportId": "uuid" }
```

**All analysis routes require:**
- Auth cookie (user must be logged in)
- Active plan with reports remaining
- Returns 401 if not logged in
- Returns 403 with `code: "PLAN_LIMIT"` if over monthly limit

---

## Stripe Routes

### POST /api/stripe/checkout
```json
Request:  { "priceId": "price_xxx" }
Response: { "url": "https://checkout.stripe.com/..." }
```

### POST /api/stripe/portal
```json
Request:  {} (no body needed)
Response: { "url": "https://billing.stripe.com/..." }
```

### POST /api/stripe/webhook
Stripe calls this automatically. Do not call manually.

---

## Email Route

### POST /api/email/send
```json
Request:  { "to": "user@example.com", "subject": "Your Report", "reportId": "uuid" }
Response: { "success": true }
```

---

## Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Not logged in |
| `PLAN_LIMIT` | 403 | Monthly report limit reached |
| `VALIDATION_ERROR` | 400 | Missing required fields |
| `PARSE_ERROR` | 422 | Claude returned unparseable response |
| `NOT_FOUND` | 404 | Report not found or doesn't belong to user |
| `API_ERROR` | 500 | Anthropic or Supabase failure |
