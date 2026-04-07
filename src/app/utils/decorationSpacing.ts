import type { DecorationType, DecorationHeightTag } from "../types";
import { getDecorationHeightTag } from "./index";

/**
 * Base exclusion radius (grid units at scale 1) by height tag.
 * Tall decorations (trees, huts) get the largest buffer;
 * ground-level items (grass, flowers) barely exclude anything
 * so they can still sit naturally near larger objects.
 */
const EXCLUSION_RADIUS_BY_TAG: Record<DecorationHeightTag, number> = {
  ground: 0.08,
  landmark: 0.8,
  medium: 0.22,
  short: 0.14,
  tall: 0.35,
};

export function getExclusionRadius(
  type: DecorationType,
  scale: number
): number {
  const tag = getDecorationHeightTag(type);
  return EXCLUSION_RADIUS_BY_TAG[tag] * Math.max(0.4, scale);
}

interface PlacedEntry {
  x: number;
  y: number;
  radius: number;
}

/**
 * Cell-based spatial hash for fast proximity queries in grid-coordinate space.
 * Each decoration registers with its center and an exclusion radius.
 * New placements are rejected if they violate the minimum distance
 * (sum of both radii) to any existing neighbour.
 */
export class DecorationSpatialGrid {
  private readonly cellSize: number;
  private readonly cells = new Map<string, PlacedEntry[]>();

  constructor(cellSize = 1) {
    this.cellSize = cellSize;
  }

  private key(cx: number, cy: number): string {
    return `${cx}|${cy}`;
  }

  register(gridX: number, gridY: number, radius: number): void {
    const cx = Math.floor(gridX / this.cellSize);
    const cy = Math.floor(gridY / this.cellSize);
    const k = this.key(cx, cy);
    let bucket = this.cells.get(k);
    if (!bucket) {
      bucket = [];
      this.cells.set(k, bucket);
    }
    bucket.push({ radius, x: gridX, y: gridY });
  }

  canPlace(gridX: number, gridY: number, radius: number): boolean {
    const cx = Math.floor(gridX / this.cellSize);
    const cy = Math.floor(gridY / this.cellSize);
    const reach = Math.ceil((radius + 0.5) / this.cellSize) + 1;

    for (let dx = -reach; dx <= reach; dx++) {
      for (let dy = -reach; dy <= reach; dy++) {
        const bucket = this.cells.get(this.key(cx + dx, cy + dy));
        if (!bucket) {
          continue;
        }
        for (const entry of bucket) {
          const distSq = (gridX - entry.x) ** 2 + (gridY - entry.y) ** 2;
          const minDist = radius + entry.radius;
          if (distSq < minDist * minDist) {
            return false;
          }
        }
      }
    }
    return true;
  }

  tryPlace(gridX: number, gridY: number, radius: number): boolean {
    if (!this.canPlace(gridX, gridY, radius)) {
      return false;
    }
    this.register(gridX, gridY, radius);
    return true;
  }
}
