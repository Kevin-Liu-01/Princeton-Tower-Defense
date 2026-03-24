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

function traceIsoBlobPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hw: number,
  hd: number,
  wobble: number,
): void {
  ctx.moveTo(cx, cy - hd);
  ctx.bezierCurveTo(
    cx + hw * 0.5 + wobble,
    cy - hd * 0.5 - wobble * 0.4,
    cx + hw * 0.85 + wobble * 0.3,
    cy - hd * 0.12,
    cx + hw,
    cy,
  );
  ctx.bezierCurveTo(
    cx + hw * 0.85 - wobble * 0.3,
    cy + hd * 0.12,
    cx + hw * 0.5 - wobble,
    cy + hd * 0.5 + wobble * 0.4,
    cx,
    cy + hd,
  );
  ctx.bezierCurveTo(
    cx - hw * 0.5 + wobble,
    cy + hd * 0.5 - wobble * 0.4,
    cx - hw * 0.85 + wobble * 0.3,
    cy + hd * 0.12,
    cx - hw,
    cy,
  );
  ctx.bezierCurveTo(
    cx - hw * 0.85 - wobble * 0.3,
    cy - hd * 0.12,
    cx - hw * 0.5 - wobble,
    cy - hd * 0.5 + wobble * 0.4,
    cx,
    cy - hd,
  );
}

export function fillIsoBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hw: number,
  hd: number,
  color: string,
  wobble: number = 0,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  traceIsoBlobPath(ctx, cx, cy, hw, hd, wobble);
  ctx.fill();
}

export function drawDetailedIsoStone(
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

  drawIsoPathStone(ctx, cx, cy, hw, h, topColor, leftColor, rightColor);

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = Math.max(0.4, hw * 0.07);
  ctx.beginPath();
  ctx.moveTo(cx, cy - hd - h);
  ctx.lineTo(cx - hw, cy - h);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = Math.max(0.3, hw * 0.05);
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy - h);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx + hw, cy - h);
  ctx.stroke();
}

function drawGrassShoot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bladeH: number,
  lean: number,
  color: string,
): void {
  const w = bladeH * 0.22;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x + lean * 0.5, y - bladeH * 0.6, x + lean, y - bladeH);
  ctx.quadraticCurveTo(x + lean * 0.5, y - bladeH * 0.55, x + w, y);
  ctx.closePath();
  ctx.fill();
}

function drawStuckArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cameraZoom: number,
  rand: () => number,
): void {
  const h = (6 + rand() * 6) * cameraZoom;
  const tiltX = (rand() - 0.5) * 4 * cameraZoom;
  const shaftAlpha = 0.45 + rand() * 0.2;
  const tipX = x + tiltX;
  const tipY = y - h;

  // Shadow blob on ground
  fillIsoBlob(ctx, x + cameraZoom, y + 0.5 * cameraZoom,
    2.5 * cameraZoom, 1.2 * cameraZoom, "rgba(0,0,0,0.08)", cameraZoom * 0.15);

  // Shaft
  ctx.strokeStyle = `rgba(100,70,35,${shaftAlpha})`;
  ctx.lineWidth = 1.2 * cameraZoom;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  // Arrowhead
  ctx.fillStyle = `rgba(70,55,30,${shaftAlpha + 0.05})`;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - 1.8 * cameraZoom, tipY + 2.5 * cameraZoom);
  ctx.lineTo(tipX + 1.8 * cameraZoom, tipY + 2.5 * cameraZoom);
  ctx.closePath();
  ctx.fill();

  // Fletching near base
  const fBase = 0.75;
  const fx = x + tiltX * (1 - fBase);
  const fy = y - h * (1 - fBase);
  ctx.strokeStyle = `rgba(140,120,90,${shaftAlpha * 0.7})`;
  ctx.lineWidth = 0.8 * cameraZoom;
  ctx.beginPath();
  ctx.moveTo(fx - 1.5 * cameraZoom, fy - 1 * cameraZoom);
  ctx.lineTo(fx, fy);
  ctx.lineTo(fx + 1.5 * cameraZoom, fy - 1 * cameraZoom);
  ctx.stroke();
}

