import {
  LEVEL_DATA,
  LEVEL_WAVES,
  WAVES,
  INITIAL_PAW_POINTS,
  TILE_SIZE,
} from "../../constants";
import type { SpecialTower, TowerType } from "../../types";
import {
  LANDMARK_DECORATION_TYPES,
  BACKGROUND_BLOCKING_DECORATION_TYPES,
  getMapDecorationWorldPos,
  getLandmarkSpawnExclusion,
  resolveMapDecorationRuntimePlacement,
} from "../../utils";

const MAX_DECORATION_EXCLUSION_RANGE = 3;

function getLandmarkTowerExclusionRange(
  decorationType: string,
  size: number,
  explicitHeightTag?: Parameters<typeof getLandmarkSpawnExclusion>[2]
): number {
  const exclusion = getLandmarkSpawnExclusion(
    decorationType,
    size,
    explicitHeightTag
  );
  if (!exclusion) {
    return 0;
  }
  return Math.min(Math.ceil(exclusion.fullR), MAX_DECORATION_EXCLUSION_RANGE);
}

export const getLevelWaves = (levelId: string) => LEVEL_WAVES[levelId] || WAVES;

export const getLevelStartingPawPoints = (levelId: string): number =>
  LEVEL_DATA[levelId]?.startingPawPoints ?? INITIAL_PAW_POINTS;

export const getLevelSpecialTowers = (levelId: string): SpecialTower[] => {
  const level = LEVEL_DATA[levelId];
  if (!level) {
    return [];
  }
  if (level.specialTowers && level.specialTowers.length > 0) {
    return level.specialTowers;
  }
  return level.specialTower ? [level.specialTower] : [];
};

export const vaultPosKey = (pos: { x: number; y: number }): string =>
  `${pos.x},${pos.y}`;

export const getVaultHpMap = (levelId: string): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const tower of getLevelSpecialTowers(levelId)) {
    if (tower.type === "vault" && typeof tower.hp === "number") {
      map[vaultPosKey(tower.pos)] = tower.hp;
    }
  }
  return map;
};

export const getLevelAllowedTowers = (levelId: string): TowerType[] | null => {
  const allowed = LEVEL_DATA[levelId]?.allowedTowers;
  return allowed && allowed.length > 0 ? [...allowed] : null;
};

export const getBlockedPositionsForMap = (mapKey: string): Set<string> => {
  const levelData = LEVEL_DATA[mapKey];
  const blocked = new Set<string>();

  if (levelData?.decorations) {
    for (const decoration of levelData.decorations) {
      const decorationType = decoration.category || decoration.type;

      if (decorationType && LANDMARK_DECORATION_TYPES.has(decorationType)) {
        const resolvedPlacement =
          resolveMapDecorationRuntimePlacement(decoration);
        const size = resolvedPlacement?.scale ?? (decoration.size || 1);
        const worldPos = getMapDecorationWorldPos(decoration);
        const baseX = Math.floor(worldPos.x / TILE_SIZE - 0.5);
        const baseY = Math.floor(worldPos.y / TILE_SIZE - 0.5);
        const range = getLandmarkTowerExclusionRange(
          decorationType,
          size,
          decoration.heightTag
        );

        for (let dx = -range; dx <= range; dx++) {
          for (let dy = -range; dy <= range; dy++) {
            blocked.add(`${baseX + dx},${baseY + dy}`);
          }
        }
      }

      const resolvedType =
        resolveMapDecorationRuntimePlacement(decoration)?.runtimeType ??
        decorationType;
      if (
        resolvedType &&
        BACKGROUND_BLOCKING_DECORATION_TYPES.has(resolvedType)
      ) {
        const resolvedPlacement =
          resolveMapDecorationRuntimePlacement(decoration);
        const size = resolvedPlacement?.scale ?? (decoration.size || 1);
        const worldPos = getMapDecorationWorldPos(decoration);
        const baseX = Math.floor(worldPos.x / TILE_SIZE - 0.5);
        const baseY = Math.floor(worldPos.y / TILE_SIZE - 0.5);
        const range = Math.min(
          Math.ceil(size * 0.5),
          MAX_DECORATION_EXCLUSION_RANGE
        );

        for (let dx = -range; dx <= range; dx++) {
          for (let dy = -range; dy <= range; dy++) {
            blocked.add(`${baseX + dx},${baseY + dy}`);
          }
        }
      }
    }
  }

  const levelSpecialTowers = getLevelSpecialTowers(mapKey);
  for (const specialTower of levelSpecialTowers) {
    const baseX = Math.floor(specialTower.pos.x);
    const baseY = Math.floor(specialTower.pos.y);
    blocked.add(`${baseX},${baseY}`);
  }

  return blocked;
};
