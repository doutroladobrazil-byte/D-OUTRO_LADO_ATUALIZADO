import { Suspense } from "react";
import Link from "next/link";
import { Home, Menu, ShoppingBag, UserRound } from "lucide-react";
import { MobileMenu } from "@/features/navigation/MobileMenu";
import { SearchOverlay } from "@/features/navigation/SearchOverlay";
import { Navbar } from "./Navbar";

function BrandBar() {
  return (
    <div className="border-b border-white/8 bg-black/50 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-[88px] max-w-luxe items-center justify-center px-6 text-center lg:min-h-[104px] lg:px-8">
        <Link href="/" className="block">
          <p className="text-[10px] uppercase tracking-[0.38em] text-white/32 lg:text-[11px]">International premium house</p>
          <h1 className="mt-2 font-display text-[30px] tracking-[0.24em] text-white lg:text-[38px]">D&apos;OUTRO LADO</h1>
        </Link>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <BrandBar />
        <Suspense fallback={<div className="border-b border-white/8 bg-black/40"><div className="mx-auto min-h-[72px] max-w-luxe px-6 lg:min-h-[78px] lg:px-8" /></div>}>
          <Navbar />
        </Suspense>
      </header>
      <SearchOverlay />
      <MobileMenu />
    </>
  );
}

export const HeaderIcons = {
  Menu,
  Home,
  UserRound,
  ShoppingBag
};
