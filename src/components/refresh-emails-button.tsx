"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Database } from "lucide-react";

export function RefreshEmailsButton() {
  const router = useRouter();
  const [resyncing, setResyncing] = useState(false);

  const handleResync = () => {
    setResyncing(true);
    router.push("/dashboard?resync=1");
    router.refresh();
    setTimeout(() => setResyncing(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleResync}
        disabled={resyncing}
        title="Fresh 5-minute deep scan of inbox"
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 hover:text-white hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-300 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        <Database size={14} className="shrink-0" />
        {resyncing ? "Resyncing…" : "Resync"}
      </button>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-zinc-400 hover:text-white hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-300 active:scale-[0.98] transition-all"
      >
        <RefreshCw size={16} className="shrink-0" />
        Refresh
      </button>
    </div>
  );
}
