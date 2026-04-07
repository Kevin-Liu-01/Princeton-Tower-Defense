import { ENEMY_DATA } from "../constants";
import type { Enemy, EnemyAbilityType, EnemyCategory } from "../types";

const CATEGORY_FLAVOR: Partial<Record<EnemyCategory, string>> = {
  dark_fantasy: "necrotic",
  desert: "sand",
  forest: "vine",
  insectoid: "cocoon",
  region_boss: "necrotic",
  swamp: "mire",
  volcanic: "magma",
  winter: "frost",
};

export function getCategoryFlavor(category?: EnemyCategory): string {
  return (category && CATEGORY_FLAVOR[category]) || "default";
}

export interface AbilityEffects {
  burn?: { damage: number; duration: number };
  slow?: { intensity: number; duration: number };
  poison?: { damage: number; duration: number };
  stun?: { duration: number };
  activatedTypes: EnemyAbilityType[];
  flavor: string;
  sourceId: string;
}

export function applyEnemyAbilities(
  enemy: Enemy,
  _targetType: "troop" | "hero",
  now: number
): AbilityEffects | null {
  const eData = ENEMY_DATA[enemy.type];
  if (!eData.abilities || eData.abilities.length === 0) {
    return null;
  }

  const cooldowns = enemy.abilityCooldowns || {};
  const flavor = getCategoryFlavor(eData.category);
  const result: AbilityEffects = {
    activatedTypes: [],
    flavor,
    sourceId: enemy.id,
  };

  for (const ability of eData.abilities) {
    if (ability.type.startsWith("tower_")) {
      continue;
    }

    const abilityCooldown = ability.cooldown || 2000;
    const lastUse = cooldowns[ability.type] || 0;
    if (now - lastUse < abilityCooldown) {
      continue;
    }

    const chance = ability.chance || 0.3;
    if (Math.random() > chance) {
      continue;
    }

    switch (ability.type) {
      case "burn": {
        result.burn = {
          damage: ability.intensity || 5,
          duration: ability.duration || 3000,
        };
        break;
      }
      case "slow": {
        result.slow = {
          duration: ability.duration || 2000,
          intensity: ability.intensity || 0.3,
        };
        break;
      }
      case "poison": {
        result.poison = {
          damage: ability.intensity || 3,
          duration: ability.duration || 4000,
        };
        break;
      }
      case "stun": {
        result.stun = {
          duration: ability.duration || 1500,
        };
        break;
      }
    }

    result.activatedTypes.push(ability.type);
  }

  return result.activatedTypes.length > 0 ? result : null;
}

export function buildAbilityCooldowns(
  existing: Record<string, number> | undefined,
  activatedTypes: EnemyAbilityType[],
  now: number
): Record<string, number> {
  const cooldowns = { ...existing };
  for (const type of activatedTypes) {
    cooldowns[type] = now;
  }
  return cooldowns;
}
