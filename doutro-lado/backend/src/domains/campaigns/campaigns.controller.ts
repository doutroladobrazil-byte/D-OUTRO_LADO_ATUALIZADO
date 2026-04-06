import type { Request, Response } from "express";
import { listCampaigns } from "../../services/catalog.service.js";
import { ok } from "../../utils/http.js";

export async function getCampaigns(_req: Request, res: Response) {
  return ok(res, await listCampaigns());
}
