# Runbook: Stripe Webhook Failed

## Symptom

Payment completed on Stripe but:
- Order still shows `payment_status = awaiting_payment` in admin
- Customer did not receive confirmation email
- Stock was not deducted
- Reservations were not consumed

Or: Stripe Dashboard shows webhook delivery failures (non-2xx responses from the endpoint).

---

## Possible Causes

| Cause | How to identify |
|---|---|
| Wrong `STRIPE_WEBHOOK_SECRET` | Stripe returns 400 "Invalid webhook payload"; backend log: signature validation error |
| Webhook URL misconfigured | Stripe delivers to wrong endpoint; no `webhook_received` log entries |
| Backend crashed during webhook processing | `webhook_processing_error` log; Stripe retries visible in Dashboard |
| DB error during payment processing | `webhook_processing_error` log with DB message |
| Order ID missing from session metadata | `payment_confirmed` without orderId; deduction skipped |

---

## How to Verify

1. **Stripe Dashboard → Webhooks → your endpoint → Recent deliveries**
   - Look for failed deliveries (non-2xx)
   - Click a failed delivery to see the response body

2. **Backend logs** — search for:
   ```
   webhook_received
   webhook_processing_error
   payment_confirmed
   ```
   A `webhook_received` without a subsequent `payment_confirmed` means processing failed.

3. **Check the order in admin** (`/admin/orders/{publicId}`):
   - `payment_status` should be `paid` after `checkout.session.completed`
   - `order_status` should be `processing`

4. **Check Stripe Dashboard → Payments** — payment should show as `Succeeded`

5. **DB query** (if you have DB access):
   ```sql
   SELECT id, payment_status, order_status, stripe_session_id
   FROM orders
   WHERE stripe_session_id = '<session_id>';
   ```

---

## How to Mitigate

### Resend a specific event from Stripe
1. Stripe Dashboard → Webhooks → your endpoint → Recent deliveries
2. Find the failed `checkout.session.completed` event
3. Click "Resend" — the backend will process it again
4. The handlers are idempotent: stock deduction and reservation consumption are safe to retry

### Webhook secret mismatch
1. Stripe Dashboard → Webhooks → your endpoint → Signing secret
2. Copy the secret
3. Update `STRIPE_WEBHOOK_SECRET` in Render env vars
4. Restart the service
5. Resend the failed event

### Webhook URL wrong
1. Stripe Dashboard → Webhooks → check the endpoint URL
2. Must point to `https://your-api.com/api/stripe/webhook`
3. Update if wrong, then resend failed events

### Manual order status fix (last resort)
If Stripe confirms payment but the order is stuck, update via admin:
- Go to `/admin/orders/{id}`
- Update payment status to `paid` and order status to `processing`

---

## When to Escalate

- Stripe is reporting systematic delivery failures to many customers
- All webhook deliveries are failing (possible backend deploy issue)
- DB is unreachable and orders cannot be updated
- You cannot find the order corresponding to a Stripe payment
