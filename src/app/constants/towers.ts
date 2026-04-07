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
    levelDesc: Record<number, string>;
  }
> = {
  arch: {
    attackSpeed: TOWER_STATS.arch.baseStats.attackSpeed,

    cost: TOWER_STATS.arch.levels[1].cost,
    damage: TOWER_STATS.arch.baseStats.damage,
    desc: "Sonic crescendo that accelerates with consecutive attacks.",
    levelDesc: {
      1: "Crescendo - Builds up to 4 stacks",
      2: "Resonance - Max 6 stacks, 1.4x damage",
      3: "Forte - Max 8 stacks, 1.8x damage",
      4: "Choose: Shockwave or Symphony",
    },
    name: TOWER_STATS.arch.name,
    range: TOWER_STATS.arch.baseStats.range,
    upgrades: {
      A: {
        desc: "Stunning crescendo attacks",
        effect: "35% stun chance, max 8 crescendo stacks",
        name: "Shockwave Siren",
        range: 350,
      },
      B: {
        desc: "Ultimate sonic crescendo",
        effect: "Max 12 stacks with enhanced per-stack bonus",
        name: "Symphony Hall",
        range: 370,
      },
    },
  },
  cannon: {
    attackSpeed: TOWER_STATS.cannon.baseStats.attackSpeed,

    cost: TOWER_STATS.cannon.levels[1].cost,
    damage: TOWER_STATS.cannon.baseStats.damage,
    desc: "Heavy artillery against ground enemies.",
    levelDesc: {
      1: "Basic Cannon - Single shot artillery",
      2: "Improved Cannon - Larger caliber (1.5x damage)",
      3: "Heavy Cannon - Stabilized barrel (2.2x damage)",
      4: "Choose: Gatling Gun or Flamethrower",
    },
    name: TOWER_STATS.cannon.name,
    range: TOWER_STATS.cannon.baseStats.range,
    upgrades: {
      A: {
        desc: "Rapid-fire machine gun",
        effect: "8x attack speed, 0.4x damage per shot",
        name: "Gatling Gun",
        range: 360,
      },
      B: {
        desc: "Continuous fire stream",
        effect: "Deals burn damage over time to enemies",
        name: "Flamethrower",
        range: 300,
      },
    },
  },
  club: {
    attackSpeed: TOWER_STATS.club.baseStats.attackSpeed,

    cost: TOWER_STATS.club.levels[1].cost,
    damage: TOWER_STATS.club.baseStats.damage,
    desc: "Generates Paw Points over time.",
    levelDesc: {
      1: "Basic Club - 8 PP per 8 seconds",
      2: "Popular Club - 15 PP per 7 seconds + bonus on kills nearby",
      3: "Grand Club - 25 PP per 6 seconds + slow enemies in range",
      4: "Choose: Investment Bank or Recruitment Center",
    },
    name: TOWER_STATS.club.name,
    range: TOWER_STATS.club.baseStats.range,
    upgrades: {
      A: {
        desc: "Maximum passive income",
        effect: "40 PP every 5s + 15% range buff to nearby towers",
        name: "Investment Bank",
      },
      B: {
        desc: "Income + tower support",
        effect: "20 PP every 6s + 15% damage buff to nearby towers",
        name: "Recruitment Center",
      },
    },
  },
  lab: {
    attackSpeed: TOWER_STATS.lab.baseStats.attackSpeed,

    cost: TOWER_STATS.lab.levels[1].cost,
    damage: TOWER_STATS.lab.baseStats.damage,
    desc: "Chain lightning bouncing between enemies.",
    levelDesc: {
      1: "Tesla Zapper - Chains to 3 enemies",
      2: "Enhanced Zapper - Chains to 4 enemies",
      3: "Tesla Coil - Chains to 5 enemies",
      4: "Choose: Focused Beam or Chain Lightning",
    },
    name: TOWER_STATS.lab.name,
    range: TOWER_STATS.lab.baseStats.range,
    upgrades: {
      A: {
        desc: "Concentrated laser attack",
        effect: "Continuous lock-on, damage increases over time",
        name: "Focused Beam",
        range: 320,
      },
      B: {
        desc: "Multi-target electricity",
        effect: "Chains to up to 8 enemies",
        name: "Chain Lightning",
        range: 300,
      },
    },
  },
  library: {
    attackSpeed: TOWER_STATS.library.baseStats.attackSpeed,

    cost: TOWER_STATS.library.levels[1].cost,
    damage: TOWER_STATS.library.baseStats.damage,
    desc: "Slows enemies with ancient knowledge.",
    levelDesc: {
      1: TOWER_STATS.library.levels[1].description,
      2: TOWER_STATS.library.levels[2].description,
      3: TOWER_STATS.library.levels[3].description,
      4: "Choose: Earthquake or Blizzard",
    },
    name: TOWER_STATS.library.name,
    range: TOWER_STATS.library.baseStats.range,
    upgrades: {
      A: {
        desc: "Seismic waves damage and slow",
        effect: "Deals 35 AoE damage + 50% slow",
        name: "EQ Smasher",
        range: 330,
      },
      B: {
        desc: "Freezes enemies completely",
        effect: "50% slow + 25% freeze chance/2s",
        name: "Blizzard",
        range: 385,
      },
    },
  },
  mortar: {
    attackSpeed: TOWER_STATS.mortar.baseStats.attackSpeed,

    cost: TOWER_STATS.mortar.levels[1].cost,
    damage: TOWER_STATS.mortar.baseStats.damage,
    desc: "Fortified artillery emplacement with quadpod-mounted barrel.",
    levelDesc: {
      1: "Field Mortar - Quadpod barrel with iron sights",
      2: "Siege Mortar - Propellant injectors, periscope optic, shell feeder",
      3: "Grand Mortar - Digital rangefinder, scaffolding, elevation screw",
      4: "Choose: Missile Battery or Ember Foundry",
    },
    name: TOWER_STATS.mortar.name,
    range: TOWER_STATS.mortar.baseStats.range,
    upgrades: {
      A: {
        desc: "6-pod guided launcher rack",
        effect: "Auto-aim or manual targeting for devastating barrages",
        name: "Missile Battery",
        range: 400,
      },
      B: {
        desc: "Triple-barrel revolver cannon",
        effect: "Fires 3 large incendiary shells at target, deals burn DoT",
        name: "Ember Foundry",
        range: 350,
      },
    },
  },
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
        desc: "Half-human, half-horse warriors",
        effect: "Spawns centaur troops with ranged attacks",
        name: "Centaur Stables",
      },
      B: {
        desc: "Mounted knights on warhorses",
        effect: "Spawns tanky cavalry with charge ability",
        name: "Royal Cavalry",
      },
    },
  },
};

