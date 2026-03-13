"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { EmailPreview } from "@/app/actions/gmail";
import { pushAuditEntry } from "@/lib/audit-log";
import { Logo } from "@/components/Logo";

interface Overview {
  totalMonthly: number;
  subscriptionCount: number;
  potentialSavings: number;
  netSpend: number;
  healthScore?: number;
}

interface AuditInsight {
  type: string;
  title: string;
  description: string;
  provider?: string;
  severity: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  actionUrl?: string;
}

interface PendingAction {
  cancellationUrl?: string;
  serviceName?: string;
}

interface SidebarChatProps {
  emails: EmailPreview[];
  overview?: Overview | null;
  auditInsights?: AuditInsight[];
}

const QUICK_PROMPTS = [
  "What is my VISTA score?",
  "Find price hikes",
  "Cancel my Runway",
  "Show my subscriptions",
  "Where can I save money?",
];

export function SidebarChat({ emails, overview, auditInsights = [] }: SidebarChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [blockedUrls, setBlockedUrls] = useState<{ cancellationUrl?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!pendingAction?.cancellationUrl) return;
    const url = pendingAction.cancellationUrl;
    const serviceName = pendingAction.serviceName ?? "Service";
    const w = window.open(url, "_blank");
    if (!w) {
      setPopupBlocked(true);
      setBlockedUrls({ cancellationUrl: url });
    } else {
      pushAuditEntry({ type: "redirect", label: `Redirected to ${serviceName} Cancellation Page`, serviceName, url });
    }
    setPendingAction(null);
  }, [pendingAction]);

  const context = {
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
    overview: overview ? { ...overview, healthScore: overview.healthScore } : undefined,
    auditInsights: auditInsights.length > 0 ? auditInsights : undefined,
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }].map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      const content = data.content ?? "";
      const action = data.action as PendingAction | undefined;
      if (action?.cancellationUrl) {
        setPendingAction(action);
        setMessages((m) => [...m, { role: "assistant", content: "Redirecting you now.", actionUrl: action.cancellationUrl }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 border-t border-white/[0.06]">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-500">Ask anything. Try:</p>
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="block w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] bg-zinc-900/60 text-zinc-400 hover:bg-violet-500/20 hover:text-violet-300 border border-white/[0.04] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-1.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="shrink-0 w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                <Logo size={12} />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-[11px] ${
                msg.role === "user"
                  ? "bg-violet-500/20 text-zinc-100"
                  : "bg-zinc-900/80 text-zinc-300 border border-white/[0.06]"
              }`}
            >
              {msg.role === "assistant" ? (
                <>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="text-zinc-100">{children}</strong>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  {msg.actionUrl && (
                    <a
                      href={msg.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-violet-400 hover:text-violet-300 text-[10px]"
                    >
                      <ExternalLink size={10} />
                      Open
                    </a>
                  )}
                </>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-1.5">
            <div className="shrink-0 w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Logo size={12} />
            </div>
            <div className="rounded-xl px-2.5 py-1.5 bg-zinc-900/80 border border-white/[0.06] flex items-center gap-1.5">
              <Loader2 size={12} className="text-violet-400 animate-spin" />
              <span className="text-[10px] text-zinc-500">Thinking...</span>
            </div>
          </div>
        )}
        {popupBlocked && blockedUrls?.cancellationUrl && (
          <a
            href={blockedUrls.cancellationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-violet-400"
          >
            <ExternalLink size={10} />
            Open cancellation page
          </a>
        )}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-2 border-t border-white/[0.06] flex gap-1.5 items-center"
      >
        <div className="shrink-0 w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
          <Logo size={14} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask VISTA..."
          className="flex-1 min-w-0 px-2.5 py-2 rounded-lg bg-zinc-900/60 border border-white/[0.08] text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 p-2 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-zinc-100 transition-colors"
          aria-label="Send"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
