import type { AppLocale } from "@/lib/i18n/common";

export type NavDictionary = {
  menu: string;
  closeMenu: string;
  groups: {
    shop: string;
    services: string;
    account: string;
  };
  items: {
    newArrivals: string;
    bestSellers: string;
    leatherBags: string;
    smallLeatherGoods: string;
    shoes: string;
    accessories: string;
    giftBuilder: string;
    internationalShipping: string;
    wholesale: string;
    account: string;
    cart: string;
    joinDropList: string;
    search: string;
    shopNewArrivals: string;
  };
};

const dicts: Record<AppLocale, NavDictionary> = {
  en: {
    menu: "Menu",
    closeMenu: "Close menu",
    groups: { shop: "Shop", services: "Services", account: "Account" },
    items: {
      newArrivals: "New Arrivals",
      bestSellers: "Best Sellers",
      leatherBags: "Leather Bags",
      smallLeatherGoods: "Small Leather Goods",
      shoes: "Shoes",
      accessories: "Accessories",
      giftBuilder: "Gift Builder",
      internationalShipping: "International Shipping",
      wholesale: "Wholesale",
      account: "Account",
      cart: "Cart",
      joinDropList: "Join Private Drop List",
      search: "Search",
      shopNewArrivals: "Shop New Arrivals",
    },
  },
  pt: {
    menu: "Menu",
    closeMenu: "Fechar menu",
    groups: { shop: "Comprar", services: "Serviços", account: "Conta" },
    items: {
      newArrivals: "Novidades",
      bestSellers: "Mais vendidos",
      leatherBags: "Bolsas de couro",
      smallLeatherGoods: "Pequenos artigos de couro",
      shoes: "Sapatos",
      accessories: "Acessórios",
      giftBuilder: "Gift Builder",
      internationalShipping: "Envio internacional",
      wholesale: "Atacado",
      account: "Conta",
      cart: "Carrinho",
      joinDropList: "Entrar na lista privada",
      search: "Buscar",
      shopNewArrivals: "Ver novidades",
    },
  },
  de: {
    menu: "Menü",
    closeMenu: "Menü schließen",
    groups: { shop: "Shop", services: "Services", account: "Konto" },
    items: {
      newArrivals: "Neuheiten",
      bestSellers: "Bestseller",
      leatherBags: "Ledertaschen",
      smallLeatherGoods: "Kleine Lederwaren",
      shoes: "Schuhe",
      accessories: "Accessoires",
      giftBuilder: "Geschenk-Builder",
      internationalShipping: "Internationaler Versand",
      wholesale: "Großhandel",
      account: "Konto",
      cart: "Warenkorb",
      joinDropList: "Privater Drop-Liste beitreten",
      search: "Suche",
      shopNewArrivals: "Neuheiten entdecken",
    },
  },
  fr: {
    menu: "Menu",
    closeMenu: "Fermer le menu",
    groups: { shop: "Boutique", services: "Services", account: "Compte" },
    items: {
      newArrivals: "Nouveautés",
      bestSellers: "Meilleures ventes",
      leatherBags: "Sacs en cuir",
      smallLeatherGoods: "Petite maroquinerie",
      shoes: "Chaussures",
      accessories: "Accessoires",
      giftBuilder: "Créateur de cadeaux",
      internationalShipping: "Livraison internationale",
      wholesale: "Vente en gros",
      account: "Compte",
      cart: "Panier",
      joinDropList: "Rejoindre la liste privée",
      search: "Rechercher",
      shopNewArrivals: "Voir les nouveautés",
    },
  },
};

export function getNavDictionary(locale: AppLocale): NavDictionary {
  return dicts[locale] ?? dicts.en;
}
