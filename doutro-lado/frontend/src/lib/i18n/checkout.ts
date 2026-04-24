// =============================================================================
// Cart / Checkout / Gift Builder dictionary — en / de / fr / pt
// =============================================================================

import type { AppLocale } from "./common";

export interface CartDictionary {
  eyebrow: string;
  title: string;
  description: string;
}

export interface CheckoutDictionary {
  eyebrow: string;
  title: string;
  description: string;
}

export interface GiftBuilderDictionary {
  eyebrow: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
}

const CART: Record<AppLocale, CartDictionary> = {
  en: {
    eyebrow: "Bag / Fashion",
    title: "Your selection.",
    description: "Review your items before proceeding to checkout.",
  },
  de: {
    eyebrow: "Warenkorb / Mode",
    title: "Ihre Auswahl.",
    description: "Überprüfen Sie Ihre Artikel vor dem Checkout.",
  },
  fr: {
    eyebrow: "Panier / Mode",
    title: "Votre sélection.",
    description: "Vérifiez vos articles avant de passer à la caisse.",
  },
  pt: {
    eyebrow: "Carrinho / Moda",
    title: "Sua seleção.",
    description: "Revise seus itens antes de finalizar o pedido.",
  },
};

const CHECKOUT: Record<AppLocale, CheckoutDictionary> = {
  en: {
    eyebrow: "Checkout / Fashion",
    title: "Complete your order.",
    description: "Shipping rates and duties are calculated based on your selected destination.",
  },
  de: {
    eyebrow: "Checkout / Mode",
    title: "Bestellung abschließen.",
    description: "Versandkosten und Zölle werden basierend auf Ihrem gewählten Ziel berechnet.",
  },
  fr: {
    eyebrow: "Paiement / Mode",
    title: "Finalisez votre commande.",
    description: "Les frais de livraison et droits de douane sont calculés selon votre destination.",
  },
  pt: {
    eyebrow: "Checkout / Moda",
    title: "Finalize seu pedido.",
    description: "Frete e impostos calculados conforme o destino selecionado.",
  },
};

const GIFT: Record<AppLocale, GiftBuilderDictionary> = {
  en: {
    eyebrow: "Gift composition",
    title: "Build a premium gift composition.",
    description: "Select pieces, choose packaging and add a personal message. Delivered with care.",
    metaTitle: "Build a Gift — D'OUTRO LADO",
    metaDescription:
      "Compose a premium gift from Brazilian leather pieces. Choose packaging, add a message and send with care to your selected destination.",
  },
  de: {
    eyebrow: "Geschenkkomposition",
    title: "Eine Premium-Geschenkkomposition erstellen.",
    description: "Stücke auswählen, Verpackung wählen und persönliche Nachricht hinzufügen. Sorgfältig geliefert.",
    metaTitle: "Geschenk erstellen — D'OUTRO LADO",
    metaDescription:
      "Stellen Sie ein Premium-Geschenk aus brasilianischen Lederstücken zusammen. Verpackung wählen, Nachricht hinzufügen und sorgfältig liefern lassen.",
  },
  fr: {
    eyebrow: "Composition cadeau",
    title: "Créez une composition cadeau premium.",
    description: "Sélectionnez les pièces, l'emballage et ajoutez un message personnel. Livré avec soin.",
    metaTitle: "Créer un cadeau — D'OUTRO LADO",
    metaDescription:
      "Composez un cadeau premium en cuir brésilien. Choisissez l'emballage, ajoutez un message et faites livrer avec soin.",
  },
  pt: {
    eyebrow: "Composição de presente",
    title: "Monte uma composição de presente premium.",
    description: "Selecione itens, escolha a embalagem e adicione uma mensagem pessoal. Entregue com cuidado.",
    metaTitle: "Montar presente — D'OUTRO LADO",
    metaDescription:
      "Monte um presente premium com peças em couro brasileiro. Escolha a embalagem, adicione uma mensagem e envie com cuidado.",
  },
};

export function getCartDictionary(locale: AppLocale): CartDictionary {
  return CART[locale] ?? CART.en;
}

export function getCheckoutDictionary(locale: AppLocale): CheckoutDictionary {
  return CHECKOUT[locale] ?? CHECKOUT.en;
}

export function getGiftBuilderDictionary(locale: AppLocale): GiftBuilderDictionary {
  return GIFT[locale] ?? GIFT.en;
}
