"use client";

import { motion } from "framer-motion";
import { Mail, ExternalLink } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export interface SubscriptionRow {
  domain: string;
  displayName: string;
  amount: number;
  currency: string;
  lastActive: string;
  lastActiveDaysAgo: number;
  isGhost: boolean;
  priceHike: boolean;
  cancellationUrl?: string;
  emailCount: number;
  sparklineData?: { month: string; value: number }[];
  retirementImpact?: number;
}

interface SubscriptionFeedProps {
  rows: SubscriptionRow[];
}

function formatMoney(amount: number, currency: string) {
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "TRY" ? "₺" : "$";
  return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatLastActive(daysAgo: number): string {
  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} wk ago`;
  if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} mo ago`;
  return `${Math.floor(daysAgo / 365)} yr ago`;
}

export function SubscriptionFeed({ rows }: SubscriptionFeedProps) {
  if (rows.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-12 text-center"
      >
        <Mail className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-zinc-500">No subscriptions in this view</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">Subscription Feed</h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          {rows.length} service{rows.length !== 1 ? "s" : ""} · Quick actions open cancellation flow
        </p>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {rows.map((row, i) => (
          <motion.li
            key={row.domain}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center overflow-hidden shrink-0 border border-white/5 group-hover:border-white/10 transition-colors">
              <img
                src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=32`}
                alt=""
                className="w-6 h-6"
                width={24}
                height={24}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white truncate">{row.displayName}</span>
                {row.priceHike && (
                  <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Price Hike
                  </span>
                )}
                {row.isGhost && (
                  <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Ghost
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Last active {formatLastActive(row.lastActiveDaysAgo)}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Projected 5-year cost: {formatMoney(row.amount * 60, row.currency)}
              </p>
              {row.retirementImpact != null && row.retirementImpact > 0 && (
                <p className="text-[10px] text-emerald-500/90 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  If you cancel and invest at 8%, ~${(row.retirementImpact / 1000).toFixed(0)}k more at retirement
                </p>
              )}
            </div>

            {row.sparklineData && row.sparklineData.some((d) => d.value > 0) && (
              <div className="w-16 h-8 shrink-0 opacity-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={row.sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-white">
                {formatMoney(row.amount, row.currency)}
              </p>
              <p className="text-[10px] text-zinc-500">
                {row.emailCount} invoice{row.emailCount !== 1 ? "s" : ""}
              </p>
            </div>

            {row.cancellationUrl ? (
              <a
                href={row.cancellationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-violet-500 text-zinc-100 hover:bg-violet-400 active:scale-[0.98] shadow-lg shadow-violet-500/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <ExternalLink size={14} />
                Cancel
              </a>
            ) : (
              <a
                href="/chat"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 text-zinc-300 border border-white/10 hover:bg-white/15 hover:text-white hover:border-white/20 active:scale-[0.98] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <ExternalLink size={14} />
                Manage
              </a>
            )}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
