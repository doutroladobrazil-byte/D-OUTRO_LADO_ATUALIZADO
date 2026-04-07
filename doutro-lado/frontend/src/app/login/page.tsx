import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect = "/account", error } = await searchParams;

  return (
    <LoginForm
      defaultRedirect={redirect}
      initialError={error === "auth_callback_failed" ? "Falha na autenticacao via provedor externo. Tente novamente." : undefined}
    />
  );
}
