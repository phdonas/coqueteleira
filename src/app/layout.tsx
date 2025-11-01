// src/app/layout.tsx
// (Hotfix â€” reintroduz cabeÃ§alho com navegaÃ§Ã£o + melhor contraste padrÃ£o)

import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import UserMenu from "@/components/UserMenu";

export const metadata = {
  title: "CoquetÃ©is do Paulo â€” Biblioteca Pessoal",
  description: "CatÃ¡logo pessoal de coquetÃ©is com busca e importaÃ§Ã£o da web.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-neutral-950 text-neutral-100">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-neutral-900/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-[11px] font-semibold text-amber-400">COQUETÃ‰IS DO PAULO</span>
              <span className="text-sm font-semibold text-neutral-200">Biblioteca Pessoal</span>
            </Link>

            {/* Nav principal */}
            <nav className="hidden items-center gap-2 sm:flex">
              <Link
                href="/importar"
                className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white ring-1 ring-sky-500 hover:bg-sky-500"
              >
                Importar da web
              </Link>
              <Link
                href="/recipe/new"
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white ring-1 ring-emerald-500 hover:bg-emerald-500"
              >
                Nova receita
              </Link>
            </nav>

            <UserMenu />
          </div>
        </header>

        {/* ConteÃºdo */}
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        {/* Bottom nav (mobile) */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-neutral-900/90 backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-2">
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-sm text-neutral-200 ring-1 ring-white/10 hover:bg-white/10"
            >
              InÃ­cio
            </Link>
            <Link
              href="/importar"
              className="rounded-md px-3 py-1.5 text-sm text-white ring-1 ring-sky-500 bg-sky-600 hover:bg-sky-500"
            >
              Importar
            </Link>
            <Link
              href="/recipe/new"
              className="rounded-md px-3 py-1.5 text-sm text-white ring-1 ring-emerald-500 bg-emerald-600 hover:bg-emerald-500"
            >
              Nova
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}


