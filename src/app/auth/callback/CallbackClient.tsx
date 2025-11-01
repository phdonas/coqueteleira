// src/app/auth/callback/CallbackClient.tsx
// Client Component: pode usar hooks de navegaÃ§Ã£o e search params.
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CallbackClient() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const next = params.get('next') || '/';
    // Confirma a sessÃ£o (Supabase jÃ¡ processa o code via detectSessionInUrl)
    supabase.auth.getSession().finally(() => {
      router.replace(next);
    });
  }, [params, router]);

  return (
    <div className="px-4 py-8 text-sm text-neutral-300">
      Autenticandoâ€¦ vocÃª serÃ¡ redirecionado em instantes.
    </div>
  );
}

