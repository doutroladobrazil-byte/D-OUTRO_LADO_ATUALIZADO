# D'OUTRO LADO — Final QA Matrix
> Etapa 10 · April 2026

## Legend
- **Status**: ✅ Pass · ⚠️ Pass with notes · ❌ Fail · 🔲 Not executed
- **Severity**: P0 = blocks sale · P1 = degrades experience · P2 = cosmetic

---

## 1. Commercial Flow — Guest (no account)

| # | Scenario | Expected | Status | Bug | Sev |
|---|---|---|---|---|---|
| 1.1 | Land on homepage | Hero loads, products visible | ✅ | — | — |
| 1.2 | Browse brand page /brands/moda | Product grid renders, hero OK | ✅ | — | — |
| 1.3 | Open PDP /products/:slug | Name, price, gallery, trust signals | ✅ | — | — |
| 1.4 | Add to cart → cart page | Item appears with quantity | ✅ | — | — |
| 1.5 | Remove item from cart | Item removed, empty state shown | ✅ | — | — |
| 1.6 | Proceed to checkout (guest) | Country selector visible | ✅ | — | — |
| 1.7 | Select country that blocks guests | Auth gate shown, CTA to login | ✅ | — | — |
| 1.8 | Select country that allows guests | Contact form shown | ✅ | — | — |
| 1.9 | Fill contact form (required fields) | Validation passes | ✅ | — | — |
| 1.10 | Submit checkout (mock mode) | Order created, success screen | ✅ | — | — |
| 1.11 | Submit checkout (Stripe mode) | Redirect to Stripe Checkout | 🔲 | Needs live Stripe keys | P1 |
| 1.12 | Stripe success callback | Success screen, cart cleared | 🔲 | Needs live Stripe keys | P1 |
| 1.13 | Stripe cancel callback | Cancel screen, bag preserved | 🔲 | Needs live Stripe keys | P1 |

---

## 2. Commercial Flow — Authenticated User

| # | Scenario | Expected | Status | Bug | Sev |
|---|---|---|---|---|---|
| 2.1 | Login via Supabase | Session persisted, auth header set | ✅ | — | — |
| 2.2 | Cart hydrates from backend on login | Items synced from server | ✅ | — | — |
| 2.3 | Add item while logged in | Local + backend synced | ✅ | — | — |
| 2.4 | Checkout shows "Signed in" badge | Email pre-filled from session | ✅ | — | — |
| 2.5 | Order appears in admin after payment | Order row visible | ✅ | — | — |
| 2.6 | Order status patchable via admin | Status update persists | ✅ | — | — |

---

## 3. Admin Flow

| # | Scenario | Expected | Status | Bug | Sev |
|---|---|---|---|---|---|
| 3.1 | Admin login → /admin | Dashboard loads without error | ✅ | — | — |
| 3.2 | Admin overview metrics | Revenue, orders, margin visible | ✅ | — | — |
| 3.3 | Orders list | Paginated table with status badges | ✅ | — | — |
| 3.4 | Order detail page | Line items, snapshot financeiro | ✅ | — | — |
| 3.5 | Product list /admin/products | All products visible | ✅ | — | — |
| 3.6 | Create product | Product saved, appears in catalog | ✅ | — | — |
| 3.7 | Edit product (patch) | Changes persisted | ✅ | — | — |
| 3.8 | Upload media (signed URL) | File appears in Supabase Storage | 🔲 | Needs SUPABASE_SERVICE_ROLE_KEY in prod | P1 |
| 3.9 | Set product primary image | Primary flag updated | ✅ | — | — |
| 3.10 | Patch media alt text / posterUrl | Saved via PATCH /admin/media/:id | ✅ | — | — |
| 3.11 | Country policy editor | Policy saved per-country | ✅ | — | — |
| 3.12 | Product availability by country | Toggle saved correctly | ✅ | — | — |
| 3.13 | Customer list | Profiles visible with roles | ✅ | — | — |
| 3.14 | Stock overview | SKUs with stock levels | ✅ | — | — |

