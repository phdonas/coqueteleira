// src/components/VideoPlayer.tsx
// (Passo 1 â€” Incremental: Lite YouTube Embed + MP4 + fallback <iframe> com alto contraste)

"use client";
import { useMemo, useState } from "react";

/**
 * Extrai o ID de um vÃ­deo do YouTube a partir de diferentes formatos de URL.
 */
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return id;
      // /embed/<id> ou /shorts/<id>
      const segs = u.pathname.split("/").filter(Boolean);
      if (segs[0] === "embed" || segs[0] === "shorts") return segs[1] ?? null;
    }
  } catch {
    /* noop */
  }
  return null;
}

/**
 * Retorna a thumbnail do YouTube para usar como poster do â€œliteâ€.
 */
function youTubePoster(id: string): string {
  // Alta resoluÃ§Ã£o quando disponÃ­vel; fallback padrÃ£o.
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export default function VideoPlayer({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);

  const kind = useMemo<"youtube" | "mp4" | "other">(() => {
    const lower = url.toLowerCase();
    if (getYouTubeId(url)) return "youtube";
    if (lower.endsWith(".mp4") || lower.includes(".mp4?")) return "mp4";
    return "other";
  }, [url]);

  // YouTube â€” â€œliteâ€ (carrega iframe sÃ³ ao clicar)
  if (kind === "youtube") {
    const vid = getYouTubeId(url)!;
    const poster = youTubePoster(vid);
    const embed = `https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1`;

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
        {!loaded && (
          <button
            aria-label="Reproduzir vÃ­deo"
            className="group absolute inset-0 flex w-full items-center justify-center"
            onClick={() => setLoaded(true)}
          >
            {/* Poster */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt="PrÃ©via do vÃ­deo"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
            {/* BotÃ£o play */}
            <span className="relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-lg ring-1 ring-black/10 transition group-hover:scale-110">
              â–¶
            </span>
          </button>
        )}
        {loaded && (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embed}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="YouTube Video"
          />
        )}
      </div>
    );
  }

  // MP4 direto
  if (kind === "mp4") {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
        <video className="h-full w-full" src={url} controls playsInline />
      </div>
    );
  }

  // Fallback genÃ©rico (iframe) â€” para outras plataformas que suportem embed por URL direto
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={url}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title="VÃ­deo"
      />
    </div>
  );
}

