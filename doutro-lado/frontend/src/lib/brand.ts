import type { Brand } from "@/lib/types";

export function getBrandData(brand: Brand) {
  if (brand === "casa") {
    return {
      title: "Casa, ceramica e decoracao com quiet luxury natural.",
      subtitle:
        "Uma experiencia calma, material e sensorial inspirada em ceramica autoral, linho e objetos para interiores internacionais.",
      themeLabel: "Casa / Editorial / Curadoria",
      accentClass: "from-white/40 via-[#D9DDE3]/20 to-transparent"
    };
  }

  return {
    title: "Couro, moda e acessorios com presenca editorial internacional.",
    subtitle:
      "Uma linguagem mais densa, precisa e exclusiva para colecoes premium, presentes corporativos e wardrobes export-ready.",
    themeLabel: "Moda / Editorial / Leather",
    accentClass: "from-white/32 via-[#D9DDE3]/16 to-transparent"
  };
}

export function isBrand(value: string): value is Brand {
  return value === "casa" || value === "moda";
}

export function getSiblingBrand(brand: Brand): Brand {
  return brand === "casa" ? "moda" : "casa";
}

export function getBrandCheckoutPath(brand: Brand) {
  return `/brands/${brand}/checkout`;
}

export function getBrandCartPath(brand: Brand) {
  return `/brands/${brand}/cart`;
}

export function getBrandFromPath(pathname: string): Brand | null {
  if (pathname.includes("/brands/casa") || pathname.includes("/categories/casa")) return "casa";
  if (pathname.includes("/brands/moda") || pathname.includes("/categories/moda")) return "moda";
  return null;
}
