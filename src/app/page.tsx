import { Suspense } from "react";
import HomePageInner from "./HomePageInner";

// Estas configurações agora vivem em um componente SERVER (este arquivo),
// que é o lugar certo pra isso.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// A página raiz "/" agora apenas renderiza o componente client
// dentro de <Suspense>, com um fallback simples.
// Isso resolve:
//  - useSearchParams() precisa estar em componente client dentro de Suspense
//  - Vercel não tenta fazer SSG dessa página
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="text-base text-zinc-500 px-4 pt-8">
          Carregando…
        </div>
      }
    >
      <HomePageInner />
    </Suspense>
  );
}
