import { z } from "zod";
import { WEIGHT_RANGES } from "../../config/constants.js";
import { listFreightRates } from "../../services/catalog.service.js";

const schema = z.object({
  region: z.enum(["North America", "Europe", "Middle East"]),
  weightRange: z.enum(WEIGHT_RANGES),
  quantity: z.coerce.number().int().min(1).default(1)
});

export type FreightQuoteInput = z.infer<typeof schema>;

export function quoteFreight(input: unknown) {
  const parsed = schema.parse(input);
  const rate = listFreightRates(parsed.weightRange).find((entry) => entry.region === parsed.region);
  if (!rate) {
    throw new Error(`Freight rate not found for ${parsed.region} / ${parsed.weightRange}`);
  }

  const amountBRL = Number((rate.amountBRL + Math.max(0, parsed.quantity - 1) * 12).toFixed(2));
  return { ...parsed, amountBRL };
}
