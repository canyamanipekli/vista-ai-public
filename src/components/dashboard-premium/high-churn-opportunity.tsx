"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, MessageCircle } from "lucide-react";
import type { HighChurnService } from "@/app/dashboard/prepare-dashboard-data";

interface HighChurnOpportunityProps {
  services: HighChurnService[];
}

export function HighChurnOpportunity({ services }: HighChurnOpportunityProps) {
  if (services.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-violet-500/10 flex items-center gap-2">
        <MessageCircle size={18} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-zinc-100">High-Churn Opportunity</h3>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-zinc-400">
          Multiple &quot;We miss you&quot; / &quot;Special offer&quot; emails detected. LMM-powered sentiment suggests these services want you back.
        </p>
        {services.map((s, i) => (
          <motion.div
            key={s.domain}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-start justify-between gap-3 py-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
          >
            <div>
              <p className="text-sm font-medium text-zinc-200">{s.displayName}</p>
              <p className="text-[11px] text-violet-400/90 mt-0.5">{s.suggestion}</p>
            </div>
            <Link
              href="/billing"
              className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-semibold hover:bg-violet-500/30 transition-colors"
            >
              <Sparkles size={10} />
              VISTA Pro
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
