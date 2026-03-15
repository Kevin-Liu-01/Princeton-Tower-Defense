import { createSeededRandom } from "../../utils/seededRandom";
import { hexToRgba } from "../../utils";

type ChallengeThemeKey =
  | "grassland"
  | "swamp"
  | "desert"
  | "winter"
  | "volcanic";

interface BackdropPalette {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  haze: string;
  farRidge: string;
  midRidge: string;
  nearRidge: string;
  mountainTop: string;
  mountainLeft: string;
  mountainRight: string;
  mountainFacetA: string;
  mountainFacetB: string;
  mountainShadow: string;
  landHighlight: string;
  skyAccent: string;
  skyDecor: string;
  mountainSnow?: string;
}

// ─── shared helpers ──────────────────────────────────────────────

function smoothFill(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
): void {
  if (pts.length < 2) return;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const cpx = (pts[i].x + pts[i + 1].x) / 2;
    const cpy = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpx, cpy);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
}

function drawMistBand(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  thickness: number,
  color: string,
  alpha: number,
): void {
  const grad = ctx.createLinearGradient(0, y - thickness, 0, y + thickness);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.4, hexToRgba(color, alpha * 0.5));
  grad.addColorStop(0.5, hexToRgba(color, alpha));
  grad.addColorStop(0.6, hexToRgba(color, alpha * 0.5));
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(-20, y - thickness, width + 40, thickness * 2);
}

// ═══════════════════════════════════════════════════════════════════
// SWAMP — dense jungle canopy with massive trees
// ═══════════════════════════════════════════════════════════════════

function drawCanopyBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rand: () => number,
): void {
  const bumps = 5 + Math.floor(rand() * 4);
  ctx.beginPath();
  for (let i = 0; i <= bumps * 2; i++) {
    const angle = (i / (bumps * 2)) * Math.PI * 2;
    const bumpR = 1 + rand() * 0.15;
    const px = cx + Math.cos(angle) * rx * bumpR;
    const py = cy + Math.sin(angle) * ry * bumpR;
    if (i === 0) ctx.moveTo(px, py);
    else {
      const prevAngle = ((i - 0.5) / (bumps * 2)) * Math.PI * 2;
      const cpx = cx + Math.cos(prevAngle) * rx * (1 + rand() * 0.08);
      const cpy = cy + Math.sin(prevAngle) * ry * (1 + rand() * 0.08);
      ctx.quadraticCurveTo(cpx, cpy, px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}

function drawTrunkWithRoots(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  bottomY: number,
  trunkW: number,
  rand: () => number,
): void {
  const lean = (rand() - 0.5) * trunkW * 0.3;
  ctx.beginPath();
  ctx.moveTo(x - trunkW * 0.5, topY);
  ctx.bezierCurveTo(
    x - trunkW * 0.4 + lean * 0.5, (topY + bottomY) * 0.5,
    x - trunkW * 0.7, bottomY - (bottomY - topY) * 0.15,
    x - trunkW * 1.2, bottomY,
  );
  ctx.lineTo(x + trunkW * 1.2, bottomY);
  ctx.bezierCurveTo(
    x + trunkW * 0.7, bottomY - (bottomY - topY) * 0.15,
    x + trunkW * 0.4 + lean * 0.5, (topY + bottomY) * 0.5,
    x + trunkW * 0.5, topY,
  );
  ctx.closePath();
  ctx.fill();
}

function drawHangingVines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  count: number,
  spread: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.6;
  for (let i = 0; i < count; i++) {
    const sx = x + (rand() - 0.5) * spread;
    const vineLen = length * (0.4 + rand() * 0.6);
    ctx.globalAlpha = 0.15 + rand() * 0.1;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.bezierCurveTo(
      sx + (rand() - 0.5) * 6, y + vineLen * 0.3,
      sx + (rand() - 0.5) * 8, y + vineLen * 0.6,
      sx + (rand() - 0.5) * 4, y + vineLen,
    );
    ctx.stroke();
  }
  ctx.restore();
}

export function renderSwampBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette,
): void {
  const rand = createSeededRandom(seed + 3000);
  const bottomY = height;

  // far canopy layer — dense overlapping blobs
  ctx.fillStyle = pal.farRidge;
  for (let i = 0; i < 12; i++) {
    const cx = (rand() - 0.1) * width * 1.2;
    const cy = height * (0.22 + rand() * 0.06);
    const rx = 30 + rand() * 50;
    const ry = 15 + rand() * 25;
    drawCanopyBlob(ctx, cx, cy, rx, ry, rand);
  }

  drawMistBand(ctx, width, height * 0.29, height * 0.02, pal.skyBottom, 0.06);

  // mid tree layer — trees with trunks and canopies
  const midTreeCount = 6 + Math.floor(rand() * 3);
  for (let i = 0; i < midTreeCount; i++) {
    const tx = -width * 0.05 + rand() * width * 1.1;
    const trunkTop = height * (0.25 + rand() * 0.08);
    const trunkW = 4 + rand() * 6;

    ctx.fillStyle = pal.midRidge;
    drawTrunkWithRoots(ctx, tx, trunkTop, bottomY, trunkW, rand);

    ctx.fillStyle = pal.midRidge;
    const canopyY = trunkTop - 5 - rand() * 15;
    const canopyRx = 20 + rand() * 35;
    const canopyRy = 12 + rand() * 18;
    drawCanopyBlob(ctx, tx + (rand() - 0.5) * 8, canopyY, canopyRx, canopyRy, rand);

    if (rand() > 0.4) {
      const offX = (rand() - 0.5) * canopyRx * 0.8;
      drawCanopyBlob(ctx, tx + offX, canopyY + rand() * 6, canopyRx * 0.6, canopyRy * 0.7, rand);
    }

    drawHangingVines(ctx, tx, canopyY + canopyRy * 0.6, height * 0.12, 3, canopyRx, pal.nearRidge, rand);
  }

  drawMistBand(ctx, width, height * 0.38, height * 0.025, pal.skyBottom, 0.08);

  // near tree layer — large foreground trees
  const nearTreeCount = 4 + Math.floor(rand() * 2);
  for (let i = 0; i < nearTreeCount; i++) {
    const tx = -width * 0.08 + rand() * width * 1.16;
    const trunkTop = height * (0.32 + rand() * 0.1);
    const trunkW = 6 + rand() * 10;

    ctx.fillStyle = pal.nearRidge;
    drawTrunkWithRoots(ctx, tx, trunkTop, bottomY, trunkW, rand);

    ctx.fillStyle = pal.nearRidge;
    const canopyY = trunkTop - 10 - rand() * 20;
    const canopyRx = 30 + rand() * 45;
    const canopyRy = 18 + rand() * 24;
    drawCanopyBlob(ctx, tx + (rand() - 0.5) * 10, canopyY, canopyRx, canopyRy, rand);

    for (let j = 0; j < 2; j++) {
      const offX = (rand() - 0.5) * canopyRx;
      const offY = rand() * 8;
      drawCanopyBlob(ctx, tx + offX, canopyY + offY, canopyRx * (0.4 + rand() * 0.3), canopyRy * (0.5 + rand() * 0.3), rand);
    }

    drawHangingVines(ctx, tx, canopyY + canopyRy * 0.5, height * 0.18, 5, canopyRx * 1.2, pal.mountainShadow, rand);
  }

  // foreground canopy fill at the very bottom
  ctx.fillStyle = pal.nearRidge;
  ctx.beginPath();
  const canopyLine: { x: number; y: number }[] = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const x = -20 + t * (width + 40);
    const y = height * (0.48 + Math.sin(t * Math.PI * 3.5 + seed * 0.1) * 0.04 + (rand() - 0.5) * 0.02);
    canopyLine.push({ x, y });
  }
  smoothFill(ctx, canopyLine);
  ctx.lineTo(width + 20, bottomY + 20);
  ctx.lineTo(-20, bottomY + 20);
  ctx.closePath();
  ctx.fill();

  drawMistBand(ctx, width, height * 0.5, height * 0.03, pal.skyBottom, 0.07);
}

