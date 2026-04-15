"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { getBrandCartPath } from "@/lib/brand";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

export function ProductCard({ product, brandMode = product.brand }: { product: Product; brandMode?: Product["brand"] }) {
  const primaryMedia = product.media?.[0] ?? null;
  // Use image URL directly; for videos, prefer poster_url as card thumbnail
  const cardImageUrl = primaryMedia
    ? (primaryMedia.asset.mediaType === "video"
        ? (primaryMedia.asset.posterUrl ?? null)
        : primaryMedia.asset.publicUrl)
    : null;
  const altText = primaryMedia?.asset.altText ?? product.name;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] shadow-luxe"
    >
      <div className="relative aspect-[0.82] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(245,245,245,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(217,221,227,0.16),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.82))]">
        {cardImageUrl ? (
          <Image
            src={cardImageUrl}
            alt={altText}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : null}
        {/* Gradient overlay — always present so badge text stays readable */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.55))]" />
        {/* Video indicator */}
        {primaryMedia?.asset.mediaType === "video" && !primaryMedia.asset.posterUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/40">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity={0.8}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
          <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/72">
            {product.badge ?? product.category}
          </span>
          <span className="text-sm text-white/60">{product.weightRange}</span>
        </div>
      </div>
      <div className="space-y-4 p-4 md:p-6">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.26em] text-white/45">{product.category}</p>
          <h3 className="font-display text-[20px] leading-[1.08] tracking-[-0.5px] text-white md:text-[28px]">{product.name}</h3>
          <p className="text-sm leading-6 text-white/58">{product.shortDescription}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Desde</p>
            <PriceDisplay brl={product.retailPriceBRL} className="text-lg text-white" />
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
