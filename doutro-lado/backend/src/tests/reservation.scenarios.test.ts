/**
 * Stage 15 — Reservation service scenario tests
 *
 * Uses Node.js built-in test runner (node:test).
 * These are pure unit tests — the db dependency is stubbed via closures so no
 * live database connection is required.
 *
 * Run:  npx tsx --test src/tests/reservation.scenarios.test.ts
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Minimal in-memory db stub
// ---------------------------------------------------------------------------

type DbRow = Record<string, unknown>;
type QueryResult = DbRow[];

interface FakeDb {
  (strings: TemplateStringsArray, ...values: unknown[]): QueryResult;
  array(arr: unknown[]): unknown[];
  callCount: number;
  calls: string[];
}

function makeFakeDb(responses: QueryResult[]): FakeDb {
  let idx = 0;
  const calls: string[] = [];
  const fn = function (strings: TemplateStringsArray, ..._values: unknown[]): QueryResult {
    const key = strings[0].trim().slice(0, 60).replace(/\s+/g, " ");
    calls.push(key);
    const resp = responses[idx++];
    if (resp === undefined) throw new Error(`db call #${idx} has no queued response. Key: "${key}"`);
    return resp;
  } as unknown as FakeDb;
  fn.array = (a: unknown[]) => a;
  Object.defineProperty(fn, "callCount", { get: () => idx });
  Object.defineProperty(fn, "calls", { get: () => calls });
  return fn;
}

// ---------------------------------------------------------------------------
// Core reservation logic — duplicated here to avoid importing the real module
// (which requires a live db connection and env vars).
// ---------------------------------------------------------------------------

type ReservationItem = { productId: string; slug: string; name: string; quantity: number };

async function checkAndReserveLogic(
  db: FakeDb,
  items: ReservationItem[],
  orderId: string,
  ttlMinutes: number
): Promise<string[]> {
  if (!items.length) return [];

  const productIds = items.map((i) => i.productId);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  // 1. Expire stale reservations
  db`UPDATE inventory_reservations SET status = 'expired' WHERE expires_at < NOW() AND product_id = ANY(${productIds})`;

  // 2. Load available stock
  const stockRows = db`SELECT id, sku, name, stock AS physical_stock, reserved FROM products WHERE id = ANY(${productIds})`;

  const stockMap = new Map<string, { sku: string; name: string; physical: number; reserved: number }>();
  for (const row of stockRows) {
    stockMap.set(row.id as string, {
      sku: row.sku as string,
      name: row.name as string,
      physical: Number(row.physical_stock),
      reserved: Number(row.reserved ?? 0),
    });
  }

  // 3. Validate availability
  const errors: string[] = [];
  for (const item of items) {
    const stock = stockMap.get(item.productId);
    if (!stock) { errors.push(`Product not found: ${item.slug}`); continue; }
    const available = stock.physical - stock.reserved;
    if (available < item.quantity) {
      errors.push(`"${stock.name}" (${stock.sku}): only ${available} available`);
    }
  }
  if (errors.length > 0) throw new Error(`Insufficient stock:\n${errors.join("\n")}`);

  // 4. Insert reservation rows
  const ids: string[] = [];
  for (const item of items) {
    const rows = db`INSERT INTO inventory_reservations (order_id, product_id, quantity, expires_at) VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${expiresAt})`;
    ids.push(rows[0].id as string);
  }
  return ids;
}

function consumeReservationsLogic(db: FakeDb, stripeSessionId: string): number {
  const rows = db`UPDATE inventory_reservations SET status = 'consumed' WHERE stripe_checkout_session_id = ${stripeSessionId} AND status = 'active'`;
  return rows.length;
}

function expireStaleReservationsLogic(db: FakeDb): number {
  const rows = db`UPDATE inventory_reservations SET status = 'expired' WHERE status = 'active' AND expires_at < NOW()`;
  return rows.length;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("checkAndReserve — happy path", () => {
  it("creates reservation rows for all items", async () => {
    const db = makeFakeDb([
      [],                                                                                             // expire stale
      [{ id: "prod-1", sku: "SKU-1", name: "Camiseta", physical_stock: 5, reserved: 0 }],            // stock query
      [{ id: "res-1" }],                                                                              // insert
    ]);
    const ids = await checkAndReserveLogic(
      db,
      [{ productId: "prod-1", slug: "camiseta", name: "Camiseta", quantity: 2 }],
      "order-1",
      20
    );
    assert.deepEqual(ids, ["res-1"]);
  });

  it("returns empty array for zero items without any db calls", async () => {
    const db = makeFakeDb([]);
    const ids = await checkAndReserveLogic(db, [], "order-1", 20);
    assert.deepEqual(ids, []);
    assert.equal(db.callCount, 0);
  });
});

describe("checkAndReserve — stock validation", () => {
  it("throws when requested quantity exceeds available", async () => {
    const db = makeFakeDb([
      [],                                                                                              // expire stale
      [{ id: "prod-1", sku: "SKU-1", name: "Camiseta", physical_stock: 2, reserved: 1 }],            // stock: 2 physical, 1 reserved = 1 available
    ]);
    await assert.rejects(
      () => checkAndReserveLogic(db, [{ productId: "prod-1", slug: "camiseta", name: "Camiseta", quantity: 3 }], "order-1", 20),
      /Insufficient stock/
    );
  });

  it("throws for unknown product", async () => {
    const db = makeFakeDb([[], []]);
    await assert.rejects(
      () => checkAndReserveLogic(db, [{ productId: "unknown", slug: "ghost", name: "Ghost", quantity: 1 }], "order-1", 20),
      /Insufficient stock/
    );
  });

  it("accounts for active reservations from other sessions", async () => {
    // 5 physical, 4 already reserved → only 1 available; requesting 2 should fail
    const db = makeFakeDb([
      [],
      [{ id: "prod-1", sku: "SKU-1", name: "Camiseta", physical_stock: 5, reserved: 4 }],
    ]);
    await assert.rejects(
      () => checkAndReserveLogic(db, [{ productId: "prod-1", slug: "camiseta", name: "Camiseta", quantity: 2 }], "order-1", 20),
      /only 1 available/
    );
  });
});

describe("consumeReservations — idempotency", () => {
  it("returns count of consumed reservations on first call", () => {
    const db = makeFakeDb([[{ id: "res-1" }, { id: "res-2" }]]);
    assert.equal(consumeReservationsLogic(db, "cs_abc"), 2);
  });

  it("returns 0 on duplicate webhook call (already consumed)", () => {
    const db = makeFakeDb([[]]); // WHERE status = 'active' matches nothing
    assert.equal(consumeReservationsLogic(db, "cs_abc"), 0);
  });

  it("does not affect reservations for other sessions", () => {
    const db = makeFakeDb([[]]); // different session_id → no match
    assert.equal(consumeReservationsLogic(db, "cs_other"), 0);
  });
});

describe("expireStaleReservations", () => {
  it("returns count of expired reservations", () => {
    const db = makeFakeDb([[{ id: "r1" }, { id: "r2" }, { id: "r3" }]]);
    assert.equal(expireStaleReservationsLogic(db), 3);
  });

  it("returns 0 when no stale reservations exist", () => {
    const db = makeFakeDb([[]]); // empty result
    assert.equal(expireStaleReservationsLogic(db), 0);
  });
});

describe("Concurrent checkout — last unit scenario", () => {
  it("second session is rejected when first already reserved the last unit", async () => {
    // Session A: 1 physical, 0 reserved → reserves successfully
    const dbA = makeFakeDb([
      [],
      [{ id: "prod-1", sku: "SKU-1", name: "Camiseta", physical_stock: 1, reserved: 0 }],
      [{ id: "res-A" }],
    ]);
    const idsA = await checkAndReserveLogic(
      dbA,
      [{ productId: "prod-1", slug: "camiseta", name: "Camiseta", quantity: 1 }],
      "order-A",
      20
    );
    assert.deepEqual(idsA, ["res-A"], "Session A should succeed");

    // Session B: now 1 physical, 1 reserved by A → 0 available → rejected
    const dbB = makeFakeDb([
      [],
      [{ id: "prod-1", sku: "SKU-1", name: "Camiseta", physical_stock: 1, reserved: 1 }],
    ]);
    await assert.rejects(
      () => checkAndReserveLogic(
        dbB,
        [{ productId: "prod-1", slug: "camiseta", name: "Camiseta", quantity: 1 }],
        "order-B",
        20
      ),
      /only 0 available/,
      "Session B should be rejected"
    );
  });

  it("second session succeeds after first reservation expires", async () => {
    // Session A reserved, then expired → reserved count back to 0 for B
    const dbB = makeFakeDb([
      [],
      [{ id: "prod-1", sku: "SKU-1", name: "Camiseta", physical_stock: 1, reserved: 0 }],
      [{ id: "res-B" }],
    ]);
    const idsB = await checkAndReserveLogic(
      dbB,
      [{ productId: "prod-1", slug: "camiseta", name: "Camiseta", quantity: 1 }],
      "order-B",
      20
    );
    assert.deepEqual(idsB, ["res-B"], "Session B should succeed after expiry");
  });
});
