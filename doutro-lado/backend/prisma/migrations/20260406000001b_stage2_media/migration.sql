-- Stage 2: Media system — media_assets + product_media
-- These tables were defined in supabase/schema.sql but were not included
-- in the original Prisma migration set. Added here to close the gap.
-- All statements are idempotent (IF NOT EXISTS).

-- Central registry for all physical media assets stored in Supabase Storage.
-- One row per file. No binary data stored here — only metadata and the path.
CREATE TABLE IF NOT EXISTS "media_assets" (
  "id"               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "brand"            TEXT        NOT NULL CHECK (brand IN ('casa', 'moda')),
  "media_type"       TEXT        NOT NULL CHECK (media_type IN ('image', 'video')),
  "bucket"           TEXT        NOT NULL,
  "storage_path"     TEXT        NOT NULL UNIQUE,
  "public_url"       TEXT        NOT NULL,
  "mime_type"        TEXT,
  "file_size_bytes"  BIGINT,
  "width"            INTEGER,
  "height"           INTEGER,
  "duration_seconds" NUMERIC(10,2),
  "poster_url"       TEXT,
  "alt_text"         TEXT,
  "caption"          TEXT,
  "is_active"        BOOLEAN     NOT NULL DEFAULT true,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Join table: links media assets to products with ordering and primary flag.
CREATE TABLE IF NOT EXISTS "product_media" (
  "id"             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id"     UUID        NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "media_asset_id" UUID        NOT NULL REFERENCES "media_assets"("id") ON DELETE CASCADE,
  "position"       INTEGER     NOT NULL DEFAULT 0,
  "is_primary"     BOOLEAN     NOT NULL DEFAULT false,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("product_id", "media_asset_id")
);

-- Index for fast ordered lookups per product
CREATE INDEX IF NOT EXISTS idx_product_media_product_position
  ON product_media (product_id, position);
