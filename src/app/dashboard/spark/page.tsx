import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { SparkPageClient } from "./spark-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Spark — VISTA",
  description: "One spark. Cancel one thing this week—savings and a chain reaction.",
};

export default async function SparkPage() {
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
      <SparkPageClient />
    </DashboardShell>
  );
}
