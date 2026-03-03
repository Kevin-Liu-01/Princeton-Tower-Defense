import type { SpellData, SpellType } from "../types";

// Spell data
export const SPELL_DATA: Record<SpellType, SpellData> = {
  fireball: {
    name: "Meteor Shower",
    shortName: "Fireball",
    cost: 50,
    cooldown: 15000,
    desc: "Rains 10 meteors dealing 80 AoE damage each, burning enemies for 4s",
    icon: "☄️",
  },
  lightning: {
    name: "Chain Lightning",
    shortName: "Lightning",
    cost: 40,
    cooldown: 12000,
    desc: "Chains to 8 enemies, 900 total damage with stun",
    icon: "⚡",
  },
  freeze: {
    name: "Arctic Blast",
    shortName: "Freeze",
    cost: 60,
    cooldown: 20000,
    desc: "Freezes ALL enemies for 3 seconds",
    icon: "❄️",
  },
  payday: {
    name: "Gold Rush",
    shortName: "Payday",
    cost: 0,
    cooldown: 30000,
    desc: "Grants 80+ Paw Points (bonus per enemy)",
    icon: "💰",
  },
  reinforcements: {
    name: "Knight Squad",
    shortName: "Reinforcements",
    cost: 75,
    cooldown: 25000,
    desc: "Summons 3 armored knights to the battlefield",
    icon: "🏇",
  },
};

// Spell options for selection
export const SPELL_OPTIONS: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "payday",
  "reinforcements",
];
