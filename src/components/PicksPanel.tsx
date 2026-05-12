import { useState } from "react";
import type { Picks, User, Slot } from "../types";
import { PLAYERS_BY_ID } from "../data/players";
import { shareUrl } from "../lib/urlState";

function UserCol({
  user,
  data,
  onClear,
}: {
  user: User;
  data: { main: string[]; darkHorse: string };
  onClear: (slot: Slot, idx: number) => void;
}) {
  const accent = user === "me" ? "text-blue-300" : "text-orange-300";
  const title = user === "me" ? "Aidan" : "Dad";
  return (
    <div className="rounded-lg border border-slate-800 p-4 bg-slate-900/40">
      <h3 className={`text-lg font-bold mb-3 ${accent}`}>{title}</h3>
      <ol className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => {
          const id = data.main[i];
          const p = id ? PLAYERS_BY_ID[id] : undefined;
          return (
            <li
              key={i}
              className="flex items-center justify-between gap-2 text-sm bg-slate-950 border border-slate-800 rounded px-3 py-2"
            >
              <span className="text-slate-500 w-5">{i + 1}.</span>
              <span className="flex-1">
                {p ? p.name : <span className="text-slate-600">empty slot</span>}
              </span>
              {p && (
                <button
                  onClick={() => onClear("main", i)}
                  className="text-xs text-slate-500 hover:text-red-400"
                >
                  ✕
                </button>
              )}
            </li>
          );
        })}
        <li className="flex items-center justify-between gap-2 text-sm bg-yellow-500/10 border border-yellow-600/40 rounded px-3 py-2">
          <span className="text-yellow-400 w-5">★</span>
          <span className="flex-1">
            {data.darkHorse ? (
              PLAYERS_BY_ID[data.darkHorse]?.name ?? data.darkHorse
            ) : (
              <span className="text-slate-600">dark horse</span>
            )}
          </span>
          {data.darkHorse && (
            <button
              onClick={() => onClear("darkHorse", 0)}
              className="text-xs text-slate-500 hover:text-red-400"
            >
              ✕
            </button>
          )}
        </li>
      </ol>
    </div>
  );
}

export default function PicksPanel({
  picks,
  onSet,
  onClear,
}: {
  picks: Picks;
  onSet: (user: User, slot: Slot, idx: number, id: string) => void;
  onClear: (user: User, slot: Slot, idx: number) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [paste, setPaste] = useState("");
  const [pasteUser, setPasteUser] = useState<User>("me");
  const [pasteResult, setPasteResult] = useState<string>("");

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(picks));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const importFromNote = () => {
    const lines = paste.split(/\r?\n/).map((l) => l.trim());
    const pgaIdx = lines.findIndex((l) => /pga/i.test(l));
    const slice = pgaIdx >= 0 ? lines.slice(pgaIdx + 1) : lines;
    let mainCount = 0;
    let darkHorseSet = false;
    let matched: string[] = [];
    for (const raw of slice) {
      if (!raw) continue;
      const isDH = /dark\s*horse/i.test(raw);
      const cleaned = raw.replace(/dark\s*horse:?/i, "").replace(/^[-*•]\s*/, "").trim();
      if (!cleaned) continue;
      const match = findPlayerByName(cleaned);
      if (!match) continue;
      if (isDH && !darkHorseSet) {
        onSet(pasteUser, "darkHorse", 0, match);
        darkHorseSet = true;
        matched.push(`★ ${PLAYERS_BY_ID[match].name}`);
      } else if (mainCount < 5) {
        onSet(pasteUser, "main", mainCount, match);
        mainCount++;
        matched.push(PLAYERS_BY_ID[match].name);
      }
    }
    setPasteResult(matched.length ? `Imported: ${matched.join(", ")}` : "No matches found.");
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <UserCol user="me" data={picks.me} onClear={(s, i) => onClear("me", s, i)} />
        <UserCol user="dad" data={picks.dad} onClear={(s, i) => onClear("dad", s, i)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={copyShare}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-semibold"
        >
          {copied ? "Copied!" : "Copy share link"}
        </button>
        <span className="text-xs text-slate-400">
          Picks are saved automatically and encoded in the URL.
        </span>
      </div>

      <div className="rounded-lg border border-slate-800 p-4 bg-slate-900/40 space-y-2">
        <h4 className="font-semibold">Paste from Masters note</h4>
        <p className="text-xs text-slate-400">
          Paste the block from the Notes app. Lines below the line containing
          "PGA" are matched against player names.
        </p>
        <div className="flex gap-2 items-center">
          <label className="text-xs">Apply to:</label>
          <select
            value={pasteUser}
            onChange={(e) => setPasteUser(e.target.value as User)}
            className="bg-slate-950 border border-slate-700 rounded text-sm px-2 py-1"
          >
            <option value="me">Aidan</option>
            <option value="dad">Dad</option>
          </select>
        </div>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={6}
          placeholder={"PGA\nRory\nYoung\n..."}
          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm font-mono"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={importFromNote}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
          >
            Import picks
          </button>
          {pasteResult && <span className="text-xs text-slate-300">{pasteResult}</span>}
        </div>
      </div>
    </div>
  );
}

function findPlayerByName(query: string): string | null {
  const q = query.toLowerCase().replace(/[^a-z]/g, "");
  if (!q) return null;
  for (const id in PLAYERS_BY_ID) {
    const p = PLAYERS_BY_ID[id];
    const full = p.name.toLowerCase().replace(/[^a-z]/g, "");
    const last = p.name.split(" ").slice(-1)[0].toLowerCase().replace(/[^a-z]/g, "");
    if (full.includes(q) || last === q || q.includes(last)) return id;
  }
  return null;
}
