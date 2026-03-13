"use client";

import { Wallet, CreditCard, PiggyBank, TrendingDown } from "lucide-react";

interface FinancialOverviewCardsProps {
  totalMonthly: number;
  subscriptionCount: number;
  potentialSavings: number;
  netSpend: number;
  currency?: string;
}

function formatMoney(amount: number, currency: string = "USD") {
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "TRY" ? "₺" : "$";
  return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function FinancialOverviewCards({
  totalMonthly,
  subscriptionCount,
  potentialSavings,
  netSpend,
  currency = "USD",
}: FinancialOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Wallet size={20} className="text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-zinc-400">
            Total Monthly Spend
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {formatMoney(totalMonthly, currency)}
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white/10 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CreditCard size={20} className="text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-zinc-400">
            Active Subscriptions
          </span>
        </div>
        <p className="text-2xl font-bold text-white">{subscriptionCount}</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-white/10 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <PiggyBank size={20} className="text-amber-400" />
          </div>
          <span className="text-sm font-medium text-zinc-400">
            Potential Savings
          </span>
        </div>
        <p className="text-2xl font-bold text-emerald-400">
          {formatMoney(potentialSavings, currency)}
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/10 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <TrendingDown size={20} className="text-cyan-400" />
          </div>
          <span className="text-sm font-medium text-zinc-400">
            Net Spend
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {formatMoney(Math.max(0, netSpend), currency)}
        </p>
      </div>
    </div>
  );
}
