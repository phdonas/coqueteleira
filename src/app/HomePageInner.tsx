"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/db";
import { norm, productTerms } from "@/lib/normalize";

type Recipe = any;

function arraysEqual(a: string[] = [], b: string[] = []) {
  if (a.length !== b.length) return false;
  const A = [...a].sort();
  const B = [...b].sort();
  return A.every((v, i) => v === B[i]);
}

export default function HomePageInner() {
  // lê o parâmetro ?q=tequila da URL
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [q, setQ] = useState(initialQ);
  const [items, setItems] = useState<Recipe[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  // carrega receitas do Dexie e gera o índice de ingredientes normalizados
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
          new Set(
            ingRows.flatMap((i: any) => productTerms(i.produto_raw))
          )
        );

        if (!arraysEqual(terms, r.ingredientes_norm_set || [])) {
          await db.recipes.update(r.id, {
            ingredientes_norm_set: terms,
          });
        }
      }

      const updated = await db.recipes.toArray();
      setItems(updated);
      setRefreshTick((x) => x + 1);
    })();
  }, []);

  // aplica filtro de busca (por nome OU por ingredientes)
  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return items;

    const parts = query
      .split(",")
      .map((s) => norm(s))
      .filter(Boolean);

    if (parts.length > 1) {
      // vários ingredientes separados por vírgula = AND
      return items.filter(
        (r: any) =>
          (r.ingredientes_norm_set || []).length &&
          parts.every((t) =>
            (r.ingredientes_norm_set as string[]).includes(t)
          )
      );
    } else {
      // busca por nome OU por ingrediente único
      const single = norm(query);
      return items.filter((r: any) => {
        const nomeMatch = norm(r.nome || "").includes(single);
        const ingMatch = (r.ingredientes_norm_set || []).includes(single);
        return nomeMatch || ingMatch;
      });
    }
  }, [q, items, refreshTick]);

  // salva o filtro atual para que a tela de receita saiba "voltar"
  function handleSelectRecipe() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lastQuery", q);
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de busca e botão Nova (desktop) */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Buscar: "negroni" ou "gin, campari, vermute"'
          className="flex-1 bg-[#2a2a31] text-zinc-100 placeholder-zinc-500 border border-white/10 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#C0742E]/40 focus:border-[#C0742E]/40"
        />

        <Link
          href="/new"
          className="hidden sm:inline-flex bg-[#C0742E] text-black text-base font-medium rounded-xl h-12 px-5 items-center justify-center hover:bg-[#d88033]"
        >
          + Nova Receita
        </Link>
      </div>

      {/* Lista de receitas */}
      {results.length === 0 && (
        <div className="text-base text-zinc-500">
          Nenhuma receita encontrada.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {results.map((r: any) => (
          <Link
            key={r.id}
            href={`/recipe/${r.id}`}
            onClick={handleSelectRecipe}
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
                <div className="w-16 h-16 rounded-lg bg-[#2a2a31] border border-white/10 flex items-center justify-center text-[11px] text-zinc-500 flex-shrink-0 text-center leading-tight">
                  sem
                  <br />
                  foto
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="text-zinc-100 font-semibold leading-snug text-lg truncate group-hover:text-[#C0742E]">
                  {r.nome || "Sem título"}
                </div>

                {r.codigo && (
                  <div className="text-xs text-zinc-500 uppercase tracking-wide">
                    {r.codigo}
                  </div>
                )}

                <div className="text-sm text-zinc-400 mt-2 line-clamp-2">
                  {(r.ingredientes_norm_set || [])
                    .slice(0, 5)
                    .join(", ")}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-xs text-zinc-600 leading-snug">
        Dica: separe ingredientes por vírgula para buscar combinações
        obrigatórias. Ex.:{" "}
        <span className="text-zinc-400">
          cachaça, limão, açúcar
        </span>{" "}
        retorna só receitas que tenham TODOS.
      </div>
    </div>
  );
}
