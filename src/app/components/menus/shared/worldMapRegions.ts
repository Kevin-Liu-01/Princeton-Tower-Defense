import type { CSSProperties } from "react";

import type { LevelStats } from "../../../hooks/useLocalStorage";
import type { LevelStars } from "../../../types";
import { WORLD_LEVELS, DEV_LEVEL_IDS } from "../world-map/worldMapData";
import type { LevelNode } from "../world-map/worldMapData";

type Region = LevelNode["region"];

export interface RegionMeta {
  displayName: string;
  textClass: string;
  accent: string;
  bg: string;
  bgLight: string;
  bgDark: string;
  border: string;
  glow: string;
}

export interface RegionProgress {
  region: Region;
  levels: LevelNode[];
  stars: number;
  maxStars: number;
  completed: number;
  unlocked: number;
  total: number;
  targetLevel: LevelNode | null;
}

export const REGION_ORDER: Region[] = [
  "grassland",
  "swamp",
  "desert",
  "winter",
  "volcanic",
];

export const REGION_META: Record<Region, RegionMeta> = {
  desert: {
    accent: "#fbbf24",
    bg: "rgba(55,40,18,0.85)",
    bgDark: "rgba(40,28,12,0.65)",
    bgLight: "rgba(55,40,18,0.8)",
    border: "rgba(180,140,50,0.45)",
    displayName: "Stadium Sands",
    glow: "rgba(180,140,50,0.08)",
    textClass: "text-amber-400",
  },
  grassland: {
    accent: "#4ade80",
    bg: "rgba(30,50,25,0.85)",
    bgDark: "rgba(20,35,18,0.65)",
    bgLight: "rgba(30,50,25,0.8)",
    border: "rgba(80,160,60,0.45)",
    displayName: "Princeton Grounds",
    glow: "rgba(80,160,60,0.08)",
    textClass: "text-green-400",
  },
  swamp: {
    accent: "#2dd4bf",
    bg: "rgba(20,40,38,0.85)",
    bgDark: "rgba(15,30,28,0.65)",
    bgLight: "rgba(20,40,38,0.8)",
    border: "rgba(60,140,130,0.45)",
    displayName: "Mathey Marshes",
    glow: "rgba(60,140,130,0.08)",
    textClass: "text-teal-400",
  },
  volcanic: {
    accent: "#f87171",
    bg: "rgba(50,25,20,0.85)",
    bgDark: "rgba(35,18,15,0.65)",
    bgLight: "rgba(50,25,20,0.8)",
    border: "rgba(180,70,50,0.45)",
    displayName: "Dormitory Depths",
    glow: "rgba(180,70,50,0.08)",
    textClass: "text-red-400",
  },
  winter: {
    accent: "#60a5fa",
    bg: "rgba(25,35,50,0.85)",
    bgDark: "rgba(18,25,40,0.65)",
    bgLight: "rgba(25,35,50,0.8)",
    border: "rgba(80,130,200,0.45)",
    displayName: "Frist Frontier",
    glow: "rgba(80,130,200,0.08)",
    textClass: "text-blue-400",
  },
};

export const REGION_CHALLENGE_BADGE_STYLES: Record<Region, CSSProperties> = {
  desert: {
    background:
      "linear-gradient(135deg, rgba(133,99,41,0.9), rgba(84,56,21,0.95))",
    border: "1px solid rgba(255,216,132,0.55)",
    color: "rgb(255,242,206)",
  },
  grassland: {
    background:
      "linear-gradient(135deg, rgba(41,110,59,0.9), rgba(22,68,36,0.95))",
    border: "1px solid rgba(160,242,168,0.55)",
    color: "rgb(230,255,218)",
  },
  swamp: {
    background:
      "linear-gradient(135deg, rgba(28,98,94,0.9), rgba(12,60,58,0.95))",
    border: "1px solid rgba(146,232,217,0.55)",
    color: "rgb(224,255,248)",
  },
  volcanic: {
    background:
      "linear-gradient(135deg, rgba(145,38,20,0.9), rgba(90,18,10,0.95))",
    border: "1px solid rgba(255,170,90,0.55)",
    color: "rgb(255,225,170)",
  },
  winter: {
    background:
      "linear-gradient(135deg, rgba(47,87,129,0.9), rgba(28,56,92,0.95))",
    border: "1px solid rgba(169,213,255,0.55)",
    color: "rgb(231,246,255)",
  },
};

export function getCampaignLevels(isDevMode = false): LevelNode[] {
  return WORLD_LEVELS.filter(
    (level) =>
      level.kind !== "sandbox" && (isDevMode || !DEV_LEVEL_IDS.has(level.id))
  );
}

export function getRegionLevels(
  region: Region,
  isDevMode = false
): LevelNode[] {
  return getCampaignLevels(isDevMode).filter(
    (level) => level.region === region
  );
}

export function computeRegionProgress(
  region: Region,
  levelStars: LevelStars,
  unlockedMaps: Set<string>,
  isDevMode = false
): RegionProgress {
  const levels = getRegionLevels(region, isDevMode);
  const stars = levels.reduce(
    (sum, level) => sum + (levelStars[level.id] || 0),
    0
  );
  const maxStars = levels.length * 3;
  const completed = levels.filter(
    (level) => (levelStars[level.id] || 0) > 0
  ).length;
  const unlocked = levels.filter((level) => unlockedMaps.has(level.id)).length;
  const targetLevel =
    levels.find(
      (level) => unlockedMaps.has(level.id) && (levelStars[level.id] || 0) < 3
    ) ??
    levels[0] ??
    null;

  return {
    completed,
    levels,
    maxStars,
    region,
    stars,
    targetLevel,
    total: levels.length,
    unlocked,
  };
}

export function getRegionProgressList(
  levelStars: LevelStars,
  unlockedMaps: Set<string>,
  isDevMode = false
): RegionProgress[] {
  return REGION_ORDER.map((region) =>
    computeRegionProgress(region, levelStars, unlockedMaps, isDevMode)
  );
}

export function findRecommendedLevel(
  levelStars: LevelStars,
  unlockedMaps: Set<string>,
  isDevMode = false
): LevelNode | null {
  const campaignLevels = getCampaignLevels(isDevMode);

  for (const level of campaignLevels) {
    if (unlockedMaps.has(level.id) && (levelStars[level.id] || 0) === 0) {
      return level;
    }
  }

  for (const level of campaignLevels) {
    if (unlockedMaps.has(level.id) && (levelStars[level.id] || 0) < 3) {
      return level;
    }
  }

  return null;
}

export function findLastPlayedLevel(
  levelStats: Record<string, LevelStats>
): { id: string; stats: LevelStats } | null {
  let bestEntry: { id: string; stats: LevelStats } | null = null;
  let bestTimestamp = 0;

  for (const [id, stats] of Object.entries(levelStats)) {
    if (!stats.timesPlayed || stats.timesPlayed <= 0) {
      continue;
    }

    const playedAt = stats.lastPlayedAt ?? 0;
    if (!bestEntry || playedAt > bestTimestamp) {
      bestEntry = { id, stats };
      bestTimestamp = playedAt;
    }
  }

  return bestEntry;
}
