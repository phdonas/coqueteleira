// src/app/auth/page.tsx
// src/app/auth/page.tsx
// (Hotfix build) Usa o client de browser e remove import inexistente de supabaseClient.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

import supabaseBrowser from '@/lib/supabaseBrowser';
import type { User } from '@supabase/supabase-js';

export default function AuthPage() {
  const supa = supabaseBrowser();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const res: {
        data: { user: User | null };
        error: { message: string } | null;
      } = await supa.auth.getUser();

      if (!mounted) return;
      setEmail(res.data?.user?.email ?? null);
    })();

    return () => {
      mounted = false;
    };
  }, [supa]);

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Entrar</h1>

      {email ? (
        <div className="space-y-3">
          <p className="text-sm">
            SessÃ£o iniciada como <span className="font-mono">{email}</span>.
          </p>
          <Link
            href="/"
            className="inline-block rounded-md bg-sky-600 px-3 py-2 text-white ring-1 ring-sky-500 hover:bg-sky-500"
          >
            Voltar para a biblioteca
          </Link>
        </div>
      ) : (
        <Auth
          supabaseClient={supa}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          view="magic_link"
        />
      )}
    </main>
  );
}

