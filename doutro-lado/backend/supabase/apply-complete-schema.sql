-- =============================================================================
-- D'OUTRO LADO — COMPLETE SCHEMA + PRISMA BASELINE
-- Run this ONCE in the Supabase SQL Editor to:
--   1. Create all tables (idempotent — safe to re-run)
--   2. Set up auth trigger (auto-create profile on signup)
--   3. Seed reference data
--   4. Initialize Prisma migration history (_prisma_migrations)
--
-- Project ref: oazybcxrzxpvpavporrm
-- Last updated: 2026-04-11
-- =============================================================================

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id       UUID        UNIQUE,
  email              TEXT        NOT NULL UNIQUE,
  full_name          TEXT,
  phone              TEXT,
  role               TEXT        NOT NULL DEFAULT 'customer'
                                 CHECK (role IN ('customer', 'wholesale', 'admin')),
  is_active          BOOLEAN     NOT NULL DEFAULT true,
  preferred_language TEXT        DEFAULT 'en',
  preferred_currency TEXT        DEFAULT 'USD',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_auth_user_id_idx
  ON profiles (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- =============================================================================
-- CATALOG — CATEGORIES & SUBCATEGORIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand       TEXT        NOT NULL CHECK (brand IN ('casa', 'moda')),
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  position    INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subcategories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL,
  description TEXT,
  position    INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);

-- =============================================================================
-- CATALOG — PRODUCTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  brand               TEXT          NOT NULL CHECK (brand IN ('casa', 'moda')),
  category_id         UUID          REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id      UUID          REFERENCES subcategories(id) ON DELETE SET NULL,
  name                TEXT          NOT NULL,
  slug                TEXT          NOT NULL UNIQUE,
  sku                 TEXT          NOT NULL UNIQUE,
  short_description   TEXT,
  long_description    TEXT,
  seo_title           TEXT,
  seo_description     TEXT,
  material            TEXT,
  dimensions          TEXT,
  origin              TEXT,
  care_instructions   TEXT,
  weight_range        TEXT          NOT NULL
                                    CHECK (weight_range IN ('100g-1kg','1-3kg','3-5kg','5-10kg','10-15kg','15-20kg')),
  weight_grams        INTEGER,
  retail_price_brl    NUMERIC(12,2) NOT NULL,
  wholesale_price_brl NUMERIC(12,2),
  wholesale_min_qty   INTEGER       NOT NULL DEFAULT 1,
  stock               INTEGER       NOT NULL DEFAULT 0,
  badge               TEXT,
  collection          TEXT,
  tags                TEXT[]        NOT NULL DEFAULT '{}',
  is_featured         BOOLEAN       NOT NULL DEFAULT false,
  position            INTEGER       NOT NULL DEFAULT 0,
  is_active           BOOLEAN       NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Legacy image table — kept for backward compatibility. Use product_media for new code.
CREATE TABLE IF NOT EXISTS product_images (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT    NOT NULL,
  alt_text   TEXT,
  position   INTEGER NOT NULL DEFAULT 0
);

-- =============================================================================
-- MEDIA — Stage 2
-- =============================================================================
CREATE TABLE IF NOT EXISTS media_assets (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand            TEXT        NOT NULL CHECK (brand IN ('casa', 'moda')),
  media_type       TEXT        NOT NULL CHECK (media_type IN ('image', 'video')),
  bucket           TEXT        NOT NULL,
  storage_path     TEXT        NOT NULL UNIQUE,
  public_url       TEXT        NOT NULL,
  mime_type        TEXT,
  file_size_bytes  BIGINT,
  width            INTEGER,
  height           INTEGER,
  duration_seconds NUMERIC(10,2),
  poster_url       TEXT,
  alt_text         TEXT,
  caption          TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_media (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_asset_id UUID        NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  position       INTEGER     NOT NULL DEFAULT 0,
  is_primary     BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, media_asset_id)
);

CREATE INDEX IF NOT EXISTS idx_product_media_product_position
  ON product_media (product_id, position);

-- =============================================================================
-- WHOLESALE RULES
-- =============================================================================
CREATE TABLE IF NOT EXISTS wholesale_rules (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type     TEXT          NOT NULL CHECK (target_type IN ('product','category','global')),
  target_id       UUID,
  min_quantity    INTEGER       NOT NULL DEFAULT 1,
  discount_percent NUMERIC(5,2),
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- =============================================================================
-- CUSTOMER — FAVORITES, CARTS, ADDRESSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS favorites (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, product_id)
);

