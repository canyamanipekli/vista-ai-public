"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Loader2, ExternalLink, X, Sparkles } from "lucide-react";
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
  requiresPro?: boolean;
}

interface PendingAction {
  cancellationUrl?: string;
  serviceName?: string;
  draftId?: string;
  amountMonthly?: number;
  needsComposeScope?: boolean;
}

interface CommandCenterConsoleProps {
  emails: EmailPreview[];
  overview?: Overview | null;
  auditInsights?: AuditInsight[];
  userName?: string | null;
  onClose: () => void;
  onSuccessReclaim?: (amount?: number, serviceName?: string, draftPrepared?: boolean) => void;
  onUnlockAgentRequest?: () => void;
}

const QUICK_PROMPTS = [
  "What is my VISTA score?",
  "Find price hikes",
  "Cancel my Runway",
  "Show my subscriptions",
  "Where can I save money?",
];

export function CommandCenterConsole({
  emails,
  overview,
  auditInsights = [],
  userName,
  onClose,
  onSuccessReclaim,
  onUnlockAgentRequest,
}: CommandCenterConsoleProps) {
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
    const amount = pendingAction.amountMonthly;
    const w = window.open(url, "_blank");
    if (!w) {
      setPopupBlocked(true);
      setBlockedUrls({ cancellationUrl: url });
    } else {
      pushAuditEntry({ type: "redirect", label: `Redirected to ${serviceName} Cancellation Page`, serviceName, url });
    }
    onSuccessReclaim?.(amount, serviceName, !!pendingAction?.draftId);
    setPendingAction(null);
  }, [pendingAction, onSuccessReclaim]);

  const context = {
    isPro: false,
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
      const requiresPro = data.requiresPro === true;
      if (action?.needsComposeScope) {
        onUnlockAgentRequest?.();
      }
      if (action?.cancellationUrl) {
        setPendingAction(action);
        setMessages((m) => [...m, { role: "assistant", content: "Redirecting you to the cancellation page." + (action.draftId ? " A Formal Cancellation Request draft has been created in your Gmail." : ""), actionUrl: action.cancellationUrl }]);
      } else if (requiresPro) {
        setMessages((m) => [...m, { role: "assistant", content, requiresPro: true }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: action?.needsComposeScope ? "Unlock Agent Actions to allow VISTA to create cancellation drafts in your Gmail." : content }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]/80 backdrop-blur-2xl border-r border-white/[0.08] shadow-2xl shadow-black/40">
      <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <div>
            <h2 className="text-sm font-bold text-zinc-100">VISTA-1 Pro</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Command Center</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">Powered by VISTA-1 Pro. Transactional intelligence for your finances.</p>
            <p className="text-[11px] text-zinc-600">Try:</p>
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="block w-full text-left px-3 py-2 rounded-xl text-xs bg-white/[0.04] text-zinc-400 hover:bg-violet-500/15 hover:text-violet-300 border border-white/[0.06] hover:border-violet-500/30 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="shrink-0 w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                <Logo size={16} />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                msg.role === "user"
                  ? "bg-violet-500/20 text-zinc-100"
                  : "bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
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
                      className="inline-flex items-center gap-1 mt-1.5 text-violet-400 hover:text-violet-300 text-[11px]"
                    >
                      <ExternalLink size={12} />
                      Open
                    </a>
                  )}
                  {msg.requiresPro && (
                    <Link
                      href="/billing"
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-amber-500/80 text-zinc-100 text-xs font-semibold hover:from-violet-400 hover:to-amber-400/90 transition-all"
                    >
                      <Sparkles size={12} />
                      Upgrade
                    </Link>
                  )}
                </>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Logo size={16} />
            </div>
            <div className="rounded-2xl px-3 py-2 bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
              <Loader2 size={14} className="text-violet-400 animate-spin" />
              <span className="text-[11px] text-zinc-500">VISTA-1 Pro is thinking...</span>
            </div>
          </div>
        )}
        {popupBlocked && blockedUrls?.cancellationUrl && (
          <a
            href={blockedUrls.cancellationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-violet-400"
          >
            <ExternalLink size={12} />
            Open cancellation page
          </a>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex-none p-4 border-t border-white/[0.08] flex gap-2 items-center"
      >
        <div className="shrink-0 w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
          <Logo size={18} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask VISTA-1 Pro..."
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 p-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-zinc-100 transition-colors"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
