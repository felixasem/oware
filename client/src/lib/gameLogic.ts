import type { GameState, Player } from "@/types/game";

// ─── Constants ────────────────────────────────────────────────────────────────

export const TOTAL_PITS = 12;
export const SEEDS_PER_PIT = 4;
export const TOTAL_SEEDS = TOTAL_PITS * SEEDS_PER_PIT; // 48

export const P1_PITS = [0, 1, 2, 3, 4, 5] as const;
export const P2_PITS = [6, 7, 8, 9, 10, 11] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPlayerPits(player: Player): readonly number[] {
  return player === 0 ? P1_PITS : P2_PITS;
}

export function getOpponentPits(player: Player): readonly number[] {
  return player === 0 ? P2_PITS : P1_PITS;
}

export function isPlayerPit(pit: number, player: Player): boolean {
  return player === 0 ? pit < 6 : pit >= 6;
}

export function isOpponentPit(pit: number, player: Player): boolean {
  return !isPlayerPit(pit, player);
}

// Returns next pit index in counter-clockwise direction (increasing index mod 12)
export function nextPit(pit: number): number {
  return (pit + 1) % TOTAL_PITS;
}

// Returns previous pit index (clockwise, for capture cascade)
export function prevPit(pit: number): number {
  return (pit - 1 + TOTAL_PITS) % TOTAL_PITS;
}

export function totalSeeds(pits: number[]): number {
  return pits.reduce((a, b) => a + b, 0);
}

export function seedsOnSide(pits: number[], player: Player): number {
  return getPlayerPits(player).reduce((sum, i) => sum + pits[i], 0);
}

// ─── Initial State ────────────────────────────────────────────────────────────

export function createInitialState(): GameState {
  return {
    pits: Array(TOTAL_PITS).fill(SEEDS_PER_PIT),
    captured: [0, 0],
    currentPlayer: 0,
    validMoves: P1_PITS.slice(), // P1 always starts
    phase: "playing",
    winner: null,
    lastMove: null,
    lastSown: [],
    lastCaptured: [],
    consecutiveNonCaptures: 0,
  };
}

// ─── Move Validation ─────────────────────────────────────────────────────────

/** Simulate sowing to check which pits would receive seeds. */
function sowSimulate(pits: number[], startPit: number): { finalPits: number[]; lastPit: number; sownPits: number[] } {
  const newPits = [...pits];
  let seeds = newPits[startPit];
  newPits[startPit] = 0;

  let current = startPit;
  const sownPits: number[] = [];

  while (seeds > 0) {
    current = nextPit(current);
    // Skip the starting pit if distributing > 11 seeds (going all the way around)
    if (current === startPit) continue;
    newPits[current]++;
    sownPits.push(current);
    seeds--;
  }

  return { finalPits: newPits, lastPit: current, sownPits };
}

/** Check if making a move from startPit would give the opponent at least one seed. */
function wouldFeedOpponent(pits: number[], startPit: number, currentPlayer: Player): boolean {
  const { sownPits } = sowSimulate(pits, startPit);
  const opPits = getOpponentPits(currentPlayer);
  return sownPits.some((p) => opPits.includes(p));
}

/**
 * Compute legal moves for the current player.
 *
 * Starvation rule: if the opponent's side is empty, the current player MUST
 * play a pit that sows at least one seed onto the opponent's side. If no such
 * pit exists, the player cannot move and the game ends.
 */
export function getValidMoves(pits: number[], currentPlayer: Player): number[] {
  const myPits = getPlayerPits(currentPlayer);
  const nonEmpty = myPits.filter((p) => pits[p] > 0);

  if (nonEmpty.length === 0) return [];

  const opPits = getOpponentPits(currentPlayer);
  const opponentHasSeeds = opPits.some((p) => pits[p] > 0);

  if (opponentHasSeeds) return nonEmpty;

  // Opponent is starved – must feed them
  const feeding = nonEmpty.filter((p) => wouldFeedOpponent(pits, p, currentPlayer));
  return feeding; // may be empty – game ends
}

// ─── Capture Logic ────────────────────────────────────────────────────────────

/**
 * Perform captures after sowing.
 *
 * Starting from lastPit going backwards (clockwise), capture consecutive
 * opponent pits that contain exactly 2 or 3 seeds.
 *
 * Grand Slam rule: if capturing all of the opponent's seeds, do NOT capture.
 */
function performCaptures(
  pits: number[],
  lastPit: number,
  currentPlayer: Player
): { newPits: number[]; capturedSeeds: number; capturedPits: number[] } {
  const newPits = [...pits];
  const opPits = getOpponentPits(currentPlayer);

  const toCapture: number[] = [];
  let check = lastPit;

  // Walk backwards while in opponent territory with 2 or 3 seeds
  while (opPits.includes(check) && (newPits[check] === 2 || newPits[check] === 3)) {
    toCapture.push(check);
    check = prevPit(check);
  }

  if (toCapture.length === 0) return { newPits, capturedSeeds: 0, capturedPits: [] };

  // Grand Slam check: would this leave the opponent with zero seeds?
  const opponentSeedsNotCaptured = opPits
    .filter((p) => !toCapture.includes(p))
    .reduce((sum, p) => sum + newPits[p], 0);

  if (opponentSeedsNotCaptured === 0) {
    // Grand Slam – forfeit all captures this move
    return { newPits, capturedSeeds: 0, capturedPits: [] };
  }

  let capturedSeeds = 0;
  for (const p of toCapture) {
    capturedSeeds += newPits[p];
    newPits[p] = 0;
  }

  return { newPits, capturedSeeds, capturedPits: toCapture };
}

