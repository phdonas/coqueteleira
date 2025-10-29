"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { norm, productTerms } from "@/lib/normalize";

// Mantém o tipo aberto. Se quiser, depois formalizamos.
type Recipe = any;

function arraysEqual(a: string[] = [], b: string[] = []) {
  if (a.length !== b.length) return false;
  const A = [...a].sort();
  const B = [...b].sort();
  return A.every((v, i) => v === B[i]);
}

export default function HomePage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Recipe[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  // Carrega receitas e garante índices de busca (ingredientes_norm_set)
  useEffect(() => {
    (async () => {
      const recs = await db.recipes.toArray();
      setItems(recs);

      for (const r of recs) {
        const ingRows = await db.recipe_ingredients
          .where("recipe_id")
          .equals(r.id)
          .toArray();
        const terms = Array.from(
          new Set(ingRows.flatMap((i) => productTerms(i.produto_raw)))
        );
        if (!arraysEqual(terms, r.ingredientes_norm_set || [])) {
          await db.recipes.update(r.id, { ingredientes_norm_set: terms });
        }
      }

      const updated = await db.recipes.toArray();
      setItems(updated);
      setRefreshTick((x) => x + 1);
    })();
  }, []);

  // Resultados de busca
  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return items;

    const parts = query
      .split(",")
      .map((s) => norm(s))
      .filter(Boolean);

    if (parts.length > 1) {
      // busca por vários ingredientes = AND
      return items.filter(
        (r) =>
          (r.ingredientes_norm_set || []).length &&
          parts.every((t) =>
            (r.ingredientes_norm_set as string[]).includes(t)
          )
      );
    } else {
      // busca por nome OU por ingrediente único
      const single = norm(query);
      return items.filter((r) => {
        const nomeMatch = norm(r.nome || "").includes(single);
        const ingMatch = (r.ingredientes_norm_set || []).includes(single);
        return nomeMatch || ingMatch;
      });
    }
  }, [q, items, refreshTick]);

  return (
    <div className="space-y-6">
      {/* Campo de busca + botão Nova (esconde no mobile porque já tem nav "Novo") */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Buscar: "negroni" ou "gin, campari, vermute"'
          className="flex-1 bg-[#2a2a31] text-zinc-100 placeholder-zinc-500 border border-white/10 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#C0742E]/40 focus:border-[#C0742E]/40"
        />

        <Link
          href="/new"
          className="hidden sm:inline-flex bg-[#C0742E] text-black text-sm font-medium rounded-xl h-11 px-4 items-center justify-center hover:bg-[#d88033]"
        >
          + Nova Receita
        </Link>
      </div>

      {/* Lista de receitas */}
      {results.length === 0 && (
        <div className="text-sm text-zinc-500">
          Nenhuma receita encontrada.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {results.map((r: any) => {
          return (
            <Link
              key={r.id}
              href={`/recipe/${r.id}`}
              className="group bg-[#1f1f24] border border-white/10 rounded-2xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.8)] hover:border-[#C0742E]/40 hover:shadow-[0_30px_80px_rgba(192,116,46,0.2)] transition-colors"
            >
              <div className="flex items-start gap-3">
                {r.imagem_url ? (
                  <img
                    src={r.imagem_url}
                    alt={r.nome}
                    className="w-16 h-16 rounded-lg object-cover border border-white/10 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-[#2a2a31] border border-white/10 flex items-center justify-center text-[10px] text-zinc-500 flex-shrink-0">
                    sem<br />foto
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-zinc-100 font-semibold leading-snug text-1g truncate group-hover:text-[#C0742E]">
                    {r.nome || "Sem título"}
                  </div>

                  {r.codigo && (
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wide">
                      {r.codigo}
                    </div>
                  )}

                  {/* mostrarmos alguns ingredientes indexados */}
                  <div className="text-sm text-zinc-400 mt-2 line-clamp-2">
                    {(r.ingredientes_norm_set || [])
                      .slice(0, 5)
                      .join(", ")}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Nota de uso */}
      <div className="text-[10px] text-zinc-600 leading-snug">
        Dica: separe ingredientes por vírgula para buscar combinações
        obrigatórias. Ex.: <span className="text-zinc-400">
          cachaça, limão, açúcar
        </span>{" "}
        retorna só receitas que tenham TODOS.
      </div>
    </div>
  );
}
