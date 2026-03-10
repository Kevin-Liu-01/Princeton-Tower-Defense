type PathPoint = { x: number; y: number };

const DEFAULT_CORNER_RADIUS = 1.0;
const DEFAULT_ARC_POINTS = 5;

/**
 * Detects whether two normalized direction vectors form a turn (not collinear).
 * Returns true if the angle between them is significant (> ~18 degrees).
 */
function isTurn(
  ndx1: number,
  ndy1: number,
  ndx2: number,
  ndy2: number,
): boolean {
  const dot = ndx1 * ndx2 + ndy1 * ndy2;
  return dot < 0.95;
}

/**
 * Evaluates a point on a quadratic Bezier curve at parameter t.
 * B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
 */
function quadBezier(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  t: number,
): PathPoint {
  const mt = 1 - t;
  return {
    x: mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x,
    y: mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y,
  };
}

/**
 * Rounds the corners of a polyline path by replacing each sharp joint with a
 * quadratic Bezier arc. The original corner becomes the control point while
 * pull-back points on the adjacent segments serve as arc endpoints.
 *
 * First and last points (spawn/exit) are always preserved.
 *
 * @param radius  Max pull-back distance from each corner (grid units).
 *                Clamped per-corner so curves never overlap.
 * @param arcPoints  Number of subdivisions per arc (generates arcPoints + 1 points).
 */
export function roundPathCorners(
  path: PathPoint[],
  radius: number = DEFAULT_CORNER_RADIUS,
  arcPoints: number = DEFAULT_ARC_POINTS,
): PathPoint[] {
  if (path.length < 3) return [...path];

  const result: PathPoint[] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (len1 < 0.001 || len2 < 0.001) {
      result.push({ ...curr });
      continue;
    }

    const ndx1 = dx1 / len1;
    const ndy1 = dy1 / len1;
    const ndx2 = dx2 / len2;
    const ndy2 = dy2 / len2;

    if (!isTurn(ndx1, ndy1, ndx2, ndy2)) {
      result.push({ ...curr });
      continue;
    }

    const maxR = Math.min(len1 * 0.4, len2 * 0.4, radius);

    const p0x = curr.x - ndx1 * maxR;
    const p0y = curr.y - ndy1 * maxR;
    const p2x = curr.x + ndx2 * maxR;
    const p2y = curr.y + ndy2 * maxR;

    for (let j = 0; j <= arcPoints; j++) {
      result.push(quadBezier(p0x, p0y, curr.x, curr.y, p2x, p2y, j / arcPoints));
    }
  }

  result.push(path[path.length - 1]);
  return result;
}

/**
 * Sums the Euclidean distance between consecutive points in grid space.
 */
export function computeGridPathLength(path: PathPoint[]): number {
  let length = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1].x - path[i].x;
    const dy = path[i + 1].y - path[i].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}
