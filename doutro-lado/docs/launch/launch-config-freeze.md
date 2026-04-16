# D'OUTRO LADO — Launch Configuration Freeze
> Etapa 10 · April 2026  
> This document is the authoritative snapshot of launch configuration. Do not change any item marked ✅ without updating this file and getting sign-off.

---

## Backend Environment (`backend/.env`)

| Variable | Expected value / format | Status | Notes |
|---|---|---|---|
| `NODE_ENV` | `production` | 🔲 Confirm | — |
| `DATABASE_URL` | Supabase pooler URI (pgbouncer=true) | 🔲 Set | Transaction mode, port 6543 |
| `DIRECT_URL` | Supabase direct URI (port 5432) | 🔲 Set | Migrations only |
| `APP_URL` | `https://doutrolado.com` | 🔲 Set | Used for CORS allow-list |
| `SUPABASE_JWT_SECRET` | From Supabase → Settings → API | 🔲 Set | Required; blocks auth if missing |
| `PAYMENTS_MODE` | `stripe` | 🔲 Set | Change from `mock` |
| `STRIPE_SECRET_KEY` | `sk_live_...` | 🔲 Set | Live key, not test |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | 🔲 Set | From Stripe dashboard webhook |
| `SUPABASE_URL` | `https://[ref].supabase.co` | 🔲 Set | — |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role) | 🔲 Set | Media upload blocked without it |
| `RECOVERY_JOB_SECRET` | Random 32-byte secret | 🔲 Set | `openssl rand -base64 32` |
| `RESEND_API_KEY` | `re_...` | 🔲 Optional | Recovery emails disabled if missing |
| `INTERNAL_API_PORT` | `4000` | 🔲 Default OK | Set explicitly if on Render |

## Frontend Environment (`frontend/.env.local`)

| Variable | Expected value | Status | Notes |
|---|---|---|---|
| `INTERNAL_API_URL` | `http://127.0.0.1:4000/api` | 🔲 Confirm | Render: backend on same machine |
| `NEXT_PUBLIC_SITE_URL` | `https://doutrolado.com` | 🔲 Set | — |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[ref].supabase.co` | 🔲 Set | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | 🔲 Set | Public key, safe to expose |
| `NEXT_PUBLIC_API_URL` | **Do NOT set** | 🔲 Absent | Internal proxy handles it |

---

## Database

| Item | Status | Notes |
|---|---|---|
| Prisma migrations applied (`migrate deploy`) | 🔲 | Run against DIRECT_URL; confirm `20260415000012_stage17` is latest |
| Seed: countries + commerce rules | 🔲 | All 6 countries active (CH, IE, DE, IS, SG, US) |
| Seed: freight rates by weight + region | 🔲 | At least 3 weight ranges × 6 countries |
| Seed: at least 1 admin profile | 🔲 | Role = "admin", verified in Supabase Auth |
| `check_expiry_minutes` set in reservations | 🔲 | Default 15 min; adjust per SLA |

---

## Stripe

| Item | Status | Notes |
|---|---|---|
| Webhook registered in Stripe Dashboard | 🔲 | URL: `https://[api-domain]/api/stripe/webhook` |
| Webhook events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded` | 🔲 | All 3 required |
| Webhook secret copied to `STRIPE_WEBHOOK_SECRET` | 🔲 | Must match the registered endpoint |
| Test transaction confirmed end-to-end | 🔲 | Use Stripe test mode first, then switch to live |

---

## Supabase Storage

| Item | Status | Notes |
|---|---|---|
| Bucket `product-media` exists and is public | 🔲 | Public bucket for read; uploads via signed URL |
| CORS policy allows frontend domain | 🔲 | — |
| Media for launch products uploaded | 🔲 | At least 1 image per SKU |

---

## Products & Catalog

| Item | Status | Notes |
|---|---|---|
| Launch SKUs set to `is_active = true` | 🔲 | Inactive products do not appear in storefront |
| `featured = true` on hero products (≥ 4) | 🔲 | Homepage featured grid needs 4+ |
| Stock > 0 on all launch SKUs | 🔲 | Zero stock blocks checkout |
| Wholesale min qty configured | 🔲 | Displayed on PDP |
| Product costs configured (for margin reporting) | 🔲 | Optional at launch; financial section shows N/D if absent |

---

## Countries & Commerce Rules

| Country | Active | Checkout enabled | Allow guest | Priority |
|---|---|---|---|---|
| CH | 🔲 | 🔲 | 🔲 decide | High |
| IE | 🔲 | 🔲 | 🔲 decide | High |
| DE | 🔲 | 🔲 | 🔲 decide | High |
| IS | 🔲 | 🔲 | 🔲 decide | Medium |
| SG | 🔲 | 🔲 | 🔲 decide | Medium |
| US | 🔲 | 🔲 | 🔲 decide | High |

---

## Cron Jobs

| Job | Endpoint | Frequency | Secret | Status |
|---|---|---|---|---|
| Reservation expiry | `POST /api/internal/reservations/expire` | Every 5 min | `RECOVERY_JOB_SECRET` | 🔲 Register in Render/scheduler |
| Bag recovery | `POST /api/internal/recovery/process` | Every 30 min | `RECOVERY_JOB_SECRET` | 🔲 Register in Render/scheduler |

---

## Sign-off

| Area | Responsible | Confirmed |
|---|---|---|
| Backend env vars | — | 🔲 |
| Database migrations + seed | — | 🔲 |
| Stripe live config | — | 🔲 |
| Supabase storage | — | 🔲 |
| Catalog / products | — | 🔲 |
| Country policies | — | 🔲 |
| Cron jobs registered | — | 🔲 |
