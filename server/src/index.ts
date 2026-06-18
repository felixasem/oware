import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  createRoom,
  joinRoom,
  getRoom,
  applyMoveToRoom,
  restartRoom,
  removePlayerFromRoom,
} from "./roomManager";

// Allowed origins for CORS. In production, set FRONTEND_URL to your Hostinger
// domain (comma-separated for multiple, e.g. "https://oware.com,https://www.oware.com").
// Falls back to "*" for local development.
const FRONTEND_URL = process.env.FRONTEND_URL;
const corsOrigin: string | string[] = FRONTEND_URL
  ? FRONTEND_URL.split(",").map((s) => s.trim())
  : "*";

const app = express();
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: corsOrigin, methods: ["GET", "POST"] },
});

// ─── REST health check ────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true }));

// ─── Socket.io Events ─────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] ${socket.id} connected`);

  // ── Create Room ─────────────────────────────────────────────────────────────
  socket.on("room:create", ({ playerName }: { playerName: string }) => {
    const room = createRoom(socket.id, playerName);
    socket.join(room.id);

    socket.emit("room:joined", {
      roomId: room.id,
      playerSlot: 0,
      players: room.playerNames,
      gameState: room.gameState,
    });

    console.log(`[room] ${playerName} created room ${room.id}`);
  });

  // ── Join Room ───────────────────────────────────────────────────────────────
  socket.on("room:join", ({ roomId, playerName }: { roomId: string; playerName: string }) => {
    const room = joinRoom(roomId, socket.id, playerName);

    if (!room) {
      socket.emit("room:error", "Room not found or already full.");
      return;
    }

    socket.join(roomId);

    // Notify the joining player
    socket.emit("room:joined", {
      roomId: room.id,
      playerSlot: 1,
      players: room.playerNames,
      gameState: room.gameState,
    });

    // Notify room that game has started
    io.to(roomId).emit("room:started", {
      gameState: room.gameState,
      players: room.playerNames,
    });

    console.log(`[room] ${playerName} joined room ${roomId}`);
  });

  // ── Make Move ───────────────────────────────────────────────────────────────
  socket.on("game:move", ({ roomId, pit }: { roomId: string; pit: number }) => {
    const room = applyMoveToRoom(roomId, socket.id, pit);
    if (!room) return;

    io.to(roomId).emit("game:update", room.gameState);
  });

  // ── Chat ────────────────────────────────────────────────────────────────────
  socket.on("chat:send", ({ roomId, text, sender }: { roomId: string; text: string; sender: string }) => {
    const msg = { sender, text, timestamp: Date.now() };
    io.to(roomId).emit("chat:message", msg);
  });

  // ── Restart ─────────────────────────────────────────────────────────────────
  socket.on("room:restart", ({ roomId }: { roomId: string }) => {
    const room = restartRoom(roomId);
    if (!room) return;
    io.to(roomId).emit("game:update", room.gameState);
  });

  // ── Disconnect ──────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`[-] ${socket.id} disconnected`);
    const room = removePlayerFromRoom(socket.id);
    if (room) {
      io.to(room.id).emit("opponent:disconnected");
    }
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, () => {
  console.log(`Oware server running on http://localhost:${PORT}`);
});
