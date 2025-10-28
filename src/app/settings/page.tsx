'use client';

import { useState } from 'react';
import { db } from '@/lib/db';

// Tipo do "pacote" de backup
type BackupPayload = {
  version: 1;
  exportedAt: number;
  recipes: any[];
  ingredients: any[];
};

export default function SettingsPage() {
  const [importStatus, setImportStatus] = useState<string>('');
  const [exportStatus, setExportStatus] = useState<string>('');

  async function handleExport() {
    try {
      setExportStatus('Gerando arquivo...');
      // lê tudo do Dexie
      const recipes = await db.recipes.toArray();
      const ingredients = await db.recipe_ingredients.toArray();

      const payload: BackupPayload = {
        version: 1,
        exportedAt: Date.now(),
        recipes,
        ingredients,
      };

      // transforma em blob .json
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });

      // gera nome de arquivo com data
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `coqueteleira-backup-${stamp}.json`;

      // cria link temporário p/ download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setExportStatus('Backup exportado com sucesso!');
    } catch (err) {
      console.error(err);
      setExportStatus('Erro ao exportar backup.');
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setImportStatus('Lendo arquivo...');
      const file = e.target.files?.[0];
      if (!file) {
        setImportStatus('Nenhum arquivo selecionado.');
        return;
      }

      const text = await file.text();
      const parsed: BackupPayload = JSON.parse(text);

      if (!parsed || parsed.version !== 1) {
        setImportStatus('Arquivo inválido ou versão desconhecida.');
        return;
      }

      // Estratégia: inserir/atualizar tudo dentro de uma transação
      await db.transaction('rw', db.recipes, db.recipe_ingredients, async () => {
        // Insere/atualiza receitas
        for (const r of parsed.recipes) {
          // upsert manual:
          const exists = await db.recipes.get(r.id);
          if (exists) {
            await db.recipes.update(r.id, r);
          } else {
            await db.recipes.add(r);
          }
        }

        // Insere/atualiza ingredientes
        for (const ing of parsed.ingredients) {
          const existsIng = await db.recipe_ingredients.get(ing.id);
          if (existsIng) {
            await db.recipe_ingredients.update(ing.id, ing);
          } else {
            await db.recipe_ingredients.add(ing);
          }
        }
      });

      setImportStatus('Importação concluída! Faça um refresh (F5) para ver as receitas.');
    } catch (err) {
      console.error(err);
      setImportStatus('Erro ao importar. Verifique o arquivo.');
    } finally {
      // limpa o input pra permitir importar o mesmo arquivo de novo se quiser
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-white border rounded-xl p-4">
        <div className="font-semibold text-lg mb-3">
          Backup e Sincronização Manual
        </div>
        <p className="text-sm text-slate-700 mb-4">
          Exporte suas receitas e ingredientes para um arquivo .json e depois
          importe esse arquivo em outro dispositivo (ou aqui na versão online).
          Isso permite migrar seus dados locais sem precisar de servidor.
        </p>

        <div className="space-y-4">
          {/* EXPORTAR */}
          <div className="border rounded-lg p-4">
            <div className="font-medium mb-2">Exportar dados (.json)</div>
            <p className="text-sm text-slate-600 mb-3">
              Gera um arquivo com todas as receitas e ingredientes salvos neste
              navegador/dispositivo.
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 border rounded bg-white hover:bg-slate-50 text-sm"
            >
              Exportar agora
            </button>
            {exportStatus && (
              <div className="text-xs text-slate-600 mt-2">{exportStatus}</div>
            )}
          </div>

          {/* IMPORTAR */}
          <div className="border rounded-lg p-4">
            <div className="font-medium mb-2">Importar dados (.json)</div>
            <p className="text-sm text-slate-600 mb-3">
              Selecione um arquivo .json gerado anteriormente (backup exportado
              de outro dispositivo). Isso vai adicionar/atualizar receitas e
              ingredientes aqui.
            </p>
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="text-sm"
            />
            {importStatus && (
              <div className="text-xs text-slate-600 mt-2">{importStatus}</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <div className="font-semibold text-lg mb-3">Importante</div>
        <ul className="text-sm text-slate-700 list-disc pl-5 space-y-2">
          <li>
            Cada dispositivo (PC, celular, tablet) mantém sua própria
            biblioteca local. Sem servidor, não existe "sincronização automática".
          </li>
          <li>
            Sempre que você cadastrar novas receitas em um dispositivo e quiser
            tê-las em outro, basta exportar de um e importar no outro.
          </li>
          <li>
            O arquivo .json é seu backup. Guarde com cuidado.
          </li>
        </ul>
      </div>
    </div>
  );
}
