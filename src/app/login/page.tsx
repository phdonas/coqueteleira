// src/app/login/page.tsx
// src/app/login/page.tsx
// (Item 10 â€” Auth: ajusta o redirect do Magic Link para /auth/callback)

"use client";
import { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supa = supabaseClient();

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supa.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      alert(err.message || "Erro ao enviar link.");
    } finally {
      setLoading(false);
    }
  }

  async function signGoogle() {
    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supa.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      alert(err.message || "Erro no login Google.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Entrar</h1>

      <form onSubmit={sendMagicLink} className="space-y-3">
        <div>
          <label className="text-sm text-neutral-200 mb-1 block">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-neutral-800 px-3 py-2 text-white ring-2 ring-neutral-600 focus:ring-2 focus:ring-emerald-500"
            placeholder="voce@email.com"
          />
        </div>
        <button
          disabled={loading}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Enviandoâ€¦" : "Enviar Magic Link"}
        </button>
      </form>

      <div className="my-6 h-px bg-white/10" />

      <button
        onClick={signGoogle}
        disabled={loading}
        className="rounded-md bg-sky-600 px-4 py-2 text-white disabled:opacity-60"
      >
        Entrar com Google
      </button>

      {sent && (
        <p className="mt-4 text-sm text-emerald-400">
          Link enviado. Verifique seu e-mail e volte para cÃ¡ apÃ³s clicar.
        </p>
      )}
    </div>
  );
}

