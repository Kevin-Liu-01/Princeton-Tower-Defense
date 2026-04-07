import { LEVEL_WAVES } from "../../../constants";

export interface LevelNode {
  id: string;
  name: string;
  description: string;
  region: "grassland" | "swamp" | "desert" | "winter" | "volcanic";
  difficulty: 1 | 2 | 3;
  kind?: "campaign" | "challenge" | "sandbox";
  tags: string[];
  x: number;
  y: number;
  connectsTo: string[];
}

export const WORLD_LEVELS: LevelNode[] = [
  {
    connectsTo: ["carnegie"],
    description:
      "Train new defenders on open grass.\nHold the first road at dusk.",
    difficulty: 1,
    id: "poe",
    name: "Poe Field",
    region: "grassland",
    tags: ["Open Field", "Beginner"],
    x: 100,
    y: 66,
  },
  {
    connectsTo: [],
    description:
      "Mountaintop colosseum with limitless resources. Build anything, test everything.",
    difficulty: 1,
    id: "sandbox",
    kind: "sandbox",
    name: "Sandbox Arena",
    region: "grassland",
    tags: ["Sandbox", "Unlimited"],
    x: 205,
    y: 59,
  },
  {
    connectsTo: ["nassau"],
    description:
      "Protect the lakefront causeway line.\nPunish split pushes from both banks.",
    difficulty: 2,
    id: "carnegie",
    name: "Carnegie Lake",
    region: "grassland",
    tags: ["Split Path", "Lakefront"],
    x: 205,
    y: 40,
  },
  {
    connectsTo: ["bog", "ivy_crossroads"],
    description:
      "Defend the campus stone courtyard.\nAbsorb pressure near the main gate.",
    difficulty: 3,
    id: "nassau",
    name: "Nassau Hall",
    region: "grassland",
    tags: ["Chokepoint", "Courtyard"],
    x: 320,
    y: 58,
  },
  {
    connectsTo: ["cannon_crest"],
    description:
      "Crossed lanes demand split focus.\nChain buffs and lock both chokepoints.",
    difficulty: 3,
    id: "ivy_crossroads",
    kind: "challenge",
    name: "Ivy Crossroads",
    region: "grassland",
    tags: ["Multi-Lane", "Buff Chains"],
    x: 370,
    y: 30,
  },
  {
    connectsTo: [],
    description:
      "Only Nassau Cannons are allowed.\nAnchor lanes with brutal firing lines.",
    difficulty: 3,
    id: "cannon_crest",
    kind: "challenge",
    name: "Cannon Crest",
    region: "grassland",
    tags: ["Restricted Build", "Artillery"],
    x: 175,
    y: 26,
  },
  // Swamp - Murky Marshes
  {
    connectsTo: ["witch_hut"],
    description:
      "Foggy marsh trails hide threats.\nControl vision and hold wet chokepoints.",
    difficulty: 1,
    id: "bog",
    name: "Murky Bog",
    region: "swamp",
    tags: ["Low Visibility", "Chokepoint"],
    x: 430,
    y: 56,
  },
  {
    connectsTo: ["sunken_temple"],
    description:
      "Dark wards empower swamp raiders.\nBreak curses before waves stack.",
    difficulty: 2,
    id: "witch_hut",
    name: "Witch's Domain",
    region: "swamp",
    tags: ["Cursed", "Debuffs"],
    x: 535,
    y: 33,
  },
  {
    connectsTo: ["oasis", "blight_basin", "triad_keep"],
    description:
      "Ruins collapse into flooded paths.\nAnchor towers around broken arches.",
    difficulty: 3,
    id: "sunken_temple",
    name: "Sunken Temple",
    region: "swamp",
    tags: ["Ruins", "Flooded"],
    x: 650,
    y: 56,
  },
  {
    connectsTo: [],
    description:
      "Poison basins corrode both lanes.\nRotate quickly through toxic crossfire.",
    difficulty: 3,
    id: "blight_basin",
    kind: "challenge",
    name: "Blight Basin",
    region: "swamp",
    tags: ["Poison", "Crossfire"],
    x: 540,
    y: 70,
  },
  {
    connectsTo: [],
    description:
      "Only Dinky, Library, and Club build.\nOutlast swarms with control and economy.",
    difficulty: 3,
    id: "triad_keep",
    kind: "challenge",
    name: "Triad Keep",
    region: "swamp",
    tags: ["Restricted Build", "Economy"],
    x: 680,
    y: 28,
  },
  // Desert
  {
    connectsTo: ["pyramid"],
    description:
      "Guard the wells in open sand.\nPunish fast flanks around dunes.",
    difficulty: 1,
    id: "oasis",
    name: "Desert Oasis",
    region: "desert",
    tags: ["Open Sand", "Flanking"],
    x: 785,
    y: 62,
  },
  {
    connectsTo: ["sphinx", "sun_obelisk", "mirage_dunes"],
    description:
      "Ancient ramps split your defenses.\nHold high ground and lane pivots.",
    difficulty: 2,
    id: "pyramid",
    name: "Pyramid Pass",
    region: "desert",
    tags: ["High Ground", "Split Defense"],
    x: 910,
    y: 38,
  },
  {
    connectsTo: [],
    description:
      "The sky darkens with wings; every enemy flies.\nSadly, only mortars are at your disposal.",
    difficulty: 3,
    id: "mirage_dunes",
    kind: "challenge",
    name: "Mirage Dunes",
    region: "desert",
    tags: ["All Flying", "Mortars Only"],
    x: 820,
    y: 33,
  },
  {
    connectsTo: [],
    description:
      "Solar monuments scorch both lanes.\nSplit forces across ancient killing grounds.",
    difficulty: 3,
    id: "sun_obelisk",
    kind: "challenge",
    name: "Sun Obelisk",
    region: "desert",
    tags: ["Solar Hazards", "Dual Lane"],
    x: 910,
    y: 25,
  },
  {
    connectsTo: ["glacier", "sunscorch_labyrinth"],
    description:
      "The guardian tests every formation.\nSurvive bursts from mirrored fronts.",
    difficulty: 3,
    id: "sphinx",
    name: "Sphinx Gate",
    region: "desert",
    tags: ["Mirror Lanes", "Burst Waves"],
    x: 968,
    y: 53,
  },
  {
    connectsTo: [],
    description:
      "Twin mazes force split responses.\nHandle hazards while lanes converge.",
    difficulty: 3,
    id: "sunscorch_labyrinth",
    kind: "challenge",
    name: "Sunscorch Labyrinth",
    region: "desert",
    tags: ["Maze", "Hazards"],
    x: 1000,
    y: 67,
  },
  // Winter
  {
    connectsTo: ["fortress"],
    description:
      "Ice winds slow every advance.\nUse spacing to survive freezes.",
    difficulty: 1,
    id: "glacier",
    name: "Glacier Path",
    region: "winter",
    tags: ["Slow Effects", "Spacing"],
    x: 1142,
    y: 48,
  },
  {
    connectsTo: ["peak"],
    description:
      "Frost walls funnel heavy assaults.\nStabilize lanes before they collapse.",
    difficulty: 2,
    id: "fortress",
    name: "Frost Fortress",
    region: "winter",
    tags: ["Funnel", "Heavy Assault"],
    x: 1268,
    y: 67,
  },
  {
    connectsTo: ["lava", "whiteout_pass"],
    description:
      "Storms crash across summit roads.\nDefend cliffs against relentless elites.",
    difficulty: 3,
    id: "peak",
    name: "Summit Peak",
    region: "winter",
    tags: ["Cliffs", "Elite Waves"],
    x: 1365,
    y: 48,
  },
  {
    connectsTo: ["frist_outpost"],
    description:
      "Whiteout drifts hide both lanes.\nRecover fast after chained freezes.",
    difficulty: 3,
    id: "whiteout_pass",
    kind: "challenge",
    name: "Whiteout Pass",
    region: "winter",
    tags: ["Low Visibility", "Chain Freeze"],
    x: 1210,
    y: 32,
  },
  {
    connectsTo: [],
    description:
      "Only Dinky Station can be built.\nFrontier Barracks hold the front.",
    difficulty: 3,
    id: "frist_outpost",
    kind: "challenge",
    name: "Frist Outpost",
    region: "winter",
    tags: ["Restricted Build", "Barracks"],
    x: 1332,
    y: 28,
  },
  // Volcanic
  {
    connectsTo: ["crater"],
    description:
      "Molten channels burn deployment zones.\nTime reinforcements through heat bursts.",
    difficulty: 2,
    id: "lava",
    name: "Lava Fields",
    region: "volcanic",
    tags: ["Hazard Zones", "Timing"],
    x: 1522,
    y: 61,
  },
  {
    connectsTo: ["throne", "infernal_gate"],
    description:
      "Caldera vents split your anchor.\nHold center while flanks erupt.",
    difficulty: 3,
    id: "crater",
    name: "Caldera Basin",
    region: "volcanic",
    tags: ["Split Anchor", "Eruptions"],
    x: 1592,
    y: 37,
  },
  {
    connectsTo: [],
    description:
      "Demonic portals flood twin fire lanes.\nSurvive eruptions around the bone altar.",
    difficulty: 3,
    id: "infernal_gate",
    kind: "challenge",
    name: "Infernal Gate",
    region: "volcanic",
    tags: ["Lava Geysers", "Bone Altar"],
    x: 1530,
    y: 28,
  },
  {
    connectsTo: ["ashen_spiral"],
    description:
      "Obsidian gates unleash brutal waves.\nEndure until the throne falls.",
    difficulty: 3,
    id: "throne",
    name: "Obsidian Throne",
    region: "volcanic",
    tags: ["Final Stand", "Boss Rush"],
    x: 1702,
    y: 59,
  },
  {
    connectsTo: [],
    description:
      "Inferno lanes spiral into killzones.\nCounter stacked geysers and rush elites.",
    difficulty: 3,
    id: "ashen_spiral",
    kind: "challenge",
    name: "Ashen Spiral",
    region: "volcanic",
    tags: ["Spiral Path", "Geysers"],
    x: 1612,
    y: 72,
  },
];

