import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { buildProductAIContextText } from "@/lib/vista-product-ai-context";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** VISTA Oracle: prophecy + risk. Prediction (e.g. Q2 new subs) and top 3 riskiest trials. */
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
          content: `You are VISTA Oracle: prophecy and risk for the user's subscription life. Based ONLY on the data below, output a JSON object with these exact keys (no markdown, no code fence):
- "prediction": One short sentence predicting subscription behavior (e.g. "Based on your habits, you're likely to add 2 new subscriptions in Q2." or "Your spending is stable; no new subscriptions predicted this quarter."). Be specific and data-driven.
- "riskAlert": One short sentence about the main risk (e.g. "You tend to forget to cancel trials." or "No high-risk trials detected.").
- "topTrials": An array of up to 3 objects, each with "name" (service/domain name) and "reason" (one line why it's risky). If there are no trials or no risky ones, use an empty array [].

Use only the provided data. Respond in English. Output valid JSON only.`,
        },
        {
          role: "user",
          content: `User's subscription and financial context:\n\n${contextText}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    let data: { prediction?: string; riskAlert?: string; topTrials?: { name: string; reason: string }[] };
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        prediction: "Unable to generate prediction from current data.",
        riskAlert: "Connect your inbox and load more subscription data for risk insights.",
        topTrials: [],
      };
    }

    return NextResponse.json({
      prediction: data.prediction ?? "",
      riskAlert: data.riskAlert ?? "",
      topTrials: Array.isArray(data.topTrials) ? data.topTrials.slice(0, 3) : [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Oracle failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
