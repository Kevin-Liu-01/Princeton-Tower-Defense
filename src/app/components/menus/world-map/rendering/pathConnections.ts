import { seededRandom } from "../worldMapUtils";
import { CONNECTION_OVERRIDES, type LevelNode } from "../worldMapData";
import {
  traceCatmullRom,
  samplePoint,
  drawGoldenPath,
  drawLockedPath,
} from "./pathDrawing";

export interface PathConnectionsParams {
  ctx: CanvasRenderingContext2D;
  allLevels: LevelNode[];
  getLevelY: (pct: number) => number;
  getLevelById: (id: string) => LevelNode | undefined;
  isLevelUnlocked: (id: string) => boolean;
  height: number;
  time: number;
  isMobile: boolean;
}

const LOCKED_PATH_COLORS: Record<
  string,
  { partial: string; locked: string }
> = {
  grassland: { partial: "#9a8a72", locked: "#6a5e44" },
  swamp: { partial: "#7a9a7a", locked: "#4e6a4e" },
  desert: { partial: "#c4a878", locked: "#9a7e52" },
  winter: { partial: "#8aa8c4", locked: "#5a7a98" },
  volcanic: { partial: "#b07060", locked: "#7a4838" },
};

function hashConnectionSeed(fromId: string, toId: string): number {
  return `${fromId}->${toId}`
    .split("")
    .reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7);
}

/**
 * Generates intermediate waypoints between two level nodes to create
 * natural, winding paths. Uses a blend of arch and S-curve displacement
 * with per-waypoint jitter for organic variation.
 */
function generateWaypoints(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  seed: number,
  mapHeight: number,
  flip: boolean = false,
): [number, number][] {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy);

  if (dist < 20) return [[fromX, fromY], [toX, toY]];

  const angle = Math.atan2(dy, dx);
  const perpX = -Math.sin(angle);
  const perpY = Math.cos(angle);

  const numPts = dist < 80 ? 2 : dist < 160 ? 3 : dist < 280 ? 4 : 5;
  const maxDisp = Math.min(42, Math.max(12, dist * 0.15));

  const archWeight = 0.3 + seededRandom(seed + 3) * 0.7;
  const sCurveWeight = seededRandom(seed + 7) * 0.5;

  const midY = (fromY + toY) / 2;
  const edgeBias =
    midY < mapHeight * 0.35 ? 1 : midY > mapHeight * 0.65 ? -1 : 0;
  const baseDir = seededRandom(seed + 11) > 0.5 ? 1 : -1;
  const flipMul = flip ? -1 : 1;
  const direction =
    (edgeBias !== 0
      ? seededRandom(seed + 13) < 0.65
        ? edgeBias
        : baseDir
      : baseDir) * flipMul;

  const points: [number, number][] = [[fromX, fromY]];

  for (let i = 1; i <= numPts; i++) {
    const t = i / (numPts + 1);
    const baseX = fromX + dx * t;
    const baseY = fromY + dy * t;

    const archVal = Math.sin(Math.PI * t);
    const sVal = Math.sin(2 * Math.PI * t);
    const smoothDisp =
      (archVal * archWeight + sVal * sCurveWeight) * maxDisp * direction;

    const jitter = (seededRandom(seed + i * 137) - 0.5) * maxDisp * 0.35;
    const alongJitter = (seededRandom(seed + i * 251) - 0.5) * 8;

    points.push([
      baseX + perpX * (smoothDisp + jitter) + Math.cos(angle) * alongJitter,
      baseY + perpY * (smoothDisp + jitter) + Math.sin(angle) * alongJitter,
    ]);
  }

  points.push([toX, toY]);
  return points;
}

export function drawPathConnections({
  ctx,
  allLevels,
  getLevelY,
  getLevelById,
  isLevelUnlocked,
  height,
  time,
  isMobile,
}: PathConnectionsParams): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  allLevels.forEach((level) => {
    const fromX = level.x;
    const fromY = getLevelY(level.y);

    level.connectsTo.forEach((toId) => {
      const toLevel = getLevelById(toId);
      if (!toLevel) return;

      const toX = toLevel.x;
      const toY = getLevelY(toLevel.y);
      const isUnlocked = isLevelUnlocked(level.id) && isLevelUnlocked(toId);
      const isPartial = isLevelUnlocked(level.id) || isLevelUnlocked(toId);

      const seed = hashConnectionSeed(level.id, toId);
      const connKey = `${level.id}->${toId}`;
      const override = CONNECTION_OVERRIDES[connKey];
      const pts = generateWaypoints(
        fromX, fromY, toX, toY, seed, height, override?.flip,
      );

      if (isUnlocked) {
        drawGoldenPath(ctx, pts, seed, isMobile, time);
      } else {
        const lockedColors =
          LOCKED_PATH_COLORS[level.region] ?? LOCKED_PATH_COLORS.grassland;
        drawLockedPath(
          ctx,
          pts,
          isPartial ? lockedColors.partial : lockedColors.locked,
          isPartial ? 6 : 4,
        );
      }
    });
  });
}
