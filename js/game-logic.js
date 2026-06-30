/** @typedef {{ x: number, y: number }} Point */
/** @typedef {{ x: number, y: number, w: number, h: number, speed: number }} Player */
/** @typedef {{ x: number, y: number }} Enemy */

export const WIDTH = 1000;
export const HEIGHT = 1000;
export const ENTITY_SIZE = 25;

const MAX_CIRCLES = 25;
const MAX_CURVED = 25;
const MAX_RESETTERS = 15;

/**
 * @returns {import('./game-logic.js').GameState}
 */
export function createInitialState(points = 0, enemyCount = 0) {
  const player = {
    x: WIDTH / 2 - ENTITY_SIZE / 2,
    y: HEIGHT / 2 - ENTITY_SIZE / 2,
    w: ENTITY_SIZE,
    h: ENTITY_SIZE,
    speed: 5,
  };

  /** @type {Enemy[]} */
  const enemies = [];
  for (let i = 0; i < enemyCount; i++) {
    enemies.push({ x: 0, y: 0 });
  }

  return {
    player,
    circles: [],
    circles2: [],
    curved: [],
    pointResetters: [],
    enemies,
    orb: spawnOrb(),
    orbCollected: false,
    level: 0,
    pointCheck: points,
    points,
    enemySpeed: 1,
    gameOver: false,
    reviveUsed: false,
  };
}

