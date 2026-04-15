import type { Request, Response } from "express";
import { fail, ok } from "../../utils/http.js";
import { buildOrder, getOrdersByProfile } from "./orders.service.js";

export async function listMyOrders(req: Request, res: Response) {
  try {
    const profileId = req.user?.profileId;
    if (!profileId) return fail(res, "Unauthorized", 401);
    const orders = await getOrdersByProfile(profileId);
    return ok(res, orders);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Failed to fetch orders", 500);
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    // Stage 14: profileId is optional — guest orders have req.user = undefined.
    const profileId = req.user?.profileId;
    const role = req.user?.role;
    const order = await buildOrder(req.body, role, profileId);
    return ok(res, order, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Invalid order payload", 400);
  }
}
