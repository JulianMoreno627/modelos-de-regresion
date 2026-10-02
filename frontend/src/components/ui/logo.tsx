import type {} from "react";

import { cn } from "@/lib/cn";

/** Logotipo MINEVA: cubo hexagonal geométrico con gradiente violeta → cian (muy diferente del original) */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      aria-hidden
      className={cn(
        "size-7 transition-transform duration-500 ease-out motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-105",
        className,
      )}
    >
      <defs>
        <linearGradient id="mineva-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6c5cff" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="mineva-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="rgb(108 92 255 / 0.9)" />
          <stop offset="100%" stopColor="rgb(34 211 238 / 0.9)" />
        </linearGradient>
      </defs>

      {/* Halo exterior */}
      <circle cx="28" cy="28" r="25" fill="url(#mineva-body)" opacity="0.16" />
      <circle
        cx="28"
        cy="28"
        r="20.5"
        fill="none"
        stroke="url(#mineva-glow)"
        strokeWidth="1.2"
        opacity="0.5"
      />

      {/* Cuerpo principal: hexágono moderno */}
      <path
        d="M28 8.5 L45.5 18.5 V38.5 L28 48.5 L10.5 38.5 V18.5 Z"
        fill="url(#mineva-body)"
        stroke="rgb(255 255 255 / 0.1)"
        strokeWidth="1.2"
      />

      {/* Vértice superior / arista frontal */}
      <path
        d="M28 8.5 V48.5 M10.5 18.5 L45.5 38.5 M45.5 18.5 L10.5 38.5"
        stroke="rgb(255 255 255 / 0.18)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Ecuación ŷ al centro */}
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: "22px",
          fontWeight: 700,
          letterSpacing: "-0.03em",
        }}
      >
        ŷ
      </text>

      {/* Micro puntos orbitales flotantes */}
      <g fill="url(#mineva-body)" opacity="0.9">
        <circle cx="47" cy="14" r="1.7" />
        <circle cx="9" cy="42" r="1.7" />
        <circle cx="45" cy="42" r="1.2" />
      </g>
    </svg>
  );
}
