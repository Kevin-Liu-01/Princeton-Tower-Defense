import type { Position } from "../../types";
import type { RegionTheme } from "./staticLayer";
import { hexToRgb, hexToRgba } from "../../utils";
import { createSeededRandom } from "../../utils/seededRandom";

const ISO_T = 0.5;

export interface PathDecorationParams {
  ctx: CanvasRenderingContext2D;
  screenCenter: Position[];
  screenLeft: Position[];
  screenRight: Position[];
  smoothPath: Position[];
  theme: RegionTheme;
  themeName: string;
  cameraZoom: number;
  mapSeed: number;
  toScreen: (pos: Position) => Position;
  skipPathShadows?: boolean;
}

export interface IsoStonePalette {
  top: string;
  left: string;
  right: string;
}

export function buildStonePalettes(
  pathColors: string[],
  alpha: number,
): IsoStonePalette[] {
  return pathColors.map((hex) => {
    const { r, g, b } = hexToRgb(hex);
    return {
      top: `rgba(${Math.min(255, r + 22)},${Math.min(255, g + 22)},${Math.min(255, b + 22)},${alpha})`,
      left: `rgba(${Math.max(0, r - 12)},${Math.max(0, g - 12)},${Math.max(0, b - 12)},${alpha * 0.85})`,
      right: `rgba(${Math.max(0, r - 32)},${Math.max(0, g - 32)},${Math.max(0, b - 32)},${alpha * 0.72})`,
    };
  });
}

export function drawIsoPathStone(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hw: number,
  h: number,
  topColor: string,
  leftColor: string,
  rightColor: string,
): void {
  const hd = hw * ISO_T;

  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx - hw, cy - h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx + hw, cy - h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hd - h);
  ctx.lineTo(cx + hw, cy - h);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx - hw, cy - h);
  ctx.closePath();
  ctx.fill();
}

