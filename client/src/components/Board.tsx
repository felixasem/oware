"use client";

import { motion } from "framer-motion";
import type { GameState, Player } from "@/types/game";
import Pit from "./Pit";

interface BoardProps {
  state: GameState;
  localPlayer: Player; // 0 = bottom, 1 = top
  onMove: (pit: number) => void;
  disabled: boolean; // true when it's not this player's turn or AI is thinking
  playerNames: [string, string];
  isAIThinking?: boolean;
}

/**
 * Board layout (viewed from P1's / localPlayer perspective):
 *
 *   P2 store │ 11  10   9   8   7   6 │ P1 store
 *            │  0   1   2   3   4   5 │
 *
 * When localPlayer is P2, the board is rotated 180°.
 */
export default function Board({ state, localPlayer, onMove, disabled, playerNames, isAIThinking }: BoardProps) {
  const { pits, captured, validMoves, lastMove, lastSown, lastCaptured, currentPlayer, phase } = state;

  // Top row = pits 6-11, displayed right-to-left (11 on the left, 6 on the right)
  const topRowPits = [11, 10, 9, 8, 7, 6];
  // Bottom row = pits 0-5, displayed left-to-right
  const bottomRowPits = [0, 1, 2, 3, 4, 5];

  const topPlayer: Player = localPlayer === 0 ? 1 : 0;
  const bottomPlayer: Player = localPlayer;

  // When localPlayer is P2, flip the whole board
  const boardRotated = localPlayer === 1;
  const displayTopPits = boardRotated ? bottomRowPits.slice().reverse() : topRowPits;
  const displayBottomPits = boardRotated ? topRowPits.slice().reverse() : bottomRowPits;
  const displayTopPlayer: Player = boardRotated ? 0 : 1;
  const displayBottomPlayer: Player = boardRotated ? 1 : 0;

  const renderPit = (index: number, owner: Player) => (
    <Pit
      key={index}
      index={index}
      seeds={pits[index]}
      isValid={validMoves.includes(index)}
      isLastMove={lastMove === index}
      isLastSown={lastSown.includes(index)}
      isLastCaptured={lastCaptured.includes(index)}
      player={owner}
      disabled={disabled}
      onClick={() => onMove(index)}
    />
  );

  const isMyTurn = currentPlayer === localPlayer && phase === "playing";

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-3xl px-2">
      {/* Opponent name + captured count */}
      <PlayerBar
        name={playerNames[displayTopPlayer]}
        captured={captured[displayTopPlayer]}
        isActive={currentPlayer === displayTopPlayer && phase === "playing"}
        isOpponent
        isAIThinking={isAIThinking && currentPlayer === displayTopPlayer}
      />

      {/* The wooden board */}
      <motion.div
        className="relative flex items-center gap-1 sm:gap-3 bg-wood-600 rounded-2xl p-1.5 sm:p-4 shadow-2xl border-2 sm:border-4 border-wood-400 w-full max-w-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* P2 store (left side) */}
        <Store seeds={captured[displayTopPlayer]} label="Captured" side="left" />

        {/* Pits grid */}
        <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-3">
          {/* Top row – opponent */}
          <div className="flex gap-1 sm:gap-3">
            {displayTopPits.map((pit) => renderPit(pit, displayTopPlayer))}
          </div>
          {/* Divider */}
          <div className="h-px bg-wood-400 opacity-40 mx-2" />
          {/* Bottom row – local player */}
          <div className="flex gap-1 sm:gap-3">
            {displayBottomPits.map((pit) => renderPit(pit, displayBottomPlayer))}
          </div>
        </div>

        {/* P1 store (right side) */}
        <Store seeds={captured[displayBottomPlayer]} label="Captured" side="right" />

        {/* Grain wood texture overlay */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9InRyYW5zcGFyZW50Ii8+PHBhdGggZD0iTTAgMEw0IDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]" />
      </motion.div>

      {/* Local player name + captured count */}
      <PlayerBar
        name={playerNames[displayBottomPlayer]}
        captured={captured[displayBottomPlayer]}
        isActive={currentPlayer === displayBottomPlayer && phase === "playing"}
        isOpponent={false}
        isAIThinking={false}
      />

      {/* Turn indicator */}
      {phase === "playing" && (
        <motion.p
          key={currentPlayer}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-wood-200 font-display"
        >
          {isAIThinking
            ? "AI is thinking…"
            : isMyTurn
            ? "Your turn — click a highlighted pit"
            : `Waiting for ${playerNames[currentPlayer]}…`}
        </motion.p>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Store({ seeds, label, side }: { seeds: number; label: string; side: "left" | "right" }) {
  return (
    <div
      className={`shrink-0 flex flex-col items-center justify-center bg-wood-900 rounded-xl px-1 py-3 sm:px-2 sm:py-4 min-w-[26px] sm:min-w-[44px] shadow-pit border border-wood-400 border-opacity-30 ${
        side === "left" ? "mr-0.5 sm:mr-1" : "ml-0.5 sm:ml-1"
      }`}
    >
      <span className="text-base sm:text-2xl font-bold text-yellow-200 font-display">{seeds}</span>
      <span className="hidden sm:block text-[10px] text-wood-300 mt-1 rotate-90 whitespace-nowrap origin-center">{label}</span>
    </div>
  );
}

function PlayerBar({
  name,
  captured,
  isActive,
  isOpponent,
  isAIThinking,
}: {
  name: string;
  captured: number;
  isActive: boolean;
  isOpponent: boolean;
  isAIThinking?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between w-full max-w-md px-4 py-2 rounded-lg transition-colors duration-300 ${
        isActive ? "bg-yellow-900 bg-opacity-50 ring-2 ring-yellow-400" : "bg-wood-800 bg-opacity-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`text-lg ${isActive ? "text-yellow-300" : "text-wood-200"} font-display font-semibold`}>
          {isOpponent ? "👤" : "🧑"} {name}
        </span>
        {isActive && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-yellow-400 text-xs font-medium"
          >
            {isAIThinking ? "thinking…" : "▶ turn"}
          </motion.span>
        )}
      </div>
      <div className="flex items-center gap-1 text-wood-200">
        <span className="text-sm opacity-70">captured:</span>
        <span className="text-xl font-bold text-yellow-200 font-display">{captured}</span>
      </div>
    </div>
  );
}
