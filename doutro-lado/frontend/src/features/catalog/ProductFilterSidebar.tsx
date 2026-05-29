"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type CategoryItem = { slug: string; label: string };
type SortItem = { value: string; label: string };

const CATEGORIES: CategoryItem[] = [
  { slug: "leather-bags", label: "Leather Bags" },
  { slug: "small-leather-goods", label: "Small Leather Goods" },
  { slug: "shoes", label: "Shoes" },
  { slug: "accessories", label: "Accessories" },
];

const SORTS: SortItem[] = [
  { value: "new", label: "New In" },
  { value: "best-sellers", label: "Best Sellers" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export function ProductFilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");
  const currentSort = searchParams.get("sort");

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
      // Selecting a category clears sort and vice versa to avoid contradictions
      if (key === "category") params.delete("sort");
      if (key === "sort") params.delete("category");
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <aside className="sticky top-20 hidden space-y-10 lg:block">
      <div className="space-y-4">
        <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-white/50">
          Categories
        </h3>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => updateParam("category", null)}
              className={`text-[14px] transition-colors ${
                !currentCategory
                  ? "font-medium text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              All
            </button>
          </li>
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.slug;
            return (
              <li key={cat.slug}>
                <button
                  onClick={() => updateParam("category", isActive ? null : cat.slug)}
                  className={`text-[14px] transition-colors ${
                    isActive
                      ? "font-medium text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-white/50">
          Sort by
        </h3>
        <ul className="space-y-3">
          {SORTS.map((sort) => {
            const isActive = currentSort === sort.value;
            return (
              <li key={sort.value}>
                <button
                  onClick={() => updateParam("sort", isActive ? null : sort.value)}
                  className={`text-[14px] transition-colors ${
                    isActive
                      ? "font-medium text-white"
                      : "text-white/60 hover:text-white"
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
