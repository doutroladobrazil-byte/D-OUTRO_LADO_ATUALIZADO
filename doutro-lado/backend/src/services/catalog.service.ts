import { campaigns, freightRates, products } from "../data/mock-store.js";
import type { Brand, FreightRateRecord } from "../types/domain.js";

export function listProducts(brand?: Brand) {
  return brand ? products.filter((product) => product.brand === brand) : products;
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug) ?? null;
}

export function listCampaigns() {
  return campaigns;
}

export function listFreightRates(weightRange?: FreightRateRecord["weightRange"]) {
  return weightRange ? freightRates.filter((rate) => rate.weightRange === weightRange) : freightRates;
}
