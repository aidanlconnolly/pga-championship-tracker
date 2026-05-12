export type Player = {
  id: string;
  name: string;
  country: string;
  odds: number;          // American odds
  sgTotal: number;
  sgApp: number;
  sgPutt: number;
  sgOtt: number;         // Strokes Gained: Off The Tee
  sgArg: number;
  last5: string[];       // most recent first, includes 2025 PGA result
  avgDriveDistance: number; // yards
  upAndDown: number;     // percentage 0–100
  pga2025: string;       // 2025 PGA Championship finish
};

export type UserPicks = { main: string[]; darkHorse: string };
export type Picks = { me: UserPicks; dad: UserPicks };

export type LeaderboardRow = {
  name: string;
  position: string;
  totalScore: string;
  today: string;
  thru: string;
  status: string;
};

export type User = "me" | "dad";
export type Slot = "main" | "darkHorse";