---

## 4. Country & Pricing

| # | Scenario | Country | Expected | Status | Bug | Sev |
|---|---|---|---|---|---|---|
| 4.1 | Select CH in checkout | CH | CHF currency, freight quoted | ✅ | — | — |
| 4.2 | Select US in checkout | US | USD currency, freight quoted | ✅ | — | — |
| 4.3 | Select IE in checkout | IE | EUR currency, freight quoted | ✅ | — | — |
| 4.4 | Bag simulation includes freight | Any | Total = subtotal + freight | ✅ | — | — |
| 4.5 | Guest checkout blocked for CH (if configured) | CH | Auth gate shown | ✅ | — | — |
| 4.6 | Product unavailable for country | Any | Unavailable banner on PDP | ✅ | — | — |
| 4.7 | Policy delivery note shown | Any | Country-specific note in checkout | ✅ | — | — |
| 4.8 | Returns policy shown | Any | Returns info displayed | ✅ | — | — |

---

## 5. Inventory & Reservations

| # | Scenario | Expected | Status | Bug | Sev |
|---|---|---|---|---|---|
| 5.1 | Out-of-stock item → checkout | Blocked with clear message | ✅ | — | — |
| 5.2 | Reservation created at checkout | Stock decremented temporarily | ✅ | — | — |
| 5.3 | Reservation expires (TTL) | Stock released via cron | ✅ | — | — |
| 5.4 | Payment confirmed → stock deducted | Permanent stock reduction | ✅ | — | — |
| 5.5 | Checkout cancelled → stock released | Released via webhook | ✅ | — | — |

---

## 6. Mobile (manual visual pass)

| # | Screen | Issue checked | Status | Bug | Sev |
|---|---|---|---|---|---|
| 6.1 | Homepage | Trust strip 1-col on small screens | ✅ | — | — |
| 6.2 | Homepage | Hero buttons wrap correctly | ✅ | — | — |
| 6.3 | Brand page | Product grid 1-col on mobile | ✅ | — | — |
| 6.4 | PDP | Gallery stacks above info | ✅ | — | — |
| 6.5 | PDP | Info grid 1-col on small screens | ✅ | — | — |
| 6.6 | Cart | Items list + summary stacked | ✅ | — | — |
| 6.7 | Checkout | Summary appears first (order-first) | ✅ | — | — |
| 6.8 | Checkout | Country selector 2-col on mobile | ✅ | — | — |
| 6.9 | Checkout | Form inputs full-width | ✅ | — | — |

---

## 7. Bugs Found & Resolved

| ID | Description | Severity | File | Resolution |
|---|---|---|---|---|
| B-01 | `DIRECT_URL` missing from `.env.example` — Prisma migrate deploy would silently fail | P1 | `.env.example` | Added with correct comment |
| B-02 | Admin dashboard: `"Pais"` missing accent (column label, section title, empty message) | P2 | `admin/page.tsx` | Fixed all instances |
| B-03 | Admin order detail: `"nao e registro preciso"`, `"criacao"`, `"politica"` missing accents | P2 | `admin/orders/[id]/page.tsx` | Fixed |
| B-04 | `RECOVERY_JOB_SECRET` commented out in `.env.example` — easy to miss at deploy | P2 | `.env.example` | Uncommented, added `openssl` note |

---

## 8. Open / Accepted Risk

| Item | Risk | Severity | Decision |
|---|---|---|---|
| Stripe end-to-end not validated in this env | Full payment flow not smoke-tested with live keys | P1 | Validate in staging before go-live |
| Media upload requires SUPABASE_SERVICE_ROLE_KEY | Media system blocked if key missing | P1 | Required in prod env, documented |
| Bag recovery WhatsApp (Twilio) not wired | Recovery via WhatsApp won't fire without TWILIO_ vars | P2 | Acceptable for launch; email recovery works |
| No automated test suite | Regressions caught by manual QA only | P2 | Accepted; runbooks cover incident response |
