// src/app/api/recipes/route.ts
// src/app/api/recipes/route.ts
// GET (lista + filtros) e POST (criar receita)

import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = supabaseServer();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const byIngredient = (searchParams.get("ingredient") ?? "").trim();

  let query = supabase.from("recipes").select("*").order("created_at", { ascending: false });

  if (q) query = query.ilike("title", `%${q}%`);
  if (byIngredient) query = query.ilike("ingredients_text", `%${byIngredient}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  const body = await req.json().catch(() => ({} as any));

  // normalização defensiva
  const title: string = (body?.title ?? "").toString().trim();
  const ingredientesText: string = (body?.ingredientesText ?? body?.ingredients_text ?? "").toString();
  const modoPreparo: string = (body?.modoPreparo ?? body?.steps ?? body?.instructions ?? "").toString();
  const imageUrl: string | null = (body?.imageUrl ?? body?.image_url ?? null) ? String(body.imageUrl ?? body.image_url) : null;
  const videoUrl: string | null = (body?.videoUrl ?? body?.video_url ?? null) ? String(body.videoUrl ?? body.video_url) : null;

  if (!title) {
    return NextResponse.json({ ok: false, error: "title é obrigatório" }, { status: 400 });
  }

  const payload = {
    title,
    ingredients_text: ingredientesText,
    steps_text: modoPreparo,
    image_url: imageUrl,
    video_url: videoUrl,
  };

  const { data, error } = await supabase.from("recipes").insert(payload).select("*").single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
