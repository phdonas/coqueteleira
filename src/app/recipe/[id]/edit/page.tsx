// src/app/recipe/[id]/edit/page.tsx
// src/app/recipe/[id]/edit/page.tsx
// (Editar Receita • completo)
// - Carrega a receita via /api/recipes/[id]
// - Form com ordem: Nome > URL origem > Imagem (URL) > Vídeo (URL) > Ingredientes (textarea) > Modo de Preparo > Apresentação
// - Preview dos ingredientes no mesmo padrão visual (IngredientTable)
// - Botões: Voltar (preserva ?q), Salvar, Excluir (só dono)
// - PATCH envia campos e `ingredientesText` para reprocessar ingredientes no backend
// - DELETE remove a receita e volta para a lista (preservando ?q)

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import IngredientTable from "@/components/IngredientTable";
import ConverterWidget from "@/components/ConverterWidget";

type IngRow = {
  quantidade_raw: string;
  unidade_label: string;
  produto_raw: string;
};

type RecipeItem = {
  id: string;
  nome: string;
  url: string | null;
  imagem_url: string | null;
  video_url: string | null;
  apresentacao: string | null;
  modo_preparo: string | null;
  ingredientes?: IngRow[];
  is_public?: boolean;
};

const RE_LINE =
  /^([\d¼½¾./\-]+[^\s]*)?\s*([\p{L}]+)?\s+(.+)$/u; // quantidade | unidade | produto

