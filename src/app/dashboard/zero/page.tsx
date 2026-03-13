import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { ZeroPageClient } from "./zero-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Zero — VISTA",
  description: "Path to zero. Zero wasted subscription spend. Game-like progress.",
};

export default async function ZeroPage() {
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
    totalMonthly > 0 || potentialSavings > 0
      ? { totalMonthly, subscriptionCount: 0, potentialSavings, netSpend: 0 }
      : null;

  return (
    <DashboardShell
      session={session}
      overview={overview}
      refreshAction={<RefreshEmailsButton />}
    >
      <ZeroPageClient
        totalMonthly={totalMonthly}
        potentialSavings={potentialSavings}
      />
    </DashboardShell>
  );
}
