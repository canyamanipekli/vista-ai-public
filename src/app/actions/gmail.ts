"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { gmail } from "@googleapis/gmail";
import { OAuth2Client } from "google-auth-library";
import OpenAI from "openai";
import {
  extractSenderDomain,
  categorizeByKeywords,
  detectAlert,
  extractAmount,
  getFinancialOverview as getFinancialOverviewUtil,
} from "@/lib/email-analysis";
import { runPriceHikeAndDoubleCharge } from "@/lib/cfo-intelligence";

export interface EmailPreview {
  id: string;
  subject: string;
  from: string;
  date: string;
  labelIds?: string[];
  category?: string;
  amount?: number;
  currency?: string;
  alertType?: "trial" | "price_increase" | "free_ends";
  senderDomain?: string;
  cancellation_url?: string;
  price_hike?: boolean;
  increase_amount?: number;
  potential_error?: boolean;
  semantic_category?: string;
}

export { getFinancialOverviewUtil as getFinancialOverview };

const NEGATIVE_SUBJECT_KEYWORDS = [
  "failed",
  "declined",
  "unsuccessful",
  "rejected",
  "başarısız",
  "reddedildi",
  "yetersiz bakiye",
];

function isNegativeSubject(subject: string): boolean {
  const s = subject.toLowerCase();
  return NEGATIVE_SUBJECT_KEYWORDS.some((kw) => s.includes(kw));
}

function isRefundSubject(subject: string): boolean {
  const s = subject.toLowerCase();
  return s.includes("refund") || s.includes("iade");
}

type CategorizeResult = { category?: string; cancellation_url?: string };

async function categorizeWithAI(
  subject: string,
  bodySnippet: string
): Promise<CategorizeResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    const cat = categorizeByKeywords(subject, bodySnippet);
    return cat ? { category: cat } : {};
  }

  try {
    const openai = new OpenAI({ apiKey: key });
    const text = `${subject}\n\n${bodySnippet.slice(0, 2000)}`;
    const { choices } = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Only analyze successful payments, invoices and active subscriptions. Reply with JSON only. For successful invoices/payments/subscriptions, return: {\"status\":\"subscription\",\"cancellation_url\":\"https://...\"}. Extract the cancellation_url or manage subscription URL from the email if present; if not found, omit cancellation_url or use null. For failed/declined/error transactions, return: {\"status\":\"ignore\"}.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 150,
    });
    const reply = choices[0]?.message?.content?.trim() || "";
    try {
      const json = JSON.parse(reply.replace(/```json?\s*|\s*```/g, "")) as {
        status?: string;
        cancellation_url?: string | null;
      };
      if (json.status === "ignore") return {};
      if (json.status === "subscription") {
        const url =
          json.cancellation_url && typeof json.cancellation_url === "string"
            ? json.cancellation_url.trim()
            : undefined;
        return {
          category: "Subscription",
          cancellation_url: url && url.startsWith("http") ? url : undefined,
        };
      }
    } catch {
      const lower = reply.toLowerCase();
      if (lower.includes("subscription")) return { category: "Subscription" };
      if (lower.includes("ignore")) return {};
    }
    const cat = categorizeByKeywords(subject, bodySnippet);
    return cat ? { category: cat } : {};
  } catch {
    const cat = categorizeByKeywords(subject, bodySnippet);
    return cat ? { category: cat } : {};
  }
}

export interface FullEmail {
  id: string;
  subject: string;
  from: string;
  date: string;
  bodyText: string;
  bodyHtml: string | null;
}

function decodeBase64(data: string): string {
  if (!data || typeof data !== "string") return "";
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Buffer.from(normalized, "base64").toString("utf-8");
  } catch {
    try {
      return Buffer.from(data, "base64url").toString("utf-8");
    } catch {
      return "";
    }
  }
}

interface GmailPart {
  body?: { data?: string };
  parts?: GmailPart[];
  mimeType?: string;
}

