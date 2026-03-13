"use client";

import { motion } from "framer-motion";
import { AlertCircle, Clock } from "lucide-react";
import type { GracePeriodAlert } from "@/app/dashboard/prepare-dashboard-data";

interface GracePeriodFinderProps {
  alerts: GracePeriodAlert[];
}

export function GracePeriodFinder({ alerts }: GracePeriodFinderProps) {
  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-3xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-amber-500/10 flex items-center gap-2">
        <AlertCircle size={18} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-zinc-100">Grace Period Finder</h3>
      </div>
      <ul className="p-4 space-y-2">
        {alerts.map((a, i) => (
          <motion.li
            key={a.service + a.date}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{a.service}</p>
              <p className="text-[10px] text-zinc-500 truncate">{a.subject}</p>
            </div>
            {a.countdownDays != null && a.countdownDays > 0 && (
              <div className="shrink-0 flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                <Clock size={12} />
                {a.countdownDays} day{a.countdownDays !== 1 ? "s" : ""} left
              </div>
            )}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
