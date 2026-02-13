import { LEVEL_DATA, LEVEL_WAVES } from "../../constants";
import type { HeroType, SpellType } from "../../types";

export interface LevelNode {
  id: string;
  name: string;
  description: string;
  region: "grassland" | "swamp" | "desert" | "winter" | "volcanic";
  difficulty: 1 | 2 | 3;
  x: number;
  y: number;
  connectsTo: string[];
}

export const WORLD_LEVELS: LevelNode[] = [
  {
    id: "poe",
    name: "Poe Field",
    description: LEVEL_DATA["poe"].description,
    region: "grassland",
    difficulty: 1,
    x: 100,
    y: 70,
    connectsTo: ["carnegie"],
  },
  {
    id: "carnegie",
    name: "Carnegie Lake",
    description: "Strategic waterfront defense",
    region: "grassland",
    difficulty: 2,
    x: 200,
    y: 35,
    connectsTo: ["nassau"],
  },
  {
    id: "nassau",
    name: "Nassau Hall",
    description: "The heart of campus",
    region: "grassland",
    difficulty: 3,
    x: 310,
    y: 60,
    connectsTo: ["bog"],
  },
  // Swamp - Murky Marshes
  {
    id: "bog",
    name: "Murky Bog",
    description: "Treacherous wetlands",
    region: "swamp",
    difficulty: 1,
    x: 440,
    y: 39,
    connectsTo: ["witch_hut"],
  },
  {
    id: "witch_hut",
    name: "Witch's Domain",
    description: "Dark magic festers here",
    region: "swamp",
    difficulty: 2,
    x: 540,
    y: 65,
    connectsTo: ["sunken_temple"],
  },
  {
    id: "sunken_temple",
    name: "Sunken Temple",
    description: "Ancient ruins submerged",
    region: "swamp",
    difficulty: 3,
    x: 650,
    y: 32,
    connectsTo: ["oasis"],
  },
  // Desert
  {
    id: "oasis",
    name: "Desert Oasis",
    description: "A precious water source",
    region: "desert",
    difficulty: 1,
    x: 780,
    y: 42,
    connectsTo: ["pyramid"],
  },
  {
    id: "pyramid",
    name: "Pyramid Pass",
    description: "Ancient canyon passage",
    region: "desert",
    difficulty: 2,
    x: 900,
    y: 41,
    connectsTo: ["sphinx"],
  },
  {
    id: "sphinx",
    name: "Sphinx Gate",
    description: "The guardian's domain",
    region: "desert",
    difficulty: 3,
    x: 1000,
    y: 60,
    connectsTo: ["glacier"],
  },
  // Winter
  {
    id: "glacier",
    name: "Glacier Path",
    description: "Ice-covered mountain pass",
    region: "winter",
    difficulty: 1,
    x: 1140,
    y: 40,
    connectsTo: ["fortress"],
  },
  {
    id: "fortress",
    name: "Frost Fortress",
    description: "An abandoned stronghold",
    region: "winter",
    difficulty: 2,
    x: 1270,
    y: 36,
    connectsTo: ["peak"],
  },
  {
    id: "peak",
    name: "Summit Peak",
    description: "The highest defense point",
    region: "winter",
    difficulty: 3,
    x: 1360,
    y: 52,
    connectsTo: ["lava"],
  },
  // Volcanic
  {
    id: "lava",
    name: "Lava Fields",
    description: "Rivers of molten rock",
    region: "volcanic",
    difficulty: 2,
    x: 1520,
    y: 60,
    connectsTo: ["crater"],
  },
  {
    id: "crater",
    name: "Caldera Basin",
    description: "Inside the volcano's heart",
    region: "volcanic",
    difficulty: 3,
    x: 1590,
    y: 35,
    connectsTo: ["throne"],
  },
  {
    id: "throne",
    name: "Obsidian Throne",
    description: "The ultimate challenge",
    region: "volcanic",
    difficulty: 3,
    x: 1700,
    y: 62,
    connectsTo: [],
  },
];

export const MAP_WIDTH = 1800;

export const getWaveCount = (levelId: string): number => {
  const waves = LEVEL_WAVES[levelId];
  return waves ? waves.length : 0;
};

export const heroOptions: HeroType[] = [
  "tiger",
  "tenor",
  "mathey",
  "rocky",
  "scott",
  "captain",
  "engineer",
];

export const spellOptions: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "payday",
  "reinforcements",
];
