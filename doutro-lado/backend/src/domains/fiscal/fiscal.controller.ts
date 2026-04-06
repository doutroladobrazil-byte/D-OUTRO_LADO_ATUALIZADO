import type { Request, Response } from "express";
import { listFiscalStatuses as getFiscalStatuses } from "../../services/admin.service.js";
import { ok } from "../../utils/http.js";

export async function listFiscalStatuses(_req: Request, res: Response) {
  return ok(res, await getFiscalStatuses());
}
