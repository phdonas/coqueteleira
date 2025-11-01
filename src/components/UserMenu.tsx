// src/components/UserMenu.tsx
// (Item 10 â€” Auth: menu com e-mail e sair)

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";

export default function UserMenu() {
  const supa = supabaseClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supa.auth.getUser();
        setEmail(data?.user?.email ?? null);
      } catch {
        setEmail(null);
      }
    })();
  }, []);

  async function signOut() {
    try {
      await supa.auth.signOut();
      location.reload();
    } catch (e: any) {
      alert(e.message || "Erro ao sair.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      {email ? (
        <>
          <span className="text-sm text-neutral-300 max-w-[160px] truncate">{email}</span>
          <button
            onClick={signOut}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-sm hover:bg-white/10"
          >
            Sair
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
        >
          Entrar
        </Link>
      )}
    </div>
  );
}

