import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";

interface Props {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: Props) {
  return (
    <Link
      href={`/product/${product.id}`}
      className={`group block animate-fade-up stagger-${Math.min(index + 1, 6)}`}
    >
      <div className="card-hover bg-white overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-wine/0 group-hover:bg-wine/10 transition-colors duration-300" />
          <div className="absolute top-3 left-3">
            <span className="bg-beige-light/90 font-body text-[10px] tracking-widest uppercase px-2.5 py-1 text-wine">
              {product.category}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display text-xl font-light text-gray-800 leading-tight">
            {product.name}
          </h3>
          <p className="font-body text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-display text-lg text-wine font-medium">
              R$ {product.price.toLocaleString("pt-BR")}
            </span>
            <span className="font-body text-[10px] tracking-widest uppercase text-gold opacity-0 group-hover:opacity-100 transition-opacity">
              Ver peça →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
