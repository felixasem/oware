"use client";

import { useState, useCallback } from "react";
import type { Difficulty, Player } from "@/types/game";
import Menu from "@/components/Menu";
import Board from "@/components/Board";
import GameResult from "@/components/GameResult";
import MultiplayerLobby from "@/components/MultiplayerLobby";
import Chat from "@/components/Chat";
import { useGame } from "@/hooks/useGame";
import { useSocket } from "@/hooks/useSocket";

type AppScreen = "menu" | "single" | "multi";

interface SessionConfig {
  playerName: string;
  aiDifficulty: Difficulty;
}

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("menu");
  const [config, setConfig] = useState<SessionConfig>({ playerName: "Player 1", aiDifficulty: "medium" });

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-6 px-1 sm:px-2">
      {screen === "menu" && (
        <Menu
          onStartSingle={(name, diff) => {
            setConfig({ playerName: name, aiDifficulty: diff });
            setScreen("single");
          }}
          onStartMulti={(name) => {
            setConfig((c) => ({ ...c, playerName: name }));
            setScreen("multi");
          }}
        />
      )}

      {screen === "single" && (
        <SinglePlayerGame
          config={config}
          onMenu={() => setScreen("menu")}
        />
      )}

      {screen === "multi" && (
        <MultiplayerGame
          playerName={config.playerName}
          onMenu={() => setScreen("menu")}
        />
      )}
    </main>
  );
}

// ─── Single Player ────────────────────────────────────────────────────────────

function SinglePlayerGame({ config, onMenu }: { config: SessionConfig; onMenu: () => void }) {
  const { state, isAIThinking, makeMove, reset } = useGame({
    mode: "single",
    playerName: config.playerName,
    aiDifficulty: config.aiDifficulty,
    aiPlayer: 1,
  });

  const playerNames: [string, string] = [config.playerName, `AI (${config.aiDifficulty})`];
  const isMyTurn = state.currentPlayer === 0 && state.phase === "playing" && !isAIThinking;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex items-center justify-between w-full max-w-3xl px-4">
        <button onClick={onMenu} className="text-wood-400 hover:text-wood-200 text-sm transition-colors">
          ← Menu
        </button>
        <h2 className="text-xl font-bold text-yellow-300 font-display">Oware</h2>
        <button onClick={reset} className="text-wood-400 hover:text-wood-200 text-sm transition-colors">
          Restart ↺
        </button>
      </div>

      <Board
        state={state}
        localPlayer={0}
        onMove={makeMove}
        disabled={!isMyTurn}
        playerNames={playerNames}
        isAIThinking={isAIThinking}
      />

      {state.phase === "ended" && (
        <GameResult
          state={state}
          localPlayer={0}
          playerNames={playerNames}
          onRestart={reset}
          onMenu={onMenu}
        />
      )}
    </div>
  );
}

// ─── Multiplayer ──────────────────────────────────────────────────────────────

function MultiplayerGame({ playerName, onMenu }: { playerName: string; onMenu: () => void }) {
  const {
    connected,
    roomInfo,
    gameState,
    messages,
    error,
    waitingForOpponent,
    createRoom,
    joinRoom,
    makeMove,
    sendChat,
    restartRoom,
  } = useSocket({ enabled: true, playerName });

  const gameStarted = gameState?.phase === "playing" || gameState?.phase === "ended";

  if (!gameStarted || !roomInfo) {
    return (
      <MultiplayerLobby
        playerName={playerName}
        connected={connected}
        error={error}
        waitingForOpponent={waitingForOpponent}
        roomId={roomInfo?.roomId ?? null}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onBack={onMenu}
      />
    );
  }

  const localPlayer = roomInfo.playerSlot;
  const playerNames = roomInfo.players;
  const isMyTurn = gameState.currentPlayer === localPlayer && gameState.phase === "playing";

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex items-center justify-between w-full max-w-3xl px-4">
        <button onClick={onMenu} className="text-wood-400 hover:text-wood-200 text-sm transition-colors">
          ← Menu
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-yellow-300 font-display">Room: {roomInfo.roomId}</h2>
        </div>
        <button onClick={restartRoom} className="text-wood-400 hover:text-wood-200 text-sm transition-colors">
          Restart ↺
        </button>
      </div>

      <Board
        state={gameState}
        localPlayer={localPlayer}
        onMove={makeMove}
        disabled={!isMyTurn}
        playerNames={playerNames}
      />

      <div className="w-full max-w-md px-4">
        <Chat messages={messages} onSend={sendChat} />
      </div>

      {gameState.phase === "ended" && (
        <GameResult
          state={gameState}
          localPlayer={localPlayer}
          playerNames={playerNames}
          onRestart={restartRoom}
          onMenu={onMenu}
        />
      )}
    </div>
  );
}
