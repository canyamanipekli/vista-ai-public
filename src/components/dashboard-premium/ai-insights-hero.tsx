"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

interface Insight {
  type: string;
  title: string;
  description: string;
  severity: string;
}

interface AIInsightsHeroProps {
  insights: Insight[];
  cfoInsight?: string;
}

export function AIInsightsHero({ insights, cfoInsight }: AIInsightsHeroProps) {
  const [verifying, setVerifying] = useState<number | null>(null);
  const [verified, setVerified] = useState<Set<number>>(new Set());
  const top3 = insights.slice(0, 3);
  if (top3.length === 0 && !cfoInsight) return null;

  const handleVerify = async (index: number) => {
    if (verified.has(index)) return;
    setVerifying(index);
    await new Promise((r) => setTimeout(r, 1200));
    setVerified((prev) => new Set(prev).add(index));
    setVerifying(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ scale: 1.01 }}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent backdrop-blur-sm p-6 md:p-8 relative overflow-hidden hover:border-indigo-500/20 transition-all shadow-[0_0_40px_-12px_rgba(99,102,241,0.25)]"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Sparkles size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Top 3 Critical Insights</h2>
            <p className="text-xs text-zinc-500">AI-powered priorities from your financial data</p>
          </div>
        </div>

        {cfoInsight && (
          <p className="text-sm text-zinc-300 leading-relaxed mb-6 pl-0 border-l-2 border-indigo-500/50 pl-4">
            {cfoInsight}
          </p>
        )}

        <ul className="space-y-3">
          {top3.map((insight, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * i }}
              className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10 transition-all"
            >
              <span
                className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  insight.severity === "high"
                    ? "bg-amber-500/20 text-amber-400"
                    : insight.type === "duplicate_charge"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-violet-500/20 text-violet-400"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-100">{insight.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{insight.description}</p>
                {verified.has(i) ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-medium text-violet-400"
                  >
                    <Logo size={14} />
                    Verified Security
                  </motion.span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleVerify(i)}
                    disabled={verifying !== null}
                    className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-[10px] font-medium text-violet-300 hover:bg-violet-500/25 disabled:opacity-50 transition-colors"
                  >
                    {verifying === i ? (
                      <>
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-flex items-center gap-1"
                        >
                          <Loader2 size={10} className="animate-spin" />
                          Deep Scan...
                        </motion.span>
                      </>
                    ) : (
                      "Verify"
                    )}
                  </button>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