function lerpPos(a: Position, b: Position, t: number): Position {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function clampIdx(i: number, arr: Position[]): number {
  return Math.min(i, arr.length - 1);
}

function drawLayeredPathEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rotation: number,
  colors: {
    shadow: string;
    base: string;
    inner?: string;
    highlight?: string;
  },
  shadowOffsetX: number,
  shadowOffsetY: number,
): void {
  ctx.fillStyle = colors.shadow;
  ctx.beginPath();
  ctx.ellipse(
    x + shadowOffsetX,
    y + shadowOffsetY,
    rx,
    ry,
    rotation,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = colors.base;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fill();

  if (colors.inner) {
    ctx.fillStyle = colors.inner;
    ctx.beginPath();
    ctx.ellipse(
      x + rx * 0.08,
      y + ry * 0.06,
      rx * 0.62,
      ry * 0.58,
      rotation,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  if (colors.highlight) {
    ctx.fillStyle = colors.highlight;
    ctx.beginPath();
    ctx.ellipse(
      x - rx * 0.22,
      y - ry * 0.18,
      rx * 0.42,
      ry * 0.32,
      rotation,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

// ─── Common Decorations ──────────────────────────────────────────────────────

function drawPathWearGradient(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight } = p;
  const len = screenCenter.length;
  if (len < 2) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.beginPath();
  ctx.moveTo(screenLeft[0].x, screenLeft[0].y);
  for (let i = 1; i < len; i++) ctx.lineTo(screenLeft[i].x, screenLeft[i].y);
  for (let i = len - 1; i >= 0; i--) {
    const p2 = lerpPos(screenCenter[i], screenLeft[i], 0.55);
    ctx.lineTo(p2.x, p2.y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(screenRight[0].x, screenRight[0].y);
  for (let i = 1; i < len; i++) ctx.lineTo(screenRight[i].x, screenRight[i].y);
  for (let i = len - 1; i >= 0; i--) {
    const p2 = lerpPos(screenCenter[i], screenRight[i], 0.55);
    ctx.lineTo(p2.x, p2.y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
  ctx.beginPath();
  for (let i = 0; i < len; i++) {
    const lx = lerpPos(screenCenter[i], screenLeft[i], 0.18);
    if (i === 0) ctx.moveTo(lx.x, lx.y);
    else ctx.lineTo(lx.x, lx.y);
  }
  for (let i = len - 1; i >= 0; i--) {
    const rx = lerpPos(screenCenter[i], screenRight[i], 0.18);
    ctx.lineTo(rx.x, rx.y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSurfaceTexture(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, theme, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 600);

  for (let i = 0; i < len; i += 2) {
    if (rand() > 0.35) continue;
    const t = 0.15 + rand() * 0.7;
    const pos = lerpPos(
      screenLeft[clampIdx(i, screenLeft)],
      screenRight[clampIdx(i, screenRight)],
      t,
    );
    const ox = pos.x + (rand() - 0.5) * 8 * cameraZoom;
    const oy = pos.y + (rand() - 0.5) * 4 * cameraZoom;
    const hw = (1.2 + rand() * 2) * cameraZoom;
    const hd = hw * ISO_T;
    const alpha = 0.05 + rand() * 0.05;

    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(ox, oy - hd);
    ctx.lineTo(ox + hw, oy);
    ctx.lineTo(ox, oy + hd);
    ctx.lineTo(ox - hw, oy);
    ctx.closePath();
    ctx.fill();

    if (rand() > 0.6) {
      ctx.fillStyle = hexToRgba(theme.path[0], 0.05 + rand() * 0.04);
      ctx.beginPath();
      ctx.moveTo(ox, oy - hd);
      ctx.lineTo(ox - hw * 0.5, oy - hd * 0.25);
      ctx.lineTo(ox, oy + hd * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawEdgeBorderStones(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, theme, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 500);
  const palettes = buildStonePalettes(theme.path, 0.72);

  for (let i = 0; i < len; i += 3) {
    if (rand() > 0.5) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const inset = 0.05 + rand() * 0.08;
    const px = edgeP.x + (centerP.x - edgeP.x) * inset;
    const py = edgeP.y + (centerP.y - edgeP.y) * inset * 0.75;
    const hw = (2.5 + rand() * 3.5) * cameraZoom;
    const h = (1.2 + rand() * 2) * cameraZoom;
    const hd = hw * ISO_T;
    const pal = palettes[Math.floor(rand() * palettes.length)];
    const shOff = 1.2 * cameraZoom;

    ctx.fillStyle = `rgba(0,0,0,${0.18 + rand() * 0.08})`;
    ctx.beginPath();
    ctx.moveTo(px + shOff, py + shOff * 0.5 - hd);
    ctx.lineTo(px + shOff + hw, py + shOff * 0.5);
    ctx.lineTo(px + shOff, py + shOff * 0.5 + hd);
    ctx.lineTo(px + shOff - hw, py + shOff * 0.5);
    ctx.closePath();
    ctx.fill();

    drawIsoPathStone(ctx, px, py, hw, h, pal.top, pal.left, pal.right);

    ctx.fillStyle = `rgba(255,255,255,${0.06 + rand() * 0.05})`;
    ctx.beginPath();
    ctx.moveTo(px, py - hd - h);
    ctx.lineTo(px - hw * 0.6, py - h - hd * 0.2);
    ctx.lineTo(px, py + hd * 0.3 - h);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── GRASSLAND ───────────────────────────────────────────────────────────────

function drawGrasslandPathDetails(p: PathDecorationParams): void {
  drawCobblestonePattern(p);
  drawGrassTufts(p);
  drawWildflowers(p);
  drawWornDirtPatches(p);
  drawPathEdgeMoss(p);
  drawScatteredLeafLitter(p);
}

function drawCobblestonePattern(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, theme, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 700);

  ctx.strokeStyle = hexToRgba(theme.path[2], 0.13);
  ctx.lineWidth = 1.2 * cameraZoom;

  for (let i = 2; i < len; i += 4) {
    const count = 1 + Math.floor(rand() * 2.5);
    for (let c = 0; c < count; c++) {
      const t = 0.12 + rand() * 0.76;
      const pos = lerpPos(
        screenLeft[clampIdx(i, screenLeft)],
        screenRight[clampIdx(i, screenRight)],
        t,
      );
      const stoneHW = (4 + rand() * 5) * cameraZoom;
      const stoneHD = stoneHW * ISO_T;
      const ox = pos.x + (rand() - 0.5) * 6 * cameraZoom;
      const oy = pos.y + (rand() - 0.5) * 3 * cameraZoom;

      ctx.beginPath();
      ctx.moveTo(ox, oy - stoneHD);
      ctx.lineTo(ox + stoneHW, oy);
      ctx.lineTo(ox, oy + stoneHD);
      ctx.lineTo(ox - stoneHW, oy);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function drawGrassTufts(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 710);
  const grassColors = ["#4a8c3f", "#3a7a30", "#5a9c4f", "#2d6b22"];

  for (let i = 0; i < len; i += 5) {
    if (rand() > 0.55) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const bx = edgeP.x + (edgeP.x - centerP.x) * 0.08;
    const by = edgeP.y + (edgeP.y - centerP.y) * 0.04;
    const bladeCount = 2 + Math.floor(rand() * 3);

    for (let b = 0; b < bladeCount; b++) {
      ctx.fillStyle = grassColors[Math.floor(rand() * grassColors.length)];
      const bxOff = bx + (rand() - 0.5) * 6 * cameraZoom;
      const byOff = by + (rand() - 0.5) * 3 * cameraZoom;
      const bladeH = (4 + rand() * 5) * cameraZoom;
      const bladeW = (1 + rand() * 1.5) * cameraZoom;
      const lean = (rand() - 0.5) * 3 * cameraZoom;

      ctx.beginPath();
      ctx.moveTo(bxOff - bladeW, byOff);
      ctx.lineTo(bxOff + lean, byOff - bladeH);
      ctx.lineTo(bxOff + bladeW, byOff);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawWildflowers(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 720);
  const flowerColors = ["#e8c840", "#c84090", "#e8e8e8", "#d06030", "#9060c0"];

  for (let i = 0; i < len; i += 8) {
    if (rand() > 0.4) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const fx = edgeP.x + (edgeP.x - centerP.x) * 0.12 + (rand() - 0.5) * 4 * cameraZoom;
    const fy = edgeP.y + (edgeP.y - centerP.y) * 0.06;
    const color = flowerColors[Math.floor(rand() * flowerColors.length)];
    const size = (1.5 + rand() * 2) * cameraZoom;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(fx, fy, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff8d0";
    ctx.beginPath();
    ctx.arc(fx, fy, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWornDirtPatches(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, theme, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 730);

  for (let i = 0; i < len; i += 12) {
    if (rand() > 0.4) continue;
    const t = 0.2 + rand() * 0.6;
    const pos = lerpPos(
      screenLeft[clampIdx(i, screenLeft)],
      screenRight[clampIdx(i, screenRight)],
      t,
    );
    const patchW = (8 + rand() * 10) * cameraZoom;
    const patchH = (5 + rand() * 7) * cameraZoom;
    const ox = pos.x + (rand() - 0.5) * 5 * cameraZoom;
    const oy = pos.y + (rand() - 0.5) * 3 * cameraZoom;
    const rotation = rand() * 0.4;

    drawLayeredPathEllipse(
      ctx,
      ox,
      oy,
      patchW,
      patchH * 0.4,
      rotation,
      {
        shadow: hexToRgba(theme.ground[2], 0.05 + rand() * 0.04),
        base: hexToRgba(theme.ground[1], 0.09 + rand() * 0.05),
        inner: hexToRgba(theme.ground[2], 0.03 + rand() * 0.03),
        highlight: hexToRgba(theme.path[0], 0.03 + rand() * 0.03),
      },
      1.2 * cameraZoom,
      0.7 * cameraZoom,
    );
  }
}

function drawPathEdgeMoss(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 740);
  const mossColors = ["#3a6a28", "#2e5a1e", "#4a7a34", "#345a22"];

  for (let i = 0; i < len; i += 4) {
    if (rand() > 0.6) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const mx = edgeP.x + (edgeP.x - centerP.x) * (0.02 + rand() * 0.06);
    const my = edgeP.y + (edgeP.y - centerP.y) * 0.02;
    const mossSize = (3 + rand() * 5) * cameraZoom;
    const color = mossColors[Math.floor(rand() * mossColors.length)];

    ctx.globalAlpha = 0.18 + rand() * 0.14;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(
      mx, my,
      mossSize, mossSize * 0.45,
      rand() * Math.PI,
      0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawScatteredLeafLitter(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 750);
  const leafColors = ["#5a4020", "#6a5030", "#4a3818", "#7a6a40"];

  for (let i = 0; i < len; i += 7) {
    if (rand() > 0.45) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const lx = edgeP.x + (edgeP.x - centerP.x) * (0.05 + rand() * 0.12);
    const ly = edgeP.y + (edgeP.y - centerP.y) * 0.04;
    const leafSize = (1.5 + rand() * 2.5) * cameraZoom;
    const color = leafColors[Math.floor(rand() * leafColors.length)];

    ctx.globalAlpha = 0.12 + rand() * 0.10;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(rand() * Math.PI * 2);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, leafSize, leafSize * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ─── DESERT ──────────────────────────────────────────────────────────────────

function drawDesertPathDetails(p: PathDecorationParams): void {
  drawSandDriftLines(p);
  drawCrackedEarth(p);
  drawSandAccumulation(p);
  drawDesertDebris(p);
}

function drawSandDriftLines(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, theme, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 800);

  ctx.strokeStyle = hexToRgba(theme.path[1], 0.12);
  ctx.lineWidth = 1.5 * cameraZoom;

  for (let i = 4; i < len - 4; i += 7) {
    if (rand() > 0.55) continue;
    const startT = rand() * 0.3;
    const endT = 0.7 + rand() * 0.3;
    const startPos = lerpPos(
      screenLeft[clampIdx(i, screenLeft)],
      screenRight[clampIdx(i, screenRight)],
      startT,
    );
    const endIdx = Math.min(i + 3, len - 1);
    const endPos = lerpPos(
      screenLeft[clampIdx(endIdx, screenLeft)],
      screenRight[clampIdx(endIdx, screenRight)],
      endT,
    );
    const midX = (startPos.x + endPos.x) / 2 + (rand() - 0.5) * 8 * cameraZoom;
    const midY = (startPos.y + endPos.y) / 2 + (rand() - 0.5) * 4 * cameraZoom;

    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.quadraticCurveTo(midX, midY, endPos.x, endPos.y);
    ctx.stroke();
  }
}

function drawCrackedEarth(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 810);

  ctx.strokeStyle = "rgba(80, 50, 20, 0.14)";
  ctx.lineWidth = 1 * cameraZoom;

  for (let i = 5; i < len - 5; i += 12) {
    if (rand() > 0.5) continue;
    const t = 0.2 + rand() * 0.6;
    const cp = lerpPos(
      screenLeft[clampIdx(i, screenLeft)],
      screenRight[clampIdx(i, screenRight)],
      t,
    );
    const crackLen = (8 + rand() * 12) * cameraZoom;
    const a1 = rand() * Math.PI * 2;
    const a2 = a1 + Math.PI * (0.5 + rand() * 0.5);
    const a3 = a1 - Math.PI * (0.3 + rand() * 0.4);

    ctx.beginPath();
    ctx.moveTo(cp.x + Math.cos(a1) * crackLen, cp.y + Math.sin(a1) * crackLen * 0.5);
    ctx.lineTo(cp.x, cp.y);
    ctx.lineTo(cp.x + Math.cos(a2) * crackLen * 0.7, cp.y + Math.sin(a2) * crackLen * 0.35);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cp.x, cp.y);
    ctx.lineTo(cp.x + Math.cos(a3) * crackLen * 0.5, cp.y + Math.sin(a3) * crackLen * 0.25);
    ctx.stroke();
  }
}

function drawSandAccumulation(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, theme, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 820);

  for (let i = 0; i < len; i += 10) {
    if (rand() > 0.45) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const sx = edgeP.x + (centerP.x - edgeP.x) * 0.12;
    const sy = edgeP.y + (centerP.y - edgeP.y) * 0.08;
    const pileW = (8 + rand() * 12) * cameraZoom;
    const pileH = (3 + rand() * 5) * cameraZoom;

    ctx.fillStyle = hexToRgba(theme.path[1], 0.18 + rand() * 0.1);
    ctx.beginPath();
    ctx.ellipse(sx, sy, pileW, pileH * 0.4, rand() * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDesertDebris(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 830);

  for (let i = 0; i < len; i += 15) {
    if (rand() > 0.3) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const dx = side[i].x + (rand() - 0.5) * 4 * cameraZoom;
    const dy = side[i].y + (rand() - 0.5) * 2 * cameraZoom;
    const boneLen = (4 + rand() * 6) * cameraZoom;
    const angle = rand() * Math.PI;

    ctx.strokeStyle = `rgba(220, 200, 170, ${0.25 + rand() * 0.15})`;
    ctx.lineWidth = 1.5 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(dx - Math.cos(angle) * boneLen, dy - Math.sin(angle) * boneLen * 0.5);
    ctx.lineTo(dx + Math.cos(angle) * boneLen, dy + Math.sin(angle) * boneLen * 0.5);
    ctx.stroke();

    if (rand() > 0.6) {
      const knobSize = 1.5 * cameraZoom;
      ctx.fillStyle = `rgba(220, 200, 170, ${0.3 + rand() * 0.15})`;
      ctx.beginPath();
      ctx.arc(dx - Math.cos(angle) * boneLen, dy - Math.sin(angle) * boneLen * 0.5, knobSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dx + Math.cos(angle) * boneLen, dy + Math.sin(angle) * boneLen * 0.5, knobSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── WINTER ──────────────────────────────────────────────────────────────────

function drawWinterPathDetails(p: PathDecorationParams): void {
  drawSnowBanks(p);
  drawIcePatches(p);
  drawFrostCrystals(p);
  drawPackedSnowTexture(p);
}

function drawSnowBanks(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 900);

  for (let i = 0; i < len; i += 4) {
    if (rand() > 0.55) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const sx = edgeP.x + (edgeP.x - centerP.x) * 0.04;
    const sy = edgeP.y + (edgeP.y - centerP.y) * 0.02;
    const moundW = (6 + rand() * 10) * cameraZoom;
    const moundH = (3 + rand() * 4) * cameraZoom;

    ctx.fillStyle = "rgba(80, 100, 140, 0.12)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + moundH * 0.12, moundW, moundH * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(225, 238, 255, ${0.4 + rand() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy, moundW, moundH * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + rand() * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(sx - moundW * 0.15, sy - moundH * 0.04, moundW * 0.45, moundH * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIcePatches(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 910);

  for (let i = 0; i < len; i += 14) {
    if (rand() > 0.4) continue;
    const t = 0.2 + rand() * 0.6;
    const pos = lerpPos(
      screenLeft[clampIdx(i, screenLeft)],
      screenRight[clampIdx(i, screenRight)],
      t,
    );
    const iceW = (8 + rand() * 14) * cameraZoom;
    const iceH = (5 + rand() * 8) * cameraZoom;
    const ox = pos.x + (rand() - 0.5) * 6 * cameraZoom;
    const oy = pos.y + (rand() - 0.5) * 3 * cameraZoom;

    ctx.fillStyle = `rgba(180, 210, 245, ${0.1 + rand() * 0.07})`;
    ctx.beginPath();
    ctx.ellipse(ox, oy, iceW, iceH * 0.38, rand() * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${0.12 + rand() * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(ox - iceW * 0.2, oy - iceH * 0.06, iceW * 0.3, iceH * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFrostCrystals(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 920);

  ctx.strokeStyle = "rgba(200, 225, 255, 0.13)";
  ctx.lineWidth = 0.8 * cameraZoom;

  for (let i = 0; i < len; i += 8) {
    if (rand() > 0.4) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const fx = edgeP.x + (centerP.x - edgeP.x) * 0.1;
    const fy = edgeP.y + (centerP.y - edgeP.y) * 0.06;
    const crystalSize = (3 + rand() * 4) * cameraZoom;
    const arms = 3 + Math.floor(rand() * 2);
    const startAngle = rand() * Math.PI;

    for (let a = 0; a < arms; a++) {
      const angle = startAngle + (a * Math.PI) / arms;
      ctx.beginPath();
      ctx.moveTo(fx - Math.cos(angle) * crystalSize, fy - Math.sin(angle) * crystalSize * 0.5);
      ctx.lineTo(fx + Math.cos(angle) * crystalSize, fy + Math.sin(angle) * crystalSize * 0.5);
      ctx.stroke();
    }
  }
}

function drawPackedSnowTexture(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 930);

  for (let i = 0; i < len; i += 3) {
    if (rand() > 0.3) continue;
    const t = 0.15 + rand() * 0.7;
    const pos = lerpPos(
      screenLeft[clampIdx(i, screenLeft)],
      screenRight[clampIdx(i, screenRight)],
      t,
    );
    const size = (1.5 + rand() * 2.5) * cameraZoom;
    const ox = pos.x + (rand() - 0.5) * 8 * cameraZoom;
    const oy = pos.y + (rand() - 0.5) * 4 * cameraZoom;
    const rotation = rand() * Math.PI;

    drawLayeredPathEllipse(
      ctx,
      ox,
      oy,
      size,
      size * 0.5,
      rotation,
      {
        shadow: `rgba(150, 170, 195, ${0.03 + rand() * 0.03})`,
        base: `rgba(200, 215, 235, ${0.05 + rand() * 0.04})`,
        inner: `rgba(215, 228, 245, ${0.03 + rand() * 0.03})`,
        highlight: `rgba(255, 255, 255, ${0.05 + rand() * 0.04})`,
      },
      0.8 * cameraZoom,
      0.45 * cameraZoom,
    );
  }
}

// ─── VOLCANIC ────────────────────────────────────────────────────────────────

function drawVolcanicPathDetails(p: PathDecorationParams): void {
  drawLavaVeins(p);
  drawEmberSpots(p);
  drawCharredEdgeRocks(p);
  drawAshPatches(p);
}

function drawLavaVeins(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 1000);

  for (let i = 6; i < len - 6; i += 10) {
    if (rand() > 0.45) continue;
    const t = 0.2 + rand() * 0.6;
    const startPos = lerpPos(
      screenLeft[clampIdx(i, screenLeft)],
      screenRight[clampIdx(i, screenRight)],
      t,
    );
    const veinLen = (10 + rand() * 20) * cameraZoom;
    const angle = rand() * Math.PI;
    const endX = startPos.x + Math.cos(angle) * veinLen;
    const endY = startPos.y + Math.sin(angle) * veinLen * 0.5;
    const midX = (startPos.x + endX) / 2 + (rand() - 0.5) * 6 * cameraZoom;
    const midY = (startPos.y + endY) / 2 + (rand() - 0.5) * 3 * cameraZoom;

    ctx.strokeStyle = `rgba(255, 100, 20, ${0.08 + rand() * 0.06})`;
    ctx.lineWidth = 4 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 140, 40, ${0.2 + rand() * 0.12})`;
    ctx.lineWidth = 1.5 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 200, 80, ${0.12 + rand() * 0.08})`;
    ctx.lineWidth = 0.7 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();
  }
}

function drawEmberSpots(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 1010);

  for (let i = 0; i < len; i += 4) {
    if (rand() > 0.3) continue;
    const t = 0.1 + rand() * 0.8;
    const pos = lerpPos(
      screenLeft[clampIdx(i, screenLeft)],
      screenRight[clampIdx(i, screenRight)],
      t,
    );
    const ox = pos.x + (rand() - 0.5) * 10 * cameraZoom;
    const oy = pos.y + (rand() - 0.5) * 5 * cameraZoom;
    const size = (1 + rand() * 2.5) * cameraZoom;
    const brightness = rand();

    ctx.fillStyle = `rgba(255, 80, 0, ${0.06 + brightness * 0.05})`;
    ctx.beginPath();
    ctx.arc(ox, oy, size * 2.5, 0, Math.PI * 2);
    ctx.fill();

    const g = Math.round(80 + brightness * 120);
    const b = Math.round(brightness * 40);
    ctx.fillStyle = `rgba(255, ${g}, ${b}, ${0.35 + brightness * 0.25})`;
    ctx.beginPath();
    ctx.arc(ox, oy, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCharredEdgeRocks(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 1020);

  for (let i = 0; i < len; i += 6) {
    if (rand() > 0.5) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const rx = edgeP.x + (centerP.x - edgeP.x) * 0.05;
    const ry = edgeP.y + (centerP.y - edgeP.y) * 0.03;
    const hw = (2.5 + rand() * 4) * cameraZoom;
    const h = (1.5 + rand() * 2.5) * cameraZoom;
    const hd = hw * ISO_T;
    const a = 0.55 + rand() * 0.2;

    const shOff = 1 * cameraZoom;
    ctx.fillStyle = `rgba(0,0,0,${0.2 + rand() * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(rx + shOff, ry + shOff * 0.5 - hd);
    ctx.lineTo(rx + shOff + hw, ry + shOff * 0.5);
    ctx.lineTo(rx + shOff, ry + shOff * 0.5 + hd);
    ctx.lineTo(rx + shOff - hw, ry + shOff * 0.5);
    ctx.closePath();
    ctx.fill();

    drawIsoPathStone(
      ctx, rx, ry, hw, h,
      `rgba(45,25,15,${a})`,
      `rgba(30,15,10,${a})`,
      `rgba(20,8,5,${a})`,
    );

    ctx.fillStyle = `rgba(200,60,20,${0.1 + rand() * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(rx, ry - hd - h);
    ctx.lineTo(rx + hw * 0.6, ry - h);
    ctx.lineTo(rx, ry + hd * 0.4 - h);
    ctx.closePath();
    ctx.fill();
  }
}

function drawAshPatches(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 1030);

  for (let i = 0; i < len; i += 8) {
    if (rand() > 0.4) continue;
    const t = 0.1 + rand() * 0.8;
    const pos = lerpPos(
      screenLeft[clampIdx(i, screenLeft)],
      screenRight[clampIdx(i, screenRight)],
      t,
    );
    const patchW = (6 + rand() * 10) * cameraZoom;
    const patchH = (4 + rand() * 6) * cameraZoom;
    const ox = pos.x + (rand() - 0.5) * 6 * cameraZoom;
    const oy = pos.y + (rand() - 0.5) * 3 * cameraZoom;
    const rotation = rand() * Math.PI;

    drawLayeredPathEllipse(
      ctx,
      ox,
      oy,
      patchW,
      patchH * 0.4,
      rotation,
      {
        shadow: `rgba(20, 18, 16, ${0.04 + rand() * 0.03})`,
        base: `rgba(60, 55, 50, ${0.07 + rand() * 0.05})`,
        inner: `rgba(42, 38, 35, ${0.04 + rand() * 0.03})`,
        highlight: `rgba(120, 110, 100, ${0.025 + rand() * 0.02})`,
      },
      1.1 * cameraZoom,
      0.6 * cameraZoom,
    );
  }
}

// ─── SWAMP ───────────────────────────────────────────────────────────────────

function drawSwampPathDetails(p: PathDecorationParams): void {
  drawMudPuddles(p);
  drawMossPatches(p);
  drawRootTendrils(p);
  drawSwampAccents(p);
}

function drawMudPuddles(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 1100);

  for (let i = 0; i < len; i += 10) {
    if (rand() > 0.45) continue;
    const t = 0.2 + rand() * 0.6;
    const pos = lerpPos(
      screenLeft[clampIdx(i, screenLeft)],
      screenRight[clampIdx(i, screenRight)],
      t,
    );
    const puddleW = (8 + rand() * 14) * cameraZoom;
    const puddleH = (5 + rand() * 8) * cameraZoom;
    const ox = pos.x + (rand() - 0.5) * 6 * cameraZoom;
    const oy = pos.y + (rand() - 0.5) * 3 * cameraZoom;

    ctx.fillStyle = `rgba(20, 30, 15, ${0.13 + rand() * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(ox, oy, puddleW, puddleH * 0.38, rand() * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(50, 70, 40, ${0.06 + rand() * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(ox - puddleW * 0.1, oy - puddleH * 0.03, puddleW * 0.55, puddleH * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMossPatches(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 1110);
  const mossColors = ["rgba(40, 80, 30, 0.18)", "rgba(50, 90, 40, 0.15)", "rgba(30, 70, 25, 0.2)"];

  for (let i = 0; i < len; i += 5) {
    if (rand() > 0.5) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const mx = edgeP.x + (centerP.x - edgeP.x) * (0.05 + rand() * 0.2);
    const my = edgeP.y + (centerP.y - edgeP.y) * (0.03 + rand() * 0.12);
    const mossW = (4 + rand() * 8) * cameraZoom;
    const mossH = (3 + rand() * 5) * cameraZoom;

    ctx.fillStyle = mossColors[Math.floor(rand() * mossColors.length)];
    ctx.beginPath();
    ctx.ellipse(mx, my, mossW, mossH * 0.4, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRootTendrils(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 1120);

  ctx.lineWidth = 1.2 * cameraZoom;

  for (let i = 0; i < len; i += 9) {
    if (rand() > 0.4) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const inward = rand() * 0.3;
    const startX = edgeP.x;
    const startY = edgeP.y;
    const endX = edgeP.x + (centerP.x - edgeP.x) * inward;
    const endY = edgeP.y + (centerP.y - edgeP.y) * inward * 0.8;
    const rootLen = (10 + rand() * 15) * cameraZoom;
    const ctrlX = (startX + endX) / 2 + (rand() - 0.5) * rootLen * 0.5;
    const ctrlY = (startY + endY) / 2 + (rand() - 0.5) * rootLen * 0.25;

    ctx.strokeStyle = `rgba(60, 40, 20, ${0.18 + rand() * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
    ctx.stroke();
  }
}

function drawSwampAccents(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 1130);
  const mushroomColors = ["#8b6b3e", "#6b8b3e", "#7a6b4e", "#5a7a3e"];
  const glowColors = [
    "rgba(80, 200, 100, 0.22)",
    "rgba(100, 220, 120, 0.18)",
    "rgba(60, 180, 90, 0.25)",
  ];

  for (let i = 0; i < len; i += 12) {
    if (rand() > 0.35) continue;
    const side = rand() > 0.5 ? screenLeft : screenRight;
    if (i >= side.length) continue;

    const edgeP = side[i];
    const centerP = screenCenter[i];
    const mx = edgeP.x + (edgeP.x - centerP.x) * 0.04 + (rand() - 0.5) * 4 * cameraZoom;
    const my = edgeP.y + (edgeP.y - centerP.y) * 0.02;

    if (rand() > 0.5) {
      const capSize = (2 + rand() * 3) * cameraZoom;
      ctx.fillStyle = mushroomColors[Math.floor(rand() * mushroomColors.length)];
      ctx.beginPath();
      ctx.ellipse(mx, my, capSize, capSize * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 200, 0.12)";
      ctx.beginPath();
      ctx.ellipse(mx - capSize * 0.2, my - capSize * 0.08, capSize * 0.3, capSize * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const glowSize = (2 + rand() * 3) * cameraZoom;
      ctx.fillStyle = glowColors[Math.floor(rand() * glowColors.length)];
      ctx.beginPath();
      ctx.arc(mx, my, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(120, 255, 150, 0.25)";
      ctx.beginPath();
      ctx.arc(mx, my, glowSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

export function drawPathDecorations(params: PathDecorationParams): void {
  if (params.screenCenter.length < 2) return;

  if (!params.skipPathShadows) {
    drawPathWearGradient(params);
  }
  drawSurfaceTexture(params);
  drawEdgeBorderStones(params);

  switch (params.themeName) {
    case "grassland":
      drawGrasslandPathDetails(params);
      break;
    case "desert":
      drawDesertPathDetails(params);
      break;
    case "winter":
      drawWinterPathDetails(params);
      break;
    case "volcanic":
      drawVolcanicPathDetails(params);
      break;
    case "swamp":
      drawSwampPathDetails(params);
      break;
  }
}
