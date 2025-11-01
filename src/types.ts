// src/types.tsx
export type Recipe = {
  id: string;
  codigo: string | null;
  nome: string;
  url: string | null;
  imagem_url: string | null;
  video_url: string | null;
  comentarios: string | null;
  modo_preparo: string | null;
  apresentacao: string | null;
  is_public: boolean | null;
  created_at: string;
  updated_at: string;
};

export type RecipeWithIngredients = Recipe & {
  ingredientes: {
    quantidade_raw: string | null;
    unidade_label: string | null;
    produto_raw: string | null;
  }[];
};

