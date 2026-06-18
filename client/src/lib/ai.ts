import type { GameState, Difficulty, Player } from "@/types/game";
import { applyMove, evaluate, getValidMoves } from "./gameLogic";

// ─── Minimax with Alpha-Beta pruning ──────────────────────────────────────────

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiPlayer: Player
): number {
  if (depth === 0 || state.phase === "ended") {
    return evaluate(state, aiPlayer);
  }

  const moves = state.validMoves;
  if (moves.length === 0) return evaluate(state, aiPlayer);

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      const child = applyMove(state, move);
      const score = minimax(child, depth - 1, alpha, beta, false, aiPlayer);
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break; // prune
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      const child = applyMove(state, move);
      const score = minimax(child, depth - 1, alpha, beta, true, aiPlayer);
      best = Math.min(best, score);
      beta = Math.min(beta, best);
      if (beta <= alpha) break; // prune
    }
    return best;
  }
}

// ─── Difficulty Configurations ────────────────────────────────────────────────

const DEPTH: Record<Difficulty, number> = {
  easy: 1,
  medium: 3,
  hard: 6,
};

// Small random noise added to easy/medium moves to make the AI feel natural
const NOISE: Record<Difficulty, number> = {
  easy: 8,
  medium: 2,
  hard: 0,
};

/**
 * Pick the best move for the AI.
 * For easy difficulty, adds randomness so it makes blunders.
 */
export function getBestMove(state: GameState, difficulty: Difficulty): number {
  const moves = state.validMoves;
  if (moves.length === 0) throw new Error("No valid moves available for AI");
  if (moves.length === 1) return moves[0];

  // Easy: occasionally just pick a random move
  if (difficulty === "easy" && Math.random() < 0.4) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const aiPlayer = state.currentPlayer;
  const depth = DEPTH[difficulty];
  const noise = NOISE[difficulty];

  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const child = applyMove(state, move);
    const score =
      minimax(child, depth - 1, -Infinity, Infinity, false, aiPlayer) +
      (Math.random() * noise - noise / 2);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Return the delay in ms before the AI makes its move.
 * Harder = slower (looks like it's thinking).
 */
export function getAIThinkDelay(difficulty: Difficulty): number {
  const base = { easy: 400, medium: 700, hard: 1200 };
  const jitter = Math.floor(Math.random() * 300);
  return base[difficulty] + jitter;
}
