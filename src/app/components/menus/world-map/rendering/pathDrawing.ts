import { seededRandom } from "../worldMapUtils";

export const SPLINE_TENSION = 0.32;

export function traceCatmullRom(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  ox: number,
  oy: number
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
      p2[1] + oy
    );
  }
}

export function samplePoint(
  pts: [number, number][],
  t: number
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

export function drawEdgeRivets(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  seed: number
): void {
  const totalLen = pts.reduce((sum, p, i) => {
    if (i === 0) {
      return 0;
    }
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

export function drawGoldenPath(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  seed: number,
  isMobile: boolean,
  time?: number
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Shadow
  traceCatmullRom(ctx, pts, 2, 3);
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 12;
  ctx.stroke();

  // Dark border
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.strokeStyle = "#8B6914";
  ctx.lineWidth = 10;
  ctx.stroke();

  // Gold body
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.strokeStyle = "#D4A828";
  ctx.lineWidth = 7;
  ctx.stroke();

  // Highlight center
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.strokeStyle = "#F0C840";
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Edge rivets
  if (!isMobile) {
    drawEdgeRivets(ctx, pts, seed + 5000);
  }

  // Travelling orbs
  if (time != null) {
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
  }

  ctx.restore();
}

export function drawLockedPath(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  color: string,
  lineWidth: number
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Shadow
  traceCatmullRom(ctx, pts, 1, 2);
  ctx.strokeStyle = "rgba(0,0,0,0.30)";
  ctx.lineWidth = lineWidth + 4;
  ctx.stroke();

  // Dashed path
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([8, 6]);
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}
