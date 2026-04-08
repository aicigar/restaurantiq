# Resend Integration

Handles all transactional emails.

## Files

| File | Purpose |
|------|---------|
| `lib/resend.ts` | Resend client + `sendReportEmail()` function |
| `app/api/email/send/route.ts` | API route called by the Email button in dashboard |

## To change the "from" address

Edit `lib/resend.ts`:
```ts
from: "RestaurantIQ Reports <reports@yourdomain.com>"
```
You must verify your domain in the Resend dashboard first.

## Emails you could add

| Email | Trigger | Where to add |
|-------|---------|-------------|
| Welcome email | User signs up | Supabase auth webhook → `/api/email/welcome` |
| Weekly digest | Cron job (Vercel) | New route `/api/cron/weekly-digest` |
| Plan limit warning | When user hits 80% of limit | In `lib/usage.ts` |
| Payment failed | Stripe webhook | In `app/api/stripe/webhook/route.ts` |

## To add a new email template

1. Create a new function in `lib/resend.ts`
2. Build the HTML body using `buildHTMLReport()` or custom HTML
3. Call `resend.emails.send()` with the template
