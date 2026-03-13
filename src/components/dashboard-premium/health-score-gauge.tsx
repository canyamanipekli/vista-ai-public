"use client";

import { motion } from "framer-motion";

interface HealthScoreGaugeProps {
  score: number;
  label?: string;
}

function getLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Action Needed";
  return "Critical";
}

function getColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-emerald-500";
  if (score >= 55) return "text-amber-400";
  if (score >= 40) return "text-amber-500";
  return "text-red-400";
}

function getStrokeColor(score: number): string {
  if (score >= 85) return "#34d399";
  if (score >= 70) return "#10b981";
  if (score >= 55) return "#fbbf24";
  if (score >= 40) return "#f59e0b";
  return "#f87171";
}

const SIZE = 160;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;

export function HealthScoreGauge({ score, label }: HealthScoreGaugeProps) {
  const displayLabel = label ?? getLabel(score);
  const clamped = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * R;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 hover:border-white/15 transition-all hover:shadow-xl hover:shadow-indigo-500/5"
    >
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE}
              className="text-white/10"
            />
            <motion.circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={getStrokeColor(score)}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-4xl font-bold tabular-nums ${getColor(score)}`}
            >
              {score}
            </motion.span>
            <span className="text-xs font-medium text-zinc-500 mt-0.5">/ 100</span>
          </div>
        </div>
        <p className={`mt-4 text-sm font-semibold ${getColor(score)}`}>{displayLabel}</p>
        <p className="text-xs text-zinc-500 mt-0.5">VISTA Health Score</p>
      </div>
    </motion.div>
  );
}
