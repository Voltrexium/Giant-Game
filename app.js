import {
  WIDTH,
  HEIGHT,
  ENTITY_SIZE,
  createInitialState,
  tick,
  sessionEarnings,
} from "./js/game-logic.js";
import { loadMoney, saveMoney, loadHighScore, saveHighScore } from "./js/storage.js";

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("board"));
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayPanel = document.getElementById("overlay-panel");
const statusPill = document.getElementById("status-pill");
const helpText = document.getElementById("help-text");
const moneyDisplay = document.getElementById("money-display");
const highScoreDisplay = document.getElementById("high-score-display");
const leaveDialog = /** @type {HTMLDialogElement} */ (document.getElementById("leave-dialog"));
const leaveCancel = document.getElementById("leave-cancel");
const leaveConfirm = document.getElementById("leave-confirm");
const boardWrap = document.getElementById("board-wrap");

/** @type {'title' | 'playing' | 'paused' | 'gameover'} */
let screen = "title";
/** @type {'W' | 'M'} */
let controlScheme = "W";
let money = loadMoney();
let highScore = loadHighScore();
/** @type {import('./js/game-logic.js').GameState | null} */
let gameState = null;
let sessionStartMoney = 0;
let lastTime = 0;
const TICK_MS = 16;

const keys = { up: false, down: false, left: false, right: false };
let mouseX = WIDTH / 2;
let mouseY = HEIGHT / 2;

let scale = 1;
let dpr = 1;

function resize() {
  const rect = boardWrap.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height, 720);
  dpr = window.devicePixelRatio || 1;
  scale = size / WIDTH;
  canvas.width = Math.floor(size * dpr);
  canvas.height = Math.floor(size * dpr);
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
}

function canvasCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * WIDTH,
    y: ((clientY - rect.top) / rect.height) * HEIGHT,
  };
}

function updateDisplays() {
  moneyDisplay.textContent = String(money);
  highScoreDisplay.textContent = String(highScore);
}

function showOverlay(html) {
  overlayPanel.innerHTML = html;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function bindOverlayButtons() {
  overlayPanel.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", () => {
      const action = el.getAttribute("data-action");
      if (action === "wasd") startGame("W");
      if (action === "mouse") startGame("M");
      if (action === "play") showControlSelect();
      if (action === "again") startGame(controlScheme);
      if (action === "menu") showTitle();
      if (action === "revive") tryRevive();
      if (action === "resume") resumeGame();
    });
  });
}

function showTitle() {
  screen = "title";
  gameState = null;
  statusPill.textContent = "Press Play to start";
  helpText.textContent = "WASD / arrows or mouse · ESC to pause";
  showOverlay(`
    <h2>Swarm</h2>
    <p>Collect pink dots, grab the cyan orb to double your score, and survive the red swarm.</p>
    <div class="legend">
      <div><span style="background:#4ecdc4"></span> You — stay alive</div>
      <div><span style="background:#e056fd"></span> Pink — points</div>
      <div><span style="background:#4ecdc4"></span> Cyan orb — 2× score</div>
      <div><span style="background:#ff6b6b"></span> Red enemies — game over</div>
      <div><span style="background:#ccc;border-radius:2px"></span> White — penalties</div>
    </div>
    <div class="btn-row">
      <button class="btn-primary" data-action="play">Play</button>
    </div>
  `);
  bindOverlayButtons();
}

function showControlSelect() {
  screen = "title";
  showOverlay(`
    <h2>Controls</h2>
    <p>Choose how you want to move.</p>
    <div class="btn-row">
      <button class="btn-primary" data-action="wasd">Keyboard (WASD / Arrows)</button>
      <button class="btn-secondary" data-action="mouse">Mouse</button>
    </div>
  `);
  bindOverlayButtons();
}

function startGame(scheme) {
  controlScheme = scheme;
  sessionStartMoney = money;
  gameState = createInitialState();
  screen = "playing";
  hideOverlay();
  statusPill.textContent = `Level ${displayLevel(gameState)} · ${gameState.points} pts`;
  helpText.textContent =
    scheme === "W"
      ? "WASD / arrows to move · ESC to pause"
      : "Move mouse to steer · ESC to pause";
}

function displayLevel(state) {
  return state.level === 0 ? 1 : state.level;
}

function pauseGame() {
  if (screen !== "playing" || !gameState) return;
  screen = "paused";
  showOverlay(`
    <h2>Paused</h2>
    <p>Take a breath — the swarm waits.</p>
    <div class="btn-row">
      <button class="btn-primary" data-action="resume">Resume</button>
      <button class="btn-secondary" data-action="menu">Main Menu</button>
    </div>
  `);
  bindOverlayButtons();
}

function resumeGame() {
  if (!gameState) return;
  screen = "playing";
  hideOverlay();
}

