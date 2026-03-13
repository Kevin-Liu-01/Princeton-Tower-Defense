import type { TowerType } from "../types";
import { TOWER_STATS } from "./towerStats";

// Tower data with 4-level progression: Level 1 -> 2 -> 3 (base upgrade) -> 4A/4B (branch)
export const TOWER_DATA: Record<
  TowerType,
  {
    name: string;
    cost: number;
    damage: number;
    range: number;
    attackSpeed: number;
    desc: string;
    spawnRange?: number;
    upgrades: {
      A: { name: string; desc: string; effect: string; range?: number };
      B: { name: string; desc: string; effect: string; range?: number };
    };
    levelDesc: { [key: number]: string };
  }
> = {
  station: {
    name: TOWER_STATS.station.name,

    cost: TOWER_STATS.station.levels[1].cost,
    damage: TOWER_STATS.station.baseStats.damage,
    range: TOWER_STATS.station.baseStats.range,
    attackSpeed: TOWER_STATS.station.baseStats.attackSpeed,
    desc: "Spawns soldiers to block enemies.",
    spawnRange: 280, // Increased base range for better troop movement
    levelDesc: {
      1: "Foot Soldiers - Basic infantry units",
      2: "Armored Soldiers - Equipped with armor",
      3: "Elite Guard - Royal warriors with halberds",
      4: "Choose: Centaur Stables or Royal Cavalry",
    },
    upgrades: {
      A: {
        name: "Centaur Stables",
        desc: "Half-human, half-horse warriors",
        effect: "Spawns centaur troops with ranged attacks",
      },
      B: {
        name: "Royal Cavalry",
        desc: "Mounted knights on warhorses",
        effect: "Spawns tanky cavalry with charge ability",
      },
    },
  },
  cannon: {
    name: TOWER_STATS.cannon.name,

    cost: TOWER_STATS.cannon.levels[1].cost,
    damage: TOWER_STATS.cannon.baseStats.damage,
    range: TOWER_STATS.cannon.baseStats.range,
    attackSpeed: TOWER_STATS.cannon.baseStats.attackSpeed,
    desc: "Heavy artillery against ground enemies.",
    levelDesc: {
      1: "Basic Cannon - Single shot artillery",
      2: "Improved Cannon - Larger caliber (1.5x damage)",
      3: "Heavy Cannon - Stabilized barrel (2.2x damage)",
      4: "Choose: Gatling Gun or Flamethrower",
    },
    upgrades: {
      A: {
        name: "Gatling Gun",
        desc: "Rapid-fire machine gun",
        effect: "8x attack speed, 0.4x damage per shot",
        range: 360,
      },
      B: {
        name: "Flamethrower",
        desc: "Continuous fire stream",
        effect: "Deals burn damage over time to enemies",
        range: 300,
      },
    },
  },
  library: {
    name: TOWER_STATS.library.name,

    cost: TOWER_STATS.library.levels[1].cost,
    damage: TOWER_STATS.library.baseStats.damage,
    range: TOWER_STATS.library.baseStats.range,
    attackSpeed: TOWER_STATS.library.baseStats.attackSpeed,
    desc: "Slows enemies with ancient knowledge.",
    levelDesc: {
      1: TOWER_STATS.library.levels[1].description,
      2: TOWER_STATS.library.levels[2].description,
      3: TOWER_STATS.library.levels[3].description,
      4: "Choose: Earthquake or Blizzard",
    },
    upgrades: {
      A: {
        name: "EQ Smasher",
        desc: "Seismic waves damage and slow",
        effect: "Deals 35 AoE damage + 50% slow",
        range: 330,
      },
      B: {
        name: "Blizzard",
        desc: "Freezes enemies completely",
        effect: "50% slow + 25% freeze chance/2s",
        range: 385,
      },
    },
  },
  lab: {
    name: TOWER_STATS.lab.name,

    cost: TOWER_STATS.lab.levels[1].cost,
    damage: TOWER_STATS.lab.baseStats.damage,
    range: TOWER_STATS.lab.baseStats.range,
    attackSpeed: TOWER_STATS.lab.baseStats.attackSpeed,
    desc: "Chain lightning bouncing between enemies.",
    levelDesc: {
      1: "Tesla Zapper - Chains to 3 enemies",
      2: "Enhanced Zapper - Chains to 4 enemies",
      3: "Tesla Coil - Chains to 5 enemies",
      4: "Choose: Focused Beam or Chain Lightning",
    },
    upgrades: {
      A: {
        name: "Focused Beam",
        desc: "Concentrated laser attack",
        effect: "Continuous lock-on, damage increases over time",
        range: 320,
      },
      B: {
        name: "Chain Lightning",
        desc: "Multi-target electricity",
        effect: "Chains to up to 8 enemies",
        range: 300,
      },
    },
  },
  arch: {
    name: TOWER_STATS.arch.name,

    cost: TOWER_STATS.arch.levels[1].cost,
    damage: TOWER_STATS.arch.baseStats.damage,
    range: TOWER_STATS.arch.baseStats.range,
    attackSpeed: TOWER_STATS.arch.baseStats.attackSpeed,
    desc: "Sonic crescendo that accelerates with consecutive attacks.",
    levelDesc: {
      1: "Crescendo - Builds up to 4 stacks",
      2: "Resonance - Max 6 stacks, 1.4x damage",
      3: "Forte - Max 8 stacks, 1.8x damage",
      4: "Choose: Shockwave or Symphony",
    },
    upgrades: {
      A: {
        name: "Shockwave Siren",
        desc: "Stunning crescendo attacks",
        effect: "35% stun chance, max 8 crescendo stacks",
        range: 350,
      },
      B: {
        name: "Symphony Hall",
        desc: "Ultimate sonic crescendo",
        effect: "Max 12 stacks with enhanced per-stack bonus",
        range: 370,
      },
    },
  },
  club: {
    name: TOWER_STATS.club.name,

    cost: TOWER_STATS.club.levels[1].cost,
    damage: TOWER_STATS.club.baseStats.damage,
    range: TOWER_STATS.club.baseStats.range,
    attackSpeed: TOWER_STATS.club.baseStats.attackSpeed,
    desc: "Generates Paw Points over time.",
    levelDesc: {
      1: "Basic Club - 8 PP per 8 seconds",
      2: "Popular Club - 15 PP per 7 seconds + bonus on kills nearby",
      3: "Grand Club - 25 PP per 6 seconds + slow enemies in range",
      4: "Choose: Investment Bank or Recruitment Center",
    },
    upgrades: {
      A: {
        name: "Investment Bank",
        desc: "Maximum passive income",
        effect: "40 PP every 5s + 15% range buff to nearby towers",
      },
      B: {
        name: "Recruitment Center",
        desc: "Income + tower support",
        effect: "20 PP every 6s + 15% damage buff to nearby towers",
      },
    },
  },
  mortar: {
    name: TOWER_STATS.mortar.name,

    cost: TOWER_STATS.mortar.levels[1].cost,
    damage: TOWER_STATS.mortar.baseStats.damage,
    range: TOWER_STATS.mortar.baseStats.range,
    attackSpeed: TOWER_STATS.mortar.baseStats.attackSpeed,
    desc: "Fortified artillery emplacement with quadpod-mounted barrel.",
    levelDesc: {
      1: "Field Mortar - Quadpod barrel with iron sights",
      2: "Siege Mortar - Propellant injectors, periscope optic, shell feeder",
      3: "Grand Mortar - Digital rangefinder, scaffolding, elevation screw",
      4: "Choose: Missile Battery or Ember Foundry",
    },
    upgrades: {
      A: {
        name: "Missile Battery",
        desc: "6-pod guided launcher rack",
        effect: "Auto-aim or manual targeting for devastating barrages",
        range: 400,
      },
      B: {
        name: "Ember Foundry",
        desc: "Triple-barrel revolver cannon",
        effect: "Fires 3 large incendiary shells at target, deals burn DoT",
        range: 350,
      },
    },
  },
};

