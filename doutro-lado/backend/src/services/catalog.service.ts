import { db } from "../lib/db.js";
import type { Brand, Campaign, Product, ProductMedia } from "../types/domain.js";

// =============================================================================
// Mappers
// =============================================================================

function mapProductMedia(row: Record<string, unknown>): ProductMedia {
  return {
    id: row.pm_id as string,
    productId: row.product_id as string,
    position: row.pm_position as number,
    isPrimary: row.pm_is_primary as boolean,
    createdAt: row.pm_created_at as string,
    asset: {
      id: row.ma_id as string,
      brand: row.brand as Brand,
      mediaType: row.media_type as "image" | "video",
      bucket: row.bucket as string,
      storagePath: row.storage_path as string,
      publicUrl: row.public_url as string,
      mimeType: (row.mime_type as string | null) ?? undefined,
      fileSizeBytes: (row.file_size_bytes as number | null) ?? undefined,
      width: (row.width as number | null) ?? undefined,
      height: (row.height as number | null) ?? undefined,
      durationSeconds: (row.duration_seconds as number | null) ?? undefined,
      posterUrl: (row.poster_url as string | null) ?? undefined,
      altText: (row.alt_text as string | null) ?? undefined,
      caption: (row.caption as string | null) ?? undefined,
      isActive: row.ma_is_active as boolean,
      createdAt: row.ma_created_at as string,
    },
  };
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    brand: row.brand as Brand,

    categoryId: (row.category_id as string | null) ?? undefined,
    category: (row.category_name as string) ?? "",
    subcategoryId: (row.subcategory_id as string | null) ?? undefined,
    subcategory: (row.subcategory_name as string) ?? "",

    name: row.name as string,
    slug: row.slug as string,
    sku: row.sku as string,

    shortDescription: (row.short_description as string) ?? "",
    longDescription: (row.long_description as string) ?? "",
    seoTitle: (row.seo_title as string | null) ?? undefined,
    seoDescription: (row.seo_description as string | null) ?? undefined,

    material: (row.material as string) ?? "",
    dimensions: (row.dimensions as string) ?? "",
    origin: (row.origin as string | null) ?? undefined,
    careInstructions: (row.care_instructions as string | null) ?? undefined,

    weightRange: row.weight_range as Product["weightRange"],
    weightGrams: (row.weight_grams as number | null) ?? undefined,

    retailPriceBRL: Number(row.retail_price_brl),
    wholesalePriceBRL: Number(row.wholesale_price_brl ?? row.retail_price_brl),
    wholesaleMinQty: (row.wholesale_min_qty as number) ?? 1,

    stock: row.stock as number,

    badge: (row.badge as string | null) ?? undefined,
    featured: (row.is_featured as boolean) ?? false,
    collection: (row.collection as string | null) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    position: (row.position as number) ?? 0,

    // media is injected separately in getProductBySlug
    media: undefined,
  };
}

// =============================================================================
// Column fragment shared by list queries (no media aggregation)
// =============================================================================

const PRODUCT_SELECT = `
  p.id, p.brand,
  p.category_id, p.subcategory_id,
  p.name, p.slug, p.sku,
  p.short_description, p.long_description,
  p.seo_title, p.seo_description,
  p.material, p.dimensions, p.origin, p.care_instructions,
  p.weight_range, p.weight_grams,
  p.retail_price_brl, p.wholesale_price_brl, p.wholesale_min_qty,
  p.stock, p.badge, p.is_featured, p.collection, p.tags, p.position,
  c.name as category_name,
  s.name as subcategory_name
`;

// =============================================================================
// Catalog queries
// =============================================================================

export type ListProductsOptions = {
  brand?: Brand;
  search?: string;
  category?: string;
  sort?: "price_asc" | "price_desc" | "newest";
};

