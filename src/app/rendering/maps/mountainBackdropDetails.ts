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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ═══════════════════════════════════════════════════════════════════
// SWAMP — dense jungle canopy with massive ancient trees
// ═══════════════════════════════════════════════════════════════════

function drawOrganicCanopy(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rand: () => number,
  lobeCount?: number,
): void {
  const lobes = lobeCount ?? (6 + Math.floor(rand() * 5));
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= lobes; i++) {
    const angle = (i / lobes) * Math.PI * 2;
    const bulge = 0.85 + rand() * 0.35;
    const px = cx + Math.cos(angle) * rx * bulge;
    const py = cy + Math.sin(angle) * ry * bulge;
    pts.push({ x: px, y: py });

    if (i < lobes) {
      const midAngle = ((i + 0.5) / lobes) * Math.PI * 2;
      const pinch = 0.65 + rand() * 0.2;
      pts.push({
        x: cx + Math.cos(midAngle) * rx * pinch,
        y: cy + Math.sin(midAngle) * ry * pinch,
      });
    }
  }

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i += 2) {
    const cp = pts[i];
    const end = pts[Math.min(i + 1, pts.length - 1)];
    ctx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawButtressedTrunk(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  bottomY: number,
  trunkW: number,
  rand: () => number,
): void {
  const midY = lerp(topY, bottomY, 0.55);
  const lean = (rand() - 0.5) * trunkW * 0.4;
  const rootSpread = trunkW * (2.5 + rand() * 1.5);
  const rootCount = 3 + Math.floor(rand() * 3);

  ctx.beginPath();
  ctx.moveTo(x - trunkW * 0.45, topY);
  ctx.bezierCurveTo(
    x - trunkW * 0.5 + lean * 0.3, lerp(topY, midY, 0.4),
    x - trunkW * 0.55, midY,
    x - trunkW * 0.7, lerp(midY, bottomY, 0.3),
  );
  ctx.bezierCurveTo(
    x - rootSpread * 0.5, bottomY - (bottomY - midY) * 0.15,
    x - rootSpread * 0.45, bottomY,
    x - rootSpread * 0.5, bottomY,
  );

  for (let i = 0; i < rootCount; i++) {
    const t = i / (rootCount - 1);
    const rx = lerp(x - rootSpread * 0.5, x + rootSpread * 0.5, t);
    const rootDip = rand() * 6;
    ctx.lineTo(rx, bottomY + rootDip);
  }

  ctx.bezierCurveTo(
    x + rootSpread * 0.45, bottomY,
    x + rootSpread * 0.5, bottomY - (bottomY - midY) * 0.15,
    x + trunkW * 0.7, lerp(midY, bottomY, 0.3),
  );
  ctx.bezierCurveTo(
    x + trunkW * 0.55, midY,
    x + trunkW * 0.5 + lean * 0.3, lerp(topY, midY, 0.4),
    x + trunkW * 0.45, topY,
  );
  ctx.closePath();
  ctx.fill();
}

function drawMossyVines(
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
  for (let i = 0; i < count; i++) {
    const sx = x + (rand() - 0.5) * spread;
    const vineLen = length * (0.3 + rand() * 0.7);
    ctx.globalAlpha = 0.08 + rand() * 0.12;
    ctx.lineWidth = 0.4 + rand() * 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    const sway = (rand() - 0.5) * 12;
    ctx.bezierCurveTo(
      sx + sway * 0.5, y + vineLen * 0.25,
      sx + sway, y + vineLen * 0.55,
      sx + sway * 0.7 + (rand() - 0.5) * 6, y + vineLen,
    );
    ctx.stroke();

    if (rand() > 0.6) {
      const mossY = y + vineLen * (0.3 + rand() * 0.4);
      const mossW = 1.5 + rand() * 3;
      ctx.globalAlpha *= 0.7;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(sx + sway * 0.4, mossY, mossW, mossW * 0.5, rand() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawEpiphytes(
  ctx: CanvasRenderingContext2D,
  x: number,
  minY: number,
  maxY: number,
  trunkW: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  const count = 2 + Math.floor(rand() * 4);
  for (let i = 0; i < count; i++) {
    const py = lerp(minY, maxY, 0.2 + rand() * 0.6);
    const side = rand() > 0.5 ? 1 : -1;
    const px = x + side * trunkW * (0.4 + rand() * 0.3);
    const leafCount = 3 + Math.floor(rand() * 3);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.15 + rand() * 0.1;
    for (let l = 0; l < leafCount; l++) {
      const angle = (l / leafCount) * Math.PI * 1.5 - Math.PI * 0.5 + (rand() - 0.5) * 0.4;
      const leafLen = 3 + rand() * 5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(
        px + Math.cos(angle) * leafLen * 0.7 + (rand() - 0.5) * 2,
        py + Math.sin(angle) * leafLen * 0.5,
        px + Math.cos(angle) * leafLen,
        py + Math.sin(angle) * leafLen,
      );
      ctx.quadraticCurveTo(
        px + Math.cos(angle) * leafLen * 0.5,
        py + Math.sin(angle) * leafLen * 0.3 + 1,
        px, py,
      );
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawMushroomShelf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  side: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.12 + rand() * 0.08;
  ctx.beginPath();
  const sx = x + side * size * 0.2;
  ctx.moveTo(sx, y);
  ctx.quadraticCurveTo(
    sx + side * size * 0.6, y - size * 0.15,
    sx + side * size, y + size * 0.1,
  );
  ctx.quadraticCurveTo(
    sx + side * size * 0.5, y + size * 0.25,
    sx, y + size * 0.05,
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHangingAerialRoots(
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
  for (let i = 0; i < count; i++) {
    const sx = x + (rand() - 0.5) * spread;
    const rootLen = length * (0.4 + rand() * 0.6);
    ctx.globalAlpha = 0.12 + rand() * 0.12;
    ctx.lineWidth = 0.5 + rand() * 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    const sway1 = (rand() - 0.5) * 8;
    const sway2 = (rand() - 0.5) * 12;
    ctx.bezierCurveTo(
      sx + sway1, y + rootLen * 0.3,
      sx + sway2, y + rootLen * 0.65,
      sx + sway2 * 0.8, y + rootLen,
    );
    ctx.stroke();

    // root tip thickening
    if (rand() > 0.5) {
      ctx.globalAlpha *= 0.6;
      ctx.beginPath();
      ctx.arc(sx + sway2 * 0.8, y + rootLen, 0.8 + rand() * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawGiantBranchArm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  angle: number,
  thickness: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  ctx.fillStyle = color;
  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;
  const midX = (x + endX) / 2 + (rand() - 0.5) * length * 0.15;
  const midY = (y + endY) / 2 + (rand() - 0.5) * length * 0.1;
  const perpX = -Math.sin(angle);
  const perpY = Math.cos(angle);

  ctx.beginPath();
  ctx.moveTo(x + perpX * thickness, y + perpY * thickness);
  ctx.bezierCurveTo(
    midX + perpX * thickness * 0.8, midY + perpY * thickness * 0.8,
    endX + perpX * thickness * 0.2, endY + perpY * thickness * 0.2,
    endX, endY,
  );
  ctx.bezierCurveTo(
    endX - perpX * thickness * 0.2, endY - perpY * thickness * 0.2,
    midX - perpX * thickness * 0.8, midY - perpY * thickness * 0.8,
    x - perpX * thickness, y - perpY * thickness,
  );
  ctx.closePath();
  ctx.fill();
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

  // ── L0: extra-far canopy ridge — faint silhouette at horizon
  drawCraggyMountainRange(ctx, width, height, height * 0.20, height * 0.04,
    hexToRgba(pal.farRidge, 0.5), null, seed + 3005, 14, 0.3,
  );

  // ── L1: far canopy ridge + far canopy blobs on top
  drawCraggyMountainRange(ctx, width, height, height * 0.24, height * 0.06,
    pal.farRidge, null, seed + 3010, 12, 0.4,
  );
  ctx.fillStyle = pal.farRidge;
  for (let i = 0; i < 14; i++) {
    const cx = (rand() - 0.1) * width * 1.2;
    const cy = height * (0.20 + rand() * 0.05);
    drawOrganicCanopy(ctx, cx, cy, 25 + rand() * 40, 14 + rand() * 18, rand);
  }

  drawMistBand(ctx, width, height * 0.24, height * 0.018, pal.skyBottom, 0.07);

  // ── L2: mid canopy ridge + mid trees with trunks & canopies
  drawCraggyMountainRange(ctx, width, height, height * 0.32, height * 0.08,
    pal.midRidge, null, seed + 3020, 10, 0.35,
  );
  drawCraggyMountainRange(ctx, width, height, height * 0.35, height * 0.06,
    pal.midRidge, null, seed + 3022, 8, 0.3,
  );

  for (let i = 0; i < 7; i++) {
    const tx = width * (-0.05 + rand() * 1.1);
    const trunkTop = height * (0.26 + rand() * 0.06);
    const trunkW = 5 + rand() * 8;
    ctx.fillStyle = pal.midRidge;
    drawButtressedTrunk(ctx, tx, trunkTop, bottomY, trunkW, rand);
    if (rand() > 0.5) {
      drawGiantBranchArm(ctx, tx, lerp(trunkTop, bottomY, 0.15 + rand() * 0.15), 20 + rand() * 25, (rand() > 0.5 ? 1 : -1) * (0.2 + rand() * 0.4), trunkW * 0.35, pal.midRidge, rand);
    }
    drawEpiphytes(ctx, tx, trunkTop, lerp(trunkTop, bottomY, 0.5), trunkW, pal.landHighlight, rand);
    const canopyY = trunkTop - 8 - rand() * 15;
    const canopyRx = 25 + rand() * 35;
    const canopyRy = 14 + rand() * 20;
    drawOrganicCanopy(ctx, tx + (rand() - 0.5) * 8, canopyY, canopyRx, canopyRy, rand);
    for (let j = 0; j < 2; j++) {
      drawOrganicCanopy(ctx, tx + (rand() - 0.5) * canopyRx * 0.9, canopyY + rand() * 6, canopyRx * (0.35 + rand() * 0.3), canopyRy * (0.4 + rand() * 0.3), rand);
    }
    drawMossyVines(ctx, tx, canopyY + canopyRy * 0.5, height * 0.12, 5, canopyRx, pal.nearRidge, rand);
  }

  drawMistBand(ctx, width, height * 0.36, height * 0.022, pal.skyBottom, 0.09);

  // ── L3: near canopy ridge + massive foreground trees
  drawCraggyMountainRange(ctx, width, height, height * 0.44, height * 0.10,
    pal.nearRidge, null, seed + 3030, 9, 0.3,
  );

  for (let i = 0; i < 5; i++) {
    const tx = width * (-0.08 + rand() * 1.16);
    const trunkTop = height * (0.34 + rand() * 0.08);
    const trunkW = 10 + rand() * 16;
    ctx.fillStyle = pal.nearRidge;
    drawButtressedTrunk(ctx, tx, trunkTop, bottomY, trunkW, rand);
    drawGiantBranchArm(ctx, tx, lerp(trunkTop, bottomY, 0.1 + rand() * 0.15), 30 + rand() * 40, (rand() > 0.5 ? 1 : -1) * (0.15 + rand() * 0.5), trunkW * 0.45, pal.nearRidge, rand);
    drawEpiphytes(ctx, tx, trunkTop, lerp(trunkTop, bottomY, 0.4), trunkW, pal.landHighlight, rand);
    if (rand() > 0.4) {
      drawMushroomShelf(ctx, tx, lerp(trunkTop, bottomY, 0.2 + rand() * 0.2), 5 + rand() * 7, rand() > 0.5 ? 1 : -1, pal.nearRidge, rand);
    }
    const canopyY = trunkTop - 16 - rand() * 25;
    const canopyRx = 40 + rand() * 55;
    const canopyRy = 24 + rand() * 30;
    drawOrganicCanopy(ctx, tx + (rand() - 0.5) * 12, canopyY, canopyRx, canopyRy, rand, 8 + Math.floor(rand() * 3));
    for (let j = 0; j < 3; j++) {
      drawOrganicCanopy(ctx, tx + (rand() - 0.5) * canopyRx, canopyY + rand() * 10, canopyRx * (0.3 + rand() * 0.3), canopyRy * (0.35 + rand() * 0.3), rand);
    }
    drawMossyVines(ctx, tx, canopyY + canopyRy * 0.4, height * 0.2, 8, canopyRx * 1.2, pal.mountainShadow, rand);
    drawHangingAerialRoots(ctx, tx, canopyY + canopyRy * 0.5, height * 0.14, 4, canopyRx * 0.8, pal.nearRidge, rand);
  }

  drawMistBand(ctx, width, height * 0.46, height * 0.02, pal.skyBottom, 0.07);

  // ── L4: foreground canopy ridge + dense canopy fill
  drawCraggyMountainRange(ctx, width, height, height * 0.52, height * 0.04,
    pal.nearRidge, null, seed + 3040, 16, 0.25,
  );

  // firefly specks
  ctx.save();
  for (let i = 0; i < 40; i++) {
    const fx = rand() * width;
    const fy = height * (0.18 + rand() * 0.32);
    ctx.globalAlpha = 0.03 + rand() * 0.06;
    const glowR = 2 + rand() * 3;
    const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowR);
    glow.addColorStop(0, hexToRgba(pal.landHighlight, 0.35));
    glow.addColorStop(0.5, hexToRgba(pal.landHighlight, 0.1));
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx, fy, glowR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// DESERT — rolling dunes, pyramids, oases, and distant mesas
// ═══════════════════════════════════════════════════════════════════

function drawOrganicDuneLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseY: number,
  amplitude: number,
  color: string,
  highlightColor: string,
  seed: number,
  segments: number = 10,
): void {
  const rand = createSeededRandom(seed);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = -40 + t * (width + 80);
    const dune1 = Math.sin(t * Math.PI * (1.2 + rand() * 0.6)) * amplitude;
    const dune2 = Math.sin(t * Math.PI * (2.8 + rand() * 0.4)) * amplitude * 0.35;
    const dune3 = Math.sin(t * Math.PI * (0.3 + rand() * 0.2)) * amplitude * 0.7;
    pts.push({ x, y: baseY + dune1 + dune2 + dune3 + (rand() - 0.5) * amplitude * 0.1 });
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.lineTo(width + 40, height + 20);
  ctx.lineTo(-40, height + 20);
  ctx.closePath();
  ctx.fill();

  // wind-sculpted crest highlight
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = highlightColor;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.stroke();

  // secondary wind ripple near crest
  ctx.globalAlpha = 0.04;
  ctx.lineWidth = 0.6;
  const ripplePts = pts.map(p => ({ x: p.x, y: p.y + 2 + rand() * 2 }));
  ctx.beginPath();
  smoothFill(ctx, ripplePts);
  ctx.stroke();
  ctx.restore();
}

function drawMesa(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  mesaW: number,
  mesaH: number,
  color: string,
  rand: () => number,
): void {
  const topW = mesaW * (0.4 + rand() * 0.2);
  const topY = baseY - mesaH;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - mesaW * 0.5, baseY);
  ctx.bezierCurveTo(
    cx - mesaW * 0.45, baseY - mesaH * 0.3,
    cx - topW * 0.7, topY + mesaH * 0.05,
    cx - topW * 0.5, topY,
  );
  // flat-ish top with slight erosion
  ctx.bezierCurveTo(
    cx - topW * 0.2, topY - mesaH * 0.02,
    cx + topW * 0.15, topY + mesaH * 0.01,
    cx + topW * 0.5, topY,
  );
  ctx.bezierCurveTo(
    cx + topW * 0.7, topY + mesaH * 0.05,
    cx + mesaW * 0.45, baseY - mesaH * 0.3,
    cx + mesaW * 0.5, baseY,
  );
  ctx.closePath();
  ctx.fill();

  // erosion lines
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.04)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    const ey = topY + mesaH * (0.1 + i * 0.2 + rand() * 0.05);
    const eLeft = cx - topW * (0.5 - i * 0.05);
    const eRight = cx + topW * (0.5 - i * 0.05);
    ctx.beginPath();
    ctx.moveTo(eLeft, ey);
    ctx.bezierCurveTo(
      lerp(eLeft, eRight, 0.3), ey + (rand() - 0.5) * 2,
      lerp(eLeft, eRight, 0.7), ey + (rand() - 0.5) * 2,
      eRight, ey,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawPyramid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  pyramidW: number,
  pyramidH: number,
  leftColor: string,
  rightColor: string,
  capColor: string | null,
  rand: () => number,
): void {
  const peakX = cx + (rand() - 0.5) * pyramidW * 0.04;
  const peakY = baseY - pyramidH;

  // left face (shadow side)
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.bezierCurveTo(
    cx - pyramidW * 0.22, baseY - pyramidH * 0.45,
    cx - pyramidW * 0.42, baseY - pyramidH * 0.12,
    cx - pyramidW * 0.5, baseY,
  );
  ctx.lineTo(cx, baseY);
  ctx.closePath();
  ctx.fill();

  // right face (lit side)
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.bezierCurveTo(
    cx + pyramidW * 0.2, baseY - pyramidH * 0.48,
    cx + pyramidW * 0.4, baseY - pyramidH * 0.14,
    cx + pyramidW * 0.5, baseY,
  );
  ctx.lineTo(cx, baseY);
  ctx.closePath();
  ctx.fill();

  // capstone highlight
  if (capColor) {
    ctx.fillStyle = capColor;
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(peakX - pyramidW * 0.04, peakY + pyramidH * 0.1);
    ctx.lineTo(peakX + pyramidW * 0.04, peakY + pyramidH * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  // stone course lines — weathered horizontal banding
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.035)";
  ctx.lineWidth = 0.4;
  for (let i = 1; i <= 8; i++) {
    const t = i / 9;
    const ly = peakY + pyramidH * t;
    const halfW = pyramidW * 0.5 * t;
    ctx.beginPath();
    ctx.moveTo(cx - halfW + rand() * 2, ly + (rand() - 0.5) * 1.5);
    ctx.bezierCurveTo(
      cx - halfW * 0.4, ly + (rand() - 0.5) * 1.2,
      cx + halfW * 0.4, ly + (rand() - 0.5) * 1.2,
      cx + halfW - rand() * 2, ly + (rand() - 0.5) * 1.5,
    );
    ctx.stroke();
  }
  ctx.restore();

  // sand drift at base — organic accumulation
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  const driftW = pyramidW * 0.7;
  ctx.moveTo(cx + pyramidW * 0.5, baseY);
  ctx.bezierCurveTo(
    cx + pyramidW * 0.55, baseY + 1,
    cx + pyramidW * 0.5 + driftW * 0.3, baseY + 2,
    cx + pyramidW * 0.5 + driftW * 0.5, baseY + 3 + rand() * 2,
  );
  ctx.lineTo(cx + pyramidW * 0.5, baseY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawOasisPalmCluster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  count: number,
  maxH: number,
  trunkColor: string,
  frondColor: string,
  rand: () => number,
): void {
  for (let i = 0; i < count; i++) {
    const tx = cx + (rand() - 0.5) * count * 5;
    const h = maxH * (0.5 + rand() * 0.5);
    const lean = (rand() - 0.5) * h * 0.25;

    // curved trunk
    ctx.save();
    ctx.strokeStyle = trunkColor;
    ctx.lineWidth = 1 + rand() * 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tx, baseY);
    ctx.bezierCurveTo(
      tx + lean * 0.3, baseY - h * 0.35,
      tx + lean * 0.7, baseY - h * 0.65,
      tx + lean, baseY - h,
    );
    ctx.stroke();
    ctx.restore();

    // palm fronds — organic drooping leaves
    const topX = tx + lean;
    const topY = baseY - h;
    const frondCount = 5 + Math.floor(rand() * 3);
    ctx.save();
    ctx.fillStyle = frondColor;
    ctx.globalAlpha = 0.6 + rand() * 0.3;
    for (let f = 0; f < frondCount; f++) {
      const angle = (f / frondCount) * Math.PI * 2;
      const frondLen = h * (0.3 + rand() * 0.2);
      const droop = frondLen * (0.3 + rand() * 0.2);
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.bezierCurveTo(
        topX + Math.cos(angle) * frondLen * 0.4,
        topY + Math.sin(angle) * frondLen * 0.3 - 2,
        topX + Math.cos(angle) * frondLen * 0.8,
        topY + Math.sin(angle) * frondLen * 0.5 + droop * 0.5,
        topX + Math.cos(angle) * frondLen,
        topY + droop,
      );
      ctx.bezierCurveTo(
        topX + Math.cos(angle) * frondLen * 0.6,
        topY + Math.sin(angle) * frondLen * 0.3 + droop * 0.3 + 1,
        topX + Math.cos(angle) * frondLen * 0.2,
        topY + 1,
        topX, topY,
      );
      ctx.fill();
    }
    ctx.restore();
  }
}

export function renderDesertBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette,
): void {
  const rand = createSeededRandom(seed + 4000);
  const pyramidLeft = hexToRgba(pal.mountainLeft, 0.85);
  const pyramidRight = hexToRgba(pal.mountainRight, 0.85);
  const pyramidCap = hexToRgba(pal.landHighlight, 0.5);

  // ── L0: extra-far dunes — faint silhouette at horizon
  drawOrganicDuneLayer(ctx, width, height, height * 0.20, height * 0.015, hexToRgba(pal.farRidge, 0.5), pal.landHighlight, seed + 4005, 7);

  // ── L1: far dunes + distant mesas & tiny pyramids
  drawOrganicDuneLayer(ctx, width, height, height * 0.24, height * 0.025, pal.farRidge, pal.landHighlight, seed + 4010, 9);

  for (let i = 0; i < 2; i++) {
    const mx = width * (0.1 + rand() * 0.25 + i * 0.4);
    drawMesa(ctx, mx, height * (0.21 + rand() * 0.02), 22 + rand() * 18, 10 + rand() * 8, hexToRgba(pal.farRidge, 0.7), rand);
  }
  for (let i = 0; i < 3; i++) {
    const px = width * (0.1 + i * 0.3 + (rand() - 0.5) * 0.1);
    ctx.globalAlpha = 0.45 + rand() * 0.15;
    drawPyramid(ctx, px, height * (0.23 + rand() * 0.02), 16 + rand() * 12, 10 + rand() * 8, hexToRgba(pal.farRidge, 0.9), hexToRgba(pal.midRidge, 0.7), null, rand);
    ctx.globalAlpha = 1;
  }

  drawMistBand(ctx, width, height * 0.24, height * 0.018, pal.skyBottom, 0.05);

  // ── L2: mid dunes + main pyramid complex
  drawOrganicDuneLayer(ctx, width, height, height * 0.32, height * 0.035, pal.midRidge, pal.landHighlight, seed + 4020, 10);
  drawOrganicDuneLayer(ctx, width, height, height * 0.35, height * 0.025, pal.midRidge, pal.landHighlight, seed + 4022, 8);

  const pyramidClusterX = width * (0.28 + rand() * 0.15);
  const pyramidBaseY = height * (0.33 + rand() * 0.02);
  drawPyramid(ctx, pyramidClusterX, pyramidBaseY, 55 + rand() * 20, 38 + rand() * 14, pyramidLeft, pyramidRight, pyramidCap, rand);
  drawPyramid(ctx, pyramidClusterX - 48 - rand() * 15, pyramidBaseY + 2, 32 + rand() * 10, 22 + rand() * 8, pyramidLeft, pyramidRight, pyramidCap, rand);
  drawPyramid(ctx, pyramidClusterX + 52 + rand() * 15, pyramidBaseY + 3, 26 + rand() * 10, 18 + rand() * 6, pyramidLeft, pyramidRight, null, rand);

  const cluster2X = width * (0.7 + rand() * 0.12);
  drawPyramid(ctx, cluster2X, height * (0.34 + rand() * 0.02), 40 + rand() * 14, 28 + rand() * 10, pyramidLeft, pyramidRight, pyramidCap, rand);
  drawPyramid(ctx, cluster2X + 35 + rand() * 10, height * (0.35 + rand() * 0.02), 22 + rand() * 8, 15 + rand() * 6, pyramidLeft, pyramidRight, null, rand);

  for (let i = 0; i < 2; i++) {
    drawOasisPalmCluster(ctx, width * (0.15 + rand() * 0.7), height * (0.34 + rand() * 0.03), 3 + Math.floor(rand() * 2), 12 + rand() * 6, pal.mountainShadow, pal.landHighlight, rand);
  }

  drawMistBand(ctx, width, height * 0.36, height * 0.022, pal.skyBottom, 0.06);

  // ── L3: near dunes + large foreground pyramid
  drawOrganicDuneLayer(ctx, width, height, height * 0.44, height * 0.045, pal.nearRidge, pal.landHighlight, seed + 4030, 11);

  const nearPyX = width * (0.1 + rand() * 0.2);
  drawPyramid(ctx, nearPyX, height * 0.45, 70 + rand() * 25, 45 + rand() * 15, pyramidLeft, pyramidRight, pyramidCap, rand);

  for (let i = 0; i < 2; i++) {
    drawOasisPalmCluster(ctx, width * (0.2 + rand() * 0.6), height * (0.44 + rand() * 0.03), 2 + Math.floor(rand() * 3), 14 + rand() * 8, pal.mountainShadow, pal.landHighlight, rand);
  }

  drawMistBand(ctx, width, height * 0.46, height * 0.02, pal.skyBottom, 0.04);

  // ── L4: foreground dune covering pyramid base
  drawOrganicDuneLayer(ctx, width, height, height * 0.52, height * 0.05, pal.nearRidge, pal.landHighlight, seed + 4040, 13);

  // sand ripple texture
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.strokeStyle = pal.mountainTop;
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 16; i++) {
    const ry = height * (0.48 + i * 0.02 + rand() * 0.005);
    ctx.beginPath();
    ctx.moveTo(-20, ry);
    for (let s = 1; s <= 6; s++) {
      const t = s / 6;
      ctx.quadraticCurveTo(-20 + (t - 1 / 12) * (width + 40), ry + (rand() - 0.5) * 3, -20 + t * (width + 40), ry + (rand() - 0.5) * 2);
    }
    ctx.stroke();
  }
  ctx.restore();

  // heat shimmer
  ctx.save();
  for (let i = 0; i < 4; i++) {
    ctx.globalAlpha = 0.012;
    ctx.fillStyle = pal.landHighlight;
    ctx.fillRect(-10, height * (0.22 + i * 0.06), width + 20, 2);
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// WINTER — dramatic mountain ranges with snow, pines, and glaciers
// ═══════════════════════════════════════════════════════════════════

function drawCraggyMountainRange(
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

  for (let i = 0; i <= peakCount * 3; i++) {
    const t = i / (peakCount * 3);
    const x = -50 + t * (width + 100);
    const phase = i % 3;
    let peakH: number;
    if (phase === 1) {
      peakH = peakAmplitude * (0.55 + rand() * 0.45);
    } else if (phase === 2) {
      peakH = peakAmplitude * (0.2 + rand() * 0.25);
    } else {
      peakH = peakAmplitude * (0.03 + rand() * 0.1);
    }
    const jitter = (rand() - 0.5) * peakAmplitude * 0.12 * jaggedness;
    pts.push({ x: x + (rand() - 0.5) * 8 * jaggedness, y: baseY - peakH + jitter });
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.lineTo(width + 50, height + 20);
  ctx.lineTo(-50, height + 20);
  ctx.closePath();
  ctx.fill();

  // ridgeline detail — subtle secondary edge
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.stroke();
  ctx.restore();

  // snow caps with organic draping
  if (snowColor) {
    ctx.save();
    ctx.fillStyle = snowColor;
    const peaks = pts
      .map((p, idx) => ({ p, idx }))
      .filter((_, idx) => idx % 3 === 1)
      .sort((a, b) => a.p.y - b.p.y)
      .slice(0, Math.ceil(peakCount * 0.7));

    for (const { p, idx } of peaks) {
      const prev = pts[Math.max(0, idx - 1)];
      const next = pts[Math.min(pts.length - 1, idx + 1)];
      const snowDepth = peakAmplitude * (0.18 + rand() * 0.18);
      ctx.globalAlpha = 0.35 + rand() * 0.2;
      ctx.beginPath();
      const lx = prev.x + (p.x - prev.x) * 0.35;
      const ly = prev.y - snowDepth * 0.08;
      const rx = next.x - (next.x - p.x) * 0.35;
      const ry = next.y - snowDepth * 0.08;

      ctx.moveTo(lx, ly);
      ctx.bezierCurveTo(
        lerp(lx, p.x, 0.4), p.y - snowDepth * 0.25,
        lerp(p.x, rx, 0.6), p.y - snowDepth * 0.2,
        rx, ry,
      );
      // snow drifts downward with organic edge
      const driftPts = 4;
      for (let d = 0; d < driftPts; d++) {
        const dt = (driftPts - d) / driftPts;
        const dx = lerp(rx, lx, dt);
        const dy = p.y + snowDepth * (0.5 + rand() * 0.3) * (1 - Math.abs(dt - 0.5) * 1.2);
        ctx.lineTo(dx, dy);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawGlacier(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  glacierW: number,
  glacierH: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  const topY = baseY - glacierH;
  const grad = ctx.createLinearGradient(cx, topY, cx, baseY);
  grad.addColorStop(0, hexToRgba(color, 0.25));
  grad.addColorStop(0.5, hexToRgba(color, 0.15));
  grad.addColorStop(1, hexToRgba(color, 0.05));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - glacierW * 0.3, topY);
  ctx.bezierCurveTo(
    cx - glacierW * 0.4, topY + glacierH * 0.3,
    cx - glacierW * 0.5, topY + glacierH * 0.6,
    cx - glacierW * 0.45, baseY,
  );
  ctx.lineTo(cx + glacierW * 0.45, baseY);
  ctx.bezierCurveTo(
    cx + glacierW * 0.5, topY + glacierH * 0.6,
    cx + glacierW * 0.4, topY + glacierH * 0.3,
    cx + glacierW * 0.3, topY,
  );
  ctx.closePath();
  ctx.fill();

  // crevasse lines
  ctx.strokeStyle = hexToRgba(color, 0.12);
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    const cy = topY + glacierH * (0.2 + rand() * 0.5);
    ctx.beginPath();
    ctx.moveTo(cx + (rand() - 0.5) * glacierW * 0.3, cy);
    ctx.lineTo(cx + (rand() - 0.5) * glacierW * 0.2, cy + glacierH * 0.15);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFrozenPineCluster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  count: number,
  maxH: number,
  color: string,
  snowColor: string,
  rand: () => number,
): void {
  for (let i = 0; i < count; i++) {
    const tx = cx + (rand() - 0.5) * count * 6;
    const h = maxH * (0.5 + rand() * 0.5);
    const w = h * (0.22 + rand() * 0.1);

    ctx.fillStyle = color;
    const layers = 3 + Math.floor(rand() * 2);
    for (let l = 0; l < layers; l++) {
      const lt = l / layers;
      const layerY = baseY - h * lt;
      const layerH = h * (0.3 + lt * 0.1);
      const layerW = w * (1.3 - lt * 0.35);
      ctx.beginPath();
      ctx.moveTo(tx, layerY - layerH);
      ctx.bezierCurveTo(
        tx - layerW * 0.35, layerY - layerH * 0.4,
        tx - layerW * 0.85, layerY - 1,
        tx - layerW, layerY + 2,
      );
      ctx.lineTo(tx + layerW, layerY + 2);
      ctx.bezierCurveTo(
        tx + layerW * 0.85, layerY - 1,
        tx + layerW * 0.35, layerY - layerH * 0.4,
        tx, layerY - layerH,
      );
      ctx.fill();
    }

    // snow on branches
    ctx.save();
    ctx.fillStyle = snowColor;
    ctx.globalAlpha = 0.2 + rand() * 0.15;
    for (let l = 0; l < layers; l++) {
      const lt = l / layers;
      const layerY = baseY - h * lt;
      const layerW = w * (1.2 - lt * 0.3);
      ctx.beginPath();
      ctx.moveTo(tx - layerW * 0.8, layerY + 1);
      ctx.quadraticCurveTo(tx, layerY - 2 - rand() * 2, tx + layerW * 0.8, layerY + 1);
      ctx.quadraticCurveTo(tx, layerY + 3, tx - layerW * 0.8, layerY + 1);
      ctx.fill();
    }
    ctx.restore();

    // trunk
    ctx.fillStyle = color;
    ctx.fillRect(tx - 0.8, baseY - 2, 1.6, 3);
  }
}

function drawIceCliff(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  cliffW: number,
  cliffH: number,
  iceColor: string,
  rockColor: string,
  rand: () => number,
): void {
  const topY = baseY - cliffH;

  // rock face
  ctx.fillStyle = rockColor;
  ctx.beginPath();
  ctx.moveTo(cx - cliffW * 0.5, baseY);
  ctx.bezierCurveTo(
    cx - cliffW * 0.48, baseY - cliffH * 0.2,
    cx - cliffW * 0.35, topY + cliffH * 0.15,
    cx - cliffW * 0.2, topY,
  );
  ctx.bezierCurveTo(
    cx - cliffW * 0.05, topY - cliffH * 0.03 * rand(),
    cx + cliffW * 0.1, topY + cliffH * 0.02,
    cx + cliffW * 0.22, topY,
  );
  ctx.bezierCurveTo(
    cx + cliffW * 0.36, topY + cliffH * 0.12,
    cx + cliffW * 0.46, baseY - cliffH * 0.25,
    cx + cliffW * 0.5, baseY,
  );
  ctx.closePath();
  ctx.fill();

  // ice sheet cascading down the face
  ctx.save();
  const iceGrad = ctx.createLinearGradient(cx, topY, cx, baseY);
  iceGrad.addColorStop(0, hexToRgba(iceColor, 0.35));
  iceGrad.addColorStop(0.4, hexToRgba(iceColor, 0.2));
  iceGrad.addColorStop(1, hexToRgba(iceColor, 0.05));
  ctx.fillStyle = iceGrad;
  ctx.beginPath();
  ctx.moveTo(cx - cliffW * 0.15, topY + cliffH * 0.05);
  ctx.bezierCurveTo(
    cx - cliffW * 0.18, topY + cliffH * 0.35,
    cx - cliffW * 0.2, topY + cliffH * 0.6,
    cx - cliffW * 0.15 - rand() * 3, baseY,
  );
  ctx.lineTo(cx + cliffW * 0.12 + rand() * 3, baseY);
  ctx.bezierCurveTo(
    cx + cliffW * 0.15, topY + cliffH * 0.55,
    cx + cliffW * 0.12, topY + cliffH * 0.3,
    cx + cliffW * 0.08, topY + cliffH * 0.05,
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function renderWinterBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette,
): void {
  const rand = createSeededRandom(seed + 5000);
  const snowColor = pal.mountainSnow ?? "#dceef8";

  // ── extremely distant range — faint, ethereal silhouettes at the horizon
  drawCraggyMountainRange(ctx, width, height, height * 0.2, height * 0.05,
    hexToRgba(pal.farRidge, 0.5), hexToRgba(snowColor, 0.1), seed + 5005, 12, 0.5,
  );

  // ── very distant range — towering peaks fading into the sky
  drawCraggyMountainRange(ctx, width, height, height * 0.24, height * 0.09,
    pal.farRidge, hexToRgba(snowColor, 0.22), seed + 5010, 10, 0.8,
  );

  drawMistBand(ctx, width, height * 0.24, height * 0.018, pal.skyBottom, 0.07);

  // scattered pine forests on distant slopes
  for (let i = 0; i < 4; i++) {
    const fx = width * (0.05 + rand() * 0.9);
    const fy = height * (0.22 + rand() * 0.03);
    drawFrozenPineCluster(ctx, fx, fy, 4 + Math.floor(rand() * 3), 6 + rand() * 4, pal.farRidge, hexToRgba(snowColor, 0.12), rand);
  }

  // ── mid range — prominent dramatic peaks with heavy snow
  drawCraggyMountainRange(ctx, width, height, height * 0.32, height * 0.14,
    pal.midRidge, hexToRgba(snowColor, 0.4), seed + 5020, 9, 1.4,
  );

  // secondary mid ridge for depth
  drawCraggyMountainRange(ctx, width, height, height * 0.35, height * 0.1,
    pal.midRidge, hexToRgba(snowColor, 0.3), seed + 5022, 7, 1.2,
  );

  // glaciers and ice formations in mid-range saddles
  for (let i = 0; i < 4; i++) {
    const gx = width * (0.1 + rand() * 0.8);
    const gy = height * (0.28 + rand() * 0.06);
    drawGlacier(ctx, gx, gy, 18 + rand() * 15, 10 + rand() * 8, snowColor, rand);
  }

  // ice cliffs on exposed ridges
  for (let i = 0; i < 2; i++) {
    const cx = width * (0.15 + rand() * 0.7);
    const cy = height * (0.32 + rand() * 0.04);
    drawIceCliff(ctx, cx, cy, 20 + rand() * 15, 12 + rand() * 10, snowColor, pal.midRidge, rand);
  }

  // mid-distance pine forests
  for (let i = 0; i < 6; i++) {
    const fx = width * (0.02 + rand() * 0.96);
    const fy = height * (0.33 + rand() * 0.04);
    drawFrozenPineCluster(ctx, fx, fy, 5 + Math.floor(rand() * 4), 8 + rand() * 6, pal.midRidge, hexToRgba(snowColor, 0.2), rand);
  }

  drawMistBand(ctx, width, height * 0.36, height * 0.022, pal.skyBottom, 0.08);

  // ── near range — massive dramatic close peaks towering overhead
  drawCraggyMountainRange(ctx, width, height, height * 0.44, height * 0.2,
    pal.nearRidge, snowColor, seed + 5030, 8, 1.8,
  );

  // large glaciers cascading from near peaks
  for (let i = 0; i < 3; i++) {
    const gx = width * (0.1 + rand() * 0.8);
    const gy = height * (0.36 + rand() * 0.06);
    drawGlacier(ctx, gx, gy, 24 + rand() * 18, 14 + rand() * 10, snowColor, rand);
  }

  // prominent ice cliffs in the near range
  for (let i = 0; i < 2; i++) {
    const cx = width * (0.1 + rand() * 0.8);
    const cy = height * (0.42 + rand() * 0.04);
    drawIceCliff(ctx, cx, cy, 25 + rand() * 18, 16 + rand() * 12, snowColor, pal.nearRidge, rand);
  }

  drawMistBand(ctx, width, height * 0.46, height * 0.02, pal.skyBottom, 0.07);

  // ── foreground foothills with dense snow-covered forest
  drawCraggyMountainRange(ctx, width, height, height * 0.52, height * 0.06,
    pal.nearRidge, hexToRgba(snowColor, 0.25), seed + 5040, 14, 0.7,
  );

  // dense foreground pine forests
  for (let i = 0; i < 10; i++) {
    const fx = width * (-0.05 + rand() * 1.1);
    const fy = height * (0.48 + rand() * 0.05);
    drawFrozenPineCluster(ctx, fx, fy, 6 + Math.floor(rand() * 5), 12 + rand() * 8, pal.nearRidge, snowColor, rand);
  }

  // ── wind-blown snow streaks — organic curved trails
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 20; i++) {
    const sy = height * (0.15 + rand() * 0.35);
    const sx = rand() * width;
    const len = 35 + rand() * 65;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(
      sx + len * 0.25, sy - 2 - rand() * 4,
      sx + len * 0.5, sy + (rand() - 0.5) * 5,
      sx + len * 0.75, sy - 1 + rand() * 3,
    );
    ctx.bezierCurveTo(
      sx + len * 0.85, sy + (rand() - 0.5) * 3,
      sx + len * 0.95, sy + rand() * 2,
      sx + len, sy + (rand() - 0.5) * 4,
    );
    ctx.stroke();
  }
  ctx.restore();

  // ── falling snow — subtle depth particles
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 40; i++) {
    const sx = rand() * width;
    const sy = height * (0.1 + rand() * 0.45);
    const size = 0.6 + rand() * 1.8;
    ctx.globalAlpha = 0.04 + rand() * 0.08;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// VOLCANIC — varied volcanoes, lava rivers, smoke, ash clouds
// ═══════════════════════════════════════════════════════════════════

function drawOrganicVolcano(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  volcW: number,
  volcH: number,
  craterW: number,
  bodyColor: string,
  craterColor: string,
  rand: () => number,
  isActive: boolean = false,
): void {
  const peakY = baseY - volcH;
  const craterDepth = volcH * 0.07;

  // body with organic, asymmetric slopes
  const leftBulge = 0.9 + rand() * 0.2;
  const rightBulge = 0.9 + rand() * 0.2;
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - volcW * 0.55, baseY);
  // left slope with secondary ridge
  ctx.bezierCurveTo(
    cx - volcW * 0.48, baseY - volcH * 0.08,
    cx - volcW * 0.38 * leftBulge, baseY - volcH * 0.35,
    cx - volcW * 0.25, baseY - volcH * 0.6,
  );
  ctx.bezierCurveTo(
    cx - volcW * 0.18, baseY - volcH * 0.8,
    cx - craterW * 0.7, peakY + volcH * 0.03,
    cx - craterW * 0.5, peakY,
  );
  ctx.lineTo(cx + craterW * 0.5, peakY);
  // right slope
  ctx.bezierCurveTo(
    cx + craterW * 0.7, peakY + volcH * 0.03,
    cx + volcW * 0.18, baseY - volcH * 0.8,
    cx + volcW * 0.25, baseY - volcH * 0.6,
  );
  ctx.bezierCurveTo(
    cx + volcW * 0.38 * rightBulge, baseY - volcH * 0.35,
    cx + volcW * 0.48, baseY - volcH * 0.08,
    cx + volcW * 0.55, baseY,
  );
  ctx.closePath();
  ctx.fill();

  // slope texture — erosion channels
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.04)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 5; i++) {
    const sx = cx + (rand() - 0.5) * craterW;
    const sy = peakY + volcH * 0.05;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    let px = sx;
    let py = sy;
    for (let s = 0; s < 4; s++) {
      px += (rand() - 0.5) * 8;
      py += volcH * 0.15;
      const spreadFactor = (py - peakY) / volcH;
      px += (px > cx ? 1 : -1) * spreadFactor * 4;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();

  // crater hollow
  ctx.fillStyle = craterColor;
  ctx.beginPath();
  ctx.ellipse(cx, peakY + craterDepth * 0.5, craterW * 0.52, craterDepth, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isActive) {
    // crater inner glow
    ctx.save();
    const glowR = craterW * 1.5;
    const glow = ctx.createRadialGradient(cx, peakY, craterW * 0.2, cx, peakY, glowR);
    glow.addColorStop(0, "rgba(255,140,30,0.15)");
    glow.addColorStop(0.3, "rgba(255,80,10,0.08)");
    glow.addColorStop(0.6, "rgba(255,40,0,0.03)");
    glow.addColorStop(1, "rgba(255,20,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, peakY, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawOrganicSmokePlume(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  plumeH: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  const puffCount = 8 + Math.floor(rand() * 5);
  for (let i = 0; i < puffCount; i++) {
    const t = i / puffCount;
    const py = baseY - t * plumeH;
    const drift = Math.sin(t * 2.5 + rand() * 4) * plumeH * 0.15 + t * 8;
    const puffW = (5 + t * 16 + rand() * 8) * (1 + t * 0.6);
    const puffH = puffW * (0.5 + rand() * 0.3);
    const alpha = (0.1 - t * 0.07) * (0.6 + rand() * 0.4);
    if (alpha <= 0) continue;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;

    // organic puff shape instead of ellipse
    ctx.beginPath();
    const subLobes = 4 + Math.floor(rand() * 3);
    for (let l = 0; l <= subLobes * 2; l++) {
      const angle = (l / (subLobes * 2)) * Math.PI * 2;
      const wobble = 0.8 + rand() * 0.4;
      const px = cx + drift + Math.cos(angle) * puffW * wobble;
      const ppY = py + Math.sin(angle) * puffH * wobble;
      if (l === 0) ctx.moveTo(px, ppY);
      else {
        const midAngle = ((l - 0.5) / (subLobes * 2)) * Math.PI * 2;
        ctx.quadraticCurveTo(
          cx + drift + Math.cos(midAngle) * puffW * (0.7 + rand() * 0.2),
          py + Math.sin(midAngle) * puffH * (0.7 + rand() * 0.2),
          px, ppY,
        );
      }
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawLavaRiver(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  length: number,
  spreadAngle: number,
  rand: () => number,
): void {
  ctx.save();
  const segments = 6 + Math.floor(rand() * 3);
  let px = startX;
  let py = startY;

  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const riverWidth = (0.6 + t * 2) * (0.8 + rand() * 0.4);
    const segLen = length / segments;
    const nx = px + Math.sin(spreadAngle) * segLen + (rand() - 0.5) * 6;
    const ny = py + Math.cos(spreadAngle) * segLen * 0.8;

    const alpha = (0.12 - t * 0.08) * (0.7 + rand() * 0.3);
    if (alpha <= 0) break;

    const grad = ctx.createLinearGradient(px, py, nx, ny);
    grad.addColorStop(0, `rgba(255,${100 - t * 40},${15 - t * 10},${alpha})`);
    grad.addColorStop(1, `rgba(255,${60 - t * 30},${5},${alpha * 0.6})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = riverWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.bezierCurveTo(
      lerp(px, nx, 0.3) + (rand() - 0.5) * 4,
      lerp(py, ny, 0.4),
      lerp(px, nx, 0.7) + (rand() - 0.5) * 4,
      lerp(py, ny, 0.6),
      nx, ny,
    );
    ctx.stroke();

    px = nx;
    py = ny;
  }
  ctx.restore();
}

function drawAshCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cloudW: number,
  cloudH: number,
  rand: () => number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.04 + rand() * 0.04;
  ctx.fillStyle = "rgba(40,20,15,1)";

  const lobes = 5 + Math.floor(rand() * 3);
  ctx.beginPath();
  for (let i = 0; i <= lobes * 2; i++) {
    const angle = (i / (lobes * 2)) * Math.PI * 2;
    const r = 0.7 + rand() * 0.35;
    const px = cx + Math.cos(angle) * cloudW * r;
    const py = cy + Math.sin(angle) * cloudH * r;
    if (i === 0) ctx.moveTo(px, py);
    else {
      const midAngle = ((i - 0.5) / (lobes * 2)) * Math.PI * 2;
      ctx.quadraticCurveTo(
        cx + Math.cos(midAngle) * cloudW * (0.6 + rand() * 0.2),
        cy + Math.sin(midAngle) * cloudH * (0.6 + rand() * 0.2),
        px, py,
      );
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCrackedEarth(
  ctx: CanvasRenderingContext2D,
  width: number,
  minY: number,
  maxY: number,
  rand: () => number,
): void {
  ctx.save();
  const crackCount = 8 + Math.floor(rand() * 6);
  for (let i = 0; i < crackCount; i++) {
    const sx = rand() * width;
    const sy = lerp(minY, maxY, rand());
    const crackLen = 10 + rand() * 25;
    const angle = (rand() - 0.5) * Math.PI * 0.6;

    // glow
    ctx.globalAlpha = 0.03 + rand() * 0.03;
    ctx.strokeStyle = "rgba(255,80,10,1)";
    ctx.lineWidth = 2 + rand() * 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    let px = sx;
    let py = sy;
    const segs = 3 + Math.floor(rand() * 2);
    for (let s = 0; s < segs; s++) {
      px += Math.cos(angle) * crackLen / segs + (rand() - 0.5) * 5;
      py += Math.sin(angle) * crackLen / segs + (rand() - 0.5) * 3;
      ctx.lineTo(px, py);
    }
    ctx.stroke();

    // bright core
    ctx.globalAlpha *= 1.5;
    ctx.lineWidth *= 0.3;
    ctx.strokeStyle = "rgba(255,160,40,1)";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    px = sx;
    py = sy;
    for (let s = 0; s < segs; s++) {
      px += Math.cos(angle) * crackLen / segs + (rand() - 0.5) * 3;
      py += Math.sin(angle) * crackLen / segs + (rand() - 0.5) * 2;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawObsidianPillar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  pillarW: number,
  pillarH: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5 + rand() * 0.3;
  const topY = baseY - pillarH;
  const tilt = (rand() - 0.5) * pillarW * 0.3;

  ctx.beginPath();
  ctx.moveTo(cx - pillarW * 0.5, baseY);
  ctx.bezierCurveTo(
    cx - pillarW * 0.45, baseY - pillarH * 0.3,
    cx - pillarW * 0.3 + tilt * 0.5, topY + pillarH * 0.2,
    cx + tilt - pillarW * 0.15, topY,
  );
  // jagged top
  ctx.lineTo(cx + tilt, topY - pillarH * 0.05 * rand());
  ctx.lineTo(cx + tilt + pillarW * 0.15, topY + pillarH * 0.03);
  ctx.bezierCurveTo(
    cx + pillarW * 0.3 + tilt * 0.5, topY + pillarH * 0.2,
    cx + pillarW * 0.45, baseY - pillarH * 0.3,
    cx + pillarW * 0.5, baseY,
  );
  ctx.closePath();
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

  // sky under-glow + ash clouds (above the ridgelines)
  ctx.save();
  const skyGlow = ctx.createRadialGradient(width * 0.5, height * 0.5, height * 0.1, width * 0.5, height * 0.5, height * 0.6);
  skyGlow.addColorStop(0, "rgba(255,50,10,0.06)");
  skyGlow.addColorStop(0.5, "rgba(255,30,5,0.03)");
  skyGlow.addColorStop(1, "rgba(200,20,0,0)");
  ctx.fillStyle = skyGlow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
  for (let i = 0; i < 8; i++) {
    drawAshCloud(ctx, rand() * width, height * (0.03 + rand() * 0.15), 40 + rand() * 70, 14 + rand() * 22, rand);
  }

  // ── L0: extra-far volcanic ridge — faint jagged horizon
  drawCraggyMountainRange(ctx, width, height, height * 0.20, height * 0.05,
    hexToRgba(pal.farRidge, 0.5), null, seed + 6005, 12, 1.0,
  );

  // ── L1: far ridge + distant small volcanoes
  drawCraggyMountainRange(ctx, width, height, height * 0.24, height * 0.08,
    pal.farRidge, null, seed + 6010, 10, 1.2,
  );
  for (let i = 0; i < 5; i++) {
    const vx = width * (0.02 + rand() * 0.96);
    const active = rand() > 0.5;
    drawOrganicVolcano(ctx, vx, height * (0.23 + rand() * 0.03), 25 + rand() * 25, 14 + rand() * 12, 3 + rand() * 3,
      pal.farRidge, pal.mountainShadow, rand, active,
    );
    if (active) {
      drawOrganicSmokePlume(ctx, vx, height * (0.20 - rand() * 0.04), 25 + rand() * 20, pal.farRidge, rand);
    }
  }

  drawMistBand(ctx, width, height * 0.24, height * 0.018, pal.skyBottom, 0.05);

  // ── L2: mid ridge + mid-sized volcanoes with lava
  drawCraggyMountainRange(ctx, width, height, height * 0.32, height * 0.12,
    pal.midRidge, null, seed + 6020, 9, 1.4,
  );
  drawCraggyMountainRange(ctx, width, height, height * 0.35, height * 0.08,
    pal.midRidge, null, seed + 6022, 7, 1.2,
  );

  for (let i = 0; i < 4; i++) {
    const vx = width * (0.05 + rand() * 0.9);
    const vy = height * (0.32 + rand() * 0.04);
    const vw = 55 + rand() * 40;
    const vh = 30 + rand() * 22;
    const cw = 6 + rand() * 6;
    const active = rand() > 0.35;
    drawOrganicVolcano(ctx, vx, vy, vw, vh, cw, pal.midRidge, pal.mountainShadow, rand, active);
    if (active) {
      for (let r = 0; r < 1 + Math.floor(rand() * 2); r++) {
        drawLavaRiver(ctx, vx + (rand() - 0.5) * cw, vy - vh + 4, vh * 0.6, (rand() - 0.5) * 0.5, rand);
      }
      drawOrganicSmokePlume(ctx, vx, vy - vh, 40 + rand() * 30, "rgba(60,45,40,1)", rand);
    }
    if (rand() > 0.5) {
      drawObsidianPillar(ctx, vx + (rand() - 0.5) * vw * 0.6, vy, 4 + rand() * 5, 8 + rand() * 12, pal.midRidge, rand);
    }
  }

  drawMistBand(ctx, width, height * 0.36, height * 0.022, pal.skyBottom, 0.04);

  // ── L3: near ridge + main erupting volcano + secondary
  drawCraggyMountainRange(ctx, width, height, height * 0.44, height * 0.16,
    pal.nearRidge, null, seed + 6030, 8, 1.6,
  );

  const mainX = width * (0.32 + rand() * 0.36);
  const mainBaseY = height * 0.46;
  const mainW = 120 + rand() * 50;
  const mainH = 65 + rand() * 30;
  const mainCW = 12 + rand() * 8;
  drawOrganicVolcano(ctx, mainX, mainBaseY, mainW, mainH, mainCW, pal.nearRidge, pal.mountainShadow, rand, true);
  for (let i = 0; i < 4; i++) {
    drawLavaRiver(ctx, mainX + (rand() - 0.5) * mainCW, mainBaseY - mainH + 5, mainH * 0.8, (rand() - 0.5) * 0.7, rand);
  }
  drawOrganicSmokePlume(ctx, mainX, mainBaseY - mainH, 80 + rand() * 40, "rgba(50,35,30,1)", rand);
  for (let i = 0; i < 2; i++) {
    drawOrganicSmokePlume(ctx, mainX + (rand() - 0.5) * mainW * 0.4, mainBaseY - mainH * (0.3 + rand() * 0.3), 20 + rand() * 15, "rgba(65,48,42,1)", rand);
  }

  const secX = mainX > width * 0.5 ? width * (0.08 + rand() * 0.15) : width * (0.72 + rand() * 0.18);
  drawOrganicVolcano(ctx, secX, height * 0.45, 80 + rand() * 35, 45 + rand() * 20, 8 + rand() * 6, pal.nearRidge, pal.mountainShadow, rand, true);
  for (let i = 0; i < 2; i++) {
    drawLavaRiver(ctx, secX + (rand() - 0.5) * 8, height * 0.45 - 45 + 4, 35, (rand() - 0.5) * 0.5, rand);
  }
  drawOrganicSmokePlume(ctx, secX, height * 0.45 - 45, 50 + rand() * 25, "rgba(55,40,35,1)", rand);

  for (let i = 0; i < 4; i++) {
    drawObsidianPillar(ctx, lerp(mainX, secX, rand()) + (rand() - 0.5) * 30, height * (0.43 + rand() * 0.04), 4 + rand() * 6, 12 + rand() * 16, pal.nearRidge, rand);
  }

  drawMistBand(ctx, width, height * 0.46, height * 0.02, pal.skyBottom, 0.04);

  // ── L4: foreground scorched ridge + cracked earth
  drawCraggyMountainRange(ctx, width, height, height * 0.52, height * 0.05,
    pal.nearRidge, null, seed + 6040, 14, 1.0,
  );
  drawCrackedEarth(ctx, width, height * 0.49, height * 0.55, rand);

  // lava glow reflection
  ctx.save();
  const lavaReflect = ctx.createLinearGradient(0, height * 0.44, 0, height * 0.55);
  lavaReflect.addColorStop(0, "rgba(255,60,10,0)");
  lavaReflect.addColorStop(0.4, "rgba(255,50,10,0.04)");
  lavaReflect.addColorStop(0.7, "rgba(255,40,5,0.06)");
  lavaReflect.addColorStop(1, "rgba(255,30,0,0)");
  ctx.fillStyle = lavaReflect;
  ctx.fillRect(0, height * 0.44, width, height * 0.12);
  ctx.restore();

  // ember particles
  ctx.save();
  for (let i = 0; i < 30; i++) {
    const ex = rand() * width;
    const ey = height * (0.1 + rand() * 0.42);
    const emberR = 0.4 + rand() * 1.3;
    ctx.globalAlpha = 0.03 + rand() * 0.05;
    const emberGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, emberR * 2);
    emberGlow.addColorStop(0, "rgba(255,120,30,0.6)");
    emberGlow.addColorStop(0.5, "rgba(255,80,15,0.2)");
    emberGlow.addColorStop(1, "rgba(255,40,0,0)");
    ctx.fillStyle = emberGlow;
    ctx.beginPath();
    ctx.arc(ex, ey, emberR * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// GRASSLAND — lush Princeton grounds with trees, Gothic spires,
// rolling meadows, hedgerows, and pastoral detail
// ═══════════════════════════════════════════════════════════════════

function drawRollingHills(
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
  for (let i = 0; i <= hillCount * 3; i++) {
    const t = i / (hillCount * 3);
    const x = -40 + t * (width + 80);
    const broad = Math.sin(t * Math.PI * (1.4 + rand() * 0.5)) * amplitude;
    const med = Math.sin(t * Math.PI * (2.8 + rand() * 0.6)) * amplitude * 0.35;
    const fine = Math.sin(t * Math.PI * (5.2 + rand() * 0.4)) * amplitude * 0.1;
    pts.push({ x, y: baseY + broad + med + fine + (rand() - 0.5) * amplitude * 0.08 });
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.lineTo(width + 40, height + 20);
  ctx.lineTo(-40, height + 20);
  ctx.closePath();
  ctx.fill();
}

function drawDeciduousTree(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  treeH: number,
  canopyW: number,
  trunkColor: string,
  canopyColor: string,
  rand: () => number,
): void {
  const trunkW = treeH * (0.06 + rand() * 0.03);
  const trunkH = treeH * (0.3 + rand() * 0.15);
  const lean = (rand() - 0.5) * trunkW * 2;

  // trunk with slight taper and lean
  ctx.fillStyle = trunkColor;
  ctx.beginPath();
  ctx.moveTo(cx - trunkW, baseY);
  ctx.bezierCurveTo(
    cx - trunkW * 0.9 + lean * 0.3, baseY - trunkH * 0.4,
    cx - trunkW * 0.6 + lean * 0.6, baseY - trunkH * 0.8,
    cx + lean - trunkW * 0.3, baseY - trunkH,
  );
  ctx.lineTo(cx + lean + trunkW * 0.3, baseY - trunkH);
  ctx.bezierCurveTo(
    cx + trunkW * 0.6 + lean * 0.6, baseY - trunkH * 0.8,
    cx + trunkW * 0.9 + lean * 0.3, baseY - trunkH * 0.4,
    cx + trunkW, baseY,
  );
  ctx.closePath();
  ctx.fill();

  // canopy — organic multi-lobe shape
  const canopyCx = cx + lean;
  const canopyCy = baseY - trunkH - treeH * 0.25;
  const canopyRx = canopyW * 0.5;
  const canopyRy = treeH * (0.3 + rand() * 0.1);
  const lobes = 7 + Math.floor(rand() * 5);

  ctx.fillStyle = canopyColor;
  ctx.beginPath();
  for (let i = 0; i <= lobes; i++) {
    const angle = (i / lobes) * Math.PI * 2;
    const bulge = 0.82 + rand() * 0.3;
    const px = canopyCx + Math.cos(angle) * canopyRx * bulge;
    const py = canopyCy + Math.sin(angle) * canopyRy * bulge;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      const midAngle = ((i - 0.5) / lobes) * Math.PI * 2;
      const pinch = 0.6 + rand() * 0.2;
      ctx.quadraticCurveTo(
        canopyCx + Math.cos(midAngle) * canopyRx * pinch,
        canopyCy + Math.sin(midAngle) * canopyRy * pinch,
        px, py,
      );
    }
  }
  ctx.closePath();
  ctx.fill();

  // secondary canopy cluster offset for fullness
  if (rand() > 0.3) {
    const offX = (rand() - 0.5) * canopyRx * 0.8;
    const offY = (rand() - 0.5) * canopyRy * 0.4;
    const subLobes = 5 + Math.floor(rand() * 3);
    ctx.beginPath();
    for (let i = 0; i <= subLobes; i++) {
      const angle = (i / subLobes) * Math.PI * 2;
      const r = 0.8 + rand() * 0.25;
      const px = canopyCx + offX + Math.cos(angle) * canopyRx * 0.55 * r;
      const py = canopyCy + offY + Math.sin(angle) * canopyRy * 0.5 * r;
      if (i === 0) ctx.moveTo(px, py);
      else {
        const ma = ((i - 0.5) / subLobes) * Math.PI * 2;
        ctx.quadraticCurveTo(
          canopyCx + offX + Math.cos(ma) * canopyRx * 0.4,
          canopyCy + offY + Math.sin(ma) * canopyRy * 0.35,
          px, py,
        );
      }
    }
    ctx.closePath();
    ctx.fill();
  }
}

function drawGothicSpire(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  spireW: number,
  spireH: number,
  bodyH: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  ctx.fillStyle = color;

  // building body
  const bodyW = spireW * (1.5 + rand() * 0.5);
  ctx.beginPath();
  ctx.moveTo(cx - bodyW * 0.5, baseY);
  ctx.lineTo(cx - bodyW * 0.5, baseY - bodyH);
  // crenellated roofline
  const crenCount = 3 + Math.floor(rand() * 3);
  for (let i = 0; i <= crenCount; i++) {
    const t = i / crenCount;
    const bx = cx - bodyW * 0.5 + t * bodyW;
    const up = i % 2 === 0 ? bodyH * 0.06 : 0;
    ctx.lineTo(bx, baseY - bodyH - up);
  }
  ctx.lineTo(cx + bodyW * 0.5, baseY);
  ctx.closePath();
  ctx.fill();

  // central spire/tower
  const towerW = spireW * 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - towerW, baseY - bodyH);
  ctx.lineTo(cx - towerW, baseY - bodyH - spireH * 0.4);
  // pointed top
  ctx.bezierCurveTo(
    cx - towerW * 0.6, baseY - bodyH - spireH * 0.7,
    cx - towerW * 0.15, baseY - bodyH - spireH * 0.95,
    cx, baseY - bodyH - spireH,
  );
  ctx.bezierCurveTo(
    cx + towerW * 0.15, baseY - bodyH - spireH * 0.95,
    cx + towerW * 0.6, baseY - bodyH - spireH * 0.7,
    cx + towerW, baseY - bodyH - spireH * 0.4,
  );
  ctx.lineTo(cx + towerW, baseY - bodyH);
  ctx.closePath();
  ctx.fill();

  // window dots
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#c8e0a0";
  const windowCount = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < windowCount; i++) {
    const wy = baseY - bodyH * (0.3 + i * 0.25);
    for (let s = -1; s <= 1; s += 2) {
      const wx = cx + s * bodyW * (0.15 + rand() * 0.1);
      ctx.beginPath();
      ctx.ellipse(wx, wy, 1.2, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawHedgerow(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  baseY: number,
  hedgeH: number,
  color: string,
  rand: () => number,
): void {
  const pts: { x: number; y: number }[] = [];
  const segs = Math.max(4, Math.floor(Math.abs(endX - startX) / 8));
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const x = lerp(startX, endX, t);
    const bump = Math.sin(t * Math.PI * (3 + rand() * 2)) * hedgeH * 0.35;
    const y = baseY - hedgeH * (0.5 + rand() * 0.3) + bump;
    pts.push({ x, y });
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.lineTo(endX, baseY + 3);
  ctx.lineTo(startX, baseY + 3);
  ctx.closePath();
  ctx.fill();
}

function drawBirdFlock(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  count: number,
  spread: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const bx = cx + (rand() - 0.5) * spread;
    const by = cy + (rand() - 0.5) * spread * 0.4;
    const wingSpan = 2 + rand() * 3;
    const dip = wingSpan * (0.2 + rand() * 0.3);
    ctx.globalAlpha = 0.15 + rand() * 0.15;
    ctx.beginPath();
    ctx.moveTo(bx - wingSpan, by - dip);
    ctx.quadraticCurveTo(bx - wingSpan * 0.3, by, bx, by + dip * 0.3);
    ctx.quadraticCurveTo(bx + wingSpan * 0.3, by, bx + wingSpan, by - dip);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMeadowFlowers(
  ctx: CanvasRenderingContext2D,
  width: number,
  minY: number,
  maxY: number,
  count: number,
  colors: string[],
  rand: () => number,
): void {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const fx = rand() * width;
    const fy = lerp(minY, maxY, rand());
    const size = 0.6 + rand() * 1.4;
    ctx.globalAlpha = 0.08 + rand() * 0.1;
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];

    // tiny organic dot clusters instead of circles
    const petals = 3 + Math.floor(rand() * 3);
    for (let p = 0; p < petals; p++) {
      const angle = (p / petals) * Math.PI * 2 + rand() * 0.5;
      const pr = size * (0.4 + rand() * 0.3);
      ctx.beginPath();
      ctx.ellipse(
        fx + Math.cos(angle) * size * 0.3,
        fy + Math.sin(angle) * size * 0.2,
        pr, pr * (0.6 + rand() * 0.3),
        rand() * Math.PI, 0, Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawStonePath(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  pathW: number,
  color: string,
  rand: () => number,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = pathW;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.06;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  const midX = (startX + endX) / 2 + (rand() - 0.5) * 20;
  const midY = (startY + endY) / 2 + (rand() - 0.5) * 8;
  ctx.quadraticCurveTo(midX, midY, endX, endY);
  ctx.stroke();
  ctx.restore();
}

export function renderGrasslandBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette,
): void {
  const rand = createSeededRandom(seed + 7000);

  // ── L0: extra-far hills — faint silhouette at horizon
  drawRollingHills(ctx, width, height, height * 0.20, height * 0.02, hexToRgba(pal.farRidge, 0.5), seed + 7005, 7);

  // ── L1: far hills + distant trees & Gothic spires
  drawRollingHills(ctx, width, height, height * 0.24, height * 0.035, pal.farRidge, seed + 7010, 9);

  for (let i = 0; i < 8; i++) {
    const tx = width * (-0.05 + rand() * 1.1);
    drawDeciduousTree(ctx, tx, height * (0.22 + rand() * 0.03), 8 + rand() * 6, 10 + rand() * 8, pal.farRidge, pal.farRidge, rand);
  }
  drawGothicSpire(ctx, width * (0.2 + rand() * 0.15), height * (0.22 + rand() * 0.02), 4 + rand() * 2, 12 + rand() * 6, 6 + rand() * 3, pal.farRidge, rand);
  drawGothicSpire(ctx, width * (0.6 + rand() * 0.2), height * (0.23 + rand() * 0.02), 3 + rand() * 2, 10 + rand() * 5, 5 + rand() * 3, pal.farRidge, rand);

  drawBirdFlock(ctx, width * (0.3 + rand() * 0.4), height * (0.14 + rand() * 0.06), 6 + Math.floor(rand() * 5), 40 + rand() * 30, pal.farRidge, rand);

  drawMistBand(ctx, width, height * 0.24, height * 0.018, pal.skyBottom, 0.05);

  // ── L2: mid hills + buildings & tree groves & hedgerows
  drawRollingHills(ctx, width, height, height * 0.32, height * 0.05, pal.midRidge, seed + 7020, 10);
  drawRollingHills(ctx, width, height, height * 0.35, height * 0.035, pal.midRidge, seed + 7022, 8);

  drawGothicSpire(ctx, width * (0.3 + rand() * 0.15), height * (0.31 + rand() * 0.02), 6 + rand() * 3, 18 + rand() * 8, 8 + rand() * 4, pal.midRidge, rand);
  if (rand() > 0.4) {
    drawGothicSpire(ctx, width * (0.7 + rand() * 0.15), height * (0.32 + rand() * 0.02), 5 + rand() * 2, 14 + rand() * 6, 7 + rand() * 3, pal.midRidge, rand);
  }

  for (let i = 0; i < 12; i++) {
    const tx = width * (-0.05 + rand() * 1.1);
    const h = 12 + rand() * 10;
    drawDeciduousTree(ctx, tx, height * (0.30 + rand() * 0.05), h, h * (0.7 + rand() * 0.4), pal.midRidge, pal.midRidge, rand);
  }
  for (let i = 0; i < 3; i++) {
    const hx = width * (rand() * 0.8);
    drawHedgerow(ctx, hx, hx + 30 + rand() * 50, height * (0.34 + rand() * 0.02), 3 + rand() * 3, pal.midRidge, rand);
  }
  for (let i = 0; i < 2; i++) {
    const sx = width * (0.1 + rand() * 0.3);
    const sy = height * (0.34 + rand() * 0.02);
    drawStonePath(ctx, sx, sy, sx + 40 + rand() * 60, sy + 5 + rand() * 8, 1.5 + rand(), pal.mountainShadow, rand);
  }

  if (rand() > 0.5) {
    drawBirdFlock(ctx, width * (0.5 + rand() * 0.3), height * (0.18 + rand() * 0.06), 4 + Math.floor(rand() * 4), 30 + rand() * 25, pal.midRidge, rand);
  }

  drawMistBand(ctx, width, height * 0.36, height * 0.022, pal.skyBottom, 0.05);

  // ── L3: near hills + large trees, hedgerows, wildflowers
  drawRollingHills(ctx, width, height, height * 0.44, height * 0.06, pal.nearRidge, seed + 7030, 10);

  for (let i = 0; i < 14; i++) {
    const tx = width * (-0.08 + rand() * 1.16);
    const h = 16 + rand() * 14;
    drawDeciduousTree(ctx, tx, height * (0.40 + rand() * 0.05), h, h * (0.65 + rand() * 0.45), pal.nearRidge, pal.nearRidge, rand);
  }
  for (let i = 0; i < 4; i++) {
    const hx = width * (-0.05 + rand() * 0.85);
    drawHedgerow(ctx, hx, hx + 25 + rand() * 55, height * (0.43 + rand() * 0.03), 4 + rand() * 4, pal.nearRidge, rand);
  }
  drawMeadowFlowers(ctx, width, height * 0.42, height * 0.48, 50,
    ["#8ab060", "#a0c870", "#c0d888", "#e8e8a0", "#d8c890"], rand,
  );

  drawMistBand(ctx, width, height * 0.46, height * 0.02, pal.skyBottom, 0.04);

  // ── L4: foreground hills + flowers + sunlight streaks
  drawRollingHills(ctx, width, height, height * 0.52, height * 0.04, pal.nearRidge, seed + 7040, 13);

  drawMeadowFlowers(ctx, width, height * 0.49, height * 0.54, 35,
    ["#7aa850", "#90c060", "#b8d880", "#d0e090"], rand,
  );

  // golden sunlight streaks
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const rayX = width * (0.1 + rand() * 0.8);
    const rayTopY = height * (0.15 + rand() * 0.1);
    const rayBotY = height * (0.45 + rand() * 0.1);
    const rayW = 8 + rand() * 15;
    const grad = ctx.createLinearGradient(rayX, rayTopY, rayX, rayBotY);
    grad.addColorStop(0, "rgba(255,250,200,0)");
    grad.addColorStop(0.2, "rgba(255,245,180,0.02)");
    grad.addColorStop(0.5, "rgba(255,240,160,0.03)");
    grad.addColorStop(0.8, "rgba(255,245,180,0.015)");
    grad.addColorStop(1, "rgba(255,250,200,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(rayX - rayW * 0.3, rayTopY);
    ctx.lineTo(rayX + rayW * 0.3, rayTopY);
    ctx.lineTo(rayX + rayW * 0.5, rayBotY);
    ctx.lineTo(rayX - rayW * 0.5, rayBotY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
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
  // shift all landscape silhouettes down so they sit above the terrain
  // rather than floating high in the sky region
  const verticalShift = height * 0.12;
  ctx.save();
  ctx.translate(0, verticalShift);

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

  ctx.restore();
}
