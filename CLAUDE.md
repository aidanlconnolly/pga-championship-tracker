# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node is at `/opt/homebrew/bin/node` — it is not on PATH by default. Prefix all npm commands:

```bash
PATH=/opt/homebrew/bin:$PATH npm run dev      # start Vite dev server on :5173
PATH=/opt/homebrew/bin:$PATH npm run build    # tsc type-check + Vite production build
PATH=/opt/homebrew/bin:$PATH npm install      # install deps
```

No test runner is configured. Type-check only via `npm run build`.

Preview tool launch config is in `.claude/launch.json` — the parent working directory's `.claude/launch.json` also contains an entry named `pga-tracker` that the preview tool resolves.

## Architecture

Single-page React 18 + TypeScript app, Vite bundler, Tailwind v3. No backend — all data is static or fetched client-side.

### Data flow

`src/data/players.ts` is the single source of truth for the field. It exports:
- `PLAYERS` — array of ~40 `Player` objects with SG stats, odds, drive distance, up&down %, last 5 results, and 2025 PGA finish
- `PLAYERS_BY_ID` — lookup map keyed by slug id
- `DEFAULT_PICKS` — the hardcoded picks for Aidan and Dad (seeded from actual picks)
- `avgPosition(last5)` — utility that parses finish strings (`"T12"`, `"MC"`) into a numeric average (MC = 70)

`src/types.ts` defines `Player`, `Picks` (`{ me: UserPicks; dad: UserPicks }`), `UserPicks` (`{ main: string[]; darkHorse: string }`), and `LeaderboardRow`.

### State

`App.tsx` owns all state:
- `picks: Picks` — hydrated from URL params → localStorage → `DEFAULT_PICKS`, in that priority order
- `leaderboard: LeaderboardResult | null` — populated on manual refresh only (no polling)

Picks are synced to both `localStorage` and URL params on every change via `src/lib/storage.ts` and `src/lib/urlState.ts`.

### Tabs

Three tabs: **Analysis**, **Leaderboard**, **Compare**.

- **Analysis** (`AnalysisTab.tsx`) — renders two `PlayerTable` sections (Aidan / Dad picks) then a "Notable Players Not Added" section showing the top 20 favorites by odds not in either slate.
- **Leaderboard** (`Leaderboard.tsx`) — manual refresh hits `https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard`. Shows team summary cards (today + tournament totals) and a full leaderboard table with Pre-Tourney Odds and a Live Odds column (currently static `—`).
- **Compare** (`CompareTab.tsx`) — side-by-side slates with avg SG:Total, avg odds, odds edge, and live score totals when leaderboard data is present.

### PlayerTable

Receives `Player[]` extended with an optional `isDarkHorse` boolean. Dark horse rows render as `🐴 DH: Name`. All columns are sortable; `avgPos` is computed on the fly from `last5` via `avgPosition()`.

### Header image

The header background references `/quail-hollow.jpg` (served from `public/`). The file is not committed — drop the image into `public/quail-hollow.jpg` to activate it. Without it the fallback dark-green CSS gradient shows instead.

### Deployment

`vercel.json` configures a SPA rewrite (`/* → /index.html`) so shared pick URLs work. Deploy by importing the GitHub repo at vercel.com/new — no environment variables needed.
