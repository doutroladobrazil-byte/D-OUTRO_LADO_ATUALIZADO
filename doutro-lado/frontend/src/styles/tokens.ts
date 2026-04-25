/** Legacy flat nav — kept for backward compatibility. */
export const navLinks = [
  { href: "/brands/moda", label: "Colecoes" },
  { href: "/gift-builder", label: "Montar kit" },
  { href: "/wholesale", label: "Atacado" },
  { href: "/international-shipping", label: "Envio internacional" }
] as const;

/** Grouped public navigation — used by MobileMenu. Keys map to NavDictionary. */
export const publicNavGroups = [
  {
    key: "shop" as const,
    items: [
      { key: "newArrivals" as const, href: "/brands/moda?sort=new" },
      { key: "bestSellers" as const, href: "/brands/moda?sort=best-sellers" },
      { key: "leatherBags" as const, href: "/brands/moda?category=leather-bags" },
      { key: "smallLeatherGoods" as const, href: "/brands/moda?category=small-leather-goods" },
      { key: "shoes" as const, href: "/brands/moda?category=shoes" },
      { key: "accessories" as const, href: "/brands/moda?category=accessories" },
    ],
  },
  {
    key: "services" as const,
    items: [
      { key: "giftBuilder" as const, href: "/gift-builder" },
      { key: "internationalShipping" as const, href: "/international-shipping" },
      { key: "wholesale" as const, href: "/wholesale" },
    ],
  },
  {
    key: "account" as const,
    items: [
      { key: "account" as const, href: "/login" },
      { key: "cart" as const, href: "/brands/moda/cart" },
    ],
  },
];

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

/** Tema unico — D'OUTRO LADO opera moda-only. */
export const modaTheme = {
  surface: "border-white/16 bg-[linear-gradient(160deg,rgba(236,236,236,0.08),rgba(0,0,0,0.88))] text-[#F5F5F5]",
  accent: "bg-gold text-black",
  subtle: "text-[#DFDFDF]",
  label: "Moda / Couro / Acessorios"
};

export const searchSuggestions = [
  "Bolsas em couro premium",
  "Sapatos artesanais",
  "Kits corporativos internacionais",
  "Acessorios exclusivos",
  "Presentes editoriais"
];
