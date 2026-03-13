"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";

export function LockedSavingsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden"
    >
      <div className="absolute inset-0 backdrop-blur-md bg-[#050505]/60 z-10 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-4 border border-violet-500/30">
          <Lock size={24} className="text-violet-400" />
        </div>
        <p className="text-sm font-semibold text-zinc-300 text-center mb-1">
          VISTA-1 Pro found a $45/year saving opportunity.
        </p>
        <p className="text-xs text-zinc-500 text-center mb-5">Unlock Pro to see it.</p>
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-amber-500/80 text-zinc-100 text-sm font-semibold hover:from-violet-400 hover:to-amber-400/90 transition-all"
        >
          <Sparkles size={14} />
          Upgrade to Pro
        </Link>
      </div>
      <div className="pointer-events-none select-none blur-sm opacity-70">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Sparkles size={18} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Special Savings Insight</h3>
        </div>
        <div className="p-6 space-y-3">
          <div className="h-4 w-3/4 rounded bg-zinc-700/50" />
          <div className="h-4 w-1/2 rounded bg-zinc-700/30" />
          <div className="h-4 w-2/3 rounded bg-zinc-700/30" />
        </div>
      </div>
    </motion.div>
  );
}
