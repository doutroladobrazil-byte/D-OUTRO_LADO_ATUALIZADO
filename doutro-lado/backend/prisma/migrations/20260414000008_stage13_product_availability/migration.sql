-- =============================================================================
-- Stage 13 — Product availability by country
-- =============================================================================
-- Adds product_country_availability: a per-product toggle per destination country.
--
-- Model:
--   - Each row = one (product, country) pair.
--   - is_active = true  → product is available in that country (default for new rows).
--   - is_active = false → product is explicitly blocked for that country.
--   - No row → treated as unavailable (opt-in model, safe for future products).
--
-- Backfill:
--   All currently active products are seeded as available for all 6 MVP countries.
--   Inactive products are not backfilled (they are already excluded from public catalog).
--
-- On Neon/plain Postgres: no Supabase-specific syntax.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

CREATE TABLE product_country_availability (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  country_code VARCHAR(2)  NOT NULL,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, country_code)
);

-- Fast lookup by product_id (used in batch availability checks during bag simulation)
CREATE INDEX idx_pca_product_id ON product_country_availability (product_id);

-- Fast lookup by country (used in catalog filtering)
CREATE INDEX idx_pca_country_code ON product_country_availability (country_code);

-- ---------------------------------------------------------------------------
-- Backfill: existing active products → available in all 6 MVP countries
-- ---------------------------------------------------------------------------

INSERT INTO product_country_availability (product_id, country_code)
SELECT p.id, c.code
FROM products p
CROSS JOIN (
  VALUES ('US'), ('CH'), ('IE'), ('DE'), ('IS'), ('SG')
) AS c(code)
WHERE p.is_active = true
ON CONFLICT (product_id, country_code) DO NOTHING;
