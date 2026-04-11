-- Stage 7: Stripe integration + order expansions
-- Adds stripe_session_id, estimated_weight_range, and order_items gift_kit linkage.
-- All statements are idempotent.

-- Stripe session ID on orders (unique so webhook can look up by session).
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "stripe_session_id" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_stripe_session_id_key'
      AND conrelid = 'orders'::regclass
  ) THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_stripe_session_id_key"
      UNIQUE (stripe_session_id);
  END IF;
END$$;

-- Estimated weight range for freight quoting.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "estimated_weight_range" TEXT;

-- Index for fast Stripe webhook lookup.
CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx
  ON orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
