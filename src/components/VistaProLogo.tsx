"use client";

import { useId } from "react";

interface VistaProLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

/**
 * VISTA Pro geometric "V" — Violet-to-Gold with liquid-gold shimmer.
 */
export function VistaProLogo({ className = "", size = 32, showWordmark = false }: VistaProLogoProps) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 vista-pro-logo-shimmer"
        aria-hidden
      >
        <defs>
          <linearGradient id={`vista-pro-v-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <filter id={`vista-pro-glow-${id}`}>
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M8 8 L20 32 L32 8"
          stroke={`url(#vista-pro-v-${id})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#vista-pro-glow-${id})`}
        />
      </svg>
      {showWordmark && (
        <span className="font-black tracking-tighter text-zinc-100 text-xl bg-gradient-to-r from-violet-400 via-amber-200 to-amber-400 bg-clip-text text-transparent">
          VISTA Pro
        </span>
      )}
    </div>
  );
}
