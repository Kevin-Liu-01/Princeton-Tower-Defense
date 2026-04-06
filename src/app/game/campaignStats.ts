import type { LevelStats, GameProgress } from "../hooks/useLocalStorage";
import { ALL_CAMPAIGN_LEVELS, REGION_CAMPAIGN_LEVELS, type RegionKey } from "./progression";

export interface CumulativeCampaignStats {
  totalStars: number;
  maxStars: number;
  totalBestTime: number;
  totalTimesPlayed: number;
  totalTimesWon: number;
  perfectLevels: number;
  levelsCompleted: number;
  totalLevels: number;
  bestOverallHearts: number;
  regionStats: { region: string; stars: number; maxStars: number; completed: boolean }[];
}

const REGION_DISPLAY_NAMES: Record<RegionKey, string> = {
  grassland: "Princeton Grounds",
  swamp: "Murky Marshes",
  desert: "Sahara Sands",
  winter: "Frozen Frontier",
  volcanic: "Volcanic Depths",
};

export function computeCumulativeCampaignStats(progress: GameProgress): CumulativeCampaignStats {
  const { levelStars, levelStats } = progress;
  const totalLevels = ALL_CAMPAIGN_LEVELS.length;

  let totalStars = 0;
  let totalBestTime = 0;
  let totalTimesPlayed = 0;
  let totalTimesWon = 0;
  let perfectLevels = 0;
  let levelsCompleted = 0;
  let bestOverallHearts = 0;

  for (const levelId of ALL_CAMPAIGN_LEVELS) {
    const stars = levelStars[levelId] || 0;
    totalStars += stars;
    if (stars > 0) levelsCompleted++;
    if (stars >= 3) perfectLevels++;

    const stats: LevelStats = levelStats[levelId] || {};
    if (stats.bestTime) totalBestTime += stats.bestTime;
    totalTimesPlayed += stats.timesPlayed || 0;
    totalTimesWon += stats.timesWon || 0;
    if (stats.bestHearts) bestOverallHearts += stats.bestHearts;
  }

  const regionStats = (Object.keys(REGION_CAMPAIGN_LEVELS) as RegionKey[]).map((key) => {
    const levels = REGION_CAMPAIGN_LEVELS[key];
    const regionStars = levels.reduce((sum, id) => sum + (levelStars[id] || 0), 0);
    const completed = levels.every((id) => (levelStars[id] || 0) > 0);
    return {
      region: REGION_DISPLAY_NAMES[key],
      stars: regionStars,
      maxStars: levels.length * 3,
      completed,
    };
  });

  return {
    totalStars,
    maxStars: totalLevels * 3,
    totalBestTime,
    totalTimesPlayed,
    totalTimesWon,
    perfectLevels,
    levelsCompleted,
    totalLevels,
    bestOverallHearts,
    regionStats,
  };
}
