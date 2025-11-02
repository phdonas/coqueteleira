// src/lib/supabaseServer.ts
// src/lib/supabaseServer.ts
// Cliente do Supabase para uso em rotas/SSR (Next 15 com cookies() assíncrono)

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export default async function supabaseServer(): Promise<SupabaseClient> {
  // Next 15: cookies() é assíncrono — aguardamos UMA vez aqui
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Supabase: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente"
    );
  }

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        // as opções são repassadas como estão
        cookieStore.set(name, value, { ...(options || {}) });
      },
      remove(name: string, options?: CookieOptions) {
        // remove = set com maxAge 0
        cookieStore.set(name, "", { ...(options || {}), maxAge: 0 });
      },
    },
  });
}
