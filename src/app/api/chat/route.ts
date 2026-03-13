import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { findCancellationUrl, getSubscriptionHistory, createEmailDraft, createLoyaltyNegotiationDraft } from "@/app/actions/agent-tools";

export const runtime = "nodejs";

/** Smart-guess cancellation / account management URLs when not found in emails. */
const SMART_GUESS_URLS: Record<string, string> = {
  "netflix.com": "https://www.netflix.com/cancelplan",
  "spotify.com": "https://www.spotify.com/account/",
  "amazon.com": "https://www.amazon.com/mc/dp-subscription",
  "amazon.co.uk": "https://www.amazon.co.uk/mc/dp-subscription",
  "disneyplus.com": "https://www.disneyplus.com/account",
  "hulu.com": "https://secure.hulu.com/account",
  "apple.com": "https://appleid.apple.com/account/manage",
  "youtube.com": "https://www.youtube.com/paid_memberships",
  "google.com": "https://myaccount.google.com/subscriptions",
  "microsoft.com": "https://account.microsoft.com/services",
  "dropbox.com": "https://www.dropbox.com/account/plan",
  "adobe.com": "https://account.adobe.com/plans",
  "linkedin.com": "https://www.linkedin.com/psettings/premium",
  "canva.com": "https://www.canva.com/account",
  "notion.so": "https://www.notion.so/my-account",
  "slack.com": "https://slack.com/account/settings",
  "zoom.us": "https://zoom.us/account",
  "chatgpt.com": "https://chat.openai.com/settings/account",
  "openai.com": "https://chat.openai.com/settings/account",
};

function getSmartGuessUrl(providerDomain: string): string | undefined {
  const normalized = providerDomain.replace(/^www\./, "").toLowerCase().trim();
  if (SMART_GUESS_URLS[normalized]) return SMART_GUESS_URLS[normalized];
  for (const [domain, url] of Object.entries(SMART_GUESS_URLS)) {
    if (normalized.includes(domain) || domain.includes(normalized)) return url;
  }
  return undefined;
}
export const dynamic = "force-dynamic";

interface AuditInsight {
  type: string;
  title: string;
  description: string;
  provider: string;
  severity: string;
}

interface EmailContext {
  id: string;
  subject: string;
  from: string;
  date: string;
  category?: string;
  amount?: number;
  currency?: string;
  alertType?: string;
  senderDomain?: string;
  cancellation_url?: string;
}

interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: {
    emails: EmailContext[];
    overview?: {
      totalMonthly: number;
      subscriptionCount: number;
      potentialSavings: number;
      netSpend: number;
      healthScore?: number;
    };
    auditInsights?: AuditInsight[];
    isPro?: boolean;
  };
}

