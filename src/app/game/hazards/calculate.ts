import type { Enemy, Hero, MapHazard, Position, Troop } from "../../types";
import { distance } from "../../utils";
import { prepareHazardData } from "./prepare";
import type {
  FriendlyHazardResult,
  HazardCalculationResult,
  HazardData,
  HazardEffect,
  HazardParticle,
} from "./types";

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

function hasEffect(effect: HazardEffect): boolean {
  return (
    effect.poisonDamage > 0 ||
    effect.lavaDamage > 0 ||
    effect.environmentalSlow > 0 ||
    effect.environmentalSpeed !== 1
  );
}

function calculateSingleHazardEffect(
  hazard: HazardData,
  unitPos: Position,
  currentEffect: HazardEffect,
  deltaTime: number,
  particles: HazardParticle[],
): HazardEffect {
  const dist = distance(unitPos, hazard.worldPos);
  if (dist >= hazard.radius) {
    return currentEffect;
  }

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
        particles.push({ pos: unitPos, type: "storm", count: 5 });
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
      if (!hazard.iceSpikeCycle || hazard.iceSpikeCycle.extend < 0.2) {
        break;
      }

      const intensity = Math.min(
        1,
        Math.max(0, (hazard.iceSpikeCycle.extend - 0.2) / 0.8),
      );
      {
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
      }
      break;
    case "lava_geyser":
    case "eruption_zone":
      if (Math.random() < 0.095) {
        effect.lavaDamage += 5;
        effect.fireParticlePos = unitPos;
      }
      break;
    case "volcano":
      if (Math.random() < 0.055) {
        effect.lavaDamage += 15;
        effect.fireParticlePos = unitPos;
        particles.push({ pos: unitPos, type: "fire", count: 8 });
      }
      break;
    case "lava":
      if (Math.random() < 0.08) {
        effect.lavaDamage += 4;
        effect.fireParticlePos = unitPos;
      }
      break;
    case "swamp":
      effect.poisonDamage += (6 * deltaTime) / 1000;
      if (effect.environmentalSlow < 0.35) {
        effect.environmentalSlow = 0.35;
        effect.environmentalSlowSource = "quicksand";
      }
      break;
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
        effect.fireParticlePos = unitPos;
      }
      break;
    case "lightning":
      if (Math.random() < 0.06) {
        effect.lavaDamage += 18;
        particles.push({ pos: unitPos, type: "storm", count: 4 });
      }
      break;
    case "void":
      effect.poisonDamage += (8 * deltaTime) / 1000;
      if (effect.environmentalSlow < 0.3) {
        effect.environmentalSlow = 0.3;
        effect.environmentalSlowSource = "unknown";
      }
      break;
  }

  return effect;
}

function calculateUnitEffect(
  hazards: HazardData[],
  unitPos: Position,
  deltaTime: number,
  particles: HazardParticle[],
): HazardEffect {
  let effect = createDefaultEffect();
  for (const hazard of hazards) {
    effect = calculateSingleHazardEffect(
      hazard,
      unitPos,
      effect,
      deltaTime,
      particles,
    );
  }
  return effect;
}

export function calculateHazardEffects(
  hazards: MapHazard[],
  enemies: Enemy[],
  deltaTime: number,
  getEnemyPosition: (enemy: Enemy) => Position,
): HazardCalculationResult {
  const nowSeconds = Date.now() / 1000;
  const hazardData = prepareHazardData(hazards, nowSeconds);
  const effects = new Map<string, HazardEffect>();
  const particles: HazardParticle[] = [];

  for (const enemy of enemies) {
    const effect = calculateUnitEffect(
      hazardData,
      getEnemyPosition(enemy),
      deltaTime,
      particles,
    );
    if (hasEffect(effect)) {
      effects.set(enemy.id, effect);
    }
  }

  return { effects, particles };
}

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
    if (troop.dead || (troop.respawnTimer && troop.respawnTimer > 0)) {
      continue;
    }
    const effect = calculateUnitEffect(
      hazardData,
      troop.pos,
      deltaTime,
      particles,
    );
    if (hasEffect(effect)) {
      troopEffects.set(troop.id, effect);
    }
  }

  let heroEffect: HazardEffect | null = null;
  if (hero && !hero.dead && hero.respawnTimer <= 0) {
    const effect = calculateUnitEffect(
      hazardData,
      hero.pos,
      deltaTime,
      particles,
    );
    if (hasEffect(effect)) {
      heroEffect = effect;
    }
  }

  return { troopEffects, heroEffect, particles };
}
