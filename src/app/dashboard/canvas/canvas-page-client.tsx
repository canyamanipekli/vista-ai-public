"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Eraser, Share2, Check, Loader2, Sparkles } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";

interface Stroke {
  name: string;
  amount: number;
  domain: string;
}

interface CanvasPageClientProps {
  strokes: Stroke[];
  totalValue: number;
}

type CanvasInsight = { story?: string };

const STROKE_COLORS = [
  "#8b5cf6",
  "#a78bfa",
  "#c084fc",
  "#e879f9",
  "#d946ef",
  "#a855f7",
  "#7c3aed",
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function CanvasPageClient({ strokes, totalValue }: CanvasPageClientProps) {
  const [copied, setCopied] = useState(false);
  const [insight, setInsight] = useState<CanvasInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "canvas" }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setInsight({ story: data.story });
      } catch {
        if (!cancelled) setInsight(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const shareCanvas = useCallback(() => {
    const summary = `VISTA Canvas — ${strokes.length} subscriptions, ${formatCurrency(totalValue)}/mo total.\n${strokes.map((s) => `• ${s.name}: ${formatCurrency(s.amount)}`).join("\n")}`;
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [strokes, totalValue]);

  const maxAmount = strokes.length > 0 ? Math.max(...strokes.map((s) => s.amount), 1) : 1;

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
        <VistaProductVLogo product="canvas" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Canvas
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Your subscription life as a painting. Each subscription a brushstroke. Erase what you don't need.
          </p>
        </div>
      </motion.header>

      {/* Canvas value */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-500/10 to-transparent p-6 mb-6"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Canvas value</p>
            <p className="text-2xl font-bold text-fuchsia-300 tabular-nums">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">/ month · {strokes.length} strokes</p>
          </div>
          <button
            type="button"
            onClick={shareCanvas}
            disabled={strokes.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? "Copied" : "Share canvas"}
          </button>
        </div>
      </motion.div>

      {insightLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 flex items-center gap-2 text-fuchsia-400 text-sm">
          <Loader2 size={18} className="animate-spin" />
          AI painting your story…
        </motion.div>
      )}
      {!insightLoading && insight && insight.story && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-fuchsia-400" />
            <span className="text-sm font-medium text-fuchsia-300">AI canvas</span>
          </div>
          <p className="text-zinc-200 text-sm leading-relaxed italic">{insight.story}</p>
        </motion.div>
      )}

      {/* Brushstrokes */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
      >
        <h3 className="text-sm font-medium text-zinc-300 mb-4">Brushstrokes</h3>
        {strokes.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            Connect Gmail to paint your subscription canvas.
          </p>
        ) : (
          <div className="space-y-3">
            {strokes.map((s, i) => (
              <motion.div
                key={s.domain}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * i }}
                className="group flex items-center gap-3"
              >
                <div
                  className="h-10 rounded-lg shrink-0 transition-opacity group-hover:opacity-90"
                  style={{
                    width: `${Math.max(12, (s.amount / maxAmount) * 120)}px`,
                    background: `linear-gradient(90deg, ${STROKE_COLORS[i % STROKE_COLORS.length]}, ${STROKE_COLORS[(i + 1) % STROKE_COLORS.length]})`,
                    opacity: 0.9,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-200 truncate capitalize">
                    {s.name.replace(/^www\.|\.(com|io|co)$/gi, "")}
                  </p>
                  <p className="text-xs text-zinc-500">{formatCurrency(s.amount)}/mo</p>
                </div>
                <Link
                  href="/chat"
                  prefetch={false}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-white/[0.1] px-2 py-1 text-xs text-zinc-400 hover:text-fuchsia-300 hover:border-fuchsia-500/30 transition-colors"
                >
                  <Eraser size={12} />
                  Erase
                </Link>
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
          Each brushstroke is a subscription. Erase strokes you don't want — cancel via VISTA Aura. Share your canvas to copy a summary to your clipboard.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <Link
          href="/chat"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-200 font-medium text-sm hover:bg-fuchsia-500/30 transition-colors"
        >
          Ask VISTA Aura to erase a stroke
        </Link>
      </motion.div>
    </div>
  );
}
