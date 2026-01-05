import type {
  TowerType,
  EnemyType,
  HeroType,
  SpellType,
  WaveGroup,
  EnemyData,
  HeroData,
  SpellData,
  TroopType,
  TroopData,
} from "../types";

// Grid settings - Larger maps for more strategic depth
export const TILE_SIZE = 64;
export const GRID_WIDTH = 20;
export const GRID_HEIGHT = 14;

// Road/path exclusion zone - how far towers must be from the road center
export const ROAD_EXCLUSION_BUFFER = 42;

// Tower data with 4-level progression: Level 1 -> 2 -> 3 (base upgrade) -> 4A/4B (branch)
export const TOWER_DATA: Record<
  TowerType,
  {
    name: string;
    icon: string;
    cost: number;
    damage: number;
    range: number;
    attackSpeed: number;
    desc: string;
    spawnRange?: number;
    upgrades: {
      A: { name: string; desc: string; effect: string };
      B: { name: string; desc: string; effect: string };
    };
    levelDesc: { [key: number]: string };
  }
> = {
  station: {
    name: "Dinky Station",
    icon: "🚂",
    cost: 200,
    damage: 0,
    range: 0,
    attackSpeed: 0,
    desc: "Spawns soldiers to block enemies.",
    spawnRange: 220,
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
        effect: "Spawns fast centaur troops with ranged attacks",
      },
      B: {
        name: "Royal Cavalry",
        desc: "Mounted knights on warhorses",
        effect: "Spawns tanky cavalry with charge ability",
      },
    },
  },
  cannon: {
    name: "Nassau Cannon",
    icon: "💣",
    cost: 100,
    damage: 40,
    range: 240,
    attackSpeed: 1200,
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
      },
      B: {
        name: "Flamethrower",
        desc: "Continuous fire stream",
        effect: "Deals burn damage over time to enemies",
      },
    },
  },
  library: {
    name: "Firestone Library",
    icon: "📚",
    cost: 80,
    damage: 0,
    range: 220,
    attackSpeed: 0,
    desc: "Slows enemies with ancient knowledge.",
    levelDesc: {
      1: "Basic Slowing - 30% slow field",
      2: "Enhanced Slowing - 45% slow field",
      3: "Arcane Library - 60% slow + magic damage",
      4: "Choose: Earthquake or Blizzard",
    },
    upgrades: {
      A: {
        name: "Earthquake Smasher",
        desc: "Seismic waves damage and slow",
        effect: "Deals 35 AoE damage + 80% slow",
      },
      B: {
        name: "Blizzard",
        desc: "Freezes enemies completely",
        effect: "70% slow + periodic 2s freeze",
      },
    },
  },
  lab: {
    name: "E-Quad Lab",
    icon: "⚗️",
    cost: 120,
    damage: 25,
    range: 200,
    attackSpeed: 800,
    desc: "Fast energy attacks with electric damage.",
    levelDesc: {
      1: "Basic Zapper - Single target lightning",
      2: "Enhanced Zapper - 1.5x damage",
      3: "Tesla Coil - Chains to 2 targets",
      4: "Choose: Focused Beam or Chain Lightning",
    },
    upgrades: {
      A: {
        name: "Focused Beam",
        desc: "Concentrated laser attack",
        effect: "Continuous lock-on, damage increases over time",
      },
      B: {
        name: "Chain Lightning",
        desc: "Multi-target electricity",
        effect: "Hits up to 5 targets at once",
      },
    },
  },
  arch: {
    name: "Blair Arch",
    icon: "🏛️",
    cost: 90,
    damage: 15,
    range: 260,
    attackSpeed: 600,
    desc: "Sonic attacks hit air and ground.",
    levelDesc: {
      1: "Sound Waves - Single target sonic",
      2: "Resonance - 1.5x damage",
      3: "Elite Archers - Hits 2 targets, 30% faster",
      4: "Choose: Shockwave or Symphony",
    },
    upgrades: {
      A: {
        name: "Shockwave Emitter",
        desc: "Powerful stunning sound waves",
        effect: "30% chance to stun enemies for 1s",
      },
      B: {
        name: "Symphony Hall",
        desc: "Harmonious multi-target",
        effect: "Hits up to 5 enemies simultaneously",
      },
    },
  },
  club: {
    name: "Eating Club",
    icon: "🏦",
    cost: 150,
    damage: 0,
    range: 0,
    attackSpeed: 0,
    desc: "Generates Paw Points over time.",
    levelDesc: {
      1: "Basic Club - 5 PP per cycle",
      2: "Popular Club - 12 PP per cycle",
      3: "Grand Club - 18 PP per cycle",
      4: "Choose: Investment Bank or Recruitment Center",
    },
    upgrades: {
      A: {
        name: "Investment Bank",
        desc: "Maximum passive income",
        effect: "30 PP per cycle",
      },
      B: {
        name: "Recruitment Center",
        desc: "Income + tower support",
        effect: "20 PP per cycle + buffs nearby towers",
      },
    },
  },
};

