import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, getFinancialOverview } from "@/app/actions/gmail";
import { runCFOIntelligence } from "@/lib/cfo-intelligence";
import { buildProductAIContextText } from "@/lib/vista-product-ai-context";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** VISTA Compass: one direction — cancel / negotiate / keep. "Your financial north." */
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
          content: `You are VISTA Compass: the user's financial north. Give exactly ONE recommended direction for the most impactful action right now. Based ONLY on the data below, output a JSON object with these exact keys (no markdown, no code fence):
- "direction": Exactly one of "cancel", "negotiate", or "keep". Choose the single most sensible move (e.g. cancel a redundant or unused subscription, negotiate a discount on an expensive one, or keep everything as is if healthy).
- "serviceName": The main service or domain this direction applies to (e.g. "Netflix", "spotify.com"). Use "—" if direction is "keep" and no specific service.
- "reason": One clear sentence explaining why this is the best move now.
- "oneLiner": A short, memorable phrase for "your financial north" (e.g. "Cancel Spotify — you haven't used it in 4 months." or "Negotiate Adobe — renewal in 2 weeks." or "Keep as is — you're in good shape.").

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
    let data: { direction?: string; serviceName?: string; reason?: string; oneLiner?: string };
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        direction: "keep",
        serviceName: "—",
        reason: "Not enough data yet. Connect your inbox to get a clear direction.",
        oneLiner: "Your financial north: connect your inbox first.",
      };
    }

    const direction = ["cancel", "negotiate", "keep"].includes(String(data.direction)) ? data.direction : "keep";

    return NextResponse.json({
      direction,
      serviceName: data.serviceName ?? "—",
      reason: data.reason ?? "",
      oneLiner: data.oneLiner ?? "",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Compass failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
