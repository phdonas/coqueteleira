'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { uuid, genCodigo } from '@/lib/id';
import { parseQuantidade, productTerms } from '@/lib/normalize';
import IngredientTable from '@/components/IngredientTable';
import ConverterWidget from '@/components/ConverterWidget';

type Row = { quantidade_raw: string; unidade_label: string; produto_raw: string; };

export default function NewRecipePage() {
  const router = useRouter();

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [codigo] = useState(genCodigo());
  const [url, setUrl] = useState('');
  const [imagem, setImagem] = useState('');
  const [video, setVideo] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [modo, setModo] = useState('');
  const [apresentacao, setApresentacao] = useState('');

  // Ingredientes (tabela inline)
  const [ings, setIngs] = useState<Row[]>([
    { quantidade_raw: '', unidade_label: 'ml', produto_raw: '' },
  ]);

  async function salvar() {
    // validações simples
    if (!nome.trim()) { alert('Informe o nome da receita'); return; }
    if (!ings.some(i => i.produto_raw.trim())) { alert('Inclua ao menos 1 ingrediente'); return; }

    const id = uuid();
    const now = Date.now();

    // Índice para busca por ingredientes (frase + tokens)
    const ingredientes_norm_set = Array.from(new Set(
      ings.flatMap(i => productTerms(i.produto_raw))
    ));

    // transação Dexie: cria receita + ingredientes
    await db.transaction('rw', db.recipes, db.recipe_ingredients, async () => {
      await db.recipes.add({
        id,
        codigo,
        nome,
        url,
        imagem_url: imagem,
        video_url: video,
        modo_preparo: modo,
        apresentacao,
        comentarios,
        ingredientes_norm_set,
        created_at: now,
        updated_at: now
      });

      for (const i of ings) {
        await db.recipe_ingredients.add({
          id: uuid(),
          recipe_id: id,
          quantidade_raw: i.quantidade_raw,
          quantidade_num: parseQuantidade(i.quantidade_raw),
          unidade_padrao: (i.unidade_label || '').toLowerCase() as any,
          unidade_label: i.unidade_label,
          produto_raw: i.produto_raw,
          produto_norm: (i.produto_raw || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ')
        });
      }
    });

    alert('Receita salva!');
    router.push(`/recipe/${id}`);
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Formulário principal */}
      <div className="space-y-4">
        {/* Cabeçalho */}
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <div className="font-semibold text-lg">Nova Receita</div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Nome da receita</label>
              <input
                value={nome}
                onChange={e=>setNome(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Código (auto)</label>
              <input
                value={codigo}
                readOnly
                className="w-full border rounded px-3 py-2 bg-slate-50"
              />
            </div>
            <div>
              <label className="text-sm">URL da receita</label>
              <input
                value={url}
                onChange={e=>setUrl(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Imagem (URL)</label>
              <input
                value={imagem}
                onChange={e=>setImagem(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Vídeo (URL)</label>
              <input
                value={video}
                onChange={e=>setVideo(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm">Comentários</label>
              <input
                value={comentarios}
                onChange={e=>setComentarios(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Tabela de Ingredientes */}
        <IngredientTable value={ings} onChange={setIngs} />

        {/* Modo de preparo */}
        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold mb-2">Modo de preparo</div>
          <textarea
            value={modo}
            onChange={e=>setModo(e.target.value)}
            className="w-full border rounded px-3 py-2 min-h-[120px]"
          />
        </div>

        {/* Apresentação sugerida */}
        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold mb-2">Apresentação sugerida</div>
          <textarea
            value={apresentacao}
            onChange={e=>setApresentacao(e.target.value)}
            className="w-full border rounded px-3 py-2 min-h-[100px]"
          />
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <button onClick={salvar} className="px-4 py-2 border rounded bg-white hover:bg-slate-50">
            Salvar
          </button>
          <a href="/" className="px-4 py-2 border rounded bg-white hover:bg-slate-50">
            Cancelar
          </a>
        </div>
      </div>

      {/* Lateral */}
      <div className="space-y-4">
        <ConverterWidget />
      </div>
    </div>
  );
}
