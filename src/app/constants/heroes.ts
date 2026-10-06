import type { HeroData, HeroType } from "../types";

// Hero data - Enhanced HP for better survivability
export const HERO_DATA: Record<HeroType, HeroData> = {
  captain: {
    ability: "Rally Knights",
    abilityDesc: "Summons 3 armored knights to fight",
    attackSpeed: 700,
    color: "#dc2626",
    damage: 58,
    description:
      "A legendary commander wreathed in flame. Summons loyal knights to his banner.",
    hp: 4400,
    isRanged: false,
    name: "General Mercer",
    range: 100,
    speed: 2.5,
  },
  engineer: {
    ability: "Deploy Turret",
    abilityDesc: "Deploys a defensive turret that attacks enemies",
    attackSpeed: 600,
    color: "#eab308",
    damage: 42,
    description:
      "A brilliant inventor who deploys automated turrets designed in the Engineering Library. He needs more coffee.",
    hp: 2850,
    isRanged: true,
    name: "BSE Engineer",
    range: 150,
    speed: 3,
  },
  ivy: {
    ability: "Nature's Shift",
    abilityDesc:
      "Shifts between Ivy Warden and Verdant Colossus form. Warden heals troops; Colossus crushes enemies.",
    attackSpeed: 700,
    color: "#059669",
    damage: 30,
    description:
      "An ancient guardian spirit that embodies the ivy covering Princeton's Gothic towers. Commands living vines to entangle and crush enemies with nature's wrath.",
    hp: 4500,
    isRanged: true,
    name: "Ivy Warden",
    range: 180,
    speed: 2.3,
  },
  mathey: {
    ability: "Fortress Shield",
    abilityDesc: "Invincible for 10s and taunts all nearby enemies",
    attackSpeed: 850,
    color: "#6366f1",
    damage: 62,
    description:
      "An elite defender from Mathey College, clad in enchanted armor. Draws enemy aggression and protects allies.",
    hp: 5800,
    isRanged: false,
    name: "Mathey Knight",
    range: 80,
    speed: 2,
  },
  nassau: {
    ability: "Blue Inferno",
    abilityDesc:
      "Transforms into a blazing blue phoenix for 6s, shooting rapid-fire blue fireballs",
    attackSpeed: 1200,
    color: "#e67e22",
    damage: 30,
    description:
      "A mythical phoenix reborn from the flames of Nassau Hall. Soars above the battlefield raining fire, and is the only hero who can engage flying enemies in aerial combat.",
    hp: 3400,
    isFlying: true,
    isRanged: true,
    name: "Nassau Phoenix",
    range: 220,
    speed: 4.8,
  },
  rocky: {
    ability: "Boulder Bash",
    abilityDesc: "Throws massive boulders dealing huge AoE damage",
    attackSpeed: 750,
    color: "#8a7020",
    damage: 78,
    description:
      "A campus squirrel fused with an ancient gargoyle. Half fur, half stone — all fury. Hurls boulders with terrifying force.",
    hp: 3000,
    isRanged: true,
    name: "Rocky Raccoon",
    range: 180,
    speed: 2.8,
  },
  scott: {
    ability: "Inspiration Cheer",
    abilityDesc: "Boosts tower damage +50% and range +25% for 8s",
    attackSpeed: 650,
    color: "#14b8a6",
    damage: 38,
    description:
      "The ghost of F. Scott Fitzgerald inspires defenders with literary brilliance, boosting their combat effectiveness.",
    hp: 3100,
    isRanged: true,
    name: "F. Scott",
    range: 200,
    speed: 3.2,
  },
  tenor: {
    ability: "High Note",
    abilityDesc:
      "Devastating sonic blast stuns enemies and heals nearby allies",
    attackSpeed: 650,
    color: "#8b5cf6",
    damage: 34,
    description:
      "A virtuoso vocalist whose voice is a weapon. His sonic attacks pierce through even the toughest armor.",
    hp: 3000,
    isRanged: true,
    name: "Acapella Tenor",
    range: 250,
    speed: 2.5,
  },
  tiger: {
    ability: "Mighty Roar",
    abilityDesc: "Stuns all enemies in range for 3s with fear effect",
    attackSpeed: 650,
    color: "#f97316",
    damage: 72,
    description:
      "The fearsome Princeton Tiger, an apex predator with a terrifying roar that freezes enemies in fear.",
    hp: 4500,
    isRanged: false,
    name: "Princeton Tiger",
    range: 120,
    speed: 3.5,
  },
};

