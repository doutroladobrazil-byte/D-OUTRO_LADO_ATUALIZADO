/**
 * Static seed data — used only as fallback/reference.
 * Production data is served from Supabase via catalog.service.ts / admin.service.ts.
 * D'OUTRO LADO opera exclusivamente moda (couro, bolsas, acessorios, vestuario).
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
  },
  {
    id: "p5",
    brand: "moda",
    category: "sapatos",
    subcategory: "couro",
    name: "Derby Artesanal Escuro",
    slug: "derby-artesanal-escuro",
    sku: "MODA-003",
    shortDescription: "Corte limpo, solado couro e acabamento premium para uso diario com presenca.",
    longDescription: "Sapato derby com cabedal em couro curtido a vegetal, forro interno em couro e acabamento artesanal de referencia.",
    material: "Couro bovino curtido a vegetal",
    dimensions: "28 cm (40 BR)",
    origin: "Brasil",
    careInstructions: "Hidrate regularmente com creme neutro. Guarde em sapateira adequada.",
    weightRange: "1-3kg",
    weightGrams: 860,
    retailPriceBRL: 890,
    wholesalePriceBRL: 712,
    wholesaleMinQty: 6,
    stock: 18,
    badge: "Artesanal",
    featured: true,
    collection: "Classic Dark",
    tags: ["sapato", "couro", "editorial"]
  },
  {
    id: "p6",
    brand: "moda",
    category: "acessorios",
    subcategory: "carteiras",
    name: "Carteira Slim Edition",
    slug: "carteira-slim-edition",
    sku: "MODA-004",
    shortDescription: "Formato fino, couro premium e acabamento silencioso para quem entende.",
    longDescription: "Carteira slim com porta-cartoes, couro pleno flor com envelhecimento digno e costura manual.",
    material: "Couro pleno flor",
    dimensions: "12 x 9 x 0,7 cm",
    origin: "Brasil",
    careInstructions: "Limpar com pano ligeiramente umido.",
    weightRange: "100g-1kg",
    weightGrams: 120,
    retailPriceBRL: 279,
    wholesalePriceBRL: 223,
    wholesaleMinQty: 15,
    stock: 42,
    badge: "Bestseller",
    featured: true,
    collection: "Slim",
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

export const users: UserRecord[] = [
  { id: "u1", name: "Maison Elan", role: "wholesale" },
  { id: "u2", name: "Admin Root", role: "admin" }
];

export const contentBlocks: ContentBlockRecord[] = [
  { id: "slider-moda", type: "slider", brand: "moda", active: true },
  { id: "hero-moda", type: "hero", brand: "moda", active: true }
];

export const fiscalStatuses: FiscalStatusRecord[] = [
  { orderId: "DL-1002", status: "in_review", invoiceNumber: null, accessKey: null },
  { orderId: "DL-1004", status: "pending", invoiceNumber: null, accessKey: null }
];
