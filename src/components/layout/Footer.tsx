import BrandLogo from "@/components/brand/BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 px-6 py-12 text-center">
      <BrandLogo variant="wordmark" className="text-2xl tracking-[0.32em]" />
      <p className="mx-auto mt-4 max-w-md text-[11px] uppercase tracking-[0.28em] text-ink/45">
        Uma extensão da Zara para peças sob medida, criada como protótipo
        acadêmico.
      </p>
    </footer>
  );
}
