import { rateLimit } from "express-rate-limit";

/**
 * Rate limiter for order creation and checkout sessions.
 *
 * 10 requests/minute per IP.
 * Prevents checkout spam, duplicate order creation, and payment
 * session flooding — which could incur Stripe fees or distort analytics.
 */
export const checkoutRateLimit = rateLimit({
  windowMs: 60 * 1_000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { ok: false, message: "Too many requests. Please wait before trying again." },
  skipFailedRequests: false,
});

/**
 * Rate limiter for authentication endpoints (session, profile).
 *
 * 30 requests/minute per IP.
 * Provides a reasonable ceiling for active user sessions while
 * blocking credential stuffing and token brute-force attempts.
 */
export const authRateLimit = rateLimit({
  windowMs: 60 * 1_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { ok: false, message: "Too many authentication requests. Please wait." },
});