export const DEV_LEVEL_IDS: ReadonlySet<string> = new Set([
  "dev_enemy_showcase",
  "dev_building_showcase",
]);

export const ALWAYS_UNLOCKED_IDS: ReadonlySet<string> = new Set([
  "poe",
  "sandbox",
]);

export const DEV_LEVELS: LevelNode[] = [
  {
    connectsTo: [],
    description:
      "Sandbox with every tower at every upgrade.\nDev-only testing level.",
    difficulty: 1,
    id: "dev_enemy_showcase",
    name: "Enemy Showcase",
    region: "grassland",
    tags: ["Dev", "All Enemies"],
    x: 60,
    y: 25,
  },
  {
    connectsTo: [],
    description:
      "Every landmark and Princeton building.\nDev-only gallery level.",
    difficulty: 1,
    id: "dev_building_showcase",
    name: "Building Showcase",
    region: "grassland",
    tags: ["Dev", "All Buildings"],
    x: 60,
    y: 40,
  },
];

/** Per-connection curve overrides. Key is "fromId->toId". */
export const CONNECTION_OVERRIDES: Record<string, { flip?: boolean }> = {
  "crater->throne": { flip: true },
  "nassau->bog": { flip: true },
  "poe->carnegie": { flip: true },
  "pyramid->mirage_dunes": { flip: true },
  "whiteout_pass->frist_outpost": { flip: true },
};

export const MAP_WIDTH = 1800;

export const getWaveCount = (levelId: string): number => {
  const waves = LEVEL_WAVES[levelId];
  return waves ? waves.length : 0;
};
