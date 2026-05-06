"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  const links = [
    { href: "/catalog", label: "Catálogo" },
    { href: "/dashboard", label: "Meus Pedidos" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-beige-light/95 backdrop-blur-sm border-b border-beige-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/catalog" className="font-display text-2xl font-light tracking-[0.2em] text-wine">
          Ú<span className="text-gold">N</span>ICA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-body text-xs tracking-widest uppercase transition-colors ${
                pathname.startsWith(l.href)
                  ? "text-wine font-medium"
                  : "text-gray-500 hover:text-wine"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="font-body text-xs tracking-widest uppercase text-gray-400 hover:text-wine transition-colors"
          >
            Sair
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-px bg-wine transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-1" : ""}`} />
          <span className={`block w-5 h-px bg-wine mt-1.5 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-wine mt-1.5 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-beige-light border-t border-beige-dark py-4 px-6 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="font-body text-xs tracking-widest uppercase text-gray-600 hover:text-wine"
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="font-body text-xs tracking-widest uppercase text-gray-400 hover:text-wine text-left"
          >
            Sair
          </button>
        </div>
      )}
    </header>
  );
}
