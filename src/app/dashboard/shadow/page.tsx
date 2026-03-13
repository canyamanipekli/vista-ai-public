import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { ShadowPageClient } from "./shadow-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Shadow — VISTA",
  description: "The version of you that never subscribed. Your shadow is $0. Close the gap.",
};

export default async function ShadowPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  let totalMonthly = 0;
  let potentialSavings = 0;
  try {
    const emails = await getRecentEmails({});
    const overview = emails.length > 0 ? getFinancialOverview(emails) : null;
    if (overview) {
      totalMonthly = overview.totalMonthly;
      potentialSavings = overview.potentialSavings ?? 0;
    }
  } catch {
    // use zeros
  }

  const overview =
    totalMonthly > 0
      ? { totalMonthly, subscriptionCount: 0, potentialSavings, netSpend: 0 }
      : null;

  return (
    <DashboardShell
      session={session}
      overview={overview}
      refreshAction={<RefreshEmailsButton />}
    >
      <ShadowPageClient
        totalMonthly={totalMonthly}
        potentialSavings={potentialSavings}
      />
    </DashboardShell>
  );
}
