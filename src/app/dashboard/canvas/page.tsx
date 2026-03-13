import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { buildSubscriptionRows } from "@/app/dashboard/prepare-dashboard-data";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { CanvasPageClient } from "./canvas-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Canvas — VISTA",
  description: "Your subscription life as a painting. Each subscription a brushstroke. Cancel = erase.",
};

export default async function CanvasPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  let strokes: { name: string; amount: number; domain: string }[] = [];
  let totalValue = 0;

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
      strokes = rows.map((r) => ({
        name: r.displayName,
        amount: r.amount,
        domain: r.domain,
      }));
      totalValue = strokes.reduce((s, x) => s + x.amount, 0);
    }
  } catch {
    // use empty
  }

  const overview =
    strokes.length > 0
      ? { totalMonthly: totalValue, subscriptionCount: strokes.length, potentialSavings: 0, netSpend: 0 }
      : null;

  return (
    <DashboardShell
      session={session}
      overview={overview}
      refreshAction={<RefreshEmailsButton />}
    >
      <CanvasPageClient strokes={strokes} totalValue={totalValue} />
    </DashboardShell>
  );
}
