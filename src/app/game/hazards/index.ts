// Princeton Tower Defense - Hazard Game Logic Module
// Handles calculation of hazard effects on enemies

import type { Position, Enemy, MapHazard, Particle } from "../../types";
import { gridToWorld, distance } from "../../utils";
import { TILE_SIZE } from "../../constants";

// ============================================================================
// TYPES
// ============================================================================

export interface HazardEffect {
  poisonDamage: number;
  lavaDamage: number;
  environmentalSlow: number;
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
      // Throttle particle spawns
      if (Math.random() < 0.1) {
        particles.push({ pos: hazard.worldPos, type: "magic", count: 3 });
      }
      break;
    case "quicksand":
      effect.environmentalSlow = Math.max(effect.environmentalSlow, 0.5);
      if (Math.random() < 0.1) {
        particles.push({ pos: hazard.worldPos, type: "smoke", count: 3 });
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
      effect.environmentalSlow = Math.max(effect.environmentalSlow, 0.12 + intensity * 0.33);

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

  return {
    ...enemy,
    hp: newHp,
    damageFlash,
    slowEffect: Math.max(enemy.slowEffect, effect.environmentalSlow),
    speed: baseSpeed * effect.environmentalSpeed,
    dead: newHp <= 0,
  };
}
