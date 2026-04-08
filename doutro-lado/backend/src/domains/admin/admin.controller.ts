import type { Request, Response } from "express";
import { z } from "zod";
import { getAdminOverview as getOverview, listAdminOrders } from "../../services/admin.service.js";
import {
  getAdminOrderDetail,
  getStockOverview,
  listAdminCustomers,
  listAdminProducts,
  patchAdminOrder,
  patchAdminProduct,
  patchOrderStatusSchema,
  patchProductSchema,
} from "./admin-crud.service.js";
import { ok, fail } from "../../utils/http.js";

// =============================================================================
// Query schemas — validated at the boundary, not cast with `as`
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

export async function patchAdminProductHandler(req: Request, res: Response) {
  const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = patchProductSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.message, 400);

  try {
    const updated = await patchAdminProduct(productId, parsed.data);
    return ok(res, updated);
  } catch (err) {
    return fail(res, err instanceof Error ? err.message : "Update failed", 400);
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
// Stock
// =============================================================================

export async function getStockOverviewHandler(_req: Request, res: Response) {
  const overview = await getStockOverview();
  return ok(res, overview);
}
