// src/lib/supabaseClient.ts
// src/lib/supabaseClient.ts
// src/lib/supabaseClient.ts
// Singleton do Supabase para o browser, com mÃºltiplos exports para compatibilidade:
//
//  - named  export:  supabase            -> instÃ¢ncia singleton
//  - named  export:  getSupabaseClient   -> funÃ§Ã£o que retorna a instÃ¢ncia
//  - named  export:  supabaseClient      -> ALIAS de getSupabaseClient (para compat. com cÃ³digo legado)
//  - default export: getSupabaseClient
//
// Assim, funcionam todos os padrÃµes abaixo:
//   import { supabase } from '@/lib/supabaseClient'
//   import { getSupabaseClient } from '@/lib/supabaseClient'
//   import { supabaseClient } from '@/lib/supabaseClient'   // <- este era o que faltava
//   import getSupabaseClient from '@/lib/supabaseClient'

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      'VariÃ¡veis NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes.'
    );
  }

  _client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}

// InstÃ¢ncia singleton (Ãºtil para import direto)
export const supabase: SupabaseClient = getSupabaseClient();

// ðŸ” ALIAS para compatibilidade com `import { supabaseClient } ...`
export const supabaseClient = getSupabaseClient;

// Default export (tambÃ©m compatÃ­vel com imports existentes)
export default getSupabaseClient;

