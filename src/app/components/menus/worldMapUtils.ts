import { WORLD_LEVELS, DEV_LEVELS, type LevelNode } from "./worldMapData";

export const getWorldMapY = (pct: number, mapHeight: number): number => {
  const topMargin = 80;
  const bottomMargin = 50;
  const usableHeight = mapHeight - topMargin - bottomMargin;
  const remapped = (pct - 20) / 60;
  return topMargin + remapped * usableHeight;
};

export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

export const getWorldLevelById = (id: string): LevelNode | undefined =>
  WORLD_LEVELS.find((level) => level.id === id) ??
  DEV_LEVELS.find((level) => level.id === id);

export const isWorldLevelUnlocked = (
  levelId: string,
  unlockedMaps: readonly string[],
): boolean => unlockedMaps.includes(levelId);
