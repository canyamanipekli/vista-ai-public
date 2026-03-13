"use client";

import { motion } from "framer-motion";
import { Sparkles, PiggyBank, Trash2, AlertTriangle } from "lucide-react";

export interface VistaIntelligenceProps {
  potentialSavingsYear?: number;
  savingsSuggestion?: string;
  inactiveCount?: number;
  anomalyMessage?: string;
  anomalyAmount?: number;
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function VistaIntelligence({
  potentialSavingsYear = 0,
  savingsSuggestion,
  inactiveCount = 0,
  anomalyMessage,
  anomalyAmount,
}: VistaIntelligenceProps) {
  const hasSavings = potentialSavingsYear > 0 || savingsSuggestion;
  const hasClutter = inactiveCount > 0;
  const hasAnomaly = anomalyMessage || (anomalyAmount != null && anomalyAmount > 0);

  if (!hasSavings && !hasClutter && !hasAnomaly) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-3xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.06]">
        <Sparkles size={18} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-zinc-100">VISTA Intelligence</h3>
      </div>
      <div className="p-6 space-y-4">
        {hasSavings && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <PiggyBank size={20} className="text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-100">Savings Opportunity</p>
              <p className="text-sm text-zinc-400 mt-0.5">
                {savingsSuggestion ||
                  (potentialSavingsYear > 0
                    ? `You can save ${formatMoney(potentialSavingsYear)}/year by optimizing your subscriptions.`
                    : "Review overlapping or underused services to unlock savings.")}
              </p>
            </div>
          </div>
        )}

        {hasClutter && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <Trash2 size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-100">Digital Clutter</p>
              <p className="text-sm text-zinc-400 mt-0.5">
                You have {inactiveCount} inactive account{inactiveCount !== 1 ? "s" : ""} identified. Clear your footprint?
              </p>
            </div>
          </div>
        )}

        {(hasAnomaly || (anomalyAmount != null && anomalyAmount > 0)) && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-100">Anomaly Alert</p>
              <p className="text-sm text-zinc-400 mt-0.5">
                {anomalyMessage ||
                  (anomalyAmount != null
                    ? `Unusual ${formatMoney(anomalyAmount)} charge detected from a new merchant.`
                    : "Unusual charge detected. Review your recent transactions.")}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
