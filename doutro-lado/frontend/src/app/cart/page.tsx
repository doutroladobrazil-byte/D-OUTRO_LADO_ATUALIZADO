import { redirect } from "next/navigation";

// Rota canonica do carrinho e /brands/moda/cart (com estado real do Zustand/backend).
// Esta rota generica redireciona para evitar confusao de URL e exibicao de dados mockados.
export default function CartRedirectPage() {
  redirect("/brands/moda/cart");
}
