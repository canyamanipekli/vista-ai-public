"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Cloud, CloudRain, Sun, CloudFog, Loader2, Sparkles } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";
import { computeWeather } from "@/lib/weather-utils";

interface WeatherPageClientProps {
  priceHikesCount: number;
  ghostCount: number;
  totalSubscriptions: number;
  hasRenewalsSoon: boolean;
}

type WeatherInsight = { summary?: string; tip?: string };

const WEATHER_ICONS = {
  sunny: Sun,
  "partly-cloudy": Cloud,
  storm: CloudRain,
  fog: CloudFog,
};

export function WeatherPageClient({
  priceHikesCount,
  ghostCount,
  totalSubscriptions,
  hasRenewalsSoon,
}: WeatherPageClientProps) {
  const [insight, setInsight] = useState<WeatherInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "weather" }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setInsight({ summary: data.summary, tip: data.tip });
      } catch {
        if (!cancelled) setInsight(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const result = computeWeather({
    priceHikesCount,
    ghostCount,
    totalSubscriptions,
    hasRenewalsSoon,
  });

  const Icon = WEATHER_ICONS[result.state];
  const iconColor =
    result.state === "sunny"
      ? "text-amber-400"
      : result.state === "storm"
        ? "text-sky-400"
        : result.state === "fog"
          ? "text-zinc-400"
          : "text-sky-300";

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
        <VistaProductVLogo product="weather" size={44} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            VISTA Weather
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Your subscription weather. One glance at your emotional status.
          </p>
        </div>
      </motion.header>

      {/* Main weather card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl border p-8 mb-6 text-center ${
          result.state === "sunny"
            ? "border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent"
            : result.state === "storm"
              ? "border-sky-500/25 bg-gradient-to-br from-sky-500/10 to-transparent"
              : result.state === "fog"
                ? "border-zinc-500/25 bg-gradient-to-br from-zinc-500/10 to-transparent"
                : "border-white/[0.08] bg-white/[0.02]"
        }`}
      >
        <Icon size={64} className={`mx-auto mb-4 ${iconColor}`} />
        <h2 className="text-2xl font-bold text-zinc-100">{result.label}</h2>
        <p className="text-zinc-400 mt-2 text-sm max-w-md mx-auto">
          {result.description}
        </p>
        <p className="text-zinc-500 text-xs mt-4">{result.tip}</p>
      </motion.div>

      {/* AI insight */}
      {insightLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 flex items-center gap-2 text-sky-400 text-sm">
          <Loader2 size={18} className="animate-spin" />
          AI reading your subscription climate…
        </motion.div>
      )}
      {!insightLoading && insight && (insight.summary || insight.tip) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-sky-400" />
            <span className="text-sm font-medium text-sky-300">AI insight</span>
          </div>
          {insight.summary && <p className="text-zinc-200 text-sm leading-relaxed">{insight.summary}</p>}
          {insight.tip && <p className="text-sky-200/90 text-sm mt-2">{insight.tip}</p>}
        </motion.div>
      )}

      {/* Forecast details */}
      {result.details.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
        >
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Forecast</h3>
          <ul className="space-y-2">
            {result.details.map((d, i) => {
              const DIcon = WEATHER_ICONS[d.state];
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-3 py-2"
                >
                  <DIcon size={18} className="text-zinc-400 shrink-0" />
                  <span className="text-sm font-medium text-zinc-200">{d.label}</span>
                  <span className="text-xs text-zinc-500 ml-auto">{d.reason}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Link
          href="/dashboard"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-200 font-medium text-sm hover:bg-violet-500/30 transition-colors"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
