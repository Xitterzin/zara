import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface Props {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: Props) {
  return (
    <Link
      href={`/product/${product.id}`}
      className={`group block cinema-in delay-${Math.min(index + 1, 4)}`}
    >
      <article className="border border-ink/10 bg-white/70 transition duration-500 group-hover:-translate-y-1 group-hover:border-ink/30">
        <div className="relative aspect-[3/4] overflow-hidden bg-porcelain">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          <span className="absolute left-3 top-3 bg-paper px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-ink/70">
            {product.category ?? "Sob medida"}
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-ink/42">
            Sob medida
          </p>
          <h3 className="mt-2 font-display text-2xl font-light leading-none text-ink">
            {product.name}
          </h3>
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink/55">
            {product.description}
          </p>
          <div className="mt-5 flex items-end justify-between gap-3">
            <span className="font-display text-xl text-ink">
              R$ {Number(product.price).toLocaleString("pt-BR")}
            </span>
            <span className="text-[9px] uppercase tracking-[0.28em] text-ink/45 transition group-hover:text-ink">
              Ver peça
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
