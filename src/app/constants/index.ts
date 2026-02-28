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
// Categories: academic, campus, ranged, flying, boss, nature, swarm
export const ENEMY_DATA: Record<EnemyType, EnemyData> = {
  // =============================================================================
  // ACADEMIC ENEMIES - Academic progression and milestones
  // =============================================================================
  frosh: {
    name: "Writing Sem",
    hp: 185,
    speed: 0.38,
    bounty: 12,
    armor: 0,
    flying: false,
    troopDamage: 15,
    desc: "The first hurdle. Persistence is key.",
    color: "#4ade80",
    size: 20,
    category: "academic",
    traits: [],
  },
  sophomore: {
    name: "Sophomore Slump",
    hp: 345,
    speed: 0.32,
    bounty: 18,
    armor: 0.1,
    flying: false,
    troopDamage: 32,
    desc: "Heavy and demotivating. Harder to push through.",
    color: "#60a5fa",
    size: 22,
    category: "academic",
    traits: ["armored"],
    abilities: [
      {
        type: "slow",
        name: "Demotivation",
        desc: "Slows troops with crushing despair",
        chance: 0.15,
        duration: 2000,
        intensity: 0.2,
      },
    ],
  },
  junior: {
    name: "Junior Paper",
    hp: 630,
    speed: 0.3,
    bounty: 30,
    armor: 0.2,
    flying: false,
    troopDamage: 48,
    desc: "A significant research obstacle. Requires focus.",
    color: "#c084fc",
    size: 24,
    category: "academic",
    traits: ["armored"],
    abilities: [
      {
        type: "tower_weaken",
        name: "Brain Fog",
        desc: "Clouds the minds of nearby towers, reducing damage",
        chance: 1.0,
        duration: 3000,
        intensity: 0.15,
        radius: 100,
      },
    ],
  },
  senior: {
    name: "Senior Thesis",
    hp: 1050,
    speed: 0.24,
    bounty: 50,
    armor: 0.3,
    flying: false,
    troopDamage: 65,
    desc: "The ultimate academic titan. Slow but massive.",
    color: "#f472b6",
    size: 28,
    category: "academic",
    traits: ["armored", "boss"],
    isBoss: true,
    liveCost: 3,
    abilities: [
      {
        type: "stun",
        name: "Thesis Defense",
        desc: "Stuns defenders with overwhelming knowledge",
        chance: 0.2,
        duration: 1500,
      },
    ],
  },
  gradstudent: {
    name: "Grad School App",
    hp: 1540,
    speed: 0.2,
    bounty: 75,
    armor: 0.3,
    flying: false,
    troopDamage: 85,
    desc: "An exhausting, soul-crushing process.",
    color: "#fb923c",
    size: 30,
    category: "academic",
    traits: ["armored", "boss"],
    isBoss: true,
    liveCost: 4,
    abilities: [
      {
        type: "poison",
        name: "Soul Drain",
        desc: "Inflicts existential dread, dealing damage over time",
        chance: 0.25,
        duration: 4000,
        intensity: 12,
      },
    ],
  },
  professor: {
    name: "Tenured Professor",
    hp: 2420,
    speed: 0.16,
    bounty: 100,
    armor: 0.4,
    flying: false,
    troopDamage: 110,
    desc: "Immutable and deeply entrenched.",
    color: "#ef4444",
    size: 32,
    category: "academic",
    traits: ["armored", "boss", "tower_debuffer"],
    isBoss: true,
    liveCost: 5,
    abilities: [
      {
        type: "tower_slow",
        name: "Bureaucracy",
        desc: "Slows tower attack speed with red tape",
        chance: 1.0,
        duration: 4000,
        intensity: 0.35,
        radius: 120,
      },
      {
        type: "stun",
        name: "Pop Quiz",
        desc: "Surprises and stuns defenders",
        chance: 0.2,
        duration: 1200,
      },
    ],
  },
  dean: {
    name: "Dean of College",
    hp: 3850,
    speed: 0.15,
    bounty: 150,
    armor: 0.45,
    flying: false,
    troopDamage: 140,
    desc: "A massive administrative wall.",
    color: "#a855f7",
    size: 36,
    category: "academic",
    traits: ["armored", "boss", "tower_debuffer"],
    isBoss: true,
    liveCost: 6,
    abilities: [
      {
        type: "tower_disable",
        name: "Administrative Hold",
        desc: "Completely disables a tower temporarily",
        chance: 0.15,
        duration: 3500,
        radius: 100,
        cooldown: 8000,
      },
      {
        type: "slow",
        name: "Paperwork",
        desc: "Buries defenders in forms, slowing them",
        chance: 0.25,
        duration: 3500,
        intensity: 0.45,
      },
    ],
  },
  trustee: {
    name: "Board of Trustees",
    hp: 8250,
    speed: 0.12,
    bounty: 300,
    armor: 0.55,
    flying: false,
    troopDamage: 180,
    desc: "The final authority. Practically immovable.",
    color: "#eab308",
    size: 42,
    category: "boss",
    traits: ["armored", "boss", "tower_debuffer", "aoe_attack"],
    isBoss: true,
    aoeRadius: 90,
    aoeDamage: 110,
    liveCost: 10,
    abilities: [
      {
        type: "tower_weaken",
        name: "Budget Cuts",
        desc: "Slashes tower effectiveness across the board",
        chance: 1.0,
        duration: 5000,
        intensity: 0.3,
        radius: 150,
      },
      {
        type: "burn",
        name: "Fiery Decree",
        desc: "Issues burning mandates that damage over time",
        chance: 0.25,
        duration: 4500,
        intensity: 20,
      },
    ],
  },
  // =============================================================================
  // FLYING ENEMIES
  // =============================================================================
  mascot: {
    name: "Rival Mascot",
    hp: 520,
    speed: 0.53,
    bounty: 60,
    armor: 0,
    flying: true,
    desc: "Flying distraction from other schools. Zooms past without stopping.",
    color: "#22d3d3",
    size: 26,
    category: "flying",
    traits: ["flying", "fast", "breakthrough"],
  },
  // =============================================================================
  // RANGED ENEMIES
  // =============================================================================
  archer: {
    name: "P-Rade Marshall",
    hp: 290,
    speed: 0.3,
    bounty: 25,
    armor: 0.1,
    flying: false,
    isRanged: true,
    range: 220,
    attackSpeed: 2200,
    projectileDamage: 45,
    desc: "Directs traffic and shoots order-enforcing arrows.",
    color: "#10b981",
    size: 22,
    category: "ranged",
    traits: ["ranged"],
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
    projectileDamage: 80,
    desc: "Throws volatile organic chemistry flasks.",
    color: "#8b5cf6",
    size: 24,
    category: "ranged",
    traits: ["ranged", "magic_resist"],
    abilities: [
      {
        type: "burn",
        name: "Chemical Burn",
        desc: "Volatile chemicals cause burning damage",
        chance: 0.3,
        duration: 3000,
        intensity: 12,
      },
    ],
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
    projectileDamage: 175,
    desc: "Heavy burdens launched from a distance.",
    color: "#854d0e",
    size: 34,
    category: "ranged",
    traits: ["ranged", "armored", "aoe_attack"],
    aoeRadius: 70,
    aoeDamage: 150,
    liveCost: 2,
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
    projectileDamage: 100,
    desc: "Promises high salaries while draining your spirit.",
    color: "#4c1d95",
    size: 28,
    category: "ranged",
    traits: ["ranged", "tower_debuffer"],
    abilities: [
      {
        type: "tower_blind",
        name: "False Promises",
        desc: "Distracts towers, reducing their range",
        chance: 1.0,
        duration: 4000,
        intensity: 0.2,
        radius: 100,
      },
      {
        type: "poison",
        name: "Soul Siphon",
        desc: "Drains the life force of defenders",
        chance: 0.15,
        duration: 3000,
        intensity: 10,
      },
    ],
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
    projectileDamage: 95,
    desc: "Armored patrol with high-impact bolts.",
    color: "#78350f",
    size: 24,
    category: "ranged",
    traits: ["ranged", "armored"],
    abilities: [
      {
        type: "stun",
        name: "Heavy Bolt",
        desc: "Powerful bolts stun targets on impact",
        chance: 1.0,
        duration: 800,
      },
    ],
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
    projectileDamage: 60,
    desc: "Hypnotic movements that curse your defenders.",
    color: "#be185d",
    size: 22,
    category: "ranged",
    traits: ["ranged"],
    abilities: [
      {
        type: "slow",
        name: "Hypnotic Dance",
        desc: "Mesmerizing movements slow all nearby defenders",
        chance: 1.0,
        duration: 2500,
        intensity: 0.35,
        radius: 80,
      },
    ],
  },
  // =============================================================================
  // FLYING ENEMIES (Continued)
  // =============================================================================
  harpy: {
    name: "Late Meal Rush",
    hp: 380,
    speed: 0.6,
    bounty: 45,
    armor: 0.05,
    flying: true,
    desc: "Swift and chaotic flying hunger. Too fast to engage defenders.",
    color: "#7c3aed",
    size: 24,
    category: "flying",
    traits: ["flying", "fast", "breakthrough"],
    abilities: [
      {
        type: "slow",
        name: "Screech",
        desc: "Piercing cries disorient defenders",
        chance: 1.0,
        duration: 1500,
        intensity: 0.3,
      },
    ],
  },
  wyvern: {
    name: "Tiger Transit Wyvern",
    hp: 1200,
    speed: 0.36,
    bounty: 110,
    armor: 0.3,
    flying: true,
    desc: "A massive flying dragon that swoops down to attack defenders.",
    color: "#059669",
    size: 36,
    category: "flying",
    traits: ["flying", "boss", "aoe_attack"],
    isBoss: true,
    aoeRadius: 70,
    aoeDamage: 95,
    targetsTroops: true,
    troopDamage: 70,
    troopAttackSpeed: 1800,
    liveCost: 3,
    abilities: [
      {
        type: "burn",
        name: "Fire Breath",
        desc: "Breathes fire that burns all in its path",
        chance: 0.3,
        duration: 3500,
        intensity: 18,
        radius: 80,
      },
    ],
  },
  specter: {
    name: "Firestone Ghost",
    hp: 700,
    speed: 0.4,
    bounty: 80,
    armor: 0.6,
    flying: true,
    desc: "Faded spirit of an alum. Drains life from defenders.",
    color: "#94a3b8",
    size: 26,
    category: "flying",
    traits: ["flying", "magic_resist", "armored"],
    targetsTroops: true,
    troopDamage: 48,
    troopAttackSpeed: 2000,
    liveCost: 2,
    abilities: [
      {
        type: "tower_slow",
        name: "Haunting Presence",
        desc: "Chilling aura slows nearby tower mechanisms",
        chance: 1.0,
        duration: 3000,
        intensity: 0.25,
        radius: 90,
      },
    ],
  },
  // =============================================================================
  // CAMPUS ENEMIES - Campus life and events
  // =============================================================================
  berserker: {
    name: "Cane Spree Athlete",
    hp: 850,
    speed: 0.5,
    bounty: 65,
    armor: 0,
    flying: false,
    troopDamage: 72,
    desc: "High energy ground unit charging forward.",
    color: "#dc2626",
    size: 26,
    category: "campus",
    traits: ["fast"],
    liveCost: 2,
    abilities: [
      {
        type: "stun",
        name: "Tackle",
        desc: "Powerful charges stun defenders on impact",
        chance: 0.25,
        duration: 1200,
      },
    ],
  },
  necromancer: {
    name: "Admissions Officer",
    hp: 900,
    speed: 0.18,
    bounty: 100,
    armor: 0.2,
    flying: false,
    troopDamage: 88,
    desc: "Raises 'rejected' spirits to haunt the path.",
    color: "#1e1b4b",
    size: 30,
    category: "campus",
    traits: ["summoner", "magic_resist"],
    liveCost: 2,
    abilities: [
      {
        type: "poison",
        name: "Rejection Letter",
        desc: "Crushing disappointment deals damage over time",
        chance: 0.3,
        duration: 4500,
        intensity: 15,
      },
    ],
  },
  // =============================================================================
  // BOSS ENEMIES - Major threats
  // =============================================================================
  golem: {
    name: "Nassau Lion",
    hp: 14500,
    speed: 0.09,
    bounty: 450,
    armor: 0.65,
    flying: false,
    troopDamage: 160,
    desc: "The stone guardian itself. Near-infinite HP.",
    color: "#57534e",
    size: 44,
    category: "boss",
    traits: ["armored", "boss", "aoe_attack", "tower_debuffer"],
    isBoss: true,
    aoeRadius: 110,
    aoeDamage: 180,
    liveCost: 10,
    abilities: [
      {
        type: "tower_disable",
        name: "Stone Gaze",
        desc: "Petrifying stare disables towers completely",
        chance: 0.15,
        duration: 4500,
        radius: 130,
        cooldown: 10000,
      },
      {
        type: "stun",
        name: "Ground Pound",
        desc: "Massive tremors stun all nearby defenders",
        chance: 0.25,
        duration: 2500,
        radius: 110,
      },
    ],
  },
  shadow_knight: {
    name: "Alumni Donor",
    hp: 1800,
    speed: 0.22,
    bounty: 120,
    armor: 0.5,
    flying: false,
    troopDamage: 115,
    desc: "A powerful figure backed by immense resources.",
    color: "#18181b",
    size: 32,
    category: "boss",
    traits: ["armored", "boss"],
    isBoss: true,
    liveCost: 3,
    abilities: [
      {
        type: "tower_weaken",
        name: "Endowment Pressure",
        desc: "Financial influence weakens tower effectiveness",
        chance: 1.0,
        duration: 4500,
        intensity: 0.35,
        radius: 110,
      },
      {
        type: "burn",
        name: "Dark Flame",
        desc: "Shadowy fire burns defenders",
        chance: 0.2,
        duration: 3500,
        intensity: 18,
      },
    ],
  },
  // =============================================================================
  // CAMPUS ENEMIES (Continued) - Campus life and events
  // =============================================================================
  cultist: {
    name: "Finals Week Cultist",
    hp: 320,
    speed: 0.4,
    bounty: 22,
    armor: 0.05,
    flying: false,
    troopDamage: 27,
    desc: "Sleep-deprived zealots chanting forbidden study rituals.",
    color: "#7c2d12",
    size: 21,
    category: "campus",
    traits: [],
    abilities: [
      {
        type: "slow",
        name: "Sleep Deprivation Aura",
        desc: "Exhaustion slows nearby defenders",
        chance: 0.15,
        duration: 2000,
        intensity: 0.2,
        radius: 60,
      },
    ],
  },
  plaguebearer: {
    name: "Flu Season Carrier",
    hp: 520,
    speed: 0.25,
    bounty: 40,
    armor: 0.15,
    flying: false,
    troopDamage: 58,
    desc: "Spreads infectious misery wherever it walks. Keep your distance.",
    color: "#65a30d",
    size: 25,
    category: "campus",
    traits: ["aoe_attack"],
    liveCost: 2,
    abilities: [
      {
        type: "poison",
        name: "Contagion",
        desc: "Spreads sickness to nearby defenders",
        chance: 0.35,
        duration: 5500,
        intensity: 10,
        radius: 80,
      },
      {
        type: "slow",
        name: "Fever",
        desc: "Weakens defenders with illness",
        chance: 0.25,
        duration: 3500,
        intensity: 0.3,
      },
    ],
  },
  frostling: {
    name: "Winter Break Ghost",
    hp: 350,
    speed: 0.45,
    bounty: 35,
    armor: 0.1,
    flying: false,
    desc: "The lingering chill of empty campus that phases through defenses.",
    color: "#7dd3fc",
    size: 22,
    category: "campus",
    traits: ["fast", "breakthrough"],
    breakthrough: true,
    abilities: [
      {
        type: "slow",
        name: "Frost Touch",
        desc: "Chilling attacks slow defenders",
        chance: 1.0,
        duration: 2000,
        intensity: 0.35,
      },
    ],
  },
  infernal: {
    name: "Burnout Demon",
    hp: 1100,
    speed: 0.28,
    bounty: 85,
    armor: 0.25,
    flying: false,
    troopDamage: 95,
    desc: "Forged from the flames of overwork and impossible deadlines.",
    color: "#dc2626",
    size: 30,
    category: "campus",
    traits: ["aoe_attack"],
    liveCost: 2,
    abilities: [
      {
        type: "burn",
        name: "Burnout Flames",
        desc: "Spreads the fire of overwork to all nearby",
        chance: 0.35,
        duration: 4000,
        intensity: 25,
        radius: 85,
      },
      {
        type: "tower_weaken",
        name: "Exhaustion Aura",
        desc: "Nearby towers work less effectively",
        chance: 1.0,
        duration: 3500,
        intensity: 0.25,
        radius: 100,
      },
    ],
  },
  assassin: {
    name: "Curve Wrecker",
    hp: 320,
    speed: 0.7,
    bounty: 45,
    armor: 0,
    flying: false,
    troopDamage: 36,
    desc: "Lightning fast, sprints past defenders without stopping.",
    color: "#1e1b4b",
    size: 20,
    category: "swarm",
    traits: ["fast", "breakthrough"],
    breakthrough: true,
    liveCost: 2,
    abilities: [
      {
        type: "poison",
        name: "Toxic Excellence",
        desc: "Poison of academic overachievement",
        chance: 0.4,
        duration: 3000,
        intensity: 15,
      },
    ],
  },
  // =============================================================================
  // NATURE ENEMIES - Environmental/biome creatures
  // =============================================================================
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
    category: "nature",
    traits: ["armored", "regenerating"],
    abilities: [
      {
        type: "poison",
        name: "Thorn Poison",
        desc: "Venomous thorns inflict poison on contact",
        chance: 0.35,
        duration: 4000,
        intensity: 10,
      },
    ],
  },
  // =============================================================================
  // BOSS ENEMIES (Continued) - Major threats
  // =============================================================================
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
    category: "boss",
    traits: ["armored", "boss", "aoe_attack"],
    isBoss: true,
    aoeRadius: 100,
    aoeDamage: 135,
    liveCost: 4,
    abilities: [
      {
        type: "stun",
        name: "Emergence",
        desc: "Bursting from the ground stuns all nearby",
        chance: 0.25,
        duration: 1800,
        radius: 110,
      },
    ],
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
    category: "boss",
    traits: ["armored", "boss", "aoe_attack", "tower_debuffer"],
    isBoss: true,
    aoeRadius: 95,
    aoeDamage: 150,
    liveCost: 6,
    abilities: [
      {
        type: "tower_disable",
        name: "Tenure Review",
        desc: "Intimidating presence completely shuts down towers",
        chance: 0.15,
        duration: 4000,
        radius: 110,
        cooldown: 12000,
      },
      {
        type: "stun",
        name: "Authority Slam",
        desc: "Overwhelming force stuns all defenders",
        chance: 0.25,
        duration: 2000,
        radius: 100,
      },
    ],
  },
  // =============================================================================
  // FLYING ENEMIES (Continued) - Aerial threats
  // =============================================================================
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
    category: "flying",
    traits: ["flying", "fast", "magic_resist"],
    targetsTroops: true,
    troopDamage: 55,
    troopAttackSpeed: 1500,
    liveCost: 2,
    abilities: [
      {
        type: "stun",
        name: "Wail of Despair",
        desc: "Piercing scream stuns all nearby defenders",
        chance: 0.25,
        duration: 1000,
        radius: 70,
      },
      {
        type: "tower_slow",
        name: "Haunting Cry",
        desc: "Mournful cries disrupt tower targeting",
        chance: 1.0,
        duration: 2500,
        intensity: 0.3,
        radius: 80,
      },
    ],
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
    category: "boss",
    traits: ["flying", "boss", "aoe_attack", "tower_debuffer"],
    isBoss: true,
    aoeRadius: 120,
    aoeDamage: 220,
    targetsTroops: true,
    troopDamage: 120,
    troopAttackSpeed: 2200,
    liveCost: 10,
    abilities: [
      {
        type: "burn",
        name: "Legacy Flame",
        desc: "Ancient fire that burns through generations",
        chance: 0.35,
        duration: 5000,
        intensity: 25,
        radius: 100,
      },
      {
        type: "tower_disable",
        name: "Endowment Freeze",
        desc: "Withdraws support, disabling towers completely",
        chance: 0.15,
        duration: 4000,
        radius: 150,
        cooldown: 15000,
      },
      {
        type: "stun",
        name: "Roar of Ages",
        desc: "Deafening roar stuns all in the vicinity",
        chance: 0.2,
        duration: 2500,
        radius: 120,
      },
    ],
  },
  // =============================================================================
  // SWARM ENEMIES - Fast, weak, numerous
  // =============================================================================
  freshman: {
    name: "Eager Freshman",
    hp: 120,
    speed: 0.4,
    bounty: 8,
    armor: 0,
    flying: false,
    desc: "Wide-eyed newcomer rushing to their first class.",
    color: "#84cc16",
    size: 18,
    category: "swarm",
    traits: ["fast"],
  },
  athlete: {
    name: "Varsity Runner",
    hp: 210,
    speed: 0.58,
    bounty: 10,
    armor: 0,
    flying: false,
    troopDamage: 10,
    desc: "Fast and agile, sprinting past troops without stopping.",
    color: "#f97316",
    size: 20,
    category: "swarm",
    traits: ["fast", "breakthrough"],
    breakthrough: true,
  },
  // =============================================================================
  // CAMPUS ENEMIES (Regional) - Campus life
  // =============================================================================
  protestor: {
    name: "Campus Protestor",
    hp: 230,
    speed: 0.34,
    bounty: 12,
    armor: 0.15,
    flying: false,
    troopDamage: 25,
    desc: "Passionate and determined. Carries a sign that provides minor protection.",
    color: "#ef4444",
    size: 22,
    category: "campus",
    traits: ["armored"],
    abilities: [
      {
        type: "slow",
        name: "Rally Cry",
        desc: "Passionate speeches slow defender morale",
        chance: 0.15,
        duration: 1500,
        intensity: 0.2,
        radius: 50,
      },
    ],
  },
  // =============================================================================
  // NATURE ENEMIES - Swamp Region
  // =============================================================================
  bog_creature: {
    name: "Bog Lurker",
    hp: 220,
    speed: 0.28,
    bounty: 14,
    armor: 0.2,
    flying: false,
    troopDamage: 20,
    desc: "Shambling swamp horror covered in toxic muck. Slow but resilient.",
    color: "#365314",
    size: 24,
    category: "nature",
    traits: ["armored"],
    abilities: [
      {
        type: "poison",
        name: "Toxic Muck",
        desc: "Toxic slime poisons on contact",
        chance: 0.25,
        duration: 3000,
        intensity: 6,
      },
    ],
  },
  will_o_wisp: {
    name: "Will-o'-Wisp",
    hp: 90,
    speed: 0.5,
    bounty: 10,
    armor: 0.4,
    flying: true,
    troopDamage: 16,
    desc: "Malevolent spirit light that phases through defenses.",
    color: "#84cc16",
    size: 18,
    category: "flying",
    traits: ["flying", "fast", "magic_resist", "breakthrough"],
    abilities: [
      {
        type: "tower_blind",
        name: "Mesmerizing Light",
        desc: "Distracting glow reduces tower range",
        chance: 1.0,
        duration: 2500,
        intensity: 0.15,
        radius: 60,
      },
    ],
  },
  swamp_troll: {
    name: "Swamp Troll",
    hp: 450,
    speed: 0.2,
    bounty: 25,
    armor: 0.25,
    flying: false,
    troopDamage: 55,
    desc: "Massive brute covered in parasitic growths. Regenerates slowly.",
    color: "#4d7c0f",
    size: 30,
    category: "nature",
    traits: ["armored", "regenerating"],
    liveCost: 2,
    abilities: [
      {
        type: "stun",
        name: "Club Smash",
        desc: "Heavy blows stun defenders",
        chance: 0.2,
        duration: 1200,
      },
    ],
  },
  // =============================================================================
  // NATURE ENEMIES - Desert Region
  // =============================================================================
  nomad: {
    name: "Desert Nomad",
    hp: 160,
    speed: 0.38,
    bounty: 11,
    armor: 0.1,
    flying: false,
    troopDamage: 17,
    desc: "Cursed wanderer of the endless sands, bound by ancient dark pacts.",
    color: "#a16207",
    size: 22,
    category: "swarm",
    traits: [],
  },
  scorpion: {
    name: "Giant Scorpion",
    hp: 280,
    speed: 0.32,
    bounty: 18,
    armor: 0.3,
    flying: false,
    troopDamage: 42,
    desc: "Armored desert predator with venomous stinger. Heavily protected.",
    color: "#78350f",
    size: 26,
    category: "nature",
    traits: ["armored"],
    abilities: [
      {
        type: "poison",
        name: "Venom Sting",
        desc: "Venomous stinger poisons targets",
        chance: 0.35,
        duration: 4000,
        intensity: 12,
      },
    ],
  },
  scarab: {
    name: "Sacred Scarab",
    hp: 140,
    speed: 0.45,
    bounty: 9,
    armor: 0.15,
    flying: false,
    troopDamage: 18,
    desc: "Cursed beetle that scurries past defenders too quickly to catch.",
    color: "#fbbf24",
    size: 16,
    category: "swarm",
    traits: ["fast", "breakthrough"],
    breakthrough: true,
  },
  // =============================================================================
  // NATURE ENEMIES - Winter Region
  // =============================================================================
  snow_goblin: {
    name: "Frost Goblin",
    hp: 130,
    speed: 0.48,
    bounty: 9,
    armor: 0.05,
    flying: false,
    troopDamage: 18,
    desc: "Mischievous ice creature that dashes past defenders.",
    color: "#93c5fd",
    size: 20,
    category: "swarm",
    traits: ["fast", "breakthrough"],
    breakthrough: true,
    abilities: [
      {
        type: "slow",
        name: "Frost Claws",
        desc: "Freezing claws slow targets",
        chance: 1.0,
        duration: 1500,
        intensity: 0.25,
      },
    ],
  },
  yeti: {
    name: "Mountain Yeti",
    hp: 520,
    speed: 0.18,
    bounty: 30,
    armor: 0.35,
    flying: false,
    troopDamage: 62,
    desc: "Primordial ice titan. Massive, furry, and terrifying.",
    color: "#e0f2fe",
    size: 32,
    category: "nature",
    traits: ["armored", "aoe_attack"],
    aoeRadius: 70,
    aoeDamage: 85,
    liveCost: 2,
    abilities: [
      {
        type: "stun",
        name: "Frost Slam",
        desc: "Powerful ice slam stuns nearby defenders",
        chance: 0.25,
        duration: 1800,
        radius: 75,
      },
      {
        type: "slow",
        name: "Chilling Presence",
        desc: "Cold aura slows all nearby",
        chance: 1.0,
        duration: 2500,
        intensity: 0.35,
        radius: 70,
      },
    ],
  },
  ice_witch: {
    name: "Frost Sorceress",
    hp: 200,
    speed: 0.3,
    bounty: 20,
    armor: 0.2,
    flying: false,
    isRanged: true,
    range: 200,
    attackSpeed: 2000,
    projectileDamage: 40,
    desc: "Ancient cryomancer wielding devastating ice magic.",
    color: "#60a5fa",
    size: 24,
    category: "ranged",
    traits: ["ranged", "magic_resist"],
    abilities: [
      {
        type: "slow",
        name: "Ice Bolt",
        desc: "Freezing projectiles slow targets significantly",
        chance: 1.0,
        duration: 2500,
        intensity: 0.4,
      },
      {
        type: "tower_slow",
        name: "Winter's Grasp",
        desc: "Chilling magic slows tower mechanisms",
        chance: 1.0,
        duration: 3000,
        intensity: 0.25,
        radius: 80,
      },
    ],
  },
  // =============================================================================
  // NATURE ENEMIES - Volcanic Region
  // =============================================================================
  magma_spawn: {
    name: "Magma Spawn",
    hp: 250,
    speed: 0.26,
    bounty: 16,
    armor: 0.25,
    flying: false,
    desc: "Living lava elemental. Burns anything it touches.",
    color: "#ea580c",
    size: 24,
    category: "nature",
    traits: ["armored"],
    abilities: [
      {
        type: "burn",
        name: "Molten Touch",
        desc: "Contact with magma causes burning",
        chance: 0.35,
        duration: 3000,
        intensity: 12,
      },
    ],
  },
  fire_imp: {
    name: "Fire Imp",
    hp: 110,
    speed: 0.52,
    bounty: 8,
    armor: 0,
    flying: false,
    troopDamage: 18,
    desc: "Mischievous demon that darts past defenders in a flash of flame.",
    color: "#fb923c",
    size: 18,
    category: "swarm",
    traits: ["fast", "breakthrough"],
    breakthrough: true,
    abilities: [
      {
        type: "burn",
        name: "Imp Fire",
        desc: "Small but painful flames",
        chance: 0.25,
        duration: 2000,
        intensity: 8,
      },
    ],
  },
  ember_guard: {
    name: "Ember Guard",
    hp: 380,
    speed: 0.25,
    bounty: 22,
    armor: 0.35,
    flying: false,
    desc: "Elite infernal knight forged in volcanic fire. Heavily armored.",
    color: "#c2410c",
    size: 28,
    category: "nature",
    traits: ["armored"],
    abilities: [
      {
        type: "burn",
        name: "Ember Blade",
        desc: "Flaming weapon causes burning wounds",
        chance: 0.3,
        duration: 3500,
        intensity: 15,
      },
      {
        type: "tower_weaken",
        name: "Heat Shimmer",
        desc: "Intense heat disrupts tower accuracy",
        chance: 1.0,
        duration: 2500,
        intensity: 0.15,
        radius: 70,
      },
    ],
  },
};