function extractBodyFromPayload(payload: GmailPart): { text: string; html: string | null } {
  let text = "";
  let html: string | null = null;

  const decode = (d?: string) => (d ? decodeBase64(d) : "");

  function walk(part: GmailPart) {
    if (part.body?.data) {
      const content = decode(part.body.data);
      if (content) {
        const mime = (part.mimeType || "").toLowerCase();
        if (mime === "text/plain") text = content;
        if (mime === "text/html") html = content;
        if (!mime || mime.startsWith("text/")) text = text || content;
      }
    }
    if (part.parts) {
      for (const p of part.parts) walk(p);
    }
  }

  walk(payload);
  if (html && !text) text = String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { text, html };
}

export async function getFullEmail(messageId: string): Promise<FullEmail | null> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken && !session?.refreshToken) {
    throw new Error("No Gmail access. Please sign in again.");
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

  try {
    const { data: fullMsg } = await gmailClient.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const headers = fullMsg.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

    const { text, html } = extractBodyFromPayload(
      (fullMsg.payload || {}) as GmailPart
    );

    return {
      id: fullMsg.id!,
      subject: getHeader("Subject") || "(No subject)",
      from: getHeader("From"),
      date: getHeader("Date"),
      bodyText: text || "(No content)",
      bodyHtml: html || null,
    };
  } catch {
    return null;
  }
}

export type GmailCredentials = { accessToken: string; refreshToken?: string | null };

