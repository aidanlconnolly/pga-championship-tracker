import type { LeaderboardRow } from "../types";

const URL =
  "https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard";

export type LeaderboardResult = {
  rows: LeaderboardRow[];
  eventName: string;
  status: string;
  fetchedAt: number;
};

export async function fetchLeaderboard(): Promise<LeaderboardResult> {
  const res = await fetch(URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`ESPN ${res.status}`);
  const data = await res.json();
  const event = data?.events?.[0];
  const comp = event?.competitions?.[0];
  const competitors: any[] = comp?.competitors ?? [];
  const rows: LeaderboardRow[] = competitors.map((c) => {
    const a = c?.athlete ?? {};
    const stats: any[] = c?.statistics ?? [];
    const getStat = (key: string) =>
      stats.find((s) => s.name === key || s.abbreviation === key)?.displayValue ?? "";
    return {
      name: a.displayName ?? a.shortName ?? "",
      position: c?.status?.position?.displayName ?? c?.status?.position?.id ?? "",
      totalScore: c?.score ?? getStat("scoreToPar") ?? "",
      today: getStat("today") ?? "",
      thru: c?.status?.thru != null ? String(c.status.thru) : (c?.status?.type?.shortDetail ?? ""),
      status: c?.status?.type?.description ?? "",
    };
  });
  return {
    rows,
    eventName: event?.name ?? "",
    status: comp?.status?.type?.description ?? event?.status?.type?.description ?? "",
    fetchedAt: Date.now(),
  };
}

// crude score parser: "-7" -> -7, "E" -> 0, "+3" -> 3
export function parseScore(s: string): number {
  if (!s) return 0;
  if (s === "E" || s === "EVEN") return 0;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}
