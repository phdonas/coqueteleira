// src/app/favorites/page.tsx
// (Hotfix de build: remove imports inexistentes; usa supabaseServer e join para listar favoritos do usuÃ¡rio logado)

import Link from "next/link";
import supabaseServer from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FavoritesPage() {
  const supa = await supabaseServer();
  const { data: auth } = await supa.auth.getUser();

  if (!auth?.user) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Favoritos</h1>
        <p className="text-neutral-300">
          VocÃª precisa estar autenticado para ver seus favoritos.
        </p>
      </main>
    );
  }

  const { data, error } = await supa
    .from("favorites")
    .select(
      `
      recipe_id,
      recipes:id (
        id,
        nome,
        apresentacao,
        imagem_url,
        video_url
      )
    `
    )
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Favoritos</h1>
        <p className="text-red-400">Erro ao carregar: {error.message}</p>
      </main>
    );
  }

  const items =
    (data ?? [])
      .map((r: any) => r.recipes)
      .filter(Boolean) as Array<{
      id: string;
      nome: string;
      apresentacao: string | null;
      imagem_url: string | null;
      video_url: string | null;
    }>;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Favoritos</h1>
        <Link
          href="/"
          className="rounded-lg bg-neutral-800 px-3 py-2 ring-1 ring-neutral-700 hover:bg-neutral-700"
        >
          â† Voltar
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-300">VocÃª ainda nÃ£o favoritou nenhuma receita.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((rec) => (
            <li key={rec.id}>
              <Link
                href={`/recipe/${rec.id}`}
                className="block rounded-xl bg-neutral-900 ring-1 ring-neutral-800 hover:ring-neutral-600 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center bg-neutral-800 rounded-lg text-xs text-neutral-400 overflow-hidden">
                    {rec.imagem_url ? (
                      // usamos <img> simples para nÃ£o esbarrar em domains config
                      <img
                        src={rec.imagem_url}
                        alt={rec.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "sem foto"
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{rec.nome}</div>
                    <div className="text-sm text-neutral-400 line-clamp-1">
                      {rec.apresentacao ?? "â€”"}
                    </div>
                    {rec.video_url && (
                      <span className="mt-1 inline-block text-[11px] text-sky-300">
                        â–¶ vÃ­deo
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

