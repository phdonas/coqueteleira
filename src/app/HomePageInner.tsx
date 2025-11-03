// src/app/HomePageInner.tsx
// src/app/HomePageInner.tsx
"use client";

import React from "react";
import Link from "next/link";

type RecipeCard = {
  id: string;
  name?: string | null;
  title?: string | null; // legado
  image_url?: string | null;
  url?: string | null;
  // demais campos ignorados no card
};

function normalizeName(r: RecipeCard) {
  return (r.name ?? r.title ?? "").trim();
}

export default function HomePageInner({
  initialItems,
}: {
  initialItems: RecipeCard[];
}) {
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<RecipeCard[]>(initialItems || []);
  const [loading, setLoading] = React.useState(false);

  async function doSearch() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/search?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json?.ok) setItems(json.items || []);
    } finally {
      setLoading(false);
    }
  }

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((it) => normalizeName(it).toLowerCase().includes(needle));
  }, [items, q]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded bg-neutral-900 border border-neutral-800 px-3 py-2"
          placeholder="Buscar por nome (ex.: Negroni)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
        />
        <button
          onClick={doSearch}
          className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
          disabled={loading}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
        <Link
          href="/recipe/new"
          className="px-3 py-2 rounded bg-green-700 hover:bg-green-600"
        >
          + Nova Receita
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((it) => {
          const name = normalizeName(it);
          return (
            <Link
              key={it.id}
              href={`/recipe/${it.id}`}
              className="flex gap-3 rounded border border-neutral-800 p-3 hover:bg-neutral-900"
            >
              <img
                src={it.image_url || it.url || "/placeholder.png"}
                alt={name || "Receita"}
                className="w-16 h-16 rounded object-cover border border-neutral-800"
                onError={(ev: any) => (ev.currentTarget.style.display = "none")}
              />
              <div className="min-w-0">
                <div className="font-medium truncate">{name || "Sem nome"}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
