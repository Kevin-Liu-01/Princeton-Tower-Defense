import type { Enemy, Position, Tower } from "../types";
import {
  LEVEL_DATA,
  LEVEL_WAVES,
  WAVES,
  INITIAL_PAW_POINTS,
} from "../constants";
import { getEnemyPosition, LANDMARK_DECORATION_TYPES } from "../utils";

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
export const ENEMY_SPEED_MODIFIER = 1.25; // Global enemy speed multiplier (slower enemies)

export const DEFAULT_CAMERA_OFFSET: Position = {
  x: -40,
  y: -60,
};

export const DEFAULT_CAMERA_ZOOM = 1.5;

// Helper to get enemy position using their pathKey for dual-path support
export const getEnemyPosWithPath = (enemy: Enemy, defaultMap: string): Position => {
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
export const getTowerHitboxRadius = (tower: Tower, zoom: number = 1): number => {
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

export const getLevelSpecialTowerHp = (levelId: string): number | null =>
  LEVEL_DATA[levelId]?.specialTower?.hp ?? null;

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
        // Block the decoration position and surrounding cells based on size
        const size = deco.size || 1;
        const baseX = Math.floor(deco.pos.x);
        const baseY = Math.floor(deco.pos.y);

        // Block a grid area around the landmark based on its size
        const range = Math.ceil(size);
        for (let dx = -range; dx <= range; dx++) {
          for (let dy = -range; dy <= range; dy++) {
            blocked.add(`${baseX + dx},${baseY + dy}`);
          }
        }
      }
    }
  }

  // Add special tower position (beacon, vault, shrine, barracks)
  if (levelData?.specialTower) {
    const spec = levelData.specialTower;
    const baseX = Math.floor(spec.pos.x);
    const baseY = Math.floor(spec.pos.y);

    // Block a 3x3 area around special buildings
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        blocked.add(`${baseX + dx},${baseY + dy}`);
      }
    }
  }

  return blocked;
};
