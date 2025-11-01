// src/lib/supabaseServer.ts
// src/lib/supabaseServer.ts
// Cliente do Supabase para o SERVER (SSR/Edge). Default export, com cookies do Next.

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export default function supabaseServer(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Supabase: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente"
    );
  }

  // Adapter de cookies com tipagem 'any' para evitar falsos positivos do TS
  const cookieAdapter: any = {
    get(name: string) {
      return (cookies() as any).get(name)?.value;
    },
    set(name: string, value: string, options?: any) {
      (cookies() as any).set(name, value, options);
    },
    remove(name: string, options?: any) {
      (cookies() as any).set(name, "", { ...(options || {}), maxAge: 0 });
    },
  };

  const client = createServerClient(url, anon, {
    cookies: cookieAdapter,
  } as any) as SupabaseClient;

  return client;
}


