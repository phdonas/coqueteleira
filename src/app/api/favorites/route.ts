// src/app/api/favorites/route.ts
/// src/app/api/favorites/route.ts
// Ajuste: aguardar supabaseServer
import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("favorites").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data ?? [] });
}
