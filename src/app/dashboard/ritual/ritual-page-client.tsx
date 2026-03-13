"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Flame, DollarSign, AlertTriangle, Ghost, Target, Loader2, Sparkles } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";

interface RitualPageClientProps {
  overview: { totalMonthly: number; potentialSavings: number; subscriptionCount: number } | null;
  insights: { title: string; description: string; type: string }[];
  ghostSubscriptions: string[];
  priceHikes: { provider: string; amount: number; increase: number }[];
}

type RitualInsight = { focus?: string; oneLiner?: string };

const STEPS = [
  { id: 1, title: "This month's spend", icon: DollarSign },
  { id: 2, title: "Surprises", icon: AlertTriangle },
  { id: 3, title: "What can go", icon: Ghost },
  { id: 4, title: "Set your intention", icon: Target },
  { id: 5, title: "Ritual complete", icon: Check },
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function RitualPageClient({
  overview,
  insights,
  ghostSubscriptions,
  priceHikes,
}: RitualPageClientProps) {
  const [step, setStep] = useState(1);
  const [intention, setIntention] = useState("");
  const [insight, setInsight] = useState<RitualInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "ritual" }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setInsight({ focus: data.focus, oneLiner: data.oneLiner });
      } catch {
        if (!cancelled) setInsight(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const totalMonthly = overview?.totalMonthly ?? 0;
  const potentialSavings = overview?.potentialSavings ?? 0;
  const hasData = totalMonthly > 0 || insights.length > 0 || ghostSubscriptions.length > 0;

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
        <VistaProductVLogo product="ritual" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Ritual
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Your 5-minute monthly subscription ritual. Let's go through this month together.
          </p>
        </div>
      </motion.header>

      {insightLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 flex items-center gap-2 text-amber-400 text-sm">
          <Loader2 size={18} className="animate-spin" />
          AI preparing your ritual…
        </motion.div>
      )}
      {!insightLoading && insight && (insight.focus || insight.oneLiner) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-amber-400" />
            <span className="text-sm font-medium text-amber-300">AI ritual</span>
          </div>
          {insight.focus && <p className="text-zinc-200 text-sm leading-relaxed">{insight.focus}</p>}
          {insight.oneLiner && <p className="text-amber-200/90 text-sm mt-2 font-medium">{insight.oneLiner}</p>}
        </motion.div>
      )}

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              step === s.id
                ? "bg-amber-500/25 border border-amber-500/40 text-amber-200"
                : "border border-white/[0.06] text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <s.icon size={14} />
            {s.id}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
          >
            <h2 className="text-sm font-medium text-zinc-300 mb-3">This month's spend</h2>
            {hasData ? (
              <>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {formatCurrency(totalMonthly)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">/ month across {overview?.subscriptionCount ?? 0} subscriptions</p>
              </>
            ) : (
              <p className="text-zinc-500 text-sm">Connect Gmail to see your real numbers.</p>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
          >
            <h2 className="text-sm font-medium text-zinc-300 mb-3">Surprises</h2>
            {priceHikes.length > 0 ? (
              <ul className="space-y-2">
                {priceHikes.slice(0, 5).map((h, i) => (
                  <li key={i} className="text-sm text-zinc-300">
                    {h.provider}: +{formatCurrency(h.increase)}
                  </li>
                ))}
              </ul>
            ) : insights.length > 0 ? (
              <ul className="space-y-2">
                {insights.slice(0, 3).map((i, idx) => (
                  <li key={idx} className="text-sm text-zinc-300">
                    <span className="font-medium">{i.title}</span> — {i.description.slice(0, 80)}…
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 text-sm">No big surprises this month.</p>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
          >
            <h2 className="text-sm font-medium text-zinc-300 mb-3">What can go</h2>
            {ghostSubscriptions.length > 0 ? (
              <>
                <p className="text-zinc-400 text-sm mb-2">
                  {ghostSubscriptions.length} ghost subscription{ghostSubscriptions.length !== 1 ? "s" : ""} — you could save {formatCurrency(potentialSavings)}/mo.
                </p>
                <ul className="space-y-1">
                  {ghostSubscriptions.slice(0, 5).map((g) => (
                    <li key={g} className="text-sm text-zinc-300">
                      {g.replace(/^www\./, "")}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-zinc-500 text-sm">Nothing obvious to cut right now.</p>
            )}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
          >
            <h2 className="text-sm font-medium text-zinc-300 mb-3">Set your intention for next month</h2>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="e.g. Cancel one ghost subscription, or keep total under $80"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500/30 focus:outline-none"
              rows={3}
            />
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 mb-6 text-center"
          >
            <Check size={40} className="text-amber-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-zinc-100">Ritual complete</h2>
            <p className="text-sm text-zinc-500 mt-1">See you next month.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-white/[0.12] text-zinc-400 text-sm font-medium disabled:opacity-40 disabled:pointer-events-none hover:bg-white/[0.04]"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-sm font-medium hover:bg-amber-500/30"
          >
            Next
            <ArrowRight size={16} />
          </button>
        ) : (
          <Link
            href="/dashboard"
            prefetch={false}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-sm font-medium hover:bg-amber-500/30"
          >
            Done
          </Link>
        )}
      </div>
    </div>
  );
}
