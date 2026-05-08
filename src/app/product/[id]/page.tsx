import EditorialButton from "@/components/ui/EditorialButton";
import ProductCard from "@/components/ui/ProductCard";
import { getProductById, getProducts } from "@/lib/data/products";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [product, products] = await Promise.all([getProductById(id), getProducts()]);

  if (!product) notFound();

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <nav className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-ink/42">
        <Link href="/catalog" className="transition hover:text-ink">
          Catálogo
        </Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="cinema-in relative aspect-[4/5] overflow-hidden bg-porcelain">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              className="object-cover grayscale"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          )}
        </div>

        <div className="cinema-in delay-2 flex flex-col justify-center">
          <p className="editorial-kicker">{product.category ?? "Sob medida"}</p>
          <h1 className="mt-5 font-display text-6xl font-light leading-[0.92] sm:text-7xl">
            {product.name}
          </h1>
          <div className="editorial-rule my-8" />
          <p className="max-w-xl text-base leading-8 text-ink/60">
            {product.description}
          </p>

          <dl className="mt-9 grid gap-4 border-y border-ink/10 py-6 text-sm">
            {[
              ["Tecido", "Selecionado a partir das suas medidas"],
              ["Prazo", "15 a 21 dias úteis após aprovação"],
              ["Ajustes", "Incluídos no pedido"],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[7rem_1fr] gap-4">
                <dt className="text-[10px] uppercase tracking-[0.28em] text-ink/42">
                  {label}
                </dt>
                <dd className="text-ink/65">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-ink/42">
                Investimento
              </p>
              <p className="mt-1 font-display text-5xl">
                R$ {Number(product.price).toLocaleString("pt-BR")}
              </p>
            </div>
            <EditorialButton href={`/scan?product=${product.id}`}>
              Escolher look
            </EditorialButton>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-20 border-t border-ink/10 pt-10">
          <p className="editorial-kicker">Também na coleção</p>
          <div className="mt-8 grid grid-cols-3 gap-4 md:gap-6">
            {related.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
