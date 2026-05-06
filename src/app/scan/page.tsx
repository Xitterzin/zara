"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { mockProducts } from "@/lib/products";
import { Measurements } from "@/types";

type Step = "measures" | "photo" | "analyzing" | "summary";

const ANALYSIS_STEPS = [
  "Analisando proporções…",
  "Calculando medidas…",
  "Gerando modelo corporal…",
  "Finalizando ajustes…",
];

const MEASURE_FIELDS: { key: keyof Measurements; label: string; hint: string }[] = [
  { key: "busto", label: "Busto", hint: "Maior circunferência do busto" },
  { key: "cintura", label: "Cintura", hint: "Parte mais estreita do tronco" },
  { key: "quadril", label: "Quadril", hint: "Maior circunferência do quadril" },
  { key: "ombros", label: "Ombros", hint: "De ombro a ombro, pelas costas" },
  { key: "bracos", label: "Braços", hint: "Circunferência do braço relaxado" },
  { key: "coxas", label: "Coxas", hint: "Maior circunferência da coxa" },
  { key: "costas", label: "Costas", hint: "Do ombro até a cintura" },
];

function ScanContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product") ?? "1";
  const product = mockProducts.find((p) => p.id === productId) ?? mockProducts[0];

  const router = useRouter();
  const [step, setStep] = useState<Step>("measures");
  const [measures, setMeasures] = useState<Partial<Measurements>>({});
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  // Simulate analysis
  useEffect(() => {
    if (step !== "analyzing") return;
    let idx = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += 2;
      setAnalysisProgress(Math.min(progress, 100));

      if (progress % 25 === 0 && idx < ANALYSIS_STEPS.length - 1) {
        idx++;
        setAnalysisStep(idx);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep("summary"), 500);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [step]);

  const handleMeasureChange = (key: keyof Measurements, val: string) => {
    setMeasures((prev) => ({ ...prev, [key]: parseFloat(val) || undefined }));
  };

  const handlePhoto = (side: "front" | "back", file: File) => {
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setFrontPhoto(file);
      setFrontPreview(url);
    } else {
      setBackPhoto(file);
      setBackPreview(url);
    }
  };

  const handleMeasuresNext = (e: React.FormEvent) => {
    e.preventDefault();
    const allFilled = MEASURE_FIELDS.every((f) => measures[f.key] !== undefined);
    if (!allFilled) {
      setError("Preencha todas as medidas antes de continuar.");
      return;
    }
    setError("");
    setStep("photo");
  };

  const handlePhotoNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontPhoto || !backPhoto) {
      setError("Envie as duas fotos para continuar.");
      return;
    }
    setError("");
    setStep("analyzing");
  };

  const handleFinalize = async () => {
    setSubmitting(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    try {
      let frontUrl: string | null = null;
      let backUrl: string | null = null;

      // Upload photos
      if (frontPhoto) {
        const ext = frontPhoto.name.split(".").pop();
        const path = `${user.id}/${Date.now()}_front.${ext}`;
        const { data, error: upErr } = await supabase.storage
          .from("body-photos")
          .upload(path, frontPhoto, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("body-photos").getPublicUrl(data.path);
        frontUrl = urlData.publicUrl;
      }

      if (backPhoto) {
        const ext = backPhoto.name.split(".").pop();
        const path = `${user.id}/${Date.now()}_back.${ext}`;
        const { data, error: upErr } = await supabase.storage
          .from("body-photos")
          .upload(path, backPhoto, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("body-photos").getPublicUrl(data.path);
        backUrl = urlData.publicUrl;
      }

      // Insert order
      const { error: orderErr } = await supabase.from("orders").insert({
        user_id: user.id,
        product_id: productId,
        measurements: measures,
        front_image_url: frontUrl,
        back_image_url: backUrl,
        status: "Em análise",
      });
      if (orderErr) throw orderErr;

      router.push("/dashboard?success=1");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao finalizar pedido.";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      {/* Product mini header */}
      <div className="flex items-center gap-3 mb-10 p-4 bg-white border-l-2 border-wine">
        <div className="relative w-12 h-16 overflow-hidden shrink-0">
          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="48px" />
        </div>
        <div>
          <p className="font-body text-[10px] tracking-widest uppercase text-gray-400">Peça selecionada</p>
          <p className="font-display text-xl font-light text-gray-800">{product.name}</p>
          <p className="font-body text-xs text-wine">R$ {product.price.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-10">
        {[
          { id: "measures", label: "Medidas" },
          { id: "photo", label: "Fotos" },
          { id: "analyzing", label: "Análise" },
          { id: "summary", label: "Resumo" },
        ].map((s, i, arr) => {
          const stepOrder = ["measures", "photo", "analyzing", "summary"];
          const current = stepOrder.indexOf(step);
          const idx = stepOrder.indexOf(s.id);
          const done = idx < current;
          const active = idx === current;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-body font-medium transition-colors ${
                  done ? "bg-wine text-beige-light" : active ? "bg-wine text-beige-light" : "bg-beige-dark text-gray-400"
                }`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`font-body text-[10px] tracking-widest uppercase mt-1 ${active ? "text-wine" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className={`flex-1 h-px mx-1 mb-4 transition-colors ${done ? "bg-wine" : "bg-beige-dark"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* STEP 1 — MEASURES */}
      {step === "measures" && (
        <form onSubmit={handleMeasuresNext} className="animate-fade-up space-y-5">
          <h2 className="font-display text-4xl font-light text-gray-800">Suas medidas</h2>
          <p className="font-body text-sm text-gray-500 leading-relaxed">
            Informe suas medidas em centímetros. Use uma fita métrica e peça ajuda se necessário.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {MEASURE_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="font-body text-[10px] tracking-widest uppercase text-gray-500 block mb-1">
                  {f.label} <span className="text-gray-300 normal-case tracking-normal">(cm)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  className="input-unica"
                  placeholder="Ex: 88"
                  value={measures[f.key] ?? ""}
                  onChange={(e) => handleMeasureChange(f.key, e.target.value)}
                  required
                />
                <p className="font-body text-[10px] text-gray-400 mt-0.5">{f.hint}</p>
              </div>
            ))}
          </div>

          {error && <p className="font-body text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <button type="submit" className="btn-primary w-full mt-4">
            Próximo — Fotos
          </button>
        </form>
      )}

      {/* STEP 2 — PHOTOS */}
      {step === "photo" && (
        <form onSubmit={handlePhotoNext} className="animate-fade-up space-y-6">
          <h2 className="font-display text-4xl font-light text-gray-800">Escaneamento</h2>
          <p className="font-body text-sm text-gray-500 leading-relaxed">
            Envie uma foto frontal e uma traseira. Vista roupas justas para melhor precisão.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Front */}
            <div>
              <p className="font-body text-[10px] tracking-widest uppercase text-gray-500 mb-2">Frente</p>
              <button
                type="button"
                onClick={() => frontRef.current?.click()}
                className={`w-full aspect-[3/4] border-2 border-dashed flex flex-col items-center justify-center transition-colors overflow-hidden relative ${
                  frontPreview ? "border-wine" : "border-beige-dark hover:border-wine"
                }`}
              >
                {frontPreview ? (
                  <Image src={frontPreview} alt="Frente" fill className="object-cover" sizes="200px" />
                ) : (
                  <>
                    <span className="text-3xl text-gray-300 mb-2">↑</span>
                    <span className="font-body text-xs text-gray-400">Selecionar foto</span>
                  </>
                )}
              </button>
              <input
                ref={frontRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePhoto("front", e.target.files[0])}
              />
            </div>

            {/* Back */}
            <div>
              <p className="font-body text-[10px] tracking-widest uppercase text-gray-500 mb-2">Costas</p>
              <button
                type="button"
                onClick={() => backRef.current?.click()}
                className={`w-full aspect-[3/4] border-2 border-dashed flex flex-col items-center justify-center transition-colors overflow-hidden relative ${
                  backPreview ? "border-wine" : "border-beige-dark hover:border-wine"
                }`}
              >
                {backPreview ? (
                  <Image src={backPreview} alt="Costas" fill className="object-cover" sizes="200px" />
                ) : (
                  <>
                    <span className="text-3xl text-gray-300 mb-2">↑</span>
                    <span className="font-body text-xs text-gray-400">Selecionar foto</span>
                  </>
                )}
              </button>
              <input
                ref={backRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePhoto("back", e.target.files[0])}
              />
            </div>
          </div>

          <div className="bg-beige p-4 text-center">
            <p className="font-body text-xs text-gray-500 leading-relaxed">
              <span className="text-wine font-medium">Dica:</span> Fique em frente a uma parede lisa com boa iluminação.
              Use roupas justas ou de academia para melhor resultado.
            </p>
          </div>

          {error && <p className="font-body text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep("measures")} className="btn-outline flex-1">
              Voltar
            </button>
            <button type="submit" className="btn-primary flex-1">
              Analisar
            </button>
          </div>
        </form>
      )}

      {/* STEP 3 — ANALYZING */}
      {step === "analyzing" && (
        <div className="animate-fade-up text-center py-16">
          {/* Animated body silhouette */}
          <div className="relative w-24 h-36 mx-auto mb-10">
            <div className="absolute inset-0 border-2 border-wine/20 rounded-full animate-pulse2" />
            <div className="absolute inset-3 border border-wine/30 rounded-full animate-pulse2" style={{ animationDelay: "0.3s" }} />
            <div className="absolute inset-6 border border-gold/30 rounded-full animate-pulse2" style={{ animationDelay: "0.6s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-wine animate-pulse" />
            </div>
            {/* Scanning line */}
            <div
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
              style={{
                top: `${analysisProgress}%`,
                transition: "top 0.1s linear",
              }}
            />
          </div>

          <h2 className="font-display text-3xl font-light text-gray-800 mb-2">
            {ANALYSIS_STEPS[analysisStep]}
          </h2>
          <p className="font-body text-xs text-gray-400 mb-8">
            Processando dados biométricos com precisão
          </p>

          {/* Progress bar */}
          <div className="max-w-xs mx-auto">
            <div className="h-1 bg-beige-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-wine to-gold transition-all duration-100"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <p className="font-body text-xs text-gray-400 mt-2">{Math.round(analysisProgress)}%</p>
          </div>

          {/* Steps list */}
          <div className="mt-8 space-y-2 max-w-xs mx-auto">
            {ANALYSIS_STEPS.map((s, i) => (
              <div key={s} className={`flex items-center gap-2 font-body text-xs transition-colors ${
                i < analysisStep ? "text-wine" : i === analysisStep ? "text-gray-800 font-medium" : "text-gray-300"
              }`}>
                <span>{i < analysisStep ? "✓" : i === analysisStep ? "◉" : "○"}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4 — SUMMARY */}
      {step === "summary" && (
        <div className="animate-fade-up space-y-6">
          <div className="text-center">
            <span className="font-body text-xs tracking-widest uppercase text-gold">Análise concluída</span>
            <h2 className="font-display text-4xl font-light text-gray-800 mt-1">Resumo do Pedido</h2>
          </div>

          {/* Photos */}
          <div>
            <p className="font-body text-[10px] tracking-widest uppercase text-gray-400 mb-3">Fotos enviadas</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Frente", src: frontPreview },
                { label: "Costas", src: backPreview },
              ].map(({ label, src }) => (
                <div key={label}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-beige">
                    {src && <Image src={src} alt={label} fill className="object-cover" sizes="200px" />}
                  </div>
                  <p className="font-body text-xs text-gray-400 text-center mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div className="bg-white p-5">
            <p className="font-body text-[10px] tracking-widest uppercase text-gray-400 mb-4">
              Medidas registradas
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {MEASURE_FIELDS.map((f) => (
                <div key={f.key} className="flex justify-between items-baseline border-b border-beige pb-2">
                  <span className="font-body text-xs text-gray-500">{f.label}</span>
                  <span className="font-display text-lg text-gray-800">
                    {measures[f.key]} <span className="text-xs text-gray-400">cm</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="bg-beige p-4 flex items-center gap-3">
            <div className="relative w-12 h-16 overflow-hidden shrink-0">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="48px" />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg font-light text-gray-800">{product.name}</p>
              <p className="font-body text-sm text-wine">R$ {product.price.toLocaleString("pt-BR")}</p>
            </div>
            <span className="font-body text-[10px] tracking-widest uppercase bg-wine text-beige-light px-2 py-1">
              Sob Medida
            </span>
          </div>

          {error && <p className="font-body text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}

          <button
            onClick={handleFinalize}
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting ? (
              <span className="loading-dots"><span>•</span><span>•</span><span>•</span></span>
            ) : (
              "Confirmar Pedido"
            )}
          </button>
          <p className="font-body text-[11px] text-gray-400 text-center">
            Ao confirmar, nossa equipe iniciará a análise do seu perfil corporal.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading-dots font-display text-2xl text-wine">
          <span>•</span><span>•</span><span>•</span>
        </span>
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}
