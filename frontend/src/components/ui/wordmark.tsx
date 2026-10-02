import type {} from "react";

import { cn } from "@/lib/cn";

export function Wordmark({
  inverted = false,
  compact = false,
}: {
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <span className="min-w-0">
      <span
        className={cn(
          "block font-display text-xl leading-none font-bold tracking-tight",
          !inverted && "gradient-text",
          inverted && "text-white",
        )}
      >
        MINEVA
      </span>
      <span
        className={cn(
          "mt-1 block text-[11px] leading-snug text-pretty font-medium",
          inverted ? "text-white/60" : "text-secondary",
          compact && "hidden sm:block",
        )}
      >
        Minería · Inferencia · Evaluación · Visualización Aplicada
      </span>
    </span>
  );
}
