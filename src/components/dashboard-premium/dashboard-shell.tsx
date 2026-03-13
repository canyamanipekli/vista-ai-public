"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, Home, RefreshCw, Circle, Terminal, Lock, Sparkles, CreditCard, Clock, Image, Moon, Ghost, Flame, Target, Cloud, Leaf, Palette, Eye, Compass, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { VistaProductVLogo, type VistaProduct } from "@/components/VistaProductVLogo";
import { useRouter } from "next/navigation";

const SIDEBAR_WIDTH = 72;

const SIDEBAR_PRODUCTS: { href: string; product: VistaProduct; label: string; aria: string }[] = [
  { href: "/dashboard/virtual-card", product: "virtual-card", label: "Card", aria: "VISTA Virtual Card" },
  { href: "/dashboard/time-machine", product: "time-machine", label: "Time", aria: "VISTA Time Machine" },
  { href: "/dashboard/mirror", product: "mirror", label: "Mirror", aria: "VISTA Mirror" },
  { href: "/dashboard/shadow", product: "shadow", label: "Shadow", aria: "VISTA Shadow" },
  { href: "/dashboard/ghost", product: "ghost", label: "Ghost", aria: "VISTA Ghost" },
  { href: "/dashboard/ritual", product: "ritual", label: "Ritual", aria: "VISTA Ritual" },
  { href: "/dashboard/zero", product: "zero", label: "Zero", aria: "VISTA Zero" },
  { href: "/dashboard/weather", product: "weather", label: "Weather", aria: "VISTA Weather" },
  { href: "/dashboard/garden", product: "garden", label: "Garden", aria: "VISTA Garden" },
  { href: "/dashboard/canvas", product: "canvas", label: "Canvas", aria: "VISTA Canvas" },
  { href: "/dashboard/oracle", product: "oracle", label: "Oracle", aria: "VISTA Oracle" },
  { href: "/dashboard/compass", product: "compass", label: "Compass", aria: "VISTA Compass" },
  { href: "/dashboard/spark", product: "spark", label: "Spark", aria: "VISTA Spark" },
];

interface DashboardShellProps {
  session: { user?: { email?: string | null; image?: string | null; name?: string | null } | null };
  overview: {
    totalMonthly: number;
    subscriptionCount: number;
    potentialSavings: number;
    netSpend: number;
  } | null;
  children: React.ReactNode;
  refreshAction: React.ReactNode;
}

