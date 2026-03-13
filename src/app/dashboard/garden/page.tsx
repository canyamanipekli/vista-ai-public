import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { buildSubscriptionRows } from "@/app/dashboard/prepare-dashboard-data";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { GardenPageClient } from "./garden-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Garden — VISTA",
  description: "Every subscription is a plant. Pay = water, cancel = uproot. Garden health = subscription health.",
};

export default async function GardenPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  let plants: { name: string; amount: number; isGhost: boolean; domain: string }[] = [];
  let healthPct = 100;

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
      const ghostList = cfo?.alerts?.ghostSubscriptions ?? [];
      const rows = buildSubscriptionRows(emails, ghostList);
      plants = rows.map((r) => ({
        name: r.displayName,
        amount: r.amount,
        isGhost: r.isGhost,
        domain: r.domain,
      }));
      const healthy = plants.filter((p) => !p.isGhost).length;
      healthPct = plants.length > 0 ? Math.round((healthy / plants.length) * 100) : 100;
    }
  } catch {
    // use empty
  }

  const overview =
    plants.length > 0
      ? { totalMonthly: 0, subscriptionCount: plants.length, potentialSavings: 0, netSpend: 0 }
      : null;

  return (
    <DashboardShell
      session={session}
      overview={overview}
      refreshAction={<RefreshEmailsButton />}
    >
      <GardenPageClient plants={plants} healthPct={healthPct} />
    </DashboardShell>
  );
}
