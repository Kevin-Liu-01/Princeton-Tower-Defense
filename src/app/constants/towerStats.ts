// Princeton Tower Defense - Standardized Tower Stats
// Centralized tower statistics for damage calculations and buff application

import type { TroopType } from "../types";
import {
  LEVEL_2_RANGE_MULT,
  LEVEL_3_RANGE_MULT,
  LEVEL_4_RANGE_MULT,
} from "./combatConstants";

// ============================================================================
// TOWER STATS INTERFACES
// ============================================================================

export interface TowerBaseStats {
  damage: number;
  range: number;
  attackSpeed: number; // Milliseconds between attacks
  projectileSpeed?: number;
  splashRadius?: number;
  stunChance?: number;
  stunDuration?: number;
  slowAmount?: number; // Percentage 0-1
  slowDuration?: number;
  burnDamage?: number;
  burnDuration?: number;
  chainTargets?: number;
  chainRange?: number; // Max distance per chain hop
  crescendoMaxStacks?: number;
  crescendoSpeedMult?: number; // Per-stack cooldown multiplier (e.g. 0.92 = 8% faster)
  crescendoDamageMult?: number; // Per-stack additive damage bonus (e.g. 0.05 = +5%)
  crescendoDecayTime?: number; // Ms before stacks reset when idle
  lockOnMaxStacks?: number;
  lockOnDamageMult?: number; // Per-stack additive damage multiplier (e.g. 0.15 = +15% per stack)
  lockOnDecayTime?: number; // Ms before stacks reset when target changes or idle
  income?: number; // For economy towers
  incomeInterval?: number;
  bonusIncomeMultiplier?: number;
  damageBuff?: number; // For support towers
  rangeBuff?: number; // For support towers
  spawnTroopType?: TroopType;
  spawnInterval?: number;
  maxTroops?: number;
  specialEffect?: string;
}

export interface TowerLevelUpgrade {
  cost: number;
  description: string;
  multipliers?: {
    damage?: number;
    range?: number;
    attackSpeed?: number;
    splashRadius?: number;
    chainTargets?: number;
    income?: number;
    slowAmount?: number;
    maxTroops?: number;
  };
  overrides?: Partial<TowerBaseStats>;
}

export interface TowerUpgradePath {
  name: string;
  description: string;
  effect: string;
  stats: Partial<TowerBaseStats>;
}

export interface TowerStatsDefinition {
  name: string;
  baseStats: TowerBaseStats;
  levels: {
    1: TowerLevelUpgrade;
    2: TowerLevelUpgrade;
    3: TowerLevelUpgrade;
  };
  level4Cost: number; // Cost to upgrade to level 4
  upgrades: {
    A: TowerUpgradePath;
    B: TowerUpgradePath;
  };
}

// ============================================================================
// TOWER STATS DEFINITIONS
// ============================================================================

