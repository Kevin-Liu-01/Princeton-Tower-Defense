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

export interface HazardData extends MapHazard {
  worldPos: Position;
  radius: number;
}

export interface HazardCalculationResult {
  effects: Map<string, HazardEffect>;
  particles: HazardParticle[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Pre-calculates hazard world positions and radii
 */
export function prepareHazardData(hazards: MapHazard[]): HazardData[] {
  return hazards.map((hazard) => ({
    ...hazard,
    worldPos: gridToWorld(hazard.pos!),
    radius: (hazard.radius || 2) * TILE_SIZE,
  }));
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
    case "lava_geyser":
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
  const hazardData = prepareHazardData(hazards);
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
