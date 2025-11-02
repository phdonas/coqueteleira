// src/app/api/import/route.ts
// src/app/api/import/route.ts
// Ajuste: aguardar supabaseServer
import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const body = await req.json().catch(() => ({} as any));

  const payload = Array.isArray(body) ? body : [body];
  const rows = payload.map((r) => ({
    title: String(r?.title ?? r?.nome ?? ""),
    ingredients_text: String(r?.ingredientesText ?? r?.ingredientes_text ?? ""),
    steps_text: String(r?.modoPreparo ?? r?.steps_text ?? r?.instructions ?? ""),
    image_url: r?.imageUrl ?? r?.image_url ?? null,
    video_url: r?.videoUrl ?? r?.video_url ?? null,
    is_public: !!r?.is_public,
  }));

  const { data, error } = await supabase.from("recipes").insert(rows).select("*");

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data ?? [] }, { status: 201 });
}
