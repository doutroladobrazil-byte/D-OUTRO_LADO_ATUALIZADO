import type { Request, Response } from "express";
import { z } from "zod";
import { getAdminOverview as getOverview, listAdminOrders } from "../../services/admin.service.js";
import { loadCountryPolicy } from "../countries/countries.service.js";
import { db } from "../../lib/db.js";
import {
  createAdminProduct,
  createProductSchema,
  deleteAdminProduct,
  getAdminOrderDetail,
  getAdminProductById,
  getAdminProductAvailability,
  getStockOverview,
  listAdminCategories,
  listAdminCustomers,
  listAdminProducts,
  patchAdminOrder,
  patchAdminProduct,
  patchAdminProductAvailability,
  patchOrderStatusSchema,
  patchProductSchema,
} from "./admin-crud.service.js";
import { ok, fail } from "../../utils/http.js";

// =============================================================================
// Query schemas — validated at the boundary
// =============================================================================

const listProductsQuerySchema = z.object({
  brand: z.enum(["casa", "moda"]).optional(),
  search: z.string().max(200).optional(),
});

const listCustomersQuerySchema = z.object({
  role: z.enum(["customer", "wholesale", "admin"]).optional(),
  search: z.string().max(200).optional(),
});

// =============================================================================
// Overview & orders
// =============================================================================

export async function getAdminOverview(_req: Request, res: Response) {
  return ok(res, await getOverview());
}

export async function getAdminOrders(_req: Request, res: Response) {
  return ok(res, await listAdminOrders());
}

// =============================================================================
// Products
// =============================================================================

export async function listAdminProductsHandler(req: Request, res: Response) {
  const parsed = listProductsQuerySchema.safeParse(req.query);
  if (!parsed.success) return fail(res, parsed.error.message, 400);

  const products = await listAdminProducts(parsed.data);
  return ok(res, products);
}

export async function getAdminProductByIdHandler(req: Request, res: Response) {
  const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const product = await getAdminProductById(productId);
    return ok(res, product);
  } catch (err) {
    return fail(res, err instanceof Error ? err.message : "Produto não encontrado", 404);
  }
}

export async function createAdminProductHandler(req: Request, res: Response) {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message ?? parsed.error.message, 400);

  try {
    const product = await createAdminProduct(parsed.data);
    return ok(res, product, 201);
  } catch (err) {
    // PostgreSQL unique constraint violation
    if ((err as Record<string, unknown>).code === "23505") {
      return fail(res, "Slug ou SKU já está em uso. Escolha valores únicos.", 409);
    }
    return fail(res, err instanceof Error ? err.message : "Falha ao criar produto", 400);
  }
}

export async function patchAdminProductHandler(req: Request, res: Response) {
  const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = patchProductSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message ?? parsed.error.message, 400);

  try {
    const updated = await patchAdminProduct(productId, parsed.data);
    return ok(res, updated);
  } catch (err) {
    if ((err as Record<string, unknown>).code === "23505") {
      return fail(res, "Slug ou SKU já está em uso. Escolha valores únicos.", 409);
    }
    return fail(res, err instanceof Error ? err.message : "Falha ao atualizar produto", 400);
  }
}

export async function deleteAdminProductHandler(req: Request, res: Response) {
  const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const result = await deleteAdminProduct(productId);
    return ok(res, result);
  } catch (err) {
    return fail(res, err instanceof Error ? err.message : "Produto não encontrado", 404);
  }
}

// =============================================================================
// Orders
// =============================================================================

export async function getAdminOrderDetailHandler(req: Request, res: Response) {
  const publicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const detail = await getAdminOrderDetail(publicId);
    return ok(res, detail);
  } catch (err) {
    return fail(res, err instanceof Error ? err.message : "Order not found", 404);
  }
}

export async function patchAdminOrderHandler(req: Request, res: Response) {
  const publicId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = patchOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.message, 400);

  try {
    const updated = await patchAdminOrder(publicId, parsed.data);
    return ok(res, updated);
  } catch (err) {
    return fail(res, err instanceof Error ? err.message : "Update failed", 400);
  }
}

// =============================================================================
// Customers
// =============================================================================

export async function listAdminCustomersHandler(req: Request, res: Response) {
  const parsed = listCustomersQuerySchema.safeParse(req.query);
  if (!parsed.success) return fail(res, parsed.error.message, 400);

  const customers = await listAdminCustomers(parsed.data);
  return ok(res, customers);
}

