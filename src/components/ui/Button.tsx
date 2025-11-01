"use client";

import React from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
};

export default function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  // Aumentamos os tamanhos para uso confortÃ¡vel no celular
  const base =
    "inline-flex items-center justify-center font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1b1b1f] transition-colors";

  const sizes = {
    md: "h-12 px-5 text-base",
    sm: "h-10 px-4 text-sm",
  }[size];

  // Paleta:
  // - primary: Ã¢mbar (aÃ§Ã£o positiva principal)
  // - secondary: borda clara (opÃ§Ã£o neutra)
  // - ghost: texto discreto
  // - danger: tom avermelhado para aÃ§Ãµes destrutivas
  const variants = {
    primary:
      "bg-[#C0742E] text-black hover:bg-[#d88033] focus:ring-[#C0742E]",
    secondary:
      "bg-transparent text-zinc-200 border border-white/15 hover:bg-white/5 focus:ring-zinc-400",
    ghost:
      "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5 focus:ring-zinc-500",
    danger:
      "bg-transparent text-red-400 border border-red-500/40 hover:bg-red-500/10 hover:text-red-300 focus:ring-red-600",
  }[variant];

  return (
    <button
      className={cx(base, sizes, variants, className)}
      {...props}
    />
  );
}

