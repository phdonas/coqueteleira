// src/app/edit/[id]/page.tsx
// (Hotfix: remover página legada que importava '@/lib/db' e só redirecionar para a rota nova)

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LegacyEditRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/recipe/${id}/edit`);
}