// =============================================================================
// TOWER ACCENT COLORS (used for sprite frame themes and UI theming)
// =============================================================================

export const TOWER_ACCENTS: Record<TowerType, string> = {
  arch: "#60a5fa",
  cannon: "#f87171",
  club: "#f59e0b",
  lab: "#facc15",
  library: "#67e8f9",
  mortar: "#fb923c",
  station: "#a78bfa",
};

// =============================================================================
// TOWER CATEGORIES (role label + color name for UI display)
// =============================================================================

export interface TowerCategory {
  label: string;
  colorName: string;
}

export const TOWER_CATEGORIES: Record<TowerType, TowerCategory> = {
  arch: { colorName: "blue", label: "Multi-Target" },
  cannon: { colorName: "red", label: "Heavy Artillery" },
  club: { colorName: "amber", label: "Economy" },
  lab: { colorName: "yellow", label: "Energy Damage" },
  library: { colorName: "cyan", label: "Crowd Control" },
  mortar: { colorName: "orange", label: "Siege AoE" },
  station: { colorName: "purple", label: "Troop Spawner" },
};

// =============================================================================
// TOWER TAGS — centralized capability tags for at-a-glance clarity
// =============================================================================

export type TowerTag =
  | "attacker"
  | "dps"
  | "spawner"
  | "economy"
  | "crowd_control"
  | "support"
  | "anti_air"
  | "ground_only"
  | "aoe"
  | "single_target"
  | "chain"
  | "ramp_up"
  | "blocker";

