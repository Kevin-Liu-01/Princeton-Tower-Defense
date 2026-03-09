import { ISO_Y_RATIO } from "../../constants";
import { drawDirectionalShadow } from "./shadowHelpers";
import { TENTACLE_PALETTES, type TentaclePalette } from "./tentaclePalettes";

interface TentaclePoint {
  x: number;
  y: number;
  radius: number;
  angle: number;
}

// ── Shared helpers ──────────────────────────────────────────────

function getPalette(variant: number): TentaclePalette {
  return TENTACLE_PALETTES[variant % TENTACLE_PALETTES.length];
}

function getShapeIndex(decorX: number, decorY: number): number {
  const seed = Math.abs(decorX * 97 + decorY * 53);
  return seed % 5;
}

function seededRand(decorX: number, decorY: number, salt: number): number {
  const h = Math.abs(decorX * 73 + decorY * 41 + salt * 131);
  return ((Math.sin(h) * 43758.5453) % 1 + 1) % 1;
}

function drawWaterBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  decorTime: number,
  decorX: number,
  pal: TentaclePalette,
  holeWidth: number,
  holeDepth: number,
): void {
  const ripplePhase = decorTime * 1.2 + decorX;
  for (let r = 0; r < 3; r++) {
    const rippleFrac = (((ripplePhase + r * 0.8) % 2) + 2) % 2;
    const rippleSize = rippleFrac * 12 * s;
    const rippleAlpha = 0.25 * (1 - rippleFrac / 2);
    ctx.strokeStyle = `rgba(${pal.waterTint}, ${rippleAlpha})`;
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + 2 * s,
      holeWidth + rippleSize,
      holeDepth + rippleSize * ISO_Y_RATIO,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  const waterBlendGrad = ctx.createRadialGradient(
    x,
    y + 2 * s,
    holeWidth * 0.3,
    x,
    y + 2 * s,
    holeWidth + 10 * s,
  );
  waterBlendGrad.addColorStop(0, "rgba(20, 40, 60, 0.5)");
  waterBlendGrad.addColorStop(0.4, "rgba(30, 50, 70, 0.3)");
  waterBlendGrad.addColorStop(0.7, "rgba(40, 60, 80, 0.15)");
  waterBlendGrad.addColorStop(1, "transparent");
  ctx.fillStyle = waterBlendGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + 2 * s,
    holeWidth + 10 * s,
    (holeDepth + 5 * s) * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const holeGrad = ctx.createRadialGradient(x, y, 0, x, y + 2 * s, holeWidth * 0.9);
  holeGrad.addColorStop(0, "rgba(5, 2, 10, 0.9)");
  holeGrad.addColorStop(0.5, "rgba(15, 10, 25, 0.7)");
  holeGrad.addColorStop(0.8, "rgba(30, 25, 50, 0.4)");
  holeGrad.addColorStop(1, "transparent");
  ctx.fillStyle = holeGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + 2 * s, holeWidth, holeDepth, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(${pal.waterTint}, 0.35)`;
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + 1 * s,
    holeWidth * 0.7,
    holeDepth * 0.7,
    0,
    Math.PI * 0.9,
    Math.PI * 1.7,
  );
  ctx.stroke();

  ctx.fillStyle = `rgba(${pal.waterTint}, 0.15)`;
  for (let c = 0; c < 4; c++) {
    const causticAngle = (c / 4) * Math.PI * 2 + decorTime * 0.5;
    const causticDist = holeWidth * 0.6 + Math.sin(decorTime * 2 + c) * 3 * s;
    const cx = x + Math.cos(causticAngle) * causticDist;
    const cy = y + 2 * s + Math.sin(causticAngle) * causticDist * ISO_Y_RATIO;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 3 * s, 1.5 * s, causticAngle, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBubbles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  decorTime: number,
  decorX: number,
  count: number,
): void {
  ctx.fillStyle = "rgba(150, 180, 210, 0.5)";
  const bubbleTime = decorTime * 2.5 + decorX;
  for (let b = 0; b < count; b++) {
    const bubblePhase = (bubbleTime + b * 0.6) % 2.5;
    const bubbleY = y - bubblePhase * 15 * s;
    const bubbleX = x + Math.sin(bubbleTime * 2 + b * 1.5) * 5 * s;
    const bubbleSize = (1.5 - bubblePhase * 0.3) * s;
    if (bubblePhase < 2) {
      ctx.globalAlpha = 0.45 * (1 - bubblePhase / 2);
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function buildTentaclePath(
  cx: number,
  cy: number,
  s: number,
  segments: number,
  height: number,
  baseRadius: number,
  tipRadius: number,
  sway: number,
  secondarySway: number,
): TentaclePoint[] {
  const pts: TentaclePoint[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const curveX = cx + sway * t * t + secondarySway * Math.sin(t * Math.PI);
    const curveY = cy - height * s * t;
    const radius = (baseRadius - t * (baseRadius - tipRadius)) * s;
    const bendAngle = Math.sin(t * Math.PI * 0.8) * 0.4 + sway * 0.01;
    pts.push({ x: curveX, y: curveY, radius, angle: bendAngle });
  }
  return pts;
}

function drawTentacleBody(
  ctx: CanvasRenderingContext2D,
  pts: TentaclePoint[],
  s: number,
  decorTime: number,
  pal: TentaclePalette,
  baseX: number,
  baseY: number,
): void {
  const segments = pts.length - 1;

  const backGrad = ctx.createLinearGradient(
    baseX - 15 * s,
    baseY,
    baseX + 5 * s,
    baseY - 50 * s,
  );
  backGrad.addColorStop(0, pal.dark);
  backGrad.addColorStop(0.5, blendColor(pal.dark, pal.mid, 0.3));
  backGrad.addColorStop(1, pal.dark);

  ctx.fillStyle = backGrad;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i <= segments; i++) {
    const p = pts[i];
    const wobble = Math.sin(i * 0.6 + decorTime * 2.5) * 0.6 * s;
    ctx.lineTo(p.x + p.radius * 0.9 + wobble, p.y + p.radius * 0.3 * ISO_Y_RATIO);
  }
  const tipBack = pts[segments];
  ctx.quadraticCurveTo(
    tipBack.x + 3 * s,
    tipBack.y - 3 * s,
    tipBack.x,
    tipBack.y - 5 * s,
  );
  ctx.quadraticCurveTo(
    tipBack.x - 1 * s,
    tipBack.y - 3 * s,
    tipBack.x - tipBack.radius * 0.3,
    tipBack.y,
  );
  for (let i = segments; i >= 0; i--) {
    const p = pts[i];
    ctx.lineTo(p.x, p.y + p.radius * 0.5 * ISO_Y_RATIO);
  }
  ctx.closePath();
  ctx.fill();

  const frontGrad = ctx.createLinearGradient(
    baseX - 10 * s,
    baseY - 30 * s,
    baseX + 15 * s,
    baseY,
  );
  frontGrad.addColorStop(0, pal.light);
  frontGrad.addColorStop(0.3, pal.mid);
  frontGrad.addColorStop(0.7, pal.light);
  frontGrad.addColorStop(1, pal.mid);

  ctx.fillStyle = frontGrad;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i <= segments; i++) {
    const p = pts[i];
    const wobble = Math.sin(i * 0.6 + decorTime * 2.5 + 0.5) * 0.6 * s;
    ctx.lineTo(p.x - p.radius * 0.9 + wobble, p.y + p.radius * 0.3 * ISO_Y_RATIO);
  }
  const tipFront = pts[segments];
  ctx.quadraticCurveTo(
    tipFront.x - 2 * s,
    tipFront.y - 4 * s,
    tipFront.x,
    tipFront.y - 5 * s,
  );
  ctx.quadraticCurveTo(
    tipFront.x + 1 * s,
    tipFront.y - 2 * s,
    tipFront.x,
    tipFront.y,
  );
  for (let i = segments; i >= 0; i--) {
    const p = pts[i];
    ctx.lineTo(p.x, p.y + p.radius * 0.5 * ISO_Y_RATIO);
  }
  ctx.closePath();
  ctx.fill();

  drawHighlightStripe(ctx, pts, s, pal);
  drawMuscleLines(ctx, pts, s, decorTime, pal);
}

function drawHighlightStripe(
  ctx: CanvasRenderingContext2D,
  pts: TentaclePoint[],
  s: number,
  pal: TentaclePalette,
): void {
  const segments = pts.length - 1;
  ctx.strokeStyle = pal.highlight;
  ctx.lineWidth = 3.5 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 1; i < segments - 2; i++) {
    const p = pts[i];
    const hx = p.x - p.radius * 0.5;
    const hy = p.y + p.radius * 0.2 * ISO_Y_RATIO;
    if (i === 1) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.stroke();

  ctx.strokeStyle = hexToRgba(pal.highlight, 0.5);
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  for (let i = 2; i < segments - 3; i++) {
    const p = pts[i];
    const hx = p.x - p.radius * 0.7;
    const hy = p.y + p.radius * 0.1 * ISO_Y_RATIO;
    if (i === 2) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.stroke();
}

function drawMuscleLines(
  ctx: CanvasRenderingContext2D,
  pts: TentaclePoint[],
  s: number,
  decorTime: number,
  pal: TentaclePalette,
): void {
  const segments = pts.length - 1;
  ctx.strokeStyle = pal.dark;
  ctx.lineWidth = 1.2 * s;
  ctx.globalAlpha = 0.35;
  for (let v = 0; v < 3; v++) {
    ctx.beginPath();
    const offset = (v - 1) * 0.25;
    for (let i = 1; i < segments - 1; i++) {
      const p = pts[i];
      const vx = p.x + p.radius * offset;
      const vy = p.y + p.radius * 0.4 * ISO_Y_RATIO;
      if (i === 1) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawSuckers(
  ctx: CanvasRenderingContext2D,
  pts: TentaclePoint[],
  s: number,
  pal: TentaclePalette,
  suckerDefs: { t: number; size: number }[],
): void {
  const segments = pts.length - 1;
  for (const sp of suckerDefs) {
    const idx = Math.min(Math.floor(sp.t * segments), segments);
    const p = pts[idx];
    const sx = p.x - p.radius * 0.55;
    const sy = p.y + p.radius * 0.3 * ISO_Y_RATIO;
    const sz = sp.size * s;
    const isoRatio = 0.85;

    ctx.fillStyle = hexToRgba(pal.dark, 0.35);
    ctx.beginPath();
    ctx.ellipse(sx + 0.8 * s, sy + 0.6 * s, sz, sz * isoRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    const rimGrad = ctx.createRadialGradient(
      sx - sz * 0.2,
      sy - sz * 0.15,
      0,
      sx,
      sy,
      sz,
    );
    rimGrad.addColorStop(0, lightenHex(pal.suckerOuter, 0.15));
    rimGrad.addColorStop(0.5, pal.suckerOuter);
    rimGrad.addColorStop(1, blendColor(pal.suckerOuter, pal.suckerInner, 0.4));
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, sz, sz * isoRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    const innerGrad = ctx.createRadialGradient(
      sx - sz * 0.1,
      sy - sz * 0.08,
      0,
      sx,
      sy,
      sz * 0.7,
    );
    innerGrad.addColorStop(0, pal.suckerOuter);
    innerGrad.addColorStop(0.6, pal.suckerInner);
    innerGrad.addColorStop(1, pal.mid);
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, sz * 0.68, sz * 0.68 * isoRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pal.suckerDeep;
    ctx.beginPath();
    ctx.ellipse(sx, sy, sz * 0.32, sz * 0.32 * isoRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pal.suckerDarkest;
    ctx.beginPath();
    ctx.ellipse(sx, sy, sz * 0.15, sz * 0.15 * isoRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.ellipse(
      sx - sz * 0.3,
      sy - sz * 0.25 * isoRatio,
      sz * 0.18,
      sz * 0.12,
      -0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawSlimeDrip(
  ctx: CanvasRenderingContext2D,
  pts: TentaclePoint[],
  s: number,
  decorTime: number,
  decorX: number,
  pal: TentaclePalette,
): void {
  ctx.fillStyle = pal.slime;
  const dripPhase = (((decorTime * 0.6 + decorX) % 3) + 3) % 3;
  if (dripPhase < 1.8) {
    const dripPt = pts[Math.min(4, pts.length - 1)];
    const dripX = dripPt.x - dripPt.radius * 0.5;
    const dripY = dripPt.y + dripPhase * 8 * s;
    ctx.beginPath();
    ctx.ellipse(dripX, dripY, 1.5 * s, (2 + dripPhase) * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWetSheen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  decorTime: number,
  decorX: number,
): void {
  ctx.fillStyle = "rgba(100, 140, 180, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x - 3 * s, y - 5 * s, 5 * s, 2.5 * s * ISO_Y_RATIO, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(80, 120, 160, 0.2)";
  const dripTime = decorTime * 0.8 + decorX * 0.5;
  for (let d = 0; d < 2; d++) {
    const dripOffset = (dripTime + d * 1.2) % 2;
    if (dripOffset < 1.5) {
      const dy = y - 12 * s + dripOffset * 8 * s;
      const dx = x + (d - 0.5) * 6 * s;
      ctx.beginPath();
      ctx.ellipse(dx, dy, 1.2 * s, (1.5 + dripOffset * 0.5) * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── Color utilities ─────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lightenHex(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 255 * amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 255 * amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 255 * amount);
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

function blendColor(hexA: string, hexB: string, t: number): string {
  const rA = parseInt(hexA.slice(1, 3), 16);
  const gA = parseInt(hexA.slice(3, 5), 16);
  const bA = parseInt(hexA.slice(5, 7), 16);
  const rB = parseInt(hexB.slice(1, 3), 16);
  const gB = parseInt(hexB.slice(3, 5), 16);
  const bB = parseInt(hexB.slice(5, 7), 16);
  const r = Math.round(rA + (rB - rA) * t);
  const g = Math.round(gA + (gB - gA) * t);
  const b = Math.round(bA + (bB - bA) * t);
  return `rgb(${r},${g},${b})`;
}

// ── Default sucker layout ───────────────────────────────────────

const STANDARD_SUCKERS = [
  { t: 0.12, size: 5.5 },
  { t: 0.22, size: 5 },
  { t: 0.32, size: 4.5 },
  { t: 0.42, size: 4 },
  { t: 0.52, size: 3.5 },
  { t: 0.62, size: 3 },
  { t: 0.72, size: 2.5 },
  { t: 0.82, size: 2 },
];

const SMALL_SUCKERS = [
  { t: 0.18, size: 3.5 },
  { t: 0.32, size: 3 },
  { t: 0.48, size: 2.5 },
  { t: 0.64, size: 2 },
  { t: 0.78, size: 1.5 },
];

// ── Shape 0: Classic single tentacle ────────────────────────────

function drawClassicTentacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  decorTime: number,
  decorX: number,
  decorY: number,
  pal: TentaclePalette,
): void {
  const sway = Math.sin(decorTime * 1.5 + decorX) * 12 * s;
  const secondarySway = Math.cos(decorTime * 2.3 + decorX * 1.5) * 6 * s;
  const holeW = 18 * s;
  const holeD = 9 * s;

  drawWaterBase(ctx, x, y, s, decorTime, decorX, pal, holeW, holeD);
  drawBubbles(ctx, x, y, s, decorTime, decorX, 4);

  const pts = buildTentaclePath(cx(x), cy(y), s, 14, 65, 12, 2.5, sway, secondarySway);

  drawDirectionalShadow(ctx, x + 10 * s, y + 10 * s, s, 28 * s, 14 * s, 60 * s, 0.25, "26,15,33");

  drawTentacleBody(ctx, pts, s, decorTime, pal, x, y);
  drawSuckers(ctx, pts, s, pal, STANDARD_SUCKERS);
  drawSlimeDrip(ctx, pts, s, decorTime, decorX, pal);
  drawWetSheen(ctx, x, y, s, decorTime, decorX);
}

// ── Shape 1: Forked tentacle (splits near tip) ─────────────────

function drawForkedTentacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  decorTime: number,
  decorX: number,
  decorY: number,
  pal: TentaclePalette,
): void {
  const sway = Math.sin(decorTime * 1.3 + decorX) * 10 * s;
  const secondarySway = Math.cos(decorTime * 2.0 + decorX * 1.3) * 5 * s;
  const holeW = 20 * s;
  const holeD = 10 * s;

  drawWaterBase(ctx, x, y, s, decorTime, decorX, pal, holeW, holeD);
  drawBubbles(ctx, x, y, s, decorTime, decorX, 5);

  const mainPts = buildTentaclePath(x, y, s, 10, 50, 13, 5, sway, secondarySway);

  drawDirectionalShadow(ctx, x + 10 * s, y + 10 * s, s, 30 * s, 15 * s, 55 * s, 0.25, "26,15,33");

  drawTentacleBody(ctx, mainPts, s, decorTime, pal, x, y);

  const forkBase = mainPts[mainPts.length - 1];
  const forkSpread = 14 * s;

  const leftSway = Math.sin(decorTime * 2.0 + decorX + 1.0) * 6 * s;
  const leftPts = buildTentaclePath(
    forkBase.x - forkSpread * 0.3,
    forkBase.y,
    s,
    6,
    25,
    5,
    1.5,
    leftSway - forkSpread * 0.5,
    Math.cos(decorTime * 2.5 + decorX) * 3 * s,
  );
  drawTentacleBody(ctx, leftPts, s, decorTime, pal, forkBase.x - forkSpread * 0.3, forkBase.y);
  drawSuckers(ctx, leftPts, s, pal, SMALL_SUCKERS);

  const rightSway = Math.sin(decorTime * 2.0 + decorX + 2.5) * 6 * s;
  const rightPts = buildTentaclePath(
    forkBase.x + forkSpread * 0.3,
    forkBase.y,
    s,
    6,
    25,
    5,
    1.5,
    rightSway + forkSpread * 0.5,
    Math.cos(decorTime * 2.5 + decorX + 1.5) * 3 * s,
  );
  drawTentacleBody(ctx, rightPts, s, decorTime, pal, forkBase.x + forkSpread * 0.3, forkBase.y);
  drawSuckers(ctx, rightPts, s, pal, SMALL_SUCKERS);

  drawSuckers(ctx, mainPts, s, pal, [
    { t: 0.15, size: 5 },
    { t: 0.3, size: 4.5 },
    { t: 0.5, size: 4 },
    { t: 0.7, size: 3.5 },
  ]);
  drawSlimeDrip(ctx, mainPts, s, decorTime, decorX, pal);
  drawWetSheen(ctx, x, y, s, decorTime, decorX);
}

// ── Shape 2: Thin whip tentacle (tall, thin, more dynamic) ─────

function drawWhipTentacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  decorTime: number,
  decorX: number,
  decorY: number,
  pal: TentaclePalette,
): void {
  const sway = Math.sin(decorTime * 2.2 + decorX) * 18 * s;
  const secondarySway = Math.cos(decorTime * 3.0 + decorX * 1.7) * 10 * s;
  const holeW = 14 * s;
  const holeD = 7 * s;

  drawWaterBase(ctx, x, y, s, decorTime, decorX, pal, holeW, holeD);
  drawBubbles(ctx, x, y, s, decorTime, decorX, 3);

  const pts = buildTentaclePath(x, y, s, 18, 85, 8, 1.2, sway, secondarySway);

  drawDirectionalShadow(ctx, x + 8 * s, y + 8 * s, s, 20 * s, 10 * s, 75 * s, 0.2, "26,15,33");

  drawTentacleBody(ctx, pts, s, decorTime, pal, x, y);

  const whipSuckers = [
    { t: 0.1, size: 3.5 },
    { t: 0.2, size: 3 },
    { t: 0.3, size: 2.8 },
    { t: 0.4, size: 2.5 },
    { t: 0.5, size: 2.2 },
    { t: 0.6, size: 2 },
    { t: 0.7, size: 1.7 },
    { t: 0.8, size: 1.4 },
    { t: 0.88, size: 1.1 },
  ];
  drawSuckers(ctx, pts, s, pal, whipSuckers);

  ctx.strokeStyle = hexToRgba(pal.highlight, 0.6);
  ctx.lineWidth = 1.5 * s;
  ctx.setLineDash([3 * s, 4 * s]);
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const px = p.x + p.radius * 0.4;
    const py = p.y;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  drawSlimeDrip(ctx, pts, s, decorTime, decorX, pal);
  drawWetSheen(ctx, x, y, s, decorTime, decorX);
}

// ── Shape 3: Coiled tentacle (spiral curl) ─────────────────────

function drawCoiledTentacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  decorTime: number,
  decorX: number,
  decorY: number,
  pal: TentaclePalette,
): void {
  const sway = Math.sin(decorTime * 1.0 + decorX) * 6 * s;
  const holeW = 22 * s;
  const holeD = 11 * s;

  drawWaterBase(ctx, x, y, s, decorTime, decorX, pal, holeW, holeD);
  drawBubbles(ctx, x, y, s, decorTime, decorX, 6);

  drawDirectionalShadow(ctx, x + 12 * s, y + 12 * s, s, 32 * s, 16 * s, 50 * s, 0.25, "26,15,33");

  const segments = 20;
  const pts: TentaclePoint[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const spiralAngle = t * Math.PI * 3.5 + decorTime * 0.5;
    const spiralRadius = (18 - t * 16) * s;
    const curveX =
      x + Math.cos(spiralAngle) * spiralRadius + sway * t;
    const curveY =
      y - 55 * s * t + Math.sin(spiralAngle) * spiralRadius * ISO_Y_RATIO * 0.5;
    const radius = (11 - t * 8.5) * s;
    pts.push({ x: curveX, y: curveY, radius, angle: spiralAngle });
  }

  drawTentacleBody(ctx, pts, s, decorTime, pal, x, y);
  drawSuckers(ctx, pts, s, pal, STANDARD_SUCKERS);

  ctx.fillStyle = hexToRgba(pal.highlight, 0.3);
  for (let i = 0; i < 5; i++) {
    const t = 0.2 + i * 0.15;
    const idx = Math.min(Math.floor(t * segments), segments);
    const p = pts[idx];
    ctx.beginPath();
    ctx.ellipse(
      p.x + p.radius * 0.3,
      p.y - p.radius * 0.2,
      p.radius * 0.4,
      p.radius * 0.2 * ISO_Y_RATIO,
      0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  drawSlimeDrip(ctx, pts, s, decorTime, decorX, pal);
  drawWetSheen(ctx, x, y, s, decorTime, decorX);
}

// ── Shape 4: Multi-arm cluster (2–3 arms from one base) ────────

function drawClusterTentacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  decorTime: number,
  decorX: number,
  decorY: number,
  pal: TentaclePalette,
): void {
  const armCount = 2 + Math.floor(seededRand(decorX, decorY, 77) * 2); // 2 or 3
  const holeW = 24 * s;
  const holeD = 12 * s;

  drawWaterBase(ctx, x, y, s, decorTime, decorX, pal, holeW, holeD);
  drawBubbles(ctx, x, y, s, decorTime, decorX, 5 + armCount);

  drawDirectionalShadow(ctx, x + 12 * s, y + 12 * s, s, 34 * s, 17 * s, 55 * s, 0.28, "26,15,33");

  for (let a = 0; a < armCount; a++) {
    const angleOffset = ((a - (armCount - 1) / 2) / Math.max(armCount - 1, 1)) * 0.9;
    const armSway =
      Math.sin(decorTime * (1.4 + a * 0.3) + decorX + a * 2.1) * (10 + a * 3) * s;
    const armSecondary =
      Math.cos(decorTime * (2.1 + a * 0.2) + decorX * 1.3 + a * 1.7) * 5 * s;

    const armHeight = 50 + seededRand(decorX, decorY, a * 10) * 20;
    const armBaseR = 8 + seededRand(decorX, decorY, a * 10 + 1) * 3;
    const armTipR = 1.5 + seededRand(decorX, decorY, a * 10 + 2) * 1;

    const offsetX = angleOffset * 12 * s;
    const pts = buildTentaclePath(
      x + offsetX,
      y,
      s,
      12,
      armHeight,
      armBaseR,
      armTipR,
      armSway,
      armSecondary,
    );

    drawTentacleBody(ctx, pts, s, decorTime, pal, x + offsetX, y);
    drawSuckers(ctx, pts, s, pal, SMALL_SUCKERS);
    drawSlimeDrip(ctx, pts, s, decorTime, decorX + a, pal);
  }

  drawWetSheen(ctx, x, y, s, decorTime, decorX);
}

// cx/cy identity helpers – kept for readability in classic shape
function cx(v: number): number {
  return v;
}
function cy(v: number): number {
  return v;
}

// ── Public entry point ──────────────────────────────────────────

export function drawTentacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  variant: number,
  decorX: number,
  decorY: number,
  decorTime: number,
): void {
  const pal = getPalette(variant);
  const shape = getShapeIndex(decorX, decorY);

  switch (shape) {
    case 0:
      drawClassicTentacle(ctx, x, y, s, decorTime, decorX, decorY, pal);
      break;
    case 1:
      drawForkedTentacle(ctx, x, y, s, decorTime, decorX, decorY, pal);
      break;
    case 2:
      drawWhipTentacle(ctx, x, y, s, decorTime, decorX, decorY, pal);
      break;
    case 3:
      drawCoiledTentacle(ctx, x, y, s, decorTime, decorX, decorY, pal);
      break;
    case 4:
      drawClusterTentacle(ctx, x, y, s, decorTime, decorX, decorY, pal);
      break;
    default:
      drawClassicTentacle(ctx, x, y, s, decorTime, decorX, decorY, pal);
      break;
  }
}
