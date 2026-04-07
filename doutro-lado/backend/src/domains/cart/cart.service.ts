import { z } from "zod";
import { db } from "../../lib/db.js";
import { getProductsBySlug } from "../../services/catalog.service.js";
import type { Brand, WeightRange } from "../../types/domain.js";
import type { Cart, CartItemLine, UpsertCartItemInput } from "./cart.types.js";

// =============================================================================
// Validation
// =============================================================================

export const upsertCartItemSchema = z.object({
  brand: z.enum(["casa", "moda"]),
  productSlug: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(50),
});

// =============================================================================
// Row mapper
// =============================================================================

async function fetchCartRows(cartId: string) {
  return db`
    SELECT
      c.id AS cart_id, c.profile_id, c.brand, c.currency,
      c.created_at, c.updated_at,
      ci.id AS item_id, ci.product_id, ci.quantity,
      p.slug, p.name AS product_name, p.sku,
      p.brand AS product_brand,
      p.retail_price_brl, p.weight_range, p.stock
    FROM carts c
    LEFT JOIN cart_items ci ON ci.cart_id = c.id
    LEFT JOIN products p ON p.id = ci.product_id
    WHERE c.id = ${cartId}
    ORDER BY ci.id
  `;
}

function mapToCart(rows: Record<string, unknown>[]): Cart {
  if (rows.length === 0) throw new Error("Cart not found");
  const first = rows[0];

  const items: CartItemLine[] = rows
    .filter((r) => r.item_id !== null)
    .map((r) => {
      const unitPrice = Number(r.retail_price_brl);
      const qty = r.quantity as number;
      return {
        id: r.item_id as string,
        productId: r.product_id as string,
        productSlug: r.slug as string,
        productName: r.product_name as string,
        sku: r.sku as string,
        brand: r.product_brand as Brand,
        quantity: qty,
        unitPriceBRL: unitPrice,
        lineTotalBRL: Number((unitPrice * qty).toFixed(2)),
        weightRange: r.weight_range as WeightRange,
        stock: r.stock as number,
      };
    });

  const subtotalBRL = Number(items.reduce((s, i) => s + i.lineTotalBRL, 0).toFixed(2));

  return {
    id: first.cart_id as string,
    profileId: (first.profile_id as string | null) ?? null,
    brand: first.brand as Brand,
    currency: first.currency as string,
    items,
    subtotalBRL,
    createdAt: (first.created_at as Date).toISOString(),
    updatedAt: (first.updated_at as Date).toISOString(),
  };
}

// =============================================================================
// Core operations
// =============================================================================

/**
 * Get or create a cart for a (profile, brand) pair.
 * Each user has at most one cart per brand (enforced by UNIQUE constraint).
 */
export async function getOrCreateCart(profileId: string, brand: Brand): Promise<Cart> {
  // Upsert — idempotent
  const [row] = await db`
    INSERT INTO carts (profile_id, brand, currency)
    VALUES (${profileId}, ${brand}, 'BRL')
    ON CONFLICT (profile_id, brand) DO UPDATE
      SET updated_at = now()
    RETURNING id
  `;
  const rows = await fetchCartRows(row.id as string);
  return mapToCart(rows as Record<string, unknown>[]);
}

/**
 * Get cart by ID (used in checkout to build order from persisted cart).
 */
export async function getCartById(cartId: string): Promise<Cart> {
  const rows = await fetchCartRows(cartId);
  if (rows.length === 0) throw new Error("Cart not found");
  return mapToCart(rows as Record<string, unknown>[]);
}

/**
 * Get the active cart for a profile+brand. Returns null if no cart exists.
 */
export async function getCartByProfile(profileId: string, brand: Brand): Promise<Cart | null> {
  const [row] = await db`
    SELECT id FROM carts WHERE profile_id = ${profileId} AND brand = ${brand}
  `;
  if (!row) return null;
  const rows = await fetchCartRows(row.id as string);
  return mapToCart(rows as Record<string, unknown>[]);
}

/**
 * Upsert a cart item (add, update quantity, or remove if quantity=0).
 * Validates product brand matches cart brand.
 * Validates stock.
 */
export async function upsertCartItem(
  profileId: string,
  input: UpsertCartItemInput
): Promise<Cart> {
  const parsed = upsertCartItemSchema.parse(input);

  // Resolve product
  const [product] = await getProductsBySlug([parsed.productSlug]);
  if (!product) throw new Error(`Product not found: ${parsed.productSlug}`);
  if (product.brand !== parsed.brand) {
    throw new Error(
      `Product "${product.slug}" belongs to brand "${product.brand}" but cart is "${parsed.brand}". Casa and Moda items cannot be mixed.`
    );
  }
  if (parsed.quantity > product.stock) {
    throw new Error(`Insufficient stock for "${product.slug}". Available: ${product.stock}`);
  }

  // Get or create cart
  const cart = await getOrCreateCart(profileId, parsed.brand);

  if (parsed.quantity === 0) {
    // Remove item
    await db`
      DELETE FROM cart_items
      WHERE cart_id = ${cart.id} AND product_id = ${product.id}
    `;
  } else {
    // Upsert item
    await db`
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES (${cart.id}, ${product.id}, ${parsed.quantity})
      ON CONFLICT (cart_id, product_id) DO UPDATE
        SET quantity = ${parsed.quantity}
    `;
  }

  // Touch cart updated_at
  await db`UPDATE carts SET updated_at = now() WHERE id = ${cart.id}`;

  const rows = await fetchCartRows(cart.id);
  return mapToCart(rows as Record<string, unknown>[]);
}

/**
 * Clear all items from a cart (called after order creation).
 */
export async function clearCart(cartId: string): Promise<void> {
  await db`DELETE FROM cart_items WHERE cart_id = ${cartId}`;
  await db`UPDATE carts SET updated_at = now() WHERE id = ${cartId}`;
}
