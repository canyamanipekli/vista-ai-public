"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { pushAuditEntry } from "@/lib/audit-log";
import { NavAuth } from "@/components/nav-auth";
import { useSession } from "next-auth/react";
import { Lock, Sparkles, Mail, Zap } from "lucide-react";

const VIOLET = { 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed" };
const DIAMOND = { 100: "#f0f4ff", 200: "#e2e8ff", 300: "#c7d2fe", 400: "#a5b4fc" };

interface Overview {
  totalMonthly: number;
  subscriptionCount: number;
  potentialSavings: number;
  netSpend: number;
  healthScore?: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  action?: {
    cancellationUrl?: string;
    serviceName?: string;
    amountMonthly?: number;
    type?: string;
  };
}

interface PendingAction {
  cancellationUrl?: string;
  serviceName?: string;
  amountMonthly?: number;
}

/** VISTA Aura logo: V shape, diamond (silver/white) → violet gradient, distinct from Pro */
function VistaAuraLogo({ size = 48, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className="inline-flex items-center gap-2.5 shrink-0">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="vista-aura-logo-glow"
        aria-hidden
      >
        <defs>
          <linearGradient id={`aura-v-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8ff" />
            <stop offset="35%" stopColor="#c7d2fe" />
            <stop offset="70%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id={`aura-glow-${id}`}>
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M8 8 L20 32 L32 8"
          stroke={`url(#aura-v-${id})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#aura-glow-${id})`}
        />
      </svg>
      {showWordmark && (
        <span className="vista-aura-wordmark font-black tracking-tight text-zinc-100 text-lg sm:text-xl bg-gradient-to-r from-slate-200 via-violet-300 to-violet-400 bg-clip-text text-transparent">
          <span className="vista-aura-vista">VISTA</span> Aura
        </span>
      )}
    </div>
  );
}

/** Screen-edge glow + soft pulse when AI is thinking */
function GlowPerimeter({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 pointer-events-none -z-[1]"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.35, 0.8, 0.35],
            background: [
              `radial-gradient(ellipse 140% 140% at 50% 50%, transparent 55%, ${DIAMOND[200]}06 80%, ${VIOLET[500]}08 100%)`,
              `radial-gradient(ellipse 140% 140% at 50% 50%, transparent 55%, ${VIOLET[500]}12 80%, ${DIAMOND[200]}08 100%)`,
              `radial-gradient(ellipse 140% 140% at 50% 50%, transparent 55%, ${DIAMOND[200]}06 80%, ${VIOLET[500]}08 100%)`,
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: `inset 0 0 120px ${VIOLET[500]}06` }}
        />
      )}
    </AnimatePresence>
  );
}

