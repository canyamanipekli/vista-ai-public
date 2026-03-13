import type { EmailPreview } from "@/app/actions/gmail";

export interface ProductAIContextInput {
  emails: EmailPreview[];
  overview: { totalMonthly: number; subscriptionCount: number; potentialSavings: number; netSpend?: number; healthScore?: number } | null;
  auditInsights?: { type: string; title: string; description: string; provider?: string; severity: string }[];
}

const formatAmount = (a: number, c?: string) => {
  const sym = c === "EUR" ? "€" : c === "GBP" ? "£" : "$";
  return `${sym}${a.toFixed(2)}`;
};

const extractSender = (from: string) => from.replace(/<[^>]+>/, "").trim();

/**
 * Build a concise text summary of the user's subscription and financial context
 * for AI product endpoints (Oracle, Compass, Spark).
 */
export function buildProductAIContextText(input: ProductAIContextInput): string {
  const { emails, overview, auditInsights } = input;
  const subscriptions = emails.filter((e) => e.category === "Subscription");
  const trials = emails.filter((e) => e.alertType === "trial");
  const priceIncreases = emails.filter((e) => e.alertType === "price_increase" || e.price_hike);
  const freeEnds = emails.filter((e) => e.alertType === "free_ends");

  const byDomain = new Map<string, { total: number; currency?: string; count: number; lastDate: string }>();
  for (const e of subscriptions) {
    const domain = e.senderDomain || extractSender(e.from).split("@")[1] || "unknown";
    if (e.amount != null && e.amount > 0) {
      const cur = e.currency ?? "USD";
      const existing = byDomain.get(domain);
      if (!existing) {
        byDomain.set(domain, { total: e.amount, currency: cur, count: 1, lastDate: e.date });
      } else {
        existing.total += e.amount;
        existing.count += 1;
        if (e.date > existing.lastDate) existing.lastDate = e.date;
      }
    }
  }

  let text = "";
  if (overview) {
    text += `## Financial overview\n`;
    text += `Total monthly spend: ${formatAmount(overview.totalMonthly)}\n`;
    text += `Active subscriptions: ${overview.subscriptionCount}\n`;
    text += `Potential savings: ${formatAmount(overview.potentialSavings)}\n`;
    if ((overview as { healthScore?: number }).healthScore != null) {
      text += `VISTA health score: ${(overview as { healthScore?: number }).healthScore}/100\n`;
    }
    text += "\n";
  }

  if (byDomain.size > 0) {
    text += `## Spending by service (domain)\n`;
    [...byDomain.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([domain, data]) => {
        text += `- ${domain}: ${formatAmount(data.total, data.currency)} (${data.count} txns, last: ${data.lastDate})\n`;
      });
    text += "\n";
  }

  if (subscriptions.length > 0) {
    text += `## Recent subscription / invoice lines\n`;
    subscriptions.slice(0, 40).forEach((e) => {
      const amt = e.amount ? formatAmount(e.amount, e.currency) : "?";
      text += `- ${extractSender(e.from)} | ${e.subject.slice(0, 50)} | ${amt} | ${e.date} | domain: ${e.senderDomain || "n/a"}\n`;
    });
    text += "\n";
  }

  if (trials.length > 0) {
    text += `## Trials (user may forget to cancel)\n`;
    trials.forEach((e) => {
      text += `- ${extractSender(e.from)} | ${e.subject.slice(0, 50)} | ${e.date}\n`;
    });
    text += "\n";
  }

  if (freeEnds.length > 0) {
    text += `## Free periods ending\n`;
    freeEnds.forEach((e) => {
      text += `- ${extractSender(e.from)} | ${e.subject.slice(0, 50)} | ${e.date}\n`;
    });
    text += "\n";
  }

  if (priceIncreases.length > 0) {
    text += `## Price increases\n`;
    priceIncreases.forEach((e) => {
      text += `- ${extractSender(e.from)} | ${e.subject.slice(0, 50)} | ${e.date}\n`;
    });
    text += "\n";
  }

  if (auditInsights?.length) {
    text += `## Audit insights\n`;
    auditInsights.forEach((i) => {
      text += `- ${i.title}: ${i.description}\n`;
    });
  }

  return text || "No subscription or payment data available yet. User has not connected inbox or has no relevant emails.";
}
