import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { loadInsightContext, type InsightProduct } from "@/lib/insight-api-context";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PRODUCTS: InsightProduct[] = [
  "weather", "garden", "canvas", "zero", "ghost", "ritual",
  "mirror", "shadow", "time-machine", "virtual-card",
];

function getSystemPrompt(product: InsightProduct): string {
  const base = "You are a VISTA product. Based ONLY on the user's subscription and financial data below, output a JSON object. Use only the provided data. Respond in English. No markdown, no code fence. Valid JSON only.\n\n";
  switch (product) {
    case "weather":
      return base + `Product: VISTA Weather (subscription weather). Output: { "summary": "One sentence: is their subscription climate sunny, stormy, or foggy and why.", "tip": "One short actionable tip." }`;
    case "garden":
      return base + `Product: VISTA Garden (subscriptions as plants). Output: { "summary": "One sentence on which subscriptions to water (keep) and which to uproot (cancel).", "water": ["service1", "service2"], "uproot": ["service3"] }. water = keep, uproot = cancel. Use up to 5 items each, use domain or service names from the data.`;
    case "canvas":
      return base + `Product: VISTA Canvas (subscription life as a painting). Output: { "story": "Two or three sentences describing their subscription life as a painting—brushstrokes, colors, what to erase or keep. Poetic but concise." }`;
    case "zero":
      return base + `Product: VISTA Zero (path to zero wasted spend). Output: { "message": "One encouraging sentence on their path to zero waste.", "nextStep": "One concrete next step (e.g. cancel X, or review trials)." }`;
    case "ghost":
      return base + `Product: VISTA Ghost (ghost subscription hunt). Output: { "summary": "One sentence on their ghost-hunt status.", "topGhosts": ["domain1", "domain2"] } — up to 5 likely ghost or forgotten subscriptions from the data.`;
    case "ritual":
      return base + `Product: VISTA Ritual (5-minute monthly subscription ritual). Output: { "focus": "One sentence: what to focus on this month.", "oneLiner": "A short ritual mantra (e.g. 'Review, trim, stay in control.')." }`;
    case "mirror":
      return base + `Product: VISTA Mirror (compare with similar users). Output: { "comparison": "One or two sentences: how they compare to similar users (spend, count, health).", "oneLiner": "One memorable line (your financial mirror)." }`;
    case "shadow":
      return base + `Product: VISTA Shadow (the you that never subscribed). Output: { "narrative": "Two sentences: who is the shadow self that never subscribed, and what's the gap between user and shadow.", "gap": "One sentence: the main gap to close (money or habits)." }`;
    case "time-machine":
      return base + `Product: VISTA Time Machine (subscription future). Output: { "oneYear": "One sentence: their subscription life in 1 year if nothing changes.", "fiveYear": "One sentence: 5 years out.", "tenYear": "One sentence: 10 years out." }`;
    case "virtual-card":
      return base + `Product: VISTA Virtual Card (secure card for subscriptions). Output: { "tip": "One short security or usage tip for virtual cards.", "status": "One sentence: their subscription payment health (e.g. how many services, any risk)." }`;
    default:
      return base + `Output: { "message": "No insight for this product." }`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key?.trim()) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    let body: { product?: string } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const product = (body.product ?? "").trim() as InsightProduct;
    if (!product || !PRODUCTS.includes(product)) {
      return NextResponse.json({ error: "Missing or invalid product" }, { status: 400 });
    }

    const ctx = await loadInsightContext();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const openai = new OpenAI({ apiKey: key });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: getSystemPrompt(product) },
        { role: "user", content: `User's data:\n\n${ctx.contextText}` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { message: "Unable to generate insight." };
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Insight failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
