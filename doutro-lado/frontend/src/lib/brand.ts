import type { Brand } from "@/lib/types";

/**
 * Valida se o valor e uma brand conhecida no schema.
 * Inclui "casa" por compatibilidade com dados historicos no banco —
 * rotas publicas com brand=casa sao redirecionadas para moda.
 */
export function isBrand(value: string): value is Brand {
  return value === "casa" || value === "moda";
}

export function getBrandCheckoutPath(_brand?: Brand) {
  return `/brands/moda/checkout`;
}

export function getBrandCartPath(_brand?: Brand) {
  return `/brands/moda/cart`;
}

export function getBrandFromPath(pathname: string): Brand | null {
  if (pathname.includes("/brands/") || pathname.includes("/categories/")) return "moda";
  return null;
}
