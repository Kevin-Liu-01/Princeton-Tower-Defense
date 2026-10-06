import type { Position, Enemy } from "../types";
import { distanceSq } from "../utils";

const DEFAULT_CELL_SIZE = 150;

export interface EnemySpatialHash {
  getInRange: (
    origin: Position,
    range: number,
    predicate?: (e: Enemy) => boolean
  ) => Enemy[];
  getClosest: (
    origin: Position,
    range: number,
    predicate?: (e: Enemy) => boolean
  ) => Enemy | null;
}

function cellKey(cx: number, cy: number): number {
  return cx * 100_003 + cy;
}

export function buildEnemySpatialHash(
  enemies: Enemy[],
  getPos: (enemy: Enemy) => Position,
  cellSize: number = DEFAULT_CELL_SIZE
): EnemySpatialHash {
  const buckets = new Map<number, Enemy[]>();

  for (const enemy of enemies) {
    if (enemy.dead || enemy.hp <= 0) {
      continue;
    }
    const pos = getPos(enemy);
    const cx = Math.floor(pos.x / cellSize);
    const cy = Math.floor(pos.y / cellSize);
    const key = cellKey(cx, cy);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(enemy);
    } else {
      buckets.set(key, [enemy]);
    }
  }

  const getInRange = (
    origin: Position,
    range: number,
    predicate?: (e: Enemy) => boolean
  ): Enemy[] => {
    const rangeSq = range * range;
    const minCx = Math.floor((origin.x - range) / cellSize);
    const maxCx = Math.floor((origin.x + range) / cellSize);
    const minCy = Math.floor((origin.y - range) / cellSize);
    const maxCy = Math.floor((origin.y + range) / cellSize);
    const result: Enemy[] = [];

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const bucket = buckets.get(cellKey(cx, cy));
        if (!bucket) {
          continue;
        }
        for (const enemy of bucket) {
          if (predicate && !predicate(enemy)) {
            continue;
          }
          if (distanceSq(origin, getPos(enemy)) <= rangeSq) {
            result.push(enemy);
          }
        }
      }
    }
    return result;
  };

  const getClosest = (
    origin: Position,
    range: number,
    predicate?: (e: Enemy) => boolean
  ): Enemy | null => {
    let bestDistSq = range * range;
    let best: Enemy | null = null;
    const minCx = Math.floor((origin.x - range) / cellSize);
    const maxCx = Math.floor((origin.x + range) / cellSize);
    const minCy = Math.floor((origin.y - range) / cellSize);
    const maxCy = Math.floor((origin.y + range) / cellSize);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const bucket = buckets.get(cellKey(cx, cy));
        if (!bucket) {
          continue;
        }
        for (const enemy of bucket) {
          if (predicate && !predicate(enemy)) {
            continue;
          }
          const dSq = distanceSq(origin, getPos(enemy));
          if (dSq <= bestDistSq) {
            bestDistSq = dSq;
            best = enemy;
          }
        }
      }
    }
    return best;
  };

  return { getClosest, getInRange };
}
