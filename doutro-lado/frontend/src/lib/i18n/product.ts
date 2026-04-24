// =============================================================================
// Product page + ProductCard + ProductPurchaseActions dictionary — en/de/fr/pt
// =============================================================================

import type { AppLocale } from "./common";

export interface ProductDictionary {
  // ProductCard
  from: string;
  viewProduct: string;
  // ProductPurchaseActions
  addToCart: string;
  buyNow: string;
  secure: string;
  delivery: string;
  returns: string;
  leather: string;
  notAvailable: string;
  // Product detail page labels
  retailPrice: string;
  wholesale: string;
  wholesalePrefix: string;
  wholesaleSuffix: string;
  weight: string;
  weightSuffix: string;
  material: string;
  sku: string;
  shipping: string;
  shippingTitle: string;
  related: string;
  relatedTitle: string;
}

const DICT: Record<AppLocale, ProductDictionary> = {
  en: {
    from: "From",
    viewProduct: "View product",
    addToCart: "Add to cart",
    buyNow: "Buy now",
    secure: "Secure payment",
    delivery: "International delivery",
    returns: "Returns by destination",
    leather: "Brazilian leather",
    notAvailable: "Not available for delivery to your selected destination.",
    retailPrice: "Retail price",
    wholesale: "Wholesale",
    wholesalePrefix: "From",
    wholesaleSuffix: "units",
    weight: "Weight",
    weightSuffix: "estimated at checkout",
    material: "Material",
    sku: "SKU",
    shipping: "International shipping",
    shippingTitle: "Estimated rates by weight and destination.",
    related: "Related",
    relatedTitle: "Continue exploring the collection.",
  },
  de: {
    from: "Ab",
    viewProduct: "Produkt ansehen",
    addToCart: "In den Warenkorb",
    buyNow: "Jetzt kaufen",
    secure: "Sichere Zahlung",
    delivery: "Internationale Lieferung",
    returns: "Rückgabe nach Destination",
    leather: "Brasilianisches Leder",
    notAvailable: "Nicht für die Lieferung an Ihre ausgewählte Destination verfügbar.",
    retailPrice: "Ladenpreis",
    wholesale: "Großhandel",
    wholesalePrefix: "Ab",
    wholesaleSuffix: "Einheiten",
    weight: "Gewicht",
    weightSuffix: "Schätzung beim Checkout",
    material: "Material",
    sku: "SKU",
    shipping: "Internationale Lieferung",
    shippingTitle: "Geschätzte Tarife nach Gewicht und Destination.",
    related: "Ähnliche Produkte",
    relatedTitle: "Kollektion weiter entdecken.",
  },
  fr: {
    from: "À partir de",
    viewProduct: "Voir le produit",
    addToCart: "Ajouter au panier",
    buyNow: "Acheter maintenant",
    secure: "Paiement sécurisé",
    delivery: "Livraison internationale",
    returns: "Retours selon destination",
    leather: "Cuir brésilien",
    notAvailable: "Non disponible pour la livraison vers votre destination sélectionnée.",
    retailPrice: "Prix de vente",
    wholesale: "Grossiste",
    wholesalePrefix: "À partir de",
    wholesaleSuffix: "unités",
    weight: "Poids",
    weightSuffix: "estimé au paiement",
    material: "Matière",
    sku: "SKU",
    shipping: "Livraison internationale",
    shippingTitle: "Tarifs estimés par poids et destination.",
    related: "Produits similaires",
    relatedTitle: "Continuer à explorer la collection.",
  },
  pt: {
    from: "Desde",
    viewProduct: "Ver produto",
    addToCart: "Adicionar ao carrinho",
    buyNow: "Comprar agora",
    secure: "Pagamento seguro",
    delivery: "Envio internacional",
    returns: "Devoluções por destino",
    leather: "Couro brasileiro",
    notAvailable: "Não disponível para entrega no destino selecionado.",
    retailPrice: "Preço varejo",
    wholesale: "Atacado",
    wholesalePrefix: "A partir de",
    wholesaleSuffix: "unidades",
    weight: "Peso",
    weightSuffix: "estimado no checkout",
    material: "Material",
    sku: "SKU",
    shipping: "Envio internacional",
    shippingTitle: "Tarifas estimadas por peso e destino.",
    related: "Relacionados",
    relatedTitle: "Continue explorando a coleção.",
  },
};

export function getProductDictionary(locale: AppLocale): ProductDictionary {
  return DICT[locale] ?? DICT.en;
}
