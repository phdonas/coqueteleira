// src/app/api/import/web/route.ts
// src/app/api/import/web/route.ts
// Ajuste: aguardar supabaseServer
import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const body = await req.json().catch(() => ({} as any));

  // aqui você mantém sua lógica de parse da web → rows
  const rows = Array.isArray(body) ? body : [body];

  const { data, error } = await supabase.from("recipes").insert(rows).select("*");

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data ?? [] }, { status: 201 });
}
