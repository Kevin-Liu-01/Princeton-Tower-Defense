import type { HeroData, HeroType } from "../types";

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
    abilityDesc: "Summons 3 armored knights to fight",
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
