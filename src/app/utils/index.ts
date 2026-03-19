import type {
  Position,
  GridPosition,
  Tower,
  TowerType,
  EnemyType,
  HeroType,
  Troop,
  DecorationType,
  DecorationHeightTag,
  MapDecoration,
} from "../types";
import { getBarracksOwnerId, isBarracksOwnerId } from "../game/movement";
import {
  TILE_SIZE,
  MAP_PATHS,
  MAP_PATH_SPEED_SCALES,
  TOWER_COLORS,
  TROOP_SPREAD_RADIUS,
  HERO_PATH_HITBOX_SIZE,
  ROAD_EXCLUSION_BUFFER,
  TOWER_FOOTPRINTS,
  ISO_X_FACTOR,
  ISO_Y_FACTOR,
  ISO_INV_X,
  ISO_INV_Y,
  getLevelPaths,
  getLevelUniquePathSegments,
  STATION_TROOP_RANGE,
  BARRACKS_TROOP_RANGE,
  SPELL_TROOP_RANGE,
  HERO_SUMMON_RANGE,
} from "../constants";

// Enemy lane model: lanes are normalized to [-1, 1] and projected onto path
// perpendiculars in world-space.
export const ENEMY_MAX_LANES = 5;
export const ENEMY_LANE_OFFSET_LIMIT = 1;
export const ENEMY_LANE_MIN_WORLD_SPACING = 18;
export const ENEMY_LANE_HALF_SPAN_WORLD = Math.max(
  24,
  Math.min(HERO_PATH_HITBOX_SIZE - 8, 42),
);

export function getEnemyLaneCount(maxLanes: number = ENEMY_MAX_LANES): number {
  const derivedCount =
    Math.floor(
      (ENEMY_LANE_HALF_SPAN_WORLD * 2) / ENEMY_LANE_MIN_WORLD_SPACING,
    ) + 1;
  return Math.max(1, Math.min(maxLanes, derivedCount));
}

export function getEnemyLaneOffsets(
  laneCount: number = getEnemyLaneCount(),
): number[] {
  if (laneCount <= 1) return [0];
  const clampedCount = Math.max(1, laneCount);
  const step = (ENEMY_LANE_OFFSET_LIMIT * 2) / (clampedCount - 1);
  return Array.from({ length: clampedCount }, (_, idx) => {
    const value = -ENEMY_LANE_OFFSET_LIMIT + idx * step;
    return Number(value.toFixed(4));
  });
}

// Grid to world coordinates (isometric) - centers on tile
export function gridToWorld(pos: GridPosition): Position {
  return {
    x: (pos.x + 0.5) * TILE_SIZE,
    y: (pos.y + 0.5) * TILE_SIZE,
  };
}

// Grid to world coordinates for path waypoints (at corners/intersections)
export function gridToWorldPath(pos: GridPosition): Position {
  return {
    x: pos.x * TILE_SIZE,
    y: pos.y * TILE_SIZE,
  };
}

// World to screen coordinates (with isometric projection)
export function worldToScreen(
  pos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
): Position {
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;
  const zoom = cameraZoom || 1;
  const offset = cameraOffset || { x: 0, y: 0 };

  // 2:1 Isometric projection
  const isoX = (pos.x - pos.y) * ISO_X_FACTOR;
  const isoY = (pos.x + pos.y) * ISO_Y_FACTOR;

  // Apply camera offset and zoom, then center
  return {
    x: (isoX + offset.x) * zoom + width / 2,
    y: (isoY + offset.y) * zoom + height / 3,
  };
}

/**
 * World to screen with rounded pixel coordinates.
 * Use in hot drawing paths to avoid sub-pixel rendering (better canvas performance).
 */
