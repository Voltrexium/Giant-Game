/** @typedef {{ x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string, size: number }} Particle */

/**
 * @typedef {Object} EffectsState
 * @property {Particle[]} particles
 * @property {number} shake
 * @property {number} deathFlash
 */

/** @returns {EffectsState} */
export function createEffectsState() {
  return { particles: [], shake: 0, deathFlash: 0 };
}

/** @param {EffectsState} effects */
export function resetEffects(effects) {
  effects.particles = [];
  effects.shake = 0;
  effects.deathFlash = 0;
}

/**
 * @param {EffectsState} effects
 * @param {number} x
 * @param {number} y
 * @param {string} color
 * @param {number} [count]
 */
export function spawnParticles(effects, x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    effects.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.4 + Math.random() * 0.35,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

/** @param {EffectsState} effects @param {number} [intensity] */
export function triggerShake(effects, intensity = 8) {
  effects.shake = Math.max(effects.shake, intensity);
}

/** @param {EffectsState} effects */
export function triggerDeathFlash(effects) {
  effects.deathFlash = 1;
}

/**
 * @typedef {{ type: 'collect', x: number, y: number, kind: 'dot' | 'orb', valuable?: boolean } | { type: 'penalty', x: number, y: number } | { type: 'death' }} GameEvent
 */

/** @param {EffectsState} effects @param {GameEvent[]} events */
export function applyEvents(effects, events) {
  for (const event of events) {
    if (event.type === "collect") {
      const color =
        event.kind === "orb" ? "#4ecdc4" : event.valuable ? "#c026d3" : "#e056fd";
      spawnParticles(effects, event.x, event.y, color, event.kind === "orb" ? 14 : 8);
    } else if (event.type === "penalty") {
      triggerShake(effects, 5);
      spawnParticles(effects, event.x, event.y, "rgba(255,255,255,0.7)", 5);
    } else if (event.type === "death") {
      triggerShake(effects, 14);
      triggerDeathFlash(effects);
    }
  }
}

/** @param {EffectsState} effects @param {number} dt seconds */
export function updateEffects(effects, dt) {
  effects.shake *= 0.82;
  if (effects.shake < 0.3) effects.shake = 0;

  if (effects.deathFlash > 0) {
    effects.deathFlash = Math.max(0, effects.deathFlash - dt * 2.5);
  }

  for (const p of effects.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.life -= dt / p.maxLife;
  }
  effects.particles = effects.particles.filter((p) => p.life > 0);
}
