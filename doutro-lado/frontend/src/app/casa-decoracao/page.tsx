import { redirect } from "next/navigation";

// Casa e decoracao foi descontinuado como universo publico.
// Todo trafego e redirecionado para o catalogo principal de moda.
export default function CasaDecoracaoRedirectPage() {
  redirect("/couro-acessorios");
}
