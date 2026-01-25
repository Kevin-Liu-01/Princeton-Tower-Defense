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
  MapDecoration,
  MapHazard,
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
    name: "Nassau Cannon",
    icon: "💣",
    cost: 100,
    damage: 65,
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
    damage: 45,
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
    damage: 28,
    range: 260,
    attackSpeed: 600,
    desc: "Sonic attacks hit air and ground.",
    levelDesc: {
      1: "Sound Waves - Single target sonic",
      2: "Resonance - Hits 2 targets, 1.5x damage",
      3: "Elite Archers - Hits 3 targets, 30% faster",
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
      1: "Basic Club - 8 PP per 8 seconds",
      2: "Popular Club - 15 PP per 7 seconds + bonus on kills nearby",
      3: "Grand Club - 25 PP per 6 seconds + slow enemies in range",
      4: "Choose: Investment Bank or Recruitment Center",
    },
    upgrades: {
      A: {
        name: "Investment Bank",
        desc: "Maximum passive income",
        effect: "40 PP every 5s + 10% bonus on all income",
      },
      B: {
        name: "Recruitment Center",
        desc: "Income + tower support",
        effect: "20 PP every 6s + 15% damage buff to nearby towers",
      },
    },
  },
};

// Enemy data with visual properties
export const ENEMY_DATA: Record<EnemyType, EnemyData> = {
  frosh: {
    name: "Writing Sem",
    hp: 160,
    speed: 0.35,
    bounty: 12,
    armor: 0,
    flying: false,
    desc: "The first hurdle. Persistence is key.",
    color: "#4ade80",
    size: 20,
  },
  sophomore: {
    name: "Sophomore Slump",
    hp: 300,
    speed: 0.3,
    bounty: 18,
    armor: 0.1,
    flying: false,
    desc: "Heavy and demotivating. Harder to push through.",
    color: "#60a5fa",
    size: 22,
  },
  junior: {
    name: "Junior Paper",
    hp: 550,
    speed: 0.28,
    bounty: 30,
    armor: 0.2,
    flying: false,
    desc: "A significant research obstacle. Requires focus.",
    color: "#c084fc",
    size: 24,
  },
  senior: {
    name: "Senior Thesis",
    hp: 950,
    speed: 0.22,
    bounty: 50,
    armor: 0.3,
    flying: false,
    desc: "The ultimate academic titan. Slow but massive.",
    color: "#f472b6",
    size: 28,
  },
  gradstudent: {
    name: "Grad School App",
    hp: 1400,
    speed: 0.18,
    bounty: 75,
    armor: 0.3,
    flying: false,
    desc: "An exhausting, soul-crushing process.",
    color: "#fb923c",
    size: 30,
  },
  professor: {
    name: "Tenured Professor",
    hp: 2200,
    speed: 0.15,
    bounty: 100,
    armor: 0.4,
    flying: false,
    desc: "Immutable and deeply entrenched.",
    color: "#ef4444",
    size: 32,
  },
  dean: {
    name: "Dean of College",
    hp: 3500,
    speed: 0.14,
    bounty: 150,
    armor: 0.45,
    flying: false,
    desc: "A massive administrative wall.",
    color: "#a855f7",
    size: 36,
  },
  trustee: {
    name: "Board of Trustees",
    hp: 7500,
    speed: 0.11,
    bounty: 300,
    armor: 0.55,
    flying: false,
    desc: "The final authority. Practically immovable.",
    color: "#eab308",
    size: 42,
  },
  mascot: {
    name: "Rival Mascot",
    hp: 450,
    speed: 0.5,
    bounty: 60,
    armor: 0,
    flying: true,
    desc: "Flying distraction from other schools.",
    color: "#22d3d3",
    size: 26,
  },
  archer: {
    name: "P-Rade Marshall",
    hp: 250,
    speed: 0.28,
    bounty: 25,
    armor: 0.1,
    flying: false,
    isRanged: true,
    range: 220,
    attackSpeed: 2200,
    projectileDamage: 30,
    desc: "Directs traffic and shoots order-enforcing arrows.",
    color: "#10b981",
    size: 22,
  },
  mage: {
    name: "Pre-Med Student",
    hp: 400,
    speed: 0.22,
    bounty: 55,
    armor: 0.15,
    flying: false,
    isRanged: true,
    range: 180,
    attackSpeed: 2800,
    projectileDamage: 55,
    desc: "Throws volatile organic chemistry flasks.",
    color: "#8b5cf6",
    size: 24,
  },
  catapult: {
    name: "Grad School Application",
    hp: 1100,
    speed: 0.14,
    bounty: 90,
    armor: 0.4,
    flying: false,
    isRanged: true,
    range: 240,
    attackSpeed: 4500,
    projectileDamage: 100,
    desc: "Heavy burdens launched from a distance.",
    color: "#854d0e",
    size: 34,
  },
  warlock: {
    name: "Job Recruiter",
    hp: 500,
    speed: 0.2,
    bounty: 70,
    armor: 0.2,
    flying: false,
    isRanged: true,
    range: 180,
    attackSpeed: 2400,
    projectileDamage: 70,
    desc: "Promises high salaries while draining your spirit.",
    color: "#4c1d95",
    size: 28,
  },
  crossbowman: {
    name: "Heavy Security",
    hp: 600,
    speed: 0.24,
    bounty: 50,
    armor: 0.35,
    flying: false,
    isRanged: true,
    range: 200,
    attackSpeed: 3500,
    projectileDamage: 65,
    desc: "Armored patrol with high-impact bolts.",
    color: "#78350f",
    size: 24,
  },
  hexer: {
    name: "Dance Group Auditions",
    hp: 350,
    speed: 0.28,
    bounty: 50,
    armor: 0.1,
    flying: false,
    isRanged: true,
    range: 160,
    attackSpeed: 2000,
    projectileDamage: 40,
    desc: "Hypnotic movements that curse your defenders.",
    color: "#be185d",
    size: 22,
  },
  harpy: {
    name: "Late Meal Rush",
    hp: 380,
    speed: 0.6,
    bounty: 45,
    armor: 0.05,
    flying: true,
    desc: "Swift and chaotic flying hunger.",
    color: "#7c3aed",
    size: 24,
  },
  wyvern: {
    name: "Tiger Transit Bus",
    hp: 1200,
    speed: 0.36,
    bounty: 110,
    armor: 0.3,
    flying: true,
    desc: "A massive flying vehicle that stops for no one.",
    color: "#059669",
    size: 36,
  },
  specter: {
    name: "Firestone Ghost",
    hp: 700,
    speed: 0.4,
    bounty: 80,
    armor: 0.6,
    flying: true,
    desc: "Faded spirit of an alum. Resistant to physical hits.",
    color: "#94a3b8",
    size: 26,
  },
  berserker: {
    name: "Cane Spree Athlete",
    hp: 850,
    speed: 0.5,
    bounty: 65,
    armor: 0,
    flying: false,
    desc: "High energy ground unit charging forward.",
    color: "#dc2626",
    size: 26,
  },
  golem: {
    name: "Nassau Lion",
    hp: 4500,
    speed: 0.09,
    bounty: 150,
    armor: 0.65,
    flying: false,
    desc: "The stone guardian itself. Near-infinite HP.",
    color: "#57534e",
    size: 44,
  },
  necromancer: {
    name: "Admissions Officer",
    hp: 900,
    speed: 0.18,
    bounty: 100,
    armor: 0.2,
    flying: false,
    desc: "Raises 'rejected' spirits to haunt the path.",
    color: "#1e1b4b",
    size: 30,
  },
  shadow_knight: {
    name: "Alumni Donor",
    hp: 1800,
    speed: 0.22,
    bounty: 120,
    armor: 0.5,
    flying: false,
    desc: "A powerful figure backed by immense resources.",
    color: "#18181b",
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
    isRanged: false,
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
    isRanged: true,
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
    isRanged: false,
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
    isRanged: true,
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
    isRanged: true,
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
    isRanged: false,
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
    isRanged: true,
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
    hp: 500,
    damage: 30,
    attackSpeed: 1000,
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
    isStationary: true,
  },
};

// =============================================================================
// MAP PATHS - All regions including secondary paths for dual-path levels
// =============================================================================
export const MAP_PATHS: Record<string, { x: number; y: number }[]> = {
  // =====================
  // GRASSLAND REGION (Princeton Grounds)
  // =====================
  poe: [
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
    { x: 26, y: 6 },
  ],
  carnegie: [
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
    { x: 17, y: 17 },
  ],
  nassau: [
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
    { x: 26, y: 9 },
  ],
  // =====================
  // SWAMP REGION (Murky Marshes) - NEW
  // =====================
  bog: [
    { x: -2, y: 6 },
    { x: 4, y: 6 },
    { x: 4, y: 10 },
    { x: 8, y: 10 },
    { x: 8, y: 6 },
    { x: 12, y: 6 },
    { x: 12, y: 10 },
    { x: 16, y: 10 },
    { x: 16, y: 6 },
    { x: 20, y: 6 },
    { x: 24, y: 6 },
    { x: 26, y: 6 },
  ],
  witch_hut: [
    { x: 10, y: -2 },
    { x: 10, y: 0 },
    { x: 6, y: 0 },
    { x: 6, y: 4 },
    { x: 6, y: 8 },
    { x: 10, y: 8 },
    { x: 14, y: 8 },
    { x: 14, y: 4 },
    { x: 18, y: 4 },
    { x: 18, y: 8 },
    { x: 18, y: 12 },
    { x: 18, y: 17 },
  ],
  sunken_temple: [
    { x: -2, y: 4 },
    { x: 4, y: 4 },
    { x: 8, y: 4 },
    { x: 8, y: 8 },
    { x: 12, y: 8 },
    { x: 16, y: 8 },
    { x: 16, y: 12 },
    { x: 20, y: 12 },
    { x: 24, y: 12 },
    { x: 26, y: 12 },
  ],
  // Secondary path for sunken temple - comes from bottom, merges at x:16 y:8, ends at same point
  sunken_temple_b: [
    { x: -2, y: 12 },
    { x: 4, y: 12 },
    { x: 8, y: 12 },
    { x: 12, y: 12 },
    { x: 12, y: 8 },
    { x: 16, y: 8 },
    { x: 16, y: 4 },
    { x: 20, y: 4 },
    { x: 24, y: 4 },
    { x: 26, y: 4 },
  ],
  // =====================
  // DESERT REGION (Sahara Sands)
  // =====================
  oasis: [
    { x: -2, y: 5 },
    { x: 4, y: 5 },
    { x: 4, y: 9 },
    { x: 8, y: 9 },
    { x: 12, y: 9 },
    { x: 12, y: 5 },
    { x: 16, y: 5 },
    { x: 20, y: 5 },
    { x: 20, y: 9 },
    { x: 24, y: 9 },
    { x: 26, y: 9 },
  ],
  pyramid: [
    { x: 10, y: -2 },
    { x: 10, y: 0 },
    { x: 6, y: 0 },
    { x: 6, y: 4 },
    { x: 6, y: 8 },
    { x: 6, y: 12 },
    { x: 10, y: 12 },
    { x: 10, y: 16 },
    { x: 10, y: 17 },
  ],
  // Secondary path for pyramid - comes from the right, merges at y:12, ends at same point
  pyramid_b: [
    { x: 26, y: 8 },
    { x: 24, y: 8 },
    { x: 20, y: 8 },
    { x: 16, y: 8 },
    { x: 16, y: 12 },
    { x: 10, y: 12 },
    { x: 10, y: 16 },
    { x: 10, y: 17 },
  ],
  sphinx: [
    { x: -2, y: 8 },
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
    { x: 26, y: 8 },
  ],
  // =====================
  // WINTER REGION (Frozen Frontier)
  // =====================
  glacier: [
    { x: -2, y: 6 },
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
    { x: 26, y: 6 },
  ],
  fortress: [
    { x: 10, y: -2 },
    { x: 6, y: -2 },
    { x: 6, y: 0 },
    { x: 6, y: 4 },
    { x: 10, y: 4 },
    { x: 14, y: 4 },
    { x: 14, y: 8 },
    { x: 10, y: 8 },
    { x: 10, y: 12 },
    { x: 14, y: 12 },
    { x: 14, y: 16 },
    { x: 14, y: 17 },
  ],
  peak: [
    { x: -2, y: 10 },
    { x: 0, y: 10 },
    { x: 0, y: 6 },
    { x: 4, y: 6 },
    { x: 8, y: 6 },
    { x: 8, y: 10 },
    { x: 12, y: 10 },
    { x: 16, y: 10 },
    { x: 20, y: 10 },
    { x: 24, y: 10 },
    { x: 26, y: 10 },
  ],
  // Secondary path for peak - comes from top, zigzags down, merges at y:10, ends at same point
  peak_b: [
    { x: 15, y: -2 },
    { x: 15, y: 0 },
    { x: 14, y: 0 },
    { x: 14, y: 4 },
    { x: 12, y: 4 },
    { x: 12, y: 10 }, // Merge point with primary path
    { x: 16, y: 10 },
    { x: 20, y: 10 },
    { x: 24, y: 10 },
    { x: 26, y: 10 },
  ],
  // =====================
  // VOLCANIC REGION (Inferno Depths)
  // =====================
  lava: [
    { x: -2, y: 7 },
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
    { x: 26, y: 7 },
  ],
  crater: [
    { x: 10, y: -2 },
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
    { x: 10, y: 17 },
  ],
  throne: [
    { x: -2, y: 5 },
    { x: 0, y: 5 },
    { x: 0, y: 7 },
    { x: 4, y: 7 },
    { x: 4, y: 5 },
    { x: 8, y: 5 },
    { x: 8, y: 3 },
    { x: 12, y: 3 },
    { x: 12, y: 5 },
    { x: 16, y: 5 },
    { x: 20, y: 5 }, // MERGE POINT
    { x: 24, y: 5 },
    { x: 26, y: 5 },
  ],
  // Secondary path for throne - comes from bottom, merges at x:20, ends at same point
  throne_b: [
    { x: -2, y: 12 },
    { x: 4, y: 12 },
    { x: 8, y: 12 },
    { x: 12, y: 12 },
    { x: 16, y: 12 },
    { x: 16, y: 8 },
    { x: 20, y: 8 },
    { x: 20, y: 5 }, // Merge point with primary path
    { x: 24, y: 5 },
    { x: 26, y: 5 },
  ],
};

