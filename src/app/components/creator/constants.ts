import {
  ChessRook,
  GitBranch,
  MousePointer2,
  Route,
  Sword,
  User,
} from "lucide-react";

import {
  ENEMY_DATA,
  GRID_HEIGHT,
  GRID_WIDTH,
  LEVEL_DATA,
  MAP_PATHS,
} from "../../constants";
import type { CustomSpecialTowerConfig } from "../../customLevels/types";
import type {
  DecorationCategory,
  EnemyType,
  HazardType,
  MapDecoration,
  MapHazard,
  MapTheme,
  SpecialTowerType,
  TowerType,
} from "../../types";
import { LANDMARK_DECORATION_TYPES } from "../../utils";
import { WORLD_LEVELS } from "../menus/world-map/worldMapData";
import type {
  GridPoint,
  MapPresetTemplate,
  ObjectiveTypeStats,
  ToolOption,
} from "./types";

export const THEME_OPTIONS: MapTheme[] = [
  "grassland",
  "swamp",
  "desert",
  "winter",
  "volcanic",
];

export const SPECIAL_TOWER_TYPES: SpecialTowerType[] = [
  "beacon",
  "shrine",
  "vault",
  "barracks",
  "chrono_relay",
  "sentinel_nexus",
  "sunforge_orrery",
];

export const OBJECTIVE_TYPE_STATS: Record<
  SpecialTowerType,
  ObjectiveTypeStats
> = {
  barracks: {
    effect: "Spawns allied troops over time.",
    risk: "Losing it cuts reinforcement pressure.",
    title: "Barracks",
  },
  beacon: {
    effect: "Buff aura for nearby defenders.",
    risk: "Objective falls when enemies overrun it.",
    title: "Beacon",
  },
  chrono_relay: {
    effect: "Boosts nearby tower attack speed.",
    risk: "Losing it slows your local DPS cadence.",
    title: "Arcane Time Crystal",
  },
  sentinel_nexus: {
    effect: "Lightning strikes locked target every 10s.",
    risk: "Losing it removes controllable map pressure.",
    title: "Imperial Sentinel",
  },
  shrine: {
    effect: "Periodic healing pulse for allies.",
    risk: "Losing it removes sustain cadence.",
    title: "Shrine",
  },
  sunforge_orrery: {
    effect: "Tri-plasma barrage hits dense enemy clusters.",
    risk: "Long cadence rewards careful timing windows.",
    title: "Sunforge Orrery",
  },
  vault: {
    effect: "Has HP and can be directly destroyed.",
    risk: "If HP reaches zero, objective fails.",
    title: "Vault",
  },
};

export const DECORATION_OPTIONS_BY_THEME: Record<
  MapTheme,
  DecorationCategory[]
> = {
  desert: [
    "palm",
    "cactus",
    "dune",
    "skull",
    "pottery",
    "oasis_pool",
    "pyramid",
    "obelisk",
    "sphinx",
    "hieroglyph_wall",
    "treasure_chest",
    "skeleton",
    "torch",
    "temple_entrance",
    "sarcophagus",
    "cobra_statue",
    "sand_pile",
    "idol_statue",
  ],
  grassland: [
    "tree",
    "bush",
    "rock",
    "flowers",
    "statue",
    "bench",
    "fence",
    "lamppost",
    "fountain",
    "hedge",
    "dock",
    "boat",
    "reeds",
    "campfire",
    "gate",
    "flag",
    "signpost",
    "ruins",
    "water",
    "idol_statue",
  ],
  swamp: [
    "swamp_tree",
    "fog_patch",
    "broken_bridge",
    "witch_cottage",
    "cauldron",
    "tombstone",
    "glowing_runes",
    "hanging_cage",
    "poison_pool",
    "ruined_temple",
    "sunken_pillar",
    "idol_statue",
    "algae_pool",
    "tentacle",
    "skeleton_pile",
    "treasure_hoard",
    "deep_water",
  ],
  volcanic: [
    "lava_pool",
    "obsidian_spike",
    "magma_vent",
    "charred_tree",
    "skull_pile",
    "ember_rock",
    "volcano_rim",
    "lava_fall",
    "obsidian_pillar",
    "fire_crystal",
    "dead_adventurer",
    "broken_weapon",
    "obsidian_castle",
    "dark_throne",
    "dark_barracks",
    "dark_spire",
    "demon_statue",
    "lava_moat",
    "skull_throne",
    "fire_pit",
    "battle_standard",
    "idol_statue",
  ],
  winter: [
    "pine_tree",
    "snowman",
    "ice_crystal",
    "frozen_pond",
    "snow_pile",
    "icicles",
    "glacier",
    "fortress",
    "frozen_gate",
    "broken_wall",
    "frozen_soldier",
    "battle_crater",
    "ice_spire",
    "ice_throne",
    "ice_bridge",
    "frozen_waterfall",
    "aurora_crystal",
    "snow_drift",
    "snow_lantern",
    "idol_statue",
  ],
};

export const UNIVERSAL_DECORATIONS: DecorationCategory[] = [
  "cart",
  "tent",
  "campfire",
  "fishing_spot",
  "gate",
  "flag",
  "bones",
  "candles",
  "ritual_circle",
  "ember",
];