export interface TowerTagDef {
  label: string;
  icon: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
}

export const TOWER_TAG_DEFS: Record<TowerTag, TowerTagDef> = {
  anti_air: {
    bgClass: "bg-sky-950/60",
    borderClass: "border-sky-700/40",
    icon: "feather",
    label: "Hits Air",
    textClass: "text-sky-300",
  },
  aoe: {
    bgClass: "bg-orange-950/60",
    borderClass: "border-orange-700/40",
    icon: "circle-dot",
    label: "Splash",
    textClass: "text-orange-300",
  },
  attacker: {
    bgClass: "bg-red-950/60",
    borderClass: "border-red-700/40",
    icon: "swords",
    label: "Attacker",
    textClass: "text-red-300",
  },
  blocker: {
    bgClass: "bg-emerald-950/60",
    borderClass: "border-emerald-700/40",
    icon: "shield",
    label: "Blocker",
    textClass: "text-emerald-300",
  },
  chain: {
    bgClass: "bg-cyan-950/60",
    borderClass: "border-cyan-700/40",
    icon: "zap",
    label: "Chain",
    textClass: "text-cyan-300",
  },
  crowd_control: {
    bgClass: "bg-purple-950/60",
    borderClass: "border-purple-700/40",
    icon: "snowflake",
    label: "Control",
    textClass: "text-purple-300",
  },
  dps: {
    bgClass: "bg-red-950/60",
    borderClass: "border-red-700/40",
    icon: "flame",
    label: "DPS",
    textClass: "text-red-400",
  },
  economy: {
    bgClass: "bg-amber-950/60",
    borderClass: "border-amber-700/40",
    icon: "coins",
    label: "Economy",
    textClass: "text-amber-300",
  },
  ground_only: {
    bgClass: "bg-stone-800/60",
    borderClass: "border-stone-600/40",
    icon: "footprints",
    label: "Ground Only",
    textClass: "text-stone-400",
  },
  ramp_up: {
    bgClass: "bg-green-950/60",
    borderClass: "border-green-700/40",
    icon: "trending-up",
    label: "Ramp Up",
    textClass: "text-green-300",
  },
  single_target: {
    bgClass: "bg-red-950/40",
    borderClass: "border-red-800/30",
    icon: "crosshair",
    label: "Single Target",
    textClass: "text-red-200",
  },
  spawner: {
    bgClass: "bg-fuchsia-950/60",
    borderClass: "border-fuchsia-700/40",
    icon: "users",
    label: "Spawner",
    textClass: "text-fuchsia-300",
  },
  support: {
    bgClass: "bg-emerald-950/60",
    borderClass: "border-emerald-700/40",
    icon: "heart-pulse",
    label: "Support",
    textClass: "text-emerald-300",
  },
};

export const TOWER_TAGS: Record<TowerType, TowerTag[]> = {
  arch: ["ramp_up", "attacker", "anti_air"],
  cannon: ["dps", "attacker", "anti_air"],
  club: ["economy"],
  lab: ["chain", "attacker", "anti_air"],
  library: ["crowd_control", "anti_air"],
  mortar: ["aoe", "attacker", "ground_only"],
  station: ["spawner", "blocker"],
};

export const TOWER_QUICK_SUMMARY: Record<TowerType, string> = {
  arch: "Sonic attacks ramp up speed; hits air & ground",
  cannon: "High single-target damage vs ground enemies",
  club: "Generates Paw Points passively — no combat",
  lab: "Chain lightning bounces between air & ground foes",
  library: "Slows all enemies in range, including flying",
  mortar: "Slow explosive shells with large splash radius",
  station: "Spawns troops that physically block enemies",
};

