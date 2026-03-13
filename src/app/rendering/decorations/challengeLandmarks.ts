import { ISO_COS, ISO_SIN, ISO_Y_RATIO } from "../../constants";
import type { DecorationType, Position } from "../../types";
import {
  drawOrganicBlobAt,
  drawIsometricPrism,
  drawIsometricPyramid,
} from "../helpers";
import { clearShadow, setShadowBlur } from "../performance";
import { drawDirectionalShadow } from "./shadowHelpers";
import { traceIsoFlushRect } from "../isoFlush";

export interface ChallengeLandmarkRenderParams {
  ctx: CanvasRenderingContext2D;
  screenPos: Position;
  scale: number;
  type: DecorationType;
  decorTime: number;
  decorX: number;
  decorY: number;
  shadowOnly?: boolean;
  skipShadow?: boolean;
}

export const CHALLENGE_LANDMARK_TYPES = new Set<DecorationType>([
  "cannon_crest",
  "ivy_crossroads",
  "blight_basin",
  "triad_keep",
  "sunscorch_labyrinth",
  "frontier_outpost",
  "ashen_spiral",
]);

type CannonDirection = "left" | "center" | "right";

// ---------------------------------------------------------------------------
// Shared micro-helpers
// ---------------------------------------------------------------------------

function fillIsoEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number = radiusX * ISO_Y_RATIO,
  rotation: number = 0,
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
  ctx.fill();
}

function strokeIsoEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number = radiusX * ISO_Y_RATIO,
  rotation: number = 0,
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
  ctx.stroke();
}

function getIsoOrbitPoint(
  x: number,
  y: number,
  angle: number,
  radiusX: number,
  radiusY: number = radiusX * ISO_Y_RATIO,
): Position {
  return {
    x: x + Math.cos(angle) * radiusX,
    y: y + Math.sin(angle) * radiusY,
  };
}

function drawStoneRows(
  ctx: CanvasRenderingContext2D,
  ox: number,
  baseY: number,
  isoW: number,
  isoD: number,
  height: number,
  rows: number,
  alpha: number = 0.15,
): void {
  ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
  ctx.lineWidth = 0.4;
  for (let r = 1; r < rows; r++) {
    const ry = baseY - height * (r / rows);
    ctx.beginPath();
    ctx.moveTo(ox - isoW, ry + isoD);
    ctx.lineTo(ox, ry + isoD * 2);
    ctx.lineTo(ox + isoW, ry + isoD);
    ctx.stroke();
  }
}

function drawEdgeHighlights(
  ctx: CanvasRenderingContext2D,
  ox: number,
  baseY: number,
  isoW: number,
  isoD: number,
  height: number,
  color: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(ox, baseY + isoD * 2);
  ctx.lineTo(ox, baseY - height + isoD * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ox - isoW, baseY + isoD);
  ctx.lineTo(ox - isoW, baseY - height + isoD);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ox + isoW, baseY + isoD);
  ctx.lineTo(ox + isoW, baseY - height + isoD);
  ctx.stroke();
}