export const HAZARD_OPTIONS_BY_THEME: Record<MapTheme, HazardType[]> = {
  desert: [
    "quicksand",
    "storm_field",
    "lava_geyser",
    "fire",
    "lava",
    "lightning",
  ],
  grassland: ["poison_fog", "deep_water", "storm_field", "poison", "swamp"],
  swamp: ["poison_fog", "deep_water", "maelstrom", "poison", "swamp", "void"],
  volcanic: [
    "lava_geyser",
    "storm_field",
    "quicksand",
    "lava",
    "fire",
    "volcano",
  ],
  winter: ["ice_sheet", "ice_spikes", "storm_field", "slippery_ice", "ice"],
};

export const ALL_HAZARD_OPTIONS: HazardType[] = [
  "poison_fog",
  "deep_water",
  "maelstrom",
  "storm_field",
  "quicksand",
  "ice_sheet",
  "ice_spikes",
  "lava_geyser",
  "slippery_ice",
  "lava",
  "swamp",
  "ice",
  "poison",
  "fire",
  "lightning",
  "void",
  "volcano",
];

export const TOWER_TYPE_OPTIONS: TowerType[] = [
  "cannon",
  "library",
  "lab",
  "arch",
  "club",
  "station",
  "mortar",
];

export const TOWER_DISPLAY_NAMES: Record<TowerType, string> = {
  arch: "Blair Arch",
  cannon: "Nassau Cannon",
  club: "Eating Club",
  lab: "E-Quad Lab",
  library: "Firestone Library",
  mortar: "Palmer Mortar",
  station: "Dinky Station",
};

export const LANDMARK_OPTIONS = [
  ...LANDMARK_DECORATION_TYPES,
] as DecorationCategory[];

export const CHALLENGE_DECORATIONS: DecorationCategory[] = [
  "cannon_crest",
  "ivy_crossroads",
  "blight_basin",
  "triad_keep",
  "sunscorch_labyrinth",
  "frist_outpost",
  "ashen_spiral",
];

export const ENEMY_OPTIONS = Object.keys(ENEMY_DATA) as EnemyType[];

export const DEFAULT_PRESET_ID = "default";

export const TOOL_OPTIONS: ToolOption[] = [
  { icon: MousePointer2, key: "select", label: "Select" },
  { icon: Route, key: "path_primary", label: "Path A" },
  { icon: GitBranch, key: "path_secondary", label: "Path B" },
  { icon: User, key: "hero_spawn", label: "Hero" },
];

export const TOOL_HINTS: Record<string, string> = {
  decoration: "Click or drop to place decoration.",
  erase: "Click items to erase them.",
  hazard: "Click or drop to place hazard.",
  hero_spawn: "Click a tile to place hero spawn.",
  landmark: "Click or drop to place landmark.",
  path_primary: "Click to append nodes to primary path.",
  path_secondary: "Click to append nodes to secondary path.",
  select: "Select and drag existing nodes/items.",
  special_tower: "Click or drop to place objective.",
  tower: "Click or drop to place pre-placed tower.",
};

const clonePath = (
  points: { x: number; y: number }[] | undefined
): GridPoint[] | undefined =>
  points && points.length >= 2
    ? points.map((p) => ({ x: p.x, y: p.y }))
    : undefined;

const cloneDecorations = (
  decorations: MapDecoration[] | undefined
): MapDecoration[] =>
  (decorations ?? []).map((deco) => ({
    ...deco,
    pos: { ...deco.pos },
  }));

const cloneHazards = (hazards: MapHazard[] | undefined): MapHazard[] =>
  (hazards ?? []).map((hazard) => ({
    ...hazard,
    gridPos: hazard.gridPos ? { ...hazard.gridPos } : hazard.gridPos,
    pos: hazard.pos ? { ...(hazard.pos as GridPoint) } : hazard.pos,
  }));

const collectSpecialTowers = (
  levelData: (typeof LEVEL_DATA)[string] | undefined
): CustomSpecialTowerConfig[] => {
  if (!levelData) {
    return [];
  }
  if (levelData.specialTowers && levelData.specialTowers.length > 0) {
    return levelData.specialTowers.map((st) => ({
      hp: st.hp,
      pos: { ...st.pos },
      type: st.type,
    }));
  }
  if (levelData.specialTower) {
    return [
      {
        hp: levelData.specialTower.hp,
        pos: { ...levelData.specialTower.pos },
        type: levelData.specialTower.type,
      },
    ];
  }
  return [];
};

export const MAP_PRESET_TEMPLATES: MapPresetTemplate[] = [
  {
    decorations: [],
    description: "Blank sandbox preset.",
    hazards: [],
    id: DEFAULT_PRESET_ID,
    label: "Default",
    specialTowers: [],
  },
  ...WORLD_LEVELS.map((level) => {
    const levelData = LEVEL_DATA[level.id];
    const secondaryPathKey = levelData?.secondaryPath ?? `${level.id}_b`;
    return {
      decorations: cloneDecorations(levelData?.decorations),
      description: levelData?.description ?? level.description,
      difficulty: levelData?.difficulty ?? level.difficulty,
      hazards: cloneHazards(levelData?.hazards),
      heroSpawn: levelData?.heroSpawn
        ? { x: levelData.heroSpawn.x, y: levelData.heroSpawn.y }
        : undefined,
      id: level.id,
      label: levelData?.name ?? level.name,
      primaryPath: clonePath(MAP_PATHS[level.id]),
      secondaryPath: clonePath(MAP_PATHS[secondaryPathKey]),
      specialTowers: collectSpecialTowers(levelData),
      startingPawPoints: levelData?.startingPawPoints,
      theme: levelData?.theme ?? level.region,
    };
  }),
];
