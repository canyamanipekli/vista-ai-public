"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Ghost, Swords, Trophy, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";
import { getAuditLog } from "@/lib/audit-log";
import {
  getLevel,
  getBadgesUnlocked,
  getNextBadge,
  BADGES,
} from "@/lib/ghost-hunter-utils";

interface GhostPageClientProps {
  ghostSubscriptions: string[];
}

type GhostInsight = { summary?: string; topGhosts?: string[] };

function formatGhostName(domain: string): string {
  const d = domain.replace(/^www\./, "").split(".")[0];
  return d ? d.charAt(0).toUpperCase() + d.slice(1) : domain;
}

export function GhostPageClient({ ghostSubscriptions }: GhostPageClientProps) {
  const [defeatedCount, setDefeatedCount] = useState(0);
  const [insight, setInsight] = useState<GhostInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    const log = getAuditLog();
    const redirects = log.filter((e) => e.type === "redirect");
    setDefeatedCount(redirects.length);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "ghost" }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setInsight({ summary: data.summary, topGhosts: data.topGhosts });
      } catch {
        if (!cancelled) setInsight(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const level = getLevel(defeatedCount);
  const badgesUnlocked = getBadgesUnlocked(defeatedCount);
  const nextBadge = getNextBadge(defeatedCount);
  const ghostsToHunt = ghostSubscriptions.length;

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
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-8"
      >
        <VistaProductVLogo product="ghost" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Ghost
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Ghost subscription hunt. Cancel = hunt. Level up, earn badges.
          </p>
        </div>
      </motion.header>

      {/* Level & title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-lime-500/25 bg-gradient-to-br from-lime-500/10 via-violet-500/5 to-transparent p-6 mb-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center">
              <span className="text-2xl font-bold text-lime-400">Lv.{level}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                VISTA Ghost Hunter
              </p>
              <p className="text-zinc-200 font-medium">
                {defeatedCount} ghost{defeatedCount !== 1 ? "s" : ""} defeated
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-lime-400">
            <Swords size={20} />
            <span className="text-sm font-medium">{ghostsToHunt} to hunt</span>
          </div>
        </div>
      </motion.div>

      {insightLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 flex items-center gap-2 text-lime-400 text-sm">
          <Loader2 size={18} className="animate-spin" />
          AI scanning for ghosts…
        </motion.div>
      )}
      {!insightLoading && insight && (insight.summary || (insight.topGhosts && insight.topGhosts.length > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-lime-500/25 bg-lime-500/10 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-lime-400" />
            <span className="text-sm font-medium text-lime-300">AI insight</span>
          </div>
          {insight.summary && <p className="text-zinc-200 text-sm leading-relaxed">{insight.summary}</p>}
          {insight.topGhosts && insight.topGhosts.length > 0 && (
            <p className="text-lime-200/90 text-sm mt-2">Top to hunt: {insight.topGhosts.slice(0, 5).join(", ")}</p>
          )}
        </motion.div>
      )}

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-amber-400" />
          <span className="text-sm font-medium text-zinc-300">Badges</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {BADGES.map((badge) => {
            const unlocked = defeatedCount >= badge.minDefeated;
            return (
              <div
                key={badge.id}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  unlocked
                    ? "border-lime-500/40 bg-lime-500/10 text-lime-200"
                    : "border-white/[0.06] text-zinc-500"
                }`}
              >
                <span className="font-medium">{badge.label}</span>
                {unlocked && (
                  <p className="text-xs text-zinc-500 mt-0.5">{badge.description}</p>
                )}
              </div>
            );
          })}
        </div>
        {nextBadge && (
          <p className="text-xs text-zinc-500 mt-3">
            Next: <span className="text-lime-400">{nextBadge.label}</span> — {nextBadge.minDefeated - defeatedCount} more to go.
          </p>
        )}
      </motion.div>

      {/* Ghosts to hunt */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Ghost size={18} className="text-lime-400" />
          <span className="text-sm font-medium text-zinc-300">Ghosts in the wild</span>
        </div>
        {ghostsToHunt === 0 ? (
          <p className="text-zinc-500 text-sm">
            No ghost subscriptions detected. You're clear — or connect Gmail to scan.
          </p>
        ) : (
          <ul className="space-y-3">
            {ghostSubscriptions.map((domain) => (
              <li
                key={domain}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
              >
                <span className="font-medium text-zinc-200">
                  {formatGhostName(domain)}
                </span>
                <Link
                  href="/chat"
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-lime-500/20 border border-lime-500/30 px-3 py-1.5 text-sm font-medium text-lime-300 hover:bg-lime-500/30 transition-colors"
                >
                  <Swords size={14} />
                  Hunt
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <Link
          href="/chat"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-200 font-medium text-sm hover:bg-violet-500/30 transition-colors"
        >
          <ExternalLink size={16} />
          Ask VISTA Aura to find cancellation links
        </Link>
      </motion.div>
    </div>
  );
}