function drawStuckSword(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cameraZoom: number,
  rand: () => number,
  theme: { path: string[] },
): void {
  const h = (8 + rand() * 7) * cameraZoom;
  const tiltX = (rand() - 0.5) * 3 * cameraZoom;
  const alpha = 0.5 + rand() * 0.2;
  const bladeW = (1.2 + rand() * 0.6) * cameraZoom;

  const tipX = x + tiltX;
  const tipY = y - h;
  const guardY = tipY + h * 0.35;
  const guardX = x + tiltX * 0.65;

  // Shadow on ground
  fillIsoBlob(ctx, x + 1.2 * cameraZoom, y + 0.6 * cameraZoom,
    3 * cameraZoom, 1.5 * cameraZoom, "rgba(0,0,0,0.09)", cameraZoom * 0.2);

  // Blade (from ground up to guard)
  ctx.strokeStyle = `rgba(160,160,170,${alpha})`;
  ctx.lineWidth = bladeW;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(guardX, guardY);
  ctx.stroke();

  // Blade edge highlight
  ctx.strokeStyle = `rgba(210,210,220,${alpha * 0.5})`;
  ctx.lineWidth = bladeW * 0.4;
  ctx.beginPath();
  ctx.moveTo(x - bladeW * 0.3, y);
  ctx.lineTo(guardX - bladeW * 0.3, guardY);
  ctx.stroke();

  // Cross-guard
  const gw = (2.5 + rand() * 1.5) * cameraZoom;
  ctx.strokeStyle = `rgba(90,70,40,${alpha})`;
  ctx.lineWidth = 1.5 * cameraZoom;
  ctx.beginPath();
  ctx.moveTo(guardX - gw, guardY + 0.5 * cameraZoom);
  ctx.lineTo(guardX + gw, guardY - 0.5 * cameraZoom);
  ctx.stroke();

  // Grip (above guard)
  const pommelY = tipY;
  ctx.strokeStyle = `rgba(70,50,25,${alpha})`;
  ctx.lineWidth = 1.8 * cameraZoom;
  ctx.beginPath();
  ctx.moveTo(guardX, guardY);
  ctx.lineTo(tipX, pommelY);
  ctx.stroke();

  // Pommel
  ctx.fillStyle = `rgba(100,80,40,${alpha})`;
  ctx.beginPath();
  ctx.arc(tipX, pommelY, 1.3 * cameraZoom, 0, Math.PI * 2);
  ctx.fill();
}

function drawIsoCrater(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hw: number,
  theme: RegionTheme,
): void {
  const hd = hw * ISO_T;
  const depth = hw * 0.22;
  const w = hw * 0.08;

  fillIsoBlob(
    ctx,
    cx,
    cy,
    hw * 1.08,
    hd * 1.12,
    hexToRgba(theme.path[0], 0.08),
    w,
  );

  fillIsoBlob(
    ctx,
    cx,
    cy + depth * 0.25,
    hw * 0.75,
    hd * 0.75,
    hexToRgba(theme.path[2], 0.14),
    w * 0.6,
  );

  fillIsoBlob(
    ctx,
    cx,
    cy + depth * 0.35,
    hw * 0.35,
    hd * 0.3,
    "rgba(0,0,0,0.06)",
    w * 0.3,
  );

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = Math.max(0.3, hw * 0.06);
  ctx.beginPath();
  ctx.moveTo(cx - hw * 1.0, cy);
  ctx.quadraticCurveTo(cx - hw * 0.3, cy - hd * 0.8, cx, cy - hd * 1.05);
  ctx.stroke();
}

function getEdgeVegetationColors(theme: RegionTheme): string[] {
  const { r, g, b } = hexToRgb(theme.ground[1]);
  return [
    `rgba(${Math.max(0, r - 20)},${Math.min(255, g + 25)},${Math.max(0, b - 15)},0.5)`,
    `rgba(${Math.max(0, r - 10)},${Math.min(255, g + 15)},${Math.max(0, b - 5)},0.45)`,
    `rgba(${Math.max(0, r - 25)},${Math.min(255, g + 35)},${Math.max(0, b - 20)},0.4)`,
  ];
}

function drawLayeredPathEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  _rotation: number,
  colors: {
    shadow: string;
    base: string;
    inner?: string;
    highlight?: string;
  },
  shadowOffsetX: number,
  shadowOffsetY: number,
): void {
  const w = rx * 0.08;

  fillIsoBlob(
    ctx,
    x + shadowOffsetX,
    y + shadowOffsetY,
    rx,
    ry,
    colors.shadow,
    w,
  );
  fillIsoBlob(ctx, x, y, rx, ry, colors.base, w);

  if (colors.inner) {
    fillIsoBlob(
      ctx,
      x + rx * 0.08,
      y + ry * 0.06,
      rx * 0.62,
      ry * 0.58,
      colors.inner,
      w * 0.5,
    );
  }

  if (colors.highlight) {
    fillIsoBlob(
      ctx,
      x - rx * 0.22,
      y - ry * 0.18,
      rx * 0.42,
      ry * 0.32,
      colors.highlight,
      w * 0.3,
    );
  }
}

// ─── Common Decorations ──────────────────────────────────────────────────────

function traceEdgeBand(
  ctx: CanvasRenderingContext2D,
  screenCenter: Position[],
  edge: Position[],
  innerBlend: number,
): void {
  const len = screenCenter.length;
  ctx.moveTo(edge[0].x, edge[0].y);
  for (let i = 1; i < len; i++) ctx.lineTo(edge[i].x, edge[i].y);
  for (let i = len - 1; i >= 0; i--) {
    const p = lerpPos(screenCenter[i], edge[i], innerBlend);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
}


function drawSurfaceTexture(p: PathDecorationParams): void {
  const { ctx, screenLeft, screenRight, theme, cameraZoom, mapSeed } = p;
  const len = p.screenCenter.length;
  const rand = createSeededRandom(mapSeed + 600);
  const { r: pr, g: pg, b: pb } = hexToRgb(theme.path[1]);

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

    const kind = rand();
    if (kind < 0.3) {
      // Isometric crater / divot with rim and depth
      const hw = (2 + rand() * 3.5) * cameraZoom;
      drawIsoCrater(ctx, ox, oy, hw, theme);
    } else if (kind < 0.55) {
      // Tiny raised iso pebble with visible height
      const hw = (1 + rand() * 1.8) * cameraZoom;
      const h = (0.5 + rand() * 1) * cameraZoom;
      drawIsoPathStone(
        ctx,
        ox,
        oy,
        hw,
        h,
        `rgba(${Math.min(255, pr + 18)},${Math.min(255, pg + 18)},${Math.min(255, pb + 18)},0.5)`,
        `rgba(${Math.max(0, pr - 10)},${Math.max(0, pg - 10)},${Math.max(0, pb - 10)},0.4)`,
        `rgba(${Math.max(0, pr - 25)},${Math.max(0, pg - 25)},${Math.max(0, pb - 25)},0.35)`,
      );
    } else {
      // Flat scuff / wear mark
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
}

function drawEdgeBorderStones(p: PathDecorationParams): void {
  const {
    ctx,
    screenCenter,
    screenLeft,
    screenRight,
    theme,
    cameraZoom,
    mapSeed,
  } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 500);
  const palettes = buildStonePalettes(theme.path, 0.72);
  const vegColors = getEdgeVegetationColors(theme);

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

    // Contact shadow
    ctx.fillStyle = `rgba(0,0,0,${0.14 + rand() * 0.06})`;
    ctx.beginPath();
    ctx.moveTo(px + shOff, py + shOff * 0.5 - hd);
    ctx.lineTo(px + shOff + hw, py + shOff * 0.5);
    ctx.lineTo(px + shOff, py + shOff * 0.5 + hd);
    ctx.lineTo(px + shOff - hw, py + shOff * 0.5);
    ctx.closePath();
    ctx.fill();

    // Main stone with rim highlight and seam detail
    drawDetailedIsoStone(ctx, px, py, hw, h, pal.top, pal.left, pal.right);

    // Top face highlight crescent
    ctx.fillStyle = `rgba(255,255,255,${0.06 + rand() * 0.05})`;
    ctx.beginPath();
    ctx.moveTo(px, py - hd - h);
    ctx.lineTo(px - hw * 0.6, py - h - hd * 0.2);
    ctx.lineTo(px, py + hd * 0.3 - h);
    ctx.closePath();
    ctx.fill();

    // Satellite mini-pebbles clustered around the main stone
    const satCount = 1 + Math.floor(rand() * 3);
    for (let s = 0; s < satCount; s++) {
      const angle = rand() * Math.PI * 2;
      const dist = hw * 1.3 + rand() * hw * 0.8;
      const sx = px + Math.cos(angle) * dist;
      const sy = py + Math.sin(angle) * dist * ISO_T;
      const sHw = (0.8 + rand() * 1.5) * cameraZoom;
      const sH = (0.3 + rand() * 0.7) * cameraZoom;
      drawIsoPathStone(ctx, sx, sy, sHw, sH, pal.top, pal.left, pal.right);
    }

    // Grass/weed shoots poking up near the stone
    if (rand() > 0.45) {
      const shootCount = 1 + Math.floor(rand() * 2);
      for (let g = 0; g < shootCount; g++) {
        const gAngle = rand() * Math.PI * 2;
        const gDist = hw * (0.8 + rand() * 1);
        const gx = px + Math.cos(gAngle) * gDist;
        const gy = py + Math.sin(gAngle) * gDist * ISO_T;
        const gH = (3 + rand() * 4) * cameraZoom;
        const gLean = (rand() - 0.5) * 2.5 * cameraZoom;
        const color = vegColors[Math.floor(rand() * vegColors.length)];
        drawGrassShoot(ctx, gx, gy, gH, gLean, color);
      }
    }
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
    const fx =
      edgeP.x + (edgeP.x - centerP.x) * 0.12 + (rand() - 0.5) * 4 * cameraZoom;
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
    const mossWobble = rand() * mossSize * 0.12;
    fillIsoBlob(ctx, mx, my, mossSize, mossSize * 0.45, color, mossWobble);
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

    ctx.globalAlpha = 0.12 + rand() * 0.1;
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
    ctx.moveTo(
      cp.x + Math.cos(a1) * crackLen,
      cp.y + Math.sin(a1) * crackLen * 0.5,
    );
    ctx.lineTo(cp.x, cp.y);
    ctx.lineTo(
      cp.x + Math.cos(a2) * crackLen * 0.7,
      cp.y + Math.sin(a2) * crackLen * 0.35,
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cp.x, cp.y);
    ctx.lineTo(
      cp.x + Math.cos(a3) * crackLen * 0.5,
      cp.y + Math.sin(a3) * crackLen * 0.25,
    );
    ctx.stroke();
  }
}

