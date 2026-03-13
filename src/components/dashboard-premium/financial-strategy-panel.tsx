"use client";

import { motion } from "framer-motion";
import { Layers, UserX, TrendingUp } from "lucide-react";

export interface RedundantCategory {
  category: string;
  services: string[];
  savingsPotential: number;
}

export interface PriceHikeAlert {
  provider: string;
  amount: number;
  increase: number;
}

export interface FinancialStrategyPanelProps {
  redundantCategories?: RedundantCategory[];
  ghostSubscriptions?: string[];
  priceHikes?: PriceHikeAlert[];
}

export function FinancialStrategyPanel({
  redundantCategories = [],
  ghostSubscriptions = [],
  priceHikes = [],
}: FinancialStrategyPanelProps) {
  const hasBundles = redundantCategories.length > 0;
  const hasGhost = ghostSubscriptions.length > 0;
  const hasPriceHikes = priceHikes.length > 0;
  if (!hasBundles && !hasGhost && !hasPriceHikes) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.06]">
        <Layers size={18} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-zinc-100">Deep Audit</h3>
      </div>
      <div className="p-6 space-y-4">
        {hasGhost && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <UserX size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-100">Ghost Subscription Hunter</p>
              <p className="text-sm text-zinc-400 mt-0.5">
                You haven&apos;t logged into {ghostSubscriptions[0]} in 60 days. Potential Ghost Subscription detected.
              </p>
              {ghostSubscriptions.length > 1 && (
                <p className="text-xs text-zinc-500 mt-1">
                  +{ghostSubscriptions.length - 1} more inactive service{ghostSubscriptions.length > 2 ? "s" : ""}.
                </p>
              )}
            </div>
          </div>
        )}

        {hasPriceHikes && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <TrendingUp size={20} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-100">Price Hike Sentinel</p>
              <p className="text-sm text-zinc-400 mt-0.5">
                Current invoices vs 6‑month history: {priceHikes[0].provider} increased by ${priceHikes[0].increase.toFixed(2)}/mo.
              </p>
            </div>
          </div>
        )}

        {hasBundles && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <Layers size={20} className="text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-100">Bundle Optimizer</p>
              <p className="text-sm text-zinc-400 mt-0.5">
                You&apos;re paying for individual plans; switching to an {redundantCategories[0].category} family bundle could save you ${redundantCategories[0].savingsPotential.toFixed(0)}/month.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
