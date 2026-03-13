"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Loader2, Sparkles } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";

interface ShadowPageClientProps {
  totalMonthly: number;
  potentialSavings: number;
}

type ShadowInsight = { narrative?: string; gap?: string };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ShadowPageClient({
  totalMonthly,
  potentialSavings,
}: ShadowPageClientProps) {
  const [insight, setInsight] = useState<ShadowInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "shadow" }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setInsight({ narrative: data.narrative, gap: data.gap });
      } catch {
        if (!cancelled) setInsight(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const displayMonthly = totalMonthly > 0 ? totalMonthly : 84;
  const hasData = totalMonthly > 0;
  const gapYearly = displayMonthly * 12;

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
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-10"
      >
        <VistaProductVLogo product="shadow" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Shadow
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            The version of you that never subscribed. Minimal alter ego.
          </p>
        </div>
      </motion.header>

      {!hasData && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-zinc-500 mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          Connect Gmail to see your real gap. Below is an example.
        </motion.p>
      )}

      {/* Shadow vs You */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
            Your shadow
          </p>
          <p className="text-2xl font-bold text-zinc-100 tabular-nums">
            $0
          </p>
          <p className="text-xs text-zinc-500 mt-1">/ month</p>
        </div>
        <div className="rounded-2xl border border-white/[0.12] bg-white/[0.03] p-6 text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
            You
          </p>
          <p className="text-2xl font-bold text-violet-200 tabular-nums">
            {formatCurrency(displayMonthly)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">/ month</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-center gap-2 text-zinc-500 mb-8"
      >
        <Minus size={16} />
        <span className="text-sm">The gap</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-6 mb-8 text-center"
      >
        <p className="text-zinc-400 text-sm mb-1">Your shadow is $0. You spend</p>
        <p className="text-2xl font-bold text-zinc-100 tabular-nums">
          {formatCurrency(gapYearly)}
        </p>
        <p className="text-zinc-500 text-sm mt-1">per year. Close the gap.</p>
      </motion.div>

      {insightLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 size={18} className="animate-spin" />
          AI reading your shadow…
        </motion.div>
      )}
      {!insightLoading && insight && (insight.narrative || insight.gap) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-500/25 bg-slate-500/10 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-300">AI insight</span>
          </div>
          {insight.narrative && <p className="text-zinc-200 text-sm leading-relaxed">{insight.narrative}</p>}
          {insight.gap && <p className="text-slate-200/90 text-sm mt-2 font-medium">{insight.gap}</p>}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-8"
      >
        <p className="text-zinc-500 text-sm leading-relaxed">
          VISTA Shadow is the you with zero subscription spend. Every dollar you cut gets you closer to your shadow.
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
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-200 font-medium text-sm hover:bg-violet-500/30 transition-colors"
        >
          Close the gap
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
