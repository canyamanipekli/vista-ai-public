"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Loader2, Sparkles } from "lucide-react";
import { VistaVirtualCard } from "@/components/virtual-card/VistaVirtualCard";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";

interface VirtualCardPageClientProps {
  userName: string | null;
  userEmail: string;
}

type CardInsight = { tip?: string; status?: string };

export function VirtualCardPageClient({ userName, userEmail }: VirtualCardPageClientProps) {
  const [insight, setInsight] = useState<CardInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "virtual-card" }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setInsight({ tip: data.tip, status: data.status });
      } catch {
        if (!cancelled) setInsight(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => { cancelled = true; };
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

      {/* Page header: V logo + VISTA Virtual Card — same fonts as rest of app */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-10"
      >
        <VistaProductVLogo product="virtual-card" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Virtual Card
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Your personal card — secure and unique to your account.
          </p>
        </div>
      </motion.header>

      <div className="flex flex-col items-center gap-8">
        <VistaVirtualCard userName={userName} userEmail={userEmail} />

        {insightLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 flex items-center gap-2 text-violet-400 text-sm">
            <Loader2 size={18} className="animate-spin" />
            AI checking your subscription payment health…
          </motion.div>
        )}
        {!insightLoading && insight && (insight.tip || insight.status) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-2xl border border-violet-500/25 bg-violet-500/10 p-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-violet-300">
              <Sparkles size={18} />
              <span className="text-sm font-medium">AI insight</span>
            </div>
            {insight.status && <p className="text-sm text-zinc-200 leading-relaxed">{insight.status}</p>}
            {insight.tip && <p className="text-sm text-violet-200/90">{insight.tip}</p>}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-zinc-400">
            <Shield size={18} />
            <span className="text-sm font-medium">VISTA Brand Security</span>
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed font-sans">
            This virtual card is issued under the VISTA brand and is uniquely linked to your identity.
            Use it for trials and subscriptions to keep your main card safe.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
