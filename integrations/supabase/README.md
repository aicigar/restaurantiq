# Supabase Integration

Auth, database, and row-level security all handled by Supabase.

## Files

| File | Purpose |
|------|---------|
| `lib/supabase/client.ts` | Browser-side client (used in React components) |
| `lib/supabase/server.ts` | Server-side client (used in API routes) |
| `lib/supabase/middleware.ts` | Session refresh on every request |
| `middleware.ts` | Protects `/dashboard/*` routes |
| `supabase/migrations/001_initial.sql` | Full database schema |

## Tables

### profiles
Extends Supabase `auth.users`. One row per user.
- `plan` — free / starter / growth / chain / enterprise
- `reports_used_this_month` — reset automatically each month
- `stripe_customer_id` — links to Stripe

### reports
One row per analysis run.
- `module` — location / reviews / competitors
- `result_data` — full JSON from Claude (jsonb)
- `score` — the top-level score (0-100)

## To add a new table

1. Write a new migration file: `supabase/migrations/002_your_table.sql`
2. Run it in the Supabase SQL editor
3. Add RLS policies to restrict access by `auth.uid()`

## To add a new column to profiles

```sql
alter table public.profiles add column your_field text;
```

Run this in the Supabase SQL editor.
