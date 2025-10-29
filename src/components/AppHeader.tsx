"use client";

import React from "react";

export default function AppHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#1b1b1f]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <div className="text-zinc-100 font-semibold text-sm leading-tight">
            <div className="text-[10px] uppercase tracking-wide text-[#C0742E]">
              Coquetéis do Paulo
            </div>
            <div className="text-zinc-200 text-base font-semibold">
              Biblioteca Pessoal
            </div>
          </div>

          <div className="flex items-center">
            <div className="rounded-xl border border-[#C0742E]/40 bg-[#C0742E]/10 text-[#C0742E] text-[10px] font-bold px-2 py-1 leading-none">
              PHD
            </div>
          </div>
        </div>

        <div className="hidden sm:block text-[10px] text-zinc-500">
          Versão 1.0 MVP
        </div>
      </div>
    </header>
  );
}
