import OpenAI from "openai";

export interface EmailForCFO {
  id: string;
  subject: string;
  from: string;
  date: string;
  category?: string;
  amount?: number;
  currency?: string;
  senderDomain?: string;
  price_hike?: boolean;
  increase_amount?: number;
  potential_error?: boolean;
}

export interface AuditInsight {
  type: "price_hike" | "duplicate_charge" | "ghost_subscription" | "redundant_spending";
  title: string;
  description: string;
  provider?: string;
  providers?: string[];
  severity: "high" | "medium" | "low";
  details?: Record<string, unknown>;
  savingsPotential?: number;
}

export interface CFOIntelligenceOutput {
  overview: {
    totalMonthly: number;
    subscriptionCount: number;
    potentialSavings: number;
    netSpend: number;
    nextMonthForecast: number;
    healthScore: number;
    cfoInsight: string;
  };
  insights: AuditInsight[];
  subscriptionsByCategory: Record<string, string[]>;
  alerts: {
    priceHikes: { provider: string; amount: number; increase: number }[];
    doubleCharges: { provider: string; dates: string[] }[];
    ghostSubscriptions: string[];
    redundantCategories: { category: string; services: string[]; savingsPotential: number }[];
  };
}

const SEMANTIC_CATEGORIES = [
  "Streaming",
  "Productivity",
  "Cloud Storage",
  "Fitness",
  "Music",
  "Software",
  "Gaming",
  "News",
  "Education",
  "Security",
  "Other",
];