export async function listProducts(options: ListProductsOptions = {}): Promise<Product[]> {
  const { brand, search, category, sort } = options;

  // D'OUTRO LADO opera moda-only. "moda" e o brand efetivo por padrao.
  // Produtos de outras brands no banco nao sao expostos publicamente por omissao.
  const effectiveBrand: Brand = brand ?? "moda";

  let orderClause = db`ORDER BY p.is_featured DESC, p.position, p.name`;
  if (sort === "price_asc") orderClause = db`ORDER BY p.retail_price_brl ASC`;
  else if (sort === "price_desc") orderClause = db`ORDER BY p.retail_price_brl DESC`;
  else if (sort === "newest") orderClause = db`ORDER BY p.created_at DESC`;

  const rows = await db`
    SELECT ${db.unsafe(PRODUCT_SELECT)}
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN subcategories s ON s.id = p.subcategory_id
    WHERE p.is_active = true
      AND p.brand = ${effectiveBrand}
      ${category ? db`AND c.name ILIKE ${category}` : db``}
      ${
        search
          ? db`AND (p.name ILIKE ${"%" + search + "%"} OR p.short_description ILIKE ${"%" + search + "%"})`
          : db``
      }
    ${orderClause}
  `;

  return rows.map(mapProduct);
}

/**
 * Single product — includes full media (images + videos) ordered by primary, then position.
 * Uses product_media + media_assets (Stage 2). Falls back gracefully if no media exists.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  // 1. Fetch the product row — restrito a brand=moda para nao expor produtos casa publicamente
  const productRows = await db`
    SELECT ${db.unsafe(PRODUCT_SELECT)}
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN subcategories s ON s.id = p.subcategory_id
    WHERE p.slug = ${slug} AND p.is_active = true AND p.brand = 'moda'
    LIMIT 1
  `;

  if (productRows.length === 0) return null;

  const product = mapProduct(productRows[0]);

  // 2. Fetch media for this product
  const mediaRows = await db`
    SELECT
      pm.id          AS pm_id,
      pm.product_id,
      pm.position    AS pm_position,
      pm.is_primary  AS pm_is_primary,
      pm.created_at  AS pm_created_at,
      ma.id          AS ma_id,
      ma.brand,
      ma.media_type,
      ma.bucket,
      ma.storage_path,
      ma.public_url,
      ma.mime_type,
      ma.file_size_bytes,
      ma.width,
      ma.height,
      ma.duration_seconds,
      ma.poster_url,
      ma.alt_text,
      ma.caption,
      ma.is_active   AS ma_is_active,
      ma.created_at  AS ma_created_at
    FROM product_media pm
    JOIN media_assets ma ON ma.id = pm.media_asset_id
    WHERE pm.product_id = ${product.id}
      AND ma.is_active = true
    ORDER BY pm.is_primary DESC, pm.position
  `;

  product.media = mediaRows.map(mapProductMedia);

  return product;
}

/**
 * Batch product lookup for order/kit/bag building — no media needed.
 * Restrito a brand=moda: evita que slugs de produtos casa sejam incluidos em pedidos publicos.
 */
export async function getProductsBySlug(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const rows = await db`
    SELECT ${db.unsafe(PRODUCT_SELECT)}
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN subcategories s ON s.id = p.subcategory_id
    WHERE p.slug = ANY(${slugs}) AND p.is_active = true AND p.brand = 'moda'
  `;
  return rows.map(mapProduct);
}

// =============================================================================
// Campaigns (mapped from banners table)
// =============================================================================

export async function listCampaigns(): Promise<Campaign[]> {
  // Restrito a brand=moda — impede retorno de campanhas casa ainda ativas no banco
  const rows = await db`
    SELECT id, brand, title, subtitle, highlight, cta_label, cta_url
    FROM banners
    WHERE is_active = true AND brand = 'moda'
    ORDER BY position
  `;
  return rows.map((row) => ({
    id: row.id as string,
    brand: row.brand as Brand,
    title: row.title as string,
    subtitle: (row.subtitle as string) ?? "",
    ctaLabel: (row.cta_label as string) ?? "",
    ctaHref: (row.cta_url as string) ?? "#",
    highlight: (row.highlight as string) ?? (row.subtitle as string) ?? "",
  }));
}

