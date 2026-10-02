"use client";

import Link from "next/link";
import { useCallback, useMemo, useReducer, useRef, type ReactNode } from "react";

import { ApiStatus } from "@/components/api-status";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Wordmark } from "@/components/ui/wordmark";
import { draftFromPayload, EXERCISES } from "@/features/exercises/config";
import { checkForm } from "@/features/exercises/validation";
import { useAutoReconnect } from "@/hooks/use-auto-reconnect";
import { isOfflineResource, useResource } from "@/hooks/use-resource";
import { api, clearMetadataCache, toApiError } from "@/lib/api/client";
import type { ModelName, PredictionLogItem } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ExercisePicker } from "./exercise-picker";
import { HISTORY_LIMIT, HistorySheet } from "./history-sheet";
import { InterpretationCard } from "./interpretation-card";
import { PredictionForm } from "./prediction-form";
import { RelationsCard } from "./relations-card";
import { ResultCard } from "./result-card";
import { initPredictor, predictorReducer } from "./state";

const loadCatalog = (_key: string, signal: AbortSignal) => api.models(signal);
const loadMetadata = (name: ModelName) => api.metadata(name);
const loadHistory = (_key: string, signal: AbortSignal) => api.history(HISTORY_LIMIT, signal);

const DESKTOP_QUERY = "(width >= 64rem)";

