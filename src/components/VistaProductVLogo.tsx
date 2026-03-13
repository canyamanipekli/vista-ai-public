"use client";

import { useId } from "react";

export type VistaProduct =
  | "aura"
  | "virtual-card"
  | "time-machine"
  | "mirror"
  | "shadow"
  | "ghost"
  | "ritual"
  | "zero"
  | "weather"
  | "garden"
  | "canvas"
  | "oracle"
  | "compass"
  | "spark";

/** Each product has a UNIQUE accent color — no duplicates. Violet (start) + distinct accent (end). */
const PRODUCT_GRADIENTS: Record<
  VistaProduct,
  { start: string; mid?: string; end: string }
> = {
  aura: { start: "#6d28d9", mid: "#a78bfa", end: "#fbbf24" },
  "virtual-card": { start: "#6d28d9", mid: "#6366f1", end: "#2563eb" },
  "time-machine": { start: "#6d28d9", mid: "#f97316", end: "#ea580c" },
  mirror: { start: "#6d28d9", mid: "#14b8a6", end: "#0d9488" },
  shadow: { start: "#6d28d9", mid: "#64748b", end: "#475569" },
  ghost: { start: "#6d28d9", mid: "#a3e635", end: "#84cc16" },
  ritual: { start: "#6d28d9", mid: "#f59e0b", end: "#d97706" },
  zero: { start: "#6d28d9", mid: "#34d399", end: "#059669" },
  weather: { start: "#6d28d9", mid: "#38bdf8", end: "#0284c7" },
  garden: { start: "#6d28d9", mid: "#4ade80", end: "#16a34a" },
  canvas: { start: "#6d28d9", mid: "#e879f9", end: "#c026d3" },
  oracle: { start: "#6d28d9", mid: "#8b5cf6", end: "#7c3aed" },
  compass: { start: "#6d28d9", mid: "#22d3ee", end: "#06b6d4" },
  spark: { start: "#6d28d9", mid: "#f87171", end: "#ef4444" },
};

const PRODUCT_GLOW_CLASS: Record<VistaProduct, string> = {
  aura: "vista-product-v-glow-aura",
  "virtual-card": "vista-product-v-glow-virtual-card",
  "time-machine": "vista-product-v-glow-time-machine",
  mirror: "vista-product-v-glow-mirror",
  shadow: "vista-product-v-glow-shadow",
  ghost: "vista-product-v-glow-ghost",
  ritual: "vista-product-v-glow-ritual",
  zero: "vista-product-v-glow-zero",
  weather: "vista-product-v-glow-weather",
  garden: "vista-product-v-glow-garden",
  canvas: "vista-product-v-glow-canvas",
  oracle: "vista-product-v-glow-oracle",
  compass: "vista-product-v-glow-compass",
  spark: "vista-product-v-glow-spark",
};

interface VistaProductVLogoProps {
  product: VistaProduct;
  className?: string;
  size?: number;
}

/**
 * V logo with violet + product-specific accent. Accent is strong (new colors per feature).
 */
export function VistaProductVLogo({
  product,
  className = "",
  size = 40,
}: VistaProductVLogoProps) {
  const id = useId().replace(/:/g, "");
  const g = PRODUCT_GRADIENTS[product];
  const glowClass = PRODUCT_GLOW_CLASS[product];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${glowClass} ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={`vista-product-v-${product}-${id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={g.start} />
          {g.mid && <stop offset="50%" stopColor={g.mid} />}
          <stop offset="100%" stopColor={g.end} />
        </linearGradient>
        <filter id={`vista-product-v-blur-${product}-${id}`}>
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M8 8 L20 32 L32 8"
        stroke={`url(#vista-product-v-${product}-${id})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#vista-product-v-blur-${product}-${id})`}
      />
    </svg>
  );
}
