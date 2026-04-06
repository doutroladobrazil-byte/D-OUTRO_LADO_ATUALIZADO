import { z } from "zod";
import { WEIGHT_RANGES, weightRangeUpperBoundsKg } from "../../config/constants.js";
import { products } from "../../data/mock-store.js";
import type { BuiltOrder, Role, WeightRange } from "../../types/domain.js";
import { quoteFreight } from "../freight/freight.service.js";

const itemSchema = z.object({
  productSlug: z.string().min(1),
  quantity: z.coerce.number().int().min(1)
});

const orderSchema = z.object({
  region: z.enum(["North America", "Europe", "Middle East"]),
  currency: z.string().default("USD"),
  items: z.array(itemSchema).min(1)
});

function resolveWeightRangeFromTotalKg(totalKg: number): WeightRange {
  return WEIGHT_RANGES.find((range) => totalKg <= weightRangeUpperBoundsKg[range]) ?? "15-20kg";
}

export function buildOrder(payload: unknown, role: Role = "customer"): BuiltOrder {
  const parsed = orderSchema.parse(payload);

  const normalizedItems = parsed.items.map((item) => {
    const product = products.find((entry) => entry.slug === item.productSlug);
    if (!product) {
      throw new Error(`Product not found: ${item.productSlug}`);
    }
    if (item.quantity > product.stock) {
      throw new Error(`Insufficient stock for ${product.slug}. Available: ${product.stock}`);
    }

    const useWholesalePrice = role === "wholesale" && item.quantity >= product.wholesaleMinQty;
    const unitPriceBRL = useWholesalePrice ? product.wholesalePriceBRL : product.retailPriceBRL;

    return {
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      quantity: item.quantity,
      unitPriceBRL,
      lineTotalBRL: Number((unitPriceBRL * item.quantity).toFixed(2)),
      weightRange: product.weightRange
    };
  });

  const subtotalBRL = normalizedItems.reduce((sum, item) => sum + item.lineTotalBRL, 0);
  const estimatedTotalKg = normalizedItems.reduce((sum, item) => {
    return sum + weightRangeUpperBoundsKg[item.weightRange] * item.quantity;
  }, 0);
  const estimatedWeightRange = resolveWeightRangeFromTotalKg(estimatedTotalKg);
  const freight = quoteFreight({
    region: parsed.region,
    weightRange: estimatedWeightRange,
    quantity: normalizedItems.reduce((sum, item) => sum + item.quantity, 0)
  });
  const totalBRL = Number((subtotalBRL + freight.amountBRL).toFixed(2));

  return {
    publicId: `DL-${Date.now()}`,
    currency: parsed.currency,
    region: parsed.region,
    pricingTier: role === "wholesale" ? "wholesale" : "retail",
    items: normalizedItems,
    subtotalBRL,
    freightBRL: freight.amountBRL,
    totalBRL,
    estimatedWeightRange,
    paymentStatus: "pending",
    orderStatus: "created",
    fiscalStatus: "pending"
  };
}
