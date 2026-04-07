import type { Request, Response } from "express";
import { fail, ok } from "../../utils/http.js";
import { freightQuoteSchema, listFreightRates, listShippingRegions, quoteFreight } from "./freight.service.js";

/**
 * GET /freight/quote?region=North+America&weightRange=1-3kg
 * Returns a deterministic freight quote for the given region and weight range.
 * Used by product detail pages and cart previews.
 */
export async function getFreightQuote(req: Request, res: Response) {
  const parsed = freightQuoteSchema.safeParse(req.query);
  if (!parsed.success) {
    return fail(res, `Invalid freight quote parameters: ${parsed.error.message}`, 400);
  }

  try {
    const quote = await quoteFreight(parsed.data);
    return ok(res, quote);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Freight quote failed", 400);
  }
}

/**
 * GET /freight/regions
 * Returns the list of active shipping regions.
 * Used by cart/checkout to populate region selection.
 */
export async function getShippingRegions(_req: Request, res: Response) {
  const regions = await listShippingRegions();
  return ok(res, regions);
}

/**
 * GET /freight/rates?weightRange=1-3kg  (optional)
 * Returns all shipping rates, optionally filtered by weight range.
 * Used by admin and product detail freight preview.
 */
export async function getShippingRates(req: Request, res: Response) {
  const weightRange = req.query.weightRange as string | undefined;
  const rates = await listFreightRates(weightRange as Parameters<typeof listFreightRates>[0]);
  return ok(res, rates);
}
