import { GRID_HEIGHT, GRID_WIDTH } from "../../../constants";
import type { GridPoint } from "../types";

export const ISO_VIEWBOX_WIDTH = 1320;
export const ISO_VIEWBOX_HEIGHT = 780;
export const ISO_TILE_WIDTH = 34;
export const ISO_TILE_HEIGHT = 18;
export const ISO_ORIGIN_X = ISO_VIEWBOX_WIDTH / 2;
export const ISO_ORIGIN_Y = 96;

export const gridToIso = (point: GridPoint): { x: number; y: number } => ({
  x: ISO_ORIGIN_X + (point.x - point.y) * (ISO_TILE_WIDTH / 2),
  y: ISO_ORIGIN_Y + (point.x + point.y) * (ISO_TILE_HEIGHT / 2),
});

export const gridFloatToIso = (
  x: number,
  y: number
): { x: number; y: number } => ({
  x: ISO_ORIGIN_X + (x - y) * (ISO_TILE_WIDTH / 2),
  y: ISO_ORIGIN_Y + (x + y) * (ISO_TILE_HEIGHT / 2),
});

export const isoToGridFloat = (
  x: number,
  y: number
): { x: number; y: number } => {
  const normalizedX = (x - ISO_ORIGIN_X) / (ISO_TILE_WIDTH / 2);
  const normalizedY = (y - ISO_ORIGIN_Y) / (ISO_TILE_HEIGHT / 2);
  return {
    x: (normalizedX + normalizedY) / 2,
    y: (normalizedY - normalizedX) / 2,
  };
};

export const getIsoTilePolygon = (point: GridPoint, padding = 0): string => {
  const center = gridFloatToIso(point.x + 0.5, point.y + 0.5);
  const scale = Math.max(0.05, 1 + padding);
  const corners = [
    gridFloatToIso(point.x, point.y),
    gridFloatToIso(point.x + 1, point.y),
    gridFloatToIso(point.x + 1, point.y + 1),
    gridFloatToIso(point.x, point.y + 1),
  ].map((corner) => ({
    x: center.x + (corner.x - center.x) * scale,
    y: center.y + (corner.y - center.y) * scale,
  }));
  return corners.map((corner) => `${corner.x},${corner.y}`).join(" ");
};

export const pathToIsoPoints = (path: GridPoint[]): string =>
  path
    .map((point) => {
      const p = gridToIso(point);
      return `${p.x},${p.y}`;
    })
    .join(" ");

export const MAP_PLANE_POLYGON = [
  gridFloatToIso(0, 0),
  gridFloatToIso(GRID_WIDTH, 0),
  gridFloatToIso(GRID_WIDTH, GRID_HEIGHT),
  gridFloatToIso(0, GRID_HEIGHT),
]
  .map((point) => `${point.x},${point.y}`)
  .join(" ");
