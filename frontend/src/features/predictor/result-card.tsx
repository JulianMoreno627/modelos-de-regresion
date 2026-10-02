import type { ReactNode, Ref } from "react";

import { Card, CardLabel } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExerciseSpec } from "@/features/exercises/config";
import type { ResourceState } from "@/hooks/use-resource";
import type { ApiError } from "@/lib/api/client";
import type { CatalogItem } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatMetric, formatNumber } from "@/lib/format";
import { fitQuality, type FitTone } from "@/lib/regression";
import type { ResultState } from "./state";

interface ResultCardProps {
  spec: ExerciseSpec;
  result: ResultState;
  catalog: ResourceState<CatalogItem[]>;
  ref?: Ref<HTMLElement>;
  className?: string;
}

export function ResultCard({ spec, result, catalog, ref, className }: ResultCardProps) {
  return (
    <Card
      ref={ref}
      aria-live="polite"
      aria-busy={result.status === "loading"}
      className={cn("scroll-mt-44 lg:scroll-mt-32 overflow-hidden relative", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full opacity-40 blur-3xl motion-safe:animate-glow"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgb(108 92 255 / 0.75) 0%, transparent 70%)",
        }}
      />
      <CardLabel>{spec.target.label}</CardLabel>
      <div className="mt-4">
        {result.status === "loading" && <ResultSkeleton />}
        {result.status === "error" && <ErrorNotice error={result.error} />}
        {result.status === "idle" && <IdleResult spec={spec} catalog={catalog} />}
        {result.status === "success" && (
          <SuccessResult
            spec={spec}
            prediction={result.prediction.prediction}
            r2={result.prediction.model_r2}
            mse={result.prediction.model_mse}
            rmse={result.prediction.model_rmse}
            mae={result.prediction.model_mae}
            mape={result.prediction.model_mape}
            stored={result.prediction.stored_in_history}
            extrapolates={result.extrapolates}
          />
        )}
      </div>
    </Card>
  );
}

function Value({ spec, value }: { spec: ExerciseSpec; value: number }) {
  const { prefix, unit, decimals } = spec.target;
  return (
    <div className="flex flex-col gap-1">
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="type-num-xl leading-none gradient-text lg:text-[clamp(2.5rem,4.2vw,3.75rem)]">
          {prefix}
          {formatNumber(value, decimals)}
        </span>
        {unit && <span className="type-label text-accent">{unit}</span>}
      </p>
    </div>
  );
}

