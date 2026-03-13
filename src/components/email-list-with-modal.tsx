"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, User, Calendar, Star, AlertTriangle, ExternalLink } from "lucide-react";
import type { EmailPreview } from "@/app/actions/gmail";
import { starEmail } from "@/app/actions/gmail";

function formatAmount(amount: number, currency?: string) {
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "TRY" ? "₺" : "$";
  return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    }
  } catch {
    return dateStr;
  }
}

interface EmailListWithModalProps {
  emails: EmailPreview[];
}

export function EmailListWithModal({ emails }: EmailListWithModalProps) {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") || "";
  const filter = searchParams?.get("filter") || "";
  const returnTo =
    q || filter
      ? `/dashboard?${new URLSearchParams({ q, filter }).toString()}`
      : "/dashboard";

  const [starredIds, setStarredIds] = useState<Set<string>>(() => {
    const s = new Set<string>();
    emails.forEach((e) => {
      if (e.labelIds?.includes("STARRED")) s.add(e.id);
    });
    return s;
  });

  const handleStar = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    const starred = starredIds.has(messageId);
    const res = await starEmail(messageId, !starred);
    if (res.ok) {
      setStarredIds((prev) => {
        const next = new Set(prev);
        if (starred) next.delete(messageId);
        else next.add(messageId);
        return next;
      });
    }
  };

  return (
    <>
      <div className="space-y-2">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`group flex items-start gap-4 p-5 rounded-2xl transition-all duration-200 border ${
              email.category === "Refund"
                ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                : email.potential_error
                  ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                  : email.price_hike
                    ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                    : email.alertType
                      ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                      : "hover:bg-white/[0.03] border-transparent hover:border-white/[0.06]"
            }`}
          >
            <Link
              href={`/dashboard/email/${email.id}?returnTo=${encodeURIComponent(returnTo)}`}
              prefetch={false}
              className="flex-1 flex items-start gap-4 min-w-0 text-left"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center overflow-hidden group-hover:bg-indigo-500/10 transition-colors">
                {email.senderDomain ? (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${email.senderDomain}&sz=32`}
                    alt=""
                    className="w-6 h-6"
                    width={24}
                    height={24}
                  />
                ) : (
                  <Mail size={20} className="text-indigo-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {email.price_hike && (
                    <span className="shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                      Price Hike
                    </span>
                  )}
                  {email.potential_error && (
                    <span className="shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                      Duplicate?
                    </span>
                  )}
                  {email.alertType && (
                    <span className="flex-shrink-0 text-red-400" title={
                      email.alertType === "trial" ? "Trial" :
                      email.alertType === "free_ends" ? "Free period ends" :
                      "Price increase"
                    }>
                      <AlertTriangle size={16} fill="currentColor" />
                    </span>
                  )}
                  <h3 className="font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                    {email.subject}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-zinc-500">
                  <span className="flex items-center gap-1.5 truncate">
                    <User size={14} className="flex-shrink-0 text-zinc-600" />
                    {email.from}
                  </span>
                  <span className="flex items-center gap-1.5 flex-shrink-0">
                    <Calendar size={14} className="text-zinc-600" />
                    {formatDate(email.date)}
                  </span>
                  {email.category && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        email.category === "Refund"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-indigo-500/20 text-indigo-400"
                      }`}
                    >
                      {email.category}
                    </span>
                  )}
                  {email.increase_amount !== undefined && email.increase_amount > 0 && (
                    <span className="text-xs text-amber-400">
                      +{formatAmount(email.increase_amount, email.currency)}
                    </span>
                  )}
                  {email.amount !== undefined && email.amount > 0 && (
                    <span className={
                      email.category === "Refund"
                        ? "text-emerald-400 font-semibold"
                        : email.alertType
                          ? "text-emerald-400 font-semibold"
                          : "text-red-400 font-medium"
                    }>
                      {formatAmount(email.amount, email.currency)}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2 shrink-0">
              {email.category === "Subscription" &&
                email.cancellation_url && (
                  <a
                    href={email.cancellation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Manage Subscription
                  </a>
                )}
            <button
              onClick={(e) => handleStar(e, email.id)}
              className={`p-2 rounded-lg transition-colors ${
                starredIds.has(email.id)
                  ? "text-amber-400 hover:bg-amber-500/20"
                  : "opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-amber-400 hover:bg-white/10"
              }`}
              aria-label={starredIds.has(email.id) ? "Unstar" : "Star"}
              title={starredIds.has(email.id) ? "Unstar" : "Star"}
            >
              <Star
                size={18}
                fill={starredIds.has(email.id) ? "currentColor" : "none"}
              />
            </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
