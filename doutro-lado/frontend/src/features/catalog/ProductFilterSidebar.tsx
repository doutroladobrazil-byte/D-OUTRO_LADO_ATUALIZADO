"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { type Brand } from "@/lib/types";

type ProductFilterSidebarProps = {
  brandMode?: Brand;
};

const CASA_CATEGORIES = ["Ceramica Artesanal", "Mesa Posta", "Decoracao", "Linho e Fibras"];
const MODA_CATEGORIES = ["Bolsas Couro", "Cintos", "Sapatos", "Acessorios"];

const SORTS = [
  { value: "newest", label: "Mais recentes" },
  { value: "price_asc", label: "Menor preco" },
  { value: "price_desc", label: "Maior preco" },
];

export function ProductFilterSidebar({ brandMode }: ProductFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");
  const currentSort = searchParams.get("sort") || "newest";

  const categories = brandMode === "casa" ? CASA_CATEGORIES : brandMode === "moda" ? MODA_CATEGORIES : [...CASA_CATEGORIES, ...MODA_CATEGORIES];

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isLight = brandMode !== "moda"; // default or casa = light theme accents, moda = dark accents

  return (
    <aside className="sticky top-20 hidden space-y-10 lg:block">
      <div className="space-y-4">
        <h3 className={`text-[12px] uppercase tracking-[0.2em] font-semibold ${isLight ? "text-black/50" : "text-white/50"}`}>
          Categorias
        </h3>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => updateParam("category", null)}
              className={`text-[14px] transition-colors ${
                !currentCategory
                  ? (isLight ? "font-medium text-black" : "font-medium text-white")
                  : (isLight ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white")
              }`}
            >
              Ver Todas
            </button>
          </li>
          {categories.map((cat) => {
            const isActive = currentCategory?.toLowerCase() === cat.toLowerCase();
            return (
              <li key={cat}>
                <button
                  onClick={() => updateParam("category", isActive ? null : cat)}
                  className={`text-[14px] transition-colors ${
                    isActive
                      ? (isLight ? "font-medium text-black" : "font-medium text-white")
                      : (isLight ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white")
                  }`}
                >
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className={`text-[12px] uppercase tracking-[0.2em] font-semibold ${isLight ? "text-black/50" : "text-white/50"}`}>
          Ordenar por
        </h3>
        <ul className="space-y-3">
          {SORTS.map((sort) => {
            const isActive = currentSort === sort.value;
            return (
              <li key={sort.value}>
                <button
                  onClick={() => updateParam("sort", sort.value)}
                  className={`text-[14px] transition-colors ${
                    isActive
                      ? (isLight ? "font-medium text-black" : "font-medium text-white")
                      : (isLight ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white")
                  }`}
                >
                  {sort.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
