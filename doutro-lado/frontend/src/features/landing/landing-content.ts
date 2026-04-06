import type { Metadata } from "next";

export type LandingContent = {
  slug: "casa" | "moda";
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
  casa: {
    slug: "casa",
    route: "/casa-decoracao",
    heroEyebrow: "Landing de aquisicao / Casa e decoracao",
    heroTitle: "Casa, ceramica, decoracao e arte com curadoria premium internacional.",
    heroDescription:
      "Pagina de entrada pensada para usuarios com intencao de busca em casa, decoracao, ceramica e arte. A jornada reduz ruído e leva direto ao universo correspondente.",
    heroImage: "/images/slider-casa-temp.svg",
    heroImageAlt: "Imagem temporaria da landing de casa e decoracao",
    ctaPrimary: { label: "Explorar casa e decoracao", href: "/brands/casa" },
    ctaSecondary: { label: "Ver composicao de presente", href: "/gift-builder" },
    intentTitle: "Conteudo orientado para decoracao, interiores, objetos e presentes autorais.",
    intentDescription:
      "Separada do universo moda para receber trafego de campanhas e pesquisas focadas em decoracao, ceramica, mesa posta, arte e presentes para casa.",
    bullets: [
      "Curadoria visual e editorial propria para casa e decoracao.",
      "Mensagem alinhada a buscas por ceramica, decoracao e arte.",
      "Preparada para campanhas com SEO, UTMs e tracking especificos."
    ],
    seoTitle: "Casa, decoracao e ceramica premium | D'OUTRO LADO",
    seoDescription:
      "Explore o universo premium de casa, decoracao, ceramica e arte da D'OUTRO LADO. Landing pensada para intencao de busca editorial e conversao qualificada.",
    keywords: ["casa premium", "decoracao premium", "ceramica brasileira", "arte para interiores", "presentes para casa"]
  },
  moda: {
    slug: "moda",
    route: "/couro-acessorios",
    heroEyebrow: "Landing de aquisicao / Couro e acessorios",
    heroTitle: "Acessorios, bolsas, sapatos e couro premium para um publico especifico.",
    heroDescription:
      "Pagina de entrada pensada para usuarios com intencao de busca em couro, bolsas, sapatos e acessorios. A navegacao concentra a mensagem e melhora a segmentacao das campanhas.",
    heroImage: "/images/slider-moda-temp.svg",
    heroImageAlt: "Imagem temporaria da landing de couro e acessorios",
    ctaPrimary: { label: "Explorar couro e acessorios", href: "/brands/moda" },
    ctaSecondary: { label: "Ver composicao de presente", href: "/gift-builder" },
    intentTitle: "Conteudo orientado para bolsas, sapatos, couro e acessorios de alto valor percebido.",
    intentDescription:
      "Separada do universo casa para receber trafego de pesquisas e anuncios com foco em moda, couro, bolsas, sapatos e presentes sofisticados.",
    bullets: [
      "Curadoria visual propria para couro, bolsas, sapatos e acessorios.",
      "Mensagem alinhada a buscas por moda premium e leather goods.",
      "Preparada para campanhas com SEO, UTMs e tracking especificos."
    ],
    seoTitle: "Bolsas, sapatos e acessorios premium | D'OUTRO LADO",
    seoDescription:
      "Conheca o universo premium de couro, bolsas, sapatos e acessorios da D'OUTRO LADO. Landing focada em intencao de busca e trafego qualificado.",
    keywords: ["bolsas premium", "sapatos premium", "acessorios em couro", "moda premium", "leather goods"]
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
