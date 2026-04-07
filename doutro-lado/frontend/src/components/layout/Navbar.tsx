"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Menu, ShoppingBag, UserRound } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/features/navigation/ui-store";
import { getBrandCartPath, getBrandFromPath, isBrand } from "@/lib/brand";
import { CurrencySwitcher } from "@/components/ui/PriceDisplay";

function IconControl({
  href,
  label,
  active,
  children
}: {
  href: string;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full border text-white/75 transition duration-300 hover:-translate-y-0.5 hover:text-white",
        active ? "border-gold/50 bg-gold/12 text-white" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
      )}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toggleMobileMenu = useUiStore((state) => state.toggleMobileMenu);
  const brandFromPath = getBrandFromPath(pathname);
  const siteParam = searchParams.get("site");
  const currentBrand = brandFromPath ?? (siteParam && isBrand(siteParam) ? siteParam : null);
  const cartHref = currentBrand ? getBrandCartPath(currentBrand) : "/cart";

  return (
    <div className="border-b border-white/8 bg-black/40 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-[72px] max-w-luxe items-center justify-between gap-4 px-6 lg:min-h-[78px] lg:px-8">
        <div className="flex items-center justify-start gap-3">
          <motion.button
            whileHover={{ y: -2 }}
            onClick={toggleMobileMenu}
            aria-label="Abrir menu"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/75 transition duration-300 hover:bg-white/[0.08] hover:text-white"
          >
            <Menu className="size-4" />
          </motion.button>
          <IconControl href="/" label="Inicio" active={pathname === "/"}>
            <Home className="size-4" />
          </IconControl>
        </div>

        <div className="flex items-center justify-end gap-3">
          <CurrencySwitcher className="hidden md:flex" />
          <IconControl href="/login" label="Conta" active={pathname.startsWith("/login") || pathname.startsWith("/account")}>
            <UserRound className="size-4" />
          </IconControl>
          <IconControl href={cartHref} label="Carrinho" active={pathname.includes("/cart") || pathname.includes("/checkout")}>
            <ShoppingBag className="size-4" />
          </IconControl>
        </div>
      </div>
    </div>
  );
}