// Enemy data with visual properties
export const ENEMY_DATA: Record<EnemyType, EnemyData> = {
  frosh: {
    name: "Freshman",
    hp: 80,
    speed: 1.2,
    bounty: 10,
    armor: 0,
    flying: false,
    desc: "Eager but weak. Easy to defeat.",
    color: "#4ade80",
    size: 20,
  },
  sophomore: {
    name: "Sophomore",
    hp: 150,
    speed: 1.0,
    bounty: 15,
    armor: 0.1,
    flying: false,
    desc: "More experienced, harder to stop.",
    color: "#60a5fa",
    size: 22,
  },
  junior: {
    name: "Junior",
    hp: 250,
    speed: 0.9,
    bounty: 25,
    armor: 0.15,
    flying: false,
    desc: "Focused and determined.",
    color: "#c084fc",
    size: 24,
  },
  senior: {
    name: "Senior",
    hp: 400,
    speed: 0.8,
    bounty: 40,
    armor: 0.2,
    flying: false,
    desc: "Thesis-hardened veteran.",
    color: "#f472b6",
    size: 26,
  },
  gradstudent: {
    name: "Grad Student",
    hp: 600,
    speed: 0.6,
    bounty: 60,
    armor: 0.25,
    flying: false,
    desc: "Sleepless and relentless.",
    color: "#fb923c",
    size: 28,
  },
  professor: {
    name: "Professor",
    hp: 800,
    speed: 0.5,
    bounty: 80,
    armor: 0.3,
    flying: false,
    desc: "Tenured and tough.",
    color: "#ef4444",
    size: 30,
  },
  dean: {
    name: "Dean",
    hp: 1200,
    speed: 0.4,
    bounty: 120,
    armor: 0.35,
    flying: false,
    desc: "Administrative powerhouse.",
    color: "#a855f7",
    size: 34,
  },
  trustee: {
    name: "Trustee",
    hp: 2000,
    speed: 0.3,
    bounty: 200,
    armor: 0.4,
    flying: false,
    desc: "Wealthy and well-protected.",
    color: "#eab308",
    size: 38,
  },
  mascot: {
    name: "Rival Mascot",
    hp: 300,
    speed: 1.5,
    bounty: 50,
    armor: 0,
    flying: true,
    desc: "Flying enemy that ignores ground troops.",
    color: "#22d3d3",
    size: 26,
  },
  archer: {
    name: "Archer Student",
    hp: 120,
    speed: 0.9,
    bounty: 20,
    armor: 0,
    flying: false,
    isRanged: true,
    range: 120,
    attackSpeed: 2000,
    projectileDamage: 15,
    desc: "Ranged attacker that shoots arrows at heroes and troops.",
    color: "#10b981",
    size: 22,
  },
  mage: {
    name: "Mage Professor",
    hp: 200,
    speed: 0.6,
    bounty: 45,
    armor: 0.1,
    flying: false,
    isRanged: true,
    range: 150,
    attackSpeed: 2500,
    projectileDamage: 25,
    desc: "Casts magic bolts from a distance.",
    color: "#8b5cf6",
    size: 24,
  },
  catapult: {
    name: "Siege Engine",
    hp: 500,
    speed: 0.4,
    bounty: 70,
    armor: 0.3,
    flying: false,
    isRanged: true,
    range: 200,
    attackSpeed: 4000,
    projectileDamage: 40,
    desc: "Slow but powerful ranged siege unit.",
    color: "#854d0e",
    size: 32,
  },
};

// Hero data - Enhanced HP for better survivability
export const HERO_DATA: Record<HeroType, HeroData> = {
  tiger: {
    name: "Tiger",
    icon: "🐯",
    description:
      "The fearsome Princeton Tiger - an apex predator with devastating claw attacks and a terrifying roar that freezes enemies in fear.",
    hp: 2500,
    damage: 80,
    range: 120,
    attackSpeed: 600,
    speed: 3.5,
    ability: "Mighty Roar",
    abilityDesc: "Stuns all enemies in range for 3s with fear effect",
    color: "#f97316",
  },
  tenor: {
    name: "Tenor",
    icon: "🎵",
    description:
      "A virtuoso vocalist whose voice is a weapon. The Tenor's sonic attacks pierce through even the toughest armor.",
    hp: 1800,
    damage: 60,
    range: 250,
    attackSpeed: 450,
    speed: 2.5,
    ability: "High Note",
    abilityDesc: "Devastating sonic blast stuns enemies in huge radius",
    color: "#8b5cf6",
  },
  mathey: {
    name: "Mathey Knight",
    icon: "🛡️",
    description:
      "An elite defender from Mathey College, clad in enchanted armor. Draws enemy aggression and protects allies.",
    hp: 3500,
    damage: 70,
    range: 80,
    attackSpeed: 800,
    speed: 2,
    ability: "Fortress Shield",
    abilityDesc: "Invincible for 5s and taunts all nearby enemies",
    color: "#6366f1",
  },
  rocky: {
    name: "Rocky",
    icon: "🪨",
    description:
      "A legendary gargoyle awakened from the campus rooftops. Hurls massive boulders that devastate enemy formations.",
    hp: 2200,
    damage: 90,
    range: 180,
    attackSpeed: 700,
    speed: 2.8,
    ability: "Meteor Strike",
    abilityDesc: "Throws massive boulder dealing huge AoE damage",
    color: "#78716c",
  },
  scott: {
    name: "F. Scott",
    icon: "📖",
    description:
      "The ghost of F. Scott Fitzgerald inspires defenders with literary brilliance, boosting their combat effectiveness.",
    hp: 1500,
    damage: 50,
    range: 200,
    attackSpeed: 400,
    speed: 3.2,
    ability: "Inspiration",
    abilityDesc: "Boosts all tower damage by 50% for 8s",
    color: "#14b8a6",
  },
  captain: {
    name: "Captain",
    icon: "⚔️",
    description:
      "A legendary military commander who leads troops into battle. Rallies reinforcements with an inspiring battle cry.",
    hp: 2800,
    damage: 65,
    range: 100,
    attackSpeed: 650,
    speed: 2.5,
    ability: "Rally Knights",
    abilityDesc: "Summons 3 reinforcement knights to fight",
    color: "#dc2626",
  },
  engineer: {
    name: "Engineer",
    icon: "🔧",
    description:
      "A brilliant inventor from E-Quad. Deploys automated turrets and uses advanced technology to defend.",
    hp: 1600,
    damage: 40,
    range: 150,
    attackSpeed: 500,
    speed: 3.0,
    ability: "Deploy Turret",
    abilityDesc: "Deploys a defensive turret that attacks enemies",
    color: "#eab308",
  },
};

// Spell data
export const SPELL_DATA: Record<SpellType, SpellData> = {
  fireball: {
    name: "Meteor Strike",
    cost: 50,
    cooldown: 15000,
    desc: "Calls down a meteor dealing 200 AoE damage with falloff",
    icon: "☄️",
  },
  lightning: {
    name: "Chain Lightning",
    cost: 40,
    cooldown: 12000,
    desc: "Chains to 5 enemies, 600 total damage with stun",
    icon: "⚡",
  },
  freeze: {
    name: "Arctic Blast",
    cost: 60,
    cooldown: 20000,
    desc: "Freezes ALL enemies for 3 seconds",
    icon: "❄️",
  },
  payday: {
    name: "Gold Rush",
    cost: 0,
    cooldown: 30000,
    desc: "Grants 80+ Paw Points (bonus per enemy)",
    icon: "💰",
  },
  reinforcements: {
    name: "Knight Squad",
    cost: 75,
    cooldown: 25000,
    desc: "Summons 3 armored knights to the battlefield",
    icon: "🏇",
  },
};

