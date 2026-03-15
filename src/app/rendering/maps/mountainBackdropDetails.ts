import { createSeededRandom } from "../../utils/seededRandom";
import { hexToRgba } from "../../utils";

type ChallengeThemeKey =
  | "grassland"
  | "swamp"
  | "desert"
  | "winter"
  | "volcanic";

interface BackdropPalette {
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

// ─── ridge tree silhouettes ──────────────────────────────────────

const RIDGE_TREE_THEMES: Record<ChallengeThemeKey, boolean> = {
  grassland: true,
  swamp: true,
  winter: true,
  desert: false,
  volcanic: false,
};

function drawPineSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  h: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x, baseY - h);
  ctx.quadraticCurveTo(x - h * 0.18, baseY - h * 0.55, x - h * 0.28, baseY);
  ctx.lineTo(x - h * 0.04, baseY);
  ctx.lineTo(x - h * 0.04, baseY + h * 0.1);
  ctx.lineTo(x + h * 0.04, baseY + h * 0.1);
  ctx.lineTo(x + h * 0.04, baseY);
  ctx.quadraticCurveTo(x + h * 0.18, baseY - h * 0.55, x, baseY - h);
  ctx.closePath();
  ctx.fill();
}

function drawRoundTreeSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  h: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x - h * 0.03, baseY + h * 0.08);
  ctx.lineTo(x - h * 0.03, baseY - h * 0.22);
  ctx.bezierCurveTo(
    x - h * 0.38, baseY - h * 0.35,
    x - h * 0.35, baseY - h * 0.85,
    x, baseY - h,
  );
  ctx.bezierCurveTo(
    x + h * 0.35, baseY - h * 0.85,
    x + h * 0.38, baseY - h * 0.35,
    x + h * 0.03, baseY - h * 0.22,
  );
  ctx.lineTo(x + h * 0.03, baseY + h * 0.08);
  ctx.closePath();
  ctx.fill();
}

function drawGnarledSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  h: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x - h * 0.02, baseY + h * 0.08);
  ctx.lineTo(x - h * 0.04, baseY - h * 0.3);
  ctx.bezierCurveTo(
    x - h * 0.28, baseY - h * 0.55,
    x - h * 0.22, baseY - h * 0.9,
    x - h * 0.05, baseY - h * 0.88,
  );
  ctx.bezierCurveTo(
    x + h * 0.05, baseY - h * 1.02,
    x + h * 0.25, baseY - h * 0.78,
    x + h * 0.18, baseY - h * 0.52,
  );
  ctx.bezierCurveTo(
    x + h * 0.22, baseY - h * 0.38,
    x + h * 0.06, baseY - h * 0.3,
    x + h * 0.03, baseY - h * 0.3,
  );
  ctx.lineTo(x + h * 0.02, baseY + h * 0.08);
  ctx.closePath();
  ctx.fill();
}

export function drawRidgeTreeSilhouettes(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  width: number,
  themeKey: ChallengeThemeKey,
  color: string,
  seed: number,
  density: number = 0.6,
  sizeMin: number = 4,
  sizeMax: number = 12,
): void {
  if (!RIDGE_TREE_THEMES[themeKey]) return;
  const rand = createSeededRandom(seed);

  ctx.save();
  ctx.fillStyle = color;

  for (let i = 0; i < ridgePoints.length - 1; i++) {
    const p0 = ridgePoints[i];
    const p1 = ridgePoints[i + 1];
    const segLen = Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2);
    const treeCount = Math.floor(segLen / 10 * density);

    for (let j = 0; j < treeCount; j++) {
      if (rand() > density) continue;
      const t = rand();
      const tx = p0.x + (p1.x - p0.x) * t;
      const ty = p0.y + (p1.y - p0.y) * t;
      const treeH = sizeMin + rand() * (sizeMax - sizeMin);
      ctx.globalAlpha = 0.2 + rand() * 0.15;

      if (themeKey === "winter") {
        drawPineSilhouette(ctx, tx, ty, treeH);
      } else if (themeKey === "swamp") {
        drawGnarledSilhouette(ctx, tx, ty, treeH);
      } else {
        if (rand() > 0.45) {
          drawRoundTreeSilhouette(ctx, tx, ty, treeH);
        } else {
          drawPineSilhouette(ctx, tx, ty, treeH);
        }
      }
    }
  }
  ctx.restore();
}

