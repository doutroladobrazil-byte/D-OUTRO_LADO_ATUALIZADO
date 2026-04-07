import type { Request, Response } from "express";
import {
  listActiveCurrencies,
  listActiveLanguages,
  STATIC_RATES,
} from "../../services/i18n.service.js";
import { ok } from "../../utils/http.js";

/**
 * GET /i18n/currencies
 * Returns all active currencies with their symbols.
 */
export async function getCurrencies(_req: Request, res: Response) {
  const currencies = await listActiveCurrencies();
  return ok(res, currencies);
}

/**
 * GET /i18n/languages
 * Returns all active languages.
 */
export async function getLanguages(_req: Request, res: Response) {
  const languages = await listActiveLanguages();
  return ok(res, languages);
}

/**
 * GET /i18n/rates
 * Returns the current indicative exchange rates (BRL → target currency).
 * Used by the frontend to display converted prices.
 *
 * Stage 9: static rates. Stage 10+: replace with live feed.
 */
export async function getRates(_req: Request, res: Response) {
  return ok(res, STATIC_RATES);
}
