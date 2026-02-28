// Princeton Tower Defense - Decorations Rendering Module
// Renders map decorations like trees, rocks, buildings, etc.

import type { Position, MapDecoration } from "../../types";
import { worldToScreen } from "../../utils";
import { lightenColor, darkenColor, drawIsometricPrism } from "../helpers";

// Import landmark renderers
import {
  drawPyramid,
  drawSphinx,
  drawNassauHall,
  drawIceFortress,
  drawObsidianCastle,
  drawWitchCottage,
} from "./landmarks";

// Export the decoration item renderer for use in page.tsx
export { renderDecorationItem, type DecorationRenderParams } from "./renderDecorationItem";

// ============================================================================
// MAIN DECORATION RENDER FUNCTION
// ============================================================================

export function renderDecoration(
  ctx: CanvasRenderingContext2D,
  decoration: MapDecoration,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(
    decoration.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;
  const scale = (decoration.scale || 1) * zoom;

  ctx.save();

  // Get type from category or type field
  const decorType = String(decoration.category || decoration.type || "tree");
  const variantStr = typeof decoration.variant === "string" ? decoration.variant : undefined;
  const variantNum = typeof decoration.variant === "number" ? decoration.variant : 0;

  switch (decorType) {
    case "tree":
      drawTree(ctx, screenPos.x, screenPos.y, scale, variantStr, time);
      break;
    case "palm":
      drawPalmTree(ctx, screenPos.x, screenPos.y, scale, Math.sin(time * 1.5 + screenPos.x * 0.01) * 2 * scale, time, variantNum, screenPos.x);
      break;
    case "obelisk":
      drawObelisk(ctx, screenPos.x, screenPos.y, scale, variantNum, time);
      break;
    case "carnegie_lake":
      break;
    case "rock":
      drawRock(ctx, screenPos.x, screenPos.y, scale, variantStr);
      break;
    case "bush":
      drawBush(ctx, screenPos.x, screenPos.y, scale, variantStr, time);
      break;
    case "flower":
    case "flowers":
      drawFlower(ctx, screenPos.x, screenPos.y, scale, variantStr, time);
      break;
    case "building":
      drawBuilding(ctx, screenPos.x, screenPos.y, scale, variantStr, variantNum, time);
      break;
    case "statue":
      drawStatue(ctx, screenPos.x, screenPos.y, scale, variantStr);
      break;
    case "lamp":
    case "lamppost":
      drawLamp(ctx, screenPos.x, screenPos.y, scale, time);
      break;
    case "fence":
      drawFence(ctx, screenPos.x, screenPos.y, scale, variantStr);
      break;
    case "water":
    case "fountain":
      drawWaterFeature(ctx, screenPos.x, screenPos.y, scale, variantStr, time);
      break;
    case "ruins":
      drawRuins(ctx, screenPos.x, screenPos.y, scale, variantStr);
      break;
    case "crater":
      drawCrater(ctx, screenPos.x, screenPos.y, scale, variantNum, time);
      break;
    case "debris":
      drawDebris(ctx, screenPos.x, screenPos.y, scale, variantNum);
      break;
    case "skeleton":
      drawSkeleton(ctx, screenPos.x, screenPos.y, scale, variantNum);
      break;
    case "bones":
      drawBones(ctx, screenPos.x, screenPos.y, scale, variantNum);
      break;
    case "sword":
      drawSword(ctx, screenPos.x, screenPos.y, scale, variantNum);
      break;
    case "arrow":
      drawArrow(ctx, screenPos.x, screenPos.y, scale, variantNum);
      break;
    // Major landmarks
    case "pyramid":
      drawPyramid(ctx, screenPos.x, screenPos.y, scale, variantNum, time);
      break;
    case "sphinx":
      drawSphinx(ctx, screenPos.x, screenPos.y, scale, false, time);
      break;
    case "giant_sphinx":
      drawSphinx(ctx, screenPos.x, screenPos.y, scale, true, time);
      break;
    case "nassau_hall":
      drawNassauHall(ctx, screenPos.x, screenPos.y, scale, time);
      break;
    case "ice_fortress":
      drawIceFortress(ctx, screenPos.x, screenPos.y, scale, time);
      break;
    case "obsidian_castle":
      drawObsidianCastle(ctx, screenPos.x, screenPos.y, scale, time);
      break;
    case "witch_cottage":
      drawWitchCottage(ctx, screenPos.x, screenPos.y, scale, time);
      break;
    default:
      // Generic decoration
      drawGenericDecoration(ctx, screenPos.x, screenPos.y, scale);
  }

  ctx.restore();
}

// ============================================================================
// TREE RENDERING
// ============================================================================

function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string,
  time: number = 0
): void {
  const sway = Math.sin(time * 1.5 + x * 0.01) * 2 * scale;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + 5 * scale, 20 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  ctx.fillStyle = "#5d4037";
  ctx.beginPath();
  ctx.moveTo(x - 5 * scale, y);
  ctx.lineTo(x - 3 * scale + sway * 0.2, y - 30 * scale);
  ctx.lineTo(x + 3 * scale + sway * 0.2, y - 30 * scale);
  ctx.lineTo(x + 5 * scale, y);
  ctx.closePath();
  ctx.fill();

  // Foliage based on variant
  const foliageColor = variant === "pine" ? "#1a5f1a" :
                       variant === "autumn" ? "#d4763b" :
                       variant === "dead" ? "#8b7355" :
                       variant === "palm" ? "#2e8b2e" : "#228b22";

  if (variant === "pine") {
    // Pine tree layers
    for (let i = 0; i < 3; i++) {
      const layerY = y - 30 * scale - i * 15 * scale;
      const layerSize = (20 - i * 4) * scale;
      ctx.fillStyle = i === 0 ? darkenColor(foliageColor, 10) : foliageColor;
      ctx.beginPath();
      ctx.moveTo(x + sway, layerY - 20 * scale);
      ctx.lineTo(x - layerSize + sway, layerY);
      ctx.lineTo(x + layerSize + sway, layerY);
      ctx.closePath();
      ctx.fill();
    }
  } else if (variant === "palm") {
    drawPalmTree(ctx, x, y, scale, sway, time);
  } else {
    // Standard round tree
    ctx.fillStyle = foliageColor;
    ctx.beginPath();
    ctx.arc(x + sway, y - 45 * scale, 25 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = lightenColor(foliageColor, 20);
    ctx.beginPath();
    ctx.arc(x + sway - 8 * scale, y - 50 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// PALM TREE RENDERING - 3D Isometric
// ============================================================================

function sampleBezier(
  p0: number, p1: number, p2: number, p3: number, t: number
): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

// Pre-baked frond color sets - 4 back + 6 front entries per variant
const FROND_COLORS_V0 = {
  back: [
    { rib: "#1e5a1e", lit: "#2a6a2a", dark: "#0c460c" },
    { rib: "#226422", lit: "#306e30", dark: "#104e10" },
    { rib: "#1a5218", lit: "#266226", dark: "#0a3e0a" },
    { rib: "#1e5a1e", lit: "#2a6a2a", dark: "#0c460c" },
  ],
  front: [
    { rib: "#2e972e", lit: "#38a138", dark: "#228b22" },
    { rib: "#3a9763", lit: "#44a16d", dark: "#2e8b57" },
    { rib: "#3eb45e", lit: "#48be68", dark: "#32a852" },
    { rib: "#3aa753", lit: "#44b15d", dark: "#2e9b47" },
    { rib: "#2e972e", lit: "#38a138", dark: "#228b22" },
    { rib: "#3eb45e", lit: "#48be68", dark: "#32a852" },
  ],
};
const FROND_COLORS_V1 = {
  back: [
    { rib: "#226c3c", lit: "#2c763e", dark: "#105626" },
    { rib: "#206434", lit: "#2a6e36", dark: "#0e4e1e" },
    { rib: "#1e5c30", lit: "#28663a", dark: "#0c4c1c" },
    { rib: "#226c3c", lit: "#2c763e", dark: "#105626" },
  ],
  front: [
    { rib: "#369c4c", lit: "#40a656", dark: "#2a9040" },
    { rib: "#3ca466", lit: "#46ae70", dark: "#30985a" },
    { rib: "#42b464", lit: "#4cbe6e", dark: "#36a858" },
    { rib: "#3ca466", lit: "#46ae70", dark: "#30985a" },
    { rib: "#369c4c", lit: "#40a656", dark: "#2a9040" },
    { rib: "#42b464", lit: "#4cbe6e", dark: "#36a858" },
  ],
};
const FROND_COLORS_V2 = {
  back: [
    { rib: "#16562c", lit: "#20602e", dark: "#004016" },
    { rib: "#1a5e34", lit: "#246836", dark: "#04481e" },
    { rib: "#145028", lit: "#1e5a2c", dark: "#003a12" },
    { rib: "#16562c", lit: "#20602e", dark: "#004016" },
  ],
  front: [
    { rib: "#268434", lit: "#308e3e", dark: "#1a7828" },
    { rib: "#2e974c", lit: "#38a156", dark: "#228b40" },
    { rib: "#34ac56", lit: "#3eb660", dark: "#28a04a" },
    { rib: "#2e974c", lit: "#38a156", dark: "#228b40" },
    { rib: "#268434", lit: "#308e3e", dark: "#1a7828" },
    { rib: "#34ac56", lit: "#3eb660", dark: "#28a04a" },
  ],
};
const FROND_PALETTES = [FROND_COLORS_V0, FROND_COLORS_V1, FROND_COLORS_V2];

// Base frond layouts - offset by seed for per-tree variation (shorter lengths)
const BACK_FROND_LAYOUT = [
  { angle: -2.5, len: 36, phase: 0 },
  { angle: -1.2, len: 33, phase: 1.5 },
  { angle: 0.4, len: 31, phase: 3.2 },
  { angle: 1.9, len: 35, phase: 5.0 },
];
const FRONT_FROND_LAYOUT = [
  { angle: -2.3, len: 42, phase: 0.5 },
  { angle: -1.3, len: 40, phase: 1.8 },
  { angle: -0.2, len: 44, phase: 3.0 },
  { angle: 0.7, len: 42, phase: 4.2 },
  { angle: 1.6, len: 39, phase: 5.5 },
  { angle: 2.5, len: 36, phase: 0.8 },
];

function drawPalmTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  sway: number,
  time: number,
  variant: number = 0,
  seed: number = 0
): void {
  const s = scale;
  const pal = FROND_PALETTES[variant % 3];
  // Per-tree angle offset from seed for variation (range ±0.3 rad)
  const aOff = ((seed * 7.3 + 13) % 100) / 100 * 0.6 - 0.3;

  const bx0 = x, by0 = y + 3 * s;
  const bx1 = x + 4 * s + sway * 0.15, by1 = y - 16 * s;
  const bx2 = x + 8 * s + sway * 0.35, by2 = y - 36 * s;
  const bx3 = x + 5 * s + sway, by3 = y - 56 * s;
  const crownX = bx3;
  const crownY = by3;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(x + 8 * s, y + 4 * s, 14 * s, 6 * s, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Trunk: 6 segments, 3 faces each (left dark, right lit, front lip)
  const wBase = 12 * s, wTop = 7 * s;
  for (let i = 5; i >= 0; i--) {
    const t0 = i / 6, t1 = (i + 1) / 6;
    const x0 = sampleBezier(bx0, bx1, bx2, bx3, t0);
    const y0 = sampleBezier(by0, by1, by2, by3, t0);
    const x1 = sampleBezier(bx0, bx1, bx2, bx3, t1);
    const y1 = sampleBezier(by0, by1, by2, by3, t1);
    const w0 = wBase + (wTop - wBase) * t0;
    const w1 = wBase + (wTop - wBase) * t1;
    const lip0 = w0 * 0.22;
    // Left (shadow) face
    ctx.fillStyle = i % 2 === 0 ? "#5a4510" : "#4e3c0e";
    ctx.beginPath();
    ctx.moveTo(x0 - w0 * 0.5, y0);
    ctx.lineTo(x1 - w1 * 0.5, y1);
    ctx.lineTo(x1, y1 + w1 * 0.2);
    ctx.lineTo(x0, y0 + lip0);
    ctx.closePath();
    ctx.fill();
    // Right (lit) face
    ctx.fillStyle = i % 2 === 0 ? "#b8891e" : "#a07a18";
    ctx.beginPath();
    ctx.moveTo(x0 + w0 * 0.5, y0);
    ctx.lineTo(x1 + w1 * 0.5, y1);
    ctx.lineTo(x1, y1 + w1 * 0.2);
    ctx.lineTo(x0, y0 + lip0);
    ctx.closePath();
    ctx.fill();
    // Front lip
    ctx.fillStyle = i % 2 === 0 ? "#6b5012" : "#5a4210";
    ctx.beginPath();
    ctx.moveTo(x0 - w0 * 0.5, y0);
    ctx.lineTo(x0 + w0 * 0.5, y0);
    ctx.lineTo(x0, y0 + lip0);
    ctx.closePath();
    ctx.fill();
  }

  // Crown hub
  ctx.fillStyle = "#3a5a12";
  ctx.beginPath();
  ctx.ellipse(crownX, crownY + 2 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back fronds (4, half sway)
  for (let i = 0; i < 4; i++) {
    const f = BACK_FROND_LAYOUT[i];
    const sw = i % 2 === 1 ? Math.sin(time * 1.6 + f.phase) * 2 * s : 0;
    drawPalmFrond(ctx, crownX, crownY, f.angle + aOff, f.len * s, pal.back[i], s, sw);
  }
  // Front fronds (6, half sway)
  for (let i = 0; i < 6; i++) {
    const f = FRONT_FROND_LAYOUT[i];
    const sw = i % 2 === 1 ? Math.sin(time * 2 + f.phase) * 3 * s : 0;
    drawPalmFrond(ctx, crownX, crownY, f.angle + aOff, f.len * s, pal.front[i], s, sw);
  }

  // Coconuts (variant 0 and 2)
  if (variant === 0 || variant === 2) {
    const cBase = variant === 2 ? "#b89830" : "#5a3a1a";
    const cHi = variant === 2 ? "#e8c860" : "#8a6a3a";
    ctx.fillStyle = cBase;
    ctx.beginPath();
    ctx.arc(crownX - 3.5 * s, crownY + 4 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(crownX + 3 * s, crownY + 3.5 * s, 3.2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(crownX, crownY + 5.5 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cHi;
    ctx.beginPath();
    ctx.arc(crownX - 4.5 * s, crownY + 3 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(crownX + 2 * s, crownY + 2.5 * s, 1.4 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flowers (variant 1 and 2) - 2 blossoms, 3 petals each
  if (variant === 1 || variant === 2) {
    const petalCol = variant === 2 ? "#ff9eb0" : "#f8bbd0";
    const centerCol = variant === 2 ? "#ffd54f" : "#ffeb3b";
    ctx.fillStyle = petalCol;
    for (let bi = 0; bi < 2; bi++) {
      const bdx = bi === 0 ? -5 : 4;
      const bdy = bi === 0 ? 2 : 1.5;
      const bx = crownX + bdx * s;
      const by = crownY + bdy * s;
      for (let p = 0; p < 3; p++) {
        const pa = (p / 3) * Math.PI * 2 + bi;
        ctx.beginPath();
        ctx.ellipse(bx + Math.cos(pa) * 3 * s, by + Math.sin(pa) * 1.5 * s, 2.5 * s, 1.3 * s, pa, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = centerCol;
    ctx.beginPath();
    ctx.arc(crownX - 5 * s, crownY + 2 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(crownX + 4 * s, crownY + 1.5 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPalmFrond(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  angle: number,
  length: number,
  colors: { rib: string; lit: string; dark: string },
  scale: number,
  sway: number
): void {
  const s = scale;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  const tipX = baseX + cosA * length + sway;
  const tipY = baseY + sinA * length * 0.55 + length * 0.35;
  const ctrlX = baseX + cosA * length * 0.4;
  const ctrlY = baseY - 4 * s + sinA * 5 * s;

  // Rib stroke
  ctx.strokeStyle = colors.rib;
  ctx.lineWidth = 3.5 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
  ctx.stroke();

  // 6 spiky blades, 2 sides each = 12 fills per frond
  const bladeMaxLen = 14 * s;
  for (let b = 0; b < 6; b++) {
    const t = 0.06 + b * 0.155;
    const mt = 1 - t;
    const px = mt * mt * baseX + 2 * mt * t * ctrlX + t * t * tipX;
    const py = mt * mt * baseY + 2 * mt * t * ctrlY + t * t * tipY;
    const tx = 2 * mt * (ctrlX - baseX) + 2 * t * (tipX - ctrlX);
    const ty2 = 2 * mt * (ctrlY - baseY) + 2 * t * (tipY - ctrlY);
    const tangentAngle = Math.atan2(ty2, tx);
    const cosT = Math.cos(tangentAngle);
    const sinT = Math.sin(tangentAngle);
    const bladeLen = bladeMaxLen * (1 - t * 0.4);
    const spread = 1.4 + t * 0.5;

    for (let side = -1; side <= 1; side += 2) {
      const ba = tangentAngle + side * spread;
      const cosB = Math.cos(ba);
      const sinB = Math.sin(ba);
      ctx.fillStyle = side === 1 ? colors.lit : colors.dark;
      ctx.beginPath();
      ctx.moveTo(px - cosT * 1 * s, py - sinT * 0.5 * s);
      ctx.lineTo(px + cosB * bladeLen, py + sinB * bladeLen * 0.6);
      ctx.lineTo(px + cosT * 1 * s, py + sinT * 0.5 * s);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ============================================================================
// OBELISK RENDERING - 3D Isometric
// ============================================================================

function drawObelisk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0,
  time: number = 0
): void {
  const s = scale;
  const height = 55 * s;

  // Pre-baked palettes with all derived colors computed once
  const palettes = [
    { left: "#8a7a58", right: "#a89870", front: "#b0a068", top: "#c8b888", cap: "#d4a840", capDk: "#be9428", capFr: "#ca9e3b", capHi: "#f0d060", glyph: "#5a4a38", pedTop: "#b8a878", pedLeft: "#807048", pedRight: "#988860", ped2Left: "#857553", ped2Right: "#a39365" },
    { left: "#58544a", right: "#706c5e", front: "#666258", top: "#8a8678", cap: "#c4c0b0", capDk: "#b2aea0", capFr: "#bdb9ab", capHi: "#e4e0d4", glyph: "#3a3830", pedTop: "#7a766a", pedLeft: "#4a4840", pedRight: "#605e54", ped2Left: "#504e46", ped2Right: "#666458" },
    { left: "#28241e", right: "#38342a", front: "#302c24", top: "#48443a", cap: "#8868b8", capDk: "#7a56a6", capFr: "#8260b0", capHi: "#a888d8", glyph: "#4a3858", pedTop: "#383428", pedLeft: "#1a1810", pedRight: "#2a2820", ped2Left: "#201e16", ped2Right: "#302e24" },
  ];
  const p = palettes[variant % palettes.length];

  const baseW = 10 * s;
  const topW = 6 * s;

  // --- Ground shadow (flat) ---
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x + 6 * s, y + 6 * s, 18 * s, 8 * s, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // --- Single pedestal (merged two tiers into one prism) ---
  const pedW = 13 * s;
  const pedH = 8 * s;
  drawIsometricPrism(ctx, x, y, pedW, pedW, pedH, p.pedTop, p.pedLeft, p.pedRight);

  const shaftBase = y - pedH;
  const shaftTop = shaftBase - height;

  // Pre-compute shared values
  const bw86 = baseW * 0.866;
  const tw86 = topW * 0.866;
  const bwIso = baseW * 0.5;
  const twIso = topW * 0.5;

  // --- Shaft: 3 visible faces + top ---
  ctx.fillStyle = p.left;
  ctx.beginPath();
  ctx.moveTo(x - bw86, shaftBase + bwIso);
  ctx.lineTo(x, shaftBase + bwIso * 2);
  ctx.lineTo(x, shaftTop + twIso * 2);
  ctx.lineTo(x - tw86, shaftTop + twIso);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.right;
  ctx.beginPath();
  ctx.moveTo(x + bw86, shaftBase + bwIso);
  ctx.lineTo(x, shaftBase + bwIso * 2);
  ctx.lineTo(x, shaftTop + twIso * 2);
  ctx.lineTo(x + tw86, shaftTop + twIso);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.front;
  ctx.beginPath();
  ctx.moveTo(x - bw86, shaftBase + bwIso);
  ctx.lineTo(x + bw86, shaftBase + bwIso);
  ctx.lineTo(x + tw86, shaftTop + twIso);
  ctx.lineTo(x - tw86, shaftTop + twIso);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.top;
  ctx.beginPath();
  ctx.moveTo(x, shaftTop);
  ctx.lineTo(x + tw86, shaftTop + twIso);
  ctx.lineTo(x, shaftTop + twIso * 2);
  ctx.lineTo(x - tw86, shaftTop + twIso);
  ctx.closePath();
  ctx.fill();

  // --- Pyramidion cap ---
  const capTip = shaftTop - 10 * s;

  ctx.fillStyle = p.capDk;
  ctx.beginPath();
  ctx.moveTo(x, capTip);
  ctx.lineTo(x - tw86, shaftTop + twIso);
  ctx.lineTo(x, shaftTop + twIso * 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.cap;
  ctx.beginPath();
  ctx.moveTo(x, capTip);
  ctx.lineTo(x + tw86, shaftTop + twIso);
  ctx.lineTo(x, shaftTop + twIso * 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.capFr;
  ctx.beginPath();
  ctx.moveTo(x, capTip);
  ctx.lineTo(x - tw86, shaftTop + twIso);
  ctx.lineTo(x + tw86, shaftTop + twIso);
  ctx.closePath();
  ctx.fill();

  // Cap highlight
  ctx.fillStyle = p.capHi;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(x, capTip);
  ctx.lineTo(x + topW * 0.5, shaftTop + twIso * 0.6);
  ctx.lineTo(x, shaftTop + twIso);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // --- Hieroglyphs (reduced: 3 left, 2 right, simple rects only) ---
  ctx.fillStyle = p.glyph;
  for (let g = 0; g < 3; g++) {
    const t = 0.2 + g * 0.3;
    const gy = shaftBase + (shaftTop - shaftBase) * t;
    const gx = x - (baseW + (topW - baseW) * t) * 0.43;
    ctx.fillRect(gx - 2 * s, gy - 0.8 * s, 4 * s, 1.6 * s);
  }
  for (let g = 0; g < 2; g++) {
    const t = 0.3 + g * 0.4;
    const gy = shaftBase + (shaftTop - shaftBase) * t;
    const gx = x + (baseW + (topW - baseW) * t) * 0.43;
    ctx.fillRect(gx - 1.5 * s, gy - 0.6 * s, 3 * s, 1.2 * s);
  }

  // --- Edge highlight ---
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = s;
  ctx.beginPath();
  ctx.moveTo(x, capTip);
  ctx.lineTo(x + tw86, shaftTop + twIso);
  ctx.lineTo(x + bw86, shaftBase + bwIso);
  ctx.stroke();

  // Obsidian glow
  if (variant === 2) {
    ctx.fillStyle = `rgba(128,80,200,${0.3 + Math.sin(time * 2) * 0.15})`;
    ctx.beginPath();
    ctx.arc(x, capTip - 3 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// ROCK RENDERING
// ============================================================================

function drawRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string
): void {
  const rockColor = variant === "dark" ? "#4a4a4a" :
                    variant === "red" ? "#8b4513" :
                    variant === "crystal" ? "#87ceeb" : "#808080";

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + 3 * scale, 15 * scale, 7 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top face (lightest)
  ctx.fillStyle = rockColor;
  ctx.beginPath();
  ctx.moveTo(x - 8 * scale, y - 15 * scale);
  ctx.lineTo(x + 5 * scale, y - 18 * scale);
  ctx.lineTo(x + 14 * scale, y - 8 * scale);
  ctx.lineTo(x, y - 5 * scale);
  ctx.closePath();
  ctx.fill();

  // Front face (medium dark - faces viewer)
  ctx.fillStyle = darkenColor(rockColor, 15);
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.lineTo(x - 8 * scale, y - 15 * scale);
  ctx.lineTo(x, y - 5 * scale);
  ctx.lineTo(x, y + 2 * scale);
  ctx.closePath();
  ctx.fill();

  // Right side face (darkest)
  ctx.fillStyle = darkenColor(rockColor, 30);
  ctx.beginPath();
  ctx.moveTo(x, y - 5 * scale);
  ctx.lineTo(x + 14 * scale, y - 8 * scale);
  ctx.lineTo(x + 10 * scale, y);
  ctx.lineTo(x, y + 2 * scale);
  ctx.closePath();
  ctx.fill();

  // Highlight on top face
  ctx.fillStyle = lightenColor(rockColor, 30);
  ctx.beginPath();
  ctx.moveTo(x - 6 * scale, y - 14 * scale);
  ctx.lineTo(x + 2 * scale, y - 15 * scale);
  ctx.lineTo(x - 2 * scale, y - 8 * scale);
  ctx.closePath();
  ctx.fill();

  if (variant === "crystal") {
    // Crystal glow
    ctx.shadowColor = "#87ceeb";
    ctx.shadowBlur = 10 * scale;
    ctx.fillStyle = `rgba(135, 206, 235, 0.5)`;
    ctx.beginPath();
    ctx.moveTo(x, y - 20 * scale);
    ctx.lineTo(x + 5 * scale, y - 10 * scale);
    ctx.lineTo(x - 5 * scale, y - 10 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ============================================================================
// BUSH RENDERING
// ============================================================================

function drawBush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string,
  time: number = 0
): void {
  const bushColor = variant === "berry" ? "#2d5a2d" :
                    variant === "flower" ? "#3d7a3d" : "#3a7a3a";
  const sway = Math.sin(time * 2 + x * 0.02) * scale;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + 2 * scale, 12 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bush layers
  for (let i = 0; i < 3; i++) {
    const offsetX = (i - 1) * 6 * scale + sway * (i === 1 ? 1 : 0.5);
    const offsetY = i === 1 ? -3 * scale : 0;
    ctx.fillStyle = i === 1 ? lightenColor(bushColor, 10) : bushColor;
    ctx.beginPath();
    ctx.arc(x + offsetX, y - 5 * scale + offsetY, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Berries or flowers
  if (variant === "berry") {
    ctx.fillStyle = "#dc143c";
    for (let i = 0; i < 5; i++) {
      const bx = x + (Math.random() - 0.5) * 15 * scale;
      const by = y - 5 * scale + (Math.random() - 0.5) * 8 * scale;
      ctx.beginPath();
      ctx.arc(bx, by, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (variant === "flower") {
    const flowerColors = ["#ff69b4", "#ffff00", "#ffffff"];
    for (let i = 0; i < 4; i++) {
      const fx = x + (Math.random() - 0.5) * 15 * scale;
      const fy = y - 8 * scale + (Math.random() - 0.5) * 6 * scale;
      ctx.fillStyle = flowerColors[i % 3];
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============================================================================
// FLOWER RENDERING
// ============================================================================

function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string,
  time: number = 0
): void {
  const sway = Math.sin(time * 3 + x * 0.05) * 2 * scale;
  const petalColor = variant === "red" ? "#ff4444" :
                     variant === "yellow" ? "#ffdd44" :
                     variant === "purple" ? "#9944ff" : "#ff88cc";

  // Stem
  ctx.strokeStyle = "#228b22";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + sway * 0.5, y - 10 * scale, x + sway, y - 20 * scale);
  ctx.stroke();

  // Leaf
  ctx.fillStyle = "#32cd32";
  ctx.beginPath();
  ctx.ellipse(x + 3 * scale + sway * 0.3, y - 8 * scale, 4 * scale, 2 * scale, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Petals
  ctx.fillStyle = petalColor;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const petalX = x + sway + Math.cos(angle) * 5 * scale;
    const petalY = y - 20 * scale + Math.sin(angle) * 5 * scale;
    ctx.beginPath();
    ctx.ellipse(petalX, petalY, 4 * scale, 2.5 * scale, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(x + sway, y - 20 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// BUILDING RENDERING
// ============================================================================

function drawBldgStoneWall(
  ctx: CanvasRenderingContext2D,
  corners: [number, number][],
  baseColor: string,
  rows: number,
  s: number
): void {
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.moveTo(corners[0][0], corners[0][1]);
  for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i][0], corners[i][1]);
  ctx.closePath();
  ctx.fill();

  const [bl, br, tr, tl] = corners;
  const h = Math.abs(bl[1] - tl[1]) + Math.abs(br[1] - tr[1]);
  if (h < 4) return;

  ctx.strokeStyle = "rgba(30,20,10,0.22)";
  ctx.lineWidth = 0.6 * s;
  for (let r = 0; r < rows; r++) {
    const t = (r + 0.5) / rows;
    const lx = bl[0] + (tl[0] - bl[0]) * t;
    const ly = bl[1] + (tl[1] - bl[1]) * t;
    const rx = br[0] + (tr[0] - br[0]) * t;
    const ry = br[1] + (tr[1] - br[1]) * t;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(rx, ry);
    ctx.stroke();

    const cols = 2 + (r % 2);
    for (let c = 1; c <= cols; c++) {
      const ct = c / (cols + 1) + (r % 2 === 0 ? 0.05 : -0.03);
      const cx = lx + (rx - lx) * ct;
      const cy = ly + (ry - ly) * ct;
      const nextT = Math.min(1, (r + 1.5) / rows);
      const ny = bl[1] + (tl[1] - bl[1]) * nextT;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + (tl[0] - bl[0]) / rows * 0.8, ny - (bl[1] + (tl[1] - bl[1]) * ((r + 1.5) / rows) - cy) * 0.05);
      ctx.stroke();
    }
  }
}

function drawBldgArchWin(
  ctx: CanvasRenderingContext2D,
  wx: number,
  wy: number,
  ww: number,
  wh: number,
  s: number,
  hasShutters: boolean = false
): void {
  const glowG = ctx.createRadialGradient(wx, wy, 0, wx, wy, wh * 0.8);
  glowG.addColorStop(0, "rgba(255,200,100,0.55)");
  glowG.addColorStop(0.5, "rgba(220,160,60,0.35)");
  glowG.addColorStop(1, "rgba(180,120,40,0.1)");

  if (hasShutters) {
    ctx.fillStyle = "#3A2A1A";
    ctx.fillRect(wx - ww - 1.5 * s, wy - wh * 0.3, 1.5 * s, wh * 0.8 + ww * 0.5);
    ctx.fillStyle = "#4A3828";
    ctx.fillRect(wx + ww, wy - wh * 0.3, 1.5 * s, wh * 0.8 + ww * 0.5);
  }

  ctx.fillStyle = "#1A1008";
  ctx.beginPath();
  ctx.moveTo(wx - ww, wy + wh * 0.5);
  ctx.lineTo(wx - ww, wy - wh * 0.3);
  ctx.arc(wx, wy - wh * 0.3, ww, Math.PI, 0);
  ctx.lineTo(wx + ww, wy + wh * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = glowG;
  ctx.beginPath();
  ctx.moveTo(wx - ww + 0.5 * s, wy + wh * 0.45);
  ctx.lineTo(wx - ww + 0.5 * s, wy - wh * 0.25);
  ctx.arc(wx, wy - wh * 0.25, ww - 0.5 * s, Math.PI, 0);
  ctx.lineTo(wx + ww - 0.5 * s, wy + wh * 0.45);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#3A2518";
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(wx - ww, wy + wh * 0.5);
  ctx.lineTo(wx - ww, wy - wh * 0.3);
  ctx.arc(wx, wy - wh * 0.3, ww, Math.PI, 0);
  ctx.lineTo(wx + ww, wy + wh * 0.5);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(wx, wy - wh * 0.3 - ww);
  ctx.lineTo(wx, wy + wh * 0.5);
  ctx.stroke();

  ctx.fillStyle = "#3A2518";
  ctx.fillRect(wx - ww - 0.3 * s, wy + wh * 0.5, ww * 2 + 0.6 * s, 1.2 * s);
}

function drawBldgDoor(
  ctx: CanvasRenderingContext2D,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  s: number,
  hasStep: boolean = true
): void {
  if (hasStep) {
    ctx.fillStyle = "#5A4A38";
    ctx.beginPath();
    ctx.moveTo(dx - dw * 0.7, dy + 1 * s);
    ctx.lineTo(dx + dw * 0.7, dy + 1 * s);
    ctx.lineTo(dx + dw * 0.5, dy + 3 * s);
    ctx.lineTo(dx - dw * 0.3, dy + 3 * s);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#4A3828";
  ctx.beginPath();
  ctx.moveTo(dx - dw * 0.55, dy);
  ctx.lineTo(dx - dw * 0.55, dy - dh - dw * 0.25);
  ctx.lineTo(dx + dw * 0.55, dy - dh - dw * 0.25);
  ctx.lineTo(dx + dw * 0.55, dy);
  ctx.closePath();
  ctx.fill();

  const doorG = ctx.createLinearGradient(dx - dw * 0.5, dy, dx + dw * 0.5, dy);
  doorG.addColorStop(0, "#3A2210");
  doorG.addColorStop(0.3, "#4A3220");
  doorG.addColorStop(0.7, "#3A2210");
  doorG.addColorStop(1, "#2A1808");
  ctx.fillStyle = doorG;
  ctx.beginPath();
  ctx.moveTo(dx - dw * 0.5, dy);
  ctx.lineTo(dx - dw * 0.5, dy - dh);
  ctx.arc(dx, dy - dh, dw * 0.5, Math.PI, 0);
  ctx.lineTo(dx + dw * 0.5, dy);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#5A4A35";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(dx - dw * 0.5, dy - dh * 0.33);
  ctx.lineTo(dx + dw * 0.5, dy - dh * 0.33);
  ctx.moveTo(dx - dw * 0.5, dy - dh * 0.66);
  ctx.lineTo(dx + dw * 0.5, dy - dh * 0.66);
  ctx.stroke();

  ctx.fillStyle = "#6A5A40";
  ctx.beginPath();
  ctx.arc(dx - dw * 0.5, dy - dh * 0.33, 1 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(dx + dw * 0.5, dy - dh * 0.33, 1 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(dx - dw * 0.5, dy - dh * 0.66, 1 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(dx + dw * 0.5, dy - dh * 0.66, 1 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#C8A860";
  ctx.beginPath();
  ctx.arc(dx + dw * 0.22, dy - dh * 0.45, 1 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawBldgChimney(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  chimneyH: number,
  s: number,
  time: number,
  seed: number
): void {
  ctx.fillStyle = "#5A4A3A";
  ctx.beginPath();
  ctx.moveTo(cx - 3 * s, topY + chimneyH);
  ctx.lineTo(cx - 3 * s, topY);
  ctx.lineTo(cx + 3 * s, topY);
  ctx.lineTo(cx + 3 * s, topY + chimneyH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4A3A2A";
  ctx.beginPath();
  ctx.moveTo(cx - 2 * s, topY + chimneyH);
  ctx.lineTo(cx - 2 * s, topY);
  ctx.lineTo(cx, topY - 0.5 * s);
  ctx.lineTo(cx, topY + chimneyH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#6A5A48";
  ctx.beginPath();
  ctx.moveTo(cx - 4 * s, topY);
  ctx.lineTo(cx + 4 * s, topY);
  ctx.lineTo(cx + 3.5 * s, topY + 2.5 * s);
  ctx.lineTo(cx - 3.5 * s, topY + 2.5 * s);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(30,20,10,0.2)";
  ctx.lineWidth = 0.4 * s;
  for (let r = 0; r < 3; r++) {
    const ry = topY + 3 * s + r * (chimneyH - 3 * s) / 3;
    ctx.beginPath();
    ctx.moveTo(cx - 3 * s, ry);
    ctx.lineTo(cx + 3 * s, ry);
    ctx.stroke();
  }

  const drift = Math.sin(time * 2 + seed) * 3 * s;
  const rise = Math.sin(time * 1.5 + seed * 0.7) * 1 * s;
  ctx.fillStyle = "rgba(170,160,150,0.2)";
  ctx.beginPath();
  ctx.ellipse(cx + drift * 0.5, topY - 3 * s + rise, 3 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(150,145,140,0.14)";
  ctx.beginPath();
  ctx.ellipse(cx + drift, topY - 8 * s + rise, 4.5 * s, 2.5 * s, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(140,135,130,0.08)";
  ctx.beginPath();
  ctx.ellipse(cx + drift * 1.6, topY - 14 * s + rise * 1.5, 6 * s, 3 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawBldgRoof(
  ctx: CanvasRenderingContext2D,
  x: number,
  peakY: number,
  baseY: number,
  iW: number,
  iD: number,
  overhang: number,
  s: number,
  darkCol: string,
  midCol: string,
  litCol: string
): void {
  const ov = overhang;

  ctx.fillStyle = darkCol;
  ctx.beginPath();
  ctx.moveTo(x, peakY);
  ctx.lineTo(x - iW - ov, baseY + 1 * s);
  ctx.lineTo(x, baseY + iD + 1 * s);
  ctx.closePath();
  ctx.fill();

  const rrG = ctx.createLinearGradient(x, peakY, x + iW + ov, baseY);
  rrG.addColorStop(0, litCol);
  rrG.addColorStop(1, midCol);
  ctx.fillStyle = rrG;
  ctx.beginPath();
  ctx.moveTo(x, peakY);
  ctx.lineTo(x, baseY + iD + 1 * s);
  ctx.lineTo(x + iW + ov, baseY + 1 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = midCol;
  ctx.beginPath();
  ctx.moveTo(x, peakY);
  ctx.lineTo(x - iW - ov, baseY + 1 * s);
  ctx.lineTo(x + iW + ov, baseY + 1 * s);
  ctx.closePath();
  ctx.fill();

  // Roof edge fascia (visible thickness)
  ctx.fillStyle = darkenColor(darkCol, 15);
  ctx.beginPath();
  ctx.moveTo(x - iW - ov, baseY + 1 * s);
  ctx.lineTo(x, baseY + iD + 1 * s);
  ctx.lineTo(x, baseY + iD + 3 * s);
  ctx.lineTo(x - iW - ov, baseY + 3 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = darkenColor(midCol, 10);
  ctx.beginPath();
  ctx.moveTo(x, baseY + iD + 1 * s);
  ctx.lineTo(x + iW + ov, baseY + 1 * s);
  ctx.lineTo(x + iW + ov, baseY + 3 * s);
  ctx.lineTo(x, baseY + iD + 3 * s);
  ctx.closePath();
  ctx.fill();

  // Tile ridge lines
  ctx.strokeStyle = "rgba(20,10,5,0.18)";
  ctx.lineWidth = 0.6 * s;
  const ridges = 5;
  for (let r = 0; r < ridges; r++) {
    const t = (r + 1) / (ridges + 1);
    const ry = peakY + (baseY + 1 * s - peakY) * t;
    const rw = (iW + ov) * t;
    ctx.beginPath();
    ctx.moveTo(x - rw, ry);
    ctx.lineTo(x + rw, ry);
    ctx.stroke();
  }

  // Ridge cap highlight
  ctx.strokeStyle = "rgba(120,100,70,0.25)";
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(x, peakY);
  ctx.lineTo(x + iW + ov, baseY + 1 * s);
  ctx.stroke();
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string,
  variantNum: number = 0,
  time: number = 0
): void {
  const s = scale;
  const v = variant === "stone" ? 1 : variant === "brick" ? 2 : variantNum % 4;

  // Ground shadow
  const shadGrad = ctx.createRadialGradient(
    x + 6 * s, y + 8 * s, 0,
    x + 6 * s, y + 8 * s, 42 * s
  );
  shadGrad.addColorStop(0, "rgba(0,0,0,0.38)");
  shadGrad.addColorStop(0.5, "rgba(0,0,0,0.15)");
  shadGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadGrad;
  ctx.beginPath();
  ctx.ellipse(x + 6 * s, y + 8 * s, 42 * s, 18 * s, 0.15, 0, Math.PI * 2);
  ctx.fill();

  if (v === 0) {
    // === COZY STONE COTTAGE — hip roof, chimney, warm window glow, flower box ===
    const wW = 24 * s, wD = 15 * s, wH = 24 * s, rH = 16 * s;
    const iW = wW * 0.866, iD = wD * 0.5;

    // Stone foundation
    ctx.fillStyle = "#3E3028";
    ctx.beginPath();
    ctx.moveTo(x, y + iD + 3 * s);
    ctx.lineTo(x + iW + 3 * s, y + 3 * s);
    ctx.lineTo(x, y - iD + 3 * s);
    ctx.lineTo(x - iW - 3 * s, y + 3 * s);
    ctx.closePath();
    ctx.fill();

    // Left wall with stone texture
    drawBldgStoneWall(ctx,
      [[x - iW, y], [x, y + iD], [x, y + iD - wH], [x - iW, y - wH]],
      "#5A4A3A", 7, s
    );

    // Right wall with gradient + stone texture
    const rwG = ctx.createLinearGradient(x, y, x + iW, y);
    rwG.addColorStop(0, "#8A7A65");
    rwG.addColorStop(1, "#6A5A48");
    ctx.fillStyle = rwG;
    ctx.beginPath();
    ctx.moveTo(x + iW, y);
    ctx.lineTo(x, y + iD);
    ctx.lineTo(x, y + iD - wH);
    ctx.lineTo(x + iW, y - wH);
    ctx.closePath();
    ctx.fill();
    drawBldgStoneWall(ctx,
      [[x, y + iD], [x + iW, y], [x + iW, y - wH], [x, y + iD - wH]],
      "rgba(0,0,0,0)", 7, s
    );

    // Door
    drawBldgDoor(ctx, x + iW * 0.35, y + iD * 0.35, 7 * s, 14 * s, s);

    // Right wall windows with shutters
    drawBldgArchWin(ctx, x + iW * 0.72, y - wH * 0.4 + iD * 0.15, 3.5 * s, 6 * s, s, true);

    // Left wall window
    drawBldgArchWin(ctx, x - iW * 0.5, y - wH * 0.45, 3 * s, 5.5 * s, s, true);

    // Window glow cast on ground
    const glowR = ctx.createRadialGradient(
      x + iW * 0.72, y + iD * 0.15, 0,
      x + iW * 0.72, y + iD * 0.15, 12 * s
    );
    glowR.addColorStop(0, "rgba(255,200,100,0.08)");
    glowR.addColorStop(1, "rgba(255,200,100,0)");
    ctx.fillStyle = glowR;
    ctx.beginPath();
    ctx.ellipse(x + iW * 0.72, y + iD * 0.15, 12 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flower box under right wall window
    ctx.fillStyle = "#5A3A28";
    ctx.fillRect(x + iW * 0.72 - 4 * s, y - wH * 0.4 + iD * 0.15 + 4.5 * s, 8 * s, 2.5 * s);
    ctx.fillStyle = "#4A8A3A";
    for (let f = 0; f < 4; f++) {
      const fx = x + iW * 0.72 - 3 * s + f * 2 * s;
      const fy = y - wH * 0.4 + iD * 0.15 + 4 * s;
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#E85050";
    ctx.beginPath();
    ctx.arc(x + iW * 0.72 - 1.5 * s, y - wH * 0.4 + iD * 0.15 + 3.5 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#E8D050";
    ctx.beginPath();
    ctx.arc(x + iW * 0.72 + 2 * s, y - wH * 0.4 + iD * 0.15 + 3.2 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();

    // Hip roof
    drawBldgRoof(ctx, x, y - wH - rH, y - wH, iW, iD, 5 * s, s,
      "#3A2A1A", "#5A4030", "#6A5040");

    // Chimney
    drawBldgChimney(ctx, x + iW * 0.35, y - wH - rH - 5 * s, rH * 0.6, s, time, x);

  } else if (v === 1) {
    // === STONE WATCHTOWER — tall with battlements, conical roof, flag ===
    const tW = 16 * s, tD = 12 * s, tH = 38 * s, batH = 5 * s;
    const tiW = tW * 0.866, tiD = tD * 0.5;

    // Stone platform
    ctx.fillStyle = "#3E3028";
    ctx.beginPath();
    ctx.moveTo(x, y + tiD + 3 * s);
    ctx.lineTo(x + tiW + 5 * s, y + 3 * s);
    ctx.lineTo(x, y - tiD + 3 * s);
    ctx.lineTo(x - tiW - 5 * s, y + 3 * s);
    ctx.closePath();
    ctx.fill();

    // Left wall with stone blocks
    drawBldgStoneWall(ctx,
      [[x - tiW, y], [x, y + tiD], [x, y + tiD - tH], [x - tiW, y - tH]],
      "#504840", 10, s
    );

    // Right wall with gradient + blocks
    const twG = ctx.createLinearGradient(x, y, x + tiW, y);
    twG.addColorStop(0, "#7A6A58");
    twG.addColorStop(1, "#5A4A3C");
    ctx.fillStyle = twG;
    ctx.beginPath();
    ctx.moveTo(x + tiW, y);
    ctx.lineTo(x, y + tiD);
    ctx.lineTo(x, y + tiD - tH);
    ctx.lineTo(x + tiW, y - tH);
    ctx.closePath();
    ctx.fill();
    drawBldgStoneWall(ctx,
      [[x, y + tiD], [x + tiW, y], [x + tiW, y - tH], [x, y + tiD - tH]],
      "rgba(0,0,0,0)", 10, s
    );

    // Stone band dividers at 1/3 and 2/3 height
    ctx.fillStyle = "#4A3A2A";
    for (const frac of [0.33, 0.66]) {
      const bandY = y - tH * frac;
      ctx.beginPath();
      ctx.moveTo(x, y + tiD - tH * frac);
      ctx.lineTo(x + tiW + 1 * s, bandY);
      ctx.lineTo(x + tiW + 1 * s, bandY + 2 * s);
      ctx.lineTo(x, y + tiD - tH * frac + 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - tiW - 1 * s, bandY);
      ctx.lineTo(x, y + tiD - tH * frac);
      ctx.lineTo(x, y + tiD - tH * frac + 2 * s);
      ctx.lineTo(x - tiW - 1 * s, bandY + 2 * s);
      ctx.closePath();
      ctx.fill();
    }

    // Door
    drawBldgDoor(ctx, x + tiW * 0.4, y + tiD * 0.25, 5 * s, 11 * s, s);

    // Arrow slits on right wall
    for (let w = 0; w < 3; w++) {
      const wy = y - tH * (0.2 + w * 0.25);
      const wx = x + tiW * 0.55 - w * tiD * 0.12;
      ctx.fillStyle = "#1A1008";
      ctx.fillRect(wx - 1 * s, wy - 3.5 * s, 2 * s, 7 * s);
      ctx.fillStyle = "rgba(200,150,70,0.35)";
      ctx.fillRect(wx - 0.7 * s, wy - 3 * s, 1.4 * s, 6 * s);
    }

    // Arched window on left wall
    drawBldgArchWin(ctx, x - tiW * 0.5, y - tH * 0.55, 3 * s, 6 * s, s);

    // Battlements top face
    const batBase = y - tH;
    ctx.fillStyle = "#6A5A48";
    ctx.beginPath();
    ctx.moveTo(x, batBase - batH - tiD);
    ctx.lineTo(x + tiW + 2 * s, batBase - batH);
    ctx.lineTo(x, batBase + tiD - batH);
    ctx.lineTo(x - tiW - 2 * s, batBase - batH);
    ctx.closePath();
    ctx.fill();

    // Merlons (front)
    ctx.fillStyle = "#7A6A58";
    for (let m = 0; m < 4; m++) {
      const t = (m + 0.25) / 4;
      const mx = x - tiW - 2 * s + (tiW * 2 + 4 * s) * t;
      ctx.fillRect(mx - 2 * s, batBase - batH - 5 * s, 4 * s, 5 * s);
      ctx.fillStyle = "#6A5A48";
      ctx.fillRect(mx - 1.5 * s, batBase - batH - 5 * s, 3 * s, 1.5 * s);
      ctx.fillStyle = "#7A6A58";
    }

    // Merlons (right side)
    ctx.fillStyle = "#5A4A3C";
    for (let m = 0; m < 3; m++) {
      const t = (m + 0.3) / 3;
      const mx = x + tiW * t + 1 * s;
      const my = batBase - batH + tiD * (1 - t) * 0.5;
      ctx.fillRect(mx - 1.5 * s, my - 5 * s, 3 * s, 5 * s);
    }

    // Conical roof
    const roofBot = batBase - batH;
    const pk = roofBot - 20 * s;

    ctx.fillStyle = "#3A2E24";
    ctx.beginPath();
    ctx.moveTo(x, pk);
    ctx.lineTo(x - tiW - 4 * s, roofBot + 2 * s);
    ctx.lineTo(x + tiW + 4 * s, roofBot + 2 * s);
    ctx.closePath();
    ctx.fill();
    const trG = ctx.createLinearGradient(x, pk, x + tiW + 4 * s, roofBot);
    trG.addColorStop(0, "#6A5840");
    trG.addColorStop(1, "#3A2E24");
    ctx.fillStyle = trG;
    ctx.beginPath();
    ctx.moveTo(x, pk);
    ctx.lineTo(x + tiW + 4 * s, roofBot + 2 * s);
    ctx.lineTo(x, roofBot + tiD + 2 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5A4838";
    ctx.beginPath();
    ctx.moveTo(x, pk);
    ctx.lineTo(x - tiW - 4 * s, roofBot + 2 * s);
    ctx.lineTo(x, roofBot + tiD + 2 * s);
    ctx.closePath();
    ctx.fill();

    // Roof shingle lines
    ctx.strokeStyle = "rgba(20,10,5,0.18)";
    ctx.lineWidth = 0.6 * s;
    for (let r = 0; r < 6; r++) {
      const t = (r + 1) / 7;
      const ry = pk + (roofBot + 2 * s - pk) * t;
      const rw = (tiW + 4 * s) * t;
      ctx.beginPath();
      ctx.moveTo(x - rw, ry);
      ctx.lineTo(x + rw, ry);
      ctx.stroke();
    }

    // Ridge highlight
    ctx.strokeStyle = "rgba(120,100,70,0.25)";
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(x, pk);
    ctx.lineTo(x + tiW + 4 * s, roofBot + 2 * s);
    ctx.stroke();

    // Flag pole + banner
    ctx.strokeStyle = "#3A2A1A";
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(x, pk);
    ctx.lineTo(x, pk - 10 * s);
    ctx.stroke();
    const flagWave = Math.sin(time * 3 + x * 0.1) * 2 * s;
    ctx.fillStyle = "#B03030";
    ctx.beginPath();
    ctx.moveTo(x + 1 * s, pk - 10 * s);
    ctx.quadraticCurveTo(x + 4 * s + flagWave, pk - 8 * s, x + 7 * s, pk - 7 * s + flagWave * 0.5);
    ctx.lineTo(x + 7 * s, pk - 4 * s + flagWave * 0.5);
    ctx.quadraticCurveTo(x + 4 * s + flagWave * 0.5, pk - 5 * s, x + 1 * s, pk - 7 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#D8A838";
    ctx.beginPath();
    ctx.arc(x, pk - 10.5 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();

    // Warm lantern glow at top
    const orbPulse = 0.5 + Math.sin(time * 2) * 0.15;
    const orbGlow = ctx.createRadialGradient(x - tiW * 0.5, y - tH * 0.55, 0, x - tiW * 0.5, y - tH * 0.55, 8 * s);
    orbGlow.addColorStop(0, `rgba(255,200,100,${orbPulse * 0.15})`);
    orbGlow.addColorStop(1, "rgba(255,200,100,0)");
    ctx.fillStyle = orbGlow;
    ctx.beginPath();
    ctx.ellipse(x - tiW * 0.5, y - tH * 0.55, 8 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (v === 2) {
    // === HALF-TIMBER MANOR — lower stone, upper plaster with beams, steep roof ===
    const wW = 28 * s, wD = 18 * s, wH = 28 * s, rH = 20 * s;
    const iW = wW * 0.866, iD = wD * 0.5;
    const stoneH = wH * 0.4;

    // Foundation
    ctx.fillStyle = "#3E3028";
    ctx.beginPath();
    ctx.moveTo(x, y + iD + 3 * s);
    ctx.lineTo(x + iW + 3 * s, y + 3 * s);
    ctx.lineTo(x, y - iD + 3 * s);
    ctx.lineTo(x - iW - 3 * s, y + 3 * s);
    ctx.closePath();
    ctx.fill();

    // Lower left wall — stone
    drawBldgStoneWall(ctx,
      [[x - iW, y], [x, y + iD], [x, y + iD - stoneH], [x - iW, y - stoneH]],
      "#5A4A3A", 5, s
    );

    // Lower right wall — stone with gradient
    const lrG = ctx.createLinearGradient(x, y, x + iW, y);
    lrG.addColorStop(0, "#8A7A65");
    lrG.addColorStop(1, "#6A5A48");
    ctx.fillStyle = lrG;
    ctx.beginPath();
    ctx.moveTo(x + iW, y);
    ctx.lineTo(x, y + iD);
    ctx.lineTo(x, y + iD - stoneH);
    ctx.lineTo(x + iW, y - stoneH);
    ctx.closePath();
    ctx.fill();
    drawBldgStoneWall(ctx,
      [[x, y + iD], [x + iW, y], [x + iW, y - stoneH], [x, y + iD - stoneH]],
      "rgba(0,0,0,0)", 5, s
    );

    // Overhang ledge between stone/plaster
    ctx.fillStyle = "#5D4037";
    ctx.beginPath();
    ctx.moveTo(x - iW - 3 * s, y - stoneH);
    ctx.lineTo(x + 3 * s, y + iD - stoneH);
    ctx.lineTo(x + 3 * s, y + iD - stoneH + 2.5 * s);
    ctx.lineTo(x - iW - 3 * s, y - stoneH + 2.5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4A3525";
    ctx.beginPath();
    ctx.moveTo(x + iW + 3 * s, y - stoneH);
    ctx.lineTo(x - 3 * s, y + iD - stoneH);
    ctx.lineTo(x - 3 * s, y + iD - stoneH + 2.5 * s);
    ctx.lineTo(x + iW + 3 * s, y - stoneH + 2.5 * s);
    ctx.closePath();
    ctx.fill();

    // Upper left wall — warm plaster
    ctx.fillStyle = "#C8B898";
    ctx.beginPath();
    ctx.moveTo(x - iW, y - stoneH);
    ctx.lineTo(x, y + iD - stoneH);
    ctx.lineTo(x, y + iD - wH);
    ctx.lineTo(x - iW, y - wH);
    ctx.closePath();
    ctx.fill();

    // Upper right wall — warm plaster with gradient
    const urG = ctx.createLinearGradient(x, y - stoneH, x + iW, y - stoneH);
    urG.addColorStop(0, "#D8C8A8");
    urG.addColorStop(1, "#C0B090");
    ctx.fillStyle = urG;
    ctx.beginPath();
    ctx.moveTo(x + iW, y - stoneH);
    ctx.lineTo(x, y + iD - stoneH);
    ctx.lineTo(x, y + iD - wH);
    ctx.lineTo(x + iW, y - wH);
    ctx.closePath();
    ctx.fill();

    // Timber frame on right wall
    ctx.strokeStyle = "#3E2A1A";
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.moveTo(x + 2 * s, y + iD - stoneH);
    ctx.lineTo(x + 2 * s, y + iD - wH);
    ctx.moveTo(x + iW - 2 * s, y - stoneH);
    ctx.lineTo(x + iW - 2 * s, y - wH);
    ctx.moveTo(x + iW * 0.5, y + iD * 0.5 - stoneH);
    ctx.lineTo(x + iW * 0.5, y + iD * 0.5 - wH);
    ctx.stroke();
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(x + 1 * s, y + iD - wH * 0.65);
    ctx.lineTo(x + iW - 1 * s, y - wH * 0.65);
    ctx.moveTo(x + 1 * s, y + iD - wH + 2 * s);
    ctx.lineTo(x + iW - 1 * s, y - wH + 2 * s);
    ctx.stroke();
    // Cross bracing
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(x + 3 * s, y + iD - stoneH);
    ctx.lineTo(x + iW * 0.48, y + iD * 0.52 - wH);
    ctx.moveTo(x + iW * 0.52, y + iD * 0.48 - stoneH);
    ctx.lineTo(x + iW - 3 * s, y - wH);
    ctx.stroke();

    // Left wall timber
    ctx.strokeStyle = "#3E2A1A";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(x - iW + 2 * s, y - stoneH);
    ctx.lineTo(x - iW + 2 * s, y - wH);
    ctx.moveTo(x - 2 * s, y + iD - stoneH);
    ctx.lineTo(x - 2 * s, y + iD - wH);
    ctx.stroke();

    // Large door
    drawBldgDoor(ctx, x + iW * 0.2, y + iD * 0.7, 8 * s, 15 * s, s);

    // Right wall windows (upper)
    for (let wi = 0; wi < 3; wi++) {
      const wwx = x + iW * (0.15 + wi * 0.32);
      const wwy = y + iD * (0.65 - wi * 0.32) - wH * 0.58;
      drawBldgArchWin(ctx, wwx, wwy, 3 * s, 5.5 * s, s);
    }

    // Left wall window
    drawBldgArchWin(ctx, x - iW * 0.55, y - wH * 0.6, 3.5 * s, 6 * s, s, true);

    // Steep roof
    drawBldgRoof(ctx, x, y - wH - rH, y - wH, iW, iD, 6 * s, s,
      "#3A2A1A", "#5A4030", "#6A5040");

    // Dormer window
    const dwX = x + iW * 0.35;
    const dwY = y - wH - rH * 0.4;
    ctx.fillStyle = "#C8B898";
    ctx.beginPath();
    ctx.moveTo(dwX - 5 * s, dwY + 7 * s);
    ctx.lineTo(dwX, dwY);
    ctx.lineTo(dwX + 5 * s, dwY + 7 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6A5A48";
    ctx.beginPath();
    ctx.moveTo(dwX - 5 * s, dwY + 7 * s);
    ctx.lineTo(dwX - 5 * s, dwY + 7 * s + 2 * s);
    ctx.lineTo(dwX + 5 * s, dwY + 7 * s + 2 * s);
    ctx.lineTo(dwX + 5 * s, dwY + 7 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1A1008";
    ctx.fillRect(dwX - 3 * s, dwY + 2 * s, 6 * s, 5 * s);
    const dwGlow = ctx.createRadialGradient(dwX, dwY + 4.5 * s, 0, dwX, dwY + 4.5 * s, 3.5 * s);
    dwGlow.addColorStop(0, "rgba(255,200,100,0.45)");
    dwGlow.addColorStop(1, "rgba(220,160,60,0.1)");
    ctx.fillStyle = dwGlow;
    ctx.fillRect(dwX - 2.5 * s, dwY + 2.5 * s, 5 * s, 4 * s);
    ctx.strokeStyle = "#3A2518";
    ctx.lineWidth = 0.6 * s;
    ctx.strokeRect(dwX - 3 * s, dwY + 2 * s, 6 * s, 5 * s);
    ctx.beginPath();
    ctx.moveTo(dwX, dwY + 2 * s);
    ctx.lineTo(dwX, dwY + 7 * s);
    ctx.moveTo(dwX - 3 * s, dwY + 4.5 * s);
    ctx.lineTo(dwX + 3 * s, dwY + 4.5 * s);
    ctx.stroke();

    // Chimney
    drawBldgChimney(ctx, x - iW * 0.3, y - wH - rH - 5 * s, rH * 0.5, s, time, x);

  } else {
    // === ROUND STONE HUT — cylindrical walls, thatched conical roof ===
    const hR = 16 * s, hH = 18 * s, thatchH = 20 * s;

    // Cylindrical stone wall
    const cwG = ctx.createLinearGradient(x - hR, y, x + hR, y);
    cwG.addColorStop(0, "#504840");
    cwG.addColorStop(0.35, "#8A7A65");
    cwG.addColorStop(0.7, "#6A5A48");
    cwG.addColorStop(1, "#504840");
    ctx.fillStyle = cwG;
    ctx.beginPath();
    ctx.ellipse(x, y, hR, hR * 0.45, 0, 0, Math.PI);
    ctx.lineTo(x - hR, y - hH);
    ctx.ellipse(x, y - hH, hR, hR * 0.45, 0, Math.PI, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // Stone mortar on cylinder
    ctx.strokeStyle = "rgba(30,20,10,0.2)";
    ctx.lineWidth = 0.6 * s;
    for (let r = 0; r < 6; r++) {
      const ry = y - hH + (r + 0.5) * (hH / 6);
      ctx.beginPath();
      ctx.ellipse(x, ry, hR + 0.5 * s, hR * 0.45, 0, 0.1, Math.PI - 0.1);
      ctx.stroke();
      // Vertical joints
      const cols = 4 + (r % 2);
      for (let c = 0; c < cols; c++) {
        const ang = 0.3 + (c / cols) * (Math.PI - 0.6) + (r % 2 === 0 ? 0.15 : 0);
        const jx = x + Math.cos(ang) * hR;
        const jy = ry + Math.sin(ang) * hR * 0.45 * 0.2;
        const nextRy = y - hH + (r + 1.5) * (hH / 6);
        ctx.beginPath();
        ctx.moveTo(jx, jy);
        ctx.lineTo(jx, Math.min(nextRy, y));
        ctx.stroke();
      }
    }

    // Top rim
    ctx.fillStyle = "#6A5A48";
    ctx.beginPath();
    ctx.ellipse(x, y - hH, hR + 1.5 * s, hR * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7A6A58";
    ctx.beginPath();
    ctx.ellipse(x, y - hH, hR, hR * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Door
    const dAngle = 0.35;
    const dX = x + Math.cos(dAngle) * hR * 0.72;
    const dBaseY = y + Math.sin(dAngle) * hR * 0.3;
    drawBldgDoor(ctx, dX, dBaseY, 6 * s, 12 * s, s);

    // Windows
    drawBldgArchWin(ctx, x - hR * 0.62, y - hH * 0.45, 3 * s, 5 * s, s);
    drawBldgArchWin(ctx, x + hR * 0.12, y - hH * 0.5 + hR * 0.1, 2.5 * s, 4.5 * s, s);

    // Thatched conical roof
    const roofBase = y - hH;
    const pk = roofBase - thatchH;
    ctx.fillStyle = "#3A2A1A";
    ctx.beginPath();
    ctx.moveTo(x, pk);
    ctx.lineTo(x - hR - 6 * s, roofBase + 3 * s);
    ctx.lineTo(x + hR + 6 * s, roofBase + 3 * s);
    ctx.closePath();
    ctx.fill();
    const thG = ctx.createLinearGradient(x, pk, x + hR + 6 * s, roofBase);
    thG.addColorStop(0, "#6A5840");
    thG.addColorStop(1, "#3A2A1A");
    ctx.fillStyle = thG;
    ctx.beginPath();
    ctx.moveTo(x, pk);
    ctx.lineTo(x + hR + 6 * s, roofBase + 3 * s);
    ctx.lineTo(x, roofBase + hR * 0.45 + 3 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5A4838";
    ctx.beginPath();
    ctx.moveTo(x, pk);
    ctx.lineTo(x - hR - 6 * s, roofBase + 3 * s);
    ctx.lineTo(x, roofBase + hR * 0.45 + 3 * s);
    ctx.closePath();
    ctx.fill();

    // Thatch texture (wispy horizontal + vertical)
    ctx.strokeStyle = "rgba(90,70,40,0.22)";
    ctx.lineWidth = 0.7 * s;
    for (let r = 0; r < 7; r++) {
      const t = (r + 0.5) / 8;
      const ly = pk + (roofBase + 3 * s - pk) * t;
      const lw = (hR + 6 * s) * t;
      ctx.beginPath();
      ctx.moveTo(x - lw, ly);
      ctx.lineTo(x + lw, ly);
      ctx.stroke();
    }
    // Vertical thatch bundles
    ctx.lineWidth = 0.5 * s;
    for (let b = 0; b < 8; b++) {
      const t = (b + 0.5) / 8;
      const bx = x - (hR + 6 * s) + (hR + 6 * s) * 2 * t;
      const topT = Math.abs(bx - x) / (hR + 6 * s);
      const by1 = pk + (roofBase + 3 * s - pk) * topT;
      ctx.beginPath();
      ctx.moveTo(bx, by1 + 2 * s);
      ctx.lineTo(bx, roofBase + 3 * s);
      ctx.stroke();
    }

    // Ridge highlight
    ctx.strokeStyle = "rgba(120,100,70,0.25)";
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(x, pk);
    ctx.lineTo(x + hR + 6 * s, roofBase + 3 * s);
    ctx.stroke();

    // Roof fascia/edge
    ctx.fillStyle = "#4A3A28";
    ctx.beginPath();
    ctx.ellipse(x, roofBase + 3 * s, hR + 6 * s, hR * 0.48, 0, 0, Math.PI);
    ctx.lineTo(x - hR - 6 * s, roofBase + 5 * s);
    ctx.ellipse(x, roofBase + 5 * s, hR + 6 * s, hR * 0.48, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

    // Smoke hole at peak
    ctx.fillStyle = "#2A1A10";
    ctx.beginPath();
    ctx.ellipse(x, pk + 2 * s, 3 * s, 1.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    const smDrift = Math.sin(time * 2.2 + x * 0.1) * 2.5 * s;
    ctx.fillStyle = "rgba(170,160,150,0.18)";
    ctx.beginPath();
    ctx.ellipse(x + smDrift * 0.5, pk - 3 * s, 3 * s, 1.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(150,145,140,0.12)";
    ctx.beginPath();
    ctx.ellipse(x + smDrift, pk - 8 * s, 4.5 * s, 2.5 * s, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(140,135,130,0.06)";
    ctx.beginPath();
    ctx.ellipse(x + smDrift * 1.5, pk - 14 * s, 6 * s, 3 * s, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// STATUE RENDERING
// ============================================================================

function drawStatue(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string
): void {
  const stoneColor = variant === "bronze" ? "#cd7f32" :
                     variant === "gold" ? "#ffd700" : "#a0a0a0";

  // Pedestal
  ctx.fillStyle = "#808080";
  ctx.fillRect(x - 10 * scale, y - 5 * scale, 20 * scale, 5 * scale);
  ctx.fillStyle = "#606060";
  ctx.fillRect(x - 12 * scale, y, 24 * scale, 5 * scale);

  // Statue body
  ctx.fillStyle = stoneColor;
  ctx.beginPath();
  ctx.ellipse(x, y - 15 * scale, 8 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(x, y - 30 * scale, 6 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = lightenColor(stoneColor, 40);
  ctx.beginPath();
  ctx.arc(x - 2 * scale, y - 32 * scale, 2 * scale, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// LAMP RENDERING
// ============================================================================

function drawLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  const glowIntensity = 0.5 + Math.sin(time * 3) * 0.2;

  // Post
  ctx.fillStyle = "#333333";
  ctx.fillRect(x - 2 * scale, y - 30 * scale, 4 * scale, 30 * scale);

  // Lamp housing
  ctx.fillStyle = "#4a4a4a";
  ctx.beginPath();
  ctx.moveTo(x - 8 * scale, y - 30 * scale);
  ctx.lineTo(x - 6 * scale, y - 40 * scale);
  ctx.lineTo(x + 6 * scale, y - 40 * scale);
  ctx.lineTo(x + 8 * scale, y - 30 * scale);
  ctx.closePath();
  ctx.fill();

  // Light glow
  ctx.shadowColor = "#ffdd88";
  ctx.shadowBlur = 20 * scale * glowIntensity;
  ctx.fillStyle = `rgba(255, 220, 100, ${glowIntensity})`;
  ctx.beginPath();
  ctx.arc(x, y - 35 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Light cone
  ctx.fillStyle = `rgba(255, 220, 100, ${glowIntensity * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(x - 5 * scale, y - 30 * scale);
  ctx.lineTo(x - 15 * scale, y + 5 * scale);
  ctx.lineTo(x + 15 * scale, y + 5 * scale);
  ctx.lineTo(x + 5 * scale, y - 30 * scale);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// FENCE RENDERING
// ============================================================================

function drawFence(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string
): void {
  const fenceColor = variant === "iron" ? "#4a4a4a" : "#8b7355";
  const postCount = 3;

  for (let i = 0; i < postCount; i++) {
    const postX = x + (i - 1) * 12 * scale;

    // Post
    ctx.fillStyle = fenceColor;
    ctx.fillRect(postX - 2 * scale, y - 20 * scale, 4 * scale, 20 * scale);

    // Post cap
    if (variant === "iron") {
      ctx.beginPath();
      ctx.arc(postX, y - 22 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(postX, y - 25 * scale);
      ctx.lineTo(postX - 3 * scale, y - 20 * scale);
      ctx.lineTo(postX + 3 * scale, y - 20 * scale);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Horizontal bars
  ctx.fillStyle = fenceColor;
  ctx.fillRect(x - 18 * scale, y - 15 * scale, 36 * scale, 2 * scale);
  ctx.fillRect(x - 18 * scale, y - 8 * scale, 36 * scale, 2 * scale);
}

// ============================================================================
// WATER FEATURE RENDERING
// ============================================================================

function drawWaterFeature(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string,
  time: number = 0
): void {
  if (variant === "fountain") {
    // Fountain base
    ctx.fillStyle = "#a0a0a0";
    ctx.beginPath();
    ctx.ellipse(x, y, 20 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water
    ctx.fillStyle = "rgba(100, 150, 220, 0.6)";
    ctx.beginPath();
    ctx.ellipse(x, y - 2 * scale, 16 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Central spout
    ctx.fillStyle = "#808080";
    ctx.fillRect(x - 3 * scale, y - 15 * scale, 6 * scale, 15 * scale);

    // Water spray
    ctx.fillStyle = `rgba(150, 200, 255, ${0.5 + Math.sin(time * 5) * 0.2})`;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + time;
      const dropY = y - 20 * scale - Math.abs(Math.sin(time * 3 + i)) * 15 * scale;
      const dropX = x + Math.cos(angle) * 5 * scale;
      ctx.beginPath();
      ctx.ellipse(dropX, dropY, 2 * scale, 3 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Pond
    ctx.fillStyle = "rgba(70, 130, 180, 0.7)";
    ctx.beginPath();
    ctx.ellipse(x, y, 25 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ripples
    ctx.strokeStyle = `rgba(150, 200, 255, ${0.3 + Math.sin(time * 2) * 0.2})`;
    ctx.lineWidth = 1.5 * scale;
    const rippleProgress = (time % 2) / 2;
    ctx.beginPath();
    ctx.ellipse(x, y, 10 * scale * rippleProgress, 5 * scale * rippleProgress, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ============================================================================
// RUINS RENDERING
// ============================================================================

function drawRuins(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant?: string
): void {
  const stoneColor = "#a0a090";

  // Broken columns
  for (let i = 0; i < 3; i++) {
    const colX = x + (i - 1) * 15 * scale;
    const colHeight = (15 + Math.random() * 15) * scale;

    ctx.fillStyle = stoneColor;
    ctx.fillRect(colX - 4 * scale, y - colHeight, 8 * scale, colHeight);

    // Column top
    ctx.fillStyle = darkenColor(stoneColor, 20);
    ctx.beginPath();
    ctx.moveTo(colX - 5 * scale, y - colHeight);
    ctx.lineTo(colX, y - colHeight - 3 * scale);
    ctx.lineTo(colX + 5 * scale, y - colHeight);
    ctx.closePath();
    ctx.fill();
  }

  // Rubble
  ctx.fillStyle = darkenColor(stoneColor, 30);
  for (let i = 0; i < 5; i++) {
    const rubbleX = x + (Math.random() - 0.5) * 30 * scale;
    const rubbleY = y + (Math.random() - 0.5) * 10 * scale;
    ctx.beginPath();
    ctx.arc(rubbleX, rubbleY, (2 + Math.random() * 3) * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// CRATER RENDERING - Isometric holes with depth and variations
// ============================================================================

function drawCrater(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0,
  time: number = 0
): void {
  // Variant determines crater style:
  // 0: Standard crater - round impact hole
  // 1: Elongated crater - stretched impact
  // 2: Deep pit - darker, more dramatic
  // 3: Shallow depression - subtle ground damage
  
  const craterStyles = [
    { widthMult: 1.0, depthMult: 1.0, rimHeight: 0.3, name: "standard" },
    { widthMult: 1.4, depthMult: 0.7, rimHeight: 0.2, name: "elongated" },
    { widthMult: 0.85, depthMult: 1.3, rimHeight: 0.4, name: "deep" },
    { widthMult: 1.2, depthMult: 0.5, rimHeight: 0.15, name: "shallow" },
  ];
  
  const style = craterStyles[variant % craterStyles.length];
  
  // Base dimensions - isometric ratio (2:1 for proper perspective)
  const baseWidth = 18 * scale * style.widthMult;
  const baseDepth = baseWidth * 0.5; // Isometric foreshortening
  const craterDepth = 8 * scale * style.depthMult;
  const rimThickness = 4 * scale * style.rimHeight;
  
  // Slight rotation based on position for variety
  const rotationOffset = Math.sin(x * 0.01 + y * 0.02) * 0.15;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotationOffset);
  
  // === OUTER RIM / DISPLACED EARTH ===
  // Dirt pushed up around crater edges
  const rimGradient = ctx.createRadialGradient(0, 0, baseWidth * 0.6, 0, 0, baseWidth * 1.2);
  rimGradient.addColorStop(0, "rgba(90, 75, 55, 0)");
  rimGradient.addColorStop(0.5, "rgba(100, 85, 65, 0.4)");
  rimGradient.addColorStop(0.8, "rgba(80, 65, 45, 0.2)");
  rimGradient.addColorStop(1, "rgba(70, 55, 35, 0)");
  
  ctx.fillStyle = rimGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, baseWidth * 1.3, baseDepth * 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // === CRATER RIM HIGHLIGHT ===
  // Lit edge on the upper rim
  ctx.strokeStyle = `rgba(140, 125, 100, ${0.3 + style.rimHeight * 0.5})`;
  ctx.lineWidth = rimThickness;
  ctx.beginPath();
  ctx.ellipse(0, -rimThickness * 0.3, baseWidth, baseDepth, 0, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  
  // === MAIN CRATER HOLE ===
  // Dark interior with layered depth
  
  // Outer edge (lighter brown/earth)
  ctx.fillStyle = "#4a3d2e";
  ctx.beginPath();
  ctx.ellipse(0, 0, baseWidth, baseDepth, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Mid layer (darker)
  const midWidth = baseWidth * 0.75;
  const midDepth = baseDepth * 0.75;
  ctx.fillStyle = "#3a2d1e";
  ctx.beginPath();
  ctx.ellipse(0, craterDepth * 0.15, midWidth, midDepth, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner shadow / deep hole
  const innerWidth = baseWidth * 0.5;
  const innerDepth = baseDepth * 0.5;
  const innerGradient = ctx.createRadialGradient(
    0, craterDepth * 0.25,
    0,
    0, craterDepth * 0.25,
    innerWidth
  );
  innerGradient.addColorStop(0, "#1a1510");
  innerGradient.addColorStop(0.6, "#2a2015");
  innerGradient.addColorStop(1, "#3a2d1e");
  
  ctx.fillStyle = innerGradient;
  ctx.beginPath();
  ctx.ellipse(0, craterDepth * 0.25, innerWidth, innerDepth, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // === 3D DEPTH ILLUSION - Inner wall visible on far side ===
  // The "back wall" of the crater should be slightly visible
  ctx.fillStyle = "#4d3f30";
  ctx.beginPath();
  ctx.ellipse(0, -craterDepth * 0.1, baseWidth * 0.85, baseDepth * 0.4, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  
  // === SHADOW INSIDE (bottom of crater) ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(innerWidth * 0.15, craterDepth * 0.3, innerWidth * 0.7, innerDepth * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // === SCATTERED DEBRIS / RUBBLE around edges ===
  const debrisCount = 4 + Math.floor(variant * 1.5);
  const seed = x * 73 + y * 137; // Deterministic randomness
  
  for (let i = 0; i < debrisCount; i++) {
    const angle = (i / debrisCount) * Math.PI * 2 + seed * 0.01;
    const dist = baseWidth * (0.9 + Math.sin(seed + i * 47) * 0.3);
    const debrisX = Math.cos(angle) * dist;
    const debrisY = Math.sin(angle) * dist * 0.5; // Isometric
    const debrisSize = (2 + Math.abs(Math.sin(seed + i * 31)) * 3) * scale;
    
    // Small rocks/dirt chunks
    ctx.fillStyle = `rgb(${85 + Math.floor(Math.sin(seed + i) * 20)}, ${70 + Math.floor(Math.cos(seed + i) * 15)}, ${50 + Math.floor(Math.sin(seed + i * 2) * 15)})`;
    ctx.beginPath();
    ctx.ellipse(debrisX, debrisY, debrisSize, debrisSize * 0.6, angle * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // === SUBTLE SMOKE/DUST for fresh craters (variant 2) ===
  if (variant === 2) {
    const smokeAlpha = 0.15 + Math.sin(time * 0.5) * 0.05;
    ctx.fillStyle = `rgba(60, 50, 40, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      Math.sin(time) * 2 * scale,
      -craterDepth * 0.5 + Math.cos(time * 0.7) * scale,
      baseWidth * 0.6,
      baseDepth * 0.4,
      0, 0, Math.PI * 2
    );
    ctx.fill();
  }
  
  ctx.restore();
}

// ============================================================================
// DEBRIS RENDERING - Scattered battlefield wreckage
// ============================================================================

function drawDebris(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0
): void {
  const seed = x * 73 + y * 137;
  
  // Debris types: 0=wood splinters, 1=stone chunks, 2=metal scraps, 3=mixed
  const colors = [
    ["#6b5344", "#8b7355", "#5d4037"], // Wood
    ["#808080", "#a0a090", "#606060"], // Stone
    ["#5a5a5a", "#7a7a7a", "#4a4a4a"], // Metal
    ["#7a6a5a", "#8a8070", "#5a4a3a"], // Mixed
  ];
  const palette = colors[variant % colors.length];
  
  ctx.save();
  ctx.translate(x, y);
  
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 3 * scale, 12 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Scattered pieces
  const pieceCount = 5 + (variant % 3);
  for (let i = 0; i < pieceCount; i++) {
    const angle = (seed + i * 67) % (Math.PI * 2);
    const dist = (3 + ((seed + i * 31) % 10)) * scale;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist * 0.5;
    const size = (3 + ((seed + i * 23) % 5)) * scale;
    const rotation = (seed + i * 41) % (Math.PI * 2);
    
    ctx.fillStyle = palette[i % palette.length];
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rotation);
    
    if (variant === 0) {
      // Wood splinters - elongated
      ctx.fillRect(-size, -size * 0.2, size * 2, size * 0.4);
    } else if (variant === 1) {
      // Stone chunks - angular
      ctx.beginPath();
      ctx.moveTo(-size * 0.8, size * 0.3);
      ctx.lineTo(-size * 0.5, -size * 0.5);
      ctx.lineTo(size * 0.6, -size * 0.4);
      ctx.lineTo(size * 0.7, size * 0.4);
      ctx.closePath();
      ctx.fill();
    } else {
      // Irregular shapes
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  
  ctx.restore();
}

// ============================================================================
// SKELETON RENDERING - Fallen warriors
// ============================================================================

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0
): void {
  const boneColor = "#e8e0d0";
  const boneShade = "#c8c0b0";
  const seed = x * 73 + y * 137;
  
  ctx.save();
  ctx.translate(x, y);
  
  // Pose variants: 0=lying flat, 1=reaching, 2=curled, 3=scattered
  const rotation = (variant === 3) ? 0 : ((seed % 4) - 2) * 0.3;
  ctx.rotate(rotation);
  
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.ellipse(0, 2 * scale, 15 * scale, 7 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  
  if (variant === 3) {
    // Scattered bones
    for (let i = 0; i < 6; i++) {
      const bx = ((seed + i * 47) % 20 - 10) * scale;
      const by = ((seed + i * 31) % 10 - 5) * scale * 0.5;
      const boneRot = (seed + i * 23) % (Math.PI);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(boneRot);
      ctx.fillStyle = i % 2 === 0 ? boneColor : boneShade;
      ctx.fillRect(-4 * scale, -1 * scale, 8 * scale, 2 * scale);
      // Bone ends
      ctx.beginPath();
      ctx.arc(-4 * scale, 0, 1.5 * scale, 0, Math.PI * 2);
      ctx.arc(4 * scale, 0, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else {
    // Ribcage
    ctx.fillStyle = boneShade;
    ctx.beginPath();
    ctx.ellipse(0, -2 * scale, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ribs
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 1.5 * scale;
    for (let i = 0; i < 4; i++) {
      const ribY = -4 * scale + i * 2 * scale;
      ctx.beginPath();
      ctx.ellipse(0, ribY, 5 * scale, 1.5 * scale, 0, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    }
    
    // Skull
    ctx.fillStyle = boneColor;
    const skullY = -8 * scale;
    ctx.beginPath();
    ctx.ellipse(0, skullY, 4 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye sockets
    ctx.fillStyle = "#2a2520";
    ctx.beginPath();
    ctx.ellipse(-1.5 * scale, skullY - 0.5 * scale, 1 * scale, 0.8 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(1.5 * scale, skullY - 0.5 * scale, 1 * scale, 0.8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Limbs
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 2 * scale;
    
    // Arms
    if (variant === 1) {
      // Reaching pose
      ctx.beginPath();
      ctx.moveTo(-5 * scale, -2 * scale);
      ctx.lineTo(-12 * scale, -8 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5 * scale, -2 * scale);
      ctx.lineTo(10 * scale, 2 * scale);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-5 * scale, -2 * scale);
      ctx.lineTo(-10 * scale, 3 * scale);
      ctx.moveTo(5 * scale, -2 * scale);
      ctx.lineTo(10 * scale, 3 * scale);
      ctx.stroke();
    }
    
    // Legs
    ctx.beginPath();
    ctx.moveTo(-2 * scale, 2 * scale);
    ctx.lineTo(-5 * scale, 10 * scale);
    ctx.moveTo(2 * scale, 2 * scale);
    ctx.lineTo(5 * scale, 10 * scale);
    ctx.stroke();
  }
  
  ctx.restore();
}

// ============================================================================
// BONES RENDERING - Scattered bone fragments
// ============================================================================

function drawBones(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0
): void {
  const boneColor = "#e8e0d0";
  const boneShade = "#d0c8b8";
  const seed = x * 73 + y * 137;
  
  ctx.save();
  ctx.translate(x, y);
  
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 2 * scale, 10 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  
  const boneCount = 3 + (variant % 3);
  for (let i = 0; i < boneCount; i++) {
    const bx = ((seed + i * 47) % 16 - 8) * scale;
    const by = ((seed + i * 31) % 8 - 4) * scale * 0.5;
    const boneLen = (4 + (seed + i * 13) % 4) * scale;
    const boneRot = ((seed + i * 23) % 180) * Math.PI / 180;
    
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(boneRot);
    
    // Bone shaft
    ctx.fillStyle = i % 2 === 0 ? boneColor : boneShade;
    ctx.fillRect(-boneLen, -0.8 * scale, boneLen * 2, 1.6 * scale);
    
    // Bone ends (knobby)
    ctx.beginPath();
    ctx.arc(-boneLen, 0, 1.8 * scale, 0, Math.PI * 2);
    ctx.arc(boneLen, 0, 1.8 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  ctx.restore();
}

// ============================================================================
// SWORD RENDERING - Fallen weapons
// ============================================================================

function drawSword(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0
): void {
  const seed = x * 73 + y * 137;
  const rotation = ((seed % 360) - 180) * Math.PI / 180;
  
  // Variant: 0=steel, 1=bronze, 2=rusted, 3=broken
  const bladeColors = ["#c0c0c0", "#cd7f32", "#8b6914", "#a0a0a0"];
  const bladeColor = bladeColors[variant % bladeColors.length];
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 2 * scale, 12 * scale, 4 * scale, rotation, 0, Math.PI * 2);
  ctx.fill();
  
  const bladeLen = variant === 3 ? 8 * scale : 14 * scale;
  
  // Blade
  ctx.fillStyle = bladeColor;
  ctx.beginPath();
  ctx.moveTo(-bladeLen, 0);
  ctx.lineTo(-bladeLen + 3 * scale, -1.5 * scale);
  ctx.lineTo(bladeLen - 2 * scale, -0.5 * scale);
  ctx.lineTo(bladeLen, 0);
  ctx.lineTo(bladeLen - 2 * scale, 0.5 * scale);
  ctx.lineTo(-bladeLen + 3 * scale, 1.5 * scale);
  ctx.closePath();
  ctx.fill();
  
  // Blade highlight
  ctx.fillStyle = lightenColor(bladeColor, 30);
  ctx.beginPath();
  ctx.moveTo(-bladeLen + 3 * scale, -1 * scale);
  ctx.lineTo(bladeLen - 3 * scale, -0.3 * scale);
  ctx.lineTo(bladeLen - 3 * scale, 0);
  ctx.lineTo(-bladeLen + 3 * scale, 0);
  ctx.closePath();
  ctx.fill();
  
  // Guard
  ctx.fillStyle = "#8b7355";
  ctx.fillRect(-bladeLen - 1 * scale, -3 * scale, 2 * scale, 6 * scale);
  
  // Handle
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(-bladeLen - 6 * scale, -1.5 * scale, 5 * scale, 3 * scale);
  
  // Handle wrap
  ctx.strokeStyle = "#3d2017";
  ctx.lineWidth = 0.5 * scale;
  for (let i = 0; i < 4; i++) {
    const hx = -bladeLen - 5.5 * scale + i * 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(hx, -1.5 * scale);
    ctx.lineTo(hx, 1.5 * scale);
    ctx.stroke();
  }
  
  // Pommel
  ctx.fillStyle = "#cd853f";
  ctx.beginPath();
  ctx.arc(-bladeLen - 7 * scale, 0, 2 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Rust spots for variant 2
  if (variant === 2) {
    ctx.fillStyle = "rgba(139, 69, 19, 0.5)";
    for (let i = 0; i < 5; i++) {
      const rx = -bladeLen + 5 * scale + ((seed + i * 37) % 15) * scale * 0.8;
      const ry = ((seed + i * 23) % 3 - 1.5) * scale * 0.5;
      ctx.beginPath();
      ctx.arc(rx, ry, (1 + (seed + i) % 2) * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

// ============================================================================
// ARROW RENDERING - Fallen projectiles
// ============================================================================

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0
): void {
  const seed = x * 73 + y * 137;
  const rotation = ((seed % 360) - 180) * Math.PI / 180;
  const stuck = variant % 2 === 0; // Stuck in ground or lying flat
  
  ctx.save();
  ctx.translate(x, y);
  
  if (stuck) {
    // Arrow stuck in ground at angle
    ctx.rotate(-0.3 + rotation * 0.3);
    
    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.beginPath();
    ctx.ellipse(3 * scale, 4 * scale, 6 * scale, 2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Shaft (angled up)
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(-2 * scale, -12 * scale, 1.5 * scale, 14 * scale);
    
    // Fletching
    ctx.fillStyle = variant === 1 ? "#dc143c" : variant === 3 ? "#228b22" : "#f5f5dc";
    ctx.beginPath();
    ctx.moveTo(-2 * scale, -12 * scale);
    ctx.lineTo(-5 * scale, -10 * scale);
    ctx.lineTo(-2 * scale, -8 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.5 * scale, -12 * scale);
    ctx.lineTo(2.5 * scale, -10 * scale);
    ctx.lineTo(-0.5 * scale, -8 * scale);
    ctx.fill();
  } else {
    // Arrow lying flat
    ctx.rotate(rotation);
    
    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.beginPath();
    ctx.ellipse(0, 2 * scale, 10 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Shaft
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(-8 * scale, -0.5 * scale, 16 * scale, 1 * scale);
    
    // Arrowhead
    ctx.fillStyle = "#808080";
    ctx.beginPath();
    ctx.moveTo(10 * scale, 0);
    ctx.lineTo(8 * scale, -1.5 * scale);
    ctx.lineTo(8 * scale, 1.5 * scale);
    ctx.closePath();
    ctx.fill();
    
    // Fletching
    ctx.fillStyle = variant === 1 ? "#dc143c" : variant === 3 ? "#228b22" : "#f5f5dc";
    ctx.beginPath();
    ctx.moveTo(-8 * scale, 0);
    ctx.lineTo(-6 * scale, -2.5 * scale);
    ctx.lineTo(-4 * scale, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-8 * scale, 0);
    ctx.lineTo(-6 * scale, 2.5 * scale);
    ctx.lineTo(-4 * scale, 0);
    ctx.fill();
  }
  
  ctx.restore();
}

// ============================================================================
// GENERIC DECORATION
// ============================================================================

function drawGenericDecoration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
): void {
  ctx.fillStyle = "#888888";
  ctx.beginPath();
  ctx.arc(x, y - 5 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.fill();
}
