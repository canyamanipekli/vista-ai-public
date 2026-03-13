/**
 * VISTA Ghost — level and badges from "defeated" count (audit log redirects = cancellations).
 */

export const BADGES = [
  { id: "first-blood", minDefeated: 1, label: "First Blood", description: "Defeated your first ghost" },
  { id: "ghost-buster-3", minDefeated: 3, label: "Ghost Buster", description: "3 ghosts defeated" },
  { id: "ghost-hunter-5", minDefeated: 5, label: "VISTA Ghost Hunter", description: "5 ghosts defeated" },
  { id: "ghost-hunter-10", minDefeated: 10, label: "Elite Ghost Hunter", description: "10 ghosts defeated" },
] as const;

export function getLevel(defeatedCount: number): number {
  return Math.max(1, 1 + Math.floor(defeatedCount / 3));
}

export function getBadgesUnlocked(defeatedCount: number): typeof BADGES[number][] {
  return BADGES.filter((b) => defeatedCount >= b.minDefeated);
}

export function getNextBadge(defeatedCount: number): (typeof BADGES)[number] | null {
  return BADGES.find((b) => defeatedCount < b.minDefeated) ?? null;
}
