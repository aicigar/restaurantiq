# Stripe Integration

All Stripe logic lives in `lib/stripe.ts` and `app/api/stripe/`.

## Files

| File | Purpose |
|------|---------|
| `lib/stripe.ts` | Stripe client, plan limits, price→plan mapping |
| `app/api/stripe/checkout/route.ts` | Create checkout session |
| `app/api/stripe/webhook/route.ts` | Handle subscription events |
| `app/api/stripe/portal/route.ts` | Billing portal for users |

## Plans & price IDs

Set these in `.env.local`:
```
STRIPE_PRICE_STARTER=price_xxx   → $49/mo → 5 reports
STRIPE_PRICE_GROWTH=price_xxx    → $149/mo → 25 reports
STRIPE_PRICE_CHAIN=price_xxx     → $399/mo → unlimited
```

## To add a new plan

1. Create a new product in Stripe dashboard
2. Add the price ID to `.env.local`
3. Add to `PLAN_LIMITS` in `lib/stripe.ts`
4. Add to `PRICE_TO_PLAN` in `lib/stripe.ts`
5. Add to the pricing page in `app/pricing/page.tsx`
6. Add to the Supabase `profiles` table `plan` check constraint

## Webhook events handled

- `customer.subscription.created` → set plan in DB
- `customer.subscription.updated` → update plan in DB
- `customer.subscription.deleted` → reset to free
- `invoice.payment_failed` → (optional) send email alert
