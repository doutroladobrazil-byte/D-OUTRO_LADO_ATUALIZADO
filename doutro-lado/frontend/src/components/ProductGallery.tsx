"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductMedia } from "@/lib/types";

type Props = {
  media?: ProductMedia[];
  name: string;
};

/**
 * ProductGallery — Stage 2 media component.
 *
 * Renders a premium gallery with:
 * - One large main view (image or video)
 * - Scrollable thumbnail strip
 * - Click-to-swap interaction
 * - Graceful no-media fallback
 * - Brand-neutral, fully dark-mode compatible
 */
export function ProductGallery({ media = [], name }: Props) {
  const ordered = [...media].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.position - b.position;
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const active = ordered[activeIdx] ?? null;

  // ── No-media fallback ────────────────────────────────────────────────────
  if (!active) {
    return (
      <div className="flex flex-col gap-4 md:grid md:gap-6 md:grid-cols-[1fr_0.34fr]">
        <div
          aria-label={`Imagem de ${name}`}
          className="relative min-h-[300px] overflow-hidden rounded-[24px] border border-white/10 md:min-h-[560px] lg:min-h-[720px]
            bg-[radial-gradient(circle_at_top,rgba(198,169,107,0.16),transparent_30%),
            linear-gradient(135deg,rgba(255,255,255,0.1),rgba(0,0,0,0.75))]"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-xs uppercase tracking-[0.22em]">Sem imagem</span>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:gap-4 md:overflow-x-hidden md:pb-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 w-20 shrink-0 rounded-[16px] border border-white/8 bg-white/[0.03] md:h-auto md:w-auto md:min-h-[160px]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:grid md:gap-6 md:grid-cols-[1fr_0.34fr]">
      {/* ── Main view ──────────────────────────────────────────────────── */}
      <div className="relative min-h-[300px] overflow-hidden rounded-[24px] border border-white/10 bg-black/60 md:min-h-[560px] lg:min-h-[720px]">
        {active.asset.mediaType === "video" ? (
          <video
            key={active.asset.publicUrl}
            className="h-full w-full object-cover"
            controls
            poster={active.asset.posterUrl ?? undefined}
            preload="metadata"
            aria-label={active.asset.caption ?? active.asset.altText ?? `Vídeo de ${name}`}
          >
            <source src={active.asset.publicUrl} type={active.asset.mimeType ?? "video/mp4"} />
          </video>
        ) : (
          <Image
            src={active.asset.publicUrl}
            alt={active.asset.altText ?? name}
            fill
            className="object-cover transition-opacity duration-500"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority={activeIdx === 0}
          />
        )}

        {/* Caption overlay */}
        {active.asset.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-5 pt-10">
            <p className="text-[13px] text-white/70">{active.asset.caption}</p>
          </div>
        )}

        {/* Media type badge */}
        {active.asset.mediaType === "video" && (
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-gold" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/70">Vídeo</span>
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ────────────────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto pb-1 md:flex-col md:gap-4 md:overflow-x-hidden md:overflow-y-auto md:pb-0" style={{ maxHeight: "var(--gallery-thumbs-max, none)" }}>
        {ordered.map((item, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={item.id}
              onClick={() => setActiveIdx(idx)}
              aria-label={item.asset.altText ?? `Mídia ${idx + 1}`}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[16px] border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 md:h-auto md:min-h-[160px] md:w-full md:rounded-[20px] lg:min-h-[220px] ${
                isActive
                  ? "border-gold/60 shadow-[0_0_0_2px_rgba(198,169,107,0.25)]"
                  : "border-white/8 hover:border-white/20"
              } bg-black/50`}
            >
              {item.asset.mediaType === "video" ? (
                item.asset.posterUrl ? (
                  <Image
                    src={item.asset.posterUrl}
                    alt={item.asset.altText ?? `Vídeo ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="20vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )
              ) : (
                <Image
                  src={item.asset.publicUrl}
                  alt={item.asset.altText ?? `Imagem ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="20vw"
                />
              )}

              {/* Primary badge */}
              {item.isPrimary && (
                <div className="absolute right-2 top-2 rounded-full bg-gold/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-black">
                  Principal
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
