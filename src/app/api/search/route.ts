// src/app/api/search/route.ts
// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

/**
 * Rota de busca (nome/ingrediente) com paginação.
 * Mantém compatibilidade do helper jsonOK/jsonError aceitando número (ex.: 200)
 * ou o objeto ResponseInit (ex.: { status: 200 }).
 */

export const revalidate = 0;
export const dynamic = "force-dynamic";

// Mantido o shape usado no projeto
type Item = {
  id: string;
  name: string | null;
  title: string | null;
  url: string | null;
  image_url: string | null;
  video_url: string | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

// Helpers corrigidos (aceitam number | ResponseInit)
function jsonOK(body: unknown, init?: number | ResponseInit) {
  const resInit: ResponseInit | undefined =
    typeof init === "number" ? { status: init } : init;
  return NextResponse.json(body, resInit);
}

function jsonError(body: unknown, init?: number | ResponseInit) {
  const resInit: ResponseInit | undefined =
    typeof init === "number" ? { status: init } : init;
  return NextResponse.json(body, resInit);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const ingredient = (url.searchParams.get("ingredient") || "").trim();

    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const pageSize = Math.max(
      1,
      Math.min(50, Number(url.searchParams.get("pageSize") || 10)),
    );

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await supabaseServer();

    // Base da query com count para paginação
    let query = supabase
      .from("recipes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Filtros (usamos .or para buscar em vários campos com q)
    if (q) {
      // Busca por nome/título/ingredientes_text (ajuste aqui se os nomes forem outros)
      const like = `%${q}%`;
      query = query.or(
        [
          `name.ilike.${like}`,
          `title.ilike.${like}`,
          `ingredients_text.ilike.${like}`,
        ].join(","),
      );
    }

    if (ingredient) {
      const likeIng = `%${ingredient}%`;
      // Mantém a combinação do filtro existente com AND
      query = query.ilike("ingredients_text", likeIng);
    }

    const { data, error, count } = await query;

    if (error) {
      return jsonError({ ok: false, error: error.message }, 500);
    }

    const items: Item[] = (data ?? []) as Item[];

    return jsonOK(
      {
        ok: true,
        items,
        page,
        pageSize,
        total: count ?? 0,
      },
      200,
    );
  } catch (err: any) {
    return jsonError({ ok: false, error: String(err?.message || err) }, 500);
  }
}
