// src/app/recipe/[id]/RecipeClient.tsx
"use client";

import { useEffect, useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import VideoPlayer from "@/components/VideoPlayer";

type Ingredient = {
  quantidade_raw?: string | null;
  unidade_label?: string | null;
  produto_raw?: string | null;
  text?: string | null;
};

type Recipe = {
  id: string;
  nome?: string | null;
  url?: string | null;
  apresentacao?: string | null;
  imagem_url?: string | null;
  video_url?: string | null;
  modo_preparo?: string | null;
  ingredientes?: Ingredient[];
};

function line(i: Ingredient) {
  const parts = [i.quantidade_raw, i.unidade_label, i.produto_raw].filter(Boolean);
  return parts.length ? parts.join(" ") : (i.text ?? "—");
}

export default function RecipeClient({ id }: { id: string }) {
  const [data, setData] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/recipes/${id}`, { cache: "no-store" });
        const js = await res.json();
        if (!js.ok) throw new Error(js.error || "Erro ao carregar");
        if (alive) setData(js.item as Recipe);
      } catch (e) {
        console.error(e);
        if (alive) setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!data) return <div className="p-6 text-red-400">Receita não encontrada.</div>;

  const title = (data.nome ?? "Sem título").trim();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-4 flex gap-2">
        <a href="/" className="px-3 py-1 rounded border border-neutral-700">Voltar</a>
        <FavoriteButton recipeId={data.id} title={title} />
      </div>

      <h1 className="text-2xl font-semibold mb-1">{title}</h1>
      {data.apresentacao && <p className="text-neutral-300">{data.apresentacao}</p>}

      {data.imagem_url && (
        <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.imagem_url} alt={title} className="w-full object-cover" />
        </div>
      )}

      {data.video_url && (
        <div className="mt-4">
          <VideoPlayer url={data.video_url} />
        </div>
      )}

      {data.url && (
        <div className="mt-3">
          <a className="text-sky-400 underline" href={data.url} target="_blank" rel="noreferrer">
            Link de origem
          </a>
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Ingredientes</h2>
        {data.ingredientes?.length ? (
          <ul className="list-disc pl-6 mt-2">
            {data.ingredientes.map((i, idx) => <li key={idx}>{line(i)}</li>)}
          </ul>
        ) : (
          <p className="text-neutral-400 mt-2">Nenhum ingrediente cadastrado.</p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Modo de preparo</h2>
        <p className="mt-2 whitespace-pre-line">{data.modo_preparo ?? "—"}</p>
      </section>
    </div>
  );
}
