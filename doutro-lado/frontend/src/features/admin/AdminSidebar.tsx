"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/customers", label: "Usuários", icon: Users },
  { href: "/admin/inventory", label: "Estoque", icon: Boxes },
  { href: "/admin/shipping", label: "Logística", icon: Truck },
  { href: "/admin/fiscal", label: "Fiscal", icon: FileText },
  { href: "/admin/content", label: "Conteúdo", icon: Layers },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

type Props = { email: string; name: string };

export function AdminSidebar({ email, name }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-white/8 bg-black/40 px-4 py-6 backdrop-blur-2xl">
      {/* Brand mark */}
      <div className="px-2 pb-6 border-b border-white/8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-white/30">Admin</p>
        <p className="mt-1 font-display text-[22px] tracking-[-0.3px] text-white">D'OUTRO LADO</p>
        <p className="mt-1 truncate text-[11px] text-white/35">{email}</p>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm transition-all duration-200 ${
                active
                  ? "bg-[rgba(198,169,107,0.1)] text-[#C6A96B] border border-[#C6A96B]/20"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white border border-transparent"
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="tracking-[0.02em]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 pt-4 px-2">
        <p className="text-[10px] text-white/25">{name}</p>
        <Link href="/" className="mt-1 block text-[11px] text-white/35 hover:text-white/60">
          ← Voltar ao site
        </Link>
      </div>
    </aside>
  );
}