// Hero data - Enhanced HP for better survivability
export const HERO_DATA: Record<HeroType, HeroData> = {
  tiger: {
    name: "Princeton Tiger",
    icon: "🐯",
    description:
      "The fearsome Princeton Tiger, an apex predator with a terrifying roar that freezes enemies in fear.",
    hp: 4250,
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
      "A virtuoso vocalist whose voice is a weapon. His sonic attacks pierce through even the toughest armor.",
    hp: 3200,
    damage: 60,
    range: 250,
    attackSpeed: 450,
    speed: 2.5,
    ability: "High Note",
    abilityDesc:
      "Devastating sonic blast stuns enemies and heals nearby allies",
    color: "#8b5cf6",
    isRanged: true,
  },
  mathey: {
    name: "Mathey Knight",
    icon: "🛡️",
    description:
      "An elite defender from Mathey College, clad in enchanted armor. Draws enemy aggression and protects allies.",
    hp: 5600,
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
      "A legendary gargoyle awakened from campus rooftops. Hurls massive boulders that devastate enemies.",
    hp: 2750,
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
    hp: 3000,
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
    icon: "🐉",
    description:
      "A legendary commander wreathed in flame. Summons loyal knights to his banner.",
    hp: 4650,
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
      "A brilliant inventor who deploys automated turrets designed in the Engineering Library. He needs more coffee.",
    hp: 2500,
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
    hp: 700,
    damage: 20,
    attackSpeed: 1100,
    desc: "Basic infantry unit",
    color: "#6b8e23",
  },
  armored: {
    name: "Armored Soldier",
    hp: 1100,
    damage: 25,
    attackSpeed: 1000,
    desc: "Protected infantry",
    color: "#708090",
  },
  elite: {
    name: "Elite Guard",
    hp: 1400,
    damage: 35,
    attackSpeed: 900,
    desc: "Royal guard with halberd",
    color: "#c0c0c0",
  },
  knight: {
    name: "Knight",
    hp: 1000,
    damage: 30,
    attackSpeed: 1000,
    desc: "Elite warrior",
    color: "#c0c0c0",
  },
  centaur: {
    name: "Centaur",
    hp: 1200,
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
    hp: 1800,
    damage: 55,
    attackSpeed: 1100,
    desc: "Heavy mounted knight",
    color: "#daa520",
    isMounted: true,
  },
  thesis: {
    name: "Thesis Defender",
    hp: 1400,
    damage: 55,
    attackSpeed: 750,
    desc: "Elite defender with high damage",
    color: "#c084fc",
  },
  rowing: {
    name: "Rowing Crew",
    hp: 1700,
    damage: 45,
    attackSpeed: 1000,
    desc: "Tanky unit that can take hits",
    color: "#f97316",
  },
  turret: {
    name: "Defense Turret",
    hp: 800,
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
    { x: -5, y: 15 },
    { x: 4, y: 15 },
    { x: 10, y: 15 },
    { x: 10, y: 8 },
    { x: 16, y: 8 },
    { x: 16, y: 18 },
    { x: 22, y: 18 },
    { x: 22, y: 12 },
    { x: 28, y: 12 },
    { x: 37, y: 12 },
  ],
  carnegie: [
    { x: 15, y: -7 },
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
    { x: 26, y: 35 },
  ],
  nassau: [
    { x: -5, y: 15 },
    { x: 5, y: 15 },
    { x: 5, y: 23 },
    { x: 12, y: 23 },
    { x: 12, y: 12 },
    { x: 5, y: 12 },
    { x: 5, y: 4 },
    { x: 10, y: 4 },
    { x: 10, y: 8 },
    { x: 17, y: 8 },
    { x: 17, y: 6 },
    { x: 21, y: 6 },
    { x: 21, y: 13 },
    { x: 26, y: 13 },
    { x: 26, y: 5 },
    { x: 35, y: 5 },
  ],
  // =====================
  // SWAMP REGION (Murky Marshes)
  // =====================
  bog: [
    { x: -5, y: 8 },
    { x: 6, y: 8 },
    { x: 6, y: 20 },
    { x: 12, y: 20 },
    { x: 12, y: 12 },
    { x: 18, y: 12 },
    { x: 18, y: 19 },
    { x: 24, y: 19 },
    { x: 24, y: 6 },
    { x: 35, y: 6 },
  ],
  witch_hut: [
    { x: 12, y: -7 },
    { x: 12, y: 1 },
    { x: 19, y: 1 },
    { x: 19, y: 4.5 },
    { x: 9, y: 4.5 },
    { x: 9, y: 10 },
    { x: 9, y: 16 },
    { x: 15, y: 16 },
    { x: 21, y: 16 },
    { x: 21, y: 10 },
    { x: 27, y: 10 },
    { x: 27, y: 14 },
    { x: 27, y: 16 },
    { x: 27, y: 21 },
    { x: 18, y: 21 },
    { x: 18, y: 37 },
  ],
  sunken_temple: [
    { x: -5, y: 8 },
    { x: 4, y: 8 },
    { x: 4, y: 14 },
    { x: 7, y: 14 },
    { x: 7, y: 8 },
    { x: 11, y: 8 },
    { x: 11, y: 11 },
    { x: 11, y: 16 },
    { x: 14, y: 16 },
    { x: 14, y: 12.5 },
    { x: 18, y: 12.5 },
    { x: 18, y: 16 },
    { x: 24, y: 16 },
    { x: 24, y: 24 },
    { x: 30, y: 24 },
    { x: 30, y: 21 },
    { x: 32, y: 21 },
    { x: 41, y: 21 },
  ],
  // Secondary path for sunken temple
  sunken_temple_b: [
    { x: -5, y: 25 },
    { x: 5, y: 25 },
    { x: 5, y: 20 },
    { x: 10, y: 20 },
    { x: 10, y: 26 },
    { x: 14, y: 26 },
    { x: 14, y: 22 },
    { x: 18, y: 22 },
    { x: 18, y: 16 },
    { x: 24, y: 16 },
    { x: 24, y: 4 },
    { x: 28, y: 4 },
    { x: 28, y: 8 },
    { x: 32, y: 8 },
    { x: 32, y: 8 },
    { x: 36, y: 8 },
    { x: 41, y: 8 },
  ],
  // =====================
  // DESERT REGION (Sahara Sands)
  // =====================
  oasis: [
    { x: -8, y: 10 },
    { x: 2, y: 10 },
    { x: 2, y: 18 },
    { x: 6, y: 18 },
    { x: 6, y: 11 },
    { x: 10, y: 11 },
    { x: 10, y: 20 },
    { x: 20, y: 20 },
    { x: 20, y: 11 },
    { x: 15, y: 11 },
    { x: 15, y: 4 },
    { x: 24, y: 4 },
    { x: 24, y: 9 },
    { x: 30, y: 9 },
    { x: 30, y: 17 },
    { x: 32, y: 18 },
    { x: 39, y: 18 },
  ],
  pyramid: [
    { x: 15, y: -7 },
    { x: 15, y: 4 },
    { x: 6, y: 4 },
    { x: 6, y: 8 },
    { x: 12, y: 8 },
    { x: 12, y: 12 },
    { x: 7, y: 12 },
    { x: 7, y: 15 },
    { x: 11, y: 15 },
    { x: 11, y: 19 },
    { x: 9, y: 19 },
    { x: 9, y: 24 },
    { x: 15, y: 24 },
    { x: 15, y: 30 },
    { x: 15, y: 37 },
  ],
  // Secondary path for pyramid
  pyramid_b: [
    { x: 37, y: 16 },
    { x: 27, y: 16 },
    { x: 27, y: 8 },
    { x: 23, y: 8 },
    { x: 23, y: 12 },
    { x: 19, y: 12 },
    { x: 19, y: 17 },
    { x: 24.5, y: 17 },
    { x: 24.5, y: 20 },
    { x: 22, y: 20 },
    { x: 22, y: 24 },
    { x: 15, y: 24 },
    { x: 15, y: 30 },
    { x: 15, y: 37 },
  ],
  sphinx: [
    { x: -9, y: 16 },
    { x: 2, y: 16 },
    { x: 2, y: 8 },
    { x: 8, y: 8 },
    { x: 8, y: 26 },
    { x: 14, y: 26 },
    { x: 14, y: 15 },
    { x: 16, y: 15 },
    { x: 16, y: 11 },
    { x: 12, y: 11 },
    { x: 12, y: 8 },
    { x: 20, y: 8 },
    { x: 20, y: 16.5 },
    { x: 26, y: 16.5 },
    { x: 26, y: 5.5 },
    { x: 30, y: 5 },
    { x: 37, y: 5 },
  ],
  // =====================
  // WINTER REGION (Frozen Frontier)
  // =====================
  glacier: [
    { x: -5, y: 12 },
    { x: 6, y: 12 },
    { x: 6, y: 20 },
    { x: 12, y: 20 },
    { x: 12, y: 12 },
    { x: 18, y: 12 },
    { x: 18, y: 20 },
    { x: 18, y: 24 },
    { x: 24, y: 24 },
    { x: 24, y: 20 },
    { x: 30, y: 20 },
    { x: 30, y: 12 },
    { x: 39, y: 12 },
  ],
  fortress: [
    { x: 15, y: -10 },
    { x: 15, y: -2 },
    { x: 12, y: -2 },
    { x: 12, y: 4 },
    { x: 9, y: 4 },
    { x: 9, y: 10 },
    { x: 15, y: 10 },
    { x: 20, y: 10 },
    { x: 20, y: 7 },
    { x: 24, y: 7 },
    { x: 24, y: 14 },
    { x: 12, y: 14 },
    { x: 12, y: 19 },
    { x: 18, y: 19 },
    { x: 18, y: 22 },
    { x: 18, y: 24 },
    { x: 14, y: 24 },
    { x: 14, y: 30 },
    { x: 14, y: 37 },
  ],
  peak: [
    { x: -5, y: 20 },
    { x: 2, y: 20 },
    { x: 2, y: 12 },
    { x: 8, y: 12 },
    { x: 14, y: 12 },
    { x: 14, y: 20 },
    { x: 20, y: 20 },
    { x: 26, y: 20 },
    { x: 38, y: 20 },
  ],
  // Secondary path for peak
  peak_b: [
    { x: 12, y: -5 },
    { x: 12, y: 6 },
    { x: 22, y: 6 },
    { x: 22, y: 12 },
    { x: 28, y: 12 },
    { x: 28, y: 19 },
    { x: 38, y: 20 },
  ],
  // =====================
  // VOLCANIC REGION (Inferno Depths)
  // =====================
  lava: [
    { x: -7, y: 14 },
    { x: 6, y: 14 },
    { x: 6, y: 6 },
    { x: 21, y: 6 },
    { x: 21, y: 10 },
    { x: 12, y: 10 },
    { x: 12, y: 14 },
    { x: 18, y: 14 },
    { x: 18, y: 19 },
    { x: 10, y: 19 },
    { x: 10, y: 25 },
    { x: 24, y: 25 },
    { x: 24, y: 14 },
    { x: 39, y: 14 },
  ],
  crater: [
    { x: 15, y: -9 },
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
    { x: 8, y: 18 },
    { x: 8, y: 24 },
    { x: 21, y: 24 },
    { x: 21, y: 39 },
  ],
  throne: [
    { x: -7, y: 7 },
    { x: 2, y: 7 },
    { x: 2, y: 11 },
    { x: 6, y: 11 },
    { x: 6, y: 7 },
    { x: 10, y: 7 },
    { x: 10, y: 10 },
    { x: 14, y: 10 },
    { x: 14, y: 6 },
    { x: 20, y: 6 },
    { x: 20, y: 10 },
    { x: 26, y: 10 },
    { x: 26, y: 14 },
    { x: 39, y: 14 }, // MERGE POINT
  ],
  // Secondary path for throne
  throne_b: [
    { x: -7, y: 24 },
    { x: 0, y: 24 },
    { x: 0, y: 20 },
    { x: 6, y: 20 },
    { x: 6, y: 16 },
    { x: 12, y: 16 },
    { x: 12, y: 20 },
    { x: 18, y: 20 },
    { x: 18, y: 24 },
    { x: 24, y: 24 },
    { x: 24, y: 18 },
    { x: 30, y: 18 },
    { x: 30, y: 14 }, // Merge point with primary path
    { x: 39, y: 14 },
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
    heroSpawn?: { x: number; y: number };
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
    description: "Training grounds for new defenders.",
    camera: { offset: { x: -100, y: -390 }, zoom: 1.05 },
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
      { type: "hedge", pos: { x: 22, y: 6 }, variant: 0 },
      { type: "reeds", pos: { x: 28, y: 14 }, variant: 0 },
    ],
  },
  carnegie: {
    name: "Carnegie Lake",
    position: { x: 300, y: 120 },
    description:
      "Strategic lakeside defense. The gleaming waters hide ancient secrets.",
    camera: { offset: { x: -120, y: -380 }, zoom: 0.95 },
    region: "grassland",
    theme: "grassland",
    difficulty: 2,
    startingPawPoints: 400, // Medium difficulty - more waves
    decorations: [
      // Lake feature near path center (path: x:9-26, y:-2 to 32)
      { type: "deep_water", pos: { x: 9, y: 17 }, variant: 0, size: 2 },
      // { type: "deep_water", pos: { x: 11, y: 24 }, variant: 0, size: 4 },

      { type: "carnegie_lake", pos: { x: 10, y: 23 }, variant: 0, size: 2.5 },
      // { type: "deep_water", pos: { x: 9, y: 23 }, variant: 0, size: 3 },

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
      { type: "dock", pos: { x: 14, y: 22 }, variant: 0 },
      { type: "campfire", pos: { x: 26, y: 20 }, variant: 0 },
    ],
    previewImage: "/images/previews/carnegie.png",
  },
  nassau: {
    name: "Nassau Hall",
    position: { x: 480, y: 200 },
    description:
      "The final stand at the heart of campus. Defend the iconic building at all costs!",
    camera: { offset: { x: -140, y: -270 }, zoom: 0.9 },
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
      { type: "nassau_hall", pos: { x: 15, y: -3 }, variant: 0, size: 3 },
      { type: "statue", pos: { x: 7, y: 7.5 }, variant: 1 },
      { type: "statue", pos: { x: 21, y: 2 }, variant: 0 },
      { type: "statue", pos: { x: 17, y: 17 }, variant: 0 },
      { type: "fountain", pos: { x: 22.75, y: 7 }, variant: 0 },
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
    camera: { offset: { x: -150, y: -330 }, zoom: 0.9 },
    region: "swamp",
    theme: "swamp",
    difficulty: 1,
    startingPawPoints: 400, // Swamp intro - hexers require strategy
    hazards: [{ type: "poison_fog", pos: { x: 17.5, y: 15.5 }, radius: 1.5 }],
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
      { type: "poison_pool", pos: { x: 26, y: 20 }, variant: 0 },
      { type: "glowing_runes", pos: { x: 18, y: 24 }, variant: 0 },
      { type: "hanging_cage", pos: { x: 8, y: 10 }, variant: 0 },
    ],
    previewImage: "/images/previews/murky_bog.png",
  },
  witch_hut: {
    name: "Witch's Domain",
    position: { x: 300, y: 120 },
    description:
      "A cursed clearing where dark magic festers. The witch's hut pulses with evil energy.",
    camera: { offset: { x: -180, y: -330 }, zoom: 0.85 },
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
      { type: "witch_cottage", pos: { x: 14, y: 10 }, variant: 0, size: 1.5 },
      { type: "deep_water", pos: { x: 14, y: 9.9 }, variant: 0, size: 3.5 },
      { type: "cauldron", pos: { x: 16, y: 11 }, variant: 0 },
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
      { type: "cauldron", pos: { x: 20, y: 4 }, variant: 1 },

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
      { type: "hanging_cage", pos: { x: 2, y: 10 }, variant: 0 },
      { type: "hanging_cage", pos: { x: 28, y: 22 }, variant: 1 },
      { type: "poison_pool", pos: { x: 12, y: 26 }, variant: 0 },
      { type: "glowing_runes", pos: { x: 8, y: 14 }, variant: 0 },
      { type: "idol_statue", pos: { x: 26, y: 4 }, variant: 0 },
      { type: "skeleton_pile", pos: { x: 14, y: 24 }, variant: 0 },
    ],
    hazards: [{ type: "poison_fog", pos: { x: 18, y: 15.5 }, radius: 2 }],
    previewImage: "/images/previews/witch_hut.png",
  },
  sunken_temple: {
    name: "Sunken Temple",
    position: { x: 480, y: 200 },
    description:
      "Ancient ruins half-submerged in fetid waters. Something stirs in the depths below.",
    camera: { offset: { x: -20, y: -420 }, zoom: 0.85 },
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
      { type: "tentacle", pos: { x: 18.5, y: 9.25 }, variant: 0 },
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
      { type: "glowing_runes", pos: { x: 12, y: 26 }, variant: 0 },
      { type: "glowing_runes", pos: { x: 24, y: 22 }, variant: 1 },
      { type: "hanging_cage", pos: { x: 20, y: 4 }, variant: 0 },
      { type: "poison_pool", pos: { x: 8, y: 24 }, variant: 0 },
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
      pos: { x: 22, y: 9.5 },
      type: "beacon",
    },
    decorations: [
      // Desert features near path (path: x:-2 to 32, y:10 to 18)
      { type: "pyramid", pos: { x: 16, y: 4 }, variant: 0, size: 2 },
      { type: "sphinx", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "oasis_pool", pos: { x: 16, y: 17 }, variant: 0, size: 2 },
      { type: "sphinx", pos: { x: 13, y: 14 }, variant: 0 },
      { type: "sphinx", pos: { x: 13, y: 12 }, variant: 1 },

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
      { type: "cobra_statue", pos: { x: 20, y: 4 }, variant: 0 },
      { type: "sand_pile", pos: { x: 18, y: 24 }, variant: 0 },
      { type: "treasure_chest", pos: { x: 24, y: 18 }, variant: 0 },
    ],
    previewImage: "/images/previews/oasis.png",
  },
  pyramid: {
    name: "Pyramid Pass",
    position: { x: 300, y: 120 },
    description:
      "Navigate the ancient canyon beneath the great pyramid. Beware of ambushes!",
    camera: { offset: { x: -140, y: -340 }, zoom: 0.85 },
    region: "desert",
    theme: "desert",
    difficulty: 2,
    startingPawPoints: 525, // Dual path requires coverage on both sides
    dualPath: true,
    secondaryPath: "pyramid_b",
    specialTower: {
      pos: { x: 21, y: 15 },
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
      { type: "sphinx", pos: { x: 9, y: 10 }, variant: 0 },
      { type: "sphinx", pos: { x: 13.5, y: 17 }, variant: 1 },

      // Obelisks and torches along path
      { type: "obelisk", pos: { x: 6, y: 16 }, variant: 0 },
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
      { type: "hieroglyph_wall", pos: { x: 4, y: 16 }, variant: 0 },
      { type: "hieroglyph_wall", pos: { x: 28, y: 18 }, variant: 1 },
      { type: "cobra_statue", pos: { x: 16, y: 8 }, variant: 0 },
      { type: "treasure_chest", pos: { x: 20, y: 22 }, variant: 0 },
      { type: "sand_pile", pos: { x: 14, y: 26 }, variant: 0 },
    ],
    previewImage: "/images/previews/pyramid.png",
  },
  sphinx: {
    name: "Sphinx Gate",
    position: { x: 480, y: 200 },
    description:
      "The ancient guardian's domain. The Sphinx watches all who dare to pass.",
    camera: { offset: { x: -90, y: -290 }, zoom: 0.85 },
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
      { type: "giant_sphinx", pos: { x: 13, y: 2 }, variant: 0, size: 1.5 },
      { type: "sphinx", pos: { x: 10, y: 23.5 }, variant: 1 },
      { type: "sphinx", pos: { x: 10, y: 5.5 }, variant: 0 },
      { type: "sphinx", pos: { x: 15, y: 5.5 }, variant: 0 },
      { type: "sphinx", pos: { x: 11, y: 14 }, variant: 1 },
      { type: "sphinx", pos: { x: 11, y: 13 }, variant: 1 },
      { type: "sphinx", pos: { x: 22, y: 6 }, variant: 0 },
      // Obelisks along path
      { type: "obelisk", pos: { x: 4, y: 14 }, variant: 0 },
      { type: "obelisk", pos: { x: 10, y: 18 }, variant: 1 },
      { type: "obelisk", pos: { x: 22, y: 14 }, variant: 2 },
      { type: "obelisk", pos: { x: 28, y: 18 }, variant: 0 },
      // Pyramids and decorations
      { type: "pyramid", pos: { x: 15, y: 26 }, variant: 0, size: 1.5 },
      { type: "pyramid", pos: { x: 26, y: 2 }, variant: 1, size: 2 },
      { type: "pyramid", pos: { x: 8, y: 2 }, variant: 0 },
      { type: "pyramid", pos: { x: 10, y: 6.5 }, variant: 2, size: 1.5 },

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
      { type: "hieroglyph_wall", pos: { x: 4, y: 10 }, variant: 0 },
      { type: "hieroglyph_wall", pos: { x: 28, y: 16 }, variant: 1 },
      { type: "cobra_statue", pos: { x: 18, y: 22 }, variant: 0 },
      { type: "cobra_statue", pos: { x: 10, y: 25 }, variant: 1 },
      { type: "treasure_chest", pos: { x: 6, y: 18 }, variant: 0 },
      { type: "pottery", pos: { x: 26, y: 20 }, variant: 0 },
    ],
    hazards: [{ type: "quicksand", pos: { x: 13, y: 17 }, radius: 2 }],
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
    camera: { offset: { x: -90, y: -420 }, zoom: 0.9 },
    region: "winter",
    theme: "winter",
    difficulty: 1,
    startingPawPoints: 475, // Winter intro - varied enemy types
    specialTower: {
      pos: { x: 9, y: 18.5 },
      type: "beacon",
    },
    decorations: [
      // Pine trees scattered around the glacier path
      { type: "pine_tree", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "pine_tree", pos: { x: 14, y: 4 }, variant: 1 },
      { type: "pine_tree", pos: { x: 24, y: 4 }, variant: 2 },
      { type: "pine_tree", pos: { x: 4, y: 22 }, variant: 0 },
      { type: "pine_tree", pos: { x: 16, y: 24 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: 22 }, variant: 2 },
      // Ice crystal formations
      { type: "ice_crystal", pos: { x: 8, y: 6 }, variant: 0, size: 1 },
      { type: "ice_crystal", pos: { x: 28, y: 4 }, variant: 1, size: 1 },
      { type: "ice_crystal", pos: { x: 12, y: 2 }, variant: 2, size: 1 },
      // Ice fortress as major landmark
      { type: "ice_fortress", pos: { x: 20, y: 6 }, variant: 0, size: 2 },
      { type: "ice_fortress", pos: { x: 4, y: 18 }, variant: 1, size: 1 },
      // Frozen waterfall - dramatic centerpiece
      { type: "frozen_waterfall", pos: { x: 30, y: 8 }, variant: 0, size: 2 },
      // Aurora crystal - magical glow
      { type: "aurora_crystal", pos: { x: 2, y: 4 }, variant: 0, size: 1 },
      { type: "aurora_crystal", pos: { x: 24, y: 16 }, variant: 1, size: 1 },
      // Ice throne focal point
      { type: "ice_throne", pos: { x: 10, y: 4 }, variant: 0, size: 2 },
      // Frozen ponds
      { type: "frozen_pond", pos: { x: 15, y: 14 }, variant: 0, size: 1.5 },
      { type: "frozen_pond", pos: { x: 26, y: 12 }, variant: 1, size: 2 },
      // Snow lanterns along path edges
      { type: "snow_lantern", pos: { x: 6, y: 8 }, variant: 0, size: 1 },
      { type: "snow_lantern", pos: { x: 22, y: 8 }, variant: 1, size: 1 },
      { type: "snow_lantern", pos: { x: 14, y: 20 }, variant: 0, size: 1 },
      // Icicle formations
      { type: "icicles", pos: { x: 18, y: 4 }, variant: 0 },
      { type: "icicles", pos: { x: 12, y: 22 }, variant: 1 },
      { type: "icicles", pos: { x: 30, y: 16 }, variant: 0 },
      // Snow decorations
      { type: "snow_pile", pos: { x: 2, y: 12 }, variant: 0 },
      { type: "snow_pile", pos: { x: 22, y: 20 }, variant: 1 },
      { type: "snowman", pos: { x: 10, y: 20 }, variant: 0 },
      { type: "snowman", pos: { x: 28, y: 10 }, variant: 1 },
      // Frozen soldier and battlefield remnants
      { type: "frozen_soldier", pos: { x: 2, y: 16 }, variant: 0 },
      { type: "broken_wall", pos: { x: 8, y: 24 }, variant: 0 },
      { type: "bones", pos: { x: 26, y: 18 }, variant: 1 },
    ],
    hazards: [{ type: "ice_spikes", pos: { x: 17.5, y: 18 }, radius: 1.5 }],
    previewImage: "/images/previews/glacier.png",
  },
  fortress: {
    name: "Frost Fortress",
    position: { x: 300, y: 120 },
    description:
      "An abandoned stronghold of ice and stone. What dark forces drove out its defenders?",
    camera: { offset: { x: -150, y: -335 }, zoom: 0.85 },
    region: "winter",
    theme: "winter",
    difficulty: 2,
    startingPawPoints: 550, // Barracks helps - ice sheet hazard speeds enemies
    specialTower: {
      pos: { x: 14, y: 17 },
      type: "barracks",
    },
    decorations: [
      // Grand frozen gate - fortress entrance
      { type: "frozen_gate", pos: { x: 14, y: 4 }, variant: 0, size: 2 },
      // Ice fortresses flanking the entrance
      { type: "ice_fortress", pos: { x: 6, y: 4 }, variant: 0, size: 2 },
      { type: "ice_fortress", pos: { x: 24, y: 4 }, variant: 1, size: 2 },
      // Ruined temple in the courtyard
      { type: "ruined_temple", pos: { x: 14, y: 6 }, variant: 0, size: 2 },
      // Ice thrones - commanding positions
      { type: "ice_throne", pos: { x: 4, y: 8 }, variant: 0, size: 3 },
      { type: "ice_throne", pos: { x: 26, y: 8 }, variant: 1, size: 2 },
      // Aurora crystals illuminating the fortress ruins
      { type: "aurora_crystal", pos: { x: 8, y: 24 }, variant: 0, size: 2 },
      { type: "aurora_crystal", pos: { x: 24, y: 26 }, variant: 1, size: 1 },
      { type: "aurora_crystal", pos: { x: 2, y: 6 }, variant: 2, size: 1 },
      // Ice crystals scattered in the ruins
      { type: "ice_crystal", pos: { x: 12, y: 2 }, variant: 0, size: 1 },
      { type: "ice_crystal", pos: { x: 28, y: 6 }, variant: 1, size: 1 },
      { type: "ice_crystal", pos: { x: 6, y: 14 }, variant: 2, size: 1 },
      { type: "ice_crystal", pos: { x: 30, y: 12 }, variant: 0, size: 1 },
      // Frozen waterfall on fortress wall
      { type: "frozen_waterfall", pos: { x: 2, y: 22 }, variant: 0, size: 1 },
      // Snow lanterns along fortress corridors
      { type: "snow_lantern", pos: { x: 9, y: 15 }, variant: 0, size: 1 },
      { type: "snow_lantern", pos: { x: 20, y: 6 }, variant: 1, size: 1 },
      { type: "snow_lantern", pos: { x: 16, y: 26 }, variant: 0, size: 1 },
      // Broken walls along path - fortress damage
      { type: "broken_wall", pos: { x: 6, y: 10 }, variant: 0, size: 1 },
      { type: "broken_wall", pos: { x: 20, y: 14 }, variant: 1, size: 1 },
      { type: "broken_wall", pos: { x: 24, y: 22 }, variant: 2, size: 1 },
      // Frozen soldiers and battle remnants
      { type: "frozen_soldier", pos: { x: 8, y: 16 }, variant: 0, size: 1 },
      { type: "frozen_soldier", pos: { x: 22, y: 10 }, variant: 1, size: 1 },
      { type: "frozen_soldier", pos: { x: 26, y: 18 }, variant: 0, size: 1 },
      { type: "battle_crater", pos: { x: 14, y: 18 }, variant: 0 },
      { type: "battle_crater", pos: { x: 24, y: 16 }, variant: 1 },
      // Frozen pond in fortress courtyard
      { type: "frozen_pond", pos: { x: 14, y: 2 }, variant: 0, size: 1 },
      // Icicle formations on fortress ruins
      { type: "icicles", pos: { x: 18, y: 8 }, variant: 0, size: 1 },
      { type: "icicles", pos: { x: 10, y: 20 }, variant: 1, size: 1 },
      // Pine trees around fortress perimeter
      { type: "pine_tree", pos: { x: 4, y: 18 }, variant: 0 },
      { type: "pine_tree", pos: { x: 4, y: 26 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: 14 }, variant: 2 },
      { type: "pine_tree", pos: { x: 28, y: 24 }, variant: 0 },
      // Snow features
      { type: "snow_pile", pos: { x: 6, y: 24 }, variant: 0 },
      { type: "snowman", pos: { x: 30, y: 20 }, variant: 0 },
    ],
    hazards: [{ type: "ice_sheet", pos: { x: 15, y: 8 }, radius: 2 }],
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
      // Grand ice throne centerpiece - the summit crown
      { type: "ice_throne", pos: { x: 10, y: 7 }, variant: 0, size: 3 },
      // Frozen waterfall - dramatic cliff cascade
      { type: "frozen_waterfall", pos: { x: 4, y: 6 }, variant: 0, size: 2 },
      { type: "frozen_waterfall", pos: { x: 27, y: 6 }, variant: 1, size: 2 },
      // Aurora crystals at the peak - magical energy source
      { type: "aurora_crystal", pos: { x: 16, y: 10 }, variant: 0, size: 2 },
      { type: "aurora_crystal", pos: { x: 8, y: 24 }, variant: 1, size: 2 },
      { type: "aurora_crystal", pos: { x: 32, y: 10 }, variant: 2, size: 1 },
      // Frozen gate at mountain pass
      { type: "frozen_gate", pos: { x: 28, y: 3 }, variant: 0, size: 2 },
      // Ice fortresses guarding the peak
      { type: "ice_fortress", pos: { x: 4, y: 22 }, variant: 0, size: 1.5 },
      { type: "ice_fortress", pos: { x: 26, y: 22 }, variant: 1, size: 1.5 },
      // Frozen ponds - mountain lakes
      { type: "frozen_pond", pos: { x: 10, y: 14 }, variant: 0, size: 2 },
      { type: "frozen_pond", pos: { x: 22, y: 14 }, variant: 1, size: 2 },
      // Ice crystal formations
      { type: "ice_crystal", pos: { x: 6, y: 14 }, variant: 0, size: 1 },
      { type: "ice_crystal", pos: { x: 12, y: 9 }, variant: 1, size: 1.5 },
      { type: "ice_crystal", pos: { x: 26, y: 16 }, variant: 2, size: 1 },
      { type: "ice_crystal", pos: { x: 4, y: 2 }, variant: 0, size: 1 },
      { type: "ice_crystal", pos: { x: 24, y: 2 }, variant: 1, size: 1 },
      { type: "ice_crystal", pos: { x: 30, y: 14 }, variant: 2, size: 1 },
      // Snow lanterns marking the summit path
      { type: "snow_lantern", pos: { x: 10, y: 2 }, variant: 0, size: 1 },
      { type: "snow_lantern", pos: { x: 2, y: 16 }, variant: 1, size: 1 },
      { type: "snow_lantern", pos: { x: 16, y: 24 }, variant: 0, size: 1 },
      { type: "snow_lantern", pos: { x: 30, y: 24 }, variant: 1, size: 1 },
      // Icicle formations on mountain rocks
      { type: "icicles", pos: { x: 10, y: 6 }, variant: 0, size: 1 },
      { type: "icicles", pos: { x: 20, y: 4 }, variant: 1, size: 1 },
      { type: "icicles", pos: { x: 32, y: 6 }, variant: 0, size: 1 },
      // Broken walls - ancient defenses
      { type: "broken_wall", pos: { x: 6, y: 8 }, variant: 0, size: 1 },
      { type: "broken_wall", pos: { x: 8, y: 8 }, variant: 1, size: 1 },
      // Pine trees at summit edges
      { type: "pine_tree", pos: { x: 2, y: 12 }, variant: 0 },
      { type: "pine_tree", pos: { x: 2, y: 20 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: 10 }, variant: 2 },
      { type: "pine_tree", pos: { x: 28, y: 18 }, variant: 0 },
      // Snow drifts and features
      { type: "snow_pile", pos: { x: 12, y: 20 }, variant: 0 },
      { type: "snow_pile", pos: { x: 20, y: 20 }, variant: 1 },
      { type: "snowman", pos: { x: 2, y: 4 }, variant: 0 },
      // Battle remnants
      { type: "frozen_soldier", pos: { x: 4, y: 16 }, variant: 0, size: 1 },
      { type: "frozen_soldier", pos: { x: 26, y: 12 }, variant: 1, size: 1 },
      { type: "bones", pos: { x: 22, y: 8 }, variant: 1 },
    ],
    hazards: [
      { type: "ice_sheet", pos: { x: 20, y: 7 }, radius: 2 },
      { type: "ice_spikes", pos: { x: 28, y: 19 }, radius: 1.5 },
    ],
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
      { type: "lava_fall", pos: { x: 14, y: 4 }, variant: 0 },
      { type: "ember_rock", pos: { x: 22, y: 8 }, variant: 0 },
      { type: "ember_rock", pos: { x: 10, y: 20 }, variant: 1 },
      { type: "fire_crystal", pos: { x: 16, y: 18 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 30, y: 12 }, variant: 0 },
      { type: "volcano_rim", pos: { x: 20, y: 24 }, variant: 0 },
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
      { type: "lava_fall", pos: { x: 10, y: 4 }, variant: 0 },
      { type: "skull_throne", pos: { x: 14, y: 26 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 2, y: 18 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 28, y: 10 }, variant: 1 },
      { type: "fire_crystal", pos: { x: 18, y: 18 }, variant: 0 },
      { type: "ember_rock", pos: { x: 8, y: 22 }, variant: 0 },
      { type: "volcano_rim", pos: { x: 18, y: 2 }, variant: 0 },
    ],
    hazards: [{ type: "lava_geyser", pos: { x: 18, y: 17 }, radius: 2 }],
    previewImage: "/images/previews/caldera.png",
  },
  throne: {
    name: "Obsidian Throne",
    position: { x: 480, y: 200 },
    description:
      "The ultimate challenge. An ancient dark lord's seat of power, guarded by his legions.",
    camera: { offset: { x: -140, y: -350 }, zoom: 0.85 },
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
    hazards: [{ type: "lava_geyser", pos: { x: 18, y: 14 }, radius: 2 }],
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
      { type: "demon_statue", pos: { x: 7, y: 10 }, variant: 0 },
      { type: "demon_statue", pos: { x: 24, y: 8 }, variant: 1 },
      { type: "demon_statue", pos: { x: 10, y: 18 }, variant: 2 },
      { type: "demon_statue", pos: { x: 20, y: 16 }, variant: 0 },
      // Lava pools
      { type: "lava_pool", pos: { x: 2, y: 14 }, variant: 0, size: 1 },
      { type: "lava_pool", pos: { x: 27, y: 11.5 }, variant: 1, size: 2 },
      { type: "lava_pool", pos: { x: 22, y: 14 }, variant: 2, size: 1.5 },
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
      { type: "lava_fall", pos: { x: 2, y: 4 }, variant: 0 },
      { type: "lava_fall", pos: { x: 28, y: 4 }, variant: 1 },
      { type: "skull_throne", pos: { x: 14, y: 26 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 6, y: 14 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 24, y: 14 }, variant: 1 },
      { type: "fire_crystal", pos: { x: 16, y: 14 }, variant: 0 },
      { type: "fire_crystal", pos: { x: 12, y: 24 }, variant: 1 },
      { type: "ember_rock", pos: { x: 14, y: 8 }, variant: 0 },
      { type: "volcano_rim", pos: { x: 8, y: 26 }, variant: 0 },
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
// CHALLENGE TUNING: Reduced intervals (faster spawns), increased counts, shorter delays for overlapping pressure
export const LEVEL_WAVES: Record<string, WaveGroup[][]> = {
  // =====================
  // GRASSLAND REGION - Tutorial with teeth
  // Regional troops: frosh, athlete, protestor
  // =====================
  poe: [
    // Wave 1: Basic introduction
    [
      { type: "frosh", count: 8, interval: 500 }, // Regional fodder
      { type: "frosh", count: 6, interval: 500, delay: 2200 },
      { type: "cultist", count: 4, interval: 650, delay: 2000 }, // Magic variety
      { type: "athlete", count: 5, interval: 450, delay: 2200 }, // Regional speed
    ],
    // Wave 2: Mixed with tanks
    [
      { type: "protestor", count: 5, interval: 580 }, // Regional tank
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
      { type: "sophomore", count: 5, interval: 650, delay: 2200 }, // Academic tank
      { type: "athlete", count: 6, interval: 450, delay: 2200 },
      { type: "assassin", count: 3, interval: 950, delay: 2000 }, // Variety
    ],
    // Wave 3: Ranged introduction
    [
      { type: "archer", count: 5, interval: 700 }, // Ranged variety
      { type: "frosh", count: 10, interval: 450, delay: 2000 },
      { type: "protestor", count: 6, interval: 580, delay: 2200 },
      { type: "hexer", count: 4, interval: 750, delay: 2200 }, // Curse magic
      { type: "athlete", count: 5, interval: 450, delay: 2200 },
    ],
    // Wave 4: Flying introduction
    [
      { type: "mascot", count: 5, interval: 700 }, // Flying!
      { type: "protestor", count: 6, interval: 580, delay: 2200 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
      { type: "junior", count: 4, interval: 850, delay: 2000 }, // Heavy
      { type: "harpy", count: 4, interval: 750, delay: 2000 }, // More flying
    ],
    // Wave 5: Senior arrives
    [
      { type: "senior", count: 3, interval: 1400 }, // Boss tier
      { type: "protestor", count: 6, interval: 580, delay: 2000 },
      { type: "frosh", count: 10, interval: 450, delay: 2000 },
      { type: "athlete", count: 6, interval: 450, delay: 2200 },
      { type: "cultist", count: 5, interval: 650, delay: 2000 },
    ],
    // Wave 6: Speed wave
    [
      { type: "athlete", count: 8, interval: 420 }, // Regional speed
      { type: "mascot", count: 5, interval: 650, delay: 2200 }, // Fast flying
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
      { type: "assassin", count: 4, interval: 850, delay: 2000 },
      { type: "protestor", count: 5, interval: 580, delay: 2000 },
    ],
    // Wave 7: Tank wall
    [
      { type: "senior", count: 4, interval: 1150 }, // Tanks
      { type: "protestor", count: 8, interval: 550, delay: 2200 },
      { type: "archer", count: 6, interval: 650, delay: 2200 }, // Ranged
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
      { type: "berserker", count: 4, interval: 750, delay: 2200 }, // Rage
    ],
    // Wave 8: GRAND FINALE
    [
      { type: "senior", count: 4, interval: 1050 },
      { type: "protestor", count: 8, interval: 550, delay: 2000 },
      { type: "harpy", count: 5, interval: 700, delay: 2200 }, // Flying
      { type: "frosh", count: 13, interval: 400, delay: 2200 },
      { type: "hexer", count: 5, interval: 700, delay: 2200 }, // Curses
      { type: "athlete", count: 6, interval: 450, delay: 2200 },
    ],
  ],

  carnegie: [
    // Wave 1
    [
      { type: "athlete", count: 8, interval: 450 },
      { type: "frosh", count: 10, interval: 450, delay: 2000 },
      { type: "cultist", count: 5, interval: 650, delay: 2200 },
      { type: "protestor", count: 5, interval: 580, delay: 2200 },
    ],
    // Wave 2: Ranged focus
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "protestor", count: 6, interval: 580, delay: 2000 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
      { type: "mage", count: 4, interval: 900, delay: 2200 },
      { type: "athlete", count: 6, interval: 450, delay: 2200 },
    ],
    // Wave 3: Flying wave
    [
      { type: "mascot", count: 6, interval: 700 },
      { type: "harpy", count: 5, interval: 750, delay: 2200 },
      { type: "frosh", count: 10, interval: 450, delay: 2000 },
      { type: "protestor", count: 6, interval: 580, delay: 2200 },
      { type: "banshee", count: 3, interval: 1050, delay: 2200 },
    ],
    // Wave 4: Tank push
    [
      { type: "junior", count: 5, interval: 750 },
      { type: "protestor", count: 8, interval: 550, delay: 2000 },
      { type: "hexer", count: 5, interval: 700, delay: 2200 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
      { type: "berserker", count: 4, interval: 750, delay: 2200 },
    ],
    // Wave 5: Mixed assault
    [
      { type: "senior", count: 4, interval: 1100 },
      { type: "archer", count: 6, interval: 650, delay: 2000 },
      { type: "athlete", count: 8, interval: 450, delay: 2200 },
      { type: "specter", count: 4, interval: 850, delay: 2200 },
      { type: "protestor", count: 6, interval: 580, delay: 2200 },
    ],
    // Wave 6: Dual air assault
    [
      { type: "mascot", count: 6, interval: 700 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
      { type: "frosh", count: 10, interval: 450, delay: 2000 },
      { type: "wyvern", count: 3, interval: 1300, delay: 2200 },
      { type: "protestor", count: 6, interval: 580, delay: 2200 },
    ],
    // Wave 7: Berserker charge
    [
      { type: "berserker", count: 6, interval: 650 },
      { type: "protestor", count: 8, interval: 550, delay: 2000 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
      { type: "hexer", count: 5, interval: 700, delay: 2200 },
      { type: "senior", count: 4, interval: 1050, delay: 2200 },
    ],
    // Wave 8: Plaguebearer siege
    [
      { type: "plaguebearer", count: 4, interval: 950 },
      { type: "protestor", count: 8, interval: 550, delay: 2000 },
      { type: "athlete", count: 8, interval: 450, delay: 2200 },
      { type: "specter", count: 5, interval: 750, delay: 2200 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
    ],
    // Wave 9: Gradstudent boss wave
    [
      { type: "gradstudent", count: 3, interval: 2000 },
      { type: "senior", count: 5, interval: 900, delay: 2200 },
      { type: "protestor", count: 8, interval: 550, delay: 2200 },
      { type: "harpy", count: 5, interval: 750, delay: 2200 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
    ],
    // Wave 10: FINALE
    [
      { type: "gradstudent", count: 4, interval: 1600 },
      { type: "infernal", count: 4, interval: 1050, delay: 2000 },
      { type: "protestor", count: 8, interval: 550, delay: 2200 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "athlete", count: 8, interval: 450, delay: 2200 },
      { type: "assassin", count: 4, interval: 900, delay: 2200 },
    ],
  ],

  nassau: [
    // Wave 1
    [
      { type: "protestor", count: 6, interval: 580 },
      { type: "frosh", count: 10, interval: 450, delay: 2000 },
      { type: "archer", count: 5, interval: 700, delay: 2200 },
      { type: "athlete", count: 6, interval: 450, delay: 2200 },
    ],
    // Wave 2
    [
      { type: "junior", count: 5, interval: 750 },
      { type: "protestor", count: 6, interval: 580, delay: 2000 },
      { type: "cultist", count: 5, interval: 650, delay: 2200 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
      { type: "hexer", count: 4, interval: 750, delay: 2200 },
    ],
    // Wave 3: Air dominance
    [
      { type: "mascot", count: 6, interval: 700 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
      { type: "harpy", count: 5, interval: 750, delay: 2000 },
      { type: "protestor", count: 6, interval: 580, delay: 2200 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
    ],
    // Wave 4: Tank siege
    [
      { type: "senior", count: 5, interval: 950 },
      { type: "protestor", count: 8, interval: 550, delay: 2200 },
      { type: "archer", count: 6, interval: 650, delay: 2000 },
      { type: "athlete", count: 8, interval: 450, delay: 2200 },
      { type: "specter", count: 4, interval: 850, delay: 2200 },
    ],
    // Wave 5: Assassin strike
    [
      { type: "assassin", count: 5, interval: 750 },
      { type: "athlete", count: 8, interval: 450, delay: 2000 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
      { type: "berserker", count: 5, interval: 700, delay: 2200 },
      { type: "protestor", count: 6, interval: 580, delay: 2200 },
    ],
    // Wave 6: Mage barrage
    [
      { type: "mage", count: 5, interval: 850 },
      { type: "archer", count: 8, interval: 650, delay: 2200 },
      { type: "protestor", count: 6, interval: 580, delay: 2000 },
      { type: "warlock", count: 4, interval: 950, delay: 2200 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
    ],
    // Wave 7: Infernal invasion
    [
      { type: "infernal", count: 4, interval: 1100 },
      { type: "plaguebearer", count: 4, interval: 950, delay: 2200 },
      { type: "protestor", count: 8, interval: 550, delay: 2000 },
      { type: "hexer", count: 5, interval: 700, delay: 2200 },
      { type: "athlete", count: 8, interval: 450, delay: 2200 },
    ],
    // Wave 8: Professor arrives
    [
      { type: "professor", count: 3, interval: 2200 },
      { type: "gradstudent", count: 4, interval: 1300, delay: 2200 },
      { type: "protestor", count: 8, interval: 550, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "frosh", count: 10, interval: 450, delay: 2200 },
    ],
    // Wave 9: Wyvern terror
    [
      { type: "wyvern", count: 5, interval: 1050 },
      { type: "harpy", count: 6, interval: 750, delay: 2000 },
      { type: "senior", count: 5, interval: 900, delay: 2200 },
      { type: "protestor", count: 8, interval: 550, delay: 2200 },
      { type: "berserker", count: 5, interval: 700, delay: 2200 },
    ],
    // Wave 10: Juggernaut siege
    [
      { type: "juggernaut", count: 1, interval: 3200 },
      { type: "professor", count: 3, interval: 2000, delay: 2000 },
      { type: "protestor", count: 8, interval: 550, delay: 2000 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "athlete", count: 8, interval: 450, delay: 2200 },
    ],
    // Wave 11: Dean's arrival
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "professor", count: 4, interval: 1600, delay: 2200 },
      { type: "shadow_knight", count: 4, interval: 1300, delay: 2200 },
      { type: "protestor", count: 8, interval: 550, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
    ],
    // Wave 12: NASSAU FINALE
    [
      { type: "dean", count: 3, interval: 2600 }, // Double Dean!
      { type: "professor", count: 5, interval: 1400, delay: 2000 }, // Prof squad
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 }, // MEGA
      { type: "infernal", count: 6, interval: 950, delay: 2200 }, // Fire army
      { type: "banshee", count: 8, interval: 700, delay: 2200 }, // Screaming death
      { type: "assassin", count: 6, interval: 850, delay: 2200 }, // Kill squad
    ],
  ],

  // =====================
  // SWAMP REGION - Dark magic horror
  // Regional troops: bog_creature, will_o_wisp, swamp_troll
  // =====================
  bog: [
    // Wave 1: Basic swamp introduction
    [
      { type: "bog_creature", count: 8, interval: 500 }, // Regional fodder
      { type: "bog_creature", count: 6, interval: 500, delay: 2200 },
      { type: "cultist", count: 4, interval: 650, delay: 2000 }, // Dark magic
      { type: "will_o_wisp", count: 5, interval: 450, delay: 2200 }, // Regional speed
    ],
    // Wave 2: Mixed with tanks
    [
      { type: "swamp_troll", count: 3, interval: 1150 }, // Regional tank
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
      { type: "hexer", count: 4, interval: 750, delay: 2200 }, // Curse magic
      { type: "will_o_wisp", count: 6, interval: 450, delay: 2200 },
      { type: "specter", count: 4, interval: 850, delay: 2200 }, // Ghostly variety
    ],
    // Wave 3: Flying introduction
    [
      { type: "harpy", count: 5, interval: 700 }, // Flying variety
      { type: "bog_creature", count: 10, interval: 480, delay: 2000 },
      { type: "swamp_troll", count: 4, interval: 1100, delay: 2200 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 }, // Flying screamers
      { type: "will_o_wisp", count: 6, interval: 450, delay: 2200 },
    ],
    // Wave 4: Ranged threat
    [
      { type: "archer", count: 5, interval: 700 },
      { type: "swamp_troll", count: 4, interval: 1100, delay: 2000 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
      { type: "mage", count: 4, interval: 900, delay: 2200 },
      { type: "will_o_wisp", count: 6, interval: 450, delay: 2200 },
    ],
    // Wave 5: Senior tanks
    [
      { type: "senior", count: 4, interval: 1150 }, // Boss tier
      { type: "swamp_troll", count: 4, interval: 1100, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
      { type: "plaguebearer", count: 4, interval: 900, delay: 2200 }, // Disease
      { type: "will_o_wisp", count: 6, interval: 450, delay: 2200 },
    ],
    // Wave 6: Speed assault
    [
      { type: "will_o_wisp", count: 10, interval: 400 }, // Fast regional
      { type: "assassin", count: 4, interval: 850, delay: 2000 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
      { type: "harpy", count: 5, interval: 700, delay: 2200 },
      { type: "swamp_troll", count: 4, interval: 1100, delay: 2200 },
    ],
    // Wave 7: Necromancer rises
    [
      { type: "necromancer", count: 3, interval: 1600 }, // Dark magic
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2000 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2000 },
      { type: "specter", count: 5, interval: 750, delay: 2200 },
      { type: "berserker", count: 4, interval: 750, delay: 2200 },
    ],
    // Wave 8: Tank wall
    [
      { type: "swamp_troll", count: 5, interval: 950 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2000 },
      { type: "shadow_knight", count: 3, interval: 1800, delay: 2200 },
      { type: "will_o_wisp", count: 8, interval: 450, delay: 2200 },
    ],
    // Wave 9: Air dominance
    [
      { type: "banshee", count: 5, interval: 850 },
      { type: "wyvern", count: 3, interval: 1400, delay: 2000 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
      { type: "harpy", count: 5, interval: 700, delay: 2200 },
    ],
    // Wave 10: FINALE
    [
      { type: "gradstudent", count: 3, interval: 1800 },
      { type: "swamp_troll", count: 5, interval: 950, delay: 2000 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2200 },
      { type: "bog_creature", count: 13, interval: 450, delay: 2200 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "will_o_wisp", count: 8, interval: 450, delay: 2200 },
    ],
  ],

  witch_hut: [
    // Wave 1
    [
      { type: "bog_creature", count: 8, interval: 500 },
      { type: "will_o_wisp", count: 6, interval: 450, delay: 2000 },
      { type: "hexer", count: 4, interval: 750, delay: 2200 },
      { type: "swamp_troll", count: 3, interval: 1150, delay: 2200 },
    ],
    // Wave 2: Flying introduction
    [
      { type: "harpy", count: 5, interval: 700 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2000 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
      { type: "will_o_wisp", count: 6, interval: 450, delay: 2200 },
      { type: "specter", count: 4, interval: 850, delay: 2200 },
    ],
    // Wave 3: Tank push
    [
      { type: "swamp_troll", count: 5, interval: 1050 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2000 },
      { type: "mage", count: 4, interval: 900, delay: 2200 },
      { type: "will_o_wisp", count: 6, interval: 450, delay: 2200 },
    ],
    // Wave 4: Assassin strike
    [
      { type: "assassin", count: 5, interval: 750 },
      { type: "will_o_wisp", count: 8, interval: 450, delay: 2000 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
      { type: "berserker", count: 5, interval: 700, delay: 2200 },
      { type: "swamp_troll", count: 4, interval: 1100, delay: 2200 },
    ],
    // Wave 5: Ranged wave
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "mage", count: 5, interval: 850, delay: 2200 },
      { type: "swamp_troll", count: 4, interval: 1100, delay: 2000 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
      { type: "warlock", count: 4, interval: 950, delay: 2200 },
    ],
    // Wave 6: Flying assault
    [
      { type: "mascot", count: 6, interval: 700 },
      { type: "wyvern", count: 3, interval: 1300, delay: 2200 },
      { type: "will_o_wisp", count: 8, interval: 450, delay: 2000 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 7: Necromancer arrives
    [
      { type: "necromancer", count: 4, interval: 1400 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "specter", count: 5, interval: 750, delay: 2000 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
      { type: "shadow_knight", count: 3, interval: 1800, delay: 2200 },
    ],
    // Wave 8: Plaguebearer siege
    [
      { type: "plaguebearer", count: 5, interval: 900 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "infernal", count: 4, interval: 1050, delay: 2000 },
      { type: "will_o_wisp", count: 8, interval: 450, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 9: Professor boss wave
    [
      { type: "professor", count: 3, interval: 2200 },
      { type: "gradstudent", count: 4, interval: 1300, delay: 2200 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "harpy", count: 5, interval: 700, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 10: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 5, interval: 900, delay: 2200 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "will_o_wisp", count: 8, interval: 450, delay: 2200 },
    ],
    // Wave 11: Shadow convergence
    [
      { type: "shadow_knight", count: 5, interval: 1150 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2000 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "bog_creature", count: 13, interval: 450, delay: 2200 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
    ],
    // Wave 12: Infernal invasion
    [
      { type: "infernal", count: 5, interval: 950 },
      { type: "professor", count: 3, interval: 2000, delay: 2000 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "specter", count: 6, interval: 700, delay: 2200 },
      { type: "will_o_wisp", count: 10, interval: 420, delay: 2200 },
    ],
    // Wave 13: Juggernaut push
    [
      { type: "juggernaut", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2200 },
      { type: "swamp_troll", count: 6, interval: 950, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "bog_creature", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 14: FINALE
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 4, interval: 1600, delay: 2200 },
      { type: "shadow_knight", count: 5, interval: 1150, delay: 2200 },
      { type: "swamp_troll", count: 6, interval: 950, delay: 2200 },
      { type: "banshee", count: 6, interval: 750, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
    ],
  ],

  sunken_temple: [
    // 18 waves - Ancient swamp horrors
    // Wave 1
    [
      { type: "bog_creature", count: 8, interval: 500 },
      { type: "will_o_wisp", count: 6, interval: 450, delay: 2000 },
      { type: "hexer", count: 4, interval: 750, delay: 2200 },
      { type: "swamp_troll", count: 4, interval: 1100, delay: 2200 },
    ],
    // Wave 2: Flying wave
    [
      { type: "harpy", count: 6, interval: 700 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2000 },
      { type: "swamp_troll", count: 4, interval: 1100, delay: 2200 },
      { type: "wyvern", count: 3, interval: 1300, delay: 2200 },
    ],
    // Wave 3: Tank push
    [
      { type: "swamp_troll", count: 5, interval: 1050 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2000 },
      { type: "plaguebearer", count: 4, interval: 900, delay: 2200 },
      { type: "will_o_wisp", count: 6, interval: 450, delay: 2200 },
    ],
    // Wave 4: Ranged assault
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "mage", count: 5, interval: 850, delay: 2200 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2000 },
      { type: "warlock", count: 4, interval: 950, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 5: Speed assault
    [
      { type: "will_o_wisp", count: 10, interval: 400 },
      { type: "assassin", count: 5, interval: 750, delay: 2000 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
      { type: "harpy", count: 5, interval: 700, delay: 2200 },
      { type: "swamp_troll", count: 4, interval: 1100, delay: 2200 },
    ],
    // Wave 6: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 1400 },
      { type: "specter", count: 5, interval: 750, delay: 2200 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2000 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
      { type: "shadow_knight", count: 3, interval: 1800, delay: 2200 },
    ],
    // Wave 7: Berserker charge
    [
      { type: "berserker", count: 6, interval: 650 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "infernal", count: 4, interval: 1050, delay: 2000 },
      { type: "will_o_wisp", count: 8, interval: 450, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 8: Professor boss
    [
      { type: "professor", count: 3, interval: 2200 },
      { type: "gradstudent", count: 4, interval: 1300, delay: 2200 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 9: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 5, interval: 900, delay: 2200 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "will_o_wisp", count: 8, interval: 450, delay: 2200 },
    ],
    // Wave 10: Shadow convergence
    [
      { type: "shadow_knight", count: 5, interval: 1150 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2000 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "specter", count: 6, interval: 700, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 11: Air superiority
    [
      { type: "wyvern", count: 5, interval: 1050 },
      { type: "harpy", count: 6, interval: 700, delay: 2000 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2200 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "will_o_wisp", count: 8, interval: 450, delay: 2200 },
    ],
    // Wave 12: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "professor", count: 3, interval: 2000, delay: 2200 },
      { type: "swamp_troll", count: 6, interval: 950, delay: 2200 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 13: Juggernaut push
    [
      { type: "juggernaut", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2200 },
      { type: "swamp_troll", count: 6, interval: 950, delay: 2200 },
      { type: "shadow_knight", count: 4, interval: 1600, delay: 2200 },
      { type: "will_o_wisp", count: 10, interval: 420, delay: 2200 },
    ],
    // Wave 14: Magic barrage
    [
      { type: "warlock", count: 5, interval: 900 },
      { type: "mage", count: 6, interval: 750, delay: 2200 },
      { type: "swamp_troll", count: 5, interval: 1050, delay: 2000 },
      { type: "hexer", count: 5, interval: 700, delay: 2200 },
      { type: "bog_creature", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 15: Dean council
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 4, interval: 1600, delay: 2000 },
      { type: "swamp_troll", count: 6, interval: 950, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2000 },
      { type: "will_o_wisp", count: 10, interval: 420, delay: 2200 },
    ],
    // Wave 16: Trustee power
    [
      { type: "trustee", count: 1, interval: 2900 },
      { type: "dean", count: 1, interval: 2600, delay: 2200 },
      { type: "swamp_troll", count: 6, interval: 950, delay: 2200 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2200 },
      { type: "bog_creature", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 17: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2200 },
      { type: "swamp_troll", count: 6, interval: 950, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
      { type: "banshee", count: 6, interval: 750, delay: 2200 },
    ],
    // Wave 18: FINALE
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dean", count: 3, interval: 2200, delay: 2200 },
      { type: "swamp_troll", count: 8, interval: 900, delay: 2200 },
      { type: "shadow_knight", count: 5, interval: 1150, delay: 2200 },
      { type: "wyvern", count: 5, interval: 1050, delay: 2200 },
      { type: "professor", count: 4, interval: 1600, delay: 2200 },
    ],
  ],

  // =====================
  // DESERT REGION - Ranged assault
  // Regional troops: nomad, scorpion, scarab
  // =====================
  oasis: [
    // Wave 1: Basic introduction
    [
      { type: "nomad", count: 8, interval: 500 }, // Regional fodder
      { type: "nomad", count: 6, interval: 500, delay: 2200 },
      { type: "archer", count: 4, interval: 700, delay: 2000 }, // Ranged variety
      { type: "scarab", count: 6, interval: 420, delay: 2200 }, // Regional swarm
    ],
    // Wave 2: Tank introduction
    [
      { type: "scorpion", count: 4, interval: 1050 }, // Regional tank
      { type: "nomad", count: 10, interval: 480, delay: 2000 },
      { type: "cultist", count: 4, interval: 650, delay: 2200 },
      { type: "scarab", count: 8, interval: 420, delay: 2200 },
      { type: "hexer", count: 3, interval: 750, delay: 2200 },
    ],
    // Wave 3: Flying introduction
    [
      { type: "mascot", count: 5, interval: 700 },
      { type: "scorpion", count: 4, interval: 1050, delay: 2000 },
      { type: "nomad", count: 10, interval: 480, delay: 2200 },
      { type: "harpy", count: 4, interval: 750, delay: 2200 },
      { type: "scarab", count: 6, interval: 420, delay: 2200 },
    ],
    // Wave 4: Ranged assault
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "mage", count: 4, interval: 900, delay: 2200 },
      { type: "scorpion", count: 4, interval: 1050, delay: 2000 },
      { type: "nomad", count: 10, interval: 480, delay: 2200 },
      { type: "specter", count: 4, interval: 850, delay: 2200 },
    ],
    // Wave 5: Senior boss
    [
      { type: "senior", count: 4, interval: 1150 },
      { type: "scorpion", count: 5, interval: 950, delay: 2000 },
      { type: "nomad", count: 10, interval: 480, delay: 2200 },
      { type: "berserker", count: 4, interval: 750, delay: 2200 },
      { type: "scarab", count: 8, interval: 420, delay: 2200 },
    ],
    // Wave 6: Speed wave
    [
      { type: "scarab", count: 13, interval: 550 }, // Fast swarm
      { type: "assassin", count: 4, interval: 850, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2000 },
      { type: "harpy", count: 5, interval: 700, delay: 2200 },
      { type: "scorpion", count: 4, interval: 1050, delay: 2200 },
    ],
    // Wave 7: Tank wall
    [
      { type: "scorpion", count: 5, interval: 950 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2000 },
      { type: "plaguebearer", count: 4, interval: 900, delay: 2200 },
      { type: "scarab", count: 8, interval: 420, delay: 2200 },
    ],
    // Wave 8: Sandworm terror
    [
      { type: "sandworm", count: 4, interval: 1150 },
      { type: "scorpion", count: 5, interval: 950, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2000 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "scarab", count: 8, interval: 420, delay: 2200 },
    ],
    // Wave 9: Gradstudent boss
    [
      { type: "gradstudent", count: 3, interval: 1800 },
      { type: "senior", count: 5, interval: 900, delay: 2000 },
      { type: "scorpion", count: 5, interval: 950, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 10: FINALE
    [
      { type: "gradstudent", count: 4, interval: 1600 },
      { type: "scorpion", count: 6, interval: 900, delay: 2200 },
      { type: "sandworm", count: 4, interval: 1150, delay: 2200 },
      { type: "nomad", count: 13, interval: 450, delay: 2200 },
      { type: "shadow_knight", count: 4, interval: 1600, delay: 2200 },
      { type: "scarab", count: 10, interval: 400, delay: 2200 },
    ],
  ],

  pyramid: [
    // 12 waves - Pyramid assault
    // Wave 1
    [
      { type: "nomad", count: 8, interval: 500 },
      { type: "scarab", count: 8, interval: 420, delay: 2000 },
      { type: "archer", count: 5, interval: 700, delay: 2200 },
      { type: "scorpion", count: 4, interval: 1050, delay: 2200 },
    ],
    // Wave 2: Flying wave
    [
      { type: "mascot", count: 6, interval: 700 },
      { type: "harpy", count: 5, interval: 750, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2000 },
      { type: "scorpion", count: 4, interval: 1050, delay: 2200 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
    ],
    // Wave 3: Tank push
    [
      { type: "scorpion", count: 5, interval: 950 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2000 },
      { type: "plaguebearer", count: 4, interval: 900, delay: 2200 },
      { type: "scarab", count: 8, interval: 420, delay: 2200 },
    ],
    // Wave 4: Ranged barrage
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "mage", count: 5, interval: 850, delay: 2200 },
      { type: "scorpion", count: 5, interval: 950, delay: 2000 },
      { type: "warlock", count: 4, interval: 950, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 5: Sandworm terror
    [
      { type: "sandworm", count: 4, interval: 1150 },
      { type: "scorpion", count: 5, interval: 950, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2000 },
      { type: "berserker", count: 5, interval: 700, delay: 2200 },
      { type: "scarab", count: 8, interval: 420, delay: 2200 },
    ],
    // Wave 6: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 1400 },
      { type: "specter", count: 5, interval: 750, delay: 2200 },
      { type: "scorpion", count: 5, interval: 950, delay: 2000 },
      { type: "nomad", count: 10, interval: 480, delay: 2200 },
      { type: "shadow_knight", count: 3, interval: 1800, delay: 2200 },
    ],
    // Wave 7: Professor boss
    [
      { type: "professor", count: 3, interval: 2200 },
      { type: "gradstudent", count: 4, interval: 1300, delay: 2200 },
      { type: "scorpion", count: 5, interval: 950, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 8: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 5, interval: 900, delay: 2200 },
      { type: "scorpion", count: 5, interval: 950, delay: 2200 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "scarab", count: 10, interval: 400, delay: 2200 },
    ],
    // Wave 9: Air dominance
    [
      { type: "wyvern", count: 5, interval: 1050 },
      { type: "harpy", count: 6, interval: 700, delay: 2000 },
      { type: "scorpion", count: 5, interval: 950, delay: 2200 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 10: Shadow convergence
    [
      { type: "shadow_knight", count: 5, interval: 1150 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2000 },
      { type: "scorpion", count: 5, interval: 950, delay: 2200 },
      { type: "specter", count: 6, interval: 700, delay: 2200 },
      { type: "scarab", count: 10, interval: 400, delay: 2200 },
    ],
    // Wave 11: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 4, interval: 1600, delay: 2000 },
      { type: "scorpion", count: 6, interval: 900, delay: 2200 },
      { type: "sandworm", count: 4, interval: 1150, delay: 2000 },
      { type: "nomad", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 12: FINALE
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2200 },
      { type: "scorpion", count: 6, interval: 900, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
      { type: "wyvern", count: 5, interval: 1050, delay: 2200 },
      { type: "catapult", count: 4, interval: 1400, delay: 2200 },
    ],
  ],

  sphinx: [
    // 14 waves - Sphinx gauntlet
    // Wave 1
    [
      { type: "nomad", count: 8, interval: 500 },
      { type: "scarab", count: 8, interval: 420, delay: 2000 },
      { type: "hexer", count: 4, interval: 750, delay: 2200 },
      { type: "scorpion", count: 4, interval: 1050, delay: 2200 },
    ],
    // Wave 2: Flying wave
    [
      { type: "harpy", count: 6, interval: 700 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2000 },
      { type: "scorpion", count: 4, interval: 1050, delay: 2200 },
      { type: "wyvern", count: 3, interval: 1300, delay: 2200 },
    ],
    // Wave 3: Tank push
    [
      { type: "scorpion", count: 5, interval: 950 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2000 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "scarab", count: 8, interval: 420, delay: 2200 },
    ],
    // Wave 4: Ranged assault
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "mage", count: 5, interval: 850, delay: 2200 },
      { type: "scorpion", count: 5, interval: 950, delay: 2000 },
      { type: "warlock", count: 4, interval: 950, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 5: Sandworm terror
    [
      { type: "sandworm", count: 5, interval: 1050 },
      { type: "scorpion", count: 5, interval: 950, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2000 },
      { type: "berserker", count: 5, interval: 700, delay: 2200 },
      { type: "scarab", count: 10, interval: 400, delay: 2200 },
    ],
    // Wave 6: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 1400 },
      { type: "specter", count: 5, interval: 750, delay: 2200 },
      { type: "scorpion", count: 5, interval: 950, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1600, delay: 2200 },
      { type: "nomad", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 7: Professor boss
    [
      { type: "professor", count: 3, interval: 2200 },
      { type: "gradstudent", count: 4, interval: 1300, delay: 2200 },
      { type: "scorpion", count: 5, interval: 950, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "scarab", count: 10, interval: 400, delay: 2200 },
    ],
    // Wave 8: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 6, interval: 850, delay: 2200 },
      { type: "scorpion", count: 6, interval: 900, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
      { type: "nomad", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 9: Air dominance
    [
      { type: "wyvern", count: 5, interval: 1050 },
      { type: "harpy", count: 6, interval: 700, delay: 2000 },
      { type: "scorpion", count: 5, interval: 950, delay: 2200 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "scarab", count: 10, interval: 400, delay: 2200 },
    ],
    // Wave 10: Dragon awakens
    [
      { type: "dragon", count: 1, interval: 3200 },
      { type: "professor", count: 3, interval: 2000, delay: 2000 },
      { type: "scorpion", count: 6, interval: 900, delay: 2200 },
      { type: "sandworm", count: 5, interval: 1050, delay: 2000 },
      { type: "nomad", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 11: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "scorpion", count: 6, interval: 900, delay: 2200 },
      { type: "shadow_knight", count: 5, interval: 1150, delay: 2000 },
      { type: "scarab", count: 13, interval: 400, delay: 2200 },
    ],
    // Wave 12: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "scorpion", count: 6, interval: 900, delay: 2200 },
      { type: "wyvern", count: 5, interval: 1050, delay: 2000 },
      { type: "nomad", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 13: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dragon", count: 1, interval: 2900, delay: 2200 },
      { type: "scorpion", count: 8, interval: 850, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
      { type: "sandworm", count: 5, interval: 1050, delay: 2200 },
    ],
    // Wave 14: FINALE
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dragon", count: 3, interval: 2200, delay: 2000 },
      { type: "scorpion", count: 8, interval: 850, delay: 2200 },
      { type: "dean", count: 3, interval: 2200, delay: 2200 },
      { type: "necromancer", count: 5, interval: 1300, delay: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 23000 },
    ],
  ],

  // =====================
  // WINTER REGION - Brutal variety
  // Regional troops: snow_goblin, yeti, ice_witch
  // =====================
  glacier: [
    // Wave 1: Basic introduction
    [
      { type: "snow_goblin", count: 8, interval: 500 }, // Regional fodder
      { type: "snow_goblin", count: 6, interval: 500, delay: 2200 },
      { type: "hexer", count: 4, interval: 750, delay: 2000 }, // Curse magic
      { type: "yeti", count: 3, interval: 1150, delay: 2200 }, // Regional tank
    ],
    // Wave 2: Tank introduction
    [
      { type: "yeti", count: 4, interval: 1100 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2000 },
      { type: "cultist", count: 4, interval: 650, delay: 2200 },
      { type: "ice_witch", count: 4, interval: 900, delay: 2200 },
      { type: "specter", count: 3, interval: 850, delay: 2200 },
    ],
    // Wave 3: Flying introduction
    [
      { type: "mascot", count: 5, interval: 700 },
      { type: "yeti", count: 4, interval: 1100, delay: 2000 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
      { type: "harpy", count: 4, interval: 750, delay: 2200 },
      { type: "ice_witch", count: 4, interval: 900, delay: 2200 },
    ],
    // Wave 4: Ranged assault
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "mage", count: 4, interval: 900, delay: 2200 },
      { type: "yeti", count: 4, interval: 1100, delay: 2000 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
      { type: "warlock", count: 3, interval: 950, delay: 2200 },
    ],
    // Wave 5: Senior boss
    [
      { type: "senior", count: 4, interval: 1150 },
      { type: "yeti", count: 5, interval: 1050, delay: 2000 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
      { type: "berserker", count: 4, interval: 750, delay: 2200 },
      { type: "ice_witch", count: 4, interval: 900, delay: 2200 },
    ],
    // Wave 6: Speed wave
    [
      { type: "ice_witch", count: 5, interval: 850 }, // Fast magic
      { type: "assassin", count: 4, interval: 850, delay: 2000 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
      { type: "harpy", count: 5, interval: 700, delay: 2200 },
      { type: "yeti", count: 4, interval: 1100, delay: 2200 },
    ],
    // Wave 7: Tank wall
    [
      { type: "yeti", count: 5, interval: 950 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2000 },
      { type: "plaguebearer", count: 4, interval: 900, delay: 2200 },
      { type: "ice_witch", count: 4, interval: 900, delay: 2200 },
    ],
    // Wave 8: Necromancer rises
    [
      { type: "necromancer", count: 3, interval: 1600 },
      { type: "yeti", count: 5, interval: 1050, delay: 2000 },
      { type: "specter", count: 5, interval: 750, delay: 2000 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
      { type: "shadow_knight", count: 3, interval: 1800, delay: 2200 },
    ],
    // Wave 9: Air dominance
    [
      { type: "wyvern", count: 4, interval: 1150 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
      { type: "yeti", count: 5, interval: 1050, delay: 2000 },
      { type: "harpy", count: 5, interval: 700, delay: 2200 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 10: Professor boss
    [
      { type: "professor", count: 3, interval: 2200 },
      { type: "gradstudent", count: 4, interval: 1300, delay: 2200 },
      { type: "yeti", count: 5, interval: 1050, delay: 2200 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "ice_witch", count: 5, interval: 850, delay: 2200 },
    ],
    // Wave 11: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 5, interval: 900, delay: 2200 },
      { type: "yeti", count: 5, interval: 1050, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 12: FINALE
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "shadow_knight", count: 4, interval: 1600, delay: 2200 },
      { type: "snow_goblin", count: 13, interval: 450, delay: 2200 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "ice_witch", count: 5, interval: 850, delay: 2200 },
    ],
  ],

  fortress: [
    // 14 waves - Fortress winter siege
    // Wave 1
    [
      { type: "snow_goblin", count: 8, interval: 500 },
      { type: "yeti", count: 3, interval: 1150, delay: 2000 },
      { type: "archer", count: 5, interval: 700, delay: 2200 },
      { type: "ice_witch", count: 4, interval: 900, delay: 2200 },
    ],
    // Wave 2: Flying wave
    [
      { type: "harpy", count: 6, interval: 700 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2000 },
      { type: "yeti", count: 4, interval: 1100, delay: 2200 },
      { type: "wyvern", count: 3, interval: 1300, delay: 2200 },
    ],
    // Wave 3: Tank push
    [
      { type: "yeti", count: 5, interval: 1050 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2000 },
      { type: "plaguebearer", count: 4, interval: 900, delay: 2200 },
      { type: "ice_witch", count: 4, interval: 900, delay: 2200 },
    ],
    // Wave 4: Ranged barrage
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "mage", count: 5, interval: 850, delay: 2200 },
      { type: "yeti", count: 5, interval: 1050, delay: 2000 },
      { type: "warlock", count: 4, interval: 950, delay: 2200 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 5: Assassin strike
    [
      { type: "assassin", count: 5, interval: 750 },
      { type: "ice_witch", count: 5, interval: 850, delay: 2000 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
      { type: "berserker", count: 5, interval: 700, delay: 2200 },
      { type: "yeti", count: 4, interval: 1100, delay: 2200 },
    ],
    // Wave 6: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 1400 },
      { type: "specter", count: 5, interval: 750, delay: 2200 },
      { type: "yeti", count: 5, interval: 1050, delay: 2000 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
      { type: "shadow_knight", count: 3, interval: 1800, delay: 2200 },
    ],
    // Wave 7: Professor boss
    [
      { type: "professor", count: 3, interval: 2200 },
      { type: "gradstudent", count: 4, interval: 1300, delay: 2200 },
      { type: "yeti", count: 5, interval: 1050, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "ice_witch", count: 5, interval: 850, delay: 2200 },
    ],
    // Wave 8: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 6, interval: 850, delay: 2200 },
      { type: "yeti", count: 5, interval: 1050, delay: 2200 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "snow_goblin", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 9: Air dominance
    [
      { type: "wyvern", count: 5, interval: 1050 },
      { type: "harpy", count: 6, interval: 700, delay: 2000 },
      { type: "yeti", count: 5, interval: 1050, delay: 2200 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "ice_witch", count: 5, interval: 850, delay: 2200 },
    ],
    // Wave 10: Shadow convergence
    [
      { type: "shadow_knight", count: 5, interval: 1150 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2000 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "specter", count: 6, interval: 700, delay: 2200 },
      { type: "snow_goblin", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 11: Juggernaut push
    [
      { type: "juggernaut", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2200 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "ice_witch", count: 5, interval: 850, delay: 2200 },
    ],
    // Wave 12: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 4, interval: 1600, delay: 2000 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2000 },
      { type: "snow_goblin", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 13: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "shadow_knight", count: 5, interval: 1150, delay: 2000 },
      { type: "ice_witch", count: 6, interval: 750, delay: 2200 },
    ],
    // Wave 14: FINALE
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dean", count: 3, interval: 2200, delay: 2200 },
      { type: "yeti", count: 8, interval: 900, delay: 2200 },
      { type: "dragon", count: 1, interval: 2900, delay: 2200 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 20000 },
    ],
  ],

  peak: [
    // 16 waves - Summit challenge
    // Wave 1
    [
      { type: "snow_goblin", count: 8, interval: 500 },
      { type: "yeti", count: 3, interval: 1150, delay: 2000 },
      { type: "hexer", count: 4, interval: 750, delay: 2200 },
      { type: "ice_witch", count: 4, interval: 900, delay: 2200 },
    ],
    // Wave 2: Flying wave
    [
      { type: "harpy", count: 6, interval: 700 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2000 },
      { type: "yeti", count: 4, interval: 1100, delay: 2200 },
      { type: "wyvern", count: 3, interval: 1300, delay: 2200 },
    ],
    // Wave 3: Tank push
    [
      { type: "yeti", count: 5, interval: 1050 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2000 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "ice_witch", count: 4, interval: 900, delay: 2200 },
    ],
    // Wave 4: Ranged assault
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "mage", count: 5, interval: 850, delay: 2200 },
      { type: "yeti", count: 5, interval: 1050, delay: 2000 },
      { type: "warlock", count: 4, interval: 950, delay: 2200 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 5: Assassin strike
    [
      { type: "assassin", count: 5, interval: 750 },
      { type: "ice_witch", count: 5, interval: 850, delay: 2000 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
      { type: "berserker", count: 5, interval: 700, delay: 2200 },
      { type: "yeti", count: 4, interval: 1100, delay: 2200 },
    ],
    // Wave 6: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 1400 },
      { type: "specter", count: 5, interval: 750, delay: 2200 },
      { type: "yeti", count: 5, interval: 1050, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1600, delay: 2200 },
      { type: "ice_witch", count: 5, interval: 850, delay: 2200 },
    ],
    // Wave 7: Professor boss
    [
      { type: "professor", count: 3, interval: 2200 },
      { type: "gradstudent", count: 4, interval: 1300, delay: 2200 },
      { type: "yeti", count: 5, interval: 1050, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "snow_goblin", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 8: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 6, interval: 850, delay: 2200 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
      { type: "ice_witch", count: 5, interval: 850, delay: 2200 },
    ],
    // Wave 9: Air dominance
    [
      { type: "wyvern", count: 5, interval: 1050 },
      { type: "harpy", count: 6, interval: 700, delay: 2000 },
      { type: "yeti", count: 5, interval: 1050, delay: 2200 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "snow_goblin", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 10: Shadow convergence
    [
      { type: "shadow_knight", count: 5, interval: 1150 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2000 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "specter", count: 6, interval: 700, delay: 2200 },
      { type: "ice_witch", count: 5, interval: 850, delay: 2200 },
    ],
    // Wave 11: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "dragon", count: 1, interval: 2900, delay: 2000 },
      { type: "snow_goblin", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 12: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "wyvern", count: 5, interval: 1050, delay: 2000 },
      { type: "ice_witch", count: 6, interval: 750, delay: 2200 },
    ],
    // Wave 13: Golem awakens
    [
      { type: "golem", count: 1, interval: 2600 },
      { type: "professor", count: 3, interval: 2000, delay: 2200 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
      { type: "snow_goblin", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 14: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dean", count: 1, interval: 2600, delay: 2200 },
      { type: "yeti", count: 6, interval: 950, delay: 2200 },
      { type: "shadow_knight", count: 5, interval: 1150, delay: 2200 },
      { type: "ice_witch", count: 6, interval: 750, delay: 2200 },
    ],
    // Wave 15: Dragon flight
    [
      { type: "dragon", count: 3, interval: 2200 },
      { type: "trustee", count: 1, interval: 2900, delay: 2200 },
      { type: "yeti", count: 8, interval: 900, delay: 2200 },
      { type: "wyvern", count: 5, interval: 1050, delay: 2200 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2200 },
    ],
    // Wave 16: FINALE
    [
      { type: "golem", count: 3, interval: 3200 },
      { type: "trustee", count: 3, interval: 2200, delay: 2200 },
      { type: "yeti", count: 8, interval: 900, delay: 2200 },
      { type: "dragon", count: 3, interval: 2200, delay: 2200 },
      { type: "dean", count: 3, interval: 2200, delay: 2200 },
      { type: "juggernaut", count: 3, interval: 2600, delay: 20000 },
    ],
  ],

  // =====================
  // VOLCANIC REGION - Ultimate challenge
  // Regional troops: magma_spawn, fire_imp, ember_guard
  // =====================
  lava: [
    // Wave 1: Basic introduction
    [
      { type: "fire_imp", count: 8, interval: 500 }, // Regional fodder
      { type: "fire_imp", count: 6, interval: 500, delay: 2200 },
      { type: "cultist", count: 4, interval: 650, delay: 2000 },
      { type: "magma_spawn", count: 4, interval: 900, delay: 2200 }, // Regional tank
    ],
    // Wave 2: Flying introduction
    [
      { type: "harpy", count: 5, interval: 700 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2000 },
      { type: "magma_spawn", count: 4, interval: 900, delay: 2200 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
      { type: "ember_guard", count: 3, interval: 1050, delay: 2200 },
    ],
    // Wave 3: Tank push
    [
      { type: "ember_guard", count: 5, interval: 950 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2000 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "magma_spawn", count: 4, interval: 900, delay: 2200 },
    ],
    // Wave 4: Ranged barrage
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "mage", count: 5, interval: 850, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2000 },
      { type: "warlock", count: 4, interval: 950, delay: 2200 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 5: Berserker charge
    [
      { type: "berserker", count: 6, interval: 650 },
      { type: "magma_spawn", count: 5, interval: 900, delay: 2000 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2200 },
      { type: "assassin", count: 4, interval: 850, delay: 2200 },
      { type: "ember_guard", count: 4, interval: 950, delay: 2200 },
    ],
    // Wave 6: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 1400 },
      { type: "specter", count: 5, interval: 750, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1600, delay: 2200 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 7: Professor boss
    [
      { type: "professor", count: 3, interval: 2200 },
      { type: "gradstudent", count: 4, interval: 1300, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "magma_spawn", count: 5, interval: 900, delay: 2200 },
    ],
    // Wave 8: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 6, interval: 850, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 9: Air dominance
    [
      { type: "wyvern", count: 5, interval: 1050 },
      { type: "harpy", count: 6, interval: 700, delay: 2000 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2200 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "magma_spawn", count: 5, interval: 900, delay: 2200 },
    ],
    // Wave 10: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "dragon", count: 1, interval: 2900, delay: 2000 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 11: Shadow convergence
    [
      { type: "shadow_knight", count: 5, interval: 1150 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "specter", count: 6, interval: 700, delay: 2200 },
      { type: "magma_spawn", count: 6, interval: 850, delay: 2200 },
    ],
    // Wave 12: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "wyvern", count: 5, interval: 1050, delay: 2000 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 13: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dragon", count: 1, interval: 2900, delay: 2200 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
      { type: "magma_spawn", count: 6, interval: 850, delay: 2200 },
    ],
    // Wave 14: FINALE
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dragon", count: 3, interval: 2200, delay: 2000 },
      { type: "ember_guard", count: 8, interval: 850, delay: 2200 },
      { type: "dean", count: 3, interval: 2200, delay: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2200 },
      { type: "golem", count: 1, interval: 2600, delay: 23000 },
    ],
  ],

  crater: [
    // 16 waves - Caldera challenge
    // Wave 1
    [
      { type: "fire_imp", count: 8, interval: 500 },
      { type: "magma_spawn", count: 4, interval: 900, delay: 2000 },
      { type: "hexer", count: 4, interval: 750, delay: 2200 },
      { type: "ember_guard", count: 4, interval: 950, delay: 2200 },
    ],
    // Wave 2: Flying wave
    [
      { type: "harpy", count: 6, interval: 700 },
      { type: "banshee", count: 4, interval: 900, delay: 2200 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2000 },
      { type: "magma_spawn", count: 4, interval: 900, delay: 2200 },
      { type: "wyvern", count: 3, interval: 1300, delay: 2200 },
    ],
    // Wave 3: Tank push
    [
      { type: "ember_guard", count: 5, interval: 950 },
      { type: "junior", count: 5, interval: 750, delay: 2200 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2000 },
      { type: "infernal", count: 4, interval: 1050, delay: 2200 },
      { type: "magma_spawn", count: 5, interval: 900, delay: 2200 },
    ],
    // Wave 4: Ranged assault
    [
      { type: "archer", count: 6, interval: 650 },
      { type: "mage", count: 5, interval: 850, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2000 },
      { type: "warlock", count: 4, interval: 950, delay: 2200 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2200 },
    ],
    // Wave 5: Assassin strike
    [
      { type: "assassin", count: 5, interval: 750 },
      { type: "magma_spawn", count: 5, interval: 900, delay: 2000 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2200 },
      { type: "berserker", count: 5, interval: 700, delay: 2200 },
      { type: "ember_guard", count: 4, interval: 950, delay: 2200 },
    ],
    // Wave 6: Necromancer ritual
    [
      { type: "necromancer", count: 4, interval: 1400 },
      { type: "specter", count: 5, interval: 750, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2000 },
      { type: "shadow_knight", count: 4, interval: 1600, delay: 2200 },
      { type: "magma_spawn", count: 5, interval: 900, delay: 2200 },
    ],
    // Wave 7: Professor boss
    [
      { type: "professor", count: 3, interval: 2200 },
      { type: "gradstudent", count: 4, interval: 1300, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2200 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 8: Dean arrives
    [
      { type: "dean", count: 1, interval: 3200 },
      { type: "senior", count: 6, interval: 850, delay: 2200 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
      { type: "magma_spawn", count: 6, interval: 850, delay: 2200 },
    ],
    // Wave 9: Air dominance
    [
      { type: "wyvern", count: 5, interval: 1050 },
      { type: "harpy", count: 6, interval: 700, delay: 2000 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2200 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 10: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "dragon", count: 1, interval: 2900, delay: 2000 },
      { type: "magma_spawn", count: 6, interval: 850, delay: 2200 },
    ],
    // Wave 11: Shadow convergence
    [
      { type: "shadow_knight", count: 5, interval: 1150 },
      { type: "necromancer", count: 4, interval: 1400, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "specter", count: 6, interval: 700, delay: 2200 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 12: Juggernaut push
    [
      { type: "juggernaut", count: 1, interval: 3200 },
      { type: "dean", count: 1, interval: 2600, delay: 2200 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "wyvern", count: 5, interval: 1050, delay: 2200 },
      { type: "magma_spawn", count: 6, interval: 850, delay: 2200 },
    ],
    // Wave 13: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 4, interval: 1600, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "infernal", count: 5, interval: 950, delay: 2000 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 14: Golem awakens
    [
      { type: "golem", count: 1, interval: 2600 },
      { type: "trustee", count: 1, interval: 2900, delay: 2200 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "dragon", count: 1, interval: 2900, delay: 2200 },
      { type: "magma_spawn", count: 6, interval: 850, delay: 2200 },
    ],
    // Wave 15: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dean", count: 3, interval: 2200, delay: 2200 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "dragon", count: 3, interval: 2200, delay: 2200 },
      { type: "magma_spawn", count: 8, interval: 850, delay: 2200 },
    ],
    // Wave 16: FINALE
    [
      { type: "trustee", count: 3, interval: 2200 },
      { type: "dragon", count: 3, interval: 2200, delay: 2000 },
      { type: "ember_guard", count: 8, interval: 850, delay: 2200 },
      { type: "golem", count: 3, interval: 3200, delay: 2200 },
      { type: "dean", count: 3, interval: 2200, delay: 2200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 23000 },
    ],
  ],

  throne: [
    // 18 waves - Ultimate challenge
    // Wave 1
    [
      { type: "fire_imp", count: 8, interval: 500 },
      { type: "magma_spawn", count: 4, interval: 900, delay: 2000 },
      { type: "hexer", count: 4, interval: 750, delay: 2200 },
      { type: "ember_guard", count: 4, interval: 950, delay: 2200 },
    ],
    // Wave 2: Flying wave
    [
      { type: "harpy", count: 6, interval: 700 },
      { type: "banshee", count: 5, interval: 850, delay: 2200 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2000 },
      { type: "wyvern", count: 4, interval: 1150, delay: 2200 },
      { type: "magma_spawn", count: 4, interval: 900, delay: 2200 },
    ],
    // Wave 3: Tank push
    [
      { type: "ember_guard", count: 5, interval: 950 },
      { type: "senior", count: 6, interval: 850, delay: 2200 },
      { type: "fire_imp", count: 10, interval: 480, delay: 2000 },
      { type: "infernal", count: 5, interval: 950, delay: 2200 },
      { type: "magma_spawn", count: 5, interval: 900, delay: 2200 },
    ],
    // Wave 4: Ranged assault
    [
      { type: "archer", count: 8, interval: 650 },
      { type: "mage", count: 6, interval: 750, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2000 },
      { type: "warlock", count: 5, interval: 900, delay: 2200 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 5: Speed assault
    [
      { type: "assassin", count: 6, interval: 700 },
      { type: "magma_spawn", count: 5, interval: 900, delay: 2000 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
      { type: "berserker", count: 6, interval: 650, delay: 2200 },
      { type: "ember_guard", count: 5, interval: 950, delay: 2200 },
    ],
    // Wave 6: Necromancer ritual
    [
      { type: "necromancer", count: 5, interval: 1300 },
      { type: "specter", count: 6, interval: 700, delay: 2200 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2000 },
      { type: "shadow_knight", count: 5, interval: 1150, delay: 2200 },
      { type: "magma_spawn", count: 6, interval: 850, delay: 2200 },
    ],
    // Wave 7: Professor boss
    [
      { type: "professor", count: 4, interval: 2000 },
      { type: "gradstudent", count: 5, interval: 1150, delay: 2200 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "wyvern", count: 5, interval: 1050, delay: 2200 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 8: Dean arrives
    [
      { type: "dean", count: 3, interval: 2600 },
      { type: "senior", count: 6, interval: 850, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "dragon", count: 1, interval: 2900, delay: 2000 },
      { type: "magma_spawn", count: 6, interval: 850, delay: 2200 },
    ],
    // Wave 9: Air dominance
    [
      { type: "wyvern", count: 6, interval: 950 },
      { type: "harpy", count: 8, interval: 650, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "banshee", count: 6, interval: 750, delay: 2200 },
      { type: "fire_imp", count: 13, interval: 450, delay: 2200 },
    ],
    // Wave 10: Trustee arrival
    [
      { type: "trustee", count: 1, interval: 3200 },
      { type: "dean", count: 3, interval: 2200, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "dragon", count: 3, interval: 2200, delay: 2200 },
      { type: "magma_spawn", count: 8, interval: 850, delay: 19500 },
    ],
    // Wave 11: Shadow convergence
    [
      { type: "shadow_knight", count: 6, interval: 1100 },
      { type: "necromancer", count: 5, interval: 1300, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "specter", count: 8, interval: 650, delay: 2000 },
      { type: "fire_imp", count: 13, interval: 450, delay: 18500 },
    ],
    // Wave 12: Golem awakens
    [
      { type: "golem", count: 3, interval: 3200 },
      { type: "juggernaut", count: 1, interval: 3200, delay: 2000 },
      { type: "ember_guard", count: 6, interval: 900, delay: 2200 },
      { type: "infernal", count: 6, interval: 900, delay: 2000 },
      { type: "magma_spawn", count: 8, interval: 850, delay: 2200 },
    ],
    // Wave 13: Double Dean
    [
      { type: "dean", count: 3, interval: 2200 },
      { type: "professor", count: 4, interval: 1600, delay: 2000 },
      { type: "ember_guard", count: 8, interval: 850, delay: 2200 },
      { type: "wyvern", count: 6, interval: 950, delay: 2200 },
      { type: "fire_imp", count: 12, interval: 420, delay: 19500 },
    ],
    // Wave 14: Double Trustee
    [
      { type: "trustee", count: 3, interval: 2600 },
      { type: "dragon", count: 3, interval: 2200, delay: 2200 },
      { type: "ember_guard", count: 8, interval: 850, delay: 2200 },
      { type: "shadow_knight", count: 6, interval: 1100, delay: 2200 },
      { type: "magma_spawn", count: 8, interval: 850, delay: 2200 },
    ],
    // Wave 15: Dragon flight
    [
      { type: "dragon", count: 4, interval: 2000 },
      { type: "trustee", count: 1, interval: 2900, delay: 2200 },
      { type: "ember_guard", count: 8, interval: 850, delay: 2200 },
      { type: "wyvern", count: 6, interval: 950, delay: 2200 },
      { type: "necromancer", count: 5, interval: 1300, delay: 2200 },
    ],
    // Wave 16: Triple Trustee
    [
      { type: "trustee", count: 4, interval: 2200 },
      { type: "golem", count: 3, interval: 3200, delay: 2200 },
      { type: "ember_guard", count: 8, interval: 850, delay: 2200 },
      { type: "dragon", count: 3, interval: 2200, delay: 2200 },
      { type: "fire_imp", count: 12, interval: 420, delay: 21000 },
    ],
    // Wave 17: Ultimate assault
    [
      { type: "trustee", count: 4, interval: 2200 },
      { type: "dean", count: 3, interval: 2200, delay: 2200 },
      { type: "ember_guard", count: 8, interval: 850, delay: 2200 },
      { type: "juggernaut", count: 3, interval: 2600, delay: 2200 },
      { type: "dragon", count: 3, interval: 2200, delay: 21000 },
    ],
    // Wave 18: THE ULTIMATE FINALE
    [
      { type: "trustee", count: 5, interval: 2000 },
      { type: "golem", count: 4, interval: 2000, delay: 2000 },
      { type: "dean", count: 3, interval: 2200, delay: 2200 },
      { type: "dragon", count: 4, interval: 2000, delay: 2200 },
      { type: "juggernaut", count: 3, interval: 2600, delay: 2200 },
      { type: "ember_guard", count: 10, interval: 750, delay: 2200 },
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
export const GROUP_SPACING_MULTIPLIER = 1.25; // Gap between enemy groups within a wave (higher = more breathing room)
export const WAVE_INTERVAL_MULTIPLIER = 1.05; // Time between each enemy spawn within a group (higher = slower spawns)
export const WAVE_DELAY_MULTIPLIER = 1.25; // Gap between groups (higher = more spacing)
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
