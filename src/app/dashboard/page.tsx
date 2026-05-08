import EditorialButton from "@/components/ui/EditorialButton";
import StatusBadge from "@/components/ui/StatusBadge";
import { getUserOrders } from "@/lib/data/orders";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ORDER_STATUSES, Order } from "@/types";
import Image from "next/image";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
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
  let orders: Order[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    orders = user ? await getUserOrders(user.id) : [];
  }

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
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="cinema-in mb-10 border-b border-ink/10 pb-8">
        {success && (
          <div className="mb-8 border border-ink/15 bg-white/70 px-4 py-3 text-sm text-ink">
            Pedido realizado com sucesso. A equipe iniciará a análise do seu
            perfil corporal.
          </div>
        )}
        <p className="editorial-kicker">Área pessoal</p>
        <h1 className="mt-3 font-display text-6xl font-light leading-none sm:text-8xl">
          Seus pedidos.
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-7 text-ink/55">
          Acompanhe o status das peças sob medida, as fotografias enviadas e o
          conjunto de medidas registrado no escaneamento simulado.
        </p>
      </header>

      {orders.length === 0 ? (
        <section className="cinema-in delay-1 mx-auto max-w-xl py-20 text-center">
          <p className="font-display text-8xl text-ink/10">U</p>
          <h2 className="mt-4 font-display text-4xl font-light">
            Nenhum pedido registrado
          </h2>
          <p className="mt-4 text-sm leading-7 text-ink/50">
            O catálogo está pronto para iniciar sua primeira peça sob medida.
          </p>
          <EditorialButton href="/catalog" className="mt-8">
            Ver catálogo
          </EditorialButton>
        </section>
      ) : (
        <div className="space-y-7">
          {orders.map((order, orderIndex) => {
            const currentStatus = ORDER_STATUSES.indexOf(order.status);

            return (
              <article
                key={order.id}
                className={`cinema-in delay-${Math.min(orderIndex + 1, 4)} editorial-card overflow-hidden`}
              >
                <div className="flex flex-col gap-4 border-b border-ink/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-ink/42">
                      Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-[0.75fr_1.25fr]">
                  <div className="flex gap-4">
                    {order.products?.image_url && (
                      <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-porcelain">
                        <Image
                          src={order.products.image_url}
                          alt={order.products.name}
                          fill
                          className="object-cover grayscale"
                          sizes="96px"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-ink/42">
                        {order.products?.category ?? "Peça"}
                      </p>
                      <h3 className="mt-2 font-display text-4xl font-light leading-none">
                        {order.products?.name ?? "Produto indisponível"}
                      </h3>
                      <p className="mt-3 font-display text-2xl">
                        R${" "}
                        {Number(order.products?.price ?? 0).toLocaleString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {Object.entries(order.measurements ?? {}).map(([key, value]) => (
                        <div key={key} className="border border-ink/10 bg-paper p-3 text-center">
                          <p className="font-display text-2xl">{String(value)}</p>
                          <p className="mt-1 text-[8px] uppercase tracking-[0.18em] text-ink/42">
                            {measureLabels[key] ?? key}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex gap-3">
                      {([
                        ["Frente", order.front_image_url],
                        ["Costas", order.back_image_url],
                      ] as [string, string | null][]).map(([label, url]) =>
                        url ? (
                          <div key={label} className="relative h-24 w-20 overflow-hidden bg-porcelain">
                            <Image
                              src={url}
                              alt={label}
                              fill
                              className="object-cover grayscale"
                              sizes="80px"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1 text-center text-[8px] uppercase tracking-[0.16em] text-paper">
                              {label}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>

                    <div className="mt-7 grid grid-cols-3 gap-2">
                      {ORDER_STATUSES.map((status, index) => (
                        <div key={status}>
                          <div
                            className={`h-px ${
                              index <= currentStatus ? "bg-ink" : "bg-ink/12"
                            }`}
                          />
                          <p
                            className={`mt-2 text-[8px] uppercase tracking-[0.18em] ${
                              index <= currentStatus ? "text-ink" : "text-ink/35"
                            }`}
                          >
                            {status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-10 text-center">
          <EditorialButton href="/catalog" variant="outline">
            Novo pedido
          </EditorialButton>
        </div>
      )}
    </div>
  );
}
