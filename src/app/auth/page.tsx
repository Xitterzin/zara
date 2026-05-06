"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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
        setMessage("Conta criada! Verifique seu e-mail ou faça login.");
        setMode("login");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-beige-light flex">
      {/* Left panel - decoration */}
      <div className="hidden lg:flex lg:w-1/2 bg-wine relative overflow-hidden flex-col items-center justify-center p-16">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #EDE5D8 0, #EDE5D8 1px, transparent 0, transparent 50%)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 text-center">
          <div className="font-display text-7xl font-light text-beige tracking-[0.3em] mb-2">
            ÚNICA
          </div>
          <div className="ornament-divider my-6">
            <span className="font-display text-gold font-light italic text-lg">
              Cada peça, única como você
            </span>
          </div>
          <p className="font-body text-beige/60 text-sm tracking-wide max-w-xs leading-relaxed">
            Roupas criadas exclusivamente para o contorno do seu corpo. Da medida ao acabamento, tudo pensado para você.
          </p>
          {/* Decorative circles */}
          <div className="mt-12 flex justify-center gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full border border-gold/40"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <span className="font-display text-4xl font-light tracking-[0.3em] text-wine">
              Ú<span className="text-gold">N</span>ICA
            </span>
          </div>

          <h1 className="font-display text-4xl font-light text-gray-800 mb-2">
            {mode === "login" ? "Bem-vinda de volta" : "Criar conta"}
          </h1>
          <p className="font-body text-sm text-gray-500 mb-8">
            {mode === "login"
              ? "Entre para acessar seus pedidos exclusivos."
              : "Inicie sua jornada de moda sob medida."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="font-body text-xs tracking-widest uppercase text-gray-500 block mb-1.5">
                  Nome completo
                </label>
                <input
                  type="text"
                  className="input-unica"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="font-body text-xs tracking-widest uppercase text-gray-500 block mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                className="input-unica"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-body text-xs tracking-widest uppercase text-gray-500 block mb-1.5">
                Senha
              </label>
              <input
                type="password"
                className="input-unica"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="font-body text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
                {error}
              </p>
            )}
            {message && (
              <p className="font-body text-xs text-green-700 bg-green-50 px-3 py-2 rounded">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="loading-dots">
                  <span>•</span><span>•</span><span>•</span>
                </span>
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Criar minha conta"
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-8 text-center">
            <span className="font-body text-xs text-gray-400">
              {mode === "login" ? "Não tem conta?" : "Já tem conta?"}
            </span>{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="font-body text-xs text-wine hover:text-wine-dark underline underline-offset-4"
            >
              {mode === "login" ? "Criar agora" : "Fazer login"}
            </button>
          </div>

          {/* Ornament */}
          <div className="mt-10 flex justify-center">
            <span className="font-display italic text-gold/50 text-sm">✦</span>
          </div>
        </div>
      </div>
    </div>
  );
}
