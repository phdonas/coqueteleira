// src/app/api/import/route.ts
// (Item 3 â€” Importar da Web por URL) â€” corrige comentÃ¡rios, tipagem do body e regex Unicode

import { NextRequest } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type ImportIncoming = {
  nome: string;
  url?: string | null;
  imagem_url?: string | null;
  apresentacao?: string | null;
  modo_preparo?: string | null;
  ingredientesText?: string | null;
  is_public?: boolean | null;
};

function pickRecipeFromJsonLd(obj: any): any | null {
  const arr = Array.isArray(obj) ? obj : [obj];
  for (const node of arr) {
    if (!node) continue;
    if (node["@type"] === "Recipe") return node;
    if (Array.isArray(node["@type"]) && node["@type"].includes("Recipe")) return node;
    if (node["@graph"]) {
      const g = pickRecipeFromJsonLd(node["@graph"]);
      if (g) return g;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return Response.json({ ok: false, error: "ParÃ¢metro 'url' Ã© obrigatÃ³rio." }, { status: 400 });

  const html = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } }).then((r) => r.text());
  const scripts = Array.from(
    html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  );

  let recipe: any = null;
  for (const s of scripts) {
    try {
      const json = JSON.parse(s[1].trim());
      const node = pickRecipeFromJsonLd(json);
      if (node) {
        recipe = node;
        break;
      }
    } catch {
      /* ignore JSON parse */
    }
  }

  if (!recipe) return Response.json({ ok: false, error: "NÃ£o encontrei JSON-LD de receita nessa pÃ¡gina." }, { status: 404 });

  const nome = (recipe.name || recipe.headline || "").trim();
  const imagem_url = Array.isArray(recipe.image) ? recipe.image[0] : recipe.image || null;
  const modo_preparo =
    Array.isArray(recipe.recipeInstructions)
      ? recipe.recipeInstructions
          .map((x: any) => (typeof x === "string" ? x : x?.text))
          .filter(Boolean)
          .join("\n")
      : (recipe.recipeInstructions?.text || recipe.recipeInstructions || null);

  const ingredientesArr = Array.isArray(recipe.recipeIngredient) ? recipe.recipeIngredient : [];
  const ingredientesText = ingredientesArr.join("\n");

  return Response.json({
    ok: true,
    item: {
      nome: nome || "Sem tÃ­tulo",
      url,
      imagem_url,
      apresentacao: recipe.description || null,
      modo_preparo: modo_preparo || null,
      ingredientesText,
      is_public: true,
    },
  });
}

export async function POST(req: NextRequest) {
  const supa = await supabaseServer();
  const { data: user } = await supa.auth.getUser();
  if (!user?.user) {
    return Response.json({ ok: false, error: "FaÃ§a login para importar receitas." }, { status: 401 });
  }

  const body = (await req.json()) as ImportIncoming;

  const { data: created, error } = await supa
    .from("recipes")
    .insert({
      user_id: user.user.id, // obrigatÃ³rio pela RLS
      nome: body.nome,
      url: body.url ?? null,
      imagem_url: body.imagem_url ?? null,
      apresentacao: body.apresentacao ?? null,
      modo_preparo: body.modo_preparo ?? null,
      is_public: body.is_public ?? true,
    })
    .select()
    .single();

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  if (body.ingredientesText) {
    // Regex com Unicode: quantidade (opcional), unidade (letras), produto (restante)
    const RE_LINE = /^([\dÂ¼Â½Â¾./\-]+[^\s]*)?\s*([\p{L}]+)?\s+(.+)$/u;

    const rows = String(body.ingredientesText)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line) => {
        const m = line.match(RE_LINE);
        const quantidade_raw = (m?.[1] || null)?.toString() || null;
        const unidade_label = (m?.[2] || null)?.toString() || null;
        const produto_raw = (m?.[3] || line).trim();
        return { recipe_id: created.id, quantidade_raw, unidade_label, produto_raw };
      });

    await supa.from("recipe_ingredients").insert(rows);
  }

  return Response.json({ ok: true, item: created });
}

