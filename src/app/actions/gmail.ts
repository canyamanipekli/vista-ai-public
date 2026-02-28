"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { gmail } from "@googleapis/gmail";
import { OAuth2Client } from "google-auth-library";

export interface EmailPreview {
  id: string;
  subject: string;
  from: string;
  date: string;
}

export async function getRecentEmails(): Promise<EmailPreview[]> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error("Oturum açmanız gerekiyor");
  }

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ access_token: session.accessToken });

  const gmailClient = gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const { data: listData } = await gmailClient.users.messages.list({
    userId: "me",
    maxResults: 20,
  });

  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  const emails: EmailPreview[] = await Promise.all(
    listData.messages.map(async (msg) => {
      const { data: fullMsg } = await gmailClient.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });

      const headers = fullMsg.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find(
          (h) => h.name?.toLowerCase() === name.toLowerCase()
        )?.value ?? "";

      return {
        id: fullMsg.id!,
        subject: getHeader("Subject") || "(Konu yok)",
        from: getHeader("From"),
        date: getHeader("Date"),
      };
    })
  );

  return emails;
}
