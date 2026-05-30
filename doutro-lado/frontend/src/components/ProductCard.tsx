"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { getBrandCartPath } from "@/lib/brand";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

type ProductCardDict = { from: string; viewProduct: string };

export function ProductCard({
  product,
  brandMode = product.brand,
  dict,
}: {
  product: Product;
  brandMode?: Product["brand"];
  dict?: ProductCardDict;
}) {
  const primaryMedia = product.media?.[0] ?? null;
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
      className="group overflow-hidden rounded-[24px] border border-ink-ghost/30 bg-white shadow-luxe-light"
    >
      <div className="relative aspect-[0.82] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(242,237,230,0.9),transparent_50%),linear-gradient(135deg,rgba(250,248,245,0.85),rgba(200,186,165,0.45))]">
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
        {/* Gradient overlay — ensures badge text readability over photo */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(28,23,18,0.42))]" />
        {/* Video indicator */}
        {primaryMedia?.asset.mediaType === "video" && !primaryMedia.asset.posterUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-canvas/20 bg-noir/40">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity={0.8}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
          <span className="rounded-full border border-canvas/30 bg-canvas/75 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-ink/80">
            {product.badge ?? product.category}
          </span>
          <span className="text-sm text-canvas/75">{product.weightRange}</span>
        </div>
      </div>
      <div className="space-y-4 p-4 md:p-6">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.26em] text-ink-soft">{product.category}</p>
          <h3 className="font-display text-[20px] leading-[1.08] tracking-[-0.5px] text-ink md:text-[28px]">{product.name}</h3>
          <p className="text-sm leading-6 text-ink-mid">{product.shortDescription}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-ink-soft">{dict?.from ?? "From"}</p>
            <PriceDisplay brl={product.retailPriceBRL} className="text-lg text-ink" />
          </div>
          <Link
            href={`/products/${product.slug}?site=${brandMode}&next=${encodeURIComponent(getBrandCartPath(brandMode))}`}
            className="rounded-full border border-ink-ghost/40 px-4 py-3 text-sm uppercase tracking-[0.18em] text-ink-mid transition duration-300 hover:-translate-y-0.5 hover:border-leather/60 hover:text-leather"
          >
            {dict?.viewProduct ?? "View product"}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
