import type { Picks } from "../types";
import { PLAYERS_BY_ID } from "../data/players";
import type { LeaderboardResult } from "../lib/espn";
import { parseScore } from "../lib/espn";

function findRow(name: string, rows: LeaderboardResult["rows"] | undefined) {
  if (!rows || rows.length === 0) return null;
  const normalize = (n: string) => n.toLowerCase().replace(/[^a-z]/g, "");
  const last = name.split(" ").slice(-1)[0];
  return (
    rows.find((r) => {
      const q = normalize(r.name);
      return q.includes(normalize(last)) || normalize(name).includes(q);
    }) ?? null
  );
}

function fmtScore(s: string | null | undefined) {
  if (!s) return "—";
  if (s === "E" || s === "EVEN") return "E";
  return s;
}
function fmtOdds(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}
function fmtSg(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2);
}

export default function CompareTab({
  picks,
  leaderboard,
}: {
  picks: Picks;
  leaderboard: LeaderboardResult | null;
}) {
  const meIds = [...picks.me.main, picks.me.darkHorse].filter(Boolean);
  const dadIds = [...picks.dad.main, picks.dad.darkHorse].filter(Boolean);

  const meTotal = meIds.reduce((s, id) => {
    const p = PLAYERS_BY_ID[id];
    if (!p) return s;
    const row = findRow(p.name, leaderboard?.rows);
    return s + (row ? parseScore(row.totalScore) : 0);
  }, 0);
  const dadTotal = dadIds.reduce((s, id) => {
    const p = PLAYERS_BY_ID[id];
    if (!p) return s;
    const row = findRow(p.name, leaderboard?.rows);
    return s + (row ? parseScore(row.totalScore) : 0);
  }, 0);

  const meAvgSg = meIds.reduce((s, id) => s + (PLAYERS_BY_ID[id]?.sgTotal ?? 0), 0) / (meIds.length || 1);
  const dadAvgSg = dadIds.reduce((s, id) => s + (PLAYERS_BY_ID[id]?.sgTotal ?? 0), 0) / (dadIds.length || 1);

  const live = leaderboard && leaderboard.rows.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <UserColumn user="me" ids={meIds} leaderboard={leaderboard} label="Aidan" />
        <UserColumn user="dad" ids={dadIds} leaderboard={leaderboard} label="Dad" />
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <h4 className="text-sm font-semibold text-slate-400 mb-3">Head-to-Head</h4>
        <div className="grid grid-cols-3 text-center gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Avg SG:Total</p>
            <p className={`text-lg font-bold ${meAvgSg > dadAvgSg ? "text-blue-300" : "text-slate-300"}`}>
              {meAvgSg.toFixed(2)}
            </p>
            <p className={`text-lg font-bold ${dadAvgSg > meAvgSg ? "text-orange-300" : "text-slate-300"}`}>
              {dadAvgSg.toFixed(2)}
            </p>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Aidan</span>
              <span>Dad</span>
            </div>
          </div>
          {live && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Tournament Score</p>
              <p className={`text-lg font-bold ${meTotal < dadTotal ? "text-blue-300" : "text-slate-300"}`}>
                {meTotal === 0 ? "E" : meTotal > 0 ? `+${meTotal}` : meTotal}
              </p>
              <p className={`text-lg font-bold ${dadTotal < meTotal ? "text-orange-300" : "text-slate-300"}`}>
                {dadTotal === 0 ? "E" : dadTotal > 0 ? `+${dadTotal}` : dadTotal}
              </p>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Aidan</span>
                <span>Dad</span>
              </div>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {live ? "Leading" : "Pre-tourney edge"}
            </p>
            <p className="text-lg font-bold text-yellow-300">
              {live
                ? meTotal < dadTotal
                  ? "Aidan"
                  : dadTotal < meTotal
                  ? "Dad"
                  : "Tied"
                : meAvgSg > dadAvgSg
                ? "Aidan"
                : dadAvgSg > meAvgSg
                ? "Dad"
                : "Tied"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserColumn({
  user,
  ids,
  leaderboard,
  label,
}: {
  user: "me" | "dad";
  ids: string[];
  leaderboard: LeaderboardResult | null;
  label: string;
}) {
  const accent = user === "me" ? "text-blue-300" : "text-orange-300";
  const border = user === "me" ? "border-blue-800" : "border-orange-800";
  const live = leaderboard && leaderboard.rows.length > 0;

  return (
    <div className={`rounded-lg border ${border} bg-slate-900/40 p-4`}>
      <h3 className={`text-lg font-bold mb-3 ${accent}`}>{label}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-800">
            <th className="pb-2 text-left">#</th>
            <th className="pb-2 text-left">Player</th>
            <th className="pb-2 text-right">Odds</th>
            <th className="pb-2 text-right">SG</th>
            {live && <th className="pb-2 text-right">Score</th>}
            {live && <th className="pb-2 text-right">Pos</th>}
          </tr>
        </thead>
        <tbody>
          {ids.map((id, i) => {
            const p = PLAYERS_BY_ID[id];
            const row = p ? findRow(p.name, leaderboard?.rows) : null;
            return (
              <tr key={id} className="border-b border-slate-800/50">
                <td className="py-2 text-slate-500 text-xs">{i === 5 ? "★" : i + 1}</td>
                <td className="py-2">{p?.name ?? id}</td>
                <td className="py-2 text-right tabular-nums text-slate-400">
                  {p ? fmtOdds(p.odds) : "—"}
                </td>
                <td className="py-2 text-right tabular-nums text-slate-400">
                  {p ? fmtSg(p.sgTotal) : "—"}
                </td>
                {live && (
                  <td className="py-2 text-right tabular-nums font-semibold">
                    {fmtScore(row?.totalScore)}
                  </td>
                )}
                {live && (
                  <td className="py-2 text-right tabular-nums text-slate-400">
                    {row?.position ?? "—"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
