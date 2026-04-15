# Go-Live Checklist — D'OUTRO LADO

Use this before opening traffic. Check every item. If something is unclear, fix it before proceeding.

---

## 1. Environment Variables

### Backend (Render / hosting)
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` — Neon PostgreSQL connection string
- [ ] `SUPABASE_JWT_SECRET` — from Supabase Dashboard → Settings → API → JWT Secret
- [ ] `SUPABASE_URL` — project URL (needed for media upload)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — service role key (needed for media upload, admin auth)
- [ ] `SUPABASE_STORAGE_BUCKET_MEDIA` — usually `product-media`
- [ ] `APP_URL` — frontend base URL (e.g. `https://doutrolado.com`)
- [ ] `PAYMENTS_MODE=stripe`
- [ ] `STRIPE_SECRET_KEY` — live or test key (must match Stripe webhook)
- [ ] `STRIPE_WEBHOOK_SECRET` — from Stripe Dashboard → Webhooks → endpoint secret
- [ ] `RESEND_API_KEY` — for order confirmation emails
- [ ] `RECOVERY_EMAIL_FROM` — verified sender domain
- [ ] `RECOVERY_JOB_SECRET` — random secret for internal cron endpoint auth
- [ ] `RESERVATION_TTL_MINUTES` — default 20, tune if needed

### Frontend (Vercel / hosting)
- [ ] `NEXT_PUBLIC_API_URL` — empty or `/api` for same-origin; full URL if cross-origin
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — server-only, for admin layout auth

---

## 2. Secrets & Security

- [ ] Stripe live keys are set (not test keys) if launching to real customers
- [ ] Supabase JWT secret matches the one the backend uses
- [ ] Service role key is server-only — not exposed in `NEXT_PUBLIC_*`
- [ ] `RECOVERY_JOB_SECRET` is a strong random value (not guessable)
- [ ] Dev tokens (`DEV_ADMIN_TOKEN` etc.) are NOT set in production env

---

## 3. Database

- [ ] All Prisma migrations applied: `wsl bash -c "npx prisma migrate deploy"`
- [ ] Tables exist: run `GET /health/ready` and confirm `checks.database.ok = true`
- [ ] Country seed applied: at least 1 country active with `checkout_enabled = true`
- [ ] Country commerce rules populated (currency, tax, guest checkout flag)
- [ ] Country policies seeded for each active checkout country
- [ ] `supported_countries` has correct `checkout_enabled` flags
- [ ] No orphaned data from dev/staging seeds in production

---

## 4. Stripe

- [ ] Stripe webhook endpoint registered pointing to `POST /api/stripe/webhook`
- [ ] Webhook events enabled: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`
- [ ] Webhook signing secret matches `STRIPE_WEBHOOK_SECRET` env var
- [ ] Test a webhook delivery from Stripe Dashboard → Webhooks → Send test event
- [ ] Stripe account is in live mode (not test mode) if launching for real payments

---

## 5. Supabase Storage

- [ ] Bucket `product-media` (or configured name) exists and is public
- [ ] RLS policies allow public read on the bucket
- [ ] Service role key can write to the bucket (test via admin media upload)

---

## 6. Content & Products

- [ ] All active products have a primary media asset (image or video with poster)
- [ ] Primary media URLs are accessible (not 404, not behind auth)
- [ ] Product cost prices filled in for margin snapshot accuracy
- [ ] Featured products are marked `is_featured = true`
- [ ] Product prices are correct (BRL retail + wholesale if applicable)
- [ ] Stock values are accurate (not dev test values)
- [ ] All products intended for public display have `is_active = true`

---

## 7. Countries & Policies

- [ ] Each checkout country has: delivery note, returns policy, support email
- [ ] `checkout_notice` text reviewed for each active country
- [ ] `order_confirmation_note` reviewed for each active country
- [ ] `allow_guest_checkout` flag reviewed per country
- [ ] Estimated delivery ranges reviewed

---

## 8. Admin Access

- [ ] At least one profile has `role = admin` in `profiles` table
- [ ] Admin login tested end-to-end: `/admin` redirects properly
- [ ] Admin can view orders, products, stock, countries

---

## 9. Scheduled Jobs

- [ ] Cron job calling `POST /api/internal/reservations/expire` every 5 minutes is active
  - Must send `Authorization: Bearer <RECOVERY_JOB_SECRET>` header
- [ ] Job failure alerts are configured (if applicable)

---

## 10. Smoke Tests

Run the full smoke test checklist: see `docs/launch/smoke-tests.md`

- [ ] Catalog page loads with real product images
- [ ] Product detail page loads
- [ ] Checkout flow completes (test card or real card in live mode)
- [ ] Order appears in admin after payment
- [ ] Order confirmation email received
- [ ] Reservation expiry cron releases stuck reservations
- [ ] Admin dashboard shows correct overview

---

## 11. Rollback Plan

Before going live, decide:
- [ ] How to revert if the deploy breaks (Render: roll back to previous deploy)
- [ ] How to pause checkout if needed (set `checkout_enabled = false` on all countries in DB)
- [ ] How to disable new orders if needed (set `PAYMENTS_MODE=mock` and redeploy)
- [ ] DB backup exists before running migrations

---

## Final Gate

Only open traffic when ALL items above are checked.

If any item is blocked and cannot be fixed immediately, document the exception and make an explicit call to proceed or not.
