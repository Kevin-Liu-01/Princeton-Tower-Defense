import type {
  DecorationType,
  SpecialTower,
  TowerType,
} from "../../types";
import {
  LEVEL_DATA,
  LEVEL_WAVES,
  WAVES,
  INITIAL_PAW_POINTS,
  TILE_SIZE,
} from "../../constants";
import {
  LANDMARK_DECORATION_TYPES,
  BACKGROUND_BLOCKING_DECORATION_TYPES,
  getMapDecorationWorldPos,
  resolveMapDecorationRuntimePlacement,
} from "../../utils";

const MAX_DECORATION_EXCLUSION_RANGE = 3;

const LANDMARK_TOWER_EXCLUSION: Partial<Record<DecorationType, number>> = {
  pyramid: 1.0,
  nassau_hall: 1.0,
  princeton_chapel: 1.4,
  firestone_library: 1.4,
  blair_arch: 1.3,
  whig_hall: 1.3,
  east_pyne: 1.3,
  prospect_house: 1.3,
  clio_hall: 1.3,
  mccosh_hall: 1.4,
  robertson_hall: 1.3,
  holder_hall: 1.4,
  cleveland_tower: 1.1,
  alexander_hall: 1.3,
  fine_hall: 1.3,
  foulke_hall: 1.4,
  tiger_stadium: 1.4,
  giant_sphinx: 0.5,
  glacier: 0.5,
  ice_fortress: 0.5,
  frost_citadel: 0.5,
  infernal_gate: 0.5,
  sun_obelisk: 0.5,
  war_monument: 0.5,
  bone_altar: 0.5,
  cannon_crest: 0.5,
  ivy_crossroads: 0.5,
  blight_basin: 0.5,
  triad_keep: 0.5,
  sunscorch_labyrinth: 0.5,
  frist_outpost: 0.5,
  ashen_spiral: 0.5,
  obsidian_castle: 0.5,
  carnegie_lake: 1.0,
};

function getLandmarkTowerExclusionRange(
  decorationType: string,
  size: number,
): number {
  const multiplier = LANDMARK_TOWER_EXCLUSION[decorationType as DecorationType];
  if (multiplier !== undefined) {
    return Math.min(Math.ceil(size * multiplier), MAX_DECORATION_EXCLUSION_RANGE);
  }
  return 0;
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

      if (
        decorationType &&
        LANDMARK_DECORATION_TYPES.has(decorationType)
      ) {
        const resolvedPlacement = resolveMapDecorationRuntimePlacement(decoration);
        const size = resolvedPlacement?.scale ?? (decoration.size || 1);
        const worldPos = getMapDecorationWorldPos(decoration);
        const baseX = Math.floor(worldPos.x / TILE_SIZE - 0.5);
        const baseY = Math.floor(worldPos.y / TILE_SIZE - 0.5);
        const range = getLandmarkTowerExclusionRange(decorationType, size);

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
        const resolvedPlacement = resolveMapDecorationRuntimePlacement(decoration);
        const size = resolvedPlacement?.scale ?? (decoration.size || 1);
        const worldPos = getMapDecorationWorldPos(decoration);
        const baseX = Math.floor(worldPos.x / TILE_SIZE - 0.5);
        const baseY = Math.floor(worldPos.y / TILE_SIZE - 0.5);
        const range = Math.min(Math.ceil(size * 0.5), MAX_DECORATION_EXCLUSION_RANGE);

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
