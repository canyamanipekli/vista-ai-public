import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { ChatPageClient } from "./chat-page-client";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  let emails: { id: string; subject: string; from: string; date: string; category?: string; amount?: number; currency?: string; alertType?: string; senderDomain?: string; cancellation_url?: string }[] = [];
  let overview: { totalMonthly: number; subscriptionCount: number; potentialSavings: number; netSpend: number; healthScore?: number } | null = null;
  let auditInsights: { type: string; title: string; description: string; provider?: string; severity: string }[] = [];

  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const list = await getRecentEmails({ last24h: true });
      overview = list.length > 0 ? getFinancialOverview(list) : null;
      if (list.length > 0) {
        const cfoOutput = await runCFOIntelligence(
          list.map((e) => ({
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
      emails = list.map((e) => ({
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
      }));
    }
  } catch (_) {
    // leave empty
  }

  const initialContext = {
    gmailConnected: emails.length > 0 || !!overview,
    emails,
    overview: overview ?? undefined,
    auditInsights,
  };

  return <ChatPageClient initialContext={initialContext} />;
}
