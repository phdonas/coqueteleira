"use client";

import React from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
};

export default function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1b1b1f] transition-colors";

  const sizes = {
    md: "h-11 px-4 text-base",
    sm: "h-9 px-3 text-sm",
  }[size];

  // Paleta:
  // - Âmbar quente p/ botões primários (#C0742E)
  // - Grafite escuro p/ base do app (#1b1b1f / #1f1f24)
  // - Bordas brancas em 10% de opacidade p/ contornos
  const variants = {
    primary:
      "bg-[#C0742E] text-black hover:bg-[#d88033] focus:ring-[#C0742E]",
    secondary:
      "bg-transparent text-zinc-200 border border-white/15 hover:bg-white/5 focus:ring-zinc-400",
    ghost:
      "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5 focus:ring-zinc-500",
  }[variant];

  return (
    <button
      className={cx(base, sizes, variants, className)}
      {...props}
    />
  );
}