// =============================================================================
// LEVEL DATA - All regions with theme info and wave count
// =============================================================================
export type MapTheme = "grassland" | "desert" | "winter" | "volcanic" | "swamp";

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
    startingPawPoints: number; // Starting resources for this level
    previewImage?: string;
    // NEW: Map features
    dualPath?: boolean; // Has two enemy spawn paths
    secondaryPath?: string; // Key for second path in MAP_PATHS
    specialTower?: {
      // Special interactive structure
      pos: { x: number; y: number };
      type: "vault" | "beacon" | "shrine" | "barracks";
      hp?: number; // For destructible objectives
    };
    decorations?: MapDecoration[]; // Map-specific decorations
    hazards?: MapHazard[]; // Environmental hazards
  }
> = {
  // =====================
  // GRASSLAND REGION - Princeton Grounds
  // =====================
  poe: {
    name: "Poe Field",
    position: { x: 120, y: 200 },
    description:
      "Training grounds for new defenders. A peaceful meadow where recruits learn the basics.",
    camera: { offset: { x: -100, y: -220 }, zoom: 1.1 },
    region: "grassland",
    theme: "grassland",
    difficulty: 1,
    startingPawPoints: 350, // Easy tutorial level - generous starting funds
    previewImage: "/images/previews/poe.png",
    decorations: [
      { type: "tree", pos: { x: 2, y: 0 }, variant: 0 },
      { type: "tree", pos: { x: 22, y: 0 }, variant: 1 },
      { type: "tree", pos: { x: 24, y: 14 }, variant: 0 },
      { type: "bush", pos: { x: 0, y: 14 }, variant: 0 },
      { type: "bush", pos: { x: 18, y: 0 }, variant: 1 },
      { type: "rock", pos: { x: 4, y: 14 }, variant: 0 },
      { type: "flowers", pos: { x: 12, y: 0 }, variant: 0 },
      { type: "signpost", pos: { x: -4, y: 3 }, variant: 0 },
      { type: "statue", pos: { x: 11.5, y: 3 }, variant: 0 },
      { type: "lamppost", pos: { x: 11, y: 8 }, variant: 0 },
      { type: "lamppost", pos: { x: 8, y: 2 }, variant: 0 },
      { type: "lamppost", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "lamppost", pos: { x: 7.5, y: 10 }, variant: 0 },
      { type: "lamppost", pos: { x: 14, y: 12 }, variant: 0 },
      { type: "lamppost", pos: { x: 18, y: 4.8 }, variant: 0 },
      { type: "lamppost", pos: { x: 18, y: 7 }, variant: 0 },
      // Expanded outer area decorations
      { type: "tree", pos: { x: -6, y: -4 }, variant: 2 },
      { type: "tree", pos: { x: -8, y: 2 }, variant: 0 },
      { type: "tree", pos: { x: -5, y: 8 }, variant: 1 },
      { type: "tree", pos: { x: -7, y: 14 }, variant: 0 },
      { type: "tree", pos: { x: -4, y: 20 }, variant: 2 },
      { type: "tree", pos: { x: 28, y: -2 }, variant: 1 },
      { type: "tree", pos: { x: 30, y: 4 }, variant: 0 },
      { type: "tree", pos: { x: 26, y: 10 }, variant: 2 },
      { type: "tree", pos: { x: 28, y: 18 }, variant: 1 },
      { type: "tree", pos: { x: 4, y: -6 }, variant: 0 },
      { type: "tree", pos: { x: 12, y: -4 }, variant: 1 },
      { type: "tree", pos: { x: 8, y: 20 }, variant: 2 },
      { type: "tree", pos: { x: 16, y: 22 }, variant: 0 },
      { type: "bush", pos: { x: -3, y: 6 }, variant: 0 },
      { type: "bush", pos: { x: 25, y: 8 }, variant: 1 },
      { type: "rock", pos: { x: -6, y: 12 }, variant: 1 },
      { type: "rock", pos: { x: 27, y: 2 }, variant: 0 },
      { type: "flowers", pos: { x: -2, y: -2 }, variant: 1 },
      { type: "flowers", pos: { x: 24, y: 20 }, variant: 0 },
      { type: "bench", pos: { x: -5, y: 10 }, variant: 0 },
      { type: "fence", pos: { x: 26, y: 6 }, variant: 0 },
      { type: "cart", pos: { x: -7, y: 18 }, variant: 0 },
      { type: "tent", pos: { x: 28, y: 16 }, variant: 0 },
      { type: "campfire", pos: { x: 29, y: 14 }, variant: 0 },
    ],
  },
  carnegie: {
    name: "Carnegie Lake",
    position: { x: 300, y: 120 },
    description:
      "Strategic lakeside defense. The gleaming waters hide ancient secrets.",
    camera: { offset: { x: -150, y: -240 }, zoom: 1.15 },
    region: "grassland",
    theme: "grassland",
    difficulty: 2,
    startingPawPoints: 400, // Medium difficulty - more waves
    decorations: [
      { type: "oasis_pool", pos: { x: 0, y: 10 }, variant: 0, size: 3 },
      { type: "dock", pos: { x: 0, y: 14 }, variant: 0 },
      { type: "boat", pos: { x: 2, y: 12 }, variant: 0 },
      { type: "tree", pos: { x: 0, y: 0 }, variant: 2 },
      { type: "tree", pos: { x: 22, y: 0 }, variant: 0 },
      { type: "reeds", pos: { x: 4, y: 14 }, variant: 0 },
      { type: "bench", pos: { x: 20, y: 14 }, variant: 0 },
      { type: "statue", pos: { x: 11, y: 6 }, variant: 0 },
      { type: "lamppost", pos: { x: 8.5, y: 8 }, variant: 0 },
      { type: "lamppost", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "lamppost", pos: { x: 11, y: 8 }, variant: 0 },
      { type: "lamppost", pos: { x: 8, y: 2 }, variant: 0 },
      { type: "lamppost", pos: { x: 14, y: 3.4 }, variant: 0 },
      { type: "lamppost", pos: { x: 18, y: 14 }, variant: 0 },
      { type: "lamppost", pos: { x: 15.5, y: 14 }, variant: 0 },
      { type: "hedge", pos: { x: 14, y: 14 }, variant: 0 },
      { type: "bench", pos: { x: 12, y: 2 }, variant: 0 },
      // Expanded outer area decorations - lake theme
      { type: "tree", pos: { x: -6, y: -2 }, variant: 0 },
      { type: "tree", pos: { x: -8, y: 4 }, variant: 1 },
      { type: "tree", pos: { x: -5, y: 10 }, variant: 2 },
      { type: "tree", pos: { x: -7, y: 18 }, variant: 0 },
      { type: "tree", pos: { x: 28, y: -4 }, variant: 1 },
      { type: "tree", pos: { x: 30, y: 6 }, variant: 2 },
      { type: "tree", pos: { x: 26, y: 12 }, variant: 0 },
      { type: "tree", pos: { x: 28, y: 20 }, variant: 1 },
      { type: "tree", pos: { x: 6, y: -6 }, variant: 2 },
      { type: "tree", pos: { x: 14, y: -4 }, variant: 0 },
      { type: "tree", pos: { x: 10, y: 22 }, variant: 1 },
      { type: "tree", pos: { x: 18, y: 20 }, variant: 2 },
      { type: "oasis_pool", pos: { x: -6, y: 16 }, variant: 0, size: 2 },
      { type: "reeds", pos: { x: -4, y: 14 }, variant: 1 },
      { type: "reeds", pos: { x: 26, y: 18 }, variant: 0 },
      { type: "dock", pos: { x: -5, y: 20 }, variant: 0 },
      { type: "boat", pos: { x: -3, y: 18 }, variant: 1 },
      { type: "fishing_spot", pos: { x: 28, y: 10 }, variant: 0 },
      { type: "bench", pos: { x: -4, y: 8 }, variant: 0 },
      { type: "bench", pos: { x: 26, y: 4 }, variant: 1 },
      { type: "flowers", pos: { x: -2, y: -4 }, variant: 0 },
      { type: "flowers", pos: { x: 24, y: -2 }, variant: 1 },
      { type: "rock", pos: { x: -7, y: 6 }, variant: 0 },
      { type: "rock", pos: { x: 29, y: 14 }, variant: 1 },
    ],
    previewImage: "/images/previews/carnegie.png",
  },
  nassau: {
    name: "Nassau Hall",
    position: { x: 480, y: 200 },
    description:
      "The final stand at the heart of campus. Defend the iconic building at all costs!",
    camera: { offset: { x: -100, y: -200 }, zoom: 1.15 },
    region: "grassland",
    theme: "grassland",
    difficulty: 3,
    startingPawPoints: 500, // Hard level with beacon - need more towers
    specialTower: {
      pos: { x: 10, y: 4 },
      type: "beacon",
    },
    decorations: [
      { type: "nassau_hall", pos: { x: 9.5, y: -1 }, variant: 0, size: 2 },
      { type: "statue", pos: { x: 0, y: 2 }, variant: 0 },
      { type: "fountain", pos: { x: 16, y: 4 }, variant: 0 },
      { type: "tree", pos: { x: 10, y: 0 }, variant: 1 },
      { type: "tree", pos: { x: 26, y: 14 }, variant: 0 },
      { type: "bench", pos: { x: 6, y: 2 }, variant: 0 },
      { type: "lamppost", pos: { x: 24, y: 2 }, variant: 0 },
      { type: "hedge", pos: { x: 10, y: 14 }, variant: 0 },
      // more lampposts around path
      { type: "lamppost", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "lamppost", pos: { x: 5, y: 9 }, variant: 0 },
      { type: "lamppost", pos: { x: 10, y: 8 }, variant: 0 },
      { type: "lamppost", pos: { x: 14, y: 10 }, variant: 0 },
      { type: "lamppost", pos: { x: 12, y: 4 }, variant: 0 },
      { type: "lamppost", pos: { x: 18, y: 14 }, variant: 0 },
      { type: "lamppost", pos: { x: 18, y: 8 }, variant: 0 },
      { type: "bench", pos: { x: 12, y: 5 }, variant: 0 },
      // Expanded outer area - grand campus entrance
      { type: "tree", pos: { x: -6, y: -4 }, variant: 0 },
      { type: "tree", pos: { x: -8, y: 2 }, variant: 1 },
      { type: "tree", pos: { x: -5, y: 8 }, variant: 2 },
      { type: "tree", pos: { x: -7, y: 16 }, variant: 0 },
      { type: "tree", pos: { x: -4, y: 22 }, variant: 1 },
      { type: "tree", pos: { x: 28, y: -6 }, variant: 2 },
      { type: "tree", pos: { x: 30, y: 2 }, variant: 0 },
      { type: "tree", pos: { x: 28, y: 10 }, variant: 1 },
      { type: "tree", pos: { x: 26, y: 18 }, variant: 2 },
      { type: "tree", pos: { x: 30, y: 22 }, variant: 0 },
      { type: "tree", pos: { x: 4, y: -8 }, variant: 1 },
      { type: "tree", pos: { x: 18, y: -6 }, variant: 2 },
      { type: "tree", pos: { x: 6, y: 22 }, variant: 0 },
      { type: "tree", pos: { x: 14, y: 24 }, variant: 1 },
      { type: "hedge", pos: { x: -4, y: 4 }, variant: 0 },
      { type: "hedge", pos: { x: -4, y: 12 }, variant: 1 },
      { type: "hedge", pos: { x: 26, y: 6 }, variant: 0 },
      { type: "hedge", pos: { x: 26, y: 14 }, variant: 1 },
      { type: "fountain", pos: { x: -6, y: 10 }, variant: 1 },
      { type: "statue", pos: { x: 28, y: 4 }, variant: 1 },
      { type: "bench", pos: { x: -3, y: 6 }, variant: 0 },
      { type: "bench", pos: { x: 25, y: 8 }, variant: 1 },
      { type: "lamppost", pos: { x: -5, y: 0 }, variant: 0 },
      { type: "lamppost", pos: { x: -5, y: 14 }, variant: 0 },
      { type: "lamppost", pos: { x: 27, y: 0 }, variant: 0 },
      { type: "lamppost", pos: { x: 27, y: 12 }, variant: 0 },
      { type: "flowers", pos: { x: -2, y: -2 }, variant: 0 },
      { type: "flowers", pos: { x: 24, y: -4 }, variant: 1 },
      { type: "flowers", pos: { x: 8, y: 20 }, variant: 2 },
      { type: "gate", pos: { x: -8, y: 6 }, variant: 0 },
      { type: "flag", pos: { x: 28, y: -2 }, variant: 0 },
    ],
    previewImage: "/images/previews/nassau.png",
  },
  // =====================
  // SWAMP REGION - Murky Marshes (NEW)
  // =====================
  bog: {
    name: "Murky Bog",
    position: { x: 120, y: 200 },
    description:
      "Treacherous wetlands filled with mist and mystery. Watch your step!",
    camera: { offset: { x: -100, y: -220 }, zoom: 1.1 },
    region: "swamp",
    theme: "swamp",
    difficulty: 1,
    startingPawPoints: 400, // Swamp intro - hexers require strategy
    decorations: [
      { type: "swamp_tree", pos: { x: 2, y: 2 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 22, y: 2 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 24, y: 14 }, variant: 2 },
      { type: "lily_pads", pos: { x: 0, y: 14 }, variant: 0 },
      { type: "mushroom_cluster", pos: { x: 18, y: 2 }, variant: 0 },
      { type: "mushroom_cluster", pos: { x: 2, y: 14 }, variant: 1 },
      { type: "fog_patch", pos: { x: 10, y: 2 }, variant: 0 },
      { type: "broken_bridge", pos: { x: 14, y: 14 }, variant: 0 },
      { type: "frog", pos: { x: 6, y: 14 }, variant: 0 },
      { type: "deep_water", pos: { x: 10, y: 3 }, variant: 0 },
      { type: "tentacle", pos: { x: 4, y: 1 }, variant: 0 },
      { type: "tentacle", pos: { x: 10, y: 3 }, variant: 0, size: 1 },
      // Expanded outer area - murky swamp edges
      { type: "swamp_tree", pos: { x: -6, y: -2 }, variant: 0 },
      { type: "swamp_tree", pos: { x: -8, y: 6 }, variant: 1 },
      { type: "swamp_tree", pos: { x: -5, y: 12 }, variant: 2 },
      { type: "swamp_tree", pos: { x: -7, y: 20 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 28, y: -4 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 30, y: 4 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 26, y: 10 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 28, y: 18 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 6, y: -6 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 14, y: -4 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 8, y: 22 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 18, y: 20 }, variant: 2 },
      { type: "deep_water", pos: { x: -6, y: 16 }, variant: 0, size: 3 },
      { type: "deep_water", pos: { x: 28, y: 8 }, variant: 0, size: 2 },
      { type: "lily_pads", pos: { x: -4, y: 18 }, variant: 1 },
      { type: "lily_pads", pos: { x: 26, y: 6 }, variant: 0 },
      { type: "mushroom_cluster", pos: { x: -5, y: 4 }, variant: 2 },
      { type: "mushroom_cluster", pos: { x: 29, y: 14 }, variant: 0 },
      { type: "fog_patch", pos: { x: -4, y: 10 }, variant: 1 },
      { type: "fog_patch", pos: { x: 27, y: 2 }, variant: 0 },
      { type: "tentacle", pos: { x: -5, y: 14 }, variant: 1 },
      { type: "tentacle", pos: { x: 27, y: 10 }, variant: 0 },
      { type: "frog", pos: { x: -3, y: 20 }, variant: 1 },
      { type: "skeleton", pos: { x: 30, y: 16 }, variant: 0 },
      { type: "bones", pos: { x: -7, y: 8 }, variant: 0 },
    ],
    previewImage: "/images/previews/murky_bog.png",
  },
  witch_hut: {
    name: "Witch's Domain",
    position: { x: 300, y: 120 },
    description:
      "A cursed clearing where dark magic festers. The witch's hut pulses with evil energy.",
    camera: { offset: { x: -120, y: -170 }, zoom: 1.15 },
    region: "swamp",
    theme: "swamp",
    difficulty: 2,
    startingPawPoints: 475, // Shrine helps with healing - medium funds
    specialTower: {
      pos: { x: 7, y: 7 },
      type: "shrine",
    },
    decorations: [
      { type: "deep_water", pos: { x: 14, y: -0.5 }, variant: 0, size: 3 },
      { type: "witch_cottage", pos: { x: 14, y: 0 }, variant: 0, size: 1.25 },
      { type: "cauldron", pos: { x: 15, y: 1 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 2, y: 0 }, variant: 0 },
      { type: "cauldron", pos: { x: 16, y: 12 }, variant: 1 },
      { type: "cauldron", pos: { x: 2, y: 12 }, variant: 0 },
      { type: "tombstone", pos: { x: 4, y: 14 }, variant: 1 },
      { type: "cauldron", pos: { x: 14, y: 10 }, variant: 0 },
      { type: "cauldron", pos: { x: 0, y: 6 }, variant: 0 },
      // Expanded outer area - witch's cursed domain
      { type: "swamp_tree", pos: { x: -6, y: -4 }, variant: 0 },
      { type: "swamp_tree", pos: { x: -8, y: 4 }, variant: 1 },
      { type: "swamp_tree", pos: { x: -5, y: 10 }, variant: 2 },
      { type: "swamp_tree", pos: { x: -7, y: 18 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 28, y: -2 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 30, y: 6 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 26, y: 12 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 28, y: 20 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 8, y: -6 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 4, y: 22 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 16, y: 22 }, variant: 1 },
      { type: "tombstone", pos: { x: -4, y: 8 }, variant: 0 },
      { type: "tombstone", pos: { x: -6, y: 14 }, variant: 2 },
      { type: "tombstone", pos: { x: 26, y: 4 }, variant: 1 },
      { type: "tombstone", pos: { x: 28, y: 16 }, variant: 0 },
      { type: "cauldron", pos: { x: -5, y: 2 }, variant: 2 },
      { type: "cauldron", pos: { x: 27, y: 10 }, variant: 0 },
      { type: "deep_water", pos: { x: -6, y: 16 }, variant: 0, size: 2 },
      { type: "mushroom_cluster", pos: { x: -3, y: 6 }, variant: 0 },
      { type: "mushroom_cluster", pos: { x: 29, y: 8 }, variant: 1 },
      { type: "fog_patch", pos: { x: -4, y: 12 }, variant: 0 },
      { type: "fog_patch", pos: { x: 25, y: 2 }, variant: 1 },
      { type: "skull", pos: { x: -7, y: 20 }, variant: 0 },
      { type: "bones", pos: { x: 30, y: 14 }, variant: 1 },
      { type: "candles", pos: { x: -5, y: 0 }, variant: 0 },
      { type: "ritual_circle", pos: { x: 28, y: 18 }, variant: 0 },
    ],
    hazards: [{ type: "poison_fog", pos: { x: 12, y: 8 }, radius: 2 }],
    previewImage: "/images/previews/witch_hut.png",
  },
  sunken_temple: {
    name: "Sunken Temple",
    position: { x: 480, y: 200 },
    description:
      "Ancient ruins half-submerged in fetid waters. Something stirs in the depths below.",
    camera: { offset: { x: -150, y: -210 }, zoom: 1.15 },
    region: "swamp",
    theme: "swamp",
    difficulty: 3,
    startingPawPoints: 600, // Dual path + vault defense - need strong setup
    dualPath: true,
    secondaryPath: "sunken_temple_b",
    specialTower: {
      pos: { x: 14, y: 8 },
      type: "vault",
      hp: 800,
    },
    decorations: [
      { type: "ruined_temple", pos: { x: 10, y: -1 }, variant: 0, size: 3 },
      { type: "sunken_pillar", pos: { x: 2, y: 0 }, variant: 0 },
      { type: "sunken_pillar", pos: { x: 26, y: 10 }, variant: 1 },
      { type: "idol_statue", pos: { x: 24, y: 16 }, variant: 0 },
      { type: "deep_water", pos: { x: 13, y: 2 }, variant: 0, size: 2 },
      { type: "tentacle", pos: { x: 14, y: 2 }, variant: 0 },
      { type: "tentacle", pos: { x: 12.3, y: 3 }, variant: 0 },
      { type: "tentacle", pos: { x: 13, y: 2 }, variant: 0 },
      { type: "skeleton_pile", pos: { x: 18, y: 16 }, variant: 0 },
      // Expanded outer area - ancient sunken ruins
      { type: "swamp_tree", pos: { x: -6, y: -4 }, variant: 0 },
      { type: "swamp_tree", pos: { x: -8, y: 6 }, variant: 1 },
      { type: "swamp_tree", pos: { x: -5, y: 14 }, variant: 2 },
      { type: "swamp_tree", pos: { x: -7, y: 22 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 28, y: -6 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 30, y: 2 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 26, y: 16 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 28, y: 22 }, variant: 1 },
      { type: "sunken_pillar", pos: { x: -5, y: 2 }, variant: 2 },
      { type: "sunken_pillar", pos: { x: -4, y: 10 }, variant: 0 },
      { type: "sunken_pillar", pos: { x: 28, y: 6 }, variant: 1 },
      { type: "sunken_pillar", pos: { x: 30, y: 14 }, variant: 2 },
      { type: "ruined_temple", pos: { x: -8, y: 18 }, variant: 1, size: 2 },
      { type: "idol_statue", pos: { x: -6, y: 6 }, variant: 1 },
      { type: "idol_statue", pos: { x: 29, y: 10 }, variant: 0 },
      { type: "deep_water", pos: { x: -6, y: 16 }, variant: 0, size: 3 },
      { type: "deep_water", pos: { x: 28, y: 18 }, variant: 0, size: 2 },
      { type: "tentacle", pos: { x: -4, y: 14 }, variant: 1 },
      { type: "tentacle", pos: { x: -5, y: 18 }, variant: 0 },
      { type: "tentacle", pos: { x: 27, y: 20 }, variant: 1 },
      { type: "skeleton_pile", pos: { x: -7, y: 8 }, variant: 1 },
      { type: "skeleton_pile", pos: { x: 30, y: 4 }, variant: 0 },
      { type: "bones", pos: { x: -3, y: 4 }, variant: 0 },
      { type: "bones", pos: { x: 26, y: 8 }, variant: 1 },
      { type: "lily_pads", pos: { x: -4, y: 20 }, variant: 0 },
      { type: "fog_patch", pos: { x: 28, y: 12 }, variant: 0 },
    ],
    hazards: [{ type: "poison_fog", pos: { x: 3.5, y: 10 }, radius: 2.5 }],
    previewImage: "/images/previews/sunken_temple.png",
  },
  // =====================
  // DESERT REGION - Sahara Sands
  // =====================
  oasis: {
    name: "Desert Oasis",
    position: { x: 120, y: 200 },
    description:
      "A precious water source under siege. Palm trees sway in the hot desert wind.",
    camera: { offset: { x: -190, y: -220 }, zoom: 1.1 },
    region: "desert",
    theme: "desert",
    difficulty: 1,
    startingPawPoints: 425, // Beacon boost helps - ranged enemies require planning
    specialTower: {
      pos: { x: 16, y: 6 },
      type: "beacon",
    },
    decorations: [
      { type: "pyramid", pos: { x: 13, y: 0 }, variant: 0, size: 2 },
      { type: "sphinx", pos: { x: 1, y: 2 }, variant: 0 },
      { type: "oasis_pool", pos: { x: 16, y: 10 }, variant: 0, size: 2 },
      { type: "palm", pos: { x: 2, y: 2 }, variant: 0 },
      { type: "palm", pos: { x: 14, y: 14 }, variant: 1 },
      { type: "palm", pos: { x: 22, y: 2 }, variant: 0 },
      { type: "cactus", pos: { x: 6, y: 2 }, variant: 0 },
      { type: "cactus", pos: { x: 0, y: 12 }, variant: 1 },
      { type: "dune", pos: { x: 24, y: 14 }, variant: 0 },
      { type: "skull", pos: { x: 10, y: 2 }, variant: 0 },
      { type: "pottery", pos: { x: 6, y: 14 }, variant: 0 },
      // Expanded outer area - desert wasteland
      { type: "palm", pos: { x: -6, y: -2 }, variant: 0 },
      { type: "palm", pos: { x: -4, y: 8 }, variant: 1 },
      { type: "palm", pos: { x: -7, y: 16 }, variant: 2 },
      { type: "palm", pos: { x: 28, y: -4 }, variant: 0 },
      { type: "palm", pos: { x: 30, y: 6 }, variant: 1 },
      { type: "palm", pos: { x: 26, y: 18 }, variant: 2 },
      { type: "palm", pos: { x: 8, y: -6 }, variant: 0 },
      { type: "palm", pos: { x: 10, y: 22 }, variant: 1 },
      { type: "cactus", pos: { x: -5, y: 4 }, variant: 0 },
      { type: "cactus", pos: { x: -8, y: 12 }, variant: 1 },
      { type: "cactus", pos: { x: 28, y: 2 }, variant: 2 },
      { type: "cactus", pos: { x: 30, y: 14 }, variant: 0 },
      { type: "dune", pos: { x: -6, y: -4 }, variant: 1 },
      { type: "dune", pos: { x: -8, y: 20 }, variant: 0 },
      { type: "dune", pos: { x: 28, y: -6 }, variant: 2 },
      { type: "dune", pos: { x: 30, y: 20 }, variant: 1 },
      { type: "dune", pos: { x: 4, y: -8 }, variant: 0 },
      { type: "dune", pos: { x: 16, y: 24 }, variant: 2 },
      { type: "obelisk", pos: { x: -5, y: 6 }, variant: 0 },
      { type: "obelisk", pos: { x: 27, y: 10 }, variant: 1 },
      { type: "skull", pos: { x: -4, y: 14 }, variant: 1 },
      { type: "skull", pos: { x: 29, y: 4 }, variant: 0 },
      { type: "bones", pos: { x: -7, y: 8 }, variant: 0 },
      { type: "bones", pos: { x: 26, y: 16 }, variant: 1 },
      { type: "pottery", pos: { x: -3, y: 18 }, variant: 1 },
      { type: "pottery", pos: { x: 28, y: 8 }, variant: 0 },
      { type: "tent", pos: { x: -8, y: 10 }, variant: 0 },
      { type: "campfire", pos: { x: 30, y: 12 }, variant: 0 },
    ],
    previewImage: "/images/previews/oasis.png",
  },
  pyramid: {
    name: "Pyramid Pass",
    position: { x: 300, y: 120 },
    description:
      "Navigate the ancient canyon beneath the great pyramid. Beware of ambushes!",
    camera: { offset: { x: -190, y: -200 }, zoom: 1.15 },
    region: "desert",
    theme: "desert",
    difficulty: 2,
    startingPawPoints: 525, // Dual path requires coverage on both sides
    dualPath: true,
    secondaryPath: "pyramid_b",
    specialTower: {
      pos: { x: 15, y: 5 },
      type: "barracks",
    },
    decorations: [
      { type: "sphinx", pos: { x: 10, y: 2 }, variant: 0 },
      { type: "pyramid", pos: { x: 20, y: -1.5 }, variant: 0, size: 3 },
      { type: "pyramid", pos: { x: 4, y: 1 }, variant: 0, size: 3 },
      { type: "obelisk", pos: { x: 2, y: 2 }, variant: 0 },
      { type: "obelisk", pos: { x: 24, y: 14 }, variant: 1 },
      { type: "skeleton", pos: { x: 1, y: 6 }, variant: 0 },
      { type: "torch", pos: { x: 24, y: 6 }, variant: 0 },
      // Expanded outer area - ancient burial grounds
      { type: "pyramid", pos: { x: -8, y: -4 }, variant: 1, size: 2 },
      { type: "pyramid", pos: { x: 30, y: 18 }, variant: 2, size: 2 },
      { type: "palm", pos: { x: -5, y: 4 }, variant: 0 },
      { type: "palm", pos: { x: -7, y: 12 }, variant: 1 },
      { type: "palm", pos: { x: -4, y: 20 }, variant: 2 },
      { type: "palm", pos: { x: 28, y: -2 }, variant: 0 },
      { type: "palm", pos: { x: 30, y: 8 }, variant: 1 },
      { type: "palm", pos: { x: 26, y: 16 }, variant: 2 },
      { type: "obelisk", pos: { x: -6, y: -2 }, variant: 2 },
      { type: "obelisk", pos: { x: -5, y: 8 }, variant: 0 },
      { type: "obelisk", pos: { x: 28, y: 4 }, variant: 1 },
      { type: "obelisk", pos: { x: 30, y: 14 }, variant: 2 },
      { type: "cactus", pos: { x: -8, y: 6 }, variant: 0 },
      { type: "cactus", pos: { x: -6, y: 16 }, variant: 1 },
      { type: "cactus", pos: { x: 28, y: 10 }, variant: 2 },
      { type: "cactus", pos: { x: 26, y: 22 }, variant: 0 },
      { type: "dune", pos: { x: -7, y: 18 }, variant: 0 },
      { type: "dune", pos: { x: 28, y: -6 }, variant: 1 },
      { type: "dune", pos: { x: 6, y: -8 }, variant: 2 },
      { type: "dune", pos: { x: 14, y: 24 }, variant: 0 },
      { type: "sarcophagus", pos: { x: -4, y: 10 }, variant: 1 },
      { type: "sarcophagus", pos: { x: 29, y: 6 }, variant: 0 },
      { type: "skull", pos: { x: -3, y: 14 }, variant: 0 },
      { type: "skull", pos: { x: 27, y: 12 }, variant: 1 },
      { type: "torch", pos: { x: -6, y: 2 }, variant: 1 },
      { type: "torch", pos: { x: 30, y: 2 }, variant: 0 },
      { type: "bones", pos: { x: -8, y: 22 }, variant: 0 },
      { type: "pottery", pos: { x: 28, y: 20 }, variant: 1 },
    ],
    previewImage: "/images/previews/pyramid.png",
  },
  sphinx: {
    name: "Sphinx Gate",
    position: { x: 480, y: 200 },
    description:
      "The ancient guardian's domain. The Sphinx watches all who dare to pass.",
    camera: { offset: { x: -100, y: -170 }, zoom: 1.25 },
    region: "desert",
    theme: "desert",
    difficulty: 3,
    startingPawPoints: 575, // Challenging boss waves with quicksand hazard
    specialTower: {
      pos: { x: 14, y: 8 },
      type: "shrine",
    },
    decorations: [
      { type: "giant_sphinx", pos: { x: 10, y: 0 }, variant: 0, size: 1 },
      { type: "sphinx", pos: { x: 7, y: 0 }, variant: 0 },
      { type: "obelisk", pos: { x: 24, y: 12 }, variant: 0 },
      { type: "sarcophagus", pos: { x: 0, y: 14 }, variant: 0 },
      { type: "sphinx", pos: { x: 14, y: 0 }, variant: 0 },
      { type: "sand_pile", pos: { x: 18, y: 14 }, variant: 0 },
      // Expanded outer area - sphinx guardians
      { type: "sphinx", pos: { x: -6, y: 4 }, variant: 1 },
      { type: "sphinx", pos: { x: 28, y: 2 }, variant: 0 },
      { type: "obelisk", pos: { x: -5, y: -2 }, variant: 0 },
      { type: "obelisk", pos: { x: -7, y: 8 }, variant: 1 },
      { type: "obelisk", pos: { x: -4, y: 16 }, variant: 2 },
      { type: "obelisk", pos: { x: 26, y: -4 }, variant: 0 },
      { type: "obelisk", pos: { x: 30, y: 6 }, variant: 1 },
      { type: "obelisk", pos: { x: 28, y: 14 }, variant: 2 },
      { type: "pyramid", pos: { x: -8, y: 20 }, variant: 0, size: 2 },
      { type: "pyramid", pos: { x: 30, y: -6 }, variant: 1, size: 2 },
      { type: "palm", pos: { x: -6, y: 12 }, variant: 0 },
      { type: "palm", pos: { x: 28, y: 10 }, variant: 1 },
      { type: "palm", pos: { x: 6, y: -8 }, variant: 2 },
      { type: "palm", pos: { x: 14, y: 22 }, variant: 0 },
      { type: "cactus", pos: { x: -8, y: 6 }, variant: 0 },
      { type: "cactus", pos: { x: 30, y: 16 }, variant: 1 },
      { type: "dune", pos: { x: -7, y: 18 }, variant: 0 },
      { type: "dune", pos: { x: 26, y: 20 }, variant: 1 },
      { type: "dune", pos: { x: 10, y: -6 }, variant: 2 },
      { type: "dune", pos: { x: 8, y: 24 }, variant: 0 },
      { type: "sarcophagus", pos: { x: -5, y: 10 }, variant: 1 },
      { type: "sarcophagus", pos: { x: 29, y: 8 }, variant: 0 },
      { type: "sand_pile", pos: { x: -4, y: 14 }, variant: 1 },
      { type: "sand_pile", pos: { x: 27, y: 18 }, variant: 0 },
      { type: "skull", pos: { x: -8, y: 2 }, variant: 0 },
      { type: "skull", pos: { x: 30, y: 4 }, variant: 1 },
      { type: "bones", pos: { x: -3, y: 20 }, variant: 1 },
      { type: "torch", pos: { x: 28, y: 0 }, variant: 0 },
    ],
    hazards: [{ type: "quicksand", pos: { x: 8, y: 7 }, radius: 1.5 }],
    previewImage: "/images/previews/sphinx.png",
  },
  // =====================
  // WINTER REGION - Frozen Frontier
  // =====================
  glacier: {
    name: "Glacier Path",
    position: { x: 120, y: 200 },
    description:
      "Ice-covered mountain pass. Freezing winds howl through the peaks.",
    camera: { offset: { x: -100, y: -220 }, zoom: 1.1 },
    region: "winter",
    theme: "winter",
    difficulty: 1,
    startingPawPoints: 475, // Winter intro - varied enemy types
    specialTower: {
      pos: { x: 7, y: 4 },
      type: "beacon",
    },
    decorations: [
      { type: "pine_tree", pos: { x: 2, y: 2 }, variant: 0 },
      { type: "pine_tree", pos: { x: 22, y: 2 }, variant: 1 },
      { type: "pine_tree", pos: { x: 0, y: 14 }, variant: 0 },
      { type: "snowman", pos: { x: 24, y: 14 }, variant: 0 },
      { type: "ice_crystal", pos: { x: 6, y: 2 }, variant: 0 },
      { type: "frozen_pond", pos: { x: 18, y: 14 }, variant: 0, size: 2 },
      { type: "snow_pile", pos: { x: 10, y: 14 }, variant: 0 },
      { type: "icicles", pos: { x: 14, y: 2 }, variant: 0 },
      // Expanded outer area - frozen wilderness
      { type: "pine_tree", pos: { x: -6, y: -4 }, variant: 0 },
      { type: "pine_tree", pos: { x: -8, y: 4 }, variant: 1 },
      { type: "pine_tree", pos: { x: -5, y: 10 }, variant: 2 },
      { type: "pine_tree", pos: { x: -7, y: 18 }, variant: 0 },
      { type: "pine_tree", pos: { x: -4, y: 24 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: -6 }, variant: 2 },
      { type: "pine_tree", pos: { x: 30, y: 2 }, variant: 0 },
      { type: "pine_tree", pos: { x: 26, y: 8 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: 16 }, variant: 2 },
      { type: "pine_tree", pos: { x: 30, y: 22 }, variant: 0 },
      { type: "pine_tree", pos: { x: 6, y: -8 }, variant: 1 },
      { type: "pine_tree", pos: { x: 14, y: -6 }, variant: 2 },
      { type: "pine_tree", pos: { x: 8, y: 22 }, variant: 0 },
      { type: "pine_tree", pos: { x: 16, y: 24 }, variant: 1 },
      { type: "ice_crystal", pos: { x: -6, y: 6 }, variant: 1 },
      { type: "ice_crystal", pos: { x: -4, y: 14 }, variant: 2 },
      { type: "ice_crystal", pos: { x: 28, y: 4 }, variant: 0 },
      { type: "ice_crystal", pos: { x: 26, y: 12 }, variant: 1 },
      { type: "frozen_pond", pos: { x: -7, y: 20 }, variant: 1, size: 2 },
      { type: "frozen_pond", pos: { x: 28, y: -2 }, variant: 0, size: 2 },
      { type: "snow_pile", pos: { x: -5, y: 2 }, variant: 1 },
      { type: "snow_pile", pos: { x: -8, y: 12 }, variant: 0 },
      { type: "snow_pile", pos: { x: 29, y: 10 }, variant: 2 },
      { type: "snow_pile", pos: { x: 27, y: 20 }, variant: 1 },
      { type: "snowman", pos: { x: -4, y: 8 }, variant: 1 },
      { type: "snowman", pos: { x: 30, y: 6 }, variant: 0 },
      { type: "icicles", pos: { x: -6, y: 16 }, variant: 1 },
      { type: "icicles", pos: { x: 28, y: 18 }, variant: 0 },
      { type: "frozen_soldier", pos: { x: -8, y: 8 }, variant: 0 },
      { type: "bones", pos: { x: 30, y: 14 }, variant: 1 },
    ],
    previewImage: "/images/previews/glacier.png",
  },
  fortress: {
    name: "Frost Fortress",
    position: { x: 300, y: 120 },
    description:
      "An abandoned stronghold of ice and stone. What dark forces drove out its defenders?",
    camera: { offset: { x: -90, y: -180 }, zoom: 1.35 },
    region: "winter",
    theme: "winter",
    difficulty: 2,
    startingPawPoints: 550, // Barracks helps - ice sheet hazard speeds enemies
    specialTower: {
      pos: { x: 8, y: 10 },
      type: "barracks",
    },
    decorations: [
      { type: "ruined_temple", pos: { x: 9.5, y: -1 }, variant: 0, size: 2 },
      { type: "ice_fortress", pos: { x: 0, y: 17 }, variant: 0, size: 3 },
      { type: "ruined_temple", pos: { x: 8, y: 17 }, variant: 0, size: 2 },
      { type: "ice_fortress", pos: { x: 16, y: -2 }, variant: 0, size: 2 },
      { type: "frozen_gate", pos: { x: 24, y: 6 }, variant: 0 },
      { type: "broken_wall", pos: { x: 0, y: 0 }, variant: 0 },
      { type: "broken_wall", pos: { x: 22, y: 10 }, variant: 1 },
      { type: "frozen_soldier", pos: { x: 0, y: 10 }, variant: 0 },
      { type: "battle_crater", pos: { x: 2, y: 16 }, variant: 0 },
      { type: "pine_tree", pos: { x: 22, y: 16 }, variant: 0 },
      { type: "pine_tree", pos: { x: 24, y: 14 }, variant: 1 },
      // Expanded outer area - ruined fortress exterior
      { type: "ice_fortress", pos: { x: -8, y: -4 }, variant: 1, size: 2 },
      { type: "ice_fortress", pos: { x: 30, y: 20 }, variant: 0, size: 2 },
      { type: "pine_tree", pos: { x: -6, y: 2 }, variant: 0 },
      { type: "pine_tree", pos: { x: -8, y: 10 }, variant: 1 },
      { type: "pine_tree", pos: { x: -5, y: 18 }, variant: 2 },
      { type: "pine_tree", pos: { x: 28, y: -2 }, variant: 0 },
      { type: "pine_tree", pos: { x: 30, y: 8 }, variant: 1 },
      { type: "pine_tree", pos: { x: 26, y: 18 }, variant: 2 },
      { type: "pine_tree", pos: { x: 6, y: -8 }, variant: 0 },
      { type: "pine_tree", pos: { x: 14, y: 24 }, variant: 1 },
      { type: "broken_wall", pos: { x: -6, y: 6 }, variant: 2 },
      { type: "broken_wall", pos: { x: -4, y: 14 }, variant: 0 },
      { type: "broken_wall", pos: { x: 28, y: 4 }, variant: 1 },
      { type: "broken_wall", pos: { x: 30, y: 14 }, variant: 2 },
      { type: "frozen_soldier", pos: { x: -7, y: 8 }, variant: 1 },
      { type: "frozen_soldier", pos: { x: -5, y: 20 }, variant: 0 },
      { type: "frozen_soldier", pos: { x: 29, y: 6 }, variant: 2 },
      { type: "frozen_soldier", pos: { x: 27, y: 16 }, variant: 1 },
      { type: "battle_crater", pos: { x: -8, y: 12 }, variant: 1 },
      { type: "battle_crater", pos: { x: 28, y: 10 }, variant: 0 },
      { type: "ice_crystal", pos: { x: -4, y: 4 }, variant: 0 },
      { type: "ice_crystal", pos: { x: 26, y: 2 }, variant: 1 },
      { type: "snow_pile", pos: { x: -6, y: 22 }, variant: 0 },
      { type: "icicles", pos: { x: 30, y: 0 }, variant: 1 },
    ],
    hazards: [{ type: "ice_sheet", pos: { x: 12, y: 7 }, radius: 2 }],
    previewImage: "/images/previews/fortress.png",
  },
  peak: {
    name: "Summit Peak",
    position: { x: 480, y: 200 },
    description:
      "The highest point of defense. A frozen throne awaits at the mountain's apex.",
    camera: { offset: { x: -160, y: -210 }, zoom: 1.25 },
    region: "winter",
    theme: "winter",
    difficulty: 3,
    startingPawPoints: 650, // Dual path + bosses - need maximum coverage
    dualPath: true,
    secondaryPath: "peak_b",
    specialTower: {
      pos: { x: 9, y: 9 },
      type: "shrine",
    },
    decorations: [
      { type: "ice_throne", pos: { x: 7.5, y: -1.5 }, variant: 0, size: 3 },
      { type: "ice_fortress", pos: { x: 2, y: 0 }, variant: 0 },
      { type: "ice_fortress", pos: { x: 22, y: 14 }, variant: 1 },
      { type: "oasis_pool", pos: { x: 0, y: 14 }, variant: 0, size: 3 },
      { type: "ice_throne", pos: { x: 4, y: 0 }, variant: 0 },
      { type: "ice_throne", pos: { x: 6, y: 14 }, variant: 0 },
      { type: "ice_throne", pos: { x: 13, y: 8 }, variant: 0 },
      // Expanded outer area - mountain summit
      { type: "ice_fortress", pos: { x: -8, y: -6 }, variant: 0, size: 2 },
      { type: "ice_fortress", pos: { x: 30, y: -4 }, variant: 1, size: 2 },
      { type: "ice_fortress", pos: { x: -6, y: 20 }, variant: 2, size: 2 },
      { type: "pine_tree", pos: { x: -5, y: 2 }, variant: 0 },
      { type: "pine_tree", pos: { x: -7, y: 10 }, variant: 1 },
      { type: "pine_tree", pos: { x: -4, y: 16 }, variant: 2 },
      { type: "pine_tree", pos: { x: 28, y: 2 }, variant: 0 },
      { type: "pine_tree", pos: { x: 30, y: 10 }, variant: 1 },
      { type: "pine_tree", pos: { x: 26, y: 20 }, variant: 2 },
      { type: "pine_tree", pos: { x: 8, y: -8 }, variant: 0 },
      { type: "pine_tree", pos: { x: 16, y: -6 }, variant: 1 },
      { type: "pine_tree", pos: { x: 10, y: 24 }, variant: 2 },
      { type: "pine_tree", pos: { x: 18, y: 22 }, variant: 0 },
      { type: "ice_throne", pos: { x: -6, y: 6 }, variant: 1 },
      { type: "ice_throne", pos: { x: 28, y: 6 }, variant: 0 },
      { type: "ice_crystal", pos: { x: -8, y: 4 }, variant: 0 },
      { type: "ice_crystal", pos: { x: -5, y: 12 }, variant: 1 },
      { type: "ice_crystal", pos: { x: 29, y: 4 }, variant: 2 },
      { type: "ice_crystal", pos: { x: 27, y: 16 }, variant: 0 },
      { type: "frozen_pond", pos: { x: -7, y: 18 }, variant: 0, size: 2 },
      { type: "frozen_pond", pos: { x: 28, y: 18 }, variant: 1, size: 2 },
      { type: "snow_pile", pos: { x: -4, y: 8 }, variant: 0 },
      { type: "snow_pile", pos: { x: 30, y: 8 }, variant: 1 },
      { type: "icicles", pos: { x: -8, y: 14 }, variant: 0 },
      { type: "icicles", pos: { x: 26, y: 12 }, variant: 1 },
      { type: "frozen_soldier", pos: { x: -6, y: 22 }, variant: 0 },
      { type: "bones", pos: { x: 28, y: 22 }, variant: 1 },
    ],
    hazards: [{ type: "ice_sheet", pos: { x: 13, y: -2 }, radius: 2 }],
    previewImage: "/images/previews/peak.png",
  },
  // =====================
  // VOLCANIC REGION - Inferno Depths
  // =====================
  lava: {
    name: "Lava Fields",
    position: { x: 120, y: 200 },
    description: "Rivers of molten rock carve through the blackened landscape.",
    camera: { offset: { x: -100, y: -220 }, zoom: 1.1 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 2,
    startingPawPoints: 550, // Volcanic intro - lava geyser hazard
    decorations: [
      { type: "lava_pool", pos: { x: 0, y: 14 }, variant: 0, size: 2 },
      { type: "lava_pool", pos: { x: 22, y: 0 }, variant: 1, size: 1 },
      { type: "obsidian_castle", pos: { x: 2, y: 0 }, variant: 0 },
      { type: "obsidian_castle", pos: { x: 18, y: 0 }, variant: 1 },
      { type: "obsidian_castle", pos: { x: 24, y: 14 }, variant: 0 },
      { type: "charred_tree", pos: { x: 0, y: 0 }, variant: 0 },
      { type: "dark_throne", pos: { x: 10, y: 14 }, variant: 0 },
      { type: "dark_throne", pos: { x: 20, y: 14 }, variant: 0 },
      // Expanded outer area - volcanic wasteland
      { type: "obsidian_castle", pos: { x: -8, y: -4 }, variant: 2, size: 2 },
      { type: "obsidian_castle", pos: { x: 30, y: 18 }, variant: 0, size: 2 },
      { type: "lava_pool", pos: { x: -6, y: 6 }, variant: 0, size: 2 },
      { type: "lava_pool", pos: { x: -7, y: 18 }, variant: 1, size: 2 },
      { type: "lava_pool", pos: { x: 28, y: -2 }, variant: 2, size: 2 },
      { type: "lava_pool", pos: { x: 30, y: 10 }, variant: 0, size: 2 },
      { type: "charred_tree", pos: { x: -5, y: 2 }, variant: 1 },
      { type: "charred_tree", pos: { x: -8, y: 10 }, variant: 0 },
      { type: "charred_tree", pos: { x: -4, y: 20 }, variant: 2 },
      { type: "charred_tree", pos: { x: 28, y: 4 }, variant: 0 },
      { type: "charred_tree", pos: { x: 30, y: 14 }, variant: 1 },
      { type: "charred_tree", pos: { x: 26, y: 22 }, variant: 2 },
      { type: "charred_tree", pos: { x: 6, y: -6 }, variant: 0 },
      { type: "charred_tree", pos: { x: 14, y: -8 }, variant: 1 },
      { type: "charred_tree", pos: { x: 8, y: 22 }, variant: 2 },
      { type: "charred_tree", pos: { x: 16, y: 24 }, variant: 0 },
      { type: "dark_throne", pos: { x: -6, y: 12 }, variant: 1 },
      { type: "dark_throne", pos: { x: 28, y: 8 }, variant: 0 },
      { type: "fire_pit", pos: { x: -4, y: 4 }, variant: 0 },
      { type: "fire_pit", pos: { x: -7, y: 14 }, variant: 1 },
      { type: "fire_pit", pos: { x: 29, y: 2 }, variant: 0 },
      { type: "fire_pit", pos: { x: 27, y: 16 }, variant: 1 },
      { type: "ember", pos: { x: -5, y: 8 }, variant: 0 },
      { type: "ember", pos: { x: 30, y: 6 }, variant: 1 },
      { type: "bones", pos: { x: -8, y: 22 }, variant: 0 },
      { type: "skull", pos: { x: 28, y: 20 }, variant: 1 },
    ],
    hazards: [{ type: "lava_geyser", pos: { x: 7, y: 6 }, radius: 2.5 }],
    previewImage: "/images/previews/lava_fields.png",
  },
  crater: {
    name: "Caldera Basin",
    position: { x: 300, y: 200 },
    description:
      "Inside the volcano's heart. The ground trembles with each eruption.",
    camera: { offset: { x: -90, y: -160 }, zoom: 1.05 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 3,
    startingPawPoints: 675, // Vault defense - many tough enemies
    specialTower: {
      pos: { x: 10, y: 10 },
      type: "vault",
      hp: 1000,
    },
    decorations: [
      { type: "dark_throne", pos: { x: 22, y: 0 }, variant: 0, size: 4 },
      { type: "lava_pool", pos: { x: 0, y: 8 }, variant: 0, size: 2 },
      { type: "lava_pool", pos: { x: 22, y: 10 }, variant: 1, size: 2 },
      { type: "lava_pool", pos: { x: 24, y: 2 }, variant: 0 },
      { type: "dark_throne", pos: { x: 2, y: 10 }, variant: 0 },
      { type: "obsidian_castle", pos: { x: 22, y: 14 }, variant: 0 },
      { type: "obsidian_castle", pos: { x: 4, y: 14 }, variant: 0 },
      // Expanded outer area - caldera rim
      { type: "obsidian_castle", pos: { x: -8, y: -6 }, variant: 1, size: 2 },
      { type: "obsidian_castle", pos: { x: -6, y: 16 }, variant: 0, size: 2 },
      { type: "obsidian_castle", pos: { x: 30, y: -4 }, variant: 2, size: 2 },
      { type: "obsidian_castle", pos: { x: 28, y: 20 }, variant: 1, size: 2 },
      { type: "lava_pool", pos: { x: -7, y: 4 }, variant: 0, size: 3 },
      { type: "lava_pool", pos: { x: -5, y: 20 }, variant: 1, size: 2 },
      { type: "lava_pool", pos: { x: 28, y: 6 }, variant: 2, size: 2 },
      { type: "lava_pool", pos: { x: 30, y: 16 }, variant: 0, size: 2 },
      { type: "dark_throne", pos: { x: -6, y: -2 }, variant: 1 },
      { type: "dark_throne", pos: { x: -4, y: 12 }, variant: 0 },
      { type: "dark_throne", pos: { x: 29, y: 2 }, variant: 2 },
      { type: "dark_throne", pos: { x: 27, y: 14 }, variant: 1 },
      { type: "charred_tree", pos: { x: -8, y: 8 }, variant: 0 },
      { type: "charred_tree", pos: { x: -5, y: 22 }, variant: 1 },
      { type: "charred_tree", pos: { x: 30, y: 10 }, variant: 2 },
      { type: "charred_tree", pos: { x: 26, y: 22 }, variant: 0 },
      { type: "charred_tree", pos: { x: 8, y: -8 }, variant: 1 },
      { type: "charred_tree", pos: { x: 12, y: 24 }, variant: 2 },
      { type: "fire_pit", pos: { x: -7, y: 10 }, variant: 0 },
      { type: "fire_pit", pos: { x: 28, y: 12 }, variant: 1 },
      { type: "demon_statue", pos: { x: -6, y: 6 }, variant: 0 },
      { type: "demon_statue", pos: { x: 29, y: 8 }, variant: 1 },
      { type: "ember", pos: { x: -4, y: 18 }, variant: 0 },
      { type: "ember", pos: { x: 30, y: 4 }, variant: 1 },
      { type: "bones", pos: { x: -8, y: 14 }, variant: 0 },
      { type: "skull", pos: { x: 26, y: 18 }, variant: 1 },
    ],
    hazards: [{ type: "lava_geyser", pos: { x: 12, y: 3.5 }, radius: 2 }],
    previewImage: "/images/previews/caldera.png",
  },
  throne: {
    name: "Obsidian Throne",
    position: { x: 480, y: 200 },
    description:
      "The ultimate challenge. An ancient dark lord's seat of power, guarded by his legions.",
    camera: { offset: { x: -60, y: -190 }, zoom: 1.05 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 3,
    startingPawPoints: 750, // Final level - 20 brutal waves require full arsenal
    dualPath: true,
    secondaryPath: "throne_b",
    specialTower: {
      pos: { x: 8, y: 10 },
      type: "barracks",
    },
    decorations: [
      { type: "obsidian_castle", pos: { x: 12, y: -2 }, variant: 0, size: 4 },
      { type: "dark_throne", pos: { x: 13, y: 2 }, variant: 0 },
      { type: "demon_statue", pos: { x: 2, y: 2 }, variant: 0 },
      { type: "demon_statue", pos: { x: 2, y: 14 }, variant: 1 },
      { type: "obsidian_castle", pos: { x: 10, y: 8 }, variant: 0 },
      { type: "fire_pit", pos: { x: 6, y: 0 }, variant: 0 },
      { type: "obsidian_castle", pos: { x: 8, y: 20 }, variant: 0, size: 2 },
      { type: "dark_throne", pos: { x: 17, y: 19 }, variant: 0, size: 3 },
      // Expanded outer area - dark lord's domain
      { type: "obsidian_castle", pos: { x: -8, y: -6 }, variant: 1, size: 3 },
      { type: "obsidian_castle", pos: { x: -6, y: 14 }, variant: 2, size: 2 },
      { type: "obsidian_castle", pos: { x: 30, y: -4 }, variant: 0, size: 3 },
      { type: "obsidian_castle", pos: { x: 28, y: 16 }, variant: 1, size: 2 },
      { type: "dark_throne", pos: { x: -6, y: 2 }, variant: 1 },
      { type: "dark_throne", pos: { x: -4, y: 10 }, variant: 0 },
      { type: "dark_throne", pos: { x: -7, y: 20 }, variant: 2 },
      { type: "dark_throne", pos: { x: 28, y: 4 }, variant: 0 },
      { type: "dark_throne", pos: { x: 30, y: 12 }, variant: 1 },
      { type: "dark_throne", pos: { x: 26, y: 22 }, variant: 2 },
      { type: "demon_statue", pos: { x: -5, y: -2 }, variant: 2 },
      { type: "demon_statue", pos: { x: -8, y: 8 }, variant: 0 },
      { type: "demon_statue", pos: { x: -4, y: 18 }, variant: 1 },
      { type: "demon_statue", pos: { x: 29, y: 0 }, variant: 2 },
      { type: "demon_statue", pos: { x: 27, y: 10 }, variant: 0 },
      { type: "demon_statue", pos: { x: 30, y: 20 }, variant: 1 },
      { type: "lava_pool", pos: { x: -7, y: 4 }, variant: 0, size: 2 },
      { type: "lava_pool", pos: { x: -5, y: 16 }, variant: 1, size: 2 },
      { type: "lava_pool", pos: { x: 28, y: 6 }, variant: 2, size: 2 },
      { type: "lava_pool", pos: { x: 30, y: 18 }, variant: 0, size: 2 },
      { type: "fire_pit", pos: { x: -8, y: 12 }, variant: 0 },
      { type: "fire_pit", pos: { x: -6, y: 22 }, variant: 1 },
      { type: "fire_pit", pos: { x: 26, y: 8 }, variant: 0 },
      { type: "fire_pit", pos: { x: 28, y: 24 }, variant: 1 },
      { type: "charred_tree", pos: { x: -8, y: 6 }, variant: 0 },
      { type: "charred_tree", pos: { x: 30, y: 2 }, variant: 1 },
      { type: "charred_tree", pos: { x: 6, y: -8 }, variant: 2 },
      { type: "charred_tree", pos: { x: 14, y: 26 }, variant: 0 },
      { type: "ember", pos: { x: -4, y: 6 }, variant: 0 },
      { type: "ember", pos: { x: 29, y: 14 }, variant: 1 },
      { type: "bones", pos: { x: -7, y: 24 }, variant: 0 },
      { type: "skull", pos: { x: 28, y: -2 }, variant: 1 },
    ],
    previewImage: "/images/previews/throne.png",
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
  swamp: {
    ground: ["#1a2a1a", "#0f1f0f", "#0a150a"],
    path: ["#3a4a3a", "#4a5a4a", "#2a3a2a"],
    accent: "#4a8a4a",
    fog: "rgba(100, 150, 100, 0.4)",
  },
};

// =============================================================================
// LEVEL-SPECIFIC WAVES CONFIGURATION
// =============================================================================

// Each level has its own wave configuration
// RELAXED PACING: Enemies spawn slowly to give players time to react
export const LEVEL_WAVES: Record<string, WaveGroup[][]> = {
  // =====================
  // GRASSLAND REGION - Tutorial, gradually increasing difficulty
  // =====================
  poe: [
    // Wave 1-8: Tutorial waves - learn the ropes
    [{ type: "frosh", count: 3, interval: 2200 }],
    [
      { type: "frosh", count: 4, interval: 2000 },
      { type: "frosh", count: 2, interval: 2000 },
    ],
    [
      { type: "frosh", count: 4, interval: 2000 },
      { type: "sophomore", count: 1, interval: 2800 },
    ],
    [
      { type: "sophomore", count: 3, interval: 2200 },
      { type: "frosh", count: 3, interval: 2000 },
    ],
    [
      { type: "sophomore", count: 4, interval: 2000 },
      { type: "frosh", count: 3, interval: 2000 },
    ],
    [
      { type: "sophomore", count: 4, interval: 2000 },
      { type: "junior", count: 1, interval: 3200 },
      { type: "frosh", count: 2, interval: 2000 },
    ],
    [
      { type: "junior", count: 2, interval: 2800 },
      { type: "sophomore", count: 4, interval: 2000 },
    ],
    [
      { type: "junior", count: 3, interval: 2600 },
      { type: "sophomore", count: 3, interval: 2200 },
      { type: "senior", count: 1, interval: 4000 },
    ],
  ],

  carnegie: [
    // 10 waves - Lakeside defense
    [
      { type: "frosh", count: 4, interval: 2000 },
      { type: "sophomore", count: 2, interval: 2400 },
    ],
    [
      { type: "sophomore", count: 4, interval: 2000 },
      { type: "frosh", count: 3, interval: 2000 },
    ],
    [
      { type: "junior", count: 2, interval: 2600 },
      { type: "sophomore", count: 3, interval: 2000 },
      { type: "frosh", count: 2, interval: 2000 },
    ],
    [
      { type: "junior", count: 3, interval: 2400 },
      { type: "mascot", count: 1, interval: 3200 },
    ],
    [
      { type: "mascot", count: 2, interval: 2800 },
      { type: "junior", count: 4, interval: 2200 },
      { type: "sophomore", count: 2, interval: 2000 },
    ],
    [
      { type: "senior", count: 2, interval: 3000 },
      { type: "junior", count: 4, interval: 2200 },
      { type: "mascot", count: 2, interval: 2800 },
    ],
    [
      { type: "senior", count: 3, interval: 2800 },
      { type: "mascot", count: 3, interval: 2600 },
      { type: "junior", count: 3, interval: 2200 },
    ],
    [
      { type: "senior", count: 3, interval: 2600 },
      { type: "junior", count: 4, interval: 2000 },
    ],
    [
      { type: "gradstudent", count: 1, interval: 4000 },
      { type: "senior", count: 3, interval: 2600 },
      { type: "mascot", count: 3, interval: 2600 },
    ],
    [
      { type: "gradstudent", count: 2, interval: 3800 },
      { type: "senior", count: 4, interval: 2400 },
      { type: "mascot", count: 4, interval: 2400 },
    ],
  ],

  nassau: [
    // 12 waves - Nassau Hall finale
    [
      { type: "sophomore", count: 5, interval: 2000 },
      { type: "junior", count: 2, interval: 2600 },
    ],
    [
      { type: "junior", count: 4, interval: 2200 },
      { type: "sophomore", count: 3, interval: 2000 },
    ],
    [
      { type: "senior", count: 2, interval: 3000 },
      { type: "junior", count: 4, interval: 2000 },
      { type: "mascot", count: 2, interval: 2800 },
    ],
    [
      { type: "mascot", count: 3, interval: 2400 },
      { type: "senior", count: 3, interval: 2800 },
      { type: "junior", count: 3, interval: 2200 },
    ],
    [
      { type: "archer", count: 4, interval: 2500 },
      { type: "senior", count: 4, interval: 2400 },
      { type: "junior", count: 5, interval: 1800 },
    ],
    [
      { type: "gradstudent", count: 2, interval: 3500 },
      { type: "archer", count: 4, interval: 2400 },
      { type: "mascot", count: 4, interval: 2200 },
    ],
    [
      { type: "gradstudent", count: 4, interval: 3000 },
      { type: "senior", count: 5, interval: 2200 },
      { type: "archer", count: 3, interval: 2400 },
    ],
    [
      { type: "professor", count: 2, interval: 5000 },
      { type: "gradstudent", count: 4, interval: 2800 },
      { type: "senior", count: 5, interval: 2200 },
    ],
    [
      { type: "professor", count: 2, interval: 4500 },
      { type: "gradstudent", count: 4, interval: 2600 },
      { type: "mascot", count: 5, interval: 2000 },
    ],
    [
      { type: "professor", count: 2, interval: 4200 },
      { type: "archer", count: 5, interval: 2200 },
      { type: "gradstudent", count: 3, interval: 2800 },
    ],
    [
      { type: "dean", count: 1, interval: 8000 },
      { type: "professor", count: 2, interval: 4000 },
      { type: "gradstudent", count: 4, interval: 2600 },
    ],
    [
      { type: "dean", count: 2, interval: 6500 },
      { type: "professor", count: 3, interval: 3500 },
      { type: "senior", count: 6, interval: 1800 },
      { type: "mascot", count: 5, interval: 2000 },
    ],
  ],

  // =====================
  // SWAMP REGION - Dark magic swarms
  // =====================
  bog: [
    // 10 waves - Swamp introduction with hexer swarms
    [
      { type: "frosh", count: 6, interval: 1800 },
      { type: "hexer", count: 2, interval: 2800 },
    ],
    [
      { type: "sophomore", count: 6, interval: 1800 },
      { type: "hexer", count: 3, interval: 2600 },
    ],
    [
      { type: "hexer", count: 5, interval: 2200 },
      { type: "junior", count: 4, interval: 2000 },
      { type: "sophomore", count: 4, interval: 1800 },
    ],
    [
      { type: "warlock", count: 2, interval: 3200 },
      { type: "hexer", count: 4, interval: 2400 },
      { type: "junior", count: 5, interval: 2000 },
    ],
    [
      { type: "specter", count: 3, interval: 2800 },
      { type: "warlock", count: 2, interval: 3000 },
      { type: "hexer", count: 4, interval: 2400 },
    ],
    [
      { type: "senior", count: 4, interval: 2400 },
      { type: "specter", count: 4, interval: 2600 },
      { type: "hexer", count: 5, interval: 2200 },
    ],
    [
      { type: "warlock", count: 4, interval: 2600 },
      { type: "senior", count: 4, interval: 2400 },
      { type: "berserker", count: 3, interval: 2400 },
    ],
    [
      { type: "necromancer", count: 2, interval: 4200 },
      { type: "warlock", count: 4, interval: 2600 },
      { type: "specter", count: 4, interval: 2400 },
    ],
    [
      { type: "necromancer", count: 2, interval: 4000 },
      { type: "berserker", count: 5, interval: 2200 },
      { type: "hexer", count: 5, interval: 2400 },
    ],
    [
      { type: "harpy", count: 6, interval: 2000 },
      { type: "necromancer", count: 2, interval: 4000 },
      { type: "specter", count: 5, interval: 2200 },
      { type: "berserker", count: 4, interval: 2400 },
    ],
  ],

  witch_hut: [
    // 14 waves - Witch's dark magic assault
    [
      { type: "junior", count: 6, interval: 1800 },
      { type: "harpy", count: 3, interval: 2600 },
      { type: "hexer", count: 3, interval: 2400 },
    ],
    [
      { type: "hexer", count: 5, interval: 2200 },
      { type: "warlock", count: 2, interval: 3000 },
      { type: "junior", count: 5, interval: 2000 },
    ],
    [
      { type: "specter", count: 4, interval: 2600 },
      { type: "hexer", count: 5, interval: 2200 },
      { type: "senior", count: 4, interval: 2400 },
    ],
    [
      { type: "warlock", count: 4, interval: 2600 },
      { type: "specter", count: 4, interval: 2400 },
      { type: "berserker", count: 3, interval: 2400 },
    ],
    [
      { type: "necromancer", count: 2, interval: 4000 },
      { type: "warlock", count: 4, interval: 2400 },
      { type: "hexer", count: 4, interval: 2200 },
    ],
    [
      { type: "shadow_knight", count: 2, interval: 4200 },
      { type: "necromancer", count: 2, interval: 4000 },
      { type: "specter", count: 5, interval: 2200 },
    ],
    [
      { type: "gradstudent", count: 4, interval: 2800 },
      { type: "shadow_knight", count: 2, interval: 4000 },
      { type: "berserker", count: 4, interval: 2400 },
    ],
    [
      { type: "professor", count: 2, interval: 4500 },
      { type: "necromancer", count: 2, interval: 3600 },
      { type: "warlock", count: 4, interval: 2400 },
    ],
    [
      { type: "shadow_knight", count: 3, interval: 3600 },
      { type: "berserker", count: 5, interval: 2200 },
      { type: "hexer", count: 5, interval: 2200 },
    ],
    [
      { type: "dean", count: 1, interval: 8000 },
      { type: "shadow_knight", count: 3, interval: 3200 },
      { type: "specter", count: 5, interval: 2000 },
    ],
    [
      { type: "professor", count: 3, interval: 4000 },
      { type: "necromancer", count: 3, interval: 3200 },
      { type: "warlock", count: 4, interval: 2400 },
    ],
    [
      { type: "dean", count: 2, interval: 6000 },
      { type: "shadow_knight", count: 4, interval: 3000 },
      { type: "berserker", count: 5, interval: 2000 },
    ],
    [
      { type: "dean", count: 2, interval: 5500 },
      { type: "necromancer", count: 3, interval: 3000 },
      { type: "shadow_knight", count: 3, interval: 3200 },
    ],
    [
      { type: "dean", count: 2, interval: 5000 },
      { type: "wyvern", count: 3, interval: 3000 },
      { type: "necromancer", count: 4, interval: 2800 },
      { type: "berserker", count: 6, interval: 2000 },
    ],
  ],

  sunken_temple: [
    // 18 waves - Ancient horrors unleashed
    [
      { type: "senior", count: 6, interval: 2000 },
      { type: "hexer", count: 4, interval: 2400 },
    ],
    [
      { type: "shadow_knight", count: 3, interval: 3600 },
      { type: "warlock", count: 4, interval: 2600 },
      { type: "hexer", count: 5, interval: 2200 },
    ],
    [
      { type: "wyvern", count: 3, interval: 3200 },
      { type: "specter", count: 5, interval: 2200 },
      { type: "necromancer", count: 2, interval: 4000 },
    ],
    [
      { type: "golem", count: 1, interval: 8000 },
      { type: "wyvern", count: 3, interval: 3000 },
      { type: "warlock", count: 5, interval: 2400 },
    ],
    [
      { type: "shadow_knight", count: 4, interval: 3200 },
      { type: "specter", count: 5, interval: 2200 },
      { type: "wyvern", count: 3, interval: 3000 },
    ],
    [
      { type: "berserker", count: 6, interval: 2000 },
      { type: "hexer", count: 6, interval: 2000 },
      { type: "shadow_knight", count: 2, interval: 3600 },
    ],
    [
      { type: "professor", count: 3, interval: 4000 },
      { type: "golem", count: 2, interval: 6500 },
      { type: "necromancer", count: 2, interval: 3200 },
    ],
    [
      { type: "necromancer", count: 4, interval: 3000 },
      { type: "shadow_knight", count: 4, interval: 3200 },
      { type: "berserker", count: 5, interval: 2200 },
    ],
    [
      { type: "dean", count: 2, interval: 6000 },
      { type: "berserker", count: 6, interval: 2000 },
      { type: "specter", count: 5, interval: 2200 },
    ],
    [
      { type: "golem", count: 2, interval: 6000 },
      { type: "warlock", count: 6, interval: 2000 },
      { type: "wyvern", count: 4, interval: 2800 },
    ],
    [
      { type: "shadow_knight", count: 5, interval: 2800 },
      { type: "necromancer", count: 4, interval: 3000 },
      { type: "hexer", count: 6, interval: 2000 },
    ],
    [
      { type: "trustee", count: 1, interval: 10000 },
      { type: "wyvern", count: 4, interval: 2400 },
      { type: "specter", count: 6, interval: 2000 },
    ],
    [
      { type: "dean", count: 2, interval: 5000 },
      { type: "golem", count: 2, interval: 6000 },
      { type: "shadow_knight", count: 4, interval: 3000 },
    ],
    [
      { type: "berserker", count: 8, interval: 1800 },
      { type: "shadow_knight", count: 5, interval: 2800 },
      { type: "necromancer", count: 3, interval: 3000 },
    ],
    [
      { type: "trustee", count: 1, interval: 8000 },
      { type: "necromancer", count: 5, interval: 2600 },
      { type: "wyvern", count: 4, interval: 2400 },
    ],
    [
      { type: "golem", count: 3, interval: 5500 },
      { type: "dean", count: 3, interval: 4500 },
      { type: "berserker", count: 6, interval: 2000 },
    ],
    [
      { type: "trustee", count: 2, interval: 7500 },
      { type: "professor", count: 4, interval: 3600 },
      { type: "shadow_knight", count: 6, interval: 2400 },
    ],
    // Final wave - the temple awakens
    [
      { type: "trustee", count: 2, interval: 7000 },
      { type: "golem", count: 3, interval: 5000 },
      { type: "wyvern", count: 6, interval: 2200 },
      { type: "necromancer", count: 5, interval: 2600 },
    ],
  ],

  // =====================
  // DESERT REGION - Ranged assault
  // =====================
  oasis: [
    // 10 waves - Desert ranged combat
    [
      { type: "sophomore", count: 8, interval: 1800 },
      { type: "archer", count: 2, interval: 2800 },
    ],
    [
      { type: "junior", count: 6, interval: 1800 },
      { type: "archer", count: 4, interval: 2600 },
    ],
    [
      { type: "archer", count: 5, interval: 2400 },
      { type: "junior", count: 6, interval: 1800 },
      { type: "sophomore", count: 4, interval: 1800 },
    ],
    [
      { type: "senior", count: 3, interval: 2800 },
      { type: "archer", count: 5, interval: 2200 },
      { type: "junior", count: 5, interval: 2000 },
    ],
    [
      { type: "mage", count: 2, interval: 3500 },
      { type: "archer", count: 5, interval: 2200 },
      { type: "senior", count: 4, interval: 2600 },
    ],
    [
      { type: "mascot", count: 5, interval: 2200 },
      { type: "mage", count: 3, interval: 3000 },
      { type: "archer", count: 4, interval: 2400 },
    ],
    [
      { type: "gradstudent", count: 3, interval: 3200 },
      { type: "archer", count: 6, interval: 2000 },
      { type: "mage", count: 2, interval: 3000 },
    ],
    [
      { type: "gradstudent", count: 4, interval: 3000 },
      { type: "mage", count: 4, interval: 2800 },
      { type: "senior", count: 5, interval: 2400 },
    ],
    [
      { type: "professor", count: 2, interval: 5500 },
      { type: "gradstudent", count: 4, interval: 2800 },
      { type: "archer", count: 6, interval: 2000 },
    ],
    [
      { type: "professor", count: 2, interval: 5000 },
      { type: "mage", count: 5, interval: 2400 },
      { type: "mascot", count: 6, interval: 2000 },
    ],
  ],

  pyramid: [
    // 12 waves - Pyramid ranged siege
    [
      { type: "junior", count: 8, interval: 1800 },
      { type: "archer", count: 4, interval: 2400 },
    ],
    [
      { type: "archer", count: 6, interval: 2200 },
      { type: "junior", count: 6, interval: 1800 },
    ],
    [
      { type: "senior", count: 4, interval: 2600 },
      { type: "mage", count: 2, interval: 3200 },
      { type: "archer", count: 5, interval: 2200 },
    ],
    [
      { type: "mage", count: 4, interval: 2800 },
      { type: "mascot", count: 5, interval: 2200 },
      { type: "archer", count: 5, interval: 2200 },
    ],
    [
      { type: "catapult", count: 2, interval: 4500 },
      { type: "senior", count: 5, interval: 2400 },
      { type: "archer", count: 6, interval: 2000 },
    ],
    [
      { type: "gradstudent", count: 4, interval: 3000 },
      { type: "mage", count: 4, interval: 2600 },
      { type: "catapult", count: 2, interval: 4200 },
    ],
    [
      { type: "professor", count: 2, interval: 5000 },
      { type: "archer", count: 8, interval: 2000 },
      { type: "mage", count: 3, interval: 2800 },
    ],
    [
      { type: "professor", count: 2, interval: 4500 },
      { type: "catapult", count: 2, interval: 4000 },
      { type: "gradstudent", count: 4, interval: 2800 },
    ],
    [
      { type: "dean", count: 1, interval: 8000 },
      { type: "professor", count: 2, interval: 4200 },
      { type: "mage", count: 5, interval: 2400 },
    ],
    [
      { type: "dean", count: 2, interval: 6500 },
      { type: "harpy", count: 6, interval: 2000 },
      { type: "archer", count: 6, interval: 2000 },
    ],
    [
      { type: "dean", count: 2, interval: 6000 },
      { type: "catapult", count: 3, interval: 3600 },
      { type: "professor", count: 3, interval: 4000 },
    ],
    [
      { type: "dean", count: 2, interval: 5500 },
      { type: "professor", count: 4, interval: 3600 },
      { type: "mage", count: 6, interval: 2200 },
      { type: "mascot", count: 6, interval: 2000 },
    ],
  ],

  sphinx: [
    // 14 waves - Sphinx gauntlet
    [
      { type: "senior", count: 6, interval: 2000 },
      { type: "archer", count: 5, interval: 2400 },
    ],
    [
      { type: "archer", count: 8, interval: 2000 },
      { type: "mage", count: 3, interval: 3000 },
      { type: "senior", count: 4, interval: 2400 },
    ],
    [
      { type: "warlock", count: 4, interval: 2800 },
      { type: "mage", count: 4, interval: 2600 },
      { type: "junior", count: 6, interval: 1800 },
    ],
    [
      { type: "gradstudent", count: 4, interval: 3000 },
      { type: "archer", count: 6, interval: 2000 },
      { type: "catapult", count: 2, interval: 4200 },
    ],
    [
      { type: "professor", count: 2, interval: 4500 },
      { type: "mascot", count: 6, interval: 2000 },
      { type: "mage", count: 4, interval: 2600 },
    ],
    [
      { type: "catapult", count: 3, interval: 3600 },
      { type: "senior", count: 6, interval: 2000 },
      { type: "wyvern", count: 2, interval: 3200 },
    ],
    [
      { type: "dean", count: 1, interval: 8000 },
      { type: "professor", count: 3, interval: 4000 },
      { type: "archer", count: 8, interval: 2000 },
    ],
    [
      { type: "dean", count: 2, interval: 6500 },
      { type: "catapult", count: 3, interval: 3200 },
      { type: "wyvern", count: 4, interval: 2800 },
    ],
    [
      { type: "professor", count: 4, interval: 3600 },
      { type: "mage", count: 6, interval: 2200 },
      { type: "gradstudent", count: 5, interval: 2600 },
    ],
    [
      { type: "dean", count: 2, interval: 5500 },
      { type: "gradstudent", count: 5, interval: 2400 },
      { type: "wyvern", count: 3, interval: 3000 },
    ],
    [
      { type: "trustee", count: 1, interval: 10000 },
      { type: "dean", count: 2, interval: 5000 },
      { type: "mascot", count: 8, interval: 1800 },
    ],
    [
      { type: "trustee", count: 1, interval: 9500 },
      { type: "catapult", count: 3, interval: 3200 },
      { type: "wyvern", count: 4, interval: 2600 },
    ],
    [
      { type: "trustee", count: 1, interval: 9000 },
      { type: "professor", count: 4, interval: 3600 },
      { type: "dean", count: 2, interval: 5000 },
    ],
    [
      { type: "trustee", count: 2, interval: 8000 },
      { type: "dean", count: 3, interval: 4600 },
      { type: "mage", count: 8, interval: 2000 },
      { type: "harpy", count: 8, interval: 2000 },
    ],
  ],

  // =====================
  // WINTER REGION - Brutal variety
  // =====================
  glacier: [
    // 12 waves - Glacier assault
    [
      { type: "junior", count: 8, interval: 1800 },
      { type: "crossbowman", count: 2, interval: 3200 },
      { type: "archer", count: 4, interval: 2400 },
    ],
    [
      { type: "senior", count: 5, interval: 2200 },
      { type: "hexer", count: 5, interval: 2400 },
      { type: "mascot", count: 5, interval: 2200 },
    ],
    [
      { type: "archer", count: 6, interval: 2000 },
      { type: "crossbowman", count: 3, interval: 3000 },
      { type: "senior", count: 5, interval: 2200 },
    ],
    [
      { type: "mascot", count: 6, interval: 2000 },
      { type: "crossbowman", count: 3, interval: 3000 },
      { type: "mage", count: 3, interval: 2800 },
    ],
    [
      { type: "gradstudent", count: 4, interval: 3000 },
      { type: "senior", count: 6, interval: 2000 },
      { type: "hexer", count: 5, interval: 2400 },
    ],
    [
      { type: "mage", count: 5, interval: 2400 },
      { type: "archer", count: 6, interval: 2000 },
      { type: "crossbowman", count: 3, interval: 3000 },
    ],
    [
      { type: "catapult", count: 2, interval: 4200 },
      { type: "gradstudent", count: 5, interval: 2600 },
      { type: "harpy", count: 5, interval: 2400 },
    ],
    [
      { type: "professor", count: 2, interval: 4500 },
      { type: "senior", count: 6, interval: 2000 },
      { type: "crossbowman", count: 4, interval: 2800 },
    ],
    [
      { type: "mascot", count: 8, interval: 2000 },
      { type: "mage", count: 5, interval: 2400 },
      { type: "wyvern", count: 3, interval: 3000 },
    ],
    [
      { type: "professor", count: 3, interval: 4000 },
      { type: "archer", count: 8, interval: 2000 },
      { type: "catapult", count: 2, interval: 4000 },
    ],
    [
      { type: "dean", count: 1, interval: 8000 },
      { type: "gradstudent", count: 6, interval: 2200 },
      { type: "crossbowman", count: 5, interval: 2600 },
    ],
    [
      { type: "dean", count: 2, interval: 6500 },
      { type: "professor", count: 3, interval: 4000 },
      { type: "wyvern", count: 6, interval: 2200 },
      { type: "crossbowman", count: 5, interval: 2600 },
    ],
  ],

  fortress: [
    // 14 waves - Fortress siege
    [
      { type: "senior", count: 8, interval: 1800 },
      { type: "hexer", count: 6, interval: 2200 },
    ],
    [
      { type: "gradstudent", count: 4, interval: 3000 },
      { type: "mascot", count: 8, interval: 2000 },
      { type: "crossbowman", count: 4, interval: 3000 },
    ],
    [
      { type: "archer", count: 8, interval: 2000 },
      { type: "mage", count: 4, interval: 2800 },
      { type: "senior", count: 5, interval: 2400 },
    ],
    [
      { type: "mascot", count: 6, interval: 2000 },
      { type: "crossbowman", count: 5, interval: 2600 },
      { type: "gradstudent", count: 4, interval: 3000 },
    ],
    [
      { type: "professor", count: 2, interval: 4500 },
      { type: "senior", count: 8, interval: 2000 },
      { type: "hexer", count: 5, interval: 2400 },
    ],
    [
      { type: "catapult", count: 3, interval: 3600 },
      { type: "archer", count: 8, interval: 2000 },
      { type: "wyvern", count: 3, interval: 3000 },
    ],
    [
      { type: "gradstudent", count: 6, interval: 2400 },
      { type: "mage", count: 6, interval: 2400 },
      { type: "crossbowman", count: 4, interval: 2800 },
    ],
    [
      { type: "professor", count: 4, interval: 3600 },
      { type: "mascot", count: 8, interval: 2000 },
      { type: "catapult", count: 2, interval: 4000 },
    ],
    [
      { type: "dean", count: 2, interval: 6500 },
      { type: "wyvern", count: 4, interval: 2600 },
      { type: "gradstudent", count: 6, interval: 2200 },
    ],
    [
      { type: "dean", count: 2, interval: 5500 },
      { type: "catapult", count: 4, interval: 3200 },
      { type: "professor", count: 3, interval: 4000 },
    ],
    [
      { type: "professor", count: 5, interval: 3200 },
      { type: "mage", count: 8, interval: 2000 },
      { type: "crossbowman", count: 5, interval: 2600 },
    ],
    [
      { type: "dean", count: 3, interval: 5000 },
      { type: "professor", count: 4, interval: 3600 },
      { type: "wyvern", count: 4, interval: 2600 },
    ],
    [
      { type: "trustee", count: 1, interval: 10000 },
      { type: "dean", count: 3, interval: 4800 },
      { type: "archer", count: 10, interval: 1800 },
    ],
    [
      { type: "trustee", count: 2, interval: 8000 },
      { type: "dean", count: 3, interval: 4600 },
      { type: "wyvern", count: 6, interval: 2200 },
      { type: "hexer", count: 8, interval: 2000 },
    ],
  ],

  peak: [
    // 16 waves - Summit challenge
    [
      { type: "gradstudent", count: 6, interval: 2200 },
      { type: "crossbowman", count: 4, interval: 3000 },
    ],
    [
      { type: "professor", count: 2, interval: 4500 },
      { type: "senior", count: 8, interval: 2000 },
      { type: "hexer", count: 5, interval: 2400 },
    ],
    [
      { type: "mascot", count: 10, interval: 1800 },
      { type: "archer", count: 6, interval: 2200 },
      { type: "mage", count: 4, interval: 2800 },
    ],
    [
      { type: "dean", count: 1, interval: 8000 },
      { type: "gradstudent", count: 6, interval: 2200 },
      { type: "crossbowman", count: 5, interval: 2600 },
    ],
    [
      { type: "mage", count: 8, interval: 2000 },
      { type: "catapult", count: 3, interval: 3600 },
      { type: "wyvern", count: 4, interval: 2800 },
    ],
    [
      { type: "professor", count: 4, interval: 3600 },
      { type: "mascot", count: 8, interval: 2000 },
      { type: "crossbowman", count: 5, interval: 2600 },
    ],
    [
      { type: "dean", count: 2, interval: 5500 },
      { type: "archer", count: 10, interval: 1800 },
      { type: "hexer", count: 6, interval: 2200 },
    ],
    [
      { type: "catapult", count: 4, interval: 3200 },
      { type: "mage", count: 6, interval: 2400 },
      { type: "crossbowman", count: 5, interval: 2600 },
    ],
    [
      { type: "professor", count: 5, interval: 3200 },
      { type: "gradstudent", count: 8, interval: 2000 },
      { type: "wyvern", count: 4, interval: 2600 },
    ],
    [
      { type: "dean", count: 3, interval: 5000 },
      { type: "catapult", count: 4, interval: 3200 },
      { type: "harpy", count: 8, interval: 2000 },
    ],
    [
      { type: "trustee", count: 1, interval: 10000 },
      { type: "professor", count: 4, interval: 3600 },
      { type: "crossbowman", count: 6, interval: 2400 },
    ],
    [
      { type: "dean", count: 4, interval: 4600 },
      { type: "mascot", count: 10, interval: 1800 },
      { type: "crossbowman", count: 6, interval: 2400 },
    ],
    [
      { type: "trustee", count: 2, interval: 8000 },
      { type: "dean", count: 3, interval: 4800 },
      { type: "wyvern", count: 8, interval: 2000 },
    ],
    [
      { type: "trustee", count: 2, interval: 7500 },
      { type: "professor", count: 5, interval: 3200 },
      { type: "mage", count: 8, interval: 2200 },
    ],
    [
      { type: "trustee", count: 2, interval: 7000 },
      { type: "dean", count: 3, interval: 4600 },
      { type: "wyvern", count: 6, interval: 2200 },
      { type: "crossbowman", count: 6, interval: 2400 },
    ],
    [
      { type: "golem", count: 3, interval: 8000 },
      { type: "trustee", count: 2, interval: 6500 },
      { type: "crossbowman", count: 8, interval: 2200 },
      { type: "catapult", count: 4, interval: 3000 },
    ],
  ],

  // =====================
  // VOLCANIC REGION - Ultimate challenge
  // =====================
  lava: [
    // 14 waves - Lava fields assault
    [
      { type: "senior", count: 10, interval: 1800 },
      { type: "archer", count: 5, interval: 2400 },
    ],
    [
      { type: "gradstudent", count: 6, interval: 2200 },
      { type: "shadow_knight", count: 2, interval: 4000 },
      { type: "archer", count: 6, interval: 2200 },
    ],
    [
      { type: "professor", count: 2, interval: 4500 },
      { type: "mage", count: 5, interval: 2400 },
      { type: "berserker", count: 5, interval: 2200 },
    ],
    [
      { type: "shadow_knight", count: 4, interval: 3200 },
      { type: "mascot", count: 10, interval: 1800 },
      { type: "senior", count: 6, interval: 2000 },
    ],
    [
      { type: "catapult", count: 3, interval: 3600 },
      { type: "gradstudent", count: 6, interval: 2200 },
      { type: "shadow_knight", count: 3, interval: 3600 },
    ],
    [
      { type: "dean", count: 2, interval: 6500 },
      { type: "professor", count: 4, interval: 3600 },
      { type: "berserker", count: 8, interval: 2000 },
    ],
    [
      { type: "mage", count: 8, interval: 2000 },
      { type: "archer", count: 10, interval: 1800 },
      { type: "warlock", count: 4, interval: 2800 },
    ],
    [
      { type: "dean", count: 2, interval: 5500 },
      { type: "catapult", count: 4, interval: 3200 },
      { type: "mascot", count: 8, interval: 2000 },
    ],
    [
      { type: "professor", count: 5, interval: 3200 },
      { type: "shadow_knight", count: 5, interval: 3000 },
      { type: "warlock", count: 5, interval: 2600 },
    ],
    [
      { type: "trustee", count: 1, interval: 10000 },
      { type: "dean", count: 3, interval: 4800 },
      { type: "wyvern", count: 6, interval: 2200 },
    ],
    [
      { type: "berserker", count: 12, interval: 1800 },
      { type: "dean", count: 3, interval: 4600 },
      { type: "mage", count: 8, interval: 2000 },
    ],
    [
      { type: "trustee", count: 2, interval: 8000 },
      { type: "professor", count: 5, interval: 3200 },
      { type: "wyvern", count: 10, interval: 2000 },
    ],
    [
      { type: "shadow_knight", count: 8, interval: 2400 },
      { type: "trustee", count: 2, interval: 7000 },
      { type: "catapult", count: 4, interval: 3000 },
      { type: "golem", count: 2, interval: 8000 },
    ],
    [
      { type: "necromancer", count: 5, interval: 2600 },
      { type: "trustee", count: 2, interval: 6500 },
      { type: "dean", count: 3, interval: 4600 },
      { type: "golem", count: 3, interval: 7500 },
    ],
  ],

  crater: [
    // 16 waves - Caldera challenge
    [
      { type: "gradstudent", count: 8, interval: 2000 },
      { type: "hexer", count: 5, interval: 2400 },
      { type: "crossbowman", count: 4, interval: 3000 },
    ],
    [
      { type: "shadow_knight", count: 4, interval: 3200 },
      { type: "professor", count: 3, interval: 4000 },
      { type: "archer", count: 8, interval: 2000 },
    ],
    [
      { type: "dean", count: 2, interval: 6500 },
      { type: "mage", count: 6, interval: 2400 },
      { type: "specter", count: 5, interval: 2600 },
    ],
    [
      { type: "catapult", count: 4, interval: 3200 },
      { type: "gradstudent", count: 8, interval: 2000 },
      { type: "harpy", count: 6, interval: 2200 },
    ],
    [
      { type: "mascot", count: 12, interval: 1700 },
      { type: "professor", count: 4, interval: 3600 },
      { type: "mage", count: 6, interval: 2400 },
    ],
    [
      { type: "dean", count: 2, interval: 5500 },
      { type: "archer", count: 10, interval: 1800 },
      { type: "wyvern", count: 4, interval: 2600 },
    ],
    [
      { type: "professor", count: 5, interval: 3200 },
      { type: "catapult", count: 4, interval: 3200 },
      { type: "shadow_knight", count: 4, interval: 3200 },
    ],
    [
      { type: "trustee", count: 1, interval: 10000 },
      { type: "dean", count: 3, interval: 4800 },
      { type: "necromancer", count: 3, interval: 3200 },
    ],
    [
      { type: "mage", count: 10, interval: 2000 },
      { type: "mascot", count: 10, interval: 1800 },
      { type: "berserker", count: 6, interval: 2200 },
    ],
    [
      { type: "dean", count: 4, interval: 4600 },
      { type: "professor", count: 5, interval: 3200 },
      { type: "wyvern", count: 6, interval: 2200 },
    ],
    [
      { type: "trustee", count: 2, interval: 8000 },
      { type: "catapult", count: 4, interval: 3000 },
      { type: "shadow_knight", count: 4, interval: 3000 },
    ],
    [
      { type: "trustee", count: 2, interval: 7500 },
      { type: "mage", count: 8, interval: 2000 },
      { type: "necromancer", count: 4, interval: 3000 },
    ],
    [
      { type: "dean", count: 5, interval: 4200 },
      { type: "archer", count: 12, interval: 1700 },
      { type: "necromancer", count: 5, interval: 2600 },
    ],
    [
      { type: "trustee", count: 2, interval: 7000 },
      { type: "dean", count: 4, interval: 4500 },
      { type: "golem", count: 2, interval: 8000 },
    ],
    [
      { type: "trustee", count: 3, interval: 6500 },
      { type: "professor", count: 6, interval: 3000 },
      { type: "necromancer", count: 6, interval: 2600 },
    ],
    [
      { type: "trustee", count: 4, interval: 6000 },
      { type: "catapult", count: 6, interval: 2800 },
      { type: "shadow_knight", count: 6, interval: 2600 },
      { type: "golem", count: 4, interval: 7000 },
    ],
  ],

  throne: [
    // The ultimate challenge - 20 waves of doom
    [
      { type: "professor", count: 5, interval: 3200 },
      { type: "shadow_knight", count: 6, interval: 2400 },
      { type: "golem", count: 1, interval: 8000 },
    ],
    [
      { type: "dean", count: 2, interval: 5500 },
      { type: "gradstudent", count: 8, interval: 2000 },
      { type: "shadow_knight", count: 4, interval: 2800 },
    ],
    [
      { type: "mage", count: 8, interval: 2000 },
      { type: "archer", count: 10, interval: 1800 },
      { type: "berserker", count: 8, interval: 2000 },
    ],
    [
      { type: "catapult", count: 3, interval: 4000 },
      { type: "professor", count: 4, interval: 4000 },
      { type: "golem", count: 2, interval: 8000 },
    ],
    [
      { type: "trustee", count: 1, interval: 10000 },
      { type: "dean", count: 3, interval: 4800 },
      { type: "shadow_knight", count: 6, interval: 2400 },
    ],
    [
      { type: "mascot", count: 12, interval: 1700 },
      { type: "mage", count: 8, interval: 2000 },
      { type: "golem", count: 2, interval: 7500 },
      { type: "shadow_knight", count: 4, interval: 2800 },
    ],
    [
      { type: "dean", count: 4, interval: 4600 },
      { type: "catapult", count: 4, interval: 3000 },
      { type: "hexer", count: 10, interval: 1800 },
    ],
    [
      { type: "professor", count: 6, interval: 3000 },
      { type: "archer", count: 12, interval: 1700 },
      { type: "necromancer", count: 4, interval: 3000 },
    ],
    [
      { type: "trustee", count: 2, interval: 8000 },
      { type: "dean", count: 3, interval: 4800 },
      { type: "hexer", count: 8, interval: 2000 },
    ],
    [
      { type: "mage", count: 10, interval: 2000 },
      { type: "catapult", count: 4, interval: 3000 },
      { type: "golem", count: 3, interval: 7200 },
      { type: "necromancer", count: 4, interval: 2600 },
    ],
    [
      { type: "dean", count: 5, interval: 4200 },
      { type: "professor", count: 5, interval: 3200 },
      { type: "shadow_knight", count: 8, interval: 2400 },
      { type: "golem", count: 2, interval: 7500 },
    ],
    [
      { type: "trustee", count: 2, interval: 7500 },
      { type: "mascot", count: 10, interval: 1800 },
      { type: "hexer", count: 8, interval: 2000 },
      { type: "shadow_knight", count: 6, interval: 2400 },
    ],
    [
      { type: "catapult", count: 6, interval: 2800 },
      { type: "mage", count: 10, interval: 2000 },
      { type: "golem", count: 3, interval: 6800 },
      { type: "hexer", count: 10, interval: 1800 },
    ],
    [
      { type: "trustee", count: 3, interval: 6500 },
      { type: "archer", count: 12, interval: 1700 },
      { type: "specter", count: 10, interval: 1800 },
    ],
    [
      { type: "dean", count: 5, interval: 4200 },
      { type: "catapult", count: 6, interval: 2800 },
      { type: "berserker", count: 10, interval: 1800 },
    ],
    [
      { type: "trustee", count: 3, interval: 6500 },
      { type: "professor", count: 8, interval: 2800 },
      { type: "necromancer", count: 6, interval: 2600 },
    ],
    [
      { type: "mage", count: 12, interval: 1800 },
      { type: "mascot", count: 12, interval: 1700 },
      { type: "specter", count: 10, interval: 1800 },
      { type: "necromancer", count: 8, interval: 2400 },
    ],
    [
      { type: "trustee", count: 4, interval: 6000 },
      { type: "dean", count: 5, interval: 4200 },
      { type: "golem", count: 4, interval: 6500 },
    ],
    [
      { type: "catapult", count: 8, interval: 2600 },
      { type: "trustee", count: 3, interval: 6500 },
      { type: "specter", count: 8, interval: 2000 },
    ],
    // Final wave - the ultimate test of skill
    [
      { type: "trustee", count: 5, interval: 5000 },
      { type: "dean", count: 6, interval: 4000 },
      { type: "professor", count: 8, interval: 3000 },
      { type: "wyvern", count: 10, interval: 2000 },
      { type: "golem", count: 6, interval: 6000 },
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
  { base: string; dark: string; accent: string; light: string; primary: string; secondary: string }
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
};

export const HERO_COLORS: Record<
  HeroType,
  { base: string; dark: string; accent: string; light: string }
> = {
  tiger: {
    base: "#ff8c00",
    dark: "#cc7000",
    accent: "#ffffff",
    light: "#ffaa33",
  },
  tenor: {
    base: "#1e90ff",
    dark: "#1666cc",
    accent: "#ffff00",
    light: "#4da6ff",
  },
  mathey: {
    base: "#32cd32",
    dark: "#28a428",
    accent: "#ff69b4",
    light: "#5ce65c",
  },
  rocky: {
    base: "#a0522d",
    dark: "#72391f",
    accent: "#00ffff",
    light: "#c07044",
  },
  scott: {
    base: "#800080",
    dark: "#590059",
    accent: "#ffd700",
    light: "#a040a0",
  },
  captain: {
    base: "#ff1493",
    dark: "#cc0f6f",
    accent: "#00ff00",
    light: "#ff4ab8",
  },
  engineer: {
    base: "#708090",
    dark: "#505060",
    accent: "#ffa500",
    light: "#90a0b0",
  },
};
