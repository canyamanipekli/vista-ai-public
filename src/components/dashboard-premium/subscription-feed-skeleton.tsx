"use client";

export function SubscriptionFeedSkeleton() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-white/10">
        <div className="h-4 w-32 bg-white/10 rounded-lg" />
        <div className="h-3 w-48 bg-white/5 rounded mt-2" />
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {[1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="flex items-center gap-4 px-6 py-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 bg-white/10 rounded" />
              <div className="h-3 w-20 bg-white/5 rounded" />
            </div>
            <div className="h-5 w-16 bg-white/10 rounded shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}
