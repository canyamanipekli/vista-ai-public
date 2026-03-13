"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { gmail } from "@googleapis/gmail";
import { OAuth2Client } from "google-auth-library";
import { extractAmount } from "@/lib/email-analysis";
import { scanForCancellationUrl } from "@/app/actions/gmail";

export async function findCancellationUrl(
  providerDomain: string
): Promise<{ ok: boolean; url?: string; serviceName?: string; error?: string }> {
  const result = await scanForCancellationUrl(providerDomain);
  if (result.error) return { ok: false, error: result.error };
  return {
    ok: true,
    url: result.url,
    serviceName: result.serviceName ?? providerDomain,
  };
}

export async function createEmailDraft(
  to: string,
  subject: string,
  body: string
): Promise<{ ok: boolean; draftId?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken && !session?.refreshToken) {
      return { ok: false, error: "Not signed in" };
    }

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });
    const gmailClient = gmail({ version: "v1", auth: oauth2Client });

    const toAddr = to.replace(/^.*<([^>]+)>.*$/, "$1").trim() || to;

    const raw = Buffer.from(
      [
        `To: ${toAddr}`,
        `Subject: ${subject}`,
        "Content-Type: text/plain; charset=utf-8",
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(body, "utf-8").toString("base64"),
      ].join("\r\n")
    ).toString("base64url");

    const { data: draft } = await gmailClient.users.drafts.create({
      userId: "me",
      requestBody: {
        message: { raw },
      },
    });

    return { ok: true, draftId: draft.id ?? undefined };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isScope = /insufficient|scope|permission|403/i.test(msg);
    return {
      ok: false,
      error: isScope ? "INSUFFICIENT_SCOPE" : msg,
    };
  }
}

const LOYALTY_NEGOTIATION_BODY = (serviceName: string) =>
  `Dear Customer Support Team,

I have been a loyal customer of ${serviceName} for some time and value the service. As my annual subscription approaches renewal, I would like to inquire whether you offer any loyalty or retention discounts for long-standing customers.

I would appreciate the opportunity to continue our relationship at a reduced rate if such an option exists. Please let me know what you can do.

Thank you for your consideration.

Kind regards`;

/** Pro: Draft a polite loyalty/negotiation email for an approaching renewal. */
export async function createLoyaltyNegotiationDraft(
  serviceName: string
): Promise<{ ok: boolean; draftId?: string; error?: string }> {
  return createEmailDraft(
    "Add billing/support address",
    `Loyalty discount request – ${serviceName} renewal`,
    LOYALTY_NEGOTIATION_BODY(serviceName)
  );
}

export interface SubscriptionHistoryItem {
  date: string;
  subject: string;
  from: string;
  amount?: number;
  currency?: string;
}

export async function getSubscriptionHistory(
  providerDomain: string
): Promise<{ ok: boolean; items?: SubscriptionHistoryItem[]; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken && !session?.refreshToken) {
      return { ok: false, error: "Not signed in" };
    }

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });
    const gmailClient = gmail({ version: "v1", auth: oauth2Client });

    const q = `from:${providerDomain} newer_than:12m subject:(invoice OR receipt OR billing OR payment OR subscription)`;

    const { data: listData } = await gmailClient.users.messages.list({
      userId: "me",
      maxResults: 100,
      q,
    });

    if (!listData.messages?.length) {
      return { ok: true, items: [] };
    }

    const items: SubscriptionHistoryItem[] = [];

    for (const msg of listData.messages.slice(0, 50)) {
      try {
        const { data: fullMsg } = await gmailClient.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "full",
        });

        const headers = fullMsg.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

        let bodyText = "";
        const decode = (d?: string) => {
          if (!d) return "";
          const norm = d.replace(/-/g, "+").replace(/_/g, "/");
          try {
            return Buffer.from(norm, "base64").toString("utf-8");
          } catch {
            return "";
          }
        };
        const walk = (p: { body?: { data?: string }; parts?: unknown[] }) => {
          if (p.body?.data) bodyText += decode(p.body.data);
          (p.parts || []).forEach((part) => walk(part as { body?: { data?: string }; parts?: unknown[] }));
        };
        walk((fullMsg.payload || {}) as { body?: { data?: string }; parts?: unknown[] });

        const subject = getHeader("Subject") || "";
        const from = getHeader("From");
        const date = getHeader("Date");
        const amountResult = extractAmount(`${subject} ${bodyText.slice(0, 2000)}`);

        items.push({
          date,
          subject,
          from,
          amount: amountResult?.amount,
          currency: amountResult?.currency,
        });
      } catch {
        // skip failed fetches
      }
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { ok: true, items };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to fetch subscription history",
    };
  }
}
