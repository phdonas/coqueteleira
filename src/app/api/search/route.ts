// src/app/api/search/route.ts
// (Item 1 â€” Busca combinada: texto + ingredientes)

import { NextRequest } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supa = await supabaseServer();
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("q") || "").trim();

  if (!raw) {
    const { data, error } = await supa
      .from("recipes")
      .select("id,nome,apresentacao,imagem_url,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
    return Response.json({ ok: true, items: data ?? [] });
  }

  // estratÃ©gia:
  // - busca por texto em nome/apresentacao
  // - se houver "vÃ­rgula", trata como ingredientes (todas as palavras devem bater em produto_raw)
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);

  // 1) texto
  const textQuery = supa
    .from("recipes")
    .select("id,nome,apresentacao,imagem_url,created_at")
    .or(`nome.ilike.%${raw}%,apresentacao.ilike.%${raw}%`)
    .order("created_at", { ascending: false });

  const [textRes] = await Promise.all([textQuery]);
  const textItems = textRes.data ?? [];

  // 2) ingredientes
  let ingItems: any[] = [];
  if (parts.length > 0) {
    // busca ids em recipe_ingredients que contenham todos os termos
    let ids: string[] = [];
    // comeÃ§a com o primeiro termo
    const first = parts[0];
    const { data: base, error: errBase } = await supa
      .from("recipe_ingredients")
      .select("recipe_id")
      .ilike("produto_raw", `%${first}%`)
      .limit(1000);
    if (!errBase && base) {
      ids = [...new Set(base.map((x) => x.recipe_id))];
      // refina pelos demais termos
      for (let i = 1; i < parts.length; i++) {
        const term = parts[i];
        const { data: step, error: errStep } = await supa
          .from("recipe_ingredients")
          .select("recipe_id")
          .in("recipe_id", ids)
          .ilike("produto_raw", `%${term}%`)
          .limit(1000);
        if (errStep) { ids = []; break; }
        ids = [...new Set(step.map((x) => x.recipe_id))];
        if (ids.length === 0) break;
      }
    }
    if (ids.length > 0) {
      const { data, error } = await supa
        .from("recipes")
        .select("id,nome,apresentacao,imagem_url,created_at")
        .in("id", ids)
        .order("created_at", { ascending: false });
      if (!error && data) ingItems = data;
    }
  }

  // combina e remove duplicados por id
  const map = new Map<string, any>();
  for (const it of [...textItems, ...ingItems]) map.set(it.id, it);
  const items = Array.from(map.values());

  return Response.json({ ok: true, items });
}



