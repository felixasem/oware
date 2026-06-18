# Oware – Traditional African Board Game

A full-stack implementation of the ancient Ghanaian Oware (Mancala variant) game with single-player AI and real-time multiplayer.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, Socket.io |
| AI | Minimax with Alpha-Beta pruning |

## Project Structure

```
oware-game/
├── client/          # Next.js frontend
│   └── src/
│       ├── app/            # Next.js App Router pages
│       ├── components/     # React components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Game logic + AI
│       └── types/          # TypeScript interfaces
└── server/          # Express + Socket.io backend
    └── src/
        ├── index.ts        # Server entry point
        ├── gameLogic.ts    # Shared game rules
        ├── roomManager.ts  # Multiplayer room state
        └── types.ts        # TypeScript interfaces
```

## Quick Start

### Prerequisites
- Node.js 18+ installed

### 1. Install dependencies

```bash
cd oware-game

# Install root tools
npm install

# Install client + server dependencies
npm run install:all
```

Or manually:
```bash
cd client && npm install
cd ../server && npm install
```

### 2. Run in development mode

```bash
# From the oware-game directory
npm run dev
```

This starts:
- Frontend at **http://localhost:3000**
- Backend at **http://localhost:3001**

Or run separately:
```bash
# Terminal 1
cd client && npm run dev

# Terminal 2
cd server && npm run dev
```

### 3. Open the game

Visit **http://localhost:3000** in your browser.

## Game Modes

### Single Player (vs AI)
- Choose Easy / Medium / Hard
- AI uses Minimax with Alpha-Beta pruning
- Hard mode searches 6 moves deep

### Multiplayer
- One player creates a room (gets a 6-character code)
- Friend enters the code to join
- Real-time moves via WebSockets
- In-game chat

## Oware Rules (Ghanaian Standard)

- 2 rows of 6 pits, each starting with **4 seeds** (48 total)
- Players alternate turns picking a pit from their side
- Seeds are sown **counter-clockwise**, one per pit
- **Capture**: last seed lands in an opponent's pit with exactly **2 or 3** seeds → those seeds are captured. Continue capturing backwards through consecutive pits with 2–3 seeds
- **Grand Slam rule**: if capturing would leave the opponent with zero seeds, no capture is made
- **Starvation rule**: if opponent has no seeds, you must play a move that gives them seeds. If impossible, game ends and you take your remaining seeds
- **End conditions**: no valid moves, fewer than 6 seeds on board, or 50 consecutive non-capturing moves
- Player with the most captured seeds **wins**

## Environment Variables

Create `client/.env.local` to point to a remote server:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```
