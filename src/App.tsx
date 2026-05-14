import { useState, useCallback, useEffect } from "react";
import type { Picks, User, Slot } from "./types";
import { DEFAULT_PICKS } from "./data/players";
import { loadPicks, savePicks } from "./lib/storage";
import { readPicksFromUrl, writePicksToUrl } from "./lib/urlState";
import type { LeaderboardResult } from "./lib/espn";
import type { LiveOdds } from "./lib/odds";
import Tabs from "./components/Tabs";
import AnalysisTab from "./components/AnalysisTab";
import Leaderboard from "./components/Leaderboard";
import CompareTab from "./components/CompareTab";

const TABS = [
  { id: "leaderboard", label: "Leaderboard" },
  { id: "compare", label: "Compare" },
  { id: "analysis", label: "Initial Analysis" },
];

function initPicks(): Picks {
  const fromUrl = readPicksFromUrl();
  if (fromUrl?.me && fromUrl?.dad) return fromUrl as Picks;
  const fromStorage = loadPicks();
  if (fromStorage) return fromStorage;
  return {
    me: { main: [...DEFAULT_PICKS.me.main], darkHorse: DEFAULT_PICKS.me.darkHorse },
    dad: { main: [...DEFAULT_PICKS.dad.main], darkHorse: DEFAULT_PICKS.dad.darkHorse },
  };
}

export default function App() {
  const [tab, setTab] = useState("leaderboard");
  const [picks, setPicks] = useState<Picks>(initPicks);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResult | null>(null);
  const [liveOdds, setLiveOdds] = useState<LiveOdds | null>(null);

  useEffect(() => {
    savePicks(picks);
    writePicksToUrl(picks);
  }, [picks]);

  const handleSet = useCallback(
    (user: User, slot: Slot, idx: number, id: string) => {
      setPicks((prev) => {
        const next = structuredClone(prev);
        if (slot === "darkHorse") {
          next[user].darkHorse = id;
        } else {
          next[user].main[idx] = id;
        }
        return next;
      });
    },
    []
  );

  const handleClear = useCallback((user: User, slot: Slot, idx: number) => {
    setPicks((prev) => {
      const next = structuredClone(prev);
      if (slot === "darkHorse") {
        next[user].darkHorse = "";
      } else {
        next[user].main.splice(idx, 1);
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header with Quail Hollow background */}
      <header className="relative overflow-hidden">
        {/* Course background: layered gradients simulating a fairway at dusk */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                180deg,
                rgba(5,12,5,0.82) 0%,
                rgba(8,22,8,0.65) 50%,
                rgba(5,12,5,0.88) 100%
              ),
              url("/quail-hollow.jpg")
            `,
            backgroundSize: "cover",
            backgroundPosition: "center 42%",
            filter: "saturate(0.7)",
          }}
        />
        {/* Fallback gradient if image fails */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-green-950/30 to-slate-950 -z-10" />
        <div className="relative px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-lg">
            ⛳ 2026 PGA Championship
          </h1>
          <p className="text-slate-300 mt-1 text-sm md:text-base drop-shadow">
            Quail Hollow Club · Charlotte, NC · May 15–18, 2026
          </p>
        </div>
      </header>

      <div className="px-4 md:px-6 py-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "analysis" && <AnalysisTab picks={picks} />}

        {tab === "leaderboard" && (
          <Leaderboard
            picks={picks}
            leaderboard={leaderboard}
            onLeaderboard={setLeaderboard}
            liveOdds={liveOdds}
            onLiveOdds={setLiveOdds}
          />
        )}

        {tab === "compare" && (
          <CompareTab picks={picks} leaderboard={leaderboard} />
        )}
      </div>
    </div>
  );
}
