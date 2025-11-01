// next.config.mjs
// next.config.mjs
// (Item 9 — Imagens remotas: garante domínios padrão usados pelo app)

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.thecocktaildb.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;


