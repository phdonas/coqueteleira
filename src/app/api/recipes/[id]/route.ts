// src/app/api/recipes/[id]/route.ts
// src/app/api/recipes/[id]/route.ts
// GET (detalhe), PATCH (atualizar), DELETE (apagar)

import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

/**
 * Garante que ctx foi aguardado (Next 15) e extrai { id } de params
 */
async function getParams(ctx: any): Promise<{ id: string }> {
  const resolved = typeof ctx?.then === "function" ? await ctx : ctx;
  // Agora, só acessamos params **depois** do await acima
  return (resolved?.params ?? {}) as { id: string };
}

/** GET /api/recipes/[id] */
export async function GET(_req: Request, ctx: any) {
  try {
    const supabase = await supabaseServer();
    const { id } = await getParams(ctx);

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "erro" }, { status: 500 });
  }
}

/** PATCH /api/recipes/[id] */
export async function PATCH(req: Request, ctx: any) {
  try {
    const supabase = await supabaseServer();
    const { id } = await getParams(ctx);
    const body = (await req.json().catch(() => ({}))) ?? {};

    // Campos permitidos (alinhe com os nomes reais do seu schema)
    const {
      title,
      ingredients_text,
      steps_text,
      image_url,
      video_url,
    }: {
      title?: string;
      ingredients_text?: string;
      steps_text?: string;
      image_url?: string | null;
      video_url?: string | null;
    } = body;

    const patch: Record<string, any> = {};
    if (title !== undefined) patch.title = title;
    if (ingredients_text !== undefined) patch.ingredients_text = String(ingredients_text ?? "");
    if (steps_text !== undefined) patch.steps_text = String(steps_text ?? "");
    if (image_url !== undefined) patch.image_url = image_url ?? null;
    if (video_url !== undefined) patch.video_url = video_url ?? null;

    const { data, error } = await supabase
      .from("recipes")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, item: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "erro" }, { status: 500 });
  }
}

/** DELETE /api/recipes/[id] */
export async function DELETE(_req: Request, ctx: any) {
  try {
    const supabase = await supabaseServer();
    const { id } = await getParams(ctx);

    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "erro" }, { status: 500 });
  }
}
