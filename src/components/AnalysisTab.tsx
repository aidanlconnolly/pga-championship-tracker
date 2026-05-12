import { useState } from "react";
import type { Picks } from "../types";
import { PLAYERS_BY_ID, avgPosition } from "../data/players";
import PlayerTable from "./PlayerTable";

const ALL_PICKED_IDS = new Set<string>();

function PickSection({
  label,
  accentClass,
  borderClass,
  ids,
  darkHorse,
}: {
  label: string;
  accentClass: string;
  borderClass: string;
  ids: string[];
  darkHorse: string;
}) {
  const players = ids.map((id) => PLAYERS_BY_ID[id]).filter(Boolean);
  const dh = darkHorse ? PLAYERS_BY_ID[darkHorse] : null;
  if (dh) players.push(dh);

  return (
    <section>
      <div className={`flex items-center gap-3 mb-2`}>
        <h2 className={`text-xl font-bold ${accentClass}`}>{label}</h2>
        <div className={`h-px flex-1 ${borderClass} opacity-40`} />
      </div>
      {dh && (
        <p className="text-xs text-slate-500 mb-2">
          🐴 Dark horse: <span className="text-slate-300">{dh.name}</span>
        </p>
      )}
      <PlayerTable players={players} />
    </section>
  );
}

export default function AnalysisTab({ picks }: { picks: Picks }) {
  const [avgPosFilter, setAvgPosFilter] = useState<number>(70);

  const allPickedIds = new Set([
    ...picks.me.main,
    picks.me.darkHorse,
    ...picks.dad.main,
    picks.dad.darkHorse,
  ].filter(Boolean));

  // Notable long shots: not picked, sorted by odds desc (highest odds = longest shot)
  const notableIds = Object.values(PLAYERS_BY_ID)
    .filter((p) => !allPickedIds.has(p.id))
    .filter((p) => avgPosition(p.last5) <= avgPosFilter)
    .sort((a, b) => b.odds - a.odds)
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <PickSection
        label="Aidan's Picks"
        accentClass="text-blue-300"
        borderClass="bg-blue-500"
        ids={picks.me.main}
        darkHorse={picks.me.darkHorse}
      />

      <PickSection
        label="Dad's Picks"
        accentClass="text-orange-300"
        borderClass="bg-orange-500"
        ids={picks.dad.main}
        darkHorse={picks.dad.darkHorse}
      />

      <section>
        <div className="flex items-center gap-4 mb-2 flex-wrap">
          <h2 className="text-xl font-bold text-slate-300">Notable Long Shots Not Chosen</h2>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-slate-400">Avg Pos filter ≤</label>
            <select
              value={avgPosFilter}
              onChange={(e) => setAvgPosFilter(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            >
              <option value={10}>Top 10 avg</option>
              <option value={20}>Top 20 avg</option>
              <option value={30}>Top 30 avg</option>
              <option value={70}>All</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Highest-odds players in the field not selected by either team, sorted by longest odds first.
        </p>
        {notableIds.length > 0 ? (
          <PlayerTable players={notableIds} />
        ) : (
          <p className="text-slate-500 text-sm">No players match the current filter.</p>
        )}
      </section>
    </div>
  );
}
