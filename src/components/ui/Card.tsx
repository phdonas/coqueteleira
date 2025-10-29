"use client";

import React from "react";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "bg-[#1f1f24] border border-white/10 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] " +
        (className || "")
      }
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "p-4 border-b border-white/5 flex items-start justify-between gap-3 " +
        (className || "")
      }
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "text-base font-semibold text-zinc-100 leading-tight " +
        (className || "")
      }
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={"p-4 text-sm text-zinc-300 " + (className || "")} {...props} />
  );
}
