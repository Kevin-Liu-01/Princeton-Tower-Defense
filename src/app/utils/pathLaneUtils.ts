import { MAP_PATHS } from "../constants";
import { TILE_SIZE } from "../constants/gameplay";

type Vec2 = { x: number; y: number };

const TANGENT_WINDOW_DIST = TILE_SIZE * 1.5;
const CURVATURE_SAMPLE_DIST = TILE_SIZE * 2.0;
const MIN_CORNER_COMPRESSION = 0.3;

const worldPathCache = new Map<string, Vec2[]>();

function getWorldPath(mapKey: string): Vec2[] | null {
  const cached = worldPathCache.get(mapKey);
  if (cached) return cached;
  const gridPath = MAP_PATHS[mapKey];
  if (!gridPath || gridPath.length < 2) return null;
  const worldPath = gridPath.map((p) => ({
    x: p.x * TILE_SIZE,
    y: p.y * TILE_SIZE,
  }));
  worldPathCache.set(mapKey, worldPath);
  return worldPath;
}

function normalize(vx: number, vy: number): Vec2 {
  const len = Math.sqrt(vx * vx + vy * vy);
  if (len < 0.0001) return { x: 0, y: 0 };
  return { x: vx / len, y: vy / len };
}

/**
 * Walk along a world-space polyline from a starting (segIndex, segProgress)
 * by a signed world-space distance. Returns the resulting world-space position.
 * Positive = forward along the path, negative = backward.
 */
function walkAlongPath(
  worldPath: Vec2[],
  segIndex: number,
  segProgress: number,
  worldDist: number,
): Vec2 {
  const clampedIdx = Math.max(0, Math.min(worldPath.length - 2, segIndex));
  const t = Math.max(0, Math.min(1, segProgress));
  const p1 = worldPath[clampedIdx];
  const p2 = worldPath[clampedIdx + 1];
  const segDx = p2.x - p1.x;
  const segDy = p2.y - p1.y;
  const segLen = Math.sqrt(segDx * segDx + segDy * segDy);

  if (worldDist >= 0) {
    let remaining = worldDist;
    const distInSeg = segLen * (1 - t);
    if (remaining <= distInSeg && segLen > 0.0001) {
      const frac = remaining / segLen;
      return {
        x: p1.x + segDx * (t + frac),
        y: p1.y + segDy * (t + frac),
      };
    }
    remaining -= Math.max(0, distInSeg);
    let idx = clampedIdx + 1;
    while (remaining > 0 && idx < worldPath.length - 1) {
      const s = worldPath[idx];
      const e = worldPath[idx + 1];
      const dx = e.x - s.x;
      const dy = e.y - s.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0.0001 && remaining <= len) {
        const frac = remaining / len;
        return { x: s.x + dx * frac, y: s.y + dy * frac };
      }
      remaining -= len;
      idx++;
    }
    return worldPath[worldPath.length - 1];
  }

  let remaining = -worldDist;
  const distBehind = segLen * t;
  if (remaining <= distBehind && segLen > 0.0001) {
    const frac = remaining / segLen;
    return {
      x: p1.x + segDx * (t - frac),
      y: p1.y + segDy * (t - frac),
    };
  }
  remaining -= Math.max(0, distBehind);
  let idx = clampedIdx - 1;
  while (remaining > 0 && idx >= 0) {
    const s = worldPath[idx];
    const e = worldPath[idx + 1];
    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0.0001 && remaining <= len) {
      const frac = remaining / len;
      return { x: e.x - dx * frac, y: e.y - dy * frac };
    }
    remaining -= len;
    idx--;
  }
  return worldPath[0];
}

/**
 * Compute a smoothed tangent at a path position by sampling points within
 * a distance window ahead and behind. This naturally averages out the rapid
 * direction changes of short Bezier micro-segments at corners.
 */
export function getSmoothedTangent(
  mapKey: string,
  segIndex: number,
  segProgress: number,
  windowDist: number = TANGENT_WINDOW_DIST,
): Vec2 {
  const worldPath = getWorldPath(mapKey);
  if (!worldPath) return { x: 1, y: 0 };

  const halfWindow = windowDist / 2;
  const behind = walkAlongPath(worldPath, segIndex, segProgress, -halfWindow);
  const ahead = walkAlongPath(worldPath, segIndex, segProgress, halfWindow);

  const dx = ahead.x - behind.x;
  const dy = ahead.y - behind.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.001) {
    const ci = Math.min(segIndex, worldPath.length - 2);
    return normalize(
      worldPath[ci + 1].x - worldPath[ci].x,
      worldPath[ci + 1].y - worldPath[ci].y,
    );
  }
  return { x: dx / len, y: dy / len };
}

/**
 * Measure how much the path curves at a given position and return a lane
 * compression factor in [MIN_CORNER_COMPRESSION, 1.0].
 *
 * Samples the path direction slightly before and after the current position.
 * The dot product measures straightness:
 * - dot ~= 1  -> straight  -> factor = 1.0
 * - dot ~= 0  -> 90° turn  -> factor ~= 0.5
 * - dot < 0   -> hairpin   -> factor = MIN_CORNER_COMPRESSION
 */
export function getCornerLaneCompression(
  mapKey: string,
  segIndex: number,
  segProgress: number,
  sampleDist: number = CURVATURE_SAMPLE_DIST,
): number {
  const worldPath = getWorldPath(mapKey);
  if (!worldPath || worldPath.length < 3) return 1.0;

  const halfSample = sampleDist / 2;
  const tangentWindow = TANGENT_WINDOW_DIST * 0.5;

  const behindPos = walkAlongPath(
    worldPath,
    segIndex,
    segProgress,
    -halfSample,
  );
  const aheadPos = walkAlongPath(
    worldPath,
    segIndex,
    segProgress,
    halfSample,
  );
  const behindFar = walkAlongPath(
    worldPath,
    segIndex,
    segProgress,
    -halfSample - tangentWindow,
  );
  const aheadFar = walkAlongPath(
    worldPath,
    segIndex,
    segProgress,
    halfSample + tangentWindow,
  );

  const tB = normalize(
    behindPos.x - behindFar.x,
    behindPos.y - behindFar.y,
  );
  const tA = normalize(aheadFar.x - aheadPos.x, aheadFar.y - aheadPos.y);

  const bLen = Math.sqrt(tB.x * tB.x + tB.y * tB.y);
  const aLen = Math.sqrt(tA.x * tA.x + tA.y * tA.y);
  if (bLen < 0.001 || aLen < 0.001) return 1.0;

  const dot = tB.x * tA.x + tB.y * tA.y;
  const cosHalf = Math.sqrt(Math.max(0, (1 + dot) / 2));
  return Math.max(MIN_CORNER_COMPRESSION, cosHalf);
}
