// Princeton Tower Defense - Hazard Game Logic Module
// Handles calculation of hazard effects on enemies, troops, and heroes

import type { Position, Enemy, Troop, Hero, MapHazard, Particle, SlowSourceType } from "../../types";
import { gridToWorld, distance } from "../../utils";
import { TILE_SIZE } from "../../constants";

// ============================================================================
// TYPES
// ============================================================================

export interface HazardEffect {
  poisonDamage: number;
  lavaDamage: number;
  environmentalSlow: number;
  environmentalSlowSource?: SlowSourceType;
  environmentalSpeed: number;
  fireParticlePos?: Position;
}

export interface HazardParticle {
  pos: Position;
  type: Particle["type"];
  count: number;
}

interface IceSpikeCycleState {
  extend: number;
  active: boolean;
  burst: boolean;
}

export interface HazardData extends MapHazard {
  worldPos: Position;
  radius: number;
  iceSpikeCycle?: IceSpikeCycleState;
  particleBudget?: number;
}

export interface HazardCalculationResult {
  effects: Map<string, HazardEffect>;
  particles: HazardParticle[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getIceSpikeCycleState(pos: Position, timeSeconds: number): IceSpikeCycleState {
  const seed = (pos.x || 0) * 47.3 + (pos.y || 0) * 21.9;
  const cycleDuration = 2.6;
  const phaseOffset = ((seed * 0.071) % cycleDuration + cycleDuration) % cycleDuration;
  const phase = (timeSeconds + phaseOffset) % cycleDuration;

  // Telegraph -> shoot-up -> active -> retract -> dormant
  if (phase < 0.45) {
    const wobble = 0.08 + Math.sin((phase / 0.45) * Math.PI * 2) * 0.03;
    return { extend: Math.max(0.04, wobble), active: false, burst: false };
  }
  if (phase < 0.68) {
    const p = (phase - 0.45) / 0.23;
    return { extend: 0.14 + p * 0.86, active: true, burst: true };
  }
  if (phase < 1.25) {
    const p = (phase - 0.68) / 0.57;
    return {
      extend: 0.94 + Math.sin(p * Math.PI * 2) * 0.06,
      active: true,
      burst: false,
    };
  }
  if (phase < 1.55) {
    const p = (phase - 1.25) / 0.3;
    return { extend: 1 - p * 0.92, active: true, burst: false };
  }
  return { extend: 0.05, active: false, burst: false };
}

/**
 * Pre-calculates hazard world positions and radii
 */
export function prepareHazardData(
  hazards: MapHazard[],
  timeSeconds: number
): HazardData[] {
  return hazards.map((hazard) => {
    const data: HazardData = {
      ...hazard,
      worldPos: gridToWorld(hazard.pos!),
      radius: (hazard.radius || 2) * TILE_SIZE,
    };

    if ((hazard.type === "ice_spikes" || hazard.type === "spikes") && hazard.pos) {
      data.iceSpikeCycle = getIceSpikeCycleState(hazard.pos, timeSeconds);
      data.particleBudget = data.iceSpikeCycle.burst ? 2 : data.iceSpikeCycle.active ? 1 : 0;
    }

    return data;
  });
}

/**
 * Calculates the effect of a single hazard on an enemy
 */
function calculateSingleHazardEffect(
  hazard: HazardData,
  enemyPos: Position,
  currentEffect: HazardEffect,
  deltaTime: number,
  particles: HazardParticle[]
): HazardEffect {
  const dist = distance(enemyPos, hazard.worldPos);
  if (dist >= hazard.radius) return currentEffect;

  const effect = { ...currentEffect };

  switch (hazard.type) {
    case "poison_fog":
      effect.poisonDamage += (15 * deltaTime) / 1000;
      if (Math.random() < 0.1) {
        particles.push({ pos: hazard.worldPos, type: "poison", count: 3 });
      }
      break;
    case "deep_water": {
      const distFactor = 1 - dist / hazard.radius;
      const drownDps = 4 + distFactor * 5;
      effect.poisonDamage += (drownDps * deltaTime) / 1000;
      if (effect.environmentalSlow < 0.38) {
        effect.environmentalSlow = 0.38;
        effect.environmentalSlowSource = "deep_water";
      }
      if (Math.random() < 0.08) {
        particles.push({ pos: hazard.worldPos, type: "water", count: 2 });
      }
      break;
    }
    case "maelstrom": {
      const distFactor = 1 - dist / hazard.radius;
      const crushDps = 8 + distFactor * 12;
      effect.poisonDamage += (crushDps * deltaTime) / 1000;
      if (effect.environmentalSlow < 0.55) {
        effect.environmentalSlow = 0.55;
        effect.environmentalSlowSource = "maelstrom";
      }
      if (Math.random() < 0.04) {
        effect.lavaDamage += 12;
        particles.push({ pos: enemyPos, type: "storm", count: 5 });
      }
      if (Math.random() < 0.12) {
        particles.push({ pos: hazard.worldPos, type: "water", count: 3 });
      }
      break;
    }
    case "storm_field":
      effect.environmentalSpeed = Math.max(effect.environmentalSpeed, 1.15);
      effect.lavaDamage += (6 * deltaTime) / 1000;
      if (Math.random() < 0.14) {
        particles.push({ pos: hazard.worldPos, type: "storm", count: 3 });
      }
      break;
    case "quicksand":
      if (effect.environmentalSlow < 0.5) {
        effect.environmentalSlow = 0.5;
        effect.environmentalSlowSource = "quicksand";
      }
      if (Math.random() < 0.1) {
        particles.push({ pos: hazard.worldPos, type: "sand", count: 3 });
      }
      break;
    case "ice_sheet":
    case "slippery_ice":
      effect.environmentalSpeed = 1.6;
      if (Math.random() < 0.1) {
        particles.push({ pos: hazard.worldPos, type: "ice", count: 3 });
      }
      break;
    case "ice_spikes":
    case "spikes":
      // Damage is phase-based: spikes only hurt when raised.
      if (!hazard.iceSpikeCycle || hazard.iceSpikeCycle.extend < 0.2) break;

      const intensity = Math.min(1, Math.max(0, (hazard.iceSpikeCycle.extend - 0.2) / 0.8));
      const distFactor = 1 - dist / hazard.radius;
      const coreFactor = 0.35 + distFactor * 0.65;
      const spikeDps = (6 + intensity * 24) * coreFactor;
      effect.poisonDamage += (spikeDps * deltaTime) / 1000;
      const iceSpikeSlow = 0.12 + intensity * 0.33;
      if (effect.environmentalSlow < iceSpikeSlow) {
        effect.environmentalSlow = iceSpikeSlow;
        effect.environmentalSlowSource = "ice_spikes";
      }

      if (
        hazard.particleBudget &&
        hazard.particleBudget > 0 &&
        distFactor > 0.25 &&
        (hazard.iceSpikeCycle.burst || Math.random() < 0.06)
      ) {
        particles.push({ pos: hazard.worldPos, type: "ice", count: 3 });
        hazard.particleBudget -= 1;
      }
      break;
    case "lava_geyser":
    // Legacy alias: kept for old custom level data.
    case "eruption_zone":
      if (Math.random() < 0.095) {
        effect.lavaDamage += 5;
        effect.fireParticlePos = enemyPos;
      }
      break;
    case "volcano": {
      if (Math.random() < 0.055) {
        effect.lavaDamage += 15;
        effect.fireParticlePos = enemyPos;
        particles.push({ pos: enemyPos, type: "fire", count: 8 });
      }
      break;
    }
    case "lava":
      if (Math.random() < 0.08) {
        effect.lavaDamage += 4;
        effect.fireParticlePos = enemyPos;
      }
      break;
    case "swamp": {
      effect.poisonDamage += (6 * deltaTime) / 1000;
      if (effect.environmentalSlow < 0.35) {
        effect.environmentalSlow = 0.35;
        effect.environmentalSlowSource = "quicksand";
      }
      break;
    }
    case "ice":
      effect.environmentalSpeed = 1.5;
      if (Math.random() < 0.08) {
        particles.push({ pos: hazard.worldPos, type: "ice", count: 2 });
      }
      break;
    case "poison":
      effect.poisonDamage += (12 * deltaTime) / 1000;
      if (Math.random() < 0.08) {
        particles.push({ pos: hazard.worldPos, type: "poison", count: 2 });
      }
      break;
    case "fire":
      effect.lavaDamage += (10 * deltaTime) / 1000;
      if (Math.random() < 0.1) {
        effect.fireParticlePos = enemyPos;
      }
      break;
    case "lightning":
      if (Math.random() < 0.06) {
        effect.lavaDamage += 18;
        particles.push({ pos: enemyPos, type: "storm", count: 4 });
      }
      break;
    case "void": {
      effect.poisonDamage += (8 * deltaTime) / 1000;
      if (effect.environmentalSlow < 0.3) {
        effect.environmentalSlow = 0.3;
        effect.environmentalSlowSource = "unknown";
      }
      break;
    }
  }

  return effect;
}

/**
 * Creates a default (no effect) hazard effect object
 */
function createDefaultEffect(): HazardEffect {
  return {
    poisonDamage: 0,
    lavaDamage: 0,
    environmentalSlow: 0,
    environmentalSlowSource: undefined,
    environmentalSpeed: 1,
    fireParticlePos: undefined,
  };
}

/**
 * Checks if an effect has any actual impact
 */
function hasEffect(effect: HazardEffect): boolean {
  return (
    effect.poisonDamage > 0 ||
    effect.lavaDamage > 0 ||
    effect.environmentalSlow > 0 ||
    effect.environmentalSpeed !== 1
  );
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculates hazard effects for all enemies
 * Returns a map of enemy IDs to their effects and a list of particles to spawn
 */
export function calculateHazardEffects(
  hazards: MapHazard[],
  enemies: Enemy[],
  deltaTime: number,
  getEnemyPosition: (enemy: Enemy) => Position
): HazardCalculationResult {
  const nowSeconds = Date.now() / 1000;
  const hazardData = prepareHazardData(hazards, nowSeconds);
  const effects = new Map<string, HazardEffect>();
  const particles: HazardParticle[] = [];

  for (const enemy of enemies) {
    const enemyPos = getEnemyPosition(enemy);
    let effect = createDefaultEffect();

    for (const hazard of hazardData) {
      effect = calculateSingleHazardEffect(
        hazard,
        enemyPos,
        effect,
        deltaTime,
        particles
      );
    }

    // Only store if there's an actual effect
    if (hasEffect(effect)) {
      effects.set(enemy.id, effect);
    }
  }

  return { effects, particles };
}

/**
 * Applies hazard effects to an enemy and returns the updated enemy
 * This is a pure function that doesn't modify the original enemy
 */
export function applyHazardEffect(
  enemy: Enemy,
  effect: HazardEffect,
  baseSpeed: number
): Enemy {
  let newHp = enemy.hp;
  let damageFlash = enemy.damageFlash;

  if (effect.poisonDamage > 0) {
    newHp = Math.max(0, newHp - effect.poisonDamage);
    damageFlash = 200;
  }
  if (effect.lavaDamage > 0) {
    newHp = Math.max(0, newHp - effect.lavaDamage);
    damageFlash = 200;
  }

  const newSlowEffect = Math.max(enemy.slowEffect, effect.environmentalSlow);
  const slowSource =
    effect.environmentalSlow > enemy.slowEffect && effect.environmentalSlowSource
      ? effect.environmentalSlowSource
      : enemy.slowSource;

  return {
    ...enemy,
    hp: newHp,
    damageFlash,
    slowEffect: newSlowEffect,
    slowSource,
    speed: baseSpeed * effect.environmentalSpeed,
    dead: newHp <= 0,
  };
}

// ============================================================================
// FRIENDLY UNIT HAZARD LOGIC (Troops & Heroes)
// ============================================================================

export interface FriendlyHazardResult {
  troopEffects: Map<string, HazardEffect>;
  heroEffect: HazardEffect | null;
  particles: HazardParticle[];
}

/**
 * Calculates hazard effects for friendly troops and the hero.
 * Uses the same per-hazard logic as enemies so environmental zones
 * are truly universal.
 */
export function calculateFriendlyHazardEffects(
  hazards: MapHazard[],
  troops: Troop[],
  hero: Hero | null,
  deltaTime: number,
): FriendlyHazardResult {
  const nowSeconds = Date.now() / 1000;
  const hazardData = prepareHazardData(hazards, nowSeconds);
  const troopEffects = new Map<string, HazardEffect>();
  const particles: HazardParticle[] = [];

  for (const troop of troops) {
    if (troop.dead || (troop.respawnTimer && troop.respawnTimer > 0)) continue;

    let effect = createDefaultEffect();
    for (const hazard of hazardData) {
      effect = calculateSingleHazardEffect(hazard, troop.pos, effect, deltaTime, particles);
    }
    if (hasEffect(effect)) {
      troopEffects.set(troop.id, effect);
    }
  }

  let heroEffect: HazardEffect | null = null;
  if (hero && !hero.dead && hero.respawnTimer <= 0) {
    let effect = createDefaultEffect();
    for (const hazard of hazardData) {
      effect = calculateSingleHazardEffect(hazard, hero.pos, effect, deltaTime, particles);
    }
    if (hasEffect(effect)) {
      heroEffect = effect;
    }
  }

  return { troopEffects, heroEffect, particles };
}

/**
 * Applies a hazard effect to a troop and returns the updated troop.
 * Environmental damage resets the out-of-combat heal timer.
 */
export function applyHazardEffectToTroop(
  troop: Troop,
  effect: HazardEffect,
): Troop {
  let newHp = troop.hp;

  if (effect.poisonDamage > 0) {
    newHp = Math.max(0, newHp - effect.poisonDamage);
  }
  if (effect.lavaDamage > 0) {
    newHp = Math.max(0, newHp - effect.lavaDamage);
  }

  const tookDamage = newHp < troop.hp;
  const now = Date.now();

  const updated: Troop = {
    ...troop,
    hp: newHp,
    dead: newHp <= 0 ? true : troop.dead,
    lastCombatTime: tookDamage ? now : troop.lastCombatTime,
    healFlash: tookDamage ? undefined : troop.healFlash,
  };

  if (effect.environmentalSlow > 0) {
    const currentSlow = troop.slowed && troop.slowUntil && troop.slowUntil > now
      ? (troop.slowIntensity ?? 0)
      : 0;
    if (effect.environmentalSlow > currentSlow) {
      updated.slowed = true;
      updated.slowIntensity = effect.environmentalSlow;
      updated.slowUntil = now + 500;
    }
  }

  return updated;
}

/**
 * Applies a hazard effect to the hero and returns the updated hero.
 * Environmental damage resets the out-of-combat heal timer.
 */
export function applyHazardEffectToHero(
  hero: Hero,
  effect: HazardEffect,
): Hero {
  let newHp = hero.hp;

  if (effect.poisonDamage > 0) {
    newHp = Math.max(0, newHp - effect.poisonDamage);
  }
  if (effect.lavaDamage > 0) {
    newHp = Math.max(0, newHp - effect.lavaDamage);
  }

  const tookDamage = newHp < hero.hp;
  const now = Date.now();

  const updated: Hero = {
    ...hero,
    hp: newHp,
    dead: newHp <= 0 ? true : hero.dead,
    lastCombatTime: tookDamage ? now : hero.lastCombatTime,
    healFlash: tookDamage ? undefined : hero.healFlash,
  };

  if (effect.environmentalSlow > 0) {
    const currentSlow = hero.slowed && hero.slowUntil && hero.slowUntil > now
      ? (hero.slowIntensity ?? 0)
      : 0;
    if (effect.environmentalSlow > currentSlow) {
      updated.slowed = true;
      updated.slowIntensity = effect.environmentalSlow;
      updated.slowUntil = now + 500;
    }
  }

  return updated;
}
