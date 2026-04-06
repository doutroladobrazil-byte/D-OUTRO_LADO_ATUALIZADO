import type { NextFunction, Request, Response } from "express";
import { resolveRequestUser } from "../services/auth.service.js";
import type { Role } from "../types/domain.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = resolveRequestUser(req);
  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "Unauthorized. Use a configured bearer token or enable header auth explicitly."
    });
  }

  req.user = user;
  next();
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    next();
  };
}
