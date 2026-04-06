"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { getBrandCartPath } from "@/lib/brand";

export function ProductCard({ product, brandMode = product.brand }: { product: Product; brandMode?: Product["brand"] }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] shadow-luxe"
    >
      <div
        className={`relative aspect-[0.82] overflow-hidden ${
          brandMode === "casa"
            ? "bg-[radial-gradient(circle_at_top_left,rgba(245,245,245,0.32),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(217,221,227,0.22),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.1),rgba(8,8,8,0.78))]"
            : "bg-[radial-gradient(circle_at_top,rgba(245,245,245,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(217,221,227,0.16),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.82))]"
        }`}
      >
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.4))]"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.45 }}
        />
        <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
          <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/72">
            {product.badge ?? product.category}
          </span>
          <span className="text-sm text-white/60">{product.weightRange}</span>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.26em] text-white/45">{product.category}</p>
          <h3 className="font-display text-[28px] leading-[1.08] tracking-[-0.5px] text-white">{product.name}</h3>
          <p className="text-sm leading-6 text-white/58">{product.shortDescription}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Desde</p>
            <p className="text-lg text-white">R$ {product.retailPriceBRL.toFixed(2)}</p>
          </div>
          <Link
            href={`/products/${product.slug}?site=${brandMode}&next=${encodeURIComponent(getBrandCartPath(brandMode))}`}
            className="rounded-full border border-white/12 px-4 py-3 text-sm uppercase tracking-[0.18em] text-white transition duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:text-gold"
          >
            Ver produto
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
