"use client";

import { motion } from "framer-motion";
import type { GameState, Player } from "@/types/game";

interface GameResultProps {
  state: GameState;
  localPlayer: Player;
  playerNames: [string, string];
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameResult({ state, localPlayer, playerNames, onRestart, onMenu }: GameResultProps) {
  const { winner, captured } = state;

  const isWin = winner === localPlayer;
  const isDraw = winner === "draw";
  const isLoss = !isWin && !isDraw;

  const headline = isDraw ? "It's a Draw!" : isWin ? "You Win! 🎉" : `${playerNames[winner as Player]} Wins!`;

  const emoji = isDraw ? "🤝" : isWin ? "🏆" : "😔";

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-wood-700 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-wood-400"
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="text-6xl mb-4">{emoji}</div>

        <h2 className="text-3xl font-bold text-yellow-200 font-display mb-2">{headline}</h2>

        <div className="flex justify-around my-6 text-wood-200">
          {playerNames.map((name, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-sm opacity-70">{name}</span>
              <span className="text-4xl font-bold text-yellow-300 font-display">{captured[i]}</span>
              <span className="text-xs opacity-50">seeds</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-wood-900 font-bold rounded-xl transition-colors shadow-md active:scale-95"
          >
            Play Again
          </button>
          <button
            onClick={onMenu}
            className="px-6 py-3 bg-wood-500 hover:bg-wood-400 text-wood-100 font-bold rounded-xl transition-colors shadow-md active:scale-95"
          >
            Main Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
