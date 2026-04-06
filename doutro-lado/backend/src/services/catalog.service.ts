import { db } from "../lib/db.js";
import type { Brand, CampaignRecord, FreightRateRecord, ProductRecord } from "../types/domain.js";

function mapProduct(row: Record<string, unknown>): ProductRecord {
  return {
    id: row.id as string,
    brand: row.brand as Brand,
    name: row.name as string,
    slug: row.slug as string,
    category: (row.category_name as string) ?? "",
    subcategory: (row.subcategory_name as string) ?? "",
    sku: row.sku as string,
    shortDescription: (row.short_description as string) ?? "",
    longDescription: (row.long_description as string) ?? "",
    material: (row.material as string) ?? "",
    dimensions: (row.dimensions as string) ?? "",
    weightRange: row.weight_range as ProductRecord["weightRange"],
    retailPriceBRL: Number(row.retail_price_brl),
    wholesalePriceBRL: Number(row.wholesale_price_brl ?? row.retail_price_brl),
    wholesaleMinQty: (row.wholesale_min_qty as number) ?? 1,
    stock: row.stock as number,
    badge: (row.badge as string | null) ?? undefined,
    featured: (row.is_featured as boolean) ?? false,
    tags: (row.tags as string[]) ?? [],
  };
}

const PRODUCT_SELECT = `
  p.id, p.brand, p.name, p.slug, p.sku,
  p.short_description, p.long_description, p.material, p.dimensions,
  p.weight_range, p.retail_price_brl, p.wholesale_price_brl, p.wholesale_min_qty,
  p.stock, p.badge, p.is_featured, p.tags,
  c.name as category_name,
  s.name as subcategory_name
`;

export async function listProducts(brand?: Brand): Promise<ProductRecord[]> {
  const rows = brand
    ? await db`
        SELECT ${db.unsafe(PRODUCT_SELECT)}
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN subcategories s ON s.id = p.subcategory_id
        WHERE p.brand = ${brand} AND p.is_active = true
        ORDER BY p.is_featured DESC, p.name
      `
    : await db`
        SELECT ${db.unsafe(PRODUCT_SELECT)}
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN subcategories s ON s.id = p.subcategory_id
        WHERE p.is_active = true
        ORDER BY p.is_featured DESC, p.name
      `;

  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<ProductRecord | null> {
  const rows = await db`
    SELECT ${db.unsafe(PRODUCT_SELECT)}
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN subcategories s ON s.id = p.subcategory_id
    WHERE p.slug = ${slug} AND p.is_active = true
    LIMIT 1
  `;
  return rows.length > 0 ? mapProduct(rows[0]) : null;
}

export async function getProductsBySlug(slugs: string[]): Promise<ProductRecord[]> {
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

export async function listCampaigns(): Promise<CampaignRecord[]> {
  const rows = await db`
    SELECT id, brand, title, subtitle, cta_label, cta_url, subtitle as highlight
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
    highlight: (row.highlight as string) ?? "",
  }));
}

export async function listFreightRates(
  weightRange?: FreightRateRecord["weightRange"]
): Promise<FreightRateRecord[]> {
  const rows = weightRange
    ? await db`
        SELECT sr.name as region, s.weight_range, s.amount_brl
        FROM shipping_rates s
        JOIN shipping_regions sr ON sr.id = s.shipping_region_id
        WHERE s.weight_range = ${weightRange} AND sr.is_active = true
        ORDER BY sr.name
      `
    : await db`
        SELECT sr.name as region, s.weight_range, s.amount_brl
        FROM shipping_rates s
        JOIN shipping_regions sr ON sr.id = s.shipping_region_id
        WHERE sr.is_active = true
        ORDER BY sr.name, s.weight_range
      `;

  return rows.map((row) => ({
    region: row.region as FreightRateRecord["region"],
    weightRange: row.weight_range as FreightRateRecord["weightRange"],
    amountBRL: Number(row.amount_brl),
  }));
}
