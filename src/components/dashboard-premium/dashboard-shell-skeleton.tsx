"use client";

import { SubscriptionFeedSkeleton } from "./subscription-feed-skeleton";

export function DashboardShellSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="flex">
        <aside className="fixed left-0 top-0 z-40 h-screen w-16 hidden md:flex flex-col items-center py-5 border-r border-white/[0.06] bg-[#0a0a0b]/90" />
        <main className="flex-1 pl-0 md:pl-16 min-h-screen">
          <header className="sticky top-0 z-30 backdrop-blur-2xl bg-[#0a0a0a]/80 border-b border-white/[0.06]">
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
              <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-10 w-24 bg-white/10 rounded-xl animate-pulse" />
            </div>
          </header>
          <div className="p-4 sm:p-6 md:p-8 pb-24 space-y-8">
            <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-[320px] rounded-3xl bg-white/[0.02] border border-white/10 animate-pulse" />
              <div className="h-[320px] rounded-3xl bg-white/[0.02] border border-white/10 animate-pulse" />
            </div>
            <SubscriptionFeedSkeleton />
          </div>
        </main>
      </div>
    </div>
  );
}
