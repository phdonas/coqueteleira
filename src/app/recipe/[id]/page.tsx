// src/app/recipe/[id]/page.tsx
// src/app/recipe/[id]/page.tsx
// (Hotfix: tipagem Next 15 para params como Promise e leitura de headers com await)

import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import RecipePageClient from "@/components/RecipePageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // headers pode ser Promise em algumas versões → usar await
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) {
    // fallback seguro
    redirect("/");
  }
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  // busca a receita via API interna com URL absoluta (encaminha cookies p/ auth)
  const { id } = await params;
  const res = await fetch(`${base}/api/recipes/${id}`, {
    cache: "no-store",
    headers: {
      cookie: h.get("cookie") ?? "",
    },
  });

  if (!res.ok) {
    notFound();
  }

  const json = await res.json();
  if (!json?.ok || !json?.item) {
    notFound();
  }

  return <RecipePageClient item={json.item} />;
}
