"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Tag } from "lucide-react";

const FILTERS = [
  { id: "all", label: "All", value: "" },
  { id: "promotions", label: "Promotions", value: "CATEGORY_PROMOTIONS" },
  { id: "social", label: "Social", value: "CATEGORY_SOCIAL" },
  { id: "updates", label: "Updates", value: "CATEGORY_UPDATES" },
  { id: "forums", label: "Forums", value: "CATEGORY_FORUMS" },
  { id: "personal", label: "Personal", value: "CATEGORY_PERSONAL" },
  { id: "starred", label: "Starred", value: "STARRED" },
];

export function DashboardSearchFilters() {
  const searchParams = useSearchParams();
  const currentQ = searchParams?.get("q") || "";
  const currentFilter = searchParams?.get("filter") || "";

  const buildHref = (q: string, filterValue: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (filterValue) params.set("filter", filterValue);
    return `/dashboard${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <div className="space-y-4 mb-6">
      <form method="GET" action="/dashboard" className="flex gap-2">
        <input type="hidden" name="filter" value={currentFilter} />
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
          <input
            type="text"
            name="q"
            defaultValue={currentQ}
            placeholder="Search subject, from, content..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900/50 border border-white/10 text-zinc-100 placeholder:text-zinc-500 text-sm focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-3 rounded-xl bg-violet-500/20 text-violet-300 text-sm font-medium hover:bg-violet-500/30 shrink-0"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const href = buildHref(currentQ, f.value);
          const isActive = currentFilter === f.value;
          return (
            <Link
              key={f.id}
              href={href}
              prefetch={false}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-violet-500/30 text-violet-300 border border-violet-500/50"
                  : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-zinc-100"
              }`}
            >
              {f.id === "starred" && <Tag size={12} />}
              {f.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
