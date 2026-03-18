import type { LevelStars } from "../../types";
import {
  REGION_CAMPAIGN_LEVELS,
  REGION_CHALLENGE_UNLOCKS,
  CHALLENGE_LEVEL_UNLOCKS,
  isRegionCleared,
  type RegionKey,
} from "../../game/progression";

export function computePendingChallengeUnlocks(
  levelStars: LevelStars,
  unlockedMaps: string[],
): string[] {
  const pendingUnlocks: string[] = [];
  (Object.keys(REGION_CAMPAIGN_LEVELS) as Array<RegionKey>).forEach((regionKey) => {
    if (!isRegionCleared(regionKey, levelStars)) return;
    REGION_CHALLENGE_UNLOCKS[regionKey].forEach((challengeLevel) => {
      if (unlockedMaps.includes(challengeLevel)) return;
      if (pendingUnlocks.includes(challengeLevel)) return;
      pendingUnlocks.push(challengeLevel);
    });
  });

  Object.entries(CHALLENGE_LEVEL_UNLOCKS).forEach(
    ([completedChallengeId, unlockedChallengeId]) => {
      if ((levelStars[completedChallengeId] || 0) <= 0) return;
      if (unlockedMaps.includes(unlockedChallengeId)) return;
      pendingUnlocks.push(unlockedChallengeId);
    }
  );

  return pendingUnlocks;
}
