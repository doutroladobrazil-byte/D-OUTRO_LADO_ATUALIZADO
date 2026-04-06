"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { homeSliderItems } from "./slider-content";

export function UniverseSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = homeSliderItems[activeIndex];

  function goToPrevious() {
    setActiveIndex((current) => (current === 0 ? homeSliderItems.length - 1 : current - 1));
  }

  function goToNext() {
    setActiveIndex((current) => (current === homeSliderItems.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-[#101010] shadow-halo">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
          >
            <Link href={activeSlide.href} className="group block">
              <div className="relative min-h-[580px]">
                <Image
                  src={activeSlide.imageSrc}
                  alt={activeSlide.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.38)_44%,rgba(0,0,0,0.22)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.18)_26%,rgba(0,0,0,0.58)_100%)]" />

                <div className="relative flex min-h-[580px] flex-col justify-between p-8 md:p-12">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-[13px] uppercase tracking-[0.26em] text-white/72 backdrop-blur-xl">
                      {activeSlide.eyebrow}
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/14 bg-black/25 text-white/82 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-[#C6A96B] group-hover:text-[#C6A96B]">
                      <ArrowUpRight className="size-5" />
                    </div>
                  </div>

                  <div className="grid gap-8 xl:grid-cols-[0.95fr_0.45fr] xl:items-end">
                    <div className="max-w-3xl space-y-5">
                      <h3 className="font-display text-[46px] leading-[1.02] tracking-[-0.5px] text-white md:text-[66px]">
                        {activeSlide.title}
                      </h3>
                      <p className="max-w-2xl text-base leading-8 text-white/72 md:text-[17px]">
                        {activeSlide.description}
                      </p>
                      <div className="inline-flex rounded-full border border-white/16 bg-white/[0.08] px-5 py-3 text-sm uppercase tracking-[0.18em] text-white transition duration-300 group-hover:border-[#C6A96B] group-hover:text-[#C6A96B]">
                        {activeSlide.ctaLabel}
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-white/12 bg-black/28 p-5 backdrop-blur-xl">
                      <p className="text-[12px] uppercase tracking-[0.26em] text-white/45">Slider configuravel</p>
                      <p className="mt-4 text-sm leading-7 text-white/64">
                        Este bloco ja esta preparado para trocar imagem, copy, CTA e destino via configuracao de dados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <button
            onClick={goToPrevious}
            aria-label="Slide anterior"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/32 text-white/80 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#C6A96B] hover:text-[#C6A96B]"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            onClick={goToNext}
            aria-label="Próximo slide"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/32 text-white/80 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#C6A96B] hover:text-[#C6A96B]"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {homeSliderItems.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setActiveIndex(index)}
            className={`group relative overflow-hidden rounded-[24px] border text-left transition duration-300 ${
              index === activeIndex
                ? "border-[#C6A96B] bg-white/[0.08] shadow-halo"
                : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20"
            }`}
          >
            <div className="relative h-[168px]">
              <Image src={slide.imageSrc} alt={slide.imageAlt} fill className="object-cover opacity-92" sizes="(max-width: 1280px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.62))]" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[12px] uppercase tracking-[0.24em] text-white/55">{slide.eyebrow}</p>
                <p className="mt-3 max-w-md font-display text-[28px] leading-[1.05] tracking-[-0.5px] text-white">
                  {slide.title}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
