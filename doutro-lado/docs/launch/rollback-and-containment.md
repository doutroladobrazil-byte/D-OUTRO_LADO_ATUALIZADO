# D'OUTRO LADO — Rollback & Containment Plan
> Etapa 10 · April 2026

---

## Scenario 1 — Checkout returning 500

**Symptoms:** `POST /api/stripe/checkout` returns 5xx. Buyers cannot complete purchase.

**Immediate containment:**
1. Check `/api/health/ready` — if DB is down, that's the root cause
2. Check Render logs for stack trace
3. If Stripe keys misconfigured: set `PAYMENTS_MODE=mock` temporarily (mock mode bypasses Stripe, orders still record)
4. If DB unavailable: enable maintenance page (Render → custom error page or 503 redirect)

**Rollback (code):**
```bash
git revert HEAD           # revert last commit
git push origin main      # redeploy
```
Or in Render: use "Previous deploy" rollback button.

**Partial containment — disable checkout only:**
- Set `PAYMENTS_MODE=mock` in env → redeploy. Buyers complete "orders" without real payment. Lets the rest of the site run.
- Communicate to customers manually if any real purchases were in flight.

---

## Scenario 2 — Stripe Webhook Failing

**Symptoms:** `webhook_processing_error` in logs. Orders stuck at `awaiting_payment` after Stripe confirms payment.

**Immediate containment:**
1. Check webhook signature: confirm `STRIPE_WEBHOOK_SECRET` in env matches Stripe dashboard endpoint
2. Go to Stripe Dashboard → Developers → Webhooks → select endpoint → resend last failed event
3. If signature mismatch: rotate secret in Stripe, update env var, redeploy

**Manual recovery for stuck orders:**
```bash
# In admin panel: find order by Stripe session ID
# PATCH /api/admin/orders/:id with { "paymentStatus": "paid", "orderStatus": "processing" }
```
Or use the admin order detail page → update status manually.

**Do NOT:** Manually deduct stock for orders you manually mark as paid — `deductStockForOrder` runs inside the webhook. Manually review stock levels after any manual intervention.

---

## Scenario 3 — Reservations Stuck / Stock Not Released

**Symptoms:** Stock appears consumed but orders are cancelled or expired. Reservation expiry job not running.

**Immediate containment:**
```bash
# Trigger expiry manually
curl -X POST https://[api]/api/internal/reservations/expire \
  -H "Authorization: Bearer $RECOVERY_JOB_SECRET"
```

**Verify:**
- Check `/api/admin/stock` before and after — stock should be restored
- Check logs for `reservations_expired count: N`

**If cron job is down:** Register it again in Render cron or external scheduler. The endpoint is idempotent — safe to call multiple times.

---

## Scenario 4 — Media Unavailable

**Symptoms:** Product images return 404. PDP shows broken images.

**Root causes:**
- Supabase bucket made private (should be public)
- CORS policy blocking frontend domain
- `SUPABASE_SERVICE_ROLE_KEY` expired or wrong (only affects uploads, not reads)

**Containment:**
1. Verify bucket policy in Supabase → Storage → product-media → Settings → Public ON
2. If CORS: add `https://doutrolado.com` to bucket CORS policy
3. New uploads: re-upload via admin media manager once key is corrected

**Site impact:** Site remains functional — products show monogram placeholder. Not P0.

---

## Scenario 5 — Country Policy Misconfigured

**Symptoms:** Checkout not showing expected freight, wrong currency, guest blocked in wrong country.

**Containment (no redeploy needed):**
1. Go to `/admin/countries` (or equivalent)
2. Edit the affected country's commerce rule and policy via admin UI
3. Changes are real-time — no deploy required

**If checkout is blocked for all countries:**
- Set `checkoutEnabled: true` and `allowGuestCheckout: true` on target countries via admin
- If admin is broken too: patch directly in DB via Supabase SQL editor

---

## Scenario 6 — Admin Dashboard Broken

**Symptoms:** `/admin` returns 500 or blank.

**Impact:** Operations blocked. No order management.

**Containment:**
1. Direct DB access via Supabase Studio: view orders at `SELECT * FROM orders ORDER BY created_at DESC`
2. Mark orders as paid manually via SQL: `UPDATE orders SET payment_status='paid', order_status='processing' WHERE stripe_session_id='...'`
3. Fix and redeploy code; admin is separate from storefront — buyer experience unaffected

---

## Scenario 7 — Full Site Down

**Symptoms:** Frontend returns 503. Render reports service unhealthy.

**Containment:**
1. Check Render dashboard for deploy failures or crash loops
2. Roll back to previous deploy (Render UI → Manual Deploy → previous commit)
3. If rollback fails: disable custom domain, Render serves default "paused" page
4. Communicate via other channels (email, WhatsApp to known buyers)

---

## Kill Switches (no code needed)

| Toggle | How | Effect |
|---|---|---|
| Disable checkout entirely | `checkoutEnabled: false` on all countries in DB | Checkout step blocked; browsing still works |
| Disable guest checkout | `allowGuestCheckout: false` on all countries | Guests cannot checkout; logged-in users unaffected |
| Switch to mock payments | `PAYMENTS_MODE=mock` in env + redeploy | Orders created, no real Stripe charge |
| Block specific country | `is_active: false` on that country | Country hidden from selector |
| Take site to maintenance | Render → add maintenance redirect or custom 503 | Entire site blocked |
