import type { Request, Response } from "express";
import { getAdminOverview as getOverview, listAdminOrders } from "../../services/admin.service.js";
import { ok } from "../../utils/http.js";

export async function getAdminOverview(_req: Request, res: Response) {
  return ok(res, await getOverview());
}

export async function getAdminOrders(_req: Request, res: Response) {
  return ok(res, await listAdminOrders());
}
