import { seededRandom } from "../worldMapUtils";
import { CONNECTION_OVERRIDES, type LevelNode } from "../worldMapData";

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

const SPLINE_TENSION = 0.32;

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

  // Blend between single arch and S-curve shape
  const archWeight = 0.3 + seededRandom(seed + 3) * 0.7;
  const sCurveWeight = seededRandom(seed + 7) * 0.5;

  // Push paths toward map center when near edges
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

function traceCatmullRom(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  ox: number,
  oy: number,
): void {
  ctx.beginPath();
  ctx.moveTo(pts[0][0] + ox, pts[0][1] + oy);

  if (pts.length === 2) {
    ctx.lineTo(pts[1][0] + ox, pts[1][1] + oy);
    return;
  }

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[Math.min(pts.length - 1, i + 1)];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) * SPLINE_TENSION + ox,
      p1[1] + (p2[1] - p0[1]) * SPLINE_TENSION + oy,
      p2[0] - (p3[0] - p1[0]) * SPLINE_TENSION + ox,
      p2[1] - (p3[1] - p1[1]) * SPLINE_TENSION + oy,
      p2[0] + ox,
      p2[1] + oy,
    );
  }
}

function samplePoint(
  pts: [number, number][],
  t: number,
): [number, number] {
  const segs = pts.length - 1;
  const raw = Math.max(0, Math.min(segs, t * segs));
  const idx = Math.min(Math.floor(raw), segs - 1);
  const lt = raw - idx;
  const mt = 1 - lt;

  const p0 = pts[Math.max(0, idx - 1)];
  const p1 = pts[idx];
  const p2 = pts[Math.min(pts.length - 1, idx + 1)];
  const p3 = pts[Math.min(pts.length - 1, idx + 2)];

  const cx1 = p1[0] + (p2[0] - p0[0]) * SPLINE_TENSION;
  const cy1 = p1[1] + (p2[1] - p0[1]) * SPLINE_TENSION;
  const cx2 = p2[0] - (p3[0] - p1[0]) * SPLINE_TENSION;
  const cy2 = p2[1] - (p3[1] - p1[1]) * SPLINE_TENSION;

  return [
    mt * mt * mt * p1[0] +
      3 * mt * mt * lt * cx1 +
      3 * mt * lt * lt * cx2 +
      lt * lt * lt * p2[0],
    mt * mt * mt * p1[1] +
      3 * mt * mt * lt * cy1 +
      3 * mt * lt * lt * cy2 +
      lt * lt * lt * p2[1],
  ];
}

function drawEdgeRivets(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  seed: number,
): void {
  const totalLen = pts.reduce((sum, p, i) => {
    if (i === 0) return 0;
    return sum + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
  }, 0);
  const count = Math.max(3, Math.floor(totalLen / 18));

  for (let i = 1; i < count; i++) {
    const t = i / count;
    const [px, py] = samplePoint(pts, t);

    const [ax, ay] = samplePoint(pts, Math.max(0, t - 0.01));
    const [bx, by] = samplePoint(pts, Math.min(1, t + 0.01));
    const tdx = bx - ax;
    const tdy = by - ay;
    const tLen = Math.hypot(tdx, tdy) || 1;
    const nx = -tdy / tLen;
    const ny = tdx / tLen;

    const edgeOffset = 4.2 + seededRandom(seed + i * 41) * 0.8;
    const side = seededRandom(seed + i * 67) > 0.5 ? 1 : -1;
    const rx = px + nx * edgeOffset * side;
    const ry = py + ny * edgeOffset * side;
    const sz = 0.5 + seededRandom(seed + i * 97) * 0.4;

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#705510";
    ctx.beginPath();
    ctx.arc(rx + 0.3, ry + 0.3, sz + 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#E8C030";
    ctx.beginPath();
    ctx.arc(rx, ry, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
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
        traceCatmullRom(ctx, pts, 2, 3);
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 12;
        ctx.stroke();
      } else {
        traceCatmullRom(ctx, pts, 1, 2);
        ctx.strokeStyle = "rgba(0,0,0,0.30)";
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      if (isUnlocked) {
        traceCatmullRom(ctx, pts, 0, 0);
        ctx.strokeStyle = "#8B6914";
        ctx.lineWidth = 10;
        ctx.stroke();

        traceCatmullRom(ctx, pts, 0, 0);
        ctx.strokeStyle = "#D4A828";
        ctx.lineWidth = 7;
        ctx.stroke();

        traceCatmullRom(ctx, pts, 0, 0);
        ctx.strokeStyle = "#F0C840";
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (!isMobile) {
          drawEdgeRivets(ctx, pts, seed + 5000);
        }

        const orbCount = isMobile ? 1 : 3;
        for (let orb = 0; orb < orbCount; orb++) {
          const dotPos = (time * 0.4 + orb * 0.33) % 1;
          const [ox, oy] = samplePoint(pts, dotPos);

          ctx.fillStyle = "#ffd700";
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(ox, oy, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = 0.9;
          ctx.fillStyle = "#FFE060";
          ctx.beginPath();
          ctx.arc(ox, oy, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#FFFAC0";
          ctx.beginPath();
          ctx.arc(ox - 0.5, oy - 0.5, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      } else {
        const lockedColors =
          LOCKED_PATH_COLORS[level.region] ?? LOCKED_PATH_COLORS.grassland;
        ctx.strokeStyle = isPartial
          ? lockedColors.partial
          : lockedColors.locked;
        ctx.lineWidth = isPartial ? 6 : 4;
        ctx.setLineDash([8, 6]);
        traceCatmullRom(ctx, pts, 0, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  });
}