export async function getRecentEmails(
  options?: { search?: string; labelIds?: string[]; deepScan?: boolean; last24h?: boolean },
  credentials?: GmailCredentials
): Promise<EmailPreview[]> {
  const session = credentials
    ? { accessToken: credentials.accessToken, refreshToken: credentials.refreshToken ?? null }
    : await getServerSession(authOptions);

  if (!session?.accessToken && !session?.refreshToken) {
    throw new Error("No Gmail access. Please sign in again.");
  }

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken ?? undefined,
  });

  const gmailClient = gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const userSearch = options?.search?.trim();
  const labelIds = options?.labelIds?.length ? options.labelIds : undefined;
  const deepScan = options?.deepScan === true;
  const last24h = options?.last24h === true;

  const financeQuery =
    "subject:(invoice OR receipt OR billing OR subscription OR payment OR order OR fatura OR abonelik)";
  const timeScope = last24h ? " newer_than:1d" : deepScan ? " newer_than:12m" : "";
  const q = (userSearch ? `${userSearch} ${financeQuery}` : financeQuery) + timeScope;

  let listData;
  try {
    const effectiveLabels =
      labelIds && labelIds.length > 0
        ? labelIds.includes("INBOX")
          ? labelIds
          : ["INBOX", ...labelIds]
        : ["INBOX"];

    const res = await gmailClient.users.messages.list({
      userId: "me",
      maxResults: 250,
      q,
      labelIds: effectiveLabels,
    });
    listData = res.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const gerr = err as { response?: { data?: { error?: { message?: string; status?: string } }; status?: number } };
    const status = gerr?.response?.status;
    const reason = gerr?.response?.data?.error?.message ?? msg;

    if (status === 401 || msg.includes("invalid_grant")) {
      throw new Error("Gmail session expired. Please sign out and sign in again.");
    }
    if (status === 403) {
      // "Access Not Configured" = Gmail API not enabled
      if (reason.includes("Access Not Configured") || reason.includes("has not been used")) {
        throw new Error("GMAIL_API_DISABLED");
      }
      // Insufficient scope = user needs to re-authorize with full Gmail scopes
      const reasonLower = String(reason).toLowerCase();
      if (reasonLower.includes("insufficient") || reasonLower.includes("scope")) {
        throw new Error("GMAIL_INSUFFICIENT_SCOPE");
      }
      throw new Error("GMAIL_403_OTHER");
    }
    throw new Error("Failed to load emails. Check if Gmail API is enabled.");
  }

  if (!listData?.messages || listData.messages.length === 0) {
    return [];
  }

  const INVOICE_KEYWORDS = [
    "invoice",
    "receipt",
    "billing",
    "subscription",
    "payment",
    "order",
    "fatura",
    "abonelik",
    "renew",
  ];

  function scoreInvoiceLikelihood(subject: string, body: string): number {
    const text = `${subject} ${body}`.toLowerCase();
    return INVOICE_KEYWORDS.filter((kw) => text.includes(kw)).length;
  }

  const rawItems = await Promise.all(
    listData.messages.map(async (msg) => {
      const { data: fullMsg } = await gmailClient.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "full",
      });

      const headers = fullMsg.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find(
          (h) => h.name?.toLowerCase() === name.toLowerCase()
        )?.value ?? "";

      const subject = getHeader("Subject") || "(No subject)";
      const from = getHeader("From");
      const date = getHeader("Date");
      const { text: bodyText } = extractBodyFromPayload(
        (fullMsg.payload || {}) as GmailPart
      );
      const bodySnippet = bodyText.slice(0, 2000);

      const alertType = detectAlert(bodySnippet);
      const amountResult = extractAmount(`${subject} ${bodySnippet}`);
      const senderDomain = extractSenderDomain(from);
      const score = scoreInvoiceLikelihood(subject, bodySnippet);

      return {
        id: fullMsg.id!,
        subject,
        from,
        date,
        labelIds: fullMsg.labelIds || [],
        bodySnippet,
        alertType,
        amountResult,
        senderDomain,
        score,
      };
    })
  );

  const filteredItems = rawItems.filter((r) => !isNegativeSubject(r.subject));
  filteredItems.sort((a, b) => b.score - a.score);

  const top50 = filteredItems.slice(0, 50);
  const rest = filteredItems.slice(50);

  const REFUND_CATEGORY = "Refund";

  const aiResults = await Promise.all(
    top50.map((r) =>
      isRefundSubject(r.subject)
        ? { category: REFUND_CATEGORY, cancellation_url: undefined as string | undefined }
        : categorizeWithAI(r.subject, r.bodySnippet)
    )
  );

  const emails: EmailPreview[] = [
    ...top50.map((r, i) => ({
      id: r.id,
      subject: r.subject,
      from: r.from,
      date: r.date,
      labelIds: r.labelIds,
      category: aiResults[i].category,
      amount: r.amountResult?.amount,
      currency: r.amountResult?.currency,
      alertType: r.alertType,
      senderDomain: r.senderDomain || undefined,
      cancellation_url: (aiResults[i] as CategorizeResult).cancellation_url,
    })),
    ...rest.map((r) => ({
      id: r.id,
      subject: r.subject,
      from: r.from,
      date: r.date,
      labelIds: r.labelIds,
      category: isRefundSubject(r.subject)
        ? REFUND_CATEGORY
        : categorizeByKeywords(r.subject, r.bodySnippet),
      amount: r.amountResult?.amount,
      currency: r.amountResult?.currency,
      alertType: r.alertType,
      senderDomain: r.senderDomain || undefined,
    })),
  ];

  emails.sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const enriched = runPriceHikeAndDoubleCharge(
    emails.map((e) => ({
      id: e.id,
      subject: e.subject,
      from: e.from,
      date: e.date,
      category: e.category,
      amount: e.amount,
      currency: e.currency,
      senderDomain: e.senderDomain,
    }))
  );

  return emails.map((e) => {
    const en = enriched.find((x) => x.id === e.id);
    return {
      ...e,
      price_hike: en?.price_hike,
      increase_amount: en?.increase_amount,
      potential_error: en?.potential_error,
    };
  });
}

const CANCELLATION_KEYWORDS = [
  "cancel",
  "unsubscribe",
  "subscription settings",
  "manage plan",
  "manage subscription",
  "billing",
  "account settings",
  "cancel subscription",
  "end subscription",
];

