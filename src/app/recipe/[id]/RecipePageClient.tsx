// src/app/recipe/[id]/RecipePageClient.tsx
"use client";

import { useRouter } from "next/navigation";
import React from "react";

type RecipeIn = {
  id: string;
  name?: string | null;
  title?: string | null; // legado
  image_url?: string | null;
  video_url?: string | null;
  ingredients_text?: string | null;
  ingredientsText?: string | null; // legado
  steps_text?: string | null;
  instructions?: string | null; // legado
  url?: string | null;
};

type Props = {
  data: RecipeIn;
};

function normalizeRecipe(r: RecipeIn) {
  return {
    id: r.id,
    name: r.name ?? r.title ?? "",
    image_url: r.image_url ?? null,
    video_url: r.video_url ?? null,
    url: r.url ?? null,
    ingredients_text: r.ingredients_text ?? r.ingredientsText ?? "",
    steps_text: r.steps_text ?? r.instructions ?? "",
  };
}

export default function RecipePageClient({ data }: Props) {
  const router = useRouter();
  const rec = normalizeRecipe(data);

  const ingredients = (rec.ingredients_text || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
        >
          Voltar
        </button>
        <h1 className="text-2xl font-semibold">{rec.name}</h1>
        <div />
      </div>

      {!!rec.image_url && (
        <img
          src={rec.image_url}
          alt={rec.name}
          className="w-full rounded-lg object-cover border border-neutral-800"
        />
      )}

      {!!rec.video_url && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-neutral-800">
          <iframe
            className="w-full h-full"
            src={rec.video_url}
            title={rec.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Ingredientes</h2>
        {ingredients.length ? (
          <ul className="list-disc ml-6 space-y-1">
            {ingredients.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">Sem ingredientes informados.</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Modo de preparo</h2>
        {rec.steps_text ? (
          <p className="whitespace-pre-wrap leading-relaxed">{rec.steps_text}</p>
        ) : (
          <p className="text-sm text-neutral-400">Sem instruções informadas.</p>
        )}
      </section>
    </div>
  );
}