function drawSmoke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  t: number,
  count: number,
  spread: number,
  rise: number,
  color: string,
  maxAlpha: number,
): void {
  for (let sw = 0; sw < count; sw++) {
    const phase = (t * 0.3 + sw * (1 / count)) % 1;
    const sx = x + Math.sin(sw * 2.5 + t) * spread * s;
    const sy = y - phase * rise * s;
    const alpha = (1 - phase) * maxAlpha;
    ctx.fillStyle =
      color.includes("rgba") ? color : `rgba(${color},${alpha.toFixed(3)})`;
    if (!color.includes("rgba")) {
      ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
    }
    ctx.beginPath();
    ctx.ellipse(
      sx,
      sy,
      (2 + phase * 4) * s,
      (1.2 + phase * 2) * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Cannon Crest
// ---------------------------------------------------------------------------

function drawDetailedCannon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  dir: CannonDirection,
  t: number,
): void {
  const d = dir === "left" ? -1 : dir === "right" ? 1 : 0;
  const muzzleX = x + d * 10 * s;
  const muzzleY = y - (9 - Math.abs(d) * 1.5) * s;

  const wheelColor1 = "#4a3220";
  const wheelColor2 = "#3a2214";
  const axleColor = "#2d1d11";

  for (const wheelOff of [-4.8, 4.8]) {
    const wx = x + wheelOff * s;
    const wy = y + 4.8 * s;
    ctx.fillStyle = wheelOff < 0 ? wheelColor1 : wheelColor2;
    fillIsoEllipse(ctx, wx, wy, 3 * s, 3 * s * ISO_Y_RATIO);

    ctx.strokeStyle = axleColor;
    ctx.lineWidth = 0.5 * s;
    strokeIsoEllipse(ctx, wx, wy, 3 * s, 3 * s * ISO_Y_RATIO);

    ctx.lineWidth = 0.55 * s;
    for (let spoke = 0; spoke < 6; spoke++) {
      const ang = (spoke / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(
        wx + Math.cos(ang) * 2.6 * s,
        wy + Math.sin(ang) * 2.6 * s * ISO_Y_RATIO,
      );
      ctx.stroke();
    }
    ctx.fillStyle = "#1a1008";
    fillIsoEllipse(ctx, wx, wy, 0.8 * s, 0.8 * s * ISO_Y_RATIO);
  }

  drawIsometricPrism(
    ctx, x, y + 2 * s,
    5 * s, 4.5 * s, 4 * s,
    "#6a5035", "#3d2919", "#54391f",
  );

  const barrelGrad = ctx.createLinearGradient(
    x - 2.4 * s, y - 4 * s, muzzleX, muzzleY,
  );
  barrelGrad.addColorStop(0, "#3a3a3a");
  barrelGrad.addColorStop(0.4, "#2a2a2a");
  barrelGrad.addColorStop(1, "#1a1a1a");

  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.moveTo(x - 2.4 * s, y - 4 * s);
  ctx.lineTo(x + 2.4 * s, y - 4.8 * s);
  ctx.lineTo(muzzleX + 2.2 * s, muzzleY);
  ctx.lineTo(muzzleX - 2.2 * s, muzzleY + 0.8 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#555";
  ctx.beginPath();
  ctx.moveTo(x - 2.4 * s, y - 5.5 * s);
  ctx.lineTo(x + 2.4 * s, y - 6.3 * s);
  ctx.lineTo(muzzleX + 1.8 * s, muzzleY - 1.5 * s);
  ctx.lineTo(muzzleX - 1.8 * s, muzzleY - 0.7 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0e0e0e";
  fillIsoEllipse(ctx, muzzleX, muzzleY - 0.5 * s, 1.5 * s, 1.5 * s * ISO_Y_RATIO);

  for (const bandT of [0.3, 0.6, 0.85]) {
    const bx = x + (muzzleX - x) * bandT;
    const by = y - 4 * s + (muzzleY - (y - 4 * s)) * bandT;
    ctx.strokeStyle = "#777";
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.moveTo(bx - 1.6 * s, by);
    ctx.lineTo(bx + 1.6 * s, by - 0.5 * s);
    ctx.stroke();
  }

  const smokeDrift = Math.sin(t * 3 + x * 0.01) * 2 * s;
  for (let p = 0; p < 3; p++) {
    const phase = (t * 0.5 + p * 0.35) % 1;
    if (phase < 0.6) {
      const alpha = (1 - phase / 0.6) * 0.15;
      const sx = muzzleX + d * phase * 8 * s + smokeDrift;
      const sy = muzzleY - phase * 6 * s;
      ctx.fillStyle = `rgba(120,110,100,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy, (2 + phase * 3) * s, (1 + phase * 1.5) * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCannonCrestLandmark(params: ChallengeLandmarkRenderParams): void {
  const { ctx, screenPos, scale: s, decorTime: t, shadowOnly = false, skipShadow = false } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const bermTop = "#a08860";
  const bermLeft = "#6a5838";
  const bermRight = "#826a42";
  const bermEdge = "#b49e70";
  const stoneTop = "#807058";
  const stoneLeft = "#4a3e2e";
  const stoneRight = "#5c4e38";

  if (!skipShadow) {
    drawDirectionalShadow(ctx, cx, cy + 6 * s, s, 38 * s, 16 * s, 40 * s, 0.35);
  }
  if (shadowOnly) return;

  const gGrad = ctx.createRadialGradient(cx, cy + 4 * s, 0, cx, cy + 4 * s, 32 * s);
  gGrad.addColorStop(0, "rgba(120,95,55,0.3)");
  gGrad.addColorStop(0.5, "rgba(100,80,45,0.15)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 4 * s, 32 * s, 16 * s, 18.4, 0.14, 22);
  ctx.fill();

  drawIsometricPrism(ctx, cx, cy + 4 * s, 30 * s, 22 * s, 4 * s, stoneTop, stoneLeft, stoneRight);
  const fI = 30 * s * ISO_COS;
  const fD = 22 * s * ISO_SIN;
  drawStoneRows(ctx, cx, cy + 4 * s, fI, fD, 4 * s, 3, 0.12);
  ctx.strokeStyle = bermEdge;
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 4 * s + fD * 2);
  ctx.lineTo(cx, cy);
  ctx.stroke();

  drawIsometricPrism(ctx, cx, cy + 1 * s, 28 * s, 20 * s, 5 * s, bermTop, bermLeft, bermRight);
  const bI = 28 * s * ISO_COS;
  const bD = 20 * s * ISO_SIN;
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.35 * s;
  for (let r = 1; r < 4; r++) {
    const ry = cy + 1 * s - 5 * s * (r / 4);
    ctx.beginPath();
    ctx.moveTo(cx - bI, ry + bD);
    ctx.lineTo(cx, ry + bD * 2);
    ctx.lineTo(cx + bI, ry + bD);
    ctx.stroke();
  }
  ctx.strokeStyle = bermEdge;
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 1 * s + bD * 2);
  ctx.lineTo(cx, cy - 4 * s + bD * 2);
  ctx.stroke();

  for (let bag = 0; bag < 10; bag++) {
    const pos = getIsoOrbitPoint(cx, cy - 1 * s, Math.PI * 0.85 + (bag / 9) * Math.PI * 0.3 + bag * 0.08, 24 * s, 8 * s);
    const bagShade = bag % 3 === 0 ? "#9e8a5e" : bag % 3 === 1 ? "#887450" : "#78663e";
    ctx.fillStyle = bagShade;
    fillIsoEllipse(ctx, pos.x, pos.y, 3.5 * s, 2 * s, 0.15);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.3 * s;
    ctx.beginPath();
    ctx.moveTo(pos.x - 1.5 * s, pos.y);
    ctx.lineTo(pos.x + 1.5 * s, pos.y);
    ctx.stroke();
  }

  drawDetailedCannon(ctx, cx - 16 * s, cy + 2 * s, s, "left", t);
  drawDetailedCannon(ctx, cx, cy - 1 * s, s, "center", t);
  drawDetailedCannon(ctx, cx + 16 * s, cy + 1.5 * s, s, "right", t);

  drawIsometricPrism(ctx, cx + 12 * s, cy + 7 * s, 5.5 * s, 4.5 * s, 4.5 * s, "#5a4227", "#3c2817", "#4a331d");
  const crateI = 5.5 * s * ISO_COS;
  const crateD = 4.5 * s * ISO_SIN;
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.3 * s;
  const crateTop = cy + 7 * s - 4.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s - crateI, crateTop + crateD);
  ctx.lineTo(cx + 12 * s, crateTop + crateD * 2);
  ctx.lineTo(cx + 12 * s + crateI, crateTop + crateD);
  ctx.stroke();

  setShadowBlur(ctx, 5 * s, "#ff6633");
  ctx.fillStyle = "rgba(255,100,20,0.25)";
  fillIsoEllipse(ctx, cx + 12 * s, cy + 3 * s, 3 * s, 1.8 * s);
  clearShadow(ctx);

  for (let ball = 0; ball < 5; ball++) {
    const bx = cx - 13 * s + ball * 2.8 * s;
    const by = cy + 10 * s + (ball % 2) * 1.2 * s;
    ctx.fillStyle = "#1a1a1a";
    fillIsoEllipse(ctx, bx, by, 1.4 * s, 1.1 * s);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    fillIsoEllipse(ctx, bx - 0.3 * s, by - 0.3 * s, 0.5 * s, 0.4 * s);
  }

  const flagX = cx + 26 * s;
  const flagY = cy - 2 * s;
  ctx.fillStyle = "#5b4330";
  ctx.fillRect(flagX - 0.8 * s, flagY - 20 * s, 1.6 * s, 24 * s);
  const wave = Math.sin(t * 3.2 + 0.02 * flagX) * 2 * s;
  ctx.fillStyle = "#c84b36";
  ctx.beginPath();
  ctx.moveTo(flagX + 1 * s, flagY - 19 * s);
  ctx.quadraticCurveTo(flagX + 8 * s, flagY - 17 * s + wave, flagX + 12 * s, flagY - 13 * s + wave);
  ctx.lineTo(flagX + 1 * s, flagY - 9 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f0cb56";
  fillIsoEllipse(ctx, flagX + 5.5 * s, flagY - 14.5 * s + wave * 0.35, 1.6 * s, 1.1 * s);

  for (let p = 0; p < 6; p++) {
    const phase = (t * 0.35 + p * 0.18) % 1;
    const px = cx + Math.sin(t * 1.2 + p * 1.7) * 18 * s;
    const py = cy - 8 * s - phase * 22 * s;
    const alpha = (1 - phase) * 0.08;
    ctx.fillStyle = `rgba(140,120,90,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(px, py, (2.5 + phase * 3) * s, (1.5 + phase * 1.5) * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Ivy Crossroads
// ---------------------------------------------------------------------------

function drawIvyCrossroadsLandmark(params: ChallengeLandmarkRenderParams): void {
  const { ctx, screenPos, scale: s, decorTime: t, shadowOnly = false, skipShadow = false } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const sTop = "#a09a88";
  const sLeft = "#5e5a4e";
  const sRight = "#787264";
  const sHi = "#b8b2a0";
  const sEdge = "#c8c0ae";
  const ivyDark = "#1e5518";
  const ivyMid = "#2a7a22";
  const ivyBright = "#44a838";
  const mossColor = "rgba(80,130,55,0.35)";

  if (!skipShadow) {
    drawDirectionalShadow(ctx, cx, cy + 4 * s, s, 28 * s, 12 * s, 45 * s, 0.3);
  }
  if (shadowOnly) return;

  const gGrad = ctx.createRadialGradient(cx, cy + 6 * s, 0, cx, cy + 6 * s, 22 * s);
  gGrad.addColorStop(0, "rgba(80,110,55,0.22)");
  gGrad.addColorStop(0.6, "rgba(95,75,50,0.1)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 6 * s, 22 * s, 11 * s, 33.2, 0.12, 20);
  ctx.fill();

  const pillarW = 5 * s;
  const pillarH = 22 * s;
  const leftPX = cx - 11 * s;
  const leftPY = cy + 3 * s;
  const rightPX = cx + 11 * s;
  const rightPY = cy - 1 * s;

  drawIsometricPrism(ctx, leftPX, leftPY, pillarW, pillarW, pillarH, sTop, sLeft, sRight);
  const pI = pillarW * ISO_COS;
  const pD = pillarW * ISO_SIN;
  drawStoneRows(ctx, leftPX, leftPY, pI, pD, pillarH, 6, 0.1);
  drawEdgeHighlights(ctx, leftPX, leftPY, pI, pD, pillarH, sEdge);

  drawIsometricPrism(ctx, rightPX, rightPY, pillarW, pillarW, pillarH, sTop, sLeft, sRight);
  drawStoneRows(ctx, rightPX, rightPY, pI, pD, pillarH, 6, 0.1);
  drawEdgeHighlights(ctx, rightPX, rightPY, pI, pD, pillarH, sEdge);

  drawIsometricPrism(ctx, leftPX, leftPY - pillarH, pillarW + 1.5 * s, pillarW + 1.5 * s, 2 * s, sHi, sTop, sRight);
  drawIsometricPrism(ctx, rightPX, rightPY - pillarH, pillarW + 1.5 * s, pillarW + 1.5 * s, 2 * s, sHi, sTop, sRight);

  ctx.fillStyle = mossColor;
  fillIsoEllipse(ctx, leftPX, leftPY + 2 * s, 5 * s, 2.5 * s);
  fillIsoEllipse(ctx, rightPX, rightPY + 2 * s, 5 * s, 2.5 * s);

  const archBlocks = [
    { x: -8, y: -16, w: 4, d: 3 },
    { x: -4, y: -19.5, w: 3.8, d: 2.8 },
    { x: 0, y: -21.5, w: 4.2, d: 3.2 },
    { x: 4, y: -19.4, w: 3.8, d: 2.8 },
    { x: 8, y: -15.9, w: 4, d: 3 },
  ];
  for (let i = 0; i < archBlocks.length; i++) {
    const block = archBlocks[i];
    const shade = i % 2 === 0 ? sTop : sHi;
    const shadeL = i % 2 === 0 ? sLeft : "#686258";
    const shadeR = i % 2 === 0 ? sRight : "#7a7468";
    drawIsometricPrism(
      ctx, cx + block.x * s, cy + block.y * s,
      block.w * s, block.d * s, 3.5 * s,
      shade, shadeL, shadeR,
    );
  }

  drawIsometricPrism(ctx, cx, cy - 14 * s, 15 * s, 5.5 * s, 3 * s, sHi, sLeft, sRight);

  const vines: Array<{ sx: number; sy: number; ex: number; ey: number; thick: number }> = [
    { sx: -10, sy: -18, ex: -11, ey: 1, thick: 1.2 },
    { sx: -8, sy: -16, ex: -6, ey: 3, thick: 0.9 },
    { sx: 9, sy: -15, ex: 10, ey: -2, thick: 1.1 },
    { sx: 7, sy: -17, ex: 5, ey: 1, thick: 0.85 },
    { sx: -3, sy: -20, ex: -5, ey: -10, thick: 0.7 },
    { sx: 3, sy: -20, ex: 5, ey: -10, thick: 0.7 },
  ];
  for (let v = 0; v < vines.length; v++) {
    const vine = vines[v];
    const sway = Math.sin(t * 1.5 + v * 1.2) * 1.5 * s;
    ctx.strokeStyle = v % 2 === 0 ? ivyDark : ivyMid;
    ctx.lineWidth = vine.thick * s;
    ctx.beginPath();
    ctx.moveTo(cx + vine.sx * s, cy + vine.sy * s);
    ctx.quadraticCurveTo(
      cx + (vine.sx + vine.ex) * 0.5 * s + sway,
      cy + (vine.sy + vine.ey) * 0.5 * s,
      cx + vine.ex * s + sway * 0.5,
      cy + vine.ey * s,
    );
    ctx.stroke();
  }

  for (let leaf = 0; leaf < 28; leaf++) {
    const ang = Math.PI * 0.7 + (leaf / 28) * Math.PI * 0.6;
    const radius = 8 + (leaf % 3) * 2.5;
    const lx = cx + Math.cos(ang) * radius * s + Math.sin(leaf * 1.7) * 3 * s;
    const ly = cy - 14 * s + Math.sin(ang) * radius * s * ISO_Y_RATIO;
    const sway = Math.sin(t * 2 + leaf * 0.8) * 0.8 * s;
    const colors = [ivyDark, ivyMid, ivyBright];
    ctx.fillStyle = colors[leaf % 3];
    fillIsoEllipse(ctx, lx + sway, ly, 2.2 * s, 1.2 * s, ang + 0.3);
  }

  for (let leaf = 0; leaf < 12; leaf++) {
    const pillar = leaf < 6 ? leftPX : rightPX;
    const pillarY2 = leaf < 6 ? leftPY : rightPY;
    const idx = leaf % 6;
    const ly = pillarY2 - pillarH * (0.2 + idx * 0.12);
    const side = idx % 2 === 0 ? -1 : 1;
    const sway = Math.sin(t * 1.8 + leaf) * 0.6 * s;
    ctx.fillStyle = leaf % 3 === 0 ? ivyBright : ivyMid;
    fillIsoEllipse(ctx, pillar + side * 4.5 * s + sway, ly, 2 * s, 1 * s, 0.4 * side);
  }

  for (let flower = 0; flower < 4; flower++) {
    const fx = cx + Math.sin(flower * 2.3) * 8 * s;
    const fy = cy - 16 * s + Math.cos(flower * 1.7) * 4 * s;
    ctx.fillStyle = flower % 2 === 0 ? "rgba(220,180,220,0.7)" : "rgba(255,220,140,0.65)";
    fillIsoEllipse(ctx, fx, fy, 1.2 * s, 0.8 * s);
  }

  const signX = cx + 17 * s;
  const signY = cy + 2 * s;
  ctx.fillStyle = "#5b432e";
  ctx.fillRect(signX - 0.8 * s, signY - 10 * s, 1.6 * s, 13 * s);
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 0.2 * s;
  ctx.beginPath();
  ctx.moveTo(signX, signY + 3 * s);
  ctx.lineTo(signX, signY - 10 * s);
  ctx.stroke();

  drawIsometricPrism(ctx, signX + 2 * s, signY - 5.5 * s, 6 * s, 2.5 * s, 1.8 * s, "#8a7050", "#5c4a32", "#6e5840");
  drawIsometricPrism(ctx, signX + 1.5 * s, signY - 1 * s, 5.5 * s, 2.2 * s, 1.5 * s, "#907558", "#604e36", "#72593e");

  setShadowBlur(ctx, 4 * s, "#bbdd77");
  ctx.fillStyle = "rgba(180,220,100,0.15)";
  fillIsoEllipse(ctx, cx, cy - 10 * s, 14 * s, 6 * s);
  clearShadow(ctx);
}

// ---------------------------------------------------------------------------
// Blight Basin
// ---------------------------------------------------------------------------

function drawBlightBasinLandmark(params: ChallengeLandmarkRenderParams): void {
  const { ctx, screenPos, scale: s, decorTime: t, shadowOnly = false, skipShadow = false } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const toxicCore = "#64f53c";
  const toxicMid = "#46b423";
  const toxicDark = "#236312";
  const barkDark = "#2d2018";
  const barkMid = "#3d2e1e";
  const mushroomGlow = "#78dc37";
  const boneWhite = "#cfbfab";
  const boneDark = "#b8a896";

  if (!skipShadow) {
    drawDirectionalShadow(ctx, cx, cy + 4 * s, s, 34 * s, 14 * s, 30 * s, 0.3, "15,30,10");
  }
  if (shadowOnly) return;

  const gGrad = ctx.createRadialGradient(cx, cy + 2 * s, 0, cx, cy + 2 * s, 30 * s);
  gGrad.addColorStop(0, "rgba(40,80,20,0.35)");
  gGrad.addColorStop(0.4, "rgba(30,60,15,0.2)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 2 * s, 30 * s, 15 * s, 24.5, 0.18, 20);
  ctx.fill();

  const poolLayout: Array<[number, number, number]> = [
    [-14, 0, 9],
    [-3, -4, 11],
    [9, -1, 9],
    [16, -3, 7],
    [2, 5, 7.5],
  ];
  for (let idx = 0; idx < poolLayout.length; idx++) {
    const [ox, oy, radius] = poolLayout[idx];
    const px = cx + ox * s;
    const py = cy + oy * s;

    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, radius * s);
    const pulse = 0.34 + Math.sin(t * 2 + idx * 1.3) * 0.1;
    pGrad.addColorStop(0, `rgba(100,245,60,${pulse})`);
    pGrad.addColorStop(0.35, `rgba(70,180,35,0.22)`);
    pGrad.addColorStop(0.7, `rgba(35,100,18,0.08)`);
    pGrad.addColorStop(1, "transparent");
    ctx.fillStyle = pGrad;
    drawOrganicBlobAt(ctx, px, py, radius * s, radius * s * ISO_Y_RATIO * 1.05, 40 + idx, 0.2, 14);
    ctx.fill();

    ctx.fillStyle = "rgba(20,50,10,0.45)";
    drawOrganicBlobAt(ctx, px, py, radius * 0.7 * s, radius * 0.35 * s, 55 + idx, 0.15, 12);
    ctx.fill();

    setShadowBlur(ctx, 6 * s, toxicCore);
    ctx.strokeStyle = `rgba(170,255,120,${0.2 + Math.sin(t * 1.5 + idx) * 0.08})`;
    ctx.lineWidth = 0.6 * s;
    strokeIsoEllipse(ctx, px, py, radius * 0.5 * s, radius * 0.25 * s);
    clearShadow(ctx);

    for (let bubble = 0; bubble < 3; bubble++) {
      const phase = (t * 1.6 + idx * 0.7 + bubble * 0.55) % 2.5;
      if (phase < 1.5) {
        const alpha = Math.max(0, 0.35 - phase * 0.2);
        const bSize = (0.8 + bubble * 0.3) * s;
        setShadowBlur(ctx, 3 * s, toxicCore);
        ctx.fillStyle = `rgba(120,255,90,${alpha})`;
        fillIsoEllipse(
          ctx,
          px + Math.sin(t * 2.7 + idx + bubble) * 2.5 * s,
          py - phase * 4.5 * s,
          bSize,
        );
        clearShadow(ctx);
      }
    }
  }

  const trees: Array<[number, number, number, number]> = [
    [-20, -3, 1.1, 1.2],
    [1, -5, 1.0, 2.1],
    [20, -2, 0.9, 3.4],
    [-8, -7, 0.7, 4.5],
  ];
  for (const [tx, ty, treeScale, seed] of trees) {
    const treeCx = cx + tx * s;
    const treeCy = cy + ty * s;
    const lean = Math.sin(seed) * 0.16;
    const trunkH = (16 + Math.sin(seed * 1.7) * 4) * s * treeScale;

    ctx.save();
    ctx.translate(treeCx, treeCy);
    ctx.rotate(lean);

    const trunkGrad = ctx.createLinearGradient(0, 4 * s, 0, -trunkH);
    trunkGrad.addColorStop(0, barkMid);
    trunkGrad.addColorStop(1, barkDark);
    ctx.strokeStyle = trunkGrad;
    ctx.lineWidth = 1.6 * s * treeScale;
    ctx.beginPath();
    ctx.moveTo(0, 4 * s);
    ctx.quadraticCurveTo(0.5 * s, -trunkH * 0.3, 0.8 * s, -trunkH);
    ctx.stroke();

    ctx.strokeStyle = barkDark;
    ctx.lineWidth = 0.3 * s;
    for (let mark = 0; mark < 4; mark++) {
      const my = -trunkH * (0.2 + mark * 0.18);
      ctx.beginPath();
      ctx.moveTo(-0.6 * s * treeScale, my);
      ctx.lineTo(0.6 * s * treeScale, my - 0.5 * s);
      ctx.stroke();
    }

    ctx.lineWidth = 0.8 * s * treeScale;
    for (let branch = 0; branch < 4; branch++) {
      const by = -trunkH * (0.3 + branch * 0.18);
      const bDir = branch % 2 === 0 ? -1 : 1;
      const bLen = (4 + branch * 0.8) * s * treeScale;
      ctx.strokeStyle = barkDark;
      ctx.beginPath();
      ctx.moveTo(0, by);
      ctx.quadraticCurveTo(bDir * bLen * 0.6, by - 2 * s, bDir * bLen, by - 3.5 * s);
      ctx.stroke();
    }

    ctx.restore();

    ctx.strokeStyle = "rgba(40,90,25,0.3)";
    ctx.lineWidth = 0.4 * s;
    for (let vine = 0; vine < 2; vine++) {
      const vSway = Math.sin(t * 1.2 + seed + vine) * 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(treeCx + (vine - 0.5) * 3 * s, treeCy - trunkH * 0.5);
      ctx.quadraticCurveTo(
        treeCx + vSway, treeCy - trunkH * 0.25,
        treeCx + vSway * 1.5, treeCy,
      );
      ctx.stroke();
    }
  }

  for (let m = 0; m < 10; m++) {
    const mx = cx - 18 * s + m * 4.2 * s;
    const my = cy + (m % 3) * 2.5 * s + 2 * s;
    const ms = (0.65 + (m % 4) * 0.12) * s;

    ctx.fillStyle = "#6c5a46";
    ctx.beginPath();
    ctx.moveTo(mx, my + 3.5 * ms);
    ctx.lineTo(mx + 0.6 * ms, my);
    ctx.lineTo(mx - 0.6 * ms, my);
    ctx.closePath();
    ctx.fill();

    const capGlow = 0.55 + Math.sin(t * 2.2 + m * 0.8) * 0.15;
    setShadowBlur(ctx, 4 * ms, mushroomGlow);
    ctx.fillStyle = `rgba(120,220,55,${capGlow})`;
    fillIsoEllipse(ctx, mx, my - 0.3 * ms, 3 * ms, 1.8 * ms);
    clearShadow(ctx);

    ctx.fillStyle = `rgba(200,255,100,${capGlow * 0.35})`;
    for (let dot = 0; dot < 3; dot++) {
      fillIsoEllipse(
        ctx,
        mx + (dot - 1) * 1.2 * ms,
        my - 0.5 * ms,
        0.4 * ms, 0.25 * ms,
      );
    }
  }

  const bonePiles: Array<[number, number]> = [[-22, 6], [22, 4], [-5, 9], [12, 8]];
  for (const [bx, by] of bonePiles) {
    const px = cx + bx * s;
    const py = cy + by * s;
    ctx.fillStyle = boneWhite;
    ctx.beginPath();
    ctx.moveTo(px - 2 * s, py);
    ctx.lineTo(px + 2 * s, py - 0.5 * s);
    ctx.lineTo(px + 1 * s, py + 1 * s);
    ctx.lineTo(px - 1 * s, py + 0.8 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = boneDark;
    ctx.beginPath();
    ctx.arc(px, py - 0.5 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let mist = 0; mist < 6; mist++) {
    const phase = (t * 0.15 + mist * 0.18) % 1;
    const mx2 = cx - 22 * s + mist * 9 * s + Math.sin(t * 0.6 + mist) * 5 * s;
    const my2 = cy - 3 * s + Math.cos(t * 0.4 + mist) * 2 * s;
    const alpha = 0.06 + Math.sin(t * 0.8 + mist) * 0.025;
    ctx.fillStyle = `rgba(100,220,60,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(mx2, my2 - phase * 8 * s, 10 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Triad Keep
// ---------------------------------------------------------------------------

function drawTriadKeepLandmark(params: ChallengeLandmarkRenderParams): void {
  const { ctx, screenPos, scale: s, decorTime: t, shadowOnly = false, skipShadow = false } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const wTop = "#556b56";
  const wLeft = "#29382c";
  const wRight = "#3b4c3e";
  const wHi = "#6a8268";
  const wEdge = "#7a9278";
  const wDark = "#1e2a20";
  const roofDark = "#283328";
  const roofMid = "#1a231b";
  const roofLight = "#384637";
  const torchGlow = "#ff9944";

  if (!skipShadow) {
    drawDirectionalShadow(ctx, cx, cy + 2 * s, s, 36 * s, 16 * s, 55 * s, 0.38, "10,25,15");
  }
  if (shadowOnly) return;

  const gGrad = ctx.createRadialGradient(cx, cy + 6 * s, 0, cx, cy + 6 * s, 28 * s);
  gGrad.addColorStop(0, "rgba(25,55,35,0.28)");
  gGrad.addColorStop(0.5, "rgba(30,50,30,0.12)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 6 * s, 28 * s, 14 * s, 42.1, 0.12, 20);
  ctx.fill();

  ctx.strokeStyle = "rgba(36,75,58,0.2)";
  ctx.lineWidth = 1.5 * s;
  strokeIsoEllipse(ctx, cx, cy + 7 * s, 26 * s, 10 * s);

  drawIsometricPrism(ctx, cx, cy + 4 * s, 30 * s, 24 * s, 8 * s, wTop, wLeft, wRight);
  const fI = 30 * s * ISO_COS;
  const fD = 24 * s * ISO_SIN;
  drawStoneRows(ctx, cx, cy + 4 * s, fI, fD, 8 * s, 4, 0.1);
  ctx.strokeStyle = wEdge;
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 4 * s + fD * 2);
  ctx.lineTo(cx, cy - 4 * s + fD * 2);
  ctx.stroke();

  const keepW = 13 * s;
  const keepH = 28 * s;
  const keepBase = cy - 16 * s;
  drawIsometricPrism(ctx, cx, keepBase, keepW, keepW, keepH, wTop, wLeft, wRight);
  const kI = keepW * ISO_COS;
  const kD = keepW * ISO_SIN;
  const kTop = keepBase - keepH;
  drawStoneRows(ctx, cx, keepBase, kI, kD, keepH, 7, 0.12);
  drawEdgeHighlights(ctx, cx, keepBase, kI, kD, keepH, wEdge);

  drawIsometricPrism(ctx, cx, kTop, keepW + 3 * s, keepW + 3 * s, 3 * s, wHi, wTop, wRight);
  const parI = (keepW + 3 * s) * ISO_COS;
  const parD = (keepW + 3 * s) * 0.5;
  const parTop2 = kTop - 3 * s;
  const merlH2 = 4 * s;
  const merlW2 = 2.5 * s;
  for (let i = 0; i < 3; i++) {
    const mt = (i + 0.5) / 3;
    const mmx = cx - parI * (1 - mt);
    const mmy = parTop2 + parD + parD * mt;
    drawIsometricPrism(ctx, mmx, mmy, merlW2, merlW2, merlH2, wEdge, wHi, wTop);
  }
  for (let i = 0; i < 3; i++) {
    const mt = (i + 0.5) / 3;
    const mmx = cx + parI * mt;
    const mmy = parTop2 + parD * 2 - parD * mt;
    drawIsometricPrism(ctx, mmx, mmy, merlW2, merlW2, merlH2, wEdge, wHi, wTop);
  }

  setShadowBlur(ctx, 6 * s, torchGlow);
  ctx.fillStyle = `rgba(255,150,50,${0.3 + Math.sin(t * 2.5) * 0.15})`;
  const winY1 = keepBase - keepH * 0.35;
  traceIsoFlushRect(ctx, cx - kI * 0.5, winY1 + kD * 0.5 + 3 * s, 2.2, 6, "left", s);
  ctx.fill();
  traceIsoFlushRect(ctx, cx + kI * 0.4, winY1 + kD * 0.5 + 1.5 * s, 2, 6, "right", s);
  ctx.fill();
  const winY2 = keepBase - keepH * 0.6;
  traceIsoFlushRect(ctx, cx - kI * 0.4, winY2 + kD * 0.5 + 2.5 * s, 1.8, 5, "left", s);
  ctx.fill();
  traceIsoFlushRect(ctx, cx + kI * 0.45, winY2 + kD * 0.5 + 1 * s, 1.8, 5, "right", s);
  ctx.fill();
  clearShadow(ctx);

  const turretOffsets: Array<{ x: number; y: number }> = [
    { x: -19 * s, y: -7 * s },
    { x: 19 * s, y: -3 * s },
  ];
  for (let ti = 0; ti < turretOffsets.length; ti++) {
    const turret = turretOffsets[ti];
    const ttx = cx + turret.x;
    const tty = cy + turret.y;
    const tW = 7.5 * s;
    const tH = 16 * s;

    drawIsometricPrism(ctx, ttx, tty, tW, tW, tH, wTop, wLeft, wRight);
    const tI = tW * ISO_COS;
    const tD2 = tW * ISO_SIN;
    drawStoneRows(ctx, ttx, tty, tI, tD2, tH, 4, 0.1);
    drawEdgeHighlights(ctx, ttx, tty, tI, tD2, tH, wEdge);

    drawIsometricPrism(ctx, ttx, tty - tH, tW + 1.5 * s, tW + 1.5 * s, 2 * s, wHi, wTop, wRight);

    drawIsometricPyramid(ctx, ttx, tty - tH - 2 * s, 5 * s, 11 * s, roofLight, roofDark, roofMid);

    setShadowBlur(ctx, 5 * s, torchGlow);
    ctx.fillStyle = `rgba(255,150,50,${0.35 + Math.sin(t * 2.2 + ti) * 0.15})`;
    const tFace = ti === 0 ? "left" as const : "right" as const;
    traceIsoFlushRect(ctx, ttx, tty - tH * 0.4 + tD2 * 0.5, 1.6, 4.5, tFace, s);
    ctx.fill();
    clearShadow(ctx);

    const flagX2 = ttx;
    const flagY2 = tty - tH - 2 * s;
    ctx.fillStyle = "#4a3520";
    ctx.fillRect(flagX2 - 0.6 * s, flagY2 - 14 * s, 1.2 * s, 14 * s);
    const wave2 = Math.sin(t * 3 + ti * 2) * 2 * s;
    ctx.fillStyle = "#3f8b43";
    ctx.beginPath();
    ctx.moveTo(flagX2 + 0.8 * s, flagY2 - 13 * s);
    ctx.quadraticCurveTo(flagX2 + 6 * s, flagY2 - 11 * s + wave2, flagX2 + 8 * s, flagY2 - 8 * s + wave2);
    ctx.lineTo(flagX2 + 0.8 * s, flagY2 - 5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#95d46c";
    fillIsoEllipse(ctx, flagX2 + 4 * s, flagY2 - 9.5 * s + wave2 * 0.35, 1 * s, 0.7 * s);
  }

  const gateY = cy + 4 * s + fD * 0.35;
  ctx.fillStyle = wDark;
  ctx.beginPath();
  ctx.moveTo(cx - 5 * s, gateY + 4 * s);
  ctx.lineTo(cx - 5 * s, gateY - 8 * s);
  ctx.quadraticCurveTo(cx, gateY - 13 * s, cx + 5 * s, gateY - 8 * s);
  ctx.lineTo(cx + 5 * s, gateY + 4 * s);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#2a322d";
  ctx.lineWidth = 0.7 * s;
  for (let bar = 0; bar < 5; bar++) {
    const barX = cx - 3.5 * s + bar * 1.8 * s;
    ctx.beginPath();
    ctx.moveTo(barX, gateY + 4 * s);
    ctx.lineTo(barX, gateY - 7 * s);
    ctx.stroke();
  }
  for (let hBar = 0; hBar < 2; hBar++) {
    const hy = gateY - 2 * s - hBar * 4 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 4.5 * s, hy);
    ctx.lineTo(cx + 4.5 * s, hy);
    ctx.stroke();
  }

  setShadowBlur(ctx, 8 * s, torchGlow);
  const torchPulse = 0.55 + Math.sin(t * 5.5) * 0.2;
  for (const side of [-1, 1]) {
    const tox = cx + side * 7 * s;
    const toy = gateY - 5 * s;
    ctx.fillStyle = "#5b4330";
    ctx.fillRect(tox - 0.5 * s, toy - 3 * s, 1 * s, 5 * s);
    ctx.fillStyle = `rgba(255,140,30,${torchPulse})`;
    ctx.beginPath();
    ctx.moveTo(tox - 1 * s, toy - 3 * s);
    ctx.quadraticCurveTo(tox + Math.sin(t * 8 + side) * 0.8 * s, toy - 6 * s, tox, toy - 8 * s);
    ctx.quadraticCurveTo(tox - Math.sin(t * 7 + side) * 0.8 * s, toy - 5.5 * s, tox + 1 * s, toy - 3 * s);
    ctx.closePath();
    ctx.fill();
  }
  clearShadow(ctx);

  drawIsometricPrism(ctx, cx, gateY + 3 * s, 8.5 * s, 5.5 * s, 2.5 * s, "#5a4128", "#3a2817", "#49311d");

  const rubble: Array<{ x: number; y: number; sz: number }> = [
    { x: -24, y: 10 }, { x: -16, y: 12 }, { x: 18, y: 11 }, { x: 24, y: 9 },
  ].map(r => ({ ...r, sz: 2 + Math.sin(r.x) * 0.5 }));
  for (let ri = 0; ri < rubble.length; ri++) {
    const rb = rubble[ri];
    const rx = cx + rb.x * s;
    const ry = cy + rb.y * s;
    const rSz = rb.sz * s;
    ctx.fillStyle = ri % 2 === 0 ? wTop : wLeft;
    ctx.beginPath();
    ctx.moveTo(rx, ry - rSz * 0.7);
    ctx.lineTo(rx + rSz, ry - rSz * 0.2);
    ctx.lineTo(rx + rSz * 0.3, ry + rSz * 0.3);
    ctx.lineTo(rx - rSz * 0.6, ry);
    ctx.closePath();
    ctx.fill();
  }

  drawSmoke(ctx, cx, kTop - 5 * s, s, t, 3, 5, 25, "60,55,50", 0.1);
}

// ---------------------------------------------------------------------------
// Sunscorch Labyrinth
// ---------------------------------------------------------------------------

function drawSunscorchLabyrinthLandmark(params: ChallengeLandmarkRenderParams): void {
  const { ctx, screenPos, scale: s, decorTime: t, shadowOnly = false, skipShadow = false } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const sandTop = "#c4a86a";
  const sandLeft = "#8a6e3e";
  const sandRight = "#a8884e";
  const sandHi = "#d4bc7e";
  const sandEdge = "#dcc690";
  const sandDark = "#6a5430";
  const goldGlow = "#ffcc44";

  if (!skipShadow) {
    drawDirectionalShadow(ctx, cx, cy + 4 * s, s, 36 * s, 14 * s, 28 * s, 0.28);
  }
  if (shadowOnly) return;

  const gGrad = ctx.createRadialGradient(cx, cy + 3 * s, 0, cx, cy + 3 * s, 34 * s);
  gGrad.addColorStop(0, "rgba(200,170,100,0.22)");
  gGrad.addColorStop(0.5, "rgba(185,148,88,0.1)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 3 * s, 34 * s, 17 * s, 17.3, 0.1, 22);
  ctx.fill();

  const mazeWalls: Array<{ x: number; y: number; w: number; d: number; h: number }> = [
    { x: -18, y: -10, w: 12, d: 3, h: 6 },
    { x: -18, y: -10, w: 3, d: 14, h: 5 },
    { x: -4, y: -12, w: 14, d: 3, h: 6.5 },
    { x: 10, y: -9, w: 3, d: 13, h: 5.5 },
    { x: -12, y: 2, w: 16, d: 3, h: 5 },
    { x: 4, y: 5, w: 3, d: 10, h: 5.5 },
    { x: -6, y: 9, w: 18, d: 3, h: 5 },
    { x: 15, y: 4, w: 3, d: 10, h: 6 },
  ];

  for (let i = 0; i < mazeWalls.length; i++) {
    const wall = mazeWalls[i];
    const wx = cx + wall.x * s;
    const wy = cy + wall.y * s;

    const topShade = i % 3 === 0 ? sandTop : i % 3 === 1 ? sandHi : sandTop;
    const leftShade = i % 2 === 0 ? sandLeft : sandDark;
    const rightShade = i % 2 === 0 ? sandRight : sandLeft;

    drawIsometricPrism(ctx, wx, wy, wall.w * s, wall.d * s, wall.h * s, topShade, leftShade, rightShade);

    const wI = wall.w * s * ISO_COS;
    const wD = wall.d * s * ISO_SIN;

    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 0.35 * s;
    const rows = Math.max(2, Math.floor(wall.h / 1.5));
    for (let r = 1; r < rows; r++) {
      const ry = wy - wall.h * s * (r / rows);
      ctx.beginPath();
      ctx.moveTo(wx - wI, ry + wD);
      ctx.lineTo(wx, ry + wD * 2);
      ctx.lineTo(wx + wI, ry + wD);
      ctx.stroke();
    }

    if (wall.w > 5) {
      const brickCount = Math.floor(wall.w / 2.5);
      for (let brick = 1; brick < brickCount; brick++) {
        const bFrac = brick / brickCount;
        const bx1 = wx + wI * (2 * bFrac - 1);
        ctx.beginPath();
        ctx.moveTo(bx1, wy - wall.h * s);
        ctx.lineTo(bx1, wy + wD * 2 * bFrac);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = sandEdge;
    ctx.lineWidth = 0.4 * s;
    ctx.beginPath();
    ctx.moveTo(wx, wy + wD * 2);
    ctx.lineTo(wx, wy - wall.h * s + wD * 2);
    ctx.stroke();

    if (i % 3 === 0) {
      ctx.fillStyle = "rgba(210,180,120,0.15)";
      fillIsoEllipse(ctx, wx, wy + wD * 2 + 1 * s, 5 * s, 2 * s);
    }

    if (i % 4 === 0) {
      ctx.fillStyle = "rgba(180,150,80,0.3)";
      ctx.beginPath();
      const driftX = wx + wI * 0.5;
      const driftY = wy + wD;
      ctx.moveTo(driftX, driftY);
      ctx.quadraticCurveTo(driftX + 3 * s, driftY + 1 * s, driftX + 5 * s, driftY + 0.5 * s);
      ctx.lineTo(driftX + 4 * s, driftY + 2 * s);
      ctx.quadraticCurveTo(driftX + 2 * s, driftY + 2.5 * s, driftX, driftY + 1 * s);
      ctx.closePath();
      ctx.fill();
    }
  }

  const skullX = cx - 20 * s;
  const skullY = cy + 12 * s;
  ctx.fillStyle = "#5b4330";
  ctx.fillRect(skullX - 0.5 * s, skullY - 8 * s, 1 * s, 10 * s);
  ctx.fillStyle = "#cfbfab";
  fillIsoEllipse(ctx, skullX, skullY - 8.5 * s, 2.4 * s, 2.8 * s);
  ctx.fillStyle = "#b8a896";
  ctx.beginPath();
  ctx.ellipse(skullX, skullY - 7.3 * s, 2.1 * s, 1.2 * s, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#121212";
  fillIsoEllipse(ctx, skullX - 0.75 * s, skullY - 8.8 * s, 0.55 * s, 0.65 * s);
  fillIsoEllipse(ctx, skullX + 0.75 * s, skullY - 8.8 * s, 0.55 * s, 0.65 * s);

  const bones: Array<[number, number, number]> = [
    [-16, 13, 0.3], [14, 12, -0.2], [-8, 14, 0.5], [20, 10, -0.4],
  ];
  for (const [bx, by, rot] of bones) {
    ctx.save();
    ctx.translate(cx + bx * s, cy + by * s);
    ctx.rotate(rot);
    ctx.fillStyle = "#cec0a8";
    ctx.fillRect(-2 * s, -0.3 * s, 4 * s, 0.6 * s);
    ctx.fillStyle = "#d8ccb4";
    fillIsoEllipse(ctx, -2.2 * s, 0, 0.5 * s, 0.4 * s);
    fillIsoEllipse(ctx, 2.2 * s, 0, 0.5 * s, 0.4 * s);
    ctx.restore();
  }

  setShadowBlur(ctx, 8 * s, goldGlow);
  const shimmer = 0.04 + Math.sin(t * 1.8) * 0.02;
  ctx.fillStyle = `rgba(245,200,100,${shimmer})`;
  fillIsoEllipse(ctx, cx, cy - 2 * s + Math.sin(t * 0.5) * 1.5 * s, 28 * s, 8 * s);
  clearShadow(ctx);

  for (let p = 0; p < 5; p++) {
    const phase = (t * 0.2 + p * 0.22) % 1;
    const px = cx + Math.sin(t + p * 2.1) * 20 * s;
    const py = cy - 5 * s - phase * 15 * s;
    const alpha = (1 - phase) * 0.06;
    ctx.fillStyle = `rgba(200,170,100,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(px, py, (3 + phase * 4) * s, (1.5 + phase * 1.5) * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Frontier Outpost
// ---------------------------------------------------------------------------

function drawFrontierOutpostLandmark(params: ChallengeLandmarkRenderParams): void {
  const { ctx, screenPos, scale: s, decorTime: t, shadowOnly = false, skipShadow = false } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const woodDark = "#3b2918";
  const woodMid = "#5a3e24";
  const woodLight = "#6e5035";
  const woodHi = "#84623e";
  const stoneDark = "#363230";
  const stoneMid = "#4a4642";
  const stoneLight = "#5e5a55";
  const stoneHi = "#706c66";
  const roofColor = "#2e1d13";
  const snowColor = "rgba(235,242,250,0.55)";
  const fireGlow = "#ff8c24";

  if (!skipShadow) {
    drawDirectionalShadow(ctx, cx, cy + 4 * s, s, 34 * s, 14 * s, 50 * s, 0.32);
  }
  if (shadowOnly) return;

  const gGrad = ctx.createRadialGradient(cx, cy + 6 * s, 0, cx, cy + 6 * s, 24 * s);
  gGrad.addColorStop(0, "rgba(220,230,240,0.15)");
  gGrad.addColorStop(0.6, "rgba(200,210,220,0.06)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 6 * s, 24 * s, 12 * s, 55.3, 0.1, 20);
  ctx.fill();

  const palisadePosts = 16;
  const ringX = 22 * s;
  const ringY = ringX * ISO_Y_RATIO * 0.85;

  ctx.strokeStyle = woodDark;
  ctx.lineWidth = 0.8 * s;
  for (const beamFactor of [0.35, 0.65]) {
    ctx.beginPath();
    for (let post = 0; post <= palisadePosts; post++) {
      const angle = (post / palisadePosts) * Math.PI * 2;
      const pos = getIsoOrbitPoint(cx, cy + 1.5 * s, angle, ringX, ringY);
      const postHeight = (10 + Math.sin(post * 1.3) * 2.5) * s;
      const beamY = pos.y - postHeight * beamFactor;
      if (post === 0) ctx.moveTo(pos.x, beamY);
      else ctx.lineTo(pos.x, beamY);
    }
    ctx.stroke();
  }

  for (let post = 0; post < palisadePosts; post++) {
    const angle = (post / palisadePosts) * Math.PI * 2;
    const pos = getIsoOrbitPoint(cx, cy + 1.5 * s, angle, ringX, ringY);
    const postHeight = (10 + Math.sin(post * 1.3) * 2.5) * s;
    const postW = 2.2 * s;

    const woodShade = post % 3 === 0 ? woodDark : post % 3 === 1 ? woodMid : woodLight;

    const pGrad = ctx.createLinearGradient(pos.x - postW * 0.5, 0, pos.x + postW * 0.5, 0);
    pGrad.addColorStop(0, woodShade);
    pGrad.addColorStop(0.4, woodHi);
    pGrad.addColorStop(1, woodDark);
    ctx.fillStyle = pGrad;
    ctx.fillRect(pos.x - postW * 0.5, pos.y - postHeight, postW, postHeight);

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.2 * s;
    for (let grain = 0; grain < 3; grain++) {
      const gx = pos.x - postW * 0.3 + grain * postW * 0.3;
      ctx.beginPath();
      ctx.moveTo(gx, pos.y);
      ctx.lineTo(gx + 0.2 * s, pos.y - postHeight);
      ctx.stroke();
    }

    ctx.fillStyle = woodHi;
    ctx.beginPath();
    ctx.moveTo(pos.x - 1.5 * s, pos.y - postHeight);
    ctx.lineTo(pos.x, pos.y - postHeight - 3 * s);
    ctx.lineTo(pos.x + 1.5 * s, pos.y - postHeight);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = snowColor;
    ctx.beginPath();
    ctx.moveTo(pos.x - 1.8 * s, pos.y - postHeight - 0.5 * s);
    ctx.quadraticCurveTo(pos.x, pos.y - postHeight - 3.5 * s, pos.x + 1.8 * s, pos.y - postHeight - 0.5 * s);
    ctx.lineTo(pos.x + 1.2 * s, pos.y - postHeight);
    ctx.quadraticCurveTo(pos.x, pos.y - postHeight - 2 * s, pos.x - 1.2 * s, pos.y - postHeight);
    ctx.closePath();
    ctx.fill();
  }

  const towerW = 6 * s;
  const towerH = 26 * s;
  const towerBase = cy - 18 * s;
  drawIsometricPrism(ctx, cx, towerBase, towerW, towerW, towerH, stoneLight, stoneDark, stoneMid);
  const ttI = towerW * ISO_COS;
  const ttD = towerW * ISO_SIN;
  const ttTop = towerBase - towerH;
  drawStoneRows(ctx, cx, towerBase, ttI, ttD, towerH, 6, 0.12);
  drawEdgeHighlights(ctx, cx, towerBase, ttI, ttD, towerH, stoneHi);

  drawIsometricPrism(ctx, cx, ttTop, 13 * s, 11 * s, 3 * s, woodLight, woodDark, woodMid);
  drawIsometricPyramid(ctx, cx, ttTop - 3 * s, 8.5 * s, 12 * s, roofColor, "#100a06", "#1c120c");

  ctx.fillStyle = snowColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7 * s, ttTop - 3 * s);
  ctx.quadraticCurveTo(cx, ttTop - 15 * s, cx + 7 * s, ttTop - 3 * s);
  ctx.lineTo(cx + 5 * s, ttTop - 4 * s);
  ctx.quadraticCurveTo(cx, ttTop - 13 * s, cx - 5 * s, ttTop - 4 * s);
  ctx.closePath();
  ctx.fill();

  setShadowBlur(ctx, 5 * s, fireGlow);
  ctx.fillStyle = `rgba(255,150,50,${0.35 + Math.sin(t * 2.5) * 0.15})`;
  traceIsoFlushRect(ctx, cx - ttI * 0.5, towerBase - towerH * 0.35 + ttD * 0.5, 1.8, 5, "left", s);
  ctx.fill();
  traceIsoFlushRect(ctx, cx + ttI * 0.4, towerBase - towerH * 0.35 + ttD * 0.5, 1.6, 5, "right", s);
  ctx.fill();
  clearShadow(ctx);

  const fireX = cx + 8 * s;
  const fireY = cy + 2 * s;
  for (let stone = 0; stone < 7; stone++) {
    const sAngle = (stone / 7) * Math.PI * 2;
    const sPos = getIsoOrbitPoint(fireX, fireY + 0.5 * s, sAngle, 2.8 * s, 1.6 * s);
    ctx.fillStyle = stone % 2 === 0 ? "#4f4748" : "#5a5254";
    fillIsoEllipse(ctx, sPos.x, sPos.y, 1 * s, 0.7 * s);
  }

  const firePulse = 0.55 + Math.sin(t * 5) * 0.2;
  setShadowBlur(ctx, 14 * s, fireGlow);
  ctx.fillStyle = `rgba(255,140,30,${0.2 + firePulse * 0.15})`;
  fillIsoEllipse(ctx, fireX, fireY - 0.5 * s, 5.5 * s, 3 * s);
  clearShadow(ctx);

  ctx.fillStyle = `rgba(255,130,20,${0.6 + firePulse * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(fireX - 1.5 * s, fireY);
  ctx.quadraticCurveTo(fireX + Math.sin(t * 7) * 1.5 * s, fireY - 5 * s, fireX, fireY - 8 * s);
  ctx.quadraticCurveTo(fireX - Math.sin(t * 8) * 1.2 * s, fireY - 4.5 * s, fireX + 1.5 * s, fireY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255,200,60,${0.4 + firePulse * 0.15})`;
  ctx.beginPath();
  ctx.moveTo(fireX - 0.8 * s, fireY - 1 * s);
  ctx.quadraticCurveTo(fireX + Math.sin(t * 9) * 0.8 * s, fireY - 3.5 * s, fireX, fireY - 5.5 * s);
  ctx.quadraticCurveTo(fireX - Math.sin(t * 10) * 0.6 * s, fireY - 3 * s, fireX + 0.8 * s, fireY - 1 * s);
  ctx.closePath();
  ctx.fill();

  for (let spark = 0; spark < 6; spark++) {
    const phase = (t * 3 + spark * 0.5) % 1;
    const sparkX = fireX + Math.sin(spark * 2 + t * 4) * 3 * s;
    const sparkY = fireY - 2 * s - phase * 12 * s;
    const sparkAlpha = (1 - phase) * 0.8;
    ctx.fillStyle = `rgba(255,${150 + spark * 15},0,${sparkAlpha})`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, (1 - phase) * 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSmoke(ctx, cx, ttTop - 12 * s, s, t, 3, 4, 20, "80,70,65", 0.08);

  const lanternX = cx - 12 * s;
  const lanternY = cy - 4 * s;
  ctx.fillStyle = woodDark;
  ctx.fillRect(lanternX - 0.3 * s, lanternY - 6 * s, 0.6 * s, 4 * s);
  setShadowBlur(ctx, 4 * s, "#ffaa44");
  ctx.fillStyle = `rgba(255,170,50,${0.4 + Math.sin(t * 4) * 0.15})`;
  fillIsoEllipse(ctx, lanternX, lanternY - 2.5 * s, 1.2 * s, 1.5 * s);
  clearShadow(ctx);
}

// ---------------------------------------------------------------------------
// Ashen Spiral
// ---------------------------------------------------------------------------

function drawAshenSpiralLandmark(params: ChallengeLandmarkRenderParams): void {
  const { ctx, screenPos, scale: s, decorTime: t, shadowOnly = false, skipShadow = false } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const ashDark = "#1a1412";
  const ashMid = "#2d2420";
  const ashLight = "#3e3430";
  const ashHi = "#524840";
  const lavaCore = "#ff5a1f";
  const lavaGlow = "#ff9530";
  const lavaYellow = "#ffcc44";

  if (!skipShadow) {
    drawDirectionalShadow(ctx, cx, cy + 4 * s, s, 34 * s, 14 * s, 35 * s, 0.35, "20,10,5");
  }
  if (shadowOnly) return;

  const gGrad = ctx.createRadialGradient(cx, cy + 2 * s, 0, cx, cy + 2 * s, 30 * s);
  gGrad.addColorStop(0, "rgba(255,90,30,0.18)");
  gGrad.addColorStop(0.3, "rgba(180,60,15,0.1)");
  gGrad.addColorStop(0.6, "rgba(40,20,10,0.15)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 2 * s, 30 * s, 15 * s, 62.1, 0.15, 20);
  ctx.fill();

  ctx.fillStyle = "rgba(30,20,15,0.4)";
  drawOrganicBlobAt(ctx, cx, cy + 3 * s, 26 * s, 13 * s, 71.3, 0.12, 18);
  ctx.fill();

  const spiralPulse = 0.5 + Math.sin(t * 1.2) * 0.15;
  setShadowBlur(ctx, 6 * s, lavaCore);
  ctx.lineWidth = 2.5 * s;
  for (let pass = 0; pass < 2; pass++) {
    const isGlow = pass === 0;
    if (isGlow) {
      ctx.strokeStyle = `rgba(255,90,24,${0.12 * spiralPulse})`;
      ctx.lineWidth = 4 * s;
    } else {
      ctx.strokeStyle = `rgba(255,120,40,${0.25 * spiralPulse})`;
      ctx.lineWidth = 1.8 * s;
    }
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
      const radius = 3 * s + angle * 2.8 * s;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius * ISO_Y_RATIO;
      if (angle === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  clearShadow(ctx);

  ctx.strokeStyle = `rgba(40,20,10,0.4)`;
  ctx.lineWidth = 3.5 * s;
  ctx.beginPath();
  for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
    const radius = 3 * s + angle * 2.8 * s;
    const px = cx + Math.cos(angle) * radius + 0.8 * s;
    const py = cy + Math.sin(angle) * radius * ISO_Y_RATIO + 0.4 * s;
    if (angle === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  const ruins: Array<{ x: number; y: number; w: number; d: number; h: number }> = [
    { x: 0, y: -3, w: 6, d: 5, h: 12 },
    { x: -5, y: 0, w: 4, d: 3.5, h: 8 },
    { x: 5, y: -1, w: 4, d: 3.5, h: 9 },
  ];
  for (let ri = 0; ri < ruins.length; ri++) {
    const ruin = ruins[ri];
    const rx = cx + ruin.x * s;
    const ry = cy + ruin.y * s;
    drawIsometricPrism(ctx, rx, ry, ruin.w * s, ruin.d * s, ruin.h * s, ashLight, ashDark, ashMid);
    const rI = ruin.w * s * ISO_COS;
    const rD = ruin.d * s * ISO_SIN;
    drawStoneRows(ctx, rx, ry, rI, rD, ruin.h * s, Math.max(2, Math.floor(ruin.h / 2.5)), 0.15);
    ctx.strokeStyle = ashHi;
    ctx.lineWidth = 0.4 * s;
    ctx.beginPath();
    ctx.moveTo(rx, ry + rD * 2);
    ctx.lineTo(rx, ry - ruin.h * s + rD * 2);
    ctx.stroke();

    if (ri === 0) {
      setShadowBlur(ctx, 8 * s, lavaCore);
      ctx.fillStyle = `rgba(255,90,30,${0.3 + Math.sin(t * 2.5) * 0.15})`;
      traceIsoFlushRect(ctx, rx - rI * 0.5, ry - ruin.h * s * 0.35 + rD * 0.5, 1.8, 4.5, "left", s);
      ctx.fill();
      traceIsoFlushRect(ctx, rx + rI * 0.4, ry - ruin.h * s * 0.35 + rD * 0.5, 1.6, 4.5, "right", s);
      ctx.fill();
      clearShadow(ctx);
    }
  }

  const mainTop = cy - 3 * s - 12 * s;
  ctx.fillStyle = ashLight;
  ctx.beginPath();
  ctx.moveTo(cx - 2 * s, mainTop);
  ctx.lineTo(cx - 3 * s, mainTop - 2 * s);
  ctx.lineTo(cx - 1 * s, mainTop - 1 * s);
  ctx.lineTo(cx + 1 * s, mainTop - 3 * s);
  ctx.lineTo(cx + 3 * s, mainTop - 1 * s);
  ctx.lineTo(cx + 2 * s, mainTop);
  ctx.closePath();
  ctx.fill();

  for (let vent = 0; vent < 6; vent++) {
    const ventAngle = vent * 1.1 + 0.5;
    const ventRadius = 5 * s + ventAngle * 2.5 * s;
    const vx = cx + Math.cos(ventAngle) * ventRadius;
    const vy = cy + Math.sin(ventAngle) * ventRadius * ISO_Y_RATIO;

    ctx.fillStyle = ashDark;
    fillIsoEllipse(ctx, vx, vy, 5.5 * s, 2.8 * s);
    ctx.fillStyle = "#0e0806";
    fillIsoEllipse(ctx, vx, vy, 3.8 * s, 1.9 * s);

    const rimPulse = 0.3 + Math.sin(t * 3 + vent * 1.2) * 0.15;
    setShadowBlur(ctx, 5 * s, lavaCore);
    ctx.strokeStyle = `rgba(255,90,24,${rimPulse})`;
    ctx.lineWidth = 1 * s;
    strokeIsoEllipse(ctx, vx, vy, 4.2 * s, 2.1 * s);
    clearShadow(ctx);

    const coreGrad = ctx.createRadialGradient(vx, vy, 0, vx, vy, 3 * s);
    coreGrad.addColorStop(0, `rgba(255,200,80,${rimPulse * 0.4})`);
    coreGrad.addColorStop(0.5, `rgba(255,90,24,${rimPulse * 0.2})`);
    coreGrad.addColorStop(1, "transparent");
    ctx.fillStyle = coreGrad;
    fillIsoEllipse(ctx, vx, vy, 3 * s, 1.5 * s);

    const burstPhase = (t * 1.6 + vent * 1.3) % 5;
    if (burstPhase < 2) {
      const burstHeight = burstPhase * 12 * s;
      const burstAlpha = 0.5 * (1 - burstPhase / 2);

      setShadowBlur(ctx, 4 * s, lavaGlow);
      ctx.fillStyle = `rgba(255,185,60,${burstAlpha})`;
      ctx.beginPath();
      ctx.moveTo(vx - 1.5 * s, vy);
      ctx.quadraticCurveTo(vx + Math.sin(t * 6 + vent) * 2 * s, vy - burstHeight * 0.5, vx, vy - burstHeight);
      ctx.quadraticCurveTo(vx - Math.sin(t * 7 + vent) * 2 * s, vy - burstHeight * 0.45, vx + 1.5 * s, vy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(255,220,100,${burstAlpha * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(vx - 0.8 * s, vy);
      ctx.quadraticCurveTo(vx, vy - burstHeight * 0.4, vx, vy - burstHeight * 0.7);
      ctx.quadraticCurveTo(vx, vy - burstHeight * 0.3, vx + 0.8 * s, vy);
      ctx.closePath();
      ctx.fill();
      clearShadow(ctx);
    }
  }

  const brokenPillars: Array<[number, number, number]> = [
    [-16, 5, 6], [18, 3, 5], [-10, -8, 4], [14, -6, 5.5],
  ];
  for (const [px, py, ph] of brokenPillars) {
    const pillX = cx + px * s;
    const pillY = cy + py * s;
    drawIsometricPrism(ctx, pillX, pillY, 2.5 * s, 2.5 * s, ph * s, ashLight, ashDark, ashMid);
    ctx.fillStyle = ashHi;
    ctx.beginPath();
    const pTop = pillY - ph * s;
    ctx.moveTo(pillX - 1.5 * s, pTop);
    ctx.lineTo(pillX - 0.5 * s, pTop - 1 * s);
    ctx.lineTo(pillX + 1 * s, pTop - 0.5 * s);
    ctx.lineTo(pillX + 1.5 * s, pTop + 0.3 * s);
    ctx.closePath();
    ctx.fill();
  }

  for (let ember = 0; ember < 12; ember++) {
    const phase = (t * 0.4 + ember * 0.09) % 1;
    const ex = cx + Math.sin(t * 1.5 + ember * 1.8) * 20 * s;
    const ey = cy - 5 * s - phase * 30 * s;
    const alpha = Math.sin(phase * Math.PI) * 0.7;
    const eSize = (1.5 - phase * 1) * s;
    ctx.fillStyle = `rgba(255,${100 + ember * 10},0,${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(ex, ey, eSize + 0.8 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,${140 + ember * 8},0,${alpha})`;
    ctx.beginPath();
    ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
    ctx.fill();
    if (phase < 0.25) {
      ctx.fillStyle = `rgba(255,255,180,${(1 - phase / 0.25) * 0.5})`;
      ctx.beginPath();
      ctx.arc(ex, ey, eSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawSmoke(ctx, cx, mainTop - 5 * s, s, t, 4, 8, 25, "50,30,20", 0.1);
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

export function renderChallengeLandmark(
  params: ChallengeLandmarkRenderParams,
): boolean {
  switch (params.type) {
    case "cannon_crest":
      drawCannonCrestLandmark(params);
      return true;
    case "ivy_crossroads":
      drawIvyCrossroadsLandmark(params);
      return true;
    case "blight_basin":
      drawBlightBasinLandmark(params);
      return true;
    case "triad_keep":
      drawTriadKeepLandmark(params);
      return true;
    case "sunscorch_labyrinth":
      drawSunscorchLabyrinthLandmark(params);
      return true;
    case "frontier_outpost":
      drawFrontierOutpostLandmark(params);
      return true;
    case "ashen_spiral":
      drawAshenSpiralLandmark(params);
      return true;
    default:
      return false;
  }
}
