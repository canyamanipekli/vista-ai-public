"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Check, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";

interface ZeroPageClientProps {
  totalMonthly: number;
  potentialSavings: number;
}

type ZeroInsight = { message?: string; nextStep?: string };

const MILESTONES = [
  { pct: 25, label: "First steps", description: "25% waste eliminated" },
  { pct: 50, label: "Halfway there", description: "50% waste eliminated" },
  { pct: 75, label: "Almost zero", description: "75% waste eliminated" },
  { pct: 100, label: "Zero", description: "No wasted spend" },
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function ZeroPageClient({
  totalMonthly,
  potentialSavings,
}: ZeroPageClientProps) {
  const [insight, setInsight] = useState<ZeroInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "zero" }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setInsight({ message: data.message, nextStep: data.nextStep });
      } catch {
        if (!cancelled) setInsight(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const hasData = totalMonthly > 0 || potentialSavings > 0;
  const total = totalMonthly > 0 ? totalMonthly : 100;
  const waste = potentialSavings >= 0 ? potentialSavings : 30;
  const optimized = Math.max(0, total - waste);
  const progressPct = total > 0 ? Math.round((optimized / total) * 100) : 0;
  const nextMilestone = MILESTONES.find((m) => m.pct > progressPct) ?? MILESTONES[MILESTONES.length - 1];
  const pctToNext = nextMilestone.pct - progressPct;

  return (
    <div className="max-w-2xl mx-auto font-sans antialiased">
      <Link
        href="/dashboard"
        prefetch={false}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <VistaProductVLogo product="zero" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Zero
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Path to zero. Zero wasted subscription spend. Game-like progress.
          </p>
        </div>
      </motion.header>

      {!hasData && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-zinc-500 mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          Connect Gmail to see your real progress. Below is an example.
        </motion.p>
      )}

      {/* Big progress */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-violet-500/5 to-transparent p-6 mb-6"
      >
        <p className="text-sm text-zinc-400 mb-2">You're at</p>
        <p className="text-4xl font-bold text-emerald-300 tabular-nums">
          {progressPct}%
        </p>
        <p className="text-sm text-zinc-500 mt-1">to zero (waste eliminated)</p>
        <div className="mt-4 h-3 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
          />
        </div>
      </motion.div>

      {insightLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 flex items-center gap-2 text-emerald-400 text-sm">
          <Loader2 size={18} className="animate-spin" />
          AI mapping your path to zero…
        </motion.div>
      )}
      {!insightLoading && insight && (insight.message || insight.nextStep) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">AI insight</span>
          </div>
          {insight.message && <p className="text-zinc-200 text-sm leading-relaxed">{insight.message}</p>}
          {insight.nextStep && <p className="text-emerald-200/90 text-sm mt-2 font-medium">Next: {insight.nextStep}</p>}
        </motion.div>
      )}

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-emerald-400" />
          <span className="text-sm font-medium text-zinc-300">Milestones</span>
        </div>
        <ul className="space-y-3">
          {MILESTONES.map((m) => {
            const reached = progressPct >= m.pct;
            return (
              <li
                key={m.pct}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                  reached
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-white/[0.06]"
                }`}
              >
                {reached ? (
                  <Check size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-[18px] h-[18px] rounded-full border border-zinc-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${reached ? "text-emerald-200" : "text-zinc-400"}`}>
                    {m.label}
                  </p>
                  <p className="text-xs text-zinc-500">{m.description}</p>
                </div>
                {!reached && m.pct === nextMilestone.pct && (
                  <span className="text-xs text-emerald-400 shrink-0">
                    {pctToNext}% to go
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </motion.div>

      {/* What zero means */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
      >
        <p className="text-zinc-500 text-sm leading-relaxed">
          "Zero" means no wasted subscription spend — every dollar you pay is for something you use. Your path: cancel ghosts, cut redundancies, and watch this bar fill up.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3"
      >
        <Link
          href="/dashboard"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 font-medium text-sm hover:bg-emerald-500/30 transition-colors"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/chat"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-white/[0.12] text-zinc-300 text-sm font-medium hover:bg-white/[0.04] transition-colors"
        >
          Ask VISTA Aura how to get closer to zero
          <ChevronRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}
