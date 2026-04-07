import { Router, type Request, type Response } from "express";
import { getAdminOrders, getAdminOverview } from "../domains/admin/admin.controller.js";
import { getCampaigns } from "../domains/campaigns/campaigns.controller.js";
import { listContentBlocks } from "../domains/content/content.controller.js";
import { listFiscalStatuses } from "../domains/fiscal/fiscal.controller.js";
import {
  getFreightQuote,
  getShippingRegions,
  getShippingRates,
} from "../domains/freight/freight.controller.js";
import {
  deleteMedia,
  getUploadUrl,
  listMedia,
  registerMedia,
  reorderMedia,
  setPrimary,
} from "../domains/media/media.controller.js";
import { createOrder } from "../domains/orders/orders.controller.js";
import { getProduct, listProducts } from "../domains/products/products.controller.js";
import { createCheckoutSession } from "../domains/stripe/stripe.controller.js";
import { listUsers } from "../domains/users/users.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

export const router = Router();

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------
router.get("/health", (_req: Request, res: Response) => res.json({ ok: true, name: "doutro-lado-api" }));
router.get("/campaigns", getCampaigns);
router.get("/products", listProducts);
router.get("/products/:slug", getProduct);

// Freight — public (used by product detail, cart preview, checkout)
router.get("/freight/quote", getFreightQuote);
router.get("/freight/regions", getShippingRegions);
router.get("/freight/rates", getShippingRates);

// ---------------------------------------------------------------------------
// Authenticated (customer+)
// ---------------------------------------------------------------------------
router.post("/orders", requireAuth, createOrder);
router.post("/stripe/checkout", requireAuth, createCheckoutSession);

// ---------------------------------------------------------------------------
// Admin — general
// ---------------------------------------------------------------------------
router.get("/admin/overview", requireAuth, requireRole("admin"), getAdminOverview);
router.get("/admin/orders", requireAuth, requireRole("admin"), getAdminOrders);
router.get("/users", requireAuth, requireRole("admin"), listUsers);
router.get("/content", requireAuth, requireRole("admin"), listContentBlocks);
router.get("/fiscal/status", requireAuth, requireRole("admin"), listFiscalStatuses);

// ---------------------------------------------------------------------------
// Admin — media system (Stage 2)
// ---------------------------------------------------------------------------
router.post("/admin/media/upload-url", requireAuth, requireRole("admin"), getUploadUrl);
router.post("/admin/media/register", requireAuth, requireRole("admin"), registerMedia);
router.get("/admin/products/:productId/media", requireAuth, requireRole("admin"), listMedia);
router.patch("/admin/products/:productId/media/reorder", requireAuth, requireRole("admin"), reorderMedia);
router.patch("/admin/products/:productId/media/:pmId/primary", requireAuth, requireRole("admin"), setPrimary);
router.delete("/admin/media/:assetId", requireAuth, requireRole("admin"), deleteMedia);