const URL_REGEX = /https?:\/\/[^\s"'<>)\]]+/gi;

const GENERIC_LINK_PATTERNS = /\/help\/|\/support\/|\/contact\//i;

function scoreUrlForCancellation(url: string, context: string): number {
  const lowerContext = context.toLowerCase();
  const lowerUrl = url.toLowerCase();
  let score = 0;

  for (const kw of CANCELLATION_KEYWORDS) {
    if (lowerContext.includes(kw) || lowerUrl.includes(kw)) {
      if (kw.includes("cancel") || kw.includes("unsubscribe")) score += 10;
      else if (kw.includes("manage") || kw.includes("subscription")) score += 8;
      else score += 5;
    }
  }

  if (GENERIC_LINK_PATTERNS.test(url) && score < 5) {
    score = Math.min(score, 2);
  }

  return score;
}

export async function scanForCancellationUrl(
  providerDomain: string
): Promise<{ url?: string; serviceName?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken && !session?.refreshToken) {
      return { error: "Not signed in" };
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

    const q = `from:${providerDomain} newer_than:12m subject:(invoice OR receipt OR billing OR payment OR subscription OR cancel OR manage)`;
    const { data: listData } = await gmailClient.users.messages.list({
      userId: "me",
      maxResults: 20,
      q,
    });

    if (!listData.messages?.length) {
      return { serviceName: providerDomain };
    }

    const urlScores: { url: string; score: number }[] = [];

    for (const msg of listData.messages.slice(0, 15)) {
      try {
        const { data: fullMsg } = await gmailClient.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "full",
        });
        const { text, html } = extractBodyFromPayload(
          (fullMsg.payload || {}) as GmailPart
        );
        const rawBody = (html || text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
        const fullText = `${rawBody} ${text || ""}`;

        const urls = fullText.match(URL_REGEX) || [];
        for (const urlRaw of urls) {
          const url = urlRaw.replace(/[.,;:!?)]+$/, "").trim();
          if (!url.startsWith("http") || url.length > 500) continue;
          const idx = fullText.toLowerCase().indexOf(url.toLowerCase());
          const context = fullText.slice(Math.max(0, idx - 80), idx + url.length + 80);
          const score = scoreUrlForCancellation(url, context);
          if (score > 0) {
            urlScores.push({ url, score });
          }
        }
      } catch {
        // skip failed fetches
      }
    }

    if (urlScores.length === 0) {
      return { serviceName: providerDomain };
    }

    urlScores.sort((a, b) => b.score - a.score);
    const best = urlScores[0];
    return {
      url: best.score >= 5 ? best.url : undefined,
      serviceName: providerDomain,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Scan failed",
    };
  }
}

export async function starEmail(
  messageId: string,
  add: boolean
): Promise<{ ok: boolean; error?: string }> {
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

    await gmailClient.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        addLabelIds: add ? ["STARRED"] : [],
        removeLabelIds: add ? [] : ["STARRED"],
      },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function createReplyDraft(
  messageId: string,
  body: string,
  to: string,
  subject: string
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

    const { data: orig } = await gmailClient.users.messages.get({
      userId: "me",
      id: messageId,
      format: "metadata",
      metadataHeaders: ["Message-ID", "References", "In-Reply-To"],
    });

    const headers = orig.payload?.headers || [];
    const getH = (n: string) =>
      headers.find((h) => h.name?.toLowerCase() === n.toLowerCase())?.value ?? "";

    const messageIdVal = getH("Message-ID");
    const references = getH("References") || messageIdVal;
    const inReplyTo = getH("In-Reply-To") || messageIdVal;

    const reSubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;
    const toAddr = to.replace(/^.*<([^>]+)>.*$/, "$1").trim() || to;

    const raw = Buffer.from(
      [
        `To: ${toAddr}`,
        `Subject: ${reSubject}`,
        `In-Reply-To: ${inReplyTo}`,
        `References: ${references}`,
        "Content-Type: text/plain; charset=utf-8",
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(body, "utf-8").toString("base64"),
      ].join("\r\n")
    ).toString("base64url");

    const { data: draft } = await gmailClient.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw,
          threadId: orig.threadId || undefined,
        },
      },
    });

    return { ok: true, draftId: draft.id ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
