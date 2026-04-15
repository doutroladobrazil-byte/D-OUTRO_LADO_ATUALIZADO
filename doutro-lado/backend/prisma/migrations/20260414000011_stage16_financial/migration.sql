-- Stage 16: Financial snapshot — product cost, order margin
-- ============================================================
-- BLOCO 1A: cost_price_brl on products
--   Stores the landed cost of the product (manufacturing + logistics in).
--   Used only for margin calculation — never exposed in the public catalog API.
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cost_price_brl NUMERIC(12, 2);

-- ============================================================
-- BLOCO 1B: financial snapshot columns on orders
--   All nullable — historical orders (pre-Stage 16) will have NULL values.
--   product_cost_brl_snapshot = SUM(unit_cost × qty) for all items at order time.
--     NULL when any product item has no cost_price_brl set.
--   gateway_fee_brl_snapshot  = ESTIMATED: ~3.5% of total_brl (Stripe BR flat rate).
--     Documented as an estimate; not a precise gateway record.
--   gross_margin_brl_snapshot = total_brl − product_cost_brl_snapshot
--   net_margin_brl_snapshot   = total_brl − product_cost_brl_snapshot
--                               − freight_brl − gateway_fee_brl_snapshot
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_cost_brl_snapshot  NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS gateway_fee_brl_snapshot   NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS gross_margin_brl_snapshot  NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS net_margin_brl_snapshot    NUMERIC(12, 2);

CREATE INDEX IF NOT EXISTS idx_orders_payment_country
  ON orders (payment_status, destination_country_code)
  WHERE payment_status = 'paid';

-- ============================================================
-- BLOCO 1C: cost snapshot on order_items
--   Captures unit cost at the moment of order creation.
--   NULL when product has no cost_price_brl set.
-- ============================================================

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS unit_cost_brl_snapshot   NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS line_cost_brl_snapshot   NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS line_margin_brl_snapshot NUMERIC(12, 2);
