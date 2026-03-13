"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Send, Loader2, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { EmailPreview } from "@/app/actions/gmail";
import { pushAuditEntry } from "@/lib/audit-log";
import { Logo } from "@/components/Logo";

interface Overview {
  totalMonthly: number;
  subscriptionCount: number;
  potentialSavings: number;
  netSpend: number;
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

interface ChatbotProps {
  emails: EmailPreview[];
  overview?: Overview | null;
  auditInsights?: AuditInsight[];
}

const SUGGESTION_GROUPS = [
  {
    label: "Spending",
    items: [
      "How much did I spend on Netflix?",
      "What are my total subscriptions?",
      "Show spending by service",
      "How much did I spend last month?",
    ],
  },
  {
    label: "Trials & Alerts",
    items: [
      "List my upcoming trials",
      "Which trials are ending soon?",
      "Any price increases?",
      "Free periods ending soon?",
    ],
  },
  {
    label: "Refunds & Net",
    items: [
      "Show my refunds",
      "What is my net spend?",
      "Which services gave me refunds?",
    ],
  },
  {
    label: "Analysis",
    items: [
      "Summarize my subscriptions",
      "Where can I save money?",
      "Recommend subscriptions to cancel",
    ],
  },
];

type ThinkingPhase = "idle" | "analyzing" | "preparing_draft" | "general" | "executing_action";

interface PendingAction {
  cancellationUrl?: string;
  serviceName?: string;
}

export function Chatbot({ emails, overview, auditInsights = [] }: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState<ThinkingPhase>("idle");
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
      pushAuditEntry({
        type: "redirect",
        label: `Redirected to ${serviceName} Cancellation Page`,
        serviceName,
        url,
      });
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
    overview: overview ?? undefined,
    auditInsights: auditInsights.length > 0 ? auditInsights : undefined,
  };

  const inferThinkingPhase = (text: string): ThinkingPhase => {
    const lower = text.toLowerCase();
    if (lower.includes("cancel") || lower.includes("draft") || lower.includes("email") || lower.includes("unsubscribe")) {
      return "preparing_draft";
    }
    if (lower.includes("spend") || lower.includes("invoice") || lower.includes("history") || lower.includes("compare")) {
      return "analyzing";
    }
    return "general";
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    setThinkingPhase(inferThinkingPhase(text));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to get response");
      }

      const content = data.content ?? "";
      const action = data.action as PendingAction | undefined;

      if (action?.cancellationUrl) {
        setThinkingPhase("executing_action");
        setPendingAction(action);
        setMessages((m) => [...m, {
          role: "assistant",
          content: "Redirecting you now.",
          actionUrl: action.cancellationUrl,
        }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content }]);
      }
      setThinkingPhase("idle");
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Sorry, I couldn't process that. ${err instanceof Error ? err.message : "Please try again."}`,
        },
      ]);
    } finally {
      setLoading(false);
      setThinkingPhase("idle");
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-violet-500/30 shadow-lg shadow-violet-500/20 flex items-center justify-center text-violet-400 hover:border-violet-400/50 transition-colors"
        aria-label="Open chatbot"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? (
          <span className="relative flex h-6 w-6">
            <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400/40 animate-ping" />
            <Logo size={24} className="relative" />
          </span>
        ) : (
          <Logo size={24} />
        )}
      </motion.button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex justify-end"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside
            className="relative w-full max-w-md h-full bg-[#0a0a0a] border-l border-white/[0.06] flex flex-col shadow-2xl"
            style={{ boxShadow: "-8px 0 32px rgba(0,0,0,0.5)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Logo size={24} />
                <span className="font-semibold text-zinc-100">VISTA</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-violet-300 hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            >
              {messages.length === 0 && (
                <div className="space-y-5">
                  <p className="text-zinc-500 text-sm">
                    Ask anything about your subscriptions, spending, trials, or refunds.
                  </p>
                  {SUGGESTION_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((q) => (
                          <button
                            key={q}
                            onClick={() => handleSend(q)}
                            className="px-3 py-2 rounded-xl text-left text-xs bg-zinc-900/50 text-zinc-400 hover:bg-violet-500/20 hover:text-violet-300 border border-white/[0.04] hover:border-violet-500/30 transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                      <Logo size={16} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm prose prose-invert prose-sm max-w-none ${
                      msg.role === "user"
                        ? "bg-violet-500/20 text-zinc-100 rounded-br-md prose-p:my-1"
                        : "bg-zinc-900/80 text-zinc-200 rounded-bl-md prose-p:my-1 prose-strong:text-zinc-100 prose-table:text-xs border border-white/[0.06]"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <>
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
                            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                            table: ({ children }) => <div className="overflow-x-auto mb-2"><table className="min-w-full border-collapse">{children}</table></div>,
                            th: ({ children }) => <th className="border border-white/20 px-2 py-1 text-left">{children}</th>,
                            td: ({ children }) => <td className="border border-white/10 px-2 py-1">{children}</td>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                        {msg.actionUrl && (
                          <a
                            href={msg.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 text-xs font-medium border border-violet-500/30 transition-colors"
                          >
                            <ExternalLink size={14} />
                            Go to Cancellation Page
                          </a>
                        )}
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {(loading || thinkingPhase === "executing_action") && (
                <div className="flex items-start gap-2">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                    <Logo size={16} />
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-zinc-900/80 border border-white/[0.06] flex items-center gap-2">
                    <Loader2 size={16} className="text-violet-400 animate-spin shrink-0" />
                    <span className="text-xs text-zinc-400">
                      {thinkingPhase === "executing_action" ? "Redirecting..." : "Thinking..."}
                    </span>
                  </div>
                </div>
              )}

              {popupBlocked && blockedUrls?.cancellationUrl && (
                <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <p className="text-xs font-medium text-amber-400">
                    Pop-ups were blocked. Use the button below:
                  </p>
                  <a
                    href={blockedUrls.cancellationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 text-sm font-medium transition-colors border border-violet-500/30"
                  >
                    <ExternalLink size={16} />
                    Go to Cancellation Page
                  </a>
                  <button
                    onClick={() => {
                      setPopupBlocked(false);
                      setBlockedUrls(null);
                    }}
                    className="block text-xs text-zinc-500 hover:text-zinc-400 mt-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/[0.06]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your subscriptions..."
                  className="flex-1 px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/[0.08] text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-3 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-100 transition-colors"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
