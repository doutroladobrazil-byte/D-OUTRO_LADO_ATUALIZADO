export type SkuReadinessStatus =
  | "pronto"
  | "sem-paises"
  | "sem-midia"
  | "sem-estoque"
  | "inativo";

export type SkuReadiness = {
  status: SkuReadinessStatus;
  label: string;
  className: string;
  hint: string;
};

export function getSkuReadiness(p: {
  isActive: boolean;
  countriesEnabled: number;
  mediaCount: number;
  stock: number;
}): SkuReadiness {
  if (!p.isActive)
    return { status: "inativo", label: "Inativo", className: "text-white/30", hint: "" };
  if (p.countriesEnabled === 0)
    return { status: "sem-paises", label: "Sem países", className: "text-red-400", hint: "Invisível para todos os compradores" };
  if (p.mediaCount === 0)
    return { status: "sem-midia", label: "Sem mídia", className: "text-amber-400", hint: "Produto sem vitrine adequada" };
  if (p.stock === 0)
    return { status: "sem-estoque", label: "Sem estoque", className: "text-orange-400", hint: "Ativo mas sem unidades disponíveis" };
  return { status: "pronto", label: "Pronto", className: "text-emerald-400", hint: "" };
}
