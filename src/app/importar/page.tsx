// src/app/importar/page.tsx
// src/app/importar/page.tsx
// Server wrapper para a pÃ¡gina de Importar. NÃƒO usa hooks de cliente aqui.

import { Suspense } from "react";
import ImportarClient from "./ImportarClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ImportarPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-8 text-sm text-neutral-300">
          Carregando importadorâ€¦
        </div>
      }
    >
      <ImportarClient />
    </Suspense>
  );
}

