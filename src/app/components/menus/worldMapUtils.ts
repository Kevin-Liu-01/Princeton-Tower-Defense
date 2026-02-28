import { WORLD_LEVELS, type LevelNode } from "./worldMapData";

export const getWorldMapY = (pct: number, mapHeight: number): number => {
  const usableHeight = mapHeight - 70;
  return (pct / 100) * usableHeight - 50;
};

export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

export const getWorldLevelById = (id: string): LevelNode | undefined =>
  WORLD_LEVELS.find((level) => level.id === id);

export const isWorldLevelUnlocked = (
  levelId: string,
  unlockedMaps: readonly string[]
): boolean => unlockedMaps.includes(levelId);

