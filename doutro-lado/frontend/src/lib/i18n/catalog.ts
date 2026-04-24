// =============================================================================
// Catalog / brands page dictionary — en / de / fr / pt
// =============================================================================

import type { AppLocale } from "./common";

export interface CatalogDictionary {
  hero: {
    eyebrow: string;
    h1Lines: [string, string];
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    qualities: Array<{ label: string; desc: string }>;
    badges: [string, string, string, string];
  };
  editorial: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
  };
  products: {
    eyebrow: string;
    viewAll: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    emptyCtaSecondary: string;
  };
  /** Maps filter key (category slug or sort value) → page title. Empty key = no filter. */
  filterTitles: Record<string, string>;
  gift: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
  };
}

const DICT: Record<AppLocale, CatalogDictionary> = {
  // ---------------------------------------------------------------------------
  en: {
    hero: {
      eyebrow: "Fashion / Leather / Accessories",
      h1Lines: ["Premium leather", "with presence."],
      subheadline:
        "Bags, belts, shoes and accessories in premium Brazilian leather. A wardrobe with presence for international customers — curation, craftsmanship and identity in every piece.",
      ctaPrimary: "Shop the collection",
      ctaSecondary: "Build a gift",
      qualities: [
        { label: "Quality", desc: "Premium leather, selected and crafted without shortcuts." },
        { label: "Exclusivity", desc: "Limited series with individual piece tracking." },
        { label: "Presence", desc: "Pieces that make a statement before being worn." },
        { label: "Narrative", desc: "Each collection with its own editorial and context." },
      ],
      badges: [
        "Premium Brazilian leather",
        "Premium leather selection",
        "Limited series",
        "International checkout",
      ],
    },
    editorial: {
      eyebrow: "Editorial",
      title: "A wardrobe that speaks for itself.",
      description:
        "Premium Brazilian leather exported with precision, care and identity. For those who recognise craftsmanship without needing a label.",
      cta: "Explore collections",
    },
    products: {
      eyebrow: "Selection",
      viewAll: "View all",
      emptyTitle: "Private international drop coming soon.",
      emptyBody: "Join the list to receive availability updates for this selection.",
      emptyCta: "Join the drop list",
      emptyCtaSecondary: "View full catalogue",
    },
    filterTitles: {
      "": "Shop the collection",
      "new": "New In",
      "best-sellers": "Best Sellers",
      "leather-bags": "Leather Bags",
      "shoes": "Shoes",
      "accessories": "Accessories",
    },
    gift: {
      eyebrow: "Gift composition",
      title: "Build a premium gift composition.",
      description:
        "Select pieces, choose packaging and add a message. A sophisticated composition delivered with care.",
      cta: "Build a gift",
    },
  },

  // ---------------------------------------------------------------------------
  de: {
    hero: {
      eyebrow: "Mode / Leder / Accessoires",
      h1Lines: ["Premium-Leder", "mit Präsenz."],
      subheadline:
        "Taschen, Gürtel, Schuhe und Accessoires aus brasilianischem Premium-Leder. Ein Wardrobe mit Präsenz für internationale Kunden — Kuration, Handwerk und Identität in jedem Stück.",
      ctaPrimary: "Kollektion entdecken",
      ctaSecondary: "Geschenk erstellen",
      qualities: [
        { label: "Qualität", desc: "Premium-Leder, ausgewählt und ohne Abkürzungen verarbeitet." },
        { label: "Exklusivität", desc: "Limitierte Serien mit individueller Stückverfolgung." },
        { label: "Präsenz", desc: "Stücke, die eine Aussage machen, bevor sie getragen werden." },
        { label: "Narrativ", desc: "Jede Kollektion mit eigenem Editorial und Kontext." },
      ],
      badges: [
        "Brasilianisches Premium-Leder",
        "Premium-Lederauswahl",
        "Limitierte Serien",
        "Internationaler Checkout",
      ],
    },
    editorial: {
      eyebrow: "Editorial",
      title: "Ein Wardrobe, der für sich selbst spricht.",
      description:
        "Brasilianisches Premium-Leder, mit Präzision, Sorgfalt und Identität exportiert. Für alle, die Handwerkskunst erkennen, ohne ein Label zu brauchen.",
      cta: "Kollektionen erkunden",
    },
    products: {
      eyebrow: "Auswahl",
      viewAll: "Alle anzeigen",
      emptyTitle: "Privater internationaler Drop in Kürze.",
      emptyBody: "Treten Sie der Liste bei, um Verfügbarkeitsupdates für diese Auswahl zu erhalten.",
      emptyCta: "Drop-Liste beitreten",
      emptyCtaSecondary: "Gesamten Katalog anzeigen",
    },
    filterTitles: {
      "": "Kollektion entdecken",
      "new": "Neuheiten",
      "best-sellers": "Bestseller",
      "leather-bags": "Ledertaschen",
      "shoes": "Schuhe",
      "accessories": "Accessoires",
    },
    gift: {
      eyebrow: "Geschenkkomposition",
      title: "Eine Premium-Geschenkkomposition erstellen.",
      description:
        "Wählen Sie Stücke, Verpackung und Nachricht. Eine ausgefeilte Komposition, sorgfältig geliefert.",
      cta: "Geschenk erstellen",
    },
  },

  // ---------------------------------------------------------------------------
  fr: {
    hero: {
      eyebrow: "Mode / Cuir / Accessoires",
      h1Lines: ["Cuir premium", "avec présence."],
      subheadline:
        "Sacs, ceintures, chaussures et accessoires en cuir brésilien premium. Une garde-robe avec présence pour les clients internationaux — curation, artisanat et identité dans chaque pièce.",
      ctaPrimary: "Découvrir la collection",
      ctaSecondary: "Créer un cadeau",
      qualities: [
        { label: "Qualité", desc: "Cuir premium, sélectionné et travaillé sans compromis." },
        { label: "Exclusivité", desc: "Séries limitées avec suivi individuel de chaque pièce." },
        { label: "Présence", desc: "Des pièces qui s'affirment avant même d'être portées." },
        { label: "Narration", desc: "Chaque collection avec son propre éditorial et contexte." },
      ],
      badges: [
        "Cuir brésilien premium",
        "Sélection de cuir premium",
        "Séries limitées",
        "Paiement international",
      ],
    },
    editorial: {
      eyebrow: "Éditorial",
      title: "Une garde-robe qui parle d'elle-même.",
      description:
        "Cuir brésilien premium exporté avec précision, soin et identité. Pour ceux qui reconnaissent l'artisanat sans avoir besoin d'une étiquette.",
      cta: "Explorer les collections",
    },
    products: {
      eyebrow: "Sélection",
      viewAll: "Voir tout",
      emptyTitle: "Drop international privé bientôt disponible.",
      emptyBody: "Rejoignez la liste pour recevoir les mises à jour de disponibilité pour cette sélection.",
      emptyCta: "Rejoindre la liste de drops",
      emptyCtaSecondary: "Voir le catalogue complet",
    },
    filterTitles: {
      "": "Découvrir la collection",
      "new": "Nouveautés",
      "best-sellers": "Meilleures ventes",
      "leather-bags": "Sacs en cuir",
      "shoes": "Chaussures",
      "accessories": "Accessoires",
    },
    gift: {
      eyebrow: "Composition cadeau",
      title: "Créez une composition cadeau premium.",
      description:
        "Sélectionnez les pièces, l'emballage et un message. Une composition sophistiquée livrée avec soin.",
      cta: "Créer un cadeau",
    },
  },

  // ---------------------------------------------------------------------------
  pt: {
    hero: {
      eyebrow: "Moda / Couro / Acessórios",
      h1Lines: ["Couro legítimo", "com presença."],
      subheadline:
        "Bolsas, cintos, sapatos e acessórios em couro premium brasileiro. Um wardrobe de presença para o mercado internacional — curadoria, materialidade e identidade em cada peça.",
      ctaPrimary: "Ver coleções",
      ctaSecondary: "Montar presente",
      qualities: [
        { label: "Qualidade", desc: "Couro premium selecionado e trabalhado sem atalhos." },
        { label: "Exclusividade", desc: "Séries limitadas com rastreamento individual por peça." },
        { label: "Presença", desc: "Peças que existem antes de serem usadas." },
        { label: "Narrativa", desc: "Cada coleção com editorial próprio e contexto." },
      ],
      badges: [
        "Couro bovino premium",
        "Seleção de couro premium",
        "Séries limitadas",
        "Checkout internacional",
      ],
    },
    editorial: {
      eyebrow: "Editorial",
      title: "Um wardrobe que não precisa de explicação.",
      description:
        "Couro legítimo brasileiro exportado com precisão, cuidado e identidade. Para quem reconhece materialidade sem que ninguém precise nomear.",
      cta: "Explorar coleções",
    },
    products: {
      eyebrow: "Seleção",
      viewAll: "Ver tudo",
      emptyTitle: "Drop internacional privado em breve.",
      emptyBody: "Entre na lista para receber atualizações de disponibilidade desta seleção.",
      emptyCta: "Entrar na lista de drops",
      emptyCtaSecondary: "Ver catálogo completo",
    },
    filterTitles: {
      "": "Explorar a coleção",
      "new": "Novidades",
      "best-sellers": "Mais vendidos",
      "leather-bags": "Bolsas de couro",
      "shoes": "Sapatos",
      "accessories": "Acessórios",
    },
    gift: {
      eyebrow: "Composição de presente",
      title: "Monte uma composição de presente premium.",
      description:
        "Selecione itens, escolha a embalagem e adicione uma mensagem. Uma composição sofisticada entregue com cuidado.",
      cta: "Montar presente",
    },
  },
};

export function getCatalogDictionary(locale: AppLocale): CatalogDictionary {
  return DICT[locale] ?? DICT.en;
}
