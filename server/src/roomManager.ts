import { v4 as uuidv4 } from "uuid";
import type { Room, Player } from "./types";
import { createInitialState, applyMove, getValidMoves } from "./gameLogic";

const rooms = new Map<string, Room>();

function generateRoomId(): string {
  return uuidv4().slice(0, 6).toUpperCase();
}

export function createRoom(socketId: string, playerName: string): Room {
  const id = generateRoomId();
  const room: Room = {
    id,
    players: [socketId, null],
    playerNames: [playerName, "Waiting…"],
    gameState: { ...createInitialState(), phase: "waiting" },
  };
  rooms.set(id, room);
  return room;
}

export function joinRoom(roomId: string, socketId: string, playerName: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.players[1] !== null) return null; // room full
  if (room.players[0] === socketId) return null; // same player

  room.players[1] = socketId;
  room.playerNames[1] = playerName;
  room.gameState = createInitialState(); // start fresh
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function getRoomBySocket(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.includes(socketId)) return room;
  }
  return undefined;
}

export function applyMoveToRoom(roomId: string, socketId: string, pit: number): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.gameState.phase !== "playing") return null;

  // Determine which player slot this socket is
  const slotIndex = room.players.indexOf(socketId);
  if (slotIndex === -1) return null;
  const playerSlot = slotIndex as Player;
  if (playerSlot !== room.gameState.currentPlayer) return null;
  if (!room.gameState.validMoves.includes(pit)) return null;

  room.gameState = applyMove(room.gameState, pit);
  return room;
}

export function restartRoom(roomId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.players[1] === null) return null;

  room.gameState = createInitialState();
  return room;
}

export function removePlayerFromRoom(socketId: string): Room | undefined {
  const room = getRoomBySocket(socketId);
  if (!room) return undefined;

  const slot = room.players.indexOf(socketId) as 0 | 1;
  room.players[slot] = null;

  // If both players gone, remove the room
  if (room.players[0] === null && room.players[1] === null) {
    rooms.delete(room.id);
    return undefined;
  }

  return room;
}
