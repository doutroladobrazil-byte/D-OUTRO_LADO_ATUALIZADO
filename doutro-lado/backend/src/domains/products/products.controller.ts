import type { Request, Response } from "express";
import { z } from "zod";
import { getProductBySlug, listProducts as listCatalogProducts } from "../../services/catalog.service.js";
import { fail, ok } from "../../utils/http.js";

const querySchema = z.object({ brand: z.enum(["casa", "moda"]).optional() });

export async function listProducts(req: Request, res: Response) {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return fail(res, "Invalid query", 400);

  return ok(res, await listCatalogProducts(parsed.data.brand));
}

export async function getProduct(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const product = await getProductBySlug(slug);
  if (!product) return fail(res, "Product not found", 404);
  return ok(res, product);
}
