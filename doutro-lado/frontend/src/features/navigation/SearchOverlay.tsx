"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { products } from "@/lib/mock-data";
import { searchSuggestions } from "@/styles/tokens";
import { useUiStore } from "./ui-store";

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUiStore();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products.slice(0, 4);
    return products.filter((product) =>
      [product.name, product.category, product.material].some((field) =>
        field.toLowerCase().includes(normalized)
      )
    );
  }, [query]);

  return (
    <AnimatePresence>
      {searchOpen ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed inset-0 z-[80] bg-black/95 px-6 py-10 backdrop-blur-2xl"
        >
          <div className="mx-auto flex h-full max-w-5xl flex-col gap-8">
            <div className="flex items-center justify-between">
              <p className="text-[13px] uppercase tracking-[0.28em] text-white/45">Pesquisa editorial</p>
              <button
                onClick={closeSearch}
                className="rounded-full border border-white/10 p-3 text-white/70 transition hover:-translate-y-0.5 hover:bg-white/8 hover:text-white"
                aria-label="Fechar busca"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-6 top-1/2 size-5 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar produtos, materiais, colecoes e presentes"
                className="w-full rounded-[28px] border border-white/10 bg-white/[0.06] py-6 pl-16 pr-6 text-2xl text-white outline-none transition placeholder:text-white/25 focus:border-gold/60"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {searchSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-gold/50 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {results.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.28 }}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="mb-4 aspect-[1.2/1] rounded-[20px] bg-[radial-gradient(circle_at_top,rgba(198,169,107,0.18),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))]" />
                  <p className="text-[13px] uppercase tracking-[0.24em] text-white/45">{product.category}</p>
                  <h3 className="mt-3 font-display text-[28px] tracking-[-0.5px] text-white">{product.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/58">{product.shortDescription}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
