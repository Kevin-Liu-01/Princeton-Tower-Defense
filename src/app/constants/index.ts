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
import { TOWER_STATS } from "./towerStats";

// Grid settings - 30x30 maps for more strategic depth
export const TILE_SIZE = 64;
export const GRID_WIDTH = 30;
export const GRID_HEIGHT = 30;

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
      A: { name: string; desc: string; effect: string; range?: number };
      B: { name: string; desc: string; effect: string; range?: number };
    };
    levelDesc: { [key: number]: string };
  }
> = {
  station: {
    name: TOWER_STATS.station.name,
    icon: TOWER_STATS.station.icon,
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
    icon: TOWER_STATS.cannon.icon,
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
    icon: TOWER_STATS.library.icon,
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
        name: "Earthquake Smasher",
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
    icon: TOWER_STATS.lab.icon,
    cost: TOWER_STATS.lab.levels[1].cost,
    damage: TOWER_STATS.lab.baseStats.damage,
    range: TOWER_STATS.lab.baseStats.range,
    attackSpeed: TOWER_STATS.lab.baseStats.attackSpeed,
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
        range: 320,
      },
      B: {
        name: "Chain Lightning",
        desc: "Multi-target electricity",
        effect: "Hits up to 5 targets at once",
        range: 300,
      },
    },
  },
  arch: {
    name: TOWER_STATS.arch.name,
    icon: TOWER_STATS.arch.icon,
    cost: TOWER_STATS.arch.levels[1].cost,
    damage: TOWER_STATS.arch.baseStats.damage,
    range: TOWER_STATS.arch.baseStats.range,
    attackSpeed: TOWER_STATS.arch.baseStats.attackSpeed,
    desc: "Sonic attacks hit air and ground.",
    levelDesc: {
      1: "Sound Waves - Single target sonic",
      2: "Resonance - Hits 2 targets, 1.5x damage",
      3: "Acoustic Bass - Hits 3 targets, 30% faster",
      4: "Choose: Shockwave or Symphony",
    },
    upgrades: {
      A: {
        name: "Shockwave Emitter",
        desc: "Powerful stunning sound waves",
        effect: "30% chance to stun enemies for 1s",
        range: 390,
      },
      B: {
        name: "Symphony Hall",
        desc: "Harmonious multi-target",
        effect: "Hits up to 5 enemies simultaneously",
        range: 416,
      },
    },
  },
  club: {
    name: TOWER_STATS.club.name,
    icon: TOWER_STATS.club.icon,
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
    name: "Eating Club Bouncer",
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
    name: "Tiger Transit Wyvern",
    hp: 1200,
    speed: 0.36,
    bounty: 110,
    armor: 0.3,
    flying: true,
    desc: "A massive flying dragon that stops for no one.",
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
    hp: 14500,
    speed: 0.09,
    bounty: 450,
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
  // ======== NEW ENEMY TYPES ========
  cultist: {
    name: "Finals Week Cultist",
    hp: 280,
    speed: 0.38,
    bounty: 22,
    armor: 0.05,
    flying: false,
    desc: "Sleep-deprived zealots chanting forbidden study rituals.",
    color: "#7c2d12",
    size: 21,
  },
  plaguebearer: {
    name: "Flu Season Carrier",
    hp: 520,
    speed: 0.25,
    bounty: 40,
    armor: 0.15,
    flying: false,
    desc: "Spreads infectious misery wherever it walks. Keep your distance.",
    color: "#65a30d",
    size: 25,
  },
  thornwalker: {
    name: "Ivy Overgrowth",
    hp: 680,
    speed: 0.2,
    bounty: 55,
    armor: 0.35,
    flying: false,
    desc: "Living vegetation consumed by dark magic. Thorns regenerate.",
    color: "#166534",
    size: 28,
  },
  sandworm: {
    name: "Thesis Devourer",
    hp: 1600,
    speed: 0.16,
    bounty: 95,
    armor: 0.4,
    flying: false,
    desc: "Burrows through the ground, consuming all academic progress.",
    color: "#a16207",
    size: 38,
  },
  frostling: {
    name: "Winter Break Ghost",
    hp: 350,
    speed: 0.45,
    bounty: 35,
    armor: 0.1,
    flying: false,
    desc: "The lingering chill of empty campus nights given form.",
    color: "#7dd3fc",
    size: 22,
  },
  infernal: {
    name: "Burnout Demon",
    hp: 1100,
    speed: 0.28,
    bounty: 85,
    armor: 0.25,
    flying: false,
    desc: "Forged from the flames of overwork and impossible deadlines.",
    color: "#dc2626",
    size: 30,
  },
  banshee: {
    name: "Grade Wailing Spirit",
    hp: 480,
    speed: 0.55,
    bounty: 50,
    armor: 0.45,
    flying: true,
    desc: "Screams of those who saw their final grades. Haunting and fast.",
    color: "#e2e8f0",
    size: 24,
  },
  juggernaut: {
    name: "Endowed Chair",
    hp: 4200,
    speed: 0.1,
    bounty: 200,
    armor: 0.6,
    flying: false,
    desc: "Unstoppable academic authority. Backed by millions in funding.",
    color: "#44403c",
    size: 40,
  },
  assassin: {
    name: "Curve Wrecker",
    hp: 320,
    speed: 0.7,
    bounty: 45,
    armor: 0,
    flying: false,
    desc: "Lightning fast, destroys grading curves with precision strikes.",
    color: "#1e1b4b",
    size: 20,
  },
  dragon: {
    name: "Ancient Alumnus",
    hp: 12000,
    speed: 0.12,
    bounty: 500,
    armor: 0.55,
    flying: true,
    desc: "A legendary donor from centuries past, returned to judge the worthy.",
    color: "#9f1239",
    size: 48,
  },
};