// ═══════════════════════════════════════════════════════════════════
// DESERT — rolling dunes with pyramids
// ═══════════════════════════════════════════════════════════════════

function drawDuneLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseY: number,
  amplitude: number,
  color: string,
  highlightColor: string,
  seed: number,
  segments: number = 8,
): void {
  const rand = createSeededRandom(seed);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = -30 + t * (width + 60);
    const wave = Math.sin(t * Math.PI * (1.5 + rand() * 0.8)) * amplitude;
    const gentle = Math.sin(t * Math.PI * (0.4 + rand() * 0.3)) * amplitude * 0.6;
    pts.push({ x, y: baseY + wave + gentle + (rand() - 0.5) * amplitude * 0.15 });
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.lineTo(width + 30, height + 20);
  ctx.lineTo(-30, height + 20);
  ctx.closePath();
  ctx.fill();

  // wind-sculpted highlight on the crest
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = highlightColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.stroke();
  ctx.restore();
}

function drawPyramid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  pyramidW: number,
  pyramidH: number,
  faceColorL: string,
  faceColorR: string,
  capColor: string,
): void {
  const peakX = cx;
  const peakY = baseY - pyramidH;
  const leftX = cx - pyramidW * 0.5;
  const rightX = cx + pyramidW * 0.5;

  // left face
  ctx.fillStyle = faceColorL;
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.lineTo(leftX, baseY);
  ctx.lineTo(cx, baseY);
  ctx.closePath();
  ctx.fill();

  // right face
  ctx.fillStyle = faceColorR;
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.lineTo(rightX, baseY);
  ctx.lineTo(cx, baseY);
  ctx.closePath();
  ctx.fill();

  // capstone highlight
  ctx.fillStyle = capColor;
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.lineTo(cx - pyramidW * 0.06, peakY + pyramidH * 0.1);
  ctx.lineTo(cx + pyramidW * 0.06, peakY + pyramidH * 0.1);
  ctx.closePath();
  ctx.fill();

  // edge line
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.lineTo(cx, baseY);
  ctx.stroke();
  ctx.restore();
}

