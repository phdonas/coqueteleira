// src/app/page.tsx
// src/app/page.tsx
// Server wrapper da Home (remove hooks da page e renderiza o client HomePageInner em <Suspense>)

import { Suspense } from "react";
import HomePageInner from "./HomePageInner";

// Evita SSG e problemas de prerender quando a UI depende de estado/params no client
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-8 text-sm text-neutral-300">Carregandoâ€¦</div>
      }
    >
      <HomePageInner />
    </Suspense>
  );
}

