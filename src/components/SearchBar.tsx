// src/components/SearchBar.tsx
// (Item 5 â€” Componentes: SearchBar com debounce e dica de uso)

"use client";
import { useEffect, useMemo, useState } from "react";

type Props = {
  value?: string;
  onChange?: (q: string) => void;
  placeholder?: string;
  delayMs?: number;
};

export default function SearchBar({ value = "", onChange, placeholder, delayMs = 400 }: Props) {
  const [q, setQ] = useState(value);
  useEffect(() => setQ(value), [value]);

  const debounced = useDebounce(q, delayMs);
  useEffect(() => {
    if (onChange) onChange(debounced);
  }, [debounced, onChange]);

  return (
    <div className="w-full">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder ?? `Buscar por texto ou por ingredientes separados por vÃ­rgula`}
        className="w-full rounded-md bg-neutral-900/90 px-3 py-2 text-white outline-none ring-1 ring-neutral-700 placeholder:text-neutral-400"
      />
      <p className="mt-1 text-xs text-neutral-400">
        Dica: ingredientes por vÃ­rgula (ex.: <i>gin, campari, vermute</i>) â€” retorna receitas com todos os termos.
      </p>
    </div>
  );
}

// helper local para evitar criar um arquivo sÃ³ pra isso agora
function useDebounce<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

