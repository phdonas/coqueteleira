import "./globals.css";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  title: "Coquetéis do Paulo",
  description: "Biblioteca pessoal de receitas de coquetel do Paulo (PHD)",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#1b1b1f] text-zinc-100 antialiased min-h-screen flex flex-col">
        {/* Header fixo topo */}
        <AppHeader />

        {/* Conteúdo principal.
           pt-[4rem] = espaço para header fixo (h-16 = 64px ~ 4rem),
           pb-[5rem] no mobile = espaço pro bottom nav (h-16 ~ 4rem + margem),
           em telas maiores podemos aliviar.
        */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-[4rem] pb-[5rem] md:pb-12">
          {children}
        </main>

        {/* Bottom nav fixa só mobile */}
        <BottomNav />
      </body>
    </html>
  );
}

