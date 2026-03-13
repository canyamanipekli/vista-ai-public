"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, FileText, Key, AlertCircle } from "lucide-react";

type VaultItem = { id: string; name: string; type: "passport" | "seed" | "estate"; expiresAt?: string };

const MOCK_ITEMS: VaultItem[] = [
  { id: "1", name: "Passport", type: "passport", expiresAt: "2030-06-15" },
  { id: "2", name: "Estate Plan 2024", type: "estate" },
  { id: "3", name: "Recovery Phrase", type: "seed" },
];

function getExpiryAlert(expiresAt: string): number | null {
  const exp = new Date(expiresAt);
  const now = new Date();
  const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return days <= 30 ? days : null;
}

export function SovereignVault() {
  const [unlocked, setUnlocked] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handleUnlock = () => {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      setUnlocked(true);
    }, 1800);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden diamond-cut-card"
    >
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
        <Shield size={18} className="text-violet-400" />
        <h3 className="font-ultimate text-sm font-semibold text-zinc-100">Sovereign Vault</h3>
      </div>
      <div className="p-6">
        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div
              key="locked"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center py-6"
            >
              <motion.div
                animate={spinning ? { rotate: [0, 360] } : {}}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="relative w-24 h-24 rounded-2xl bg-zinc-800/80 border-2 border-zinc-600/50 flex items-center justify-center mb-4"
              >
                <div className="absolute inset-0 rounded-2xl border border-amber-600/30 bg-amber-950/20" />
                <Key size={32} className="text-amber-600/80" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500/50" />
              </motion.div>
              <p className="text-xs text-zinc-500 mb-4 font-data">Mechanical safe · Authenticate to open</p>
              <button
                type="button"
                onClick={handleUnlock}
                disabled={spinning}
                className="px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-medium hover:bg-amber-500/30 disabled:opacity-50"
              >
                {spinning ? "Opening…" : "Unlock Vault"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <p className="text-[10px] font-data text-emerald-500/90 mb-2">Expiry Sentinel · Alerts 30 days before expiry</p>
              {MOCK_ITEMS.map((item) => {
                const daysLeft = item.expiresAt ? getExpiryAlert(item.expiresAt) : null;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    {item.type === "passport" && <FileText size={16} className="text-zinc-500 shrink-0" />}
                    {item.type === "seed" && <Key size={16} className="text-zinc-500 shrink-0" />}
                    {item.type === "estate" && <FileText size={16} className="text-zinc-500 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-200">{item.name}</p>
                      {daysLeft != null && (
                        <p className="text-[10px] text-amber-400/90 flex items-center gap-1">
                          <AlertCircle size={10} />
                          Expires in {daysLeft} days
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