// ─── ridge texture strata ────────────────────────────────────────

export function drawRidgeStrata(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  bottomY: number,
  color: string,
  seed: number,
  lineCount: number = 3,
): void {
  const rand = createSeededRandom(seed);
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;

  for (let line = 0; line < lineCount; line++) {
    const t = (line + 1) / (lineCount + 1);
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < ridgePoints.length; i++) {
      const p = ridgePoints[i];
      pts.push({ x: p.x, y: p.y + (bottomY - p.y) * t + (rand() - 0.5) * 2 });
    }
    drawSmoothLine(ctx, pts);
  }
  ctx.restore();
}

function drawSmoothLine(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  if (pts.length === 2) {
    ctx.lineTo(pts[1].x, pts[1].y);
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const cpx = (pts[i].x + pts[i + 1].x) / 2;
      const cpy = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpx, cpy);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
  }
  ctx.stroke();
}

// ─── atmospheric mist between layers ─────────────────────────────

export function drawMistLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  thickness: number,
  color: string,
  alpha: number,
  seed: number,
): void {
  const rand = createSeededRandom(seed);
  const grad = ctx.createLinearGradient(0, y - thickness, 0, y + thickness);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.35, hexToRgba(color, alpha * 0.35));
  grad.addColorStop(0.5, hexToRgba(color, alpha * 0.55));
  grad.addColorStop(0.65, hexToRgba(color, alpha * 0.35));
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(-20, y - thickness, width + 40, thickness * 2);

  ctx.save();
  ctx.globalAlpha = alpha * 0.2;
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const cx = rand() * width;
    const cy = y + (rand() - 0.5) * thickness * 0.4;
    const rx = 30 + rand() * 50;
    const ry = 3 + rand() * 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ─── mountain rock face detail ───────────────────────────────────

export function drawMountainRockDetail(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  basePoints: { x: number; y: number }[],
  width: number,
  height: number,
  palette: BackdropPalette,
  themeKey: ChallengeThemeKey,
  seed: number,
): void {
  const rand = createSeededRandom(seed + 2001);

  drawGeologicalStrata(ctx, ridgePoints, basePoints, palette, rand);
  drawSmoothCrevices(ctx, ridgePoints, basePoints, palette, rand);
  drawSoftAmbientOcclusion(ctx, ridgePoints, palette);
  drawReflectedLight(ctx, ridgePoints, basePoints, width, palette, themeKey);

  if (themeKey === "winter" && palette.mountainSnow) {
    drawEnhancedSnow(ctx, ridgePoints, width, height, palette, rand);
  }
  if (themeKey === "volcanic") {
    drawLavaGlow(ctx, ridgePoints, basePoints, palette, rand);
  }
  if (themeKey === "desert") {
    drawWindErosion(ctx, ridgePoints, basePoints, width, height, palette, rand);
  }
  if (themeKey === "grassland" || themeKey === "swamp") {
    drawVegetationBand(ctx, ridgePoints, basePoints, palette, themeKey, rand);
  }
}

function drawGeologicalStrata(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  basePoints: { x: number; y: number }[],
  palette: BackdropPalette,
  rand: () => number,
): void {
  ctx.save();
  ctx.strokeStyle = palette.mountainFacetB;
  ctx.lineWidth = 0.5;

  const layerCount = 4 + Math.floor(rand() * 3);
  for (let layer = 0; layer < layerCount; layer++) {
    const t = (layer + 1) / (layerCount + 1);
    ctx.globalAlpha = 0.03 + (1 - t) * 0.03;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < ridgePoints.length; i++) {
      const rp = ridgePoints[i];
      const bp = basePoints[Math.min(i, basePoints.length - 1)];
      pts.push({
        x: rp.x + (bp.x - rp.x) * t * 0.25,
        y: rp.y + (bp.y - rp.y) * t + (rand() - 0.5) * 3,
      });
    }
    drawSmoothLine(ctx, pts);
  }
  ctx.restore();
}