// =============================================================================
// TOWER ACCENT COLORS (used for sprite frame themes and UI theming)
// =============================================================================

export const TOWER_ACCENTS: Record<TowerType, string> = {
  station: "#a78bfa",
  cannon: "#f87171",
  library: "#67e8f9",
  lab: "#facc15",
  arch: "#60a5fa",
  club: "#f59e0b",
  mortar: "#fb923c",
};

// =============================================================================
// TOWER CATEGORIES (role label + color name for UI display)
// =============================================================================

export interface TowerCategory {
  label: string;
  colorName: string;
}

export const TOWER_CATEGORIES: Record<TowerType, TowerCategory> = {
  station: { label: "Troop Spawner", colorName: "purple" },
  cannon: { label: "Heavy Artillery", colorName: "red" },
  library: { label: "Crowd Control", colorName: "cyan" },
  lab: { label: "Energy Damage", colorName: "yellow" },
  arch: { label: "Multi-Target", colorName: "blue" },
  club: { label: "Economy", colorName: "amber" },
  mortar: { label: "Siege AoE", colorName: "orange" },
};

// =============================================================================
// TOWER RENDERING COLORS
// =============================================================================

// Tower colors
export const TOWER_COLORS: Record<
  TowerType,
  {
    base: string;
    dark: string;
    accent: string;
    light: string;
    primary: string;
    secondary: string;
  }
> = {
  cannon: {
    base: "#4a4a52",
    dark: "#2a2a32",
    accent: "#ff6600",
    light: "#6a6a72",
    primary: "#4a4a52",
    secondary: "#2a2a32",
  },
  library: {
    base: "#8b4513",
    dark: "#5c2e0d",
    accent: "#daa520",
    light: "#a65d33",
    primary: "#8b4513",
    secondary: "#5c2e0d",
  },
  lab: {
    base: "#2d5a7b",
    dark: "#1a3a4f",
    accent: "#00ffff",
    light: "#4d7a9b",
    primary: "#2d5a7b",
    secondary: "#1a3a4f",
  },
  arch: {
    base: "#6b5b4f",
    dark: "#4a3f37",
    accent: "#9370db",
    light: "#8b7b6f",
    primary: "#6b5b4f",
    secondary: "#4a3f37",
  },
  club: {
    base: "#228b22",
    dark: "#145214",
    accent: "#ffd700",
    light: "#42ab42",
    primary: "#228b22",
    secondary: "#145214",
  },
  station: {
    base: "#8b0000",
    dark: "#5c0000",
    accent: "#ffffff",
    light: "#ab2020",
    primary: "#8b0000",
    secondary: "#5c0000",
  },
  mortar: {
    base: "#7a5c3a",
    dark: "#4a3520",
    accent: "#ff4400",
    light: "#9a7c5a",
    primary: "#7a5c3a",
    secondary: "#4a3520",
  },
};
