import type { AdminOrderRow, Campaign, FreightRate, Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "p1",
    brand: "casa",
    name: "Colecao Terracota Atelier",
    slug: "colecao-terracota-atelier",
    category: "ceramica artesanal",
    subcategory: "mesa posta",
    sku: "CASA-001",
    shortDescription: "Ceramica autoral com acabamento quente e proporcao editorial.",
    longDescription: "Uma colecao pensada para compor mesas com linguagem silenciosa, materialidade nobre e acabamento refinado.",
    material: "Ceramica esmaltada",
    dimensions: "32 x 32 x 14 cm",
    weightRange: "1-3kg",
    retailPriceBRL: 389,
    wholesalePriceBRL: 318,
    wholesaleMinQty: 8,
    stock: 24,
    badge: "Mais vendido",
    featured: true,
    tags: ["mesa", "presente", "casa"]
  },
  {
    id: "p2",
    brand: "casa",
    name: "Jogo de Linho Botanico",
    slug: "jogo-de-linho-botanico",
    category: "enxoval",
    subcategory: "mesa posta",
    sku: "CASA-002",
    shortDescription: "Textura leve, desenho limpo e acabamento premium para receber.",
    longDescription: "Linho com caimento elegante e paleta neutra para composicoes internacionais.",
    material: "Linho premium",
    dimensions: "45 x 35 cm",
    weightRange: "100g-1kg",
    retailPriceBRL: 269,
    wholesalePriceBRL: 214,
    wholesaleMinQty: 10,
    stock: 40,
    badge: "Lancamento",
    tags: ["linho", "mesa", "gift"]
  },
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
  }
];

export const campaigns: Campaign[] = [
  {
    id: "c1",
    brand: "casa",
    title: "Presentes com curadoria para casa, mesa e atmosfera",
    subtitle: "Pecas brasileiras com leitura internacional, acabamento silencioso e vocacao para presente premium.",
    ctaLabel: "Explorar curadoria",
    ctaHref: "/brands/casa",
    highlight: "Curadoria editorial"
  },
  {
    id: "c2",
    brand: "moda",
    title: "Couro, presenca e linguagem fashion de exportacao",
    subtitle: "Colecoes concebidas para mercados exigentes, com construcao visual forte e sofisticacao contemporanea.",
    ctaLabel: "Entrar no universo moda",
    ctaHref: "/brands/moda",
    highlight: "Editorial premium"
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
    id: "DL-1001",
    brand: "casa",
    customer: "Amelia Foster",
    region: "North America",
    totalBRL: 2840,
    paymentStatus: "paid",
    fiscalStatus: "pending",
    orderStatus: "processing",
    createdAt: "2026-04-05"
  },
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
    id: "DL-1003",
    brand: "casa",
    customer: "Nora Finch",
    region: "Middle East",
    totalBRL: 1180,
    paymentStatus: "pending",
    fiscalStatus: "pending",
    orderStatus: "created",
    createdAt: "2026-04-04"
  }
];
