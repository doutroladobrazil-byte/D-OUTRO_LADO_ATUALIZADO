import type { Request, Response } from "express";
import { getAdminOverview as getOverview, listAdminOrders } from "../../services/admin.service.js";
import { ok } from "../../utils/http.js";

export function getAdminOverview(_req: Request, res: Response) {
  return ok(res, getOverview());
}

export function getAdminOrders(_req: Request, res: Response) {
  return ok(res, listAdminOrders());
}
