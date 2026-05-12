import type { Picks } from "../types";

const KEY = "pga2026.picks";

export function loadPicks(): Picks | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Picks;
  } catch {
    return null;
  }
}

export function savePicks(p: Picks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}
