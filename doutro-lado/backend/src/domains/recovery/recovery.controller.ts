import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { processAbandonedBags } from "./recovery.service.js";

/**
 * POST /api/internal/recovery/process
 *
 * Internal endpoint — protected by RECOVERY_JOB_SECRET bearer token.
 * Called by a scheduled job (cron or Render cron) to detect abandoned
 * bags and dispatch recovery emails/WhatsApp messages.
 *
 * Returns the number of profiles that were processed.
 */
export async function processRecoveryHandler(req: Request, res: Response) {
  // Verify the job secret
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!env.RECOVERY_JOB_SECRET || token !== env.RECOVERY_JOB_SECRET) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const result = await processAbandonedBags();
  return res.json({ ok: true, data: result });
}
