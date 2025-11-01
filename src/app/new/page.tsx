// src/app/new/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";

export default function NewRecipePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "",
    url: "",
    imagem_url: "",
    video_url: "",
    apresentacao: "",
    modo_preparo: "",
    ingredientesText: "",
    is_public: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const js = await res.json();
      if (!js.ok) throw new Error(js.error || "Erro ao salvar");
      router.push(`/recipe/${js.item.id}`);
    } catch (err: any) {
      setError(err.message ?? "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold text-white">Nova receita</h1>
      <form onSubmit={onSubmit} className="space-y-4">

        <div>
          <label className="mb-1 block text-sm text-neutral-300">Nome*</label>
          <input
            required
            value={form.nome}
            onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">URL de origem (opcional)</label>
            <input
              value={form.url}
              onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))}
              className="w-full rounded-md bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Imagem (URL)</label>
            <input
              value={form.imagem_url}
              onChange={(e) => setForm((s) => ({ ...s, imagem_url: e.target.value }))}
              className="w-full rounded-md bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700"
              placeholder="https://â€¦ .jpg | .png"
            />
          </div>
        </div>

        {form.imagem_url && (
          <div className="rounded-xl overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imagem_url} alt="Preview" className="w-full object-cover" />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-neutral-300">VÃ­deo (URL)</label>
          <input
            value={form.video_url}
            onChange={(e) => setForm((s) => ({ ...s, video_url: e.target.value }))}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700"
            placeholder="https://youtu.be/â€¦ | https://vimeo.com/â€¦"
          />
        </div>

        {form.video_url && (
          <div className="rounded-xl overflow-hidden border border-white/10">
            <VideoPlayer url={form.video_url} />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-neutral-300">ApresentaÃ§Ã£o</label>
          <input
            value={form.apresentacao}
            onChange={(e) => setForm((s) => ({ ...s, apresentacao: e.target.value }))}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-300">Modo de preparo</label>
          <textarea
            rows={5}
            value={form.modo_preparo}
            onChange={(e) => setForm((s) => ({ ...s, modo_preparo: e.target.value }))}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-300">Ingredientes (um por linha)</label>
          <textarea
            rows={5}
            value={form.ingredientesText}
            onChange={(e) => setForm((s) => ({ ...s, ingredientesText: e.target.value }))}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700"
            placeholder={`60 ml gin\n10 ml vermouth seco`}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="pub"
            type="checkbox"
            checked={form.is_public}
            onChange={(e) => setForm((s) => ({ ...s, is_public: e.target.checked }))}
            className="h-4 w-4"
          />
          <label htmlFor="pub" className="text-sm text-neutral-300">Tornar pÃºblica</label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            disabled={saving}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Salvandoâ€¦" : "Salvar"}
          </button>
          <a href="/" className="rounded-md border border-neutral-700 px-4 py-2">Cancelar</a>
        </div>
      </form>
    </div>
  );
}

