// src/app/api/recipes/[id]/route.ts
// src/app/api/recipes/[id]/route.ts
import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

type PatchBody = {
  // nomes finais
  name?: string;
  ingredients_text?: string;
  steps_text?: string;
  image_url?: string | null;
  video_url?: string | null;
  url?: string | null;
  is_public?: boolean;

  // LEGADO (aceitamos e convertemos)
  title?: string;
  ingredientsText?: string;
  instructions?: string;
};

function jsonOK(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

async function extractId(ctx: any): Promise<string> {
  const c = typeof ctx?.then === "function" ? await ctx : ctx;
  return c?.params?.id as string;
}

export const revalidate = 0;
export const dynamic = "force-dynamic";

// GET detalhe
export async function GET(_req: Request, ctx: any) {
  const supabase = await supabaseServer();
  const id = await extractId(ctx);

  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
      id,
      name,
      url,
      image_url,
      video_url,
      is_public,
      created_at,
      updated_at,
      ingredients_text,
      steps_text
    `
    )
    .eq("id", id)
    .single();

  if (error) return jsonOK({ ok: false, error: error.message }, { status: 404 });

  return jsonOK({ ok: true, item: data });
}

// PATCH (atualizar)
export async function PATCH(req: Request, ctx: any) {
  const supabase = await supabaseServer();
  const id = await extractId(ctx);

  const body = (await req.json()) as PatchBody;

  // Compatibilidade: aceitar nomes antigos e mapear
  const patch: Record<string, any> = {};
  if (body.name !== undefined || body.title !== undefined)
    patch.name = body.name ?? body.title ?? null;

  if (body.ingredients_text !== undefined || body.ingredientsText !== undefined)
    patch.ingredients_text = String(body.ingredients_text ?? body.ingredientsText ?? "");

  if (body.steps_text !== undefined || body.instructions !== undefined)
    patch.steps_text = String(body.steps_text ?? body.instructions ?? "");

  if (body.image_url !== undefined) patch.image_url = body.image_url ?? null;
  if (body.video_url !== undefined) patch.video_url = body.video_url ?? null;
  if (body.url !== undefined) patch.url = body.url ?? null;
  if (body.is_public !== undefined) patch.is_public = !!body.is_public;

  const { data, error } = await supabase
    .from("recipes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return jsonOK({ ok: false, error: error.message }, { status: 500 });

  return jsonOK({ ok: true, item: data });
}

// DELETE
export async function DELETE(_req: Request, ctx: any) {
  const supabase = await supabaseServer();
  const id = await extractId(ctx);

  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) return jsonOK({ ok: false, error: error.message }, { status: 500 });

  return jsonOK({ ok: true });
}
