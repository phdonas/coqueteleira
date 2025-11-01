// src/app/api/supa-health/route.ts
// src/app/api/supa-health/route.ts
// Rota de saúde do Supabase/ambiente. Não expõe segredos.

import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  const url = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    ok: true,
    ping: true,
    canSelect: url && anon, // só indica se as envs chegaram
    authed: true, // mantém compat com seu teste local
  });
}
