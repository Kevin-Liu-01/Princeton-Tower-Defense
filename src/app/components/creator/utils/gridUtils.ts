import { GRID_HEIGHT, GRID_WIDTH } from "../../../constants";
import type { GridPoint } from "../types";

export const PATH_MARGIN_TILES = 4;

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const normalizeMapPoint = (point: GridPoint): GridPoint => ({
  x: clamp(Math.round(point.x), 0, GRID_WIDTH - 1),
  y: clamp(Math.round(point.y), 0, GRID_HEIGHT - 1),
});

export const normalizePathPoint = (point: GridPoint): GridPoint => ({
  x: clamp(
    Math.round(point.x),
    -PATH_MARGIN_TILES,
    GRID_WIDTH - 1 + PATH_MARGIN_TILES
  ),
  y: clamp(
    Math.round(point.y),
    -PATH_MARGIN_TILES,
    GRID_HEIGHT - 1 + PATH_MARGIN_TILES
  ),
});

export const isInsideMap = (point: GridPoint): boolean =>
  point.x >= 0 &&
  point.x <= GRID_WIDTH - 1 &&
  point.y >= 0 &&
  point.y <= GRID_HEIGHT - 1;

export const samePoint = (a: GridPoint | null, b: GridPoint | null): boolean =>
  Boolean(a && b && a.x === b.x && a.y === b.y);

export const formatPointLabel = (point: GridPoint | null): string =>
  point ? `(${point.x},${point.y})` : "(--,--)";

export const formatAssetName = (value: string): string =>
  value.replaceAll("_", " ").replaceAll(/\b\w/g, (char) => char.toUpperCase());

export const distanceSq = (a: GridPoint, b: GridPoint): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};
