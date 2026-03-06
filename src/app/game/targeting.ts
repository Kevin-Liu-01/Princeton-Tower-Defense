import type { Position, Enemy, Troop } from "../types";
import { distance } from "../utils";

/**
 * Returns enemies within `range` of `origin`, ordered by path progress (furthest first).
 * Accepts pre-sorted enemies and a position resolver to allow external caching.
 */
export function getPrioritizedEnemiesInRange(
  origin: Position,
  range: number,
  enemiesByProgress: Enemy[],
  getEnemyPos: (enemy: Enemy) => Position,
  limit = Number.POSITIVE_INFINITY,
  predicate?: (enemy: Enemy) => boolean
): Enemy[] {
  const targets: Enemy[] = [];
  for (const enemy of enemiesByProgress) {
    if (predicate && !predicate(enemy)) continue;
    if (distance(origin, getEnemyPos(enemy)) <= range) {
      targets.push(enemy);
      if (targets.length >= limit) break;
    }
  }
  return targets;
}

/**
 * Returns the single closest enemy within `range` of `origin`.
 */
export function getClosestEnemyInRange(
  origin: Position,
  range: number,
  enemies: Enemy[],
  getEnemyPos: (enemy: Enemy) => Position,
  predicate?: (enemy: Enemy) => boolean
): Enemy | null {
  let closestEnemy: Enemy | null = null;
  let closestDist = Number.POSITIVE_INFINITY;
  for (const enemy of enemies) {
    if (predicate && !predicate(enemy)) continue;
    const dist = distance(origin, getEnemyPos(enemy));
    if (dist <= range && dist < closestDist) {
      closestDist = dist;
      closestEnemy = enemy;
    }
  }
  return closestEnemy;
}

export function getTroopCellKey(
  x: number,
  y: number,
  cellSize: number
): string {
  return `${Math.floor(x / cellSize)}:${Math.floor(y / cellSize)}`;
}

/**
 * Finds the nearest troop within `range` using spatial-hash buckets for efficiency.
 */
export function findNearestTroopInRange(
  origin: Position,
  range: number,
  troopBuckets: Map<string, Troop[]>,
  cellSize: number,
  predicate?: (troop: Troop) => boolean
): Troop | null {
  const baseX = Math.floor(origin.x / cellSize);
  const baseY = Math.floor(origin.y / cellSize);
  const cellRadius = Math.ceil(range / cellSize);
  let closest: Troop | null = null;
  let closestDist = range;

  for (let cy = baseY - cellRadius; cy <= baseY + cellRadius; cy++) {
    for (let cx = baseX - cellRadius; cx <= baseX + cellRadius; cx++) {
      const bucket = troopBuckets.get(`${cx}:${cy}`);
      if (!bucket) continue;
      for (const troop of bucket) {
        if (predicate && !predicate(troop)) continue;
        const dist = distance(origin, troop.pos);
        if (dist <= closestDist) {
          closest = troop;
          closestDist = dist;
        }
      }
    }
  }
  return closest;
}

/**
 * Finds the closest vault position to an enemy within `maxDistance`.
 */
export function getVaultImpactPos(
  enemyPos: Position,
  vaultWorldPositions: Position[],
  maxDistance: number
): Position | null {
  let closest: Position | null = null;
  let closestDist = maxDistance;
  for (const pos of vaultWorldPositions) {
    const distToVault = distance(enemyPos, pos);
    if (distToVault <= closestDist) {
      closestDist = distToVault;
      closest = pos;
    }
  }
  return closest;
}
