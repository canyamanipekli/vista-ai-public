"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "./dashboard-shell";
import { HealthScoreGauge } from "./health-score-gauge";
import { MonthlyForecastCard } from "./monthly-forecast-card";
import { AIInsightsHero } from "./ai-insights-hero";
import { SpendingDonut } from "./spending-donut";
import { BurnRateChart } from "./burn-rate-chart";
import { SubscriptionFeed, type SubscriptionRow } from "./subscription-feed";
import { DashboardSearchFilters } from "@/components/dashboard-search-filters";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { UpdatePermissionsModal } from "@/components/update-permissions-modal";
import { SuccessToast } from "@/components/SuccessToast";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuditLogPanel } from "@/components/audit-log-panel";
import { VistaIntelligence } from "./vista-intelligence";
import { FinancialStrategyPanel } from "./financial-strategy-panel";
import { LockedSavingsCard } from "./locked-savings-card";
import { CashFlowHUD } from "./cash-flow-hud";
import { GracePeriodFinder } from "./grace-period-finder";
import { HighChurnOpportunity } from "./high-churn-opportunity";
import { BurnRateMeter } from "./burn-rate-meter";
import Link from "next/link";
import { Mail, CreditCard, ArrowRight } from "lucide-react";
import { VistaProductVLogo } from "@/components/VistaProductVLogo";
import type { CashFlowDay, GracePeriodAlert, HighChurnService } from "@/app/dashboard/prepare-dashboard-data";
import type { EmailPreview } from "@/app/actions/gmail";

export interface DashboardPremiumProps {
  session: { user?: { email?: string | null; image?: string | null; name?: string | null } | null };
  overview: {
    totalMonthly: number;
    subscriptionCount: number;
    potentialSavings: number;
    netSpend: number;
  } | null;
  emails?: EmailPreview[];
  sortedEmails?: EmailPreview[];
  auditInsights?: Array<{ type: string; title: string; description: string; provider?: string; severity: string }>;
  overviewWithHealth?: { totalMonthly: number; subscriptionCount: number; potentialSavings: number; netSpend: number; healthScore?: number } | null;
  cfoOutput: {
    overview: {
      healthScore: number;
      cfoInsight: string;
      potentialSavings: number;
      nextMonthForecast?: number;
    };
    insights: Array<{ type: string; title: string; description: string; severity: string }>;
    alerts: {
      ghostSubscriptions: string[];
      redundantCategories?: { category: string; services: string[]; savingsPotential: number }[];
      priceHikes?: { provider: string; amount: number; increase: number }[];
    };
  } | null;
  donutData: { name: string; value: number }[];
  burnRateData: { month: string; spend: number; fullLabel: string }[];
  subscriptionRows: SubscriptionRow[];
  cashFlowPredictions?: CashFlowDay[];
  gracePeriodAlerts?: GracePeriodAlert[];
  highChurnOpportunities?: HighChurnService[];
  error: string | null;
  hasEmails: boolean;
  /** When true, show Pro-exclusive panels; when false, show locked savings card */
  isPro?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function DashboardPremium({
  session,
  overview,
  emails = [],
  sortedEmails,
  auditInsights = [],
  overviewWithHealth,
  cfoOutput,
  donutData,
  burnRateData,
  subscriptionRows,
  cashFlowPredictions = [],
  gracePeriodAlerts = [],
  highChurnOpportunities = [],
  error,
  hasEmails,
  isPro = false,
}: DashboardPremiumProps) {
  const showPermissionsModal = error === "GMAIL_INSUFFICIENT_SCOPE";
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(showPermissionsModal);
  const [unlockAgentModalOpen, setUnlockAgentModalOpen] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; amount?: number; serviceName?: string; draftPrepared?: boolean }>({ visible: false });

  useEffect(() => {
    if (showPermissionsModal) setPermissionsModalOpen(true);
  }, [showPermissionsModal]);

  const handleSuccessReclaim = useCallback((amount?: number, _serviceName?: string, draftPrepared?: boolean) => {
    setToast({ visible: true, amount, serviceName: _serviceName, draftPrepared: draftPrepared ?? false });
  }, []);

  return (
    <>
      <UpdatePermissionsModal
        open={permissionsModalOpen}
        onDismiss={() => setPermissionsModalOpen(false)}
      />
      <UpdatePermissionsModal
        open={unlockAgentModalOpen}
        onDismiss={() => setUnlockAgentModalOpen(false)}
        variant="unlock-agent"
      />
      <SuccessToast
        visible={toast.visible}
        amountMonthly={toast.amount}
        serviceName={toast.serviceName}
        userName={session?.user?.name ?? null}
        draftPrepared={toast.draftPrepared}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />
      <DashboardShell
        session={session}
        overview={overview}
        refreshAction={<RefreshEmailsButton />}
      >
      <div className="mb-6">
        <Suspense fallback={null}>
          <DashboardSearchFilters />
        </Suspense>
      </div>

      {error && error !== "GMAIL_INSUFFICIENT_SCOPE" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {error === "GMAIL_API_DISABLED" ? (
            <div className="space-y-2">
              <p className="font-medium">Gmail API is not enabled.</p>
              <p className="text-zinc-400">
                Enable it in Google Cloud Console:{" "}
                <a
                  href="https://console.cloud.google.com/apis/library/gmail.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  Enable Gmail API
                </a>
              </p>
            </div>
          ) : error === "GMAIL_403_OTHER" ? (
            <div className="space-y-2">
              <p className="font-medium">Gmail access denied (403).</p>
              <p className="text-zinc-400">Check OAuth consent and credentials.</p>
            </div>
          ) : (
            <p className="font-medium">{error}</p>
          )}
        </motion.div>
      )}

