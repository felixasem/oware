export type Player = 0 | 1;

export interface GameState {
  pits: number[];
  captured: [number, number];
  currentPlayer: Player;
  validMoves: number[];
  phase: "waiting" | "playing" | "ended";
  winner: Player | "draw" | null;
  lastMove: number | null;
  lastSown: number[];
  lastCaptured: number[];
  consecutiveNonCaptures: number;
}

export interface Room {
  id: string;
  players: [string | null, string | null]; // socket IDs
  playerNames: [string, string];
  gameState: GameState;
}
