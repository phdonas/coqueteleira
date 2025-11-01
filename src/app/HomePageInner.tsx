// src/app/HomePageInner.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type RecipeCard = {
  id: string;
  // atenÃ§Ã£o: a base usa "nome" (nÃ£o "title")
  nome: string;
  apresentacao: string | null;
  imagem_url: string | null;
  url: string | null;
};

export default function HomePageInner() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecipeCard[]>([]);

  const queryString = useMemo(() => (q ? `?q=${encodeURIComponent(q)}` : ''), [q]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recipes${queryString}`, { cache: 'no-store' });
        const js = await res.json();
        if (alive) setItems(js.items ?? []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [queryString]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Buscar: "negroni" ou "gin, campari, vermute"'
          className="w-full rounded-md bg-neutral-900/90 px-3 py-2 text-white outline-none ring-1 ring-neutral-700 placeholder:text-neutral-400"
        />
        <button
          onClick={() => {}}
          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
        >
          Buscar
        </button>

        <Link
          href="/recipe/new"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          + Nova Receita
        </Link>
      </div>

      {loading && <p className="text-sm text-neutral-400">Carregandoâ€¦</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-neutral-400">Nenhuma receita encontrada.</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((r) => (
          <Link
            key={r.id}
            href={`/recipe/${r.id}`}
            className="group flex items-stretch gap-3 rounded-xl bg-neutral-900/95 p-3 ring-1 ring-neutral-800 hover:ring-neutral-600"
          >
            <div className="flex h-20 w-24 items-center justify-center overflow-hidden rounded-md bg-neutral-800 ring-1 ring-neutral-700">
              {r.imagem_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.imagem_url} alt={r.nome} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-neutral-400">sem foto</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-white">
                {r.nome ?? 'Sem tÃ­tulo'}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-neutral-300">
                {r.apresentacao ?? 'â€”'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


