import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { RitualPageClient } from "./ritual-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Ritual — VISTA",
  description: "Your 5-minute monthly subscription ritual. Go through this month together.",
};

export default async function RitualPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  let overview: { totalMonthly: number; potentialSavings: number; subscriptionCount: number } | null = null;
  let insights: { title: string; description: string; type: string }[] = [];
  let ghostSubscriptions: string[] = [];
  let priceHikes: { provider: string; amount: number; increase: number }[] = [];

  try {
    const emails = await getRecentEmails({});
    if (emails.length > 0) {
      const fin = getFinancialOverview(emails);
      overview = {
        totalMonthly: fin.totalMonthly,
        potentialSavings: fin.potentialSavings ?? 0,
        subscriptionCount: fin.subscriptionCount ?? 0,
      };
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
      insights = (cfo?.insights ?? []).map((i) => ({
        title: i.title,
        description: i.description,
        type: i.type,
      }));
      ghostSubscriptions = cfo?.alerts?.ghostSubscriptions ?? [];
      priceHikes = cfo?.alerts?.priceHikes ?? [];
    }
  } catch {
    // use empty
  }

  const shellOverview = overview
    ? { ...overview, netSpend: 0 }
    : null;

  return (
    <DashboardShell
      session={session}
      overview={shellOverview}
      refreshAction={<RefreshEmailsButton />}
    >
      <RitualPageClient
        overview={overview}
        insights={insights}
        ghostSubscriptions={ghostSubscriptions}
        priceHikes={priceHikes}
      />
    </DashboardShell>
  );
}
