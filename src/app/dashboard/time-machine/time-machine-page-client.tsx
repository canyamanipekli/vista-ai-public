"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Sparkles, Loader2 } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";
import {
  computeTimeMachine,
  formatCurrency,
  type TimeMachineYears,
} from "@/lib/time-machine-utils";

interface TimeMachinePageClientProps {
  totalMonthly: number;
  potentialSavings: number;
}

type TimeMachineInsight = { oneYear?: string; fiveYear?: string; tenYear?: string };

const YEARS_OPTIONS: { value: TimeMachineYears; label: string }[] = [
  { value: 1, label: "1 year" },
  { value: 5, label: "5 years" },
  { value: 10, label: "10 years" },
];

export function TimeMachinePageClient({
  totalMonthly,
  potentialSavings,
}: TimeMachinePageClientProps) {
  const [years, setYears] = useState<TimeMachineYears>(5);
  const [insight, setInsight] = useState<TimeMachineInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "time-machine" }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setInsight({ oneYear: data.oneYear, fiveYear: data.fiveYear, tenYear: data.tenYear });
      } catch {
        if (!cancelled) setInsight(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const result = useMemo(() => {
    const monthly = totalMonthly > 0 ? totalMonthly : 120;
    const savings = potentialSavings >= 0 ? potentialSavings : 30;
    return computeTimeMachine({
      totalMonthly: monthly,
      potentialSavings: savings,
      years,
    });
  }, [totalMonthly, potentialSavings, years]);

  const hasData = totalMonthly > 0 || potentialSavings > 0;

  return (
    <div className="max-w-3xl mx-auto font-sans antialiased">
      <Link
        href="/dashboard"
        prefetch={false}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Page header: V logo + VISTA Time Machine — same font as VISTA Virtual Card */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-8"
      >
        <VistaProductVLogo product="time-machine" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Time Machine
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Your subscription future. Change nothing vs optimize — see the difference.
          </p>
        </div>
      </motion.header>

      {!hasData && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-zinc-500 mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          Connect Gmail to see your real numbers. Below we show an example with sample data.
        </motion.p>
      )}

      {/* Year selector */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        {YEARS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setYears(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              years === opt.value
                ? "bg-violet-500/25 border border-violet-500/40 text-violet-200"
                : "border border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </motion.div>

      {/* Two cards: Status quo vs Optimize */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-red-950/20 via-zinc-900/50 to-transparent p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-amber-400/80" />
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              If you change nothing
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-100 tabular-nums">
            {formatCurrency(result.statusQuoTotal)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Current track + price increases over {years} {years === 1 ? "year" : "years"}.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-zinc-900/50 to-transparent p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={18} className="text-violet-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              VISTA optimized
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-100 tabular-nums">
            {formatCurrency(result.optimizeTotal)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Cancel ghost & redundant subs; lower growth over {years} {years === 1 ? "year" : "years"}.
          </p>
        </motion.div>
      </div>

      {/* Savings highlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-6 mb-8 text-center"
      >
        <p className="text-sm text-zinc-400 mb-1">You could save</p>
        <p className="text-3xl font-bold text-violet-200 tabular-nums">
          {formatCurrency(result.savingsTotal)}
        </p>
        <p className="text-sm text-zinc-500 mt-1">
          over {years} {years === 1 ? "year" : "years"}
        </p>
      </motion.div>

      {/* "In 20XX this amount is waiting for you" */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
      >
        <p className="text-zinc-400 text-sm leading-relaxed">
          In <span className="font-semibold text-zinc-200">{result.targetYear}</span>,{" "}
          <span className="font-semibold text-amber-400/90">
            {formatCurrency(result.statusQuoTotal)}
          </span>{" "}
          is waiting for you if you keep the same path. With VISTA, you could bring that down to{" "}
          <span className="font-semibold text-violet-300">
            {formatCurrency(result.optimizeTotal)}
          </span>
          .
        </p>
      </motion.div>

      {insightLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 flex items-center gap-2 text-orange-400 text-sm">
          <Loader2 size={18} className="animate-spin" />
          AI projecting your subscription future…
        </motion.div>
      )}
      {!insightLoading && insight && (insight.oneYear || insight.fiveYear || insight.tenYear) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-orange-500/25 bg-orange-500/10 p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-orange-400" />
            <span className="text-sm font-medium text-orange-300">AI future</span>
          </div>
          <ul className="space-y-2 text-sm text-zinc-200">
            {insight.oneYear && <li><span className="text-zinc-500">1 year:</span> {insight.oneYear}</li>}
            {insight.fiveYear && <li><span className="text-zinc-500">5 years:</span> {insight.fiveYear}</li>}
            {insight.tenYear && <li><span className="text-zinc-500">10 years:</span> {insight.tenYear}</li>}
          </ul>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex flex-wrap gap-3"
      >
        <Link
          href="/dashboard"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-200 font-medium text-sm hover:bg-violet-500/30 transition-colors"
        >
          <Sparkles size={16} />
          Change this future
        </Link>
        <Link
          href="/chat"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-white/[0.12] text-zinc-300 text-sm font-medium hover:bg-white/[0.04] transition-colors"
        >
          Ask VISTA Aura what to cancel
        </Link>
      </motion.div>
    </div>
  );
}
