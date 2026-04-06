import { db } from "../lib/db.js";
import type { Brand, Campaign, FreightRate, Product, ProductImage } from "../types/domain.js";

// =============================================================================
// Mappers
// =============================================================================

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

    images: row.images ? (row.images as ProductImage[]) : undefined,
  };
}

// =============================================================================
// Column fragment shared by list queries (no image aggregation)
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

export async function listProducts(brand?: Brand): Promise<Product[]> {
  const rows = brand
    ? await db`
        SELECT ${db.unsafe(PRODUCT_SELECT)}
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN subcategories s ON s.id = p.subcategory_id
        WHERE p.brand = ${brand} AND p.is_active = true
        ORDER BY p.is_featured DESC, p.position, p.name
      `
    : await db`
        SELECT ${db.unsafe(PRODUCT_SELECT)}
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN subcategories s ON s.id = p.subcategory_id
        WHERE p.is_active = true
        ORDER BY p.is_featured DESC, p.position, p.name
      `;

  return rows.map(mapProduct);
}

/** Single product — includes images aggregated from product_images. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await db`
    SELECT
      ${db.unsafe(PRODUCT_SELECT)},
      COALESCE(
        json_agg(
          json_build_object(
            'id',       pi.id,
            'url',      pi.url,
            'altText',  pi.alt_text,
            'position', pi.position
          ) ORDER BY pi.position
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'::json
      ) AS images
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN subcategories s ON s.id = p.subcategory_id
    LEFT JOIN product_images pi ON pi.product_id = p.id
    WHERE p.slug = ${slug} AND p.is_active = true
    GROUP BY p.id, c.name, s.name
    LIMIT 1
  `;

  return rows.length > 0 ? mapProduct(rows[0]) : null;
}

/** Batch product lookup for order building — no images needed. */
export async function getProductsBySlug(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const rows = await db`
    SELECT ${db.unsafe(PRODUCT_SELECT)}
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN subcategories s ON s.id = p.subcategory_id
    WHERE p.slug = ANY(${slugs}) AND p.is_active = true
  `;
  return rows.map(mapProduct);
}

// =============================================================================
// Campaigns (mapped from banners table)
// =============================================================================

export async function listCampaigns(): Promise<Campaign[]> {
  const rows = await db`
    SELECT id, brand, title, subtitle, highlight, cta_label, cta_url
    FROM banners
    WHERE is_active = true
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

// =============================================================================
// Freight rates
// =============================================================================

export async function listFreightRates(
  weightRange?: FreightRate["weightRange"]
): Promise<FreightRate[]> {
  const rows = weightRange
    ? await db`
        SELECT sr.name AS region, s.weight_range, s.amount_brl
        FROM shipping_rates s
        JOIN shipping_regions sr ON sr.id = s.shipping_region_id
        WHERE s.weight_range = ${weightRange} AND sr.is_active = true
        ORDER BY sr.name
      `
    : await db`
        SELECT sr.name AS region, s.weight_range, s.amount_brl
        FROM shipping_rates s
        JOIN shipping_regions sr ON sr.id = s.shipping_region_id
        WHERE sr.is_active = true
        ORDER BY sr.name, s.weight_range
      `;

  return rows.map((row) => ({
    region: row.region as FreightRate["region"],
    weightRange: row.weight_range as FreightRate["weightRange"],
    amountBRL: Number(row.amount_brl),
  }));
}
