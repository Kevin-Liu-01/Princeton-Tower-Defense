import { LEVEL_DATA, LEVEL_WAVES } from "../../constants";
import type { HeroType, SpellType } from "../../types";

export interface LevelNode {
  id: string;
  name: string;
  description: string;
  region: "grassland" | "swamp" | "desert" | "winter" | "volcanic";
  difficulty: 1 | 2 | 3;
  kind?: "campaign" | "challenge";
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
    y: 66,
    connectsTo: ["carnegie"],
  },
  {
    id: "carnegie",
    name: "Carnegie Lake",
    description: "Strategic waterfront defense",
    region: "grassland",
    difficulty: 2,
    x: 205,
    y: 40,
    connectsTo: ["nassau", "ivy_crossroads"],
  },
  {
    id: "nassau",
    name: "Nassau Hall",
    description: "The heart of campus",
    region: "grassland",
    difficulty: 3,
    x: 320,
    y: 58,
    connectsTo: ["bog"],
  },
  {
    id: "ivy_crossroads",
    name: "Ivy Crossroads",
    description: LEVEL_DATA["ivy_crossroads"].description,
    region: "grassland",
    difficulty: 3,
    kind: "challenge",
    x: 370,
    y: 30,
    connectsTo: [],
  },
  // Swamp - Murky Marshes
  {
    id: "bog",
    name: "Murky Bog",
    description: "Treacherous wetlands",
    region: "swamp",
    difficulty: 1,
    x: 430,
    y: 56,
    connectsTo: ["witch_hut"],
  },
  {
    id: "witch_hut",
    name: "Witch's Domain",
    description: "Dark magic festers here",
    region: "swamp",
    difficulty: 2,
    x: 535,
    y: 33,
    connectsTo: ["sunken_temple"],
  },
  {
    id: "sunken_temple",
    name: "Sunken Temple",
    description: "Ancient ruins submerged",
    region: "swamp",
    difficulty: 3,
    x: 650,
    y: 56,
    connectsTo: ["oasis", "blight_basin"],
  },
  {
    id: "blight_basin",
    name: "Blight Basin",
    description: LEVEL_DATA["blight_basin"].description,
    region: "swamp",
    difficulty: 3,
    kind: "challenge",
    x: 540,
    y: 70,
    connectsTo: [],
  },
  // Desert
  {
    id: "oasis",
    name: "Desert Oasis",
    description: "A precious water source",
    region: "desert",
    difficulty: 1,
    x: 785,
    y: 62,
    connectsTo: ["pyramid"],
  },
  {
    id: "pyramid",
    name: "Pyramid Pass",
    description: "Ancient canyon passage",
    region: "desert",
    difficulty: 2,
    x: 900,
    y: 36,
    connectsTo: ["sphinx"],
  },
  {
    id: "sphinx",
    name: "Sphinx Gate",
    description: "The guardian's domain",
    region: "desert",
    difficulty: 3,
    x: 1008,
    y: 58,
    connectsTo: ["glacier", "sunscorch_labyrinth"],
  },
  {
    id: "sunscorch_labyrinth",
    name: "Sunscorch Labyrinth",
    description: LEVEL_DATA["sunscorch_labyrinth"].description,
    region: "desert",
    difficulty: 3,
    kind: "challenge",
    x: 975,
    y: 70,
    connectsTo: [],
  },
  // Winter
  {
    id: "glacier",
    name: "Glacier Path",
    description: "Ice-covered mountain pass",
    region: "winter",
    difficulty: 1,
    x: 1142,
    y: 48,
    connectsTo: ["fortress"],
  },
  {
    id: "fortress",
    name: "Frost Fortress",
    description: "An abandoned stronghold",
    region: "winter",
    difficulty: 2,
    x: 1268,
    y: 67,
    connectsTo: ["peak"],
  },
  {
    id: "peak",
    name: "Summit Peak",
    description: "The highest defense point",
    region: "winter",
    difficulty: 3,
    x: 1365,
    y: 48,
    connectsTo: ["lava", "whiteout_pass"],
  },
  {
    id: "whiteout_pass",
    name: "Whiteout Pass",
    description: LEVEL_DATA["whiteout_pass"].description,
    region: "winter",
    difficulty: 3,
    kind: "challenge",
    x: 1238,
    y: 30,
    connectsTo: [],
  },
  // Volcanic
  {
    id: "lava",
    name: "Lava Fields",
    description: "Rivers of molten rock",
    region: "volcanic",
    difficulty: 2,
    x: 1522,
    y: 61,
    connectsTo: ["crater"],
  },
  {
    id: "crater",
    name: "Caldera Basin",
    description: "Inside the volcano's heart",
    region: "volcanic",
    difficulty: 3,
    x: 1592,
    y: 37,
    connectsTo: ["throne"],
  },
  {
    id: "throne",
    name: "Obsidian Throne",
    description: "The ultimate challenge",
    region: "volcanic",
    difficulty: 3,
    x: 1702,
    y: 59,
    connectsTo: ["ashen_spiral"],
  },
  {
    id: "ashen_spiral",
    name: "Ashen Spiral",
    description: LEVEL_DATA["ashen_spiral"].description,
    region: "volcanic",
    difficulty: 3,
    kind: "challenge",
    x: 1612,
    y: 72,
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
