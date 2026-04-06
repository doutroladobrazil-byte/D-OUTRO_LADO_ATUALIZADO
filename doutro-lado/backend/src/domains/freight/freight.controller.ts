import type { Request, Response } from "express";
import { fail, ok } from "../../utils/http.js";
import { quoteFreight } from "./freight.service.js";

export async function getFreightQuote(req: Request, res: Response) {
  try {
    const quote = await quoteFreight(req.query);
    return ok(res, quote);
  } catch {
    return fail(res, "Invalid freight quote payload", 400);
  }
}
