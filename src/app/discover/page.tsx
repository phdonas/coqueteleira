// src/app/discover/page.tsx
"use client";

import { useEffect, useState } from "react";

type Item = {
  external_id: string;
  nome: string;
  imagem_url: string | null;
  raw?: any;
};

export default function DiscoverPage() {
  const [q, setQ] = useState("");
  const [by, setBy] = useState<"name" | "ingredient">("name");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [importing, setImporting] = useState(false);

  async function runSearch() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/discover?q=${encodeURIComponent(q)}&by=${by}`);
      const js = await res.json();
      setItems(js.ok ? js.items : []);
    } finally {
      setLoading(false);
    }
  }

  async function importFromRaw(raw: any) {
    setImporting(true);
    try {
      // Tenta montar um payload compatÃ­vel com /api/import (POST)
      const nome = raw?.strDrink ?? "Sem tÃ­tulo";
      const imagem_url = raw?.strDrinkThumb ?? null;

      // se jÃ¡ veio instruÃ§Ãµes e ingredientes, usa; senÃ£o, tenta buscar detalhe
      let modo_preparo = raw?.strInstructions ?? null;
      const lines: string[] = [];

      for (let i = 1; i <= 15; i++) {
        const ing = raw?.[`strIngredient${i}`];
        const mea = raw?.[`strMeasure${i}`];
        if (! ing) continue;
        lines.push(`${(mea || "").trim()} ${String(ing).trim()}`.trim());
      }

      let ingredientesText = lines.filter(Boolean).join("\n");

      if (!modo_preparo || !ingredientesText) {
        // buscar detalhe por idDrink se vier de /filter.php
        const id = raw?.idDrink;
        if (id) {
          const detRes = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
          const detJs = await detRes.json();
          const d = detJs?.drinks?.[0];
          if (d) {
            modo_preparo = modo_preparo || d.strInstructions || null;
            const detLines: string[] = [];
            for (let i = 1; i <= 15; i++) {
              const ing = d?.[`strIngredient${i}`];
              const mea = d?.[`strMeasure${i}`];
              if (! ing) continue;
              detLines.push(`${(mea || "").trim()} ${String(ing).trim()}`.trim());
            }
            ingredientesText = ingredientesText || detLines.filter(Boolean).join("\n");
          }
        }
      }

      const payload = {
        nome,
        url: null,
        imagem_url,
        apresentacao: null,
        modo_preparo,
        ingredientesText,
        is_public: true,
      };

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const js = await res.json();
      if (js.ok) location.href = `/recipe/${js.item.id}`;
      else alert(js.error || "Falha ao importar");
    } finally {
      setImporting(false);
    }
  }

  useEffect(() => {
    // pesquisa inicial opcional
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-semibold mb-3">Descobrir coquetÃ©is (web)</h1>

      <div className="mb-4 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={by === "ingredient" ? "Ex.: gin" : "Ex.: negroni"}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          className="w-full rounded-md bg-neutral-900/90 px-3 py-2 text-white outline-none ring-1 ring-neutral-700 placeholder:text-neutral-400"
        />
        <select
          value={by}
          onChange={(e) => setBy(e.target.value as any)}
          className="rounded-md bg-neutral-900/90 px-3 py-2 text-white ring-1 ring-neutral-700"
        >
          <option value="name">Por nome</option>
          <option value="ingredient">Por ingrediente</option>
        </select>
        <button
          onClick={runSearch}
          disabled={loading}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Buscandoâ€¦" : "Buscar"}
        </button>
      </div>

      {!loading && items.length === 0 && <p className="text-neutral-400 text-sm">Sem resultados ainda.</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.external_id} className="flex gap-3 rounded-xl bg-neutral-900/95 p-3 ring-1 ring-neutral-800">
            <div className="h-20 w-24 overflow-hidden rounded-md bg-neutral-800 ring-1 ring-neutral-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imagem_url || ""} alt={it.nome} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold">{it.nome}</h3>
              <div className="mt-2">
                <button
                  onClick={() => importFromRaw((it as any).raw)}
                  disabled={importing}
                  className="rounded-md bg-emerald-600 px-3 py-1 text-sm text-white disabled:opacity-60"
                >
                  {importing ? "Importandoâ€¦" : "Importar"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

