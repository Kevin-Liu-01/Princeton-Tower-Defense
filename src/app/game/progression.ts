const REGION_CAMPAIGN_LEVELS: Record<
  "grassland" | "swamp" | "desert" | "winter" | "volcanic",
  string[]
> = {
  grassland: ["poe", "carnegie", "nassau"],
  swamp: ["bog", "witch_hut", "sunken_temple"],
  desert: ["oasis", "pyramid", "sphinx"],
  winter: ["glacier", "fortress", "peak"],
  volcanic: ["lava", "crater", "throne"],
};

export type RegionKey = keyof typeof REGION_CAMPAIGN_LEVELS;

const REGION_CHALLENGE_UNLOCKS: Record<RegionKey, string[]> = {
  grassland: ["ivy_crossroads"],
  swamp: ["blight_basin", "triad_keep"],
  desert: ["sunscorch_labyrinth"],
  winter: ["whiteout_pass"],
  volcanic: ["ashen_spiral"],
};

const CHALLENGE_LEVEL_UNLOCKS: Record<string, string> = {
  ivy_crossroads: "cannon_crest",
  whiteout_pass: "frontier_outpost",
};

const CAMPAIGN_LEVEL_UNLOCKS: Record<string, string> = {
  poe: "carnegie",
  carnegie: "nassau",
  nassau: "bog",
  bog: "witch_hut",
  witch_hut: "sunken_temple",
  sunken_temple: "oasis",
  oasis: "pyramid",
  pyramid: "sphinx",
  sphinx: "glacier",
  glacier: "fortress",
  fortress: "peak",
  peak: "lava",
  lava: "crater",
  crater: "throne",
};

export {
  REGION_CAMPAIGN_LEVELS,
  REGION_CHALLENGE_UNLOCKS,
  CHALLENGE_LEVEL_UNLOCKS,
  CAMPAIGN_LEVEL_UNLOCKS,
};

export function isRegionCleared(
  region: RegionKey,
  starsByLevel: Record<string, number>
): boolean {
  return REGION_CAMPAIGN_LEVELS[region].every(
    (levelId) => (starsByLevel[levelId] || 0) > 0
  );
}
