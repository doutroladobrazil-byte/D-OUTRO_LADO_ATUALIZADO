# D'OUTRO LADO — Go-Live Run Sheet
> Etapa 10 · April 2026  
> Print or open this on a second screen during launch day. Work through it sequentially.

---

## T-60 min — Pre-flight

**Who:** Tech lead + ops

| Action | Verify | OK? |
|---|---|---|
| All env vars set in production | `curl https://[api]/api/health/ready` → `ok: true` | 🔲 |
| `prisma migrate deploy` run against DIRECT_URL | Latest migration is `20260415000012_stage17` | 🔲 |
| Database seed applied (countries, freight rates) | `/api/countries` returns 6 countries | 🔲 |
| PAYMENTS_MODE=stripe confirmed | `health/ready` → `paymentsMode: "stripe"` | 🔲 |
| Stripe webhook registered and tested | Stripe Dashboard → webhook shows recent 200 delivery | 🔲 |
| Supabase Storage bucket accessible | Upload test image via admin → visible in product media | 🔲 |
| At least 1 admin account active | Login to /admin → dashboard loads | 🔲 |
| All launch SKUs active + stocked | `/admin/stock` → all launch SKUs > 0 | 🔲 |
| Cron jobs registered | Reservation expiry + bag recovery in scheduler | 🔲 |

**If any check fails:** Do not proceed. Fix and restart T-60.

---

## T-30 min — Smoke pass

**Who:** Tech lead (or designated tester)

| Action | Expected | OK? |
|---|---|---|
| Home loads | Products, hero, trust strip visible | 🔲 |
| PDP loads for each launch SKU | Name, price, media, add-to-cart visible | 🔲 |
| Add to cart → cart page | Item in cart, total shown | 🔲 |
| Checkout → select country → fill form | No errors, CTA enabled | 🔲 |
| Checkout submit (mock mode or Stripe test) | Success screen or Stripe redirect | 🔲 |
| Admin → orders → order appears | Order row visible | 🔲 |
| `/api/health/live` | `ok: true` | 🔲 |
| `/api/health/ready` | `ok: true, checks: all true` | 🔲 |

**If any check fails:** Fix immediately. Delay T-0 if needed.

---

## T-15 min — Final hold

**Who:** All stakeholders

| Action | OK? |
|---|---|
| Confirm no pending code deploys in progress | 🔲 |
| Confirm DNS propagated (if domain switch) | 🔲 |
| Confirm team notified: launch in 15 min | 🔲 |
| Confirm this run sheet is open and everyone has role assigned | 🔲 |

---

## T-0 — Launch

**Who:** Ops

| Action | OK? |
|---|---|
| Enable public traffic (DNS / Render → remove maintenance page / publish) | 🔲 |
| Log launch timestamp: `________________________` | 🔲 |
| Post launch notification to internal channel | 🔲 |

---

## T+15 min — First check

**Who:** Tech + ops monitoring

| Signal | Check | OK? |
|---|---|---|
| `/api/health/ready` still 200 | No dep degradation | 🔲 |
| Backend logs | No 500s or unhandled rejections | 🔲 |
| At least 1 successful checkout simulation | Logs show `checkout_initiated` | 🔲 |
| No spike in error rate | Log aggregator / Render metrics | 🔲 |

---

## T+1h — Stability check

| Signal | Check | Threshold |
|---|---|---|
| Orders created | Admin → orders | ≥ 0 (could be 0 on soft launch) |
| Payment webhooks | `webhook_received` + `payment_confirmed` in logs | 100% of paid orders |
| Reservation expiry job | Logs show job ran | Must have run ≥ 2× |
| Media loading | Spot-check 2 PDPs | No broken images |
| Admin dashboard | Overview loads without error | — |

---

## T+4h — Extended stability

| Signal | Check | OK? |
|---|---|---|
| Any P0 incident? | Check rollback doc if yes | 🔲 |
| Order:payment ratio | Every paid order has a confirmed webhook | 🔲 |
| Cart recovery job | Logs show job ran if any abandoned bags exist | 🔲 |
| Error budget | < 1% 5xx on checkout endpoint | 🔲 |

---

## T+24h — Day 1 close

| Action | OK? |
|---|---|
| Review all orders in admin | 🔲 |
| Confirm no stuck reservations (expiry job cleared them) | 🔲 |
| Review any customer support contacts | 🔲 |
| Log incidents and resolutions | 🔲 |
| Schedule post-launch retrospective | 🔲 |

---

## Escalation

| Severity | Trigger | Action |
|---|---|---|
| P0 | Checkout 500 or payment loop | Rollback → see `rollback-and-containment.md` |
| P1 | Webhook failing > 5 min | Check Stripe → see runbook |
| P1 | Reservation stuck | See runbook `reservation-stuck.md` |
| P2 | Media not loading | See runbook `media-upload-failed.md` |
