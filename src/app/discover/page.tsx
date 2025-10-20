'use client';

import { useMemo, useState } from 'react';
import { db } from '@/lib/db';
import { uuid, genCodigo } from '@/lib/id';
import { parseQuantidade, productTerms } from '@/lib/normalize';
import VideoPlayer from '@/components/VideoPlayer';
import { useRouter } from 'next/navigation';

// -------------------- Utilidades de parsing para medida --------------------
type QtyUnit = { quantidade_raw: string; unidade_label: string; };
const UNIT_MAP: { regex: RegExp; label: string }[] = [
  { regex: /\bml\b/i, label: 'ml' },
  { regex: /\boz\b/i, label: 'oz' },
  { regex: /\bcl\b/i, label: 'cl' },
  { regex: /\btsp\b|\bteaspoons?\b|\bcolher(?:es)? de ch[áa]\b/i, label: 'tsp' },
  { regex: /\btbsp\b|\btablespoons?\b|\bcolher(?:es)? de sopa\b/i, label: 'tbsp' },
  { regex: /\bbar ?spoon(?:s)?\b|\bcolher(?:es)? de bar\b/i, label: 'barspoon' },
  { regex: /\bdash(?:es)?\b/i, label: 'dash' },
  { regex: /\bdrop(?:s)?\b/i, label: 'gota' },
  { regex: /\bunits?\b|\bunidades?\b|\bunid(?:ade)?s?\b/i, label: 'unidade' },
  { regex: /\bg(?:ramas?)?\b/i, label: 'g' },
];
function parseMeasure(measureRaw?: string): QtyUnit {
  const measure = (measureRaw || '').trim().replace(/\s+/g, ' ');
  if (!measure) return { quantidade_raw: '', unidade_label: '' };

  // 1) quantidade
  const qtyMatch = measure.match(/^(\d+(?:[.,]\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)/);
  const quantidade_raw = qtyMatch ? qtyMatch[1].trim() : '';

  // 2) unidade
  let unidade_label = '';
  let rest = measure;
  if (qtyMatch) rest = measure.slice(qtyMatch[0].length).trim();
  for (const u of UNIT_MAP) {
    const m = rest.match(new RegExp('^\\s*(' + u.regex.source + ')', 'i'));
    if (m) { unidade_label = u.label; break; }
  }
  return { quantidade_raw, unidade_label };
}

// -------------------- Tipos da API pública --------------------
type ApiSearchItem = { idDrink: string; strDrink: string; strDrinkThumb?: string | null };
type ApiDrinkDetail = {
  idDrink: string;
  strDrink: string;
  strDrinkThumb?: string | null;
  strVideo?: string | null;
  strInstructions?: string | null;
  strInstructionsES?: string | null;
  strInstructionsDE?: string | null;
  strInstructionsIT?: string | null;
  strGlass?: string | null;
  strIBA?: string | null;
  strTags?: string | null;
  strCategory?: string | null;
  strAlcoholic?: string | null;
  strSource?: string | null;
  [k: string]: any; // para acessar strIngredient1..15 e strMeasure1..15
};

// -------------------- Acesso à TheCocktailDB (free) --------------------
const API = 'https://www.thecocktaildb.com/api/json/v1/1';

// Busca por nome (1 termo)
async function searchByName(name: string): Promise<ApiDrinkDetail[]> {
  const url = `${API}/search.php?s=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  const json = await res.json();
  return (json?.drinks || []) as ApiDrinkDetail[];
}

// Busca por ingrediente (retorna só id/nome/thumb) — faremos AND manualmente
async function filterByIngredient(ingredient: string): Promise<ApiSearchItem[]> {
  const url = `${API}/filter.php?i=${encodeURIComponent(ingredient)}`;
  const res = await fetch(url);
  const json = await res.json();
  return (json?.drinks || []) as ApiSearchItem[];
}

async function lookupById(id: string): Promise<ApiDrinkDetail | null> {
  const url = `${API}/lookup.php?i=${encodeURIComponent(id)}`;
  const res = await fetch(url);
  const json = await res.json();
  const drink = (json?.drinks || [])[0];
  return drink || null;
}

// AND de múltiplos ingredientes: interseção por idDrink
async function searchByIngredientsAND(ings: string[]): Promise<ApiDrinkDetail[]> {
  if (!ings.length) return [];
  // 1) busca cada ingrediente
  const lists = await Promise.all(ings.map(filterByIngredient));
  if (lists.some(l => !l || l.length === 0)) return []; // se algum termo não retorna nada, resultado vazio
  // 2) interseção
  const sets = lists.map(l => new Set(l.map(x => x.idDrink)));
  const inter = Array.from(sets[0]).filter(id => sets.every(s => s.has(id)));
  // 3) busca os detalhes dos primeiros N (limite para evitar muitas requisições)
  const MAX = 24;
  const detail = await Promise.all(
    inter.slice(0, MAX).map(id => lookupById(id))
  );
  return detail.filter(Boolean) as ApiDrinkDetail[];
}

// -------------------- Componente principal --------------------
export default function DiscoverPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<ApiDrinkDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApiDrinkDetail | null>(null);

  const hint = useMemo(() => {
    return 'Busque por nome ou ingredientes (use vírgulas para combinar com E). Ex.: "negroni" ou "gin, campari, vermute"';
  }, []);

  async function runSearch() {
    const query = q.trim();
    if (!query) { setResults([]); setSelected(null); return; }
    setError(null);
    setBusy(true);
    try {
      // termos separados por vírgula → ingredientes (AND)
      const parts = query.split(',').map(s => s.trim()).filter(Boolean);
      let out: ApiDrinkDetail[] = [];
      if (parts.length > 1) {
        out = await searchByIngredientsAND(parts);
      } else {
        out = await searchByName(query);
      }
      setResults(out || []);
      setSelected(null);
    } catch (e: any) {
      console.error(e);
      setError('Falha ao buscar na web. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  async function importDrink(drink: ApiDrinkDetail) {
    try {
      const id = uuid();
      const now = Date.now();
      const codigo = genCodigo();

      // montar lista de ingredientes a partir de strIngredient1..15 + strMeasure1..15
      const ingredientsRows: { quantidade_raw: string; unidade_label: string; produto_raw: string; }[] = [];
      for (let i = 1; i <= 15; i++) {
        const ing = (drink as any)[`strIngredient${i}`] as string | null;
        const meas = (drink as any)[`strMeasure${i}`] as string | null;
        if (!ing || !ing.trim()) continue;
        const { quantidade_raw, unidade_label } = parseMeasure(meas || '');
        ingredientsRows.push({
          quantidade_raw,
          unidade_label,
          produto_raw: ing.trim()
        });
      }

      // índice para busca local (frase + tokens por ingrediente)
      const ingredientes_norm_set = Array.from(new Set(
        ingredientsRows.flatMap(i => productTerms(i.produto_raw))
      ));

      // campos principais
      const nome = drink.strDrink?.trim() || 'Coquetel sem título';
      const imagem_url = drink.strDrinkThumb || undefined;
      const video_url = drink.strVideo || undefined;
      const url = (drink.strSource || undefined); // fonte se existir
      const modo_preparo =
        drink.strInstructionsES ||
        drink.strInstructionsIT ||
        drink.strInstructionsDE ||
        drink.strInstructions ||
        undefined;
      const apresentacao = drink.strGlass ? `Copo sugerido: ${drink.strGlass}` : undefined;
      const comentarios = [drink.strCategory, drink.strAlcoholic, drink.strIBA, drink.strTags]
        .filter(Boolean)
        .join(' • ') || undefined;

      // persistir
      await db.transaction('rw', db.recipes, db.recipe_ingredients, async () => {
        await db.recipes.add({
          id, codigo, nome, url, imagem_url, video_url,
          modo_preparo, apresentacao, comentarios,
          ingredientes_norm_set, created_at: now, updated_at: now
        });
        for (const row of ingredientsRows) {
          await db.recipe_ingredients.add({
            id: uuid(),
            recipe_id: id,
            quantidade_raw: row.quantidade_raw,
            quantidade_num: parseQuantidade(row.quantidade_raw),
            unidade_padrao: (row.unidade_label || '').toLowerCase() as any,
            unidade_label: row.unidade_label,
            produto_raw: row.produto_raw,
            produto_norm: row.produto_raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ')
          });
        }
      });

      alert('Receita importada para sua base!');
      router.push(`/recipe/${id}`);
    } catch (e) {
      console.error(e);
      alert('Falha ao importar esta receita.');
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          onKeyDown={e=>{ if (e.key === 'Enter') runSearch(); }}
          placeholder={hint}
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={runSearch} className="px-3 py-2 border rounded bg-white hover:bg-slate-50">
          Buscar
        </button>
      </div>

      {busy && <div className="text-sm">Buscando na web…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Resultados */}
      <div className="grid md:grid-cols-2 gap-4">
        {results.map((r) => (
          <div key={r.idDrink} className="bg-white border rounded-xl p-3 hover:shadow">
            <div className="flex items-start gap-3">
              {r.strDrinkThumb && (
                <img src={r.strDrinkThumb} alt={r.strDrink} className="w-24 h-24 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{r.strDrink}</div>
                <div className="text-xs text-slate-600">
                  {[r.strCategory, r.strAlcoholic, r.strIBA].filter(Boolean).join(' • ')}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={async ()=>{
                      const det = await lookupById(r.idDrink);
                      if (det) setSelected(det);
                    }}
                    className="text-sm px-2 py-1 border rounded"
                  >
                    Ver detalhes
                  </button>
                  <button
                    onClick={async ()=>{
                      const det = await lookupById(r.idDrink);
                      if (det) await importDrink(det);
                    }}
                    className="text-sm px-2 py-1 border rounded"
                  >
                    Incluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Painel de detalhes (selecionado) */}
      {selected && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold">{selected.strDrink}</div>
              <div className="text-xs text-slate-600">
                {[selected.strCategory, selected.strAlcoholic, selected.strIBA].filter(Boolean).join(' • ')}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={()=>importDrink(selected)}
                className="px-3 py-2 border rounded bg-white hover:bg-slate-50"
              >
                Incluir na minha base
              </button>
              <button
                onClick={()=>setSelected(null)}
                className="px-3 py-2 border rounded bg-white hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>

          {selected.strVideo ? (
            <VideoPlayer url={selected.strVideo} />
          ) : selected.strDrinkThumb ? (
            <img src={selected.strDrinkThumb} alt={selected.strDrink} className="max-h-80 w-full rounded-xl object-cover" />
          ) : null}

          {selected.strSource && (
            <div className="text-sm">
              Fonte: <a href={selected.strSource} target="_blank" className="text-blue-600 underline">{selected.strSource}</a>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold mb-2">Ingredientes</div>
              <ul className="list-disc pl-5 text-sm">
                {Array.from({length:15}, (_,i)=>i+1).map(i=>{
                  const ing = (selected as any)[`strIngredient${i}`];
                  const meas = (selected as any)[`strMeasure${i}`];
                  if (!ing) return null;
                  return <li key={i}>{[meas, ing].filter(Boolean).join(' ')}</li>;
                })}
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Modo de preparo</div>
              <div className="whitespace-pre-wrap text-sm">
                {selected.strInstructionsES || selected.strInstructionsIT || selected.strInstructionsDE || selected.strInstructions || '—'}
              </div>
              {selected.strGlass && (
                <div className="text-sm mt-2"><b>Copo sugerido:</b> {selected.strGlass}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {(!busy && !results.length && q.trim()) && (
        <div className="text-sm text-slate-600">Nenhum resultado encontrado na web para sua busca.</div>
      )}
    </div>
  );
}
