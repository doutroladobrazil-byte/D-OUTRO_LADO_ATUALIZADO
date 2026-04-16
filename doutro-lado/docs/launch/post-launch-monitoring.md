# D'OUTRO LADO — Post-Launch Monitoring Plan
> Etapa 10 · April 2026  
> Covers the first 24 hours after go-live.

---

## Check Cadence

| Window | Frequency | Who |
|---|---|---|
| First 2 hours | Every 15 min | Tech on-call |
| Hours 2–8 | Every 30 min | Tech on-call |
| Hours 8–24 | Every 2 hours | Ops |
| After 24h | Per incident or daily batch | Standard ops |

---

## Signal Checklist (run on each check cycle)

### Infrastructure
```bash
# 1. Liveness
curl https://[api]/api/health/live
# Expected: {"ok":true,"status":"live"}

# 2. Readiness (all deps)
curl https://[api]/api/health/ready
# Expected: {"ok":true,"checks":{"database":{"ok":true},"auth":{"ok":true},"stripe":{"ok":true},"storage":{"ok":true}}}

# 3. Catalog responding
curl https://[api]/api/products?limit=1
# Expected: JSON with data array
```

### Commercial signals (check in Render logs or log aggregator)

| Signal | What to look for | Alert if |
|---|---|---|
| `checkout_initiated` | Order being created | Sudden drop to 0 over 30 min during traffic |
| `stripe_session_created` | Stripe checkout URL generated | Missing for > 5 min while checkouts are being initiated |
| `payment_confirmed` | Webhook received, stock deducted | Not matching `stripe_session_created` count |
| `webhook_processing_error` | Stripe webhook failed | Any occurrence |
| `reservations_expired` | Expiry job ran | Missing for > 15 min |

### Admin checks
- [ ] `https://[site]/admin` → dashboard loads, no 500
- [ ] Orders tab → new orders appear in expected timeframe
- [ ] Orders:Payments ratio → all paid orders have payment_status = "paid"

---

## Alert Thresholds

| Metric | Warning | Critical |
|---|---|---|
| `/health/ready` HTTP status | — | 503 for > 2 min |
| 5xx rate on `/stripe/checkout` | > 1% | > 5% |
| `webhook_processing_error` count | 1 | 3+ |
| Time since last reservation expiry job | > 10 min | > 20 min |
| Stripe → paid orders not matching admin | 1 gap | Any |

---

## When to Escalate

| Situation | Action |
|---|---|
| `/health/ready` returns 503 | Check DB connection → see rollback doc |
| Stripe webhook fails 3× | Check signature, redeploy, trigger from Stripe dashboard |
| Payment confirmed but order still `awaiting_payment` | Check `payment_confirmed` log + manual patch in admin |
| Any 5xx on checkout for > 5 min | Escalate immediately; consider maintenance page |
| Stock discrepancy (reservation not released) | Run `/api/internal/reservations/expire` manually |

---

## Incident Registration

When something goes wrong, log it immediately:

```
Date: ___________  Time: ___________
Severity: P0 / P1 / P2
Description: _________________________
First noticed: _______________________
Impact: # orders affected / pages broken / admin blocked
Actions taken: _______________________
Resolution: _________________________
Post-mortem needed: Y / N
```

Add to `docs/incidents/` folder (create if needed).

---

## Useful Commands

```bash
# Manually trigger reservation expiry
curl -X POST https://[api]/api/internal/reservations/expire \
  -H "Authorization: Bearer $RECOVERY_JOB_SECRET"

# Manually trigger bag recovery
curl -X POST https://[api]/api/internal/recovery/process \
  -H "Authorization: Bearer $RECOVERY_JOB_SECRET"

# Trigger Stripe webhook replay
# Go to: Stripe Dashboard → Developers → Webhooks → select endpoint → resend event
```
