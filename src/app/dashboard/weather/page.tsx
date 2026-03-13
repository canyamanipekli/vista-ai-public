import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { buildCashFlowPredictions } from "@/app/dashboard/prepare-dashboard-data";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { WeatherPageClient } from "./weather-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Weather — VISTA",
  description: "Your subscription weather. Sunny, storm, or fog — one glance at your emotional status.",
};

export default async function WeatherPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  let priceHikesCount = 0;
  let ghostCount = 0;
  let totalSubscriptions = 0;
  let hasRenewalsSoon = false;

  try {
    const emails = await getRecentEmails({});
    if (emails.length > 0) {
      const overview = getFinancialOverview(emails);
      totalSubscriptions = overview.subscriptionCount ?? 0;
      const cfo = await runCFOIntelligence(
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
      );
      priceHikesCount = cfo?.alerts?.priceHikes?.length ?? 0;
      ghostCount = cfo?.alerts?.ghostSubscriptions?.length ?? 0;
      const predictions = buildCashFlowPredictions(emails);
      const next14Days = predictions.filter((p) => {
        const d = new Date(p.date);
        const now = new Date();
        const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 14;
      });
      hasRenewalsSoon = next14Days.length > 0;
    }
  } catch {
    // use zeros
  }

  const overview =
    totalSubscriptions > 0 || ghostCount > 0 || priceHikesCount > 0
      ? { totalMonthly: 0, subscriptionCount: totalSubscriptions, potentialSavings: 0, netSpend: 0 }
      : null;

  return (
    <DashboardShell
      session={session}
      overview={overview}
      refreshAction={<RefreshEmailsButton />}
    >
      <WeatherPageClient
        priceHikesCount={priceHikesCount}
        ghostCount={ghostCount}
        totalSubscriptions={totalSubscriptions}
        hasRenewalsSoon={hasRenewalsSoon}
      />
    </DashboardShell>
  );
}
