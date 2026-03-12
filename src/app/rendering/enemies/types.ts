import type { Enemy, SlowSourceType } from "../../types";

export interface EnemyPaletteVariants {
  dark: string;
  light: string;
}

export interface EnemyFlashProfile {
  outerColor: string;
  innerColor: string;
  rimColor: string;
  intensityScale: number;
  attackBoost: number;
}

export interface SlowAuraColors {
  aura: string;
  ring: string;
  inner: string;
  rune: string;
  runeOutline: string;
  particle: string;
}

export function getSlowAuraColors(source?: SlowSourceType): SlowAuraColors {
  switch (source) {
    case "quicksand":
      return {
        aura: "194, 154, 80",
        ring: "210, 170, 90",
        inner: "230, 200, 140",
        rune: "240, 220, 170",
        runeOutline: "170, 130, 60",
        particle: "220, 190, 120",
      };
    case "maelstrom":
      return {
        aura: "50, 130, 220",
        ring: "80, 160, 240",
        inner: "140, 200, 255",
        rune: "180, 220, 255",
        runeOutline: "40, 100, 200",
        particle: "120, 190, 255",
      };
    case "deep_water":
      return {
        aura: "30, 90, 160",
        ring: "50, 120, 190",
        inner: "100, 170, 220",
        rune: "150, 200, 240",
        runeOutline: "25, 75, 140",
        particle: "80, 160, 220",
      };
    case "ice_spikes":
      return {
        aura: "100, 200, 240",
        ring: "130, 215, 250",
        inner: "180, 230, 255",
        rune: "210, 240, 255",
        runeOutline: "70, 170, 220",
        particle: "160, 225, 255",
      };
    case "library":
      return {
        aura: "147, 51, 234",
        ring: "168, 85, 247",
        inner: "216, 180, 254",
        rune: "233, 213, 255",
        runeOutline: "147, 51, 234",
        particle: "216, 180, 254",
      };
    default:
      return {
        aura: "147, 51, 234",
        ring: "168, 85, 247",
        inner: "216, 180, 254",
        rune: "233, 213, 255",
        runeOutline: "147, 51, 234",
        particle: "216, 180, 254",
      };
  }
}

export const enemyPaletteCache = new Map<string, EnemyPaletteVariants>();

const UNDEAD_FLASH_TYPES = new Set([
  "specter",
  "necromancer",
  "banshee",
  "plaguebearer",
  "will_o_wisp",
  "shadow_knight",
]);

const INFERNAL_FLASH_TYPES = new Set([
  "infernal",
  "magma_spawn",
  "fire_imp",
  "ember_guard",
  "dragon",
]);

const FROST_FLASH_TYPES = new Set([
  "frostling",
  "snow_goblin",
  "yeti",
  "ice_witch",
]);

const ARCANE_FLASH_TYPES = new Set([
  "mage",
  "warlock",
  "hexer",
  "cultist",
  "assassin",
]);

const NATURE_FLASH_TYPES = new Set([
  "thornwalker",
  "bog_creature",
  "swamp_troll",
]);

const DESERT_FLASH_TYPES = new Set([
  "nomad",
  "scorpion",
  "scarab",
  "sandworm",
]);

const FOREST_FLASH_TYPES = new Set([
  "athlete",
  "tiger_fan",
]);

const STORM_FLASH_TYPES = new Set([
  "harpy",
  "wyvern",
]);

const BLOOD_FLASH_TYPES = new Set([
  "berserker",
  "juggernaut",
]);

const STONE_FLASH_TYPES = new Set([
  "golem",
]);

const DEFAULT_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(255, 236, 212, 1)",
  innerColor: "rgba(255, 255, 255, 0.9)",
  rimColor: "rgba(255, 245, 220, 0.9)",
  intensityScale: 1,
  attackBoost: 0.03,
};

const RADIANT_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(255, 224, 176, 1)",
  innerColor: "rgba(255, 250, 226, 0.94)",
  rimColor: "rgba(255, 214, 120, 0.9)",
  intensityScale: 0.95,
  attackBoost: 0.028,
};

