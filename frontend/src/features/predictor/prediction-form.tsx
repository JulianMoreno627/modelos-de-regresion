import type { FormEvent } from "react";

import { Spinner } from "@/components/ui/spinner";
import type { ExerciseSpec, FieldSpec } from "@/features/exercises/config";
import type { FieldCheck } from "@/features/exercises/validation";
import { cn } from "@/lib/cn";
import { formatInput } from "@/lib/format";

interface PredictionFormProps {
  spec: ExerciseSpec;
  draft: Record<string, string>;
  checks: Record<string, FieldCheck>;
  showErrors: boolean;
  pending: boolean;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  className?: string;
}

export function PredictionForm({
  spec,
  draft,
  checks,
  showErrors,
  pending,
  onChange,
  onSubmit,
  onReset,
  className,
}: PredictionFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cn("flex min-h-0 flex-col lg:flex-1", className)}
    >
      <div
        className={cn(
          "gap-4 max-lg:grid sm:max-lg:grid-cols-2 md:max-lg:grid-cols-3",
          "lg:mx-auto lg:flex lg:w-full lg:max-w-md lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-between lg:gap-8",
        )}
      >
        {spec.fields.map((field) => (
          <Field
            key={`${spec.id}-${field.name}`}
            idPrefix={spec.id}
            field={field}
            raw={draft[field.name] ?? ""}
            check={checks[field.name] ?? {}}
            showError={showErrors}
            onChange={(value) => onChange(field.name, value)}
          />
        ))}
      </div>

      <div className="mt-6 flex shrink-0 gap-3 border-t border-outline/60 pt-5 lg:mt-0 lg:pt-6">
        <button
          type="submit"
          disabled={pending}
          className="relative inline-flex h-13 flex-1 touch-manipulation items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-md)] px-6 font-bold text-white transition-all disabled:cursor-wait disabled:opacity-80"
          style={{
            background:
              "linear-gradient(135deg, #6c5cff 0%, #8b5cf6 45%, #22d3ee 100%)",
            boxShadow:
              "0 10px 40px -10px rgba(108,92,255,0.7), inset 0 1px 0 0 rgba(255,255,255,0.22)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, rgb(255 255 255 / 0.14), transparent 40%, rgb(34 211 238 / 0.24))",
            }}
          />
          {pending && <Spinner tone="light" />}
          <span className="relative">
            {pending ? "Calculando…" : "Calcular predicción"}
          </span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-13 touch-manipulation rounded-[var(--radius-md)] border border-outline bg-surface/70 px-4 text-sm font-semibold text-secondary transition-colors hover:border-outline-strong hover:text-primary"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  idPrefix: string;
  field: FieldSpec;
  raw: string;
  check: FieldCheck;
  showError: boolean;
  onChange: (value: string) => void;
}

function Field({ idPrefix, field, raw, check, showError, onChange }: FieldProps) {
  const id = `${idPrefix}-${field.name}`;
  const error = showError ? check.error : undefined;
  const [low, high] = field.training;

  const control = cn(
    "type-num h-12 w-full rounded-[var(--radius-md)] border bg-surface/80 px-4 text-primary transition-all outline-none lg:h-13 lg:px-4.5 lg:text-lg",
    "focus:border-transparent focus:bg-surface",
    "focus:ring-[3px] focus:ring-tertiary/50",
    error
      ? "border-error/70 focus:ring-error/40"
      : "border-outline hover:border-outline-strong",
  );

  return (
    <div className="min-w-0 lg:flex lg:flex-col lg:justify-center">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold tracking-tight text-primary lg:mb-2.5 lg:text-[0.95rem]"
      >
        {field.label}
      </label>

      {field.kind === "select" ? (
        <select
          id={id}
          value={raw}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            control,
            "appearance-none bg-size-[1rem] bg-position-[right_0.9rem_center] bg-no-repeat pr-10 text-[15px]",
          )}
          style={{ backgroundImage: CHEVRON }}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative group">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[1px] rounded-[calc(var(--radius-md)+1px)] opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, rgb(108 92 255 / 0.8), rgb(34 211 238 / 0.8))",
              filter: "blur(6px)",
            }}
          />
          <input
            id={id}
            type="text"
            inputMode={field.kind === "integer" ? "numeric" : "decimal"}
            autoComplete="off"
            enterKeyHint="go"
            maxLength={32}
            value={raw}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={`${id}-hint`}
            className={cn(control, "relative", field.unit && "pr-20")}
          />
          {field.unit && (
            <span className="type-label pointer-events-none absolute inset-y-0 right-4 flex items-center text-accent font-bold normal-case tracking-tight">
              {field.unit}
            </span>
          )}
        </div>
      )}

      <p
        id={`${id}-hint`}
        className="type-small mt-2.5 leading-relaxed text-pretty text-secondary lg:mt-3 lg:text-[13px]"
        aria-live="polite"
      >
        {error ? (
          <span className="font-bold text-error">{error}</span>
        ) : check.warning ? (
          <span className="flex gap-2 rounded-[var(--radius-sm)] bg-warn/10 border border-warn/25 px-2.5 py-1.5 text-warn">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warn" />
            {check.warning}
          </span>
        ) : (
          <>
            {field.hint}{" "}
            <span className="whitespace-nowrap text-[12px] text-secondary/80 font-mono">
              [{formatInput(low)} – {formatInput(high)}]
            </span>
          </>
        )}
      </p>
    </div>
  );
}

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%2322d3ee' stroke-width='2'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")`;