// =============================================================================
// TOWER ROLE STYLES — visual styling for role badges in UI
// =============================================================================

export interface TowerRoleStyle {
  label: string;
  accent: string;
  text: string;
  bg: string;
  border: string;
  statColor: string;
}

export const TOWER_ROLE_STYLES: Record<TowerType, TowerRoleStyle> = {
  arch: {
    accent: "rgba(74,222,128,0.7)",
    bg: "rgba(20,83,45,0.35)",
    border: "rgba(22,101,52,0.3)",
    label: "Ramp",
    statColor: "rgb(134,239,172)",
    text: "rgb(134,239,172)",
  },
  cannon: {
    accent: "rgba(239,68,68,0.7)",
    bg: "rgba(127,29,29,0.35)",
    border: "rgba(153,27,27,0.3)",
    label: "DPS",
    statColor: "rgb(252,165,165)",
    text: "rgb(252,165,165)",
  },
  club: {
    accent: "rgba(250,204,21,0.7)",
    bg: "rgba(113,63,18,0.35)",
    border: "rgba(133,77,14,0.3)",
    label: "Econ",
    statColor: "rgb(253,224,71)",
    text: "rgb(253,224,71)",
  },
  lab: {
    accent: "rgba(56,189,248,0.7)",
    bg: "rgba(12,74,110,0.35)",
    border: "rgba(14,116,144,0.3)",
    label: "Chain",
    statColor: "rgb(125,211,252)",
    text: "rgb(125,211,252)",
  },
  library: {
    accent: "rgba(168,85,247,0.7)",
    bg: "rgba(88,28,135,0.35)",
    border: "rgba(107,33,168,0.3)",
    label: "Slow",
    statColor: "rgb(216,180,254)",
    text: "rgb(216,180,254)",
  },
  mortar: {
    accent: "rgba(249,115,22,0.7)",
    bg: "rgba(124,45,18,0.35)",
    border: "rgba(154,52,18,0.3)",
    label: "AoE",
    statColor: "rgb(253,186,116)",
    text: "rgb(253,186,116)",
  },
  station: {
    accent: "rgba(232,121,249,0.7)",
    bg: "rgba(112,26,117,0.35)",
    border: "rgba(134,25,143,0.3)",
    label: "Troops",
    statColor: "rgb(240,171,252)",
    text: "rgb(240,171,252)",
  },
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
  arch: {
    accent: "#9370db",
    base: "#6b5b4f",
    dark: "#4a3f37",
    light: "#8b7b6f",
    primary: "#6b5b4f",
    secondary: "#4a3f37",
  },
  cannon: {
    accent: "#ff6600",
    base: "#4a4a52",
    dark: "#2a2a32",
    light: "#6a6a72",
    primary: "#4a4a52",
    secondary: "#2a2a32",
  },
  club: {
    accent: "#ffd700",
    base: "#228b22",
    dark: "#145214",
    light: "#42ab42",
    primary: "#228b22",
    secondary: "#145214",
  },
  lab: {
    accent: "#00ffff",
    base: "#2d5a7b",
    dark: "#1a3a4f",
    light: "#4d7a9b",
    primary: "#2d5a7b",
    secondary: "#1a3a4f",
  },
  library: {
    accent: "#daa520",
    base: "#8b4513",
    dark: "#5c2e0d",
    light: "#a65d33",
    primary: "#8b4513",
    secondary: "#5c2e0d",
  },
  mortar: {
    accent: "#ff4400",
    base: "#7a5c3a",
    dark: "#4a3520",
    light: "#9a7c5a",
    primary: "#7a5c3a",
    secondary: "#4a3520",
  },
  station: {
    accent: "#ffffff",
    base: "#8b0000",
    dark: "#5c0000",
    light: "#ab2020",
    primary: "#8b0000",
    secondary: "#5c0000",
  },
};
