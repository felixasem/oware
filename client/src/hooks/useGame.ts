"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { GameState, Difficulty, Player } from "@/types/game";
import { createInitialState, applyMove } from "@/lib/gameLogic";
import { getBestMove, getAIThinkDelay } from "@/lib/ai";

interface UseGameOptions {
  mode: "single" | "multi";
  playerName: string;
  aiDifficulty?: Difficulty;
  aiPlayer?: Player; // which player index is the AI (default 1)
}

export function useGame({ mode, playerName, aiDifficulty = "medium", aiPlayer = 1 }: UseGameOptions) {
  const [state, setState] = useState<GameState>(createInitialState);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Keep a ref to the latest state so the AI timeout callback doesn't
  // capture stale state via closure.
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── AI Trigger ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "single") return;
    if (state.currentPlayer !== aiPlayer) return;
    if (state.phase !== "playing") return;
    if (state.validMoves.length === 0) return;

    setIsAIThinking(true);

    const delay = getAIThinkDelay(aiDifficulty);
    const snapshotState = state; // capture state at this point

    aiTimerRef.current = setTimeout(() => {
      // Guard: confirm the game state hasn't changed since scheduling
      const current = stateRef.current;
      if (current.currentPlayer !== aiPlayer || current.phase !== "playing") {
        setIsAIThinking(false);
        return;
      }

      const move = getBestMove(snapshotState, aiDifficulty);
      setState((prev) => {
        if (prev.currentPlayer !== aiPlayer || prev.phase !== "playing") return prev;
        return applyMove(prev, move);
      });
      setIsAIThinking(false);
    }, delay);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPlayer, state.phase, mode, aiPlayer, aiDifficulty]);

  // ── Human Move ─────────────────────────────────────────────────────────────
  const makeMove = useCallback(
    (pit: number) => {
      setState((prev) => {
        if (prev.phase !== "playing") return prev;
        if (!prev.validMoves.includes(pit)) return prev;
        // In single-player mode, block moves when it's the AI's turn
        if (mode === "single" && prev.currentPlayer === aiPlayer) return prev;
        return applyMove(prev, pit);
      });
    },
    [mode, aiPlayer]
  );

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setIsAIThinking(false);
    setState(createInitialState());
  }, []);

  return { state, isAIThinking, makeMove, reset };
}
