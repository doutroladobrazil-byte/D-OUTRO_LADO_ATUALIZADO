/**
 * Stage 15 — Inventory Reservation Service
 *
 * Manages temporary stock holds that prevent oversell during the checkout
 * window (from "checkout start" to "payment confirmed or expired").
 *
 * Flow:
 *   1. checkAndReserve()      — called before creating Stripe session
 *   2. attachSessionToReservations() — called after Stripe session is created
 *   3. consumeReservations()  — called on checkout.session.completed webhook
 *   4. releaseReservations()  — called on cancel / explicit release
 *   5. expireStaleReservations() — called periodically via internal endpoint
 */

import { db } from "../../lib/db.js";
import { env } from "../../config/env.js";
import { logSystemEvent } from "../admin/system-log.service.js";

// =============================================================================
// Types
// =============================================================================

export type ReservationItem = {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
};

// =============================================================================
// Helpers
// =============================================================================

function ttlMinutes(): number {
  return env.RESERVATION_TTL_MINUTES;
}

// =============================================================================
// checkAndReserve
// =============================================================================

/**
 * Opportunistically expires stale reservations, then computes available stock
 * for each item (physical stock − active reservations), validates them all,
 * and inserts reservation rows atomically.
 *
 * Throws with a human-readable message if any item is out of stock.
 *
 * @param items    Product items to reserve
 * @param orderId  Order that owns the reservations
 * @returns        Array of reservation IDs created
 */
export async function checkAndReserve(
  items: ReservationItem[],
  orderId: string
): Promise<string[]> {
  if (!items.length) return [];

  const productIds = items.map((i) => i.productId);
  const ttl = ttlMinutes();
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

  // 1. Opportunistically expire stale reservations for these products
  await db`
    UPDATE inventory_reservations
    SET    status = 'expired', updated_at = NOW()
    WHERE  status = 'active'
      AND  expires_at < NOW()
      AND  product_id = ANY(${db.array(productIds)}::uuid[])
  `;

  // 2. Compute available stock per product in a single query
  //    available = physical_stock − sum(active reservations)
  const stockRows = await db`
    SELECT
      p.id,
      p.sku,
      p.name,
      p.stock AS physical_stock,
      COALESCE(SUM(ir.quantity) FILTER (
        WHERE ir.status = 'active' AND ir.expires_at > NOW()
      ), 0)::int AS reserved
    FROM products p
    LEFT JOIN inventory_reservations ir ON ir.product_id = p.id
    WHERE p.id = ANY(${db.array(productIds)}::uuid[])
    GROUP BY p.id, p.sku, p.name, p.stock
  `;

  const stockMap = new Map<string, { sku: string; name: string; physical: number; reserved: number }>();
  for (const row of stockRows) {
    stockMap.set(row.id as string, {
      sku: row.sku as string,
      name: row.name as string,
      physical: Number(row.physical_stock),
      reserved: Number(row.reserved),
    });
  }

  // 3. Validate availability
  const errors: string[] = [];
  for (const item of items) {
    const stock = stockMap.get(item.productId);
    if (!stock) {
      errors.push(`Product not found: ${item.slug}`);
      continue;
    }
    const available = stock.physical - stock.reserved;
    if (available < item.quantity) {
      errors.push(
        `"${stock.name}" (${stock.sku}): only ${available} unit${available === 1 ? "" : "s"} available (requested ${item.quantity})`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Insufficient stock:\n${errors.join("\n")}`);
  }

  // 4. Insert reservation rows
  const reservationIds: string[] = [];
  for (const item of items) {
    const [row] = await db`
      INSERT INTO inventory_reservations
        (order_id, product_id, quantity, status, expires_at)
      VALUES
        (${orderId}::uuid, ${item.productId}::uuid, ${item.quantity}, 'active', ${expiresAt.toISOString()})
      RETURNING id
    `;
    reservationIds.push(row.id as string);
  }

  // 5. Log system event
  await logSystemEvent("reservation_created", "order", orderId, {
    itemCount: items.length,
    expiresAt: expiresAt.toISOString(),
    ttlMinutes: ttl,
  });

  return reservationIds;
}

// =============================================================================
// attachSessionToReservations
// =============================================================================

/**
 * Associates a Stripe checkout session ID with all active reservations for
 * the given order. Called after the Stripe session is created.
 */
export async function attachSessionToReservations(
  orderId: string,
  stripeSessionId: string
): Promise<void> {
  await db`
    UPDATE inventory_reservations
    SET    stripe_checkout_session_id = ${stripeSessionId},
           updated_at = NOW()
    WHERE  order_id = ${orderId}::uuid
      AND  status = 'active'
  `;
}

// =============================================================================
// consumeReservations
// =============================================================================

/**
 * Marks all active reservations for a Stripe session as consumed.
 * Idempotent — only transitions 'active' reservations.
 * Called from the checkout.session.completed webhook.
 */
export async function consumeReservations(stripeSessionId: string): Promise<number> {
  const result = await db`
    UPDATE inventory_reservations
    SET    status = 'consumed', updated_at = NOW()
    WHERE  stripe_checkout_session_id = ${stripeSessionId}
      AND  status = 'active'
    RETURNING id, order_id
  `;

  if (result.length > 0) {
    const orderId = result[0].order_id as string | null;
    await logSystemEvent("reservation_consumed", "order", orderId ?? stripeSessionId, {
      stripeSessionId,
      count: result.length,
    });
  }

  return result.length;
}

// =============================================================================
// releaseReservations
// =============================================================================

/**
 * Releases all active reservations for an order (cancel / explicit release).
 * Idempotent — only transitions 'active' reservations.
 */
export async function releaseReservations(orderId: string): Promise<number> {
  const result = await db`
    UPDATE inventory_reservations
    SET    status = 'released', updated_at = NOW()
    WHERE  order_id = ${orderId}::uuid
      AND  status = 'active'
    RETURNING id
  `;

  if (result.length > 0) {
    await logSystemEvent("reservation_released", "order", orderId, {
      count: result.length,
    });
  }

  return result.length;
}

// =============================================================================
// expireStaleReservations
// =============================================================================

/**
 * Marks all globally expired active reservations as expired.
 * Called periodically via POST /api/internal/reservations/expire.
 * Also called opportunistically per-product in checkAndReserve.
 *
 * @returns count of reservations expired
 */
export async function expireStaleReservations(): Promise<number> {
  const result = await db`
    UPDATE inventory_reservations
    SET    status = 'expired', updated_at = NOW()
    WHERE  status = 'active'
      AND  expires_at < NOW()
    RETURNING id
  `;

  if (result.length > 0) {
    await logSystemEvent("reservation_expired", "system", "batch", {
      count: result.length,
      expiredAt: new Date().toISOString(),
    });
  }

  return result.length;
}

// =============================================================================
// getReservationSummary
// =============================================================================

/**
 * Returns active + recently consumed reservation counts per product.
 * Used by admin stock overview.
 */
export async function getReservationSummaryByProduct(): Promise<
  Map<string, { reserved: number }>
> {
  const rows = await db`
    SELECT
      product_id,
      SUM(quantity) FILTER (WHERE status = 'active' AND expires_at > NOW())::int AS reserved
    FROM inventory_reservations
    GROUP BY product_id
  `;

  const map = new Map<string, { reserved: number }>();
  for (const row of rows) {
    const reserved = Number(row.reserved ?? 0);
    if (reserved > 0) {
      map.set(row.product_id as string, { reserved });
    }
  }
  return map;
}