// ─── Apply Move ───────────────────────────────────────────────────────────────

/**
 * Apply a move to the game state and return the new state.
 * Does NOT mutate the input state.
 */
export function applyMove(state: GameState, pit: number): GameState {
  const { pits, captured, currentPlayer, consecutiveNonCaptures } = state;

  // Sow seeds
  const { finalPits, lastPit, sownPits } = sowSimulate(pits, pit);

  // Attempt captures
  const { newPits, capturedSeeds, capturedPits } = performCaptures(finalPits, lastPit, currentPlayer);

  const newCaptured: [number, number] = [...captured] as [number, number];
  newCaptured[currentPlayer] += capturedSeeds;

  const nextPlayer: Player = currentPlayer === 0 ? 1 : 0;
  const nonCaptureTick = capturedSeeds === 0 ? consecutiveNonCaptures + 1 : 0;

  // ─── Check end conditions ─────────────────────────────────────────────────

  // 1. Draw by repetition / no-capture rule (50 moves without a capture → draw)
  if (nonCaptureTick >= 50) {
    const remainingP1 = seedsOnSide(newPits, 0);
    const remainingP2 = seedsOnSide(newPits, 1);
    newCaptured[0] += remainingP1;
    newCaptured[1] += remainingP2;
    const finalPitsCleared = newPits.map(() => 0);
    return buildEndState(state, finalPitsCleared, newCaptured, sownPits, capturedPits, pit, nonCaptureTick);
  }

  // 2. Next player has no valid moves
  const nextValidMoves = getValidMoves(newPits, nextPlayer);

  if (nextValidMoves.length === 0) {
    // Current player sweeps their own remaining seeds
    const remainingCurrent = seedsOnSide(newPits, currentPlayer);
    const remainingNext = seedsOnSide(newPits, nextPlayer);
    newCaptured[currentPlayer] += remainingCurrent;
    newCaptured[nextPlayer] += remainingNext;
    const finalPitsCleared = newPits.map(() => 0);
    return buildEndState(state, finalPitsCleared, newCaptured, sownPits, capturedPits, pit, nonCaptureTick);
  }

  // 3. Fewer than 6 seeds on board – game ends
  if (totalSeeds(newPits) < 6) {
    const remainingP1 = seedsOnSide(newPits, 0);
    const remainingP2 = seedsOnSide(newPits, 1);
    newCaptured[0] += remainingP1;
    newCaptured[1] += remainingP2;
    const finalPitsCleared = newPits.map(() => 0);
    return buildEndState(state, finalPitsCleared, newCaptured, sownPits, capturedPits, pit, nonCaptureTick);
  }

  return {
    pits: newPits,
    captured: newCaptured,
    currentPlayer: nextPlayer,
    validMoves: nextValidMoves,
    phase: "playing",
    winner: null,
    lastMove: pit,
    lastSown: sownPits,
    lastCaptured: capturedPits,
    consecutiveNonCaptures: nonCaptureTick,
  };
}

function buildEndState(
  prevState: GameState,
  finalPits: number[],
  newCaptured: [number, number],
  sownPits: number[],
  capturedPits: number[],
  pit: number,
  consecutiveNonCaptures: number
): GameState {
  let winner: Player | "draw" | null;
  if (newCaptured[0] > newCaptured[1]) winner = 0;
  else if (newCaptured[1] > newCaptured[0]) winner = 1;
  else winner = "draw";

  return {
    pits: finalPits,
    captured: newCaptured,
    currentPlayer: prevState.currentPlayer,
    validMoves: [],
    phase: "ended",
    winner,
    lastMove: pit,
    lastSown: sownPits,
    lastCaptured: capturedPits,
    consecutiveNonCaptures,
  };
}

// ─── Evaluation / Heuristic for AI ────────────────────────────────────────────

/**
 * Board score from the perspective of `player`.
 * Positive = good for player, negative = bad.
 */
export function evaluate(state: GameState, player: Player): number {
  const { pits, captured } = state;
  const opp: Player = player === 0 ? 1 : 0;

  if (state.phase === "ended") {
    if (state.winner === player) return 100_000;
    if (state.winner === opp) return -100_000;
    return 0; // draw
  }

  const captureDiff = captured[player] - captured[opp];
  const pitDiff = seedsOnSide(pits, player) - seedsOnSide(pits, opp);
  const mobilityDiff = getValidMoves(pits, player).length - getValidMoves(pits, opp).length;

  return captureDiff * 10 + pitDiff * 1 + mobilityDiff * 2;
}
