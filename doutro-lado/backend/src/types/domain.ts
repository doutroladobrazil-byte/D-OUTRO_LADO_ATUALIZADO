export type Brand = "casa" | "moda";
export type Role = "customer" | "wholesale" | "admin";
export type Region = "North America" | "Europe" | "Middle East";
export type WeightRange = "100g-1kg" | "1-3kg" | "3-5kg" | "5-10kg" | "10-15kg" | "15-20kg";

export type ProductRecord = {
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

export type CampaignRecord = {
  id: string;
  brand: Brand;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  highlight: string;
};

export type FreightRateRecord = {
  region: Region;
  weightRange: WeightRange;
  amountBRL: number;
};

export type AdminOrderRecord = {
  id: string;
  brand: Brand;
  customer: string;
  region: Region;
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

export type ContentBlockRecord = {
  id: string;
  type: string;
  brand: Brand;
  active: boolean;
};

export type FiscalStatusRecord = {
  orderId: string;
  status: string;
  invoiceNumber: string | null;
  accessKey: string | null;
};

export type UserRecord = {
  id: string;
  name: string;
  role: Role;
};

export type OrderItemInput = {
  productSlug: string;
  quantity: number;
};

export type BuiltOrderItem = {
  productId: string;
  brand: Brand;
  slug: string;
  sku: string;
  name: string;
  quantity: number;
  unitPriceBRL: number;
  lineTotalBRL: number;
  weightRange: WeightRange;
};

export type BuiltOrder = {
  publicId: string;
  brand: Brand;
  currency: string;
  region: Region;
  pricingTier: "retail" | "wholesale";
  items: BuiltOrderItem[];
  subtotalBRL: number;
  freightBRL: number;
  totalBRL: number;
  paymentStatus: "pending";
  orderStatus: "created";
  fiscalStatus: "pending";
  estimatedWeightRange: WeightRange;
};

export type AdminOverview = {
  revenueBRL: number;
  orders: number;
  averageTicketBRL: number;
  newCustomers: number;
  alerts: string[];
  brandSummaries: BrandOrderSummary[];
};
