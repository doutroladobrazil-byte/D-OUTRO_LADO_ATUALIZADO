// Single source of truth for all creative slot keys.
// Admin UI and homepage must reference only keys from this registry.

export const CREATIVE_SLOT_REGISTRY = [
  {
    key: "home.hero",
    label: "Home Hero",
    description: "Main image or video for the first fold of the homepage.",
    recommendedRatio: "3:4",
    accepts: ["image", "video"],
  },
  // Category grid (7 cards)
  {
    key: "home.category.new-in",
    label: "Category — New In",
    description: "New arrivals category card on homepage.",
    recommendedRatio: "1:1",
    accepts: ["image"],
  },
  {
    key: "home.category.leather-bags",
    label: "Category — Leather Bags",
    description: "Leather bags category card on homepage.",
    recommendedRatio: "1:1",
    accepts: ["image"],
  },
  {
    key: "home.category.small-leather-goods",
    label: "Category — Small Leather Goods",
    description: "Small leather goods category card on homepage.",
    recommendedRatio: "1:1",
    accepts: ["image"],
  },
  {
    key: "home.category.shoes",
    label: "Category — Shoes",
    description: "Shoes category card on homepage.",
    recommendedRatio: "1:1",
    accepts: ["image"],
  },
  {
    key: "home.category.accessories",
    label: "Category — Accessories",
    description: "Accessories category card on homepage.",
    recommendedRatio: "1:1",
    accepts: ["image"],
  },
  {
    key: "home.category.gift-sets",
    label: "Category — Gift Sets",
    description: "Gift sets category card on homepage.",
    recommendedRatio: "1:1",
    accepts: ["image"],
  },
  {
    key: "home.category.best-sellers",
    label: "Category — Best Sellers",
    description: "Best sellers category card on homepage.",
    recommendedRatio: "1:1",
    accepts: ["image"],
  },
  // Shop by style (5 cards)
  {
    key: "home.style.everyday-carry",
    label: "Style — Everyday Carry",
    description: "Style card for everyday carry look.",
    recommendedRatio: "3:4",
    accepts: ["image"],
  },
  {
    key: "home.style.evening-presence",
    label: "Style — Evening Presence",
    description: "Style card for evening look.",
    recommendedRatio: "3:4",
    accepts: ["image"],
  },
  {
    key: "home.style.gift-ready",
    label: "Style — Gift Ready",
    description: "Style card for gift-ready look.",
    recommendedRatio: "3:4",
    accepts: ["image"],
  },
  {
    key: "home.style.travel-work",
    label: "Style — Travel & Work",
    description: "Style card for travel and work.",
    recommendedRatio: "3:4",
    accepts: ["image"],
  },
  {
    key: "home.style.minimal-essentials",
    label: "Style — Minimal Essentials",
    description: "Style card for minimal essentials.",
    recommendedRatio: "3:4",
    accepts: ["image"],
  },
  // Editorial / campaigns
  {
    key: "home.gift",
    label: "Gift Section",
    description: "Gift composition section visual.",
    recommendedRatio: "16:9",
    accepts: ["image"],
  },
  {
    key: "home.editorial.primary",
    label: "Editorial — Primary",
    description: "Main editorial banner on homepage.",
    recommendedRatio: "16:9",
    accepts: ["image", "video"],
  },
  {
    key: "home.campaign.primary",
    label: "Campaign — Primary",
    description: "Primary campaign banner on homepage.",
    recommendedRatio: "16:9",
    accepts: ["image", "video"],
  },
  {
    key: "home.social-proof.reel-1",
    label: "Social Proof — Reel 1",
    description: "Social proof video or image reel.",
    recommendedRatio: "9:16",
    accepts: ["image", "video"],
  },
] as const;

export type CreativeSlotKey = (typeof CREATIVE_SLOT_REGISTRY)[number]["key"];

/** All official slot keys as a plain string array — for API queries and selects. */
export const ALL_SLOT_KEYS = CREATIVE_SLOT_REGISTRY.map((s) => s.key);
