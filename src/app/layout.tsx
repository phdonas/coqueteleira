import './globals.css';

export const metadata = {
  title: 'Coqueteleira',
  description: 'Minhas receitas de coquetéis (offline)',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 text-slate-900">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            <a href="/" className="font-bold">Coqueteleira</a>
            <nav className="flex gap-3 text-sm">
              <a href="/" className="hover:underline">Lista</a>
              <a href="/new" className="hover:underline">Nova Receita</a>
              <a href="/discover" className="hover:underline">Descobrir na web</a>
              <a href="/settings" className="hover:underline">Configurações</a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
