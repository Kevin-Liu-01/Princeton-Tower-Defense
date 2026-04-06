import type { Position, Enemy } from "../types";
import { distanceSq } from "../utils";

const DEFAULT_CELL_SIZE = 150;

export interface EnemySpatialHash {
  getInRange: (
    origin: Position,
    range: number,
    predicate?: (e: Enemy) => boolean,
  ) => Enemy[];
  getClosest: (
    origin: Position,
    range: number,
    predicate?: (e: Enemy) => boolean,
  ) => Enemy | null;
}

function cellKey(cx: number, cy: number): number {
  return cx * 100003 + cy;
}

export function buildEnemySpatialHash(
  enemies: Enemy[],
  getPos: (enemy: Enemy) => Position,
  cellSize: number = DEFAULT_CELL_SIZE,
): EnemySpatialHash {
  const buckets = new Map<number, Enemy[]>();

  for (const enemy of enemies) {
    if (enemy.dead || enemy.hp <= 0) continue;
    const pos = getPos(enemy);
    const cx = Math.floor(pos.x / cellSize);
    const cy = Math.floor(pos.y / cellSize);
    const key = cellKey(cx, cy);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(enemy);
    else buckets.set(key, [enemy]);
  }

  const getInRange = (
    origin: Position,
    range: number,
    predicate?: (e: Enemy) => boolean,
  ): Enemy[] => {
    const rangeSq = range * range;
    const baseCx = Math.floor(origin.x / cellSize);
    const baseCy = Math.floor(origin.y / cellSize);
    const cellRadius = Math.ceil(range / cellSize);
    const result: Enemy[] = [];

    for (let dy = -cellRadius; dy <= cellRadius; dy++) {
      for (let dx = -cellRadius; dx <= cellRadius; dx++) {
        const bucket = buckets.get(cellKey(baseCx + dx, baseCy + dy));
        if (!bucket) continue;
        for (const enemy of bucket) {
          if (predicate && !predicate(enemy)) continue;
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
    predicate?: (e: Enemy) => boolean,
  ): Enemy | null => {
    let bestDistSq = range * range;
    let best: Enemy | null = null;
    const baseCx = Math.floor(origin.x / cellSize);
    const baseCy = Math.floor(origin.y / cellSize);
    const cellRadius = Math.ceil(range / cellSize);

    for (let dy = -cellRadius; dy <= cellRadius; dy++) {
      for (let dx = -cellRadius; dx <= cellRadius; dx++) {
        const bucket = buckets.get(cellKey(baseCx + dx, baseCy + dy));
        if (!bucket) continue;
        for (const enemy of bucket) {
          if (predicate && !predicate(enemy)) continue;
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

  return { getInRange, getClosest };
}
