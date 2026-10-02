import { Logo } from "@/components/ui/logo";
import { Wordmark } from "@/components/ui/wordmark";
import { exerciseFromSlug } from "@/features/exercises/config";
import { Predictor } from "@/features/predictor/predictor";
import { API_BASE_URL } from "@/lib/api/client";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const REPOSITORY_URL = "https://github.com/Julian/mineva-modelos-regresion";

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { ejercicio } = await searchParams;
  const initialExercise = exerciseFromSlug(
    typeof ejercicio === "string" ? ejercicio : undefined,
  );

  return (
    <div className="mineva-grid-bg flex min-h-dvh flex-col">
      <Predictor
        initialExercise={initialExercise}
        intro={
          <>
            <h1 className="type-hero mt-4 text-balance">
              <span className="block text-white/90">Tres modelos.</span>
              <span className="block gradient-text">Una sola recta. 🎯</span>
            </h1>
            <p className="type-body mt-5 max-w-2xl text-pretty text-secondary lg:text-[1.06rem] lg:leading-relaxed">
              Elige un caso de uso, introduce tus variables y observa cómo cada
              coeficiente βᵢ empuja la predicción ŷ. Predice el precio del dólar,
              la glucosa en sangre o el consumo de energía con modelos de regresión
              lineal entrenados en Python.
            </p>
          </>
        }
      />

      <footer className="relative overflow-hidden border-t border-outline/60 bg-[rgb(7_5_28_/_0.95)] text-primary pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        {/* Fondo de degradado footer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-48"
          style={{
            background:
              "radial-gradient(ellipse 70% 100% at 50% 0%, rgb(108 92 255 / 0.22), transparent 70%)",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8 md:grid-cols-[1fr_auto] md:items-start">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Logo className="size-14 shrink-0" />
              <div className="min-w-0">
                <Wordmark />
                <div className="mt-4 flex flex-wrap gap-2">
                  <TechBadge>scikit-learn</TechBadge>
                  <TechBadge>FastAPI</TechBadge>
                  <TechBadge>Next.js 15</TechBadge>
                  <TechBadge>PostgreSQL</TechBadge>
                </div>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-secondary/90 text-pretty">
              Proyecto académico de minería de datos aplicando la metodología
              <span className="mx-1 font-semibold text-white/90">CRISP-DM</span> en sus 6
              fases. Cubre desde la comprensión del negocio hasta la evaluación y
              despliegue de modelos con una interfaz web interactiva.
            </p>
          </div>

          <nav
            aria-label="Enlaces del proyecto"
            className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm font-medium sm:grid-cols-2 md:grid-cols-1"
          >
            <FooterLink href={`${API_BASE_URL}/docs`}>📘 API · Swagger</FooterLink>
            <FooterLink href={`${API_BASE_URL}/openapi.json`}>
              📄 OpenAPI JSON
            </FooterLink>
            <FooterLink href={REPOSITORY_URL}>💻 Repositorio GitHub</FooterLink>
            <FooterLink href="/report/informe_mineva.md" download>
              📝 Informe escrito
            </FooterLink>
          </nav>
        </div>

        <div className="relative border-t border-on-primary/10">
          <div className="type-small mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-5 text-secondary/85 sm:flex-row sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} MINEVA · Proyecto de Minería de Datos</p>
            <p>
              CRISP-DM · <span className="text-white/90 font-semibold">Modelado</span> ·
              Regresión lineal múltiple
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-secondary backdrop-blur">
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-gradient-to-br from-tertiary to-accent shadow-[0_0_8px_var(--color-tertiary)]"
      />
      {children}
    </span>
  );
}

function FooterLink({
  href,
  children,
  ...anchorProps
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      {...anchorProps}
      className="group inline-flex items-center justify-end gap-2 rounded-lg px-2.5 py-1.5 text-right text-secondary transition-colors hover:text-white"
    >
      <span>{children}</span>
      <span className="text-accent opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
        →
      </span>
    </a>
  );
}
