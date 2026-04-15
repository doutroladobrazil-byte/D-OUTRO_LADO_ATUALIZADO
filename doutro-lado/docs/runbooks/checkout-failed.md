# Runbook: Checkout Failed

## Symptom

Customer reports they cannot complete checkout. Error displayed on the checkout page, or checkout button does nothing.

Common symptoms:
- "Failed to start payment. Please try again."
- "One or more items in your bag are no longer available."
- "Guest checkout is not available for this destination."
- HTTP 400/500 from `POST /api/stripe/checkout`

---

## Possible Causes

| Cause | How to identify |
|---|---|
| Item out of stock / reservation clash | Error contains "stock", "unavailable", "esgotado" |
| Guest checkout not allowed for country | Error contains "guest checkout" |
| Stripe session creation failed | `stripe_session_failed` log entry; Stripe dashboard shows error |
| Invalid order payload (validation error) | HTTP 400, Zod validation message in error.message |
| DB unreachable at checkout time | HTTP 500, `checkout_failed` log with DB error |
| Reservation TTL too short | Items reserved, then expiry runs before Stripe redirect |

---

## How to Verify

1. **Check backend logs** (Render log stream or drain):
   ```
   grep "checkout_failed\|stripe_session_failed\|checkout_initiated" logs
   ```

2. **Check health endpoint**:
   ```bash
   curl https://your-api.com/api/health/ready
   ```
   If `checks.database.ok = false` → DB is the root cause.
   If `checks.stripe.ok = false` → Stripe keys are missing or wrong.

3. **Check Stripe Dashboard → Logs** for session creation errors.

4. **Check admin_logs table** for recent `checkout_expired` or `payment_confirmed` events to understand the volume of affected orders.

5. **Check stock levels** in `/admin/inventory` — if a product shows `available = 0` but stock is > 0, there may be stuck reservations.

---

## How to Mitigate

### Out of stock / stuck reservations
```bash
# Manually trigger reservation expiry
curl -X POST https://your-api.com/api/internal/reservations/expire \
  -H "Authorization: Bearer $RECOVERY_JOB_SECRET"
```
Then verify in `/admin/inventory` that available count increased.

### Stripe keys wrong
1. Go to Render (or hosting) → Environment → update `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
2. Restart the service
3. Re-run `curl /api/health/ready` to confirm `checks.stripe.ok = true`

### DB unreachable
1. Check Neon dashboard for connection issues or paused instance
2. Check `DATABASE_URL` in Render env vars — might have rotated
3. If paused: resume the Neon project

### Guest checkout blocked
- Verify `allow_guest_checkout` in `country_commerce_rules` for the country in question
- Update via admin: `/admin/countries/{code}/policy` or direct DB update

---

## When to Escalate

- Checkout failing for all customers across all countries (possible DB or Stripe outage)
- Stripe Dashboard shows systematic errors (not isolated)
- `health/ready` shows multiple unhealthy checks simultaneously
- DB connection errors that persist after restart
