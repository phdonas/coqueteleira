// src/app/settings/page.tsx
// (Item 11 â€” DiagnÃ³stico: pÃ¡gina /settings com checagens e ajuda de .env)

"use client";
import { useEffect, useState } from "react";

type Health = { ok: boolean; ping?: boolean; canSelect?: boolean; authed?: boolean; error?: string };

export default function SettingsPage() {
  const [health, setHealth] = useState<Health | null>(null);

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY, // sÃ³ em rotas server
    WEB_IMPORT_PROVIDER: process.env.WEB_IMPORT_PROVIDER || "thecocktaildb",
    THECOCKTAILDB_API_BASE: process.env.THECOCKTAILDB_API_BASE || "",
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/supa-health", { cache: "no-store" });
        setHealth(await r.json());
      } catch {
        setHealth({ ok: false, error: "Falha ao consultar /api/supa-health" });
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">ConfiguraÃ§Ãµes & DiagnÃ³stico</h1>

      <section className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-2 font-semibold">VariÃ¡veis .env</h2>
        <ul className="space-y-1 text-sm">
          <li>
            NEXT_PUBLIC_SUPABASE_URL:{" "}
            <b className={env.NEXT_PUBLIC_SUPABASE_URL ? "text-emerald-400" : "text-red-400"}>
              {env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "FALTA"}
            </b>
          </li>
          <li>
            NEXT_PUBLIC_SUPABASE_ANON_KEY:{" "}
            <b className={env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-emerald-400" : "text-red-400"}>
              {env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "OK" : "FALTA"}
            </b>
          </li>
          <li>
            SUPABASE_SERVICE_ROLE_KEY (apenas server):{" "}
            <b className={env.SUPABASE_SERVICE_ROLE_KEY ? "text-emerald-400" : "text-yellow-400"}>
              {env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "opcional"}
            </b>
          </li>
          <li>WEB_IMPORT_PROVIDER: <b className="text-neutral-200">{env.WEB_IMPORT_PROVIDER}</b></li>
          <li>THECOCKTAILDB_API_BASE: <b className="text-neutral-200">{env.THECOCKTAILDB_API_BASE || "â€”"}</b></li>
        </ul>
        <p className="mt-3 text-xs text-neutral-400">
          Dica: crie um arquivo <code>.env.local</code> na raiz do projeto e copie a partir do <code>.env.example</code>.
        </p>
      </section>

      <section className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-2 font-semibold">SaÃºde do Supabase</h2>
        {!health && <p className="text-sm text-neutral-400">Verificandoâ€¦</p>}
        {health && (
          <ul className="space-y-1 text-sm">
            <li>
              Ping:{" "}
              <b className={health.ping ? "text-emerald-400" : "text-red-400"}>
                {health.ping ? "OK" : "falhou"}
              </b>
            </li>
            <li>
              Consulta (SELECT):{" "}
              <b className={health.canSelect ? "text-emerald-400" : "text-red-400"}>
                {health.canSelect ? "OK" : "falhou"}
              </b>
            </li>
            <li>
              Autenticado:{" "}
              <b className={health.authed ? "text-emerald-400" : "text-yellow-400"}>
                {health.authed ? "Sim" : "NÃ£o"}
              </b>
            </li>
            {!health.ok && health.error && <li className="text-red-400">Erro: {health.error}</li>}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-2 font-semibold">DomÃ­nios de imagem sugeridos</h2>
        <p className="text-sm text-neutral-300">
          Confirme no <code>next.config.mjs</code> em <code>images.remotePatterns</code>:
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-neutral-200">
          <li>www.thecocktaildb.com</li>
          <li>i.imgur.com</li>
          <li>img.youtube.com</li>
          <li>i.ytimg.com</li>
        </ul>
      </section>
    </div>
  );
}

