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
  products: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    empty: string;
    emptySubtitle: string;
    emptyCta: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    items: Array<{ label: string; description: string }>;
  };
  shopByStyle: {
    eyebrow: string;
    title: string;
    items: Array<{ label: string; description: string; cta: string }>;
  };
  services: {
    eyebrow: string;
    title: string;
    items: Array<{ label: string; description: string }>;
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
      h1: "Leather goods and statement accessories from Brazil — curated for international customers.",
      subheadline:
        "Limited premium pieces, crafted with presence and prepared for a localized checkout experience.",
      ctaPrimary: "Shop new arrivals",
      ctaSecondary: "Join the private drop list",
      trust: [
        "Tracked international delivery",
        "Secure checkout",
        "Localized experience",
        "Destination-aware policies",
      ],
    },
    products: {
      eyebrow: "New arrivals · Featured pieces",
      title: "Premium pieces ready for international checkout.",
      description:
        "A focused selection of Brazilian leather, accessories and statement pieces.",
      cta: "View all products",
      empty: "Private international drop coming soon.",
      emptySubtitle: "Join the list to receive availability updates for selected destinations.",
      emptyCta: "Join the list for early access",
    },
    categories: {
      eyebrow: "Browse by category",
      title: "Shop what you're looking for.",
      items: [
        { label: "New In", description: "Latest arrivals from Brazil" },
        { label: "Leather Bags", description: "Handcrafted premium leather" },
        { label: "Small Leather Goods", description: "Wallets, cardholders and essentials" },
        { label: "Shoes", description: "Statement footwear" },
        { label: "Accessories", description: "Belts, jewelry and more" },
        { label: "Gift Sets", description: "Curated for someone special" },
        { label: "Best Sellers", description: "Most requested pieces" },
      ],
    },
    shopByStyle: {
      eyebrow: "Shop by purpose",
      title: "Choose your piece.",
      items: [
        { label: "Everyday Carry", description: "Structured bags for every routine.", cta: "Shop bags" },
        { label: "Evening Presence", description: "Statement pieces for standout moments.", cta: "Explore" },
        { label: "Gift-Ready Pieces", description: "Curated compositions, delivered with care.", cta: "Build a gift" },
        { label: "Travel & Work", description: "Functional design, premium materials.", cta: "Explore" },
        { label: "Minimal Essentials", description: "Clean lines, lasting quality.", cta: "Explore" },
      ],
    },
    services: {
      eyebrow: "International service",
      title: "Prepared for global customers.",
      items: [
        {
          label: "Localized experience",
          description: "Language auto-detected from your browser. Display adapts when supported.",
        },
        {
          label: "Secure checkout",
          description: "Encrypted payment via Stripe. No payment data stored on our servers.",
        },
        {
          label: "Tracked delivery",
          description: "International shipping with tracking for selected destinations.",
        },
        {
          label: "Duties shown before payment",
          description: "Applicable taxes and duties are displayed before you confirm the order.",
        },
        {
          label: "Return conditions by destination",
          description: "Return eligibility and conditions vary by destination and are shown before purchase.",
        },
        {
          label: "Gift composition available",
          description: "Build a curated gift with packaging and a personal message at the gift builder.",
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
      title: "Build a premium gift composition.",
      body: "Select pieces, choose packaging and add a personal message. A sophisticated composition delivered with care for international customers.",
      feature1: "Select pieces by category and occasion.",
      feature2: "Add packaging and a personal message.",
      cta: "Build a composition",
    },
    lead: {
      eyebrow: "Private drop list",
      title: "Get early access to international drops.",
      body: "Join the private list for new arrivals, limited leather pieces and international availability updates. First access for selected destinations.",
      emailPlaceholder: "your@email.com",
      regionLabel: "Where are you shopping from?",
      regionDefault: "Select your region",
      interestLabel: "I'm interested in",
      cta: "Join the private list",
      microcopy: "No spam. Product drops and availability updates only.",
      successTitle: "You're on the list.",
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
      h1: "Lederwaren und Statement-Accessoires aus Brasilien — kuratiert für internationale Kunden.",
      subheadline:
        "Limitierte Premium-Stücke, mit Präsenz gefertigt und für ein lokalisiertes Checkout-Erlebnis bereit.",
      ctaPrimary: "Neuheiten entdecken",
      ctaSecondary: "Drop-Liste beitreten",
      trust: [
        "Internationale Sendungsverfolgung",
        "Sicherer Checkout",
        "Lokalisiertes Erlebnis",
        "Destinationsspezifische Richtlinien",
      ],
    },
    products: {
      eyebrow: "Neuheiten · Ausgewählte Stücke",
      title: "Premium-Stücke bereit für den internationalen Checkout.",
      description:
        "Eine fokussierte Auswahl brasilianischer Lederwaren, Accessoires und Statement-Stücke.",
      cta: "Alle Produkte anzeigen",
      empty: "Privater internationaler Drop in Kürze.",
      emptySubtitle: "Melden Sie sich an, um Verfügbarkeitsupdates für ausgewählte Destinationen zu erhalten.",
      emptyCta: "Für frühen Zugang anmelden",
    },
    categories: {
      eyebrow: "Nach Kategorie",
      title: "Finden Sie, was Sie suchen.",
      items: [
        { label: "Neuheiten", description: "Neue Arrivals aus Brasilien" },
        { label: "Ledertaschen", description: "Handgefertigtes Premium-Leder" },
        { label: "Kleine Lederwaren", description: "Geldbörsen, Kartenetuis und Wesentliches" },
        { label: "Schuhe", description: "Besondere Schuhe" },
        { label: "Accessoires", description: "Gürtel, Schmuck und mehr" },
        { label: "Geschenksets", description: "Kuratiert für besondere Menschen" },
        { label: "Bestseller", description: "Meist gefragte Stücke" },
      ],
    },
    shopByStyle: {
      eyebrow: "Nach Verwendungszweck",
      title: "Wählen Sie Ihr Stück.",
      items: [
        { label: "Alltag", description: "Strukturierte Taschen für jeden Tag.", cta: "Taschen entdecken" },
        { label: "Abend", description: "Statement-Stücke für besondere Momente.", cta: "Erkunden" },
        { label: "Geschenkfertig", description: "Kuratierte Kompositionen, sorgfältig geliefert.", cta: "Geschenk erstellen" },
        { label: "Reise & Beruf", description: "Funktionales Design, Premium-Materialien.", cta: "Erkunden" },
        { label: "Essenzielles", description: "Klare Linien, dauerhafte Qualität.", cta: "Erkunden" },
      ],
    },
    services: {
      eyebrow: "Internationaler Service",
      title: "Vorbereitet für globale Kunden.",
      items: [
        {
          label: "Lokalisiertes Erlebnis",
          description: "Sprache automatisch erkannt. Anzeige passt sich an, wenn verfügbar.",
        },
        {
          label: "Sicherer Checkout",
          description: "Verschlüsselte Zahlung via Stripe. Keine Zahlungsdaten auf unseren Servern.",
        },
        {
          label: "Sendungsverfolgung",
          description: "Internationaler Versand mit Tracking für ausgewählte Destinationen.",
        },
        {
          label: "Zölle vor der Zahlung",
          description: "Anfallende Steuern und Zölle werden vor der Bestellbestätigung angezeigt.",
        },
        {
          label: "Rückgabe nach Destination",
          description: "Rückgabeberechtigung und Bedingungen variieren nach Destination und werden vor dem Kauf angezeigt.",
        },
        {
          label: "Geschenkkomposition verfügbar",
          description: "Erstellen Sie ein kuratiertes Geschenk mit Verpackung und persönlicher Nachricht.",
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
      title: "Eine Premium-Geschenkkomposition erstellen.",
      body: "Stücke auswählen, Verpackung wählen und persönliche Nachricht hinzufügen. Eine ausgefeilte Komposition, sorgfältig geliefert.",
      feature1: "Stücke nach Kategorie und Anlass auswählen.",
      feature2: "Verpackung und persönliche Nachricht hinzufügen.",
      cta: "Komposition erstellen",
    },
    lead: {
      eyebrow: "Private Drop-Liste",
      title: "Früher Zugang zu internationalen Drops erhalten.",
      body: "Treten Sie der privaten Liste für Neuheiten, limitierte Lederstücke und internationale Verfügbarkeitsupdates bei. Erster Zugang für ausgewählte Destinationen.",
      emailPlaceholder: "ihre@email.com",
      regionLabel: "Wo kaufen Sie ein?",
      regionDefault: "Region auswählen",
      interestLabel: "Ich interessiere mich für",
      cta: "Privater Liste beitreten",
      microcopy: "Kein Spam. Nur Produkt-Drops und Verfügbarkeitsupdates.",
      successTitle: "Sie sind auf der Liste.",
      successBody: "Wir melden uns, wenn neue Drops für Ihre Destination verfügbar sind.",
      error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
      errorRetry: "Erneut versuchen",
    },
    trust: {
      eyebrow: "Warum bei uns kaufen",
      items: [
        { label: "Sicherer Checkout via Stripe", sub: "Verschlüsselte Zahlungsabwicklung" },
        { label: "Internationale Sendungsverfolgung", sub: "Schätzung beim Checkout nach Destination" },
        { label: "Zollhinweise nach Destination", sub: "Zölle und Steuern vor der Zahlung angezeigt" },
        { label: "Rückgabe nach Destination", sub: "Richtlinie und Bedingungen vor der Zahlung angezeigt" },
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
      h1: "Maroquinerie et accessoires statement du Brésil — sélectionnés pour les clients internationaux.",
      subheadline:
        "Pièces limitées premium, façonnées avec présence et préparées pour une expérience de paiement localisée.",
      ctaPrimary: "Voir les nouveautés",
      ctaSecondary: "Rejoindre la liste privée",
      trust: [
        "Expédition internationale suivie",
        "Paiement sécurisé",
        "Expérience localisée",
        "Politiques adaptées à la destination",
      ],
    },
    products: {
      eyebrow: "Nouveautés · Pièces sélectionnées",
      title: "Pièces premium prêtes pour un paiement international.",
      description:
        "Une sélection ciblée de maroquinerie brésilienne, d'accessoires et de pièces phares.",
      cta: "Voir tous les produits",
      empty: "Drop international privé bientôt disponible.",
      emptySubtitle: "Rejoignez la liste pour recevoir les mises à jour de disponibilité pour les destinations sélectionnées.",
      emptyCta: "Rejoindre la liste pour un accès anticipé",
    },
    categories: {
      eyebrow: "Par catégorie",
      title: "Trouvez ce que vous cherchez.",
      items: [
        { label: "Nouveautés", description: "Dernières arrivées du Brésil" },
        { label: "Sacs en Cuir", description: "Cuir premium artisanal" },
        { label: "Petite Maroquinerie", description: "Portefeuilles, porte-cartes et essentiels" },
        { label: "Chaussures", description: "Chaussures d'exception" },
        { label: "Accessoires", description: "Ceintures, bijoux et plus" },
        { label: "Coffrets Cadeaux", description: "Sélectionnés pour quelqu'un de spécial" },
        { label: "Meilleures Ventes", description: "Pièces les plus demandées" },
      ],
    },
    shopByStyle: {
      eyebrow: "Par usage",
      title: "Choisissez votre pièce.",
      items: [
        { label: "Usage quotidien", description: "Sacs structurés pour chaque routine.", cta: "Voir les sacs" },
        { label: "Présence en soirée", description: "Pièces d'exception pour les grands moments.", cta: "Explorer" },
        { label: "Prêt à offrir", description: "Compositions curatées, livrées avec soin.", cta: "Créer un cadeau" },
        { label: "Voyage & travail", description: "Design fonctionnel, matériaux premium.", cta: "Explorer" },
        { label: "Essentiels minimalistes", description: "Lignes épurées, qualité durable.", cta: "Explorer" },
      ],
    },
    services: {
      eyebrow: "Service international",
      title: "Préparé pour les clients du monde entier.",
      items: [
        {
          label: "Expérience localisée",
          description: "Langue détectée automatiquement. L'affichage s'adapte si disponible.",
        },
        {
          label: "Paiement sécurisé",
          description: "Paiement chiffré via Stripe. Aucune donnée de paiement stockée.",
        },
        {
          label: "Livraison suivie",
          description: "Expédition internationale avec suivi pour les destinations sélectionnées.",
        },
        {
          label: "Droits affichés avant paiement",
          description: "Les taxes et droits applicables sont affichés avant la confirmation de commande.",
        },
        {
          label: "Retours par destination",
          description: "Les conditions de retour varient selon la destination et sont affichées avant l'achat.",
        },
        {
          label: "Composition cadeau disponible",
          description: "Créez un cadeau curatée avec emballage et message personnel au gift builder.",
        },
      ],
    },
    editorial: {
      eyebrow: "Éditorial",
      title: "Histoires, pièces et sélections curatées.",
      description: "Mode avec une perspective — origine brésilienne, portée européenne.",
    },
    campaign: {
      eyebrow: "Campagne",
      title: "Sélections curatées et drops exclusifs.",
    },
    gift: {
      eyebrow: "Composition cadeau",
      title: "Créez une composition cadeau premium.",
      body: "Sélectionnez les pièces, choisissez l'emballage et ajoutez un message personnel. Une composition sophistiquée livrée avec soin pour les clients internationaux.",
      feature1: "Sélection par catégorie et occasion.",
      feature2: "Ajoutez l'emballage et un message personnel.",
      cta: "Créer une composition",
    },
    lead: {
      eyebrow: "Liste privée de drops",
      title: "Accéder en avant-première aux drops internationaux.",
      body: "Rejoignez la liste privée pour les nouvelles arrivées, les pièces en cuir limitées et les mises à jour de disponibilité internationale. Premier accès pour les destinations sélectionnées.",
      emailPlaceholder: "votre@email.com",
      regionLabel: "Depuis où faites-vous vos achats ?",
      regionDefault: "Sélectionner votre région",
      interestLabel: "Je suis intéressé(e) par",
      cta: "Rejoindre la liste privée",
      microcopy: "Pas de spam. Uniquement des drops de produits et des mises à jour de disponibilité.",
      successTitle: "Vous êtes sur la liste.",
      successBody: "Nous vous contacterons lorsque de nouveaux drops seront disponibles pour votre destination.",
      error: "Une erreur s'est produite. Veuillez réessayer.",
      errorRetry: "Réessayer",
    },
    trust: {
      eyebrow: "Pourquoi acheter chez nous",
      items: [
        { label: "Paiement sécurisé via Stripe", sub: "Traitement des paiements chiffré" },
        { label: "Livraison internationale suivie", sub: "Estimé au paiement selon la destination" },
        { label: "Avis sur les droits de douane", sub: "Droits et taxes affichés avant le paiement" },
        { label: "Retours par destination", sub: "Politique et conditions affichées avant le paiement" },
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
      h1: "Artigos de couro e acessórios de destaque do Brasil — curadoria para clientes internacionais.",
      subheadline:
        "Peças limitadas premium, feitas com presença e preparadas para uma experiência de checkout localizada.",
      ctaPrimary: "Ver novidades",
      ctaSecondary: "Entrar na lista privada",
      trust: [
        "Envio internacional rastreado",
        "Checkout seguro",
        "Experiência localizada",
        "Políticas por destino",
      ],
    },
    products: {
      eyebrow: "Novidades · Peças em destaque",
      title: "Peças premium prontas para checkout internacional.",
      description:
        "Uma seleção focada de artigos de couro, acessórios e peças de destaque do Brasil.",
      cta: "Ver todos os produtos",
      empty: "Drop internacional privado em breve.",
      emptySubtitle: "Entre na lista para receber atualizações de disponibilidade para destinos selecionados.",
      emptyCta: "Entrar na lista para acesso antecipado",
    },
    categories: {
      eyebrow: "Navegar por categoria",
      title: "Encontre o que você procura.",
      items: [
        { label: "Novidades", description: "Últimas chegadas do Brasil" },
        { label: "Bolsas de Couro", description: "Couro premium artesanal" },
        { label: "Pequenos Artigos", description: "Carteiras, porta-cartões e essenciais" },
        { label: "Sapatos", description: "Calçados de destaque" },
        { label: "Acessórios", description: "Cintos, joias e mais" },
        { label: "Kits Presente", description: "Curadoria para alguém especial" },
        { label: "Mais Vendidos", description: "Peças mais procuradas" },
      ],
    },
    shopByStyle: {
      eyebrow: "Por propósito",
      title: "Escolha sua peça.",
      items: [
        { label: "Dia a dia", description: "Bolsas estruturadas para toda rotina.", cta: "Ver bolsas" },
        { label: "Presença à noite", description: "Peças de destaque para momentos marcantes.", cta: "Explorar" },
        { label: "Pronto para presentear", description: "Composições com curadoria, entregues com cuidado.", cta: "Montar presente" },
        { label: "Viagem e trabalho", description: "Design funcional, materiais premium.", cta: "Explorar" },
        { label: "Essenciais minimalistas", description: "Linhas limpas, qualidade duradoura.", cta: "Explorar" },
      ],
    },
    services: {
      eyebrow: "Serviço internacional",
      title: "Preparado para clientes globais.",
      items: [
        {
          label: "Experiência localizada",
          description: "Idioma detectado automaticamente. Exibição adapta quando disponível.",
        },
        {
          label: "Checkout seguro",
          description: "Pagamento criptografado via Stripe. Nenhum dado de pagamento armazenado.",
        },
        {
          label: "Entrega rastreada",
          description: "Envio internacional com rastreamento para destinos selecionados.",
        },
        {
          label: "Impostos exibidos antes do pagamento",
          description: "Taxas e impostos aplicáveis exibidos antes da confirmação do pedido.",
        },
        {
          label: "Devoluções por destino",
          description: "Elegibilidade e condições de devolução variam por destino e são exibidas antes da compra.",
        },
        {
          label: "Composição de presente disponível",
          description: "Monte um presente com curadoria, embalagem e mensagem pessoal no gift builder.",
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
      title: "Monte uma composição de presente premium.",
      body: "Selecione peças, escolha a embalagem e adicione uma mensagem pessoal. Uma composição sofisticada entregue com cuidado para clientes internacionais.",
      feature1: "Seleção por categoria e ocasião.",
      feature2: "Adicione embalagem e mensagem pessoal.",
      cta: "Montar composição",
    },
    lead: {
      eyebrow: "Lista privada de drops",
      title: "Acesse primeiro os drops internacionais.",
      body: "Entre na lista privada para novidades, peças de couro limitadas e atualizações de disponibilidade internacional. Primeiro acesso para destinos selecionados.",
      emailPlaceholder: "seu@email.com",
      regionLabel: "De onde você está comprando?",
      regionDefault: "Selecione sua região",
      interestLabel: "Tenho interesse em",
      cta: "Entrar na lista privada",
      microcopy: "Sem spam. Apenas drops e atualizações de disponibilidade.",
      successTitle: "Você está na lista.",
      successBody: "Entraremos em contato quando novos drops estiverem disponíveis para o seu destino.",
      error: "Algo deu errado. Por favor, tente novamente.",
      errorRetry: "Tentar novamente",
    },
    trust: {
      eyebrow: "Por que comprar conosco",
      items: [
        { label: "Checkout seguro via Stripe", sub: "Processamento de pagamento criptografado" },
        { label: "Entrega internacional rastreada", sub: "Estimativa no checkout por destino" },
        { label: "Aviso de impostos por destino", sub: "Impostos e taxas exibidos antes do pagamento" },
        { label: "Devoluções por destino", sub: "Política e condições exibidas antes do pagamento" },
      ],
      footer:
        "Condições de entrega, impostos e devolução exibidas conforme seu destino antes do pagamento.",
    },
  },
};

export function getDictionary(locale: HomeLocale): HomeDictionary {
  return DICT[locale] ?? DICT.en;
}
