"use client";

import { useId } from "react";

interface VistaVirtualCardVLogoProps {
  className?: string;
  size?: number;
}

/**
 * Just the letter V — violet to blue gradient. For VISTA Virtual Card page and card face.
 */
export function VistaVirtualCardVLogo({ className = "", size = 40 }: VistaVirtualCardVLogoProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 vista-virtual-card-v-glow ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`vista-vc-v-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <filter id={`vista-vc-v-blur-${id}`}>
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M8 8 L20 32 L32 8"
        stroke={`url(#vista-vc-v-gradient-${id})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#vista-vc-v-blur-${id})`}
      />
    </svg>
  );
}
