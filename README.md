# Swarm

Browser port of the **Swarm** mini-game from Giant-Game. Single-player: collect pink dots, grab the cyan orb to double your score, and dodge the growing red enemy swarm.

The original Java/BlueJ codebase lives in [`old/`](old/).

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | None — vanilla HTML/CSS/JS ES modules |
| Rendering | HTML5 Canvas 2D |
| Build | None — static files |
| Dev server | `serve` on port 3000 |
| Persistence | `localStorage` (money + high score) |

## Project layout

```
├── index.html          # UI + inline CSS
├── app.js              # Canvas, input, screens, game loop
├── config.js           # Generated (gitignored)
├── js/
│   ├── game-logic.js   # Pure Swarm rules (no DOM)
│   └── storage.js      # localStorage helpers
├── scripts/
│   └── generate-config.mjs
├── package.json
└── old/                # Legacy Java game collection
```

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Controls

- **Keyboard:** WASD or arrow keys
- **Mouse:** move cursor to steer
- **ESC:** pause / resume

## Game rules (Swarm mode)

- Collect **pink circles** for points
- Touch the **cyan orb** to double your score (enemies reposition)
- Avoid **red enemies** — they chase you and end the run on contact
- **White rounded squares** cost 10 points; **white squares** reset your score to 0
- Level up when score exceeds `level × 50`; each level spawns a new enemy
- Earn `$` (level ÷ 2) per run; revive costs $100
