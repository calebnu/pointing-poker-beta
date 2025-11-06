# Pointing Poker Beta

A real-time pointing poker application for agile teams. Users can create or join rooms, vote using Fibonacci sequence cards, and reveal results collaboratively.

## Features

- 🎯 Create or join rooms with auto-generated IDs
- 🃏 Vote using Fibonacci sequence (0, 1, 2, 3, 5, 8, 13, 21, ?, ☕)
- 👥 Real-time participant tracking
- 🔄 Live vote updates with reveal/clear functionality
- 🧹 Automatic room cleanup when empty
- 👨‍👩‍👧‍👦 No admin role - all users have equal permissions

## Tech Stack

- **Frontend**: Angular 17+, TypeScript, Socket.io-client, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io, TypeScript

## Project Structure

```
pointing-poker-beta/
├── client/          # Angular frontend
├── server/          # Node.js backend
└── package.json     # Monorepo configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Angular CLI: `npm install -g @angular/cli`

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

Or install individually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### Development

1. Start the backend server (runs on port 3001):
```bash
npm run dev:server
```

2. In a new terminal, start the frontend (runs on port 4200):
```bash
npm run dev:client
```

3. Open your browser and navigate to `http://localhost:4200`

### Testing

To test the real-time functionality:
1. Open multiple browser windows/tabs at `http://localhost:4200`
2. Create a room in one window
3. Copy the room ID and join from other windows
4. Test voting, revealing, and clearing votes

## How to Use

1. **Create a Room**: Enter your name and click "Create New Room"
2. **Join a Room**: Enter your name and the room ID, then click "Join Room"
3. **Vote**: Click on a card to submit your vote
4. **Reveal**: Click "Reveal Votes" to show everyone's votes
5. **Clear**: Click "Clear Votes" to start a new round

## License

MIT

