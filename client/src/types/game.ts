export type Player = 0 | 1;
export type GameMode = "menu" | "single" | "multi";
export type GamePhase = "waiting" | "playing" | "ended";
export type Difficulty = "easy" | "medium" | "hard";

export interface GameState {
  pits: number[];           // 12 pits: 0-5 = P1 (bottom), 6-11 = P2 (top)
  captured: [number, number]; // [P1 total captured, P2 total captured]
  currentPlayer: Player;
  validMoves: number[];
  phase: GamePhase;
  winner: Player | "draw" | null;
  lastMove: number | null;
  lastSown: number[];       // pits that were sown in the last move (for animation)
  lastCaptured: number[];   // pits captured in the last move (for animation)
  consecutiveNonCaptures: number; // for draw detection
}

export interface RoomState {
  roomId: string;
  players: [string | null, string | null]; // socket IDs
  playerNames: [string, string];
  gameState: GameState;
  phase: "waiting" | "playing" | "ended";
}

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
}

// Socket event payloads
export interface JoinRoomPayload {
  roomId: string;
  playerName: string;
}

export interface MakeMovePayload {
  roomId: string;
  pit: number;
}
