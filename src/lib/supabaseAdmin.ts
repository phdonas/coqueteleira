// src/lib/supabaseAdmin.ts
// src/lib/supabaseAdmin.ts
// Cliente ADMIN (Service Role) - USO SOMENTE EM SERVER SIDE (API routes/cron).
// ATENÃ‡ÃƒO: nunca expor SUPABASE_SERVICE_ROLE_KEY no client.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export default function supabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase Admin: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente"
    );
  }

  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminClient;
}




