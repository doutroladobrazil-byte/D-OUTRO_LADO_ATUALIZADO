import type { Request, Response } from "express";
import { listFreightRates } from "../../services/catalog.service.js";
import { ok } from "../../utils/http.js";

export async function listShippingRates(_req: Request, res: Response) {
  return ok(res, await listFreightRates());
}
