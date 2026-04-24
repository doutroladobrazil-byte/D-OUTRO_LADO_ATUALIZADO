// =============================================================================
// Homepage i18n dictionary — en / de / fr / pt
// Cookie key: dl_locale  |  Fallback: "en"
// =============================================================================

import type { AppLocale } from "./common";
export type { AppLocale as HomeLocale } from "./common";
export { resolveLocale } from "./common";
type HomeLocale = AppLocale;

// =============================================================================
// Dictionary shape
// =============================================================================

export interface HomeDictionary {
  announcement: string;
  hero: {
    eyebrow: string;
    h1: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust: [string, string, string, string];
  };
  categories: {
    eyebrow: string;
    title: string;
    items: Array<{ label: string; description: string }>;
  };
  products: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    empty: string;
    emptySubtitle: string;
    emptyCta: string;
  };
  international: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{ label: string; description: string }>;
  };
  editorial: {
    eyebrow: string;
    title: string;
    description: string;
  };
  campaign: {
    eyebrow: string;
    title: string;
  };
  gift: {
    eyebrow: string;
    title: string;
    body: string;
    feature1: string;
    feature2: string;
    cta: string;
  };
  lead: {
    eyebrow: string;
    title: string;
    body: string;
    emailPlaceholder: string;
    regionLabel: string;
    regionDefault: string;
    interestLabel: string;
    cta: string;
    microcopy: string;
    successTitle: string;
    successBody: string;
    error: string;
    errorRetry: string;
  };
  trust: {
    eyebrow: string;
    items: Array<{ label: string; sub: string }>;
    footer: string;
  };
}

// =============================================================================
// Dictionaries
// =============================================================================

