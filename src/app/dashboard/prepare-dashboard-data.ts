import type { EmailPreview } from "@/app/actions/gmail";
import type { SubscriptionRow } from "@/components/dashboard-premium/subscription-feed";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Future value of monthly investment at 8% for 30 years (simplified). */
export function retirementImpact(monthlyUsd: number, annualReturn = 0.08, years = 30): number {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  if (monthlyRate <= 0) return monthlyUsd * months;
  const fv = monthlyUsd * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  return Math.round(fv);
}

export interface CashFlowDay {
  date: string;
  label: string;
  amount: number;
  services: string[];
}

/** Predict charges for next 60 days from last 12 months of subscription dates/amounts. */
export function buildCashFlowPredictions(emails: EmailPreview[]): CashFlowDay[] {
  const subs = emails.filter((e) => e.category === "Subscription" && e.amount && e.amount > 0);
  const byDomain = new Map<string, { amount: number; chargeDays: number[] }>();
  for (const e of subs) {
    const domain = e.senderDomain || e.from.replace(/.*@/, "").toLowerCase() || "other";
    const d = new Date(e.date);
    const day = d.getDate();
    if (!byDomain.has(domain)) {
      byDomain.set(domain, { amount: e.amount ?? 0, chargeDays: [] });
    }
    const rec = byDomain.get(domain)!;
    rec.chargeDays.push(day);
    if ((e.amount ?? 0) > rec.amount) rec.amount = e.amount ?? 0;
  }
  const now = new Date();
  const dayMap = new Map<string, { amount: number; services: string[] }>();
  for (let i = 0; i < 60; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { amount: 0, services: [] });
  }
  for (const [domain, { amount, chargeDays }] of byDomain.entries()) {
    const typicalDay = chargeDays.length > 0
      ? Math.round(chargeDays.reduce((a, b) => a + b, 0) / chargeDays.length)
      : 15;
    const displayName = domain.replace(/^(www\.|mail\.)/, "");
    for (let i = 0; i < 60; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      if (d.getDate() === typicalDay || (typicalDay > 28 && d.getDate() >= 28)) {
        const key = d.toISOString().slice(0, 10);
        const cur = dayMap.get(key);
        if (cur) {
          cur.amount += amount;
          cur.services.push(displayName);
        }
      }
    }
  }
  return [...dayMap.entries()]
    .filter(([, v]) => v.amount > 0)
    .map(([date, v]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
      amount: v.amount,
      services: v.services,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface GracePeriodAlert {
  service: string;
  subject: string;
  date: string;
  expiresAt?: string;
  countdownDays?: number;
}

/** Find 'payment failed' / 'action required' emails and infer grace period. */
export function buildGracePeriodAlerts(emails: EmailPreview[]): GracePeriodAlert[] {
  const failed = emails.filter((e) => {
    const s = (e.subject + " " + (e as { snippet?: string }).snippet).toLowerCase();
    return (
      /payment failed|action required|update your payment|your card was declined|payment method|grace period|account suspended|reactivate/i.test(s)
    );
  });
  const now = new Date();
  return failed.slice(0, 10).map((e) => {
    const domain = e.senderDomain || e.from.replace(/.*@/, "").toLowerCase() || "unknown";
    const service = domain.replace(/^(www\.|mail\.)/, "");
    const d = new Date(e.date);
    d.setDate(d.getDate() + 7);
    const expiresAt = d.toISOString().slice(0, 10);
    const countdownDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      service,
      subject: e.subject.slice(0, 60),
      date: e.date,
      expiresAt,
      countdownDays: countdownDays > 0 ? countdownDays : 0,
    };
  });
}

export interface HighChurnService {
  domain: string;
  displayName: string;
  suggestion: string;
}

/** Flag services sending 'we miss you' / 'special offer' as high-churn opportunity. */
export function buildHighChurnOpportunities(emails: EmailPreview[]): HighChurnService[] {
  const subs = emails.filter((e) => {
    const s = (e.subject + " " + (e as { snippet?: string }).snippet).toLowerCase();
    return /we miss you|special offer|come back|exclusive offer|discount for you|win you back|we want you back/i.test(s);
  });
  const byDomain = new Map<string, number>();
  for (const e of subs) {
    const domain = e.senderDomain || e.from.replace(/.*@/, "").toLowerCase() || "unknown";
    byDomain.set(domain, (byDomain.get(domain) ?? 0) + 1);
  }
  return [...byDomain.entries()]
    .filter(([, count]) => count >= 1)
    .map(([domain]) => ({
      domain,
      displayName: domain.replace(/^(www\.|mail\.)/, ""),
      suggestion: "They are desperate to keep you; ask for a 50% discount via VISTA Pro.",
    }))
    .slice(0, 5);
}

function getLast6Months(): { year: number; month: number; label: string }[] {
  const out: { year: number; month: number; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: MONTHS[d.getMonth()],
    });
  }
  return out;
}

