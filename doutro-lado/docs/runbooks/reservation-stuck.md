# Runbook: Reservation Stuck / Stock Appears Unavailable

## Symptom

- Customer cannot add item to checkout: "out of stock" but product appears to have stock in admin
- `/admin/inventory` shows `stock > 0` but `available = 0` (all units reserved)
- Reservation expiry cron is not running or has not run recently
- Item was abandoned in checkout by a previous customer but stock was never freed

---

## Possible Causes

| Cause | How to identify |
|---|---|
| Expiry cron not running | No `reservations_expired` log entries recently |
| Cron secret wrong | 401 response when cron hits `POST /internal/reservations/expire` |
| All stock genuinely reserved by active checkouts | Multiple concurrent customers at checkout |
| Reservation TTL too long | `RESERVATION_TTL_MINUTES` set too high |
| Stripe session expired but `checkout.session.expired` webhook not delivered | Check Stripe webhook deliveries |

---

## How to Verify

1. **Backend logs** — look for `reservations_expired` entries:
   - If none in the last 10 minutes, the cron is not running
   - If present but `count = 0`, no reservations are eligible to expire yet

2. **Check inventory API**:
   ```bash
   curl https://your-api.com/api/admin/stock -H "Authorization: Bearer $ADMIN_TOKEN"
   ```
   Compare `stock` vs `available` per SKU.

3. **Check DB directly** (if available):
   ```sql
   SELECT r.id, r.product_id, r.quantity, r.status, r.expires_at, o.public_id
   FROM stock_reservations r
   JOIN orders o ON o.id = r.order_id
   WHERE r.status = 'active'
   ORDER BY r.expires_at;
   ```
   Reservations with `expires_at < NOW()` should have been expired already.

4. **Check cron job** in your cron provider (Render Cron Jobs, GitHub Actions, etc.) for recent runs and exit codes.

---

## How to Mitigate

### Manually trigger reservation expiry
```bash
curl -X POST https://your-api.com/api/internal/reservations/expire \
  -H "Authorization: Bearer $RECOVERY_JOB_SECRET"
```
Response: `{"ok":true,"data":{"expired":N}}`

Run this as many times as needed — it is idempotent and safe.

### Fix cron not running
1. Verify the cron provider is configured to call `POST /api/internal/reservations/expire` every 5 minutes
2. Verify it sends `Authorization: Bearer <RECOVERY_JOB_SECRET>` header
3. Check `RECOVERY_JOB_SECRET` matches in both cron config and Render env vars
4. If using Render Cron Jobs: check the job definition and recent logs

### Reduce reservation TTL
If stock is frequently getting stuck, reduce `RESERVATION_TTL_MINUTES` (default: 20).
Update via Render env vars and restart. New reservations will expire faster.

### Force-expire specific reservations (DB, last resort)
```sql
UPDATE stock_reservations
SET status = 'expired', released_at = NOW()
WHERE status = 'active'
  AND order_id = '<order_id>';
```

---

## When to Escalate

- All products show `available = 0` despite no active customers at checkout
- Cron is running but reservations are not expiring
- DB query shows no `active` reservations but `available` counts are still 0 (inconsistent stock table)
