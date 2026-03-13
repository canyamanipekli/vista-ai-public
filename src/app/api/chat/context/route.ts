import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Initial context for VISTA Aura Command Center: Gmail last 24h, overview, and audit insights. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken && !session?.refreshToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const emails = await getRecentEmails({ last24h: true });
    const overview = emails.length > 0 ? getFinancialOverview(emails) : null;
    let auditInsights: { type: string; title: string; description: string; provider?: string; severity: string }[] = [];

    if (emails.length > 0) {
      const cfoOutput = await runCFOIntelligence(
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
      auditInsights = cfoOutput?.insights ?? [];
      if (overview && cfoOutput?.overview?.healthScore != null) {
        (overview as { healthScore?: number }).healthScore = cfoOutput.overview.healthScore;
      }
    }

    const context = {
      gmailConnected: true,
      emails: emails.map((e) => ({
        id: e.id,
        subject: e.subject,
        from: e.from,
        date: e.date,
        category: e.category,
        amount: e.amount,
        currency: e.currency,
        alertType: e.alertType,
        senderDomain: e.senderDomain,
        cancellation_url: e.cancellation_url,
      })),
      overview,
      auditInsights,
    };

    return NextResponse.json(context);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load context";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
