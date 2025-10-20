export type UnidadePadrao =
  | 'ml' | 'tsp' | 'tbsp' | 'oz' | 'cl' | 'barspoon' | 'dash' | 'gota' | 'unidade' | 'g';

export type Recipe = {
  id: string;
  codigo: string;
  nome: string;
  url?: string;
  imagem_url?: string;
  video_url?: string;
  modo_preparo?: string;
  apresentacao?: string;
  comentarios?: string;
  ingredientes_norm_set?: string[];
  created_at: number;
  updated_at: number;
};

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  quantidade_raw: string;
  quantidade_num?: number;
  unidade_padrao?: UnidadePadrao;
  unidade_label?: string;
  produto_raw: string;
  produto_norm: string;
};