const ARCANE_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(212, 195, 255, 1)",
  innerColor: "rgba(240, 228, 255, 0.95)",
  rimColor: "rgba(188, 164, 255, 0.9)",
  intensityScale: 0.96,
  attackBoost: 0.03,
};

const UNDEAD_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(180, 226, 255, 1)",
  innerColor: "rgba(228, 248, 255, 0.92)",
  rimColor: "rgba(134, 209, 255, 0.92)",
  intensityScale: 0.92,
  attackBoost: 0.026,
};

const INFERNAL_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(255, 182, 118, 1)",
  innerColor: "rgba(255, 230, 175, 0.93)",
  rimColor: "rgba(255, 125, 78, 0.95)",
  intensityScale: 1.14,
  attackBoost: 0.04,
};

const FROST_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(188, 232, 255, 1)",
  innerColor: "rgba(236, 250, 255, 0.96)",
  rimColor: "rgba(154, 224, 255, 0.92)",
  intensityScale: 1.02,
  attackBoost: 0.028,
};

const NATURE_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(196, 236, 176, 1)",
  innerColor: "rgba(235, 252, 220, 0.92)",
  rimColor: "rgba(153, 211, 120, 0.9)",
  intensityScale: 0.93,
  attackBoost: 0.026,
};

const DESERT_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(255, 210, 130, 1)",
  innerColor: "rgba(255, 240, 200, 0.92)",
  rimColor: "rgba(210, 170, 80, 0.9)",
  intensityScale: 0.96,
  attackBoost: 0.028,
};

const FOREST_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(180, 210, 140, 1)",
  innerColor: "rgba(230, 245, 210, 0.92)",
  rimColor: "rgba(140, 180, 100, 0.9)",
  intensityScale: 0.94,
  attackBoost: 0.026,
};

const STORM_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(200, 220, 255, 1)",
  innerColor: "rgba(230, 240, 255, 0.94)",
  rimColor: "rgba(160, 190, 255, 0.92)",
  intensityScale: 1.04,
  attackBoost: 0.032,
};

const BLOOD_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(255, 170, 160, 1)",
  innerColor: "rgba(255, 220, 210, 0.92)",
  rimColor: "rgba(255, 120, 100, 0.94)",
  intensityScale: 1.08,
  attackBoost: 0.035,
};

const STONE_FLASH_PROFILE: EnemyFlashProfile = {
  outerColor: "rgba(200, 200, 210, 1)",
  innerColor: "rgba(235, 235, 240, 0.9)",
  rimColor: "rgba(160, 160, 175, 0.88)",
  intensityScale: 0.88,
  attackBoost: 0.022,
};

export function getEnemyFlashProfile(
  enemyType: Enemy["type"],
  category?: string,
): EnemyFlashProfile {
  if (INFERNAL_FLASH_TYPES.has(enemyType)) return INFERNAL_FLASH_PROFILE;
  if (UNDEAD_FLASH_TYPES.has(enemyType)) return UNDEAD_FLASH_PROFILE;
  if (FROST_FLASH_TYPES.has(enemyType)) return FROST_FLASH_PROFILE;
  if (ARCANE_FLASH_TYPES.has(enemyType)) return ARCANE_FLASH_PROFILE;
  if (NATURE_FLASH_TYPES.has(enemyType)) return NATURE_FLASH_PROFILE;
  if (DESERT_FLASH_TYPES.has(enemyType)) return DESERT_FLASH_PROFILE;
  if (FOREST_FLASH_TYPES.has(enemyType)) return FOREST_FLASH_PROFILE;
  if (STORM_FLASH_TYPES.has(enemyType)) return STORM_FLASH_PROFILE;
  if (BLOOD_FLASH_TYPES.has(enemyType)) return BLOOD_FLASH_PROFILE;
  if (STONE_FLASH_TYPES.has(enemyType)) return STONE_FLASH_PROFILE;

  if (category === "academic" || category === "campus")
    return RADIANT_FLASH_PROFILE;
  if (category === "ranged") return ARCANE_FLASH_PROFILE;
  if (category === "flying") return STORM_FLASH_PROFILE;
  if (category === "nature" || category === "swarm")
    return DESERT_FLASH_PROFILE;

  return DEFAULT_FLASH_PROFILE;
}