function endGame() {
  if (!gameState) return;
  screen = "gameover";
  money = sessionEarnings(gameState, sessionStartMoney);
  saveMoney(money);
  highScore = saveHighScore(gameState.points);
  updateDisplays();

  statusPill.textContent = "Game Over";
  const canRevive = money >= 100 && !gameState.reviveUsed;

  showOverlay(`
    <h2>Game Over</h2>
    <p>Score: <strong style="color:var(--accent)">${gameState.points}</strong> · Level ${displayLevel(gameState)}</p>
    <div class="btn-row">
      <button class="btn-primary" data-action="again">Play Again</button>
      ${canRevive ? '<button class="btn-secondary" data-action="revive">Revive ($100)</button>' : ""}
      <button class="btn-secondary" data-action="menu">Main Menu</button>
    </div>
  `);
  bindOverlayButtons();
}

function tryRevive() {
  if (!gameState || money < 100) return;
  money -= 100;
  saveMoney(money);
  updateDisplays();
  const points = gameState.points;
  const enemyCount = gameState.enemies.length;
  gameState = createInitialState(points, enemyCount);
  gameState.reviveUsed = true;
  sessionStartMoney = money;
  screen = "playing";
  hideOverlay();
  statusPill.textContent = `Revived! Level ${displayLevel(gameState)} · ${points} pts`;
}

const KEY_MAP = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

window.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    e.preventDefault();
    if (screen === "playing") pauseGame();
    else if (screen === "paused") resumeGame();
    return;
  }
  const dir = KEY_MAP[e.code];
  if (dir) {
    keys[dir] = true;
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  const dir = KEY_MAP[e.code];
  if (dir) keys[dir] = false;
});

canvas.addEventListener("mousemove", (e) => {
  const p = canvasCoords(e.clientX, e.clientY);
  mouseX = p.x;
  mouseY = p.y;
});

canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const p = canvasCoords(t.clientX, t.clientY);
    mouseX = p.x;
    mouseY = p.y;
  },
  { passive: false }
);

leaveCancel.addEventListener("click", () => leaveDialog.close());
leaveConfirm.addEventListener("click", () => {
  leaveDialog.close();
  showTitle();
});

window.addEventListener("resize", resize);

function draw(state) {
  ctx.fillStyle = "#0d0d18";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#e056fd";
  for (const p of state.circles) {
    ctx.beginPath();
    ctx.arc(p.x + ENTITY_SIZE / 2, p.y + ENTITY_SIZE / 2, ENTITY_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const p of state.circles2) {
    ctx.beginPath();
    ctx.arc(p.x + ENTITY_SIZE / 2, p.y + ENTITY_SIZE / 2, ENTITY_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ff6b6b";
  for (const enemy of state.enemies) {
    ctx.beginPath();
    ctx.arc(enemy.x + ENTITY_SIZE / 2, enemy.y + ENTITY_SIZE / 2, ENTITY_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffaaaa";
    ctx.font = "10px sans-serif";
    ctx.fillText("Enemy", enemy.x - 2, enemy.y - 4);
    ctx.fillStyle = "#ff6b6b";
  }

  if (state.orb.alive) {
    ctx.fillStyle = "#4ecdc4";
    ctx.shadowColor = "#4ecdc4";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(
      state.orb.x + ENTITY_SIZE / 2,
      state.orb.y + ENTITY_SIZE / 2,
      ENTITY_SIZE / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (const p of state.curved) {
    roundRect(ctx, p.x, p.y, ENTITY_SIZE, ENTITY_SIZE, 8);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  for (const p of state.pointResetters) {
    ctx.strokeRect(p.x, p.y, ENTITY_SIZE, ENTITY_SIZE);
  }

  const { player } = state;
  ctx.fillStyle = "#4ecdc4";
  ctx.shadowColor = "#4ecdc4";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(player.x + player.w / 2, player.y + player.h / 2, player.w / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(234, 234, 234, 0.9)";
  ctx.font = "14px Segoe UI, system-ui, sans-serif";
  ctx.fillText(`Level ${displayLevel(state)}`, 16, 24);
  ctx.fillText(`Points ${state.points}`, 16, 44);
  ctx.fillText(`Enemies ${state.enemies.length}`, 16, 64);
}

function roundRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + w - r, y);
  context.quadraticCurveTo(x + w, y, x + w, y + r);
  context.lineTo(x + w, y + h - r);
  context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  context.lineTo(x + r, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function frame(time) {
  requestAnimationFrame(frame);
  const elapsed = time - lastTime;
  if (elapsed < TICK_MS) return;
  lastTime = time - (elapsed % TICK_MS);

  if (screen === "playing" && gameState && !gameState.gameOver) {
    tick(gameState, {
      up: keys.up,
      down: keys.down,
      left: keys.left,
      right: keys.right,
      mouseX,
      mouseY,
      controlScheme,
    });

    statusPill.textContent = `Level ${displayLevel(gameState)} · ${gameState.points} pts`;

    if (gameState.gameOver) {
      endGame();
    }
  }

  if (gameState && (screen === "playing" || screen === "paused")) {
    draw(gameState);
  }
}

resize();
updateDisplays();
showTitle();
requestAnimationFrame(frame);
