"use client";

import BrandLogo from "@/components/brand/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/catalog", label: "Catálogo" },
    { href: "/dashboard", label: "Seus pedidos" },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-paper/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <BrandLogo
          href="/catalog"
          variant="monogram"
          className="h-11 w-11 object-contain"
          priority
        />

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] uppercase tracking-[0.28em] transition ${
                pathname.startsWith(link.href)
                  ? "text-ink"
                  : "text-ink/45 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-[11px] uppercase tracking-[0.28em] text-ink/45 transition hover:text-ink"
          >
            Sair
          </button>
        </nav>

        <button
          className="relative h-10 w-10 md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Abrir menu"
        >
          <span
            className={`absolute left-2 top-4 h-px w-6 bg-ink transition ${
              menuOpen ? "rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-2 top-6 h-px w-6 bg-ink transition ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-ink/10 bg-paper px-6 py-8 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display text-3xl text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="mt-4 text-left text-[11px] uppercase tracking-[0.3em] text-ink/55"
              >
                Encerrar sessão
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
