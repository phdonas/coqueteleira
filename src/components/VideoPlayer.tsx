// src/components/VideoPlayer.tsx
// src/components/VideoPlayer.tsx
// Player leve com lazy-iframe (YouTube/Vimeo). Retorna null se url ausente/ inválida.

"use client";

import { useMemo } from "react";

type Props = {
  url?: string | null;
  className?: string;
  title?: string;
  aspect?: "16:9" | "4:3" | "1:1";
};

function toEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).at(-1);
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    // link direto de embed
    if (/\/embed\//.test(u.pathname)) return url;
    return null;
  } catch {
    return null;
  }
}

export default function VideoPlayer({ url, className, title = "Vídeo da receita", aspect = "16:9" }: Props) {
  const src = useMemo(() => (url ? toEmbed(url) : null), [url]);
  if (!src) return null;

  const pad =
    aspect === "4:3" ? "pt-[75%]" :
    aspect === "1:1" ? "pt-[100%]" :
    "pt-[56.25%]"; // 16:9

  return (
    <div className={className}>
      <div className={`relative w-full ${pad}`}>
        <iframe
          loading="lazy"
          src={src}
          title={title}
          className="absolute left-0 top-0 h-full w-full rounded"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
