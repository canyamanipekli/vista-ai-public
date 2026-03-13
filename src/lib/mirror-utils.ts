/**
 * VISTA Mirror — simulated comparison with "similar users" (no real peer data).
 * Uses brackets to show percentile-style messaging for awareness.
 */

export interface MirrorInput {
  totalMonthly: number;
  potentialSavings: number;
  subscriptionCount: number;
}

export interface MirrorResult {
  /** e.g. "top 10% saver" / "average" / "top 20% spender" */
  spendingTier: "low" | "average" | "high";
  /** Short label for UI */
  tierLabel: string;
  /** e.g. "You spend 40% more than similar users" or "You're in the top 10% savers" */
  comparisonMessage: string;
  /** Optional second line */
  secondaryMessage: string | null;
}

const SIMILAR_AVG_MONTHLY = 72;

export function computeMirror(input: MirrorInput): MirrorResult {
  const { totalMonthly, potentialSavings, subscriptionCount } = input;
  const effectiveSpend = totalMonthly;

  if (effectiveSpend <= 0) {
    return {
      spendingTier: "low",
      tierLabel: "Connect Gmail to see your mirror",
      comparisonMessage: "Your subscription mirror will show how you compare to similar users.",
      secondaryMessage: null,
    };
  }

  const pctVsSimilar =
    SIMILAR_AVG_MONTHLY > 0
      ? Math.round(((effectiveSpend - SIMILAR_AVG_MONTHLY) / SIMILAR_AVG_MONTHLY) * 100)
      : 0;

  if (effectiveSpend < 40) {
    return {
      spendingTier: "low",
      tierLabel: "Top 10% saver",
      comparisonMessage: `You spend less than most. Similar users average $${SIMILAR_AVG_MONTHLY}/mo on subscriptions.`,
      secondaryMessage: "You're in the top 10% for subscription discipline.",
    };
  }

  if (effectiveSpend <= 90) {
    return {
      spendingTier: "average",
      tierLabel: "In the middle",
      comparisonMessage:
        pctVsSimilar >= 0
          ? `You're within the typical range (similar users ~$${SIMILAR_AVG_MONTHLY}/mo).`
          : `You spend ${Math.abs(pctVsSimilar)}% less than the typical similar user.`,
      secondaryMessage:
        potentialSavings > 0
          ? `You could save $${Math.round(potentialSavings * 12)}/year by optimizing.`
          : null,
    };
  }

  return {
    spendingTier: "high",
    tierLabel: "Top 20% spender",
    comparisonMessage: `You spend ${pctVsSimilar}% more on subscriptions than similar users (avg $${SIMILAR_AVG_MONTHLY}/mo).`,
    secondaryMessage:
      potentialSavings > 0
        ? `Optimizing could save you $${Math.round(potentialSavings * 12)}/year.`
        : "Small cuts can bring you closer to the norm.",
  };
}
