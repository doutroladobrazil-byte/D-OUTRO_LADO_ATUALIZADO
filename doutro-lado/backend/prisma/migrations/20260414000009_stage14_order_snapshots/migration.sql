-- Stage 14: checkout contact + shipping address snapshots on orders
-- These columns capture the buyer's data at the moment of purchase so the
-- order remains fully operational even if the profile or address changes later.
-- Existing orders receive NULL values (no backfill required — pre-Stage 14 orders
-- were all authenticated and can fall back to the profiles JOIN).
--
-- Note: shipping_country_code and shipping_country_name are already stored in
-- destination_country_code / destination_country_name (added in Stage 12) and
-- are therefore NOT duplicated here.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name_snapshot         VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email_snapshot        VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone_snapshot        VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_line1_snapshot        VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_line2_snapshot        VARCHAR(200);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city_snapshot         VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state_region_snapshot VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_postal_code_snapshot  VARCHAR(20);
