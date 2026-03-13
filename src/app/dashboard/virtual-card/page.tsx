import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-premium/dashboard-shell";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";
import { VirtualCardPageClient } from "./virtual-card-page-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VISTA Virtual Card — VISTA",
  description: "Your personal VISTA Virtual Card. Secure, unique, and tied to your account.",
};

export default async function VirtualCardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const overview = null;

  return (
    <DashboardShell
      session={session}
      overview={overview}
      refreshAction={<RefreshEmailsButton />}
    >
      <VirtualCardPageClient
        userName={session.user?.name ?? null}
        userEmail={session.user?.email ?? ""}
      />
    </DashboardShell>
  );
}
