import type { Request, Response } from "express";
import { listContentBlocks as getContentBlocks } from "../../services/admin.service.js";
import { ok } from "../../utils/http.js";

export function listContentBlocks(_req: Request, res: Response) {
  return ok(res, getContentBlocks());
}
