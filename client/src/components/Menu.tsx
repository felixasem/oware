"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Difficulty } from "@/types/game";

// Multiplayer requires the Socket.io backend. On static hosting (no backend)
// this is set to "false" so the broken button is hidden.
const MULTIPLAYER_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER === "true";

interface MenuProps {
  onStartSingle: (playerName: string, difficulty: Difficulty) => void;
  onStartMulti: (playerName: string) => void;
}

export default function Menu({ onStartSingle, onStartMulti }: MenuProps) {
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [mode, setMode] = useState<"single" | "multi" | null>(null);

  const name = playerName.trim() || "Player";

  return (
    <motion.div
      className="flex flex-col items-center gap-8 py-8 px-4 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title */}
      <div className="text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-yellow-300 font-display drop-shadow-lg">Oware</h1>
        <p className="text-wood-300 mt-2 text-sm">The ancient African seed game</p>
      </div>

      {/* Decorative seeds */}
      <div className="flex gap-2">
        {["bg-amber-400", "bg-yellow-300", "bg-amber-500", "bg-yellow-400", "bg-orange-300"].map((c, i) => (
          <motion.div
            key={i}
            className={`w-5 h-5 rounded-full ${c} shadow-seed`}
            animate={{ y: [0, -8, 0] }}
            transition={{ delay: i * 0.15, duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Player name */}
      <div className="w-full">
        <label className="block text-wood-300 text-sm mb-1 font-display">Your Name (optional)</label>
        <input
          type="text"
          placeholder="Guest"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          className="w-full bg-wood-800 border border-wood-500 text-wood-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-wood-600"
        />
      </div>

      {/* Mode selection */}
      {mode === null && (
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => setMode("single")}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl text-lg shadow-lg transition-all active:scale-95"
          >
            🤖 vs Computer
          </button>
          {MULTIPLAYER_ENABLED && (
            <button
              onClick={() => setMode("multi")}
              className="w-full py-4 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-2xl text-lg shadow-lg transition-all active:scale-95"
            >
              👥 Multiplayer
            </button>
          )}
        </div>
      )}

      {/* Single-player difficulty */}
      {mode === "single" && (
        <motion.div className="w-full flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-wood-200 font-display text-center text-lg">Select Difficulty</h3>
          <div className="flex gap-3 justify-center">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-5 py-3 rounded-xl font-bold capitalize transition-all active:scale-95 ${
                  difficulty === d
                    ? "bg-yellow-400 text-wood-900 shadow-md scale-105"
                    : "bg-wood-700 text-wood-200 hover:bg-wood-600"
                }`}
              >
                {d === "easy" ? "🌱" : d === "medium" ? "🌿" : "🌳"} {d}
              </button>
            ))}
          </div>
          <button
            onClick={() => onStartSingle(name, difficulty)}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl text-lg shadow-lg transition-all active:scale-95 mt-2"
          >
            Start Game
          </button>
          <button onClick={() => setMode(null)} className="text-wood-400 hover:text-wood-200 text-sm underline text-center">
            ← Back
          </button>
        </motion.div>
      )}

      {/* Multiplayer */}
      {mode === "multi" && (
        <motion.div className="w-full flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={() => onStartMulti(name)}
            className="w-full py-4 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-2xl text-lg shadow-lg transition-all active:scale-95"
          >
            🎮 Play Online
          </button>
          <p className="text-wood-400 text-sm text-center">Create or join a room with a friend</p>
          <button onClick={() => setMode(null)} className="text-wood-400 hover:text-wood-200 text-sm underline text-center">
            ← Back
          </button>
        </motion.div>
      )}

      {/* Rules summary */}
      <details className="w-full bg-wood-800 bg-opacity-60 rounded-xl p-4">
        <summary className="text-wood-300 cursor-pointer font-display text-sm">How to play</summary>
        <ul className="mt-3 text-wood-400 text-xs space-y-1.5 list-disc list-inside leading-relaxed">
          <li>Each player controls one row of 6 pits.</li>
          <li>On your turn, click any highlighted pit to sow its seeds counter-clockwise.</li>
          <li>Capture opponent seeds when your last seed lands in a pit with exactly 2 or 3 seeds.</li>
          <li>You must feed your opponent if they have no seeds.</li>
          <li>Most seeds captured wins!</li>
        </ul>
      </details>
    </motion.div>
  );
}
