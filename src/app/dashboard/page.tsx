import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Order } from "@/types";
import Image from "next/image";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockProducts } from "@/lib/products";

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let orders: Order[] = [];
  if (user) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    orders = (data ?? []) as Order[];
  }

  // Enrich with product data from mock (fallback if DB join not configured)
  const enriched = orders.map((o) => ({
    ...o,
    products: mockProducts.find((p) => p.id === o.product_id),
  }));

  const measureLabels: Record<string, string> = {
    busto: "Busto",
    cintura: "Cintura",
    quadril: "Quadril",
    ombros: "Ombros",
    bracos: "Braços",
    coxas: "Coxas",
    costas: "Costas",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 font-body text-sm px-4 py-3 flex items-center gap-2">
            <span>✓</span>
            <span>Pedido realizado com sucesso! Nossa equipe entrará em contato em breve.</span>
          </div>
        )}
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-2">Área Pessoal</p>
        <h1 className="font-display text-5xl font-light text-gray-800">Meus Pedidos</h1>
        <div className="ornament-divider mt-3 max-w-[200px]">
          <span className="font-display italic text-gray-400 text-sm">exclusivo para você</span>
        </div>
      </div>

      {/* Empty state */}
      {enriched.length === 0 && (
        <div className="text-center py-20 animate-fade-up">
          <div className="font-display text-8xl text-beige-dark mb-4">✦</div>
          <h2 className="font-display text-3xl font-light text-gray-500 mb-2">
            Nenhum pedido ainda
          </h2>
          <p className="font-body text-sm text-gray-400 mb-8">
            Explore o catálogo e crie seu primeiro look sob medida.
          </p>
          <Link href="/catalog" className="btn-primary inline-block">
            Ver Catálogo
          </Link>
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-6">
        {enriched.map((order, i) => (
          <div
            key={order.id}
            className={`bg-white animate-fade-up stagger-${Math.min(i + 1, 6)}`}
          >
            {/* Order header */}
            <div className="flex items-center justify-between p-4 border-b border-beige">
              <div>
                <p className="font-body text-[10px] tracking-widest uppercase text-gray-400">
                  Pedido #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="font-body text-xs text-gray-500 mt-0.5">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Product info */}
            <div className="p-4 flex gap-4">
              {order.products && (
                <div className="relative w-16 h-20 overflow-hidden shrink-0">
                  <Image
                    src={order.products.image_url}
                    alt={order.products.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-display text-2xl font-light text-gray-800">
                  {order.products?.name ?? "Produto"}
                </h3>
                <p className="font-body text-xs text-gray-400 mt-0.5">
                  {order.products?.category}
                </p>
                <p className="font-display text-lg text-wine mt-1">
                  R$ {(order.products?.price ?? 0).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>

            {/* Measurements grid */}
            {order.measurements && (
              <div className="px-4 pb-4">
                <p className="font-body text-[10px] tracking-widest uppercase text-gray-400 mb-2">
                  Medidas registradas
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {Object.entries(order.measurements).map(([k, v]) => (
                    <div key={k} className="bg-beige-light text-center p-2">
                      <p className="font-display text-lg text-gray-800">{v}</p>
                      <p className="font-body text-[9px] text-gray-400 uppercase tracking-wide">
                        {measureLabels[k] ?? k}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {(order.front_image_url || order.back_image_url) && (
              <div className="px-4 pb-4 flex gap-3">
                {[
                  { label: "Frente", url: order.front_image_url },
                  { label: "Costas", url: order.back_image_url },
                ].map(({ label, url }) =>
                  url ? (
                    <div key={label} className="relative w-16 h-20 overflow-hidden">
                      <Image src={url} alt={label} fill className="object-cover" sizes="64px" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white font-body text-[8px] text-center py-0.5">
                        {label}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}

            {/* Status timeline */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-0">
                {(["Em análise", "Em produção", "Finalizado"] as const).map((s, i, arr) => {
                  const statusOrder = ["Em análise", "Em produção", "Finalizado"];
                  const current = statusOrder.indexOf(order.status);
                  const done = i <= current;
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center ${
                          done ? "bg-wine text-beige-light" : "bg-beige-dark text-gray-400"
                        }`}>
                          {i < current ? "✓" : i + 1}
                        </div>
                        <span className={`font-body text-[9px] text-center mt-0.5 whitespace-nowrap ${
                          done ? "text-wine" : "text-gray-300"
                        }`}>
                          {s}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`flex-1 h-px mx-1 mb-3 ${done && i < current ? "bg-wine" : "bg-beige-dark"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {enriched.length > 0 && (
        <div className="mt-8 text-center">
          <Link href="/catalog" className="btn-outline inline-block">
            Novo Pedido
          </Link>
        </div>
      )}
    </div>
  );
}
