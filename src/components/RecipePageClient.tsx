// src/components/RecipePageClient.tsx
// (Funcionalidade â€” BotÃ£o "Excluir receita" no detalhe; confirma, chama DELETE e volta mantendo ?q)

"use client";
import { useRouter, useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";

type Ingrediente = {
  quantidade_raw?: string | null;
  unidade_label?: string | null;
  produto_raw: string;
};

type Item = {
  id: string;
  nome: string;
  url?: string | null;
  imagem_url?: string | null;
  video_url?: string | null;
  apresentacao?: string | null;
  modo_preparo?: string | null;
  ingredientes?: Ingrediente[];
  is_public?: boolean;
};

export default function RecipePageClient({
  item,
  can_delete,
}: {
  item: Item;
  can_delete?: boolean;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get("q");

  async function handleDelete() {
    const ok = window.confirm(`Excluir a receita "${item.nome}"? Esta aÃ§Ã£o nÃ£o pode ser desfeita.`);
    if (!ok) return;

    const r = await fetch(`/api/recipes/${item.id}`, { method: "DELETE" });
    const j = await r.json().catch(() => ({ ok: false, error: "Erro inesperado" }));
    if (!j.ok) {
      alert(j.error || "Falha ao excluir.");
      return;
    }
    // volta para a Home mantendo o filtro (se houver)
    router.replace(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold">{item.nome}</h1>
        {can_delete ? (
          <button
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white ring-1 ring-red-500 hover:bg-red-500"
            title="Excluir receita"
          >
            Excluir
          </button>
        ) : null}
      </div>

      {item.imagem_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imagem_url}
          alt={item.nome}
          className="w-full rounded-xl border border-white/10 object-cover"
        />
      ) : null}

      {item.video_url ? <VideoPlayer url={item.video_url} /> : null}

      {item.apresentacao ? <p className="text-neutral-300">{item.apresentacao}</p> : null}

      {item.ingredientes?.length ? (
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-lg font-semibold">Ingredientes</h2>
          <ul className="list-disc space-y-1 pl-5">
            {item.ingredientes.map((i, idx) => (
              <li key={idx} className="text-neutral-200">
                {[i.quantidade_raw, i.unidade_label, i.produto_raw].filter(Boolean).join(" ")}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {item.modo_preparo ? (
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-lg font-semibold">Modo de preparo</h2>
          <p className="whitespace-pre-line text-neutral-200">{item.modo_preparo}</p>
        </section>
      ) : null}
    </div>
  );
}

