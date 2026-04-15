import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { expireStaleReservations } from "./reservation.service.js";

/**
 * POST /api/internal/reservations/expire
 *
 * Internal endpoint — protected by RECOVERY_JOB_SECRET bearer token.
 * Expires all active reservations whose TTL has elapsed.
 * Should be called by a scheduled job every ~5 minutes.
 */
export async function expireReservationsHandler(req: Request, res: Response) {
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!env.RECOVERY_JOB_SECRET || token !== env.RECOVERY_JOB_SECRET) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const expired = await expireStaleReservations();
  if (expired > 0) {
    logger.info("reservations_expired", { count: expired });
  }
  return res.json({ ok: true, data: { expired } });
}
