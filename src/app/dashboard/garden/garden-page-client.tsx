"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Droplets, Leaf, Trash2, Loader2, Sparkles } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";

interface Plant {
  name: string;
  amount: number;
  isGhost: boolean;
  domain: string;
}

interface GardenPageClientProps {
  plants: Plant[];
  healthPct: number;
}

type GardenInsight = { summary?: string; water?: string[]; uproot?: string[] };

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function GardenPageClient({ plants, healthPct }: GardenPageClientProps) {
  const [insight, setInsight] = useState<GardenInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "garden" }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setInsight({ summary: data.summary, water: data.water, uproot: data.uproot });
      } catch {
        if (!cancelled) setInsight(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const healthyCount = plants.filter((p) => !p.isGhost).length;
  const ghostCount = plants.filter((p) => p.isGhost).length;

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
        <VistaProductVLogo product="garden" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Garden
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Every subscription is a plant. Pay = water. Cancel = uproot.
          </p>
        </div>
      </motion.header>

      {/* Garden health */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 mb-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Leaf size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">Garden health</p>
              <p className="text-2xl font-bold text-emerald-300">{healthPct}%</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 text-right">
            {healthyCount} watered, {ghostCount} wilted
          </p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${healthPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-emerald-500"
          />
        </div>
      </motion.div>

      {insightLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 flex items-center gap-2 text-emerald-400 text-sm">
          <Loader2 size={18} className="animate-spin" />
          AI tending your garden…
        </motion.div>
      )}
      {!insightLoading && insight && (insight.summary || (insight.water && insight.water.length > 0) || (insight.uproot && insight.uproot.length > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">AI insight</span>
          </div>
          {insight.summary && <p className="text-zinc-200 text-sm leading-relaxed">{insight.summary}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {insight.water && insight.water.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">
                <Droplets size={12} /> Water: {insight.water.slice(0, 5).join(", ")}
              </span>
            )}
            {insight.uproot && insight.uproot.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-2 py-1 text-xs text-red-200">
                <Trash2 size={12} /> Uproot: {insight.uproot.slice(0, 5).join(", ")}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Plants grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
      >
        <h3 className="text-sm font-medium text-zinc-300 mb-4">Your garden</h3>
        {plants.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            No plants yet. Connect Gmail to see your subscriptions as plants.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plants.map((p, i) => (
              <motion.div
                key={p.domain}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${
                  p.isGhost
                    ? "border-zinc-600/50 bg-zinc-800/30 opacity-80"
                    : "border-emerald-500/20 bg-emerald-500/5"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {p.isGhost ? (
                    <Leaf size={20} className="text-zinc-500 shrink-0" />
                  ) : (
                    <Droplets size={20} className="text-emerald-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-200 truncate capitalize">
                      {p.name.replace(/^www\.|\.(com|io|co)$/gi, "")}
                    </p>
                    <p className="text-xs text-zinc-500">{formatCurrency(p.amount)}/mo</p>
                  </div>
                </div>
                {p.isGhost && (
                  <Link
                    href="/chat"
                    prefetch={false}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-zinc-500/50 px-2 py-1 text-xs text-zinc-400 hover:text-red-300 hover:border-red-500/30 transition-colors"
                  >
                    <Trash2 size={12} />
                    Uproot
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 mb-6"
      >
        <p className="text-zinc-500 text-sm leading-relaxed">
          Watered = you're paying and we see recent activity. Wilted = ghost or inactive — uproot to cancel and free the soil for what matters.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <Link
          href="/chat"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 font-medium text-sm hover:bg-emerald-500/30 transition-colors"
        >
          Ask VISTA Aura to help uproot
        </Link>
      </motion.div>
    </div>
  );
}