// Hero-specific combat stats used by the runtime
export const HERO_COMBAT_STATS = {
  captainKnightHp: 1150,
  captainKnightMoveRadius: 180,
  engineerTurretHp: 900,
  heroAoeDamageMult: 0.5,
  ivyAoeRadius: 90,
  ivyColossusAoeRadius: 160,
  ivyColossusAttackSpeed: 900,
  ivyColossusDamage: 70,
  ivyColossusSpeed: 1.5,
  ivyRootDuration: 4000,
  ivyVineDamage: 100,
  ivyVineRadius: 180,
  ivyWardenHealAmount: 8,
  ivyWardenHealInterval: 1000,
  ivyWardenHealRadius: 200,
  matheyAoeRadius: 70,
  nassauBlueFireballAoeRadius: 65,
  nassauBlueFireballDamage: 35,
  nassauBlueFireballBurnDamage: 22,
  nassauBlueFireballBurnDuration: 3000,
  nassauBlueFireballSpeed: 300,
  nassauBlueInfernoDuration: 6000,
  nassauBurnDps: 25,
  nassauBurnDuration: 4000,
  nassauDiveDamage: 150,
  nassauDiveRadius: 200,
  nassauFireballAoeRadius: 80,
  nassauFireballBurnDamage: 12,
  nassauFireballBurnDuration: 3000,
  nassauMeleeAttackSpeed: 700,
  nassauMeleeDamage: 55,
  nassauMeleeRange: 75,
  scottAoeRadius: 60,
  tauntDamage: 20,
  tauntMoveSpeedMult: 0.8,
} as const;

// Hero options for selection
export const HERO_OPTIONS: HeroType[] = [
  "tiger",
  "tenor",
  "mathey",
  "rocky",
  "scott",
  "captain",
  "engineer",
  "nassau",
  "ivy",
];

// Hero ability cooldowns
export const HERO_ABILITY_COOLDOWNS: Record<HeroType, number> = {
  captain: 30_000,
  engineer: 35_000,
  ivy: 8000,
  mathey: 22_000,
  nassau: 20_000,
  rocky: 15_000,
  scott: 25_000,
  tenor: 12_000,
  tiger: 18_000,
};

export interface HeroRole {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const HERO_ROLES: Record<HeroType, HeroRole> = {
  captain: {
    bg: "rgba(55,12,12,0.85)",
    border: "rgba(220,38,38,0.35)",
    color: "text-red-300",
    label: "Summoner",
  },
  engineer: {
    bg: "rgba(50,38,5,0.85)",
    border: "rgba(234,179,8,0.35)",
    color: "text-yellow-300",
    label: "Builder",
  },
  ivy: {
    bg: "rgba(5,45,25,0.85)",
    border: "rgba(5,150,105,0.35)",
    color: "text-emerald-300",
    label: "Controller",
  },
  mathey: {
    bg: "rgba(25,25,60,0.85)",
    border: "rgba(99,102,241,0.35)",
    color: "text-indigo-300",
    label: "Tank",
  },
  nassau: {
    bg: "rgba(60,30,5,0.85)",
    border: "rgba(230,126,34,0.35)",
    color: "text-amber-300",
    label: "Sky Guardian",
  },
  rocky: {
    bg: "rgba(45,35,10,0.85)",
    border: "rgba(138,112,32,0.35)",
    color: "text-amber-300",
    label: "Artillery",
  },
  scott: {
    bg: "rgba(8,45,42,0.85)",
    border: "rgba(20,184,166,0.35)",
    color: "text-teal-300",
    label: "Support",
  },
  tenor: {
    bg: "rgba(35,20,65,0.85)",
    border: "rgba(139,92,246,0.35)",
    color: "text-violet-300",
    label: "Mage",
  },
  tiger: {
    bg: "rgba(60,25,5,0.85)",
    border: "rgba(234,88,12,0.35)",
    color: "text-orange-300",
    label: "Brawler",
  },
};

export const HERO_COLOR_NAMES: Record<HeroType, string> = {
  captain: "green",
  engineer: "amber",
  ivy: "emerald",
  mathey: "blue",
  nassau: "flame",
  rocky: "red",
  scott: "yellow",
  tenor: "purple",
  tiger: "orange",
};

export const HERO_COLORS: Record<
  HeroType,
  { base: string; dark: string; accent: string; light: string }
> = {
  captain: {
    accent: "#00ff00",
    base: "#ff1493",
    dark: "#cc0f6f",
    light: "#ff4ab8",
  },
  engineer: {
    accent: "#ffa500",
    base: "#708090",
    dark: "#505060",
    light: "#90a0b0",
  },
  ivy: {
    accent: "#a7f3d0",
    base: "#059669",
    dark: "#047252",
    light: "#34d399",
  },
  mathey: {
    accent: "#ff69b4",
    base: "#32cd32",
    dark: "#28a428",
    light: "#5ce65c",
  },
  nassau: {
    accent: "#ffd700",
    base: "#e67e22",
    dark: "#b35f18",
    light: "#f0a050",
  },
  rocky: {
    accent: "#00e0ff",
    base: "#a07020",
    dark: "#5a4010",
    light: "#c8a040",
  },
  scott: {
    accent: "#ffd700",
    base: "#800080",
    dark: "#590059",
    light: "#a040a0",
  },
  tenor: {
    accent: "#ffff00",
    base: "#1e90ff",
    dark: "#1666cc",
    light: "#4da6ff",
  },
  tiger: {
    accent: "#ffffff",
    base: "#ff8c00",
    dark: "#cc7000",
    light: "#ffaa33",
  },
};
