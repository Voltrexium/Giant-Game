import {
  WIDTH,
  HEIGHT,
  createInitialState,
  tick,
  sessionEarnings,
  displayLevel,
} from "./js/game-logic.js";
import {
  loadMoney,
  saveMoney,
  loadHighScore,
  saveHighScore,
} from "./js/storage.js";
import { draw } from "./js/renderer.js";
import {
  createEffectsState,
  resetEffects,
  applyEvents,
  updateEffects,
  initEffectsPreferences,
} from "./js/effects.js";

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
const boardWrap = /** @type {HTMLDivElement} */ (document.getElementById("board-wrap"));
const pauseBtn = /** @type {HTMLButtonElement} */ (document.getElementById("pause-btn"));
const fullscreenBtn = /** @type {HTMLButtonElement} */ (document.getElementById("fullscreen-btn"));

/** @type {'title' | 'playing' | 'paused' | 'gameover'} */
let screen = "title";
/** @type {'touch' | 'desktop'} */
let inputMode = detectInputMode();
let money = loadMoney();
let highScore = loadHighScore();
/** @type {import('./js/game-logic.js').GameState | null} */
let gameState = null;
let sessionStartMoney = 0;
let lastTickTime = 0;
let lastFrameTime = 0;
const TICK_MS = 16;
const DEATH_MS = 500;

const effects = createEffectsState();
let dyingUntil = 0;

const keys = { up: false, down: false, left: false, right: false };
let mouseX = WIDTH / 2;
let mouseY = HEIGHT / 2;

let scale = 1;
let dpr = 1;

function isCoarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
}

function detectInputMode() {
  return isCoarsePointer() ? "touch" : "desktop";
}

function helpForMode(mode) {
  if (mode === "touch") return "Drag on board to move · tap Pause";
  return "WASD / arrows or mouse to move · ESC or Pause";
}

function defaultTitleHelp() {
  return isCoarsePointer()
    ? "Tap Play — drag to move · Pause button in-game"
    : "WASD / arrows or mouse · ESC or Pause";
}

function applyInputMode() {
  canvas.classList.toggle("canvas--keyboard", inputMode === "desktop");
  canvas.classList.toggle("canvas--pointer", inputMode === "desktop" || inputMode === "touch");
}

function boardMaxPx() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--board-max").trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 720;
}

function resize() {
  const rect = boardWrap.getBoundingClientRect();
  const maxBoard = boardMaxPx();
  const size = Math.min(rect.width, rect.height, maxBoard);
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

function syncBodyState() {
  const active =
    screen === "playing" || screen === "paused" || dyingUntil > 0;
  document.body.classList.toggle("is-playing", screen === "playing" || dyingUntil > 0);
  document.body.classList.toggle("is-active", active);
}

function updateBoardControls() {
  const inGame = screen === "playing" || dyingUntil > 0;
  pauseBtn.hidden = !inGame;
  fullscreenBtn.hidden = !inGame || !document.fullscreenEnabled;
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
      if (action === "play" || action === "again") startGame();
      if (action === "menu") requestLeave();
      if (action === "revive") tryRevive();
      if (action === "resume") resumeGame();
    });
  });
}

function legendHtml() {
  return `
    <div class="legend legend--full">
      <div><span style="background:#4ecdc4"></span> You — stay alive</div>
      <div><span style="background:#e056fd"></span> Pink — points (glowing violet = bonus)</div>
      <div><span style="background:#4ecdc4"></span> Cyan orb — 2× score</div>
      <div><span style="background:#ff6b6b"></span> Red enemies — game over</div>
      <div><span style="background:#ccc;border-radius:2px"></span> White — penalties</div>
    </div>
    <details class="legend legend--compact">
      <summary>How to play</summary>
      <div><span style="background:#e056fd"></span> Collect dots · violet glow = bonus</div>
      <div><span style="background:#4ecdc4"></span> Cyan orb doubles score</div>
      <div><span style="background:#ff6b6b"></span> Avoid red enemies</div>
    </details>
  `;
}

function animateEarnings(amount) {
  const el = document.getElementById("earnings-amount");
  if (!el || amount <= 0) return;
  const start = performance.now();
  const duration = 800;
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) ** 3;
    el.textContent = `$${Math.round(amount * eased)}`;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function showTitle() {
  screen = "title";
  gameState = null;
  dyingUntil = 0;
  statusPill.textContent = "Press Play to start";
  helpText.textContent = defaultTitleHelp();
  syncBodyState();
  updateBoardControls();
  showOverlay(`
    <h2>Swarm</h2>
    <p>Collect pink dots, grab the cyan orb to double your score, and survive the red swarm.</p>
    ${legendHtml()}
    <div class="btn-row">
      <button class="btn-primary" data-action="play">Play</button>
    </div>
  `);
  bindOverlayButtons();
}

function startGame() {
  inputMode = detectInputMode();
  applyInputMode();
  sessionStartMoney = money;
  gameState = createInitialState();
  resetEffects(effects);
  dyingUntil = 0;
  screen = "playing";
  hideOverlay();
  statusPill.textContent = `Level ${displayLevel(gameState)} · ${gameState.points} pts`;
  helpText.textContent = helpForMode(inputMode);
  syncBodyState();
  updateBoardControls();
  if (inputMode === "desktop") canvas.focus({ preventScroll: true });
}

