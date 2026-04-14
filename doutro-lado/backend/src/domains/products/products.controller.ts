import type { Request, Response } from "express";
import { z } from "zod";
import { getProductBySlug, listProducts as listCatalogProducts } from "../../services/catalog.service.js";
import { fail, ok } from "../../utils/http.js";

const querySchema = z.object({
  brand: z.enum(["casa", "moda"]).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["price_asc", "price_desc", "newest"]).optional(),
  /** Stage 13 — filter by country availability when provided. */
  countryCode: z.string().length(2).toUpperCase().optional(),
});

export async function listProducts(req: Request, res: Response) {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return fail(res, "Invalid query", 400);

  return ok(res, await listCatalogProducts(parsed.data));
}

export async function getProduct(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  // Stage 13 — optional countryCode query param to include availableForCountry
  const countryCode = typeof req.query.countryCode === "string" ? req.query.countryCode : undefined;
  const product = await getProductBySlug(slug, countryCode);
  if (!product) return fail(res, "Product not found", 404);
  return ok(res, product);
}
