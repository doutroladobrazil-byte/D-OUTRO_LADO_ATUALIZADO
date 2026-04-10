import type { AdminOrderRow, Campaign, FreightRate, Product } from "@/lib/types";

// D'OUTRO LADO opera exclusivamente moda (couro, bolsas, acessorios, vestuario).
// Dados de fallback usados apenas quando a API nao esta disponivel.

export const products: Product[] = [
  {
    id: "p3",
    brand: "moda",
    name: "Bolsa Atelier Noir",
    slug: "bolsa-atelier-noir",
    category: "bolsas",
    subcategory: "couro",
    sku: "MODA-001",
    shortDescription: "Presenca editorial com construcao limpa e couro premium.",
    longDescription: "Bolsa de couro com linhas precisas, ferragens discretas e proporcao pensada para uma estetica contemporanea internacional.",
    material: "Couro legitimo",
    dimensions: "28 x 19 x 10 cm",
    weightRange: "1-3kg",
    retailPriceBRL: 1290,
    wholesalePriceBRL: 1030,
    wholesaleMinQty: 4,
    stock: 12,
    badge: "Editorial",
    featured: true,
    tags: ["fashion", "couro", "luxo"]
  },
  {
    id: "p4",
    brand: "moda",
    name: "Cinto Signature Bronze",
    slug: "cinto-signature-bronze",
    category: "cintos",
    subcategory: "acessorios",
    sku: "MODA-002",
    shortDescription: "Ajuste preciso, ferragem elegante e acabamento de colecao.",
    longDescription: "Peca que traduz refinamento discreto, leitura fashion e materialidade premium.",
    material: "Couro e metal",
    dimensions: "110 x 3,5 cm",
    weightRange: "100g-1kg",
    retailPriceBRL: 349,
    wholesalePriceBRL: 279,
    wholesaleMinQty: 12,
    stock: 55,
    tags: ["couro", "editorial", "gift"]
  },
  {
    id: "p5",
    brand: "moda",
    name: "Derby Artesanal Escuro",
    slug: "derby-artesanal-escuro",
    category: "sapatos",
    subcategory: "couro",
    sku: "MODA-003",
    shortDescription: "Corte limpo, solado couro e acabamento premium para uso diario com presenca.",
    longDescription: "Sapato derby com cabedal em couro curtido a vegetal, forro interno em couro e acabamento artesanal de referencia.",
    material: "Couro bovino curtido a vegetal",
    dimensions: "28 cm (40 BR)",
    weightRange: "1-3kg",
    retailPriceBRL: 890,
    wholesalePriceBRL: 712,
    wholesaleMinQty: 6,
    stock: 18,
    badge: "Artesanal",
    featured: true,
    tags: ["sapato", "couro", "editorial"]
  },
  {
    id: "p6",
    brand: "moda",
    name: "Carteira Slim Edition",
    slug: "carteira-slim-edition",
    category: "acessorios",
    subcategory: "carteiras",
    sku: "MODA-004",
    shortDescription: "Formato fino, couro premium e acabamento silencioso para quem entende.",
    longDescription: "Carteira slim com porta-cartoes, couro pleno flor com envelhecimento digno e costura manual.",
    material: "Couro pleno flor",
    dimensions: "12 x 9 x 0,7 cm",
    weightRange: "100g-1kg",
    retailPriceBRL: 279,
    wholesalePriceBRL: 223,
    wholesaleMinQty: 15,
    stock: 42,
    badge: "Bestseller",
    featured: true,
    tags: ["carteira", "couro", "gift", "present"]
  }
];

export const campaigns: Campaign[] = [
  {
    id: "c2",
    brand: "moda",
    title: "Couro, presenca e linguagem fashion de exportacao",
    subtitle: "Colecoes concebidas para mercados exigentes, com construcao visual forte e sofisticacao contemporanea.",
    ctaLabel: "Explorar colecoes",
    ctaHref: "/brands/moda",
    highlight: "Editorial premium"
  },
  {
    id: "c3",
    brand: "moda",
    title: "Acessorios com narrativa — presentes que permanecem",
    subtitle: "Couro, ferragem e acabamento manual para ocasioes que merecem presenca real.",
    ctaLabel: "Montar presente",
    ctaHref: "/gift-builder",
    highlight: "Composicao editorial"
  }
];

export const freightRates: FreightRate[] = [
  { region: "North America", weightRange: "100g-1kg", amountBRL: 96 },
  { region: "North America", weightRange: "1-3kg", amountBRL: 158 },
  { region: "North America", weightRange: "3-5kg", amountBRL: 220 },
  { region: "Europe", weightRange: "100g-1kg", amountBRL: 102 },
  { region: "Europe", weightRange: "1-3kg", amountBRL: 169 },
  { region: "Europe", weightRange: "3-5kg", amountBRL: 232 },
  { region: "Middle East", weightRange: "3-5kg", amountBRL: 248 }
];

export const adminOrders: AdminOrderRow[] = [
  {
    id: "DL-1002",
    brand: "moda",
    customer: "Maison Elan",
    region: "Europe",
    totalBRL: 9340,
    paymentStatus: "paid",
    fiscalStatus: "in_review",
    orderStatus: "packing",
    createdAt: "2026-04-05"
  },
  {
    id: "DL-1004",
    brand: "moda",
    customer: "Isabelle Moreau",
    region: "North America",
    totalBRL: 3870,
    paymentStatus: "paid",
    fiscalStatus: "pending",
    orderStatus: "processing",
    createdAt: "2026-04-08"
  }
];