function spawnOrb() {
  return {
    x: rand(0, WIDTH - ENTITY_SIZE),
    y: rand(0, HEIGHT - ENTITY_SIZE),
    alive: true,
  };
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function overlaps(ax, ay, bx, by, tolerance) {
  return (
    ax - bx <= tolerance &&
    ax - bx >= -tolerance &&
    ay - by <= tolerance &&
    ay - by >= -tolerance
  );
}

/**
 * @param {GameState} state
 * @param {{ up: boolean, down: boolean, left: boolean, right: boolean, mouseX: number, mouseY: number, controlScheme: 'W' | 'M' }} input
 */
export function tick(state, input) {
  if (state.gameOver) return;

  updateLeveling(state);
  updateOrb(state);
  moveEnemies(state);
  spawnCollectibles(state);
  moveOrbTowardPlayer(state);
  movePlayer(state, input);
  handleCollisions(state);
}

function updateLeveling(state) {
  if (state.points > state.level * 50 && state.points > state.pointCheck) {
    state.level += 1;
    state.enemies.push({
      x: rand(0, WIDTH - 100),
      y: rand(0, HEIGHT - 100),
    });
    respawnOrb(state);
  }
}

function respawnOrb(state) {
  state.orb = spawnOrb();
  state.orbCollected = false;
}

function updateOrb(state) {
  if (Math.floor(Math.random() * 10000) === 1 && !state.orb.alive) {
    respawnOrb(state);
  }

  const { player, orb } = state;
  if (
    overlaps(player.x, player.y, orb.x, orb.y, 10) &&
    !state.orbCollected
  ) {
    state.curved = [];
    state.pointResetters = [];
    state.orb.alive = false;
    repositionEnemies(state);
    state.points *= 2;
    state.orbCollected = true;
  }
}

function repositionEnemies(state) {
  for (const enemy of state.enemies) {
    if (state.player.x - 100 > 0) {
      enemy.x = rand(0, state.player.x - 100);
    } else {
      enemy.x = WIDTH - rand(0, 200);
    }
    if (state.player.y - 100 > 0) {
      enemy.y = rand(0, state.player.y - 100);
    } else {
      enemy.y = HEIGHT - rand(0, 200);
    }
  }
}

function moveEnemies(state) {
  const { player, enemies, enemySpeed } = state;
  for (const enemy of enemies) {
    if (enemy.x < player.x) enemy.x += enemySpeed;
    if (enemy.x > player.x) enemy.x -= enemySpeed;
    if (enemy.y < player.y) enemy.y += enemySpeed;
    if (enemy.y > player.y) enemy.y -= enemySpeed;
  }
}

function spawnCollectibles(state) {
  if (Math.floor(Math.random() * 100) === 1 && state.circles.length < MAX_CIRCLES) {
    state.circles.push({ x: rand(0, WIDTH - 100), y: rand(0, HEIGHT - 100) });
  }
  if (Math.floor(Math.random() * 100) === 1 && state.circles2.length < MAX_CIRCLES) {
    state.circles2.push({ x: rand(0, WIDTH - 100), y: rand(0, HEIGHT - 100) });
  }
  if (Math.floor(Math.random() * 100) === 1 && state.curved.length < MAX_CURVED) {
    state.curved.push({ x: rand(0, WIDTH - ENTITY_SIZE), y: rand(0, HEIGHT - ENTITY_SIZE) });
  }
  if (Math.floor(Math.random() * 500) === 1 && state.pointResetters.length < MAX_RESETTERS) {
    state.pointResetters.push({ x: rand(0, WIDTH - ENTITY_SIZE), y: rand(0, HEIGHT - ENTITY_SIZE) });
  }
}

function moveOrbTowardPlayer(state) {
  const orb = state.orb;
  const player = state.player;
  if (orb.x < player.x || orb.x >= HEIGHT - ENTITY_SIZE) orb.x -= 1;
  if (orb.x > player.x || orb.x <= 0) orb.x += 1;
  if (orb.y < player.y || orb.y >= WIDTH - ENTITY_SIZE) orb.y -= 1;
  if (orb.y > player.y || orb.y <= 0) orb.y += 1;
}

/**
 * @param {GameState} state
 * @param {{ up: boolean, down: boolean, left: boolean, right: boolean, mouseX: number, mouseY: number, controlScheme: 'W' | 'M' }} input
 */
function movePlayer(state, input) {
  const p = state.player;
  const { speed } = p;

  if (input.controlScheme === "W") {
    if (input.down) {
      p.y += speed;
      if (p.y + p.h > HEIGHT - 1) p.y = HEIGHT - p.h - 1;
    }
    if (input.up) {
      p.y -= speed;
      if (p.y < 0) p.y = 0;
    }
    if (input.left) {
      p.x -= speed;
      if (p.x < 0) p.x = 0;
    }
    if (input.right) {
      p.x += speed;
      if (p.x + p.w > WIDTH - 1) p.x = WIDTH - p.w - 1;
    }
    return;
  }

  const mx = input.mouseX;
  const my = input.mouseY;
  if (p.x < mx && p.x + speed < WIDTH - ENTITY_SIZE) p.x += speed;
  if (p.x > mx && p.x - speed > 0) p.x -= speed;
  if (p.y < my && p.y + speed < HEIGHT - ENTITY_SIZE) p.y += speed;
  if (p.y > my && p.y - speed > 0) p.y -= speed;
}

function handleCollisions(state) {
  const { player } = state;

  let hit = findColliding(player, state.circles2, 10);
  if (hit) {
    state.points += state.points > 1000 ? 30 : 20;
    state.circles2 = state.circles2.filter((p) => p !== hit);
  }

  hit = findColliding(player, state.circles, 10);
  if (hit) {
    state.points += state.points > 1000 ? 20 : 10;
    state.circles = state.circles.filter((p) => p !== hit);
  }

  hit = findColliding(player, state.curved, 10);
  if (hit && state.points >= 10) {
    state.points -= 10;
    state.curved = state.curved.filter((p) => p !== hit);
  }

  hit = findColliding(player, state.pointResetters, 10);
  if (hit && state.points >= 5) {
    state.points = 0;
    state.pointResetters = state.pointResetters.filter((p) => p !== hit);
  }

  for (const enemy of state.enemies) {
    if (overlaps(player.x, player.y, enemy.x, enemy.y, 20)) {
      state.gameOver = true;
      return;
    }
  }
}

function findColliding(player, points, tolerance) {
  for (const point of points) {
    if (overlaps(player.x, player.y, point.x, point.y, tolerance)) {
      return point;
    }
  }
  return null;
}

/** Update balance after a finished run (matches legacy Java formula). */
export function sessionEarnings(state, startingMoney) {
  return Math.floor(state.level / 2) + startingMoney;
}

/**
 * @typedef {Object} GameState
 * @property {Player} player
 * @property {Point[]} circles
 * @property {Point[]} circles2
 * @property {Point[]} curved
 * @property {Point[]} pointResetters
 * @property {Enemy[]} enemies
 * @property {{ x: number, y: number, alive: boolean }} orb
 * @property {boolean} orbCollected
 * @property {number} level
 * @property {number} pointCheck
 * @property {number} points
 * @property {number} enemySpeed
 * @property {boolean} gameOver
 * @property {boolean} reviveUsed
 */
