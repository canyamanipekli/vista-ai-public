"use client";

import { useEffect, useState } from "react";
import { X, User, Calendar, Loader2, Star, Reply } from "lucide-react";
import { getFullEmail, starEmail, type FullEmail } from "@/app/actions/gmail";
import { ReplyModal } from "@/components/reply-modal";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

interface EmailViewModalProps {
  messageId: string | null;
  subject: string;
  from: string;
  date: string;
  starred?: boolean;
  onClose: () => void;
  onStarChange?: (starred: boolean) => void;
}

export function EmailViewModal({
  messageId,
  subject,
  from,
  date,
  starred = false,
  onClose,
  onStarChange,
}: EmailViewModalProps) {
  const [email, setEmail] = useState<FullEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starredState, setStarredState] = useState(starred);
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    if (!messageId) {
      setEmail(null);
      setLoading(false);
      return;
    }
    setStarredState(starred);
    setLoading(true);
    getFullEmail(messageId)
      .then(setEmail)
      .finally(() => setLoading(false));
  }, [messageId, starred]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-[#0d0d0e] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-semibold text-white truncate pr-4 flex-1 min-w-0">
            {subject}
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={async () => {
                if (!messageId) return;
                const res = await starEmail(messageId, !starredState);
                if (res.ok) {
                  setStarredState(!starredState);
                  onStarChange?.(!starredState);
                }
              }}
              className={`p-2 rounded-lg transition-colors ${
                starredState
                  ? "text-amber-400 hover:bg-amber-500/20"
                  : "text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
              aria-label={starredState ? "Unstar" : "Star"}
              title={starredState ? "Unstar" : "Star"}
            >
              <Star size={20} fill={starredState ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => setShowReply(true)}
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              aria-label="Reply"
              title="Reply"
            >
              <Reply size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 border-b border-white/10 text-sm shrink-0">
          <div className="flex items-center gap-2 text-zinc-400">
            <User size={14} className="text-zinc-500 shrink-0" />
            <span className="truncate">{from}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar size={14} className="text-zinc-500 shrink-0" />
            <span>{formatDate(date)}</span>
          </div>
        </div>

        <div className="flex-1 min-h-[200px] overflow-auto p-4 text-zinc-300 text-sm leading-relaxed">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : email ? (
            <>
              {email.bodyHtml ? (
                <div
                  className="email-body text-zinc-300 bg-white/5 rounded-lg p-4 [&_a]:text-indigo-400 [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                  dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-zinc-300 break-words">
                  {email.bodyText}
                </pre>
              )}
            </>
          ) : (
            <p className="text-zinc-500">Failed to load email content. Check the console for errors.</p>
          )}
        </div>
      </div>

      {showReply && messageId && (
        <ReplyModal
          messageId={messageId}
          subject={subject}
          from={from}
          onClose={() => setShowReply(false)}
        />
      )}
    </div>
  );
}
