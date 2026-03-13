"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Loader2, RefreshCw, ChevronRight, XCircle, Handshake, CheckCircle } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";

type CompassResult = {
  direction: "cancel" | "negotiate" | "keep";
  serviceName: string;
  reason: string;
  oneLiner: string;
};

const DIRECTION_CONFIG = {
  cancel: { icon: XCircle, label: "Cancel", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
  negotiate: { icon: Handshake, label: "Negotiate", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  keep: { icon: CheckCircle, label: "Keep", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
};

async function fetchCompass(): Promise<CompassResult | null> {
  const res = await fetch("/api/compass", { method: "POST", credentials: "include" });
  const data = await res.json();
  if (!res.ok) return null;
  return {
    direction: data.direction ?? "keep",
    serviceName: data.serviceName ?? "—",
    reason: data.reason ?? "",
    oneLiner: data.oneLiner ?? "",
  };
}

export function CompassPageClient() {
  const [result, setResult] = useState<CompassResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCompass();
      setResult(data ?? null);
      if (!data) setError("Failed to get direction");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dir = result ? DIRECTION_CONFIG[result.direction as keyof typeof DIRECTION_CONFIG] ?? DIRECTION_CONFIG.keep : null;
  const DirIcon = dir?.icon ?? CheckCircle;

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
        <VistaProductVLogo product="compass" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Compass
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Your financial north. One clear move: cancel, negotiate, or keep.
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
          The Compass points to the single most sensible action right now—one direction, no clutter.
        </p>
        {loading && (
          <div className="flex items-center gap-2 text-cyan-400 text-sm">
            <Loader2 size={18} className="animate-spin" />
            Finding your north…
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

      {result && dir && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className={`rounded-2xl border ${dir.border} ${dir.bg} p-6`}>
            <div className="flex items-center gap-2 mb-3">
              <DirIcon size={20} className={dir.color} />
              <span className={`text-sm font-medium ${dir.color}`}>{dir.label}</span>
              {result.serviceName !== "—" && (
                <span className="text-zinc-300 font-medium">— {result.serviceName}</span>
              )}
            </div>
            <p className="text-zinc-100 text-lg font-medium mt-2">{result.oneLiner}</p>
            <p className="text-zinc-400 text-sm mt-3">{result.reason}</p>
          </div>

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
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 font-medium text-sm hover:bg-cyan-500/30 transition-colors"
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
