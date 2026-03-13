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
} from "../../constants";
import { LANDMARK_DECORATION_TYPES } from "../../utils";
import { WORLD_LEVELS } from "../menus/worldMapData";
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

export const OBJECTIVE_TYPE_STATS: Record<SpecialTowerType, ObjectiveTypeStats> = {
  beacon: {
    title: "Beacon",
    effect: "Buff aura for nearby defenders.",
    risk: "Objective falls when enemies overrun it.",
  },
  shrine: {
    title: "Shrine",
    effect: "Periodic healing pulse for allies.",
    risk: "Losing it removes sustain cadence.",
  },
  vault: {
    title: "Vault",
    effect: "Has HP and can be directly destroyed.",
    risk: "If HP reaches zero, objective fails.",
  },
  barracks: {
    title: "Barracks",
    effect: "Spawns allied troops over time.",
    risk: "Losing it cuts reinforcement pressure.",
  },
  chrono_relay: {
    title: "Arcane Time Crystal",
    effect: "Boosts nearby tower attack speed.",
    risk: "Losing it slows your local DPS cadence.",
  },
  sentinel_nexus: {
    title: "Imperial Red Sentinel",
    effect: "Lightning strikes locked target every 10s.",
    risk: "Losing it removes controllable map pressure.",
  },
  sunforge_orrery: {
    title: "Sunforge Orrery",
    effect: "Tri-plasma barrage hits dense enemy clusters.",
    risk: "Long cadence rewards careful timing windows.",
  },
};

export const DECORATION_OPTIONS_BY_THEME: Record<MapTheme, DecorationCategory[]> = {
  grassland: [
    "tree", "bush", "rock", "flowers", "statue", "bench", "fence",
    "lamppost", "fountain", "hedge", "dock", "boat", "reeds",
    "campfire", "gate", "flag", "signpost", "ruins", "water",
  ],
  swamp: [
    "swamp_tree", "fog_patch", "broken_bridge", "witch_cottage", "cauldron",
    "tombstone", "glowing_runes", "hanging_cage", "poison_pool",
    "ruined_temple", "sunken_pillar", "idol_statue", "algae_pool",
    "tentacle", "skeleton_pile", "treasure_hoard", "deep_water",
  ],
  desert: [
    "palm", "cactus", "dune", "skull", "pottery", "oasis_pool",
    "pyramid", "obelisk", "sphinx", "hieroglyph_wall", "treasure_chest",
    "skeleton", "torch", "temple_entrance", "sarcophagus", "cobra_statue",
    "sand_pile",
  ],
  winter: [
    "pine_tree", "snowman", "ice_crystal", "frozen_pond", "snow_pile",
    "icicles", "glacier", "ice_fortress", "frozen_gate", "broken_wall",
    "frozen_soldier", "battle_crater", "ice_spire", "ice_throne",
    "ice_bridge", "frozen_waterfall", "aurora_crystal", "snow_drift",
    "snow_lantern",
  ],
  volcanic: [
    "lava_pool", "obsidian_spike", "magma_vent", "charred_tree",
    "skull_pile", "ember_rock", "volcano_rim", "lava_fall",
    "obsidian_pillar", "fire_crystal", "dead_adventurer", "broken_weapon",
    "obsidian_castle", "dark_throne", "dark_barracks", "dark_spire",
    "demon_statue", "lava_moat", "skull_throne", "fire_pit",
    "battle_standard",
  ],
};

export const UNIVERSAL_DECORATIONS: DecorationCategory[] = [
  "cart", "tent", "campfire", "fishing_spot", "gate", "flag",
  "bones", "candles", "ritual_circle", "ember",
];

export const HAZARD_OPTIONS_BY_THEME: Record<MapTheme, HazardType[]> = {
  grassland: ["poison_fog", "deep_water", "storm_field", "poison", "swamp"],
  swamp: ["poison_fog", "deep_water", "maelstrom", "poison", "swamp", "void"],
  desert: ["quicksand", "storm_field", "lava_geyser", "fire", "lava", "lightning"],
  winter: ["ice_sheet", "ice_spikes", "storm_field", "slippery_ice", "ice"],
  volcanic: ["lava_geyser", "storm_field", "quicksand", "lava", "fire", "volcano"],
};

