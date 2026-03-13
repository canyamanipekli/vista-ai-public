"use client";

import { useId } from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

/**
 * Minimal geometric "V" logo: forward movement & clarity.
 * Indigo → Violet gradient.
 */
export function Logo({ className = "", size = 32, showWordmark = false }: LogoProps) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden
      >
        <defs>
          <linearGradient id={`vista-v-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path
          d="M8 8 L20 32 L32 8"
          stroke={`url(#vista-v-${id})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showWordmark && (
        <span className="font-black tracking-tighter text-zinc-100 text-xl bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
          VISTA
        </span>
      )}
    </div>
  );
}
