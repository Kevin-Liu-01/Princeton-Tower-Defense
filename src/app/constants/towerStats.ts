// Princeton Tower Defense - Standardized Tower Stats
// Centralized tower statistics for damage calculations and buff application

import type { TroopType } from "../types";

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
  icon: string;
  baseStats: TowerBaseStats;
  levels: {
    1: TowerLevelUpgrade;
    2: TowerLevelUpgrade;
    3: TowerLevelUpgrade;
  };
  upgrades: {
    A: TowerUpgradePath;
    B: TowerUpgradePath;
  };
}

// ============================================================================
// TOWER STATS DEFINITIONS
// ============================================================================

export const TOWER_STATS: Record<string, TowerStatsDefinition> = {
  station: {
    name: "Dinky Station",
    icon: "🚂",
    baseStats: {
      damage: 0,
      range: 0,
      attackSpeed: 0,
      spawnTroopType: "footsoldier",
      spawnInterval: 5000,
      maxTroops: 1,
      specialEffect: "Spawns soldiers to block enemies",
    },
    levels: {
      1: {
        cost: 200,
        description: "Foot Soldiers - Basic infantry units",
        overrides: { maxTroops: 1, spawnTroopType: "footsoldier" },
      },
      2: {
        cost: 150,
        description: "Armored Soldiers - Equipped with armor",
        overrides: { maxTroops: 2, spawnTroopType: "armored" },
      },
      3: {
        cost: 250,
        description: "Elite Guard - Royal warriors with halberds",
        overrides: { maxTroops: 3, spawnTroopType: "elite" },
      },
    },
    upgrades: {
      A: {
        name: "Centaur Stables",
        description: "Half-human, half-horse warriors",
        effect: "Spawns centaur troops with ranged attacks",
        stats: {
          maxTroops: 3,
          spawnTroopType: "centaur",
          spawnInterval: 4000,
        },
      },
      B: {
        name: "Royal Cavalry",
        description: "Mounted knights on warhorses",
        effect: "Spawns tanky cavalry with charge ability",
        stats: {
          maxTroops: 3,
          spawnTroopType: "cavalry",
          spawnInterval: 6000,
        },
      },
    },
  },

  cannon: {
    name: "Nassau Cannon",
    icon: "💣",
    baseStats: {
      damage: 65,
      range: 240,
      attackSpeed: 1200,
      projectileSpeed: 800,
      splashRadius: 0,
      specialEffect: "Heavy artillery against ground enemies",
    },
    levels: {
      1: {
        cost: 120,
        description: "Basic Cannon - Single shot artillery",
      },
      2: {
        cost: 120,
        description: "Improved Cannon - Larger caliber",
        multipliers: { damage: 1.5 },
      },
      3: {
        cost: 200,
        description: "Heavy Cannon - Stabilized barrel",
        multipliers: { damage: 2.2, attackSpeed: 0.75 },
      },
    },
    upgrades: {
      A: {
        name: "Gatling Gun",
        description: "Rapid-fire machine gun",
        effect: "8x attack speed, 0.4x damage per shot",
        stats: {
          damage: 65 * 2.2 * 0.4,
          range: 360, // 1.5x base range for level 4
          attackSpeed: 150,
          specialEffect: "Rapid-fire suppression",
        },
      },
      B: {
        name: "Flamethrower",
        description: "Continuous fire stream",
        effect: "Deals burn damage over time to enemies",
        stats: {
          damage: 65 * 2.2 * 0.3,
          range: 300, // Shorter range but burns
          attackSpeed: 100,
          burnDamage: 15,
          burnDuration: 3000,
          specialEffect: "Sets enemies on fire",
        },
      },
    },
  },

  library: {
    name: "Firestone Library",
    icon: "📚",
    baseStats: {
      damage: 0,
      range: 220,
      attackSpeed: 0,
      slowAmount: 0.2,
      slowDuration: 1000,
      specialEffect: "Slows enemies with ancient knowledge",
    },
    levels: {
      1: {
        cost: 150,
        description: "Basic Slowing - 20% slow field",
      },
      2: {
        cost: 100,
        description: "Enhanced Slowing - 35% slow field",
        overrides: { slowAmount: 0.35 },
      },
      3: {
        cost: 180,
        description: "Arcane Library - 40% slow + magic damage",
        overrides: { slowAmount: 0.40, damage: 30, attackSpeed: 500 },
      },
    },
    upgrades: {
      A: {
        name: "Earthquake Smasher",
        description: "Seismic waves damage and slow",
        effect: "Deals 35 AoE damage + 45% slow",
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
        name: "Blizzard",
        description: "Freezes enemies completely",
        effect: "45% slow + 25% freeze chance every 2s",
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

  lab: {
    name: "E-Quad Lab",
    icon: "⚗️",
    baseStats: {
      damage: 45,
      range: 200,
      attackSpeed: 800,
      chainTargets: 1,
      specialEffect: "Fast energy attacks with electric damage",
    },
    levels: {
      1: {
        cost: 100,
        description: "Basic Zapper - Single target lightning",
      },
      2: {
        cost: 140,
        description: "Enhanced Zapper - 1.5x damage",
        multipliers: { damage: 1.5 },
      },
      3: {
        cost: 220,
        description: "Tesla Coil - Chains to 2 targets",
        multipliers: { damage: 2 },
        overrides: { chainTargets: 2 },
      },
    },
    upgrades: {
      A: {
        name: "Focused Beam",
        description: "Concentrated laser attack",
        effect: "Continuous lock-on, damage increases over time",
        stats: {
          damage: 45 * 2 * 0.15,
          range: 320, // 1.6x base range - sniper beam
          attackSpeed: 100,
          specialEffect: "Lock-on damage ramp",
        },
      },
      B: {
        name: "Chain Lightning",
        description: "Multi-target electricity",
        effect: "Hits up to 5 targets at once",
        stats: {
          damage: 45 * 2 * 0.7,
          range: 300, // 1.5x base range
          chainTargets: 5,
          specialEffect: "Bouncing lightning",
        },
      },
    },
  },

  arch: {
    name: "Blair Arch",
    icon: "🏛️",
    baseStats: {
      damage: 28,
      range: 260,
      attackSpeed: 600,
      chainTargets: 1,
      specialEffect: "Sonic attacks hit air and ground",
    },
    levels: {
      1: {
        cost: 110,
        description: "Sound Waves - Single target sonic",
      },
      2: {
        cost: 110,
        description: "Resonance - Hits 2 targets, 1.5x damage",
        multipliers: { damage: 1.5 },
        overrides: { chainTargets: 2 },
      },
      3: {
        cost: 190,
        description: "Elite Archers - Hits 3 targets, 30% faster",
        multipliers: { damage: 2, attackSpeed: 0.7 },
        overrides: { chainTargets: 3 },
      },
    },
    upgrades: {
      A: {
        name: "Shockwave Emitter",
        description: "Powerful stunning sound waves",
        effect: "30% chance to stun enemies for 1s",
        stats: {
          damage: 28 * 2 * 1.25,
          range: 390, // 1.5x base range
          stunChance: 0.3,
          stunDuration: 1000,
          chainTargets: 3,
          specialEffect: "Stunning shockwaves",
        },
      },
      B: {
        name: "Symphony Hall",
        description: "Harmonious multi-target",
        effect: "Hits up to 5 enemies simultaneously",
        stats: {
          damage: 28 * 2 * 1.125,
          range: 416, // 1.6x base range - concert hall coverage
          chainTargets: 5,
          specialEffect: "Multi-target harmony",
        },
      },
    },
  },

  club: {
    name: "Eating Club",
    icon: "🏦",
    baseStats: {
      damage: 0,
      range: 0,
      attackSpeed: 0,
      income: 8,
      incomeInterval: 8000,
      specialEffect: "Generates Paw Points over time",
    },
    levels: {
      1: {
        cost: 150,
        description: "Basic Club - 8 PP per 8 seconds",
      },
      2: {
        cost: 180,
        description: "Popular Club - 15 PP per 7 seconds",
        overrides: { income: 15, incomeInterval: 7000 },
      },
      3: {
        cost: 280,
        description: "Grand Club - 25 PP per 6 seconds",
        overrides: {
          income: 25,
          incomeInterval: 6000,
        },
      },
    },
    upgrades: {
      A: {
        name: "Investment Bank",
        description: "Maximum passive income",
        effect: "40 PP every 5s + 10% bonus income + 15% range aura",
        stats: {
          income: 40,
          incomeInterval: 5000,
          bonusIncomeMultiplier: 0.1,
          rangeBuff: 0.15,
          range: 200,
          specialEffect: "Global income boost + range aura",
        },
      },
      B: {
        name: "Recruitment Center",
        description: "Income + tower support",
        effect: "20 PP every 6s + 15% damage buff to nearby towers",
        stats: {
          income: 20,
          incomeInterval: 6000,
          damageBuff: 0.15,
          range: 200,
          specialEffect: "Damage aura",
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
        stats.attackSpeed = towerDef.baseStats.attackSpeed * levelData.multipliers.attackSpeed;
      }
      if (levelData.multipliers.splashRadius !== undefined) {
        stats.splashRadius = (towerDef.baseStats.splashRadius || 0) * levelData.multipliers.splashRadius;
      }
      if (levelData.multipliers.chainTargets !== undefined) {
        stats.chainTargets = (towerDef.baseStats.chainTargets || 1) * levelData.multipliers.chainTargets;
      }
      if (levelData.multipliers.income !== undefined) {
        stats.income = (towerDef.baseStats.income || 0) * levelData.multipliers.income;
      }
      if (levelData.multipliers.slowAmount !== undefined) {
        stats.slowAmount = (towerDef.baseStats.slowAmount || 0) * levelData.multipliers.slowAmount;
      }
      if (levelData.multipliers.maxTroops !== undefined) {
        stats.maxTroops = (towerDef.baseStats.maxTroops || 1) * levelData.multipliers.maxTroops;
      }
    }
    
    if (levelData.overrides) {
      stats = { ...stats, ...levelData.overrides };
    }
  }

  // Apply level-based range bonuses (these are standard across all towers)
  if (level === 2) {
    stats.range = towerDef.baseStats.range * 1.15;
  }
  if (level === 3) {
    stats.range = towerDef.baseStats.range * 1.25;
  }

  // Apply upgrade path stats if at level 4 (upgrade selected)
  if (level >= 4 && upgrade) {
    const upgradePath = towerDef.upgrades[upgrade];
    if (upgradePath) {
      // Level 4 upgrade stats override everything
      stats = { ...stats, ...upgradePath.stats };
    }
    // If no specific range in upgrade path, use 1.5x base range
    if (upgradePath && upgradePath.stats?.range === undefined) {
      stats.range = towerDef.baseStats.range * 1.5;
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
  upgrade?: "A" | "B"
): number {
  const towerDef = TOWER_STATS[towerType];
  if (!towerDef) return 0;

  if (currentLevel < 3) {
    const nextLevel = (currentLevel + 1) as 1 | 2 | 3;
    return towerDef.levels[nextLevel]?.cost || 0;
  }

  // Level 4 upgrade cost would be defined elsewhere or as a constant
  return 400; // Default level 4 upgrade cost
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
  if (!towerDef) return "";

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
  if (!towerDef) return null;

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
  if (!towerDef) return 0;

  let range = towerDef.baseStats.range;

  // Apply level range bonuses
  if (level === 2) range *= 1.15;
  if (level === 3) {
    if (towerType === "library" && upgrade === "B") range *= 1.5;
    else range *= 1.25;
  }

  // Level 4 uses the range from upgrade paths if specified
  if (level >= 4 && upgrade) {
    const upgradePath = towerDef.upgrades[upgrade];
    if (upgradePath?.stats?.range !== undefined) {
      range = upgradePath.stats.range;
    } else {
      // Fallback: 1.5x base range if no specific range defined
      range = towerDef.baseStats.range * 1.5;
    }
  }

  // Apply external range buff
  return range * rangeBoost;
}
