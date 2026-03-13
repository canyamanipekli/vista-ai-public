"use client";

import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { createReplyDraft } from "@/app/actions/gmail";

interface ReplyModalProps {
  messageId: string;
  subject: string;
  from: string;
  onClose: () => void;
  onSent?: () => void;
}

export function ReplyModal({
  messageId,
  subject,
  from,
  onClose,
  onSent,
}: ReplyModalProps) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setResult("idle");
    const res = await createReplyDraft(
      messageId,
      body.trim(),
      from,
      subject
    );
    setLoading(false);
    if (res.ok) {
      setResult("success");
      onSent?.();
      setTimeout(() => onClose(), 1500);
    } else {
      setResult("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#0d0d0e] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Reply</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 text-sm text-zinc-400">
          <p className="truncate">To: {from}</p>
          <p className="truncate mt-1">Re: {subject}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 pt-0 space-y-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your reply..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-indigo-500/50 resize-none"
          />
          {result === "success" && (
            <p className="text-sm text-emerald-400">Draft created. Open Gmail to send.</p>
          )}
          {result === "error" && (
            <p className="text-sm text-red-400">Failed to create draft.</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !body.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Create draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
