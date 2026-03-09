import type {
  DecorationType,
  Enemy,
  Position,
  SpecialTower,
  Tower,
  TowerType,
} from "../types";
import {
  LEVEL_DATA,
  LEVEL_WAVES,
  WAVES,
  INITIAL_PAW_POINTS,
  TILE_SIZE,
} from "../constants";
import {
  getEnemyPosition,
  LANDMARK_DECORATION_TYPES,
  BACKGROUND_BLOCKING_DECORATION_TYPES,
  getMapDecorationWorldPos,
  resolveMapDecorationRuntimePlacement,
} from "../utils";

const LANDMARK_TOWER_EXCLUSION: Partial<Record<DecorationType, number>> = {
  pyramid: 1.0,
  nassau_hall: 1.0,
  giant_sphinx: 0.5,
  glacier: 0.5,
  ice_fortress: 0.5,
  frost_citadel: 0.5,
  infernal_gate: 0.5,
  obsidian_castle: 0.5,
  carnegie_lake: 1.0,
  ruined_temple: 0.2,
};

function getLandmarkTowerExclusionRange(
  decorType: string,
  size: number,
): number {
  const multiplier = LANDMARK_TOWER_EXCLUSION[decorType as DecorationType];
  if (multiplier !== undefined) {
    return Math.ceil(size * multiplier);
  }
  return 0;
}

// Dinky Station spawn management constants
export const TROOP_RESPAWN_TIME = 5000; // 5 seconds
export const TROOP_SEPARATION_DIST = 35; // Minimum distance between troops
export const TROOP_SIGHT_RANGE = 180; // Base sight range for melee troops (increased)
export const TROOP_RANGED_SIGHT_RANGE = 280; // Extended sight range for ranged troops (centaur, cavalry) (increased)
export const HERO_SIGHT_RANGE = 150; // How far hero can see enemies
export const HERO_RANGED_SIGHT_RANGE = 220; // Extended sight for Rocky (ranged hero)
export const COMBAT_RANGE = 50; // Range at which units stop to fight
export const MELEE_RANGE = 60; // Close range where ranged units switch to melee
export const FORMATION_SPACING = 30; // Distance between troops in formation
export const ALLY_ALERT_RANGE = 150; // Range within which allies share aggro when one is engaging
export const ENEMY_SPEED_MODIFIER = 1.25; // Global enemy speed multiplier (slower enemies)

export const DEFAULT_CAMERA_OFFSET: Position = {
  x: -40,
  y: -60,
};

export const DEFAULT_CAMERA_ZOOM = 1.5;

// Helper to get enemy position using their pathKey for dual-path support
export const getEnemyPosWithPath = (
  enemy: Enemy,
  defaultMap: string,
): Position => {
  const pathKey = enemy.pathKey || defaultMap;
  const basePos = getEnemyPosition(enemy, pathKey);

  // Apply taunt offset if enemy is being taunted and moving toward hero
  if (enemy.tauntOffset) {
    return {
      x: basePos.x + enemy.tauntOffset.x,
      y: basePos.y + enemy.tauntOffset.y,
    };
  }

  return basePos;
};

// Formation offsets relative to rally point (triangle pattern)
// Spacing should be > TROOP_SEPARATION_DIST (35) to prevent clustering/vibration
export const getFormationOffsets = (count: number): Position[] => {
  if (count === 1) {
    return [{ x: 0, y: 0 }];
  }

  if (count === 2) {
    // Line formation - spread apart more to avoid separation force fighting
    return [
      { x: -22, y: -12 },
      { x: 22, y: 12 },
    ];
  }

  // Triangle formation - larger spacing to prevent vibration
  return [
    { x: 0, y: -28 }, // Front (tip of triangle)
    { x: -28, y: 18 }, // Back left
    { x: 28, y: 18 }, // Back right
  ];
};

