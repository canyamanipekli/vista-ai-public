import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { MirrorPageClient } from "./mirror-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Mirror — VISTA",
  description: "Your subscription mirror. See how you compare to similar users.",
};

export default async function MirrorPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  let totalMonthly = 0;
  let potentialSavings = 0;
  let subscriptionCount = 0;
  try {
    const emails = await getRecentEmails({});
    const overview = emails.length > 0 ? getFinancialOverview(emails) : null;
    if (overview) {
      totalMonthly = overview.totalMonthly;
      potentialSavings = overview.potentialSavings ?? 0;
      subscriptionCount = overview.subscriptionCount ?? 0;
    }
  } catch {
    // use zeros
  }

  const overview =
    totalMonthly > 0 || subscriptionCount > 0
      ? { totalMonthly, subscriptionCount, potentialSavings, netSpend: 0 }
      : null;

  return (
    <DashboardShell
      session={session}
      overview={overview}
      refreshAction={<RefreshEmailsButton />}
    >
      <MirrorPageClient
        totalMonthly={totalMonthly}
        potentialSavings={potentialSavings}
        subscriptionCount={subscriptionCount}
      />
    </DashboardShell>
  );
}