function drawSandAccumulation(p: PathDecorationParams): void {
  const {
    ctx,
    screenCenter,
    screenLeft,
    screenRight,
    theme,
    cameraZoom,
    mapSeed,
  } = p;
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

    const sandColor = hexToRgba(theme.path[1], 0.18 + rand() * 0.1);
    const sandWobble = rand() * pileW * 0.08;
    fillIsoBlob(ctx, sx, sy, pileW, pileH * 0.4, sandColor, sandWobble);
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
    ctx.moveTo(
      dx - Math.cos(angle) * boneLen,
      dy - Math.sin(angle) * boneLen * 0.5,
    );
    ctx.lineTo(
      dx + Math.cos(angle) * boneLen,
      dy + Math.sin(angle) * boneLen * 0.5,
    );
    ctx.stroke();

    if (rand() > 0.6) {
      const knobSize = 1.5 * cameraZoom;
      ctx.fillStyle = `rgba(220, 200, 170, ${0.3 + rand() * 0.15})`;
      ctx.beginPath();
      ctx.arc(
        dx - Math.cos(angle) * boneLen,
        dy - Math.sin(angle) * boneLen * 0.5,
        knobSize,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        dx + Math.cos(angle) * boneLen,
        dy + Math.sin(angle) * boneLen * 0.5,
        knobSize,
        0,
        Math.PI * 2,
      );
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

    const snowW = moundW * 0.06;
    fillIsoBlob(
      ctx,
      sx,
      sy + moundH * 0.12,
      moundW,
      moundH * 0.32,
      "rgba(80, 100, 140, 0.12)",
      snowW,
    );
    fillIsoBlob(
      ctx,
      sx,
      sy,
      moundW,
      moundH * 0.32,
      `rgba(225, 238, 255, ${0.4 + rand() * 0.2})`,
      snowW,
    );
    fillIsoBlob(
      ctx,
      sx - moundW * 0.15,
      sy - moundH * 0.04,
      moundW * 0.45,
      moundH * 0.18,
      `rgba(255, 255, 255, ${0.25 + rand() * 0.12})`,
      snowW * 0.4,
    );
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

    const iceColor = `rgba(180, 210, 245, ${0.1 + rand() * 0.07})`;
    const iceWobble = rand() * iceW * 0.08;
    fillIsoBlob(ctx, ox, oy, iceW, iceH * 0.38, iceColor, iceWobble);

    fillIsoBlob(
      ctx,
      ox - iceW * 0.2,
      oy - iceH * 0.06,
      iceW * 0.3,
      iceH * 0.1,
      `rgba(255, 255, 255, ${0.12 + rand() * 0.08})`,
      iceWobble * 0.3,
    );
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
      ctx.moveTo(
        fx - Math.cos(angle) * crystalSize,
        fy - Math.sin(angle) * crystalSize * 0.5,
      );
      ctx.lineTo(
        fx + Math.cos(angle) * crystalSize,
        fy + Math.sin(angle) * crystalSize * 0.5,
      );
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
      ctx,
      rx,
      ry,
      hw,
      h,
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

    const puddleColor = `rgba(20, 30, 15, ${0.13 + rand() * 0.08})`;
    const puddleWobble = rand() * puddleW * 0.08;
    fillIsoBlob(
      ctx,
      ox,
      oy,
      puddleW,
      puddleH * 0.38,
      puddleColor,
      puddleWobble,
    );

    fillIsoBlob(
      ctx,
      ox - puddleW * 0.1,
      oy - puddleH * 0.03,
      puddleW * 0.55,
      puddleH * 0.16,
      `rgba(50, 70, 40, ${0.06 + rand() * 0.05})`,
      puddleWobble * 0.3,
    );
  }
}