CREATE TABLE IF NOT EXISTS carts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  brand      TEXT        NOT NULL CHECK (brand IN ('casa', 'moda')),
  currency   TEXT        NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, brand)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id    UUID    NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1,
  UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS addresses (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country     TEXT    NOT NULL,
  region      TEXT,
  city        TEXT,
  postal_code TEXT,
  line_1      TEXT    NOT NULL,
  line_2      TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT false
);

-- =============================================================================
-- SHIPPING
-- =============================================================================
CREATE TABLE IF NOT EXISTS shipping_regions (
  id       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  code     TEXT    NOT NULL UNIQUE,
  name     TEXT    NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS shipping_rates (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  shipping_region_id UUID          NOT NULL REFERENCES shipping_regions(id) ON DELETE CASCADE,
  weight_range       TEXT          NOT NULL
                                   CHECK (weight_range IN ('100g-1kg','1-3kg','3-5kg','5-10kg','10-15kg','15-20kg')),
  amount_brl         NUMERIC(12,2) NOT NULL,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (shipping_region_id, weight_range)
);

-- =============================================================================
-- i18n
-- =============================================================================
CREATE TABLE IF NOT EXISTS currencies (
  code     TEXT    PRIMARY KEY,
  symbol   TEXT    NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS languages (
  code     TEXT    PRIMARY KEY,
  label    TEXT    NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS exchange_rates (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT          NOT NULL DEFAULT 'BRL',
  to_currency   TEXT          NOT NULL REFERENCES currencies(code),
  rate          NUMERIC(18,8) NOT NULL,
  source        TEXT          NOT NULL DEFAULT 'static',
  fetched_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (from_currency, to_currency)
);

-- =============================================================================
-- GIFT KITS
-- =============================================================================
CREATE TABLE IF NOT EXISTS gift_kits (
  id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id             UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  brand                  TEXT          NOT NULL CHECK (brand IN ('casa', 'moda')),
  name                   TEXT          NOT NULL,
  message                TEXT          CHECK (char_length(message) <= 500),
  packaging_type         TEXT          NOT NULL DEFAULT 'standard'
                                       CHECK (packaging_type IN ('standard', 'premium', 'signature')),
  subtotal_brl           NUMERIC(12,2) NOT NULL DEFAULT 0,
  packaging_surcharge_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount_brl       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_weight_range     TEXT,
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gift_kit_items (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id     UUID    NOT NULL REFERENCES gift_kits(id) ON DELETE CASCADE,
  product_id UUID    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  UNIQUE (kit_id, product_id)
);

-- =============================================================================
-- ORDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id            TEXT          NOT NULL UNIQUE,
  profile_id           UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  address_id           UUID          REFERENCES addresses(id),
  brand                TEXT          NOT NULL CHECK (brand IN ('casa', 'moda')),
  currency             TEXT          NOT NULL DEFAULT 'USD',
  subtotal_brl         NUMERIC(12,2) NOT NULL DEFAULT 0,
  freight_brl          NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_brl            NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_status         TEXT          NOT NULL DEFAULT 'created'
                                     CHECK (order_status IN ('created','processing','packing','shipped','delivered','cancelled')),
  payment_status       TEXT          NOT NULL DEFAULT 'pending'
                                     CHECK (payment_status IN ('pending','paid','failed','refunded')),
  fiscal_status        TEXT          NOT NULL DEFAULT 'pending'
                                     CHECK (fiscal_status IN ('pending','in_review','issued','rejected')),
  shipping_region      TEXT,
  estimated_weight_range TEXT,
  stripe_session_id    TEXT          UNIQUE,
  pricing_version      TEXT,
  stock_deducted_at    TIMESTAMPTZ,
  offer_code           TEXT,
  discount_brl         NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_export_order      BOOLEAN       NOT NULL DEFAULT true,
  notes                TEXT,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx
  ON orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_stock_deducted_at_idx
  ON orders (stock_deducted_at)
  WHERE stock_deducted_at IS NULL;

CREATE TABLE IF NOT EXISTS order_items (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID          REFERENCES products(id) ON DELETE SET NULL,
  gift_kit_id   UUID          REFERENCES gift_kits(id) ON DELETE SET NULL,
  brand         TEXT          NOT NULL CHECK (brand IN ('casa', 'moda')),
  product_name  TEXT          NOT NULL,
  sku           TEXT,
  quantity      INTEGER       NOT NULL,
  unit_price_brl NUMERIC(12,2) NOT NULL,
  line_total_brl NUMERIC(12,2) NOT NULL,
  weight_range  TEXT          NOT NULL
);

-- =============================================================================
-- PAYMENTS & FISCAL
-- =============================================================================
CREATE TABLE IF NOT EXISTS payment_records (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider            TEXT          NOT NULL DEFAULT 'stripe',
  provider_payment_id TEXT,
  status              TEXT          NOT NULL,
  amount_brl          NUMERIC(12,2) NOT NULL,
  payload             JSONB,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fiscal_records (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT,
  access_key     TEXT,
  observations   TEXT,
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','in_review','issued','rejected')),
  issued_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- CMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS banners (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  brand     TEXT    NOT NULL CHECK (brand IN ('casa','moda')),
  title     TEXT    NOT NULL,
  subtitle  TEXT,
  highlight TEXT,
  cta_label TEXT,
  cta_url   TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sliders (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  brand     TEXT    NOT NULL CHECK (brand IN ('casa','moda')),
  title     TEXT    NOT NULL,
  subtitle  TEXT,
  cta_label TEXT,
  cta_url   TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS site_settings (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key       TEXT        NOT NULL UNIQUE,
  value     JSONB       NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- ANALYTICS & ADMIN
-- =============================================================================
CREATE TABLE IF NOT EXISTS recommendation_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  product_id UUID        REFERENCES products(id) ON DELETE SET NULL,
  event_type TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_profile_id UUID        REFERENCES profiles(id),
  action           TEXT        NOT NULL,
  entity_type      TEXT        NOT NULL,
  entity_id        TEXT,
  payload          JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- BAG PRICING RULES — Stage 11
-- =============================================================================
CREATE TABLE IF NOT EXISTS bag_pricing_rules (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  region         TEXT          NOT NULL UNIQUE,
  tax_brl        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  logistics_brl  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  margin_percent NUMERIC(5,2)  NOT NULL DEFAULT 0.00,
  is_active      BOOLEAN       NOT NULL DEFAULT true,
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- =============================================================================
-- BAG RECOVERY — Stage 11 Part 2
-- =============================================================================
CREATE TABLE IF NOT EXISTS bag_recovery_offers (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  code               TEXT          NOT NULL UNIQUE,
  profile_id         UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  brand              TEXT          NOT NULL,
  cart_version_token TEXT          NOT NULL,
  discount_percent   NUMERIC(5,2)  NOT NULL DEFAULT 10.00,
  valid_until        TIMESTAMPTZ   NOT NULL,
  is_used            BOOLEAN       NOT NULL DEFAULT false,
  used_at            TIMESTAMPTZ,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bag_abandonment_events (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id         UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  cart_version_token TEXT        NOT NULL,
  offer_id           UUID        REFERENCES bag_recovery_offers(id) ON DELETE SET NULL,
  channel            TEXT        NOT NULL,
  status             TEXT        NOT NULL DEFAULT 'sent',
  sent_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  error_message      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bag_recovery_offers_profile_id_idx
  ON bag_recovery_offers (profile_id)
  WHERE profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS bag_abandonment_events_offer_id_idx
  ON bag_abandonment_events (offer_id)
  WHERE offer_id IS NOT NULL;

-- =============================================================================
-- PRODUCT TRANSLATIONS — Stage 9
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_translations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  language         TEXT        NOT NULL REFERENCES languages(code),
  name             TEXT        NOT NULL,
  short_description TEXT,
  long_description  TEXT,
  seo_title         TEXT,
  seo_description   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, language)
);

-- =============================================================================
-- AUTH TRIGGER — Auto-create profile on signup (CRITICAL)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'customer',
    true
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- =============================================================================
-- SEEDS — Reference data
-- =============================================================================

INSERT INTO currencies (code, symbol, is_active)
VALUES
  ('BRL', 'R$',  true),
  ('USD', '$',   true),
  ('EUR', '€',   true),
  ('AED', 'AED', true)
ON CONFLICT (code) DO UPDATE SET symbol = EXCLUDED.symbol, is_active = EXCLUDED.is_active;

INSERT INTO languages (code, label, is_active)
VALUES
  ('pt', 'Português', true),
  ('en', 'English',   true),
  ('ar', 'العربية',   false)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, is_active = EXCLUDED.is_active;

INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
VALUES
  ('BRL', 'BRL', 1.0,    'static'),
  ('BRL', 'USD', 0.18,   'static'),
  ('BRL', 'EUR', 0.17,   'static'),
  ('BRL', 'AED', 0.67,   'static')
ON CONFLICT (from_currency, to_currency) DO UPDATE SET
  rate       = EXCLUDED.rate,
  source     = EXCLUDED.source,
  fetched_at = now();

INSERT INTO shipping_regions (code, name, is_active)
VALUES
  ('north-america', 'North America', true),
  ('europe',        'Europe',        true),
  ('middle-east',   'Middle East',   true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO bag_pricing_rules (region, tax_brl, logistics_brl, margin_percent, is_active)
VALUES
  ('North America', 0.00, 0.00, 0.00, true),
  ('Europe',        0.00, 0.00, 0.00, true),
  ('Middle East',   0.00, 0.00, 0.00, true)
ON CONFLICT (region) DO NOTHING;

INSERT INTO site_settings (key, value)
VALUES
  ('platform.defaultCurrency',  '"BRL"'),
  ('platform.defaultLanguage',  '"pt"'),
  ('platform.supportedRegions', '["North America","Europe","Middle East"]'),
  ('platform.brands',           '["moda"]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- =============================================================================
-- PRISMA MIGRATION HISTORY — Initialize tracking
-- This lets "npx prisma migrate status" work correctly after this script runs.
-- =============================================================================

CREATE TABLE IF NOT EXISTS _prisma_migrations (
  id                  VARCHAR(36)  NOT NULL PRIMARY KEY,
  checksum            VARCHAR(64)  NOT NULL,
  finished_at         TIMESTAMPTZ,
  migration_name      VARCHAR(255) NOT NULL,
  logs                TEXT,
  rolled_back_at      TIMESTAMPTZ,
  started_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  applied_steps_count INTEGER      NOT NULL DEFAULT 0
);

-- Mark all 8 migrations as applied (schema was bootstrapped via this SQL script).
INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
VALUES
  (gen_random_uuid()::text, 'bootstrapped', now(), '20260406000000_init',                  1),
  (gen_random_uuid()::text, 'bootstrapped', now(), '20260406000001_stage1_catalog',         1),
  (gen_random_uuid()::text, 'bootstrapped', now(), '20260406000001b_stage2_media',          1),
  (gen_random_uuid()::text, 'bootstrapped', now(), '20260406000002_stage4_auth',            1),
  (gen_random_uuid()::text, 'bootstrapped', now(), '20260406000003_stage6_gift_kits',       1),
  (gen_random_uuid()::text, 'bootstrapped', now(), '20260406000004_stage7_stripe',          1),
  (gen_random_uuid()::text, 'bootstrapped', now(), '20260406000005_stage9_i18n',            1),
  (gen_random_uuid()::text, 'bootstrapped', now(), '20260406000006_stage11_pricing',        1)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VALIDATION — Run this at the end to confirm all tables exist
-- =============================================================================
SELECT
  t.expected_table,
  CASE WHEN it.table_name IS NOT NULL THEN '✓ EXISTS' ELSE '✗ MISSING' END AS status
FROM (VALUES
  ('profiles'), ('categories'), ('subcategories'), ('products'),
  ('product_images'), ('media_assets'), ('product_media'),
  ('wholesale_rules'), ('favorites'), ('carts'), ('cart_items'),
  ('addresses'), ('shipping_regions'), ('shipping_rates'),
  ('currencies'), ('languages'), ('exchange_rates'), ('product_translations'),
  ('gift_kits'), ('gift_kit_items'), ('orders'), ('order_items'),
  ('payment_records'), ('fiscal_records'), ('banners'), ('sliders'),
  ('site_settings'), ('recommendation_events'), ('admin_logs'),
  ('bag_pricing_rules'), ('bag_recovery_offers'), ('bag_abandonment_events'),
  ('_prisma_migrations')
) t(expected_table)
LEFT JOIN information_schema.tables it
  ON it.table_schema = 'public' AND it.table_name = t.expected_table
ORDER BY status DESC, t.expected_table;
