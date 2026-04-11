-- Stage 11: Bag all-in pricing + stock deduction + recovery system + offer codes
-- All statements are idempotent (IF NOT EXISTS / ON CONFLICT DO).

-- =============================================================================
-- 1. Bag pricing rules table (all-in pricing per region)
-- =============================================================================
CREATE TABLE IF NOT EXISTS "bag_pricing_rules" (
  "id"             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "region"         TEXT          NOT NULL UNIQUE,
  "tax_brl"        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  "logistics_brl"  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  "margin_percent" NUMERIC(5,2)  NOT NULL DEFAULT 0.00,
  "is_active"      BOOLEAN       NOT NULL DEFAULT true,
  "updated_at"     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Seed default rules (zeros) for all supported regions.
INSERT INTO "bag_pricing_rules" (region, tax_brl, logistics_brl, margin_percent, is_active)
VALUES
  ('North America', 0.00, 0.00, 0.00, true),
  ('Europe',        0.00, 0.00, 0.00, true),
  ('Middle East',   0.00, 0.00, 0.00, true)
ON CONFLICT (region) DO NOTHING;

-- =============================================================================
-- 2. Orders: pricing audit + idempotent stock deduction columns
-- =============================================================================
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pricing_version"    TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "stock_deducted_at"  TIMESTAMPTZ;

-- =============================================================================
-- 3. Profiles: phone number for WhatsApp recovery
-- =============================================================================
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- =============================================================================
-- 4. Orders: offer code tracking
-- =============================================================================
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "offer_code"   TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_brl" NUMERIC(12,2) DEFAULT 0.00;
UPDATE "orders" SET "discount_brl" = 0.00 WHERE "discount_brl" IS NULL;
ALTER TABLE "orders" ALTER COLUMN "discount_brl" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "discount_brl" SET DEFAULT 0.00;

-- =============================================================================
-- 5. Order items: gift kit reference
-- =============================================================================
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "gift_kit_id" UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'order_items_gift_kit_id_fkey'
      AND conrelid = 'order_items'::regclass
  ) THEN
    ALTER TABLE "order_items" ADD CONSTRAINT "order_items_gift_kit_id_fkey"
      FOREIGN KEY (gift_kit_id) REFERENCES "gift_kits"(id) ON DELETE SET NULL;
  END IF;
END$$;

-- =============================================================================
-- 6. Bag recovery offers table
-- =============================================================================
CREATE TABLE IF NOT EXISTS "bag_recovery_offers" (
  "id"                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "code"               TEXT          NOT NULL UNIQUE,
  "profile_id"         UUID          REFERENCES "profiles"(id) ON DELETE SET NULL,
  "brand"              TEXT          NOT NULL,
  "cart_version_token" TEXT          NOT NULL,
  "discount_percent"   NUMERIC(5,2)  NOT NULL DEFAULT 10.00,
  "valid_until"        TIMESTAMPTZ   NOT NULL,
  "is_used"            BOOLEAN       NOT NULL DEFAULT false,
  "used_at"            TIMESTAMPTZ,
  "created_at"         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- =============================================================================
-- 7. Bag abandonment events table
-- =============================================================================
CREATE TABLE IF NOT EXISTS "bag_abandonment_events" (
  "id"                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id"         UUID        REFERENCES "profiles"(id) ON DELETE SET NULL,
  "cart_version_token" TEXT        NOT NULL,
  "offer_id"           UUID        REFERENCES "bag_recovery_offers"(id) ON DELETE SET NULL,
  "channel"            TEXT        NOT NULL,
  "status"             TEXT        NOT NULL DEFAULT 'sent',
  "sent_at"            TIMESTAMPTZ NOT NULL DEFAULT now(),
  "error_message"      TEXT,
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 8. Indexes for performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS bag_recovery_offers_profile_id_idx
  ON bag_recovery_offers (profile_id)
  WHERE profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS bag_abandonment_events_offer_id_idx
  ON bag_abandonment_events (offer_id)
  WHERE offer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_stock_deducted_at_idx
  ON orders (stock_deducted_at)
  WHERE stock_deducted_at IS NULL;
