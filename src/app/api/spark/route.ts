import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { buildProductAIContextText } from "@/lib/vista-product-ai-context";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** VISTA Spark: one actionable spark — cancel X this week, $Y savings, chain reaction (2 more likely). */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken && !session?.refreshToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key?.trim()) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

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

    const openai = new OpenAI({ apiKey: key });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are VISTA Spark: one high-impact action that can trigger a chain reaction. Pick the single best subscription to cancel THIS WEEK. Based ONLY on the data below, output a JSON object with these exact keys (no markdown, no code fence):
- "serviceName": The service or domain to cancel (e.g. "Netflix", "spotify.com").
- "savingsAmount": Numeric monthly savings in USD (e.g. 15.99).
- "savingsCurrency": "USD" (or the currency from data).
- "oneLiner": One sentence: "This week cancel X — $Y savings." (use the actual service and amount).
- "chainReaction": One short sentence explaining how this one cancellation might lead to 1–2 more (e.g. "Dropping this often makes it easier to cancel the other streaming service you use less." or "Cancelling this trial will remind you to review the other two trials ending soon.").

If there is no clear subscription to cancel, set serviceName to "—", savingsAmount to 0, and oneLiner/chainReaction to a friendly message suggesting they connect more data or that they're already lean.

Use only the provided data. Respond in English. Output valid JSON only.`,
        },
        {
          role: "user",
          content: `User's subscription and financial context:\n\n${contextText}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    let data: {
      serviceName?: string;
      savingsAmount?: number;
      savingsCurrency?: string;
      oneLiner?: string;
      chainReaction?: string;
    };
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        serviceName: "—",
        savingsAmount: 0,
        savingsCurrency: "USD",
        oneLiner: "Connect your inbox to get your weekly spark.",
        chainReaction: "One cancellation often leads to reviewing others.",
      };
    }

    return NextResponse.json({
      serviceName: data.serviceName ?? "—",
      savingsAmount: typeof data.savingsAmount === "number" ? data.savingsAmount : 0,
      savingsCurrency: data.savingsCurrency ?? "USD",
      oneLiner: data.oneLiner ?? "",
      chainReaction: data.chainReaction ?? "",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Spark failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
