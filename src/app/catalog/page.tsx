import BrandLogo from "@/components/brand/BrandLogo";
import Footer from "@/components/layout/Footer";
import EditorialButton from "@/components/ui/EditorialButton";
import ProductCard from "@/components/ui/ProductCard";
import { getProducts } from "@/lib/data/products";
import Image from "next/image";

export default async function CatalogPage() {
  const products = await getProducts();
  const categories = [
    "Todos",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];
  const heroProduct = products[0];
  const supportingProduct = products[2] ?? products[1] ?? products[0];

  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div className="cinema-in relative z-10">
          <div className="mb-10 w-full max-w-[420px] sm:max-w-[520px]">
            <BrandLogo
              variant="horizontal"
              className="h-auto w-full"
              priority
            />
          </div>

          <p className="editorial-kicker">Coleção sob medida</p>
          <h1 className="mt-5 max-w-2xl font-display text-6xl font-light leading-[0.86] sm:text-8xl lg:text-[7.8rem]">
            O luxo de vestir algo único.
          </h1>
          <p className="mt-8 max-w-md text-sm leading-7 text-ink/62">
            Escolha uma peça, registre suas medidas e acompanhe a criação de um
            pedido sob medida em uma experiência visual refinada, íntima e
            memorável.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <EditorialButton href="#lookbook">Explorar coleção</EditorialButton>
            <EditorialButton href="/dashboard" variant="outline">
              Seus pedidos
            </EditorialButton>
          </div>

          <div className="mt-11 flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <span
                key={category}
                className={`border px-4 py-2 text-[10px] uppercase tracking-[0.26em] ${
                  index === 0
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/15 bg-white/45 text-ink/55"
                }`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="cinema-in delay-2 relative min-h-[520px] lg:min-h-[690px]">
          <div className="absolute left-0 top-8 hidden h-24 w-24 border-l border-t border-ink/20 lg:block" />
          <div className="absolute bottom-4 right-1 hidden h-32 w-32 border-b border-r border-ink/20 lg:block" />

          <div className="absolute inset-x-6 top-0 h-[78%] overflow-hidden bg-porcelain shadow-[0_40px_90px_rgba(0,0,0,0.10)] sm:inset-x-16 lg:left-20 lg:right-0">
            {heroProduct?.image_url && (
              <Image
                src={heroProduct.image_url}
                alt={heroProduct.name}
                fill
                priority
                className="object-cover grayscale contrast-110"
                sizes="(max-width: 1024px) 90vw, 58vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/46 via-transparent to-paper/10" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-paper">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-paper/62">
                  Peça em destaque
                </p>
                <p className="mt-2 font-display text-4xl leading-none">
                  {heroProduct?.name}
                </p>
              </div>
              <p className="hidden text-right font-display text-3xl sm:block">
                R$ {Number(heroProduct?.price ?? 0).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-[45%] min-w-[180px] border border-paper bg-white p-3 shadow-[0_28px_70px_rgba(0,0,0,0.14)] sm:w-[34%]">
            <div className="relative aspect-[3/4] overflow-hidden bg-porcelain">
              {supportingProduct?.image_url && (
                <Image
                  src={supportingProduct.image_url}
                  alt={supportingProduct.name}
                  fill
                  className="object-cover grayscale"
                  sizes="260px"
                />
              )}
            </div>
            <p className="mt-3 text-[9px] uppercase tracking-[0.24em] text-ink/42">
              {supportingProduct?.category ?? "Sob medida"}
            </p>
          </div>

          <div className="absolute right-0 top-5 hidden max-w-[210px] border border-ink bg-paper px-5 py-4 lg:block">
            <p className="font-display text-3xl leading-none">UNIQUE</p>
            <p className="mt-2 text-[10px] uppercase leading-5 tracking-[0.22em] text-ink/45">
              Uma extensão da Zara
            </p>
          </div>
        </div>
      </section>

      <section id="lookbook" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="mb-8 grid gap-5 border-t border-ink/10 pt-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="editorial-kicker">Lookbook</p>
            <h2 className="mt-2 font-display text-5xl font-light leading-none">
              Peças selecionadas
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-ink/50 md:text-right">
            Uma seleção visualmente limpa, com foco em silhueta, textura e
            presença.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
