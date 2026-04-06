import { z } from "zod";
import { WEIGHT_RANGES, weightRangeUpperBoundsKg } from "../../config/constants.js";
import { db } from "../../lib/db.js";
import { getProductsBySlug } from "../../services/catalog.service.js";
import type { Brand, BuiltOrder, Role, WeightRange } from "../../types/domain.js";
import { quoteFreight } from "../freight/freight.service.js";

const itemSchema = z.object({
  productSlug: z.string().min(1),
  quantity: z.coerce.number().int().min(1)
});

const orderSchema = z.object({
  brand: z.enum(["casa", "moda"]),
  region: z.enum(["North America", "Europe", "Middle East"]),
  currency: z.string().default("USD"),
  items: z.array(itemSchema).min(1)
});

function resolveWeightRangeFromTotalKg(totalKg: number): WeightRange {
  return WEIGHT_RANGES.find((range) => totalKg <= weightRangeUpperBoundsKg[range]) ?? "15-20kg";
}

export async function buildOrder(payload: unknown, role: Role = "customer"): Promise<BuiltOrder> {
  const parsed = orderSchema.parse(payload);

  const slugs = parsed.items.map((i) => i.productSlug);
  const products = await getProductsBySlug(slugs);

  const normalizedItems = parsed.items.map((item) => {
    const product = products.find((p) => p.slug === item.productSlug);
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
      brand: product.brand,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      quantity: item.quantity,
      unitPriceBRL,
      lineTotalBRL: Number((unitPriceBRL * item.quantity).toFixed(2)),
      weightRange: product.weightRange
    };
  });

  ensureSingleBrandOrder(parsed.brand, normalizedItems.map((item) => item.brand));

  const subtotalBRL = normalizedItems.reduce((sum, item) => sum + item.lineTotalBRL, 0);
  const estimatedTotalKg = normalizedItems.reduce((sum, item) => {
    return sum + weightRangeUpperBoundsKg[item.weightRange] * item.quantity;
  }, 0);
  const estimatedWeightRange = resolveWeightRangeFromTotalKg(estimatedTotalKg);
  const freight = await quoteFreight({
    region: parsed.region,
    weightRange: estimatedWeightRange,
    quantity: normalizedItems.reduce((sum, item) => sum + item.quantity, 0)
  });
  const totalBRL = Number((subtotalBRL + freight.amountBRL).toFixed(2));
  const publicId = `DL-${Date.now()}`;

  // Persist to database
  const [order] = await db`
    INSERT INTO orders
      (public_id, brand, currency, subtotal_brl, freight_brl, total_brl, shipping_region)
    VALUES
      (${publicId}, ${parsed.brand}, ${parsed.currency}, ${subtotalBRL}, ${freight.amountBRL}, ${totalBRL}, ${parsed.region})
    RETURNING id
  `;

  await db`
    INSERT INTO order_items ${db(
      normalizedItems.map((item) => ({
        order_id: order.id as string,
        product_id: item.productId,
        brand: item.brand,
        product_name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price_brl: item.unitPriceBRL,
        weight_range: item.weightRange,
        line_total_brl: item.lineTotalBRL,
      }))
    )}
  `;

  return {
    publicId,
    brand: parsed.brand,
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

function ensureSingleBrandOrder(expectedBrand: Brand, itemBrands: Brand[]) {
  const uniqueBrands = [...new Set(itemBrands)];
  if (uniqueBrands.length !== 1 || uniqueBrands[0] !== expectedBrand) {
    throw new Error("Order items must belong to a single site brand. Casa and Moda cannot be mixed.");
  }
}
