# D'OUTRO LADO

Premium international commerce platform. Two brand storefronts (Casa, Moda), centralized admin, shared Express backend, Supabase database, Stripe payments.

## Architecture

```
doutro-lado/
├── frontend/   Next.js 16 — App Router, TypeScript, Tailwind
├── backend/    Express 5, TypeScript, Supabase (postgres direct), Stripe
└── docs/       Architecture and product scope
```

**Production topology (single Render Web Service):**

```
Browser → Next.js (:PORT)
            └─ /api/* rewrites → Express (:4000, internal)
                                    └─ Supabase (external)
```

- Frontend is public on Render's assigned port (`PORT`)
- Backend is internal on port `4000`, never exposed directly
- All `/api/*` calls from both browser and SSR are routed to Express

---

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project with schema applied (`backend/supabase/schema.sql`)

---

## Local Development

### 1. Install dependencies

```bash
# From monorepo root (doutro-lado/)
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in DATABASE_URL with your Supabase direct connection string

# Frontend
cp frontend/.env.example frontend/.env.local
# Fill in INTERNAL_API_URL=http://127.0.0.1:4000/api
```

### 3. Run

```bash
# From doutro-lado/ — starts backend (port 4000) + frontend (port 3000) together
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- API health: http://localhost:4000/api/health (direct)

---

## Production Build (local test)

```bash
npm run build   # compiles backend TS + builds Next.js
npm run start   # starts both processes (Linux/Mac only due to inline env var syntax)
```

---

## Render Deployment

### Service settings

| Field | Value |
|---|---|
| **Service type** | Web Service |
| **Root Directory** | `doutro-lado` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Health Check Path** | `/api/health` |

### Required environment variables

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase → Settings → Database → Direct connection string |
| `APP_URL` | `https://your-app.onrender.com` |
| `INTERNAL_API_URL` | `http://127.0.0.1:4000/api` |
| `PAYMENTS_MODE` | `mock` or `stripe` |
| `STRIPE_SECRET_KEY` | Required if `PAYMENTS_MODE=stripe` |
| `STRIPE_WEBHOOK_SECRET` | Required if using Stripe webhooks |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Required if frontend accesses Supabase directly |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required if frontend accesses Supabase directly |
| `SUPABASE_URL` | Required for media uploads and admin SDK fallback |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for media uploads and admin SDK fallback |
| `ADMIN_EMAILS` | Comma-separated admin e-mails — used only by `bootstrap:admins` script |

> `PORT` and `INTERNAL_API_PORT` are managed automatically — do not set them.

### Deploy flow

1. Push to `main`
2. Render installs root deps (`concurrently`), then builds backend (TypeScript) and frontend (Next.js)
3. Start command launches Express on `:4000` and Next.js on Render's assigned `PORT`
4. Render healthcheck hits `/api/health` (proxied through Next.js → Express)
5. Service is marked healthy and traffic is routed

---

## Verifying the deploy

```bash
# Frontend home
curl https://your-app.onrender.com/

# Backend health (through Next.js proxy)
curl https://your-app.onrender.com/api/health
# Expected: {"ok":true,"name":"doutro-lado-api"}

# Products list
curl https://your-app.onrender.com/api/products
```

---

## Database setup

1. Create a Supabase project
2. Open the SQL editor and run the full contents of `backend/supabase/schema.sql`
3. Copy the **Direct connection** string from Settings → Database → Connection string
4. Set it as `DATABASE_URL` in your environment

---

## Auth tokens (development only)

The backend resolves roles from bearer tokens. Use these in development:

| Token | Role |
|---|---|
| `dev-customer-token` | customer |
| `dev-wholesale-token` | wholesale |
| `dev-admin-token` | admin |

```bash
curl http://localhost:4000/api/admin/overview \
  -H "Authorization: Bearer dev-admin-token"
```

---

## Creating admin users (production)

Admin access is gated by `profile.role === 'admin'` in `public.profiles`. There is no UI to self-promote — promotion requires an explicit CLI operation.

### How it works

1. A user signs up via Supabase Auth — a profile is created automatically with `role = 'customer'`.
2. You add their e-mail to `ADMIN_EMAILS` and run the bootstrap script.
3. The script sets `role = 'admin'` and `is_active = true` for the matching profile.
4. On next login, `/api/auth/session` returns `role: "admin"` and `/admin` becomes accessible.

The operation is **idempotent** — safe to run more than once and will not downgrade existing admins or destroy data.

### Step-by-step

```bash
# 1. Create the user in Supabase Auth
#    → Supabase Dashboard → Authentication → Users → Invite user
#    (or let them sign up themselves)

# 2. Set ADMIN_EMAILS in your environment
#    Multiple addresses are comma-separated:
#    ADMIN_EMAILS=admin@doutrolado.com,ops@doutrolado.com

# 3. Run the bootstrap script
npm run bootstrap:admins   # from doutro-lado/backend/

# 4. User logs in and navigates to /admin
```

### Local development

Add to `backend/.env`:

```
ADMIN_EMAILS=your@email.com
```

Then:

```bash
cd doutro-lado/backend
npm run bootstrap:admins
```

### Production (Render)

1. Add `ADMIN_EMAILS` to the Render environment variables dashboard (comma-separated).
2. Open a Render Shell for the web service and run:

```bash
cd backend
npm run bootstrap:admins
```

Or use a one-off job / Render Cron Job pointing to `npm run bootstrap:admins` in the `doutro-lado/backend` directory.

### Environment variables

| Variable | Description |
|---|---|
| `ADMIN_EMAILS` | Comma-separated list of e-mails to promote to `admin` |
| `DATABASE_URL` | Required — used to update `public.profiles` |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Optional — used as fallback if `auth.users` is not directly accessible |

### Script output reference

| Symbol | Meaning |
|---|---|
| `✓ promoted` | Profile existed, role updated to admin |
| `✓ created & promoted` | Profile did not exist, created with role admin |
| `· already admin` | No change needed |
| `✗ auth user not found` | E-mail not found in Supabase Auth — create the user first |
| `! skipped invalid email` | Malformed address in ADMIN_EMAILS — check for typos |

---

## Stage status

| Stage | Description | Status |
|---|---|---|
| **0** | Technical foundation — monorepo, deploy, env, healthcheck | ✅ Complete |
| 1 | Supabase Auth integration | Pending |
| 2 | Real product data + images | Pending |
| 3 | Checkout + Stripe live | Pending |
| 4 | Fiscal + logistics integrations | Pending |
