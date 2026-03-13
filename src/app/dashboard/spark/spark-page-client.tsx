"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Loader2, RefreshCw, ChevronRight, Flame } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";

type SparkResult = {
  serviceName: string;
  savingsAmount: number;
  savingsCurrency: string;
  oneLiner: string;
  chainReaction: string;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

async function fetchSpark(): Promise<SparkResult | null> {
  const res = await fetch("/api/spark", { method: "POST", credentials: "include" });
  const data = await res.json();
  if (!res.ok) return null;
  return {
    serviceName: data.serviceName ?? "—",
    savingsAmount: typeof data.savingsAmount === "number" ? data.savingsAmount : 0,
    savingsCurrency: data.savingsCurrency ?? "USD",
    oneLiner: data.oneLiner ?? "",
    chainReaction: data.chainReaction ?? "",
  };
}

export function SparkPageClient() {
  const [result, setResult] = useState<SparkResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSpark();
      setResult(data ?? null);
      if (!data) setError("Failed to get spark");
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
        <VistaProductVLogo product="spark" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Spark
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            One spark. Cancel one thing this week—savings and a chain reaction.
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
          One high-impact action: cancel one subscription this week. See the savings and how it can trigger more cancellations.
        </p>
        {loading && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <Loader2 size={18} className="animate-spin" />
            Finding your spark…
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
          <div className="rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-500/10 to-transparent p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-red-400" />
              <span className="text-sm font-medium text-red-300">This week</span>
            </div>
            <p className="text-zinc-100 text-lg font-medium">{result.oneLiner}</p>
            {result.serviceName !== "—" && result.savingsAmount > 0 && (
              <p className="text-red-300 text-sm mt-2">
                {result.serviceName} → {formatMoney(result.savingsAmount, result.savingsCurrency)}/mo savings
              </p>
            )}
          </div>

          {result.chainReaction && (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={18} className="text-amber-400" />
                <span className="text-sm font-medium text-amber-300">Chain reaction</span>
              </div>
              <p className="text-zinc-200 text-sm leading-relaxed">{result.chainReaction}</p>
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
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 font-medium text-sm hover:bg-red-500/30 transition-colors"
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