function drawSmoothCrevices(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  basePoints: { x: number; y: number }[],
  palette: BackdropPalette,
  rand: () => number,
): void {
  ctx.save();
  ctx.strokeStyle = palette.mountainFacetB;

  const creviceCount = 6 + Math.floor(rand() * 5);
  for (let c = 0; c < creviceCount; c++) {
    const segIdx = Math.floor(rand() * Math.max(1, ridgePoints.length - 1));
    const rp = ridgePoints[segIdx];
    const bp = basePoints[Math.min(segIdx, basePoints.length - 1)];
    const startT = 0.08 + rand() * 0.25;
    const endT = startT + 0.12 + rand() * 0.3;
    const startX = rp.x + (bp.x - rp.x) * startT * 0.2;
    const startY = rp.y + (bp.y - rp.y) * startT;
    const endX = rp.x + (bp.x - rp.x) * endT * 0.2 + (rand() - 0.5) * 8;
    const endY = rp.y + (bp.y - rp.y) * endT;
    const cpX = (startX + endX) / 2 + (rand() - 0.5) * 5;
    const cpY = (startY + endY) / 2;

    ctx.globalAlpha = 0.03 + rand() * 0.04;
    ctx.lineWidth = 0.3 + rand() * 0.3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSoftAmbientOcclusion(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  palette: BackdropPalette,
): void {
  ctx.save();
  for (let i = 1; i < ridgePoints.length - 1; i++) {
    const prev = ridgePoints[i - 1];
    const curr = ridgePoints[i];
    const next = ridgePoints[i + 1];
    if (curr.y >= prev.y || curr.y >= next.y) continue;
    const valleyDepth = Math.min(prev.y, next.y) - curr.y;
    if (valleyDepth < 4) continue;

    const grad = ctx.createRadialGradient(
      curr.x, curr.y + valleyDepth * 0.6, 0,
      curr.x, curr.y + valleyDepth * 0.6, valleyDepth * 1.8,
    );
    grad.addColorStop(0, hexToRgba(palette.mountainFacetB, 0.06));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(
      curr.x, curr.y + valleyDepth * 0.6,
      valleyDepth * 1.2, valleyDepth * 1.8,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

function drawReflectedLight(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  basePoints: { x: number; y: number }[],
  width: number,
  palette: BackdropPalette,
  themeKey: ChallengeThemeKey,
): void {
  ctx.save();
  const alpha =
    themeKey === "volcanic" ? 0.025
    : themeKey === "winter" ? 0.03
    : 0.025;
  const reflectColor = hexToRgba(palette.mountainTop, alpha);

  const grad = ctx.createLinearGradient(width * 0.75, 0, width * 0.25, 0);
  grad.addColorStop(0, reflectColor);
  grad.addColorStop(0.45, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(ridgePoints[0].x, ridgePoints[0].y);
  for (let i = 1; i < ridgePoints.length; i++) {
    ctx.lineTo(ridgePoints[i].x, ridgePoints[i].y);
  }
  for (let i = basePoints.length - 1; i >= 0; i--) {
    ctx.lineTo(basePoints[i].x, basePoints[i].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawEnhancedSnow(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  width: number,
  height: number,
  palette: BackdropPalette,
  rand: () => number,
): void {
  ctx.save();
  const snowColor = palette.mountainSnow ?? "#dceef8";

  const topPeaks = ridgePoints
    .map((p, idx) => ({ p, idx }))
    .sort((a, b) => a.p.y - b.p.y)
    .slice(0, 5);

  for (const { p, idx } of topPeaks) {
    const prev = ridgePoints[Math.max(0, idx - 1)];
    const next = ridgePoints[Math.min(ridgePoints.length - 1, idx + 1)];
    const snowDepth = 5 + rand() * 7;

    ctx.fillStyle = snowColor;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    const lx = prev.x + (p.x - prev.x) * 0.35;
    const ly = prev.y + snowDepth * 0.2;
    const rx = next.x - (next.x - p.x) * 0.35;
    const ry = next.y + snowDepth * 0.2;
    ctx.moveTo(lx, ly);
    ctx.bezierCurveTo(
      lx + (p.x - lx) * 0.5, p.y - snowDepth * 0.08,
      p.x + (rx - p.x) * 0.5, p.y - snowDepth * 0.08,
      rx, ry,
    );
    ctx.bezierCurveTo(
      rx - (rx - p.x) * 0.3, p.y + snowDepth * 0.9,
      lx + (p.x - lx) * 0.3, p.y + snowDepth * 0.85,
      lx, ly,
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawLavaGlow(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  basePoints: { x: number; y: number }[],
  palette: BackdropPalette,
  rand: () => number,
): void {
  ctx.save();
  for (let v = 0; v < 4; v++) {
    const segIdx = Math.floor(rand() * Math.max(1, ridgePoints.length - 1));
    const rp = ridgePoints[segIdx];
    const bp = basePoints[Math.min(segIdx, basePoints.length - 1)];

    const t = 0.25 + rand() * 0.35;
    const cx = rp.x + (bp.x - rp.x) * t * 0.15;
    const cy = rp.y + (bp.y - rp.y) * t;
    const radius = 8 + rand() * 14;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, "rgba(255,100,20,0.08)");
    grad.addColorStop(0.5, "rgba(255,60,10,0.03)");
    grad.addColorStop(1, "rgba(255,40,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,90,20,0.06)";
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    let px = cx;
    let py = cy;
    for (let s = 0; s < 3; s++) {
      px += (rand() - 0.5) * 6;
      py += 4 + rand() * 8;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawWindErosion(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  basePoints: { x: number; y: number }[],
  width: number,
  height: number,
  palette: BackdropPalette,
  rand: () => number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = palette.mountainTop;
  ctx.lineWidth = 0.5;

  for (let i = 0; i < 8; i++) {
    const startX = rand() * width;
    const startY = height * (0.4 + rand() * 0.28);
    const len = 20 + rand() * 40;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + len * 0.33, startY + (rand() - 0.5) * 2,
      startX + len * 0.66, startY + (rand() - 0.5) * 2,
      startX + len, startY + (rand() - 0.5) * 3,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawVegetationBand(
  ctx: CanvasRenderingContext2D,
  ridgePoints: { x: number; y: number }[],
  basePoints: { x: number; y: number }[],
  palette: BackdropPalette,
  themeKey: ChallengeThemeKey,
  rand: () => number,
): void {
  ctx.save();
  const treeLineT = 0.35;
  const bandAlpha = themeKey === "swamp" ? 0.05 : 0.04;
  const bandColor = hexToRgba(palette.mountainTop, bandAlpha);

  ctx.fillStyle = bandColor;
  ctx.beginPath();
  const upper: { x: number; y: number }[] = [];
  const lower: { x: number; y: number }[] = [];
  for (let i = 0; i < ridgePoints.length; i++) {
    const rp = ridgePoints[i];
    const bp = basePoints[Math.min(i, basePoints.length - 1)];
    upper.push({ x: rp.x, y: rp.y + (bp.y - rp.y) * treeLineT + (rand() - 0.5) * 2 });
    lower.push({ x: rp.x, y: rp.y + (bp.y - rp.y) * (treeLineT + 0.07) + (rand() - 0.5) * 1.5 });
  }

  ctx.moveTo(upper[0].x, upper[0].y);
  for (let i = 1; i < upper.length - 1; i++) {
    const cpx = (upper[i].x + upper[i + 1].x) / 2;
    const cpy = (upper[i].y + upper[i + 1].y) / 2;
    ctx.quadraticCurveTo(upper[i].x, upper[i].y, cpx, cpy);
  }
  ctx.lineTo(upper[upper.length - 1].x, upper[upper.length - 1].y);

  for (let i = lower.length - 1; i > 0; i--) {
    const cpx = (lower[i].x + lower[i - 1].x) / 2;
    const cpy = (lower[i].y + lower[i - 1].y) / 2;
    ctx.quadraticCurveTo(lower[i].x, lower[i].y, cpx, cpy);
  }
  ctx.lineTo(lower[0].x, lower[0].y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = hexToRgba(palette.mountainTop, 0.2);
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < upper.length; i++) {
    if (rand() > 0.3) continue;
    const tx = upper[i].x + (rand() - 0.5) * 8;
    const ty = upper[i].y;
    const h = 2 + rand() * 3;
    if (themeKey === "swamp") {
      drawGnarledSilhouette(ctx, tx, ty, h);
    } else {
      drawRoundTreeSilhouette(ctx, tx, ty, h);
    }
  }
  ctx.restore();
}

// ─── enhanced cloud rendering ────────────────────────────────────

export function drawVolumetricCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cloudWidth: number,
  cloudHeight: number,
  color: string,
  shadowColor: string,
  seed: number,
): void {
  const rand = createSeededRandom(seed);
  const blobCount = 3 + Math.floor(rand() * 2);

  ctx.save();

  ctx.globalAlpha = 0.04;
  ctx.fillStyle = shadowColor;
  for (let i = 0; i < blobCount; i++) {
    const bx = x + (rand() - 0.5) * cloudWidth * 0.6;
    const by = y + cloudHeight * 0.1 + rand() * cloudHeight * 0.1;
    const rx = cloudWidth * (0.15 + rand() * 0.15);
    const ry = cloudHeight * (0.22 + rand() * 0.15);
    ctx.beginPath();
    ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = color;
  for (let i = 0; i < blobCount + 1; i++) {
    const bx = x + (rand() - 0.5) * cloudWidth * 0.55;
    const by = y + (rand() - 0.5) * cloudHeight * 0.25;
    const rx = cloudWidth * (0.12 + rand() * 0.16);
    const ry = cloudHeight * (0.18 + rand() * 0.2);
    ctx.globalAlpha = 0.05 + rand() * 0.04;
    ctx.beginPath();
    ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.07;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, cloudWidth * 0.22, cloudHeight * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── distant mountain layers ─────────────────────────────────────

export function drawDistantPeaks(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  amplitude: number,
  color: string,
  seed: number,
  peakCount: number = 5,
): void {
  const rand = createSeededRandom(seed);
  ctx.save();
  ctx.fillStyle = color;

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= peakCount * 2; i++) {
    const t = i / (peakCount * 2);
    const x = -20 + t * (width + 40);
    const isPeak = i % 2 === 1;
    const peakH = isPeak
      ? amplitude * (0.35 + rand() * 0.5)
      : amplitude * (0.06 + rand() * 0.1);
    pts.push({ x, y: baseY - peakH });
  }

  ctx.beginPath();
  ctx.moveTo(-20, baseY + amplitude * 2);
  ctx.lineTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const cpx = (pts[i].x + pts[i + 1].x) / 2;
    const cpy = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpx, cpy);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.lineTo(width + 20, baseY + amplitude * 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── god rays ────────────────────────────────────────────────────

export function drawGodRays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  themeKey: ChallengeThemeKey,
  seed: number,
): void {
  const rand = createSeededRandom(seed);
  const rayCount = 2 + Math.floor(rand() * 2);

  let rayColor: string;
  let rayAlpha: number;
  switch (themeKey) {
    case "grassland":
      rayColor = "rgba(255,255,220,";
      rayAlpha = 0.016;
      break;
    case "desert":
      rayColor = "rgba(255,238,200,";
      rayAlpha = 0.02;
      break;
    case "winter":
      rayColor = "rgba(215,235,255,";
      rayAlpha = 0.014;
      break;
    case "volcanic":
      rayColor = "rgba(255,140,80,";
      rayAlpha = 0.01;
      break;
    default:
      return;
  }

  ctx.save();
  for (let i = 0; i < rayCount; i++) {
    const startX = width * (0.25 + rand() * 0.5);
    const startY = 0;
    const endX = startX + (rand() - 0.5) * width * 0.2;
    const endY = height * (0.4 + rand() * 0.2);
    const spread = 14 + rand() * 20;

    const grad = ctx.createLinearGradient(startX, startY, endX, endY);
    grad.addColorStop(0, `${rayColor}${rayAlpha})`);
    grad.addColorStop(0.4, `${rayColor}${rayAlpha * 0.5})`);
    grad.addColorStop(1, `${rayColor}0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(startX - spread * 0.2, startY);
    ctx.lineTo(startX + spread * 0.2, startY);
    ctx.lineTo(endX + spread, endY);
    ctx.lineTo(endX - spread, endY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
