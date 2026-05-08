"use client";

import BrandLogo from "@/components/brand/BrandLogo";
import EditorialButton from "@/components/ui/EditorialButton";
import { mockProducts } from "@/lib/products";
import { createClient } from "@/lib/supabase/client";
import { uploadBodyPhoto, validateBodyPhoto } from "@/lib/data/uploads";
import { Measurements, Product } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

type Step = "measures" | "photo" | "analyzing" | "summary";

const ANALYSIS_STEPS = [
  "Analisando proporções...",
  "Calculando medidas...",
  "Gerando modelo corporal...",
  "Finalizando ajustes...",
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
  const productId = searchParams.get("product") ?? mockProducts[0].id;
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [product, setProduct] = useState<Product>(
    mockProducts.find((item) => item.id === productId) ?? mockProducts[0]
  );
  const [step, setStep] = useState<Step>("measures");
  const [measures, setMeasures] = useState<Partial<Measurements>>({});
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()
      .then(({ data }) => {
        if (active && data) {
          setProduct({ ...data, price: Number(data.price) } as Product);
        }
      });

    return () => {
      active = false;
    };
  }, [productId, supabase]);

  useEffect(() => {
    if (step !== "analyzing") return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setAnalysisProgress(Math.min(progress, 100));
      setAnalysisStep(Math.min(Math.floor(progress / 26), ANALYSIS_STEPS.length - 1));

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep("summary"), 600);
      }
    }, 58);

    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [frontPreview, backPreview]);

  const handleMeasureChange = (key: keyof Measurements, value: string) => {
    setMeasures((current) => ({
      ...current,
      [key]: value ? Number(value) : undefined,
    }));
  };

  const handlePhoto = (side: "front" | "back", file: File) => {
    const validation = validateBodyPhoto(file);
    if (validation) {
      setError(validation);
      return;
    }

    const preview = URL.createObjectURL(file);
    setError("");

    if (side === "front") {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontPhoto(file);
      setFrontPreview(preview);
    } else {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackPhoto(file);
      setBackPreview(preview);
    }
  };

  const completeMeasures = MEASURE_FIELDS.every(
    (field) => measures[field.key] !== undefined
  );

  const finalMeasures = measures as Measurements;

  const finalize = async () => {
    setSubmitting(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    try {
      if (!frontPhoto || !backPhoto) throw new Error("Envie as duas fotos.");

      const [frontUrl, backUrl] = await Promise.all([
        uploadBodyPhoto(user.id, frontPhoto, "front"),
        uploadBodyPhoto(user.id, backPhoto, "back"),
      ]);

      const { error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        product_id: product.id,
        measurements: finalMeasures,
        front_image_url: frontUrl,
        back_image_url: backUrl,
        status: "Em análise",
      });

      if (orderError) throw orderError;
      router.push("/dashboard?success=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao finalizar pedido.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="mb-10 grid gap-5 border-b border-ink/10 pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="editorial-kicker">Escaneamento simulado</p>
          <h1 className="mt-3 font-display text-5xl font-light leading-none sm:text-7xl">
            Medidas sob medida.
          </h1>
        </div>
        <div className="flex items-center gap-4 border border-ink/10 bg-white/70 p-3">
          <div className="relative h-20 w-16 overflow-hidden bg-porcelain">
            {product.image_url && (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover grayscale"
                sizes="64px"
              />
            )}
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.26em] text-ink/42">
              Peça selecionada
            </p>
            <p className="font-display text-2xl">{product.name}</p>
            <p className="text-xs text-ink/55">
              R$ {Number(product.price).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-4 gap-2">
        {[
          ["measures", "Medidas"],
          ["photo", "Fotos"],
          ["analyzing", "Análise"],
          ["summary", "Resumo"],
        ].map(([id, label], index) => {
          const order = ["measures", "photo", "analyzing", "summary"];
          const active = order.indexOf(step) >= index;
          return (
            <div key={id} className="border-t border-ink/10 pt-3">
              <span
                className={`text-[9px] uppercase tracking-[0.24em] ${
                  active ? "text-ink" : "text-ink/35"
                }`}
              >
                0{index + 1} {label}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === "measures" && (
          <motion.form
            key="measures"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            onSubmit={(event) => {
              event.preventDefault();
              if (!completeMeasures) {
                setError("Preencha todas as medidas antes de continuar.");
                return;
              }
              setError("");
              setStep("photo");
            }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="font-display text-5xl font-light">Suas proporções</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-ink/55">
              Informe as medidas em centímetros. A experiência é simulada, mas o
              pedido fictício registra os dados para acompanhamento.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {MEASURE_FIELDS.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.26em] text-ink/45">
                    {field.label}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    className="input-unique"
                    value={measures[field.key] ?? ""}
                    onChange={(e) => handleMeasureChange(field.key, e.target.value)}
                    required
                  />
                  <span className="mt-1 block text-[11px] text-ink/42">
                    {field.hint}
                  </span>
                </label>
              ))}
            </div>
            {error && <p className="mt-5 text-sm text-ink">{error}</p>}
            <EditorialButton type="submit" className="mt-8 w-full sm:w-auto">
              Próximo: fotografias
            </EditorialButton>
          </motion.form>
        )}

        {step === "photo" && (
          <motion.div
            key="photo"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className="mx-auto max-w-4xl"
          >
            <h2 className="font-display text-5xl font-light">Registro visual</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-ink/55">
              Envie uma fotografia frontal e uma traseira. Use boa iluminação e
              fundo limpo para reforçar a simulação.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6">
              {[
                { side: "front" as const, label: "Frente", preview: frontPreview, ref: frontRef },
                { side: "back" as const, label: "Costas", preview: backPreview, ref: backRef },
              ].map(({ side, label, preview, ref }) => (
                <div key={side}>
                  <button
                    type="button"
                    onClick={() => ref.current?.click()}
                    className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden border border-dashed border-ink/25 bg-white/60 transition hover:border-ink"
                  >
                    {preview ? (
                      <Image
                        src={preview}
                        alt={label}
                        fill
                        className="object-cover grayscale"
                        sizes="(max-width: 768px) 50vw, 300px"
                      />
                    ) : (
                      <span className="px-4 text-center text-[10px] uppercase tracking-[0.28em] text-ink/45">
                        Selecionar {label}
                      </span>
                    )}
                  </button>
                  <input
                    ref={ref}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && handlePhoto(side, e.target.files[0])
                    }
                  />
                </div>
              ))}
            </div>
            {error && <p className="mt-5 text-sm text-ink">{error}</p>}
            <div className="mt-8 flex gap-3">
              <EditorialButton variant="outline" onClick={() => setStep("measures")}>
                Voltar
              </EditorialButton>
              <EditorialButton
                onClick={() => {
                  if (!frontPhoto || !backPhoto) {
                    setError("Envie as duas fotos para continuar.");
                    return;
                  }
                  setError("");
                  setStep("analyzing");
                }}
              >
                Analisar
              </EditorialButton>
            </div>
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-2xl py-12 text-center"
          >
            <BrandLogo variant="monogram" className="mx-auto h-24 w-24" />
            <div className="relative mx-auto mt-10 h-72 max-w-sm overflow-hidden border border-ink/10 bg-white/55">
              <div className="absolute inset-x-8 top-10 bottom-10 rounded-full border border-ink/20" />
              <div className="scan-line absolute left-0 right-0 top-0 h-px bg-ink" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-7xl text-ink/10">UNIQUE</span>
              </div>
            </div>
            <h2 className="mt-8 font-display text-4xl font-light">
              {ANALYSIS_STEPS[analysisStep]}
            </h2>
            <div className="mx-auto mt-6 h-px max-w-sm bg-ink/10">
              <div
                className="h-px bg-ink transition-all"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-ink/45">
              {Math.round(analysisProgress)}%
            </p>
          </motion.div>
        )}

        {step === "summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className="mx-auto max-w-5xl"
          >
            <div className="text-center">
              <p className="editorial-kicker">Análise concluída</p>
              <h2 className="mt-3 font-display text-5xl font-light">
                Resumo do pedido
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Frente", frontPreview],
                  ["Costas", backPreview],
                ].map(([label, preview]) => (
                  <div key={label}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-porcelain">
                      {preview && (
                        <Image
                          src={preview}
                          alt={label}
                          fill
                          className="object-cover grayscale"
                          sizes="240px"
                        />
                      )}
                    </div>
                    <p className="mt-2 text-center text-[10px] uppercase tracking-[0.26em] text-ink/45">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="editorial-card p-5 sm:p-8">
                <p className="editorial-kicker">Medidas registradas</p>
                <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4">
                  {MEASURE_FIELDS.map((field) => (
                    <div key={field.key} className="border-b border-ink/10 pb-3">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-ink/42">
                        {field.label}
                      </p>
                      <p className="mt-1 font-display text-3xl">
                        {finalMeasures[field.key]}{" "}
                        <span className="text-sm text-ink/42">cm</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-ink/10 pt-6">
                  <p className="font-display text-3xl">{product.name}</p>
                  <p className="mt-1 text-sm text-ink/55">
                    R$ {Number(product.price).toLocaleString("pt-BR")}
                  </p>
                </div>

                {error && <p className="mt-5 text-sm text-ink">{error}</p>}
                <EditorialButton
                  onClick={finalize}
                  disabled={submitting}
                  className="mt-8 w-full"
                >
                  {submitting ? "Finalizando" : "Confirmar pedido"}
                </EditorialButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <BrandLogo variant="monogram" className="h-24 w-24" />
        </div>
      }
    >
      <ScanContent />
    </Suspense>
  );
}
