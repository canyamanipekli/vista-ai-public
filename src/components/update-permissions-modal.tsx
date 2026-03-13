"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert } from "lucide-react";

interface UpdatePermissionsModalProps {
  open: boolean;
  onDismiss: () => void;
  /** Premium "Unlock Agent Actions" variant */
  variant?: "permissions" | "unlock-agent";
}

export function UpdatePermissionsModal({ open, onDismiss, variant = "permissions" }: UpdatePermissionsModalProps) {
  const router = useRouter();
  const isUnlockAgent = variant === "unlock-agent";

  const handleUpdate = () => {
    onDismiss();
    signOut({ redirect: false }).then(() => {
      router.push("/api/auth/signin?callbackUrl=/dashboard");
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={onDismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-[201] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#050505] p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${isUnlockAgent ? "bg-violet-500/20" : "bg-amber-500/20"}`}>
                <ShieldAlert className={`w-6 h-6 ${isUnlockAgent ? "text-violet-400" : "text-amber-400"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-white">{isUnlockAgent ? "Unlock Agent Actions" : "Update Permissions"}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {isUnlockAgent
                    ? "Allow VISTA to create Formal Cancellation Request drafts in your Gmail. Sign in again and grant compose permission for full autonomous execution."
                    : "Gmail needs full access to read and manage your emails. Please sign in again and grant Gmail read and compose permissions so VISTA can scan your inbox and help you cancel subscriptions."}
                </p>
              </div>
              <button
                onClick={onDismiss}
                className="shrink-0 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onDismiss}
                className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-300 font-medium hover:bg-white/5 transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleUpdate}
                className={`flex-1 py-3 rounded-xl font-semibold active:scale-[0.98] transition-all ${isUnlockAgent ? "bg-violet-500 text-white hover:bg-violet-400" : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500"}`}
              >
                {isUnlockAgent ? "Unlock Agent Actions" : "Sign in again"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
