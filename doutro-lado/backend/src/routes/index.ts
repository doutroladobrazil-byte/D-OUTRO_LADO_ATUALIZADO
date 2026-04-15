import { Router, type Request, type Response } from "express";
import { getSession, patchProfile } from "../domains/auth/auth.controller.js";
import {
  createAdminProductHandler,
  deleteAdminProductHandler,
  getAdminOrders,
  getAdminOverview,
  getAdminOrderDetailHandler,
  getAdminProductByIdHandler,
  getAdminCountryPolicyHandler,
  getProductAvailabilityHandler,
  getStockOverviewHandler,
  listAdminCategoriesHandler,
  listAdminCustomersHandler,
  listAdminProductsHandler,
  patchAdminOrderHandler,
  patchAdminProductHandler,
  patchAdminCountryPolicyHandler,
  patchProductAvailabilityHandler,
} from "../domains/admin/admin.controller.js";
import { getCart, putCartItem, removeCartItem } from "../domains/cart/cart.controller.js";
import { getCampaigns } from "../domains/campaigns/campaigns.controller.js";
import { listContentBlocks } from "../domains/content/content.controller.js";
import { listFiscalStatuses } from "../domains/fiscal/fiscal.controller.js";
import {
  getFreightQuote,
  getShippingRegions,
  getShippingRates,
} from "../domains/freight/freight.controller.js";
import {
  createKit,
  getKit,
  listMyKits,
  listPackagingOptions,
  patchKit,
  removeKit,
} from "../domains/gift-kits/gift-kit.controller.js";
import {
  deleteMedia,
  getUploadUrl,
  listMedia,
  patchMedia,
  registerMedia,
  reorderMedia,
  setPrimary,
} from "../domains/media/media.controller.js";
import { simulateBagHandler } from "../domains/bag/bag.controller.js";
import { processRecoveryHandler } from "../domains/recovery/recovery.controller.js";
import { createOrder, listMyOrders } from "../domains/orders/orders.controller.js";
import { expireReservationsHandler } from "../domains/orders/reservation.controller.js";
import { getProduct, listProducts } from "../domains/products/products.controller.js";
import { createCheckoutSession } from "../domains/stripe/stripe.controller.js";
import { listUsers } from "../domains/users/users.controller.js";
import { requireAuth, requireAnyRole, requireRole, optionalAuth } from "../middlewares/auth.js";
import { authRateLimit, checkoutRateLimit } from "../middlewares/rate-limit.js";
import { getCurrencies, getLanguages, getRates } from "../domains/i18n/i18n.controller.js";
import { getCountryHandler, listCountriesHandler } from "../domains/countries/countries.controller.js";
import { db } from "../lib/db.js";
import { env } from "../config/env.js";

export const router = Router();

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

/**
 * /health/live — Is the process up? Used by load balancers / uptime monitors.
 * Never touches external dependencies. Returns 200 as long as Node is running.
 */
router.get("/health/live", (_req: Request, res: Response) => {
  return res.json({ ok: true, status: "live" });
});

/**
 * /health/ready — Are all dependencies reachable and configured?
 * Used by deployment pipelines and dashboards to distinguish "up" from "ready".
 * Returns 503 with a checks breakdown if any dependency is unhealthy.
 *
 * Checks: database · Stripe config · Supabase storage · JWT secret
 * Does NOT expose secret values — only reports presence/absence.
 */
