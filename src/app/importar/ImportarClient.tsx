// src/app/importar/ImportarClient.tsx
// Client component com os hooks (useSearchParams/useRouter/etc.) e a UI da tela de Importar.

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * IMPORTANTE:
 * - Se sua antiga `page.tsx` tinha lÃ³gica de importaÃ§Ã£o (arquivo, texto, web),
 *   mova esse cÃ³digo para cÃ¡. Este stub mantÃ©m a rota funcional e tira o hook do Server.
 * - Se jÃ¡ existirem componentes especÃ­ficos (ex.: ImportFromFile, ImportFromText, ImportFromWeb),
 *   apenas importe-os e use-os aqui.
 */

export default function ImportarClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Ex.: preservar tab/modo via ?source=file|text|web
  const source = useMemo(
    () => (searchParams.get("source") ?? "file") as "file" | "text" | "web",
    [searchParams]
  );

  // Qualquer estado local necessÃ¡rio para UI
  const [tab, setTab] = useState<"file" | "text" | "web">(source);

  useEffect(() => {
    // Se o usuÃ¡rio alterar a aba localmente, sincroniza o parÃ¢metro de URL (opcional)
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("source") !== tab) {
      sp.set("source", tab);
      router.replace(`?${sp.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Importar receitas</h1>

      <div className="mb-4 inline-flex gap-2 rounded-xl bg-neutral-900 p-1">
        <button
          type="button"
          onClick={() => setTab("file")}
          className={`px-3 py-1 rounded-lg text-sm ${
            tab === "file" ? "bg-neutral-800" : "hover:bg-neutral-800/60"
          }`}
        >
          Arquivo
        </button>
        <button
          type="button"
          onClick={() => setTab("text")}
          className={`px-3 py-1 rounded-lg text-sm ${
            tab === "text" ? "bg-neutral-800" : "hover:bg-neutral-800/60"
          }`}
        >
          Texto
        </button>
        <button
          type="button"
          onClick={() => setTab("web")}
          className={`px-3 py-1 rounded-lg text-sm ${
            tab === "web" ? "bg-neutral-800" : "hover:bg-neutral-800/60"
          }`}
        >
          Web
        </button>
      </div>

      {/* 
        Abaixo, plugue seus componentes reais de importaÃ§Ã£o.
        Enquanto nÃ£o plugarmos os verdadeiros, mantemos stubs para nÃ£o quebrar o build.
      */}
      {tab === "file" && (
        <div className="rounded-xl border border-neutral-800 p-4">
          <p className="text-sm text-neutral-300 mb-3">
            Importe um arquivo com suas receitas.
          </p>
          <input
            type="file"
            className="block w-full rounded-lg border border-neutral-700 p-2 text-sm"
            accept=".json,.csv,.txt"
          />
          <div className="mt-3">
            <button
              type="button"
              className="rounded-lg px-3 py-1 text-sm bg-neutral-800 hover:bg-neutral-700"
            >
              Processar arquivo
            </button>
          </div>
        </div>
      )}

      {tab === "text" && (
        <div className="rounded-xl border border-neutral-800 p-4">
          <p className="text-sm text-neutral-300 mb-3">
            Cole aqui o texto com a(s) receita(s).
          </p>
          <textarea
            rows={8}
            className="w-full rounded-lg border border-neutral-700 bg-transparent p-2 text-sm"
            placeholder="Ex.: Nome; Ingredientes; Modo de preparo; ..."
          />
          <div className="mt-3">
            <button
              type="button"
              className="rounded-lg px-3 py-1 text-sm bg-neutral-800 hover:bg-neutral-700"
            >
              Processar texto
            </button>
          </div>
        </div>
      )}

      {tab === "web" && (
        <div className="rounded-xl border border-neutral-800 p-4">
          <p className="text-sm text-neutral-300 mb-3">
            Busque uma receita na web e importe para sua base.
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: conectar com /api/import/web
              alert("Busca na web ainda nÃ£o conectada.");
            }}
          >
            <input
              type="url"
              required
              placeholder="Cole a URL da receitaâ€¦"
              className="flex-1 rounded-lg border border-neutral-700 bg-transparent p-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg px-3 py-1 text-sm bg-neutral-800 hover:bg-neutral-700"
            >
              Importar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

