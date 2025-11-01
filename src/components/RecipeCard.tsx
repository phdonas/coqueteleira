// src/components/RecipeCard.tsx
// src/components/RecipeCard.tsx
// (Passo 4.B â€” Card com melhor contraste e indicador visual de vÃ­deo; preserva ?q na navegaÃ§Ã£o)

"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  id: string;
  nome: string;
  apresentacao?: string | null;
  imagem_url?: string | null;
  video_url?: string | null;
};

export default function RecipeCard({ id, nome, apresentacao, imagem_url, video_url }: Props) {
  const sp = useSearchParams();
  const q = sp.get("q");
  const href = q ? `/recipe/${id}?q=${encodeURIComponent(q)}` : `/recipe/${id}`;

  return (
    <Link
      href={href}
      className="group flex items-stretch gap-3 rounded-xl bg-neutral-900/95 p-3 ring-1 ring-neutral-800 hover:ring-neutral-600"
    >
      <div className="relative flex h-20 w-24 items-center justify-center overflow-hidden rounded-md bg-neutral-800 ring-1 ring-neutral-700">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {imagem_url ? (
          <img src={imagem_url} alt={nome} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-neutral-400">sem foto</span>
        )}
        {video_url ? (
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white ring-1 ring-white/20">
            â–¶ vÃ­deo
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-white">{nome ?? "Sem tÃ­tulo"}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-300">{apresentacao ?? "â€”"}</p>
      </div>
    </Link>
  );
}

