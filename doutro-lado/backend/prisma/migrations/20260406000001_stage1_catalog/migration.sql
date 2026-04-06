-- Stage 1: catalog domain expansion
-- Safe to run on a DB that already has the init schema (all statements are idempotent).
-- On a fresh DB these are no-ops because the init migration already includes these columns.

ALTER TABLE "categories"    ADD COLUMN IF NOT EXISTS "image_url"    TEXT;
ALTER TABLE "categories"    ADD COLUMN IF NOT EXISTS "position"     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "categories"    ADD COLUMN IF NOT EXISTS "is_active"    BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "subcategories" ADD COLUMN IF NOT EXISTS "description"  TEXT;
ALTER TABLE "subcategories" ADD COLUMN IF NOT EXISTS "position"     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "subcategories" ADD COLUMN IF NOT EXISTS "is_active"    BOOLEAN NOT NULL DEFAULT true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subcategories_category_id_slug_key'
      AND conrelid = 'subcategories'::regclass
  ) THEN
    ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_slug_key" UNIQUE ("category_id", "slug");
  END IF;
END$$;

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_title"          TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_description"    TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight_grams"       INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "collection"         TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "origin"             TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "care_instructions"  TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "position"           INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "banners" ADD COLUMN IF NOT EXISTS "highlight" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_order_status_check'
      AND conrelid = 'orders'::regclass
  ) THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_order_status_check"
      CHECK (order_status IN ('created','processing','packing','shipped','delivered','cancelled'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_payment_status_check'
      AND conrelid = 'orders'::regclass
  ) THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_status_check"
      CHECK (payment_status IN ('pending','paid','failed','refunded'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_fiscal_status_check'
      AND conrelid = 'orders'::regclass
  ) THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_fiscal_status_check"
      CHECK (fiscal_status IN ('pending','in_review','issued','rejected'));
  END IF;
END$$;
