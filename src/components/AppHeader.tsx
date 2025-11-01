"use client";
import React from "react";
import UserMenu from "@/components/UserMenu";

export default function AppHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#1b1b1f]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <div className="text-zinc-100 font-semibold text-sm leading-tight">
            <div className="text-[10px] uppercase tracking-wide text-[#C0742E]">CoquetÃ©is do Paulo</div>
            <div className="text-zinc-200 text-base font-semibold">Biblioteca Pessoal</div>
          </div>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}


