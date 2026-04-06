export type HomeSliderItem = {
  id: string;
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  imageSrc: string;
  imageAlt: string;
};

export const homeSliderItems: HomeSliderItem[] = [
  {
    id: "casa",
    href: "/casa-decoracao",
    eyebrow: "Casa e decoracao",
    title: "Ceramica, mesa, texturas naturais e interiores editoriais.",
    description:
      "Um universo calmo, artesanal e sofisticado para presentes, objetos e composicoes de casa com leitura internacional.",
    ctaLabel: "Entrar em casa e decoracao",
    imageSrc: "/images/slider-casa-temp.svg",
    imageAlt: "Imagem temporaria para o universo casa e decoracao"
  },
  {
    id: "moda",
    href: "/couro-acessorios",
    eyebrow: "Couro e acessorios",
    title: "Bolsas, sapatos e acessorios em couro com presenca premium.",
    description:
      "Uma direcao visual mais densa e exclusiva para colecoes de couro, bolsas e sapatos com acabamento de luxo silencioso.",
    ctaLabel: "Entrar em couro e acessorios",
    imageSrc: "/images/slider-moda-temp.svg",
    imageAlt: "Imagem temporaria para o universo couro e acessorios"
  }
];