export function buildDonutData(emails: EmailPreview[]): { name: string; value: number }[] {
  const subs = emails.filter((e) => e.category === "Subscription" && e.amount && e.amount > 0);
  const byDomain = new Map<string, number>();
  for (const e of subs) {
    const domain = e.senderDomain || e.from.replace(/.*@/, "").toLowerCase() || "other";
    byDomain.set(domain, (byDomain.get(domain) ?? 0) + (e.amount ?? 0));
  }
  return [...byDomain.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value]) => ({ name, value }));
}

export function buildBurnRateData(emails: EmailPreview[]): { month: string; spend: number; fullLabel: string }[] {
  const subs = emails.filter((e) => e.category === "Subscription" && e.amount != null);
  const months = getLast6Months();
  return months.map(({ year, month, label }) => {
    const spend = subs
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, e) => sum + (e.amount ?? 0), 0);
    return {
      month: label,
      spend,
      fullLabel: `${label} ${year}`,
    };
  });
}

const LAST_6_MONTH_LABELS = getLast6Months();

export function buildSubscriptionRows(
  emails: EmailPreview[],
  ghostSubscriptions: string[] = []
): SubscriptionRow[] {
  const subs = emails.filter((e) => e.category === "Subscription");
  const byDomain = new Map<
    string,
    { emails: EmailPreview[]; totalAmount: number; currency: string }
  >();
  for (const e of subs) {
    const domain = e.senderDomain || e.from.replace(/.*@/, "").toLowerCase() || "unknown";
    if (!byDomain.has(domain)) {
      byDomain.set(domain, { emails: [], totalAmount: 0, currency: e.currency ?? "USD" });
    }
    const rec = byDomain.get(domain)!;
    rec.emails.push(e);
    if (e.amount && e.amount > 0) rec.totalAmount += e.amount;
  }

  const now = new Date();
  const rows: SubscriptionRow[] = [];
  for (const [domain, { emails: groupEmails, totalAmount, currency }] of byDomain.entries()) {
    const sorted = [...groupEmails].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latest = sorted[0];
    const lastDate = new Date(latest.date);
    const lastActiveDaysAgo = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isGhost =
      ghostSubscriptions.some((g) => domain.includes(g) || g.includes(domain)) ||
      lastActiveDaysAgo > 90;
    const priceHike = groupEmails.some((e) => e.price_hike);
    const cancellationUrl = groupEmails.find((e) => e.cancellation_url)?.cancellation_url;
    const latestAmount = latest.amount ?? (groupEmails.find((e) => e.amount)?.amount ?? 0);
    const monthlyUsd = latestAmount > 0 ? latestAmount : totalAmount;

    const sparklineData = LAST_6_MONTH_LABELS.map(({ year, month, label }) => {
      const spend = groupEmails
        .filter((e) => {
          const d = new Date(e.date);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((s, e) => s + (e.amount ?? 0), 0);
      return { month: label, value: spend };
    });

    rows.push({
      domain,
      displayName: domain.replace(/^(www\.|mail\.)/, ""),
      amount: monthlyUsd,
      currency: latest.currency ?? currency,
      lastActive: latest.date,
      lastActiveDaysAgo,
      isGhost,
      priceHike,
      cancellationUrl,
      emailCount: groupEmails.length,
      sparklineData,
      retirementImpact: retirementImpact(monthlyUsd),
    });
  }
  rows.sort((a, b) => b.amount - a.amount);
  return rows;
}
