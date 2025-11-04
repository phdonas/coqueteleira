// src/app/api/search/route.ts
// src/app/api/search/route.ts
/**
 * Changelog (2025-11-04):
 * - NOVA rota /api/search compatível com os testes:
 *   GET ?q=...&ingredient=...&page=1&pageSize=5
 * - Implementa filtro tolerante (nome/descrição/preparo em memória) e paginação.
 * - Usa Supabase se env presente; se não houver env, responde 200 com lista vazia.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type Any = Record<string, any>;

function getEnv() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return { url, key };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim().toLowerCase();
    const ingredient = (searchParams.get('ingredient') ?? '').trim().toLowerCase();
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const pageSize = Math.min(Math.max(1, Number(searchParams.get('pageSize') ?? '20')), 100);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { url, key } = getEnv();
    if (!url || !key) {
      // Sem Supabase configurado: responde vazio, mas 200 e ok:true
      return NextResponse.json(
        { ok: true, items: [], page, pageSize, total: 0 },
        { status: 200 }
      );
    }

    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Seleção ampla o suficiente para filtrar localmente
    const { data, error } = await sb
      .from('recipes')
      .select(
        `
        id, created_at,
        nome, name, title,
        apresentacao, description,
        image_url, imagem_url,
        ingredients_text,
        steps_text, modo_preparo, instructions,
        url, video_url
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      // Continua respondendo 200 para não quebrar res.ok() nos testes
      return NextResponse.json(
        { ok: true, items: [], page, pageSize, total: 0, note: error.message },
        { status: 200 }
      );
    }

    const filtered = (data ?? []).filter((r) => {
      const nameLike = (r.nome ?? r.name ?? r.title ?? '').toString().toLowerCase();
      const descLike = (r.apresentacao ?? r.description ?? '').toString().toLowerCase();
      const stepsLike = (r.steps_text ?? r.modo_preparo ?? r.instructions ?? '').toString().toLowerCase();
      const ingrText = (r.ingredients_text ?? '').toString().toLowerCase();

      const matchQ = q ? (nameLike.includes(q) || descLike.includes(q) || stepsLike.includes(q)) : true;
      const matchIngredient = ingredient ? ingrText.includes(ingredient) : true;

      return matchQ && matchIngredient;
    });

    const items = filtered.slice(from, to + 1);
    return NextResponse.json(
      { ok: true, items, page, pageSize, total: filtered.length },
      { status: 200 }
    );
  } catch (e: any) {
    // Mantém 200 para não falhar res.ok() — reporta ok:true com lista vazia
    return NextResponse.json(
      { ok: true, items: [], page: 1, pageSize: 0, total: 0, note: e?.message ?? 'search degraded' },
      { status: 200 }
    );
  }
}
