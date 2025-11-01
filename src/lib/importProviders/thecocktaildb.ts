// src/lib/importProviders/thecocktaildb.ts
// src/lib/importProviders/thecocktaildb.ts
// (Passo 3.A â€” Provider TheCocktailDB: busca + normalizaÃ§Ã£o incremental)

const API_BASE =
  process.env.THECOCKTAILDB_API_BASE?.replace(/\/+$/, "") ||
  "https://www.thecocktaildb.com/api/json/v1/1";

const API_KEY = process.env.THECOCKTAILDB_API_KEY?.trim(); // opcional

type TCocktail = {
  idDrink: string;
  strDrink: string | null;
  strDrinkThumb: string | null;
  strInstructions: string | null;
  strVideo: string | null;
  strSource: string | null;
  // ingredientes: strIngredient1..15 + strMeasure1..15
  [k: string]: any;
};

export type ProviderItem = {
  nome: string;
  url?: string | null;
  imagem_url?: string | null;
  video_url?: string | null;
  apresentacao?: string | null;
  modo_preparo?: string | null;
  ingredientesText?: string | null; // 1 por linha â€” medido + ingrediente
};

function toIngredientesText(d: TCocktail): string {
  const lines: string[] = [];
  for (let i = 1; i <= 15; i++) {
    const ing = (d[`strIngredient${i}`] || "").toString().trim();
    const qty = (d[`strMeasure${i}`] || "").toString().trim();
    if (!ing) continue;
    const line = [qty, ing].filter(Boolean).join(" ").trim();
    if (line) lines.push(line);
  }
  return lines.join("\n");
}

function normalize(drink: TCocktail): ProviderItem {
  return {
    nome: drink.strDrink || "",
    url: drink.strSource || null,
    imagem_url: drink.strDrinkThumb || null,
    video_url: drink.strVideo || null,
    apresentacao: null,
    modo_preparo: drink.strInstructions || null,
    ingredientesText: toIngredientesText(drink),
  };
}

function withKey(path: string) {
  // Formatos do TCD: /api/json/v1/1/...  ou /api/json/v2/<key>/...
  if (!API_KEY) return `${API_BASE}${path}`;
  const base = API_BASE.replace(/\/1$/, `/${API_KEY}`);
  return `${base}${path}`;
}

export async function searchCocktails(q: string): Promise<ProviderItem[]> {
  const url = withKey(`/search.php?s=${encodeURIComponent(q)}`);
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Provider error: ${r.status}`);
  const j = (await r.json()) as { drinks: TCocktail[] | null };
  if (!j.drinks) return [];
  return j.drinks.map(normalize);
}

export async function lookupCocktailById(id: string): Promise<ProviderItem | null> {
  const url = withKey(`/lookup.php?i=${encodeURIComponent(id)}`);
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return null;
  const j = (await r.json()) as { drinks: TCocktail[] | null };
  const d = j.drinks?.[0];
  return d ? normalize(d) : null;
}

