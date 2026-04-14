// =============================================================================
// Countries controller — Stage 12 (country-first international MVP)
// =============================================================================
// Exposes:
//   GET /api/countries       — list all active countries (public, used by checkout)
//   GET /api/countries/:code — single country with commerce rule (public)
// =============================================================================

import type { Request, Response } from "express";
import { getCountryByCode, listActiveCountries } from "./countries.service.js";

/**
 * GET /api/countries
 * Returns all active countries ordered by display_position.
 * Used by the frontend country selector in checkout.
 */
export async function listCountriesHandler(req: Request, res: Response) {
  const countries = await listActiveCountries();
  return res.json(countries);
}

/**
 * GET /api/countries/:code
 * Returns a single country and its active commerce rule.
 * code is case-insensitive (US = us = Us).
 */
export async function getCountryHandler(req: Request, res: Response) {
  const { code } = req.params as { code: string };
  if (!code || code.length !== 2) {
    return res.status(400).json({ error: "Invalid country code." });
  }

  const country = await getCountryByCode(code);
  if (!country) {
    return res.status(404).json({ error: `Country "${code.toUpperCase()}" not found or not active.` });
  }

  return res.json(country);
}
