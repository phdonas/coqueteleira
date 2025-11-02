// src/lib/profile.ts
// src/lib/profile.ts
// Helpers de sessão/usuário no lado do servidor (usa supabaseServer async)

import supabaseServer from "@/lib/supabaseServer";

export type ProfileInfo = {
  email: string | null;
  user_metadata: Record<string, any>;
};

/**
 * Retorna a sessão atual (ou lança erro se a consulta falhar).
 */
export async function getSessionServer() {
  const supabase = await supabaseServer(); // <- IMPORTANTE: await, pois supabaseServer é async
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
}

/**
 * Conveniência: retorna email e metadados do usuário autenticado (se houver).
 */
export default async function getProfile(): Promise<ProfileInfo> {
  const supabase = await supabaseServer(); // <- await aqui também
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    // Sem usuário ou erro: devolve estrutura vazia (sem quebrar chamadas)
    return { email: null, user_metadata: {} };
  }

  return {
    email: data.user?.email ?? null,
    user_metadata: data.user?.user_metadata ?? {},
  };
}
