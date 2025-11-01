// src/app/api/favorites/route.ts
// src/app/api/favorites/route.ts
// POST (favoritar), DELETE (desfavoritar), GET (listar do usuário)

import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";
import { getUserId } from "@/lib/profile";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = supabaseServer();
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: true, items: [] }); // não logado => vazio

  const { data, error } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", userId);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const ids = (data ?? []).map((r) => r.recipe_id);
  return NextResponse.json({ ok: true, items: ids });
}

export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const recipeId = String(body?.recipeId ?? "").trim();
  if (!recipeId) return NextResponse.json({ ok: false, error: "recipeId obrigatório" }, { status: 400 });

  const { error } = await supabase.from("favorites").upsert(
    { user_id: userId, recipe_id: recipeId },
    { onConflict: "user_id,recipe_id" }
  );

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = supabaseServer();
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const recipeId = String(body?.recipeId ?? "").trim();
  if (!recipeId) return NextResponse.json({ ok: false, error: "recipeId obrigatório" }, { status: 400 });

  const { error } = await supabase.from("favorites").delete().match({ user_id: userId, recipe_id: recipeId });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
