// src/app/recipe/new/page.tsx
// src/app/recipe/new/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function NewRecipePage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [ingredients, setIngredients] = React.useState("");
  const [steps, setSteps] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    if (!name.trim()) {
      alert("Informe o nome da receita.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ingredients_text: ingredients,
          steps_text: steps,
          image_url: imageUrl || null,
          video_url: videoUrl || null,
          is_public: true,
        }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Erro ao salvar");
      const id = json.item?.id;
      router.push(id ? `/recipe/${id}` : "/");
    } catch (e: any) {
      alert(e?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
        >
          Voltar
        </button>
        <h1 className="text-2xl font-semibold">Nova receita</h1>
        <div />
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-neutral-300">Nome*</span>
        <input
          className="w-full rounded bg-neutral-900 border border-neutral-800 px-3 py-2"
          placeholder="Ex.: Negroni"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block space-y-2">
          <span className="text-sm text-neutral-300">Imagem (URL)</span>
          <input
            className="w-full rounded bg-neutral-900 border border-neutral-800 px-3 py-2"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-neutral-300">Vídeo (URL – YouTube embed)</span>
          <input
            className="w-full rounded bg-neutral-900 border border-neutral-800 px-3 py-2"
            placeholder="https://www.youtube.com/embed/..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-neutral-300">Ingredientes (1 por linha)</span>
        <textarea
          className="w-full min-h-[160px] rounded bg-neutral-900 border border-neutral-800 px-3 py-2"
          placeholder={"50 ml gin\n25 ml vermute\ngelo\ncasca de laranja"}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-neutral-300">Modo de preparo</span>
        <textarea
          className="w-full min-h-[160px] rounded bg-neutral-900 border border-neutral-800 px-3 py-2"
          placeholder="Misture todos os ingredientes com gelo; sirva."
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
        />
      </label>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded bg-green-700 hover:bg-green-600 disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}



