const REGION_CAMPAIGN_LEVELS: Record<
  "grassland" | "swamp" | "desert" | "winter" | "volcanic",
  string[]
> = {
  desert: ["oasis", "pyramid", "sphinx"],
  grassland: ["poe", "carnegie", "nassau"],
  swamp: ["bog", "witch_hut", "sunken_temple"],
  volcanic: ["lava", "crater", "throne"],
  winter: ["glacier", "fortress", "peak"],
};

export type RegionKey = keyof typeof REGION_CAMPAIGN_LEVELS;

const REGION_CHALLENGE_UNLOCKS: Record<RegionKey, string[]> = {
  desert: ["sunscorch_labyrinth", "sun_obelisk", "mirage_dunes"],
  grassland: ["ivy_crossroads"],
  swamp: ["blight_basin", "triad_keep"],
  volcanic: ["ashen_spiral", "infernal_gate"],
  winter: ["whiteout_pass"],
};

const CHALLENGE_LEVEL_UNLOCKS: Record<string, string> = {
  ivy_crossroads: "cannon_crest",
  whiteout_pass: "frist_outpost",
};

const CAMPAIGN_LEVEL_UNLOCKS: Record<string, string> = {
  bog: "witch_hut",
  carnegie: "nassau",
  crater: "throne",
  fortress: "peak",
  glacier: "fortress",
  lava: "crater",
  nassau: "bog",
  oasis: "pyramid",
  peak: "lava",
  poe: "carnegie",
  pyramid: "sphinx",
  sphinx: "glacier",
  sunken_temple: "oasis",
  witch_hut: "sunken_temple",
};

const FINAL_CAMPAIGN_LEVEL = "throne";

const ALL_CAMPAIGN_LEVELS: string[] = Object.values(
  REGION_CAMPAIGN_LEVELS
).flat();

export {
  REGION_CAMPAIGN_LEVELS,
  REGION_CHALLENGE_UNLOCKS,
  CHALLENGE_LEVEL_UNLOCKS,
  CAMPAIGN_LEVEL_UNLOCKS,
  FINAL_CAMPAIGN_LEVEL,
  ALL_CAMPAIGN_LEVELS,
};

export function isRegionCleared(
  region: RegionKey,
  starsByLevel: Record<string, number>
): boolean {
  return REGION_CAMPAIGN_LEVELS[region].every(
    (levelId) => (starsByLevel[levelId] || 0) > 0
  );
}