export function Predictor({
  initialExercise,
  intro,
}: {
  initialExercise: ModelName;
  intro: ReactNode;
}) {
  const [state, dispatch] = useReducer(predictorReducer, initialExercise, initPredictor);
  const { exercise } = state;
  const current = state.byExercise[exercise];
  const spec = EXERCISES[exercise];

  const [catalog, reloadCatalog] = useResource("catalog", loadCatalog);
  const [metadata, reloadMetadata] = useResource(exercise, loadMetadata);
  const [history, reloadHistory] = useResource("history", loadHistory);

  const apiOffline =
    isOfflineResource(catalog) || isOfflineResource(metadata) || isOfflineResource(history);

  const reloadApiData = useCallback(() => {
    clearMetadataCache();
    reloadCatalog();
    reloadMetadata();
    reloadHistory();
  }, [reloadCatalog, reloadMetadata, reloadHistory]);

  useAutoReconnect(apiOffline, reloadApiData);

  const form = useMemo(() => checkForm(spec, current.draft), [spec, current.draft]);
  const resultRef = useRef<HTMLElement>(null);

  function select(next: ModelName) {
    dispatch({ type: "select", exercise: next });
    const url = new URL(window.location.href);
    url.searchParams.set("ejercicio", EXERCISES[next].slug);
    window.history.replaceState(null, "", url);
  }

  function restoreFromHistory(row: PredictionLogItem) {
    const rowSpec = EXERCISES[row.model_name];
    const catalogItem =
      "data" in catalog ? catalog.data?.find((item) => item.model_name === row.model_name) : undefined;
    if (!rowSpec || !catalogItem) return;

    const draft = draftFromPayload(rowSpec, row.input_payload);
    const restored = checkForm(rowSpec, draft);
    if (!restored.values) return;
    const values = restored.values;

    dispatch({
      type: "restore",
      exercise: row.model_name,
      draft,
      prediction: {
        prediction: row.prediction,
        model_name: row.model_name,
        target: catalogItem.target,
        model_r2: catalogItem.r2_score,
        model_mse: catalogItem.mse,
        model_rmse: catalogItem.rmse,
        model_mae: catalogItem.mae,
        model_mape: catalogItem.mape,
        stored_in_history: true,
      },
      features: rowSpec.toFeatures(values),
      extrapolates: restored.extrapolates,
    });

    const url = new URL(window.location.href);
    url.searchParams.set("ejercicio", rowSpec.slug);
    window.history.replaceState(null, "", url);

    if (!window.matchMedia(DESKTOP_QUERY).matches) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      });
    }
  }

  async function submit() {
    if (!form.values) {
      dispatch({ type: "invalid" });
      return;
    }

    const requestId = current.requestId + 1;
    const values = form.values;
    const { extrapolates } = form;
    dispatch({ type: "submitted" });

    if (!window.matchMedia(DESKTOP_QUERY).matches) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    }

    try {
      const prediction = await api.predict(exercise, values);
      dispatch({
        type: "succeeded",
        exercise,
        requestId,
        prediction,
        features: spec.toFeatures(values),
        extrapolates,
      });
      if (prediction.stored_in_history) reloadHistory();
    } catch (error) {
      dispatch({ type: "failed", exercise, requestId, error: toApiError(error) });
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-outline/60 bg-neutral/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl [backdrop-filter:blur(18px)_saturate(160%)]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-[max(1rem,env(safe-area-inset-left))] sm:px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <Logo className="size-12 shrink-0 sm:size-14" />
            <Wordmark compact />
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <HistorySheet history={history} onOpen={reloadHistory} onSelect={restoreFromHistory} />
            <ApiStatus />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 lg:space-y-10 lg:px-8 lg:pt-16 lg:pb-24">
        <section className="relative isolate grid gap-10 pb-2 lg:grid-cols-12 lg:items-center lg:pb-8">
          <HeroDecor />
          <div className="relative lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline bg-surface/60 px-3 py-1.5 text-xs font-medium text-secondary backdrop-blur">
              <span aria-hidden className="size-1.5 rounded-full bg-gradient-to-r from-tertiary to-accent shadow-[0_0_10px_var(--color-tertiary)] motion-safe:animate-pulse" />
              CRISP-DM · Modelado · 3 modelos · scikit-learn
            </div>
            <div className="mt-5">
              {intro}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <Pill>Regresión lineal múltiple</Pill>
              <Pill>MSE · R² · RMSE · MAE · MAPE</Pill>
              <Pill>Dólar · Glucosa · Energía</Pill>
            </div>
          </div>
        </section>

        <ExercisePicker value={exercise} onChange={select} />

        <div className="flex flex-col gap-6 lg:min-h-0 lg:flex-row lg:items-stretch lg:gap-8">
          <div className="flex w-full min-h-0 flex-col lg:w-[46%] lg:self-stretch">
            <Card className="flex min-h-0 flex-col lg:flex-1">
              <div className="shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="type-label text-accent">Modelo #{spec.number}</p>
                    <h2 className="type-title mt-1.5">{spec.title}</h2>
                  </div>
                  <div
                    className={cn(
                      "hidden rounded-full border border-outline px-3 py-1 text-[11px] font-semibold tracking-widest uppercase text-secondary sm:inline-flex",
                      exercise === "dollar" && "text-fuchsia-300",
                      exercise === "glucose" && "text-emerald-300",
                      exercise === "energy" && "text-amber-300",
                    )}
                  >
                    ŷ = β₀ + Σβᵢxᵢ
                  </div>
                </div>
                <p className="type-small mt-2 max-w-lg leading-relaxed text-pretty text-secondary">
                  {spec.question}
                </p>
              </div>

              <dl className="mt-5 grid shrink-0 grid-cols-3 gap-2 overflow-hidden rounded-[var(--radius-md)] border border-outline bg-neutral/50 p-1">
                <Stat label="Observaciones" value={formatNumber(spec.rows, 0)} tone="accent" />
                <Stat label="Variables" value={String(spec.fields.length)} tone="tertiary" />
                <Stat label="Entrenado" value="scikit-learn" tone="mora" />
              </dl>

              <PredictionForm
                className="mt-6 lg:mt-7 lg:min-h-0 lg:flex-1"
                spec={spec}
                draft={current.draft}
                checks={form.checks}
                showErrors={current.showErrors}
                pending={current.result.status === "loading"}
                onChange={(field, value) => dispatch({ type: "change", field, value })}
                onSubmit={submit}
                onReset={() => dispatch({ type: "reset" })}
              />
            </Card>
          </div>

          <div className="grid min-h-0 min-w-0 flex-1 gap-6 self-stretch md:grid-cols-2 md:items-stretch lg:flex lg:flex-col lg:gap-8">
            <ResultCard
              ref={resultRef}
              spec={spec}
              result={current.result}
              catalog={catalog}
              className="h-full md:h-auto lg:shrink-0"
            />
            <InterpretationCard
              spec={spec}
              metadata={metadata}
              onRetry={reloadMetadata}
              features={current.result.status === "success" ? current.result.features : undefined}
              className="min-h-0 flex-1"
            />
          </div>
        </div>

        <RelationsCard spec={spec} />
      </main>
    </>
  );
}

