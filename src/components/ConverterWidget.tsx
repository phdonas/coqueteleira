'use client';
import { useState } from 'react';
import { parseQuantidade, toMl } from '@/lib/normalize';

const UNIDADES = ['ml','tsp','tbsp','oz','cl','barspoon','dash','gota','unidade','g'];

export default function ConverterWidget() {
  const [valor, setValor] = useState('1');
  const [unidade, setUnidade] = useState('oz');
  const num = parseQuantidade(valor);
  const ml = num !== undefined ? toMl(num, unidade) : undefined;

  return (
    <div className="p-4 rounded-xl border bg-slate-50">
      <div className="font-semibold mb-2">Conversor para ml</div>
      <div className="flex gap-2">
        <input
          value={valor}
          onChange={e=>setValor(e.target.value)}
          className="w-24 border rounded px-2 py-1"
          placeholder="ex: 1/2"
        />
        <select value={unidade} onChange={e=>setUnidade(e.target.value)} className="border rounded px-2 py-1">
          {UNIDADES.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
      <div className="text-sm mt-2">
        {ml !== undefined ? <span>= <b>{ml.toFixed(1)} ml</b></span> : <i>—</i>}
      </div>
    </div>
  );
}