const DICT: Record<HomeLocale, HomeDictionary> = {
  // ---------------------------------------------------------------------------
  en: {
    announcement:
      "International checkout · Tracked delivery · Localized shopping experience",
    hero: {
      eyebrow: "Brazilian premium fashion · International delivery",
      h1: "Brazilian leather, fashion and accessories — curated for international customers.",
      subheadline:
        "Limited pieces, premium materials and a localized checkout experience for selected destinations.",
      ctaPrimary: "Shop the collection",
      ctaSecondary: "Join the private drop list",
      trust: [
        "Tracked international shipping",
        "Secure payment",
        "Localized experience",
        "Destination-aware policies",
      ],
    },
    categories: {
      eyebrow: "Browse by category",
      title: "Shop what you're looking for.",
      items: [
        { label: "New In", description: "Latest arrivals from Brazil" },
        { label: "Leather Bags", description: "Handcrafted premium leather" },
        { label: "Shoes", description: "Statement footwear" },
        { label: "Accessories", description: "Belts, wallets and more" },
        { label: "Gift Sets", description: "Curated for someone special" },
        { label: "Best Sellers", description: "Most requested pieces" },
      ],
    },
    products: {
      eyebrow: "Selected pieces",
      title: "Premium pieces ready for international checkout.",
      description:
        "A focused selection of Brazilian leather, accessories and statement pieces for selected destinations.",
      cta: "View all products",
      empty: "Private international drop coming soon.",
      emptySubtitle: "Join the list to receive availability updates.",
      emptyCta: "Join the list for early access",
    },
    international: {
      eyebrow: "International shopping",
      title: "International shopping, localized by destination.",
      description:
        "Language, currency, delivery and return information adapt when available. Final conditions are shown before payment.",
      cards: [
        {
          label: "Localized experience",
          description: "The storefront can adapt language automatically when supported.",
        },
        {
          label: "International checkout",
          description: "Secure payment flow with destination-aware order rules.",
        },
        {
          label: "Tracked delivery",
          description: "International shipping for selected destinations with tracking.",
        },
        {
          label: "Clear policies",
          description: "Delivery, duties and return conditions are shown before payment.",
        },
      ],
    },
    editorial: {
      eyebrow: "Editorial",
      title: "Stories, pieces and curated edits.",
      description: "Fashion with a perspective — Brazilian origin, European reach.",
    },
    campaign: {
      eyebrow: "Campaign",
      title: "Curated edits and exclusive drops.",
    },
    gift: {
      eyebrow: "Gift composition",
      title: "An elegant, sensory and personalised composition.",
      body: "More than a kit — a curated gift composition with objects, leather, textures and a coherent visual narrative for each occasion.",
      feature1: "Intuitive selection by category and atmosphere.",
      feature2: "Sophisticated preview with immediate value reading.",
      cta: "Build a composition",
    },
    lead: {
      eyebrow: "Private drop list",
      title: "Get early access to international drops.",
      body: "Join the private list for new arrivals, limited leather pieces and international shipping updates.",
      emailPlaceholder: "your@email.com",
      regionLabel: "Where are you shopping from?",
      regionDefault: "Select your region",
      interestLabel: "I'm interested in",
      cta: "Join the list",
      microcopy: "No spam. Product drops and availability updates only.",
      successTitle: "You're on the list",
      successBody: "We'll reach out when new drops are available for your destination.",
      error: "Something went wrong. Please try again.",
      errorRetry: "Try again",
    },
    trust: {
      eyebrow: "Why shop with us",
      items: [
        { label: "Secure checkout via Stripe", sub: "Encrypted payment processing" },
        { label: "Tracked international delivery", sub: "Estimated at checkout by destination" },
        { label: "Destination duties notice", sub: "Duties and taxes shown before payment" },
        { label: "Returns by destination", sub: "Policy and conditions shown before you pay" },
      ],
      footer:
        "Delivery, duties and return conditions are shown according to your destination before payment.",
    },
  },

  // ---------------------------------------------------------------------------
  de: {
    announcement:
      "Internationaler Checkout · Sendungsverfolgung · Lokalisiertes Einkaufserlebnis",
    hero: {
      eyebrow: "Brasilianische Premium-Mode · Internationale Lieferung",
      h1: "Brasilianisches Leder, Mode und Accessoires — kuratiert für internationale Kunden.",
      subheadline:
        "Limitierte Stücke, Premium-Materialien und ein lokalisiertes Checkout-Erlebnis für ausgewählte Destinationen.",
      ctaPrimary: "Kollektion entdecken",
      ctaSecondary: "Drop-Liste beitreten",
      trust: [
        "Internationale Sendungsverfolgung",
        "Sichere Zahlung",
        "Lokalisiertes Erlebnis",
        "Destinationsspezifische Richtlinien",
      ],
    },
    categories: {
      eyebrow: "Nach Kategorie",
      title: "Finden Sie, was Sie suchen.",
      items: [
        { label: "Neuheiten", description: "Neue Arrivals aus Brasilien" },
        { label: "Ledertaschen", description: "Handgefertigtes Premium-Leder" },
        { label: "Schuhe", description: "Besondere Schuhe" },
        { label: "Accessoires", description: "Gürtel, Geldbörsen und mehr" },
        { label: "Geschenksets", description: "Kuratiert für besondere Menschen" },
        { label: "Bestseller", description: "Meist gefragte Stücke" },
      ],
    },
    products: {
      eyebrow: "Ausgewählte Stücke",
      title: "Premium-Stücke bereit für den internationalen Checkout.",
      description:
        "Eine fokussierte Auswahl brasilianischer Lederprodukte, Accessoires und Statement-Stücke für ausgewählte Destinationen.",
      cta: "Alle Produkte anzeigen",
      empty: "Privater internationaler Drop in Kürze.",
      emptySubtitle: "Melden Sie sich an, um Verfügbarkeitsupdates zu erhalten.",
      emptyCta: "Für frühen Zugang anmelden",
    },
    international: {
      eyebrow: "Internationales Einkaufen",
      title: "Internationales Einkaufen, lokalisiert nach Destination.",
      description:
        "Sprache, Währung, Liefer- und Rückgabebedingungen werden bei Verfügbarkeit angepasst. Endbedingungen werden vor der Zahlung angezeigt.",
      cards: [
        {
          label: "Lokalisiertes Erlebnis",
          description: "Die Storefront passt die Sprache automatisch an, wenn unterstützt.",
        },
        {
          label: "Internationaler Checkout",
          description:
            "Sicherer Zahlungsfluss mit destinationsspezifischen Bestellregeln.",
        },
        {
          label: "Sendungsverfolgung",
          description:
            "Internationale Lieferung für ausgewählte Destinationen mit Tracking.",
        },
        {
          label: "Transparente Richtlinien",
          description:
            "Liefer-, Zoll- und Rückgabebedingungen werden vor der Zahlung angezeigt.",
        },
      ],
    },
    editorial: {
      eyebrow: "Editorial",
      title: "Geschichten, Stücke und kuratierte Editionen.",
      description: "Mode mit Perspektive — brasilianischer Ursprung, europäische Reichweite.",
    },
    campaign: {
      eyebrow: "Kampagne",
      title: "Kuratierte Editionen und exklusive Drops.",
    },
    gift: {
      eyebrow: "Geschenkkomposition",
      title: "Eine elegante, sinnliche und personalisierte Komposition.",
      body: "Mehr als ein Kit — eine kuratierte Geschenkkomposition mit Objekten, Leder, Texturen und einer kohärenten visuellen Narrative für jeden Anlass.",
      feature1: "Intuitive Auswahl nach Kategorie und Atmosphäre.",
      feature2: "Ausgefeilte Vorschau mit sofortiger Werterfassung.",
      cta: "Komposition erstellen",
    },
    lead: {
      eyebrow: "Private Drop-Liste",
      title: "Früher Zugang zu internationalen Drops erhalten.",
      body: "Treten Sie der privaten Liste für Neuheiten, limitierte Lederstücke und internationale Versand-Updates bei.",
      emailPlaceholder: "ihre@email.com",
      regionLabel: "Wo kaufen Sie ein?",
      regionDefault: "Region auswählen",
      interestLabel: "Ich interessiere mich für",
      cta: "Liste beitreten",
      microcopy: "Kein Spam. Nur Produkt-Drops und Verfügbarkeitsupdates.",
      successTitle: "Sie sind auf der Liste",
      successBody:
        "Wir melden uns, wenn neue Drops für Ihre Destination verfügbar sind.",
      error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
      errorRetry: "Erneut versuchen",
    },
    trust: {
      eyebrow: "Warum bei uns kaufen",
      items: [
        {
          label: "Sicherer Checkout via Stripe",
          sub: "Verschlüsselte Zahlungsabwicklung",
        },
        {
          label: "Internationale Sendungsverfolgung",
          sub: "Schätzung beim Checkout nach Destination",
        },
        {
          label: "Zollhinweise nach Destination",
          sub: "Zölle und Steuern vor der Zahlung angezeigt",
        },
        {
          label: "Rückgabe nach Destination",
          sub: "Richtlinie und Bedingungen vor der Zahlung angezeigt",
        },
      ],
      footer:
        "Liefer-, Zoll- und Rückgabebedingungen werden gemäß Ihrer Destination vor der Zahlung angezeigt.",
    },
  },

  // ---------------------------------------------------------------------------
  fr: {
    announcement:
      "Paiement international · Livraison suivie · Expérience d'achat localisée",
    hero: {
      eyebrow: "Mode brésilienne premium · Livraison internationale",
      h1: "Cuir, mode et accessoires brésiliens — sélectionnés pour les clients internationaux.",
      subheadline:
        "Pièces limitées, matériaux premium et une expérience de paiement localisée pour les destinations sélectionnées.",
      ctaPrimary: "Découvrir la collection",
      ctaSecondary: "Rejoindre la liste privée",
      trust: [
        "Expédition internationale suivie",
        "Paiement sécurisé",
        "Expérience localisée",
        "Politiques adaptées à la destination",
      ],
    },
    categories: {
      eyebrow: "Par catégorie",
      title: "Trouvez ce que vous cherchez.",
      items: [
        { label: "Nouveautés", description: "Dernières arrivées du Brésil" },
        { label: "Sacs en Cuir", description: "Cuir premium artisanal" },
        { label: "Chaussures", description: "Chaussures d'exception" },
        { label: "Accessoires", description: "Ceintures, portefeuilles et plus" },
        { label: "Coffrets Cadeaux", description: "Sélectionnés pour quelqu'un de spécial" },
        { label: "Meilleures Ventes", description: "Pièces les plus demandées" },
      ],
    },
    products: {
      eyebrow: "Pièces sélectionnées",
      title: "Pièces premium prêtes pour un paiement international.",
      description:
        "Une sélection ciblée de cuir brésilien, d'accessoires et de pièces phares pour les destinations sélectionnées.",
      cta: "Voir tous les produits",
      empty: "Drop international privé bientôt disponible.",
      emptySubtitle: "Rejoignez la liste pour recevoir les mises à jour de disponibilité.",
      emptyCta: "Rejoindre la liste pour un accès anticipé",
    },
    international: {
      eyebrow: "Shopping international",
      title: "Shopping international, localisé par destination.",
      description:
        "La langue, la devise, les informations de livraison et de retour s'adaptent lorsque disponibles. Les conditions finales sont affichées avant le paiement.",
      cards: [
        {
          label: "Expérience localisée",
          description:
            "La boutique peut adapter automatiquement la langue lorsqu'elle est supportée.",
        },
        {
          label: "Paiement international",
          description:
            "Flux de paiement sécurisé avec règles de commande adaptées à la destination.",
        },
        {
          label: "Livraison suivie",
          description:
            "Expédition internationale pour les destinations sélectionnées avec suivi.",
        },
        {
          label: "Politiques claires",
          description:
            "Les conditions de livraison, droits et retour sont affichés avant le paiement.",
        },
      ],
    },
    editorial: {
      eyebrow: "Éditorial",
      title: "Histoires, pièces et sélections curatées.",
      description:
        "Mode avec une perspective — origine brésilienne, portée européenne.",
    },
    campaign: {
      eyebrow: "Campagne",
      title: "Sélections curatées et drops exclusifs.",
    },
    gift: {
      eyebrow: "Composition cadeau",
      title: "Une composition élégante, sensorielle et personnalisée.",
      body: "Plus qu'un kit — une composition cadeau curatée avec des objets, du cuir, des textures et un récit visuel cohérent pour chaque occasion.",
      feature1: "Sélection intuitive par catégorie et atmosphère.",
      feature2: "Aperçu sophistiqué avec lecture immédiate de la valeur.",
      cta: "Créer une composition",
    },
    lead: {
      eyebrow: "Liste privée de drops",
      title: "Accéder en avant-première aux drops internationaux.",
      body: "Rejoignez la liste privée pour les nouvelles arrivées, les pièces en cuir limitées et les mises à jour d'expédition internationale.",
      emailPlaceholder: "votre@email.com",
      regionLabel: "Depuis où faites-vous vos achats ?",
      regionDefault: "Sélectionner votre région",
      interestLabel: "Je suis intéressé(e) par",
      cta: "Rejoindre la liste",
      microcopy: "Pas de spam. Uniquement des drops de produits et des mises à jour de disponibilité.",
      successTitle: "Vous êtes sur la liste",
      successBody:
        "Nous vous contacterons lorsque de nouveaux drops seront disponibles pour votre destination.",
      error: "Une erreur s'est produite. Veuillez réessayer.",
      errorRetry: "Réessayer",
    },
    trust: {
      eyebrow: "Pourquoi acheter chez nous",
      items: [
        {
          label: "Paiement sécurisé via Stripe",
          sub: "Traitement des paiements chiffré",
        },
        {
          label: "Livraison internationale suivie",
          sub: "Estimé au paiement selon la destination",
        },
        {
          label: "Avis sur les droits de douane",
          sub: "Droits et taxes affichés avant le paiement",
        },
        {
          label: "Retours par destination",
          sub: "Politique et conditions affichées avant le paiement",
        },
      ],
      footer:
        "Les conditions de livraison, droits et retour sont affichés selon votre destination avant le paiement.",
    },
  },

  // ---------------------------------------------------------------------------
  pt: {
    announcement:
      "Checkout internacional · Entrega rastreada · Experiência de compra localizada",
    hero: {
      eyebrow: "Moda premium brasileira · Entrega internacional",
      h1: "Couro, moda e acessórios brasileiros — curadoria para clientes internacionais.",
      subheadline:
        "Peças limitadas, materiais premium e experiência de checkout localizada para destinos selecionados.",
      ctaPrimary: "Explorar a coleção",
      ctaSecondary: "Entrar na lista de drops",
      trust: [
        "Envio internacional rastreado",
        "Pagamento seguro",
        "Experiência localizada",
        "Políticas por destino",
      ],
    },
    categories: {
      eyebrow: "Navegar por categoria",
      title: "Encontre o que você procura.",
      items: [
        { label: "Novidades", description: "Últimas chegadas do Brasil" },
        { label: "Bolsas de Couro", description: "Couro premium artesanal" },
        { label: "Sapatos", description: "Calçados de destaque" },
        { label: "Acessórios", description: "Cintos, carteiras e mais" },
        { label: "Kits Presente", description: "Curadoria para alguém especial" },
        { label: "Mais Vendidos", description: "Peças mais procuradas" },
      ],
    },
    products: {
      eyebrow: "Seleção da semana",
      title: "Peças premium prontas para checkout internacional.",
      description:
        "Uma seleção focada de couro, acessórios e peças de destaque do Brasil para destinos selecionados.",
      cta: "Ver todos os produtos",
      empty: "Drop internacional privado em breve.",
      emptySubtitle: "Entre na lista para receber atualizações de disponibilidade.",
      emptyCta: "Entrar na lista para acesso antecipado",
    },
    international: {
      eyebrow: "Compras internacionais",
      title: "Compras internacionais, localizadas por destino.",
      description:
        "Idioma, moeda, entrega e devoluções adaptam quando disponível. Condições finais exibidas antes do pagamento.",
      cards: [
        {
          label: "Experiência localizada",
          description: "A loja adapta o idioma automaticamente quando disponível.",
        },
        {
          label: "Checkout internacional",
          description: "Fluxo de pagamento seguro com regras por destino.",
        },
        {
          label: "Entrega rastreada",
          description: "Envio internacional com rastreamento para destinos selecionados.",
        },
        {
          label: "Políticas claras",
          description: "Condições de entrega, impostos e devolução exibidas antes do pagamento.",
        },
      ],
    },
    editorial: {
      eyebrow: "Editorial",
      title: "Narrativas, peças e edições com curadoria.",
      description: "Moda com narrativa — origem brasileira, alcance europeu.",
    },
    campaign: {
      eyebrow: "Campanha",
      title: "Edições com curadoria e drops exclusivos.",
    },
    gift: {
      eyebrow: "Composição de presente",
      title: "Uma composição elegante, sensorial e personalizada.",
      body: "Mais do que um kit — uma composição com curadoria de objetos, couro, texturas e narrativa visual coerente para cada ocasião.",
      feature1: "Seleção intuitiva por categoria e atmosfera.",
      feature2: "Preview sofisticado com leitura imediata de valor.",
      cta: "Montar composição",
    },
    lead: {
      eyebrow: "Lista privada de drops",
      title: "Acesse primeiro os drops internacionais.",
      body: "Entre na lista privada para novidades, peças de couro limitadas e atualizações de envio internacional.",
      emailPlaceholder: "seu@email.com",
      regionLabel: "De onde você está comprando?",
      regionDefault: "Selecione sua região",
      interestLabel: "Tenho interesse em",
      cta: "Entrar na lista",
      microcopy: "Sem spam. Apenas drops e atualizações de disponibilidade.",
      successTitle: "Você está na lista",
      successBody:
        "Entraremos em contato quando novos drops estiverem disponíveis para o seu destino.",
      error: "Algo deu errado. Por favor, tente novamente.",
      errorRetry: "Tentar novamente",
    },
    trust: {
      eyebrow: "Por que comprar conosco",
      items: [
        {
          label: "Checkout seguro via Stripe",
          sub: "Processamento de pagamento criptografado",
        },
        {
          label: "Entrega internacional rastreada",
          sub: "Estimativa no checkout por destino",
        },
        {
          label: "Aviso de impostos por destino",
          sub: "Impostos e taxas exibidos antes do pagamento",
        },
        {
          label: "Devoluções por destino",
          sub: "Política e condições exibidas antes do pagamento",
        },
      ],
      footer:
        "Condições de entrega, impostos e devolução exibidas conforme seu destino antes do pagamento.",
    },
  },
};

export function getDictionary(locale: HomeLocale): HomeDictionary {
  return DICT[locale] ?? DICT.en;
}
