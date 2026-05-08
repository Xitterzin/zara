"use client";

import BrandLogo from "@/components/brand/BrandLogo";
import EditorialButton from "@/components/ui/EditorialButton";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("E-mail ou senha inválidos.");
      } else {
        router.push("/catalog");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Conta criada. Verifique seu e-mail ou faça login.");
        setMode("login");
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-ink text-paper lg:block">
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.20),transparent_34%),linear-gradient(120deg,rgba(255,255,255,0.12),transparent_45%)]" />
          </div>
          <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
            <BrandLogo
              variant="horizontal"
              className="h-auto w-72 invert"
              priority
            />
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <p className="text-[11px] uppercase tracking-[0.38em] text-paper/50">
                Moda sob medida
              </p>
              <h1 className="mt-5 font-display text-7xl font-light leading-[0.9] xl:text-8xl">
                A medida como assinatura.
              </h1>
              <p className="mt-8 max-w-md text-sm leading-7 text-paper/58">
                Um protótipo de moda sob medida com atmosfera editorial,
                catálogo curado e pedido acompanhado do primeiro croqui ao
                acabamento.
              </p>
            </motion.div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-paper/35">
              Uma extensão da Zara
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-md"
          >
            <div className="mb-10 text-center lg:hidden">
              <BrandLogo
                variant="horizontal"
                className="mx-auto h-auto w-72"
                priority
              />
            </div>

            <p className="editorial-kicker">
              {mode === "login" ? "Acesso reservado" : "Nova cliente"}
            </p>
            <h2 className="mt-3 font-display text-5xl font-light leading-none">
              {mode === "login" ? "Entrar na UNIQUE" : "Criar conta"}
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink/55">
              {mode === "login"
                ? "Acesse seu catálogo, pedidos e processo de medidas."
                : "Inicie sua jornada de peça sob medida com a UNIQUE."}
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-4">
              {mode === "signup" && (
                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-ink/45">
                    Nome completo
                  </span>
                  <input
                    className="input-unique"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-ink/45">
                  E-mail
                </span>
                <input
                  type="email"
                  className="input-unique"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-ink/45">
                  Senha
                </span>
                <input
                  type="password"
                  className="input-unique"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </label>

              {error && (
                <p className="border border-ink/15 bg-white px-4 py-3 text-xs text-ink">
                  {error}
                </p>
              )}
              {message && (
                <p className="border border-ink/15 bg-porcelain px-4 py-3 text-xs text-ink">
                  {message}
                </p>
              )}

              <EditorialButton type="submit" disabled={loading} className="w-full">
                {loading
                  ? "Processando"
                  : mode === "login"
                    ? "Entrar"
                    : "Criar conta"}
              </EditorialButton>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                  setMessage("");
                }}
                className="text-[11px] uppercase tracking-[0.24em] text-ink/55 underline underline-offset-8 transition hover:text-ink"
              >
                {mode === "login" ? "Criar acesso" : "Já tenho acesso"}
              </button>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
