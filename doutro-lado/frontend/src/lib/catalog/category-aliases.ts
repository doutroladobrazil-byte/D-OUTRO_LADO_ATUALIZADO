// Category alias map for robust catalog filtering.
// Each key is a URL slug; value is a list of normalized strings that should match
// against product.category, product.subcategory, product.badge, and product.name.
//
// Rules:
// - All values are lowercase and accent-free.
// - "small-leather-goods" must NOT include "leather" alone — too broad.
// - Normalise input before matching: lowercase, remove accents, hyphens→spaces, trim.

export const CATEGORY_ALIASES: Record<string, string[]> = {
  "leather-bags": [
    "bag",
    "bags",
    "handbag",
    "handbags",
    "tote",
    "shoulder bag",
    "shoulder bags",
    "clutch",
    "clutches",
    "bolsa",
    "bolsas",
    "carteira grande",
    "mala",
  ],
  "small-leather-goods": [
    "wallet",
    "wallets",
    "cardholder",
    "cardholders",
    "card holder",
    "card case",
    "card cases",
    "purse",
    "purses",
    "key holder",
    "key holders",
    "money clip",
    "money clips",
    "carteira",
    "carteiras",
    "porta-cartao",
    "porta-cartoes",
    "porta cartao",
    "porta cartoes",
    "small leather goods",
    "small leather",
    "porta-chaves",
    "porta chaves",
  ],
  "shoes": [
    "shoe",
    "shoes",
    "footwear",
    "loafer",
    "loafers",
    "oxford",
    "oxfords",
    "boot",
    "boots",
    "sneaker",
    "sneakers",
    "sandal",
    "sandals",
    "sapato",
    "sapatos",
    "calcado",
    "calcados",
    "tenis",
    "bota",
    "botas",
  ],
  "accessories": [
    "accessory",
    "accessories",
    "belt",
    "belts",
    "jewelry",
    "jewellery",
    "bracelet",
    "bracelets",
    "necklace",
    "necklaces",
    "ring",
    "rings",
    "watch",
    "watches",
    "scarf",
    "scarves",
    "hat",
    "hats",
    "cinto",
    "cintos",
    "joia",
    "joias",
    "bracelete",
    "bracelet",
    "colar",
    "acessorio",
    "acessorios",
    "acessório",
    "acessórios",
  ],
};

/** Normalize a string for alias matching. */
export function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacritics
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns true when a product field matches the given category slug.
 * Uses the alias map; falls back to direct slug comparison.
 */
export function matchesCategory(
  categorySlug: string,
  ...fields: (string | null | undefined)[]
): boolean {
  const aliases = CATEGORY_ALIASES[categorySlug];
  if (!aliases) {
    // Unknown slug — fall back to normalised direct match
    const norm = normalizeForMatch(categorySlug);
    return fields.some((f) => f && normalizeForMatch(f).includes(norm));
  }

  return fields.some((field) => {
    if (!field) return false;
    const normalised = normalizeForMatch(field);
    return aliases.some((alias) => normalised.includes(alias));
  });
}