router.get("/health/ready", async (_req: Request, res: Response) => {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // Database connectivity
  try {
    await db`SELECT 1 AS up`;
    checks.database = { ok: true };
  } catch (err) {
    checks.database = { ok: false, detail: err instanceof Error ? err.message : "unreachable" };
  }

  // JWT auth config
  checks.auth = env.SUPABASE_JWT_SECRET
    ? { ok: true }
    : { ok: false, detail: "SUPABASE_JWT_SECRET missing" };

  // Stripe config
  if (env.PAYMENTS_MODE === "stripe") {
    const stripeReady = !!(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET);
    checks.stripe = stripeReady
      ? { ok: true }
      : { ok: false, detail: "STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing" };
  } else {
    checks.stripe = { ok: true, detail: "mock mode — no real keys required" };
  }

  // Supabase storage config
  const storageReady = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
  checks.storage = storageReady
    ? { ok: true }
    : { ok: false, detail: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing (media upload disabled)" };

  const allOk = Object.values(checks).every((c) => c.ok);
  return res.status(allOk ? 200 : 503).json({
    ok: allOk,
    name: "doutro-lado-api",
    paymentsMode: env.PAYMENTS_MODE,
    checks,
  });
});

/**
 * /health — backward-compatible alias (Render health-check URL).
 * Performs a live DB ping and returns 503 if unreachable.
 */
router.get("/health", async (_req: Request, res: Response) => {
  try {
    await db`SELECT 1 AS up`;
    return res.json({ ok: true, name: "doutro-lado-api", db: "connected" });
  } catch {
    return res.status(503).json({ ok: false, name: "doutro-lado-api", db: "unavailable" });
  }
});

// ---------------------------------------------------------------------------
// Bag simulation — public (guests + authenticated users both need it)
// ---------------------------------------------------------------------------
router.post("/bag/simulate", simulateBagHandler);

// ---------------------------------------------------------------------------
// Internal — bag recovery job + reservation expiry (protected by RECOVERY_JOB_SECRET)
// ---------------------------------------------------------------------------
router.post("/internal/recovery/process", processRecoveryHandler);
router.post("/internal/reservations/expire", expireReservationsHandler);

// ---------------------------------------------------------------------------
// Public catalog
// ---------------------------------------------------------------------------
router.get("/campaigns", getCampaigns);
router.get("/products", listProducts);
router.get("/products/:slug", getProduct);

// Freight — public (used by product detail, cart preview, checkout)
router.get("/freight/quote", getFreightQuote);
router.get("/freight/regions", getShippingRegions);
router.get("/freight/rates", getShippingRates);

// ---------------------------------------------------------------------------
// i18n — public (currencies, languages, exchange rates)
// ---------------------------------------------------------------------------
router.get("/i18n/currencies", getCurrencies);
router.get("/i18n/languages", getLanguages);
router.get("/i18n/rates", getRates);

// ---------------------------------------------------------------------------
// Countries — public (Stage 12, country-first MVP)
// Used by checkout country selector and bag simulation.
// ---------------------------------------------------------------------------
router.get("/countries", listCountriesHandler);
router.get("/countries/:code", getCountryHandler);

// ---------------------------------------------------------------------------
// Auth — session and profile (authenticated)
// Rate-limited: prevents token validation spamming and session polling abuse.
// ---------------------------------------------------------------------------
router.get("/auth/session", authRateLimit, requireAuth, getSession);
router.patch("/auth/profile", authRateLimit, requireAuth, patchProfile);

// ---------------------------------------------------------------------------
// Customer+ — order creation (Stage 14: optionalAuth enables guest checkout)
// Rate-limited: prevents duplicate order creation and checkout spam.
// Guest access is gated per-country via allowGuestCheckout commerce rule.
// ---------------------------------------------------------------------------
router.post("/orders", checkoutRateLimit, optionalAuth, createOrder);
router.post("/stripe/checkout", checkoutRateLimit, optionalAuth, createCheckoutSession);
// List the authenticated user's own orders (for Minha Conta page)
router.get("/orders/mine", requireAuth, listMyOrders);

// ---------------------------------------------------------------------------
// Cart — Stage 7 (authenticated)
// ---------------------------------------------------------------------------
router.get("/cart", requireAuth, getCart);
router.put("/cart/items", requireAuth, putCartItem);
router.delete("/cart/items/:productSlug", requireAuth, removeCartItem);

// ---------------------------------------------------------------------------
// Gift Kits — Stage 6
// ---------------------------------------------------------------------------
// Public — used by the frontend to render packaging selector
router.get("/gift-kits/packaging-options", listPackagingOptions);

// Authenticated — kit lifecycle
router.post("/gift-kits", requireAuth, createKit);
router.get("/gift-kits/mine", requireAuth, listMyKits);
router.get("/gift-kits/:id", requireAuth, getKit);
router.patch("/gift-kits/:id", requireAuth, patchKit);
router.delete("/gift-kits/:id", requireAuth, removeKit);

// ---------------------------------------------------------------------------
// Admin — overview and orders
// ---------------------------------------------------------------------------
router.get("/admin/overview", requireAuth, requireRole("admin"), getAdminOverview);
router.get("/admin/orders", requireAuth, requireRole("admin"), getAdminOrders);
router.get("/admin/orders/:id", requireAuth, requireRole("admin"), getAdminOrderDetailHandler);
router.patch("/admin/orders/:id", requireAuth, requireRole("admin"), patchAdminOrderHandler);

// Admin — products (catalog management)
router.get("/admin/products", requireAuth, requireRole("admin"), listAdminProductsHandler);
router.post("/admin/products", requireAuth, requireRole("admin"), createAdminProductHandler);
router.get("/admin/products/:id", requireAuth, requireRole("admin"), getAdminProductByIdHandler);
router.patch("/admin/products/:id", requireAuth, requireRole("admin"), patchAdminProductHandler);
router.delete("/admin/products/:id", requireAuth, requireRole("admin"), deleteAdminProductHandler);

// Admin — categories (taxonomy selects in product form)
router.get("/admin/categories", requireAuth, requireRole("admin"), listAdminCategoriesHandler);

// Admin — customers
router.get("/admin/customers", requireAuth, requireRole("admin"), listAdminCustomersHandler);

// Admin — stock
router.get("/admin/stock", requireAuth, requireRole("admin"), getStockOverviewHandler);

router.get("/users", requireAuth, requireRole("admin"), listUsers);
router.get("/content", requireAuth, requireRole("admin"), listContentBlocks);
router.get("/fiscal/status", requireAuth, requireRole("admin"), listFiscalStatuses);

// ---------------------------------------------------------------------------
// Admin — product country availability (Stage 13)
// ---------------------------------------------------------------------------
router.get("/admin/products/:id/availability", requireAuth, requireRole("admin"), getProductAvailabilityHandler);
router.patch("/admin/products/:id/availability", requireAuth, requireRole("admin"), patchProductAvailabilityHandler);

// ---------------------------------------------------------------------------
// Admin — country policies (Stage 17)
// ---------------------------------------------------------------------------
router.get("/admin/countries/:code/policy", requireAuth, requireRole("admin"), getAdminCountryPolicyHandler);
router.patch("/admin/countries/:code/policy", requireAuth, requireRole("admin"), patchAdminCountryPolicyHandler);

// ---------------------------------------------------------------------------
// Admin — media system (Stage 2)
// ---------------------------------------------------------------------------
router.post("/admin/media/upload-url", requireAuth, requireRole("admin"), getUploadUrl);
router.post("/admin/media/register", requireAuth, requireRole("admin"), registerMedia);
router.get("/admin/products/:productId/media", requireAuth, requireRole("admin"), listMedia);
router.patch("/admin/products/:productId/media/reorder", requireAuth, requireRole("admin"), reorderMedia);
router.patch("/admin/products/:productId/media/:pmId/primary", requireAuth, requireRole("admin"), setPrimary);
router.patch("/admin/media/:assetId", requireAuth, requireRole("admin"), patchMedia);
router.delete("/admin/media/:assetId", requireAuth, requireRole("admin"), deleteMedia);