function pauseGame() {
  if (screen !== "playing" || !gameState || dyingUntil > 0) return;
  screen = "paused";
  syncBodyState();
  updateBoardControls();
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
  syncBodyState();
  updateBoardControls();
  if (inputMode === "desktop") canvas.focus({ preventScroll: true });
}

function requestLeave() {
  if (screen === "paused" && gameState) {
    leaveDialog.showModal();
    return;
  }
  showTitle();
}

function endGame() {
  if (!gameState) return;
  screen = "gameover";
  const newMoney = sessionEarnings(gameState, sessionStartMoney);
  const earned = newMoney - sessionStartMoney;
  money = newMoney;
  saveMoney(money);
  highScore = saveHighScore(gameState.points);
  updateDisplays();

  statusPill.textContent = "Game Over";
  syncBodyState();
  updateBoardControls();
  const canRevive = money >= 100 && !gameState.reviveUsed;

  showOverlay(`
    <h2>Game Over</h2>
    <p>Score: <strong style="color:var(--accent)">${gameState.points}</strong> · Level ${displayLevel(gameState)}</p>
    ${
      earned > 0
        ? `<p class="earnings-pop" id="earnings-pop">+<strong id="earnings-amount">$0</strong> earned this run</p>`
        : ""
    }
    <div class="btn-row">
      <button class="btn-primary" data-action="again">Play Again</button>
      ${canRevive ? '<button class="btn-secondary" data-action="revive">Revive ($100)</button>' : ""}
      <button class="btn-secondary" data-action="menu">Main Menu</button>
    </div>
  `);
  bindOverlayButtons();
  animateEarnings(earned);
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
  resetEffects(effects);
  dyingUntil = 0;
  sessionStartMoney = money;
  screen = "playing";
  hideOverlay();
  statusPill.textContent = `Revived! Level ${displayLevel(gameState)} · ${points} pts`;
  syncBodyState();
  updateBoardControls();
  if (inputMode === "desktop") canvas.focus({ preventScroll: true });
}

function setPointerFromTouch(clientX, clientY) {
  const p = canvasCoords(clientX, clientY);
  mouseX = p.x;
  mouseY = p.y;
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }
  boardWrap.requestFullscreen?.();
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
    if (leaveDialog.open) {
      leaveDialog.close();
      return;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (screen === "playing" && dyingUntil === 0) pauseGame();
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
  if (inputMode !== "desktop") return;
  const p = canvasCoords(e.clientX, e.clientY);
  mouseX = p.x;
  mouseY = p.y;
});

function onTouchPointer(e) {
  if (inputMode !== "touch") return;
  if (e.cancelable) e.preventDefault();
  const t = e.touches[0] ?? e.changedTouches[0];
  if (t) setPointerFromTouch(t.clientX, t.clientY);
}

canvas.addEventListener("touchstart", onTouchPointer, { passive: false });
canvas.addEventListener("touchmove", onTouchPointer, { passive: false });

pauseBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (screen === "playing") pauseGame();
});

fullscreenBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleFullscreen();
});

document.addEventListener("fullscreenchange", () => {
  resize();
  updateBoardControls();
});

document.addEventListener("visibilitychange", () => {
  if (
    document.hidden &&
    screen === "playing" &&
    gameState &&
    !gameState.gameOver &&
    dyingUntil === 0
  ) {
    pauseGame();
  }
});

leaveCancel.addEventListener("click", () => leaveDialog.close());
leaveConfirm.addEventListener("click", () => {
  leaveDialog.close();
  showTitle();
});

window.addEventListener("resize", resize);

function frame(time) {
  requestAnimationFrame(frame);

  const frameDt = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 0.05) : 0;
  lastFrameTime = time;

  const isDying = dyingUntil > 0;
  const tickElapsed = time - lastTickTime;
  const shouldTick = tickElapsed >= TICK_MS;

  if (shouldTick) {
    lastTickTime = time - (tickElapsed % TICK_MS);

    if (screen === "playing" && gameState && !gameState.gameOver && !isDying) {
      const events = tick(gameState, {
        up: keys.up,
        down: keys.down,
        left: keys.left,
        right: keys.right,
        mouseX,
        mouseY,
        inputMode,
      });
      applyEvents(effects, events);
      statusPill.textContent = `Level ${displayLevel(gameState)} · ${gameState.points} pts`;

      if (gameState.gameOver) {
        dyingUntil = performance.now() + DEATH_MS;
        syncBodyState();
        updateBoardControls();
      }
    }

    if (isDying && performance.now() >= dyingUntil) {
      dyingUntil = 0;
      endGame();
    }
  }

  if (gameState && (screen === "playing" || screen === "paused" || dyingUntil > 0)) {
    updateEffects(effects, frameDt);
    draw(ctx, gameState, effects, { displayLevel, time });
  }
}

applyInputMode();
initEffectsPreferences();
resize();
updateDisplays();
updateBoardControls();
showTitle();
requestAnimationFrame(frame);
