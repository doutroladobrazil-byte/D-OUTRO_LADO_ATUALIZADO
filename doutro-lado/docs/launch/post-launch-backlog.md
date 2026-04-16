# D'OUTRO LADO — Post-Launch Backlog & Scope Freeze
> Etapa 10 · April 2026  
> This document is the explicit scope boundary. Anything not in "Before Launch" is deferred.

---

## What Enters Before Launch (Etapa 10 — this phase)

- [x] QA final matrix executed and documented
- [x] P0/P1 bugs from QA fixed
- [x] `.env.example` updated with `DIRECT_URL` and `RECOVERY_JOB_SECRET`
- [x] Admin page accent bugs fixed (País, não, ausência)
- [x] `launch-config-freeze.md` created
- [x] `go-live-run-sheet.md` created
- [x] `post-launch-monitoring.md` created
- [x] `rollback-and-containment.md` created
- [x] `launch-readiness-summary.md` created (see file)

**Not touching before launch:**
- No new countries
- No new UI pages
- No pricing/cost refactor
- No analytics/attribution system
- No multi-language routing

---

## Known Bugs — Accepted for Launch

| ID | Description | Severity | Reason to accept |
|---|---|---|---|
| B-05 | Stripe end-to-end not validated without live keys | P1 | Validate in staging pre-go-live |
| B-06 | WhatsApp recovery (Twilio) not wired — env vars absent | P2 | Email recovery works; WhatsApp is enhancement |
| B-07 | Legacy `src/components/Footer.tsx` dead file with bad links | P2 | Not used by app; cleanup post-launch |
| B-08 | No automated test suite | P2 | Manual QA covers critical paths; tech debt |
| B-09 | `categories/[brand]` page exists but is mostly a placeholder | P2 | Not linked in main nav; no buyer traffic expected |

---

## Post-Launch Backlog (ordered by priority)

### P0 — If found on day 1, fix immediately
*(none expected — would be in bug bash above if known)*

### P1 — First week

| Item | Description |
|---|---|
| Stripe live test | End-to-end with real card before opening to public |
| Media audit | Confirm all launch SKUs have images in prod storage |
| Error monitoring | Set up Sentry or Render log alerts for 5xx patterns |
| Cron job health | Confirm both cron jobs fired at least once after launch |

### P2 — First month

| Item | Description |
|---|---|
| Order confirmation email | Polish email template (currently minimal) |
| WhatsApp bag recovery | Wire up Twilio keys and test |
| Customer "My Account" page | Currently minimal (role display only) |
| Gift kit UX | Builder flow polish, packaging preview |
| Search / filter | Product filtering on brand page (currently no filter) |
| SEO metadata | Per-product og:image and descriptions |
| Analytics | Basic GA4 or Posthog event tracking |

### P3 — Quarter 2

| Item | Description |
|---|---|
| New countries | Add PT, FR, UK (requires freight rates + policy setup) |
| Wholesale portal | Authenticated B2B ordering experience |
| Multi-language | English-first routing (e.g. `/en/` prefix) |
| Review/testimonial system | Product ratings |
| Loyalty / referral | Post-launch acquisition channel |
| Campaign builder in admin | Self-serve editorial campaign creation |

---

## Decisions Made (trade-offs)

| Decision | Rationale |
|---|---|
| Portuguese brand voice + English checkout | International buyers, intentional bilingual convention |
| Mock payments default | Allows frontend testing without Stripe keys; switch to `stripe` mode for live |
| No automated tests at launch | Speed to market; runbooks cover incident response |
| Prisma migrations only (no Prisma Client) | Raw SQL via postgres.js for performance and control |
| Guest checkout per-country (commerce rule) | Reduces friction in most markets; compliance flexibility |
| Media signed URL upload | Security; Supabase handles storage CDN |
