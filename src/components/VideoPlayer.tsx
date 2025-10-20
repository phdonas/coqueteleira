'use client';

export default function VideoPlayer({ url }: { url?: string }) {
  if (!url) return null;
  const isYouTube = /youtu\.?be/.test(url);
  const isVimeo = /vimeo\.com/.test(url);

  if (isYouTube) {
    const match = url.match(/(?:v=|\.be\/)([^&?/]+)/);
    const id = match?.[1];
    if (!id) return null;
    return (
      <div className="aspect-video">
        <iframe
          className="w-full h-full rounded-xl"
          src={`https://www.youtube.com/embed/${id}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
          allowFullScreen
        />
      </div>
    );
  }
  if (isVimeo) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const id = match?.[1];
    if (!id) return null;
    return (
      <div className="aspect-video">
        <iframe
          className="w-full h-full rounded-xl"
          src={`https://player.vimeo.com/video/${id}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return <a href={url} target="_blank" className="text-blue-600 underline">Ver vídeo</a>;
}
