-- Stage 15: Inventory Reservations
-- Temporary stock holds created at checkout start, before Stripe session.
-- Prevents oversell by reserving stock atomically while user completes payment.

CREATE TABLE IF NOT EXISTS inventory_reservations (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                    UUID        REFERENCES orders(id) ON DELETE CASCADE,
  stripe_checkout_session_id  VARCHAR(255),
  product_id                  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity                    INTEGER     NOT NULL CHECK (quantity > 0),
  -- active: reserved, awaiting payment
  -- consumed: payment confirmed, stock deducted
  -- expired: TTL elapsed without payment
  -- released: manually released (e.g. cancel flow)
  status                      VARCHAR(20) NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','consumed','expired','released')),
  expires_at                  TIMESTAMPTZ NOT NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ir_product_status_expires
  ON inventory_reservations (product_id, status, expires_at);

CREATE INDEX IF NOT EXISTS idx_ir_order_id
  ON inventory_reservations (order_id);

CREATE INDEX IF NOT EXISTS idx_ir_stripe_session
  ON inventory_reservations (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ir_status_expires
  ON inventory_reservations (status, expires_at)
  WHERE status = 'active';

-- env var RESERVATION_TTL_MINUTES controls expiry window (default 20 min).
