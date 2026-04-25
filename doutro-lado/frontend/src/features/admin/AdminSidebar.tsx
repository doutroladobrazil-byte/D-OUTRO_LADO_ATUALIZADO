"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BarChart2,
  ShoppingCart,
  Users,
  Mail,
  Tag,
  Package,
  Boxes,
  Layers,
  Gift,
  Image,
  Megaphone,
  Images,
  Globe,
  Truck,
  FileText,
  CircleDollarSign,
  Settings,
  ExternalLink,
  CreditCard,
  Menu,
  X,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  external?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Visão geral",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
    ],
  },
  {
    label: "Comercial",
    items: [
      { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/customers", label: "Clientes", icon: Users },
      { href: "/admin/leads", label: "Leads", icon: Mail },
      { href: "/admin/offers", label: "Cupons & Ofertas", icon: Tag },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/products", label: "Produtos", icon: Package },
      { href: "/admin/inventory", label: "Estoque", icon: Boxes },
      { href: "/admin/categories", label: "Categorias", icon: Layers },
      { href: "/admin/gift-kits", label: "Gift Kits", icon: Gift },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { href: "/admin/content", label: "Conteúdo", icon: Layers },
      { href: "/admin/creatives", label: "Criativos", icon: Image },
      { href: "/admin/campaigns", label: "Campanhas", icon: Megaphone },
      { href: "/admin/media", label: "Biblioteca de Mídia", icon: Images },
    ],
  },
  {
    label: "Internacional",
    items: [
      { href: "/admin/countries", label: "Países & Mercados", icon: Globe },
      { href: "/admin/shipping", label: "Logística", icon: Truck },
      { href: "/admin/fiscal", label: "Fiscal", icon: FileText },
      { href: "/admin/currencies", label: "Moedas & Câmbio", icon: CircleDollarSign },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/settings", label: "Configurações", icon: Settings },
    ],
  },
];

const FOOTER_LINKS: NavItem[] = [
  { href: "/brands/moda", label: "Ver loja", icon: ExternalLink, external: true },
  { href: "/brands/moda/checkout", label: "Ver checkout", icon: CreditCard, external: true },
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
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu admin"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/70 backdrop-blur-xl transition hover:bg-white/8 hover:text-white md:hidden"
      >
        <Menu size={16} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[260px] shrink-0 flex-col border-r border-white/8 bg-black/90 px-3 py-6 backdrop-blur-2xl transition-transform duration-300
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
        <div className="border-b border-white/8 px-2 pb-5">
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/30">Admin</p>
          <p className="mt-1 font-display text-[22px] tracking-[-0.3px] text-white">D'OUTRO LADO</p>
          <p className="mt-1 truncate text-[11px] text-white/35">{email}</p>
        </div>

        {/* Nav groups */}
        <nav
          aria-label="Navegação administrativa"
          className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[9px] font-semibold uppercase tracking-[0.36em] text-white/22">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-[12px] px-3 py-2 text-[13px] transition-all duration-150 ${
                        active
                          ? "border border-[#C6A96B]/20 bg-[rgba(198,169,107,0.1)] text-[#C6A96B]"
                          : "border border-transparent text-white/45 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <Icon size={15} className="shrink-0" />
                      <span className="truncate tracking-[0.01em]">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer — external links + user info */}
        <div className="mt-4 space-y-1 border-t border-white/8 pt-4">
          {FOOTER_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3 rounded-[12px] px-3 py-2 text-[12px] text-white/30 transition hover:bg-white/[0.03] hover:text-white/55"
              >
                <Icon size={13} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="px-3 pt-2">
            <p className="text-[10px] text-white/22">{name}</p>
            <Link href="/" className="mt-0.5 block text-[11px] text-white/30 hover:text-white/55">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
