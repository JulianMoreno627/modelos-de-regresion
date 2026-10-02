import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "glass-card hover:[box-shadow:var(--shadow-card-hover)] rounded-[var(--radius-lg)] p-4 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function CardLabel({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "type-label text-accent",
        "inline-flex items-center gap-2 tracking-[0.18em]",
        className,
      )}
      {...props}
    >
      <span className="inline-block size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)] motion-safe:animate-pulse" />
      {props.children}
    </h2>
  );
}
