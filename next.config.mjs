import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

export default withPWA({
  dest: 'public',
  disable: !isProd, // SW só em produção
})({
  reactStrictMode: true,
  images: { domains: ['i.ytimg.com'] }, // se usar thumbs do YouTube
});
