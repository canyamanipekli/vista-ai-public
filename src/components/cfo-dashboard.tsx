"use client";

import {
  Activity,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Zap,
  Target,
} from "lucide-react";

interface CFODashboardProps {
  overview: {
    totalMonthly: number;
    nextMonthForecast: number;
    healthScore: number;
    cfoInsight: string;
    potentialSavings: number;
  };
  insights: Array<{
    type: string;
    title: string;
    description: string;
    severity: string;
  }>;
  alerts: {
    priceHikes: { provider: string; increase: number }[];
    doubleCharges: { provider: string }[];
    redundantCategories: { category: string; services: string[]; savingsPotential: number }[];
  };
  currency?: string;
}

function formatMoney(amount: number, currency: string = "USD") {
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "TRY" ? "₺" : "$";
  return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CFODashboard({
  overview,
  insights,
  alerts,
  currency = "USD",
}: CFODashboardProps) {
  const hasAlerts = insights.length > 0;

  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <Target size={20} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Autonomous CFO</h2>
          <p className="text-xs text-zinc-500">Financial health & actionable insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-cyan-400" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Next 30 Days Forecast
            </span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatMoney(overview.nextMonthForecast, currency)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Based on invoice patterns</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-emerald-400" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Financial Health Score
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`text-2xl font-bold ${
                overview.healthScore >= 80
                  ? "text-emerald-400"
                  : overview.healthScore >= 60
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {overview.healthScore}
            </div>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  overview.healthScore >= 80
                    ? "bg-emerald-500"
                    : overview.healthScore >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${overview.healthScore}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-1">0–100 scale</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} className="text-amber-400" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Potential Savings
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {formatMoney(overview.potentialSavings, currency)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Price hikes + redundant subs</p>
        </div>
      </div>

      <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-5">
        <div className="flex items-start gap-3">
          <Lightbulb size={20} className="text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-indigo-200 mb-1">CFO Insight</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{overview.cfoInsight}</p>
          </div>
        </div>
      </div>

      {hasAlerts && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
            <AlertTriangle size={18} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Action Required</h3>
            <span className="ml-auto text-xs text-zinc-500">{insights.length} alerts</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {insights.slice(0, 8).map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-5 py-3 ${
                  insight.severity === "high" ? "bg-amber-500/5" : ""
                }`}
              >
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
                    insight.type === "price_hike"
                      ? "bg-amber-500/20 text-amber-400"
                      : insight.type === "duplicate_charge"
                        ? "bg-red-500/20 text-red-400"
                        : insight.type === "ghost_subscription"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-indigo-500/20 text-indigo-400"
                  }`}
                >
                  {insight.type.replace("_", " ")}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{insight.title}</p>
                  <p className="text-xs text-zinc-500">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
