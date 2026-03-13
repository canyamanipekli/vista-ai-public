"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface MonthlyForecastCardProps {
  amount: number;
  currency?: string;
}

function formatMoney(amount: number, currency: string = "USD") {
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "TRY" ? "₺" : "$";
  return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function MonthlyForecastCard({ amount, currency = "USD" }: MonthlyForecastCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-white/15 transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={18} className="text-cyan-400" />
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Next 30 Days
        </span>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">
        {formatMoney(amount, currency)}
      </p>
      <p className="text-xs text-zinc-500 mt-1">Predicted spend from invoice patterns</p>
    </motion.div>
  );
}
