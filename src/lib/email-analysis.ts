export interface EmailPreviewForAnalysis {
  id: string;
  category?: string;
  amount?: number;
  alertType?: "trial" | "price_increase" | "free_ends";
}

const SUBSCRIPTION_KEYWORDS = [
  "subscription",
  "invoice",
  "payment",
  "receipt",
  "renew",
  "billing",
];

const ALERT_PATTERNS = [
  { type: "trial" as const, regex: /trial|free trial/gi },
  {
    type: "free_ends" as const,
    regex: /free period ends|trial ends|trial expir/gi,
  },
  {
    type: "price_increase" as const,
    regex: /price increase|rate change|rate increase/gi,
  },
];

const AMOUNT_REGEX =
  /(?:\$|€|£|₺|USD|EUR|TRY)\s*([\d,.]+)|([\d,.]+)\s*(?:\$|€|£|₺|USD|EUR|TRY)/g;

export function extractSenderDomain(from: string): string {
  const match = from.match(/@([\w.-]+)/);
  return match ? match[1].toLowerCase() : "";
}

export function categorizeByKeywords(
  subject: string,
  bodyText?: string
): string | undefined {
  const text = `${subject} ${bodyText || ""}`.toLowerCase();
  const isSubscription = SUBSCRIPTION_KEYWORDS.some((kw) =>
    text.includes(kw.toLowerCase())
  );
  return isSubscription ? "Subscription" : undefined;
}

export function detectAlert(bodyText: string): EmailPreviewForAnalysis["alertType"] {
  for (const { type, regex } of ALERT_PATTERNS) {
    if (regex.test(bodyText)) return type;
  }
  return undefined;
}

export function extractAmount(
  text: string
): { amount: number; currency: string } | null {
  const matches = [...text.matchAll(AMOUNT_REGEX)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1];
  let numStr = (last[1] || last[2] || "").trim();
  if (/^\d+,\d{2}$/.test(numStr)) numStr = numStr.replace(",", ".");
  else numStr = numStr.replace(/,/g, "");
  const amount = parseFloat(numStr);
  if (isNaN(amount)) return null;
  const currency = text.includes("€") || text.includes("EUR")
    ? "EUR"
    : text.includes("£")
      ? "GBP"
      : text.includes("₺") || text.includes("TRY")
        ? "TRY"
        : "USD";
  return { amount, currency };
}

export function getFinancialOverview(emails: EmailPreviewForAnalysis[]) {
  const subscriptions = emails.filter((e) => e.category === "Subscription");
  const refunds = emails.filter((e) => e.category === "Refund");

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

  const alerts = emails.filter((e) => e.alertType);
  const potentialSavings = alerts
    .filter((e) => e.amount)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return {
    totalMonthly,
    subscriptionCount: subscriptions.length,
    potentialSavings,
    netSpend,
  };
}
