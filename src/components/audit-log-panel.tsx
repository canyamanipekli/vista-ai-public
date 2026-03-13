"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, ExternalLink } from "lucide-react";
import { getAuditLog, formatAuditTime, type AuditEntry } from "@/lib/audit-log";

export function AuditLogPanel() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    setEntries(getAuditLog());
    const onUpdate = () => setEntries(getAuditLog());
    window.addEventListener("storage", onUpdate);
    window.addEventListener("vista-audit-log-update", onUpdate);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("vista-audit-log-update", onUpdate);
    };
  }, []);

  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
        <History size={18} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Recent Actions</h3>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {entries.slice(0, 5).map((e) => (
          <li key={e.id} className="flex items-center gap-3 px-6 py-3 hover:bg-white/[0.02]">
            <ExternalLink size={14} className="text-zinc-500 shrink-0" />
            <span className="text-sm text-zinc-300 truncate flex-1">{e.label}</span>
            <span className="text-xs text-zinc-500 shrink-0">{formatAuditTime(e.timestamp)}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
