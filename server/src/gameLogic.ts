import type { GameState, Player } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_PITS = 12;
const SEEDS_PER_PIT = 4;

const P1_PITS: readonly number[] = [0, 1, 2, 3, 4, 5];
const P2_PITS: readonly number[] = [6, 7, 8, 9, 10, 11];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPlayerPits(player: Player): readonly number[] {
  return player === 0 ? P1_PITS : P2_PITS;
}

function getOpponentPits(player: Player): readonly number[] {
  return player === 0 ? P2_PITS : P1_PITS;
}

function nextPit(pit: number): number {
  return (pit + 1) % TOTAL_PITS;
}

function prevPit(pit: number): number {
  return (pit - 1 + TOTAL_PITS) % TOTAL_PITS;
}

function seedsOnSide(pits: number[], player: Player): number {
  return getPlayerPits(player).reduce((sum, i) => sum + pits[i], 0);
}

function totalSeeds(pits: number[]): number {
  return pits.reduce((a, b) => a + b, 0);
}

// ─── Sowing ───────────────────────────────────────────────────────────────────

function sowSeeds(pits: number[], startPit: number) {
  const newPits = [...pits];
  let seeds = newPits[startPit];
  newPits[startPit] = 0;

  let current = startPit;
  const sownPits: number[] = [];

  while (seeds > 0) {
    current = nextPit(current);
    if (current === startPit) continue;
    newPits[current]++;
    sownPits.push(current);
    seeds--;
  }

  return { newPits, lastPit: current, sownPits };
}

// ─── Captures ─────────────────────────────────────────────────────────────────

function performCaptures(pits: number[], lastPit: number, currentPlayer: Player) {
  const newPits = [...pits];
  const opPits = getOpponentPits(currentPlayer);

  const toCapture: number[] = [];
  let check = lastPit;

  while (opPits.includes(check) && (newPits[check] === 2 || newPits[check] === 3)) {
    toCapture.push(check);
    check = prevPit(check);
  }

  if (toCapture.length === 0) return { newPits, capturedSeeds: 0, capturedPits: [] };

  // Grand Slam: would this leave the opponent with zero seeds on their side?
  const opponentRemainingSeeds = opPits
    .filter((p) => !toCapture.includes(p))
    .reduce((sum, p) => sum + newPits[p], 0);

  if (opponentRemainingSeeds === 0) {
    return { newPits, capturedSeeds: 0, capturedPits: [] };
  }

  let capturedSeeds = 0;
  for (const p of toCapture) {
    capturedSeeds += newPits[p];
    newPits[p] = 0;
  }

  return { newPits, capturedSeeds, capturedPits: toCapture };
}

// ─── Valid Moves ──────────────────────────────────────────────────────────────

function wouldFeedOpponent(pits: number[], startPit: number, currentPlayer: Player): boolean {
  const newPits = [...pits];
  let seeds = newPits[startPit];
  newPits[startPit] = 0;
  let current = startPit;
  const opPits = getOpponentPits(currentPlayer);

  while (seeds > 0) {
    current = nextPit(current);
    if (current === startPit) continue;
    if (opPits.includes(current)) return true;
    seeds--;
  }
  return false;
}

export function getValidMoves(pits: number[], currentPlayer: Player): number[] {
  const myPits = getPlayerPits(currentPlayer);
  const nonEmpty = myPits.filter((p) => pits[p] > 0);
  if (nonEmpty.length === 0) return [];

  const opPits = getOpponentPits(currentPlayer);
  const opponentHasSeeds = opPits.some((p) => pits[p] > 0);
  if (opponentHasSeeds) return nonEmpty;

  const feeding = nonEmpty.filter((p) => wouldFeedOpponent(pits, p, currentPlayer));
  return feeding;
}

// ─── Apply Move ───────────────────────────────────────────────────────────────

export function createInitialState(): GameState {
  const pits = Array<number>(TOTAL_PITS).fill(SEEDS_PER_PIT);
  return {
    pits,
    captured: [0, 0],
    currentPlayer: 0,
    validMoves: P1_PITS.slice(),
    phase: "playing",
    winner: null,
    lastMove: null,
    lastSown: [],
    lastCaptured: [],
    consecutiveNonCaptures: 0,
  };
}

export function applyMove(state: GameState, pit: number): GameState {
  const { pits, captured, currentPlayer, consecutiveNonCaptures } = state;

  const { newPits: sownPits, lastPit, sownPits: sownList } = sowSeeds(pits, pit);
  const { newPits, capturedSeeds, capturedPits } = performCaptures(sownPits, lastPit, currentPlayer);

  const newCaptured: [number, number] = [...captured] as [number, number];
  newCaptured[currentPlayer] += capturedSeeds;

  const nextPlayer: Player = currentPlayer === 0 ? 1 : 0;
  const nonCaptureTick = capturedSeeds === 0 ? consecutiveNonCaptures + 1 : 0;

  // ── End condition: 50 moves without a capture ────────────────────────────
  if (nonCaptureTick >= 50) {
    newCaptured[0] += seedsOnSide(newPits, 0);
    newCaptured[1] += seedsOnSide(newPits, 1);
    return buildEnd(state, newPits.map(() => 0), newCaptured, sownList, capturedPits, pit, nonCaptureTick);
  }

  // ── End condition: next player can't move ────────────────────────────────
  const nextMoves = getValidMoves(newPits, nextPlayer);
  if (nextMoves.length === 0) {
    newCaptured[0] += seedsOnSide(newPits, 0);
    newCaptured[1] += seedsOnSide(newPits, 1);
    return buildEnd(state, newPits.map(() => 0), newCaptured, sownList, capturedPits, pit, nonCaptureTick);
  }

  // ── End condition: fewer than 6 seeds on board ───────────────────────────
  if (totalSeeds(newPits) < 6) {
    newCaptured[0] += seedsOnSide(newPits, 0);
    newCaptured[1] += seedsOnSide(newPits, 1);
    return buildEnd(state, newPits.map(() => 0), newCaptured, sownList, capturedPits, pit, nonCaptureTick);
  }

  return {
    pits: newPits,
    captured: newCaptured,
    currentPlayer: nextPlayer,
    validMoves: nextMoves,
    phase: "playing",
    winner: null,
    lastMove: pit,
    lastSown: sownList,
    lastCaptured: capturedPits,
    consecutiveNonCaptures: nonCaptureTick,
  };
}

function buildEnd(
  _prev: GameState,
  finalPits: number[],
  newCaptured: [number, number],
  sownList: number[],
  capturedPits: number[],
  pit: number,
  consecutiveNonCaptures: number
): GameState {
  const winner: Player | "draw" =
    newCaptured[0] > newCaptured[1] ? 0 : newCaptured[1] > newCaptured[0] ? 1 : "draw";

  return {
    pits: finalPits,
    captured: newCaptured,
    currentPlayer: _prev.currentPlayer,
    validMoves: [],
    phase: "ended",
    winner,
    lastMove: pit,
    lastSown: sownList,
    lastCaptured: capturedPits,
    consecutiveNonCaptures,
  };
}
