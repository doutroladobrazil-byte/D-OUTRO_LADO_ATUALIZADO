"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { navLinks } from "@/styles/tokens";
import { useUiStore } from "./ui-store";

export function MobileMenu() {
  const { mobileMenuOpen, closeMobileMenu, openSearch } = useUiStore();

  return (
    <AnimatePresence>
      {mobileMenuOpen ? (
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="fixed inset-0 z-[75] bg-black/90 px-6 py-6 backdrop-blur-2xl"
        >
          <div className="mx-auto flex h-full max-w-luxe flex-col rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.55))] p-6 shadow-halo">
            <div className="flex items-center justify-between border-b border-white/8 pb-5">
              <p className="text-[12px] uppercase tracking-[0.28em] text-white/42">Menu</p>
              <button
                onClick={closeMobileMenu}
                aria-label="Fechar menu"
                className="rounded-full border border-white/10 p-3 text-white/70 transition hover:bg-white/8 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-8 space-y-3">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="block rounded-[20px] border border-white/8 bg-white/[0.03] px-5 py-4 font-display text-[28px] tracking-[-0.5px] text-white transition duration-300 hover:-translate-y-0.5 hover:border-gold/35"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => {
                  closeMobileMenu();
                  openSearch();
                }}
                className="flex items-center justify-center gap-3 rounded-full border border-white/10 px-5 py-4 text-sm uppercase tracking-[0.18em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/8"
              >
                <Search className="size-4" />
                Buscar
              </button>
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center justify-center rounded-full border border-gold bg-gold px-5 py-4 text-sm uppercase tracking-[0.18em] text-black transition duration-300 hover:-translate-y-0.5"
              >
                Inicio
              </Link>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
