"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-6">
        <div className="h-9 w-24 rounded-full bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          prefetch={false}
          className="group relative px-10 py-5 bg-gradient-to-r from-violet-500 to-violet-600 rounded-2xl font-bold text-lg hover:from-violet-400 hover:to-violet-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/25 border border-white/10 inline-flex items-center"
        >
          <span className="flex items-center space-x-3">
            <span>Go to Dashboard</span>
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
        <div className="flex items-center gap-2 text-zinc-500 text-sm font-semibold">
          <CheckCircle2 size={18} className="text-emerald-500" />
          Signed in
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="group relative px-10 py-5 bg-gradient-to-r from-violet-500 to-violet-600 rounded-2xl font-bold text-lg hover:from-violet-400 hover:to-violet-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/25 border border-white/10"
      >
        <span className="flex items-center space-x-3">
          <span>Connect Gmail</span>
          <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
      <div className="flex items-center gap-2 text-zinc-500 text-sm font-semibold">
        <CheckCircle2 size={18} className="text-emerald-500" />
        No credit card required
      </div>
    </div>
  );
}