// Hero data - Enhanced HP for better survivability
export const HERO_DATA: Record<HeroType, HeroData> = {
  tiger: {
    name: "Princeton Tiger",
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
    name: "Acapella Tenor",
    icon: "🎵",
    description:
      "A virtuoso vocalist whose voice is a weapon. The Tenor's sonic attacks pierce through even the toughest armor.",
    hp: 1800,
    damage: 60,
    range: 250,
    attackSpeed: 450,
    speed: 2.5,
    ability: "High Note",
    abilityDesc: "Devastating sonic blast stuns enemies and heals nearby allies",
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
    name: "Rocky Raccoon",
    icon: "🌰",
    description:
      "A legendary gargoyle awakened from the campus rooftops. Hurls massive boulders that devastate enemy formations.",
    hp: 2200,
    damage: 90,
    range: 180,
    attackSpeed: 700,
    speed: 2.8,
    ability: "Boulder Bash",
    abilityDesc: "Throws massive boulders dealing huge AoE damage",
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
    ability: "Inspiration Cheer",
    abilityDesc: "Boosts tower damage +50% and range +25% for 8s",
    color: "#14b8a6",
    isRanged: true,
  },
  captain: {
    name: "General Mercer",
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
    name: "BSE Engineer",
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
    name: "Meteor Shower",
    cost: 50,
    cooldown: 15000,
    desc: "Rains 10 meteors dealing 50 AoE damage each, burning enemies for 4s",
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
    desc: "Elite archer that can target flying enemies",
    color: "#8b4513",
    isMounted: true,
    isRanged: true,
    range: 280,
    canTargetFlying: true,
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
  // All paths expanded and centered for 30x30 grid
  // =====================
  poe: [
    { x: -2, y: 15 },
    { x: 4, y: 15 },
    { x: 10, y: 15 },
    { x: 10, y: 8 },
    { x: 16, y: 8 },
    { x: 16, y: 18 },
    { x: 22, y: 18 },
    { x: 22, y: 12 },
    { x: 28, y: 12 },
    { x: 32, y: 12 },
  ],
  carnegie: [
    { x: 15, y: -2 },
    { x: 15, y: 6 },
    { x: 9, y: 6 },
    { x: 9, y: 14 },
    { x: 15, y: 14 },
    { x: 15, y: 20 },
    { x: 21, y: 20 },
    { x: 21, y: 10 },
    { x: 26, y: 10 },
    { x: 26, y: 20 },
    { x: 26, y: 28 },
    { x: 26, y: 32 },
  ],
  nassau: [
    { x: -2, y: 12 },
    { x: 5, y: 12 },
    { x: 5, y: 20 },
    { x: 12, y: 20 },
    { x: 12, y: 8 },
    { x: 20, y: 8 },
    { x: 20, y: 18 },
    { x: 26, y: 18 },
    { x: 32, y: 18 },
  ],
  // =====================
  // SWAMP REGION (Murky Marshes)
  // =====================
  bog: [
    { x: -2, y: 12 },
    { x: 6, y: 12 },
    { x: 6, y: 20 },
    { x: 12, y: 20 },
    { x: 12, y: 12 },
    { x: 18, y: 12 },
    { x: 18, y: 20 },
    { x: 24, y: 20 },
    { x: 24, y: 12 },
    { x: 32, y: 12 },
  ],
  witch_hut: [
    { x: 15, y: -2 },
    { x: 15, y: 4 },
    { x: 9, y: 4 },
    { x: 9, y: 10 },
    { x: 9, y: 16 },
    { x: 15, y: 16 },
    { x: 21, y: 16 },
    { x: 21, y: 10 },
    { x: 27, y: 10 },
    { x: 27, y: 16 },
    { x: 27, y: 24 },
    { x: 27, y: 32 },
  ],
  sunken_temple: [
    { x: -2, y: 8 },
    { x: 6, y: 8 },
    { x: 12, y: 8 },
    { x: 12, y: 16 },
    { x: 18, y: 16 },
    { x: 24, y: 16 },
    { x: 24, y: 24 },
    { x: 32, y: 24 },
  ],
  // Secondary path for sunken temple
  sunken_temple_b: [
    { x: -2, y: 24 },
    { x: 6, y: 24 },
    { x: 12, y: 24 },
    { x: 18, y: 24 },
    { x: 18, y: 16 },
    { x: 24, y: 16 },
    { x: 24, y: 8 },
    { x: 32, y: 8 },
  ],
  // =====================
  // DESERT REGION (Sahara Sands)
  // =====================
  oasis: [
    { x: -2, y: 10 },
    { x: 6, y: 10 },
    { x: 6, y: 18 },
    { x: 12, y: 18 },
    { x: 18, y: 18 },
    { x: 18, y: 10 },
    { x: 24, y: 10 },
    { x: 30, y: 10 },
    { x: 30, y: 17 },
    { x: 32, y: 18 },
    { x: 36, y: 18 },
  ],
  pyramid: [
    { x: 15, y: -2 },
    { x: 15, y: 4 },
    { x: 9, y: 4 },
    { x: 9, y: 10 },
    { x: 9, y: 16 },
    { x: 9, y: 24 },
    { x: 15, y: 24 },
    { x: 15, y: 30 },
    { x: 15, y: 32 },
  ],
  // Secondary path for pyramid
  pyramid_b: [
    { x: 32, y: 16 },
    { x: 28, y: 16 },
    { x: 22, y: 16 },
    { x: 22, y: 24 },
    { x: 15, y: 24 },
    { x: 15, y: 30 },
    { x: 15, y: 32 },
  ],
  sphinx: [
    { x: -2, y: 16 },
    { x: 2, y: 16 },
    { x: 2, y: 8 },
    { x: 8, y: 8 },
    { x: 14, y: 8 },
    { x: 14, y: 16 },
    { x: 20, y: 16 },
    { x: 20, y: 8 },
    { x: 26, y: 8 },
    { x: 26, y: 16 },
    { x: 32, y: 16 },
  ],
  // =====================
  // WINTER REGION (Frozen Frontier)
  // =====================
  glacier: [
    { x: -2, y: 12 },
    { x: 6, y: 12 },
    { x: 6, y: 20 },
    { x: 12, y: 20 },
    { x: 12, y: 12 },
    { x: 18, y: 12 },
    { x: 18, y: 20 },
    { x: 24, y: 20 },
    { x: 30, y: 20 },
    { x: 30, y: 12 },
    { x: 32, y: 12 },
  ],
  fortress: [
    { x: 15, y: -2 },
    { x: 9, y: -2 },
    { x: 9, y: 4 },
    { x: 9, y: 10 },
    { x: 15, y: 10 },
    { x: 21, y: 10 },
    { x: 21, y: 18 },
    { x: 15, y: 18 },
    { x: 15, y: 24 },
    { x: 21, y: 24 },
    { x: 21, y: 30 },
    { x: 21, y: 32 },
  ],
  peak: [
    { x: -2, y: 20 },
    { x: 2, y: 20 },
    { x: 2, y: 12 },
    { x: 8, y: 12 },
    { x: 14, y: 12 },
    { x: 14, y: 20 },
    { x: 20, y: 20 },
    { x: 26, y: 20 },
    { x: 35, y: 20 },
  ],
  // Secondary path for peak
  peak_b: [
    { x: 12, y: -2 },
    { x: 12, y: 6 },
    { x: 22, y: 6 },
    { x: 22, y: 12 },
    { x: 28, y: 12 },
    { x: 28, y: 19 },
    { x: 35, y: 20 },
  ],
  // =====================
  // VOLCANIC REGION (Inferno Depths)
  // =====================
  lava: [
    { x: -2, y: 14 },
    { x: 6, y: 14 },
    { x: 6, y: 6 },
    { x: 12, y: 6 },
    { x: 12, y: 14 },
    { x: 18, y: 14 },
    { x: 18, y: 22 },
    { x: 24, y: 22 },
    { x: 24, y: 14 },
    { x: 32, y: 14 },
  ],
  crater: [
    { x: 15, y: -2 },
    { x: 15, y: 4 },
    { x: 9, y: 4 },
    { x: 3, y: 4 },
    { x: 3, y: 10 },
    { x: 9, y: 10 },
    { x: 15, y: 10 },
    { x: 21, y: 10 },
    { x: 27, y: 10 },
    { x: 27, y: 18 },
    { x: 21, y: 18 },
    { x: 15, y: 18 },
    { x: 15, y: 24 },
    { x: 15, y: 30 },
    { x: 15, y: 32 },
  ],
  throne: [
    { x: -2, y: 10 },
    { x: 2, y: 10 },
    { x: 2, y: 14 },
    { x: 8, y: 14 },
    { x: 8, y: 10 },
    { x: 14, y: 10 },
    { x: 14, y: 6 },
    { x: 20, y: 6 },
    { x: 20, y: 10 },
    { x: 26, y: 10 },
    { x: 36, y: 10 }, // MERGE POINT
  ],
  // Secondary path for throne
  throne_b: [
    { x: -2, y: 24 },
    { x: 6, y: 24 },
    { x: 12, y: 24 },
    { x: 18, y: 24 },
    { x: 24, y: 24 },
    { x: 24, y: 16 },
    { x: 30, y: 16 },
    { x: 30, y: 10 }, // Merge point with primary path
    { x: 36, y: 10 },
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
    camera: { offset: { x: -180, y: -360 }, zoom: 0.9 },
    region: "grassland",
    theme: "grassland",
    difficulty: 1,
    startingPawPoints: 350, // Easy tutorial level - generous starting funds
    previewImage: "/images/previews/poe.png",
    decorations: [
      // Trees around the expanded path area (path: y:8-18, x:-2 to 32)
      { type: "tree", pos: { x: 2, y: 4 }, variant: 0 },
      { type: "tree", pos: { x: 8, y: 2 }, variant: 1 },
      { type: "tree", pos: { x: 20, y: 4 }, variant: 2 },
      { type: "tree", pos: { x: 28, y: 6 }, variant: 0 },
      { type: "tree", pos: { x: 2, y: 22 }, variant: 1 },
      { type: "tree", pos: { x: 12, y: 24 }, variant: 2 },
      { type: "tree", pos: { x: 24, y: 22 }, variant: 0 },
      { type: "tree", pos: { x: 30, y: 20 }, variant: 1 },
      // Bushes and rocks
      { type: "bush", pos: { x: 0, y: 12 }, variant: 0 },
      { type: "bush", pos: { x: 6, y: 20 }, variant: 1 },
      { type: "bush", pos: { x: 26, y: 16 }, variant: 0 },
      { type: "rock", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "rock", pos: { x: 18, y: 22 }, variant: 1 },
      { type: "flowers", pos: { x: 14, y: 4 }, variant: 0 },
      { type: "flowers", pos: { x: 8, y: 22 }, variant: 1 },
      // Signpost near path start
      { type: "signpost", pos: { x: 0, y: 18 }, variant: 0 },
      // Statue and landmarks near path center
      { type: "statue", pos: { x: 19, y: 8 }, variant: 0 },
      // Lampposts along the path
      { type: "lamppost", pos: { x: 6, y: 12 }, variant: 0 },
      { type: "lamppost", pos: { x: 12, y: 10 }, variant: 0 },
      { type: "lamppost", pos: { x: 14, y: 16 }, variant: 0 },
      { type: "lamppost", pos: { x: 18, y: 14 }, variant: 0 },
      { type: "lamppost", pos: { x: 20, y: 20 }, variant: 0 },
      { type: "lamppost", pos: { x: 24, y: 10 }, variant: 0 },
      // Additional outer decorations
      { type: "bench", pos: { x: 10, y: 6 }, variant: 0 },
      { type: "fence", pos: { x: 12, y: 6 }, variant: 0 },
      { type: "cart", pos: { x: 2, y: 20 }, variant: 0 },
      { type: "tent", pos: { x: 18, y: 18 }, variant: 0 },
      { type: "campfire", pos: { x: 10, y: 16 }, variant: 0 },
    ],
  },
  carnegie: {
    name: "Carnegie Lake",
    position: { x: 300, y: 120 },
    description:
      "Strategic lakeside defense. The gleaming waters hide ancient secrets.",
    camera: { offset: { x: -120, y: -380 }, zoom: 0.85 },
    region: "grassland",
    theme: "grassland",
    difficulty: 2,
    startingPawPoints: 400, // Medium difficulty - more waves
    decorations: [
      // Lake feature near path center (path: x:9-26, y:-2 to 32)
      { type: "deep_water", pos: { x: 9, y: 17 }, variant: 0, size: 2 },
      { type: "deep_water", pos: { x: 11, y: 24 }, variant: 0, size: 4 },

      { type: "oasis_pool", pos: { x: 10, y: 23 }, variant: 0, size: 4 },
      { type: "deep_water", pos: { x: 9, y: 23 }, variant: 0, size: 3 },

      // Trees around the map
      { type: "tree", pos: { x: 4, y: 4 }, variant: 2 },
      { type: "tree", pos: { x: 20, y: 4 }, variant: 0 },
      { type: "tree", pos: { x: 28, y: 8 }, variant: 1 },
      { type: "tree", pos: { x: 4, y: 22 }, variant: 2 },
      { type: "tree", pos: { x: 12, y: 26 }, variant: 0 },
      { type: "tree", pos: { x: 20, y: 26 }, variant: 1 },
      { type: "tree", pos: { x: 28, y: 24 }, variant: 2 },
      { type: "reeds", pos: { x: 6, y: 10 }, variant: 0 },
      { type: "reeds", pos: { x: 2, y: 18 }, variant: 1 },
      // Landmarks and features
      { type: "bench", pos: { x: 18, y: 16 }, variant: 0 },
      { type: "statue", pos: { x: 18, y: 16 }, variant: 0 },
      { type: "hedge", pos: { x: 18, y: 22 }, variant: 0 },
      { type: "bench", pos: { x: 10, y: 4 }, variant: 0 },
      // Lampposts along path
      { type: "lamppost", pos: { x: 12, y: 8 }, variant: 0 },
      { type: "lamppost", pos: { x: 7, y: 12 }, variant: 0 },
      { type: "lamppost", pos: { x: 12, y: 16 }, variant: 0 },
      { type: "lamppost", pos: { x: 18, y: 18 }, variant: 0 },
      { type: "lamppost", pos: { x: 23, y: 12 }, variant: 0 },
      { type: "lamppost", pos: { x: 24, y: 18 }, variant: 0 },
      { type: "lamppost", pos: { x: 24, y: 24 }, variant: 0 },
      // Additional decorations
      { type: "fishing_spot", pos: { x: 6, y: 16 }, variant: 0 },
      { type: "flowers", pos: { x: 8, y: 4 }, variant: 0 },
      { type: "flowers", pos: { x: 22, y: 8 }, variant: 1 },
      { type: "rock", pos: { x: 2, y: 8 }, variant: 0 },
      { type: "rock", pos: { x: 28, y: 16 }, variant: 1 },
    ],
    previewImage: "/images/previews/carnegie.png",
  },
  nassau: {
    name: "Nassau Hall",
    position: { x: 480, y: 200 },
    description:
      "The final stand at the heart of campus. Defend the iconic building at all costs!",
    camera: { offset: { x: -80, y: -330 }, zoom: 0.9 },
    region: "grassland",
    theme: "grassland",
    difficulty: 3,
    startingPawPoints: 500, // Hard level with beacon - need more towers
    specialTower: {
      pos: { x: 16, y: 8.5 },
      type: "beacon",
    },
    decorations: [
      // Nassau Hall near path center (path: x:-2 to 32, y:8 to 20)
      { type: "nassau_hall", pos: { x: 14, y: 0 }, variant: 0, size: 3 },
      { type: "statue", pos: { x: 19, y: 0 }, variant: 0 },
      { type: "fountain", pos: { x: 24, y: 7 }, variant: 0 },
      // Trees around the expanded area
      { type: "tree", pos: { x: 4, y: 4 }, variant: 1 },
      { type: "tree", pos: { x: 24, y: 4 }, variant: 0 },
      { type: "tree", pos: { x: 28, y: 10 }, variant: 2 },
      { type: "tree", pos: { x: 4, y: 24 }, variant: 0 },
      { type: "tree", pos: { x: 16, y: 26 }, variant: 1 },
      { type: "tree", pos: { x: 28, y: 24 }, variant: 2 },
      // Benches and hedges
      { type: "bench", pos: { x: 10, y: 6 }, variant: 0 },
      { type: "bench", pos: { x: 18, y: 6 }, variant: 1 },
      { type: "hedge", pos: { x: 8, y: 24 }, variant: 0 },
      { type: "hedge", pos: { x: 24, y: 22 }, variant: 1 },
      // Lampposts along path
      { type: "lamppost", pos: { x: 2, y: 14 }, variant: 0 },
      { type: "lamppost", pos: { x: 7, y: 16 }, variant: 0 },
      { type: "lamppost", pos: { x: 9, y: 22 }, variant: 0 },
      { type: "lamppost", pos: { x: 14, y: 10 }, variant: 0 },
      { type: "lamppost", pos: { x: 17, y: 6 }, variant: 0 },
      { type: "lamppost", pos: { x: 22, y: 16 }, variant: 0 },
      { type: "lamppost", pos: { x: 28, y: 16 }, variant: 0 },
      // Additional decorations
      { type: "flowers", pos: { x: 6, y: 4 }, variant: 0 },
      { type: "flowers", pos: { x: 20, y: 4 }, variant: 1 },
      { type: "flowers", pos: { x: 12, y: 24 }, variant: 2 },
      { type: "gate", pos: { x: 0, y: 10 }, variant: 0 },
      { type: "flag", pos: { x: 30, y: 14 }, variant: 0 },
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
    camera: { offset: { x: -50, y: -390 }, zoom: 0.9 },
    region: "swamp",
    theme: "swamp",
    difficulty: 1,
    startingPawPoints: 400, // Swamp intro - hexers require strategy
    decorations: [
      // Swamp trees around expanded path (path: x:-2 to 32, y:12 to 20)
      { type: "swamp_tree", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 14, y: 4 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 22, y: 6 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 28, y: 8 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 4, y: 26 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 16, y: 26 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 28, y: 26 }, variant: 0 },
      // Water features
      { type: "deep_water", pos: { x: 2, y: 16 }, variant: 0, size: 2 },
      { type: "deep_water", pos: { x: 14, y: 6 }, variant: 1, size: 2.5 },
      { type: "lily_pads", pos: { x: 4, y: 18 }, variant: 0 },
      { type: "lily_pads", pos: { x: 22, y: 18 }, variant: 1 },
      // Mushrooms and fog
      { type: "mushroom_cluster", pos: { x: 10, y: 6 }, variant: 0 },
      { type: "mushroom_cluster", pos: { x: 20, y: 24 }, variant: 1 },
      { type: "fog_patch", pos: { x: 8, y: 16 }, variant: 0 },
      { type: "fog_patch", pos: { x: 20, y: 14 }, variant: 1 },
      // Creatures and objects
      { type: "broken_bridge", pos: { x: 14, y: 16 }, variant: 0 },
      { type: "frog", pos: { x: 6, y: 18 }, variant: 0 },
      { type: "frog", pos: { x: 22, y: 14 }, variant: 1 },
      { type: "tentacle", pos: { x: 2, y: 16 }, variant: 0 },
      { type: "tentacle", pos: { x: 14, y: 6 }, variant: 1, size: 1.25 },
      { type: "skeleton", pos: { x: 10, y: 24 }, variant: 0 },
      { type: "bones", pos: { x: 18, y: 8 }, variant: 0 },
    ],
    previewImage: "/images/previews/murky_bog.png",
  },
  witch_hut: {
    name: "Witch's Domain",
    position: { x: 300, y: 120 },
    description:
      "A cursed clearing where dark magic festers. The witch's hut pulses with evil energy.",
    camera: { offset: { x: -200, y: -300 }, zoom: 0.85 },
    region: "swamp",
    theme: "swamp",
    difficulty: 2,
    startingPawPoints: 475, // Shrine helps with healing - medium funds
    specialTower: {
      pos: { x: 10.5, y: 15 },
      type: "shrine",
    },
    decorations: [
      // Witch cottage near path start (path: x:9 to 27, y:-2 to 32)
      { type: "witch_cottage", pos: { x: 18, y: 2 }, variant: 0, size: 1.25 },
      { type: "deep_water", pos: { x: 18, y: 1.9 }, variant: 0, size: 3 },
      { type: "cauldron", pos: { x: 20, y: 4 }, variant: 0 },
      // Swamp trees around the map
      { type: "swamp_tree", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 4, y: 14 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 4, y: 22 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 30, y: 6 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 30, y: 18 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 30, y: 26 }, variant: 2 },
      // Cauldrons along path
      { type: "cauldron", pos: { x: 6, y: 8 }, variant: 1 },
      { type: "cauldron", pos: { x: 18, y: 18 }, variant: 0 },
      { type: "cauldron", pos: { x: 24, y: 12 }, variant: 2 },
      // Tombstones
      { type: "tombstone", pos: { x: 6, y: 18 }, variant: 1 },
      { type: "tombstone", pos: { x: 12, y: 20 }, variant: 0 },
      { type: "tombstone", pos: { x: 24, y: 20 }, variant: 2 },
      // Mushrooms and fog
      { type: "mushroom_cluster", pos: { x: 10, y: 8 }, variant: 0 },
      { type: "mushroom_cluster", pos: { x: 24, y: 6 }, variant: 1 },
      { type: "fog_patch", pos: { x: 14, y: 12 }, variant: 0 },
      { type: "fog_patch", pos: { x: 22, y: 22 }, variant: 1 },
      // Dark decorations
      { type: "skull", pos: { x: 6, y: 4 }, variant: 0 },
      { type: "bones", pos: { x: 28, y: 14 }, variant: 1 },
      { type: "candles", pos: { x: 16, y: 6 }, variant: 0 },
      { type: "ritual_circle", pos: { x: 24, y: 26 }, variant: 0 },
    ],
    hazards: [{ type: "poison_fog", pos: { x: 18, y: 15.5 }, radius: 2 }],
    previewImage: "/images/previews/witch_hut.png",
  },
  sunken_temple: {
    name: "Sunken Temple",
    position: { x: 480, y: 200 },
    description:
      "Ancient ruins half-submerged in fetid waters. Something stirs in the depths below.",
    camera: { offset: { x: -120, y: -420 }, zoom: 0.85 },
    region: "swamp",
    theme: "swamp",
    difficulty: 3,
    startingPawPoints: 600, // Dual path + vault defense - need strong setup
    dualPath: true,
    secondaryPath: "sunken_temple_b",
    specialTower: {
      pos: { x: 20, y: 16 },
      type: "vault",
      hp: 800,
    },
    decorations: [
      // Ruined temple near path center (paths: x:-2 to 32, y:8 to 24)
      { type: "ruined_temple", pos: { x: 16, y: 6 }, variant: 0, size: 3 },
      { type: "sunken_pillar", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "sunken_pillar", pos: { x: 8, y: 12 }, variant: 1 },
      { type: "sunken_pillar", pos: { x: 26, y: 12 }, variant: 2 },
      { type: "sunken_pillar", pos: { x: 28, y: 20 }, variant: 0 },
      // Water and creatures
      //tentacles in this deep water
      { type: "deep_water", pos: { x: 18, y: 8 }, variant: 1, size: 4 },
      { type: "tentacle", pos: { x: 17, y: 9 }, variant: 2, size: 1.25 },
      { type: "tentacle", pos: { x: 18.5, y: 9.25}, variant: 0 },
      { type: "tentacle", pos: { x: 19, y: 8 }, variant: 2, size: 1.5 },

      { type: "deep_water", pos: { x: 27, y: 11 }, variant: 1, size: 2.5 },
      { type: "deep_water", pos: { x: 2, y: 18 }, variant: 0, size: 2 },
      { type: "idol_statue", pos: { x: 16, y: 20 }, variant: 0 },
      { type: "tentacle", pos: { x: 2, y: 18 }, variant: 0 },
      { type: "tentacle", pos: { x: 27, y: 11 }, variant: 1 },
      // Swamp trees and decorations
      { type: "swamp_tree", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 24, y: 4 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 4, y: 28 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 28, y: 26 }, variant: 0 },
      { type: "skeleton_pile", pos: { x: 10, y: 20 }, variant: 0 },
      { type: "skeleton_pile", pos: { x: 22, y: 8 }, variant: 1 },
      { type: "bones", pos: { x: 14, y: 12 }, variant: 0 },
      { type: "lily_pads", pos: { x: 6, y: 22 }, variant: 0 },
      { type: "fog_patch", pos: { x: 16, y: 14 }, variant: 0 },
    ],
    hazards: [{ type: "poison_fog", pos: { x: 10, y: 23 }, radius: 2.5 }],
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
    camera: { offset: { x: -120, y: -330 }, zoom: 0.9 },
    region: "desert",
    theme: "desert",
    difficulty: 1,
    startingPawPoints: 425, // Beacon boost helps - ranged enemies require planning
    specialTower: {
      pos: { x: 19, y: 10.5 },
      type: "beacon",
    },
    decorations: [
      // Desert features near path (path: x:-2 to 32, y:10 to 18)
      { type: "pyramid", pos: { x: 16, y: 4 }, variant: 0, size: 2 },
      { type: "sphinx", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "oasis_pool", pos: { x: 12, y: 14 }, variant: 0, size: 2 },
      // Palm trees around
      { type: "palm", pos: { x: 2, y: 8 }, variant: 0 },
      { type: "palm", pos: { x: 8, y: 6 }, variant: 1 },
      { type: "palm", pos: { x: 16, y: 4 }, variant: 2 },
      { type: "palm", pos: { x: 26, y: 6 }, variant: 0 },
      { type: "palm", pos: { x: 4, y: 22 }, variant: 1 },
      { type: "palm", pos: { x: 14, y: 22 }, variant: 2 },
      { type: "palm", pos: { x: 26, y: 22 }, variant: 0 },
      // Cacti and dunes
      { type: "cactus", pos: { x: 10, y: 6 }, variant: 0 },
      { type: "cactus", pos: { x: 2, y: 14 }, variant: 1 },
      { type: "cactus", pos: { x: 28, y: 14 }, variant: 2 },
      { type: "dune", pos: { x: 22, y: 20 }, variant: 0 },
      { type: "dune", pos: { x: 8, y: 22 }, variant: 1 },
      // Desert objects
      { type: "skull", pos: { x: 16, y: 6 }, variant: 0 },
      { type: "pottery", pos: { x: 10, y: 20 }, variant: 0 },
      { type: "obelisk", pos: { x: 8, y: 6 }, variant: 0 },
      { type: "statue", pos: { x: 9, y: 6.5 }, variant: 0 },
      { type: "obelisk", pos: { x: 10, y: 7 }, variant: 1 },
      { type: "bones", pos: { x: 24, y: 4 }, variant: 0 },
      { type: "tent", pos: { x: 2, y: 20 }, variant: 0 },
      { type: "campfire", pos: { x: 28, y: 20 }, variant: 0 },
    ],
    previewImage: "/images/previews/oasis.png",
  },
  pyramid: {
    name: "Pyramid Pass",
    position: { x: 300, y: 120 },
    description:
      "Navigate the ancient canyon beneath the great pyramid. Beware of ambushes!",
    camera: { offset: { x: -90, y: -370 }, zoom: 0.85 },
    region: "desert",
    theme: "desert",
    difficulty: 2,
    startingPawPoints: 525, // Dual path requires coverage on both sides
    dualPath: true,
    secondaryPath: "pyramid_b",
    specialTower: {
      pos: { x: 20, y: 17 },
      type: "barracks",
    },
    decorations: [
      // Pyramids near path center (path: x:10-26, y:-2 to 32)
      { type: "pyramid", pos: { x: 12, y: 4 }, variant: 0, size: 1 },
      { type: "pyramid", pos: { x: 23, y: 14 }, variant: 0, size: 1 },
      { type: "pyramid", pos: { x: 8, y: 17.5 }, variant: 0, size: 1.25 },
      { type: "pyramid", pos: { x: 7, y: 20 }, variant: 0, size: 1 },

      { type: "pyramid", pos: { x: 25, y: 6 }, variant: 1, size: 2 },
      { type: "pyramid", pos: { x: 36, y: 10 }, variant: 1, size: 2.5 },

      { type: "sphinx", pos: { x: 14, y: 6 }, variant: 0 },
      // Obelisks and torches along path
      { type: "obelisk", pos: { x: 6, y: 14 }, variant: 0 },
      { type: "obelisk", pos: { x: 16, y: 16 }, variant: 1 },
      { type: "obelisk", pos: { x: 14, y: 22 }, variant: 2 },
      { type: "torch", pos: { x: 12, y: 10 }, variant: 0 },
      { type: "torch", pos: { x: 20, y: 14 }, variant: 1 },
      // Palm trees and cacti
      { type: "palm", pos: { x: 4, y: 10 }, variant: 0 },
      { type: "palm", pos: { x: 28, y: 10 }, variant: 1 },
      { type: "palm", pos: { x: 4, y: 24 }, variant: 2 },
      { type: "palm", pos: { x: 28, y: 24 }, variant: 0 },
      { type: "cactus", pos: { x: 2, y: 18 }, variant: 0 },
      { type: "cactus", pos: { x: 30, y: 16 }, variant: 1 },
      // Dunes and decorations
      { type: "dune", pos: { x: 8, y: 26 }, variant: 0 },
      { type: "dune", pos: { x: 24, y: 26 }, variant: 1 },
      { type: "sarcophagus", pos: { x: 6, y: 20 }, variant: 0 },
      { type: "sarcophagus", pos: { x: 26, y: 8 }, variant: 1 },
      { type: "skull", pos: { x: 10, y: 16 }, variant: 0 },
      { type: "bones", pos: { x: 22, y: 6 }, variant: 0 },
      { type: "pottery", pos: { x: 18, y: 24 }, variant: 1 },
    ],
    previewImage: "/images/previews/pyramid.png",
  },
  sphinx: {
    name: "Sphinx Gate",
    position: { x: 480, y: 200 },
    description:
      "The ancient guardian's domain. The Sphinx watches all who dare to pass.",
    camera: { offset: { x: -90, y: -340 }, zoom: 0.8 },
    region: "desert",
    theme: "desert",
    difficulty: 3,
    startingPawPoints: 575, // Challenging boss waves with quicksand hazard
    specialTower: {
      pos: { x: 24, y: 14.5 },
      type: "shrine",
    },
    decorations: [
      // Giant sphinx and guardians (path: x:-2 to 32, y:10 to 22)
      { type: "giant_sphinx", pos: { x: 14, y: 4 }, variant: 0, size: 1 },
      { type: "sphinx", pos: { x: 6, y: 6 }, variant: 0 },
      { type: "sphinx", pos: { x: 22, y: 6 }, variant: 1 },
      // Obelisks along path
      { type: "obelisk", pos: { x: 4, y: 14 }, variant: 0 },
      { type: "obelisk", pos: { x: 10, y: 18 }, variant: 1 },
      { type: "obelisk", pos: { x: 22, y: 14 }, variant: 2 },
      { type: "obelisk", pos: { x: 28, y: 18 }, variant: 0 },
      // Pyramids and decorations
      { type: "pyramid", pos: { x: 15, y: 26 }, variant: 0, size: 1.5 },
      { type: "pyramid", pos: { x: 26, y: 2 }, variant: 1, size: 2 },
      { type: "sarcophagus", pos: { x: 2, y: 18 }, variant: 0 },
      { type: "sarcophagus", pos: { x: 28, y: 10 }, variant: 1 },
      { type: "sand_pile", pos: { x: 16, y: 20 }, variant: 0 },
      { type: "sand_pile", pos: { x: 8, y: 12 }, variant: 1 },
      // Palm trees and dunes
      { type: "palm", pos: { x: 2, y: 8 }, variant: 0 },
      { type: "palm", pos: { x: 28, y: 22 }, variant: 1 },
      { type: "dune", pos: { x: 12, y: 24 }, variant: 0 },
      { type: "dune", pos: { x: 24, y: 24 }, variant: 1 },
      { type: "cactus", pos: { x: 30, y: 14 }, variant: 0 },
      // Bones and torches
      { type: "skull", pos: { x: 6, y: 20 }, variant: 0 },
      { type: "skull", pos: { x: 24, y: 10 }, variant: 1 },
      { type: "bones", pos: { x: 18, y: 6 }, variant: 0 },
      { type: "torch", pos: { x: 12, y: 8 }, variant: 0 },
      { type: "torch", pos: { x: 20, y: 10 }, variant: 1 },
    ],
    hazards: [{ type: "quicksand", pos: { x: 13, y: 14 }, radius: 1.5 }],
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
    camera: { offset: { x: 90, y: -420 }, zoom: 0.9 },
    region: "winter",
    theme: "winter",
    difficulty: 1,
    startingPawPoints: 475, // Winter intro - varied enemy types
    specialTower: {
      pos: { x: 9, y: 18.5 },
      type: "beacon",
    },
    decorations: [
      // Pine trees around expanded path (path: x:-2 to 32, y:8 to 18)
      { type: "pine_tree", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "pine_tree", pos: { x: 14, y: 4 }, variant: 1 },
      { type: "pine_tree", pos: { x: 24, y: 4 }, variant: 2 },
      { type: "pine_tree", pos: { x: 4, y: 22 }, variant: 0 },
      { type: "pine_tree", pos: { x: 16, y: 24 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: 22 }, variant: 2 },
      // Ice crystals - scattered throughout with varied sizes
      { type: "ice_fortress", pos: { x: 8, y: 6 }, variant: 0, size: 1 },
      { type: "ice_fortress", pos: { x: 20, y: 6 }, variant: 1, size: 2 },
      { type: "ice_fortress", pos: { x: 4, y: 18 }, variant: 2, size: 1 },
      { type: "ice_fortress", pos: { x: 2, y: 4 }, variant: 0, size: 1 },
      { type: "ice_fortress", pos: { x: 28, y: 4 }, variant: 1, size: 1 },
      { type: "ice_fortress", pos: { x: 12, y: 2 }, variant: 2, size: 1 },
      { type: "ice_fortress", pos: { x: 24, y: 16 }, variant: 0, size: 1 },
      { type: "ice_fortress", pos: { x: 8, y: 24 }, variant: 1, size: 1 },
      { type: "ice_fortress", pos: { x: 30, y: 16 }, variant: 2, size: 1 },
      // Ice thrones - majestic focal points
      { type: "ice_throne", pos: { x: 10, y: 4 }, variant: 0, size: 2 },
      { type: "ice_throne", pos: { x: 26, y: 6 }, variant: 1, size: 2 },
      { type: "ice_throne", pos: { x: 2, y: 20 }, variant: 2, size: 1 },
      { type: "ice_throne", pos: { x: 15, y: 4 }, variant: 0, size: 2 },
      // Frozen ponds
      { type: "frozen_pond", pos: { x: 14, y: 14 }, variant: 0, size: 2 },
      { type: "frozen_pond", pos: { x: 26, y: 12 }, variant: 1, size: 2 },
      // Snow decorations
      { type: "snow_pile", pos: { x: 2, y: 12 }, variant: 0 },
      { type: "snow_pile", pos: { x: 22, y: 20 }, variant: 1 },
      { type: "snowman", pos: { x: 10, y: 20 }, variant: 0 },
      { type: "snowman", pos: { x: 28, y: 10 }, variant: 1 },
      { type: "icicles", pos: { x: 18, y: 4 }, variant: 0 },
      { type: "icicles", pos: { x: 12, y: 22 }, variant: 1 },
      // Other decorations
      { type: "frozen_soldier", pos: { x: 2, y: 16 }, variant: 0 },
      { type: "bones", pos: { x: 26, y: 18 }, variant: 1 },
    ],
    previewImage: "/images/previews/glacier.png",
  },
  fortress: {
    name: "Frost Fortress",
    position: { x: 300, y: 120 },
    description:
      "An abandoned stronghold of ice and stone. What dark forces drove out its defenders?",
    camera: { offset: { x: -80, y: -420 }, zoom: 0.85 },
    region: "winter",
    theme: "winter",
    difficulty: 2,
    startingPawPoints: 550, // Barracks helps - ice sheet hazard speeds enemies
    specialTower: {
      pos: { x: 14, y: 17 },
      type: "barracks",
    },
    decorations: [
      // Ice fortresses and ruins (path: x:10-26, y:-2 to 32)
      { type: "ice_fortress", pos: { x: 6, y: 4 }, variant: 0, size: 2 },
      { type: "ice_fortress", pos: { x: 24, y: 4 }, variant: 1, size: 2 },
      { type: "ruined_temple", pos: { x: 14, y: 6 }, variant: 0, size: 2 },
      { type: "frozen_gate", pos: { x: 12, y: 12 }, variant: 0 },
      // Ice thrones - commanding positions among the ruins
      { type: "ice_throne", pos: { x: 4, y: 8 }, variant: 0, size: 3 },
      { type: "ice_throne", pos: { x: 26, y: 8 }, variant: 1, size: 2 },
      { type: "ice_throne", pos: { x: 8, y: 24 }, variant: 2, size: 2 },
      { type: "ice_throne", pos: { x: 24, y: 26 }, variant: 0, size: 1 },
      { type: "ice_throne", pos: { x: 16, y: 26 }, variant: 1, size: 2 },
      // Ice crystals - scattered throughout fortress ruins
      { type: "ice_fortress", pos: { x: 12, y: 2 }, variant: 0, size: 1 },
      { type: "ice_fortress", pos: { x: 20, y: 6 }, variant: 1, size: 1.5 },
      { type: "ice_fortress", pos: { x: 2, y: 6 }, variant: 2, size: 0.5 },
      { type: "ice_fortress", pos: { x: 28, y: 6 }, variant: 0, size: 1 },
      { type: "ice_fortress", pos: { x: 6, y: 14 }, variant: 1, size: 1 },
      { type: "ice_fortress", pos: { x: 26, y: 18 }, variant: 2, size: 1.5 },
      { type: "ice_fortress", pos: { x: 2, y: 22 }, variant: 0, size: 0.5 },
      { type: "ice_fortress", pos: { x: 9, y: 15 }, variant: 1, size: 1 },
      { type: "ice_fortress", pos: { x: 30, y: 12 }, variant: 2, size: 1 },
      { type: "ice_fortress", pos: { x: 14, y: 2 }, variant: 0, size: 0.5 },
      // Broken walls along path
      { type: "broken_wall", pos: { x: 6, y: 10 }, variant: 0 },
      { type: "broken_wall", pos: { x: 20, y: 14 }, variant: 1 },
      { type: "broken_wall", pos: { x: 24, y: 22 }, variant: 2 },
      // Frozen soldiers
      { type: "frozen_soldier", pos: { x: 8, y: 16 }, variant: 0 },
      { type: "frozen_soldier", pos: { x: 22, y: 10 }, variant: 1 },
      { type: "battle_crater", pos: { x: 14, y: 18 }, variant: 0 },
      { type: "battle_crater", pos: { x: 24, y: 16 }, variant: 1 },
      // Pine trees around
      { type: "pine_tree", pos: { x: 4, y: 18 }, variant: 0 },
      { type: "pine_tree", pos: { x: 4, y: 26 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: 14 }, variant: 2 },
      { type: "pine_tree", pos: { x: 28, y: 24 }, variant: 0 },
      // Snow features
      { type: "snow_pile", pos: { x: 6, y: 24 }, variant: 0 },
      { type: "icicles", pos: { x: 18, y: 8 }, variant: 0 },
    ],
    hazards: [{ type: "ice_sheet", pos: { x: 18, y: 16 }, radius: 2 }],
    previewImage: "/images/previews/fortress.png",
  },
  peak: {
    name: "Summit Peak",
    position: { x: 480, y: 200 },
    description:
      "The highest point of defense. A frozen throne awaits at the mountain's apex.",
    camera: { offset: { x: -200, y: -400 }, zoom: 0.85 },
    region: "winter",
    theme: "winter",
    difficulty: 3,
    startingPawPoints: 650, // Dual path + bosses - need maximum coverage
    dualPath: true,
    secondaryPath: "peak_b",
    specialTower: {
      pos: { x: 16, y: 19 },
      type: "shrine",
    },
    decorations: [
      // Grand ice throne centerpiece (paths: x:-2 to 35, y:10 to 22)
      { type: "ice_throne", pos: { x: 10, y: 7 }, variant: 0, size: 3 },
      // Ice fortresses at corners
      { type: "ice_fortress", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "ice_fortress", pos: { x: 27, y: 6 }, variant: 1, size: 2 },
      { type: "ice_fortress", pos: { x: 4, y: 22 }, variant: 2 },
      { type: "ice_fortress", pos: { x: 26, y: 22 }, variant: 0 },
      // Frozen ponds central
      { type: "frozen_pond", pos: { x: 10, y: 14 }, variant: 0, size: 2 },
      { type: "frozen_pond", pos: { x: 22, y: 14 }, variant: 1, size: 2 },
      // Multiple ice thrones - the summit is crowned with frozen majesty
      { type: "ice_throne", pos: { x: 8, y: 8 }, variant: 0, size: 2 },
      { type: "ice_throne", pos: { x: 16, y: 10 }, variant: 1, size: 2 },
      { type: "ice_throne", pos: { x: 2, y: 4 }, variant: 2, size: 1 },
      { type: "ice_throne", pos: { x: 28, y: 3 }, variant: 0, size: 2 },
      { type: "ice_throne", pos: { x: 8, y: 24 }, variant: 1, size: 2 },
      { type: "ice_throne", pos: { x: 32, y: 10 }, variant: 2, size: 1 },
      // Ice crystals - abundant across the frozen peak
      { type: "ice_fortress", pos: { x: 6, y: 14 }, variant: 0, size: 1 },
      { type: "ice_fortress", pos: { x: 12, y: 9 }, variant: 1, size: 1.5 },
      { type: "ice_fortress", pos: { x: 26, y: 16 }, variant: 2, size: 1 },
      { type: "ice_fortress", pos: { x: 4, y: 2 }, variant: 0, size: 0.5 },
      { type: "ice_fortress", pos: { x: 24, y: 2 }, variant: 1, size: 1 },
      { type: "ice_fortress", pos: { x: 10, y: 2 }, variant: 2, size: 1 },
      { type: "ice_fortress", pos: { x: 32, y: 6 }, variant: 0, size: 1.5 },
      { type: "ice_fortress", pos: { x: 2, y: 16 }, variant: 1, size: 0.5 },
      { type: "ice_fortress", pos: { x: 30, y: 14 }, variant: 2, size: 1 },
      { type: "ice_fortress", pos: { x: 16, y: 24 }, variant: 0, size: 1 },
      { type: "ice_fortress", pos: { x: 30, y: 24 }, variant: 1, size: 0.5 },
      { type: "ice_fortress", pos: { x: 6, y: 8 }, variant: 2, size: 0.5 },
      // Pine trees
      { type: "pine_tree", pos: { x: 2, y: 12 }, variant: 0 },
      { type: "pine_tree", pos: { x: 2, y: 20 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: 10 }, variant: 2 },
      { type: "pine_tree", pos: { x: 28, y: 18 }, variant: 0 },
      // Snow and icicles
      { type: "snow_pile", pos: { x: 12, y: 20 }, variant: 0 },
      { type: "snow_pile", pos: { x: 20, y: 20 }, variant: 1 },
      { type: "icicles", pos: { x: 10, y: 6 }, variant: 0 },
      { type: "icicles", pos: { x: 20, y: 4 }, variant: 1 },
      { type: "frozen_soldier", pos: { x: 4, y: 16 }, variant: 0 },
      { type: "bones", pos: { x: 26, y: 12 }, variant: 1 },
    ],
    hazards: [{ type: "ice_sheet", pos: { x: 20, y: 7 }, radius: 2 }],
    previewImage: "/images/previews/peak.png",
  },
  // =====================
  // VOLCANIC REGION - Inferno Depths
  // =====================
  lava: {
    name: "Lava Fields",
    position: { x: 120, y: 200 },
    description: "Rivers of molten rock carve through the blackened landscape.",
    camera: { offset: { x: -20, y: -370 }, zoom: 0.85 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 2,
    startingPawPoints: 550, // Volcanic intro - lava geyser hazard
    decorations: [
      // Lava pools and castles (path: x:-2 to 32, y:10 to 20)
      { type: "lava_pool", pos: { x: 2, y: 16 }, variant: 0, size: 2 },
      { type: "lava_pool", pos: { x: 26, y: 14 }, variant: 1, size: 2 },
      { type: "dark_barracks", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "dark_barracks", pos: { x: 22, y: 4 }, variant: 1 },
      { type: "dark_barracks", pos: { x: 14, y: 22 }, variant: 2 },
      // Charred trees around
      { type: "charred_tree", pos: { x: 8, y: 6 }, variant: 0 },
      { type: "charred_tree", pos: { x: 16, y: 4 }, variant: 1 },
      { type: "charred_tree", pos: { x: 28, y: 8 }, variant: 2 },
      { type: "charred_tree", pos: { x: 4, y: 22 }, variant: 0 },
      { type: "charred_tree", pos: { x: 26, y: 22 }, variant: 1 },
      // Dark thrones and spires
      { type: "dark_barracks", pos: { x: 10, y: 14 }, variant: 0 },
      { type: "dark_spire", pos: { x: 20, y: 16 }, variant: 1 },
      { type: "dark_spire", pos: { x: 8, y: 8 }, variant: 0 },
      // Fire pits and embers
      { type: "fire_pit", pos: { x: 6, y: 12 }, variant: 0 },
      { type: "fire_pit", pos: { x: 24, y: 10 }, variant: 1 },
      { type: "ember", pos: { x: 12, y: 6 }, variant: 0 },
      { type: "ember", pos: { x: 18, y: 20 }, variant: 1 },
      // Bones and skulls
      { type: "bones", pos: { x: 2, y: 10 }, variant: 0 },
      { type: "skull", pos: { x: 28, y: 18 }, variant: 1 },
    ],
    hazards: [{ type: "lava_geyser", pos: { x: 14, y: 14 }, radius: 2.5 }],
    previewImage: "/images/previews/lava_fields.png",
  },
  crater: {
    name: "Caldera Basin",
    position: { x: 300, y: 200 },
    description:
      "Inside the volcano's heart. The ground trembles with each eruption.",
    camera: { offset: { x: -90, y: -320 }, zoom: 0.8 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 3,
    startingPawPoints: 675, // Vault defense - many tough enemies
    specialTower: {
      pos: { x: 18, y: 10 },
      type: "vault",
      hp: 1000,
    },
    decorations: [
      // Dark throne and castles (path: x:10-26, y:-2 to 32)
      { type: "obsidian_castle", pos: { x: 26, y: 2 }, variant: 0, size: 2 },
      { type: "dark_spire", pos: { x: 4, y: 8 }, variant: 0 },
      { type: "dark_barracks", pos: { x: 24, y: 8 }, variant: 1 },
      { type: "dark_barracks", pos: { x: 4, y: 20 }, variant: 2 },
      { type: "dark_spire", pos: { x: 26, y: 22 }, variant: 0 },
      // Lava pools
      { type: "lava_pool", pos: { x: 6, y: 14 }, variant: 0, size: 2 },
      { type: "lava_pool", pos: { x: 22, y: 12 }, variant: 1, size: 2 },
      { type: "lava_pool", pos: { x: 14, y: 22 }, variant: 2, size: 2 },
      // Dark thrones and spires along path
      { type: "dark_spire", pos: { x: 8, y: 10 }, variant: 0 },
      { type: "dark_spire", pos: { x: 20, y: 16 }, variant: 1 },
      { type: "dark_spire", pos: { x: 16, y: 6 }, variant: 2 },
      // Charred trees
      { type: "charred_tree", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "charred_tree", pos: { x: 26, y: 4 }, variant: 1 },
      { type: "charred_tree", pos: { x: 4, y: 26 }, variant: 2 },
      { type: "charred_tree", pos: { x: 26, y: 26 }, variant: 0 },
      // Decorations
      { type: "fire_pit", pos: { x: 10, y: 12 }, variant: 0 },
      { type: "fire_pit", pos: { x: 22, y: 20 }, variant: 1 },
      { type: "demon_statue", pos: { x: 6, y: 18 }, variant: 0 },
      { type: "demon_statue", pos: { x: 24, y: 14 }, variant: 1 },
      { type: "ember", pos: { x: 16, y: 10 }, variant: 0 },
      { type: "ember", pos: { x: 12, y: 20 }, variant: 1 },
      { type: "bones", pos: { x: 2, y: 12 }, variant: 0 },
      { type: "skull", pos: { x: 28, y: 16 }, variant: 1 },
    ],
    hazards: [{ type: "lava_geyser", pos: { x: 18, y: 17 }, radius: 2 }],
    previewImage: "/images/previews/caldera.png",
  },
  throne: {
    name: "Obsidian Throne",
    position: { x: 480, y: 200 },
    description:
      "The ultimate challenge. An ancient dark lord's seat of power, guarded by his legions.",
    camera: { offset: { x: -40, y: -400 }, zoom: 0.85 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 3,
    startingPawPoints: 750, // Final level - 20 brutal waves require full arsenal
    dualPath: true,
    secondaryPath: "throne_b",
    specialTower: {
      pos: { x: 16, y: 22 },
      type: "barracks",
    },
    decorations: [
      // Obsidian castle and dark throne center (paths: x:-2 to 32, y:8 to 20)
      { type: "obsidian_castle", pos: { x: 14, y: 0 }, variant: 0, size: 4 },
      { type: "dark_throne", pos: { x: 16, y: 2 }, variant: 0 },
      // Castles and barracks around the map
      { type: "dark_barracks", pos: { x: 4, y: 6 }, variant: 1 },
      { type: "dark_barracks", pos: { x: 26, y: 6 }, variant: 2 },
      { type: "dark_barracks", pos: { x: 4, y: 22 }, variant: 0 },
      { type: "dark_barracks", pos: { x: 26, y: 22 }, variant: 1 },
      // Demon statues
      { type: "demon_statue", pos: { x: 6, y: 10 }, variant: 0 },
      { type: "demon_statue", pos: { x: 24, y: 10 }, variant: 1 },
      { type: "demon_statue", pos: { x: 10, y: 18 }, variant: 2 },
      { type: "demon_statue", pos: { x: 20, y: 18 }, variant: 0 },
      // Lava pools
      { type: "lava_pool", pos: { x: 2, y: 14 }, variant: 0, size: 2 },
      { type: "lava_pool", pos: { x: 26, y: 14 }, variant: 1, size: 2 },
      { type: "lava_pool", pos: { x: 12, y: 22 }, variant: 2, size: 2 },
      // Fire pits and embers
      { type: "fire_pit", pos: { x: 8, y: 4 }, variant: 0 },
      { type: "fire_pit", pos: { x: 22, y: 4 }, variant: 1 },
      { type: "fire_pit", pos: { x: 16, y: 20 }, variant: 0 },
      // Dark thrones and spires along paths
      { type: "dark_spire", pos: { x: 8, y: 16 }, variant: 1 },
      { type: "dark_spire", pos: { x: 22, y: 16 }, variant: 2 },
      { type: "dark_spire", pos: { x: 10, y: 4 }, variant: 0 },
      { type: "dark_spire", pos: { x: 20, y: 24 }, variant: 1 },
      // Charred trees
      { type: "charred_tree", pos: { x: 2, y: 8 }, variant: 0 },
      { type: "charred_tree", pos: { x: 28, y: 8 }, variant: 1 },
      { type: "charred_tree", pos: { x: 2, y: 20 }, variant: 2 },
      { type: "charred_tree", pos: { x: 28, y: 20 }, variant: 0 },
      // Embers and bones
      { type: "ember", pos: { x: 10, y: 10 }, variant: 0 },
      { type: "ember", pos: { x: 20, y: 12 }, variant: 1 },
      { type: "bones", pos: { x: 6, y: 20 }, variant: 0 },
      { type: "skull", pos: { x: 24, y: 6 }, variant: 1 },
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
// SMART WAVE DESIGN: Cohesive groups, strategic combinations, escalating pressure
// Design principles:
// - Homogeneous groups march together (same type in tight formations)
// - Tanks up front, ranged/support in back
// - Early waves are challenging but fair - force players to build defenses immediately
// - Mix new enemy types for variety
// - Tighter intervals create pressure, larger groups create spectacle
export const LEVEL_WAVES: Record<string, WaveGroup[][]> = {
  // =====================
  // GRASSLAND REGION - Tutorial with teeth
  // =====================
  poe: [
    // Wave 1: Triple frosh squad rush - cohesive groups
    [
      { type: "frosh", count: 5, interval: 800 }, // Pack 1
      { type: "frosh", count: 5, interval: 800, delay: 4000 }, // Pack 2
      { type: "cultist", count: 4, interval: 900, delay: 8000 }, // Cultist support
      { type: "frosh", count: 4, interval: 850, delay: 12000 }, // Trailing pack
      { type: "mascot", count: 3, interval: 1000, delay: 15000 }, // Fast flankers
    ],
    // Wave 2: Sophomore battalion with support
    [
      { type: "sophomore", count: 6, interval: 900 }, // Main formation
      { type: "frosh", count: 8, interval: 700, delay: 3000 }, // Infantry wave
      { type: "cultist", count: 5, interval: 950, delay: 7000 }, // Dark support
      { type: "sophomore", count: 4, interval: 1000, delay: 11000 }, // Second wave
      { type: "assassin", count: 2, interval: 2000, delay: 14000 }, // Surprise strike
    ],
    // Wave 3: Junior vanguard - tanks up front
    [
      { type: "junior", count: 4, interval: 1200 }, // Heavy front line
      { type: "sophomore", count: 8, interval: 750, delay: 2500 }, // Support behind
      { type: "frosh", count: 10, interval: 600, delay: 6500 }, // Swarm wave
      { type: "cultist", count: 6, interval: 900, delay: 10500 }, // Support
      { type: "mascot", count: 5, interval: 950, delay: 14000 }, // Speed flank
    ],
    // Wave 4: Mixed assault - staggered groups
    [
      { type: "sophomore", count: 6, interval: 800 }, // Group A
      { type: "cultist", count: 6, interval: 850, delay: 3000 }, // Group B
      { type: "junior", count: 3, interval: 1400, delay: 6500 }, // Tanks
      { type: "harpy", count: 6, interval: 900, delay: 10000 }, // Speed group
      { type: "assassin", count: 3, interval: 1500, delay: 13500 }, // Strike team
    ],
    // Wave 5: Senior arrives with full escort
    [
      { type: "senior", count: 2, interval: 2500 }, // Big boys
      { type: "junior", count: 5, interval: 1100, delay: 2000 }, // Close escort
      { type: "sophomore", count: 8, interval: 750, delay: 5500 }, // Main body
      { type: "cultist", count: 6, interval: 900, delay: 9500 }, // Dark mages
      { type: "frostling", count: 5, interval: 950, delay: 13000 }, // Fast wings
    ],
    // Wave 6: Assassination wave - speed and precision
    [
      { type: "assassin", count: 4, interval: 1200 }, // Strike first
      { type: "frostling", count: 8, interval: 750, delay: 3000 }, // Speed wave
      { type: "sophomore", count: 6, interval: 900, delay: 7000 }, // Cover
      { type: "cultist", count: 5, interval: 950, delay: 10500 }, // Support
      { type: "junior", count: 4, interval: 1300, delay: 14000 }, // Heavy backup
    ],
    // Wave 7: Senior tank wall with massive support
    [
      { type: "senior", count: 3, interval: 2000 }, // Tank line
      { type: "junior", count: 6, interval: 1000, delay: 2500 }, // Second line
      { type: "sophomore", count: 10, interval: 700, delay: 6000 }, // Main pack
      { type: "cultist", count: 8, interval: 850, delay: 10500 }, // Cultist horde
      { type: "assassin", count: 3, interval: 1600, delay: 14500 }, // Finishers
    ],
    // Wave 8: GRAND FINALE - Everything!
    [
      { type: "senior", count: 4, interval: 1800 }, // Tank vanguard
      { type: "junior", count: 8, interval: 900, delay: 2000 }, // Heavy support
      { type: "sophomore", count: 10, interval: 650, delay: 5500 }, // Massive wave
      { type: "cultist", count: 8, interval: 800, delay: 9500 }, // Dark army
      { type: "frostling", count: 6, interval: 900, delay: 13000 }, // Speed flank
      { type: "assassin", count: 4, interval: 1400, delay: 16000 }, // Kill squad
    ],
  ],

  carnegie: [
    // Wave 1: Frostling blitz with cultist backup
    [
      { type: "frostling", count: 8, interval: 750 }, // Speed rush
      { type: "frosh", count: 10, interval: 600, delay: 4000 }, // Infantry
      { type: "cultist", count: 6, interval: 900, delay: 8500 }, // Support
      { type: "sophomore", count: 5, interval: 1000, delay: 12000 }, // Heavy follow
      { type: "frostling", count: 4, interval: 950, delay: 15000 }, // Second rush
    ],
    // Wave 2: Sophomore mega-battalion
    [
      { type: "sophomore", count: 8, interval: 800 }, // Pack 1
      { type: "sophomore", count: 8, interval: 800, delay: 4500 }, // Pack 2
      { type: "cultist", count: 6, interval: 900, delay: 9000 }, // Support
      { type: "junior", count: 4, interval: 1200, delay: 12500 }, // Heavies
      { type: "assassin", count: 3, interval: 1500, delay: 15500 }, // Strikers
    ],
    // Wave 3: Air superiority with ground support
    [
      { type: "mascot", count: 5, interval: 1200 }, // Flying vanguard
      { type: "banshee", count: 3, interval: 1500, delay: 3500 }, // Screaming spirits
      { type: "junior", count: 6, interval: 1000, delay: 7000 }, // Ground tanks
      { type: "sophomore", count: 8, interval: 750, delay: 11000 }, // Infantry
      { type: "frostling", count: 6, interval: 900, delay: 15000 }, // Fast support
    ],
    // Wave 4: Plaguebearer siege line
    [
      { type: "plaguebearer", count: 4, interval: 1500 }, // Toxic tanks
      { type: "sophomore", count: 10, interval: 650, delay: 3500 }, // Swarm behind
      { type: "cultist", count: 8, interval: 800, delay: 8000 }, // Cultist wave
      { type: "hexer", count: 4, interval: 1200, delay: 12500 }, // Curse support
      { type: "frostling", count: 5, interval: 950, delay: 16000 }, // Flankers
    ],
    // Wave 5: Dual air assault
    [
      { type: "mascot", count: 6, interval: 1100 }, // Flying pack 1
      { type: "banshee", count: 4, interval: 1300, delay: 4000 }, // Wailing pack
      { type: "harpy", count: 5, interval: 1150, delay: 8000 }, // Harpy flock
      { type: "senior", count: 3, interval: 1800, delay: 12000 }, // Ground tanks
      { type: "junior", count: 6, interval: 1000, delay: 15500 }, // Ground support
    ],
    // Wave 6: Senior heavy assault
    [
      { type: "senior", count: 4, interval: 1700 }, // Heavy line
      { type: "junior", count: 8, interval: 900, delay: 3500 }, // Support line
      { type: "plaguebearer", count: 3, interval: 1800, delay: 8000 }, // Toxic support
      { type: "sophomore", count: 10, interval: 650, delay: 12500 }, // Swarm
      { type: "assassin", count: 4, interval: 1400, delay: 17000 }, // Strike team
    ],
    // Wave 7: Infernal invasion
    [
      { type: "infernal", count: 3, interval: 2200 }, // Burning demons
      { type: "senior", count: 4, interval: 1500, delay: 3500 }, // Tank escort
      { type: "cultist", count: 10, interval: 750, delay: 7500 }, // Cult swarm
      { type: "frostling", count: 6, interval: 900, delay: 12500 }, // Frost balance
      { type: "banshee", count: 3, interval: 1500, delay: 16000 }, // Screaming death
    ],
    // Wave 8: Big swarm wave
    [
      { type: "sophomore", count: 12, interval: 550 }, // Large swarm
      { type: "frosh", count: 15, interval: 450, delay: 4500 }, // Even more
      { type: "cultist", count: 10, interval: 700, delay: 9500 }, // Cult flood
      { type: "frostling", count: 8, interval: 800, delay: 14000 }, // Speed flood
      { type: "assassin", count: 5, interval: 1300, delay: 18000 }, // Finishers
    ],
    // Wave 9: Gradstudent vanguard with full army
    [
      { type: "gradstudent", count: 2, interval: 3500 }, // Boss tier
      { type: "senior", count: 5, interval: 1400, delay: 2500 }, // Heavy guard
      { type: "infernal", count: 3, interval: 1800, delay: 7000 }, // Fire support
      { type: "mascot", count: 5, interval: 1200, delay: 11500 }, // Air cover
      { type: "junior", count: 8, interval: 900, delay: 15500 }, // Infantry
    ],
    // Wave 10: FINAL CARNAGE
    [
      { type: "gradstudent", count: 3, interval: 2800 }, // Triple grad threat
      { type: "infernal", count: 4, interval: 1600, delay: 3000 }, // Fire demons
      { type: "senior", count: 6, interval: 1200, delay: 7500 }, // Heavy wall
      { type: "banshee", count: 5, interval: 1100, delay: 12000 }, // Air screams
      { type: "cultist", count: 10, interval: 700, delay: 15500 }, // Cult finale
      { type: "assassin", count: 4, interval: 1400, delay: 19500 }, // Last strike
    ],
  ],

  nassau: [
    // Wave 1: Junior battalion assault
    [
      { type: "junior", count: 6, interval: 1000 }, // Heavy front
      { type: "sophomore", count: 10, interval: 700, delay: 3500 }, // Swarm support
      { type: "cultist", count: 6, interval: 900, delay: 8000 }, // Magic
      { type: "archer", count: 4, interval: 1300, delay: 12000 }, // Ranged
      { type: "frostling", count: 5, interval: 1000, delay: 15500 }, // Fast flank
    ],
    // Wave 2: Ranged dominance with tank screen
    [
      { type: "senior", count: 3, interval: 1800 }, // Tank screen
      { type: "archer", count: 8, interval: 900, delay: 2500 }, // Arrow storm
      { type: "junior", count: 6, interval: 1100, delay: 7000 }, // Mid tanks
      { type: "mage", count: 3, interval: 1800, delay: 11500 }, // Magic support
      { type: "sophomore", count: 8, interval: 800, delay: 15500 }, // Infantry
    ],
    // Wave 3: Air dominance
    [
      { type: "mascot", count: 6, interval: 1100 }, // Flying main
      { type: "banshee", count: 4, interval: 1300, delay: 4000 }, // Screaming
      { type: "harpy", count: 5, interval: 1150, delay: 8500 }, // More air
      { type: "senior", count: 4, interval: 1600, delay: 12500 }, // Ground backup
      { type: "archer", count: 6, interval: 1100, delay: 16500 }, // AA support
    ],
    // Wave 4: Thornwalker siege
    [
      { type: "thornwalker", count: 4, interval: 2200 }, // Plant tanks
      { type: "junior", count: 8, interval: 900, delay: 3500 }, // Infantry
      { type: "plaguebearer", count: 3, interval: 1800, delay: 8500 }, // Toxic
      { type: "archer", count: 6, interval: 1100, delay: 13000 }, // Ranged
      { type: "cultist", count: 6, interval: 950, delay: 17000 }, // Magic
    ],
    // Wave 5: Assassin strike force
    [
      { type: "assassin", count: 5, interval: 1100 }, // Strike team
      { type: "frostling", count: 8, interval: 800, delay: 3500 }, // Speed support
      { type: "gradstudent", count: 2, interval: 3500, delay: 8000 }, // Heavy
      { type: "senior", count: 5, interval: 1400, delay: 12500 }, // Tanks
      { type: "banshee", count: 4, interval: 1300, delay: 17000 }, // Air
    ],
    // Wave 6: Mage barrage
    [
      { type: "mage", count: 5, interval: 1400 }, // Magic main
      { type: "archer", count: 10, interval: 800, delay: 4000 }, // Arrow swarm
      { type: "warlock", count: 3, interval: 1800, delay: 9000 }, // Dark magic
      { type: "gradstudent", count: 3, interval: 2500, delay: 13500 }, // Tank
      { type: "hexer", count: 5, interval: 1200, delay: 18000 }, // Curses
    ],
    // Wave 7: Infernal+Plague combo
    [
      { type: "infernal", count: 4, interval: 1800 }, // Fire demons
      { type: "plaguebearer", count: 4, interval: 1700, delay: 3500 }, // Toxic
      { type: "senior", count: 6, interval: 1200, delay: 8000 }, // Tanks
      { type: "junior", count: 8, interval: 900, delay: 12500 }, // Infantry
      { type: "cultist", count: 8, interval: 800, delay: 17000 }, // Support
    ],
    // Wave 8: Professor enters with entourage
    [
      { type: "professor", count: 2, interval: 4500 }, // Boss tier
      { type: "gradstudent", count: 4, interval: 1800, delay: 3000 }, // Guards
      { type: "senior", count: 6, interval: 1200, delay: 8500 }, // Heavy line
      { type: "archer", count: 8, interval: 950, delay: 13500 }, // Ranged
      { type: "infernal", count: 3, interval: 1800, delay: 18000 }, // Fire
    ],
    // Wave 9: Wyvern terror
    [
      { type: "wyvern", count: 3, interval: 2800 }, // Dragon terror
      { type: "mascot", count: 6, interval: 1100, delay: 4500 }, // Air swarm
      { type: "harpy", count: 6, interval: 1150, delay: 9000 }, // More air
      { type: "infernal", count: 4, interval: 1700, delay: 13500 }, // Ground fire
      { type: "berserker", count: 5, interval: 1300, delay: 18000 }, // Fast ground
    ],
    // Wave 10: Juggernaut siege
    [
      { type: "juggernaut", count: 1, interval: 8000 }, // MEGA TANK
      { type: "professor", count: 2, interval: 3500, delay: 2500 }, // Boss support
      { type: "thornwalker", count: 4, interval: 1800, delay: 7500 }, // Plant tanks
      { type: "gradstudent", count: 4, interval: 2200, delay: 13000 }, // Heavy
      { type: "infernal", count: 4, interval: 1700, delay: 18000 }, // Fire
    ],
    // Wave 11: Dean's arrival
    [
      { type: "dean", count: 1, interval: 8000 }, // DEAN
      { type: "professor", count: 3, interval: 2800, delay: 3500 }, // Prof escort
      { type: "gradstudent", count: 5, interval: 1800, delay: 9000 }, // Grad army
      { type: "senior", count: 8, interval: 1100, delay: 14500 }, // Senior wall
      { type: "assassin", count: 4, interval: 1500, delay: 20000 }, // Strike team
    ],
    // Wave 12: NASSAU FINALE - EVERYTHING!
    [
      { type: "dean", count: 2, interval: 5500 }, // Double Dean!
      { type: "professor", count: 4, interval: 2200, delay: 3500 }, // Prof squad
      { type: "juggernaut", count: 1, interval: 8000, delay: 8000 }, // MEGA
      { type: "infernal", count: 5, interval: 1500, delay: 12000 }, // Fire army
      { type: "banshee", count: 6, interval: 1100, delay: 16000 }, // Screaming death
      { type: "assassin", count: 5, interval: 1300, delay: 20500 }, // Kill squad
    ],
  ],

  // =====================
  // SWAMP REGION - Dark magic horror
  // =====================
  bog: [
    // Wave 1: Cultist cult rush
    [
      { type: "cultist", count: 8, interval: 700 }, // Cult pack 1
      { type: "cultist", count: 8, interval: 700, delay: 4000 }, // Cult pack 2
      { type: "hexer", count: 5, interval: 1100, delay: 9000 }, // Curse support
      { type: "sophomore", count: 6, interval: 900, delay: 13000 }, // Meat
      { type: "frostling", count: 4, interval: 1050, delay: 16500 }, // Flankers
    ],
    // Wave 2: Plaguebearer toxic march
    [
      { type: "plaguebearer", count: 5, interval: 1400 }, // Toxic wall
      { type: "cultist", count: 10, interval: 650, delay: 4000 }, // Cult swarm
      { type: "hexer", count: 6, interval: 1100, delay: 9500 }, // Cursers
      { type: "junior", count: 5, interval: 1200, delay: 14000 }, // Tanks
      { type: "warlock", count: 3, interval: 1800, delay: 18000 }, // Dark magic
    ],
    // Wave 3: Hexer curse wave
    [
      { type: "hexer", count: 10, interval: 800 }, // Curse flood
      { type: "cultist", count: 8, interval: 700, delay: 5000 }, // More cult
      { type: "junior", count: 6, interval: 1100, delay: 10000 }, // Tanks
      { type: "specter", count: 4, interval: 1400, delay: 14500 }, // Ghosts
      { type: "frostling", count: 5, interval: 1000, delay: 18000 }, // Frost
    ],
    // Wave 4: Specter ambush
    [
      { type: "specter", count: 6, interval: 1200 }, // Ghost vanguard
      { type: "warlock", count: 4, interval: 1500, delay: 4000 }, // Dark support
      { type: "hexer", count: 8, interval: 950, delay: 8500 }, // Curse wave
      { type: "banshee", count: 3, interval: 1700, delay: 13500 }, // Wailing
      { type: "cultist", count: 8, interval: 800, delay: 17500 }, // Backup
    ],
    // Wave 5: Berserker charge
    [
      { type: "berserker", count: 8, interval: 900 }, // Rage rush
      { type: "frostling", count: 6, interval: 1000, delay: 4500 }, // Speed support
      { type: "plaguebearer", count: 4, interval: 1700, delay: 9500 }, // Toxic
      { type: "specter", count: 5, interval: 1200, delay: 14000 }, // Ghosts
      { type: "hexer", count: 6, interval: 1100, delay: 18000 }, // Curses
    ],
    // Wave 6: Necromancer awakening
    [
      { type: "necromancer", count: 2, interval: 4500 }, // Death lords
      { type: "warlock", count: 5, interval: 1400, delay: 3500 }, // Dark guard
      { type: "specter", count: 6, interval: 1150, delay: 8500 }, // Ghost army
      { type: "hexer", count: 8, interval: 950, delay: 13500 }, // Curse wave
      { type: "cultist", count: 10, interval: 700, delay: 18000 }, // Cult horde
    ],
    // Wave 7: Banshee choir of death
    [
      { type: "banshee", count: 6, interval: 1100 }, // Screaming death
      { type: "harpy", count: 5, interval: 1200, delay: 4000 }, // Flying support
      { type: "specter", count: 8, interval: 1000, delay: 8500 }, // Ghost wave
      { type: "berserker", count: 6, interval: 1100, delay: 13500 }, // Ground rage
      { type: "warlock", count: 4, interval: 1600, delay: 18000 }, // Magic
    ],
    // Wave 8: Shadow knight vanguard
    [
      { type: "shadow_knight", count: 3, interval: 2800 }, // Dark knights
      { type: "necromancer", count: 2, interval: 3500, delay: 4000 }, // Death
      { type: "specter", count: 6, interval: 1100, delay: 9500 }, // Ghosts
      { type: "warlock", count: 6, interval: 1250, delay: 14500 }, // Magic
      { type: "berserker", count: 6, interval: 1100, delay: 19000 }, // Rage
    ],
    // Wave 9: Harpy+Banshee air terror
    [
      { type: "harpy", count: 8, interval: 900 }, // Harpy swarm
      { type: "banshee", count: 6, interval: 1100, delay: 4500 }, // Wailing
      { type: "specter", count: 6, interval: 1150, delay: 9000 }, // More ghost
      { type: "berserker", count: 8, interval: 950, delay: 14000 }, // Ground rage
      { type: "shadow_knight", count: 2, interval: 3500, delay: 19000 }, // Dark
    ],
    // Wave 10: SWAMP HORROR FINALE
    [
      { type: "necromancer", count: 3, interval: 2800 }, // Death lords
      { type: "shadow_knight", count: 4, interval: 2200, delay: 3500 }, // Dark knights
      { type: "specter", count: 10, interval: 800, delay: 8500 }, // Ghost flood
      { type: "harpy", count: 8, interval: 1000, delay: 14000 }, // Air swarm
      { type: "banshee", count: 5, interval: 1250, delay: 19000 }, // Final screams
      { type: "berserker", count: 6, interval: 1100, delay: 23000 }, // Rage finish
    ],
  ],

  witch_hut: [
    // 14 waves - Witch's dark magic assault
    // Wave 1: Cultist initiation
    [
      { type: "cultist", count: 6, interval: 700 }, // Ritual circle
      { type: "junior", count: 4, interval: 900, delay: 3000 }, // Guards
      { type: "hexer", count: 3, interval: 1100, delay: 6500 }, // First curses
      { type: "sophomore", count: 5, interval: 750, delay: 9000 }, // Apprentices
      { type: "cultist", count: 4, interval: 800, delay: 12000 }, // More cultists
    ],
    // Wave 2: Hexer curse storm
    [
      { type: "hexer", count: 5, interval: 800 }, // Curse wave
      { type: "cultist", count: 6, interval: 700, delay: 3000 }, // Support
      { type: "warlock", count: 2, interval: 2200, delay: 6500 }, // Dark magic
      { type: "junior", count: 5, interval: 900, delay: 9000 }, // Tanks
      { type: "banshee", count: 2, interval: 1800, delay: 12500 }, // Wailing horror
    ],
    // Wave 3: Specter haunting
    [
      { type: "specter", count: 5, interval: 950 }, // Ghost vanguard
      { type: "hexer", count: 5, interval: 850, delay: 3500 }, // Curses
      { type: "cultist", count: 6, interval: 700, delay: 7000 }, // Cult backup
      { type: "senior", count: 4, interval: 1200, delay: 10500 }, // Tanks
      { type: "warlock", count: 3, interval: 1500, delay: 14000 }, // More dark magic
    ],
    // Wave 4: Warlock ascension
    [
      { type: "warlock", count: 4, interval: 1400 }, // Dark lords
      { type: "specter", count: 5, interval: 950, delay: 3500 }, // Ghosts
      { type: "berserker", count: 4, interval: 1000, delay: 7000 }, // Rage
      { type: "hexer", count: 6, interval: 800, delay: 10500 }, // Curse flood
      { type: "banshee", count: 3, interval: 1600, delay: 14500 }, // Screaming
    ],
    // Wave 5: Necromancer awakening
    [
      { type: "necromancer", count: 2, interval: 2800 }, // Death lords
      { type: "warlock", count: 4, interval: 1400, delay: 3500 }, // Support
      { type: "specter", count: 6, interval: 900, delay: 7500 }, // Ghost army
      { type: "hexer", count: 5, interval: 850, delay: 11500 }, // Curses
      { type: "cultist", count: 6, interval: 700, delay: 15000 }, // Sacrifices
    ],
    // Wave 6: Shadow knight arrival
    [
      { type: "shadow_knight", count: 2, interval: 3200 }, // Dark knights
      { type: "necromancer", count: 2, interval: 2600, delay: 4000 }, // Death
      { type: "specter", count: 6, interval: 900, delay: 8000 }, // Ghosts
      { type: "berserker", count: 5, interval: 1000, delay: 12000 }, // Rage support
      { type: "banshee", count: 3, interval: 1500, delay: 16000 }, // Screams
    ],
    // Wave 7: Dark convergence
    [
      { type: "gradstudent", count: 4, interval: 1600 }, // Academic tanks
      { type: "shadow_knight", count: 2, interval: 3000, delay: 4000 }, // Knights
      { type: "warlock", count: 5, interval: 1200, delay: 8000 }, // Magic
      { type: "berserker", count: 5, interval: 1000, delay: 12000 }, // Rage
      { type: "hexer", count: 6, interval: 850, delay: 16000 }, // Curses
    ],
    // Wave 8: Professor dark arts
    [
      { type: "professor", count: 2, interval: 3500 }, // Masters
      { type: "necromancer", count: 3, interval: 2200, delay: 4500 }, // Death
      { type: "warlock", count: 5, interval: 1200, delay: 9000 }, // Dark magic
      { type: "specter", count: 6, interval: 900, delay: 13500 }, // Ghosts
      { type: "cultist", count: 8, interval: 650, delay: 18000 }, // Cult horde
    ],
    // Wave 9: Shadow army
    [
      { type: "shadow_knight", count: 3, interval: 2600 }, // Dark vanguard
      { type: "berserker", count: 6, interval: 950, delay: 4500 }, // Rage wave
      { type: "hexer", count: 6, interval: 850, delay: 8500 }, // Curses
      { type: "banshee", count: 4, interval: 1400, delay: 12500 }, // Wailing
      { type: "specter", count: 6, interval: 900, delay: 16500 }, // More ghosts
    ],
    // Wave 10: Dean's curse
    [
      { type: "dean", count: 1, interval: 4500 }, // Dark dean
      { type: "shadow_knight", count: 3, interval: 2400, delay: 4000 }, // Guard
      { type: "specter", count: 6, interval: 900, delay: 8500 }, // Ghosts
      { type: "necromancer", count: 3, interval: 2000, delay: 13000 }, // Death
      { type: "warlock", count: 5, interval: 1200, delay: 17500 }, // Magic
    ],
    // Wave 11: Professor coven
    [
      { type: "professor", count: 3, interval: 2800 }, // Coven masters
      { type: "necromancer", count: 3, interval: 2200, delay: 5000 }, // Death lords
      { type: "warlock", count: 5, interval: 1200, delay: 9500 }, // Dark magic
      { type: "berserker", count: 6, interval: 950, delay: 14000 }, // Rage
      { type: "banshee", count: 4, interval: 1400, delay: 18500 }, // Screaming
    ],
    // Wave 12: Shadow dominion
    [
      { type: "dean", count: 2, interval: 3800 }, // Double deans
      { type: "shadow_knight", count: 4, interval: 2200, delay: 5000 }, // Army
      { type: "berserker", count: 6, interval: 950, delay: 10000 }, // Rage support
      { type: "hexer", count: 8, interval: 750, delay: 14500 }, // Curse flood
      { type: "specter", count: 6, interval: 900, delay: 19000 }, // Ghost wave
    ],
    // Wave 13: Necromancer ritual
    [
      { type: "dean", count: 2, interval: 3600 }, // Dark leaders
      { type: "necromancer", count: 4, interval: 2000, delay: 5000 }, // Death coven
      { type: "shadow_knight", count: 4, interval: 2200, delay: 10000 }, // Knights
      { type: "banshee", count: 5, interval: 1300, delay: 15000 }, // Wailing choir
      { type: "warlock", count: 6, interval: 1100, delay: 20000 }, // Magic flood
    ],
    // Wave 14: WITCH'S FINALE
    [
      { type: "dean", count: 2, interval: 3500 }, // Dark deans
      { type: "wyvern", count: 4, interval: 1800, delay: 4500 }, // Flying horror
      { type: "necromancer", count: 4, interval: 2000, delay: 9000 }, // Death masters
      { type: "berserker", count: 8, interval: 850, delay: 14000 }, // Rage horde
      { type: "shadow_knight", count: 4, interval: 2200, delay: 19500 }, // Final knights
      { type: "banshee", count: 5, interval: 1300, delay: 24000 }, // Final screams
    ],
  ],

  sunken_temple: [
    // 18 waves - Ancient horrors unleashed
    // Wave 1: Temple guardians awaken
    [
      { type: "senior", count: 5, interval: 900 }, // Ancient guards
      { type: "hexer", count: 4, interval: 1000, delay: 3000 }, // Cursed priests
      { type: "cultist", count: 5, interval: 750, delay: 6000 }, // Worshippers
      { type: "thornwalker", count: 3, interval: 1200, delay: 9000 }, // Vine guards
      { type: "sophomore", count: 6, interval: 800, delay: 12000 }, // Fodder
    ],
    // Wave 2: Shadow knight patrol
    [
      { type: "shadow_knight", count: 3, interval: 2400 }, // Dark sentinels
      { type: "warlock", count: 4, interval: 1300, delay: 4000 }, // Dark magic
      { type: "hexer", count: 5, interval: 950, delay: 8000 }, // Curses
      { type: "specter", count: 5, interval: 1000, delay: 12000 }, // Ghosts
      { type: "cultist", count: 6, interval: 750, delay: 16000 }, // Cultists
    ],
    // Wave 3: Wyvern emergence
    [
      { type: "wyvern", count: 3, interval: 2200 }, // Temple dragons
      { type: "specter", count: 6, interval: 950, delay: 4000 }, // Ghosts
      { type: "necromancer", count: 2, interval: 2800, delay: 8500 }, // Death lords
      { type: "banshee", count: 3, interval: 1500, delay: 12500 }, // Screaming
      { type: "hexer", count: 5, interval: 950, delay: 16000 }, // Curses
    ],
    // Wave 4: Golem awakening
    [
      { type: "golem", count: 1, interval: 4500 }, // Stone titan
      { type: "wyvern", count: 3, interval: 2000, delay: 4000 }, // Flying cover
      { type: "warlock", count: 5, interval: 1200, delay: 8500 }, // Magic
      { type: "juggernaut", count: 2, interval: 2600, delay: 13000 }, // Heavy hitters
      { type: "cultist", count: 6, interval: 750, delay: 17000 }, // Sacrifices
    ],
    // Wave 5: Shadow convergence
    [
      { type: "shadow_knight", count: 4, interval: 2200 }, // Dark army
      { type: "specter", count: 6, interval: 950, delay: 5000 }, // Ghost swarm
      { type: "wyvern", count: 3, interval: 2000, delay: 9500 }, // Air support
      { type: "thornwalker", count: 4, interval: 1100, delay: 13500 }, // Vine walkers
      { type: "berserker", count: 5, interval: 1000, delay: 17500 }, // Rage
    ],
    // Wave 6: Berserker awakening
    [
      { type: "berserker", count: 6, interval: 900 }, // Rage flood
      { type: "hexer", count: 6, interval: 950, delay: 4000 }, // Curses
      { type: "shadow_knight", count: 3, interval: 2400, delay: 8500 }, // Knights
      { type: "banshee", count: 4, interval: 1400, delay: 13000 }, // Wailing
      { type: "warlock", count: 4, interval: 1300, delay: 17500 }, // Magic
    ],
    // Wave 7: Professor excavation
    [
      { type: "professor", count: 3, interval: 2800 }, // Archeologists
      { type: "golem", count: 2, interval: 3200, delay: 5000 }, // Guardians
      { type: "necromancer", count: 3, interval: 2200, delay: 10000 }, // Death magic
      { type: "specter", count: 6, interval: 950, delay: 15000 }, // Ghosts
      { type: "cultist", count: 8, interval: 700, delay: 19500 }, // Horde
    ],
    // Wave 8: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 2000 }, // Death coven
      { type: "shadow_knight", count: 4, interval: 2200, delay: 5000 }, // Guards
      { type: "berserker", count: 6, interval: 950, delay: 10000 }, // Rage wave
      { type: "juggernaut", count: 2, interval: 2600, delay: 14500 }, // Heavy
      { type: "hexer", count: 6, interval: 900, delay: 18500 }, // Curses
    ],
    // Wave 9: Dean's expedition
    [
      { type: "dean", count: 2, interval: 3800 }, // Academic leaders
      { type: "berserker", count: 6, interval: 950, delay: 4500 }, // Rage guard
      { type: "specter", count: 6, interval: 950, delay: 9000 }, // Ghost wave
      { type: "banshee", count: 4, interval: 1400, delay: 13500 }, // Screaming
      { type: "wyvern", count: 4, interval: 1800, delay: 18000 }, // Air attack
    ],
    // Wave 10: Golem legion
    [
      { type: "golem", count: 2, interval: 3500 }, // Twin titans
      { type: "warlock", count: 6, interval: 1100, delay: 5000 }, // Magic
      { type: "wyvern", count: 4, interval: 1800, delay: 9500 }, // Flying
      { type: "thornwalker", count: 5, interval: 1000, delay: 14000 }, // Vines
      { type: "shadow_knight", count: 4, interval: 2200, delay: 18500 }, // Knights
    ],
    // Wave 11: Shadow empire
    [
      { type: "shadow_knight", count: 5, interval: 2000 }, // Dark army
      { type: "necromancer", count: 4, interval: 2000, delay: 5500 }, // Death
      { type: "hexer", count: 6, interval: 900, delay: 10500 }, // Curses
      { type: "berserker", count: 6, interval: 950, delay: 15000 }, // Rage
      { type: "banshee", count: 5, interval: 1300, delay: 19500 }, // Wailing
    ],
    // Wave 12: First trustee
    [
      { type: "trustee", count: 1, interval: 4500 }, // Ancient power
      { type: "wyvern", count: 5, interval: 1600, delay: 4500 }, // Flying guard
      { type: "specter", count: 6, interval: 950, delay: 9500 }, // Ghosts
      { type: "juggernaut", count: 3, interval: 2400, delay: 14000 }, // Heavy
      { type: "warlock", count: 5, interval: 1200, delay: 18500 }, // Magic
    ],
    // Wave 13: Dean council
    [
      { type: "dean", count: 2, interval: 3600 }, // Double deans
      { type: "golem", count: 2, interval: 3200, delay: 5000 }, // Guardians
      { type: "shadow_knight", count: 5, interval: 2000, delay: 10000 }, // Army
      { type: "necromancer", count: 4, interval: 2000, delay: 15500 }, // Death
      { type: "hexer", count: 8, interval: 800, delay: 20500 }, // Curse flood
    ],
    // Wave 14: Berserker horde
    [
      { type: "berserker", count: 10, interval: 800 }, // Rage flood
      { type: "shadow_knight", count: 5, interval: 2000, delay: 5500 }, // Knights
      { type: "necromancer", count: 4, interval: 2000, delay: 11000 }, // Death
      { type: "banshee", count: 5, interval: 1300, delay: 16000 }, // Screaming
      { type: "wyvern", count: 4, interval: 1800, delay: 20500 }, // Air
    ],
    // Wave 15: Trustee awakening
    [
      { type: "trustee", count: 1, interval: 4200 }, // Ancient power
      { type: "necromancer", count: 5, interval: 1800, delay: 4500 }, // Death coven
      { type: "wyvern", count: 5, interval: 1600, delay: 9500 }, // Flying
      { type: "juggernaut", count: 3, interval: 2400, delay: 14500 }, // Heavy
      { type: "specter", count: 8, interval: 850, delay: 19000 }, // Ghost flood
    ],
    // Wave 16: Golem army
    [
      { type: "golem", count: 3, interval: 3000 }, // Titan trio
      { type: "dean", count: 3, interval: 2800, delay: 5500 }, // Deans
      { type: "berserker", count: 8, interval: 850, delay: 11500 }, // Rage
      { type: "shadow_knight", count: 5, interval: 2000, delay: 16500 }, // Knights
      { type: "banshee", count: 5, interval: 1300, delay: 21500 }, // Screaming
    ],
    // Wave 17: Trustee council
    [
      { type: "trustee", count: 2, interval: 4000 }, // Double power
      { type: "professor", count: 4, interval: 2200, delay: 5500 }, // Masters
      { type: "shadow_knight", count: 6, interval: 1800, delay: 11000 }, // Army
      { type: "necromancer", count: 5, interval: 1800, delay: 16500 }, // Death
      { type: "wyvern", count: 6, interval: 1500, delay: 22000 }, // Air swarm
    ],
    // Wave 18: TEMPLE AWAKENING FINALE
    [
      { type: "trustee", count: 2, interval: 3800 }, // Twin ancients
      { type: "golem", count: 3, interval: 2800, delay: 5000 }, // Guardians
      { type: "wyvern", count: 6, interval: 1500, delay: 10500 }, // Dragon flight
      { type: "necromancer", count: 6, interval: 1600, delay: 16000 }, // Death lords
      { type: "juggernaut", count: 4, interval: 2200, delay: 22000 }, // Heavy finale
      { type: "banshee", count: 6, interval: 1200, delay: 27000 }, // Final screams
    ],
  ],

  // =====================
  // DESERT REGION - Ranged assault
  // =====================
  oasis: [
    // 10 waves - Desert ranged combat
    // Wave 1: Desert scouts
    [
      { type: "sophomore", count: 6, interval: 700 }, // Scout wave
      { type: "archer", count: 3, interval: 1200, delay: 2500 }, // Ranged support
      { type: "sandworm", count: 2, interval: 1800, delay: 5500 }, // Underground threat
      { type: "frosh", count: 5, interval: 650, delay: 8000 }, // Fodder
      { type: "frostling", count: 3, interval: 1100, delay: 10500 }, // Fast flankers
    ],
    // Wave 2: Archer battalion
    [
      { type: "archer", count: 5, interval: 950 }, // Main force
      { type: "junior", count: 5, interval: 1000, delay: 3000 }, // Tanks
      { type: "sandworm", count: 3, interval: 1600, delay: 6500 }, // Burrowers
      { type: "sophomore", count: 6, interval: 700, delay: 10000 }, // Support
      { type: "assassin", count: 2, interval: 1800, delay: 13000 }, // Silent killers
    ],
    // Wave 3: Mixed assault
    [
      { type: "junior", count: 5, interval: 1000 }, // Front line
      { type: "archer", count: 5, interval: 950, delay: 3500 }, // Ranged
      { type: "sophomore", count: 6, interval: 700, delay: 7000 }, // Support
      { type: "sandworm", count: 3, interval: 1600, delay: 10500 }, // Burrowers
      { type: "mage", count: 2, interval: 2000, delay: 14000 }, // Magic
    ],
    // Wave 4: Senior expedition
    [
      { type: "senior", count: 4, interval: 1200 }, // Heavy front
      { type: "archer", count: 5, interval: 950, delay: 3500 }, // Ranged
      { type: "junior", count: 5, interval: 1000, delay: 7500 }, // Medium tanks
      { type: "assassin", count: 3, interval: 1600, delay: 11500 }, // Sneaky
      { type: "frostling", count: 4, interval: 1000, delay: 15000 }, // Speed
    ],
    // Wave 5: Mage caravan
    [
      { type: "mage", count: 3, interval: 1800 }, // Spell casters
      { type: "archer", count: 6, interval: 900, delay: 3500 }, // Arrow storm
      { type: "senior", count: 4, interval: 1200, delay: 7500 }, // Tanks
      { type: "sandworm", count: 4, interval: 1500, delay: 11500 }, // Burrowers
      { type: "sophomore", count: 6, interval: 700, delay: 15500 }, // Fodder
    ],
    // Wave 6: Mascot speed rush
    [
      { type: "mascot", count: 6, interval: 750 }, // Fast wave
      { type: "mage", count: 3, interval: 1600, delay: 3000 }, // Magic
      { type: "archer", count: 5, interval: 950, delay: 6500 }, // Ranged
      { type: "assassin", count: 4, interval: 1400, delay: 10000 }, // Silent death
      { type: "junior", count: 5, interval: 1000, delay: 14000 }, // Tanks
    ],
    // Wave 7: Grad student research
    [
      { type: "gradstudent", count: 3, interval: 1800 }, // Academic tanks
      { type: "archer", count: 6, interval: 900, delay: 4000 }, // Arrow barrage
      { type: "mage", count: 3, interval: 1600, delay: 8000 }, // Magic
      { type: "sandworm", count: 4, interval: 1500, delay: 12000 }, // Underground
      { type: "frostling", count: 5, interval: 950, delay: 16000 }, // Speed finish
    ],
    // Wave 8: Combined force
    [
      { type: "gradstudent", count: 4, interval: 1600 }, // Tanks
      { type: "mage", count: 4, interval: 1400, delay: 4500 }, // Magic
      { type: "senior", count: 5, interval: 1100, delay: 9000 }, // Heavy
      { type: "assassin", count: 4, interval: 1400, delay: 13500 }, // Killers
      { type: "archer", count: 6, interval: 900, delay: 17500 }, // Ranged finish
    ],
    // Wave 9: Professor's guard
    [
      { type: "professor", count: 2, interval: 3200 }, // Leaders
      { type: "gradstudent", count: 4, interval: 1600, delay: 4500 }, // Elite
      { type: "archer", count: 6, interval: 900, delay: 9000 }, // Ranged
      { type: "sandworm", count: 4, interval: 1500, delay: 13500 }, // Burrowers
      { type: "mascot", count: 6, interval: 750, delay: 17500 }, // Speed
    ],
    // Wave 10: OASIS FINALE
    [
      { type: "professor", count: 2, interval: 3000 }, // Master duo
      { type: "mage", count: 5, interval: 1200, delay: 4500 }, // Magic
      { type: "mascot", count: 8, interval: 700, delay: 9000 }, // Speed swarm
      { type: "assassin", count: 5, interval: 1300, delay: 14000 }, // Silent death
      { type: "gradstudent", count: 4, interval: 1600, delay: 18500 }, // Final tanks
      { type: "archer", count: 8, interval: 850, delay: 23000 }, // Arrow finale
    ],
  ],

  pyramid: [
    // 12 waves - Pyramid ranged siege
    // Wave 1: Tomb raiders
    [
      { type: "junior", count: 6, interval: 900 }, // Front line
      { type: "archer", count: 4, interval: 1100, delay: 3500 }, // Ranged
      { type: "sandworm", count: 3, interval: 1500, delay: 7000 }, // Burrowers
      { type: "sophomore", count: 6, interval: 750, delay: 10500 }, // Support
      { type: "assassin", count: 2, interval: 1800, delay: 13500 }, // Shadow
    ],
    // Wave 2: Archer ambush
    [
      { type: "archer", count: 6, interval: 900 }, // Arrow storm
      { type: "junior", count: 5, interval: 950, delay: 3500 }, // Tanks
      { type: "sandworm", count: 3, interval: 1500, delay: 7500 }, // Underground
      { type: "frostling", count: 4, interval: 1000, delay: 11000 }, // Speed
      { type: "mage", count: 2, interval: 2000, delay: 14500 }, // Magic
    ],
    // Wave 3: Senior excavation
    [
      { type: "senior", count: 4, interval: 1200 }, // Heavy front
      { type: "mage", count: 3, interval: 1600, delay: 3500 }, // Magic
      { type: "archer", count: 5, interval: 950, delay: 7000 }, // Ranged
      { type: "assassin", count: 3, interval: 1500, delay: 10500 }, // Silent killers
      { type: "sandworm", count: 4, interval: 1400, delay: 14000 }, // Burrowers
    ],
    // Wave 4: Mage circle
    [
      { type: "mage", count: 4, interval: 1400 }, // Spell casters
      { type: "mascot", count: 6, interval: 750, delay: 3500 }, // Speed
      { type: "archer", count: 5, interval: 950, delay: 7500 }, // Ranged
      { type: "infernal", count: 2, interval: 2200, delay: 11000 }, // Fire demons
      { type: "junior", count: 5, interval: 950, delay: 14500 }, // Tanks
    ],
    // Wave 5: Catapult siege
    [
      { type: "catapult", count: 2, interval: 2800 }, // Siege engines
      { type: "senior", count: 5, interval: 1100, delay: 4000 }, // Tank guard
      { type: "archer", count: 6, interval: 900, delay: 8000 }, // Arrow barrage
      { type: "sandworm", count: 4, interval: 1400, delay: 12000 }, // Burrowers
      { type: "assassin", count: 3, interval: 1500, delay: 16000 }, // Killers
    ],
    // Wave 6: Grad student expedition
    [
      { type: "gradstudent", count: 4, interval: 1600 }, // Academic tanks
      { type: "mage", count: 4, interval: 1400, delay: 4500 }, // Magic
      { type: "catapult", count: 2, interval: 2600, delay: 9000 }, // Siege
      { type: "infernal", count: 3, interval: 1800, delay: 13500 }, // Fire
      { type: "archer", count: 6, interval: 900, delay: 17500 }, // Ranged finish
    ],
    // Wave 7: Professor's treasure hunt
    [
      { type: "professor", count: 2, interval: 3200 }, // Leaders
      { type: "archer", count: 8, interval: 850, delay: 4500 }, // Arrow storm
      { type: "mage", count: 4, interval: 1400, delay: 9500 }, // Magic
      { type: "sandworm", count: 4, interval: 1400, delay: 14000 }, // Burrowers
      { type: "frostling", count: 5, interval: 950, delay: 18000 }, // Speed
    ],
    // Wave 8: Combined siege
    [
      { type: "professor", count: 2, interval: 3000 }, // Leaders
      { type: "catapult", count: 3, interval: 2400, delay: 4500 }, // Siege
      { type: "gradstudent", count: 4, interval: 1600, delay: 9500 }, // Tanks
      { type: "infernal", count: 3, interval: 1800, delay: 14000 }, // Fire
      { type: "assassin", count: 4, interval: 1400, delay: 18000 }, // Silent death
    ],
    // Wave 9: Dean's tomb
    [
      { type: "dean", count: 1, interval: 4200 }, // Dark leader
      { type: "professor", count: 2, interval: 2800, delay: 4500 }, // Support
      { type: "mage", count: 5, interval: 1200, delay: 9000 }, // Magic
      { type: "sandworm", count: 5, interval: 1300, delay: 13500 }, // Burrowers
      { type: "archer", count: 8, interval: 850, delay: 18000 }, // Arrow finale
    ],
    // Wave 10: Harpy swarm
    [
      { type: "dean", count: 2, interval: 3800 }, // Double deans
      { type: "harpy", count: 6, interval: 1000, delay: 5000 }, // Flying swarm
      { type: "archer", count: 6, interval: 900, delay: 9500 }, // Ranged
      { type: "infernal", count: 4, interval: 1600, delay: 14000 }, // Fire demons
      { type: "assassin", count: 4, interval: 1400, delay: 18500 }, // Killers
    ],
    // Wave 11: Siege masters
    [
      { type: "dean", count: 2, interval: 3600 }, // Leaders
      { type: "catapult", count: 3, interval: 2200, delay: 5000 }, // Siege
      { type: "professor", count: 3, interval: 2600, delay: 10000 }, // Masters
      { type: "sandworm", count: 5, interval: 1300, delay: 15500 }, // Burrowers
      { type: "mage", count: 6, interval: 1100, delay: 20000 }, // Magic flood
    ],
    // Wave 12: PYRAMID FINALE
    [
      { type: "dean", count: 2, interval: 3500 }, // Dark leaders
      { type: "professor", count: 4, interval: 2200, delay: 5000 }, // Masters
      { type: "mage", count: 6, interval: 1100, delay: 10500 }, // Magic storm
      { type: "mascot", count: 8, interval: 700, delay: 15500 }, // Speed horde
      { type: "infernal", count: 4, interval: 1600, delay: 20500 }, // Fire demons
      { type: "catapult", count: 3, interval: 2200, delay: 25500 }, // Final siege
    ],
  ],

  sphinx: [
    // 14 waves - Sphinx gauntlet
    // Wave 1: Riddle seekers
    [
      { type: "senior", count: 5, interval: 950 }, // Front line
      { type: "archer", count: 5, interval: 1000, delay: 3000 }, // Ranged
      { type: "sandworm", count: 3, interval: 1500, delay: 6500 }, // Burrowers
      { type: "assassin", count: 3, interval: 1400, delay: 10000 }, // Silent
      { type: "sophomore", count: 6, interval: 750, delay: 13000 }, // Support
    ],
    // Wave 2: Archer legion
    [
      { type: "archer", count: 8, interval: 850 }, // Arrow storm
      { type: "mage", count: 3, interval: 1500, delay: 4500 }, // Magic
      { type: "senior", count: 4, interval: 1100, delay: 8000 }, // Tanks
      { type: "infernal", count: 2, interval: 2000, delay: 11500 }, // Fire demons
      { type: "sandworm", count: 4, interval: 1400, delay: 15000 }, // Burrowers
    ],
    // Wave 3: Warlock contingent
    [
      { type: "warlock", count: 4, interval: 1400 }, // Dark magic
      { type: "mage", count: 4, interval: 1300, delay: 4000 }, // Magic
      { type: "junior", count: 6, interval: 900, delay: 8000 }, // Tanks
      { type: "assassin", count: 4, interval: 1300, delay: 12000 }, // Killers
      { type: "archer", count: 6, interval: 900, delay: 16000 }, // Ranged
    ],
    // Wave 4: Siege preparation
    [
      { type: "gradstudent", count: 4, interval: 1500 }, // Academic tanks
      { type: "archer", count: 6, interval: 900, delay: 4000 }, // Ranged
      { type: "catapult", count: 2, interval: 2600, delay: 8000 }, // Siege
      { type: "sandworm", count: 4, interval: 1400, delay: 12000 }, // Burrowers
      { type: "infernal", count: 3, interval: 1700, delay: 16000 }, // Fire
    ],
    // Wave 5: Professor's test
    [
      { type: "professor", count: 2, interval: 3200 }, // Masters
      { type: "mascot", count: 6, interval: 750, delay: 4500 }, // Speed
      { type: "mage", count: 4, interval: 1300, delay: 8500 }, // Magic
      { type: "assassin", count: 4, interval: 1300, delay: 12500 }, // Silent death
      { type: "archer", count: 6, interval: 900, delay: 16500 }, // Ranged finish
    ],
    // Wave 6: Wyvern arrival
    [
      { type: "catapult", count: 3, interval: 2200 }, // Siege engines
      { type: "senior", count: 6, interval: 950, delay: 4500 }, // Heavy
      { type: "wyvern", count: 3, interval: 2000, delay: 9000 }, // Flying
      { type: "sandworm", count: 4, interval: 1400, delay: 13500 }, // Burrowers
      { type: "infernal", count: 3, interval: 1700, delay: 17500 }, // Fire
    ],
    // Wave 7: Dean's challenge
    [
      { type: "dean", count: 1, interval: 4200 }, // Dark leader
      { type: "professor", count: 3, interval: 2600, delay: 4500 }, // Masters
      { type: "archer", count: 8, interval: 850, delay: 9500 }, // Arrow storm
      { type: "assassin", count: 4, interval: 1300, delay: 14500 }, // Killers
      { type: "wyvern", count: 3, interval: 2000, delay: 19000 }, // Air support
    ],
    // Wave 8: Double dean
    [
      { type: "dean", count: 2, interval: 3600 }, // Twin leaders
      { type: "catapult", count: 3, interval: 2200, delay: 5000 }, // Siege
      { type: "wyvern", count: 4, interval: 1700, delay: 10000 }, // Flying
      { type: "sandworm", count: 5, interval: 1300, delay: 15000 }, // Burrowers
      { type: "infernal", count: 4, interval: 1500, delay: 19500 }, // Fire demons
    ],
    // Wave 9: Magic storm
    [
      { type: "professor", count: 4, interval: 2400 }, // Masters
      { type: "mage", count: 6, interval: 1100, delay: 5500 }, // Magic flood
      { type: "gradstudent", count: 5, interval: 1300, delay: 10500 }, // Tanks
      { type: "assassin", count: 5, interval: 1200, delay: 15500 }, // Killers
      { type: "archer", count: 8, interval: 850, delay: 20000 }, // Ranged
    ],
    // Wave 10: Dragon awakening
    [
      { type: "dean", count: 2, interval: 3500 }, // Leaders
      { type: "gradstudent", count: 5, interval: 1300, delay: 5000 }, // Tanks
      { type: "wyvern", count: 4, interval: 1700, delay: 10000 }, // Flying
      { type: "dragon", count: 1, interval: 4500, delay: 15000 }, // DRAGON!
      { type: "sandworm", count: 5, interval: 1300, delay: 19500 }, // Burrowers
    ],
    // Wave 11: First trustee
    [
      { type: "trustee", count: 1, interval: 4500 }, // Ancient power
      { type: "dean", count: 2, interval: 3200, delay: 5000 }, // Deans
      { type: "mascot", count: 8, interval: 700, delay: 10000 }, // Speed horde
      { type: "infernal", count: 4, interval: 1500, delay: 15000 }, // Fire
      { type: "wyvern", count: 4, interval: 1700, delay: 19500 }, // Flying
    ],
    // Wave 12: Siege masters
    [
      { type: "trustee", count: 1, interval: 4200 }, // Ancient power
      { type: "catapult", count: 4, interval: 2000, delay: 4500 }, // Siege engines
      { type: "wyvern", count: 5, interval: 1500, delay: 9500 }, // Flying swarm
      { type: "assassin", count: 5, interval: 1200, delay: 14500 }, // Killers
      { type: "sandworm", count: 5, interval: 1300, delay: 19000 }, // Burrowers
    ],
    // Wave 13: Dean council
    [
      { type: "trustee", count: 1, interval: 4000 }, // Ancient
      { type: "professor", count: 4, interval: 2200, delay: 4500 }, // Masters
      { type: "dean", count: 3, interval: 2800, delay: 10000 }, // Council
      { type: "dragon", count: 1, interval: 4500, delay: 16000 }, // Dragon!
      { type: "infernal", count: 5, interval: 1400, delay: 20500 }, // Fire
    ],
    // Wave 14: SPHINX FINALE
    [
      { type: "trustee", count: 2, interval: 3800 }, // Double power
      { type: "dean", count: 3, interval: 2600, delay: 5500 }, // Dark council
      { type: "mage", count: 8, interval: 900, delay: 11000 }, // Magic storm
      { type: "harpy", count: 8, interval: 850, delay: 16500 }, // Flying swarm
      { type: "dragon", count: 2, interval: 3500, delay: 22000 }, // DRAGONS!
      { type: "wyvern", count: 6, interval: 1400, delay: 27000 }, // Final flight
    ],
  ],

  // =====================
  // WINTER REGION - Brutal variety
  // =====================
  glacier: [
    // 12 waves - Glacier assault
    // Wave 1: Ice scouts
    [
      { type: "frostling", count: 6, interval: 700 }, // Fast ice runners
      { type: "junior", count: 5, interval: 950, delay: 2500 }, // Tanks
      { type: "crossbowman", count: 3, interval: 1400, delay: 6000 }, // Ranged
      { type: "archer", count: 4, interval: 1100, delay: 9500 }, // Support ranged
      { type: "sophomore", count: 6, interval: 750, delay: 13000 }, // Fodder
    ],
    // Wave 2: Frost assault
    [
      { type: "senior", count: 5, interval: 1000 }, // Heavy front
      { type: "frostling", count: 6, interval: 700, delay: 3500 }, // Speed support
      { type: "hexer", count: 5, interval: 1050, delay: 7000 }, // Curses
      { type: "mascot", count: 5, interval: 800, delay: 10500 }, // Speed
      { type: "crossbowman", count: 3, interval: 1400, delay: 14000 }, // Ranged
    ],
    // Wave 3: Crossbow battalion
    [
      { type: "crossbowman", count: 4, interval: 1300 }, // Elite ranged
      { type: "archer", count: 6, interval: 950, delay: 3500 }, // Ranged support
      { type: "senior", count: 5, interval: 1000, delay: 7500 }, // Tanks
      { type: "frostling", count: 5, interval: 750, delay: 11500 }, // Speed
      { type: "plaguebearer", count: 3, interval: 1600, delay: 15000 }, // Toxic
    ],
    // Wave 4: Mage storm
    [
      { type: "mascot", count: 6, interval: 750 }, // Speed wave
      { type: "crossbowman", count: 4, interval: 1300, delay: 3000 }, // Ranged
      { type: "mage", count: 4, interval: 1400, delay: 7000 }, // Magic
      { type: "frostling", count: 6, interval: 700, delay: 11000 }, // Ice runners
      { type: "hexer", count: 5, interval: 1050, delay: 14500 }, // Curses
    ],
    // Wave 5: Grad student expedition
    [
      { type: "gradstudent", count: 4, interval: 1600 }, // Academic tanks
      { type: "senior", count: 6, interval: 950, delay: 4500 }, // Heavy
      { type: "hexer", count: 5, interval: 1050, delay: 9000 }, // Curses
      { type: "frostling", count: 6, interval: 700, delay: 13000 }, // Speed
      { type: "crossbowman", count: 4, interval: 1300, delay: 17000 }, // Ranged
    ],
    // Wave 6: Winter magic
    [
      { type: "mage", count: 5, interval: 1200 }, // Spell casters
      { type: "archer", count: 6, interval: 950, delay: 4000 }, // Ranged
      { type: "crossbowman", count: 4, interval: 1300, delay: 8500 }, // Elite ranged
      { type: "plaguebearer", count: 4, interval: 1500, delay: 13000 }, // Toxic
      { type: "frostling", count: 6, interval: 700, delay: 17000 }, // Ice finish
    ],
    // Wave 7: Harpy blizzard
    [
      { type: "catapult", count: 2, interval: 2600 }, // Siege
      { type: "gradstudent", count: 5, interval: 1300, delay: 4000 }, // Tanks
      { type: "harpy", count: 6, interval: 1000, delay: 8500 }, // Flying
      { type: "frostling", count: 6, interval: 700, delay: 13000 }, // Speed
      { type: "hexer", count: 5, interval: 1050, delay: 16500 }, // Curses
    ],
    // Wave 8: Professor's research
    [
      { type: "professor", count: 2, interval: 3200 }, // Leaders
      { type: "senior", count: 6, interval: 950, delay: 4500 }, // Heavy guard
      { type: "crossbowman", count: 5, interval: 1200, delay: 9500 }, // Ranged
      { type: "frostling", count: 6, interval: 700, delay: 14000 }, // Speed
      { type: "plaguebearer", count: 4, interval: 1500, delay: 17500 }, // Toxic
    ],
    // Wave 9: Wyvern swarm
    [
      { type: "mascot", count: 8, interval: 700 }, // Speed flood
      { type: "mage", count: 5, interval: 1200, delay: 4000 }, // Magic
      { type: "wyvern", count: 4, interval: 1700, delay: 8500 }, // Flying
      { type: "frostling", count: 6, interval: 700, delay: 13000 }, // Ice runners
      { type: "crossbowman", count: 4, interval: 1300, delay: 16500 }, // Ranged
    ],
    // Wave 10: Siege masters
    [
      { type: "professor", count: 3, interval: 2600 }, // Masters
      { type: "archer", count: 8, interval: 850, delay: 5000 }, // Arrow storm
      { type: "catapult", count: 3, interval: 2200, delay: 10000 }, // Siege
      { type: "frostling", count: 6, interval: 700, delay: 15000 }, // Speed
      { type: "hexer", count: 6, interval: 1000, delay: 18500 }, // Curses
    ],
    // Wave 11: Dean's arrival
    [
      { type: "dean", count: 1, interval: 4200 }, // Dark leader
      { type: "gradstudent", count: 6, interval: 1100, delay: 4500 }, // Tanks
      { type: "crossbowman", count: 5, interval: 1200, delay: 9500 }, // Ranged
      { type: "frostling", count: 8, interval: 650, delay: 14000 }, // Ice swarm
      { type: "wyvern", count: 4, interval: 1700, delay: 18500 }, // Flying
    ],
    // Wave 12: GLACIER FINALE
    [
      { type: "dean", count: 2, interval: 3600 }, // Double deans
      { type: "professor", count: 3, interval: 2600, delay: 5500 }, // Masters
      { type: "wyvern", count: 6, interval: 1400, delay: 11000 }, // Flying swarm
      { type: "crossbowman", count: 6, interval: 1100, delay: 16500 }, // Ranged
      { type: "frostling", count: 8, interval: 650, delay: 21000 }, // Ice horde
      { type: "plaguebearer", count: 4, interval: 1500, delay: 25500 }, // Toxic finish
    ],
  ],

  fortress: [
    // 14 waves - Fortress siege
    // Wave 1: Fortress scouts
    [
      { type: "senior", count: 6, interval: 900 }, // Heavy front
      { type: "hexer", count: 5, interval: 1050, delay: 3500 }, // Curses
      { type: "frostling", count: 5, interval: 750, delay: 7000 }, // Speed
      { type: "crossbowman", count: 3, interval: 1400, delay: 10500 }, // Ranged
      { type: "juggernaut", count: 2, interval: 2400, delay: 14000 }, // Heavy
    ],
    // Wave 2: Mixed assault
    [
      { type: "gradstudent", count: 4, interval: 1500 }, // Academic tanks
      { type: "mascot", count: 8, interval: 700, delay: 4000 }, // Speed flood
      { type: "crossbowman", count: 4, interval: 1300, delay: 8500 }, // Ranged
      { type: "frostling", count: 5, interval: 750, delay: 12500 }, // Ice
      { type: "berserker", count: 4, interval: 1100, delay: 16000 }, // Rage
    ],
    // Wave 3: Ranged battalion
    [
      { type: "archer", count: 8, interval: 850 }, // Arrow storm
      { type: "mage", count: 4, interval: 1400, delay: 4500 }, // Magic
      { type: "senior", count: 5, interval: 1000, delay: 9000 }, // Tanks
      { type: "juggernaut", count: 2, interval: 2400, delay: 13500 }, // Heavy
      { type: "hexer", count: 5, interval: 1050, delay: 17500 }, // Curses
    ],
    // Wave 4: Crossbow assault
    [
      { type: "crossbowman", count: 5, interval: 1200 }, // Elite ranged
      { type: "mascot", count: 6, interval: 750, delay: 4000 }, // Speed
      { type: "gradstudent", count: 4, interval: 1500, delay: 8000 }, // Tanks
      { type: "frostling", count: 6, interval: 700, delay: 12500 }, // Ice
      { type: "berserker", count: 5, interval: 1050, delay: 16500 }, // Rage
    ],
    // Wave 5: Professor command
    [
      { type: "professor", count: 2, interval: 3200 }, // Leaders
      { type: "senior", count: 8, interval: 850, delay: 4500 }, // Heavy guard
      { type: "hexer", count: 6, interval: 1000, delay: 9500 }, // Curses
      { type: "juggernaut", count: 3, interval: 2200, delay: 14500 }, // Heavy
      { type: "frostling", count: 6, interval: 700, delay: 19000 }, // Ice finish
    ],
    // Wave 6: Siege engines
    [
      { type: "catapult", count: 3, interval: 2200 }, // Siege
      { type: "archer", count: 8, interval: 850, delay: 4500 }, // Ranged
      { type: "wyvern", count: 4, interval: 1700, delay: 9500 }, // Flying
      { type: "berserker", count: 5, interval: 1050, delay: 14500 }, // Rage
      { type: "crossbowman", count: 4, interval: 1300, delay: 18500 }, // Ranged
    ],
    // Wave 7: Magic battalion
    [
      { type: "gradstudent", count: 6, interval: 1100 }, // Tanks
      { type: "mage", count: 6, interval: 1100, delay: 4500 }, // Magic
      { type: "crossbowman", count: 5, interval: 1200, delay: 9500 }, // Ranged
      { type: "juggernaut", count: 3, interval: 2200, delay: 14000 }, // Heavy
      { type: "hexer", count: 6, interval: 1000, delay: 18500 }, // Curses
    ],
    // Wave 8: Professor army
    [
      { type: "professor", count: 4, interval: 2200 }, // Masters
      { type: "mascot", count: 8, interval: 700, delay: 5500 }, // Speed flood
      { type: "catapult", count: 3, interval: 2200, delay: 10500 }, // Siege
      { type: "frostling", count: 6, interval: 700, delay: 15500 }, // Ice
      { type: "berserker", count: 6, interval: 1000, delay: 19000 }, // Rage
    ],
    // Wave 9: Dean's assault
    [
      { type: "dean", count: 2, interval: 3600 }, // Dark leaders
      { type: "wyvern", count: 5, interval: 1500, delay: 5000 }, // Flying
      { type: "gradstudent", count: 6, interval: 1100, delay: 10000 }, // Tanks
      { type: "juggernaut", count: 3, interval: 2200, delay: 15000 }, // Heavy
      { type: "crossbowman", count: 5, interval: 1200, delay: 19500 }, // Ranged
    ],
    // Wave 10: Siege masters
    [
      { type: "dean", count: 2, interval: 3500 }, // Leaders
      { type: "catapult", count: 4, interval: 2000, delay: 5000 }, // Siege
      { type: "professor", count: 3, interval: 2600, delay: 10500 }, // Masters
      { type: "berserker", count: 6, interval: 1000, delay: 16000 }, // Rage
      { type: "hexer", count: 6, interval: 1000, delay: 20500 }, // Curses
    ],
    // Wave 11: Magic dominion
    [
      { type: "professor", count: 5, interval: 2000 }, // Master coven
      { type: "mage", count: 8, interval: 900, delay: 6000 }, // Magic flood
      { type: "crossbowman", count: 6, interval: 1100, delay: 12000 }, // Ranged
      { type: "juggernaut", count: 4, interval: 2000, delay: 17500 }, // Heavy
      { type: "frostling", count: 8, interval: 650, delay: 22500 }, // Ice swarm
    ],
    // Wave 12: Dean council
    [
      { type: "dean", count: 3, interval: 2800 }, // Council
      { type: "professor", count: 4, interval: 2200, delay: 5500 }, // Masters
      { type: "wyvern", count: 5, interval: 1500, delay: 11000 }, // Flying
      { type: "berserker", count: 6, interval: 1000, delay: 16000 }, // Rage
      { type: "hexer", count: 6, interval: 1000, delay: 20500 }, // Curses
    ],
    // Wave 13: First trustee
    [
      { type: "trustee", count: 1, interval: 4500 }, // Ancient power
      { type: "dean", count: 3, interval: 2600, delay: 5000 }, // Deans
      { type: "archer", count: 10, interval: 800, delay: 11000 }, // Arrow storm
      { type: "juggernaut", count: 4, interval: 2000, delay: 17000 }, // Heavy
      { type: "wyvern", count: 5, interval: 1500, delay: 22000 }, // Flying
    ],
    // Wave 14: FORTRESS FINALE
    [
      { type: "trustee", count: 2, interval: 3800 }, // Double power
      { type: "dean", count: 3, interval: 2600, delay: 5500 }, // Council
      { type: "wyvern", count: 6, interval: 1400, delay: 11500 }, // Flying swarm
      { type: "hexer", count: 8, interval: 900, delay: 17500 }, // Curse flood
      { type: "juggernaut", count: 4, interval: 2000, delay: 23000 }, // Heavy finale
      { type: "berserker", count: 8, interval: 900, delay: 28000 }, // Rage finish
    ],
  ],

  peak: [
    // 16 waves - Summit challenge
    // Wave 1: Mountain vanguard
    [
      { type: "gradstudent", count: 5, interval: 1100 }, // Tanks
      { type: "crossbowman", count: 4, interval: 1300, delay: 3500 }, // Ranged
      { type: "frostling", count: 6, interval: 700, delay: 7500 }, // Ice runners
      { type: "berserker", count: 4, interval: 1100, delay: 11000 }, // Rage
      { type: "hexer", count: 4, interval: 1100, delay: 14500 }, // Curses
    ],
    // Wave 2: Professor expedition
    [
      { type: "professor", count: 2, interval: 3200 }, // Leaders
      { type: "senior", count: 8, interval: 850, delay: 4500 }, // Heavy
      { type: "hexer", count: 5, interval: 1050, delay: 9500 }, // Curses
      { type: "frostling", count: 6, interval: 700, delay: 14000 }, // Ice
      { type: "juggernaut", count: 2, interval: 2400, delay: 18000 }, // Heavy
    ],
    // Wave 3: Speed assault
    [
      { type: "mascot", count: 10, interval: 700 }, // Speed flood
      { type: "archer", count: 6, interval: 950, delay: 4500 }, // Ranged
      { type: "mage", count: 4, interval: 1400, delay: 8500 }, // Magic
      { type: "frostling", count: 6, interval: 700, delay: 12500 }, // Ice
      { type: "berserker", count: 5, interval: 1050, delay: 16000 }, // Rage
    ],
    // Wave 4: Dean's arrival
    [
      { type: "dean", count: 1, interval: 4200 }, // Dark leader
      { type: "gradstudent", count: 6, interval: 1100, delay: 4500 }, // Tanks
      { type: "crossbowman", count: 5, interval: 1200, delay: 9500 }, // Ranged
      { type: "juggernaut", count: 3, interval: 2200, delay: 14500 }, // Heavy
      { type: "hexer", count: 5, interval: 1050, delay: 19000 }, // Curses
    ],
    // Wave 5: Siege force
    [
      { type: "mage", count: 8, interval: 900 }, // Magic flood
      { type: "catapult", count: 3, interval: 2200, delay: 4500 }, // Siege
      { type: "wyvern", count: 4, interval: 1700, delay: 9500 }, // Flying
      { type: "frostling", count: 6, interval: 700, delay: 14500 }, // Ice
      { type: "berserker", count: 5, interval: 1050, delay: 18000 }, // Rage
    ],
    // Wave 6: Professor army
    [
      { type: "professor", count: 4, interval: 2200 }, // Masters
      { type: "mascot", count: 8, interval: 700, delay: 5500 }, // Speed
      { type: "crossbowman", count: 5, interval: 1200, delay: 10500 }, // Ranged
      { type: "juggernaut", count: 3, interval: 2200, delay: 15500 }, // Heavy
      { type: "hexer", count: 6, interval: 1000, delay: 20000 }, // Curses
    ],
    // Wave 7: Double dean
    [
      { type: "dean", count: 2, interval: 3600 }, // Leaders
      { type: "archer", count: 10, interval: 800, delay: 5000 }, // Arrow storm
      { type: "hexer", count: 6, interval: 1000, delay: 10500 }, // Curses
      { type: "frostling", count: 8, interval: 650, delay: 15500 }, // Ice swarm
      { type: "wyvern", count: 4, interval: 1700, delay: 20000 }, // Flying
    ],
    // Wave 8: Siege masters
    [
      { type: "catapult", count: 4, interval: 2000 }, // Heavy siege
      { type: "mage", count: 6, interval: 1100, delay: 5000 }, // Magic
      { type: "crossbowman", count: 6, interval: 1100, delay: 10000 }, // Ranged
      { type: "berserker", count: 6, interval: 1000, delay: 15000 }, // Rage
      { type: "juggernaut", count: 3, interval: 2200, delay: 19500 }, // Heavy
    ],
    // Wave 9: Professor legion
    [
      { type: "professor", count: 5, interval: 2000 }, // Master coven
      { type: "gradstudent", count: 8, interval: 900, delay: 6000 }, // Tanks
      { type: "wyvern", count: 5, interval: 1500, delay: 12000 }, // Flying
      { type: "frostling", count: 8, interval: 650, delay: 17500 }, // Ice swarm
      { type: "hexer", count: 6, interval: 1000, delay: 22000 }, // Curses
    ],
    // Wave 10: Harpy terror
    [
      { type: "dean", count: 3, interval: 2800 }, // Council
      { type: "catapult", count: 4, interval: 2000, delay: 5500 }, // Siege
      { type: "harpy", count: 8, interval: 900, delay: 11000 }, // Flying swarm
      { type: "berserker", count: 6, interval: 1000, delay: 16500 }, // Rage
      { type: "juggernaut", count: 4, interval: 2000, delay: 21000 }, // Heavy
    ],
    // Wave 11: First trustee
    [
      { type: "trustee", count: 1, interval: 4500 }, // Ancient power
      { type: "professor", count: 4, interval: 2200, delay: 5000 }, // Masters
      { type: "crossbowman", count: 6, interval: 1100, delay: 10500 }, // Ranged
      { type: "frostling", count: 8, interval: 650, delay: 16000 }, // Ice
      { type: "wyvern", count: 5, interval: 1500, delay: 21000 }, // Flying
    ],
    // Wave 12: Dean horde
    [
      { type: "dean", count: 4, interval: 2500 }, // Council
      { type: "mascot", count: 10, interval: 700, delay: 6500 }, // Speed flood
      { type: "crossbowman", count: 6, interval: 1100, delay: 12500 }, // Ranged
      { type: "juggernaut", count: 4, interval: 2000, delay: 18000 }, // Heavy
      { type: "berserker", count: 8, interval: 900, delay: 23500 }, // Rage
    ],
    // Wave 13: Dragon awakening
    [
      { type: "trustee", count: 2, interval: 3800 }, // Ancient powers
      { type: "dean", count: 3, interval: 2600, delay: 5500 }, // Leaders
      { type: "wyvern", count: 8, interval: 1000, delay: 11500 }, // Flying swarm
      { type: "dragon", count: 1, interval: 4500, delay: 17500 }, // DRAGON!
      { type: "frostling", count: 8, interval: 650, delay: 22000 }, // Ice swarm
    ],
    // Wave 14: Magic storm
    [
      { type: "trustee", count: 2, interval: 3600 }, // Ancient powers
      { type: "professor", count: 5, interval: 2000, delay: 5500 }, // Coven
      { type: "mage", count: 8, interval: 900, delay: 11500 }, // Magic flood
      { type: "hexer", count: 8, interval: 900, delay: 17500 }, // Curse flood
      { type: "juggernaut", count: 4, interval: 2000, delay: 23000 }, // Heavy
    ],
    // Wave 15: Summit assault
    [
      { type: "trustee", count: 2, interval: 3500 }, // Ancient
      { type: "dean", count: 3, interval: 2600, delay: 5500 }, // Council
      { type: "wyvern", count: 6, interval: 1200, delay: 11500 }, // Flying
      { type: "crossbowman", count: 8, interval: 1000, delay: 17000 }, // Ranged
      { type: "dragon", count: 1, interval: 4500, delay: 23000 }, // Dragon!
      { type: "berserker", count: 8, interval: 900, delay: 27500 }, // Rage finish
    ],
    // Wave 16: PEAK FINALE
    [
      { type: "golem", count: 3, interval: 3000 }, // Stone titans
      { type: "trustee", count: 2, interval: 3500, delay: 6000 }, // Ancient power
      { type: "crossbowman", count: 8, interval: 1000, delay: 12000 }, // Ranged army
      { type: "catapult", count: 5, interval: 1800, delay: 18000 }, // Siege line
      { type: "dragon", count: 2, interval: 3500, delay: 24000 }, // DRAGONS!
      { type: "juggernaut", count: 5, interval: 1800, delay: 29500 }, // Final heavy
    ],
  ],

  // =====================
  // VOLCANIC REGION - Ultimate challenge
  // =====================
  lava: [
    // 14 waves - Lava fields assault
    // Wave 1: Fire scouts
    [
      { type: "senior", count: 8, interval: 850 }, // Heavy front
      { type: "infernal", count: 3, interval: 1700, delay: 4500 }, // Fire demons
      { type: "archer", count: 5, interval: 1000, delay: 8500 }, // Ranged
      { type: "berserker", count: 5, interval: 1050, delay: 12500 }, // Rage
      { type: "frostling", count: 5, interval: 750, delay: 16500 }, // Speed
    ],
    // Wave 2: Shadow infiltration
    [
      { type: "gradstudent", count: 6, interval: 1100 }, // Tanks
      { type: "shadow_knight", count: 3, interval: 2400, delay: 4500 }, // Dark knights
      { type: "archer", count: 6, interval: 950, delay: 9500 }, // Ranged
      { type: "infernal", count: 4, interval: 1500, delay: 14000 }, // Fire
      { type: "assassin", count: 4, interval: 1300, delay: 18500 }, // Silent killers
    ],
    // Wave 3: Professor fire command
    [
      { type: "professor", count: 2, interval: 3200 }, // Leaders
      { type: "mage", count: 5, interval: 1200, delay: 4500 }, // Magic
      { type: "berserker", count: 6, interval: 1000, delay: 9000 }, // Rage
      { type: "infernal", count: 4, interval: 1500, delay: 14000 }, // Fire demons
      { type: "juggernaut", count: 2, interval: 2400, delay: 18500 }, // Heavy
    ],
    // Wave 4: Shadow army
    [
      { type: "shadow_knight", count: 4, interval: 2200 }, // Dark knights
      { type: "mascot", count: 10, interval: 700, delay: 5500 }, // Speed flood
      { type: "senior", count: 6, interval: 950, delay: 10500 }, // Heavy
      { type: "infernal", count: 4, interval: 1500, delay: 15500 }, // Fire
      { type: "assassin", count: 4, interval: 1300, delay: 20000 }, // Killers
    ],
    // Wave 5: Siege fire
    [
      { type: "catapult", count: 3, interval: 2200 }, // Siege
      { type: "gradstudent", count: 6, interval: 1100, delay: 4500 }, // Tanks
      { type: "shadow_knight", count: 3, interval: 2400, delay: 9500 }, // Knights
      { type: "infernal", count: 5, interval: 1400, delay: 15000 }, // Fire swarm
      { type: "berserker", count: 6, interval: 1000, delay: 19500 }, // Rage
    ],
    // Wave 6: Dean's flame guard
    [
      { type: "dean", count: 2, interval: 3600 }, // Dark leaders
      { type: "professor", count: 4, interval: 2200, delay: 5000 }, // Masters
      { type: "berserker", count: 8, interval: 900, delay: 10500 }, // Rage flood
      { type: "infernal", count: 5, interval: 1400, delay: 16000 }, // Fire
      { type: "juggernaut", count: 3, interval: 2200, delay: 21000 }, // Heavy
    ],
    // Wave 7: Magic inferno
    [
      { type: "mage", count: 8, interval: 900 }, // Magic flood
      { type: "archer", count: 10, interval: 800, delay: 4500 }, // Arrow storm
      { type: "warlock", count: 5, interval: 1400, delay: 10000 }, // Dark magic
      { type: "infernal", count: 5, interval: 1400, delay: 15500 }, // Fire
      { type: "assassin", count: 5, interval: 1200, delay: 20500 }, // Killers
    ],
    // Wave 8: Siege masters
    [
      { type: "dean", count: 2, interval: 3500 }, // Leaders
      { type: "catapult", count: 4, interval: 2000, delay: 5000 }, // Siege
      { type: "mascot", count: 8, interval: 700, delay: 10000 }, // Speed
      { type: "infernal", count: 5, interval: 1400, delay: 15000 }, // Fire
      { type: "shadow_knight", count: 4, interval: 2200, delay: 20500 }, // Knights
    ],
    // Wave 9: Professor fire coven
    [
      { type: "professor", count: 5, interval: 2000 }, // Coven
      { type: "shadow_knight", count: 5, interval: 2000, delay: 6000 }, // Knights
      { type: "warlock", count: 6, interval: 1200, delay: 12000 }, // Dark magic
      { type: "infernal", count: 6, interval: 1300, delay: 17500 }, // Fire swarm
      { type: "juggernaut", count: 4, interval: 2000, delay: 23000 }, // Heavy
    ],
    // Wave 10: Trustee awakening
    [
      { type: "trustee", count: 1, interval: 4500 }, // Ancient power
      { type: "dean", count: 3, interval: 2600, delay: 5000 }, // Council
      { type: "wyvern", count: 6, interval: 1200, delay: 11000 }, // Flying
      { type: "infernal", count: 5, interval: 1400, delay: 17000 }, // Fire
      { type: "dragon", count: 1, interval: 4500, delay: 22500 }, // DRAGON!
    ],
    // Wave 11: Berserker inferno
    [
      { type: "berserker", count: 12, interval: 750 }, // Rage horde
      { type: "dean", count: 3, interval: 2600, delay: 6000 }, // Leaders
      { type: "mage", count: 8, interval: 900, delay: 12000 }, // Magic
      { type: "infernal", count: 6, interval: 1300, delay: 18000 }, // Fire swarm
      { type: "juggernaut", count: 4, interval: 2000, delay: 24000 }, // Heavy
    ],
    // Wave 12: Double trustee
    [
      { type: "trustee", count: 2, interval: 3800 }, // Ancient powers
      { type: "professor", count: 5, interval: 2000, delay: 5500 }, // Coven
      { type: "wyvern", count: 10, interval: 900, delay: 11500 }, // Flying swarm
      { type: "infernal", count: 6, interval: 1300, delay: 18000 }, // Fire
      { type: "dragon", count: 1, interval: 4500, delay: 24000 }, // Dragon!
    ],
    // Wave 13: Shadow apocalypse
    [
      { type: "shadow_knight", count: 8, interval: 1100 }, // Dark army
      { type: "trustee", count: 2, interval: 3600, delay: 5500 }, // Ancient
      { type: "catapult", count: 5, interval: 1800, delay: 11000 }, // Siege
      { type: "golem", count: 2, interval: 3500, delay: 17000 }, // Titans
      { type: "infernal", count: 6, interval: 1300, delay: 22500 }, // Fire
      { type: "assassin", count: 5, interval: 1200, delay: 28000 }, // Killers
    ],
    // Wave 14: LAVA FINALE
    [
      { type: "necromancer", count: 5, interval: 1600 }, // Death lords
      { type: "trustee", count: 2, interval: 3500, delay: 5000 }, // Ancient power
      { type: "dean", count: 3, interval: 2600, delay: 10500 }, // Council
      { type: "golem", count: 3, interval: 3000, delay: 16500 }, // Stone titans
      { type: "dragon", count: 2, interval: 3500, delay: 23000 }, // DRAGONS!
      { type: "infernal", count: 8, interval: 1100, delay: 29000 }, // Fire finale
    ],
  ],

  crater: [
    // 16 waves - Caldera challenge
    // Wave 1: Caldera scouts
    [
      { type: "gradstudent", count: 6, interval: 1000 }, // Tanks
      { type: "hexer", count: 5, interval: 1050, delay: 4000 }, // Curses
      { type: "crossbowman", count: 4, interval: 1300, delay: 8000 }, // Ranged
      { type: "infernal", count: 3, interval: 1700, delay: 12000 }, // Fire
      { type: "assassin", count: 3, interval: 1400, delay: 16000 }, // Killers
    ],
    // Wave 2: Shadow vanguard
    [
      { type: "shadow_knight", count: 4, interval: 2200 }, // Dark knights
      { type: "professor", count: 3, interval: 2600, delay: 5500 }, // Masters
      { type: "archer", count: 8, interval: 850, delay: 10500 }, // Arrow storm
      { type: "infernal", count: 4, interval: 1500, delay: 16000 }, // Fire
      { type: "juggernaut", count: 2, interval: 2400, delay: 20500 }, // Heavy
    ],
    // Wave 3: Dean's fire command
    [
      { type: "dean", count: 2, interval: 3600 }, // Leaders
      { type: "mage", count: 6, interval: 1100, delay: 5000 }, // Magic
      { type: "specter", count: 6, interval: 1000, delay: 10000 }, // Ghosts
      { type: "infernal", count: 4, interval: 1500, delay: 15000 }, // Fire
      { type: "assassin", count: 4, interval: 1300, delay: 19500 }, // Killers
    ],
    // Wave 4: Harpy swarm
    [
      { type: "catapult", count: 4, interval: 2000 }, // Siege
      { type: "gradstudent", count: 8, interval: 900, delay: 5000 }, // Tanks
      { type: "harpy", count: 6, interval: 1000, delay: 10000 }, // Flying
      { type: "infernal", count: 5, interval: 1400, delay: 15000 }, // Fire
      { type: "berserker", count: 5, interval: 1050, delay: 19500 }, // Rage
    ],
    // Wave 5: Speed inferno
    [
      { type: "mascot", count: 12, interval: 700 }, // Speed flood
      { type: "professor", count: 4, interval: 2200, delay: 5500 }, // Masters
      { type: "mage", count: 6, interval: 1100, delay: 11000 }, // Magic
      { type: "infernal", count: 5, interval: 1400, delay: 16500 }, // Fire
      { type: "juggernaut", count: 3, interval: 2200, delay: 21500 }, // Heavy
    ],
    // Wave 6: Wyvern eruption
    [
      { type: "dean", count: 2, interval: 3500 }, // Leaders
      { type: "archer", count: 10, interval: 800, delay: 5000 }, // Arrow storm
      { type: "wyvern", count: 5, interval: 1500, delay: 10500 }, // Flying
      { type: "infernal", count: 5, interval: 1400, delay: 16000 }, // Fire
      { type: "assassin", count: 5, interval: 1200, delay: 21000 }, // Killers
    ],
    // Wave 7: Triple threat
    [
      { type: "professor", count: 5, interval: 2000 }, // Masters
      { type: "catapult", count: 4, interval: 2000, delay: 6000 }, // Siege
      { type: "shadow_knight", count: 5, interval: 2000, delay: 12000 }, // Knights
      { type: "infernal", count: 5, interval: 1400, delay: 18000 }, // Fire
      { type: "dragon", count: 1, interval: 4500, delay: 24000 }, // DRAGON!
    ],
    // Wave 8: First trustee
    [
      { type: "trustee", count: 1, interval: 4500 }, // Ancient power
      { type: "dean", count: 3, interval: 2600, delay: 5000 }, // Council
      { type: "necromancer", count: 4, interval: 1800, delay: 11000 }, // Death
      { type: "infernal", count: 5, interval: 1400, delay: 17000 }, // Fire
      { type: "juggernaut", count: 3, interval: 2200, delay: 22000 }, // Heavy
    ],
    // Wave 9: Magic eruption
    [
      { type: "mage", count: 10, interval: 800 }, // Magic flood
      { type: "mascot", count: 10, interval: 700, delay: 5000 }, // Speed
      { type: "berserker", count: 8, interval: 900, delay: 10000 }, // Rage
      { type: "infernal", count: 6, interval: 1300, delay: 16000 }, // Fire swarm
      { type: "banshee", count: 4, interval: 1400, delay: 21500 }, // Screaming
    ],
    // Wave 10: Dean council
    [
      { type: "dean", count: 4, interval: 2400 }, // Council
      { type: "professor", count: 5, interval: 2000, delay: 6000 }, // Masters
      { type: "wyvern", count: 6, interval: 1200, delay: 12000 }, // Flying
      { type: "infernal", count: 6, interval: 1300, delay: 18000 }, // Fire
      { type: "dragon", count: 1, interval: 4500, delay: 24000 }, // Dragon!
    ],
    // Wave 11: Double trustee
    [
      { type: "trustee", count: 2, interval: 3800 }, // Ancient powers
      { type: "catapult", count: 5, interval: 1800, delay: 5500 }, // Siege
      { type: "shadow_knight", count: 5, interval: 2000, delay: 11500 }, // Knights
      { type: "infernal", count: 6, interval: 1300, delay: 17500 }, // Fire
      { type: "juggernaut", count: 4, interval: 2000, delay: 23500 }, // Heavy
    ],
    // Wave 12: Necromancer coven
    [
      { type: "trustee", count: 2, interval: 3600 }, // Ancient
      { type: "mage", count: 8, interval: 900, delay: 5500 }, // Magic
      { type: "necromancer", count: 5, interval: 1600, delay: 11500 }, // Death
      { type: "infernal", count: 6, interval: 1300, delay: 17500 }, // Fire
      { type: "banshee", count: 5, interval: 1300, delay: 23000 }, // Screaming
    ],
    // Wave 13: Arrow apocalypse
    [
      { type: "dean", count: 5, interval: 2200 }, // Council
      { type: "archer", count: 12, interval: 750, delay: 6500 }, // Arrow storm
      { type: "necromancer", count: 5, interval: 1600, delay: 13000 }, // Death
      { type: "infernal", count: 6, interval: 1300, delay: 19000 }, // Fire
      { type: "dragon", count: 1, interval: 4500, delay: 25000 }, // Dragon!
    ],
    // Wave 14: Golem awakening
    [
      { type: "trustee", count: 2, interval: 3500 }, // Ancient
      { type: "dean", count: 4, interval: 2400, delay: 5500 }, // Council
      { type: "golem", count: 2, interval: 3500, delay: 11500 }, // Titans
      { type: "infernal", count: 6, interval: 1300, delay: 17500 }, // Fire
      { type: "juggernaut", count: 4, interval: 2000, delay: 23000 }, // Heavy
    ],
    // Wave 15: Professor army
    [
      { type: "trustee", count: 3, interval: 3200 }, // Triple power
      { type: "professor", count: 6, interval: 1800, delay: 6000 }, // Coven
      { type: "necromancer", count: 6, interval: 1500, delay: 12500 }, // Death
      { type: "infernal", count: 6, interval: 1300, delay: 18500 }, // Fire
      { type: "dragon", count: 2, interval: 3500, delay: 24500 }, // Dragons!
    ],
    // Wave 16: CALDERA FINALE
    [
      { type: "trustee", count: 4, interval: 2800 }, // Quad power
      { type: "catapult", count: 6, interval: 1600, delay: 7000 }, // Siege army
      { type: "shadow_knight", count: 6, interval: 1600, delay: 14000 }, // Dark army
      { type: "golem", count: 4, interval: 2800, delay: 21000 }, // Titan quartet
      { type: "dragon", count: 2, interval: 3500, delay: 28000 }, // DRAGONS!
      { type: "infernal", count: 8, interval: 1100, delay: 34000 }, // Fire finale
    ],
  ],

  throne: [
    // The ultimate challenge - 20 waves of doom
    // Wave 1: Throne vanguard
    [
      { type: "professor", count: 5, interval: 1800 }, // Master vanguard
      { type: "shadow_knight", count: 6, interval: 1500, delay: 5500 }, // Dark knights
      { type: "infernal", count: 4, interval: 1500, delay: 11000 }, // Fire demons
      { type: "golem", count: 1, interval: 4500, delay: 16500 }, // Titan
      { type: "assassin", count: 4, interval: 1300, delay: 21000 }, // Killers
    ],
    // Wave 2: Dean's legion
    [
      { type: "dean", count: 2, interval: 3600 }, // Dark leaders
      { type: "gradstudent", count: 8, interval: 850, delay: 5000 }, // Tanks
      { type: "shadow_knight", count: 5, interval: 1800, delay: 10500 }, // Knights
      { type: "infernal", count: 4, interval: 1500, delay: 16000 }, // Fire
      { type: "juggernaut", count: 3, interval: 2200, delay: 21000 }, // Heavy
    ],
    // Wave 3: Magic apocalypse
    [
      { type: "mage", count: 10, interval: 800 }, // Magic flood
      { type: "archer", count: 12, interval: 750, delay: 5000 }, // Arrow storm
      { type: "berserker", count: 8, interval: 900, delay: 11000 }, // Rage
      { type: "infernal", count: 5, interval: 1400, delay: 17000 }, // Fire
      { type: "banshee", count: 4, interval: 1400, delay: 22000 }, // Screaming
    ],
    // Wave 4: Siege titans
    [
      { type: "catapult", count: 4, interval: 2200 }, // Siege engines
      { type: "professor", count: 4, interval: 2200, delay: 5500 }, // Masters
      { type: "golem", count: 2, interval: 3500, delay: 11000 }, // Titans
      { type: "infernal", count: 5, interval: 1400, delay: 17000 }, // Fire
      { type: "dragon", count: 1, interval: 4500, delay: 23000 }, // DRAGON!
    ],
    // Wave 5: First trustee
    [
      { type: "trustee", count: 1, interval: 4500 }, // Ancient power
      { type: "dean", count: 3, interval: 2600, delay: 5000 }, // Council
      { type: "shadow_knight", count: 6, interval: 1500, delay: 11000 }, // Dark army
      { type: "infernal", count: 5, interval: 1400, delay: 17000 }, // Fire
      { type: "juggernaut", count: 3, interval: 2200, delay: 22000 }, // Heavy
    ],
    // Wave 6: Speed inferno
    [
      { type: "mascot", count: 12, interval: 700 }, // Speed flood
      { type: "mage", count: 8, interval: 900, delay: 5500 }, // Magic
      { type: "golem", count: 2, interval: 3500, delay: 11000 }, // Titans
      { type: "shadow_knight", count: 5, interval: 1800, delay: 17000 }, // Knights
      { type: "infernal", count: 6, interval: 1300, delay: 23000 }, // Fire swarm
      { type: "assassin", count: 5, interval: 1200, delay: 28500 }, // Killers
    ],
    // Wave 7: Dean council
    [
      { type: "dean", count: 4, interval: 2400 }, // Council
      { type: "catapult", count: 5, interval: 1800, delay: 6000 }, // Siege
      { type: "hexer", count: 10, interval: 850, delay: 12000 }, // Curse flood
      { type: "infernal", count: 5, interval: 1400, delay: 18500 }, // Fire
      { type: "dragon", count: 1, interval: 4500, delay: 24000 }, // Dragon!
    ],
    // Wave 8: Professor army
    [
      { type: "professor", count: 6, interval: 1800 }, // Master coven
      { type: "archer", count: 12, interval: 750, delay: 6500 }, // Arrow storm
      { type: "necromancer", count: 5, interval: 1600, delay: 13000 }, // Death
      { type: "infernal", count: 5, interval: 1400, delay: 19000 }, // Fire
      { type: "banshee", count: 5, interval: 1300, delay: 24500 }, // Screaming
    ],
    // Wave 9: Double trustee
    [
      { type: "trustee", count: 2, interval: 3800 }, // Ancient powers
      { type: "dean", count: 3, interval: 2600, delay: 5500 }, // Council
      { type: "hexer", count: 10, interval: 850, delay: 11500 }, // Curse flood
      { type: "infernal", count: 5, interval: 1400, delay: 18000 }, // Fire
      { type: "juggernaut", count: 4, interval: 2000, delay: 24000 }, // Heavy
    ],
    // Wave 10: Golem legion
    [
      { type: "mage", count: 10, interval: 800 }, // Magic flood
      { type: "catapult", count: 5, interval: 1800, delay: 5500 }, // Siege
      { type: "golem", count: 3, interval: 3000, delay: 11500 }, // Titan trio
      { type: "necromancer", count: 5, interval: 1600, delay: 18000 }, // Death
      { type: "infernal", count: 6, interval: 1300, delay: 24000 }, // Fire
      { type: "dragon", count: 1, interval: 4500, delay: 30000 }, // Dragon!
    ],
    // Wave 11: Supreme council
    [
      { type: "dean", count: 5, interval: 2200 }, // Council
      { type: "professor", count: 5, interval: 2000, delay: 7000 }, // Masters
      { type: "shadow_knight", count: 8, interval: 1100, delay: 14000 }, // Dark army
      { type: "golem", count: 2, interval: 3500, delay: 21000 }, // Titans
      { type: "infernal", count: 6, interval: 1300, delay: 27000 }, // Fire
    ],
    // Wave 12: Shadow apocalypse
    [
      { type: "trustee", count: 2, interval: 3600 }, // Ancient powers
      { type: "mascot", count: 12, interval: 700, delay: 5500 }, // Speed flood
      { type: "hexer", count: 10, interval: 850, delay: 11500 }, // Curse flood
      { type: "shadow_knight", count: 6, interval: 1500, delay: 18000 }, // Dark army
      { type: "infernal", count: 6, interval: 1300, delay: 24000 }, // Fire
      { type: "assassin", count: 5, interval: 1200, delay: 30000 }, // Killers
    ],
    // Wave 13: Siege apocalypse
    [
      { type: "catapult", count: 6, interval: 1600 }, // Siege army
      { type: "mage", count: 10, interval: 800, delay: 6000 }, // Magic flood
      { type: "golem", count: 3, interval: 3000, delay: 12000 }, // Titan trio
      { type: "hexer", count: 10, interval: 850, delay: 19000 }, // Curse flood
      { type: "infernal", count: 6, interval: 1300, delay: 25500 }, // Fire
      { type: "dragon", count: 2, interval: 3500, delay: 31500 }, // Dragons!
    ],
    // Wave 14: Triple trustee
    [
      { type: "trustee", count: 3, interval: 3200 }, // Triple ancient
      { type: "archer", count: 12, interval: 750, delay: 6000 }, // Arrow storm
      { type: "specter", count: 10, interval: 900, delay: 13000 }, // Ghost flood
      { type: "infernal", count: 6, interval: 1300, delay: 19500 }, // Fire
      { type: "juggernaut", count: 4, interval: 2000, delay: 25500 }, // Heavy
    ],
    // Wave 15: Dean horde
    [
      { type: "dean", count: 5, interval: 2200 }, // Council
      { type: "catapult", count: 6, interval: 1600, delay: 7000 }, // Siege
      { type: "berserker", count: 12, interval: 750, delay: 14000 }, // Rage flood
      { type: "infernal", count: 6, interval: 1300, delay: 20500 }, // Fire
      { type: "dragon", count: 1, interval: 4500, delay: 27000 }, // Dragon!
    ],
    // Wave 16: Necromancer ritual
    [
      { type: "trustee", count: 3, interval: 3000 }, // Triple ancient
      { type: "professor", count: 8, interval: 1400, delay: 6000 }, // Master army
      { type: "necromancer", count: 6, interval: 1500, delay: 13000 }, // Death lords
      { type: "infernal", count: 6, interval: 1300, delay: 19500 }, // Fire
      { type: "banshee", count: 6, interval: 1200, delay: 25500 }, // Screaming
    ],
    // Wave 17: Ghost apocalypse
    [
      { type: "mage", count: 12, interval: 750 }, // Magic flood
      { type: "mascot", count: 12, interval: 700, delay: 5500 }, // Speed flood
      { type: "specter", count: 12, interval: 800, delay: 11500 }, // Ghost flood
      { type: "necromancer", count: 8, interval: 1200, delay: 18500 }, // Death army
      { type: "infernal", count: 6, interval: 1300, delay: 25500 }, // Fire
      { type: "dragon", count: 2, interval: 3500, delay: 31500 }, // Dragons!
    ],
    // Wave 18: Golem army
    [
      { type: "trustee", count: 4, interval: 2800 }, // Quad power
      { type: "dean", count: 5, interval: 2200, delay: 7000 }, // Council
      { type: "golem", count: 4, interval: 2800, delay: 14000 }, // Titan quartet
      { type: "infernal", count: 8, interval: 1100, delay: 21000 }, // Fire swarm
      { type: "juggernaut", count: 5, interval: 1800, delay: 28000 }, // Heavy squad
    ],
    // Wave 19: Siege finale
    [
      { type: "catapult", count: 8, interval: 1200 }, // Siege storm
      { type: "trustee", count: 3, interval: 3000, delay: 6000 }, // Triple ancient
      { type: "specter", count: 10, interval: 900, delay: 13000 }, // Ghost flood
      { type: "infernal", count: 8, interval: 1100, delay: 19500 }, // Fire swarm
      { type: "dragon", count: 2, interval: 3500, delay: 26500 }, // Dragons!
    ],
    // Wave 20: THE ULTIMATE THRONE FINALE
    [
      { type: "trustee", count: 5, interval: 2500 }, // Ultimate power
      { type: "dean", count: 6, interval: 2000, delay: 7500 }, // Supreme council
      { type: "professor", count: 8, interval: 1400, delay: 15000 }, // Master army
      { type: "wyvern", count: 10, interval: 1000, delay: 22500 }, // Dragon swarm
      { type: "golem", count: 6, interval: 2400, delay: 30000 }, // Titan legion
      { type: "dragon", count: 3, interval: 3000, delay: 38000 }, // TRIPLE DRAGONS!
      { type: "infernal", count: 10, interval: 1000, delay: 45000 }, // Fire apocalypse
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
export const WAVE_TIMER_BASE = 15000;
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
