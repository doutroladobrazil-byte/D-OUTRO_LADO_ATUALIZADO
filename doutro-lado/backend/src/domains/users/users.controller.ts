import type { Request, Response } from "express";
import { listUsers as getUsers } from "../../services/admin.service.js";
import { ok } from "../../utils/http.js";

export async function listUsers(_req: Request, res: Response) {
  return ok(res, await getUsers());
}