export const TOWER_STATS: Record<string, TowerStatsDefinition> = {
  arch: {
    baseStats: {
      attackSpeed: 700,
      crescendoDamageMult: 0.05,
      crescendoDecayTime: 2500,
      crescendoMaxStacks: 4,
      crescendoSpeedMult: 0.92,
      damage: 22,
      range: 250,
      specialEffect: "Sonic crescendo - accelerates with consecutive attacks",
    },
    level4Cost: 500,
    levels: {
      1: {
        cost: 110,
        description: "Crescendo - Builds attack speed over time",
      },
      2: {
        cost: 135,
        description: "Resonance - Max 6 stacks, 1.4x damage",
        multipliers: { damage: 1.4 },
        overrides: { crescendoMaxStacks: 6 },
      },
      3: {
        cost: 225,
        description: "Forte - Max 8 stacks, 1.8x damage",
        multipliers: { damage: 1.8 },
        overrides: { crescendoMaxStacks: 8 },
      },
    },
    name: "Blair Arch",
    upgrades: {
      A: {
        description: "Stunning crescendo attacks",
        effect: "35% stun chance, max 8 crescendo stacks",
        name: "Shockwave Siren",
        stats: {
          crescendoDamageMult: 0.05,
          crescendoDecayTime: 2500,
          crescendoMaxStacks: 8,
          crescendoSpeedMult: 0.92,
          damage: 22 * 1.8 * 1.25,
          range: 350,
          specialEffect: "Stunning crescendo",
          stunChance: 0.35,
          stunDuration: 1200,
        },
      },
      B: {
        description: "Ultimate sonic crescendo",
        effect: "Max 12 stacks with enhanced per-stack bonus",
        name: "Symphony Hall",
        stats: {
          crescendoDamageMult: 0.07,
          crescendoDecayTime: 3000,
          crescendoMaxStacks: 12,
          crescendoSpeedMult: 0.9,
          damage: 22 * 1.8 * 1.1,
          range: 370,
          specialEffect: "Ultimate crescendo",
        },
      },
    },
  },

  cannon: {
    baseStats: {
      attackSpeed: 1200,
      damage: 50,
      projectileSpeed: 800,
      range: 240,
      specialEffect: "Heavy artillery against ground enemies",
      splashRadius: 0,
    },
    level4Cost: 400,
    levels: {
      1: {
        cost: 120,
        description: "Basic Cannon - Single shot artillery",
      },
      2: {
        cost: 140,
        description: "Improved Cannon - Larger caliber",
        multipliers: { damage: 1.5 },
      },
      3: {
        cost: 220,
        description: "Heavy Cannon - Stabilized barrel",
        multipliers: { attackSpeed: 0.75, damage: 2.2 },
      },
    },
    name: "Nassau Cannon",
    upgrades: {
      A: {
        description: "Rapid-fire machine gun",
        effect: "8x attack speed, 0.4x damage per shot",
        name: "Gatling Gun",
        stats: {
          damage: 50 * 2.2 * 0.4,
          range: 360, // 1.5x base range for level 4
          attackSpeed: 150,
          specialEffect: "Rapid-fire suppression",
        },
      },
      B: {
        description: "Continuous fire stream",
        effect: "Deals burn damage over time to enemies",
        name: "Flamethrower",
        stats: {
          damage: 50 * 2.2 * 0.3,
          range: 300, // Shorter range but burns
          attackSpeed: 100,
          burnDamage: 15,
          burnDuration: 3000,
          specialEffect: "Sets enemies on fire",
        },
      },
    },
  },

  club: {
    baseStats: {
      attackSpeed: 0,
      damage: 0,
      income: 8,
      incomeInterval: 8000,
      range: 0,
      specialEffect: "Generates Paw Points over time",
    },
    level4Cost: 550,
    levels: {
      1: {
        cost: 150,
        description: "Basic Club - 8 PP per 8 seconds",
      },
      2: {
        cost: 200,
        description: "Popular Club - 12 PP per 7 seconds",
        overrides: { income: 12, incomeInterval: 7000 },
      },
      3: {
        cost: 325,
        description: "Grand Club - 20 PP per 6 seconds",
        overrides: {
          income: 20,
          incomeInterval: 6000,
        },
      },
    },
    name: "Eating Club",
    upgrades: {
      A: {
        description: "Maximum passive income",
        effect: "40 PP every 5s + 10% bonus income + 15% range aura",
        name: "Investment Bank",
        stats: {
          bonusIncomeMultiplier: 0.1,
          income: 40,
          incomeInterval: 5000,
          range: 200,
          rangeBuff: 0.15,
          specialEffect: "Global income boost + range aura",
        },
      },
      B: {
        description: "Income + tower support",
        effect: "20 PP every 6s + 15% damage buff to nearby towers",
        name: "Recruitment Center",
        stats: {
          damageBuff: 0.15,
          income: 20,
          incomeInterval: 6000,
          range: 200,
          specialEffect: "Damage aura",
        },
      },
    },
  },

  lab: {
    baseStats: {
      attackSpeed: 800,
      chainRange: 150,
      chainTargets: 3,
      damage: 35,
      range: 200,
      specialEffect: "Chain lightning bouncing between enemies",
    },
    level4Cost: 450,
    levels: {
      1: {
        cost: 100,
        description: "Tesla Zapper - Chains to 3 enemies",
      },
      2: {
        cost: 150,
        description: "Enhanced Zapper - Chains to 4 enemies, 1.5x damage",
        multipliers: { damage: 1.5 },
        overrides: { chainTargets: 4 },
      },
      3: {
        cost: 250,
        description: "Tesla Coil - Chains to 5 enemies, 2x damage",
        multipliers: { damage: 2 },
        overrides: { chainTargets: 5 },
      },
    },
    name: "E-Quad Lab",
    upgrades: {
      A: {
        description: "Concentrated laser attack",
        effect: "Continuous lock-on, damage increases over time",
        name: "Focused Beam",
        stats: {
          attackSpeed: 100,
          chainTargets: 1,
          damage: 35 * 2 * 1.3 * 0.15,
          lockOnDamageMult: 0.045,
          lockOnDecayTime: 600,
          lockOnMaxStacks: 120,
          range: 320,
          specialEffect: "Lock-on damage ramp",
        },
      },
      B: {
        description: "Multi-target electricity",
        effect: "Chains to up to 8 enemies",
        name: "Chain Lightning",
        stats: {
          chainRange: 180,
          chainTargets: 8,
          damage: 35 * 2 * 1.3 * 0.7,
          range: 300,
          specialEffect: "Bouncing lightning",
        },
      },
    },
  },

  library: {
    baseStats: {
      attackSpeed: 0,
      damage: 0,
      range: 220,
      slowAmount: 0.2,
      slowDuration: 1000,
      specialEffect: "Slows enemies with ancient knowledge",
    },
    level4Cost: 600,
    levels: {
      1: {
        cost: 150,
        description: "Basic Slowing - 20% slow field",
      },
      2: {
        cost: 175,
        description: "Enhanced Slowing - 30% slow field",
        overrides: { slowAmount: 0.3 },
      },
      3: {
        cost: 275,
        description: "Arcane Library - 40% slow + magic damage",
        overrides: { attackSpeed: 500, damage: 30, slowAmount: 0.4 },
      },
    },
    name: "Firestone Library",
    upgrades: {
      A: {
        description: "Seismic waves damage and slow",
        effect: "Deals 35 AoE damage + 45% slow",
        name: "EQ Smasher",
        stats: {
          damage: 35,
          range: 330, // 1.5x base range for level 4
          slowAmount: 0.45,
          attackSpeed: 500,
          splashRadius: 80,
          specialEffect: "Ground-shaking AoE attacks",
        },
      },
      B: {
        description: "Freezes enemies completely",
        effect: "45% slow + 25% freeze chance every 2s",
        name: "Blizzard",
        stats: {
          range: 385, // 1.75x base range - wide freeze area
          slowAmount: 0.45,
          attackSpeed: 1000,
          stunDuration: 2000,
          stunChance: 0.25, // 25% chance every 2 seconds
          specialEffect: "Freezes enemies solid",
        },
      },
    },
  },

  mortar: {
    baseStats: {
      attackSpeed: 3000,
      damage: 48,
      projectileSpeed: 400,
      range: 300,
      specialEffect: "Launches explosive shells in high arcs",
      splashRadius: 100,
    },
    level4Cost: 500,
    levels: {
      1: {
        cost: 160,
        description: "Basic Mortar - Lobbed explosives with splash",
      },
      2: {
        cost: 200,
        description: "Improved Mortar - Bigger payload, wider splash",
        multipliers: { damage: 1.5, splashRadius: 1.3 },
      },
      3: {
        cost: 300,
        description: "Siege Mortar - Heavy ordnance, massive AoE",
        multipliers: { damage: 2, splashRadius: 1.6 },
      },
    },
    name: "Palmer Mortar",
    upgrades: {
      A: {
        description: "Targeted missile strikes on selected area",
        effect: "Click to target area for devastating missile barrages",
        name: "Missile Battery",
        stats: {
          attackSpeed: 4000,
          damage: 48 * 2 * 1.5,
          range: 400,
          specialEffect: "Targeted missile strike on selected area",
          splashRadius: 150,
        },
      },
      B: {
        description: "Rains burning embers across the field",
        effect: "Scatters burning ember piles that deal DoT",
        name: "Ember Foundry",
        stats: {
          attackSpeed: 2500,
          burnDamage: 25,
          burnDuration: 4000,
          damage: 48 * 2 * 0.4,
          range: 350,
          specialEffect: "Creates burning ember fields",
          splashRadius: 170,
        },
      },
    },
  },
  station: {
    baseStats: {
      attackSpeed: 0,
      damage: 0,
      maxTroops: 1,
      range: 0,
      spawnInterval: 5000,
      spawnTroopType: "footsoldier",
      specialEffect: "Spawns soldiers to block enemies",
    },
    level4Cost: 500,
    levels: {
      1: {
        cost: 200,
        description: "Foot Soldiers - Basic infantry units",
        overrides: { maxTroops: 1, spawnTroopType: "footsoldier" },
      },
      2: {
        cost: 250,
        description: "Armored Soldiers - Equipped with armor",
        overrides: { maxTroops: 2, spawnTroopType: "armored" },
      },
      3: {
        cost: 350,
        description: "Elite Guard - Royal warriors with halberds",
        overrides: { maxTroops: 3, spawnTroopType: "elite" },
      },
    },
    name: "Dinky Station",
    upgrades: {
      A: {
        description: "Half-human, half-horse warriors",
        effect: "Spawns centaur troops with ranged attacks",
        name: "Centaur Stables",
        stats: {
          maxTroops: 3,
          spawnInterval: 4000,
          spawnTroopType: "centaur",
        },
      },
      B: {
        description: "Mounted knights on warhorses",
        effect: "Spawns tanky cavalry with charge ability",
        name: "Royal Cavalry",
        stats: {
          maxTroops: 3,
          spawnInterval: 6000,
          spawnTroopType: "cavalry",
        },
      },
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate the effective stats for a tower at a given level and upgrade path
 */
export function calculateTowerStats(
  towerType: string,
  level: number,
  upgrade?: "A" | "B",
  rangeBoost: number = 1,
  damageBoost: number = 1
): TowerBaseStats {
  const towerDef = TOWER_STATS[towerType];
  if (!towerDef) {
    throw new Error(`Unknown tower type: ${towerType}`);
  }

  // Start with base stats
  let stats = { ...towerDef.baseStats };

  // Apply level multipliers and overrides for levels 1-3
  for (let l = 1; l <= Math.min(level, 3); l++) {
    const levelData = towerDef.levels[l as 1 | 2 | 3];

    if (levelData.multipliers) {
      if (levelData.multipliers.damage !== undefined) {
        stats.damage = towerDef.baseStats.damage * levelData.multipliers.damage;
      }
      if (levelData.multipliers.range !== undefined) {
        stats.range = towerDef.baseStats.range * levelData.multipliers.range;
      }
      if (levelData.multipliers.attackSpeed !== undefined) {
        stats.attackSpeed =
          towerDef.baseStats.attackSpeed * levelData.multipliers.attackSpeed;
      }
      if (levelData.multipliers.splashRadius !== undefined) {
        stats.splashRadius =
          (towerDef.baseStats.splashRadius || 0) *
          levelData.multipliers.splashRadius;
      }
      if (levelData.multipliers.chainTargets !== undefined) {
        stats.chainTargets =
          (towerDef.baseStats.chainTargets || 1) *
          levelData.multipliers.chainTargets;
      }
      if (levelData.multipliers.income !== undefined) {
        stats.income =
          (towerDef.baseStats.income || 0) * levelData.multipliers.income;
      }
      if (levelData.multipliers.slowAmount !== undefined) {
        stats.slowAmount =
          (towerDef.baseStats.slowAmount || 0) *
          levelData.multipliers.slowAmount;
      }
      if (levelData.multipliers.maxTroops !== undefined) {
        stats.maxTroops =
          (towerDef.baseStats.maxTroops || 1) * levelData.multipliers.maxTroops;
      }
    }

    if (levelData.overrides) {
      stats = { ...stats, ...levelData.overrides };
    }
  }

  // Apply level-based range bonuses (standard across all towers)
  if (level === 2) {
    stats.range = towerDef.baseStats.range * LEVEL_2_RANGE_MULT;
  }
  if (level === 3) {
    stats.range = towerDef.baseStats.range * LEVEL_3_RANGE_MULT;
  }

  // Apply upgrade path stats if at level 4 (upgrade selected)
  if (level >= 4 && upgrade) {
    const upgradePath = towerDef.upgrades[upgrade];
    if (upgradePath) {
      stats = { ...stats, ...upgradePath.stats };
    }
    if (upgradePath && upgradePath.stats?.range === undefined) {
      stats.range = towerDef.baseStats.range * LEVEL_4_RANGE_MULT;
    }
  }

  // Apply external buffs
  stats.range *= rangeBoost;
  stats.damage *= damageBoost;

  return stats;
}

/**
 * Get the cost to upgrade a tower to the next level
 */
export function getUpgradeCost(
  towerType: string,
  currentLevel: number,
  _upgrade?: "A" | "B"
): number {
  const towerDef = TOWER_STATS[towerType];
  if (!towerDef) {
    return 0;
  }

  if (currentLevel < 3) {
    const nextLevel = (currentLevel + 1) as 1 | 2 | 3;
    return towerDef.levels[nextLevel]?.cost || 0;
  }

  // Level 4 upgrade cost from tower definition
  return towerDef.level4Cost;
}

/**
 * Get the level 4 upgrade cost for a specific tower type
 */
export function getLevel4Cost(towerType: string): number {
  const towerDef = TOWER_STATS[towerType];
  if (!towerDef) {
    return 400;
  } // Default fallback
  return towerDef.level4Cost;
}

/**
 * Get the description for a tower at a given level
 */
export function getLevelDescription(
  towerType: string,
  level: number,
  upgrade?: "A" | "B"
): string {
  const towerDef = TOWER_STATS[towerType];
  if (!towerDef) {
    return "";
  }

  if (level <= 3) {
    return towerDef.levels[level as 1 | 2 | 3]?.description || "";
  }

  if (upgrade) {
    return towerDef.upgrades[upgrade]?.description || "";
  }

  return "";
}

/**
 * Get upgrade path information
 */
export function getUpgradePath(
  towerType: string,
  path: "A" | "B"
): TowerUpgradePath | null {
  const towerDef = TOWER_STATS[towerType];
  if (!towerDef) {
    return null;
  }

  return towerDef.upgrades[path] || null;
}

/**
 * Get the effective range for a tower at a given level and upgrade path
 */
export function getTowerRange(
  towerType: string,
  level: number,
  upgrade?: "A" | "B",
  rangeBoost: number = 1
): number {
  const towerDef = TOWER_STATS[towerType];
  if (!towerDef) {
    return 0;
  }

  let { range } = towerDef.baseStats;

  // Apply level range bonuses
  if (level === 2) {
    range *= 1.15;
  }
  if (level === 3) {
    if (towerType === "library" && upgrade === "B") {
      range *= 1.5;
    } else {
      range *= 1.25;
    }
  }

  // Level 4 uses the range from upgrade paths if specified
  if (level >= 4 && upgrade) {
    const upgradePath = towerDef.upgrades[upgrade];
    if (upgradePath?.stats?.range !== undefined) {
      ({ range } = upgradePath.stats);
    } else {
      // Fallback: 1.5x base range if no specific range defined
      range = towerDef.baseStats.range * 1.5;
    }
  }

  // Apply external range buff
  return range * rangeBoost;
}
