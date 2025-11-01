// src/components/BackLink.tsx
// (UX Global â€” BotÃ£o Voltar preservando busca `?q=` quando existir)

"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function BackLink({ fallback = "/" }: { fallback?: string }) {
  const sp = useSearchParams();
  const router = useRouter();

  const q = sp.get("q");
  const href = q ? `${fallback}?q=${encodeURIComponent(q)}` : fallback;

  return (
    <div className="mb-4">
      {/* Preferimos histÃ³rico; se nÃ£o houver, tem href com ?q= como seguranÃ§a */}
      <button
        onClick={() => router.back()}
        className="mr-2 inline-flex items-center gap-2 rounded-md bg-neutral-800 px-3 py-1.5 text-sm text-white ring-1 ring-white/15 hover:bg-neutral-700"
      >
        â† Voltar
      </button>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-md bg-neutral-800 px-3 py-1.5 text-sm text-white ring-1 ring-white/15 hover:bg-neutral-700"
      >
        InÃ­cio
      </Link>
    </div>
  );
}

