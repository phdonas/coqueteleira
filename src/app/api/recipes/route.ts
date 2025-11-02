// src/app/api/recipes/route.ts
// src/app/api/recipes/route.ts
// Lista + criação de receitas (ajuste: aguardar supabaseServer)
import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("recipes").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const body = await req.json().catch(() => ({} as any));

  const row = {
    title: String(body?.title ?? body?.nome ?? ""),
    ingredients_text: String(body?.ingredientesText ?? body?.ingredientes_text ?? ""),
    steps_text: String(body?.modoPreparo ?? body?.steps_text ?? body?.instructions ?? ""),
    image_url: body?.imageUrl ?? body?.image_url ?? null,
    video_url: body?.videoUrl ?? body?.video_url ?? null,
    is_public: !!body?.is_public,
  };

  const { data, error } = await supabase.from("recipes").insert(row).select("*").single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