/** Thinking indicator: orbiting dots + breathing V */
function ThinkingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-4"
    >
      <div className="relative flex items-center justify-center">
        {/* Pulse rings */}
        <motion.span
          className="absolute rounded-full border-2 border-violet-500/40 w-12 h-12"
          animate={{ scale: [0.8, 1.6, 0.8], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          className="absolute rounded-full border-2 border-violet-400/30 w-12 h-12"
          animate={{ scale: [0.8, 1.6, 0.8], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
        />
        {/* Orbiting dots */}
        <motion.div
          className="relative w-10 h-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        >
          {[0, 120, 240].map((deg, i) => (
            <motion.span
              key={i}
              className="absolute w-2 h-2 rounded-full bg-violet-400"
              style={{
                left: "50%",
                top: "50%",
                marginLeft: -4,
                marginTop: -4,
                transform: `rotate(${deg}deg) translateY(-14px)`,
                boxShadow: `0 0 10px ${VIOLET[500]}, 0 0 20px ${VIOLET[500]}60`,
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </div>
      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-medium text-zinc-500"
      >
        VISTA Aura is thinking…
      </motion.p>
    </motion.div>
  );
}

/** Action card with violet glow on hover */
function SmartActionCard({
  serviceName,
  amountMonthly,
  cancellationUrl,
  yearlyImpact,
  onAction,
}: {
  serviceName: string;
  amountMonthly?: number;
  cancellationUrl?: string;
  yearlyImpact?: number;
  onAction?: () => void;
}) {
  const chartData = amountMonthly
    ? Array.from({ length: 12 }, (_, i) => ({ m: i + 1, v: amountMonthly * (i + 1) }))
    : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 26, stiffness: 260 }}
      whileHover={{
        boxShadow: `0 0 0 1px rgba(167, 139, 250, 0.2), 0 0 24px -4px ${VIOLET[500]}30`,
      }}
      className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 backdrop-blur-sm overflow-hidden hover:border-violet-500/25 transition-all"
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 0 20px -8px rgba(139,92,246,0.15)" }}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-zinc-200 font-semibold">{serviceName}</span>
          {amountMonthly != null && (
            <span className="text-zinc-400 text-sm font-medium">
              ${amountMonthly.toFixed(2)} /mo
            </span>
          )}
        </div>
        {chartData.length > 0 && (
          <div className="h-12 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="burnFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={VIOLET[500]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={VIOLET[600]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" hide />
                <YAxis hide domain={[0, "auto"]} />
                <Area type="monotone" dataKey="v" stroke={VIOLET[400]} fill="url(#burnFill)" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {yearlyImpact != null && (
          <p className="text-xs text-zinc-500 font-medium">{yearlyImpact.toFixed(0)} /yr burn</p>
        )}
        <button
          type="button"
          onClick={() => {
            if (cancellationUrl) window.open(cancellationUrl, "_blank");
            onAction?.();
          }}
          className="cta-aura w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
        >
          Quick Action
        </button>
      </div>
    </motion.div>
  );
}

const SUGGESTED_PROMPTS = [
  "What did I spend this month?",
  "Find price hikes and savings",
  "Show my recent emails",
  "Cancel a subscription",
];

type ContextState = {
  gmailConnected?: boolean;
  emails: { id: string; subject: string; from: string; date: string; category?: string; amount?: number; currency?: string; alertType?: string; senderDomain?: string; cancellation_url?: string }[];
  overview?: Overview;
  auditInsights: { type: string; title: string; description: string; provider?: string; severity: string }[];
};

const emptyContext: ContextState = { emails: [], auditInsights: [] };

export function ChatCommandCenter({ initialContext }: { initialContext?: ContextState }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [context, setContext] = useState<ContextState>(initialContext ?? emptyContext);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Always load context from API (same as popup: browser sends cookies → getToken → emails).
  // This is reliable; server-passed initialContext can be empty on client nav/prefetch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/chat/context", { cache: "no-store", credentials: "include" });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setContext({
            gmailConnected: data.gmailConnected ?? false,
            emails: data.emails ?? [],
            overview: data.overview ?? undefined,
            auditInsights: data.auditInsights ?? [],
          });
        } else if (!cancelled && initialContext?.emails?.length) {
          // Keep server-passed context on 401 so we don't wipe it
          setContext((prev) => (prev.emails.length ? prev : initialContext ?? emptyContext));
        }
      } catch {
        if (!cancelled && initialContext?.emails?.length) {
          setContext((prev) => (prev.emails.length ? prev : initialContext ?? emptyContext));
        } else if (!cancelled) {
          setContext((prev) => ({ ...prev, emails: [], auditInsights: [], gmailConnected: false }));
        }
      } finally {
        if (!cancelled) setLoadingContext(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!pendingAction?.cancellationUrl) return;
    const url = pendingAction.cancellationUrl;
    const name = pendingAction.serviceName ?? "Service";
    if (window.open(url, "_blank")) pushAuditEntry({ type: "redirect", label: `Redirected to ${name}`, serviceName: name, url });
    setPendingAction(null);
  }, [pendingAction]);

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
        credentials: "include",
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }].map((m) => ({ role: m.role, content: m.content })),
          context: { emails: context.emails, overview: context.overview, auditInsights: context.auditInsights, isPro: false },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      const content = data.content ?? "";
      const action = data.action as PendingAction | undefined;

      if (action?.cancellationUrl) {
        setPendingAction(action);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: content || "Opening cancellation flow.",
            action: {
              cancellationUrl: action.cancellationUrl,
              serviceName: action.serviceName,
              amountMonthly: action.amountMonthly,
              type: "subscription",
            },
          },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Unable to process. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const { data: session, status } = useSession();
  const showCenter = messages.length === 0 && !loading;
  const isThinking = loading || loadingContext;
  const isAuthenticated = status === "authenticated";
  const hasGmail = isAuthenticated || (context.gmailConnected ?? context.emails.length > 0);

  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100 overflow-hidden font-sans antialiased selection:bg-violet-500/30">
      <GlowPerimeter active={isThinking} />

      {/* Nav: VISTA Aura branding + glow border */}
      <nav
        className="sticky top-0 z-40 p-4 sm:p-6 flex justify-between items-center max-w-7xl mx-auto border-b backdrop-blur-xl bg-[#050505]/90"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          boxShadow: "0 1px 0 0 rgba(167, 139, 250, 0.06)",
        }}
      >
        <Link href="/chat" prefetch={false} className="flex items-center gap-2">
          <VistaAuraLogo size={32} showWordmark />
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          {hasGmail ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/15 transition-colors"
              style={{ boxShadow: "0 0 12px -2px rgba(16, 185, 129, 0.2)" }}
            >
              <Mail size={12} />
              Gmail connected
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-400 text-xs font-medium hover:text-violet-300 hover:border-violet-500/20 transition-colors"
            >
              <Mail size={12} />
              Connect Gmail
            </Link>
          )}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-violet-300 transition-colors"
          >
            View inbox
          </Link>
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="text-sm font-medium text-zinc-400 hover:text-violet-300 transition-colors hidden sm:inline-flex items-center gap-1.5"
          >
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono">⌘K</kbd>
            Commands
          </button>
          <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-violet-300 transition-colors">
            Home
          </Link>
          <NavAuth />
        </div>
      </nav>

      {/* Cmd+K palette */}
      <AnimatePresence>
        {commandOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
              onClick={() => setCommandOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl z-50 overflow-hidden"
              style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 0 40px -8px ${VIOLET[500]}20` }}
            >
              <div className="p-4 border-b border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">VISTA Aura · Commands</p>
              </div>
              <div className="p-2">
                <Link
                  href="/dashboard"
                  onClick={() => setCommandOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-colors"
                >
                  <Mail size={14} />
                  View inbox
                </Link>
                {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => { handleSend(prompt); setCommandOpen(false); }}
                    className="block w-full px-4 py-3 rounded-xl text-left text-zinc-400 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pb-36 pt-6 sm:pt-8 flex flex-col items-center scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

          <AnimatePresence mode="wait">
            {showCenter ? (
              <motion.div
                key="center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                className="flex flex-col items-center justify-center flex-1 min-h-[60vh] text-center max-w-2xl mx-auto"
              >
                <VistaAuraLogo size={88} showWordmark />
                <span
                  className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ boxShadow: `0 0 12px -2px ${VIOLET[500]}30` }}
                >
                  <Zap size={10} />
                  AI Financial Guardian
                </span>
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-4 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-500 bg-clip-text text-transparent"
                >
                  How can I help you today?
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 text-zinc-500 text-base font-medium max-w-md"
                >
                  Ask about spending, subscriptions, price hikes—or open your inbox to see recent emails.
                </motion.p>

                {/* Gmail CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.22 }}
                  className="mt-6"
                >
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-zinc-300 text-sm font-medium hover:border-violet-500/30 hover:text-violet-200 transition-all"
                    style={{ boxShadow: "0 0 20px -4px rgba(139, 92, 246, 0.15)" }}
                  >
                    <Mail size={16} />
                    {hasGmail ? "View my emails" : "Connect Gmail & view inbox"}
                  </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-3"
                >
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-xs font-medium"
                    style={{ boxShadow: "0 0 12px -2px rgba(255,255,255,0.04)" }}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 animate-pulse" />
                    </span>
                    2,491 cancelled today
                  </span>
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium"
                    style={{ boxShadow: `0 0 12px -2px ${VIOLET[500]}25` }}
                  >
                    <Lock size={12} />
                    Military-grade shield
                  </span>
                </motion.div>

                {/* Suggested prompts with glow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl"
                >
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <motion.button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        boxShadow: `0 0 0 1px rgba(167, 139, 250, 0.2), 0 0 20px -4px ${VIOLET[500]}25`,
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-2xl bg-zinc-900/50 border border-white/[0.06] text-left text-sm font-medium text-zinc-300 hover:border-violet-500/25 hover:text-zinc-100 hover:bg-zinc-900/80 transition-all flex items-center gap-3"
                      style={{ boxShadow: "0 0 16px -4px rgba(139, 92, 246, 0.08)" }}
                    >
                      <span
                        className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0"
                        style={{ boxShadow: `0 0 12px -2px ${VIOLET[500]}20` }}
                      >
                        <Sparkles className="w-4 h-4 text-violet-400" />
                      </span>
                      {prompt}
                    </motion.button>
                  ))}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-zinc-600 text-xs font-medium"
                >
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">⌘K</kbd> for quick commands
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="stream"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-2xl mx-auto space-y-8"
              >
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: "spring", damping: 26, stiffness: 260 }}
                      className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
                    >
                      {msg.role === "user" ? (
                        <p
                          className="text-zinc-100 text-[15px] leading-relaxed max-w-[88%] font-medium"
                          style={{ textShadow: "0 0 20px rgba(255,255,255,0.05)" }}
                        >
                          {msg.content}
                        </p>
                      ) : (
                        <div className="max-w-[92%] space-y-4">
                          <div
                            className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-sm p-4 sm:p-5"
                            style={{
                              boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 0 24px -6px rgba(139, 92, 246, 0.12)",
                            }}
                          >
                            <div className="text-[15px] text-zinc-200 leading-relaxed prose prose-invert max-w-none [&_p]:my-2 font-medium">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                  strong: ({ children }) => <strong className="text-zinc-100 font-bold">{children}</strong>,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                          {msg.action?.cancellationUrl && msg.action?.serviceName && (
                            <SmartActionCard
                              serviceName={msg.action.serviceName}
                              amountMonthly={msg.action.amountMonthly}
                              cancellationUrl={msg.action.cancellationUrl}
                              yearlyImpact={msg.action.amountMonthly ? msg.action.amountMonthly * 12 : undefined}
                              onAction={() => window.open(msg.action!.cancellationUrl, "_blank")}
                            />
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && <ThinkingAnimation />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input with violet/diamond glow on focus */}
        <div
          className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 flex justify-center bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-16"
          style={{ boxShadow: "0 -20px 40px -20px rgba(0,0,0,0.5)" }}
        >
          <motion.form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative w-full max-w-xl rounded-2xl px-5 py-3.5 border transition-all duration-300"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderColor: inputFocused ? "rgba(167, 139, 250, 0.5)" : "rgba(255,255,255,0.06)",
              boxShadow: inputFocused
                ? `0 0 0 1px rgba(167, 139, 250, 0.4), 0 0 32px -4px ${VIOLET[500]}35, 0 0 48px -8px rgba(224, 231, 255, 0.1)`
                : "0 0 0 1px rgba(255,255,255,0.04), 0 0 20px -6px rgba(139, 92, 246, 0.1)",
            }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask VISTA Aura anything…"
              autoCapitalize="off"
              className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm font-medium focus:outline-none"
              disabled={loading}
            />
          </motion.form>
        </div>
      </div>
    </div>
  );
}
