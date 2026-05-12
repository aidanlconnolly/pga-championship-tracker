import type { Picks } from "../types";
import { PLAYERS_BY_ID } from "../data/players";

function encodeUser(u: { main: string[]; darkHorse: string }): string {
  return [...u.main, u.darkHorse].filter(Boolean).join(",");
}

function decodeUser(raw: string | null): { main: string[]; darkHorse: string } | null {
  if (!raw) return null;
  const ids = raw.split(",").map((s) => s.trim()).filter((id) => PLAYERS_BY_ID[id]);
  if (ids.length === 0) return null;
  const darkHorse = ids.length >= 6 ? ids[5] : "";
  const main = ids.slice(0, 5);
  return { main, darkHorse };
}

export function readPicksFromUrl(): Partial<Picks> | null {
  const params = new URLSearchParams(window.location.search);
  const me = decodeUser(params.get("me"));
  const dad = decodeUser(params.get("dad"));
  if (!me && !dad) return null;
  const out: Partial<Picks> = {};
  if (me) out.me = me;
  if (dad) out.dad = dad;
  return out;
}

export function writePicksToUrl(picks: Picks) {
  const params = new URLSearchParams(window.location.search);
  params.set("me", encodeUser(picks.me));
  params.set("dad", encodeUser(picks.dad));
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", url);
}

export function shareUrl(picks: Picks): string {
  const params = new URLSearchParams();
  params.set("me", encodeUser(picks.me));
  params.set("dad", encodeUser(picks.dad));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
