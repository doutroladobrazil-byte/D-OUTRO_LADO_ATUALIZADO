-- Stage 6: Gift kits domain expansion
-- Adds brand isolation, packaging types, subtotal, surcharge, updated_at.
-- All statements are idempotent (IF NOT EXISTS / IF EXISTS guards).

-- Brand column — required for brand isolation in the bag.
ALTER TABLE "gift_kits" ADD COLUMN IF NOT EXISTS "brand" TEXT;

-- Back-fill brand for any existing rows (default to 'moda' since this is moda-only).
UPDATE "gift_kits" SET "brand" = 'moda' WHERE "brand" IS NULL;

-- Now enforce NOT NULL after back-fill.
ALTER TABLE "gift_kits" ALTER COLUMN "brand" SET NOT NULL;

-- Add brand check constraint if not already present.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gift_kits_brand_check'
      AND conrelid = 'gift_kits'::regclass
  ) THEN
    ALTER TABLE "gift_kits" ADD CONSTRAINT "gift_kits_brand_check"
      CHECK (brand IN ('casa', 'moda'));
  END IF;
END$$;

-- Packaging type: default 'standard', validated set.
ALTER TABLE "gift_kits" ADD COLUMN IF NOT EXISTS "packaging_type" TEXT DEFAULT 'standard';
UPDATE "gift_kits" SET "packaging_type" = 'standard' WHERE "packaging_type" IS NULL;
ALTER TABLE "gift_kits" ALTER COLUMN "packaging_type" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gift_kits_packaging_check'
      AND conrelid = 'gift_kits'::regclass
  ) THEN
    ALTER TABLE "gift_kits" ADD CONSTRAINT "gift_kits_packaging_check"
      CHECK (packaging_type IN ('standard', 'premium', 'signature'));
  END IF;
END$$;

-- Pricing breakdown columns.
ALTER TABLE "gift_kits" ADD COLUMN IF NOT EXISTS "subtotal_brl"           NUMERIC(12,2) DEFAULT 0;
ALTER TABLE "gift_kits" ADD COLUMN IF NOT EXISTS "packaging_surcharge_brl" NUMERIC(12,2) DEFAULT 0;

-- Make total_amount_brl NOT NULL with default 0 (it was nullable in init).
UPDATE "gift_kits" SET "total_amount_brl" = 0 WHERE "total_amount_brl" IS NULL;
ALTER TABLE "gift_kits" ALTER COLUMN "total_amount_brl" SET NOT NULL;
ALTER TABLE "gift_kits" ALTER COLUMN "total_amount_brl" SET DEFAULT 0;

-- updated_at for optimistic locking.
ALTER TABLE "gift_kits" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT now();
UPDATE "gift_kits" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
ALTER TABLE "gift_kits" ALTER COLUMN "updated_at" SET NOT NULL;

-- Gift kit items: quantity check and unique constraint.
ALTER TABLE "gift_kit_items" ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1;
UPDATE "gift_kit_items" SET "quantity" = 1 WHERE "quantity" IS NULL;
ALTER TABLE "gift_kit_items" ALTER COLUMN "quantity" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gift_kit_items_qty_check'
      AND conrelid = 'gift_kit_items'::regclass
  ) THEN
    ALTER TABLE "gift_kit_items" ADD CONSTRAINT "gift_kit_items_qty_check"
      CHECK (quantity >= 1);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gift_kit_items_kit_id_product_id_key'
      AND conrelid = 'gift_kit_items'::regclass
  ) THEN
    ALTER TABLE "gift_kit_items" ADD CONSTRAINT "gift_kit_items_kit_id_product_id_key"
      UNIQUE (kit_id, product_id);
  END IF;
END$$;