export const ALL_HAZARD_OPTIONS: HazardType[] = [
  "poison_fog", "deep_water", "maelstrom", "storm_field",
  "quicksand", "ice_sheet", "ice_spikes", "lava_geyser",
  "slippery_ice", "lava", "swamp", "ice", "poison",
  "fire", "lightning", "void", "volcano",
];

export const TOWER_TYPE_OPTIONS: TowerType[] = [
  "cannon", "library", "lab", "arch", "club", "station", "mortar",
];

export const TOWER_DISPLAY_NAMES: Record<TowerType, string> = {
  station: "Dinky Station",
  cannon: "Nassau Cannon",
  library: "Firestone Library",
  lab: "E-Quad Lab",
  arch: "Blair Arch",
  club: "Eating Club",
  mortar: "Palmer Mortar",
};

export const LANDMARK_OPTIONS = Array.from(
  LANDMARK_DECORATION_TYPES
) as DecorationCategory[];

export const CHALLENGE_DECORATIONS: DecorationCategory[] = [
  "cannon_crest",
  "ivy_crossroads",
  "blight_basin",
  "triad_keep",
  "sunscorch_labyrinth",
  "frontier_outpost",
  "ashen_spiral",
];

export const ENEMY_OPTIONS = Object.keys(ENEMY_DATA) as EnemyType[];

export const DEFAULT_PRESET_ID = "default";

export const TOOL_OPTIONS: ToolOption[] = [
  { key: "select", label: "Select", icon: MousePointer2 },
  { key: "path_primary", label: "Path A", icon: Route },
  { key: "path_secondary", label: "Path B", icon: GitBranch },
  { key: "hero_spawn", label: "Hero", icon: User },
];

export const TOOL_HINTS: Record<string, string> = {
  select: "Select and drag existing nodes/items.",
  path_primary: "Click to append nodes to primary path.",
  path_secondary: "Click to append nodes to secondary path.",
  hero_spawn: "Click a tile to place hero spawn.",
  special_tower: "Click or drop to place objective.",
  tower: "Click or drop to place pre-placed tower.",
  decoration: "Click or drop to place decoration.",
  landmark: "Click or drop to place landmark.",
  hazard: "Click or drop to place hazard.",
  erase: "Click items to erase them.",
};

const cloneDecorations = (decorations: MapDecoration[] | undefined): MapDecoration[] =>
  (decorations ?? []).map((deco) => ({
    ...deco,
    pos: { ...deco.pos },
  }));

const cloneHazards = (hazards: MapHazard[] | undefined): MapHazard[] =>
  (hazards ?? []).map((hazard) => ({
    ...hazard,
    pos: hazard.pos ? { ...(hazard.pos as GridPoint) } : hazard.pos,
    gridPos: hazard.gridPos ? { ...hazard.gridPos } : hazard.gridPos,
  }));

export const MAP_PRESET_TEMPLATES: MapPresetTemplate[] = [
  {
    id: DEFAULT_PRESET_ID,
    label: "Default",
    description: "Blank sandbox preset.",
    decorations: [],
    hazards: [],
  },
  ...WORLD_LEVELS.map((level) => {
    const levelData = LEVEL_DATA[level.id];
    return {
      id: level.id,
      label: levelData?.name ?? level.name,
      description: levelData?.description ?? level.description,
      theme: levelData?.theme ?? level.region,
      difficulty: levelData?.difficulty ?? level.difficulty,
      startingPawPoints: levelData?.startingPawPoints,
      decorations: cloneDecorations(levelData?.decorations),
      hazards: cloneHazards(levelData?.hazards),
      specialTower: levelData?.specialTower
        ? {
          pos: { ...levelData.specialTower.pos },
          type: levelData.specialTower.type,
          hp: levelData.specialTower.hp,
        }
        : undefined,
    };
  }),
];
