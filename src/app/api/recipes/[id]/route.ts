// src/app/api/recipes/[id]/route.ts
// src/app/api/recipes/[id]/route.ts
/**
 * Changelog (2025-11-04)
 * - FIX TS: resposta de lista do Supabase pode ser `any[] | null`. Tipagem de `gi` corrigida.
 * - SAFE: usa `Array.isArray(gi.data)` antes de usar.
 * - Mantém handlers Next 15 (ctx.params como Promise), payload PT/EN, e deletes tolerantes.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type Any = Record<string, any>;

function getSupa() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) throw new Error('Supabase não configurado (URL/KEY ausentes).');

  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const supa = getSupa();

    const { data: recipe, error }: { data: any; error: any } = await supa
      .from('recipes')
      .select(
        [
          'id',
          'nome',
          'name',
          'title',
          'apresentacao',
          'description',
          'imagem_url',
          'image_url',
          'video_url',
          'modo_preparo',
          'instructions',
          'steps_text',
          'ingredients_text',
          'url',
          'is_public',
          'created_at',
          'updated_at',
        ].join(', ')
      )
      .eq('id', id)
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    if (!recipe) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    // SELECT sem .single() => data: any[] | null
    const gi: { data: any[] | null; error: any | null } = await supa
      .from('recipe_ingredients')
      .select(
        'id, name, qty, unit, notes, description, text, produto, produto_raw, quantidade, quantidade_raw, unidade, unidade_label'
      )
      .eq('recipe_id', id);

    const granular: Any[] = Array.isArray(gi.data) ? gi.data : [];

    const base: Record<string, unknown> =
      recipe && typeof recipe === 'object' && !Array.isArray(recipe) ? (recipe as Record<string, unknown>) : {};

    const item = { ...base, recipe_ingredients: granular };

    return NextResponse.json({ ok: true, item }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const payload = await req.json();
    const supa = getSupa();

    const updateObj: Any = {
      name: payload.name ?? payload.nome ?? payload.title ?? null,
      title: payload.title ?? null,
      nome: payload.nome ?? null,
      apresentacao: payload.apresentacao ?? payload.description ?? null,
      image_url: payload.image_url ?? payload.imagem_url ?? null,
      video_url: payload.video_url ?? null,
      steps_text: payload.steps_text ?? payload.modo_preparo ?? payload.instructions ?? null,
      ingredients_text: payload.ingredients_text ?? payload.ingredientesText ?? null,
      url: payload.url ?? null,
      is_public: typeof payload.is_public === 'boolean' ? payload.is_public : undefined,
      updated_at: new Date().toISOString(),
    };

    const { data, error }: { data: any; error: any } = await supa
      .from('recipes')
      .update(updateObj)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, item: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const supa = getSupa();

    const delIngr: { error?: any | null } = await supa.from('recipe_ingredients').delete().eq('recipe_id', id);
    if (delIngr.error && delIngr.error.code !== '42P01') {
      // ignora outros erros para não bloquear a exclusão da receita
    }

    const { error }: { error?: any | null } = await supa.from('recipes').delete().eq('id', id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Erro interno' }, { status: 500 });
  }
}