export default function EditRecipePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get("q");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [apresentacao, setApresentacao] = useState<string | null>(null);
  const [modoPreparo, setModoPreparo] = useState<string | null>(null);
  const [ingredientesText, setIngredientesText] = useState<string>("");

  const [canDelete, setCanDelete] = useState(false);

  // Carrega a receita
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/recipes/${params.id}`, { cache: "no-store" });
        const j = await res.json();
        if (!res.ok || !j?.ok) throw new Error(j?.error || "Falha ao carregar");
        if (cancelled) return;

        const item: RecipeItem = j.item;

        setNome(item.nome ?? "");
        setUrl(item.url ?? null);
        setImagemUrl(item.imagem_url ?? null);
        setVideoUrl(item.video_url ?? null);
        setApresentacao(item.apresentacao ?? null);
        setModoPreparo(item.modo_preparo ?? null);

        // Reconstrói ingredientesText a partir das linhas atuais
        const txt =
          (item.ingredientes ?? [])
            .map((r) =>
              [r.quantidade_raw, r.unidade_label, r.produto_raw].filter(Boolean).join(" ")
            )
            .join("\n") || "";
        setIngredientesText(txt);

        setCanDelete(Boolean(j.can_delete));
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Erro ao carregar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Preview dos ingredientes a partir do textarea
  const previewRows: IngRow[] = useMemo(() => {
    return ingredientesText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line) => {
        const m = line.match(RE_LINE);
        const quantidade_raw = (m?.[1] ?? "").toString();
        const unidade_label = (m?.[2] ?? "").toString();
        const produto_raw = (m?.[3] ?? line).toString();
        return { quantidade_raw, unidade_label, produto_raw };
      });
  }, [ingredientesText]);

  function handleBack() {
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  async function handleDelete() {
    if (!canDelete) return;
    if (!confirm("Excluir esta receita? Esta ação não pode ser desfeita.")) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/recipes/${params.id}`, { method: "DELETE" });
      const j = await r.json().catch(() => ({ ok: false, error: "Erro inesperado." }));
      if (!j.ok) throw new Error(j.error || "Falha ao excluir.");
      router.replace(q ? `/?q=${encodeURIComponent(q)}` : "/");
    } catch (e: any) {
      setErr(e?.message || "Erro ao excluir");
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const body = {
        nome: nome?.trim(),
        url: (url ?? "")?.trim() || null,
        imagem_url: (imagemUrl ?? "")?.trim() || null,
        video_url: (videoUrl ?? "")?.trim() || null,
        apresentacao: (apresentacao ?? "")?.trim() || null,
        modo_preparo: (modoPreparo ?? "")?.trim() || null,
        ingredientesText, // backend normaliza + reescreve ingredientes
      };

      const r = await fetch(`/api/recipes/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const j = await r.json().catch(() => ({ ok: false, error: "Erro inesperado." }));
      if (!j.ok) throw new Error(j.error || "Falha ao salvar.");
      // sucesso: volta ao detalhe da receita
      router.replace(q ? `/recipe/${params.id}?q=${encodeURIComponent(q)}` : `/recipe/${params.id}`);
    } catch (e: any) {
      setErr(e?.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-3">
      {/* Barra de ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm text-white ring-1 ring-white/20 hover:bg-neutral-700"
            title="Voltar"
          >
            Voltar
          </button>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white ring-1 ring-red-500 hover:bg-red-500 disabled:opacity-60"
              title="Excluir receita"
            >
              Excluir
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving || !nome.trim()}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white ring-1 ring-sky-500 hover:bg-sky-500 disabled:opacity-60"
            title="Salvar alterações"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>

      <h1 className="text-xl font-semibold">Editar receita</h1>

      {err && <p className="text-sm text-red-400">{err}</p>}
      {loading && <p className="text-sm text-neutral-300">Carregando…</p>}

      {/* Form */}
      {!loading && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-4"
        >
          {/* Nome */}
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Nome*</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Negroni"
              className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          {/* URL + Imagem URL */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-neutral-300">URL de origem</label>
              <input
                type="url"
                value={url ?? ""}
                onChange={(e) => setUrl(e.target.value || null)}
                placeholder="https://exemplo.com/receita"
                className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-300">Imagem (URL)</label>
              <input
                type="url"
                value={imagemUrl ?? ""}
                onChange={(e) => setImagemUrl(e.target.value || null)}
                placeholder="https://…/foto.jpg"
                className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>

          {/* Vídeo URL */}
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Vídeo (URL)</label>
            <input
              type="url"
              value={videoUrl ?? ""}
              onChange={(e) => setVideoUrl(e.target.value || null)}
              placeholder="https://www.youtube.com/watch?v=…"
              className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          {/* Ingredientes (textarea) */}
          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              Ingredientes (um por linha)
            </label>
            <textarea
              rows={6}
              value={ingredientesText}
              onChange={(e) => setIngredientesText(e.target.value)}
              placeholder={"50 ml gin\n50 ml campari\n50 ml vermute tinto"}
              className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          {/* Modo de Preparo */}
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Modo de preparo</label>
            <textarea
              rows={5}
              value={modoPreparo ?? ""}
              onChange={(e) => setModoPreparo(e.target.value || null)}
              placeholder="Descreva o passo a passo…"
              className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          {/* Apresentação */}
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Apresentação</label>
            <input
              type="text"
              value={apresentacao ?? ""}
              onChange={(e) => setApresentacao(e.target.value || null)}
              placeholder="Breve descrição (ex.: clássico italiano)"
              className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white ring-1 ring-neutral-700 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          {/* Preview + Conversor */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-neutral-200">
                Preview dos ingredientes
              </h2>
              <IngredientTable
                value={previewRows}
                onChange={(rows) => {
                  // Quando editar inline na tabela, reflete no textarea
                  const txt = rows
                    .map((r) =>
                      [r.quantidade_raw, r.unidade_label, r.produto_raw]
                        .filter(Boolean)
                        .join(" ")
                    )
                    .join("\n");
                  setIngredientesText(txt);
                }}
              />
              <p className="mt-2 text-xs text-neutral-400">
                Este preview é editável. A área acima (ingredientes) também aceita colar lista.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h2 className="mb-2 text-sm font-semibold text-neutral-200">Conversor rápido</h2>
              <ConverterWidget />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
