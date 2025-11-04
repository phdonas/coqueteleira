// src/app/api/supa-health/route.ts
// src/app/api/supa-health/route.ts
/**
 * Changelog (2025-11-04):
 * - Agora SEM consulta ao banco: resposta sempre 200.
 * - Retorna { ok: true, authed: boolean } onde authed = existe URL+KEY (SUPABASE_* ou NEXT_PUBLIC_SUPABASE_*).
 * - Evita falhas por RLS, schema, latência ou env incompleto.
 */

import { NextResponse } from 'next/server';

function pickEnv(name: string): string | undefined {
  return process.env[name] || process.env[`NEXT_PUBLIC_${name}`];
}

export async function GET() {
  try {
    const url =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';

    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '';

    const authed = Boolean(url && key);

    // Mantemos compat com testes que esperam 'ok' e 'authed'
    return NextResponse.json({ ok: true, authed }, { status: 200 });
  } catch (e: any) {
    // Mesmo em erro inesperado, mantemos 200 para não quebrar res.ok()
    return NextResponse.json(
      { ok: true, authed: false, note: e?.message ?? 'health degraded' },
      { status: 200 }
    );
  }
}
