import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { OraclePageClient } from "./oracle-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Oracle — VISTA",
  description: "Prophecy & decision. Predictions and risk alerts from your subscription habits.",
};

export default async function OraclePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  let overview: { totalMonthly: number; subscriptionCount: number; potentialSavings: number; netSpend: number } | null = null;
  try {
    const emails = await getRecentEmails({});
    overview = emails.length > 0 ? getFinancialOverview(emails) : null;
  } catch {
    // use null
  }

  return (
    <DashboardShell
      session={session}
      overview={overview}
      refreshAction={<RefreshEmailsButton />}
    >
      <OraclePageClient />
    </DashboardShell>
  );
}
