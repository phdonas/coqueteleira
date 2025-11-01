// src/app/api/supa-health/route.ts
// src/app/api/supa-health/route.ts
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonRaw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceRaw = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  // Normaliza (remove espaços acidentais)
  const url = urlRaw.trim();
  const anon = anonRaw.trim();
  const service = serviceRaw.trim();

  return NextResponse.json({
    ok: true,
    ping: true,
    canSelect: Boolean(url && anon),
    authed: true,
    diag: {
      hasUrl: Boolean(url),
      hasAnon: Boolean(anon),
      hasService: Boolean(service),
      urlLen: url.length,
      anonLen: anon.length,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      region: process.env.VERCEL_REGION ?? null,
    },
  });
}
