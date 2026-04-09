# RestaurantIQ — Deployment Guide

## Step 1 — Local build check
Run this before anything else to catch errors:
```bash
npm run build
```
Must show `✓ Compiled successfully` with no red errors before continuing.

---

## Step 2 — Create GitHub repo
1. Go to github.com/new
2. Name it `restaurantiq`
3. Set to **Private**
4. Do NOT add README or .gitignore (already in project)
5. Copy the repo URL shown on the page

---

## Step 3 — Push code to GitHub
Run in terminal inside your project folder:
```bash
git config --global user.email "your@email.com"
git config --global user.name "Your Name"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/restaurantiq.git
git push -u origin main
```
✓ Success looks like: `Writing objects: 100%` and `Everything up-to-date`
> Your `.env.local` is in `.gitignore` — secrets are never pushed to GitHub.

---

## Step 4 — Deploy to Vercel
1. Go to vercel.com → sign in with GitHub
2. Click **Add New... → Project**
3. Find `restaurantiq` in the list → click **Import**
4. Framework: Next.js (auto-detected — leave as is)
5. Click **Deploy**

> First deploy will fail with a middleware error — that's expected. Env vars are missing. Continue to Step 5.

---

## Step 5 — Add environment variables in Vercel
Go to your Vercel project → **Settings → Environment Variables**

Add all of these (Key = left, Value = right):

| Key | Where to get the value |
|-----|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Set up in Step 7 — come back to add this |
| `STRIPE_PRICE_STARTER` | Stripe → Products → Starter plan → copy Price ID (price_xxx) |
| `STRIPE_PRICE_GROWTH` | Stripe → Products → Growth plan → copy Price ID (price_xxx) |
| `STRIPE_PRICE_CHAIN` | Stripe → Products → Chain plan → copy Price ID (price_xxx) |
| `RESEND_API_KEY` | resend.com → API Keys |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL e.g. `https://restaurantiq.vercel.app` |
| `ADMIN_EMAIL` | Your email address — only this email can access `/admin` |

After saving → go to **Deployments** tab → 3 dots on latest → **Redeploy**

---

## Step 6 — Set up Supabase
1. Go to supabase.com → open your project
2. Left sidebar → **SQL Editor**
3. Paste the full contents of `supabase/migrations/001_initial.sql` → click **Run**
4. Left sidebar → **Authentication → Providers → Google** → Enable
   - Go to console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID
   - Authorized redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Paste Client ID + Client Secret into Supabase → Save
5. Left sidebar → **Authentication → URL Configuration**
   - Add your Vercel URL to **Redirect URLs**: `https://restaurantiq.vercel.app/**`

---

## Step 7 — Set up Stripe webhook
1. Go to Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://restaurantiq.vercel.app/api/stripe/webhook`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_`)
6. Go back to Vercel → Settings → Environment Variables → add `STRIPE_WEBHOOK_SECRET` → Redeploy

Also create your 3 Stripe products if not done:
- Starter — $49/month recurring → copy Price ID → `STRIPE_PRICE_STARTER`
- Growth — $149/month recurring → copy Price ID → `STRIPE_PRICE_GROWTH`
- Chain — $399/month recurring → copy Price ID → `STRIPE_PRICE_CHAIN`

---

## Step 8 — Smoke test everything
Go through each item and confirm it works:

- [ ] Landing page loads at your Vercel URL
- [ ] Sign Up with email works
- [ ] Sign In with Google works (after Step 6)
- [ ] Dashboard loads after login
- [ ] Location Scorer — run a real analysis
- [ ] Review Analyzer — run a real analysis
- [ ] Competitor Radar — run a real analysis
- [ ] Stripe checkout — use test card `4242 4242 4242 4242`, any future expiry, any CVC
- [ ] PDF export downloads correctly
- [ ] Email report sends correctly

---

## Optional — Custom domain
1. Vercel → your project → **Settings → Domains**
2. Add your domain (e.g. `restaurantiq.com`)
3. Follow the DNS instructions shown (add CNAME or A record at your domain registrar)
4. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to your custom domain → Redeploy
5. Update Stripe webhook URL to your custom domain
6. Update Supabase redirect URL to your custom domain

---

## Quick reference — useful URLs
| Service | URL |
|---------|-----|
| Vercel dashboard | vercel.com/dashboard |
| Supabase dashboard | supabase.com/dashboard |
| Stripe dashboard | dashboard.stripe.com |
| Anthropic API keys | console.anthropic.com |
| Resend dashboard | resend.com/api-keys |
| Google Cloud Console | console.cloud.google.com |
