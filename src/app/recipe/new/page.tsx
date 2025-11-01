// src/app/recipe/new/page.tsx
// src/app/recipe/new/page.tsx
// Server wrapper para a pÃ¡gina de criaÃ§Ã£o de receita (usa o client NewRecipeClient)

import { Suspense } from "react";
import NewRecipeClient from "./NewRecipeClient";

// Evita SSG e problemas de prerender para fluxo 100% client-side
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewRecipePage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-8 text-sm text-neutral-300">Carregandoâ€¦</div>
      }
    >
      <NewRecipeClient />
    </Suspense>
  );
}


