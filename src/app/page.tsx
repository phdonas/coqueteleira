// src/app/page.tsx
// src/app/page.tsx
import { Suspense } from "react";
import HomePageInner from "./HomePageInner";

/**
 * Página inicial (App Router – Next 15)
 * Mantemos o <HomePageInner /> recebendo a prop obrigatória `initialItems`.
 * Para não acoplar a página ao carregamento inicial da API, passamos um array
 * vazio por padrão (depois a própria tela faz as buscas quando o usuário
 * pesquisa ou navega). Isso resolve o erro de build sem afetar outras rotas.
 */

export const revalidate = 0; // sem cache para a home (opcional)

export default function Page() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="p-6">Carregando…</div>}>
        {/* IMPORTANTE: a prop `initialItems` é obrigatória no HomePageInner */}
        <HomePageInner initialItems={[]} />
      </Suspense>
    </main>
  );
}

