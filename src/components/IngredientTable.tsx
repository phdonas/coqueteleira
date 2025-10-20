'use client';
import { useEffect, useRef, useState } from 'react';

type Row = { quantidade_raw: string; unidade_label: string; produto_raw: string; };

const UNIT_MAP: { regex: RegExp; label: string }[] = [
  { regex: /\bml\b/i, label: 'ml' },
  { regex: /\boz\b/i, label: 'oz' },
  { regex: /\bcl\b/i, label: 'cl' },
  { regex: /\btsp\b|\bcolher(?:es)? de ch[áa]\b/i, label: 'tsp' },
  { regex: /\btbsp\b|\bcolher(?:es)? de sopa\b/i, label: 'tbsp' },
  { regex: /\bbarspoon(?:s)?\b|\bcolher(?:es)? de bar\b/i, label: 'barspoon' },
  { regex: /\bdash(?:es)?\b/i, label: 'dash' },
  { regex: /\bgota(?:s)?\b/i, label: 'gota' },
  { regex: /\bunidade(?:s)?\b|\buni(?:d)?\b|\bunid\b/i, label: 'unidade' },
  { regex: /\bg(?:ramas?)?\b/i, label: 'g' },
];

function parseLine(l: string): Row {
  let line = l.trim().replace(/\s+/g, ' ');
  if (!line) return { quantidade_raw: '', unidade_label: '', produto_raw: '' };

  // 1) quantidade (aceita: "1/2", "2 1/4", "0,75", "1.25")
  const qtyMatch = line.match(/^(\d+(?:[.,]\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)/);
  let quantidade_raw = '';
  if (qtyMatch) {
    quantidade_raw = qtyMatch[1].trim();
    line = line.slice(qtyMatch[0].length).trim();
  }

  // 2) unidade (uma das conhecidas)
  let unidade_label = '';
  for (const u of UNIT_MAP) {
    const m = line.match(new RegExp('^\\s*(' + u.regex.source + ')', 'i'));
    if (m) {
      unidade_label = u.label;
      line = line.slice(m[0].length).trim();
      break;
    }
  }

  // O restante é produto
  const produto_raw = line.trim();

  return { quantidade_raw, unidade_label, produto_raw };
}

export default function IngredientTable({
  value, onChange
}: { value: Row[]; onChange: (rows: Row[]) => void }) {

  const [rows, setRows] = useState<Row[]>(
    value.length ? value : [{ quantidade_raw:'', unidade_label:'ml', produto_raw:'' }]
  );
  const lastRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(()=>{ setRows(value.length ? value : rows); }, [value]); // mantém controlado

  function commit(next: Row[]) { setRows(next); onChange(next); }

  function pushRow(r?: Row) {
    const next = [...rows, r ?? {quantidade_raw:'', unidade_label:'ml', produto_raw:''}];
    commit(next);
    // rola até o final
    setTimeout(()=> lastRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  }

  function insertAfter(i:number) {
    const base = { quantidade_raw:'', unidade_label:'ml', produto_raw:'' };
    const next = [...rows.slice(0, i+1), base, ...rows.slice(i+1)];
    commit(next);
  }

  function updateRow(i:number, k:keyof Row, v:string) {
    const next = rows.map((r,idx)=> idx===i ? {...r, [k]: v} : r);
    commit(next);
  }

  function removeRow(i:number) {
    const next = rows.filter((_,idx)=>idx!==i);
    commit(next);
  }

  async function pasteBulkFromClipboard() {
    const txt = await navigator.clipboard.readText().catch(()=> '');
    pasteBulk(txt);
  }

  function pasteBulk(txt:string) {
    const lines = txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    const parsed = lines.map(parseLine);
    const next = [...rows, ...parsed];
    commit(next);
    setTimeout(()=> lastRowRef.current?.scrollIntoView({ behavior:'smooth', block:'center' }), 0);
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
        <div className="font-medium">Ingredientes</div>
        <div className="flex gap-2">
          {/* Mantemos também um atalho no topo */}
          <button onClick={()=>pushRow()} className="text-sm px-2 py-1 border rounded">+ linha</button>
          <button onClick={pasteBulkFromClipboard} className="text-sm px-2 py-1 border rounded">Colar lista</button>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="text-left p-2 w-28">Quantidade</th>
            <th className="text-left p-2 w-36">Unidade</th>
            <th className="text-left p-2">Produto</th>
            <th className="p-2 w-40"></th>
          </tr>
        </thead>
        <tbody>
        {rows.map((r, i)=>(
          <tr key={i} ref={i===rows.length-1 ? lastRowRef : null} className="border-t">
            <td className="p-2">
              <input value={r.quantidade_raw} onChange={e=>updateRow(i,'quantidade_raw', e.target.value)} className="w-full border rounded px-2 py-1"/>
            </td>
            <td className="p-2">
              <input value={r.unidade_label} onChange={e=>updateRow(i,'unidade_label', e.target.value)} className="w-full border rounded px-2 py-1" placeholder='ml, oz, tsp...' />
            </td>
            <td className="p-2">
              <input value={r.produto_raw} onChange={e=>updateRow(i,'produto_raw', e.target.value)} className="w-full border rounded px-2 py-1" placeholder='Ex.: Cachaça, Limão...' />
            </td>
            <td className="p-2 text-right flex gap-2 justify-end">
              <button onClick={()=>insertAfter(i)} className="text-sm px-2 py-1 border rounded">+ inserir abaixo</button>
              <button onClick={()=>removeRow(i)} className="text-sm px-2 py-1 border rounded text-red-600">remover</button>
            </td>
          </tr>
        ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="p-2 text-center bg-slate-50">
              <button onClick={()=>pushRow()} className="text-sm px-3 py-1 border rounded">
                + adicionar linha
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="px-3 py-2 bg-slate-50 flex gap-2">
        <textarea
          placeholder="Ou cole sua lista aqui (uma linha por ingrediente) e clique em 'Adicionar da área de transferência'. Ex.:&#10;60 ml Aperol&#10;1/2 oz suco de limão&#10;2 colheres de sopa açúcar"
          className="flex-1 border rounded p-2 min-h-[70px]"
          onPaste={(e)=>{
            // permite colar direto aqui e já distribuir
            const data = e.clipboardData?.getData('text');
            if (data) {
              e.preventDefault();
              pasteBulk(data);
            }
          }}
        />
        <button onClick={pasteBulkFromClipboard} className="text-sm px-3 py-2 border rounded h-fit">
          Adicionar da área de transferência
        </button>
      </div>
    </div>
  );
}