export function DashboardShell({
  session,
  overview,
  children,
  refreshAction,
}: DashboardShellProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-violet-500/30 font-sans antialiased">
      <div className="fixed inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="flex">
        {/* Ultra-minimal fixed sidebar */}
        <aside
          className="fixed left-0 top-0 z-40 h-screen hidden md:flex flex-col border-r border-white/[0.06] backdrop-blur-xl bg-[#050505]/95"
          style={{ width: SIDEBAR_WIDTH }}
        >
          <div className="flex flex-col flex-1 min-h-0">
            <div className="py-5 flex flex-col items-center gap-6 border-b border-white/[0.06] shrink-0">
              <Link href="/" prefetch={false} className="flex flex-col items-center gap-1 text-zinc-400 hover:text-violet-300 transition-colors" aria-label="VISTA Home">
                <Logo size={28} />
              </Link>
              <Link href="/" prefetch={false} className="flex flex-col items-center gap-1 text-zinc-400 hover:text-violet-300 transition-colors">
                <Home size={20} />
                <span className="text-[10px] font-medium">Home</span>
              </Link>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                  <LayoutDashboard size={18} className="text-zinc-100" />
                </div>
                <span className="text-[10px] font-semibold text-zinc-200">Dashboard</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-500/15 border border-violet-500/30">
                <Circle size={6} className="text-violet-400 fill-violet-400 animate-pulse" />
                <span className="text-[10px] font-medium text-violet-400">Live</span>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 flex flex-col items-center gap-4">
              {SIDEBAR_PRODUCTS.map(({ href, product, label, aria }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
                  className="flex flex-col items-center gap-1 text-zinc-400 hover:text-violet-300 transition-colors shrink-0"
                  aria-label={aria}
                  title={aria}
                >
                  <VistaProductVLogo product={product} size={22} />
                  <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>

            <div className="py-4 flex flex-col items-center gap-1 shrink-0 border-t border-white/[0.06]">
              <button
                onClick={() => router.refresh()}
                className="p-2.5 rounded-xl text-zinc-400 hover:text-violet-300 hover:bg-white/[0.06] transition-all"
                aria-label="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              <Link
                href="/chat"
                prefetch={false}
                className="relative p-2.5 rounded-xl text-zinc-400 hover:text-violet-300 hover:bg-white/[0.06] transition-all block"
                aria-label="VISTA Aura"
                title="VISTA Aura · AI Financial Guardian"
              >
                <motion.span
                  className="block"
                  animate={{
                    boxShadow: [
                      "0 0 12px -2px rgba(139, 92, 246, 0.4), 0 0 20px -4px rgba(234, 179, 8, 0.15)",
                      "0 0 20px 0px rgba(139, 92, 246, 0.6), 0 0 28px -2px rgba(234, 179, 8, 0.25)",
                      "0 0 12px -2px rgba(139, 92, 246, 0.4), 0 0 20px -4px rgba(234, 179, 8, 0.15)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Logo size={20} />
                </motion.span>
              </Link>
            </div>
          </div>
        </aside>

        <main
          className="flex-1 min-h-screen pb-20 md:pb-0"
          style={{ marginLeft: 0, paddingLeft: SIDEBAR_WIDTH }}
        >
          <div className="sticky top-0 z-30 border-b border-white/[0.06] backdrop-blur-xl bg-[#050505]/90">
            <div className="px-4 sm:px-8 py-2 flex items-center justify-center gap-4 flex-wrap text-[11px] text-zinc-500 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                Military-Grade Subscription Shield
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-600">
                256-bit AES Encrypted
              </span>
              <span className="hidden sm:inline text-zinc-600">
                VISTA-1 Pro processes your metadata locally; your private emails never leave your context.
              </span>
            </div>
            <header className="flex items-center justify-end gap-2 px-4 sm:px-8 py-3">
              <Link href="/" prefetch={false} className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-violet-300 hover:bg-white/5 shrink-0" aria-label="Home">
                <Home size={20} />
              </Link>
              <Link
                href="/chat"
                prefetch={false}
                className="relative p-2 rounded-xl text-zinc-400 hover:text-violet-300 hover:bg-white/5 transition-colors"
                aria-label="VISTA Aura"
                title="VISTA Aura · AI Financial Guardian"
              >
                <motion.span
                  className="block"
                  animate={{
                    boxShadow: [
                      "0 0 12px -2px rgba(139, 92, 246, 0.4), 0 0 20px -4px rgba(234, 179, 8, 0.15)",
                      "0 0 20px 0px rgba(139, 92, 246, 0.6), 0 0 28px -2px rgba(234, 179, 8, 0.25)",
                      "0 0 12px -2px rgba(139, 92, 246, 0.4), 0 0 20px -4px rgba(234, 179, 8, 0.15)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Terminal size={20} />
                </motion.span>
              </Link>
              <Link
                href="/billing"
                prefetch={false}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold hover:bg-violet-500/25 transition-colors"
              >
                <Sparkles size={14} />
                Upgrade
              </Link>
              {refreshAction}
            </header>
          </div>
          <div className="p-4 sm:p-6 md:p-8 pb-6">{children}</div>
          <footer className="px-4 sm:px-8 py-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-zinc-600">
            <Lock size={12} className="shrink-0" />
            VISTA-1 Pro never stores your emails. We only process transactional metadata for your financial guard.
          </footer>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around py-2 px-2 border-t border-white/[0.06] backdrop-blur-xl bg-[#050505]/95">
          <Link href="/" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 min-w-0">
            <Logo size={22} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/dashboard" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-violet-400 bg-violet-500/10 border border-violet-500/20 min-w-0">
            <LayoutDashboard size={22} />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
          <Link href="/dashboard/virtual-card" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <CreditCard size={22} />
            <span className="text-[10px] font-medium">Card</span>
          </Link>
          <Link href="/dashboard/time-machine" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Clock size={22} />
            <span className="text-[10px] font-medium">Time</span>
          </Link>
          <Link href="/dashboard/mirror" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Image size={22} />
            <span className="text-[10px] font-medium">Mirror</span>
          </Link>
          <Link href="/dashboard/shadow" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Moon size={22} />
            <span className="text-[10px] font-medium">Shadow</span>
          </Link>
          <Link href="/dashboard/ghost" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Ghost size={22} />
            <span className="text-[10px] font-medium">Ghost</span>
          </Link>
          <Link href="/dashboard/ritual" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Flame size={22} />
            <span className="text-[10px] font-medium">Ritual</span>
          </Link>
          <Link href="/dashboard/zero" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Target size={22} />
            <span className="text-[10px] font-medium">Zero</span>
          </Link>
          <Link href="/dashboard/weather" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Cloud size={22} />
            <span className="text-[10px] font-medium">Weather</span>
          </Link>
          <Link href="/dashboard/garden" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Leaf size={22} />
            <span className="text-[10px] font-medium">Garden</span>
          </Link>
          <Link href="/dashboard/canvas" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Palette size={22} />
            <span className="text-[10px] font-medium">Canvas</span>
          </Link>
          <Link href="/dashboard/oracle" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Eye size={22} />
            <span className="text-[10px] font-medium">Oracle</span>
          </Link>
          <Link href="/dashboard/compass" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Compass size={22} />
            <span className="text-[10px] font-medium">Compass</span>
          </Link>
          <Link href="/dashboard/spark" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-zinc-400 hover:text-violet-300 min-w-0">
            <Zap size={22} />
            <span className="text-[10px] font-medium">Spark</span>
          </Link>
          <Link href="/chat" prefetch={false} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-violet-400/90 min-w-0">
            <Circle size={22} className="fill-current" />
            <span className="text-[10px] font-medium">Live</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
