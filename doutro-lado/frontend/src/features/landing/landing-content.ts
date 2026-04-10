import type { Metadata } from "next";

export type LandingContent = {
  slug: "moda";
  route: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  heroImageAlt: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  intentTitle: string;
  intentDescription: string;
  bullets: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
};

export const landingContent: Record<LandingContent["slug"], LandingContent> = {
  moda: {
    slug: "moda",
    route: "/couro-acessorios",
    heroEyebrow: "Moda, couro e acessorios premium",
    heroTitle: "Acessorios, bolsas, sapatos e couro premium com origem brasileira.",
    heroDescription:
      "Curadoria editorial de moda premium para o mercado internacional. Couro legitimo, series limitadas, acabamento de referencia e identidade unica para cada peca.",
    heroImage: "/images/slider-moda-temp.svg",
    heroImageAlt: "Colecao de couro e acessorios D'OUTRO LADO",
    ctaPrimary: { label: "Explorar colecoes", href: "/brands/moda" },
    ctaSecondary: { label: "Montar presente", href: "/gift-builder" },
    intentTitle: "Moda, couro, bolsas e acessorios com curadoria e materialidade de referencia.",
    intentDescription:
      "Um storefront dedicado a moda premium brasileira com leitura internacional. Pecas selecionadas por materialidade, exclusividade e narrativa editorial.",
    bullets: [
      "Couro bovino selecionado com curtimento natural e acabamento premium.",
      "Series limitadas com numero de controle e identidade propria.",
      "Curadoria por materialidade — sem volume, com presenca."
    ],
    seoTitle: "Bolsas, sapatos e acessorios em couro premium | D'OUTRO LADO",
    seoDescription:
      "Moda premium brasileira com leitura internacional. Couro legitimo, bolsas, sapatos e acessorios com curadoria editorial exclusiva — D'OUTRO LADO.",
    keywords: ["bolsas premium", "sapatos couro", "acessorios em couro", "moda premium brasileira", "leather goods internacionais", "couro legitimo", "moda editorial"]
  }
};

export function buildLandingMetadata(content: LandingContent): Metadata {
  return {
    title: content.seoTitle,
    description: content.seoDescription,
    keywords: content.keywords,
    openGraph: {
      title: content.seoTitle,
      description: content.seoDescription,
      images: [{ url: content.heroImage, alt: content.heroImageAlt }]
    },
    twitter: {
      card: "summary_large_image",
      title: content.seoTitle,
      description: content.seoDescription,
      images: [content.heroImage]
    }
  };
}
