'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { norm, productTerms } from '@/lib/normalize';

type Recipe = any;

function arraysEqual(a: string[] = [], b: string[] = []) {
  if (a.length !== b.length) return false;
  const A = [...a].sort();
  const B = [...b].sort();
  return A.every((v, i) => v === B[i]);
}

export default function HomePage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Recipe[]>([]);
  const [refreshTick, setRefreshTick] = useState(0); // força repaint após upgrade do índice

  useEffect(() => {
    (async () => {
      const recs = await db.recipes.toArray();
      setItems(recs);

      // ---- UPGRADE de índice: garante termos por ingrediente para as receitas existentes ----
      // Executa em background; para poucas receitas é rápido.
      for (const r of recs) {
        // pega ingredientes desta receita
        const ingRows = await db.recipe_ingredients.where('recipe_id').equals(r.id).toArray();
        const terms = Array.from(new Set(ingRows.flatMap(i => productTerms(i.produto_raw))));
        // se mudou, atualiza
        if (!arraysEqual(terms, r.ingredientes_norm_set || [])) {
          await db.recipes.update(r.id, { ingredientes_norm_set: terms });
        }
      }
      // recarrega a lista após possível upgrade
      const updated = await db.recipes.toArray();
      setItems(updated);
      setRefreshTick(x => x + 1);
    })();
  }, []);

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return items;

    // Se houver vírgulas, interpretamos como "ingredientes" com AND
    const parts = query.split(',').map(s => norm(s)).filter(Boolean);

    if (parts.length > 1) {
      // AND entre ingredientes
      return items.filter((r) =>
        (r.ingredientes_norm_set || []).length &&
        parts.every((t) => (r.ingredientes_norm_set as string[]).includes(t))
      );
    } else {
      // Uma única entrada: procurar por nome OU ingredientes
      const single = norm(query);
      return items.filter((r) => {
        const nomeMatch = norm(r.nome || '').includes(single);
        const ingMatch = (r.ingredientes_norm_set || []).includes(single);
        return nomeMatch || ingMatch;
      });
    }
  }, [q, items, refreshTick]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder='Busque por nome ou ingredientes (use vírgulas para combinar com E). Ex.: "caipirinha" ou "cachaça, limão, açúcar"'
          className="flex-1 border rounded px-3 py-2"
        />
        <Link href="/new" className="px-3 py-2 border rounded bg-white">+ Nova</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {results.map((r)=>(
          <Link href={`/recipe/${r.id}`} key={r.id} className="bg-white border rounded-xl p-3 hover:shadow">
            <div className="font-semibold">{r.nome}</div>
            <div className="text-xs text-slate-600">{r.codigo}</div>
            {r.imagem_url && <img src={r.imagem_url} alt="" className="mt-2 h-40 w-full object-cover rounded-lg" />}
            <div className="text-sm mt-2 line-clamp-2">
              {(r.ingredientes_norm_set || []).slice(0,5).join(', ')}
            </div>
          </Link>
        ))}
      </div>

      {results.length===0 && <div className="text-sm text-slate-600">Nenhuma receita encontrada.</div>}
    </div>
  );
}
