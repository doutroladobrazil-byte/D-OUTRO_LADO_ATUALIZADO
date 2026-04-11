-- Stage 9: Internationalization — exchange rates, product translations, seeding
-- All statements are idempotent (IF NOT EXISTS / ON CONFLICT DO).

-- =============================================================================
-- Seed canonical currencies
-- =============================================================================
INSERT INTO "currencies" (code, symbol, is_active)
VALUES
  ('BRL', 'R$',  true),
  ('USD', '$',   true),
  ('EUR', '€',   true),
  ('AED', 'AED', true)
ON CONFLICT (code) DO UPDATE SET symbol = EXCLUDED.symbol, is_active = EXCLUDED.is_active;

-- =============================================================================
-- Seed canonical languages
-- =============================================================================
INSERT INTO "languages" (code, label, is_active)
VALUES
  ('pt', 'Português', true),
  ('en', 'English',   true),
  ('ar', 'العربية',   false)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, is_active = EXCLUDED.is_active;

-- =============================================================================
-- Exchange rates table
-- =============================================================================
CREATE TABLE IF NOT EXISTS "exchange_rates" (
  "id"            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "from_currency" TEXT          NOT NULL DEFAULT 'BRL',
  "to_currency"   TEXT          NOT NULL REFERENCES "currencies"(code),
  "rate"          NUMERIC(18,8) NOT NULL,
  "source"        TEXT          NOT NULL DEFAULT 'static',
  "fetched_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE ("from_currency", "to_currency")
);

-- Seed initial static rates (1 BRL → target currency).
INSERT INTO "exchange_rates" (from_currency, to_currency, rate, source)
VALUES
  ('BRL', 'BRL', 1.0,    'static'),
  ('BRL', 'USD', 0.18,   'static'),
  ('BRL', 'EUR', 0.17,   'static'),
  ('BRL', 'AED', 0.67,   'static')
ON CONFLICT (from_currency, to_currency) DO UPDATE SET
  rate       = EXCLUDED.rate,
  source     = EXCLUDED.source,
  fetched_at = now();

-- =============================================================================
-- Product translations scaffold
-- =============================================================================
CREATE TABLE IF NOT EXISTS "product_translations" (
  "id"                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id"        UUID        NOT NULL REFERENCES "products"(id) ON DELETE CASCADE,
  "language"          TEXT        NOT NULL REFERENCES "languages"(code),
  "name"              TEXT        NOT NULL,
  "short_description" TEXT,
  "long_description"  TEXT,
  "seo_title"         TEXT,
  "seo_description"   TEXT,
  "created_at"        TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("product_id", "language")
);

-- =============================================================================
-- Seed initial site settings
-- =============================================================================
INSERT INTO "site_settings" (key, value)
VALUES
  ('platform.defaultCurrency',  '"BRL"'),
  ('platform.defaultLanguage',  '"pt"'),
  ('platform.supportedRegions', '["North America","Europe","Middle East"]'),
  ('platform.brands',           '["moda"]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- =============================================================================
-- Seed shipping regions (North America, Europe, Middle East)
-- =============================================================================
INSERT INTO "shipping_regions" (code, name, is_active)
VALUES
  ('north-america', 'North America', true),
  ('europe',        'Europe',        true),
  ('middle-east',   'Middle East',   true)
ON CONFLICT (code) DO NOTHING;
