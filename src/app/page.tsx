"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, Shield, Sparkles, Zap, ShieldCheck, ExternalLink, BarChart3 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AuthButtons } from "@/components/auth-buttons";
import { NavAuth } from "@/components/nav-auth";
import { MouseAuraBackground } from "@/components/MouseAuraBackground";
import { VistaProductVLogo, type VistaProduct } from "@/components/VistaProductVLogo";

const PRODUCT_SUITE: { product: VistaProduct; name: string; tagline: string; href: string }[] = [
  { product: "aura", name: "VISTA Aura", tagline: "Your AI financial guardian. Chat, ask, and act on subscriptions in natural language.", href: "/chat" },
  { product: "virtual-card", name: "VISTA Virtual Card", tagline: "One secure, unique virtual card for all your subscriptions. No more real cards exposed.", href: "/dashboard" },
  { product: "time-machine", name: "VISTA Time Machine", tagline: "See your subscription future. Change nothing vs optimize—1, 5, or 10 years ahead.", href: "/dashboard/time-machine" },
  { product: "mirror", name: "VISTA Mirror", tagline: "Compare with people like you. See how your subscription stack measures up.", href: "/dashboard/mirror" },
  { product: "shadow", name: "VISTA Shadow", tagline: "The you that never subscribed. Close the gap between you and your shadow self.", href: "/dashboard/shadow" },
  { product: "ghost", name: "VISTA Ghost", tagline: "Hunt ghost subscriptions. Levels, badges, and a clear path to zero waste.", href: "/dashboard/ghost" },
  { product: "ritual", name: "VISTA Ritual", tagline: "A 5-minute monthly subscription ritual. Review, trim, and stay in control.", href: "/dashboard/ritual" },
  { product: "zero", name: "VISTA Zero", tagline: "Your path to zero wasted spend. Milestones, progress, and real savings.", href: "/dashboard/zero" },
  { product: "weather", name: "VISTA Weather", tagline: "Subscription weather at a glance. Sunny, storm, or fog—know your financial climate.", href: "/dashboard/weather" },
  { product: "garden", name: "VISTA Garden", tagline: "Subscriptions as plants. Water the ones that matter, uproot the rest.", href: "/dashboard/garden" },
  { product: "canvas", name: "VISTA Canvas", tagline: "Your subscription life as a painting. Brushstrokes, erase, and share your story.", href: "/dashboard/canvas" },
  { product: "oracle", name: "VISTA Oracle", tagline: "Prophecy and decision. Predict new subscriptions, get risk alerts on trials you might forget to cancel.", href: "/dashboard/oracle" },
  { product: "compass", name: "VISTA Compass", tagline: "Your financial north. One clear move: cancel, negotiate, or keep—no clutter.", href: "/dashboard/compass" },
  { product: "spark", name: "VISTA Spark", tagline: "One spark. Cancel one thing this week—savings and a chain reaction that triggers more.", href: "/dashboard/spark" },
];

const HOW_IT_WORKS = [
  { step: 1, icon: Shield, title: "Connect Securely", desc: "Link your inbox with read-only access. We never store or sell your data." },
  { step: 2, icon: Sparkles, title: "AI Audit", desc: "Our engine scans invoices, trials, and subscriptions to surface hidden costs." },
  { step: 3, icon: Zap, title: "One-Click Optimization", desc: "Cancel, switch plans, or claim refunds—guided by your AI financial guard." },
];

const WHY_VISTA = [
  {
    icon: ShieldCheck,
    title: "Proactive Security",
    desc: "We don't just track; we guard. AI-driven anomaly detection for your peace of mind.",
  },
  {
    icon: ExternalLink,
    title: "One-Click Freedom",
    desc: "Redirect directly to cancellation pages. No more searching for hidden buttons.",
  },
  {
    icon: BarChart3,
    title: "Financial Clarity",
    desc: "Beautifully visualized data that tells you exactly where your money goes.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-violet-500/30 font-sans antialiased">
      {/* Interactive violet/indigo gradient – reacts to mouse */}
      <MouseAuraBackground />

      <nav className="sticky top-0 z-50 p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/[0.06] backdrop-blur-xl bg-[#050505]/85">
        <Link href="/" prefetch={false} className="flex items-center gap-2">
          <Logo size={28} showWordmark />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/chat" className="text-sm font-medium text-zinc-400 hover:text-violet-300 transition-colors">
            VISTA Aura
          </Link>
          <a href="#products" className="text-sm font-medium text-zinc-400 hover:text-violet-300 transition-colors">
            Products
          </a>
          <a href="#how" className="text-sm font-medium text-zinc-400 hover:text-violet-300 transition-colors">
            How it works
          </a>
          <NavAuth />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <Logo size={56} showWordmark />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex rounded-full h-2 w-2 bg-violet-500 animate-pulse" />
          </span>
          <span>Autonomous Financial Guardian 2026</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-black tracking-tight leading-[0.95] mb-6 bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-500 bg-clip-text text-transparent"
        >
          Stop the Financial Drift. Hire the World&apos;s First Autonomous CFO.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-medium"
        >
          VISTA AI scans your digital footprint, detects hidden price hikes, and executes savings in one click.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse" />
            </span>
            2,491 Subscriptions Cancelled Today
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium">
            <Lock size={14} />
            Military-Grade Subscription Shield
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AuthButtons />
        </motion.div>

        <section id="how" className="mt-32 text-left">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-zinc-100 mb-8 text-center"
          >
            How it Works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-10 rounded-3xl bg-zinc-900/50 border border-white/[0.06] backdrop-blur-sm hover:border-violet-500/20 transition-colors group"
              >
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                  Step {item.step}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mt-3 mb-6 group-hover:bg-violet-500/20 transition-colors border border-violet-500/20">
                  <item.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight text-zinc-100">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="why" className="mt-32 text-left">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-zinc-100 mb-4 text-center"
          >
            Why VISTA?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-zinc-500 text-center text-sm mb-10 max-w-xl mx-auto"
          >
            Elite-grade financial guard for your digital life.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-6">
            {WHY_VISTA.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.06] backdrop-blur-sm hover:border-violet-500/25 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center mb-5 border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors">
                  <item.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 tracking-tight text-zinc-100">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="products" className="mt-32 text-left">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-zinc-100 mb-2 text-center"
          >
            The Full VISTA Suite
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-zinc-500 text-center text-sm mb-12 max-w-2xl mx-auto"
          >
            Every tool in your financial guard—from AI chat to dashboards, rituals, and beyond.
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {PRODUCT_SUITE.map((item, i) => (
              <motion.div
                key={item.product}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(0.06 * i, 0.5) }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Link
                  href={item.href}
                  className="block p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.06] backdrop-blur-sm hover:border-white/[0.12] transition-all group h-full"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <VistaProductVLogo product={item.product} size={36} />
                    <h3 className="text-lg font-bold tracking-tight text-zinc-100 group-hover:text-zinc-50">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {item.tagline}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-violet-400 group-hover:text-violet-300">
                    Explore
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/[0.06] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-3 text-center">
          <span className="inline-flex items-center gap-2 text-zinc-500 text-sm font-medium">
            <Lock size={14} className="text-violet-500/80 shrink-0" />
            VISTA-1 Pro never stores your emails. We only process transactional metadata for your financial guard.
          </span>
          <span className="text-zinc-600 text-sm">© 2026 VISTA AI</span>
        </div>
      </footer>
    </div>
  );
}
