"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createClient } from "@/lib/supabase/client";

type Props = {
  defaultRedirect: string;
  initialError?: string;
};

export function LoginForm({ defaultRedirect, initialError }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(defaultRedirect);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMessage("Verifique seu email para confirmar o cadastro.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(defaultRedirect)}`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-6">
          <SectionHeading
            eyebrow="Autenticacao premium"
            title="Acesse sua conta D'OUTRO LADO."
            description="Email e senha, ou Google. Sessao persistente com seguranca Supabase Auth."
          />
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm uppercase tracking-[0.18em] text-white transition duration-300 hover:-translate-y-0.5 hover:border-gold/45"
            >
              Continuar com Google
            </button>
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-full border border-white/5 bg-white/[0.02] px-5 py-4 text-sm uppercase tracking-[0.18em] text-white/30"
            >
              Continuar com Apple (em breve)
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); }}
              className={`transition ${mode === "signin" ? "text-gold" : "text-white/40 hover:text-white/70"}`}
            >
              Entrar
            </button>
            <span className="text-white/20">|</span>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className={`transition ${mode === "signup" ? "text-gold" : "text-white/40 hover:text-white/70"}`}
            >
              Criar conta
            </button>
          </div>
        </GlassCard>

        <GlassCard className="space-y-5">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none placeholder:text-white/25 focus:border-gold/45"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none placeholder:text-white/25 focus:border-gold/45"
            />

            {error && (
              <p className="rounded-[14px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="rounded-[14px] border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full border border-gold bg-gold px-5 py-4 text-sm uppercase tracking-[0.18em] text-black transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Aguarde..."
                : mode === "signin"
                  ? "Entrar"
                  : "Criar conta"}
            </button>
          </form>
        </GlassCard>
      </div>
    </main>
  );
}