// =============================================================================
// Categories
// =============================================================================

export async function listAdminCategoriesHandler(req: Request, res: Response) {
  const brand = (req.query.brand as string) === "casa" ? "casa" : "moda";
  const categories = await listAdminCategories(brand as "moda" | "casa");
  return ok(res, categories);
}

// =============================================================================
// Stock
// =============================================================================

export async function getStockOverviewHandler(_req: Request, res: Response) {
  const overview = await getStockOverview();
  return ok(res, overview);
}

// =============================================================================
// Product country availability — Stage 13
// =============================================================================

export async function getProductAvailabilityHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const map = await getAdminProductAvailability(id);
    return ok(res, map);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Unable to fetch availability", 400);
  }
}

export async function patchProductAvailabilityHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const map = await patchAdminProductAvailability(id, req.body);
    return ok(res, map);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Unable to update availability", 400);
  }
}

// =============================================================================
// Country policies — Stage 17
// =============================================================================

const patchCountryPolicySchema = z.object({
  deliveryNote: z.string().max(500).nullish(),
  shippingPolicySummary: z.string().max(2000).nullish(),
  returnsEnabled: z.boolean().optional(),
  returnsWindowDays: z.number().int().min(0).max(365).optional(),
  returnsPolicySummary: z.string().max(2000).nullish(),
  dutiesAndTaxesSummary: z.string().max(500).nullish(),
  supportEmail: z.string().email().max(200).nullish(),
  supportWhatsappOrContact: z.string().max(200).nullish(),
  checkoutNotice: z.string().max(500).nullish(),
  orderConfirmationNote: z.string().max(2000).nullish(),
}).strict();

export async function getAdminCountryPolicyHandler(req: Request, res: Response) {
  const code = (req.params.code as string).toUpperCase();
  const policy = await loadCountryPolicy(code as import("../../types/domain.js").CountryCode);
  return ok(res, policy ?? {});
}

export async function patchAdminCountryPolicyHandler(req: Request, res: Response) {
  const code = (req.params.code as string).toUpperCase();
  const parsed = patchCountryPolicySchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message ?? parsed.error.message, 400);

  const d = parsed.data;
  try {
    await db`
      INSERT INTO country_policies (
        country_code,
        delivery_note, shipping_policy_summary,
        returns_enabled, returns_window_days, returns_policy_summary,
        duties_and_taxes_summary,
        support_email, support_whatsapp_or_contact,
        checkout_notice, order_confirmation_note,
        updated_at
      ) VALUES (
        ${code},
        ${d.deliveryNote ?? null}, ${d.shippingPolicySummary ?? null},
        ${d.returnsEnabled ?? true}, ${d.returnsWindowDays ?? 14}, ${d.returnsPolicySummary ?? null},
        ${d.dutiesAndTaxesSummary ?? null},
        ${d.supportEmail ?? null}, ${d.supportWhatsappOrContact ?? null},
        ${d.checkoutNotice ?? null}, ${d.orderConfirmationNote ?? null},
        NOW()
      )
      ON CONFLICT (country_code) DO UPDATE SET
        delivery_note                = COALESCE(EXCLUDED.delivery_note,                country_policies.delivery_note),
        shipping_policy_summary      = COALESCE(EXCLUDED.shipping_policy_summary,      country_policies.shipping_policy_summary),
        returns_enabled              = EXCLUDED.returns_enabled,
        returns_window_days          = EXCLUDED.returns_window_days,
        returns_policy_summary       = COALESCE(EXCLUDED.returns_policy_summary,       country_policies.returns_policy_summary),
        duties_and_taxes_summary     = COALESCE(EXCLUDED.duties_and_taxes_summary,     country_policies.duties_and_taxes_summary),
        support_email                = COALESCE(EXCLUDED.support_email,                country_policies.support_email),
        support_whatsapp_or_contact  = COALESCE(EXCLUDED.support_whatsapp_or_contact, country_policies.support_whatsapp_or_contact),
        checkout_notice              = COALESCE(EXCLUDED.checkout_notice,              country_policies.checkout_notice),
        order_confirmation_note      = COALESCE(EXCLUDED.order_confirmation_note,      country_policies.order_confirmation_note),
        updated_at                   = NOW()
    `;
    const updated = await loadCountryPolicy(code as import("../../types/domain.js").CountryCode);
    return ok(res, updated);
  } catch (err) {
    return fail(res, err instanceof Error ? err.message : "Failed to update policy", 400);
  }
}
