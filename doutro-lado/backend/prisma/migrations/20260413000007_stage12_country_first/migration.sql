-- =============================================================================
-- Stage 12 — Country-first International MVP
-- =============================================================================
-- Replaces the coarse 3-region model (North America / Europe / Middle East)
-- with explicit per-country configuration for the 6 MVP destinations:
--   CH (Switzerland/CHF), IE (Ireland/EUR), DE (Germany/EUR),
--   IS (Iceland/EUR strategic), SG (Singapore/SGD), US (United States/USD)
--
-- Backward compatibility:
--   - shipping_regions and shipping_rates are NOT dropped — existing region
--     logic continues to work for any order/bag using the legacy `region` field.
--   - orders.shipping_region remains. New country columns are additive.
--   - bag_pricing_rules remains. country_commerce_rules is the new path.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. supported_countries
-- ---------------------------------------------------------------------------
-- Master list of countries the platform can sell to.
-- is_active  : toggles country globally (shows in selector, enables checkout).
-- checkout_enabled : can place orders. False = browse-only.
-- catalog_enabled  : can see products.
-- display_position : UI sort order in country selector.
-- ---------------------------------------------------------------------------

CREATE TABLE supported_countries (
  code                VARCHAR(2)   PRIMARY KEY,
  name                VARCHAR(100) NOT NULL,
  region_group        VARCHAR(50)  NOT NULL,          -- "Europe", "North America", "Asia Pacific"
  default_currency    VARCHAR(3)   NOT NULL,
  default_language    VARCHAR(5)   NOT NULL DEFAULT 'en',
  is_active           BOOLEAN      NOT NULL DEFAULT true,
  checkout_enabled    BOOLEAN      NOT NULL DEFAULT true,
  catalog_enabled     BOOLEAN      NOT NULL DEFAULT true,
  display_position    INT          NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2. country_commerce_rules
-- ---------------------------------------------------------------------------
-- Per-country pricing rules that supersede bag_pricing_rules when a
-- country_code is supplied to the bag simulation or order builder.
--
-- One active rule per country at a time (enforced by partial unique index).
-- tax_percent      : percentage applied to subtotal (e.g. 7.7 for CH VAT).
-- logistics_brl    : flat BRL logistics surcharge per order.
-- margin_percent   : percentage margin on top of (subtotal+freight+tax+logistics).
-- minimum_order_brl: minimum subtotal in BRL required to checkout.
-- ---------------------------------------------------------------------------

CREATE TABLE country_commerce_rules (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code          VARCHAR(2)  NOT NULL REFERENCES supported_countries(code) ON DELETE CASCADE,
  pricing_currency      VARCHAR(3)  NOT NULL,
  tax_percent           DECIMAL(6,3) NOT NULL DEFAULT 0,
  logistics_brl         DECIMAL(12,2) NOT NULL DEFAULT 0,
  margin_percent        DECIMAL(5,2) NOT NULL DEFAULT 0,
  minimum_order_brl     DECIMAL(12,2) NOT NULL DEFAULT 0,
  allow_guest_checkout  BOOLEAN     NOT NULL DEFAULT true,
  allow_discount_codes  BOOLEAN     NOT NULL DEFAULT true,
  estimated_delivery_min_days INT   NOT NULL DEFAULT 5,
  estimated_delivery_max_days INT   NOT NULL DEFAULT 10,
  is_active             BOOLEAN     NOT NULL DEFAULT true,
  notes                 TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one active rule per country.
CREATE UNIQUE INDEX country_commerce_rules_active_uq
  ON country_commerce_rules (country_code)
  WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- 3. country_shipping_rules
-- ---------------------------------------------------------------------------
-- Per-country, per-weight-range freight table.
-- Parallel to shipping_rates (which is keyed by shipping_region_id).
-- carrier_label : display string shown on checkout (e.g. "DHL Express").
-- sla_min/max   : delivery SLA in business days used for ETA display.
-- ---------------------------------------------------------------------------

CREATE TABLE country_shipping_rules (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code    VARCHAR(2)  NOT NULL REFERENCES supported_countries(code) ON DELETE CASCADE,
  weight_range    VARCHAR(20) NOT NULL,
  base_amount_brl DECIMAL(12,2) NOT NULL,
  carrier_label   VARCHAR(100) NOT NULL DEFAULT 'DHL Express',
  sla_min_days    INT         NOT NULL DEFAULT 5,
  sla_max_days    INT         NOT NULL DEFAULT 10,
  is_active       BOOLEAN     NOT NULL DEFAULT true,

  UNIQUE (country_code, weight_range)
);

-- ---------------------------------------------------------------------------
-- 4. orders — country snapshot columns (additive, nullable)
-- ---------------------------------------------------------------------------
-- These columns are set at order-creation time and never change thereafter.
-- They snapshot the country selected by the customer so the order remains
-- self-describing even if country rules are later modified.
-- exchange_rate_used: BRL→display_currency rate at checkout, stored for audit.
-- ---------------------------------------------------------------------------

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS destination_country_code  VARCHAR(2),
  ADD COLUMN IF NOT EXISTS destination_country_name  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS destination_currency      VARCHAR(3),
  ADD COLUMN IF NOT EXISTS exchange_rate_used        DECIMAL(10,6),
  ADD COLUMN IF NOT EXISTS delivery_eta_min_days     INT,
  ADD COLUMN IF NOT EXISTS delivery_eta_max_days     INT;

-- ---------------------------------------------------------------------------
-- 5. currencies — add CHF and SGD if not present
-- ---------------------------------------------------------------------------

INSERT INTO currencies (code, symbol, is_active)
VALUES
  ('CHF', 'Fr.', true),
  ('SGD', 'S$',  true)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. Seed — supported_countries (6 MVP destinations)
-- ---------------------------------------------------------------------------

INSERT INTO supported_countries
  (code, name, region_group, default_currency, default_language, is_active, checkout_enabled, catalog_enabled, display_position)
VALUES
  ('US', 'United States',  'North America', 'USD', 'en', true, true, true, 1),
  ('CH', 'Switzerland',    'Europe',        'CHF', 'en', true, true, true, 2),
  ('IE', 'Ireland',        'Europe',        'EUR', 'en', true, true, true, 3),
  ('DE', 'Germany',        'Europe',        'EUR', 'de', true, true, true, 4),
  ('IS', 'Iceland',        'Europe',        'EUR', 'en', true, true, true, 5),
  ('SG', 'Singapore',      'Asia Pacific',  'SGD', 'en', true, true, true, 6)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7. Seed — country_commerce_rules (one active rule per country)
-- ---------------------------------------------------------------------------
-- All-in pricing logic (Stage 11 model, per country):
--   total = (subtotal + freight + tax + logistics) * (1 + margin/100)
--
-- Rates reflect MVP conservative defaults — adjust via admin panel or a
-- targeted migration once commercial terms are confirmed per destination.
--
-- tax_percent references:
--   US: 0% (export, no US sales tax collected at origin)
--   CH: 7.7% (Swiss VAT standard rate)
--   IE: 23% (Irish VAT standard rate)
--   DE: 19% (German VAT standard rate)
--   IS: 24% (Icelandic VAT — strategic EUR pricing absorbs locally)
--   SG: 9% (Singapore GST from 2024)
-- ---------------------------------------------------------------------------

INSERT INTO country_commerce_rules
  (country_code, pricing_currency, tax_percent, logistics_brl, margin_percent,
   minimum_order_brl, allow_guest_checkout, allow_discount_codes,
   estimated_delivery_min_days, estimated_delivery_max_days, is_active, notes)
VALUES
  ('US', 'USD', 0,    0,    0,    0,    true, true, 5,  10, true, 'Export — no US tax collected at origin'),
  ('CH', 'CHF', 7.7,  80,   5,    500,  true, true, 7,  12, true, 'Swiss VAT 7.7% + logistics surcharge'),
  ('IE', 'EUR', 23,   60,   5,    400,  true, true, 6,  10, true, 'Irish VAT 23%'),
  ('DE', 'EUR', 19,   60,   5,    400,  true, true, 6,  10, true, 'German VAT 19%'),
  ('IS', 'EUR', 24,   120,  8,    600,  true, true, 8,  14, true, 'Iceland — EUR pricing, VAT 24% included in price'),
  ('SG', 'SGD', 9,    100,  5,    400,  true, true, 7,  12, true, 'Singapore GST 9%')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. Seed — country_shipping_rules (all weight bands per country)
-- ---------------------------------------------------------------------------
-- Base amounts are in BRL. Frontend converts to display currency via exchange rates.
-- Bands mirror the legacy WEIGHT_RANGES: 100g-1kg, 1-3kg, 3-5kg, 5-10kg, 10-15kg, 15-20kg
-- ---------------------------------------------------------------------------

INSERT INTO country_shipping_rules
  (country_code, weight_range, base_amount_brl, carrier_label, sla_min_days, sla_max_days, is_active)
VALUES
  -- United States (USD — DHL)
  ('US', '100g-1kg',  180,  'DHL Express', 5,  10, true),
  ('US', '1-3kg',     320,  'DHL Express', 5,  10, true),
  ('US', '3-5kg',     480,  'DHL Express', 5,  10, true),
  ('US', '5-10kg',    720,  'DHL Express', 5,  10, true),
  ('US', '10-15kg',   960,  'DHL Express', 5,  10, true),
  ('US', '15-20kg',   1200, 'DHL Express', 5,  10, true),

  -- Switzerland (CHF — DHL)
  ('CH', '100g-1kg',  220,  'DHL Express', 7,  12, true),
  ('CH', '1-3kg',     380,  'DHL Express', 7,  12, true),
  ('CH', '3-5kg',     560,  'DHL Express', 7,  12, true),
  ('CH', '5-10kg',    820,  'DHL Express', 7,  12, true),
  ('CH', '10-15kg',   1080, 'DHL Express', 7,  12, true),
  ('CH', '15-20kg',   1340, 'DHL Express', 7,  12, true),

  -- Ireland (EUR — DHL)
  ('IE', '100g-1kg',  200,  'DHL Express', 6,  10, true),
  ('IE', '1-3kg',     350,  'DHL Express', 6,  10, true),
  ('IE', '3-5kg',     520,  'DHL Express', 6,  10, true),
  ('IE', '5-10kg',    780,  'DHL Express', 6,  10, true),
  ('IE', '10-15kg',   1020, 'DHL Express', 6,  10, true),
  ('IE', '15-20kg',   1280, 'DHL Express', 6,  10, true),

  -- Germany (EUR — DHL)
  ('DE', '100g-1kg',  200,  'DHL Express', 6,  10, true),
  ('DE', '1-3kg',     350,  'DHL Express', 6,  10, true),
  ('DE', '3-5kg',     520,  'DHL Express', 6,  10, true),
  ('DE', '5-10kg',    780,  'DHL Express', 6,  10, true),
  ('DE', '10-15kg',   1020, 'DHL Express', 6,  10, true),
  ('DE', '15-20kg',   1280, 'DHL Express', 6,  10, true),

  -- Iceland (EUR — more remote, higher base)
  ('IS', '100g-1kg',  280,  'DHL Express', 8,  14, true),
  ('IS', '1-3kg',     460,  'DHL Express', 8,  14, true),
  ('IS', '3-5kg',     660,  'DHL Express', 8,  14, true),
  ('IS', '5-10kg',    940,  'DHL Express', 8,  14, true),
  ('IS', '10-15kg',   1220, 'DHL Express', 8,  14, true),
  ('IS', '15-20kg',   1500, 'DHL Express', 8,  14, true),

  -- Singapore (SGD — DHL)
  ('SG', '100g-1kg',  240,  'DHL Express', 7,  12, true),
  ('SG', '1-3kg',     400,  'DHL Express', 7,  12, true),
  ('SG', '3-5kg',     590,  'DHL Express', 7,  12, true),
  ('SG', '5-10kg',    860,  'DHL Express', 7,  12, true),
  ('SG', '10-15kg',   1120, 'DHL Express', 7,  12, true),
  ('SG', '15-20kg',   1380, 'DHL Express', 7,  12, true)

ON CONFLICT (country_code, weight_range) DO NOTHING;
