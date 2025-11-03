// src/app/api/search/route.ts
// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

type Item = {
  id: string;
  name: string | null;
  url: string | null;
  image_url: string | null;
  video_url: string | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  ingredients_text: string | null;
  steps_text: string | null;
};

function jsonOK(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

// GET /api/search?q=...&ingredient=...&page=1&pageSize=20
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const ingredient = (url.searchParams.get("ingredient") || "").trim();
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") || 10)));

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await supabaseServer();

    // Seleção padronizada + compat para dados antigos (title/instructions/ingredientsText)
    let query = supabase
      .from("recipes")
      .select(
        `
        id,
        name,
        url,
        image_url,
        video_url,
        is_public,
        created_at,
        updated_at,
        ingredients_text,
        steps_text
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    // Filtros (q por nome; ingredient por texto de ingredientes)
    if (q) {
      // Nome final é 'name' (antes alguns lugares usavam 'title')
      query = query.ilike("name", `%${q}%`);
    }
    if (ingredient) {
      query = query.ilike("ingredients_text", `%${ingredient}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return jsonOK({ ok: false, error: error.message }, { status: 500 });
    }

    return jsonOK({
      ok: true,
      items: (data || []) as Item[],
      page,
      pageSize,
      total: count ?? 0,
      cols: {
        name: "name",
        ingredients: "ingredients_text",
      },
    });
  } catch (e: any) {
    return jsonOK({ ok: false, error: e?.message || "Erro interno" }, { status: 500 });
  }
}
