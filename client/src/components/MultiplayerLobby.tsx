"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface MultiplayerLobbyProps {
  playerName: string;
  connected: boolean;
  error: string | null;
  waitingForOpponent: boolean;
  roomId: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onBack: () => void;
}

export default function MultiplayerLobby({
  playerName,
  connected,
  error,
  waitingForOpponent,
  roomId,
  onCreateRoom,
  onJoinRoom,
  onBack,
}: MultiplayerLobbyProps) {
  const [joinCode, setJoinCode] = useState("");

  return (
    <motion.div
      className="flex flex-col items-center gap-6 py-8 px-4 max-w-md mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-3xl font-bold text-yellow-300 font-display">Multiplayer</h2>

      {/* Connection status */}
      <div className={`flex items-center gap-2 text-sm ${connected ? "text-green-400" : "text-red-400"}`}>
        <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
        {connected ? "Connected to server" : "Connecting…"}
      </div>

      {error && (
        <div className="w-full bg-red-900 bg-opacity-60 border border-red-500 text-red-300 rounded-xl p-3 text-sm text-center">
          {error}
        </div>
      )}

      {waitingForOpponent && roomId ? (
        /* Waiting room */
        <div className="w-full flex flex-col items-center gap-4">
          <div className="bg-wood-800 rounded-2xl p-6 text-center w-full">
            <p className="text-wood-300 text-sm mb-2">Share this room code with a friend:</p>
            <p className="text-3xl font-bold text-yellow-300 font-display tracking-widest">{roomId}</p>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-wood-400 text-sm"
          >
            Waiting for opponent to join…
          </motion.div>
        </div>
      ) : (
        /* Lobby */
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={onCreateRoom}
            disabled={!connected}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-lg shadow-lg transition-all active:scale-95"
          >
            ✚ Create Room
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Room code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1 bg-wood-800 border border-wood-500 text-wood-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-wood-600 uppercase tracking-widest"
            />
            <button
              onClick={() => joinCode && onJoinRoom(joinCode)}
              disabled={!connected || !joinCode}
              className="px-5 py-3 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95"
            >
              Join
            </button>
          </div>
        </div>
      )}

      <button onClick={onBack} className="text-wood-400 hover:text-wood-200 text-sm underline">
        ← Back to Menu
      </button>
    </motion.div>
  );
}
