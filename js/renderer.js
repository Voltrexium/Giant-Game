import { WIDTH, HEIGHT, ENTITY_SIZE } from "./game-logic.js";

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./game-logic.js').GameState} state
 * @param {import('./effects.js').EffectsState} effects
 * @param {{ displayLevel: (s: import('./game-logic.js').GameState) => number, time: number }} opts
 */
export function draw(ctx, state, effects, { displayLevel, time }) {
  ctx.save();

  if (effects.shake > 0) {
    const sx = (Math.random() - 0.5) * effects.shake * 2;
    const sy = (Math.random() - 0.5) * effects.shake * 2;
    ctx.translate(sx, sy);
  }

  ctx.fillStyle = "#0d0d18";
  ctx.fillRect(-20, -20, WIDTH + 40, HEIGHT + 40);

  ctx.fillStyle = "#e056fd";
  for (const p of state.circles) {
    ctx.beginPath();
    ctx.arc(p.x + ENTITY_SIZE / 2, p.y + ENTITY_SIZE / 2, ENTITY_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const pulse = 0.65 + Math.sin(time * 0.006) * 0.35;
  for (const p of state.circles2) {
    const cx = p.x + ENTITY_SIZE / 2;
    const cy = p.y + ENTITY_SIZE / 2;
    const r = ENTITY_SIZE / 2;

    ctx.fillStyle = `rgba(155, 40, 210, ${0.25 + pulse * 0.2})`;
    ctx.shadowColor = "#c026d3";
    ctx.shadowBlur = 10 + pulse * 10;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#9b28d4";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
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

  for (const p of effects.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(234, 234, 234, 0.9)";
  ctx.font = "14px Segoe UI, system-ui, sans-serif";
  ctx.fillText(`Level ${displayLevel(state)}`, 16, 24);
  ctx.fillText(`Points ${state.points}`, 16, 44);
  ctx.fillText(`Enemies ${state.enemies.length}`, 16, 64);

  ctx.restore();

  if (effects.deathFlash > 0) {
    ctx.fillStyle = `rgba(255, 60, 60, ${effects.deathFlash * 0.45})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
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