export function worldToScreenRounded(
  pos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
): { x: number; y: number } {
  const p = worldToScreen(
    pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  return { x: Math.round(p.x), y: Math.round(p.y) };
}

// Screen to world coordinates (inverse of worldToScreen) - FIXED for camera
export function screenToWorld(
  screenPos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
): Position {
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;
  const zoom = cameraZoom || 1;
  const offset = cameraOffset || { x: 0, y: 0 };

  // Reverse the screen transformation
  // First remove center offset, then divide by zoom, then subtract camera offset
  const isoX = (screenPos.x - width / 2) / zoom - offset.x;
  const isoY = (screenPos.y - height / 3) / zoom - offset.y;

  // Reverse 2:1 isometric projection
  const xMinusY = isoX * ISO_INV_X;
  const xPlusY = isoY * ISO_INV_Y;
  const worldX = (xMinusY + xPlusY) * 0.5;
  const worldY = (xPlusY - xMinusY) * 0.5;

  return { x: worldX, y: worldY };
}

// Screen to grid coordinates - FIXED for camera and tile centers
export function screenToGrid(
  screenPos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
): GridPosition {
  const worldPos = screenToWorld(
    screenPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  // Round to nearest tile (tiles are centered at +0.5)
  return {
    x: Math.floor(worldPos.x / TILE_SIZE),
    y: Math.floor(worldPos.y / TILE_SIZE),
  };
}

// Distance between two points
export function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Distance from point to line segment
export function distanceToLineSegment(
  point: Position,
  lineStart: Position,
  lineEnd: Position,
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// Closest point on line segment
export function closestPointOnLine(
  point: Position,
  lineStart: Position,
  lineEnd: Position,
): Position {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;
  param = Math.max(0, Math.min(1, param));

  return {
    x: lineStart.x + param * C,
    y: lineStart.y + param * D,
  };
}

// Get enemy position along path (uses path waypoints, not tile centers)
// Includes lane offset for spreading enemies across the road width
export function getEnemyPosition(
  enemy: { pathIndex: number; progress: number; laneOffset?: number },
  mapKey: string,
): Position {
  const path = MAP_PATHS[mapKey];
  if (!path || path.length < 2) return { x: 0, y: 0 };

  const currentIndex = Math.min(enemy.pathIndex, path.length - 1);
  const nextIndex = Math.min(currentIndex + 1, path.length - 1);

  const current = gridToWorldPath(path[currentIndex]);
  const next = gridToWorldPath(path[nextIndex]);

  // Base position along path
  const baseX = current.x + (next.x - current.x) * enemy.progress;
  const baseY = current.y + (next.y - current.y) * enemy.progress;

  // Calculate perpendicular offset for lane spreading
  const laneOffset = Math.max(
    -ENEMY_LANE_OFFSET_LIMIT,
    Math.min(ENEMY_LANE_OFFSET_LIMIT, enemy.laneOffset || 0),
  );
  const laneHalfSpan = ENEMY_LANE_HALF_SPAN_WORLD;

  // Get direction of current path segment
  const dx = next.x - current.x;
  const dy = next.y - current.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len > 0 && Math.abs(laneOffset) > 0.0001) {
    const safeNormalize = (vx: number, vy: number): Position => {
      const mag = Math.sqrt(vx * vx + vy * vy);
      if (mag <= 0.00001) return { x: 0, y: 0 };
      return { x: vx / mag, y: vy / mag };
    };

    const smoothStep = (t: number): number => {
      const clamped = Math.max(0, Math.min(1, t));
      return clamped * clamped * (3 - 2 * clamped);
    };

    const laneProgress = Math.max(0, Math.min(1, enemy.progress));
    const blendWindow = 0.24;

    const currentDir = safeNormalize(dx, dy);
    let tangent = currentDir;

    if (laneProgress < blendWindow && currentIndex > 0) {
      const prevNode = gridToWorldPath(path[currentIndex - 1]);
      const prevDir = safeNormalize(
        current.x - prevNode.x,
        current.y - prevNode.y,
      );
      const cornerStart = safeNormalize(
        prevDir.x + currentDir.x,
        prevDir.y + currentDir.y,
      );
      const startBlend = smoothStep(laneProgress / blendWindow);
      tangent = safeNormalize(
        cornerStart.x * (1 - startBlend) + currentDir.x * startBlend,
        cornerStart.y * (1 - startBlend) + currentDir.y * startBlend,
      );
    } else if (
      laneProgress > 1 - blendWindow &&
      currentIndex < path.length - 2
    ) {
      const afterNode = gridToWorldPath(path[currentIndex + 2]);
      const nextDir = safeNormalize(afterNode.x - next.x, afterNode.y - next.y);
      const cornerEnd = safeNormalize(
        currentDir.x + nextDir.x,
        currentDir.y + nextDir.y,
      );
      const endBlend = smoothStep(
        (laneProgress - (1 - blendWindow)) / blendWindow,
      );
      tangent = safeNormalize(
        currentDir.x * (1 - endBlend) + cornerEnd.x * endBlend,
        currentDir.y * (1 - endBlend) + cornerEnd.y * endBlend,
      );
    }

    // Perpendicular vector (rotated 90 degrees)
    const perpX = -tangent.y;
    const perpY = tangent.x;

    return {
      x: baseX + perpX * laneOffset * laneHalfSpan,
      y: baseY + perpY * laneOffset * laneHalfSpan,
    };
  }

  return { x: baseX, y: baseY };
}

// Height metadata used by rendering and interactions.
// Tags are assigned for all landmarks and large decorative props.
export const DECORATION_HEIGHT_TAG_BY_TYPE: Partial<
  Record<DecorationType, DecorationHeightTag>
> = {
  // Tall structures
  tree: "tall",
  pine: "tall",
  palm: "tall",
  swamp_tree: "tall",
  charred_tree: "tall",
  hut: "tall",
  ruins: "tall",
  broken_wall: "tall",
  broken_bridge: "tall",
  statue: "tall",
  obelisk: "tall",
  dock: "tall",
  hanging_cage: "tall",
  mushroom: "tall",
  ice_spire: "tall",
  ice_crystal: "tall",
  icicles: "tall",
  frozen_soldier: "tall",
  fountain: "tall",
  lamppost: "tall",
  tent: "tall",
  obsidian_spike: "tall",
  fire_crystal: "tall",
  hedge: "medium",
  bush: "medium",
  fence: "medium",
  signpost: "medium",
  torch: "medium",
  cauldron: "medium",
  ember_rock: "medium",
  snow_lantern: "medium",
  cart: "medium",

  // Landmarks and major set pieces
  pyramid: "landmark",
  sphinx: "landmark",
  giant_sphinx: "landmark",
  nassau_hall: "landmark",
  glacier: "landmark",
  ice_fortress: "landmark",
  ice_throne: "landmark",
  obsidian_castle: "landmark",
  witch_cottage: "landmark",
  ruined_temple: "landmark",
  sunken_pillar: "landmark",
  carnegie_lake: "landmark",
  frozen_waterfall: "landmark",
  frozen_gate: "landmark",
  aurora_crystal: "landmark",
  cobra_statue: "landmark",
  hieroglyph_wall: "landmark",
  sarcophagus: "landmark",
  lava_fall: "landmark",
  obsidian_pillar: "landmark",
  skull_throne: "landmark",
  volcano_rim: "landmark",
  idol_statue: "landmark",
  gate: "landmark",
  dark_throne: "landmark",
  dark_barracks: "landmark",
  dark_spire: "landmark",
  ice_bridge: "landmark",
  demon_statue: "landmark",
  tombstone: "medium",
  cannon_crest: "landmark",
  ivy_crossroads: "landmark",
  blight_basin: "landmark",
  triad_keep: "landmark",
  sunscorch_labyrinth: "landmark",
  frontier_outpost: "landmark",
  ashen_spiral: "landmark",
  war_monument: "landmark",
  bone_altar: "landmark",
  sun_obelisk: "landmark",
  frost_citadel: "landmark",
  infernal_gate: "landmark",
};

export const DEFAULT_DECORATION_HEIGHT_TAG: DecorationHeightTag = "short";

export function getDecorationHeightTag(
  type: DecorationType,
  explicitHeightTag?: DecorationHeightTag,
): DecorationHeightTag {
  return (
    explicitHeightTag ??
    DECORATION_HEIGHT_TAG_BY_TYPE[type] ??
    DEFAULT_DECORATION_HEIGHT_TAG
  );
}

export interface DecorationVolumeSpec {
  heightTag: DecorationHeightTag;
  // Screen-space dimensions at scale=1 used for layered occlusion footprints.
  width: number;
  length: number;
  height: number;
  // Vertical anchor adjustment in screen-space scale units.
  anchorOffsetY: number;
  // Minimum iso-depth needed to count as "in front" of this object.
  frontDepthPadding: number;
  // Landmark generation exclusion radii in grid units (size multiplier applied).
  landmarkCoreRadius: number;
  landmarkFullPadding: number;
  // Draw a shadow pass below the environment before normal rendering.
  backgroundShadowOnly: boolean;
  // Optional world-space anchor offset for sprites whose draw origin differs from
  // gameplay/world anchor. Interpreted at `offsetBaseScale`.
  worldOffsetX: number;
  worldOffsetY: number;
  offsetBaseScale: number;
}

const DECORATION_VOLUME_DEFAULTS_BY_TAG: Record<
  DecorationHeightTag,
  Omit<DecorationVolumeSpec, "heightTag">
> = {
  ground: {
    width: 18,
    length: 12,
    height: 6,
    anchorOffsetY: 0,
    frontDepthPadding: 6,
    landmarkCoreRadius: 0.65,
    landmarkFullPadding: 0.45,
    backgroundShadowOnly: false,
    worldOffsetX: 0,
    worldOffsetY: 0,
    offsetBaseScale: 1,
  },
  short: {
    width: 24,
    length: 18,
    height: 16,
    anchorOffsetY: -2,
    frontDepthPadding: 8,
    landmarkCoreRadius: 0.8,
    landmarkFullPadding: 0.5,
    backgroundShadowOnly: false,
    worldOffsetX: 0,
    worldOffsetY: 0,
    offsetBaseScale: 1,
  },
  medium: {
    width: 34,
    length: 24,
    height: 28,
    anchorOffsetY: -4,
    frontDepthPadding: 10,
    landmarkCoreRadius: 0.9,
    landmarkFullPadding: 0.6,
    backgroundShadowOnly: false,
    worldOffsetX: 0,
    worldOffsetY: 0,
    offsetBaseScale: 1,
  },
  tall: {
    width: 46,
    length: 34,
    height: 60,
    anchorOffsetY: -6,
    frontDepthPadding: 12,
    landmarkCoreRadius: 1.0,
    landmarkFullPadding: 0.7,
    backgroundShadowOnly: false,
    worldOffsetX: 0,
    worldOffsetY: 0,
    offsetBaseScale: 1,
  },
  landmark: {
    width: 72,
    length: 56,
    height: 90,
    anchorOffsetY: -8,
    frontDepthPadding: 14,
    landmarkCoreRadius: 1.0,
    landmarkFullPadding: 0.75,
    backgroundShadowOnly: false,
    worldOffsetX: 0,
    worldOffsetY: 0,
    offsetBaseScale: 1,
  },
};

const DECORATION_VOLUME_OVERRIDES: Partial<
  Record<DecorationType, Partial<Omit<DecorationVolumeSpec, "heightTag">>>
> = {
  pyramid: {
    // Slightly tighter occlusion footprint so nearby props don't get swallowed.
    width: 124,
    length: 112,
    height: 200,
    anchorOffsetY: 10,
    frontDepthPadding: 10,
    landmarkCoreRadius: 1.25,
    landmarkFullPadding: 0.75,
  },
  nassau_hall: {
    width: 220,
    length: 210,
    height: 220,
    anchorOffsetY: 0,
    frontDepthPadding: 18,
    landmarkCoreRadius: 1.45,
    landmarkFullPadding: 0.9,
    backgroundShadowOnly: true,
  },
  giant_sphinx: {
    width: 160,
    length: 100,
    height: 150,
    anchorOffsetY: -6,
    frontDepthPadding: 12,
    landmarkCoreRadius: 1.2,
    landmarkFullPadding: 0.8,
  },
  sphinx: {
    width: 96,
    length: 70,
    height: 80,
    anchorOffsetY: -4,
    frontDepthPadding: 10,
  },
  obsidian_castle: {
    width: 136,
    length: 112,
    height: 165,
    anchorOffsetY: -8,
    frontDepthPadding: 13,
  },
  dark_barracks: {
    width: 90,
    length: 74,
    height: 110,
    anchorOffsetY: -6,
    frontDepthPadding: 10,
  },
  dark_throne: {
    width: 82,
    length: 62,
    height: 106,
    anchorOffsetY: -5,
    frontDepthPadding: 10,
  },
  dark_spire: {
    width: 76,
    length: 58,
    height: 120,
    anchorOffsetY: -5,
    frontDepthPadding: 11,
  },
  obsidian_pillar: {
    width: 62,
    length: 48,
    height: 116,
    anchorOffsetY: -4,
    frontDepthPadding: 10,
  },
  lava_fall: {
    width: 84,
    length: 66,
    height: 130,
    anchorOffsetY: -4,
    frontDepthPadding: 11,
  },
  glacier: {
    width: 140,
    length: 114,
    height: 170,
    anchorOffsetY: -8,
    frontDepthPadding: 14,
  },
  ice_fortress: {
    width: 160,
    length: 130,
    height: 190,
    anchorOffsetY: -10,
    frontDepthPadding: 16,
  },
  ice_throne: {
    width: 120,
    length: 100,
    height: 160,
    anchorOffsetY: -8,
    frontDepthPadding: 14,
  },
  frozen_waterfall: {
    width: 116,
    length: 92,
    height: 148,
    anchorOffsetY: -6,
    frontDepthPadding: 12,
  },
  witch_cottage: {
    width: 102,
    length: 84,
    height: 94,
    anchorOffsetY: -5,
    frontDepthPadding: 11,
  },
  cannon_crest: {
    width: 136,
    length: 108,
    height: 88,
    anchorOffsetY: -2,
    frontDepthPadding: 12,
    landmarkCoreRadius: 1.1,
    landmarkFullPadding: 0.7,
  },
  ivy_crossroads: {
    width: 104,
    length: 92,
    height: 126,
    anchorOffsetY: -6,
    frontDepthPadding: 11,
    landmarkCoreRadius: 1.0,
    landmarkFullPadding: 0.65,
  },
  blight_basin: {
    width: 150,
    length: 118,
    height: 88,
    anchorOffsetY: -3,
    frontDepthPadding: 12,
    landmarkCoreRadius: 1.15,
    landmarkFullPadding: 0.75,
  },
  triad_keep: {
    width: 150,
    length: 126,
    height: 176,
    anchorOffsetY: -10,
    frontDepthPadding: 15,
    landmarkCoreRadius: 1.25,
    landmarkFullPadding: 0.85,
  },
  sunscorch_labyrinth: {
    width: 158,
    length: 132,
    height: 92,
    anchorOffsetY: -4,
    frontDepthPadding: 12,
    landmarkCoreRadius: 1.2,
    landmarkFullPadding: 0.8,
  },
  frontier_outpost: {
    width: 148,
    length: 118,
    height: 170,
    anchorOffsetY: -9,
    frontDepthPadding: 14,
    landmarkCoreRadius: 1.2,
    landmarkFullPadding: 0.8,
  },
  ashen_spiral: {
    width: 154,
    length: 126,
    height: 118,
    anchorOffsetY: -4,
    frontDepthPadding: 13,
    landmarkCoreRadius: 1.2,
    landmarkFullPadding: 0.8,
  },
  war_monument: {
    width: 110,
    length: 90,
    height: 180,
    anchorOffsetY: -8,
    frontDepthPadding: 14,
    landmarkCoreRadius: 1.2,
    landmarkFullPadding: 0.8,
  },
  bone_altar: {
    width: 120,
    length: 100,
    height: 130,
    anchorOffsetY: -6,
    frontDepthPadding: 12,
    landmarkCoreRadius: 1.1,
    landmarkFullPadding: 0.75,
  },
  sun_obelisk: {
    width: 100,
    length: 80,
    height: 200,
    anchorOffsetY: -10,
    frontDepthPadding: 16,
    landmarkCoreRadius: 1.0,
    landmarkFullPadding: 0.7,
  },
  frost_citadel: {
    width: 150,
    length: 120,
    height: 190,
    anchorOffsetY: -8,
    frontDepthPadding: 15,
    landmarkCoreRadius: 1.3,
    landmarkFullPadding: 0.85,
  },
  infernal_gate: {
    width: 140,
    length: 110,
    height: 170,
    anchorOffsetY: -8,
    frontDepthPadding: 14,
    landmarkCoreRadius: 1.25,
    landmarkFullPadding: 0.8,
  },
  carnegie_lake: {
    width: 200,
    length: 180,
    height: 90,
    anchorOffsetY: 0,
    frontDepthPadding: 15,
    landmarkCoreRadius: 1.1,
    landmarkFullPadding: 0.4,
    backgroundShadowOnly: true,
  },
};

export function getDecorationVolumeSpec(
  type: string,
  explicitHeightTag?: DecorationHeightTag,
): DecorationVolumeSpec {
  const typedType = type as DecorationType;
  const heightTag = getDecorationHeightTag(typedType, explicitHeightTag);
  const defaults = DECORATION_VOLUME_DEFAULTS_BY_TAG[heightTag];
  const overrides = (
    DECORATION_VOLUME_OVERRIDES as Record<
      string,
      Partial<Omit<DecorationVolumeSpec, "heightTag">>
    >
  )[type];

  return {
    heightTag,
    width: overrides?.width ?? defaults.width,
    length: overrides?.length ?? defaults.length,
    height: overrides?.height ?? defaults.height,
    anchorOffsetY: overrides?.anchorOffsetY ?? defaults.anchorOffsetY,
    frontDepthPadding:
      overrides?.frontDepthPadding ?? defaults.frontDepthPadding,
    landmarkCoreRadius:
      overrides?.landmarkCoreRadius ?? defaults.landmarkCoreRadius,
    landmarkFullPadding:
      overrides?.landmarkFullPadding ?? defaults.landmarkFullPadding,
    backgroundShadowOnly:
      overrides?.backgroundShadowOnly ?? defaults.backgroundShadowOnly,
    worldOffsetX: overrides?.worldOffsetX ?? defaults.worldOffsetX,
    worldOffsetY: overrides?.worldOffsetY ?? defaults.worldOffsetY,
    offsetBaseScale: overrides?.offsetBaseScale ?? defaults.offsetBaseScale,
  };
}

export function getDecorationWorldOffset(
  type: string,
  scale: number,
  explicitHeightTag?: DecorationHeightTag,
): Position {
  const volume = getDecorationVolumeSpec(type, explicitHeightTag);
  const safeBaseScale = Math.max(0.0001, volume.offsetBaseScale);
  const ratio = scale / safeBaseScale;
  return {
    x: volume.worldOffsetX * ratio,
    y: volume.worldOffsetY * ratio,
  };
}

interface MapDecorationRuntimeRule {
  runtimeType: DecorationType;
  scaleMultiplier: number;
}

const MAP_DECORATION_RUNTIME_RULES: Record<string, MapDecorationRuntimeRule> = {
  // Grassland basics
  tree: { runtimeType: "tree", scaleMultiplier: 1 },
  bush: { runtimeType: "bush", scaleMultiplier: 0.8 },
  rock: { runtimeType: "rock", scaleMultiplier: 0.9 },
  fence: { runtimeType: "fence", scaleMultiplier: 1 },
  cart: { runtimeType: "cart", scaleMultiplier: 1 },
  tent: { runtimeType: "tent", scaleMultiplier: 1 },
  building: { runtimeType: "hut", scaleMultiplier: 1.1 },
  flag: { runtimeType: "torch", scaleMultiplier: 1 },
  flowers: { runtimeType: "flowers", scaleMultiplier: 0.6 },
  signpost: { runtimeType: "signpost", scaleMultiplier: 0.8 },
  fountain: { runtimeType: "fountain", scaleMultiplier: 1.2 },
  bench: { runtimeType: "bench", scaleMultiplier: 0.7 },
  lamppost: { runtimeType: "lamppost", scaleMultiplier: 1 },
  hedge: { runtimeType: "hedge", scaleMultiplier: 0.9 },
  campfire: { runtimeType: "campfire", scaleMultiplier: 0.9 },
  dock: { runtimeType: "dock", scaleMultiplier: 1.1 },
  gate: { runtimeType: "gate", scaleMultiplier: 1.2 },
  reeds: { runtimeType: "reeds", scaleMultiplier: 0.8 },
  fishing_spot: { runtimeType: "fishing_spot", scaleMultiplier: 0.9 },
  // Grassland landmarks
  nassau_hall: { runtimeType: "nassau_hall", scaleMultiplier: 1 },
  statue: { runtimeType: "statue", scaleMultiplier: 1.3 },
  carnegie_lake: { runtimeType: "carnegie_lake", scaleMultiplier: 1.2 },
  // Desert
  palm: { runtimeType: "palm", scaleMultiplier: 1 },
  cactus: { runtimeType: "cactus", scaleMultiplier: 1 },
  dune: { runtimeType: "dune", scaleMultiplier: 1 },
  sand_pile: { runtimeType: "sand_pile", scaleMultiplier: 1 },
  pottery: { runtimeType: "pottery", scaleMultiplier: 0.9 },
  treasure_chest: { runtimeType: "treasure_chest", scaleMultiplier: 0.9 },
  obelisk: { runtimeType: "obelisk", scaleMultiplier: 1.2 },
  pyramid: { runtimeType: "pyramid", scaleMultiplier: 1.5 },
  sphinx: { runtimeType: "sphinx", scaleMultiplier: 1.4 },
  giant_sphinx: { runtimeType: "giant_sphinx", scaleMultiplier: 1.4 },
  oasis_pool: { runtimeType: "oasis_pool", scaleMultiplier: 1.1 },
  sarcophagus: { runtimeType: "sarcophagus", scaleMultiplier: 1.1 },
  cobra_statue: { runtimeType: "cobra_statue", scaleMultiplier: 1.2 },
  hieroglyph_wall: { runtimeType: "hieroglyph_wall", scaleMultiplier: 1.1 },
  // Winter
  pine_tree: { runtimeType: "pine", scaleMultiplier: 1 },
  snowman: { runtimeType: "snowman", scaleMultiplier: 1 },
  snow_pile: { runtimeType: "snow_pile", scaleMultiplier: 1 },
  ice_crystal: { runtimeType: "ice_crystal", scaleMultiplier: 1 },
  icicles: { runtimeType: "icicles", scaleMultiplier: 1 },
  snow_lantern: { runtimeType: "snow_lantern", scaleMultiplier: 0.9 },
  frozen_pond: { runtimeType: "frozen_pond", scaleMultiplier: 1.2 },
  frozen_soldier: { runtimeType: "frozen_soldier", scaleMultiplier: 1 },
  frozen_gate: { runtimeType: "frozen_gate", scaleMultiplier: 1.2 },
  broken_wall: { runtimeType: "broken_wall", scaleMultiplier: 1.1 },
  battle_crater: { runtimeType: "battle_crater", scaleMultiplier: 1 },
  glacier: { runtimeType: "glacier", scaleMultiplier: 1.3 },
  ice_fortress: { runtimeType: "ice_fortress", scaleMultiplier: 1.4 },
  ice_spire: { runtimeType: "ice_spire", scaleMultiplier: 1.2 },
  ice_throne: { runtimeType: "ice_throne", scaleMultiplier: 1.3 },
  frozen_waterfall: { runtimeType: "frozen_waterfall", scaleMultiplier: 1.3 },
  aurora_crystal: { runtimeType: "aurora_crystal", scaleMultiplier: 1.1 },
  // Volcanic
  charred_tree: { runtimeType: "charred_tree", scaleMultiplier: 1 },
  ember: { runtimeType: "ember", scaleMultiplier: 0.8 },
  ember_rock: { runtimeType: "ember_rock", scaleMultiplier: 1 },
  obsidian_spike: { runtimeType: "obsidian_spike", scaleMultiplier: 1 },
  fire_crystal: { runtimeType: "fire_crystal", scaleMultiplier: 1.1 },
  lava_pool: { runtimeType: "lava_pool", scaleMultiplier: 1.2 },
  lava_fall: { runtimeType: "lava_fall", scaleMultiplier: 1.3 },
  torch: { runtimeType: "torch", scaleMultiplier: 1 },
  fire_pit: { runtimeType: "fire_pit", scaleMultiplier: 1 },
  magma_vent: { runtimeType: "torch", scaleMultiplier: 1 },
  obsidian_castle: { runtimeType: "obsidian_castle", scaleMultiplier: 1.5 },
  obsidian_pillar: { runtimeType: "obsidian_pillar", scaleMultiplier: 1.2 },
  dark_throne: { runtimeType: "dark_throne", scaleMultiplier: 1.2 },
  dark_barracks: { runtimeType: "dark_barracks", scaleMultiplier: 1.2 },
  dark_spire: { runtimeType: "dark_spire", scaleMultiplier: 1.2 },
  demon_statue: { runtimeType: "statue", scaleMultiplier: 1.3 },
  skull_throne: { runtimeType: "skull_throne", scaleMultiplier: 1.2 },
  volcano_rim: { runtimeType: "volcano_rim", scaleMultiplier: 1.3 },
  // Swamp
  swamp_tree: { runtimeType: "swamp_tree", scaleMultiplier: 1 },
  fog_patch: { runtimeType: "fog_wisp", scaleMultiplier: 1.2 },
  broken_bridge: { runtimeType: "broken_wall", scaleMultiplier: 1.1 },
  skeleton: { runtimeType: "skeleton", scaleMultiplier: 1 },
  bones: { runtimeType: "bones", scaleMultiplier: 0.9 },
  skull: { runtimeType: "skeleton", scaleMultiplier: 0.8 },
  skull_pile: { runtimeType: "skeleton_pile", scaleMultiplier: 1 },
  candles: { runtimeType: "torch", scaleMultiplier: 0.7 },
  ritual_circle: { runtimeType: "glowing_runes", scaleMultiplier: 1.1 },
  witch_cottage: { runtimeType: "witch_cottage", scaleMultiplier: 1.1 },
  cauldron: { runtimeType: "cauldron", scaleMultiplier: 0.8 },
  tentacle: { runtimeType: "tentacle", scaleMultiplier: 1.2 },
  deep_water: { runtimeType: "deep_water", scaleMultiplier: 1.3 },
  ruined_temple: { runtimeType: "ruins", scaleMultiplier: 1.5 },
  sunken_pillar: { runtimeType: "sunken_pillar", scaleMultiplier: 1.1 },
  idol_statue: { runtimeType: "idol_statue", scaleMultiplier: 1.1 },
  glowing_runes: { runtimeType: "glowing_runes", scaleMultiplier: 1 },
  hanging_cage: { runtimeType: "hanging_cage", scaleMultiplier: 1 },
  poison_pool: { runtimeType: "poison_pool", scaleMultiplier: 1.1 },
  skeleton_pile: { runtimeType: "skeleton_pile", scaleMultiplier: 1 },
  // Challenge landmarks
  cannon_crest: { runtimeType: "cannon_crest", scaleMultiplier: 1.3 },
  ivy_crossroads: { runtimeType: "ivy_crossroads", scaleMultiplier: 1.25 },
  blight_basin: { runtimeType: "blight_basin", scaleMultiplier: 1.3 },
  triad_keep: { runtimeType: "triad_keep", scaleMultiplier: 1.25 },
  sunscorch_labyrinth: { runtimeType: "sunscorch_labyrinth", scaleMultiplier: 1.25 },
  frontier_outpost: { runtimeType: "frontier_outpost", scaleMultiplier: 1.25 },
  ashen_spiral: { runtimeType: "ashen_spiral", scaleMultiplier: 1.3 },
  war_monument: { runtimeType: "war_monument", scaleMultiplier: 1.4 },
  bone_altar: { runtimeType: "bone_altar", scaleMultiplier: 1.3 },
  sun_obelisk: { runtimeType: "sun_obelisk", scaleMultiplier: 1.4 },
  frost_citadel: { runtimeType: "frost_citadel", scaleMultiplier: 1.4 },
  infernal_gate: { runtimeType: "infernal_gate", scaleMultiplier: 1.4 },
  ice_bridge: { runtimeType: "ice_bridge", scaleMultiplier: 1.2 },
  tombstone: { runtimeType: "tombstone", scaleMultiplier: 1 },
  // Aliases
  lake: { runtimeType: "lava_pool", scaleMultiplier: 1.2 },
  algae_pool: { runtimeType: "lava_pool", scaleMultiplier: 1.2 },
};

export interface MapDecorationRuntimePlacement {
  sourceType: string;
  runtimeType: DecorationType;
  scale: number;
}

export function resolveMapDecorationRuntimePlacement(
  decoration: Pick<MapDecoration, "type" | "category" | "size">,
): MapDecorationRuntimePlacement | null {
  const sourceType = decoration.category ?? decoration.type;
  if (!sourceType) return null;
  const rule = MAP_DECORATION_RUNTIME_RULES[sourceType];
  if (!rule) return null;

  const size = decoration.size || 1;
  return {
    sourceType,
    runtimeType: rule.runtimeType,
    scale: size * rule.scaleMultiplier,
  };
}

export function getMapDecorationWorldPos(decoration: MapDecoration): Position {
  const basePos = gridToWorld(decoration.pos);
  const resolvedPlacement = resolveMapDecorationRuntimePlacement(decoration);
  if (!resolvedPlacement) return basePos;
  const offset = getDecorationWorldOffset(
    resolvedPlacement.runtimeType,
    resolvedPlacement.scale,
    decoration.heightTag,
  );
  return {
    x: basePos.x + offset.x,
    y: basePos.y + offset.y,
  };
}

export function getLandmarkSpawnExclusion(
  type: string,
  size: number,
  explicitHeightTag?: DecorationHeightTag,
): { coreR: number; fullR: number } | null {
  const volume = getDecorationVolumeSpec(type, explicitHeightTag);
  if (volume.heightTag !== "landmark") return null;
  const coreR = volume.landmarkCoreRadius * size;
  const fullR = coreR + volume.landmarkFullPadding;
  return { coreR, fullR };
}

export const LARGE_DECORATION_TYPES = new Set<DecorationType>(
  (Object.keys(DECORATION_HEIGHT_TAG_BY_TYPE) as DecorationType[]).filter(
    (type) => {
      const tag = DECORATION_HEIGHT_TAG_BY_TYPE[type];
      return tag === "tall" || tag === "landmark";
    },
  ),
);

// Landmark decoration types that should block tower placement
export const LANDMARK_DECORATION_TYPES = new Set<string>(
  (Object.keys(DECORATION_HEIGHT_TAG_BY_TYPE) as DecorationType[]).filter(
    (type) => DECORATION_HEIGHT_TAG_BY_TYPE[type] === "landmark",
  ),
);

// Decoration types rendered as static background (water, lava, etc.) that block tower placement.
export const BACKGROUND_BLOCKING_DECORATION_TYPES = new Set<string>([
  "deep_water",
  "lava_pool",
]);

// Vertical offset for landmark hitboxes (in scale units). Tall structures like pyramids
// draw upward from their base—the hitbox center is shifted up so hovering the visible
// body triggers the tooltip instead of requiring a hover near the ground.
export const LANDMARK_HITBOX_Y_OFFSET: Record<string, number> = {
  // Pyramid body spans from ~-60s (tip) to +25s (base), so center should be only
  // modestly above anchor. A larger value drifts the tooltip hitbox far above.
  pyramid: 20,
  sphinx: 10,
  giant_sphinx: 60,
  nassau_hall: 50,
  glacier: 55,
  ice_fortress: 65,
  ice_throne: 50,
  obsidian_castle: 55,
  witch_cottage: 30,
  cannon_crest: 18,
  ivy_crossroads: 34,
  blight_basin: 18,
  triad_keep: 58,
  sunscorch_labyrinth: 18,
  frontier_outpost: 52,
  ashen_spiral: 18,
  statue: 22,
  demon_statue: 22,
  obelisk: 35,
};

// Get the core grid cells a tower occupies (for bounds/path/blocked checks).
// This always returns the anchor cell; the extended exclusion zone from larger
// footprints (e.g. station 1.5x1.5) is handled by doFootprintsOverlap.
export function getTowerFootprint(
  _type: TowerType,
  pos: GridPosition,
): GridPosition[] {
  return [{ x: pos.x, y: pos.y }];
}

// Check if two towers' centered footprints overlap (rectangle-rectangle test).
export function doFootprintsOverlap(
  type1: TowerType,
  pos1: GridPosition,
  type2: TowerType,
  pos2: GridPosition,
): boolean {
  const fp1 = TOWER_FOOTPRINTS[type1];
  const fp2 = TOWER_FOOTPRINTS[type2];
  return (
    Math.abs(pos1.x - pos2.x) < (fp1.width + fp2.width) / 2 &&
    Math.abs(pos1.y - pos2.y) < (fp1.height + fp2.height) / 2
  );
}

// Check if position is valid for building
export function isValidBuildPosition(
  gridPos: GridPosition,
  mapKey: string,
  towers: Tower[],
  gridWidth: number,
  gridHeight: number,
  buffer: number = ROAD_EXCLUSION_BUFFER,
  blockedPositions?: Set<string>,
  towerType?: TowerType,
): boolean {
  const type = towerType || "cannon";

  // Bounds check on anchor cell
  if (
    gridPos.x < 0 ||
    gridPos.x >= gridWidth ||
    gridPos.y < 0 ||
    gridPos.y >= gridHeight
  ) {
    return false;
  }

  // Blocked positions (landmarks and special towers)
  if (blockedPositions?.has(`${gridPos.x},${gridPos.y}`)) {
    return false;
  }

  // Path collision with buffer zone
  const worldPos = gridToWorld(gridPos);
  const pathSegments = getLevelUniquePathSegments(mapKey);
  for (const segment of pathSegments) {
    const p1 = gridToWorldPath(segment.start);
    const p2 = gridToWorldPath(segment.end);
    if (distanceToLineSegment(worldPos, p1, p2) < buffer) {
      return false;
    }
  }

  // Tower-tower collision using centered rectangle overlap
  for (const tower of towers) {
    if (doFootprintsOverlap(type, gridPos, tower.type, tower.pos)) {
      return false;
    }
  }

  return true;
}

// Generate unique ID
let idCounter = 0;
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${idCounter++}`;
}

// Color utilities
export function getTowerColor(type: TowerType): string {
  return TOWER_COLORS[type].base;
}

export function getTowerColorDark(type: TowerType): string {
  return TOWER_COLORS[type].dark;
}

export function getTowerAccentColor(type: TowerType): string {
  return TOWER_COLORS[type].accent;
}

export function getEnemyColor(type: EnemyType): string {
  const colors: Record<EnemyType, string> = {
    frosh: "#4ade80",
    sophomore: "#60a5fa",
    junior: "#c084fc",
    senior: "#f472b6",
    gradstudent: "#fb923c",
    professor: "#ef4444",
    dean: "#a855f7",
    trustee: "#eab308",
    mascot: "#22d3d3",
  };
  return colors[type];
}

export function getHeroColor(type: HeroType): string {
  const colors: Record<HeroType, string> = {
    tiger: "#f97316",
    tenor: "#8b5cf6",
    mathey: "#6366f1",
    rocky: "#78716c",
    scott: "#14b8a6",
  };
  return colors[type];
}

export function lightenColor(color: string, amount: number): string {
  // Handle rgb format
  if (color.startsWith("rgb")) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = Math.min(255, parseInt(matches[0]) + amount);
      const g = Math.min(255, parseInt(matches[1]) + amount);
      const b = Math.min(255, parseInt(matches[2]) + amount);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  // Handle hex format
  const hex = color.replace("#", "");
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

export function darkenColor(color: string, amount: number): string {
  // Handle rgb format
  if (color.startsWith("rgb")) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = Math.max(0, parseInt(matches[0]) - amount);
      const g = Math.max(0, parseInt(matches[1]) - amount);
      const b = Math.max(0, parseInt(matches[2]) - amount);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  // Handle hex format
  const hex = color.replace("#", "");
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
  return `rgb(${r}, ${g}, ${b})`;
}

// Find non-overlapping position for troops
export function findNonOverlappingPosition(
  basePos: Position,
  existingTroops: { pos: Position }[],
  minDistance: number = TROOP_SPREAD_RADIUS,
  maxAttempts: number = 30,
): Position {
  // If no existing troops, return base position
  if (existingTroops.length === 0) return basePos;

  // Check if base position is valid
  let baseValid = true;
  for (const troop of existingTroops) {
    if (distance(basePos, troop.pos) < minDistance) {
      baseValid = false;
      break;
    }
  }
  if (baseValid) return basePos;

  // Try positions in a spiral pattern
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const angle = (attempt / maxAttempts) * Math.PI * 6; // Spiral out more
    const radius = minDistance * (1 + attempt * 0.25);
    const testPos = {
      x: basePos.x + Math.cos(angle) * radius,
      y: basePos.y + Math.sin(angle) * radius,
    };

    // Check if this position is far enough from all existing troops
    let valid = true;
    for (const troop of existingTroops) {
      if (distance(testPos, troop.pos) < minDistance) {
        valid = false;
        break;
      }
    }
    if (valid) return testPos;
  }

  // Fallback: return position offset by index using golden angle
  const index = existingTroops.length;
  const angle = (index * 137.508 * Math.PI) / 180; // Golden angle in radians
  return {
    x: basePos.x + Math.cos(angle) * minDistance * (1.5 + index * 0.3),
    y: basePos.y + Math.sin(angle) * minDistance * (1.5 + index * 0.3),
  };
}

// Lerp utility
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Get the length of a path segment in world units, scaled so that rounded
// paths preserve the same total traversal time as the original straight paths.
export function getPathSegmentLength(
  pathIndex: number,
  mapKey: string,
): number {
  const path = MAP_PATHS[mapKey];
  if (!path || pathIndex < 0 || pathIndex >= path.length - 1) return TILE_SIZE;

  const p1 = gridToWorldPath(path[pathIndex]);
  const p2 = gridToWorldPath(path[pathIndex + 1]);
  const scale = MAP_PATH_SPEED_SCALES[mapKey] ?? 1;
  return distance(p1, p2) * scale;
}

/**
 * Remaining world-space distance from an enemy's current position to the end
 * of its path.  Uses raw geometric distance (no speed scale) so values are
 * comparable across different paths.
 */
export function getEnemyRemainingDistance(
  enemy: { pathIndex: number; progress: number; pathKey?: string },
  defaultMapKey: string,
): number {
  const mapKey = enemy.pathKey || defaultMapKey;
  const path = MAP_PATHS[mapKey];
  if (!path || path.length < 2) return Infinity;

  const idx = Math.min(enemy.pathIndex, path.length - 2);

  const cur = gridToWorldPath(path[idx]);
  const nxt = gridToWorldPath(path[idx + 1]);
  let remaining = (1 - enemy.progress) * distance(cur, nxt);

  for (let i = idx + 1; i < path.length - 1; i++) {
    remaining += distance(gridToWorldPath(path[i]), gridToWorldPath(path[i + 1]));
  }

  return remaining;
}

// Clamp utility
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Ease functions
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Normalize angle to 0-2PI
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}

// Convert hex to rgb
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return { r: 0, g: 0, b: 0 };
  }

  return { r, g, b };
}

export { hexToRgba } from "./colorUtils";

// Calculate projectile start position from elevated tower
export function getProjectileOrigin(
  towerPos: Position,
  targetPos: Position,
  towerHeight: number,
  rotation: number,
): Position {
  const barrelLength = 18;
  const elevationOffset = towerHeight * 0.8;

  return {
    x: towerPos.x + Math.cos(rotation) * barrelLength,
    y: towerPos.y + Math.sin(rotation) * barrelLength - elevationOffset,
  };
}

/**
 * Compute mortar barrel-tip origin offset and screen-space elevation.
 * Matches the rendering geometry so projectiles appear to launch from
 * the muzzle rather than the tower base.
 */
export function getMortarBarrelOrigin(
  towerPos: Position,
  targetPos: Position,
  level: number,
  upgrade?: string,
): { from: Position; elevation: number } {
  const isMissile = level === 4 && upgrade === "A";
  const isEmber = level === 4 && upgrade === "B";

  // Screen-space height of barrel tip above tower ground (at zoom=1).
  // Derived from the rendering stack: wall(8) + plat(5) - overlap(1) + depot + barrel tiers.
  const depotH = (22 + level * 10) * 0.42;
  const baseToTopY = 12 + depotH;
  let barrelTotalH: number;
  if (isMissile) {
    barrelTotalH = 27; // 10 + 9 + 8
  } else if (isEmber) {
    barrelTotalH = 21; // 8 + 7 + 6
  } else {
    barrelTotalH = (8 + level) * 2 + (6 + level * 0.5);
  }
  const elevation = baseToTopY + barrelTotalH;

  // Forward offset in world space along the aim direction (barrel lean).
  const dx = targetPos.x - towerPos.x;
  const dy = targetPos.y - towerPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const barrelForward = isMissile ? 10 : isEmber ? 8 : 6 + level;
  const nx = dist > 0 ? dx / dist : 0;
  const ny = dist > 0 ? dy / dist : 0;

  return {
    from: {
      x: towerPos.x + nx * barrelForward,
      y: towerPos.y + ny * barrelForward,
    },
    elevation,
  };
}

// Calculate arc height for projectiles based on distance
export function calculateProjectileArc(
  from: Position,
  to: Position,
  baseHeight: number = 30,
): number {
  const dist = distance(from, to);
  return Math.min(baseHeight + dist * 0.15, 80);
}

// Check if point is on screen
export function isOnScreen(
  worldPos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
  margin: number = 100,
): boolean {
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;

  return (
    screenPos.x >= -margin &&
    screenPos.x <= width + margin &&
    screenPos.y >= -margin &&
    screenPos.y <= height + margin
  );
}

// ============================================================================
// TROOP MOVEMENT UTILITIES
// ============================================================================

/**
 * Find the closest point on the entire path to a given world position
 */
export function findClosestPathPoint(
  worldPos: Position,
  mapKey: string,
): { point: Position; distance: number; segmentIndex: number } | null {
  const paths = getLevelPaths(mapKey);
  if (paths.length === 0) return null;

  let closestPoint = worldPos;
  let minDist = Infinity;
  let closestSegmentIndex = 0;
  let runningSegmentIndex = 0;

  for (const path of paths) {
    for (let i = 0; i < path.points.length - 1; i++) {
      const p1 = gridToWorldPath(path.points[i]);
      const p2 = gridToWorldPath(path.points[i + 1]);
      const point = closestPointOnLine(worldPos, p1, p2);
      const dist = distance(worldPos, point);
      if (dist < minDist) {
        minDist = dist;
        closestPoint = point;
        closestSegmentIndex = runningSegmentIndex;
      }
      runningSegmentIndex += 1;
    }
  }

  return {
    point: closestPoint,
    distance: minDist,
    segmentIndex: closestSegmentIndex,
  };
}

/**
 * Find the closest point on path that's within a certain radius of an anchor point
 * Used for troops that can only move within a specific range
 */
export function findClosestPathPointWithinRadius(
  worldPos: Position,
  anchorPos: Position,
  radius: number,
  mapKey: string,
): { point: Position; isValid: boolean; clampedToRadius: boolean } | null {
  const pathResult = findClosestPathPoint(worldPos, mapKey);
  if (!pathResult) return null;

  const distFromAnchor = distance(pathResult.point, anchorPos);

  // If the closest path point is within radius, it's valid
  if (distFromAnchor <= radius) {
    return { point: pathResult.point, isValid: true, clampedToRadius: false };
  }

  // Otherwise, we need to find the closest point on path that IS within the radius
  // Walk along the path and find the intersection with the radius circle
  let bestPoint: Position | null = null;
  let bestDist = Infinity;

  for (const path of getLevelPaths(mapKey)) {
    for (let i = 0; i < path.points.length - 1; i++) {
      const p1 = gridToWorldPath(path.points[i]);
      const p2 = gridToWorldPath(path.points[i + 1]);

      // Find intersections of this segment with the radius circle
      const intersections = lineCircleIntersection(p1, p2, anchorPos, radius);

      for (const intersection of intersections) {
        // Check if this intersection is closer to our target position
        const distToTarget = distance(intersection, worldPos);
        if (distToTarget < bestDist) {
          bestDist = distToTarget;
          bestPoint = intersection;
        }
      }

      // Also check if the segment endpoints are within radius
      if (distance(p1, anchorPos) <= radius) {
        const distToTarget = distance(p1, worldPos);
        if (distToTarget < bestDist) {
          bestDist = distToTarget;
          bestPoint = p1;
        }
      }
      if (distance(p2, anchorPos) <= radius) {
        const distToTarget = distance(p2, worldPos);
        if (distToTarget < bestDist) {
          bestDist = distToTarget;
          bestPoint = p2;
        }
      }
    }
  }

  if (bestPoint) {
    return { point: bestPoint, isValid: true, clampedToRadius: true };
  }

  // No valid point found within radius
  return { point: pathResult.point, isValid: false, clampedToRadius: false };
}

/**
 * Find intersection points between a line segment and a circle
 */
export function lineCircleIntersection(
  p1: Position,
  p2: Position,
  center: Position,
  radius: number,
): Position[] {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const fx = p1.x - center.x;
  const fy = p1.y - center.y;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) return [];

  const intersections: Position[] = [];
  const sqrtDisc = Math.sqrt(discriminant);

  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  if (t1 >= 0 && t1 <= 1) {
    intersections.push({
      x: p1.x + t1 * dx,
      y: p1.y + t1 * dy,
    });
  }

  if (t2 >= 0 && t2 <= 1 && Math.abs(t1 - t2) > 0.0001) {
    intersections.push({
      x: p1.x + t2 * dx,
      y: p1.y + t2 * dy,
    });
  }

  return intersections;
}

/**
 * Calculate the movement info for a selected unit
 */
export interface TroopMoveInfo {
  anchorPos: Position;
  moveRadius: number;
  canMoveAnywhere: boolean; // For heroes
  ownerType: "station" | "barracks" | "spell" | "hero" | "hero_summon";
  ownerId: string;
}

export function getTroopMoveInfo(
  troop: Troop,
  towers: {
    id: string;
    type: string;
    pos: { x: number; y: number };
    rangeBoost?: number;
  }[],
  specialTowers?: { type: string; pos: { x: number; y: number } }[],
): TroopMoveInfo {
  // Check if owned by a dinky station
  const station = towers.find(
    (t) => t.id === troop.ownerId && t.type === "station",
  );
  if (station) {
    const boostedRange = STATION_TROOP_RANGE * (station.rangeBoost || 1);
    return {
      anchorPos: gridToWorld(station.pos),
      moveRadius: boostedRange,
      canMoveAnywhere: false,
      ownerType: "station",
      ownerId: station.id,
    };
  }

  // Check if owned by a frontier barracks (special building)
  if (isBarracksOwnerId(troop.ownerId) && specialTowers) {
    const matchedBarracks = specialTowers.find(
      (t) => t.type === "barracks" && getBarracksOwnerId(t.pos) === troop.ownerId,
    );
    if (matchedBarracks) {
      return {
        anchorPos: gridToWorld(matchedBarracks.pos),
        moveRadius: BARRACKS_TROOP_RANGE,
        canMoveAnywhere: false,
        ownerType: "barracks",
        ownerId: troop.ownerId,
      };
    }
  }

  // Check if owned by hero (captain's rally ability)
  if (troop.ownerId.startsWith("hero-")) {
    return {
      anchorPos: troop.spawnPoint || troop.pos,
      moveRadius: troop.moveRadius || HERO_SUMMON_RANGE,
      canMoveAnywhere: false,
      ownerType: "hero_summon",
      ownerId: troop.ownerId,
    };
  }

  // Spell-spawned troops (reinforcements) - ownerId is "spell-<timestamp>-<counter>"
  if (troop.ownerId.startsWith("spell")) {
    return {
      anchorPos: troop.spawnPoint || troop.pos,
      moveRadius: troop.moveRadius || SPELL_TROOP_RANGE,
      canMoveAnywhere: false,
      ownerType: "spell",
      ownerId: troop.ownerId,
    };
  }

  // Default fallback
  return {
    anchorPos: troop.spawnPoint || troop.pos,
    moveRadius: troop.moveRadius || SPELL_TROOP_RANGE,
    canMoveAnywhere: false,
    ownerType: "spell",
    ownerId: troop.ownerId,
  };
}
