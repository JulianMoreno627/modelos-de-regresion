"use client";

import { useId } from "react";

import { EXERCISE_LIST } from "@/features/exercises/config";
import type { ModelName } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const EXERCISE_GRence: Record<ModelName, string> = {
  dollar:
    "from-violet-600 via-fuchsia-500 to-pink-500",
  glucose:
    "from-emerald-500 via-teal-400 to-cyan-400",
  energy:
    "from-amber-400 via-orange-500 to-rose-500",
};

export function ExercisePicker({
  value,
  onChange,
}: {
  value: ModelName;
  onChange: (exercise: ModelName) => void;
}) {
  const name = useId();

  return (
    <fieldset className="mx-auto w-full">
      <legend className="sr-only">Ejercicio</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {EXERCISE_LIST.map((exercise) => {
          const active = value === exercise.id;
          return (
            <label
              key={exercise.id}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border p-[1px] transition-all duration-300",
                active
                  ? "border-transparent shadow-[0_0_0_1px_rgba(108,92,255,0.6),0_16px_40px_-16px_rgba(108,92,255,0.55)]"
                  : "border-outline hover:border-outline-strong hover:bg-surface/60",
              )}
            >
              {active && (
                <span
                  className={cn(
                    "absolute inset-0 -z-10 opacity-30 blur-xl",
                    `bg-gradient-to-br ${EXERCISE_GRence[exercise.id]}`,
                  )}
                  aria-hidden
                />
              )}
              <div
                className={cn(
                  "flex h-full flex-col gap-1.5 rounded-[calc(var(--radius-lg)-1px)] px-4 py-4 transition-colors",
                  active
                    ? "bg-[rgb(18_16_58_/_0.9)]"
                    : "bg-transparent",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="type-label text-secondary tracking-widest">
                    E{exercise.number}
                  </span>
                  <span
                    className={cn(
                      "size-2.5 rounded-full transition-all duration-300",
                      active
                        ? `bg-gradient-to-br ${EXERCISE_GRence[exercise.id]} shadow-[0_0_12px_currentColor]`
                        : "bg-outline-strong",
                    )}
                    aria-hidden
                  />
                </div>
                <p
                  className={cn(
                    "font-display text-lg font-bold tracking-tight transition-colors",
                    active ? "text-white" : "text-primary",
                  )}
                >
                  {exercise.title}
                </p>
                <p className="type-small text-secondary line-clamp-2 text-pretty">
                  {exercise.shortLabel}
                </p>
                <input
                  type="radio"
                  name={name}
                  value={exercise.id}
                  checked={active}
                  onChange={() => onChange(exercise.id)}
                  className="sr-only"
                />
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
