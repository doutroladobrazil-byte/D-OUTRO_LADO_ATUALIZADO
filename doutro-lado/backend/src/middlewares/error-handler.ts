import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

type HttpError = Error & { status?: number; statusCode?: number };

/**
 * Global Express error handler.
 *
 * Classification strategy:
 *   ZodError         → 400  (validation — show field-level issues)
 *   Error with 4xx   → forward that status (operational error, client's fault)
 *   Everything else  → 500  (never leak internal detail to the client)
 *
 * Severity strategy:
 *   4xx errors       → warn  (client error, expected, not actionable)
 *   5xx / unknown    → error (unexpected, requires investigation)
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // ── Zod validation errors ─────────────────────────────────────────────────
  if (error instanceof ZodError) {
    const issues = error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    logger.warn("Validation error", { method: req.method, path: req.path, issues });
    res.status(400).json({ ok: false, message: `Validation error: ${issues}` });
    return;
  }

  if (error instanceof Error) {
    const httpError = error as HttpError;
    const status = httpError.status ?? httpError.statusCode;

    // ── Known client errors (4xx) ─────────────────────────────────────────
    if (status && status >= 400 && status < 500) {
      logger.warn("Client error", {
        method: req.method,
        path: req.path,
        status,
        message: error.message,
      });
      res.status(status).json({ ok: false, message: error.message });
      return;
    }

    // ── Unexpected server errors ───────────────────────────────────────────
    logger.error("Unhandled server error", {
      method: req.method,
      path: req.path,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ ok: false, message: "Internal server error" });
    return;
  }

  // ── Non-Error throws ──────────────────────────────────────────────────────
  logger.error("Unknown value thrown", { method: req.method, path: req.path, thrown: String(error) });
  res.status(500).json({ ok: false, message: "Internal server error" });
}
