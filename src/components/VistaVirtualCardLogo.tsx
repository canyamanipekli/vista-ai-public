"use client";

import { useId } from "react";

interface VistaVirtualCardLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

/**
 * VISTA Virtual Card logo: card shape + "V" mark.
 * Same violet gradient as main VISTA; premium, consistent with brand.
 */
export function VistaVirtualCardLogo({
  className = "",
  size = 32,
  showWordmark = false,
}: VistaVirtualCardLogoProps) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 vista-virtual-card-logo-glow"
        aria-hidden
      >
        <defs>
          <linearGradient id={`vista-vc-bg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="50%" stopColor="#5b21b6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id={`vista-vc-v-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <filter id={`vista-vc-glow-${id}`}>
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Card outline (rounded rect) */}
        <rect
          x="2"
          y="6"
          width="36"
          height="24"
          rx="3"
          stroke={`url(#vista-vc-bg-${id})`}
          strokeWidth="2"
          fill="none"
        />
        {/* Chip hint (small rect left) */}
        <rect
          x="6"
          y="12"
          width="10"
          height="8"
          rx="1"
          fill="rgba(251,191,36,0.25)"
          stroke="rgba(251,191,36,0.5)"
          strokeWidth="0.5"
        />
        {/* V mark (centered, like main Logo) */}
        <path
          d="M18 14 L20 22 L22 14"
          stroke={`url(#vista-vc-v-${id})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#vista-vc-glow-${id})`}
        />
      </svg>
      {showWordmark && (
        <span className="font-black tracking-tight text-zinc-100 text-base bg-gradient-to-r from-violet-300 via-violet-200 to-violet-300 bg-clip-text text-transparent">
          VISTA Virtual Card
        </span>
      )}
    </div>
  );
}
