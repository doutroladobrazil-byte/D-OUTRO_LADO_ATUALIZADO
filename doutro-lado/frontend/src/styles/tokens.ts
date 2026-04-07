import type { Brand } from "@/lib/types";

export const navLinks = [
  { href: "/brands/casa", label: "Casa" },
  { href: "/brands/moda", label: "Moda" },
  { href: "/gift-builder", label: "Montar kit" },
  { href: "/wholesale", label: "Atacado" },
  { href: "/international-shipping", label: "Envio internacional" }
] as const;

export const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/customers", label: "Usuarios" },
  { href: "/admin/inventory", label: "Estoque" },
  { href: "/admin/shipping", label: "Logistica" },
  { href: "/admin/fiscal", label: "Fiscal" },
  { href: "/admin/content", label: "Conteudo" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Configuracoes" }
] as const;

export const brandThemes: Record<Brand, { surface: string; accent: string; subtle: string; label: string }> = {
  casa: {
    surface:
      "border-white/10 bg-[linear-gradient(160deg,rgba(245,245,245,0.16),rgba(12,12,12,0.82))] text-[#F5F5F5]",
    accent: "bg-[#ECECEC] text-[#17120d]",
    subtle: "text-[#E8E8E8]",
    label: "Casa / Ceramica / Decoracao"
  },
  moda: {
    surface:
      "border-white/16 bg-[linear-gradient(160deg,rgba(236,236,236,0.08),rgba(0,0,0,0.88))] text-[#F5F5F5]",
    accent: "bg-gold text-black",
    subtle: "text-[#DFDFDF]",
    label: "Moda / Couro / Acessorios"
  }
};

export const searchSuggestions = [
  "Ceramicas esculturais",
  "Bolsas em couro premium",
  "Kits corporativos internacionais",
  "Presentes editoriais"
];
