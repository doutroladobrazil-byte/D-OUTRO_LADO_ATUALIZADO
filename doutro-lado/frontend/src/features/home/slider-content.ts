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
    id: "couro",
    href: "/brands/moda",
    eyebrow: "Couro e acessorios",
    title: "Bolsas, sapatos e acessorios em couro com presenca premium.",
    description:
      "Uma direcao visual densa e exclusiva para colecoes de couro, bolsas e sapatos com acabamento de luxo silencioso.",
    ctaLabel: "Explorar colecoes",
    imageSrc: "/images/slider-moda-temp.svg",
    imageAlt: "Imagem da colecao de couro e acessorios D'OUTRO LADO"
  },
  {
    id: "moda",
    href: "/brands/moda",
    eyebrow: "Moda editorial",
    title: "Vestuario e acessorios com narrativa autoral e materialidade de referencia.",
    description:
      "Pecas que existem antes de serem usadas. Curadoria de moda premium com origem brasileira e leitura internacional.",
    ctaLabel: "Ver a colecao",
    imageSrc: "/images/slider-moda-temp.svg",
    imageAlt: "Colecao editorial de moda D'OUTRO LADO"
  },
  {
    id: "presentes",
    href: "/gift-builder",
    eyebrow: "Composicao de presente",
    title: "Kits editoriais montados com couro, acessorios e embalagem exclusiva.",
    description:
      "Presentes sofisticados para ocasioes que exigem presenca. Selecao intuitiva, entrega com acabamento premium.",
    ctaLabel: "Montar composicao",
    imageSrc: "/images/slider-moda-temp.svg",
    imageAlt: "Kit presente editorial D'OUTRO LADO"
  }
];
