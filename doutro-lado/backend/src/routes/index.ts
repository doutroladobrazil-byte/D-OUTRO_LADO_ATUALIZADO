import { Router, type Request, type Response } from "express";
import { getAdminOrders, getAdminOverview } from "../domains/admin/admin.controller.js";
import { getCampaigns } from "../domains/campaigns/campaigns.controller.js";
import { listContentBlocks } from "../domains/content/content.controller.js";
import { getFreightQuote } from "../domains/freight/freight.controller.js";
import { listShippingRates } from "../domains/freight/shipping.controller.js";
import { listFiscalStatuses } from "../domains/fiscal/fiscal.controller.js";
import { createOrder } from "../domains/orders/orders.controller.js";
import { getProduct, listProducts } from "../domains/products/products.controller.js";
import { createCheckoutSession } from "../domains/stripe/stripe.controller.js";
import { listUsers } from "../domains/users/users.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

export const router = Router();

router.get("/health", (_req: Request, res: Response) => res.json({ ok: true, name: "doutro-lado-api" }));
router.get("/campaigns", getCampaigns);
router.get("/products", listProducts);
router.get("/products/:slug", getProduct);
router.get("/freight/quote", getFreightQuote);
router.get("/shipping/rates", listShippingRates);
router.post("/orders", requireAuth, createOrder);
router.post("/stripe/checkout", requireAuth, createCheckoutSession);
router.get("/admin/overview", requireAuth, requireRole("admin"), getAdminOverview);
router.get("/admin/orders", requireAuth, requireRole("admin"), getAdminOrders);
router.get("/users", requireAuth, requireRole("admin"), listUsers);
router.get("/content", requireAuth, requireRole("admin"), listContentBlocks);
router.get("/fiscal/status", requireAuth, requireRole("admin"), listFiscalStatuses);
