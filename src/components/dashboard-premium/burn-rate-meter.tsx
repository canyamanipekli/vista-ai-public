"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface BurnRateMeterProps {
  burnRateData: { month: string; spend: number; fullLabel: string }[];
}

function formatMoney(value: number) {
  return `$${value.toFixed(0)}`;
}

export function BurnRateMeter({ burnRateData }: BurnRateMeterProps) {
  if (burnRateData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-center gap-3"
      >
        <Flame size={24} className="text-zinc-600" />
        <div>
          <p className="text-xs font-semibold text-zinc-500">Monthly Burn Rate</p>
          <p className="text-sm text-zinc-600">No data yet</p>
        </div>
      </motion.div>
    );
  }

  const current = burnRateData[burnRateData.length - 1]?.spend ?? 0;
  const previous = burnRateData[burnRateData.length - 2]?.spend ?? 0;
  const increased = current > previous && previous > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`rounded-2xl border p-5 flex items-center gap-4 ${
        increased
          ? "border-red-500/30 bg-red-500/10"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          increased ? "bg-red-500/20" : "bg-white/[0.06]"
        }`}
      >
        <Flame size={24} className={increased ? "text-red-400" : "text-zinc-400"} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-zinc-500">Monthly Burn Rate</p>
        <p className={`text-2xl font-bold tabular-nums ${increased ? "text-red-400" : "text-zinc-100"}`}>
          {formatMoney(current)}
        </p>
        {increased && previous > 0 && (
          <p className="text-[10px] text-red-400/90 mt-0.5">
            +{formatMoney(current - previous)} vs last month
          </p>
        )}
      </div>
    </motion.div>
  );
}
