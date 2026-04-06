/**
 * Static seed data — used only as fallback/reference.
 * Production data is served from Supabase via catalog.service.ts / admin.service.ts.
 */
import type {
  AdminOrderRow,
  Campaign,
  ContentBlockRecord,
  FiscalStatusRecord,
  FreightRate,
  Product,
  UserRecord
} from "../types/domain.js";

export const products: Product[] = [
  {
    id: "p1",
    brand: "casa",
    category: "ceramica artesanal",
    subcategory: "mesa posta",
    name: "Colecao Terracota Atelier",
    slug: "colecao-terracota-atelier",
    sku: "CASA-001",
    shortDescription: "Ceramica autoral com acabamento quente e proporcao editorial.",
    longDescription: "Colecao pensada para compor mesas com linguagem silenciosa, materialidade nobre e acabamento refinado.",
    material: "Ceramica esmaltada",
    dimensions: "32 x 32 x 14 cm",
    origin: "Brasil",
    weightRange: "1-3kg",
    weightGrams: 1400,
    retailPriceBRL: 389,
    wholesalePriceBRL: 318,
    wholesaleMinQty: 8,
    stock: 24,
    badge: "Mais vendido",
    featured: true,
    collection: "Terracota",
    tags: ["mesa", "presente", "casa"]
  },
  {
    id: "p2",
    brand: "casa",
    category: "enxoval",
    subcategory: "mesa posta",
    name: "Jogo de Linho Botanico",
    slug: "jogo-de-linho-botanico",
    sku: "CASA-002",
    shortDescription: "Textura leve, desenho limpo e acabamento premium para receber.",
    longDescription: "Linho com caimento elegante e paleta neutra para composicoes internacionais.",
    material: "Linho premium",
    dimensions: "45 x 35 cm",
    origin: "Brasil",
    weightRange: "100g-1kg",
    weightGrams: 320,
    retailPriceBRL: 269,
    wholesalePriceBRL: 214,
    wholesaleMinQty: 10,
    stock: 40,
    badge: "Lancamento",
    collection: "Botanica",
    tags: ["linho", "mesa", "gift"]
  },
  {
    id: "p3",
    brand: "moda",
    category: "bolsas",
    subcategory: "couro",
    name: "Bolsa Atelier Noir",
    slug: "bolsa-atelier-noir",
    sku: "MODA-001",
    shortDescription: "Presenca editorial com construcao limpa e couro premium.",
    longDescription: "Bolsa de couro com linhas precisas, ferragens discretas e proporcao pensada para uma estetica contemporanea.",
    material: "Couro legitimo",
    dimensions: "28 x 19 x 10 cm",
    origin: "Brasil",
    careInstructions: "Limpar com pano seco. Evitar exposicao prolongada ao sol.",
    weightRange: "1-3kg",
    weightGrams: 980,
    retailPriceBRL: 1290,
    wholesalePriceBRL: 1030,
    wholesaleMinQty: 4,
    stock: 12,
    badge: "Editorial",
    featured: true,
    collection: "Atelier Noir",
    tags: ["fashion", "couro", "luxo"]
  },
  {
    id: "p4",
    brand: "moda",
    category: "cintos",
    subcategory: "acessorios",
    name: "Cinto Signature Bronze",
    slug: "cinto-signature-bronze",
    sku: "MODA-002",
    shortDescription: "Ajuste preciso, ferragem elegante e acabamento de colecao.",
    longDescription: "Peca que traduz refinamento discreto, leitura fashion e materialidade premium.",
    material: "Couro e metal",
    dimensions: "110 x 3,5 cm",
    origin: "Brasil",
    weightRange: "100g-1kg",
    weightGrams: 280,
    retailPriceBRL: 349,
    wholesalePriceBRL: 279,
    wholesaleMinQty: 12,
    stock: 55,
    collection: "Signature",
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
  { region: "North America", weightRange: "5-10kg", amountBRL: 318 },
  { region: "North America", weightRange: "10-15kg", amountBRL: 412 },
  { region: "North America", weightRange: "15-20kg", amountBRL: 548 },
  { region: "Europe", weightRange: "100g-1kg", amountBRL: 102 },
  { region: "Europe", weightRange: "1-3kg", amountBRL: 169 },
  { region: "Europe", weightRange: "3-5kg", amountBRL: 232 },
  { region: "Europe", weightRange: "5-10kg", amountBRL: 326 },
  { region: "Europe", weightRange: "10-15kg", amountBRL: 438 },
  { region: "Europe", weightRange: "15-20kg", amountBRL: 579 },
  { region: "Middle East", weightRange: "100g-1kg", amountBRL: 115 },
  { region: "Middle East", weightRange: "1-3kg", amountBRL: 184 },
  { region: "Middle East", weightRange: "3-5kg", amountBRL: 248 },
  { region: "Middle East", weightRange: "5-10kg", amountBRL: 352 },
  { region: "Middle East", weightRange: "10-15kg", amountBRL: 466 },
  { region: "Middle East", weightRange: "15-20kg", amountBRL: 612 }
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

export const users: UserRecord[] = [
  { id: "u1", name: "Amelia Foster", role: "customer" },
  { id: "u2", name: "Maison Elan", role: "wholesale" },
  { id: "u3", name: "Admin Root", role: "admin" }
];

export const contentBlocks: ContentBlockRecord[] = [
  { id: "hero-casa", type: "hero", brand: "casa", active: true },
  { id: "slider-moda", type: "slider", brand: "moda", active: true }
];

export const fiscalStatuses: FiscalStatusRecord[] = [
  { orderId: "DL-1001", status: "pending", invoiceNumber: null, accessKey: null },
  { orderId: "DL-1002", status: "in_review", invoiceNumber: null, accessKey: null }
];
