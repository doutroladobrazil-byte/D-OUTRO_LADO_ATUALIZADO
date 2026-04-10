import { redirect } from "next/navigation";

// Rota canonica do checkout e /brands/moda/checkout (fluxo real com Stripe).
// Esta rota generica redireciona para evitar exibicao de wireframe desconectado.
export default function CheckoutRedirectPage() {
  redirect("/brands/moda/checkout");
}
