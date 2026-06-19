"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState, ChatMessage } from "@/types/game";

// Normalize the backend URL. Render's blueprint auto-wiring provides a bare
// hostname (e.g. "oware-server.onrender.com") with no protocol — add https://
// in that case. Falls back to the local dev server.
const RAW_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
const SERVER_URL = /^https?:\/\//.test(RAW_SERVER_URL)
  ? RAW_SERVER_URL
  : `https://${RAW_SERVER_URL}`;

interface UseSocketOptions {
  enabled: boolean;
  playerName: string;
}

export interface RoomInfo {
  roomId: string;
  playerSlot: 0 | 1;
  players: [string, string];
}

export function useSocket({ enabled, playerName }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const socket = io(SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => {
      setConnected(false);
      setRoomInfo(null);
      setWaitingForOpponent(false);
    });

    socket.on("room:joined", (data: { roomId: string; playerSlot: 0 | 1; players: [string, string]; gameState: GameState }) => {
      setRoomInfo({ roomId: data.roomId, playerSlot: data.playerSlot, players: data.players });
      setGameState(data.gameState);
      setWaitingForOpponent(data.playerSlot === 0);
      setError(null);
    });

    socket.on("room:started", (data: { gameState: GameState; players: [string, string] }) => {
      setGameState(data.gameState);
      setWaitingForOpponent(false);
      if (roomInfo) setRoomInfo((prev) => prev ? { ...prev, players: data.players } : null);
    });

    socket.on("game:update", (newState: GameState) => {
      setGameState(newState);
    });

    socket.on("chat:message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("room:error", (msg: string) => {
      setError(msg);
    });

    socket.on("opponent:disconnected", () => {
      setError("Opponent disconnected.");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const createRoom = useCallback(() => {
    socketRef.current?.emit("room:create", { playerName });
  }, [playerName]);

  const joinRoom = useCallback(
    (roomId: string) => {
      socketRef.current?.emit("room:join", { roomId, playerName });
    },
    [playerName]
  );

  const makeMove = useCallback((pit: number) => {
    if (!roomInfo) return;
    socketRef.current?.emit("game:move", { roomId: roomInfo.roomId, pit });
  }, [roomInfo]);

  const sendChat = useCallback(
    (text: string) => {
      if (!roomInfo) return;
      socketRef.current?.emit("chat:send", { roomId: roomInfo.roomId, text, sender: playerName });
    },
    [roomInfo, playerName]
  );

  const restartRoom = useCallback(() => {
    if (!roomInfo) return;
    socketRef.current?.emit("room:restart", { roomId: roomInfo.roomId });
  }, [roomInfo]);

  return {
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
  };
}
