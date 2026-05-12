import { useState, useCallback, useEffect } from "react";
import type { Picks, User, Slot } from "./types";
import { DEFAULT_PICKS } from "./data/players";
import { loadPicks, savePicks } from "./lib/storage";
import { readPicksFromUrl, writePicksToUrl } from "./lib/urlState";
import type { LeaderboardResult } from "./lib/espn";
import Tabs from "./components/Tabs";
import AnalysisTab from "./components/AnalysisTab";
import Leaderboard from "./components/Leaderboard";
import CompareTab from "./components/CompareTab";

const TABS = [
  { id: "analysis", label: "Analysis" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "compare", label: "Compare" },
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
  const [tab, setTab] = useState("analysis");
  const [picks, setPicks] = useState<Picks>(initPicks);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResult | null>(null);

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
                rgba(10,20,10,0.92) 0%,
                rgba(15,35,15,0.80) 40%,
                rgba(5,18,8,0.96) 100%
              ),
              url("https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Quail_Hollow_Club.jpg/1280px-Quail_Hollow_Club.jpg")
            `,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
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
          />
        )}

        {tab === "compare" && (
          <CompareTab picks={picks} leaderboard={leaderboard} />
        )}
      </div>
    </div>
  );
}
