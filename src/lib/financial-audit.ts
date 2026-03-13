export interface AuditInsight {
  type: "price_hike" | "duplicate_charge" | "ghost_subscription";
  title: string;
  description: string;
  provider: string;
  severity: "high" | "medium" | "low";
  details?: Record<string, unknown>;
}

interface EmailForAudit {
  id: string;
  subject: string;
  from: string;
  date: string;
  category?: string;
  amount?: number;
  currency?: string;
  senderDomain?: string;
}

function extractDomain(from: string): string {
  const match = from.match(/@([\w.-]+)/);
  return match ? match[1].toLowerCase() : "";
}

export function runFinancialAudit(emails: EmailForAudit[]): AuditInsight[] {
  const insights: AuditInsight[] = [];
  const limitEmails = emails.slice(0, 100);

  const subscriptions = limitEmails.filter((e) => e.category === "Subscription" && e.amount && e.amount > 0);

  const byProvider = new Map<string, typeof subscriptions>();
  for (const e of subscriptions) {
    const domain = e.senderDomain || extractDomain(e.from);
    if (!byProvider.has(domain)) byProvider.set(domain, []);
    byProvider.get(domain)!.push(e);
  }

  for (const [domain, items] of byProvider) {
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  for (const [provider, items] of byProvider) {
    if (items.length < 2) continue;

    const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0];
    const previous = sorted[1];

    if (latest.amount && previous.amount && latest.amount > previous.amount) {
      const increase = ((latest.amount - previous.amount) / previous.amount) * 100;
      insights.push({
        type: "price_hike",
        title: `Price increase detected: ${provider}`,
        description: `Recent charge ${latest.amount} ${latest.currency || "USD"} vs previous ${previous.amount} ${previous.currency || "USD"} (${increase.toFixed(1)}% increase).`,
        provider,
        severity: increase > 20 ? "high" : "medium",
        details: {
          previousAmount: previous.amount,
          currentAmount: latest.amount,
          previousDate: previous.date,
          currentDate: latest.date,
        },
      });
    }
  }

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  for (const [provider, items] of byProvider) {
    for (let i = 0; i < items.length - 1; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const d1 = new Date(items[i].date).getTime();
        const d2 = new Date(items[j].date).getTime();
        if (Math.abs(d1 - d2) <= thirtyDays) {
          insights.push({
            type: "duplicate_charge",
            title: `Possible duplicate charge: ${provider}`,
            description: `Two charges within 30 days: ${items[i].date} and ${items[j].date}. Verify if intentional.`,
            provider,
            severity: "high",
            details: {
              amount1: items[i].amount,
              amount2: items[j].amount,
              date1: items[i].date,
              date2: items[j].date,
            },
          });
          break;
        }
      }
    }
  }

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  for (const [provider, items] of byProvider) {
    const recentCharges = items.filter((e) => new Date(e.date).getTime() >= ninetyDaysAgo);
    if (recentCharges.length >= 2) {
      const allFromProvider = limitEmails.filter(
        (e) => (e.senderDomain || extractDomain(e.from)) === provider
      );
      const nonPayment = allFromProvider.filter(
        (e) => e.category !== "Subscription" || !e.amount || e.amount <= 0
      );
      if (nonPayment.length === 0) {
        insights.push({
          type: "ghost_subscription",
          title: `Ghost subscription: ${provider}`,
          description: `Recurring charges (${recentCharges.length} in 90 days) with no other engagement emails. Consider cancelling if unused.`,
          provider,
          severity: "medium",
          details: { chargeCount: recentCharges.length },
        });
      }
    }
  }

  return insights;
}
