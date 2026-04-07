import { seededRandom } from "../worldMapUtils";

export function drawGrassTuft(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  color: string,
  time: number
) {
  ctx.fillStyle = color;
  const blades = 3 + Math.floor(seededRandom(x + y) * 4);
  for (let blade = 0; blade < blades; blade++) {
    const bladeX = x + (blade - blades / 2) * 2 * scale;
    const bladeHeight = (6 + seededRandom(x + blade) * 6) * scale;
    const sway = Math.sin(time * 2 + x * 0.1 + blade) * 1.5;
    ctx.beginPath();
    ctx.moveTo(bladeX, y);
    ctx.quadraticCurveTo(
      bladeX + sway,
      y - bladeHeight * 0.6,
      bladeX + sway * 1.5,
      y - bladeHeight
    );
    ctx.quadraticCurveTo(bladeX + sway * 0.5, y - bladeHeight * 0.4, bladeX, y);
    ctx.fill();
  }
}

function borderNoise(y: number, seed: number): number {
  let offset = 0;
  // Large sweeping curves (coastline-scale)
  offset += Math.sin(y * 0.02 + seed * 0.31) * 27;
  offset += Math.sin(y * 0.044 + seed * 0.73 + 1.5) * 17;
  // Medium features — bays and peninsulas
  offset += Math.sin(y * 0.092 + seed * 0.11) * 10;
  offset += Math.cos(y * 0.145 + seed * 0.52) * 7;
  // Small rough edges
  offset += Math.sin(y * 0.29 + seed * 1.3) * 3.5;
  offset += Math.cos(y * 0.52 + seed * 0.83) * 2;
  // Per-point random jitter for irregularity
  offset += (seededRandom(y * 7.3 + seed * 31) - 0.5) * 13;
  offset += (seededRandom(y * 13.7 + seed * 53) - 0.5) * 6.5;
  return offset;
}

export function generateOrganicBorderPoints(
  x: number,
  height: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const step = 4;
  const seed = x * 0.37 + 17;

  for (let y = -step; y <= height + step; y += step) {
    const offset = borderNoise(y, seed);
    points.push({ x: x + offset, y });
  }

  return points;
}

function traceOrganicPath(
  ctx: CanvasRenderingContext2D,
  points: readonly { x: number; y: number }[]
) {
  if (points.length < 2) {
    return;
  }

  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const cur = points[i];
    const next = points[i + 1];
    const mx = (cur.x + next.x) / 2;
    const my = (cur.y + next.y) / 2;
    ctx.quadraticCurveTo(cur.x, cur.y, mx, my);
  }

  const last = points.at(-1);
  ctx.lineTo(last.x, last.y);
}

function drawBorderScatter(
  ctx: CanvasRenderingContext2D,
  points: readonly { x: number; y: number }[],
  region1Color: string,
  region2Color: string
) {
  const step = 8;
  for (let i = 0; i < points.length; i += step) {
    const pt = points[i];
    const rSeed = pt.x * 3.7 + pt.y * 11.3;

    // Small terrain blobs that straddle the border
    const blobCount = 2 + Math.floor(seededRandom(rSeed) * 3);
    for (let b = 0; b < blobCount; b++) {
      const bSeed = rSeed + b * 47;
      const bx = pt.x + (seededRandom(bSeed) - 0.5) * 40;
      const by = pt.y + (seededRandom(bSeed + 1) - 0.5) * 6;
      const bw = 3 + seededRandom(bSeed + 2) * 10;
      const bh = bw * (0.3 + seededRandom(bSeed + 3) * 0.35);
      const rot = seededRandom(bSeed + 4) * Math.PI;
      const isLeft = bx < pt.x;
      const color = isLeft ? region1Color : region2Color;

      ctx.globalAlpha = 0.04 + seededRandom(bSeed + 5) * 0.04;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(bx, by, bw, bh, rot, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scattered pebbles / soil marks near the border
    if (seededRandom(rSeed + 99) > 0.5) {
      const px = pt.x + (seededRandom(rSeed + 100) - 0.5) * 24;
      const py = pt.y + (seededRandom(rSeed + 101) - 0.5) * 4;
      const ps = 1 + seededRandom(rSeed + 102) * 2.5;
      ctx.globalAlpha = 0.08;
      ctx.fillStyle =
        seededRandom(rSeed + 103) > 0.5 ? region1Color : region2Color;
      ctx.beginPath();
      ctx.arc(px, py, ps, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function drawRuggedBorder(
  ctx: CanvasRenderingContext2D,
  height: number,
  x: number,
  _region1Color: string,
  _region2Color: string
) {
  ctx.save();

  const pathPoints = generateOrganicBorderPoints(x, height);

  // --- Terrain scatter detail along the border ---
  drawBorderScatter(ctx, pathPoints, _region1Color, _region2Color);

  // --- Border stroke (dark shadow + faint highlight) ---
  ctx.beginPath();
  traceOrganicPath(ctx, pathPoints);
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.beginPath();
  traceOrganicPath(ctx, pathPoints);
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.restore();
}
