-- D'OUTRO LADO — baseline schema
-- Run once on a fresh database.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Profiles
-- =============================================================================
CREATE TABLE IF NOT EXISTS "profiles" (
  "id"                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "auth_user_id"        UUID        UNIQUE,
  "email"               TEXT        NOT NULL UNIQUE,
  "full_name"           TEXT,
  "role"                TEXT        NOT NULL DEFAULT 'customer'
                                    CHECK (role IN ('customer','wholesale','admin')),
  "is_active"           BOOLEAN     NOT NULL DEFAULT true,
  "preferred_language"  TEXT        DEFAULT 'en',
  "preferred_currency"  TEXT        DEFAULT 'USD',
  "created_at"          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Catalog — Categories & Subcategories
-- =============================================================================
CREATE TABLE IF NOT EXISTS "categories" (
  "id"          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "brand"       TEXT        NOT NULL CHECK (brand IN ('casa','moda')),
  "name"        TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL UNIQUE,
  "description" TEXT,
  "image_url"   TEXT,
  "position"    INTEGER     NOT NULL DEFAULT 0,
  "is_active"   BOOLEAN     NOT NULL DEFAULT true,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "subcategories" (
  "id"          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_id" UUID        NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "name"        TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL,
  "description" TEXT,
  "position"    INTEGER     NOT NULL DEFAULT 0,
  "is_active"   BOOLEAN     NOT NULL DEFAULT true,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("category_id", "slug")
);

-- =============================================================================
-- Catalog — Products
-- =============================================================================
CREATE TABLE IF NOT EXISTS "products" (
  "id"                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "brand"               TEXT          NOT NULL CHECK (brand IN ('casa','moda')),
  "category_id"         UUID          REFERENCES "categories"("id") ON DELETE SET NULL,
  "subcategory_id"      UUID          REFERENCES "subcategories"("id") ON DELETE SET NULL,
  "name"                TEXT          NOT NULL,
  "slug"                TEXT          NOT NULL UNIQUE,
  "sku"                 TEXT          NOT NULL UNIQUE,
  "short_description"   TEXT,
  "long_description"    TEXT,
  "seo_title"           TEXT,
  "seo_description"     TEXT,
  "material"            TEXT,
  "dimensions"          TEXT,
  "origin"              TEXT,
  "care_instructions"   TEXT,
  "weight_range"        TEXT          NOT NULL
                                      CHECK (weight_range IN ('100g-1kg','1-3kg','3-5kg','5-10kg','10-15kg','15-20kg')),
  "weight_grams"        INTEGER,
  "retail_price_brl"    NUMERIC(12,2) NOT NULL,
  "wholesale_price_brl" NUMERIC(12,2),
  "wholesale_min_qty"   INTEGER       NOT NULL DEFAULT 1,
  "stock"               INTEGER       NOT NULL DEFAULT 0,
  "badge"               TEXT,
  "collection"          TEXT,
  "tags"                TEXT[]        NOT NULL DEFAULT '{}',
  "is_featured"         BOOLEAN       NOT NULL DEFAULT false,
  "position"            INTEGER       NOT NULL DEFAULT 0,
  "is_active"           BOOLEAN       NOT NULL DEFAULT true,
  "created_at"          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updated_at"          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "product_images" (
  "id"         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" UUID    NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "url"        TEXT    NOT NULL,
  "alt_text"   TEXT,
  "position"   INTEGER NOT NULL DEFAULT 0
);

-- =============================================================================
-- Catalog — Wholesale Rules
-- =============================================================================
CREATE TABLE IF NOT EXISTS "wholesale_rules" (
  "id"               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "target_type"      TEXT          NOT NULL CHECK (target_type IN ('product','category','global')),
  "target_id"        UUID,
  "min_quantity"     INTEGER       NOT NULL DEFAULT 1,
  "discount_percent" NUMERIC(5,2),
  "is_active"        BOOLEAN       NOT NULL DEFAULT true,
  "created_at"       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- =============================================================================
-- Customer — Favorites, Carts, Addresses
-- =============================================================================
CREATE TABLE IF NOT EXISTS "favorites" (
  "id"         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" UUID        NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "product_id" UUID        NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("profile_id", "product_id")
);

CREATE TABLE IF NOT EXISTS "carts" (
  "id"         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" UUID        REFERENCES "profiles"("id") ON DELETE CASCADE,
  "brand"      TEXT        NOT NULL CHECK (brand IN ('casa','moda')),
  "currency"   TEXT        NOT NULL DEFAULT 'USD',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("profile_id", "brand")
);

CREATE TABLE IF NOT EXISTS "cart_items" (
  "id"         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "cart_id"    UUID    NOT NULL REFERENCES "carts"("id") ON DELETE CASCADE,
  "product_id" UUID    NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "quantity"   INTEGER NOT NULL DEFAULT 1,
  UNIQUE ("cart_id", "product_id")
);

CREATE TABLE IF NOT EXISTS "addresses" (
  "id"          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id"  UUID    NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "country"     TEXT    NOT NULL,
  "region"      TEXT,
  "city"        TEXT,
  "postal_code" TEXT,
  "line_1"      TEXT    NOT NULL,
  "line_2"      TEXT,
  "is_default"  BOOLEAN NOT NULL DEFAULT false
);

-- =============================================================================
-- Shipping
-- =============================================================================
CREATE TABLE IF NOT EXISTS "shipping_regions" (
  "id"        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "code"      TEXT    NOT NULL UNIQUE,
  "name"      TEXT    NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "shipping_rates" (
  "id"                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "shipping_region_id" UUID          NOT NULL REFERENCES "shipping_regions"("id") ON DELETE CASCADE,
  "weight_range"       TEXT          NOT NULL
                                     CHECK (weight_range IN ('100g-1kg','1-3kg','3-5kg','5-10kg','10-15kg','15-20kg')),
  "amount_brl"         NUMERIC(12,2) NOT NULL,
  "created_at"         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE ("shipping_region_id", "weight_range")
);

-- =============================================================================
-- i18n
-- =============================================================================
CREATE TABLE IF NOT EXISTS "currencies" (
  "code"      TEXT    PRIMARY KEY,
  "symbol"    TEXT    NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "languages" (
  "code"      TEXT    PRIMARY KEY,
  "label"     TEXT    NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- =============================================================================
-- Gift Kits
-- =============================================================================
CREATE TABLE IF NOT EXISTS "gift_kits" (
  "id"                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id"        UUID          REFERENCES "profiles"("id") ON DELETE SET NULL,
  "name"              TEXT          NOT NULL,
  "message"           TEXT,
  "packaging_type"    TEXT,
  "total_weight_range" TEXT,
  "total_amount_brl"  NUMERIC(12,2) DEFAULT 0,
  "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "gift_kit_items" (
  "id"         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "kit_id"     UUID    NOT NULL REFERENCES "gift_kits"("id") ON DELETE CASCADE,
  "product_id" UUID    NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "quantity"   INTEGER NOT NULL DEFAULT 1
);

-- =============================================================================
-- Orders
-- =============================================================================
CREATE TABLE IF NOT EXISTS "orders" (
  "id"             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "public_id"      TEXT          NOT NULL UNIQUE,
  "profile_id"     UUID          REFERENCES "profiles"("id") ON DELETE SET NULL,
  "address_id"     UUID          REFERENCES "addresses"("id"),
  "brand"          TEXT          NOT NULL CHECK (brand IN ('casa','moda')),
  "currency"       TEXT          NOT NULL DEFAULT 'USD',
  "subtotal_brl"   NUMERIC(12,2) NOT NULL DEFAULT 0,
  "freight_brl"    NUMERIC(12,2) NOT NULL DEFAULT 0,
  "total_brl"      NUMERIC(12,2) NOT NULL DEFAULT 0,
  "order_status"   TEXT          NOT NULL DEFAULT 'created'
                                 CHECK (order_status IN ('created','processing','packing','shipped','delivered','cancelled')),
  "payment_status" TEXT          NOT NULL DEFAULT 'pending'
                                 CHECK (payment_status IN ('pending','paid','failed','refunded')),
  "fiscal_status"  TEXT          NOT NULL DEFAULT 'pending'
                                 CHECK (fiscal_status IN ('pending','in_review','issued','rejected')),
  "shipping_region" TEXT,
  "is_export_order" BOOLEAN      NOT NULL DEFAULT true,
  "notes"          TEXT,
  "created_at"     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updated_at"     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "order_items" (
  "id"            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"      UUID          NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "product_id"    UUID          REFERENCES "products"("id") ON DELETE SET NULL,
  "brand"         TEXT          NOT NULL CHECK (brand IN ('casa','moda')),
  "product_name"  TEXT          NOT NULL,
  "sku"           TEXT,
  "quantity"      INTEGER       NOT NULL,
  "unit_price_brl" NUMERIC(12,2) NOT NULL,
  "line_total_brl" NUMERIC(12,2) NOT NULL,
  "weight_range"  TEXT          NOT NULL
);

-- =============================================================================
-- Payments & Fiscal
-- =============================================================================
CREATE TABLE IF NOT EXISTS "payment_records" (
  "id"                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"            UUID          NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "provider"            TEXT          NOT NULL DEFAULT 'stripe',
  "provider_payment_id" TEXT,
  "status"              TEXT          NOT NULL,
  "amount_brl"          NUMERIC(12,2) NOT NULL,
  "payload"             JSONB,
  "created_at"          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "fiscal_records" (
  "id"             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"       UUID        NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "invoice_number" TEXT,
  "access_key"     TEXT,
  "observations"   TEXT,
  "status"         TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','in_review','issued','rejected')),
  "issued_at"      TIMESTAMPTZ,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- CMS — Banners, Sliders, Settings
-- =============================================================================
CREATE TABLE IF NOT EXISTS "banners" (
  "id"        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "brand"     TEXT    NOT NULL CHECK (brand IN ('casa','moda')),
  "title"     TEXT    NOT NULL,
  "subtitle"  TEXT,
  "highlight" TEXT,
  "cta_label" TEXT,
  "cta_url"   TEXT,
  "image_url" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "position"  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "sliders" (
  "id"        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "brand"     TEXT    NOT NULL CHECK (brand IN ('casa','moda')),
  "title"     TEXT    NOT NULL,
  "subtitle"  TEXT,
  "cta_label" TEXT,
  "cta_url"   TEXT,
  "image_url" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "position"  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "site_settings" (
  "id"         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "key"        TEXT        NOT NULL UNIQUE,
  "value"      JSONB       NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Analytics & Admin
-- =============================================================================
CREATE TABLE IF NOT EXISTS "recommendation_events" (
  "id"         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" UUID        REFERENCES "profiles"("id") ON DELETE SET NULL,
  "product_id" UUID        REFERENCES "products"("id") ON DELETE SET NULL,
  "event_type" TEXT        NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "admin_logs" (
  "id"               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "admin_profile_id" UUID        REFERENCES "profiles"("id"),
  "action"           TEXT        NOT NULL,
  "entity_type"      TEXT        NOT NULL,
  "entity_id"        TEXT,
  "payload"          JSONB,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now()
);
