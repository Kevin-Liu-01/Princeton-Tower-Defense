import type { Position } from "../types";
import { MAP_PATHS, getLevelPathKeys } from "../constants";
import {
  gridToWorldPath,
  closestPointOnLine,
  distance,
} from "../utils";

const BARRACKS_OWNER_PREFIX = "special_barracks";

export function getBarracksOwnerId(pos: { x: number; y: number }): string {
  return `${BARRACKS_OWNER_PREFIX}_${pos.x}_${pos.y}`;
}

export function isBarracksOwnerId(ownerId: string): boolean {
  return ownerId.startsWith(BARRACKS_OWNER_PREFIX);
}

/**
 * Finds the closest point on any active road/path to the given world position.
 * Used by barracks and stations to determine troop rally points.
 */
export function findClosestRoadPoint(
  pos: Position,
  activeWaveSpawnPaths: string[],
  selectedMap: string
): Position {
  const pathKeys =
    activeWaveSpawnPaths.length > 0
      ? activeWaveSpawnPaths
      : getLevelPathKeys(selectedMap);
  if (pathKeys.length === 0) return pos;

  let closestPoint: Position = pos;
  let minDist = Infinity;
  for (const pathKey of pathKeys) {
    const pathPoints = MAP_PATHS[pathKey] ?? [];
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const p1Grid = pathPoints[i];
      const p2Grid = pathPoints[i + 1];
      if (!p1Grid || !p2Grid) continue;
      const p1 = gridToWorldPath(p1Grid);
      const p2 = gridToWorldPath(p2Grid);
      const roadPoint = closestPointOnLine(pos, p1, p2);
      const dist = distance(pos, roadPoint);
      if (dist < minDist) {
        minDist = dist;
        closestPoint = roadPoint;
      }
    }
  }
  return closestPoint;
}
