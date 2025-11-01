// src/components/FavoriteButton.tsx
// src/components/FavoriteButton.tsx
"use client";

import { useState, useTransition } from "react";

type Props = {
  recipeId: string;
  initialIsFavorite?: boolean;
  onChange?: (isFav: boolean) => void;
  className?: string;
  /** Tooltip opcional vindo do chamador (ex.: RecipeClient) */
  title?: string;
};

export default function FavoriteButton({
  recipeId,
  initialIsFavorite = false,
  onChange,
  className,
  title: explicitTitle,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isFav, setFav] = useState<boolean>(initialIsFavorite);

  async function toggle() {
    startTransition(async () => {
      try {
        const method = isFav ? "DELETE" : "POST";
        const res = await fetch("/api/favorites", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        });
        if (res.ok) {
          setFav((v) => {
            const nv = !v;
            onChange?.(nv);
            return nv;
          });
        }
      } catch (e) {
        console.error("favorite toggle failed", e);
      }
    });
  }

  // se o chamador passou `title`, usamos; senão, definimos um padrão por estado
  const computedTitle =
    explicitTitle ?? (isFav ? "Remover dos favoritos" : "Adicionar aos favoritos");

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={className}
      aria-pressed={isFav}
      title={computedTitle}
    >
      {isFav ? "★" : "☆"}
    </button>
  );
}
