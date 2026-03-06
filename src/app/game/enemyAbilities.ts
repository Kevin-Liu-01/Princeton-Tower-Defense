import type { Enemy } from "../types";
import { ENEMY_DATA } from "../constants";

export interface AbilityEffects {
  burn?: { damage: number; duration: number };
  slow?: { intensity: number; duration: number };
  poison?: { damage: number; duration: number };
  stun?: { duration: number };
}

export function applyEnemyAbilities(
  enemy: Enemy,
  _targetType: "troop" | "hero",
  now: number
): AbilityEffects | null {
  const eData = ENEMY_DATA[enemy.type];
  if (!eData.abilities || eData.abilities.length === 0) return null;

  const abilityCooldown = eData.abilities[0]?.cooldown || 2000;
  if (enemy.lastAbilityUse && now - enemy.lastAbilityUse < abilityCooldown) {
    return null;
  }

  const result: AbilityEffects = {};

  for (const ability of eData.abilities) {
    if (ability.type.startsWith("tower_")) continue;

    const chance = ability.chance || 0.3;
    if (Math.random() > chance) continue;

    switch (ability.type) {
      case "burn":
        result.burn = {
          damage: ability.intensity || 5,
          duration: ability.duration || 3000,
        };
        break;
      case "slow":
        result.slow = {
          intensity: ability.intensity || 0.3,
          duration: ability.duration || 2000,
        };
        break;
      case "poison":
        result.poison = {
          damage: ability.intensity || 3,
          duration: ability.duration || 4000,
        };
        break;
      case "stun":
        result.stun = {
          duration: ability.duration || 1500,
        };
        break;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}
