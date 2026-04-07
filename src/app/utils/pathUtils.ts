import type { Position } from "../types";
import { gridToWorldPath, distanceToLineSegment } from "../utils";

export interface PathSegment {
  start: Position;
  end: Position;
}

/**
 * Converts an array of grid-space path points into world-space line segments.
 */
export function buildPathSegments(
  pathPoints: { x: number; y: number }[]
): PathSegment[] {
  const segments: PathSegment[] = [];
  for (let i = 0; i < pathPoints.length - 1; i++) {
    segments.push({
      end: gridToWorldPath(pathPoints[i + 1]),
      start: gridToWorldPath(pathPoints[i]),
    });
  }
  return segments;
}

/**
 * Returns the minimum distance from a world position to the nearest path segment.
 */
export function minDistanceToPath(
  worldPos: Position,
  pathSegments: PathSegment[]
): number {
  let minDist = Infinity;
  for (const segment of pathSegments) {
    const d = distanceToLineSegment(worldPos, segment.start, segment.end);
    if (d < minDist) {
      minDist = d;
    }
  }
  return minDist;
}
