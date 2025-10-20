'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';

type Ing = {
  id: string;
  quantidade_raw?: string;
  unidade_label?: string;
  produto_raw: string;
};

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<any>(null);
  const [ings, setIngs] = useState<Ing[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await db.recipes.get(id);
        if (!mounted) return;
        if (!r) {
          setLoading(false);
          alert('Receita não encontrada.');
          router.push('/');
          return;
        }
        setRecipe(r);
        const list = await db.recipe_ingredients.where('recipe_id').equals(id).toArray();
        if (!mounted) return;
        setIngs(list as Ing[]);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
        alert('Falha ao carregar a receita.');
      }
    })();
    return () => { mounted = false; };
  }, [id, router]);

  if (loading) return <div>Carregando…</div>;
  if (!recipe) return null;

  return (
    <div className="space-y-4">
      {/* Cabeçalho da receita */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-bold">{recipe.nome}</div>
            <div className="text-xs text-slate-600">{recipe.codigo}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/edit/${recipe.id}`)}
              className="px-3 py-2 border rounded bg-white hover:bg-slate-50"
            >
              Editar
            </button>
            <a
              href="/"
              className="px-3 py-2 border rounded bg-white hover:bg-slate-50"
            >
              Voltar
            </a>
          </div>
        </div>

        {/* Mídia: vídeo tem prioridade; senão mostra imagem */}
        {recipe.video_url ? (
          <div className="mt-3">
            <VideoPlayer url={recipe.video_url} />
          </div>
        ) : recipe.imagem_url ? (
          <img
            src={recipe.imagem_url}
            alt={recipe.nome}
            className="mt-3 max-h-80 w-full rounded-xl object-cover"
          />
        ) : null}

        {/* Link para a fonte externa */}
        {recipe.url && (
          <div className="mt-2 text-sm">
            <a
              href={recipe.url}
              target="_blank"
              className="text-blue-600 underline"
            >
              Ver receita na web
            </a>
          </div>
        )}
      </div>

      {/* Ingredientes + Preparo */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold mb-2">Ingredientes</div>
          {ings.length ? (
            <ul className="list-disc pl-5">
              {ings.map((i) => (
                <li key={i.id}>
                  {[i.quantidade_raw, i.unidade_label, i.produto_raw]
                    .filter(Boolean)
                    .join(' ')}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-600">—</div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold mb-2">Modo de preparo</div>
          <div className="whitespace-pre-wrap text-sm">
            {recipe.modo_preparo || '—'}
          </div>
        </div>
      </div>

      {/* Apresentação sugerida */}
      <div className="bg-white border rounded-xl p-4">
        <div className="font-semibold mb-2">Apresentação sugerida</div>
        <div className="whitespace-pre-wrap text-sm">
          {recipe.apresentacao || '—'}
        </div>
      </div>

      {/* Observações/Comentários */}
      {recipe.comentarios ? (
        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold mb-2">Observações</div>
          <div className="whitespace-pre-wrap text-sm">
            {recipe.comentarios}
          </div>
        </div>
      ) : null}
    </div>
  );
}
