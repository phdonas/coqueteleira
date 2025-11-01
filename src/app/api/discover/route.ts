// src/app/api/discover/route.ts
import { NextRequest } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

/**
 * Provider inicial: TheCocktailDB (gratuito)
 * - Busca por nome: https://www.thecocktaildb.com/api/json/v1/1/search.php?s=negroni
 * - Busca por ingrediente: https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=gin
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const by = (searchParams.get("by") || "name").trim(); // 'name' | 'ingredient'

  if (!q) return Response.json({ ok: true, items: [] });

  const endpoint =
    by === "ingredient"
      ? `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(q)}`
      : `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`;

  try {
    const r = await fetch(endpoint, { next: { revalidate: 0 } });
    const js = await r.json();

    // NormalizaÃ§Ã£o mÃ­nima para o front
    const items = (js.drinks || []).map((d: any) => ({
      external_id: d.idDrink,
      nome: d.strDrink,
      imagem_url: d.strDrinkThumb,
      // quando busca por nome, jÃ¡ vem instruÃ§Ãµes e ingredientes
      // quando busca por ingrediente, vem sÃ³ id/nome/imagem; o front abre o detalhe ao importar
      raw: d,
    }));

    return Response.json({ ok: true, items });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "Erro ao consultar o provider." }, { status: 500 });
  }
}

