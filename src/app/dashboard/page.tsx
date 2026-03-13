import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview, type EmailPreview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import {
  buildDonutData,
  buildBurnRateData,
  buildSubscriptionRows,
  buildCashFlowPredictions,
  buildGracePeriodAlerts,
  buildHighChurnOpportunities,
} from "./prepare-dashboard-data";
import { DashboardPremium } from "@/components/dashboard-premium";

type Props = {
  searchParams: Promise<{ q?: string; filter?: string; resync?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const filterValue = params.filter?.trim();
  const labelIds =
    filterValue && filterValue !== "all" ? [filterValue] : undefined;

  let emails: EmailPreview[] = [];
  let error: string | null = null;

  try {
    emails = await getRecentEmails({
      search,
      labelIds,
      deepScan: params.resync === "1",
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load emails";
  }

  const overview = emails.length > 0 ? getFinancialOverview(emails) : null;
  const cfoOutput =
    emails.length > 0
      ? await runCFOIntelligence(
          emails.map((e) => ({
            id: e.id,
            subject: e.subject,
            from: e.from,
            date: e.date,
            category: e.category,
            amount: e.amount,
            currency: e.currency,
            senderDomain: e.senderDomain,
            price_hike: e.price_hike,
            increase_amount: e.increase_amount,
            potential_error: e.potential_error,
          }))
        )
      : null;

  const sortedEmails = [...emails].sort((a, b) => {
    const aAlert = a.alertType ? 1 : 0;
    const bAlert = b.alertType ? 1 : 0;
    if (aAlert !== bAlert) return bAlert - aAlert;
    const aSub =
      a.category === "Subscription" || a.category === "Refund" ? 1 : 0;
    const bSub =
      b.category === "Subscription" || b.category === "Refund" ? 1 : 0;
    if (aSub !== bSub) return bSub - aSub;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const donutData = buildDonutData(emails);
  const burnRateData = buildBurnRateData(emails);
  const subscriptionRows = buildSubscriptionRows(
    emails,
    cfoOutput?.alerts?.ghostSubscriptions ?? []
  );
  const cashFlowPredictions = buildCashFlowPredictions(emails);
  const gracePeriodAlerts = buildGracePeriodAlerts(emails);
  const highChurnOpportunities = buildHighChurnOpportunities(emails);

  const overviewWithHealth = overview
    ? { ...overview, healthScore: cfoOutput?.overview?.healthScore }
    : null;

  return (
    <DashboardPremium
      session={session}
      overview={overview}
      emails={emails}
      sortedEmails={sortedEmails}
      overviewWithHealth={overviewWithHealth}
      auditInsights={cfoOutput?.insights ?? []}
      cfoOutput={cfoOutput ? {
        overview: cfoOutput.overview,
        insights: cfoOutput.insights,
        alerts: {
          ghostSubscriptions: cfoOutput.alerts.ghostSubscriptions,
          redundantCategories: cfoOutput.alerts.redundantCategories,
          priceHikes: cfoOutput.alerts.priceHikes,
        },
      } : null}
      donutData={donutData}
      burnRateData={burnRateData}
      subscriptionRows={subscriptionRows}
      cashFlowPredictions={cashFlowPredictions}
      gracePeriodAlerts={gracePeriodAlerts}
      highChurnOpportunities={highChurnOpportunities}
      error={error}
      hasEmails={emails.length > 0}
    />
  );
}