// Troop data - includes "elite" for Level 3 station
export const TROOP_DATA: Record<TroopType, TroopData> = {
  footsoldier: {
    name: "Foot Soldier",
    hp: 350,
    damage: 20,
    attackSpeed: 1100,
    desc: "Basic infantry unit",
    color: "#6b8e23",
  },
  armored: {
    name: "Armored Soldier",
    hp: 550,
    damage: 25,
    attackSpeed: 1000,
    desc: "Protected infantry",
    color: "#708090",
  },
  elite: {
    name: "Elite Guard",
    hp: 700,
    damage: 35,
    attackSpeed: 900,
    desc: "Royal guard with halberd",
    color: "#c0c0c0",
  },
  knight: {
    name: "Knight",
    hp: 500, // Reduced from 800 - still strong but not overpowered
    damage: 30, // Reduced from 40
    attackSpeed: 1000, // Slightly slower
    desc: "Elite warrior",
    color: "#c0c0c0",
  },
  centaur: {
    name: "Centaur",
    hp: 600,
    damage: 45,
    attackSpeed: 700,
    desc: "Fast ranged attacker with spears",
    color: "#8b4513",
    isMounted: true,
    isRanged: true,
    range: 150,
  },
  cavalry: {
    name: "Cavalry",
    hp: 900,
    damage: 55,
    attackSpeed: 1100,
    desc: "Heavy mounted knight",
    color: "#daa520",
    isMounted: true,
  },
  thesis: {
    name: "Thesis Defender",
    hp: 700,
    damage: 55,
    attackSpeed: 750,
    desc: "Elite defender with high damage",
    color: "#c084fc",
  },
  rowing: {
    name: "Rowing Crew",
    hp: 850,
    damage: 45,
    attackSpeed: 1000,
    desc: "Tanky unit that can take hits",
    color: "#f97316",
  },
  turret: {
    name: "Defense Turret",
    hp: 400,
    damage: 35,
    attackSpeed: 800,
    desc: "Stationary defense emplacement",
    color: "#f59e0b",
    isRanged: true,
    range: 140,
    isStationary: true, // Custom flag for turret behavior
  },
};

// =============================================================================
// MAP PATHS - All regions
// =============================================================================
export const MAP_PATHS: Record<string, { x: number; y: number }[]> = {
  // =====================
  // GRASSLAND REGION (Princeton Grounds)
  // =====================
  poe: [
    { x: -8, y: 7 },
    { x: -5, y: 7 },
    { x: -2, y: 7 },
    { x: 2, y: 7 },
    { x: 6, y: 7 },
    { x: 6, y: 4 },
    { x: 10, y: 4 },
    { x: 10, y: 9 },
    { x: 14, y: 9 },
    { x: 14, y: 6 },
    { x: 18, y: 6 },
    { x: 21, y: 6 },
    { x: 24, y: 6 },
    { x: 28, y: 6 },
  ],
  carnegie: [
    { x: 10, y: -8 },
    { x: 10, y: -5 },
    { x: 10, y: -2 },
    { x: 10, y: 3 },
    { x: 6, y: 3 },
    { x: 6, y: 7 },
    { x: 10, y: 7 },
    { x: 10, y: 10 },
    { x: 14, y: 10 },
    { x: 14, y: 5 },
    { x: 17, y: 5 },
    { x: 17, y: 10 },
    { x: 17, y: 14 },
    { x: 17, y: 18 },
    { x: 17, y: 22 },
  ],
  nassau: [
    { x: -8, y: 6 },
    { x: -5, y: 6 },
    { x: -2, y: 6 },
    { x: 3, y: 6 },
    { x: 3, y: 10 },
    { x: 8, y: 10 },
    { x: 8, y: 4 },
    { x: 13, y: 4 },
    { x: 13, y: 9 },
    { x: 17, y: 9 },
    { x: 21, y: 9 },
    { x: 24, y: 9 },
    { x: 28, y: 9 },
  ],
  // =====================
  // DESERT REGION (Sahara Sands)
  // =====================
  oasis: [
    { x: -8, y: 5 },
    { x: -4, y: 5 },
    { x: 0, y: 5 },
    { x: 4, y: 5 },
    { x: 4, y: 9 },
    { x: 8, y: 9 },
    { x: 12, y: 9 },
    { x: 12, y: 5 },
    { x: 16, y: 5 },
    { x: 20, y: 5 },
    { x: 20, y: 9 },
    { x: 24, y: 9 },
    { x: 28, y: 9 },
  ],
  pyramid: [
    { x: 10, y: -8 },
    { x: 10, y: -4 },
    { x: 10, y: 0 },
    { x: 6, y: 0 },
    { x: 6, y: 4 },
    { x: 10, y: 4 },
    { x: 14, y: 4 },
    { x: 14, y: 8 },
    { x: 10, y: 8 },
    { x: 6, y: 8 },
    { x: 6, y: 12 },
    { x: 10, y: 12 },
    { x: 10, y: 16 },
    { x: 10, y: 20 },
  ],
  sphinx: [
    { x: -8, y: 8 },
    { x: -4, y: 8 },
    { x: 0, y: 8 },
    { x: 0, y: 4 },
    { x: 4, y: 4 },
    { x: 8, y: 4 },
    { x: 8, y: 8 },
    { x: 12, y: 8 },
    { x: 12, y: 4 },
    { x: 16, y: 4 },
    { x: 16, y: 8 },
    { x: 20, y: 8 },
    { x: 24, y: 8 },
    { x: 28, y: 8 },
  ],
  // =====================
  // WINTER REGION (Frozen Frontier)
  // =====================
  glacier: [
    { x: -8, y: 6 },
    { x: -4, y: 6 },
    { x: 0, y: 6 },
    { x: 4, y: 6 },
    { x: 4, y: 10 },
    { x: 8, y: 10 },
    { x: 8, y: 6 },
    { x: 12, y: 6 },
    { x: 12, y: 10 },
    { x: 16, y: 10 },
    { x: 20, y: 10 },
    { x: 20, y: 6 },
    { x: 24, y: 6 },
    { x: 28, y: 6 },
  ],
  fortress: [
    { x: 10, y: -8 },
    { x: 10, y: -4 },
    { x: 6, y: -4 },
    { x: 6, y: 0 },
    { x: 6, y: 4 },
    { x: 10, y: 4 },
    { x: 14, y: 4 },
    { x: 14, y: 8 },
    { x: 10, y: 8 },
    { x: 10, y: 12 },
    { x: 14, y: 12 },
    { x: 14, y: 16 },
    { x: 14, y: 20 },
  ],
  peak: [
    { x: -8, y: 10 },
    { x: -4, y: 10 },
    { x: 0, y: 10 },
    { x: 0, y: 6 },
    { x: 4, y: 6 },
    { x: 8, y: 6 },
    { x: 8, y: 2 },
    { x: 12, y: 2 },
    { x: 12, y: 6 },
    { x: 16, y: 6 },
    { x: 16, y: 10 },
    { x: 20, y: 10 },
    { x: 24, y: 10 },
    { x: 28, y: 10 },
  ],
  // =====================
  // VOLCANIC REGION (Inferno Depths)
  // =====================
  lava: [
    { x: -8, y: 7 },
    { x: -4, y: 7 },
    { x: 0, y: 7 },
    { x: 4, y: 7 },
    { x: 4, y: 3 },
    { x: 8, y: 3 },
    { x: 8, y: 7 },
    { x: 12, y: 7 },
    { x: 12, y: 11 },
    { x: 16, y: 11 },
    { x: 16, y: 7 },
    { x: 20, y: 7 },
    { x: 24, y: 7 },
    { x: 28, y: 7 },
  ],
  crater: [
    { x: 10, y: -8 },
    { x: 10, y: -4 },
    { x: 10, y: 0 },
    { x: 6, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 4 },
    { x: 6, y: 4 },
    { x: 10, y: 4 },
    { x: 14, y: 4 },
    { x: 18, y: 4 },
    { x: 18, y: 8 },
    { x: 14, y: 8 },
    { x: 10, y: 8 },
    { x: 10, y: 12 },
    { x: 10, y: 16 },
    { x: 10, y: 20 },
  ],
  throne: [
    { x: -8, y: 5 },
    { x: -4, y: 5 },
    { x: 0, y: 5 },
    { x: 0, y: 9 },
    { x: 4, y: 9 },
    { x: 4, y: 5 },
    { x: 8, y: 5 },
    { x: 8, y: 9 },
    { x: 12, y: 9 },
    { x: 12, y: 5 },
    { x: 16, y: 5 },
    { x: 16, y: 9 },
    { x: 20, y: 9 },
    { x: 20, y: 5 },
    { x: 24, y: 5 },
    { x: 28, y: 5 },
  ],
};

