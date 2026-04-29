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

function totalPathLength(pts: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return total;
}

export function drawEdgeRivets(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  seed: number
): void {
  const totalLen = totalPathLength(pts);
  const count = Math.max(3, Math.floor(totalLen / 22));

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

    const edgeOffset = 4.6 + seededRandom(seed + i * 41) * 0.8;
    const side = seededRandom(seed + i * 67) > 0.5 ? 1 : -1;
    const rx = px + nx * edgeOffset * side;
    const ry = py + ny * edgeOffset * side;
    const sz = 0.55 + seededRandom(seed + i * 97) * 0.4;

    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#3a2608";
    ctx.beginPath();
    ctx.arc(rx + 0.35, ry + 0.35, sz + 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#f0d06a";
    ctx.beginPath();
    ctx.arc(rx, ry, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draws perpendicular "brick seams" across the road — a dark shadow line
 * paired with a slight bright line ahead of it. Together they read as gaps
 * between paving stones, giving the flat gold band a cobbled look without
 * adding much draw cost.
 */
function drawBrickSeams(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  seed: number,
  halfWidth: number
): void {
  const totalLen = totalPathLength(pts);
  const spacing = 11;
  const count = Math.floor(totalLen / spacing);
  if (count < 2) {
    return;
  }

  ctx.save();
  ctx.lineCap = "butt";

  for (let i = 1; i < count; i++) {
    const t = i / count;
    const [px, py] = samplePoint(pts, t);
    const [ax, ay] = samplePoint(pts, Math.max(0.002, t - 0.004));
    const [bx, by] = samplePoint(pts, Math.min(0.998, t + 0.004));
    const tdx = bx - ax;
    const tdy = by - ay;
    const tLen = Math.hypot(tdx, tdy) || 1;
    const tx = tdx / tLen;
    const ty = tdy / tLen;
    const nx = -ty;
    const ny = tx;

    // Vary seam length slightly so the road doesn't look machine-printed.
    const jitter = 0.7 + seededRandom(seed + i * 113) * 0.5;
    const w = halfWidth * jitter;

    // Dark seam (the gap between two stones)
    ctx.strokeStyle = "rgba(52, 32, 8, 0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px - nx * w, py - ny * w);
    ctx.lineTo(px + nx * w, py + ny * w);
    ctx.stroke();

    // Bright bevel on the leading edge of the next stone
    ctx.strokeStyle = "rgba(255, 236, 160, 0.22)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(px + tx * 1 - nx * w, py + ty * 1 - ny * w);
    ctx.lineTo(px + tx * 1 + nx * w, py + ty * 1 + ny * w);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawGoldenPath(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  seed: number,
  time?: number
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 1. Wide diffuse halo — grounds the road into the terrain.
  traceCatmullRom(ctx, pts, 3, 5);
  ctx.strokeStyle = "rgba(0,0,0,0.16)";
  ctx.lineWidth = 16;
  ctx.stroke();

  // 2. Drop shadow — sharper near the road edge.
  traceCatmullRom(ctx, pts, 1.5, 2.5);
  ctx.strokeStyle = "rgba(0,0,0,0.38)";
  ctx.lineWidth = 12;
  ctx.stroke();

  // 3. Earthen bed — warm dark-brown shoulder beneath the pavers, like the
  //    road is slightly recessed into the dirt.
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.strokeStyle = "#2E1F0E";
  ctx.lineWidth = 11;
  ctx.stroke();

  // 4. Bronze outline — crisp border that defines the path silhouette.
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.strokeStyle = "#6E4A12";
  ctx.lineWidth = 9;
  ctx.stroke();

  // 5. Inner dark-bronze shadow lip — hints that the gold surface sits below
  //    the bronze rim (inset bevel).
  traceCatmullRom(ctx, pts, 0, 0.6);
  ctx.strokeStyle = "rgba(40, 22, 6, 0.35)";
  ctx.lineWidth = 7.5;
  ctx.stroke();

  // 6. Main gold body — slightly warmer / less neon than before.
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.strokeStyle = "#C49324";
  ctx.lineWidth = 7;
  ctx.stroke();

  // 7. Upper-left bevel highlight — offset up-left to fake a sun angle.
  traceCatmullRom(ctx, pts, -0.4, -0.6);
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#E6BA46";
  ctx.lineWidth = 4.5;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 8. Cobblestone seams — perpendicular brick lines with a subtle bevel.
  drawBrickSeams(ctx, pts, seed + 1700, 3.1);

  // 9. Thin bright spine — a faint worn centerline where carts would've run.
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#FFE796";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 10. Edge rivets / flecks — subtle metallic studs along the shoulders.
  drawEdgeRivets(ctx, pts, seed + 5000);

  // 11. Travelling orbs — glowing motes drifting along the road. Kept for
  //     the "active path" feel. Desktop gets a short trail.
  if (time != null) {
    const orbCount = 3;
    for (let orb = 0; orb < orbCount; orb++) {
      const dotPos = (time * 0.4 + orb * 0.33) % 1;
      const [ox, oy] = samplePoint(pts, dotPos);

      for (let trail = 1; trail <= 3; trail++) {
        const tt = Math.max(0, dotPos - trail * 0.012);
        const [tx, ty] = samplePoint(pts, tt);
        ctx.globalAlpha = 0.28 - trail * 0.07;
        ctx.fillStyle = "#FFE28A";
        ctx.beginPath();
        ctx.arc(tx, ty, 3 - trail * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 0.32;
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(ox, oy, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.95;
      ctx.fillStyle = "#FFE060";
      ctx.beginPath();
      ctx.arc(ox, oy, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFFAC8";
      ctx.beginPath();
      ctx.arc(ox - 0.6, oy - 0.6, 1.5, 0, Math.PI * 2);
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

  // Soft drop shadow (slightly blurred by stacking two offset strokes).
  traceCatmullRom(ctx, pts, 1.5, 2.5);
  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = lineWidth + 6;
  ctx.stroke();

  traceCatmullRom(ctx, pts, 0.5, 1.2);
  ctx.strokeStyle = "rgba(0,0,0,0.30)";
  ctx.lineWidth = lineWidth + 3;
  ctx.stroke();

  // Dark earthen bed — same grounding trick as the golden path so locked
  // roads feel like the same material, just unmaintained.
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.strokeStyle = "rgba(24, 16, 6, 0.55)";
  ctx.lineWidth = lineWidth + 2;
  ctx.stroke();

  // Dashed path — shorter dashes and a dimmer colour read as "disused trail".
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = 0.85;
  ctx.setLineDash([6, 7]);
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.stroke();

  // Thin bright highlight sitting on top of the dash for a little shine.
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#f4e8c8";
  ctx.lineWidth = Math.max(0.8, lineWidth * 0.35);
  ctx.setLineDash([3, 10]);
  traceCatmullRom(ctx, pts, 0, 0);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.restore();
}
