// src/lib/profile.ts
// src/lib/profile.ts
// Helpers de sessÃ£o e perfil (server-safe), com normalizaÃ§Ã£o de tipos.

import supabaseServer from "./supabaseServer";

export type AppProfile = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
};

export async function getSession() {
  const supabase = supabaseServer();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getProfile(): Promise<AppProfile | null> {
  const supabase = supabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) return null;

  // user.email pode ser string | null | undefined dependendo da versÃ£o do supabase-js.
  // Normalizamos para string | null:
  const email: string | null = user.email ?? null;

  return {
    id: user.id,
    email,
    // user_metadata pode ser Record<string, unknown> | undefined
    user_metadata: (user as any).user_metadata ?? {},
  };
}

/**
 * ConveniÃªncias opcionais para rotas server:
 */

export async function requireProfile(): Promise<AppProfile> {
  const profile = await getProfile();
  if (!profile) {
    const e = new Error("Unauthorized");
    (e as any).status = 401;
    throw e;
  }
  return profile;
}

export async function getUserId(): Promise<string | null> {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}


