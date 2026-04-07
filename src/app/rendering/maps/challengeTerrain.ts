import {
  GRID_HEIGHT,
  GRID_WIDTH,
  TILE_SIZE,
  getLevelUniquePathSegments,
} from "../../constants";
import type { LevelKind, Position } from "../../types";
import {
  distanceToLineSegment,
  gridToWorld,
  gridToWorldPath,
} from "../../utils";

const MOUNTAIN_TERRAIN_KINDS: ReadonlySet<LevelKind> = new Set([
  "challenge",
  "sandbox",
]);

export function isMountainTerrainKind(kind: LevelKind | undefined): boolean {
  return !!kind && MOUNTAIN_TERRAIN_KINDS.has(kind);
}

export interface ChallengePathSegment {
  start: Position;
  end: Position;
}

export interface ChallengeMountainGridBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const CHALLENGE_MOUNTAIN_RADII = {
  base: TILE_SIZE * 7.4,
  mid: TILE_SIZE * 4.8,
  top: TILE_SIZE * 3.1,
} as const;

export const CHALLENGE_MOUNTAIN_DEPTH = {
  baseShadow: 176,
  cliffBase: 138,
  terraceStep: 26,
} as const;

export const CHALLENGE_MOUNTAIN_SKIRT_LAYERS = 11;
export const CHALLENGE_PATH_OUTCROP_RADIUS = TILE_SIZE * 2.75;
export const CHALLENGE_PATH_DECORATION_OUTCROP_RADIUS = TILE_SIZE * 1.95;
export const CHALLENGE_DECORATION_RADIUS =
  CHALLENGE_PATH_DECORATION_OUTCROP_RADIUS;
export const CHALLENGE_GRID_TOP_MARGIN_TILES = 0.72;
export const CHALLENGE_GRID_DECORATION_MARGIN_TILES = 0.42;

const CHALLENGE_BOUNDS_GRID_MARGIN_TILES = 6;
const CHALLENGE_BOUNDS_PATH_MARGIN_TILES = 6;
const CHALLENGE_BOUNDS_CLAMP_MARGIN_TILES = 18;

export function getChallengePathSegments(
  mapId: string
): ChallengePathSegment[] {
  return getLevelUniquePathSegments(mapId).map((segment) => ({
    end: gridToWorldPath(segment.end),
    start: gridToWorldPath(segment.start),
  }));
}

export function getDistanceToChallengePath(
  worldPos: Position,
  segments: ChallengePathSegment[]
): number {
  if (segments.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  let minDistance = Number.POSITIVE_INFINITY;
  for (const segment of segments) {
    const dist = distanceToLineSegment(worldPos, segment.start, segment.end);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
}

function worldPosToGrid(worldPos: Position): { x: number; y: number } {
  return {
    x: worldPos.x / TILE_SIZE - 0.5,
    y: worldPos.y / TILE_SIZE - 0.5,
  };
}

function isWorldPosWithinGridBounds(
  worldPos: Position,
  marginTiles: number
): boolean {
  const gridPos = worldPosToGrid(worldPos);
  return (
    gridPos.x >= -marginTiles &&
    gridPos.x <= GRID_WIDTH - 1 + marginTiles &&
    gridPos.y >= -marginTiles &&
    gridPos.y <= GRID_HEIGHT - 1 + marginTiles
  );
}

export function isWorldPosInChallengeMountainTop(
  worldPos: Position,
  segments: ChallengePathSegment[]
): boolean {
  if (isWorldPosWithinGridBounds(worldPos, CHALLENGE_GRID_TOP_MARGIN_TILES)) {
    return true;
  }
  if (segments.length === 0) {
    return false;
  }
  return (
    getDistanceToChallengePath(worldPos, segments) <=
    CHALLENGE_PATH_OUTCROP_RADIUS
  );
}

export function isWorldPosInChallengeDecorationFootprint(
  worldPos: Position,
  segments: ChallengePathSegment[]
): boolean {
  if (
    isWorldPosWithinGridBounds(worldPos, CHALLENGE_GRID_DECORATION_MARGIN_TILES)
  ) {
    return true;
  }
  if (segments.length === 0) {
    return false;
  }
  return (
    getDistanceToChallengePath(worldPos, segments) <=
    CHALLENGE_PATH_DECORATION_OUTCROP_RADIUS
  );
}

export function isChallengeMountainTopCell(
  gx: number,
  gy: number,
  segments: ChallengePathSegment[]
): boolean {
  if (gx >= 0 && gx < GRID_WIDTH && gy >= 0 && gy < GRID_HEIGHT) {
    return true;
  }
  if (segments.length === 0) {
    return false;
  }
  return isWorldPosInChallengeMountainTop(
    gridToWorld({ x: gx, y: gy }),
    segments
  );
}

export function getChallengeMountainGridBounds(
  segments: ChallengePathSegment[]
): ChallengeMountainGridBounds {
  let minX = -CHALLENGE_BOUNDS_GRID_MARGIN_TILES;
  let maxX = GRID_WIDTH - 1 + CHALLENGE_BOUNDS_GRID_MARGIN_TILES;
  let minY = -CHALLENGE_BOUNDS_GRID_MARGIN_TILES;
  let maxY = GRID_HEIGHT - 1 + CHALLENGE_BOUNDS_GRID_MARGIN_TILES;

  for (const segment of segments) {
    const points = [segment.start, segment.end];
    for (const point of points) {
      const gridPos = worldPosToGrid(point);
      minX = Math.min(
        minX,
        Math.floor(gridPos.x - CHALLENGE_BOUNDS_PATH_MARGIN_TILES)
      );
      maxX = Math.max(
        maxX,
        Math.ceil(gridPos.x + CHALLENGE_BOUNDS_PATH_MARGIN_TILES)
      );
      minY = Math.min(
        minY,
        Math.floor(gridPos.y - CHALLENGE_BOUNDS_PATH_MARGIN_TILES)
      );
      maxY = Math.max(
        maxY,
        Math.ceil(gridPos.y + CHALLENGE_BOUNDS_PATH_MARGIN_TILES)
      );
    }
  }

  return {
    maxX: Math.min(maxX, GRID_WIDTH - 1 + CHALLENGE_BOUNDS_CLAMP_MARGIN_TILES),
    maxY: Math.min(maxY, GRID_HEIGHT - 1 + CHALLENGE_BOUNDS_CLAMP_MARGIN_TILES),
    minX: Math.max(minX, -CHALLENGE_BOUNDS_CLAMP_MARGIN_TILES),
    minY: Math.max(minY, -CHALLENGE_BOUNDS_CLAMP_MARGIN_TILES),
  };
}

export function isWorldPosInChallengeRadius(
  worldPos: Position,
  segments: ChallengePathSegment[],
  radius: number
): boolean {
  return getDistanceToChallengePath(worldPos, segments) <= radius;
}
