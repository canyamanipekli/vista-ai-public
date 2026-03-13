const STORAGE_KEY = "vista_audit_log";
const MAX_ITEMS = 20;

export interface AuditEntry {
  id: string;
  type: "redirect";
  label: string;
  serviceName?: string;
  url?: string;
  timestamp: number;
}

export function getAuditLog(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

export function pushAuditEntry(entry: Omit<AuditEntry, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const list = getAuditLog();
    const newEntry: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
    window.dispatchEvent(new CustomEvent("vista-audit-log-update"));
  } catch {
    // ignore
  }
}

export function formatAuditTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 120_000) return "1m ago";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}