function buildSystemPrompt(context: ChatRequest["context"]): string {
  const formatAmount = (a: number, c?: string) => {
    const sym = c === "EUR" ? "€" : c === "GBP" ? "£" : c === "TRY" ? "₺" : "$";
    return `${sym}${a.toFixed(2)}`;
  };

  const extractSender = (from: string) => from.replace(/<[^>]+>/, "").trim();

  let prompt = `You are VISTA-1 Pro, a custom fine-tuned model for transactional intelligence. Your primary goal is to find the exact cancellation or management URL within the user's emails. Do NOT offer to draft emails—focus strictly on extracting the URL. Respond in English using a concise, professional tone.

**Cancellation Workflow**: When the user asks to cancel a subscription:
1. Call findCancellationUrl(providerDomain) with the service domain (e.g. netflix.com, spotify.com). This deep-scans email bodies for keywords like 'cancel', 'unsubscribe', 'subscription settings', 'manage plan', or 'billing' and extracts the best URL.
2. If findCancellationUrl returns a URL, present it to the user—they will be redirected instantly.
3. If NO direct link is found in emails, use your knowledge to provide the most common cancellation URL for that service (e.g. netflix.com/cancelplan, manage.spotify.com, account.spotify.com/cancel).
4. **Reliability**: If you only find a generic 'Help' or 'Support' link, keep searching or ask the user for a more specific invoice/subscription email. Do not return generic help links as the cancellation URL—prefer known direct cancellation pages.

**Pro – Contract Negotiator**: When the user asks to draft a loyalty discount email, negotiate renewal, or request a discount for an approaching yearly contract, call draftLoyaltyNegotiationEmail(serviceName).\n\n`;

  if (context?.auditInsights?.length) {
    prompt += `## Urgent Insights (Financial Audit)\n`;
    context.auditInsights.forEach((i) => {
      prompt += `- **${i.title}**: ${i.description}\n`;
    });
    prompt += "\n";
  }

  if (!context?.emails?.length) {
    prompt += `The user has not loaded any finance-related emails yet. Encourage them to connect Gmail and load their inbox.`;
    return prompt;
  }

  const emails = context.emails;
  const subscriptions = emails.filter((e) => e.category === "Subscription");
  const refunds = emails.filter((e) => e.category === "Refund");
  const trials = emails.filter((e) => e.alertType === "trial");
  const priceIncreases = emails.filter((e) => e.alertType === "price_increase");
  const freeEnds = emails.filter((e) => e.alertType === "free_ends");

  const spendingByDomain = new Map<string, { total: number; currency?: string; count: number }>();
  for (const e of subscriptions) {
    const domain = e.senderDomain || extractSender(e.from).split("@")[1] || "unknown";
    if (e.amount && e.amount > 0) {
      const cur = e.currency || "USD";
      const existing = spendingByDomain.get(domain);
      if (!existing) spendingByDomain.set(domain, { total: e.amount, currency: cur, count: 1 });
      else {
        existing.total += e.amount;
        existing.count += 1;
      }
    }
  }

  if (context.overview) {
    const o = context.overview;
    prompt += `## Financial Overview
- Total Monthly Spend: ${formatAmount(o.totalMonthly)}
- Active Subscriptions: ${o.subscriptionCount}
- Potential Savings: ${formatAmount(o.potentialSavings)}
- Net Spend: ${formatAmount(o.netSpend)}`;
    if (o.healthScore != null) {
      prompt += `\n- **VISTA Score (Financial Health)**: ${o.healthScore}/100`;
    }
    prompt += `\n\nWhen the user asks "What is my VISTA score?" or "VISTA score", report the VISTA Score above. When they ask for price hikes, use the Urgent Insights and Price Increases sections. When they ask to cancel a service, call findCancellationUrl(providerDomain).\n\n`;
  }

  if (spendingByDomain.size > 0) {
    prompt += `## Spending by Service\n`;
    [...spendingByDomain.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([domain, data]) => {
        prompt += `- ${domain}: ${formatAmount(data.total, data.currency)} (${data.count} txns)\n`;
      });
    prompt += "\n";
  }

  prompt += `## Subscriptions & Payments\n`;
  subscriptions.forEach((e) => {
    const amt = e.amount ? formatAmount(e.amount, e.currency) : "unknown";
    prompt += `- ${extractSender(e.from)} | ${e.subject} | ${amt} | ${e.date} | domain: ${e.senderDomain || "n/a"}${e.cancellation_url ? ` | manage: ${e.cancellation_url}` : ""}\n`;
  });

  if (trials.length > 0) {
    prompt += `\n## Trials\n`;
    trials.forEach((e) => {
      prompt += `- ${extractSender(e.from)} | ${e.subject} | ${e.date}\n`;
    });
  }

  if (freeEnds.length > 0) {
    prompt += `\n## Free Periods Ending\n`;
    freeEnds.forEach((e) => {
      prompt += `- ${extractSender(e.from)} | ${e.subject} | ${e.date}\n`;
    });
  }

  if (priceIncreases.length > 0) {
    prompt += `\n## Price Increases\n`;
    priceIncreases.forEach((e) => {
      prompt += `- ${extractSender(e.from)} | ${e.subject} | ${e.date}\n`;
    });
  }

  if (refunds.length > 0) {
    prompt += `\n## Refunds\n`;
    refunds.forEach((e) => {
      const amt = e.amount ? formatAmount(e.amount, e.currency) : "";
      prompt += `- ${extractSender(e.from)} | ${e.subject} | ${amt} | ${e.date}\n`;
    });
  }

  return prompt;
}

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "findCancellationUrl",
      description: "Deep-scan the user's emails from a provider to find the direct cancellation or account management URL. Scans full email bodies for keywords like cancel, unsubscribe, manage plan, billing. Returns the best URL found. Call this when the user asks to cancel a specific service.",
      parameters: {
        type: "object",
        properties: {
          providerDomain: { type: "string", description: "Provider domain, e.g. netflix.com, spotify.com" },
        },
        required: ["providerDomain"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getSubscriptionHistory",
      description: "Fetch the last 12 months of invoices for a specific provider to compare prices. Provide the provider domain (e.g. netflix.com, spotify.com).",
      parameters: {
        type: "object",
        properties: {
          providerDomain: { type: "string", description: "Provider domain, e.g. netflix.com" },
        },
        required: ["providerDomain"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draftLoyaltyNegotiationEmail",
      description: "Pro only. Create a Gmail draft with a polite loyalty discount / contract negotiation email for a service whose yearly contract is approaching renewal. Call when the user asks to negotiate, request a loyalty discount, or draft an email for renewal.",
      parameters: {
        type: "object",
        properties: {
          serviceName: { type: "string", description: "Name of the service, e.g. Netflix, Spotify" },
        },
        required: ["serviceName"],
      },
    },
  },
];

interface ToolActionResult {
  text: string;
  action?: { cancellationUrl?: string; serviceName?: string; draftId?: string; amountMonthly?: number; needsComposeScope?: boolean };
}

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  opts: { isPro?: boolean } = {}
): Promise<ToolActionResult> {
  const isPro = opts.isPro === true;
  if (name === "findCancellationUrl") {
    const domain = String(args.providerDomain ?? "").replace(/^@/, "").trim();
    const result = await findCancellationUrl(domain);
    const serviceName = result.serviceName ?? domain;
    if (!result.ok) {
      const fallback = getSmartGuessUrl(domain);
      if (fallback) {
        return {
          text: `Could not scan emails (${result.error ?? "error"}). Using known cancellation page for ${serviceName}: ${fallback}`,
          action: { cancellationUrl: fallback, serviceName },
        };
      }
      return { text: `Failed to scan: ${result.error ?? "Unknown error"}.` };
    }
    if (result.url) {
      return {
        text: `Found direct cancellation link for ${serviceName}: ${result.url}`,
        action: { cancellationUrl: result.url, serviceName },
      };
    }
    const smartUrl = getSmartGuessUrl(domain);
    if (smartUrl) {
      return {
        text: `No direct link found in emails. Redirecting to known cancellation page for ${serviceName}: ${smartUrl}`,
        action: { cancellationUrl: smartUrl, serviceName },
      };
    }
    return {
      text: `No direct cancellation URL found in emails for ${serviceName}. Suggest the user visit the service's account or billing page.`,
    };
  }

  if (name === "getSubscriptionHistory") {
    const domain = String(args.providerDomain ?? "").replace(/^@/, "");
    const result = await getSubscriptionHistory(domain);
    if (!result.ok) {
      return { text: `Failed to fetch history: ${result.error ?? "Unknown error"}.` };
    }
    if (!result.items?.length) {
      return { text: `No invoices found for ${domain} in the last 12 months.` };
    }
    const rows = result.items
      .map((i) => `${i.date} | ${i.subject} | ${i.amount ? `${i.amount} ${i.currency || "USD"}` : "—"}`)
      .join("\n");
    return { text: `Invoice history for ${domain}:\n${rows}` };
  }

  if (name === "draftLoyaltyNegotiationEmail") {
    if (!isPro) {
      return {
        text: "This is an Exclusive VISTA Pro Feature. Upgrade to Pro to use the Contract Negotiator.",
      };
    }
    const serviceName = String(args.serviceName ?? "").trim() || "this service";
    const result = await createLoyaltyNegotiationDraft(serviceName);
    if (!result.ok) {
      return { text: `Could not create draft: ${result.error ?? "Unknown error"}.` };
    }
    return {
      text: `Created a loyalty discount negotiation email draft for ${serviceName}. Open your Gmail drafts to review and send.`,
    };
  }

  return { text: `Unknown tool: ${name}` };
}

