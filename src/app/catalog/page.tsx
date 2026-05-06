import { mockProducts } from "@/lib/products";
import ProductCard from "@/components/ui/ProductCard";

export default function CatalogPage() {
  const categories = ["Todos", ...Array.from(new Set(mockProducts.map((p) => p.category)))];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-up">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-3">
          Coleção Exclusiva
        </p>
        <h1 className="font-display text-5xl sm:text-6xl font-light text-gray-800 leading-none">
          Catálogo
        </h1>
        <div className="ornament-divider mt-4 max-w-xs mx-auto">
          <span className="font-display italic text-gray-400 text-sm">
            feito para você
          </span>
        </div>
        <p className="font-body text-sm text-gray-500 mt-4 max-w-md mx-auto leading-relaxed">
          Cada peça é criada sob medida, seguindo as proporções exatas do seu corpo.
          Escolha o look e comece sua experiência Única.
        </p>
      </div>

      {/* Category filter - visual only */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-10 scrollbar-none justify-center flex-wrap">
        {categories.map((cat, i) => (
          <span
            key={cat}
            className={`font-body text-xs tracking-widest uppercase px-4 py-2 border transition-colors cursor-pointer whitespace-nowrap ${
              i === 0
                ? "border-wine bg-wine text-beige-light"
                : "border-beige-dark text-gray-500 hover:border-wine hover:text-wine"
            }`}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {mockProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {/* Footer ornament */}
      <div className="text-center mt-16">
        <span className="font-display italic text-gold/30 text-3xl">✦</span>
      </div>
    </div>
  );
}
