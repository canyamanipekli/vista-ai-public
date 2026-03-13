import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { buildProductAIContextText } from "@/lib/vista-product-ai-context";
import type { EmailPreview } from "@/app/actions/gmail";

export type InsightProduct =
  | "weather"
  | "garden"
  | "canvas"
  | "zero"
  | "ghost"
  | "ritual"
  | "mirror"
  | "shadow"
  | "time-machine"
  | "virtual-card";

export interface LoadedContext {
  contextText: string;
  emails: EmailPreview[];
  overview: { totalMonthly: number; subscriptionCount: number; potentialSavings: number; netSpend?: number; healthScore?: number } | null;
}

export async function loadInsightContext(): Promise<LoadedContext | null> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken && !session?.refreshToken) return null;

  const emails = await getRecentEmails({});
  const overview = emails.length > 0 ? getFinancialOverview(emails) : null;
  let auditInsights: { type: string; title: string; description: string; provider?: string; severity: string }[] = [];
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
    auditInsights = cfo?.insights ?? [];
    if (overview && cfo?.overview?.healthScore != null) {
      (overview as { healthScore?: number }).healthScore = cfo.overview.healthScore;
    }
  }

  const contextText = buildProductAIContextText({ emails, overview, auditInsights });
  return { contextText, emails, overview };
}
