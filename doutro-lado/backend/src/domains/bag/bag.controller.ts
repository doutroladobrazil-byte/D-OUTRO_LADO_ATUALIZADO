import type { Request, Response } from "express";
import { simulateBag } from "./bag.service.js";
import { ok, fail } from "../../utils/http.js";

// =============================================================================
// POST /api/bag/simulate
// =============================================================================

/**
 * Public endpoint — no authentication required.
 * Guests and authenticated users both need simulation for bag UX.
 *
 * Returns a BagSimulationResult with isValid flag and blockingIssues.
 * Frontend must check isValid before allowing checkout.
 */
export async function simulateBagHandler(req: Request, res: Response) {
  try {
    const result = await simulateBag(req.body);
    return ok(res, result);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Erro na simulação da bag", 400);
  }
}
