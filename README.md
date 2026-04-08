# RestaurantIQ

AI-powered restaurant location and business intelligence platform. Helps restaurant operators make smarter decisions using Claude AI with live web search.

## Features

- **Location Scorer** — Enter any US address + concept → scored go/no-go with 8 demographic factors, competitor map, and alternative locations
- **Review Analyzer** — Live sentiment analysis from Google, Yelp, TripAdvisor, DoorDash, and Uber Eats
- **Competitor Radar** — Map real nearby competitors, identify market gaps, get positioning advice

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude claude-sonnet-4-20250514 with web_search tool
- **Auth + Database**: Supabase
- **Payments**: Stripe subscriptions
- **Email**: Resend
- **PDF**: jsPDF
- **Deployment**: Vercel

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd restaurantiq
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API (service role key) |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks (after creating endpoint) |
| `STRIPE_PRICE_STARTER` | Stripe → Products → create $49/mo price → copy Price ID |
| `STRIPE_PRICE_GROWTH` | Stripe → Products → create $149/mo price → copy Price ID |
| `STRIPE_PRICE_CHAIN` | Stripe → Products → create $399/mo price → copy Price ID |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (dev) or your Vercel URL (prod) |

### 3. Set up Supabase database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Paste the contents of `supabase/migrations/001_initial.sql` and run it

### 4. Create Stripe products

1. Go to Stripe Dashboard → **Products** → Add product
2. Create three recurring products:
   - **Starter** — $49/month
   - **Growth** — $149/month
   - **Chain** — $399/month
3. Copy each Price ID (`price_xxx`) into `.env.local`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Set up Stripe webhooks (local testing)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

### 7. Deploy to Vercel

```bash
vercel --prod
```

After deploying:
1. Add all env vars in Vercel → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
3. Create a Stripe webhook endpoint at `https://yourdomain.vercel.app/api/stripe/webhook` with events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Enable Google OAuth in Supabase → Authentication → Providers → Google

## Project Structure

```
restaurantiq/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Landing page
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── pricing/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                # Auth guard
│   │   ├── page.tsx                  # Main dashboard
│   │   └── history/page.tsx          # Saved reports
│   └── api/
│       ├── analyse/location/
│       ├── analyse/reviews/
│       ├── analyse/competitors/
│       ├── stripe/checkout/
│       ├── stripe/webhook/
│       ├── stripe/portal/
│       └── email/send/
├── components/
│   ├── ScoreRing.tsx
│   ├── BarRow.tsx
│   ├── ThreatBadge.tsx
│   ├── ExportToolbar.tsx
│   ├── Sidebar.tsx
│   └── modules/
│       ├── LocationScorer.tsx
│       ├── ReviewAnalyzer.tsx
│       └── CompetitorRadar.tsx
├── lib/
│   ├── anthropic.ts
│   ├── stripe.ts
│   ├── usage.ts
│   ├── resend.ts
│   ├── supabase/
│   └── reports/
├── middleware.ts
├── vercel.json
└── supabase/migrations/001_initial.sql
```

## Pricing Plans

| Plan | Price | Reports/month |
|------|-------|---------------|
| Free | $0 | 0 (upgrade required) |
| Starter | $49/mo | 5 |
| Growth | $149/mo | 25 |
| Chain | $399/mo | Unlimited |
| Enterprise | Custom | Unlimited + API access |

## License

MIT