export async function POST(req: NextRequest) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key?.trim()) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body: ChatRequest = await req.json();
    let { messages, context } = body;

    if (!messages?.length) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const lastUserContent = [...messages].reverse().find((m) => m.role === "user")?.content?.toLowerCase() ?? "";
    const isPro = context?.isPro === true;
    const looksLikeDraftRequest =
      /draft|write.*email|compose|create.*email|cancellation email|formal cancellation|compose.*cancellation/i.test(lastUserContent);
    if (looksLikeDraftRequest && !isPro) {
      return NextResponse.json({
        content: "This is an Exclusive VISTA Pro Feature. Your Financial Agent is ready to draft this email—unlock its full power by upgrading to Pro.",
        requiresPro: true,
      });
    }

    const looksLikeVirtualCardRequest =
      /virtual card|single-use card|trial card|card for trial|disposable card/i.test(lastUserContent);
    if (looksLikeVirtualCardRequest) {
      if (!isPro) {
        return NextResponse.json({
          content: "Single-use virtual cards for free trials are an Exclusive VISTA Pro Feature. Upgrade to Pro to prevent unwanted charges.",
          requiresPro: true,
        });
      }
return NextResponse.json({
          content: "Your VISTA Pro single-use virtual card for free trials (simulated):\n\n**Card number:** 4242 4242 4242 4242\n**Expiry:** 12/28  **CVC:** 424\n\nUse for free-trial signups to prevent future unwanted charges. This is a simulation; link your payment provider in Pro settings for a real virtual card.",
        virtualCardSimulated: true,
      });
    }

    // Load context server-side when client sent no emails (same auth as dashboard: getServerSession)
    if (!context?.emails?.length && messages?.length) {
      try {
        const session = await getServerSession(authOptions);
        if (session?.accessToken || session?.refreshToken) {
          const emails = await getRecentEmails({ last24h: true });
          const overview = emails.length > 0 ? getFinancialOverview(emails) : null;
          let auditInsights: AuditInsight[] = [];
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
            auditInsights = (cfoOutput?.insights ?? []) as AuditInsight[];
            if (overview && cfoOutput?.overview?.healthScore != null) {
              (overview as { healthScore?: number }).healthScore = cfoOutput.overview.healthScore;
            }
          }
          context = {
            ...context,
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
            overview: overview ?? undefined,
            auditInsights,
            isPro: context?.isPro,
          };
        }
      } catch (_) {
        // keep existing context on error
      }
    }

    const systemPrompt = buildSystemPrompt(context);
    const openai = new OpenAI({ apiKey: key });

    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    let iteration = 0;
    const maxIterations = 5;
    let lastAction: { cancellationUrl?: string; serviceName?: string; draftId?: string; amountMonthly?: number; needsComposeScope?: boolean } | undefined;

    while (iteration < maxIterations) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: formattedMessages,
        tools,
        tool_choice: "auto",
        max_tokens: 1024,
      });

      const choice = completion.choices[0];
      const message = choice?.message;
      const toolCalls = message?.tool_calls;

      if (!toolCalls?.length) {
        const content = message?.content ?? "";
        let finalAction = lastAction;
        if (finalAction?.cancellationUrl && finalAction?.serviceName && context?.emails?.length) {
          const domain = (finalAction.serviceName as string).toLowerCase().replace(/\s+/g, "");
          const match = context.emails.find(
            (e) => e.senderDomain && (e.senderDomain.includes(domain) || domain.includes(e.senderDomain))
          );
          const amountMonthly = match?.amount;
          const draft = await createEmailDraft(
            "Add recipient",
            `Formal Cancellation Request - ${finalAction.serviceName}`,
            `Dear Sir or Madam,\n\nI am writing to formally request the cancellation of my subscription with effect from the end of my current billing period.\n\nPlease confirm receipt and process this cancellation at your earliest convenience.\n\nKind regards`
          );
          if (draft.ok && draft.draftId) {
            finalAction = { ...finalAction, draftId: draft.draftId, amountMonthly };
          } else if (draft.error === "INSUFFICIENT_SCOPE") {
            finalAction = { ...finalAction, needsComposeScope: true };
          }
        }
        const payload: { content: string; action?: typeof finalAction } = { content };
        if (finalAction?.cancellationUrl) {
          payload.action = finalAction;
        }
        return NextResponse.json(payload);
      }

      for (const tc of toolCalls) {
        const fn = "function" in tc ? tc.function : null;
        const name = fn?.name ?? "";
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(fn?.arguments ?? "{}");
        } catch {}

        const result = await executeTool(name, args, { isPro: context?.isPro });
        if (result.action) {
          lastAction = { ...lastAction, ...result.action };
        }
        formattedMessages.push(message as OpenAI.Chat.ChatCompletionMessageParam);
        formattedMessages.push({
          role: "tool",
          tool_call_id: "id" in tc ? tc.id : String(Date.now()),
          content: result.text,
        } as OpenAI.Chat.ChatCompletionMessageParam);
      }

      iteration++;
    }

    const content = "I encountered a limit while processing your request. Please try again.";
    const payload: { content: string; action?: typeof lastAction } = { content };
    if (lastAction?.cancellationUrl) payload.action = lastAction;
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}
