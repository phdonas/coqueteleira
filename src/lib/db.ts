// src/lib/db.ts
// src/lib/db.ts
// Tipos e (opcionalmente) helpers de dados

export type RecipeUI = {
  id: string;
  nome: string;
  apresentacao: string | null;
  imagem_url: string | null;
  video_url: string | null;
  is_public?: boolean;
};


