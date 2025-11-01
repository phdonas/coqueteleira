// src/app/api/import/web/route.ts
// src/app/api/import/web/route.ts
// (Passo 4.D â€” ImportaÃ§Ã£o grava tambÃ©m `ingredientes_norm_set` para melhorar a busca por ingredientes)

import { NextResponse } from "next/server";
import { searchCocktails } from "@/lib/importProviders/thecocktaildb";
import supabaseServer from "@/lib/supabaseServer";
import { buildIngredientNormSet } from "@/lib/utils";

type PostBody = {
  nome: string;
  url?: string | null;
  imagem_url?: string | null;
  video_url?: string | null;
  apresentacao?: string | null;
  modo_preparo?: string | null;
  ingredientesText?: string | null;
  is_public?: boolean;
};

function parseIngredientes(text?: string | null) {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([\dÂ¼Â½Â¾.\-/]+[^\s]*)?\s*([\p{L}]+)?\s+(.+)$/u);
      const quantidade_raw = (m?.[1] ?? "").toString();
      const unidade_label = (m?.[2] ?? "").toString();
      const produto_raw = (m?.[3] ?? line).toString();
      return { quantidade_raw, unidade_label, produto_raw };
    });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const provider = (searchParams.get("provider") || "thecocktaildb").toLowerCase();

    if (!q) return NextResponse.json({ ok: true, items: [] });
    if (provider !== "thecocktaildb") {
      return NextResponse.json({ ok: false, error: "Provider nÃ£o suportado." }, { status: 400 });
    }

    const items = await searchCocktails(q);
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro na busca" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supa = await supabaseServer();
  try {
    const { data: user } = await supa.auth.getUser();
    if (!user?.user) {
      return NextResponse.json({ ok: false, error: "FaÃ§a login para importar receitas." }, { status: 401 });
    }

    const body = (await req.json()) as PostBody;

    const { data: created, error } = await supa
      .from("recipes")
      .insert({
        user_id: user.user.id,
        nome: body.nome,
        url: body.url ?? null,
        imagem_url: body.imagem_url ?? null,
        video_url: body.video_url ?? null,
        apresentacao: body.apresentacao ?? null,
        modo_preparo: body.modo_preparo ?? null,
        is_public: body.is_public ?? true,
        ingredientes_norm_set: body.ingredientesText ? buildIngredientNormSet(body.ingredientesText) : [],
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    const recipeId = created!.id as string;

    const rows = parseIngredientes(body.ingredientesText);
    if (rows.length) {
      await supa.from("recipe_ingredients").insert(
        rows.map((r) => ({
          recipe_id: recipeId,
          quantidade_raw: r.quantidade_raw,
          unidade_label: r.unidade_label,
          produto_raw: r.produto_raw,
        }))
      );
    }

    return NextResponse.json({ ok: true, item: { id: recipeId } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro ao importar" }, { status: 500 });
  }
}

