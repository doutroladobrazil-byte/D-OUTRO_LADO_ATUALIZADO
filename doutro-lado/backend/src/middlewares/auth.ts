import type { NextFunction, Request, Response } from "express";
import { resolveRequestUser } from "../services/auth.service.js";
import type { Role } from "../types/domain.js";

/**
 * Verifies the Bearer JWT and attaches the resolved user to req.user.
 * Returns 401 if no valid credential is provided.
 * Express 5 handles async rejections — no try/catch needed.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await resolveRequestUser(req);
  if (!user) {
    res.status(401).json({ ok: false, message: "Unauthorized" });
    return;
  }
  req.user = user;
  next();
}

/**
 * Enforces a single required role. Must be used after requireAuth.
 * Returns 403 if the authenticated user does not have the required role.
 */
export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      res.status(403).json({ ok: false, message: "Forbidden" });
      return;
    }
    next();
  };
}

/**
 * Enforces that the user has one of the accepted roles.
 * Use for endpoints accessible to multiple roles (e.g. wholesale + admin).
 */
export function requireAnyRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ ok: false, message: "Forbidden" });
      return;
    }
    next();
  };
}
