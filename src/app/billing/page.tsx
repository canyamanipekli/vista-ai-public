"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, ArrowLeft } from "lucide-react";
import { VistaProLogo } from "@/components/VistaProLogo";

const FEATURES = [
  "Subscription audit & cancellation URLs",
  "VISTA Health Score",
  "Price hike & ghost detection",
  "Military-Grade Subscription Shield",
  "Email draft (Formal Cancellation Request)",
  "Contract Negotiator (loyalty discount drafts)",
  "Virtual card for free trials (simulated)",
  "Special Savings Insights",
  "Family plan optimization",
  "Priority support",
];

export default function BillingPage() {
  const [mounted, setMounted] = useState(false);
  const [tickerCount, setTickerCount] = useState(84);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    const t = setInterval(() => {
      setTickerCount((c) => (c + Math.floor(Math.random() * 3) + 1) % 120 + 70);
    }, 60000);
    return () => clearInterval(t);
  }, [mounted]);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 14);
  const formatEnd = endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-violet-500/30 font-sans antialiased">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 30%, rgba(88, 28, 135, 0.4), transparent 50%),
              radial-gradient(ellipse 60% 80% at 80% 70%, rgba(234, 179, 8, 0.08), transparent 50%)
            `,
          }}
        />
      </div>

      <nav className="sticky top-0 z-50 p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/[0.06] backdrop-blur-xl bg-[#050505]/90">
        <Link href="/dashboard" prefetch={false} className="flex items-center gap-2 text-zinc-400 hover:text-violet-300 transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
        <VistaProLogo size={28} showWordmark />
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {mounted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-zinc-500 mb-4"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {tickerCount} Users Upgraded to Pro in the last hour
            </span>
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-3">Choose VISTA Pro</h1>
          <p className="text-zinc-500 text-lg">Elite financial guard. One plan.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-8 flex flex-col"
          >
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Monthly</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-zinc-100">100</span>
              <span className="text-zinc-500">TL</span>
              <span className="text-zinc-600 text-sm ml-1">/ month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {FEATURES.slice(0, 5).map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check size={16} className="text-violet-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="w-full py-3.5 rounded-xl border border-white/20 text-zinc-300 font-semibold hover:bg-white/5 transition-colors"
            >
              Continue with Monthly
            </button>
          </motion.div>

          {/* Annual — Pro card with glow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-3xl border-2 border-violet-500/40 bg-white/[0.03] backdrop-blur-xl p-8 flex flex-col overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                boxShadow: "0 0 60px -12px rgba(139, 92, 246, 0.35), 0 0 80px -20px rgba(234, 179, 8, 0.1)",
              }}
              animate={{
                boxShadow: [
                  "0 0 60px -12px rgba(139, 92, 246, 0.35), 0 0 80px -20px rgba(234, 179, 8, 0.1)",
                  "0 0 80px -8px rgba(139, 92, 246, 0.45), 0 0 100px -15px rgba(234, 179, 8, 0.15)",
                  "0 0 60px -12px rgba(139, 92, 246, 0.35), 0 0 80px -20px rgba(234, 179, 8, 0.1)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-4 border border-amber-500/30">
                Save 240 TL
              </span>
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Annual</p>
              <p className="text-xs text-amber-400/90 mb-2">Launch Special: 20% Off Pro</p>
              {mounted && (
                <p className="text-[10px] text-zinc-500 mb-4">Offer ends {formatEnd}</p>
              )}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-zinc-100">960</span>
                <span className="text-zinc-500">TL</span>
                <span className="text-zinc-600 text-sm ml-1">/ year</span>
              </div>
              <p className="text-xs text-zinc-500 mb-6">Effectively 80 TL/month</p>
              <ul className="space-y-3 mb-8 flex-1">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check size={16} className="text-violet-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                prefetch={false}
                className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-amber-500/80 text-zinc-100 font-semibold text-center hover:from-violet-400 hover:to-amber-400/90 transition-all shadow-lg shadow-violet-500/20"
              >
                Get Pro — Best Value
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden mb-20"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Feature</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400 text-center">Free</th>
                  <th className="px-6 py-4 text-sm font-semibold text-violet-400 text-center">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Subscription audit",
                  "Cancellation URLs",
                  "VISTA Health Score",
                  "Price hike detection",
                  "Ghost subscription detection",
                  "Email drafts (cancellation)",
                  "Contract Negotiator",
                  "Virtual card (trials)",
                  "Special Savings Insights",
                  "Family plan optimization",
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-6 py-3 text-sm text-zinc-300">{row}</td>
                    <td className="px-6 py-3 text-center">
                      {i < 5 ? <Check size={18} className="inline text-violet-400" /> : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Check size={18} className="inline text-violet-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      <footer className="py-8 border-t border-white/[0.06] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-2 text-center">
          <span className="inline-flex items-center gap-2 text-zinc-500 text-sm">
            <Lock size={14} className="text-violet-500/80 shrink-0" />
            VISTA-1 Pro never stores your emails. We only process transactional metadata for your financial guard.
          </span>
          <span className="text-zinc-600 text-xs">© 2026 VISTA AI</span>
        </div>
      </footer>
    </div>
  );
}
