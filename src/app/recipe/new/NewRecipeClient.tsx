// src/app/recipe/new/NewRecipeClient.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';

/**
 * Todo o cÃ³digo que depende de hooks de navegaÃ§Ã£o do cliente
 * (useSearchParams, useRouter etc.) fica aqui.
 * Se vocÃª jÃ¡ tinha um componente de formulÃ¡rio, coloque-o aqui dentro
 * ou importe-o e passe as props necessÃ¡rias.
 */
export default function NewRecipeClient() {
  const sp = useSearchParams();

  // Exemplo: se vocÃª usava search params para prÃ©-preencher campos
  const presetName = useMemo(() => sp.get('name') ?? '', [sp]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/"
          className="px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-800"
        >
          Voltar
        </Link>
        <h1 className="text-2xl font-semibold">Nova receita</h1>
      </div>

      {/* Coloque aqui o seu formulÃ¡rio real. O campo abaixo Ã© sÃ³ um placeholder
         para mostrar como usar o valor vindo de search params. */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nome*</label>
          <input
            type="text"
            defaultValue={presetName}
            className="w-full rounded-lg bg-neutral-900 text-white placeholder:text-neutral-500 ring-1 ring-neutral-700 focus:outline-none focus:ring-2 focus:ring-sky-500 px-3 py-2"
            placeholder="Ex.: Negroni"
          />
        </div>

        {/* â€¦ restante do seu formulÃ¡rio existente (URL de origem, imagem, vÃ­deo,
            ingredientes, modo de preparo, apresentaÃ§Ã£o etc.) */}
      </form>
    </main>
  );
}