function MarginRange({
  prefix,
  decimals,
  low,
  prediction,
  high,
  error,
}: {
  prefix: string;
  decimals: number;
  low: number;
  prediction: number;
  high: number;
  error: number;
}) {
  const span = high - low || 1;
  const center = ((prediction - low) / span) * 100;

  return (
    <div className="rounded-[var(--radius-md)] border border-outline bg-neutral/70 px-4 py-3.5">
      <p className="type-label text-accent tracking-[0.16em]">
        Margen ± {formatNumber(error, decimals)}
      </p>
      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-outline-strong/40">
        <div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: "8%",
            width: "84%",
            background:
              "linear-gradient(90deg, rgb(108 92 255 / 0.25) 0%, rgb(34 211 238 / 0.55) 50%, rgb(236 72 153 / 0.25) 100%)",
          }}
        />
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gradient-to-br from-tertiary to-accent shadow-[0_0_14px_var(--color-tertiary)]"
          style={{ left: `${8 + (center / 100) * 84}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <span className="type-num text-[11px] font-medium text-secondary sm:text-xs">
          {prefix}
          {formatNumber(low, decimals)}
        </span>
        <span className="type-num text-[11px] font-bold text-white sm:text-xs">
          {prefix}
          {formatNumber(prediction, decimals)}
        </span>
        <span className="type-num text-[11px] font-medium text-secondary sm:text-xs">
          {prefix}
          {formatNumber(high, decimals)}
        </span>
      </div>
    </div>
  );
}

function SuccessResult({
  spec,
  prediction,
  r2,
  mse,
  rmse,
  mae,
  mape,
  stored,
  extrapolates,
}: {
  spec: ExerciseSpec;
  prediction: number;
  r2: number;
  mse: number;
  rmse: number | null;
  mae: number | null;
  mape: number | null;
  stored: boolean;
  extrapolates: boolean;
}) {
  const { decimals, prefix = "" } = spec.target;
  const error = rmse ?? Math.sqrt(mse);
  const low = prediction - error;
  const high = prediction + error;

  const fit = fitQuality(r2);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <Value spec={spec} value={prediction} />
        <FitBadge tone={fit.tone} label={fit.label} className="mb-1 shrink-0" />
      </div>

      <MarginRange
        prefix={prefix}
        decimals={decimals}
        low={low}
        prediction={prediction}
        high={high}
        error={error}
      />

      <MetricChips r2={r2} mse={mse} rmse={rmse} mae={mae} mape={mape} />

      <footer className="space-y-2 border-t border-outline/60 pt-3">
        {extrapolates && (
          <p className="type-small flex gap-2.5 leading-relaxed text-pretty rounded-[var(--radius-md)] border border-warn/30 bg-warn/10 px-3.5 py-3 text-warn">
            <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-warn shadow-[0_0_10px_var(--color-warn)]" />
            Hay entradas fuera del rango de entrenamiento: la recta extrapola y el error real puede ser mayor.
          </p>
        )}
        <p className="text-[11px] text-secondary leading-relaxed">
          {stored ? "✓ Guardado en el historial de predicciones." : "Sin base de datos activa (no se guardó historial)."}
        </p>
      </footer>
    </div>
  );
}

function IdleResult({ spec, catalog }: { spec: ExerciseSpec; catalog: ResourceState<CatalogItem[]> }) {
  if (catalog.status === "error" && !catalog.data) return <ErrorNotice error={catalog.error} />;

  const item = "data" in catalog ? catalog.data?.find((model) => model.model_name === spec.id) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-outline bg-neutral/60 px-4 py-4">
        <span
          aria-hidden
          className="type-num-xl shrink-0 font-bold gradient-text lg:text-6xl"
        >
          ŷ
        </span>
        <p className="type-small leading-relaxed text-pretty text-secondary">
          Completa los datos y pulsa{" "}
          <span className="font-bold text-white">Calcular predicción</span>. Verás el valor
          calculado, el margen de error y todas las métricas del modelo.
        </p>
      </div>
      {item ? (
        <MetricChips r2={item.r2_score} mse={item.mse} rmse={item.rmse} mae={item.mae} mape={item.mape} />
      ) : (
        <MetricsSkeleton />
      )}
    </div>
  );
}

function MetricChips({
  r2,
  mse,
  rmse,
  mae,
  mape,
  className,
}: {
  r2: number;
  mse: number;
  rmse: number | null;
  mae: number | null;
  mape: number | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5",
        className,
      )}
      role="list"
      aria-label="Métricas del modelo"
    >
      <Chip label="R²" value={formatNumber(r2, 3)} tone="accent" />
      <Chip label="MSE" value={formatMetric(mse)} tone="tertiary" />
      <Chip label="RMSE" value={rmse !== null ? formatMetric(rmse) : "—"} tone="mora" />
      <Chip label="MAE" value={mae !== null ? formatMetric(mae) : "—"} tone="positive" />
      <Chip label="MAPE" value={mape !== null ? `${formatNumber(mape * 100, 2)} %` : "—"} tone="warn" />
    </div>
  );
}

const FIT_TONES: Record<FitTone, string> = {
  high: "bg-positive/18 text-positive border border-positive/40 shadow-[0_0_16px_rgba(34,197,94,0.35)]",
  good: "bg-accent/15 text-accent border border-accent/40 shadow-[0_0_16px_rgba(34,211,238,0.25)]",
  moderate: "bg-warn/15 text-warn border border-warn/40 shadow-[0_0_14px_rgba(245,158,11,0.25)]",
};

function FitBadge({
  tone,
  label,
  className,
}: {
  tone: FitTone;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-center text-[11px] font-bold tracking-widest uppercase normal-case",
        FIT_TONES[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current motion-safe:animate-pulse" />
      {label}
    </span>
  );
}

const CHIP_TONES: Record<Tone, string> = {
  accent:
    "border-accent/30 bg-accent/10 [&>span:first-child]:text-accent [&>span:last-child]:text-white",
  tertiary:
    "border-tertiary/30 bg-tertiary/10 [&>span:first-child]:text-tertiary [&>span:last-child]:text-white",
  mora:
    "border-mora/30 bg-mora/10 [&>span:first-child]:text-mora [&>span:last-child]:text-white",
  positive:
    "border-positive/30 bg-positive/10 [&>span:first-child]:text-positive [&>span:last-child]:text-white",
  warn:
    "border-warn/30 bg-warn/10 [&>span:first-child]:text-warn [&>span:last-child]:text-white",
};

type Tone = "accent" | "tertiary" | "mora" | "positive" | "warn";

function Chip({
  label,
  value,
  tone = "accent",
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "group inline-flex min-w-0 items-baseline justify-between gap-2 rounded-[var(--radius-md)] border bg-surface/60 px-3 py-2.5 backdrop-blur transition-transform hover:-translate-y-0.5",
        CHIP_TONES[tone],
      )}
      role="listitem"
    >
      <span className="type-label tracking-widest">{label}</span>
      <span className="type-num text-sm font-semibold">{value}</span>
    </span>
  );
}

function MetricsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5", className)}>
      <Skeleton className="h-11 rounded-[var(--radius-md)]" />
      <Skeleton className="h-11 rounded-[var(--radius-md)]" />
      <Skeleton className="h-11 rounded-[var(--radius-md)]" />
      <Skeleton className="h-11 rounded-[var(--radius-md)]" />
      <Skeleton className="h-11 rounded-[var(--radius-md)]" />
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-4">
      <span className="sr-only">Calculando la predicción…</span>
      <Skeleton className="h-14 w-52 max-w-full rounded-[var(--radius-md)]" />
      <Skeleton className="h-24 w-full rounded-[var(--radius-md)]" />
      <MetricsSkeleton />
    </div>
  );
}

export function ErrorNotice({ error, children }: { error: ApiError; children?: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-[var(--radius-md)] border border-error/40 bg-error/10 px-4 py-4"
    >
      <p className="type-small font-semibold text-error">⚠ {error.message}</p>
      {error.isOffline && (
        <p className="type-small mt-2 text-secondary">
          Arranca el backend desde la raíz del repo con{" "}
          <code className="rounded-md border border-outline bg-surface px-1.5 py-0.5 font-mono text-code break-all text-primary">
            uvicorn backend.app.main:app --port 8000
          </code>
          .
        </p>
      )}
      {children}
    </div>
  );
}
