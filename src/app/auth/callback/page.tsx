// src/app/auth/callback/page.tsx
// src/app/auth/callback/page.tsx
// Wrapper Server para o callback de autenticação (usa <Suspense> + CallbackClient)

import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-sm text-neutral-300">Finalizando login…</div>}>
      <CallbackClient />
    </Suspense>
  );
}


