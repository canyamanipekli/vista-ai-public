"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, AlertTriangle, Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";

type OracleResult = {
  prediction: string;
  riskAlert: string;
  topTrials: { name: string; reason: string }[];
};

async function fetchOracle(): Promise<OracleResult | null> {
  const res = await fetch("/api/oracle", { method: "POST", credentials: "include" });
  const data = await res.json();
  if (!res.ok) return null;
  return {
    prediction: data.prediction ?? "",
    riskAlert: data.riskAlert ?? "",
    topTrials: Array.isArray(data.topTrials) ? data.topTrials : [],
  };
}

export function OraclePageClient() {
  const [result, setResult] = useState<OracleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOracle();
      setResult(data ?? null);
      if (!data) setError("Failed to load prophecy");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
        <VistaProductVLogo product="oracle" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Oracle
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Prophecy and decision. Predictions and risk alerts from your subscription habits.
          </p>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
      >
        <p className="text-zinc-500 text-sm leading-relaxed mb-4">
          Based on your habits, the Oracle predicts how your subscription life will unfold and flags the riskiest trials you might forget to cancel.
        </p>
        {loading && (
          <div className="flex items-center gap-2 text-violet-400 text-sm">
            <Loader2 size={18} className="animate-spin" />
            Asking the Oracle…
          </div>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 mb-6 text-red-200 text-sm"
        >
          {error}
        </motion.div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-transparent p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={18} className="text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Prediction</span>
            </div>
            <p className="text-zinc-100 text-sm leading-relaxed">{result.prediction}</p>
          </div>

          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Risk alert</span>
            </div>
            <p className="text-zinc-100 text-sm leading-relaxed">{result.riskAlert}</p>
          </div>

          {result.topTrials.length > 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Top 3 riskiest trials</h3>
              <ul className="space-y-3">
                {result.topTrials.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.06] px-3 py-2"
                  >
                    <span className="text-violet-400 font-medium shrink-0">{t.name}</span>
                    <span className="text-zinc-400 text-sm">{t.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.12] text-zinc-300 text-sm hover:bg-white/[0.04] disabled:opacity-60"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <Link
              href="/chat"
              prefetch={false}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-200 font-medium text-sm hover:bg-violet-500/30 transition-colors"
            >
              Discuss with VISTA Aura
              <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <Link
          href="/dashboard"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-white/[0.08] text-zinc-400 text-sm hover:bg-white/[0.04] transition-colors"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
