"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  PlusCircle,
  Globe2,
  CloudUpload,
} from "lucide-react";
import React from "react";

function NavButton({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "flex flex-col items-center justify-center flex-1 text-[10px] leading-tight " +
        (active
          ? "text-[#C0742E]"
          : "text-zinc-400 hover:text-zinc-200")
      }
    >
      <div className="h-6 flex items-center justify-center">
        {icon}
      </div>
      <div className="mt-0.5">{label}</div>
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  // AtivaÃ§Ã£o simples por prefixo
  const isActive = (p: string) =>
    pathname === p || pathname.startsWith(p + "/");

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-[#1f1f24]/90 backdrop-blur border-t border-white/10 h-16 flex px-2">
      <NavButton
        href="/"
        label="Receitas"
        icon={<BookOpen size={20} strokeWidth={1.5} />}
        active={isActive("/")}
      />
      <NavButton
        href="/new"
        label="Novo"
        icon={<PlusCircle size={20} strokeWidth={1.5} />}
        active={isActive("/new")}
      />
      <NavButton
        href="/discover"
        label="Descobrir"
        icon={<Globe2 size={20} strokeWidth={1.5} />}
        active={isActive("/discover")}
      />
      <NavButton
        href="/settings"
        label="Backup"
        icon={<CloudUpload size={20} strokeWidth={1.5} />}
        active={isActive("/settings")}
      />
    </nav>
  );
}

