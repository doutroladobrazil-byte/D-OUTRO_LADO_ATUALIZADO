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

## Stage status

| Stage | Description | Status |
|---|---|---|
| **0** | Technical foundation — monorepo, deploy, env, healthcheck | ✅ Complete |
| 1 | Supabase Auth integration | Pending |
| 2 | Real product data + images | Pending |
| 3 | Checkout + Stripe live | Pending |
| 4 | Fiscal + logistics integrations | Pending |
