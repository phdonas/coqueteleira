// src/components/SearchBar.tsx
// src/components/SearchBar.tsx
// Barra de busca com debounce + sincronização de URL (?q=)

"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  placeholder?: string;
  className?: string;
  /** valor inicial vindo do server (ex.: searchParams.get("q")) */
  initialQuery?: string;
  /** notifica pai (opcional) */
  onChange?: (q: string) => void;
  /** tempo de debounce em ms */
  debounceMs?: number;
};

export default function SearchBar({
  placeholder = 'Buscar: "negroni" ou "gin, campari, vermute"',
  className,
  initialQuery,
  onChange,
  debounceMs = 400,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [value, setValue] = useState<string>(() => initialQuery ?? (sp.get("q") ?? ""));

  // debounce simples
  const debounced = useMemo(() => {
    let t: any;
    return (v: string) => {
      clearTimeout(t);
      t = setTimeout(() => {
        onChange?.(v);
        // sincroniza URL preservando outros params
        const params = new URLSearchParams(sp.toString());
        if (v) params.set("q", v);
        else params.delete("q");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }, debounceMs);
    };
  }, [debounceMs, onChange, pathname, router, sp]);

  useEffect(() => {
    debounced(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    // se o usuário navegar (voltar/avançar), atualiza input
    const q = sp.get("q") ?? "";
    setValue(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  return (
    <input
      type="search"
      className={className ?? "w-full rounded border border-neutral-300 px-3 py-2 outline-none"}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      aria-label="Buscar receitas"
      inputMode="search"
      autoComplete="off"
    />
  );
}
