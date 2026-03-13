"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Loader2, Sparkles } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";
import { computeMirror } from "@/lib/mirror-utils";

interface MirrorPageClientProps {
  totalMonthly: number;
  potentialSavings: number;
  subscriptionCount: number;
}

type MirrorInsight = { comparison?: string; oneLiner?: string };

export function MirrorPageClient({
  totalMonthly,
  potentialSavings,
  subscriptionCount,
}: MirrorPageClientProps) {
  const [insight, setInsight] = useState<MirrorInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "mirror" }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setInsight({ comparison: data.comparison, oneLiner: data.oneLiner });
      } catch {
        if (!cancelled) setInsight(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const result = computeMirror({
    totalMonthly,
    potentialSavings,
    subscriptionCount,
  });

  const hasData = totalMonthly > 0 || subscriptionCount > 0;

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
        <VistaProductVLogo product="mirror" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Mirror
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Your subscription mirror. How you compare to similar users.
          </p>
        </div>
      </motion.header>

      {!hasData && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-zinc-500 mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          Connect Gmail to see your real comparison. The mirror uses anonymized benchmarks.
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-cyan-500/5 via-violet-500/5 to-transparent p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Users size={18} className="text-cyan-400/80" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {result.tierLabel}
          </span>
        </div>
        <p className="text-zinc-200 text-sm leading-relaxed">
          {result.comparisonMessage}
        </p>
        {result.secondaryMessage && (
          <p className="text-zinc-500 text-sm mt-3">{result.secondaryMessage}</p>
        )}
      </motion.div>

      {insightLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 flex items-center gap-2 text-cyan-400 text-sm">
          <Loader2 size={18} className="animate-spin" />
          AI comparing you to similar users…
        </motion.div>
      )}
      {!insightLoading && insight && (insight.comparison || insight.oneLiner) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">AI insight</span>
          </div>
          {insight.comparison && <p className="text-zinc-200 text-sm leading-relaxed">{insight.comparison}</p>}
          {insight.oneLiner && <p className="text-cyan-200/90 text-sm mt-2 font-medium">{insight.oneLiner}</p>}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-8"
      >
        <p className="text-zinc-500 text-sm leading-relaxed">
          VISTA Mirror uses anonymized, aggregated benchmarks — not your personal data — so you can see where you stand. No one else sees your numbers.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <Link
          href="/dashboard"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-200 font-medium text-sm hover:bg-violet-500/30 transition-colors"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