      {!hasEmails && !error && (
        <div className="py-24 text-center">
          <Mail className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">Connect Gmail to see your dashboard</p>
        </div>
      )}

      {/* VISTA Virtual Card — always visible for brand */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-10"
      >
        <Link
          href="/dashboard/virtual-card"
          prefetch={false}
          className="block rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent p-5 sm:p-6 hover:border-violet-500/25 hover:from-violet-500/15 transition-all group"
        >
          <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center group-hover:bg-violet-500/25 transition-colors">
                <VistaProductVLogo product="virtual-card" size={28} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  VISTA Virtual Card
                  <ArrowRight size={16} className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Your personal card — secure and unique to your account</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 group-hover:text-violet-200">
              <CreditCard size={16} />
              View your card
            </span>
          </motion.div>
        </Link>
      </motion.div>

      {hasEmails && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {/* Hero: VISTA Score + Burn Rate Meter + Monthly Forecast + Top 3 Critical Insights */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-6 justify-center lg:justify-start">
              <HealthScoreGauge
                score={cfoOutput?.overview?.healthScore ?? overview?.subscriptionCount ? 70 : 0}
              />
              <p className="text-[11px] text-zinc-500 -mt-2">Increases as you cancel ghost subscriptions</p>
              <BurnRateMeter burnRateData={burnRateData} />
              {overview && (cfoOutput?.overview?.nextMonthForecast != null || overview.totalMonthly > 0) && (
                <MonthlyForecastCard
                  amount={cfoOutput?.overview?.nextMonthForecast ?? overview.totalMonthly}
                />
              )}
            </div>
            <div className="lg:col-span-8">
              <AIInsightsHero
                insights={cfoOutput?.insights ?? []}
                cfoInsight={cfoOutput?.overview?.cfoInsight}
              />
            </div>
          </motion.div>

          {/* Cash-Flow HUD + Grace Period + High-Churn */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CashFlowHUD predictions={cashFlowPredictions} />
            </div>
            <div className="space-y-6">
              <GracePeriodFinder alerts={gracePeriodAlerts} />
              <HighChurnOpportunity services={highChurnOpportunities} />
            </div>
          </motion.div>

          {/* Charts */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ErrorBoundary name="Spending chart">
              <SpendingDonut data={donutData} />
            </ErrorBoundary>
            <ErrorBoundary name="Burn rate chart">
              <BurnRateChart data={burnRateData} />
            </ErrorBoundary>
          </motion.div>

          {/* VISTA Intelligence */}
          <motion.div variants={item}>
            <VistaIntelligence
              potentialSavingsYear={Math.round((cfoOutput?.overview?.potentialSavings ?? overview?.potentialSavings ?? 0) * 12)}
              savingsSuggestion={cfoOutput?.overview?.potentialSavings
                ? `You can save $${Math.round((cfoOutput.overview.potentialSavings) * 12)}/year by switching plans or cancelling redundant subscriptions.`
                : undefined}
              inactiveCount={cfoOutput?.alerts?.ghostSubscriptions?.length ?? subscriptionRows.filter((r) => r.isGhost).length}
              anomalyMessage={cfoOutput?.insights?.find((i) => i.type === "duplicate_charge")?.description}
              anomalyAmount={undefined}
            />
          </motion.div>

          {/* Pro: Deep Audit (Family + Engagement) / Free: Locked Savings Card */}
          <motion.div variants={item}>
            {isPro ? (
              <FinancialStrategyPanel
                redundantCategories={cfoOutput?.alerts?.redundantCategories}
                ghostSubscriptions={cfoOutput?.alerts?.ghostSubscriptions}
                priceHikes={cfoOutput?.alerts?.priceHikes}
              />
            ) : (
              <LockedSavingsCard />
            )}
          </motion.div>

          {/* Recent Actions */}
          <motion.div variants={item}>
            <AuditLogPanel />
          </motion.div>

          {/* Subscription Feed */}
          <motion.section variants={item}>
            <ErrorBoundary name="Subscription feed">
              <SubscriptionFeed rows={subscriptionRows} />
            </ErrorBoundary>
          </motion.section>
        </motion.div>
      )}
      </DashboardShell>
    </>
  );
}