export function renderDesertBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette,
): void {
  const rand = createSeededRandom(seed + 4000);

  // distant dunes
  drawDuneLayer(ctx, width, height, height * 0.3, height * 0.03, pal.farRidge, pal.landHighlight, seed + 4010, 6);

  // distant small pyramids
  for (let i = 0; i < 2; i++) {
    const px = width * (0.2 + rand() * 0.6);
    const py = height * (0.28 + rand() * 0.04);
    const pw = 20 + rand() * 15;
    const ph = 18 + rand() * 12;
    drawPyramid(ctx, px, py, pw, ph,
      hexToRgba(pal.mountainFacetA, 0.5),
      hexToRgba(pal.mountainFacetB, 0.5),
      hexToRgba(pal.landHighlight, 0.3),
    );
  }

  // mid dunes
  drawDuneLayer(ctx, width, height, height * 0.38, height * 0.04, pal.midRidge, pal.landHighlight, seed + 4020, 7);

  drawMistBand(ctx, width, height * 0.36, height * 0.02, pal.skyBottom, 0.05);

  // main pyramids
  const mainPyramidX = width * (0.35 + rand() * 0.15);
  drawPyramid(ctx, mainPyramidX, height * 0.42, 60 + rand() * 20, 55 + rand() * 15,
    pal.mountainFacetA, pal.mountainFacetB, pal.landHighlight,
  );

  if (rand() > 0.3) {
    const secondX = mainPyramidX + width * (0.2 + rand() * 0.15);
    drawPyramid(ctx, secondX, height * 0.44, 45 + rand() * 15, 40 + rand() * 12,
      pal.mountainFacetA, pal.mountainFacetB, pal.landHighlight,
    );
  }

  if (rand() > 0.5) {
    const thirdX = mainPyramidX - width * (0.15 + rand() * 0.1);
    drawPyramid(ctx, thirdX, height * 0.45, 30 + rand() * 12, 28 + rand() * 10,
      pal.mountainFacetA, pal.mountainFacetB, pal.landHighlight,
    );
  }

  // near dunes (foreground)
  drawDuneLayer(ctx, width, height, height * 0.46, height * 0.05, pal.nearRidge, pal.landHighlight, seed + 4030, 9);

  drawMistBand(ctx, width, height * 0.44, height * 0.025, pal.skyBottom, 0.04);

  // large foreground dune
  drawDuneLayer(ctx, width, height, height * 0.52, height * 0.06, pal.nearRidge, pal.landHighlight, seed + 4040, 10);

  // sand ripple texture
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.strokeStyle = pal.mountainTop;
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 12; i++) {
    const ry = height * (0.5 + i * 0.025 + rand() * 0.01);
    ctx.beginPath();
    ctx.moveTo(-20, ry);
    ctx.bezierCurveTo(
      width * 0.25, ry + (rand() - 0.5) * 4,
      width * 0.75, ry + (rand() - 0.5) * 4,
      width + 20, ry + (rand() - 0.5) * 3,
    );
    ctx.stroke();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// WINTER — layered mountain ranges with snow
// ═══════════════════════════════════════════════════════════════════

function drawMountainRange(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseY: number,
  peakAmplitude: number,
  color: string,
  snowColor: string | null,
  seed: number,
  peakCount: number = 6,
  jaggedness: number = 1,
): void {
  const rand = createSeededRandom(seed);
  const pts: { x: number; y: number }[] = [];

  for (let i = 0; i <= peakCount * 2; i++) {
    const t = i / (peakCount * 2);
    const x = -40 + t * (width + 80);
    const isPeak = i % 2 === 1;
    const peakH = isPeak
      ? peakAmplitude * (0.5 + rand() * 0.5)
      : peakAmplitude * (0.05 + rand() * 0.12);
    const jitter = (rand() - 0.5) * peakAmplitude * 0.1 * jaggedness;
    pts.push({ x, y: baseY - peakH + jitter });
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.lineTo(width + 40, height + 20);
  ctx.lineTo(-40, height + 20);
  ctx.closePath();
  ctx.fill();

  // snow caps
  if (snowColor) {
    ctx.save();
    ctx.fillStyle = snowColor;
    const peaks = pts
      .map((p, idx) => ({ p, idx }))
      .filter((_, idx) => idx % 2 === 1)
      .sort((a, b) => a.p.y - b.p.y)
      .slice(0, Math.ceil(peakCount * 0.7));

    for (const { p, idx } of peaks) {
      const prev = pts[Math.max(0, idx - 1)];
      const next = pts[Math.min(pts.length - 1, idx + 1)];
      const snowDepth = peakAmplitude * (0.15 + rand() * 0.15);
      ctx.globalAlpha = 0.35 + rand() * 0.15;
      ctx.beginPath();
      const lx = prev.x + (p.x - prev.x) * 0.4;
      const ly = prev.y - snowDepth * 0.1;
      const rx = next.x - (next.x - p.x) * 0.4;
      const ry = next.y - snowDepth * 0.1;
      ctx.moveTo(lx, ly);
      ctx.bezierCurveTo(
        lx + (p.x - lx) * 0.5, p.y - snowDepth * 0.2,
        p.x + (rx - p.x) * 0.5, p.y - snowDepth * 0.2,
        rx, ry,
      );
      ctx.bezierCurveTo(
        rx - (rx - p.x) * 0.3, p.y + snowDepth * 0.7,
        lx + (p.x - lx) * 0.3, p.y + snowDepth * 0.65,
        lx, ly,
      );
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

export function renderWinterBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette,
): void {
  const snowColor = pal.mountainSnow ?? "#dceef8";

  // very distant range — faded, small
  drawMountainRange(ctx, width, height, height * 0.26, height * 0.06, pal.farRidge, hexToRgba(snowColor, 0.2), seed + 5010, 8, 0.8);

  drawMistBand(ctx, width, height * 0.28, height * 0.015, pal.skyBottom, 0.05);

  // mid range — larger peaks, more snow
  drawMountainRange(ctx, width, height, height * 0.34, height * 0.1, pal.midRidge, hexToRgba(snowColor, 0.35), seed + 5020, 7, 1.2);

  drawMistBand(ctx, width, height * 0.38, height * 0.02, pal.skyBottom, 0.06);

  // near range — prominent peaks, clear snow
  drawMountainRange(ctx, width, height, height * 0.44, height * 0.14, pal.nearRidge, snowColor, seed + 5030, 6, 1.5);

  drawMistBand(ctx, width, height * 0.48, height * 0.018, pal.skyBottom, 0.05);

  // foreground foothills
  drawMountainRange(ctx, width, height, height * 0.52, height * 0.05, pal.nearRidge, hexToRgba(snowColor, 0.25), seed + 5040, 10, 0.6);
}

// ═══════════════════════════════════════════════════════════════════
// VOLCANIC — volcanoes with craters, lava glow, smoke plumes
// ═══════════════════════════════════════════════════════════════════

function drawVolcanoSilhouette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  volcW: number,
  volcH: number,
  craterW: number,
  bodyColor: string,
  craterColor: string,
  rand: () => number,
): void {
  const peakY = baseY - volcH;
  const craterDepth = volcH * 0.06;

  // body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - volcW * 0.5, baseY);
  ctx.bezierCurveTo(
    cx - volcW * 0.4, baseY - volcH * 0.15,
    cx - volcW * 0.2, peakY + volcH * 0.05,
    cx - craterW * 0.5, peakY,
  );
  ctx.lineTo(cx + craterW * 0.5, peakY);
  ctx.bezierCurveTo(
    cx + volcW * 0.2, peakY + volcH * 0.05,
    cx + volcW * 0.4, baseY - volcH * 0.15,
    cx + volcW * 0.5, baseY,
  );
  ctx.closePath();
  ctx.fill();

  // crater hollow
  ctx.fillStyle = craterColor;
  ctx.beginPath();
  ctx.ellipse(cx, peakY + craterDepth * 0.5, craterW * 0.5, craterDepth, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSmokePlume(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  plumeH: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  const puffCount = 6 + Math.floor(rand() * 4);
  for (let i = 0; i < puffCount; i++) {
    const t = i / puffCount;
    const py = baseY - t * plumeH;
    const drift = Math.sin(t * 2 + rand() * 3) * plumeH * 0.12;
    const puffR = (4 + t * 12 + rand() * 6) * (1 + t * 0.5);
    ctx.globalAlpha = (0.08 - t * 0.06) * (0.7 + rand() * 0.3);
    if (ctx.globalAlpha <= 0) continue;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx + drift, py, puffR, puffR * (0.6 + rand() * 0.3), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLavaCraterGlow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
): void {
  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, "rgba(255,120,20,0.12)");
  grad.addColorStop(0.4, "rgba(255,60,10,0.05)");
  grad.addColorStop(1, "rgba(255,30,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function renderVolcanicBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette,
): void {
  const rand = createSeededRandom(seed + 6000);

  // distant volcanic ridge
  const farPts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const x = -30 + t * (width + 60);
    const y = height * (0.28 + Math.sin(t * Math.PI * 3.2 + rand()) * 0.03 + (rand() - 0.5) * 0.015);
    farPts.push({ x, y });
  }
  ctx.fillStyle = pal.farRidge;
  ctx.beginPath();
  smoothFill(ctx, farPts);
  ctx.lineTo(width + 30, height + 20);
  ctx.lineTo(-30, height + 20);
  ctx.closePath();
  ctx.fill();

  // distant small volcanoes
  for (let i = 0; i < 3; i++) {
    const vx = width * (0.1 + rand() * 0.8);
    const vy = height * (0.3 + rand() * 0.04);
    drawVolcanoSilhouette(ctx, vx, vy, 40 + rand() * 25, 20 + rand() * 15, 5 + rand() * 4, pal.farRidge, pal.mountainShadow, rand);
    drawSmokePlume(ctx, vx, vy - 20 - rand() * 15, 30 + rand() * 20, pal.farRidge, rand);
  }

  drawMistBand(ctx, width, height * 0.33, height * 0.015, pal.skyBottom, 0.04);

  // mid volcanoes
  const midVolcCount = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < midVolcCount; i++) {
    const vx = width * (0.05 + rand() * 0.9);
    const vy = height * (0.45 + rand() * 0.04);
    const vw = 70 + rand() * 40;
    const vh = 40 + rand() * 25;
    const cw = 8 + rand() * 6;
    drawVolcanoSilhouette(ctx, vx, vy, vw, vh, cw, pal.midRidge, pal.mountainShadow, rand);

    drawLavaCraterGlow(ctx, vx, vy - vh + 3, cw * 2.5);
    drawSmokePlume(ctx, vx, vy - vh, 50 + rand() * 30, "rgba(80,60,60,1)", rand);
  }

  drawMistBand(ctx, width, height * 0.42, height * 0.02, pal.skyBottom, 0.04);

  // main prominent volcano
  const mainX = width * (0.4 + rand() * 0.2);
  const mainBaseY = height * 0.54;
  const mainW = 120 + rand() * 40;
  const mainH = 70 + rand() * 30;
  const mainCW = 12 + rand() * 8;
  drawVolcanoSilhouette(ctx, mainX, mainBaseY, mainW, mainH, mainCW, pal.nearRidge, pal.mountainShadow, rand);

  drawLavaCraterGlow(ctx, mainX, mainBaseY - mainH + 4, mainCW * 3);
  drawSmokePlume(ctx, mainX, mainBaseY - mainH, 80 + rand() * 30, "rgba(70,55,55,1)", rand);

  // lava streaks down the main volcano
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const sx = mainX + (rand() - 0.5) * mainCW * 0.8;
    const sy = mainBaseY - mainH + 5;
    const streamLen = mainH * (0.3 + rand() * 0.4);

    const grad = ctx.createLinearGradient(sx, sy, sx, sy + streamLen);
    grad.addColorStop(0, "rgba(255,100,15,0.1)");
    grad.addColorStop(0.5, "rgba(255,50,5,0.04)");
    grad.addColorStop(1, "rgba(255,30,0,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 0.8 + rand() * 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    let px = sx;
    let py = sy;
    for (let s = 0; s < 5; s++) {
      px += (rand() - 0.5) * 6;
      py += streamLen / 5;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();

  // foreground ridge
  const nearPts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const x = -30 + t * (width + 60);
    const y = height * (0.52 + Math.sin(t * Math.PI * 2.8 + seed * 0.05) * 0.025 + (rand() - 0.5) * 0.01);
    nearPts.push({ x, y });
  }
  ctx.fillStyle = pal.nearRidge;
  ctx.beginPath();
  smoothFill(ctx, nearPts);
  ctx.lineTo(width + 30, height + 20);
  ctx.lineTo(-30, height + 20);
  ctx.closePath();
  ctx.fill();
}

// ═══════════════════════════════════════════════════════════════════
// GRASSLAND — gentle hills with trees (default/existing style refined)
// ═══════════════════════════════════════════════════════════════════

function drawGentleHills(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseY: number,
  amplitude: number,
  color: string,
  seed: number,
  hillCount: number = 5,
): void {
  const rand = createSeededRandom(seed);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= hillCount * 2; i++) {
    const t = i / (hillCount * 2);
    const x = -30 + t * (width + 60);
    const wave = Math.sin(t * Math.PI * (1.8 + rand() * 0.6)) * amplitude;
    const gentle = Math.sin(t * Math.PI * (0.5 + rand() * 0.3)) * amplitude * 0.5;
    pts.push({ x, y: baseY + wave + gentle + (rand() - 0.5) * amplitude * 0.1 });
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.lineTo(width + 30, height + 20);
  ctx.lineTo(-30, height + 20);
  ctx.closePath();
  ctx.fill();
}

function drawTreeCluster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  clusterR: number,
  color: string,
  rand: () => number,
): void {
  ctx.fillStyle = color;
  const treeCount = 3 + Math.floor(rand() * 4);
  for (let i = 0; i < treeCount; i++) {
    const tx = cx + (rand() - 0.5) * clusterR * 1.5;
    const ty = baseY + (rand() - 0.5) * clusterR * 0.3;
    const h = clusterR * (0.6 + rand() * 0.8);
    const w = h * (0.5 + rand() * 0.3);

    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.bezierCurveTo(
      tx - w, ty - h * 0.4,
      tx - w * 0.8, ty - h,
      tx, ty - h,
    );
    ctx.bezierCurveTo(
      tx + w * 0.8, ty - h,
      tx + w, ty - h * 0.4,
      tx, ty,
    );
    ctx.closePath();
    ctx.fill();
  }
}

export function renderGrasslandBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette,
): void {
  const rand = createSeededRandom(seed + 7000);

  // distant hills
  drawGentleHills(ctx, width, height, height * 0.28, height * 0.035, pal.farRidge, seed + 7010, 6);

  for (let i = 0; i < 5; i++) {
    drawTreeCluster(ctx, rand() * width, height * (0.26 + rand() * 0.04), 5 + rand() * 4, pal.farRidge, rand);
  }

  drawMistBand(ctx, width, height * 0.3, height * 0.015, pal.skyBottom, 0.04);

  // mid hills
  drawGentleHills(ctx, width, height, height * 0.36, height * 0.05, pal.midRidge, seed + 7020, 7);

  for (let i = 0; i < 7; i++) {
    drawTreeCluster(ctx, rand() * width, height * (0.33 + rand() * 0.05), 7 + rand() * 6, pal.midRidge, rand);
  }

  drawMistBand(ctx, width, height * 0.39, height * 0.018, pal.skyBottom, 0.05);

  // near hills
  drawGentleHills(ctx, width, height, height * 0.45, height * 0.06, pal.nearRidge, seed + 7030, 8);

  for (let i = 0; i < 8; i++) {
    drawTreeCluster(ctx, rand() * width, height * (0.42 + rand() * 0.06), 9 + rand() * 8, pal.nearRidge, rand);
  }

  drawMistBand(ctx, width, height * 0.48, height * 0.015, pal.skyBottom, 0.04);

  // foreground hills
  drawGentleHills(ctx, width, height, height * 0.52, height * 0.04, pal.nearRidge, seed + 7040, 10);
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC — main dispatcher
// ═══════════════════════════════════════════════════════════════════

export function renderThemedBackdropSilhouettes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  themeKey: ChallengeThemeKey,
  palette: BackdropPalette,
): void {
  switch (themeKey) {
    case "swamp":
      renderSwampBackdrop(ctx, width, height, seed, palette);
      break;
    case "desert":
      renderDesertBackdrop(ctx, width, height, seed, palette);
      break;
    case "winter":
      renderWinterBackdrop(ctx, width, height, seed, palette);
      break;
    case "volcanic":
      renderVolcanicBackdrop(ctx, width, height, seed, palette);
      break;
    case "grassland":
    default:
      renderGrasslandBackdrop(ctx, width, height, seed, palette);
      break;
  }
}
