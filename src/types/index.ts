// src/types/index.ts
export type IngredientRow = {
  id: string;
  name: string;           // coluna em recipe_ingredients
};

export type RecipeRow = {
  id: string;             // UUID no Supabase
  name: string;           // nome da receita
  description?: string | null;
  origin_link?: string | null;
  photo_url?: string | null;
  tags?: string[] | null;
  recipe_ingredients?: IngredientRow[]; // join
};

export type RecipeVM = {
  id: string;
  title: string;
  instructions?: string;
  originLink?: string;
  photoUrl?: string;
  tags: string[];
  ingredients: string[];
};

