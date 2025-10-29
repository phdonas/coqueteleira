"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/db";
import Button from "@/components/ui/Button";

type RowIng = {
  quantidade_raw: string;
  unidade_label: string;
  produto_raw: string;
};

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [imagem, setImagem] = useState("");
  const [video, setVideo] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [modo, setModo] = useState("");
  const [apresentacao, setApresentacao] = useState("");
  const [url, setUrl] = useState("");
  const [ings, setIngs] = useState<RowIng[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const r = await db.recipes.get(id);
      if (!active) return;

      if (!r) {
        setNotFound(true);
        setLoaded(true);
        return;
      }

      setNome(r.nome || "");
      setCodigo(r.codigo || "");
      setImagem(r.imagem_url || "");
      setVideo(r.video_url || "");
      setComentarios(r.comentarios || "");
      setModo(r.modo_preparo || "");
      setApresentacao(r.apresentacao || "");
      setUrl(r.url || "");

      const list = await db.recipe_ingredients
        .where("recipe_id")
        .equals(id)
        .toArray();
      if (!active) return;
      setIngs(
        list.map((i: any) => ({
          quantidade_raw: i.quantidade_raw || "",
          unidade_label: i.unidade_label || "",
          produto_raw: i.produto_raw || "",
        }))
      );

      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // tenta transformar link de YouTube em embed
  const videoEmbedUrl = useMemo(() => {
    if (!video) return "";
    const ytMatch = video.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=)([A-Za-z0-9_\-]+)/
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    return "";
  }, [video]);

  // Função utilitária:
  // define para onde devemos voltar (lista com ou sem filtro)
  function goBackToList() {
    if (typeof window !== "undefined") {
      const lastQ = sessionStorage.getItem("lastQuery") || "";
      const dest = lastQ
        ? `/?q=${encodeURIComponent(lastQ)}`
        : "/";
      router.push(dest);
    } else {
      router.push("/");
    }
  }

  // Botão VOLTAR agora usa essa função
  function handleBack() {
    goBackToList();
  }

  // Exclusão da receita atual
  async function handleDelete() {
    // confirmação manual para evitar apagar sem querer
    const ok = typeof window !== "undefined"
      ? window.confirm(
          "Tem certeza que deseja EXCLUIR esta receita?\nEsta ação não pode ser desfeita."
        )
      : false;

    if (!ok) return;

    // 1) remover ingredientes da receita
    // 2) remover a própria receita
    // fazemos em transação Dexie para garantir consistência
    await db.transaction(
      "rw",
      db.recipe_ingredients,
      db.recipes,
      async () => {
        await db.recipe_ingredients.where("recipe_id").equals(id).delete();
        await db.recipes.delete(id as any);
      }
    );

    // depois de excluir, voltamos para a lista correspondente
    goBackToList();
  }

  if (!loaded) {
    return (
      <div className="text-base text-zinc-400">
        Carregando receita…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-base text-zinc-400">
        Receita não encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da receita */}
      <section className="bg-[#1f1f24] border border-white/10 rounded-2xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.8)] flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex-shrink-0 w-full md:w-48">
          {videoEmbedUrl ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              <iframe
                src={videoEmbedUrl}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          ) : imagem ? (
            <img
              src={imagem}
              alt={nome}
              className="w-full aspect-square object-cover rounded-xl border border-white/10 bg-[#2a2a31]"
            />
          ) : (
            <div className="w-full aspect-square rounded-xl bg-[#2a2a31] border border-white/10 flex items-center justify-center text-[11px] text-zinc-500 text-center leading-tight">
              sem mídia
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[#C0742E] text-xs font-medium uppercase tracking-wide mb-1">
                Coquetéis do Paulo
              </div>
              <div className="text-zinc-100 font-semibold text-2xl leading-tight break-words">
                {nome || "Sem título"}
              </div>

              {codigo && (
                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">
                  Código: {codigo}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 text-zinc-400">
              {apresentacao && (
                <div className="max-w-[200px] text-right leading-snug">
                  <span className="text-zinc-500 uppercase text-[10px] tracking-wide block">
                    Serviço
                  </span>
                  <span className="text-zinc-200 text-sm">
                    {apresentacao}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-end">
                {/* Editar */}
                <Link href={`/edit/${id}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                  >
                    Editar
                  </Button>
                </Link>

                {/* Excluir */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                >
                  Excluir
                </Button>

                {/* Voltar */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>

          {comentarios && (
            <div className="text-sm text-zinc-400 mt-3 leading-relaxed">
              {comentarios}
            </div>
          )}

          {url && (
            <div className="text-xs text-zinc-500 mt-2 truncate">
              Fonte original:&nbsp;
              <a
                href={url}
                target="_blank"
                className="text-[#C0742E] hover:text-[#d88033] underline"
                rel="noreferrer"
              >
                {url}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Ingredientes */}
      <section className="bg-[#1f1f24] border border-white/10 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.8)]">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="text-zinc-100 font-semibold text-base">
            Ingredientes
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wide">
            dose / produto
          </div>
        </div>

        <ul className="p-4 text-base text-zinc-200 space-y-2">
          {ings.map((ing, idx) => (
            <li key={idx} className="flex flex-wrap gap-2">
              <span className="text-zinc-100">
                {[
                  ing.quantidade_raw,
                  ing.unidade_label,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </span>
              <span className="text-zinc-400">—</span>
              <span className="text-zinc-300">{ing.produto_raw}</span>
            </li>
          ))}

          {ings.length === 0 && (
            <li className="text-zinc-500 text-base">
              (Sem ingredientes cadastrados)
            </li>
          )}
        </ul>
      </section>

      {/* Preparo */}
      <section className="bg-[#1f1f24] border border-white/10 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.8)]">
        <div className="p-4 border-b border-white/5">
          <div className="text-zinc-100 font-semibold text-base">
            Modo de preparo
          </div>
        </div>

        <div className="p-4 text-base text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {modo || "—"}
        </div>
      </section>
    </div>
  );
}
