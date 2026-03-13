"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp } from "lucide-react";
import type { CashFlowDay } from "@/app/dashboard/prepare-dashboard-data";

interface CashFlowHUDProps {
  predictions: CashFlowDay[];
}

function formatMoney(amount: number) {
  return `$${amount.toFixed(0)}`;
}

export function CashFlowHUD({ predictions }: CashFlowHUDProps) {
  if (predictions.length === 0) return null;

  const next7 = predictions.slice(0, 7);
  const total60 = predictions.reduce((s, d) => s + d.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <Calendar size={18} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Predictive Cash-Flow HUD</h3>
            <p className="text-[10px] text-zinc-500">Next 60 days · From last 12 months</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-violet-400">
          Total: {formatMoney(total60)}
        </span>
      </div>
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {next7.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              className="shrink-0 w-28 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3"
            >
              <p className="text-[10px] text-zinc-500 mb-0.5">{day.label}</p>
              <p className="text-sm font-bold text-zinc-100">{formatMoney(day.amount)}</p>
              <p className="text-[10px] text-zinc-600 truncate mt-0.5" title={day.services.join(", ")}>
                {day.services.slice(0, 2).join(", ")}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