async function categorizeWithLLM(
  serviceNames: string[]
): Promise<Record<string, string>> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim() || serviceNames.length === 0) return {};

  try {
    const openai = new OpenAI({ apiKey: key });
    const { choices } = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Categorize each subscription into exactly one category. Reply with JSON only: {"service_domain": "Category"}. Categories: Streaming, Productivity, Cloud Storage, Fitness, Music, Software, Gaming, News, Education, Security, Other.`,
        },
        {
          role: "user",
          content: `Categorize: ${[...new Set(serviceNames)].slice(0, 30).join(", ")}`,
        },
      ],
      max_tokens: 300,
    });
    const reply = choices[0]?.message?.content?.trim() || "{}";
    try {
      return JSON.parse(reply.replace(/```json?\s*|\s*```/g, "")) as Record<string, string>;
    } catch {
      return {};
    }
  } catch {
    return {};
  }
}

function extractDomain(from: string): string {
  const match = from.match(/@([\w.-]+)/);
  return match ? match[1].toLowerCase() : "";
}

export function runPriceHikeAndDoubleCharge(
  emails: EmailForCFO[]
): EmailForCFO[] {
  const subscriptions = emails.filter((e) => e.category === "Subscription" && e.amount && e.amount > 0);
  const byProvider = new Map<string, typeof subscriptions>();
  for (const e of subscriptions) {
    const domain = e.senderDomain || extractDomain(e.from);
    if (!byProvider.has(domain)) byProvider.set(domain, []);
    byProvider.get(domain)!.push(e);
  }

  for (const [, items] of byProvider) {
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const priceHikeMap = new Map<string, { increase: number }>();
  const doubleChargeIds = new Set<string>();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  for (const [provider, items] of byProvider) {
    if (items.length >= 2) {
      const latest = items[0];
      const previous = items[1];
      if (latest.amount && previous.amount && latest.amount > previous.amount) {
        priceHikeMap.set(latest.id, {
          increase: latest.amount - previous.amount,
        });
      }
    }

    for (let i = 0; i < items.length - 1; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const d1 = new Date(items[i].date).getTime();
        const d2 = new Date(items[j].date).getTime();
        if (Math.abs(d1 - d2) <= thirtyDays) {
          doubleChargeIds.add(items[i].id);
          doubleChargeIds.add(items[j].id);
          break;
        }
      }
    }
  }

  return emails.map((e) => {
    const hike = priceHikeMap.get(e.id);
    return {
      ...e,
      price_hike: !!hike,
      increase_amount: hike?.increase,
      potential_error: doubleChargeIds.has(e.id),
    };
  });
}

export async function runCFOIntelligence(
  emails: EmailForCFO[]
): Promise<CFOIntelligenceOutput> {
  const subscriptions = emails.filter((e) => e.category === "Subscription");
  const refunds = emails.filter((e) => e.category === "Refund");
  const limitEmails = emails.slice(0, 100);

  let totalMonthly = 0;
  const seen = new Set<string>();
  for (const e of subscriptions) {
    if (e.amount && !seen.has(e.id)) {
      seen.add(e.id);
      totalMonthly += e.amount;
    }
  }

  let refundTotal = 0;
  const refundSeen = new Set<string>();
  for (const e of refunds) {
    if (e.amount && !refundSeen.has(e.id)) {
      refundSeen.add(e.id);
      refundTotal += e.amount;
    }
  }

  const netSpend = totalMonthly - refundTotal;

  const providerDomains = [...new Set(subscriptions.map((e) => e.senderDomain || extractDomain(e.from)))];
  const semanticMap = await categorizeWithLLM(providerDomains);

  const subscriptionsByCategory: Record<string, string[]> = {};
  for (const cat of SEMANTIC_CATEGORIES) {
    subscriptionsByCategory[cat] = [];
  }
  for (const d of providerDomains) {
    const cat = semanticMap[d] || "Other";
    if (!subscriptionsByCategory[cat]) subscriptionsByCategory[cat] = [];
    subscriptionsByCategory[cat].push(d);
  }

  const redundantCategories: { category: string; services: string[]; savingsPotential: number }[] = [];
  const byProviderAmount = new Map<string, number>();
  for (const e of subscriptions) {
    const d = e.senderDomain || extractDomain(e.from);
    byProviderAmount.set(d, (byProviderAmount.get(d) || 0) + (e.amount || 0));
  }

  for (const [cat, services] of Object.entries(subscriptionsByCategory)) {
    if (services.length >= 2 && cat !== "Other") {
      const amounts = services.map((s) => byProviderAmount.get(s) || 0);
      const minAmount = Math.min(...amounts);
      redundantCategories.push({
        category: cat,
        services,
        savingsPotential: minAmount,
      });
    }
  }

  const byProvider = new Map<string, typeof subscriptions>();
  for (const e of subscriptions) {
    const domain = e.senderDomain || extractDomain(e.from);
    if (!byProvider.has(domain)) byProvider.set(domain, []);
    byProvider.get(domain)!.push(e);
  }

  const priceHikes: { provider: string; amount: number; increase: number }[] = [];
  const doubleCharges: { provider: string; dates: string[] }[] = [];
  const ghostSubscriptions: string[] = [];
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  for (const [provider, items] of byProvider) {
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (items.length >= 2) {
      const latest = items[0];
      const previous = items[1];
      if (latest.amount && previous.amount && latest.amount > previous.amount) {
        priceHikes.push({
          provider,
          amount: latest.amount,
          increase: latest.amount - previous.amount,
        });
      }
    }

    let doubleCharged = false;
    const dates: string[] = [];
    for (let i = 0; i < items.length - 1; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (Math.abs(new Date(items[i].date).getTime() - new Date(items[j].date).getTime()) <= thirtyDays) {
          doubleCharged = true;
          dates.push(items[i].date, items[j].date);
          break;
        }
      }
      if (doubleCharged) break;
    }
    if (doubleCharged) doubleCharges.push({ provider, dates });

    const recentCharges = items.filter((e) => new Date(e.date).getTime() >= ninetyDaysAgo);
    if (recentCharges.length >= 2) {
      const allFromProvider = limitEmails.filter(
        (e) => (e.senderDomain || extractDomain(e.from)) === provider
      );
      const nonPayment = allFromProvider.filter(
        (e) => e.category !== "Subscription" || !e.amount
      );
      if (nonPayment.length === 0) ghostSubscriptions.push(provider);
    }
  }

  const invoiceDates = subscriptions
    .filter((e) => e.date)
    .map((e) => new Date(e.date).getTime());
  const nextMonthStart = Date.now();
  const nextMonthEnd = nextMonthStart + 30 * 24 * 60 * 60 * 1000;
  const avgCycleAmount = totalMonthly / Math.max(1, new Set(byProvider.keys()).size);
  const nextMonthForecast = Math.round(
    (subscriptions.length * avgCycleAmount) / Math.max(1, Math.ceil(30 / 30))
  ) || totalMonthly;

  let healthScore = 100;
  healthScore -= priceHikes.length * 8;
  healthScore -= doubleCharges.length * 15;
  healthScore -= ghostSubscriptions.length * 5;
  healthScore -= redundantCategories.length * 6;
  healthScore = Math.max(0, Math.min(100, healthScore));

  const totalRedundantSavings = redundantCategories.reduce((s, r) => s + r.savingsPotential, 0);
  const totalPriceHikeIncrease = priceHikes.reduce((s, p) => s + p.increase, 0);

  let cfoInsight = "";
  if (totalRedundantSavings > 0) {
    cfoInsight = `You could save $${totalRedundantSavings.toFixed(0)} this month by consolidating overlapping subscriptions (e.g. streaming, music, or storage). `;
  }
  if (totalPriceHikeIncrease > 0) {
    cfoInsight += `Price increases detected totalling $${totalPriceHikeIncrease.toFixed(0)}—review recent invoices for services you may want to cancel.`;
  }
  if (!cfoInsight) {
    cfoInsight = "Your subscription spending is stable. Consider auditing ghost subscriptions (recurring charges with minimal engagement) for potential savings.";
  }

  const insights: AuditInsight[] = [];
  for (const p of priceHikes) {
    insights.push({
      type: "price_hike",
      title: `Price increase: ${p.provider}`,
      description: `+$${p.increase.toFixed(2)} (now $${p.amount.toFixed(2)})`,
      provider: p.provider,
      severity: p.increase > 5 ? "high" : "medium",
      details: { amount: p.amount, increase: p.increase },
    });
  }
  for (const d of doubleCharges) {
    insights.push({
      type: "duplicate_charge",
      title: `Potential duplicate: ${d.provider}`,
      description: "Two charges within 30 days—verify if intentional.",
      provider: d.provider,
      severity: "high",
      details: { dates: d.dates },
    });
  }
  for (const g of ghostSubscriptions) {
    insights.push({
      type: "ghost_subscription",
      title: `Ghost subscription: ${g}`,
      description: "Recurring charges with no engagement emails. Consider cancelling if unused.",
      provider: g,
      severity: "medium",
    });
  }
  for (const r of redundantCategories) {
    insights.push({
      type: "redundant_spending",
      title: `Redundant spending: ${r.category}`,
      description: `${r.services.join(", ")} — keep one, save ~$${r.savingsPotential.toFixed(0)}/mo`,
      providers: r.services,
      severity: "medium",
      savingsPotential: r.savingsPotential,
    });
  }

  return {
    overview: {
      totalMonthly,
      subscriptionCount: subscriptions.length,
      potentialSavings: totalRedundantSavings + totalPriceHikeIncrease,
      netSpend,
      nextMonthForecast,
      healthScore,
      cfoInsight: cfoInsight.trim(),
    },
    insights,
    subscriptionsByCategory,
    alerts: {
      priceHikes,
      doubleCharges,
      ghostSubscriptions,
      redundantCategories,
    },
  };
}
