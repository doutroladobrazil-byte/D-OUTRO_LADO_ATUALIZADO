import type { Brand } from "@/lib/types";

export function getBrandData(brand: Brand) {
  // D'OUTRO LADO opera exclusivamente no universo moda.
  // O argumento brand e mantido na assinatura por compatibilidade interna.
  return {
    title: "Couro, moda e acessorios com presenca editorial internacional.",
    subtitle:
      "Uma linguagem densa, precisa e exclusiva para colecoes premium, presentes corporativos e wardrobes export-ready.",
    themeLabel: "Moda / Editorial / Leather",
    accentClass: "from-white/32 via-[#D9DDE3]/16 to-transparent"
  };
}

/**
 * Valida se o valor e uma brand conhecida.
 * Inclui "casa" por compatibilidade com dados historicos, mas
 * rotas publicas com brand=casa sao redirecionadas para moda.
 */
export function isBrand(value: string): value is Brand {
  return value === "casa" || value === "moda";
}

/** @deprecated O site opera moda-only. Nao ha sibling brand. Mantido por compatibilidade. */
export function getSiblingBrand(_brand: Brand): Brand {
  return "moda";
}

export function getBrandCheckoutPath(_brand: Brand) {
  return `/brands/moda/checkout`;
}

export function getBrandCartPath(_brand: Brand) {
  return `/brands/moda/cart`;
}

export function getBrandFromPath(pathname: string): Brand | null {
  if (pathname.includes("/brands/") || pathname.includes("/categories/")) return "moda";
  return null;
}
