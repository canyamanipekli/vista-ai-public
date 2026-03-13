"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface SuccessToastProps {
  visible: boolean;
  amountMonthly?: number;
  serviceName?: string;
  userName?: string | null;
  onDismiss: () => void;
  /** When true, show "Draft Prepared" instead of "Money Reclaimed" */
  draftPrepared?: boolean;
}

export function SuccessToast({
  visible,
  amountMonthly,
  serviceName,
  userName,
  onDismiss,
  draftPrepared = false,
}: SuccessToastProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  const displayAmount =
    amountMonthly != null && amountMonthly > 0
      ? `$${amountMonthly.toFixed(2)}/mo`
      : null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[100] max-w-[360px] rounded-2xl border border-violet-500/30 bg-[#050505]/95 backdrop-blur-xl shadow-xl shadow-violet-500/10 p-4 flex items-start gap-3"
        >
          <div className="shrink-0 w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <CheckCircle2 size={22} className="text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-100">
              {draftPrepared && displayAmount
                ? <>Draft Prepared · Money Reclaimed: {displayAmount}</>
                : draftPrepared
                  ? "Draft Prepared"
                  : displayAmount
                    ? <>Money Reclaimed: {displayAmount}</>
                    : "Money Reclaimed"}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {draftPrepared ? "Cancellation draft is in your Gmail." : <>Well done{userName ? `, ${userName}` : ""}.</>}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
