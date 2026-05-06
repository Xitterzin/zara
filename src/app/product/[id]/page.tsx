import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { mockProducts } from "@/lib/products";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = mockProducts.find((p) => p.id === id);
  if (!product) notFound();

  const related = mockProducts.filter((p) => p.id !== id).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="font-body text-xs tracking-widest uppercase text-gray-400 mb-8 flex items-center gap-2">
        <Link href="/catalog" className="hover:text-wine transition-colors">
          Catálogo
        </Link>
        <span>/</span>
        <span className="text-wine">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Image */}
        <div className="animate-fade-up">
          <div className="relative aspect-[3/4] overflow-hidden bg-white">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute top-4 left-4">
              <span className="bg-beige-light/90 font-body text-[10px] tracking-widest uppercase px-3 py-1.5 text-wine">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="animate-fade-up stagger-2 flex flex-col justify-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Sob Medida
          </p>
          <h1 className="font-display text-5xl font-light text-gray-800 leading-tight">
            {product.name}
          </h1>

          <div className="ornament-divider my-5">
            <span className="font-display italic text-gray-400 text-sm">✦</span>
          </div>

          <p className="font-body text-sm text-gray-500 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Details */}
          <div className="space-y-2 mb-8">
            {[
              { label: "Tecido", value: "Selecionado a partir das suas medidas" },
              { label: "Prazo", value: "15 a 21 dias úteis após aprovação" },
              { label: "Ajustes", value: "Incluídos no pedido" },
            ].map((d) => (
              <div key={d.label} className="flex gap-2 font-body text-xs text-gray-500">
                <span className="text-wine font-medium w-16 shrink-0">{d.label}</span>
                <span>{d.value}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="bg-beige p-5 mb-8">
            <p className="font-body text-xs tracking-widest uppercase text-gray-400 mb-1">
              Investimento
            </p>
            <p className="font-display text-4xl text-wine font-medium">
              R$ {product.price.toLocaleString("pt-BR")}
            </p>
            <p className="font-body text-xs text-gray-400 mt-1">
              ou 3x sem juros
            </p>
          </div>

          {/* CTA */}
          <Link
            href={`/scan?product=${product.id}`}
            className="btn-primary text-center block"
          >
            Escolher este look
          </Link>

          <p className="font-body text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
            Após escolher, você preencherá suas medidas e enviará fotos para análise.
          </p>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-light text-gray-700">
              Você também pode gostar
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {related.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-white mb-2">
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="33vw"
                  />
                </div>
                <p className="font-display text-lg font-light text-gray-700 group-hover:text-wine transition-colors">
                  {p.name}
                </p>
                <p className="font-body text-sm text-gray-400">
                  R$ {p.price.toLocaleString("pt-BR")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
