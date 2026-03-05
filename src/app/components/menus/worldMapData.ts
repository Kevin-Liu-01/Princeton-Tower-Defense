import { LEVEL_WAVES } from "../../constants";
import type { HeroType, SpellType } from "../../types";

export interface LevelNode {
  id: string;
  name: string;
  description: string;
  region: "grassland" | "swamp" | "desert" | "winter" | "volcanic";
  difficulty: 1 | 2 | 3;
  kind?: "campaign" | "challenge";
  tags: string[];
  x: number;
  y: number;
  connectsTo: string[];
}

export const WORLD_LEVELS: LevelNode[] = [
  {
    id: "poe",
    name: "Poe Field",
    description:
      "Train new defenders on open grass.\nHold the first road at dusk.",
    region: "grassland",
    difficulty: 1,
    tags: ["Open Field", "Beginner"],
    x: 100,
    y: 66,
    connectsTo: ["carnegie"],
  },
  {
    id: "carnegie",
    name: "Carnegie Lake",
    description:
      "Protect the lakefront causeway line.\nPunish split pushes from both banks.",
    region: "grassland",
    difficulty: 2,
    tags: ["Split Path", "Lakefront"],
    x: 205,
    y: 40,
    connectsTo: ["nassau"],
  },
  {
    id: "nassau",
    name: "Nassau Hall",
    description:
      "Defend the campus stone courtyard.\nAbsorb pressure near the main gate.",
    region: "grassland",
    difficulty: 3,
    tags: ["Chokepoint", "Courtyard"],
    x: 320,
    y: 58,
    connectsTo: ["bog", "ivy_crossroads"],
  },
  {
    id: "ivy_crossroads",
    name: "Ivy Crossroads",
    description:
      "Crossed lanes demand split focus.\nChain buffs and lock both chokepoints.",
    region: "grassland",
    difficulty: 3,
    kind: "challenge",
    tags: ["Multi-Lane", "Buff Chains"],
    x: 370,
    y: 30,
    connectsTo: ["cannon_crest"],
  },
  {
    id: "cannon_crest",
    name: "Cannon Crest",
    description:
      "Only Nassau Cannons are allowed.\nAnchor lanes with brutal firing lines.",
    region: "grassland",
    difficulty: 3,
    kind: "challenge",
    tags: ["Restricted Build", "Artillery"],
    x: 175,
    y: 26,
    connectsTo: [],
  },
  // Swamp - Murky Marshes
  {
    id: "bog",
    name: "Murky Bog",
    description:
      "Foggy marsh trails hide threats.\nControl vision and hold wet chokepoints.",
    region: "swamp",
    difficulty: 1,
    tags: ["Low Visibility", "Chokepoint"],
    x: 430,
    y: 56,
    connectsTo: ["witch_hut"],
  },
  {
    id: "witch_hut",
    name: "Witch's Domain",
    description:
      "Dark wards empower swamp raiders.\nBreak curses before waves stack.",
    region: "swamp",
    difficulty: 2,
    tags: ["Cursed", "Debuffs"],
    x: 535,
    y: 33,
    connectsTo: ["sunken_temple"],
  },
  {
    id: "sunken_temple",
    name: "Sunken Temple",
    description:
      "Ruins collapse into flooded paths.\nAnchor towers around broken arches.",
    region: "swamp",
    difficulty: 3,
    tags: ["Ruins", "Flooded"],
    x: 650,
    y: 56,
    connectsTo: ["oasis", "blight_basin", "triad_keep"],
  },
  {
    id: "blight_basin",
    name: "Blight Basin",
    description:
      "Poison basins corrode both lanes.\nRotate quickly through toxic crossfire.",
    region: "swamp",
    difficulty: 3,
    kind: "challenge",
    tags: ["Poison", "Crossfire"],
    x: 540,
    y: 70,
    connectsTo: [],
  },
  {
    id: "triad_keep",
    name: "Triad Keep",
    description:
      "Only Dinky, Library, and Club build.\nOutlast swarms with control and economy.",
    region: "swamp",
    difficulty: 3,
    kind: "challenge",
    tags: ["Restricted Build", "Economy"],
    x: 640,
    y: 28,
    connectsTo: [],
  },
  // Desert
  {
    id: "oasis",
    name: "Desert Oasis",
    description:
      "Guard the wells in open sand.\nPunish fast flanks around dunes.",
    region: "desert",
    difficulty: 1,
    tags: ["Open Sand", "Flanking"],
    x: 785,
    y: 62,
    connectsTo: ["pyramid"],
  },
  {
    id: "pyramid",
    name: "Pyramid Pass",
    description:
      "Ancient ramps split your defenses.\nHold high ground and lane pivots.",
    region: "desert",
    difficulty: 2,
    tags: ["High Ground", "Split Defense"],
    x: 910,
    y: 38,
    connectsTo: ["sphinx"],
  },
  {
    id: "sphinx",
    name: "Sphinx Gate",
    description:
      "The guardian tests every formation.\nSurvive bursts from mirrored fronts.",
    region: "desert",
    difficulty: 3,
    tags: ["Mirror Lanes", "Burst Waves"],
    x: 968,
    y: 53,
    connectsTo: ["glacier", "sunscorch_labyrinth"],
  },
  {
    id: "sunscorch_labyrinth",
    name: "Sunscorch Labyrinth",
    description:
      "Twin mazes force split responses.\nHandle hazards while lanes converge.",
    region: "desert",
    difficulty: 3,
    kind: "challenge",
    tags: ["Maze", "Hazards"],
    x: 1000,
    y: 67,
    connectsTo: [],
  },
  // Winter
  {
    id: "glacier",
    name: "Glacier Path",
    description:
      "Ice winds slow every advance.\nUse spacing to survive freezes.",
    region: "winter",
    difficulty: 1,
    tags: ["Slow Effects", "Spacing"],
    x: 1142,
    y: 48,
    connectsTo: ["fortress"],
  },
  {
    id: "fortress",
    name: "Frost Fortress",
    description:
      "Frost walls funnel heavy assaults.\nStabilize lanes before they collapse.",
    region: "winter",
    difficulty: 2,
    tags: ["Funnel", "Heavy Assault"],
    x: 1268,
    y: 67,
    connectsTo: ["peak"],
  },
  {
    id: "peak",
    name: "Summit Peak",
    description:
      "Storms crash across summit roads.\nDefend cliffs against relentless elites.",
    region: "winter",
    difficulty: 3,
    tags: ["Cliffs", "Elite Waves"],
    x: 1365,
    y: 48,
    connectsTo: ["lava", "whiteout_pass"],
  },
  {
    id: "whiteout_pass",
    name: "Whiteout Pass",
    description:
      "Whiteout drifts hide both lanes.\nRecover fast after chained freezes.",
    region: "winter",
    difficulty: 3,
    kind: "challenge",
    tags: ["Low Visibility", "Chain Freeze"],
    x: 1210,
    y: 32,
    connectsTo: ["frontier_outpost"],
  },
  {
    id: "frontier_outpost",
    name: "Frontier Outpost",
    description:
      "Only Dinky Station can be built.\nFrontier Barracks hold the front.",
    region: "winter",
    difficulty: 3,
    kind: "challenge",
    tags: ["Restricted Build", "Barracks"],
    x: 1332,
    y: 28,
    connectsTo: [],
  },
  // Volcanic
  {
    id: "lava",
    name: "Lava Fields",
    description:
      "Molten channels burn deployment zones.\nTime reinforcements through heat bursts.",
    region: "volcanic",
    difficulty: 2,
    tags: ["Hazard Zones", "Timing"],
    x: 1522,
    y: 61,
    connectsTo: ["crater"],
  },
  {
    id: "crater",
    name: "Caldera Basin",
    description:
      "Caldera vents split your anchor.\nHold center while flanks erupt.",
    region: "volcanic",
    difficulty: 3,
    tags: ["Split Anchor", "Eruptions"],
    x: 1592,
    y: 37,
    connectsTo: ["throne"],
  },
  {
    id: "throne",
    name: "Obsidian Throne",
    description:
      "Obsidian gates unleash brutal waves.\nEndure until the throne falls.",
    region: "volcanic",
    difficulty: 3,
    tags: ["Final Stand", "Boss Rush"],
    x: 1702,
    y: 59,
    connectsTo: ["ashen_spiral"],
  },
  {
    id: "ashen_spiral",
    name: "Ashen Spiral",
    description:
      "Inferno lanes spiral into killzones.\nCounter stacked geysers and rush elites.",
    region: "volcanic",
    difficulty: 3,
    kind: "challenge",
    tags: ["Spiral Path", "Geysers"],
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
