import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { GhostPageClient } from "./ghost-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Ghost — VISTA",
  description: "Ghost subscription hunt. Hunt ghosts, earn badges, become a VISTA Ghost Hunter.",
};

export default async function GhostPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  let ghostSubscriptions: string[] = [];
  let potentialSavings = 0;
  try {
    const emails = await getRecentEmails({});
    if (emails.length > 0) {
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
      ghostSubscriptions = cfo?.alerts?.ghostSubscriptions ?? [];
      potentialSavings = cfo?.overview?.potentialSavings ?? 0;
    }
  } catch {
    // use empty
  }

  const overview =
    ghostSubscriptions.length > 0 || potentialSavings > 0
      ? { totalMonthly: 0, subscriptionCount: 0, potentialSavings, netSpend: 0 }
      : null;

  return (
    <DashboardShell
      session={session}
      overview={overview}
      refreshAction={<RefreshEmailsButton />}
    >
      <GhostPageClient ghostSubscriptions={ghostSubscriptions} />
    </DashboardShell>
  );
}
