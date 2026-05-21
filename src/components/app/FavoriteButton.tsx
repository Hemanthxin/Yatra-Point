"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/lib/actions/favorites";

interface FavoriteButtonProps {
  destinationId: string;
  initialFavored: boolean;
  size?: "sm" | "md";
}

export function FavoriteButton({
  destinationId,
  initialFavored,
  size = "sm",
}: FavoriteButtonProps) {
  const [favored, setFavored] = useState(initialFavored);
  const [isPending, startTransition] = useTransition();

  const dim = size === "md" ? "h-10 w-10" : "h-8 w-8";
  const icon = size === "md" ? "h-5 w-5" : "h-4 w-4";

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Optimistic toggle for snappier UX; reconcile from server result.
    const next = !favored;
    setFavored(next);
    startTransition(async () => {
      const res = await toggleFavorite(destinationId);
      if (!res.ok) setFavored(!next);
      else setFavored(res.favored);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-label={favored ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favored}
      className={`grid ${dim} place-items-center rounded-full border border-slate-200 bg-white transition hover:border-rose-200 hover:bg-rose-50 disabled:opacity-60`}
    >
      <Heart
        className={`${icon} transition ${
          favored
            ? "fill-rose-500 stroke-rose-500"
            : "stroke-slate-400 group-hover:stroke-rose-400"
        }`}
      />
    </button>
  );
}