function drawMossPatches(p: PathDecorationParams): void {
  const { ctx, screenCenter, screenLeft, screenRight, cameraZoom, mapSeed } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 1110);
  const mossColors = [
    "rgba(40, 80, 30, 0.18)",
    "rgba(50, 90, 40, 0.15)",
    "rgba(30, 70, 25, 0.2)",
  ];

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

    const patchColor = mossColors[Math.floor(rand() * mossColors.length)];
    const patchWobble = rand() * mossW * 0.1;
    fillIsoBlob(ctx, mx, my, mossW, mossH * 0.4, patchColor, patchWobble);
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
    const mx =
      edgeP.x + (edgeP.x - centerP.x) * 0.04 + (rand() - 0.5) * 4 * cameraZoom;
    const my = edgeP.y + (edgeP.y - centerP.y) * 0.02;

    if (rand() > 0.5) {
      const capSize = (2 + rand() * 3) * cameraZoom;
      ctx.fillStyle =
        mushroomColors[Math.floor(rand() * mushroomColors.length)];
      ctx.beginPath();
      ctx.ellipse(mx, my, capSize, capSize * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 200, 0.12)";
      ctx.beginPath();
      ctx.ellipse(
        mx - capSize * 0.2,
        my - capSize * 0.08,
        capSize * 0.3,
        capSize * 0.15,
        0,
        0,
        Math.PI * 2,
      );
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

// ─── Common Roadside Debris ─────────────────────────────────────────────────

function drawRoadsideDebris(p: PathDecorationParams): void {
  const {
    ctx,
    screenCenter,
    screenLeft,
    screenRight,
    theme,
    cameraZoom,
    mapSeed,
  } = p;
  const len = screenCenter.length;
  const rand = createSeededRandom(mapSeed + 1200);
  const palettes = buildStonePalettes(theme.path, 0.55);
  const vegColors = getEdgeVegetationColors(theme);

  for (let i = 0; i < len; i += 4) {
    const roll = rand();

    // Gravel cluster — a spray of micro-pebbles
    if (roll < 0.18) {
      const side = rand() > 0.5 ? screenLeft : screenRight;
      if (i >= side.length) continue;
      const edgeP = side[i];
      const centerP = screenCenter[i];
      const bx = edgeP.x + (centerP.x - edgeP.x) * (0.02 + rand() * 0.15);
      const by = edgeP.y + (centerP.y - edgeP.y) * 0.02;

      const count = 3 + Math.floor(rand() * 4);
      const pal = palettes[Math.floor(rand() * palettes.length)];
      for (let j = 0; j < count; j++) {
        const gx = bx + (rand() - 0.5) * 6 * cameraZoom;
        const gy = by + (rand() - 0.5) * 3 * cameraZoom;
        const ghw = (0.6 + rand() * 1.2) * cameraZoom;
        const gh = (0.2 + rand() * 0.5) * cameraZoom;
        drawIsoPathStone(ctx, gx, gy, ghw, gh, pal.top, pal.left, pal.right);
      }
      continue;
    }

    // Broken arrow stuck in the path
    if (roll < 0.28) {
      const t = 0.15 + rand() * 0.7;
      const pos = lerpPos(
        screenLeft[clampIdx(i, screenLeft)],
        screenRight[clampIdx(i, screenRight)],
        t,
      );
      drawStuckArrow(
        ctx,
        pos.x + (rand() - 0.5) * 10 * cameraZoom,
        pos.y + (rand() - 0.5) * 5 * cameraZoom,
        cameraZoom,
        rand,
      );
      continue;
    }

    // Sword embedded in the ground
    if (roll < 0.38) {
      const t = 0.2 + rand() * 0.6;
      const pos = lerpPos(
        screenLeft[clampIdx(i, screenLeft)],
        screenRight[clampIdx(i, screenRight)],
        t,
      );
      drawStuckSword(
        ctx,
        pos.x + (rand() - 0.5) * 8 * cameraZoom,
        pos.y + (rand() - 0.5) * 4 * cameraZoom,
        cameraZoom,
        rand,
        theme,
      );
      continue;
    }

    // Weapon slash / gouge mark in the ground
    if (roll < 0.46) {
      const t = 0.2 + rand() * 0.6;
      const pos = lerpPos(
        screenLeft[clampIdx(i, screenLeft)],
        screenRight[clampIdx(i, screenRight)],
        t,
      );
      const sx = pos.x + (rand() - 0.5) * 8 * cameraZoom;
      const sy = pos.y + (rand() - 0.5) * 4 * cameraZoom;
      const slashLen = (5 + rand() * 8) * cameraZoom;
      const angle = -0.3 + rand() * 0.6;

      ctx.strokeStyle = hexToRgba(theme.path[2], 0.22);
      ctx.lineWidth = 1.5 * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(
        sx - Math.cos(angle) * slashLen * 0.5,
        sy - Math.sin(angle) * slashLen * 0.25,
      );
      ctx.lineTo(
        sx + Math.cos(angle) * slashLen * 0.5,
        sy + Math.sin(angle) * slashLen * 0.25,
      );
      ctx.stroke();

      fillIsoBlob(
        ctx,
        sx + Math.sin(angle) * 2 * cameraZoom,
        sy - Math.cos(angle) * cameraZoom,
        slashLen * 0.3,
        slashLen * 0.12,
        hexToRgba(theme.path[1], 0.08),
        slashLen * 0.02,
      );
      continue;
    }

    // Rubble fragment — small broken isometric chunk
    if (roll < 0.54) {
      const side = rand() > 0.5 ? screenLeft : screenRight;
      if (i >= side.length) continue;
      const edgeP = side[i];
      const centerP = screenCenter[i];
      const rx = edgeP.x + (centerP.x - edgeP.x) * (0.03 + rand() * 0.12);
      const ry = edgeP.y + (centerP.y - edgeP.y) * 0.02;
      const pal = palettes[Math.floor(rand() * palettes.length)];

      const rhw = (1.5 + rand() * 2.5) * cameraZoom;
      const rh = (0.6 + rand() * 1.2) * cameraZoom;
      drawIsoPathStone(ctx, rx, ry, rhw, rh, pal.top, pal.left, pal.right);

      if (rand() > 0.5) {
        const r2x = rx + (rand() - 0.5) * 4 * cameraZoom;
        const r2y = ry + (rand() - 0.5) * 2 * cameraZoom;
        const r2hw = (0.8 + rand() * 1.2) * cameraZoom;
        const r2h = (0.3 + rand() * 0.6) * cameraZoom;
        drawIsoPathStone(
          ctx,
          r2x,
          r2y,
          r2hw,
          r2h,
          pal.top,
          pal.left,
          pal.right,
        );
      }
      continue;
    }

    // Edge vegetation — grass/weed shoots
    if (roll < 0.66) {
      const side = rand() > 0.5 ? screenLeft : screenRight;
      if (i >= side.length) continue;
      const edgeP = side[i];
      const centerP = screenCenter[i];
      const bx = edgeP.x + (edgeP.x - centerP.x) * (0.01 + rand() * 0.06);
      const by = edgeP.y + (edgeP.y - centerP.y) * 0.01;

      const bladeCount = 2 + Math.floor(rand() * 3);
      for (let b = 0; b < bladeCount; b++) {
        const gx = bx + (rand() - 0.5) * 4 * cameraZoom;
        const gy = by + (rand() - 0.5) * 2 * cameraZoom;
        const gH = (3 + rand() * 5) * cameraZoom;
        const lean = (rand() - 0.5) * 3 * cameraZoom;
        const color = vegColors[Math.floor(rand() * vegColors.length)];
        drawGrassShoot(ctx, gx, gy, gH, lean, color);
      }
    }
  }
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

export function drawBatchedPathEdgeBlend(
  ctx: CanvasRenderingContext2D,
  roads: {
    screenCenter: Position[];
    screenLeft: Position[];
    screenRight: Position[];
  }[],
  theme: RegionTheme,
): void {
  const valid = roads.filter((r) => r.screenCenter.length >= 2);
  if (valid.length === 0) return;

  ctx.fillStyle = hexToRgba(theme.ground[2], 0.06);
  ctx.beginPath();
  for (const { screenCenter, screenLeft } of valid) {
    traceEdgeBand(ctx, screenCenter, screenLeft, 0.55);
  }
  for (const { screenCenter, screenRight } of valid) {
    traceEdgeBand(ctx, screenCenter, screenRight, 0.55);
  }
  ctx.fill();

  ctx.fillStyle = hexToRgba(theme.path[2], 0.09);
  ctx.beginPath();
  for (const { screenCenter, screenLeft } of valid) {
    traceEdgeBand(ctx, screenCenter, screenLeft, 0.86);
  }
  for (const { screenCenter, screenRight } of valid) {
    traceEdgeBand(ctx, screenCenter, screenRight, 0.86);
  }
  ctx.fill();

  ctx.fillStyle = hexToRgba(theme.path[0], 0.04);
  ctx.beginPath();
  for (const { screenCenter, screenLeft, screenRight } of valid) {
    const len = screenCenter.length;
    for (let i = 0; i < len; i++) {
      const lx = lerpPos(screenCenter[i], screenLeft[i], 0.22);
      if (i === 0) ctx.moveTo(lx.x, lx.y);
      else ctx.lineTo(lx.x, lx.y);
    }
    for (let i = len - 1; i >= 0; i--) {
      const rx = lerpPos(screenCenter[i], screenRight[i], 0.22);
      ctx.lineTo(rx.x, rx.y);
    }
    ctx.closePath();
  }
  ctx.fill();
}

export function drawPathDecorations(params: PathDecorationParams): void {
  if (params.screenCenter.length < 2) return;

  drawSurfaceTexture(params);
  drawEdgeBorderStones(params);
  drawRoadsideDebris(params);

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
