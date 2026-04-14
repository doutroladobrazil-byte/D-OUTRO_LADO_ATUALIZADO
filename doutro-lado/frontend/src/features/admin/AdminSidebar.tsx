"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  Truck,
  FileText,
  BarChart2,
  Settings,
  Layers,
  Globe,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/customers", label: "Usuários", icon: Users },
  { href: "/admin/inventory", label: "Estoque", icon: Boxes },
  { href: "/admin/shipping", label: "Logística", icon: Truck },
  { href: "/admin/countries", label: "Países", icon: Globe },
  { href: "/admin/fiscal", label: "Fiscal", icon: FileText },
  { href: "/admin/content", label: "Conteúdo", icon: Layers },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

type Props = { email: string; name: string };

export function AdminSidebar({ email, name }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile hamburger trigger — visible only on mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu admin"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/70 backdrop-blur-xl transition hover:bg-white/8 hover:text-white md:hidden"
      >
        <Menu size={16} />
      </button>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[260px] shrink-0 flex-col border-r border-white/8 bg-black/90 px-4 py-6 backdrop-blur-2xl transition-transform duration-300
          md:sticky md:translate-x-0 md:bg-black/40
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
          className="absolute right-3 top-3 rounded-full border border-white/10 p-2 text-white/50 transition hover:bg-white/8 hover:text-white md:hidden"
        >
          <X size={14} />
        </button>

        {/* Brand mark */}
        <div className="border-b border-white/8 px-2 pb-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/30">Admin</p>
          <p className="mt-1 font-display text-[22px] tracking-[-0.3px] text-white">D'OUTRO LADO</p>
          <p className="mt-1 truncate text-[11px] text-white/35">{email}</p>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm transition-all duration-200 ${
                  active
                    ? "border border-[#C6A96B]/20 bg-[rgba(198,169,107,0.1)] text-[#C6A96B]"
                    : "border border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="tracking-[0.02em]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/8 px-2 pt-4">
          <p className="text-[10px] text-white/25">{name}</p>
          <Link href="/" className="mt-1 block text-[11px] text-white/35 hover:text-white/60">
            ← Voltar ao site
          </Link>
        </div>
      </aside>
    </>
  );
}