/** Decoración científica del hero: 3 órbitas con gradiente + matriz de puntos + ecuaciones. */
function HeroDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Orbita violeta - cian exterior */}
      <div
        className="absolute right-[-6%] top-[-12%] hidden h-[420px] w-[420px] rounded-full motion-safe:animate-glow lg:block"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgb(108 92 255 / 0.55) 0%, rgb(34 211 238 / 0.28) 45%, transparent 75%)",
        }}
      />
      {/* Orbita magenta inferior */}
      <div
        className="absolute right-[26%] bottom-[-30%] hidden h-[380px] w-[380px] rounded-full motion-safe:animate-glow lg:block"
        style={{
          animationDelay: "1.5s",
          background:
            "radial-gradient(circle at 60% 40%, rgb(236 72 153 / 0.5) 0%, rgb(245 158 11 / 0.18) 50%, transparent 78%)",
        }}
      />

      {/* Ecuación flotante SVG al estilo dashboard */}
      <svg
        viewBox="0 0 420 260"
        className="absolute right-0 top-1/2 hidden w-[46%] max-w-[520px] -translate-y-1/2 motion-safe:animate-float lg:block"
      >
        <defs>
          <linearGradient id="eqStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6c5cff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(108 92 255 / 0.2)" />
            <stop offset="100%" stopColor="rgb(34 211 238 / 0.04)" />
          </linearGradient>
        </defs>

        {/* Tarjeta de ecuación */}
        <rect
          x="34"
          y="56"
          rx="18"
          width="350"
          height="152"
          fill="url(#eqFill)"
          stroke="url(#eqStroke)"
          strokeWidth="1.2"
        />

        {/* Puntos de esquina estilo notebook */}
        <g fill="#22d3ee" opacity="0.6">
          <circle cx="62" cy="84" r="1.8" />
          <circle cx="76" cy="84" r="1.8" />
          <circle cx="90" cy="84" r="1.8" />
        </g>

        {/* Texto de la ecuación ŷ = Xβ */}
        <text
          x="60"
          y="138"
          fontFamily="var(--font-jetbrains-mono), monospace"
          fontSize="30"
          fontWeight="600"
          fill="#e9e8ff"
          letterSpacing="-0.02em"
        >
          ŷ = β
          <tspan fontSize="20" dy="6">0</tspan>
          <tspan fill="#a78bfa"> + </tspan>
          <tspan fill="#22d3ee">β₁</tspan>
          <tspan fill="#e9e8ff">x₁</tspan>
          <tspan fill="#a78bfa"> + … </tspan>
          <tspan fill="#ec4899">βₚ</tspan>
          <tspan fill="#e9e8ff">xₚ</tspan>
        </text>

        <text
          x="60"
          y="176"
          fontFamily="var(--font-inter), sans-serif"
          fontSize="12"
          fill="#9aa4c7"
          letterSpacing="0.08em"
        >
          RSS = Σ(yᵢ − ŷᵢ)² &nbsp;·&nbsp; R² = 1 − RSS / TSS
        </text>

        {/* Mini gráfico de dispersión */}
        <g transform="translate(280 178)" opacity="0.95">
          <line x1="0" y1="22" x2="90" y2="22" stroke="#6c5cff" strokeOpacity="0.5" strokeWidth="1" />
          <line x1="0" y1="22" x2="0" y2="-42" stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="1" />
          <line x1="4" y1="16" x2="86" y2="-36" stroke="url(#eqStroke)" strokeWidth="1.8" strokeLinecap="round" />
          <g fill="#ec4899">
            <circle cx="12" cy="10" r="2" />
            <circle cx="28" cy="4" r="2" />
            <circle cx="44" cy="-6" r="2" />
            <circle cx="60" cy="-18" r="2" />
            <circle cx="76" cy="-30" r="2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-secondary backdrop-blur">
      <span aria-hidden className="size-1 rounded-full bg-gradient-to-r from-tertiary to-accent" />
      {children}
    </span>
  );
}

type Tone = "tertiary" | "accent" | "mora";

const TONE_TEXT: Record<Tone, string> = {
  tertiary: "text-tertiary",
  accent: "text-accent",
  mora: "text-mora",
};

function Stat({ label, value, tone = "accent" }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center rounded-[calc(var(--radius-md)-4px)] bg-surface/60 px-2 py-3">
      <dd className={cn("font-mono text-lg font-semibold tabular-nums lg:text-xl", TONE_TEXT[tone])}>
        {value}
      </dd>
      <dt className="mt-1 text-[11px] leading-snug text-secondary tracking-wide text-center">{label}</dt>
    </div>
  );
}
