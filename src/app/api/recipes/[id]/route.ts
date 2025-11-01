// src/app/api/recipes/[id]/route.ts
// src/app/api/recipes/[id]/route.ts
// GET (detalhe), PATCH (atualizar), DELETE (apagar)

import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// helper: suporta {params:{id}} ou Promise<{params:{id}}>
async function extractId(ctx: any): Promise<string> {
  const c = typeof ctx?.then === "function" ? await ctx : ctx;
  return c?.params?.id as string;
}

export async function GET(_req: Request, ctx: any) {
  const supabase = supabaseServer();
  const id = await extractId(ctx);

  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 404 });

  return NextResponse.json({ ok: true, item: data });
}

export async function PATCH(req: Request, ctx: any) {
  const supabase = supabaseServer();
  const id = await extractId(ctx);

  const body = await req.json().catch(() => ({} as any));

  const title = body?.title === undefined ? undefined : String(body.title).trim();
  const ingredients_text = body?.ingredientesText ?? body?.ingredients_text;
  const steps_text = body?.modoPreparo ?? body?.steps_text ?? body?.instructions;
  const image_url = body?.imageUrl ?? body?.image_url;
  const video_url = body?.videoUrl ?? body?.video_url;

  const patch: Record<string, any> = {};
  if (title !== undefined) patch.title = title;
  if (ingredients_text !== undefined) patch.ingredients_text = String(ingredients_text ?? "");
  if (steps_text !== undefined) patch.steps_text = String(steps_text ?? "");
  if (image_url !== undefined) patch.image_url = image_url ? String(image_url) : null;
  if (video_url !== undefined) patch.video_url = video_url ? String(video_url) : null;

  const { data, error } = await supabase.from("recipes").update(patch).eq("id", id).select("*").single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(_req: Request, ctx: any) {
  const supabase = supabaseServer();
  const id = await extractId(ctx);

  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
