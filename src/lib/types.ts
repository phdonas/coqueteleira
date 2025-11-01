// src/lib/types.ts

export type RecipeDB = {
  id: string;
  user_id: string;
  codigo: string | null;
  nome: string;
  url: string | null;
  imagem_url: string | null;
  video_url: string | null;
  comentarios: string | null;
  modo_preparo: string | null;
  apresentacao: string | null;
  ingredientes_norm_set: string[] | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type IngredientDB = {
  id: string;
  recipe_id: string;
  quantidade_raw: string | null;
  unidade_label: string | null;
  produto_raw: string | null;
};

export type RecipeCard = {
  id: string;
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
};

export type RecipeFull = RecipeCard & {
  method?: string | null;
  url?: string | null;
  ingredients: { text: string }[];
};

export function mapRecipeCard(r: RecipeDB): RecipeCard {
  return {
    id: r.id,
    title: r.nome,
    summary: r.apresentacao,
    imageUrl: r.imagem_url ?? null,
  };
}

export function mapRecipeFull(r: RecipeDB, ing: IngredientDB[]): RecipeFull {
  return {
    ...mapRecipeCard(r),
    method: r.modo_preparo,
    url: r.url ?? null,
    ingredients: ing.map(i => ({
      text: [i.quantidade_raw, i.unidade_label, i.produto_raw]
        .filter(Boolean)
        .join(' ').trim(),
    })),
  };
}


