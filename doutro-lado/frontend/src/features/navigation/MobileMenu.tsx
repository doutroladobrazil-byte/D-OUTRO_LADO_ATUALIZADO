"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingBag, X, ArrowRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUiStore } from "./ui-store";
import { publicNavGroups } from "@/styles/tokens";
import { getNavDictionary } from "@/lib/i18n/navigation";
import { useLocale } from "@/contexts/LocaleContext";
import { MobileMenuAnalytics } from "@/lib/analytics";
import type { AppLocale } from "@/lib/i18n/common";

// Map SupportedLanguage → AppLocale (ar not in AppLocale → fallback en)
function toAppLocale(lang: string): AppLocale {
  if (lang === "pt" || lang === "de" || lang === "fr") return lang;
  return "en";
}

export function MobileMenu() {
  const { mobileMenuOpen, closeMobileMenu, openSearch } = useUiStore();
  const { language } = useLocale();
  const dict = getNavDictionary(toAppLocale(language));
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isActive(href: string): boolean {
    const [path, qs] = href.split("?");
    if (pathname !== path) return false;
    if (!qs) return true;
    const params = new URLSearchParams(qs);
    for (const [k, v] of params.entries()) {
      if (searchParams.get(k) !== v) return false;
    }
    return true;
  }

  function handleLinkClick(label: string) {
    MobileMenuAnalytics.linkClick(label);
    closeMobileMenu();
  }

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[75] bg-black/90 px-4 py-4 backdrop-blur-2xl sm:px-6 sm:py-6"
          role="dialog"
          aria-modal="true"
          aria-label={dict.menu}
        >
          <div className="mx-auto flex h-full max-w-luxe flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.55))] shadow-halo">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-6 py-5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
                {dict.menu}
              </p>
              <button
                onClick={() => {
                  MobileMenuAnalytics.close();
                  closeMobileMenu();
                }}
                aria-label={dict.closeMenu}
                className="rounded-full border border-white/10 p-2.5 text-white/60 transition hover:bg-white/8 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable nav body */}
            <nav
              aria-label="Navegação principal"
              className="flex-1 overflow-y-auto px-6 py-5"
            >
              {publicNavGroups.map((group) => (
                <div key={group.key} className="mb-6">
                  <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.38em] text-white/25">
                    {dict.groups[group.key]}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const label = dict.items[item.key];
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => handleLinkClick(label)}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center justify-between rounded-[16px] border px-4 py-3 font-display text-[22px] tracking-[-0.3px] transition duration-200 hover:-translate-y-0.5 sm:text-[26px] ${
                            active
                              ? "border-gold/30 bg-[rgba(198,169,107,0.08)] text-[#C6A96B]"
                              : "border-white/8 bg-white/[0.02] text-white hover:border-gold/25 hover:bg-white/[0.04]"
                          }`}
                        >
                          {label}
                          {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* CTA — Join Private Drop List */}
              <div className="mt-2">
                <Link
                  href="/#drop-list"
                  onClick={() => {
                    MobileMenuAnalytics.dropListClick();
                    closeMobileMenu();
                  }}
                  className="flex w-full items-center justify-between rounded-[16px] border border-gold/25 bg-[rgba(198,169,107,0.06)] px-5 py-4 text-sm uppercase tracking-[0.2em] text-gold transition hover:bg-[rgba(198,169,107,0.12)]"
                >
                  {dict.items.joinDropList}
                  <ArrowRight className="size-4 shrink-0" />
                </Link>
              </div>
            </nav>

            {/* Footer actions */}
            <div className="shrink-0 border-t border-white/8 px-6 py-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    MobileMenuAnalytics.searchClick();
                    closeMobileMenu();
                    openSearch();
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-[14px] border border-white/10 py-3 text-white/50 transition hover:bg-white/[0.04] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                >
                  <Search className="size-4" />
                  <span className="text-[10px] uppercase tracking-[0.18em]">{dict.items.search}</span>
                </button>

                <Link
                  href="/brands/moda?sort=new"
                  onClick={() => handleLinkClick("shopNewArrivals")}
                  className="flex flex-col items-center gap-1.5 rounded-[14px] border border-gold/20 bg-gold/[0.06] py-3 text-gold/80 transition hover:bg-gold/[0.12] hover:text-gold"
                >
                  <ArrowRight className="size-4" />
                  <span className="text-[10px] uppercase tracking-[0.14em]">{dict.items.shopNewArrivals}</span>
                </Link>

                <Link
                  href="/brands/moda/cart"
                  onClick={() => {
                    MobileMenuAnalytics.cartClick();
                    closeMobileMenu();
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-[14px] border border-white/10 py-3 text-white/50 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <ShoppingBag className="size-4" />
                  <span className="text-[10px] uppercase tracking-[0.18em]">{dict.items.cart}</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
