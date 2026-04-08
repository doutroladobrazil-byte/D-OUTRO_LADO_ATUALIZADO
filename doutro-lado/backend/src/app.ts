import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { handleStripeWebhook } from "./domains/stripe/stripe.controller.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { router } from "./routes/index.js";

export const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
// helmet sets production-safe defaults:
//   X-Content-Type-Options: nosniff
//   X-Frame-Options: SAMEORIGIN
//   Strict-Transport-Security (HSTS on HTTPS)
//   X-XSS-Protection: 0  (modern recommendation; CSP is the right control)
//   Referrer-Policy: no-referrer
//   X-DNS-Prefetch-Control: off
//   X-Permitted-Cross-Domain-Policies: none
//
// CSP and COEP are disabled — the backend serves JSON API responses only.
// The frontend (Next.js) controls its own CSP via next.config headers().
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
// Production: restrict to APP_URL only.
// Internal Next.js server-side calls originate from 127.0.0.1 and do NOT
// send an Origin header, so CORS does not apply to them. This setting only
// restricts browser-initiated cross-origin requests.
//
// Development / test: allow all origins for ease of local work.
const corsOrigin: cors.CorsOptions["origin"] =
  env.NODE_ENV === "production" ? [env.APP_URL] : true;

app.use(cors({ origin: corsOrigin, credentials: true }));

// ── Stripe webhook ────────────────────────────────────────────────────────────
// Must be registered BEFORE express.json() — Stripe requires the raw request
// body to verify the webhook signature. json() would consume and parse the
// body, making signature verification impossible.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// ── Body parsing with explicit size limits ────────────────────────────────────
// 1 MB is generous for any JSON API payload. Prevents large-body DoS.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── HTTP request logging ──────────────────────────────────────────────────────
// "combined" writes standard Apache Common Log Format to stdout.
// Log aggregators (Render, Datadog, Papertrail) parse this format natively.
// "dev" is human-friendly colorized output suitable for local development only.
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api", router);
app.use(errorHandler);