// =============================================================================
// LEVEL DATA - All regions with theme info and wave count
// =============================================================================
export type MapTheme = "grassland" | "desert" | "winter" | "volcanic";

export const LEVEL_DATA: Record<
  string,
  {
    name: string;
    position: { x: number; y: number };
    description: string;
    camera: {
      offset: { x: number; y: number };
      zoom: number;
    };
    region: string;
    theme: MapTheme;
    difficulty: 1 | 2 | 3;
    previewImage?: string; // Optional preview image URL for level selection
  }
> = {
  // =====================
  // GRASSLAND REGION
  // =====================
  poe: {
    name: "Poe Field",
    position: { x: 120, y: 200 },
    description: "Training grounds for new defenders",
    camera: { offset: { x: -100, y: -220 }, zoom: 1.1 },
    region: "grassland",
    theme: "grassland",
    difficulty: 1,
    previewImage: "/previews/poe.png",
  },
  carnegie: {
    name: "Carnegie Lake",
    position: { x: 300, y: 120 },
    description: "Strategic waterfront defense",
    camera: { offset: { x: -150, y: -140 }, zoom: 1.35 },
    region: "grassland",
    theme: "grassland",
    difficulty: 2,
    previewImage: "/previews/carnegie.png",
  },
  nassau: {
    name: "Nassau Hall",
    position: { x: 480, y: 200 },
    description: "The final stand at the heart of campus",
    camera: { offset: { x: -60, y: -70 }, zoom: 1.5 },
    region: "grassland",
    theme: "grassland",
    difficulty: 3,
    previewImage: "/previews/nassau.png",
  },
  // =====================
  // DESERT REGION
  // =====================
  oasis: {
    name: "Desert Oasis",
    position: { x: 120, y: 200 },
    description: "A precious water source under siege",
    camera: { offset: { x: -100, y: -220 }, zoom: 1.1 },
    region: "desert",
    theme: "desert",
    difficulty: 1,
    previewImage: "/previews/oasis.png",
  },
  pyramid: {
    name: "Pyramid Pass",
    position: { x: 300, y: 120 },
    description: "Navigate the treacherous canyon",
    camera: { offset: { x: -50, y: -40 }, zoom: 1.35 },
    region: "desert",
    theme: "desert",
    difficulty: 2,
    previewImage: "/previews/pyramid.png",
  },
  sphinx: {
    name: "Sphinx Gate",
    position: { x: 480, y: 200 },
    description: "The ancient guardian's domain",
    camera: { offset: { x: -60, y: -70 }, zoom: 1.5 },
    region: "desert",
    theme: "desert",
    difficulty: 3,
    previewImage: "/previews/sphinx.png",
  },
  // =====================
  // WINTER REGION
  // =====================
  glacier: {
    name: "Glacier Path",
    position: { x: 120, y: 200 },
    description: "Ice-covered mountain pass",
    camera: { offset: { x: -100, y: -220 }, zoom: 1.1 },
    region: "winter",
    theme: "winter",
    difficulty: 1,
    previewImage: "/previews/glacier.png",
  },
  fortress: {
    name: "Frost Fortress",
    position: { x: 300, y: 120 },
    description: "An abandoned stronghold",
    camera: { offset: { x: -50, y: -40 }, zoom: 1.35 },
    region: "winter",
    theme: "winter",
    difficulty: 2,
    previewImage: "/previews/fortress.png",
  },
  peak: {
    name: "Summit Peak",
    position: { x: 480, y: 200 },
    description: "The highest point of defense",
    camera: { offset: { x: -60, y: -70 }, zoom: 1.5 },
    region: "winter",
    theme: "winter",
    difficulty: 3,
    previewImage: "/previews/peak.png",
  },
  // =====================
  // VOLCANIC REGION
  // =====================
  lava: {
    name: "Lava Fields",
    position: { x: 120, y: 200 },
    description: "Rivers of molten rock",
    camera: { offset: { x: -100, y: -220 }, zoom: 1.1 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 2,
    previewImage: "/previews/lava.png",
  },
  crater: {
    name: "Caldera Basin",
    position: { x: 300, y: 120 },
    description: "Inside the volcano's heart",
    camera: { offset: { x: -50, y: -40 }, zoom: 1.35 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 3,
    previewImage: "/previews/crater.png",
  },
  throne: {
    name: "Obsidian Throne",
    position: { x: 480, y: 200 },
    description: "The ultimate challenge awaits",
    camera: { offset: { x: -60, y: -70 }, zoom: 1.5 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 3,
    previewImage: "/previews/throne.png",
  },
};

// =============================================================================
// REGION THEME COLORS - For map rendering
// =============================================================================
export const REGION_THEMES: Record<
  MapTheme,
  {
    ground: string[];
    path: string[];
    accent: string;
    fog: string;
  }
> = {
  grassland: {
    ground: ["#3a2f1f", "#2a1f0f", "#1a0f05"],
    path: ["#8b7355", "#a0826d", "#5b4334"],
    accent: "#4a7c59",
    fog: "rgba(200, 220, 200, 0.3)",
  },
  desert: {
    ground: ["#8b7355", "#a08060", "#6b5340"],
    path: ["#c4a35a", "#d4b36a", "#a4833a"],
    accent: "#daa520",
    fog: "rgba(255, 230, 180, 0.25)",
  },
  winter: {
    ground: ["#4a5a6a", "#3a4a5a", "#2a3a4a"],
    path: ["#8899aa", "#99aabb", "#6677aa"],
    accent: "#6ba3be",
    fog: "rgba(200, 220, 255, 0.35)",
  },
  volcanic: {
    ground: ["#2a1a1a", "#3a2020", "#1a0a0a"],
    path: ["#5a3a3a", "#6a4a4a", "#4a2a2a"],
    accent: "#ff4400",
    fog: "rgba(255, 100, 50, 0.15)",
  },
};

// =============================================================================
// LEVEL-SPECIFIC WAVES CONFIGURATION
// =============================================================================

// Each level has its own wave configuration
export const LEVEL_WAVES: Record<string, WaveGroup[][]> = {
  // =====================
  // GRASSLAND REGION - Easier waves, introductory
  // =====================
  poe: [
    // Wave 1-8: Tutorial waves
    [{ type: "frosh", count: 4, interval: 1800 }],
    [{ type: "frosh", count: 6, interval: 1500 }],
    [{ type: "frosh", count: 8, interval: 1400 }],
    [
      { type: "frosh", count: 5, interval: 1500 },
      { type: "sophomore", count: 2, interval: 2000 },
    ],
    [{ type: "sophomore", count: 5, interval: 1600 }],
    [
      { type: "sophomore", count: 6, interval: 1500 },
      { type: "frosh", count: 4, interval: 1200 },
    ],
    [{ type: "sophomore", count: 8, interval: 1400 }],
    [
      { type: "sophomore", count: 5, interval: 1500 },
      { type: "junior", count: 2, interval: 2500 },
    ],
  ],

  carnegie: [
    // 10 waves
    [{ type: "frosh", count: 6, interval: 1400 }],
    [{ type: "sophomore", count: 5, interval: 1500 }],
    [
      { type: "sophomore", count: 6, interval: 1400 },
      { type: "frosh", count: 4, interval: 1200 },
    ],
    [{ type: "junior", count: 3, interval: 2000 }],
    [
      { type: "junior", count: 4, interval: 1800 },
      { type: "sophomore", count: 4, interval: 1500 },
    ],
    [
      { type: "mascot", count: 2, interval: 3000 },
      { type: "sophomore", count: 6, interval: 1400 },
    ],
    [
      { type: "junior", count: 5, interval: 1700 },
      { type: "mascot", count: 2, interval: 2500 },
    ],
    [
      { type: "junior", count: 6, interval: 1600 },
      { type: "senior", count: 2, interval: 3000 },
    ],
    [
      { type: "senior", count: 3, interval: 2500 },
      { type: "junior", count: 4, interval: 1800 },
    ],
    [
      { type: "senior", count: 4, interval: 2200 },
      { type: "mascot", count: 3, interval: 2000 },
    ],
  ],

  nassau: [
    // 12 waves
    [{ type: "sophomore", count: 6, interval: 1400 }],
    [{ type: "junior", count: 4, interval: 1800 }],
    [
      { type: "junior", count: 5, interval: 1600 },
      { type: "sophomore", count: 4, interval: 1400 },
    ],
    [
      { type: "senior", count: 2, interval: 2500 },
      { type: "junior", count: 4, interval: 1800 },
    ],
    [
      { type: "mascot", count: 3, interval: 2500 },
      { type: "junior", count: 5, interval: 1600 },
    ],
    [
      { type: "senior", count: 4, interval: 2200 },
      { type: "mascot", count: 2, interval: 3000 },
    ],
    [
      { type: "archer", count: 3, interval: 2500 },
      { type: "senior", count: 3, interval: 2400 },
    ],
    [
      { type: "gradstudent", count: 2, interval: 3500 },
      { type: "senior", count: 4, interval: 2200 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 3000 },
      { type: "mascot", count: 4, interval: 2000 },
    ],
    [
      { type: "gradstudent", count: 4, interval: 2800 },
      { type: "archer", count: 3, interval: 2500 },
    ],
    [
      { type: "professor", count: 1, interval: 5000 },
      { type: "gradstudent", count: 4, interval: 2500 },
    ],
    [
      { type: "professor", count: 2, interval: 4000 },
      { type: "senior", count: 5, interval: 2000 },
    ],
  ],

  // =====================
  // DESERT REGION - Introduces ranged enemies
  // =====================
  oasis: [
    // 10 waves
    [{ type: "sophomore", count: 6, interval: 1400 }],
    [{ type: "junior", count: 4, interval: 1800 }],
    [
      { type: "archer", count: 2, interval: 2500 },
      { type: "sophomore", count: 5, interval: 1500 },
    ],
    [
      { type: "junior", count: 5, interval: 1700 },
      { type: "archer", count: 2, interval: 2500 },
    ],
    [
      { type: "senior", count: 2, interval: 2800 },
      { type: "junior", count: 4, interval: 1800 },
    ],
    [
      { type: "archer", count: 4, interval: 2200 },
      { type: "senior", count: 2, interval: 2800 },
    ],
    [
      { type: "mascot", count: 3, interval: 2500 },
      { type: "archer", count: 3, interval: 2400 },
    ],
    [
      { type: "senior", count: 4, interval: 2400 },
      { type: "mage", count: 1, interval: 4000 },
    ],
    [
      { type: "gradstudent", count: 2, interval: 3500 },
      { type: "archer", count: 4, interval: 2200 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 3000 },
      { type: "mage", count: 2, interval: 3500 },
    ],
  ],

  pyramid: [
    // 12 waves
    [{ type: "junior", count: 5, interval: 1600 }],
    [
      { type: "archer", count: 3, interval: 2300 },
      { type: "junior", count: 4, interval: 1700 },
    ],
    [
      { type: "senior", count: 3, interval: 2500 },
      { type: "sophomore", count: 5, interval: 1500 },
    ],
    [
      { type: "mage", count: 2, interval: 3500 },
      { type: "junior", count: 5, interval: 1700 },
    ],
    [
      { type: "mascot", count: 4, interval: 2200 },
      { type: "archer", count: 4, interval: 2200 },
    ],
    [
      { type: "senior", count: 4, interval: 2300 },
      { type: "mage", count: 2, interval: 3500 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 3000 },
      { type: "archer", count: 4, interval: 2200 },
    ],
    [
      { type: "catapult", count: 1, interval: 5000 },
      { type: "senior", count: 4, interval: 2400 },
    ],
    [
      { type: "gradstudent", count: 4, interval: 2800 },
      { type: "mage", count: 3, interval: 3000 },
    ],
    [
      { type: "professor", count: 1, interval: 5000 },
      { type: "archer", count: 5, interval: 2000 },
    ],
    [
      { type: "professor", count: 2, interval: 4000 },
      { type: "catapult", count: 1, interval: 5000 },
    ],
    [
      { type: "professor", count: 2, interval: 3500 },
      { type: "gradstudent", count: 4, interval: 2500 },
    ],
  ],

  sphinx: [
    // 14 waves
    [{ type: "senior", count: 4, interval: 2200 }],
    [
      { type: "archer", count: 4, interval: 2100 },
      { type: "senior", count: 3, interval: 2400 },
    ],
    [
      { type: "mage", count: 3, interval: 3000 },
      { type: "junior", count: 5, interval: 1700 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 3000 },
      { type: "archer", count: 4, interval: 2200 },
    ],
    [
      { type: "mascot", count: 5, interval: 2000 },
      { type: "mage", count: 3, interval: 3000 },
    ],
    [
      { type: "catapult", count: 2, interval: 4500 },
      { type: "senior", count: 5, interval: 2200 },
    ],
    [
      { type: "professor", count: 2, interval: 4000 },
      { type: "archer", count: 5, interval: 2000 },
    ],
    [
      { type: "gradstudent", count: 5, interval: 2600 },
      { type: "catapult", count: 2, interval: 4500 },
    ],
    [
      { type: "professor", count: 3, interval: 3500 },
      { type: "mage", count: 4, interval: 2800 },
    ],
    [
      { type: "dean", count: 1, interval: 6000 },
      { type: "gradstudent", count: 4, interval: 2800 },
    ],
    [
      { type: "dean", count: 1, interval: 6000 },
      { type: "professor", count: 2, interval: 3500 },
      { type: "mascot", count: 4, interval: 2200 },
    ],
    [
      { type: "dean", count: 2, interval: 5000 },
      { type: "catapult", count: 2, interval: 4500 },
    ],
    [
      { type: "dean", count: 2, interval: 4500 },
      { type: "professor", count: 3, interval: 3200 },
    ],
    [
      { type: "dean", count: 3, interval: 4000 },
      { type: "mage", count: 5, interval: 2500 },
    ],
  ],

  // =====================
  // WINTER REGION - Harder waves, more variety
  // =====================
  glacier: [
    // 12 waves
    [{ type: "junior", count: 6, interval: 1600 }],
    [{ type: "senior", count: 4, interval: 2200 }],
    [
      { type: "archer", count: 4, interval: 2100 },
      { type: "senior", count: 3, interval: 2400 },
    ],
    [
      { type: "mascot", count: 4, interval: 2200 },
      { type: "junior", count: 5, interval: 1700 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 3000 },
      { type: "senior", count: 4, interval: 2300 },
    ],
    [
      { type: "mage", count: 3, interval: 3000 },
      { type: "archer", count: 4, interval: 2200 },
    ],
    [
      { type: "catapult", count: 1, interval: 5000 },
      { type: "gradstudent", count: 3, interval: 3000 },
    ],
    [
      { type: "professor", count: 2, interval: 4000 },
      { type: "senior", count: 5, interval: 2200 },
    ],
    [
      { type: "mascot", count: 5, interval: 2000 },
      { type: "mage", count: 3, interval: 3000 },
    ],
    [
      { type: "professor", count: 2, interval: 3800 },
      { type: "archer", count: 5, interval: 2000 },
    ],
    [
      { type: "gradstudent", count: 5, interval: 2600 },
      { type: "catapult", count: 2, interval: 4500 },
    ],
    [
      { type: "dean", count: 1, interval: 6000 },
      { type: "professor", count: 2, interval: 3800 },
    ],
  ],

  fortress: [
    // 14 waves
    [{ type: "senior", count: 5, interval: 2100 }],
    [
      { type: "gradstudent", count: 3, interval: 3000 },
      { type: "senior", count: 4, interval: 2200 },
    ],
    [
      { type: "archer", count: 5, interval: 2000 },
      { type: "mage", count: 2, interval: 3500 },
    ],
    [
      { type: "mascot", count: 5, interval: 2000 },
      { type: "gradstudent", count: 3, interval: 3000 },
    ],
    [
      { type: "professor", count: 2, interval: 4000 },
      { type: "senior", count: 5, interval: 2200 },
    ],
    [
      { type: "catapult", count: 2, interval: 4500 },
      { type: "archer", count: 5, interval: 2000 },
    ],
    [
      { type: "gradstudent", count: 5, interval: 2600 },
      { type: "mage", count: 4, interval: 2800 },
    ],
    [
      { type: "professor", count: 3, interval: 3500 },
      { type: "mascot", count: 5, interval: 2000 },
    ],
    [
      { type: "dean", count: 1, interval: 6000 },
      { type: "gradstudent", count: 4, interval: 2800 },
    ],
    [
      { type: "dean", count: 2, interval: 5000 },
      { type: "catapult", count: 2, interval: 4500 },
    ],
    [
      { type: "professor", count: 4, interval: 3200 },
      { type: "mage", count: 5, interval: 2500 },
    ],
    [
      { type: "dean", count: 2, interval: 4800 },
      { type: "professor", count: 3, interval: 3500 },
    ],
    [
      { type: "dean", count: 3, interval: 4500 },
      { type: "archer", count: 6, interval: 1800 },
    ],
    [
      { type: "trustee", count: 1, interval: 8000 },
      { type: "dean", count: 2, interval: 5000 },
    ],
  ],

  peak: [
    // 16 waves
    [{ type: "gradstudent", count: 4, interval: 2800 }],
    [
      { type: "professor", count: 2, interval: 4000 },
      { type: "senior", count: 5, interval: 2200 },
    ],
    [
      { type: "mascot", count: 6, interval: 1800 },
      { type: "archer", count: 4, interval: 2200 },
    ],
    [
      { type: "dean", count: 1, interval: 6000 },
      { type: "gradstudent", count: 4, interval: 2800 },
    ],
    [
      { type: "mage", count: 5, interval: 2500 },
      { type: "catapult", count: 2, interval: 4500 },
    ],
    [
      { type: "professor", count: 4, interval: 3200 },
      { type: "mascot", count: 5, interval: 2000 },
    ],
    [
      { type: "dean", count: 2, interval: 5000 },
      { type: "archer", count: 6, interval: 1800 },
    ],
    [
      { type: "catapult", count: 3, interval: 4000 },
      { type: "mage", count: 4, interval: 2800 },
    ],
    [
      { type: "professor", count: 4, interval: 3200 },
      { type: "gradstudent", count: 5, interval: 2600 },
    ],
    [
      { type: "dean", count: 2, interval: 4800 },
      { type: "catapult", count: 2, interval: 4500 },
    ],
    [
      { type: "trustee", count: 1, interval: 8000 },
      { type: "professor", count: 3, interval: 3500 },
    ],
    [
      { type: "dean", count: 3, interval: 4500 },
      { type: "mascot", count: 6, interval: 1800 },
    ],
    [
      { type: "trustee", count: 1, interval: 7000 },
      { type: "dean", count: 2, interval: 4800 },
    ],
    [
      { type: "trustee", count: 1, interval: 7000 },
      { type: "professor", count: 4, interval: 3200 },
      { type: "mage", count: 4, interval: 2800 },
    ],
    [
      { type: "trustee", count: 2, interval: 6000 },
      { type: "dean", count: 2, interval: 5000 },
    ],
    [
      { type: "trustee", count: 2, interval: 5500 },
      { type: "catapult", count: 3, interval: 4000 },
    ],
  ],

  // =====================
  // VOLCANIC REGION - Hardest waves, boss-heavy
  // =====================
  lava: [
    // 14 waves
    [{ type: "senior", count: 6, interval: 2000 }],
    [
      { type: "gradstudent", count: 4, interval: 2800 },
      { type: "archer", count: 4, interval: 2200 },
    ],
    [
      { type: "professor", count: 2, interval: 4000 },
      { type: "mage", count: 3, interval: 3000 },
    ],
    [
      { type: "mascot", count: 6, interval: 1800 },
      { type: "senior", count: 5, interval: 2200 },
    ],
    [
      { type: "catapult", count: 2, interval: 4500 },
      { type: "gradstudent", count: 4, interval: 2800 },
    ],
    [
      { type: "dean", count: 1, interval: 6000 },
      { type: "professor", count: 3, interval: 3500 },
    ],
    [
      { type: "mage", count: 5, interval: 2500 },
      { type: "archer", count: 6, interval: 1800 },
    ],
    [
      { type: "dean", count: 2, interval: 5000 },
      { type: "catapult", count: 2, interval: 4500 },
    ],
    [
      { type: "professor", count: 4, interval: 3200 },
      { type: "mascot", count: 6, interval: 1800 },
    ],
    [
      { type: "trustee", count: 1, interval: 8000 },
      { type: "dean", count: 2, interval: 5000 },
    ],
    [
      { type: "dean", count: 3, interval: 4500 },
      { type: "mage", count: 5, interval: 2500 },
    ],
    [
      { type: "trustee", count: 1, interval: 7000 },
      { type: "professor", count: 4, interval: 3200 },
    ],
    [
      { type: "trustee", count: 2, interval: 6000 },
      { type: "catapult", count: 3, interval: 4000 },
    ],
    [
      { type: "trustee", count: 2, interval: 5500 },
      { type: "dean", count: 2, interval: 5000 },
    ],
  ],

  crater: [
    // 16 waves
    [{ type: "gradstudent", count: 5, interval: 2600 }],
    [
      { type: "professor", count: 3, interval: 3500 },
      { type: "archer", count: 5, interval: 2000 },
    ],
    [
      { type: "dean", count: 1, interval: 6000 },
      { type: "mage", count: 4, interval: 2800 },
    ],
    [
      { type: "catapult", count: 3, interval: 4000 },
      { type: "gradstudent", count: 5, interval: 2600 },
    ],
    [
      { type: "mascot", count: 7, interval: 1600 },
      { type: "professor", count: 3, interval: 3500 },
    ],
    [
      { type: "dean", count: 2, interval: 5000 },
      { type: "archer", count: 6, interval: 1800 },
    ],
    [
      { type: "professor", count: 5, interval: 3000 },
      { type: "catapult", count: 2, interval: 4500 },
    ],
    [
      { type: "trustee", count: 1, interval: 8000 },
      { type: "dean", count: 2, interval: 5000 },
    ],
    [
      { type: "mage", count: 6, interval: 2300 },
      { type: "mascot", count: 6, interval: 1800 },
    ],
    [
      { type: "dean", count: 3, interval: 4500 },
      { type: "professor", count: 4, interval: 3200 },
    ],
    [
      { type: "trustee", count: 2, interval: 6000 },
      { type: "catapult", count: 3, interval: 4000 },
    ],
    [
      { type: "trustee", count: 2, interval: 5500 },
      { type: "mage", count: 5, interval: 2500 },
    ],
    [
      { type: "dean", count: 4, interval: 4200 },
      { type: "archer", count: 7, interval: 1600 },
    ],
    [
      { type: "trustee", count: 2, interval: 5500 },
      { type: "dean", count: 2, interval: 5000 },
    ],
    [
      { type: "trustee", count: 3, interval: 5000 },
      { type: "professor", count: 5, interval: 3000 },
    ],
    [
      { type: "trustee", count: 3, interval: 4500 },
      { type: "catapult", count: 4, interval: 3800 },
    ],
  ],

  throne: [
    // The ultimate challenge - 20 brutal waves
    [{ type: "professor", count: 4, interval: 3200 }],
    [
      { type: "dean", count: 2, interval: 5000 },
      { type: "gradstudent", count: 5, interval: 2600 },
    ],
    [
      { type: "mage", count: 5, interval: 2500 },
      { type: "archer", count: 6, interval: 1800 },
    ],
    [
      { type: "catapult", count: 3, interval: 4000 },
      { type: "professor", count: 4, interval: 3200 },
    ],
    [
      { type: "trustee", count: 1, interval: 8000 },
      { type: "dean", count: 2, interval: 5000 },
    ],
    [
      { type: "mascot", count: 8, interval: 1500 },
      { type: "mage", count: 5, interval: 2500 },
    ],
    [
      { type: "dean", count: 3, interval: 4500 },
      { type: "catapult", count: 3, interval: 4000 },
    ],
    [
      { type: "professor", count: 5, interval: 3000 },
      { type: "archer", count: 7, interval: 1600 },
    ],
    [
      { type: "trustee", count: 2, interval: 6000 },
      { type: "dean", count: 2, interval: 5000 },
    ],
    [
      { type: "mage", count: 6, interval: 2300 },
      { type: "catapult", count: 4, interval: 3800 },
    ],
    [
      { type: "dean", count: 4, interval: 4200 },
      { type: "professor", count: 4, interval: 3200 },
    ],
    [
      { type: "trustee", count: 2, interval: 5500 },
      { type: "mascot", count: 8, interval: 1500 },
    ],
    [
      { type: "catapult", count: 4, interval: 3800 },
      { type: "mage", count: 6, interval: 2300 },
    ],
    [
      { type: "trustee", count: 3, interval: 5000 },
      { type: "archer", count: 8, interval: 1500 },
    ],
    [
      { type: "dean", count: 4, interval: 4200 },
      { type: "catapult", count: 4, interval: 3800 },
    ],
    [
      { type: "trustee", count: 3, interval: 4800 },
      { type: "professor", count: 6, interval: 2800 },
    ],
    [
      { type: "mage", count: 7, interval: 2100 },
      { type: "mascot", count: 8, interval: 1500 },
    ],
    [
      { type: "trustee", count: 3, interval: 4500 },
      { type: "dean", count: 3, interval: 4500 },
    ],
    [
      { type: "catapult", count: 5, interval: 3500 },
      { type: "trustee", count: 2, interval: 5500 },
    ],
    // Final wave - the ultimate test
    [
      { type: "trustee", count: 4, interval: 4000 },
      { type: "dean", count: 4, interval: 4200 },
      { type: "professor", count: 5, interval: 3000 },
    ],
  ],
};

// Legacy WAVES array for backwards compatibility (defaults to poe waves)
export const WAVES: WaveGroup[][] = LEVEL_WAVES.poe;

// Hero options for selection
export const HERO_OPTIONS: HeroType[] = [
  "tiger",
  "tenor",
  "mathey",
  "rocky",
  "scott",
  "captain",
  "engineer",
];

// Spell options for selection
export const SPELL_OPTIONS: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "payday",
  "reinforcements",
];

// Game constants
export const HERO_PATH_HITBOX_SIZE = 50;
export const TOWER_PLACEMENT_BUFFER = 40;
export const INITIAL_PAW_POINTS = 300;
export const INITIAL_LIVES = 20;
export const WAVE_TIMER_BASE = 10000;
export const HERO_RESPAWN_TIME = 15000;
export const TROOP_SPREAD_RADIUS = 45;
export const ENEMY_SPAWN_FADE_DURATION = 500;
export const ENEMY_DESPAWN_FADE_DURATION = 500;
export const MAX_STATION_TROOPS = 3;

// Hero ability cooldowns
export const HERO_ABILITY_COOLDOWNS: Record<HeroType, number> = {
  tiger: 18000,
  tenor: 12000,
  mathey: 22000,
  rocky: 15000,
  scott: 25000,
  captain: 30000,
  engineer: 35000,
};

// Particle colors
export const PARTICLE_COLORS: Record<string, string[]> = {
  spark: ["#ffd700", "#ffaa00", "#ff8800", "#ffffff"],
  glow: ["#88ffff", "#aaffff", "#ffffff", "#66ddff"],
  smoke: ["#666666", "#888888", "#aaaaaa", "#cccccc"],
  explosion: ["#ff4400", "#ff6600", "#ff8800", "#ffaa00", "#ffcc00"],
  light: ["#ffffcc", "#ffffaa", "#ffff88", "#ffffff"],
  magic: ["#ff00ff", "#aa00ff", "#ff44ff", "#cc00cc"],
  gold: ["#ffd700", "#ffcc00", "#ffaa00", "#fff8dc"],
  fire: ["#ff4400", "#ff6600", "#ff8800", "#ffaa00"],
  ice: ["#88ffff", "#aaffff", "#ffffff", "#66ddff"],
};

// Tower colors
export const TOWER_COLORS: Record<
  TowerType,
  { base: string; dark: string; accent: string; light: string }
> = {
  cannon: {
    base: "#4a4a52",
    dark: "#2a2a32",
    accent: "#ff6600",
    light: "#6a6a72",
  },
  library: {
    base: "#8b4513",
    dark: "#5c2e0d",
    accent: "#daa520",
    light: "#a65d33",
  },
  lab: {
    base: "#2d5a7b",
    dark: "#1a3a4f",
    accent: "#00ffff",
    light: "#4d7a9b",
  },
  arch: {
    base: "#6b5b4f",
    dark: "#4a3f37",
    accent: "#9370db",
    light: "#8b7b6f",
  },
  club: {
    base: "#228b22",
    dark: "#145214",
    accent: "#ffd700",
    light: "#42ab42",
  },
  station: {
    base: "#8b0000",
    dark: "#5c0000",
    accent: "#ffffff",
    light: "#ab2020",
  },
};
