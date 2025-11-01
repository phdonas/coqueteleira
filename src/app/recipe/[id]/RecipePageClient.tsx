'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { RecipeWithIngredients } from '@/types';
import FavoriteButton from '@/components/FavoriteButton';

export default function RecipePageClient({ id }: { id: string }) {
  const [data, setData] = useState<RecipeWithIngredients | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/recipes/${id}`, { cache: 'no-store' });
        const json = await res.json();
        if (alive) setData(json.ok ? json.item : null);
      } catch {
        if (alive) setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto p-4 text-neutral-300">Carregando…</div>;

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-red-400">
        Receita não encontrada (ou você não tem permissão para vê-la).
        <div className="mt-4">
          <Link className="px-3 py-1 rounded border border-neutral-600" href="/">Voltar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-4 flex items-center gap-2">
        <Link className="px-3 py-1 rounded border border-neutral-600" href="/">Voltar</Link>
        <FavoriteButton recipeId={data.id} />
      </div>

      <h1 className="text-xl font-semibold text-neutral-100">{data.nome}</h1>

      {data.apresentacao && (
        <p className="mt-2 text-neutral-300">{data.apresentacao}</p>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-neutral-200">Ingredientes</h2>
        {data.ingredientes?.length ? (
          <ul className="list-disc pl-6 mt-2 text-neutral-200">
            {data.ingredientes.map((i, idx) => (
              <li key={idx}>
                {[i.quantidade_raw, i.unidade_label, i.produto_raw].filter(Boolean).join(' ')}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-400 mt-2">Nenhum ingrediente cadastrado.</p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-neutral-200">Modo de preparo</h2>
        <p className="text-neutral-300 mt-2">{data.modo_preparo ?? '—'}</p>
      </section>
    </div>
  );
}
