"use client";

import { ChatCommandCenter } from "@/components/chat/chat-command-center";
import { MouseAuraBackground } from "@/components/MouseAuraBackground";

type InitialContext = {
  gmailConnected?: boolean;
  emails: { id: string; subject: string; from: string; date: string; category?: string; amount?: number; currency?: string; alertType?: string; senderDomain?: string; cancellation_url?: string }[];
  overview?: { totalMonthly: number; subscriptionCount: number; potentialSavings: number; netSpend: number; healthScore?: number };
  auditInsights: { type: string; title: string; description: string; provider?: string; severity: string }[];
};

export function ChatPageClient({ initialContext }: { initialContext: InitialContext }) {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-violet-500/30 font-sans antialiased">
      <MouseAuraBackground />
      <ChatCommandCenter initialContext={initialContext} />
    </div>
  );
}
