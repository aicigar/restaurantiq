# Deployment Guide

## Local development
```bash
npm run dev        # starts at http://localhost:3000
npm run build      # production build check
```

## Deploy to Vercel

```bash
vercel --prod
```

## Environment variables checklist

Before going live, make sure ALL of these are set in Vercel:

- [ ] `ANTHROPIC_API_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_STARTER`
- [ ] `STRIPE_PRICE_GROWTH`
- [ ] `STRIPE_PRICE_CHAIN`
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` ← set to your Vercel domain

## Post-deploy checklist

- [ ] Run DB migration in Supabase SQL editor
- [ ] Create Stripe webhook endpoint pointing to `/api/stripe/webhook`
- [ ] Enable Google OAuth in Supabase → Authentication → Providers
- [ ] Test signup flow end to end
- [ ] Test one analysis with a real Anthropic key
- [ ] Test Stripe checkout in test mode
