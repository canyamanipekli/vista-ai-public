import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { CompassPageClient } from "./compass-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Compass — VISTA",
  description: "Your financial north. One clear move: cancel, negotiate, or keep.",
};

export default async function CompassPage() {
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
      <CompassPageClient />
    </DashboardShell>
  );
}
