export type Brand = "casa" | "moda";
export type Role = "customer" | "wholesale" | "admin";
export type WeightRange = "100g-1kg" | "1-3kg" | "3-5kg" | "5-10kg" | "10-15kg" | "15-20kg";

export type Product = {
  id: string;
  brand: Brand;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  sku: string;
  shortDescription: string;
  longDescription: string;
  material: string;
  dimensions: string;
  weightRange: WeightRange;
  retailPriceBRL: number;
  wholesalePriceBRL: number;
  wholesaleMinQty: number;
  stock: number;
  badge?: string;
  featured?: boolean;
  tags: string[];
};

export type Campaign = {
  id: string;
  brand: Brand;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  highlight: string;
};

export type FreightRate = {
  region: string;
  weightRange: WeightRange;
  amountBRL: number;
};

export type AdminOrderRow = {
  id: string;
  brand: Brand;
  customer: string;
  region: string;
  totalBRL: number;
  paymentStatus: string;
  fiscalStatus: string;
  orderStatus: string;
  createdAt: string;
};

export type BrandOrderSummary = {
  brand: Brand;
  revenueBRL: number;
  orders: number;
};

export type AdminOverview = {
  revenueBRL: number;
  orders: number;
  averageTicketBRL: number;
  newCustomers: number;
  alerts: string[];
  brandSummaries: BrandOrderSummary[];
};

export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  message?: string;
};
