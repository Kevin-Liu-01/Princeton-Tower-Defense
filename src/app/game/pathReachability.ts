import type { Position } from "../types";
import { distance, closestPointOnLine, gridToWorldPath } from "../utils";
import { getLevelPaths } from "../constants";

/**
 * Multi-path walk distance: for maps with shared nodes between paths
 * (e.g. paths that merge/split), measure the shortest along-path distance.
 * Falls back to Infinity when positions aren't connected along any single path.
 */
function multiPathWalkDistance(
  worldA: Position,
  worldB: Position,
  mapKey: string,
): number {
  const paths = getLevelPaths(mapKey);
  if (paths.length === 0) return Infinity;

  let bestDist = Infinity;

  for (let pi = 0; pi < paths.length; pi++) {
    const pts = paths[pi].points;
    let bestA: { point: Position; segIdx: number; t: number } | null = null;
    let bestADist = Infinity;
    let bestB: { point: Position; segIdx: number; t: number } | null = null;
    let bestBDist = Infinity;

    for (let si = 0; si < pts.length - 1; si++) {
      const p1 = gridToWorldPath(pts[si]);
      const p2 = gridToWorldPath(pts[si + 1]);

      const projA = closestPointOnLine(worldA, p1, p2);
      const dA = distance(worldA, projA);
      if (dA < bestADist) {
        bestADist = dA;
        const sLen = distance(p1, p2);
        bestA = { point: projA, segIdx: si, t: sLen > 0.0001 ? distance(p1, projA) / sLen : 0 };
      }

      const projB = closestPointOnLine(worldB, p1, p2);
      const dB = distance(worldB, projB);
      if (dB < bestBDist) {
        bestBDist = dB;
        const sLen = distance(p1, p2);
        bestB = { point: projB, segIdx: si, t: sLen > 0.0001 ? distance(p1, projB) / sLen : 0 };
      }
    }

    if (!bestA || !bestB) continue;

    let lo = bestA;
    let hi = bestB;
    if (lo.segIdx > hi.segIdx || (lo.segIdx === hi.segIdx && lo.t > hi.t)) {
      lo = bestB;
      hi = bestA;
    }

    let walk: number;
    if (lo.segIdx === hi.segIdx) {
      const p1 = gridToWorldPath(pts[lo.segIdx]);
      const p2 = gridToWorldPath(pts[lo.segIdx + 1]);
      walk = distance(p1, p2) * Math.abs(hi.t - lo.t);
    } else {
      walk = distance(lo.point, gridToWorldPath(pts[lo.segIdx + 1]));
      for (let i = lo.segIdx + 1; i < hi.segIdx; i++) {
        walk += distance(gridToWorldPath(pts[i]), gridToWorldPath(pts[i + 1]));
      }
      walk += distance(gridToWorldPath(pts[hi.segIdx]), hi.point);
    }

    if (walk < bestDist) bestDist = walk;
  }

  return bestDist;
}

/**
 * Check if an enemy is reachable from a unit's position by walking along the
 * path.  An enemy is reachable when the along-path distance is no more than
 * `maxPathRatio` times the Euclidean sight range.
 *
 * This prevents units from targeting enemies that are geometrically close
 * (across a U-bend) but unreachable along the road.
 */
export function isEnemyReachableAlongPath(
  unitPos: Position,
  enemyPos: Position,
  mapKey: string,
  maxPathDistance: number,
): boolean {
  const walkDist = multiPathWalkDistance(unitPos, enemyPos, mapKey);
  return walkDist <= maxPathDistance;
}

/**
 * Build waypoints for walking along the path from `start` to `end`.
 * Returns an ordered list of positions the unit should visit.
 * The first entry is after `start` (the next path node or bend),
 * and the last entry is `end` itself.
 *
 * If start/end aren't on the same path, returns [end] (direct).
 */
export function getPathWaypoints(
  start: Position,
  end: Position,
  mapKey: string,
): Position[] {
  const paths = getLevelPaths(mapKey);
  if (paths.length === 0) return [end];

  let bestPathIdx = -1;
  let bestStartSeg = -1;
  let bestStartT = 0;
  let bestEndSeg = -1;
  let bestEndT = 0;
  let bestTotalDist = Infinity;

  for (let pi = 0; pi < paths.length; pi++) {
    const pts = paths[pi].points;
    let sA: { segIdx: number; t: number; point: Position } | null = null;
    let sADist = Infinity;
    let sB: { segIdx: number; t: number; point: Position } | null = null;
    let sBDist = Infinity;

    for (let si = 0; si < pts.length - 1; si++) {
      const p1 = gridToWorldPath(pts[si]);
      const p2 = gridToWorldPath(pts[si + 1]);

      const projA = closestPointOnLine(start, p1, p2);
      const dA = distance(start, projA);
      if (dA < sADist) {
        sADist = dA;
        const sLen = distance(p1, p2);
        sA = { segIdx: si, t: sLen > 0.0001 ? distance(p1, projA) / sLen : 0, point: projA };
      }

      const projB = closestPointOnLine(end, p1, p2);
      const dB = distance(end, projB);
      if (dB < sBDist) {
        sBDist = dB;
        const sLen = distance(p1, p2);
        sB = { segIdx: si, t: sLen > 0.0001 ? distance(p1, projB) / sLen : 0, point: projB };
      }
    }

    if (!sA || !sB) continue;

    let lo = sA;
    let hi = sB;
    if (lo.segIdx > hi.segIdx || (lo.segIdx === hi.segIdx && lo.t > hi.t)) {
      lo = sB;
      hi = sA;
    }

    let walkLen: number;
    if (lo.segIdx === hi.segIdx) {
      const p1 = gridToWorldPath(pts[lo.segIdx]);
      const p2 = gridToWorldPath(pts[lo.segIdx + 1]);
      walkLen = distance(p1, p2) * Math.abs(hi.t - lo.t);
    } else {
      walkLen = distance(lo.point, gridToWorldPath(pts[lo.segIdx + 1]));
      for (let i = lo.segIdx + 1; i < hi.segIdx; i++) {
        walkLen += distance(gridToWorldPath(pts[i]), gridToWorldPath(pts[i + 1]));
      }
      walkLen += distance(gridToWorldPath(pts[hi.segIdx]), hi.point);
    }

    if (walkLen < bestTotalDist) {
      bestTotalDist = walkLen;
      bestPathIdx = pi;
      bestStartSeg = sA.segIdx;
      bestStartT = sA.t;
      bestEndSeg = sB.segIdx;
      bestEndT = sB.t;
    }
  }

  if (bestPathIdx < 0) return [end];

  const pts = paths[bestPathIdx].points;
  const waypoints: Position[] = [];

  const forward = bestStartSeg < bestEndSeg ||
    (bestStartSeg === bestEndSeg && bestStartT <= bestEndT);

  if (forward) {
    for (let i = bestStartSeg + 1; i <= bestEndSeg; i++) {
      waypoints.push(gridToWorldPath(pts[i]));
    }
  } else {
    for (let i = bestStartSeg; i > bestEndSeg; i--) {
      waypoints.push(gridToWorldPath(pts[i]));
    }
  }

  waypoints.push(end);
  return waypoints;
}