// Dynamic tower hitbox calculation based on tower type and level
// Tower heights grow with level, so hitboxes should too
export const getTowerHitboxRadius = (
  tower: Tower,
  zoom: number = 1,
): number => {
  const level = tower.level;
  let baseWidth: number;
  let baseHeight: number;

  switch (tower.type) {
    case "cannon":
      baseWidth = 36 + level * 5;
      baseHeight = 24 + level * 10;
      break;
    case "lab":
    case "library":
      baseWidth = 34 + level * 5;
      baseHeight = 30 + level * 10;
      break;
    case "arch":
      baseWidth = 32 + level * 4;
      baseHeight = 28 + level * 8;
      break;
    case "club":
      baseWidth = 38 + level * 5;
      baseHeight = 32 + level * 10;
      break;
    case "station":
      // Station has wider base dimensions
      baseWidth = 56 + level * 6;
      baseHeight = 40 + level * 12;
      break;
    case "mortar":
      baseWidth = 34 + level * 4;
      baseHeight = 20 + level * 8;
      break;
    default:
      baseWidth = 36 + level * 5;
      baseHeight = 24 + level * 10;
  }

  // Calculate hitbox as a combination of width and height
  // Wider for X, taller for Y - we use the larger dimension for a circular hitbox
  // Scale by zoom and add a base minimum
  const hitboxSize = Math.max(baseWidth * 0.5, baseHeight * 0.4) * zoom;
  return Math.max(25, Math.min(hitboxSize, 60)); // Clamp between 25-60 pixels
};

// Helper to get waves for current level
export const getLevelWaves = (levelId: string) => LEVEL_WAVES[levelId] || WAVES;

export const getLevelStartingPawPoints = (levelId: string): number =>
  LEVEL_DATA[levelId]?.startingPawPoints ?? INITIAL_PAW_POINTS;

export const getLevelSpecialTowers = (levelId: string): SpecialTower[] => {
  const level = LEVEL_DATA[levelId];
  if (!level) return [];
  if (level.specialTowers && level.specialTowers.length > 0) {
    return level.specialTowers;
  }
  return level.specialTower ? [level.specialTower] : [];
};

export const getLevelSpecialTowerHp = (levelId: string): number | null =>
  (() => {
    const totalVaultHp = getLevelSpecialTowers(levelId)
      .filter((tower) => tower.type === "vault" && typeof tower.hp === "number")
      .reduce((sum, tower) => sum + (tower.hp || 0), 0);
    return totalVaultHp > 0 ? totalVaultHp : null;
  })();

export const getLevelAllowedTowers = (levelId: string): TowerType[] | null => {
  const allowed = LEVEL_DATA[levelId]?.allowedTowers;
  return allowed && allowed.length > 0 ? [...allowed] : null;
};

// Compute blocked positions (landmarks and special towers)
// These positions cannot have player towers placed on them
export const getBlockedPositionsForMap = (mapKey: string): Set<string> => {
  const levelData = LEVEL_DATA[mapKey];
  const blocked = new Set<string>();

  // Add landmark decoration positions
  if (levelData?.decorations) {
    for (const deco of levelData.decorations) {
      const decorType = deco.category || deco.type;
      if (decorType && LANDMARK_DECORATION_TYPES.has(decorType)) {
        const resolvedPlacement = resolveMapDecorationRuntimePlacement(deco);
        const size = resolvedPlacement?.scale ?? (deco.size || 1);
        const worldPos = getMapDecorationWorldPos(deco);
        const baseX = Math.floor(worldPos.x / TILE_SIZE - 0.5);
        const baseY = Math.floor(worldPos.y / TILE_SIZE - 0.5);

        const range = getLandmarkTowerExclusionRange(decorType, size);
        for (let dx = -range; dx <= range; dx++) {
          for (let dy = -range; dy <= range; dy++) {
            blocked.add(`${baseX + dx},${baseY + dy}`);
          }
        }
      }

      // Block background decoration positions (water, lava, etc.)
      const resolvedType =
        resolveMapDecorationRuntimePlacement(deco)?.runtimeType ?? decorType;
      if (
        resolvedType &&
        BACKGROUND_BLOCKING_DECORATION_TYPES.has(resolvedType)
      ) {
        const resolvedPlacement = resolveMapDecorationRuntimePlacement(deco);
        const size = resolvedPlacement?.scale ?? (deco.size || 1);
        const worldPos = getMapDecorationWorldPos(deco);
        const baseX = Math.floor(worldPos.x / TILE_SIZE - 0.5);
        const baseY = Math.floor(worldPos.y / TILE_SIZE - 0.5);
        const range = Math.ceil(size);
        for (let dx = -range; dx <= range; dx++) {
          for (let dy = -range; dy <= range; dy++) {
            blocked.add(`${baseX + dx},${baseY + dy}`);
          }
        }
      }
    }
  }

  // Add special tower positions (beacon, vault, shrine, barracks)
  const levelSpecialTowers = getLevelSpecialTowers(mapKey);
  for (const spec of levelSpecialTowers) {
    const baseX = Math.floor(spec.pos.x);
    const baseY = Math.floor(spec.pos.y);

    blocked.add(`${baseX},${baseY}`);
  }

  return blocked;
};
