import type { Request, Response } from "express";
import { fail, ok } from "../../utils/http.js";
import { buildOrder } from "./orders.service.js";

export function createOrder(req: Request, res: Response) {
  try {
    const order = buildOrder(req.body, req.user?.role);
    return ok(res, order, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Invalid order payload", 400);
  }
}
