import { ISO_COS, ISO_SIN, ISO_Y_RATIO } from "../../constants";
import {
  drawIsometricPrism,
  drawIsometricPyramid,
  drawOrganicBlobAt,
} from "../helpers";
import { setShadowBlur, clearShadow } from "../performance";
import {
  drawDirectionalShadow,
  MAX_SHADOW_RX,
  MAX_SHADOW_RY,
} from "./shadowHelpers";
import type { MapTheme } from "../../types";

export interface LandmarkParams {
  ctx: CanvasRenderingContext2D;
  screenX: number;
  screenY: number;
  s: number;
  time: number;
  zoom?: number;
  seedX: number;
  seedY: number;
  variant: number;
  skipShadow: boolean;
  shadowOnly: boolean;
  mapTheme?: MapTheme;
}

export interface FortressPalette {
  stoneTop: string;
  stoneLit: string;
  stoneMid: string;
  stoneDark: string;
  stoneDeep: string;
  mossGreen: string;
  lichYellow: string;
  bannerPrimary: string;
  bannerSecondary: string;
  shadowRgb: string;
}

const FORTRESS_PALETTES: Record<MapTheme, FortressPalette> = {
  grassland: {
    stoneTop: "#d4c8a8",
    stoneLit: "#baa880",
    stoneMid: "#9a8a6a",
    stoneDark: "#786850",
    stoneDeep: "#584838",
    mossGreen: "#4a7a30",
    lichYellow: "#90a050",
    bannerPrimary: "#2a6030",
    bannerSecondary: "#3a8040",
    shadowRgb: "35,30,18",
  },
  desert: {
    stoneTop: "#e0d0a8",
    stoneLit: "#c8b080",
    stoneMid: "#a89060",
    stoneDark: "#887040",
    stoneDeep: "#685028",
    mossGreen: "#8a8a40",
    lichYellow: "#c0b060",
    bannerPrimary: "#8a5020",
    bannerSecondary: "#a06830",
    shadowRgb: "40,30,10",
  },
  winter: {
    stoneTop: "#b8c8d8",
    stoneLit: "#8a9cb0",
    stoneMid: "#6a8098",
    stoneDark: "#4a6078",
    stoneDeep: "#2a3a50",
    mossGreen: "#506878",
    lichYellow: "#8898a8",
    bannerPrimary: "#1B3A5A",
    bannerSecondary: "#2A5080",
    shadowRgb: "15,20,30",
  },
  volcanic: {
    stoneTop: "#908080",
    stoneLit: "#706058",
    stoneMid: "#584848",
    stoneDark: "#403030",
    stoneDeep: "#281818",
    mossGreen: "#584830",
    lichYellow: "#706040",
    bannerPrimary: "#8a2000",
    bannerSecondary: "#b03010",
    shadowRgb: "30,10,5",
  },
  swamp: {
    stoneTop: "#a0a888",
    stoneLit: "#808868",
    stoneMid: "#687050",
    stoneDark: "#505838",
    stoneDeep: "#384020",
    mossGreen: "#3a6830",
    lichYellow: "#708040",
    bannerPrimary: "#2a4028",
    bannerSecondary: "#3a5838",
    shadowRgb: "15,25,10",
  },
};

function getFortressPalette(theme?: MapTheme): FortressPalette {
  return FORTRESS_PALETTES[theme ?? "winter"];
}

// =========================================================================
// SHARED DRAWING HELPERS
// =========================================================================

function prismFaceOverlay(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  width: number,
  height: number,
  face: "left" | "right",
  gradient: CanvasGradient,
): void {
  const iW = width * ISO_COS;
  const iD = width * ISO_SIN;
  const topY = baseY - height;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  if (face === "left") {
    ctx.moveTo(cx - iW, baseY + iD);
    ctx.lineTo(cx, baseY + iD * 2);
    ctx.lineTo(cx, topY + iD * 2);
    ctx.lineTo(cx - iW, topY + iD);
  } else {
    ctx.moveTo(cx + iW, baseY + iD);
    ctx.lineTo(cx, baseY + iD * 2);
    ctx.lineTo(cx, topY + iD * 2);
    ctx.lineTo(cx + iW, topY + iD);
  }
  ctx.closePath();
  ctx.fill();
}

function drawIsoSkull3D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  facing: number,
  boneWhite: string,
  boneMid: string,
  boneDark: string,
  eyeColor?: string,
  eyeAlpha?: number,
): void {
  const r = radius;
  ctx.fillStyle = boneDark;
  ctx.beginPath();
  ctx.ellipse(
    x + facing * r * 0.05,
    y + r * 0.05,
    r * 1.06,
    r * 1.15,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  const cranGrad = ctx.createRadialGradient(
    x - facing * r * 0.25,
    y - r * 0.25,
    0,
    x,
    y,
    r * 1.05,
  );
  cranGrad.addColorStop(0, boneWhite);
  cranGrad.addColorStop(0.55, boneMid);
  cranGrad.addColorStop(1, boneDark);
  ctx.fillStyle = cranGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.02, r * 0.82, r * 0.3, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  const eSpacing = r * 0.36;
  const eY = y + r * 0.04;
  const eRx = r * 0.2;
  const eRy = r * 0.26;
  ctx.fillStyle = "#080808";
  ctx.beginPath();
  ctx.ellipse(x - eSpacing, eY, eRx, eRy, -0.08, 0, Math.PI * 2);
  ctx.ellipse(x + eSpacing, eY, eRx, eRy, 0.08, 0, Math.PI * 2);
  ctx.fill();
  if (eyeColor && eyeAlpha && eyeAlpha > 0) {
    const savedAlpha = ctx.globalAlpha;
    ctx.fillStyle = eyeColor;
    ctx.globalAlpha = eyeAlpha;
    ctx.beginPath();
    ctx.arc(x - eSpacing, eY, eRx * 0.65, 0, Math.PI * 2);
    ctx.arc(x + eSpacing, eY, eRx * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = savedAlpha;
  }
  ctx.fillStyle = "#1a1410";
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.22);
  ctx.lineTo(x - r * 0.1, y + r * 0.46);
  ctx.lineTo(x + r * 0.1, y + r * 0.46);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = boneDark;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.6, r * 0.6, r * 0.22, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = boneMid;
  const tW = r * 0.44;
  const tY = y + r * 0.52;
  ctx.fillRect(x - tW, tY, tW * 2, r * 0.18);
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = r * 0.035;
  for (let t = -2; t <= 2; t++) {
    ctx.beginPath();
    ctx.moveTo(x + t * tW * 0.35, tY);
    ctx.lineTo(x + t * tW * 0.35, tY + r * 0.18);
    ctx.stroke();
  }
}

function drawMultiFlame(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  width: number,
  height: number,
  time: number,
  idx: number,
  outerColor: string,
  midColor: string,
  coreColor: string,
  glowColor: string,
  glowSize: number,
): void {
  const f1 = Math.sin(time * 7.5 + idx * 2.1) * width * 0.28;
  const f2 = Math.cos(time * 5.8 + idx * 1.4) * width * 0.2;
  const f3 = Math.sin(time * 9.5 + idx * 0.7) * width * 0.13;
  setShadowBlur(ctx, glowSize, glowColor);
  ctx.fillStyle = outerColor;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.95, baseY);
  ctx.quadraticCurveTo(
    x - width * 0.35 + f2,
    baseY - height * 0.65,
    x + f1,
    baseY - height,
  );
  ctx.quadraticCurveTo(
    x + width * 0.4 - f2,
    baseY - height * 0.5,
    x + width * 0.95,
    baseY,
  );
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = midColor;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.6, baseY);
  ctx.quadraticCurveTo(
    x - width * 0.15 + f3,
    baseY - height * 0.5,
    x + f1 * 0.6,
    baseY - height * 0.78,
  );
  ctx.quadraticCurveTo(
    x + width * 0.2 - f3,
    baseY - height * 0.35,
    x + width * 0.6,
    baseY,
  );
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = coreColor;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.28, baseY);
  ctx.quadraticCurveTo(
    x + f2 * 0.3,
    baseY - height * 0.32,
    x + f3 * 0.35,
    baseY - height * 0.52,
  );
  ctx.quadraticCurveTo(
    x + width * 0.1,
    baseY - height * 0.18,
    x + width * 0.28,
    baseY,
  );
  ctx.closePath();
  ctx.fill();
  clearShadow(ctx);
}

function drawMortarLines(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  width: number,
  height: number,
  rows: number,
  color: string,
  s: number,
): void {
  const iW = width * ISO_COS;
  const iD = width * ISO_SIN;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.4 * s;
  for (let r = 1; r < rows; r++) {
    const ry = baseY - height * (r / rows);
    ctx.beginPath();
    ctx.moveTo(cx - iW, ry + iD);
    ctx.lineTo(cx, ry + iD * 2);
    ctx.lineTo(cx + iW, ry + iD);
    ctx.stroke();
  }
}

// =========================================================================
// ICE FORTRESS (Crumbled Stone Ruins)
// =========================================================================

function drawRuinsBanner(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  s: number,
  time: number,
  poleH: number,
  bannerColor1: string,
  bannerColor2: string,
  emblemStyle?: "cross" | "shield" | "star",
): void {
  // Pole with wood grain
  ctx.strokeStyle = "#5a4a3a";
  ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, py - poleH * s);
  ctx.stroke();
  ctx.strokeStyle = "rgba(80,65,45,0.3)";
  ctx.lineWidth = 0.3 * s;
  for (let g = 0; g < 3; g++) {
    const gy = py - poleH * s * (0.2 + g * 0.3);
    ctx.beginPath();
    ctx.moveTo(px - 0.5 * s, gy);
    ctx.lineTo(px + 0.5 * s, gy - 2 * s);
    ctx.stroke();
  }
  // Ornate pole finial (spear tip)
  ctx.fillStyle = "#7a6a5a";
  ctx.beginPath();
  const fTop = py - poleH * s;
  ctx.moveTo(px, fTop - 3 * s);
  ctx.lineTo(px - 1.2 * s, fTop);
  ctx.lineTo(px + 1.2 * s, fTop);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#8a7a6a";
  ctx.beginPath();
  ctx.arc(px, fTop + 0.5 * s, 0.8 * s, 0, Math.PI * 2);
  ctx.fill();
  // Animated banner with wind
  const bW1 = Math.sin(time * 2.2) * 1.8 * s;
  const bW2 = Math.sin(time * 3.1 + 1) * 1.0 * s;
  const bW3 = Math.cos(time * 2.7 + 0.5) * 0.6 * s;
  const bTop = fTop;
  const banG = ctx.createLinearGradient(px, bTop, px + 11 * s, bTop + 9 * s);
  banG.addColorStop(0, bannerColor1);
  banG.addColorStop(0.5, bannerColor2);
  banG.addColorStop(1, bannerColor1);
  ctx.fillStyle = banG;
  ctx.beginPath();
  ctx.moveTo(px + 0.5 * s, bTop);
  ctx.quadraticCurveTo(px + 5 * s + bW1, bTop + 1 * s, px + 10 * s + bW1, bTop + 2.5 * s);
  ctx.quadraticCurveTo(px + 8 * s + bW2, bTop + 5 * s, px + 10 * s + bW3, bTop + 7 * s);
  ctx.lineTo(px + 6 * s + bW2 * 0.5, bTop + 10 * s);
  ctx.lineTo(px + 4 * s - bW3, bTop + 8 * s);
  ctx.quadraticCurveTo(px + 2 * s, bTop + 6 * s, px + 0.5 * s, bTop + 7 * s);
  ctx.closePath();
  ctx.fill();
  // Tattered fringe at bottom
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.3 * s;
  for (let fr = 0; fr < 4; fr++) {
    const fx = px + (3 + fr * 1.8) * s + bW2 * (fr / 4);
    const fy = bTop + (8 + fr * 0.4) * s;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.sin(time * 3 + fr) * 0.8 * s, fy + (1.5 + Math.sin(fr * 2.1) * 0.5) * s);
    ctx.stroke();
  }
  // Banner emblem
  if (emblemStyle) {
    const ex = px + 5 * s + bW1 * 0.3;
    const ey = bTop + 5 * s;
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 0.5 * s;
    if (emblemStyle === "cross") {
      ctx.beginPath();
      ctx.moveTo(ex - 2 * s, ey);
      ctx.lineTo(ex + 2 * s, ey);
      ctx.moveTo(ex, ey - 2.5 * s);
      ctx.lineTo(ex, ey + 2 * s);
      ctx.stroke();
    } else if (emblemStyle === "shield") {
      ctx.beginPath();
      ctx.moveTo(ex - 1.5 * s, ey - 2 * s);
      ctx.lineTo(ex + 1.5 * s, ey - 2 * s);
      ctx.lineTo(ex + 1.5 * s, ey + 0.5 * s);
      ctx.lineTo(ex, ey + 2 * s);
      ctx.lineTo(ex - 1.5 * s, ey + 0.5 * s);
      ctx.closePath();
      ctx.stroke();
    } else {
      for (let sp = 0; sp < 6; sp++) {
        const sa = (sp / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex + Math.cos(sa) * 2 * s, ey + Math.sin(sa) * 2 * s);
        ctx.stroke();
      }
    }
  }
}

function drawBrokenTower(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  tW: number,
  tH: number,
  breakH: number,
  s: number,
  seed: number,
  stoneTop: string,
  stoneLit: string,
  stoneDark: string,
): void {
  const iW = tW * ISO_COS;
  const iD = tW * ISO_SIN;
  const tTopY = ty - tH;

  const baseFrontY = ty + 2 * iD;

  // Main tower body
  drawIsometricPrism(ctx, tx, ty, tW, tW, tH, stoneTop, stoneLit, stoneDark);
  drawMortarLines(ctx, tx, ty, tW, tH, Math.floor(tH / (5 * s)), "rgba(30,25,20,0.15)", s);

  // Weathering stain overlay on left face
  const stain = ctx.createLinearGradient(tx - iW, ty + iD, tx - iW, tTopY + iD);
  stain.addColorStop(0, "rgba(55,70,40,0.16)");
  stain.addColorStop(0.3, "rgba(70,85,50,0.08)");
  stain.addColorStop(0.6, "rgba(45,55,30,0.12)");
  stain.addColorStop(1, "rgba(30,40,20,0.04)");
  prismFaceOverlay(ctx, tx, ty, tW, tH, "left", stain);

  // Vertical crack lines on right face
  ctx.strokeStyle = "rgba(20,15,10,0.14)";
  ctx.lineWidth = 0.4 * s;
  for (let cr = 0; cr < 3; cr++) {
    const crt = (cr + 0.5) / 3;
    const crx = tx + iW * crt;
    const cry0 = ty + iD * (1 - crt) + tH * 0.15;
    ctx.beginPath();
    ctx.moveTo(crx, cry0);
    for (let cs = 1; cs <= 5; cs++) {
      ctx.lineTo(
        crx + Math.sin(seed + cr * 3 + cs * 2.1) * 2 * s,
        cry0 - cs * tH * 0.15,
      );
    }
    ctx.stroke();
  }

  // Top face center of the tower prism: (tx, tTopY + iD)
  // Top face diamond: back(tx, tTopY), right(tx+iW, tTopY+iD), front(tx, tTopY+2*iD), left(tx-iW, tTopY+iD)
  const topCY = tTopY + iD;

  // Exposed interior darkness at broken top (iso diamond inset on top face)
  ctx.fillStyle = "rgba(10,6,3,0.45)";
  ctx.beginPath();
  ctx.moveTo(tx, tTopY + iD * 0.2);
  ctx.lineTo(tx - iW * 0.6, topCY);
  ctx.lineTo(tx, tTopY + iD * 1.8);
  ctx.lineTo(tx + iW * 0.6, topCY);
  ctx.closePath();
  ctx.fill();

  // Crumbled top: organic rubble cap centered on top face
  ctx.fillStyle = stoneLit;
  drawOrganicBlobAt(ctx, tx, topCY, iW * 1.05, iD * 1.05, seed + 3.7, 0.3);
  ctx.fill();
  // Jagged broken stones distributed across top face diamond
  for (let j = 0; j < 8; j++) {
    const jt = (j + 0.2) / 8;
    const jAngle = jt * Math.PI * 2 + seed * 0.4;
    const jDist = 0.3 + Math.sin(seed + j * 1.9) * 0.15;
    const jx = tx + Math.cos(jAngle) * jDist * iW;
    const jy = topCY + Math.sin(jAngle) * jDist * iD;
    const bR = tW * (0.1 + Math.sin(seed + j * 1.3) * 0.04);
    const jH = tW * breakH * 0.01 * (0.15 + 0.85 * Math.abs(Math.sin(seed + j * 2.7)));
    ctx.fillStyle = j % 3 === 0 ? stoneTop : j % 3 === 1 ? stoneLit : stoneDark;
    drawOrganicBlobAt(ctx, jx, jy - jH * 0.4, bR * 1.1, jH * 0.6, seed + j * 2.7, 0.35);
    ctx.fill();
  }
  // Extra organic rubble heap sitting on top face left region
  ctx.fillStyle = stoneDark;
  drawOrganicBlobAt(
    ctx, tx - iW * 0.3, topCY + iD * 0.2,
    iW * 0.5, iD * 0.6, seed + 5.1, 0.35,
  );
  ctx.fill();

  // Small rubble pieces along tower base front
  for (let rb = 0; rb < 8; rb++) {
    const t = (rb + 0.5) / 8;
    const spread = (t - 0.5) * 2;
    const rbx = tx + spread * iW * 0.8 + Math.sin(seed + rb * 1.7) * iW * 0.08;
    const rby = baseFrontY + Math.abs(spread) * iD * 0.3 + (0.3 + Math.sin(seed + rb * 2.5) * 0.4) * iD * 0.15;
    const rbR = tW * 0.035 + Math.sin(seed + rb * 1.9) * tW * 0.015;
    ctx.fillStyle = rb % 3 === 0 ? stoneTop : rb % 3 === 1 ? stoneLit : stoneDark;
    drawOrganicBlobAt(ctx, rbx, rby, rbR, rbR * 0.4, seed + rb * 3.1, 0.25);
    ctx.fill();
  }

  // Moss on left face of tower (anchored to left face midpoint)
  const mossY = ty + iD - tH * 0.08;
  ctx.fillStyle = "rgba(65,90,40,0.2)";
  drawOrganicBlobAt(ctx, tx - iW * 0.5, mossY, tW * 0.4, iD * 0.6, seed + 11, 0.3);
  ctx.fill();
}

function drawRuinedWallSegment(
  ctx: CanvasRenderingContext2D,
  wx: number,
  wy: number,
  wW: number,
  wH: number,
  s: number,
  seed: number,
  stoneTop: string,
  stoneLit: string,
  stoneDark: string,
): void {
  const wI = wW * ISO_COS;
  const wD = wW * ISO_SIN;
  const topCY = wy + wD;

  // Shadow/ground stain under the rubble pile
  ctx.fillStyle = `rgba(30,25,15,0.12)`;
  drawOrganicBlobAt(ctx, wx, topCY + wD * 0.3, wI * 0.9, wD * 0.7, seed + 0.5, 0.2);
  ctx.fill();

  // Large rubble chunks filling the iso diamond footprint (back-to-front layering)
  const chunkCount = 12 + Math.floor(Math.abs(Math.sin(seed)) * 5);
  for (let i = 0; i < chunkCount; i++) {
    const t = (i + 0.3) / chunkCount;
    const ang = t * Math.PI * 2 + seed * 0.7;
    const dist = 0.25 + Math.abs(Math.sin(seed + i * 2.1)) * 0.45;
    const bx = wx + Math.cos(ang) * dist * wI;
    const by = topCY + Math.sin(ang) * dist * wD;
    const bW = wW * (0.04 + Math.sin(seed + i * 1.3) * 0.02);
    const bH = wW * (0.05 + Math.sin(seed + i * 1.7) * 0.035);
    const blobSeed = seed + i * 3.1;

    ctx.fillStyle = i % 4 === 0 ? stoneDark : i % 4 === 1 ? stoneLit : i % 4 === 2 ? stoneTop : stoneLit;
    drawOrganicBlobAt(ctx, bx, by - bH * 0.3, bW, bH * 0.5, blobSeed, 0.3);
    ctx.fill();
    ctx.fillStyle = stoneDark;
    drawOrganicBlobAt(ctx, bx + wW * 0.005, by, bW * 0.8, bH * 0.25, blobSeed + 1, 0.2);
    ctx.fill();
  }

  // Taller rubble stacks in the center for height variation
  const stackCount = 5 + Math.floor(Math.abs(Math.sin(seed * 1.3)) * 3);
  for (let j = 0; j < stackCount; j++) {
    const jt = (j + 0.5) / stackCount;
    const jAng = jt * Math.PI * 1.6 + seed * 0.4 - 0.4;
    const jDist = 0.15 + Math.abs(Math.sin(seed + j * 3.7)) * 0.25;
    const jx = wx + Math.cos(jAng) * jDist * wI;
    const jy = topCY + Math.sin(jAng) * jDist * wD;
    const jW = wW * (0.03 + Math.sin(seed + j * 2.3) * 0.012);
    const jH = wW * (0.07 + Math.sin(seed + j * 1.9) * 0.05);

    ctx.fillStyle = j % 3 === 0 ? stoneTop : j % 3 === 1 ? stoneLit : stoneDark;
    drawOrganicBlobAt(ctx, jx, jy - jH * 0.5, jW, jH * 0.4, seed + j * 4.7, 0.35);
    ctx.fill();
  }

  // Small debris scatter around the edges
  for (let d = 0; d < 8; d++) {
    const dAng = (d / 8) * Math.PI * 2 + seed * 0.6;
    const dDist = 0.6 + Math.sin(seed + d * 1.9) * 0.15;
    const dx = wx + Math.cos(dAng) * dDist * wI;
    const dy = topCY + Math.sin(dAng) * dDist * wD + wD * 0.04;
    const dR = wW * (0.01 + Math.sin(seed + d * 1.5) * 0.005);
    ctx.fillStyle = d % 3 === 0 ? stoneTop : d % 3 === 1 ? stoneLit : stoneDark;
    drawOrganicBlobAt(ctx, dx, dy, dR, dR * 0.4, seed + d * 2.3, 0.25);
    ctx.fill();
  }

  // Moss accents on rubble pile
  ctx.fillStyle = "rgba(65,90,40,0.14)";
  drawOrganicBlobAt(ctx, wx - wI * 0.2, topCY - wD * 0.08, wW * 0.06, wW * 0.035, seed + 7, 0.25);
  ctx.fill();
  ctx.fillStyle = "rgba(75,100,50,0.1)";
  drawOrganicBlobAt(ctx, wx + wI * 0.15, topCY + wD * 0.2, wW * 0.05, wW * 0.025, seed + 9, 0.2);
  ctx.fill();
}

function drawStoneGreeble(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  s: number,
  seed: number,
  stoneTop: string,
  stoneLit: string,
  stoneDark: string,
): void {
  // Organic rubble scatter on isometric ground plane
  const count = 4 + Math.floor(Math.abs(Math.sin(seed * 1.7)) * 3);
  for (let g = 0; g < count; g++) {
    const ga = (g / count) * Math.PI * 2 + seed * 0.5;
    const gDist = (3 + Math.sin(seed + g * 2.3) * 2) * s;
    const bx = gx + Math.cos(ga) * gDist * ISO_COS;
    const by = gy + Math.sin(ga) * gDist * ISO_SIN;
    const bR = (0.8 + Math.sin(seed + g * 1.5) * 0.4) * s;
    ctx.fillStyle = g % 2 === 0 ? stoneLit : stoneTop;
    drawOrganicBlobAt(ctx, bx, by, bR * 1.2, bR * 0.6, seed + g * 3.1, 0.3);
    ctx.fill();
    ctx.fillStyle = stoneDark;
    drawOrganicBlobAt(ctx, bx + bR * 0.35, by + bR * 0.25, bR * 0.9, bR * 0.4, seed + g * 3.1 + 1, 0.25);
    ctx.fill();
  }
}

function drawIsoFaceParallelogram(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  skewX: number,
): void {
  ctx.beginPath();
  ctx.moveTo(cx - hw + skewX, cy - hh);
  ctx.lineTo(cx + hw + skewX, cy - hh);
  ctx.lineTo(cx + hw - skewX, cy + hh);
  ctx.lineTo(cx - hw - skewX, cy + hh);
  ctx.closePath();
}

function drawArchedWindow(
  ctx: CanvasRenderingContext2D,
  wx: number,
  wy: number,
  s: number,
  width: number,
  height: number,
): void {
  const w = width * s;
  const h = height * s;
  const skew = w * 0.15;
  // Stone surround (isometric parallelogram with pointed top)
  ctx.strokeStyle = "rgba(90,75,55,0.4)";
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(wx + skew, wy - h * 0.7);
  ctx.lineTo(wx + w * 0.4 + skew * 0.5, wy - h * 0.4);
  ctx.lineTo(wx + w - skew, wy + h * 0.5);
  ctx.lineTo(wx - w - skew, wy + h * 0.5);
  ctx.lineTo(wx - w * 0.4 + skew * 0.5, wy - h * 0.4);
  ctx.closePath();
  ctx.stroke();
  // Dark interior (isometric parallelogram with pointed arch)
  ctx.fillStyle = "rgba(10,6,3,0.6)";
  ctx.beginPath();
  ctx.moveTo(wx + skew * 0.8, wy - h * 0.6);
  ctx.lineTo(wx + w * 0.35 + skew * 0.4, wy - h * 0.3);
  ctx.lineTo(wx + w * 0.8 - skew * 0.8, wy + h * 0.4);
  ctx.lineTo(wx - w * 0.8 - skew * 0.8, wy + h * 0.4);
  ctx.lineTo(wx - w * 0.35 + skew * 0.4, wy - h * 0.3);
  ctx.closePath();
  ctx.fill();
  // Keystone (isometric trapezoid at arch peak)
  ctx.fillStyle = "rgba(155,135,110,0.5)";
  ctx.beginPath();
  ctx.moveTo(wx - 0.8 * s + skew, wy - h * 0.7);
  ctx.lineTo(wx + 0.8 * s + skew, wy - h * 0.7);
  ctx.lineTo(wx + 0.6 * s + skew * 0.8, wy - h * 0.45);
  ctx.lineTo(wx - 0.6 * s + skew * 0.8, wy - h * 0.45);
  ctx.closePath();
  ctx.fill();
}

function drawArrowSlit(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  s: number,
): void {
  const skew = 0.3 * s;
  // Stone frame (isometric parallelogram)
  ctx.fillStyle = "rgba(90,75,55,0.25)";
  drawIsoFaceParallelogram(ctx, ax, ay, 1.2 * s, 3.5 * s, skew);
  ctx.fill();
  // Cross slit: vertical
  ctx.fillStyle = "rgba(10,6,3,0.6)";
  drawIsoFaceParallelogram(ctx, ax, ay, 0.4 * s, 3 * s, skew * 0.5);
  ctx.fill();
  // Cross slit: horizontal
  ctx.fillStyle = "rgba(10,6,3,0.5)";
  drawIsoFaceParallelogram(ctx, ax, ay, 2 * s, 0.4 * s, skew * 0.3);
  ctx.fill();
}

function drawDefensiveEmplacement(
  ctx: CanvasRenderingContext2D,
  ex: number,
  ey: number,
  s: number,
  stoneTop: string,
  stoneLit: string,
  stoneDark: string,
  hasBarrel?: boolean,
): void {
  // Platform
  const eW = 9 * s;
  drawIsometricPrism(ctx, ex, ey, eW, eW, 2 * s, stoneTop, stoneLit, stoneDark);
  drawMortarLines(ctx, ex, ey, eW, 4 * s, 2, "rgba(30,25,20,0.1)", s);

  // Small rubble pieces along emplacement front edge
  const eI = eW * ISO_COS;
  const eD = eW * ISO_SIN;
  const eBaseFY = ey + 2 * eD;
  for (let rb = 0; rb < 6; rb++) {
    const t = (rb + 0.5) / 6;
    const spread = (t - 0.5) * 2;
    const rbx = ex + spread * eI * 0.8 + Math.sin(ex + rb * 1.9) * eI * 0.07;
    const rby = eBaseFY + Math.abs(spread) * eD * 0.3 + (0.3 + Math.sin(ex + rb * 2.3) * 0.3) * eD * 0.15;
    const rbR = eW * (0.04 + Math.sin(ex + rb * 1.5) * 0.015);
    ctx.fillStyle = rb % 3 === 0 ? stoneTop : rb % 3 === 1 ? stoneLit : stoneDark;
    drawOrganicBlobAt(ctx, rbx, rby, rbR, rbR * 0.4, ex + rb * 2.7, 0.25);
    ctx.fill();
  }

  // Parapet wall
  const pW = 7 * s;
  drawIsometricPrism(ctx, ex, ey - 2 * s, pW, pW, 3 * s, stoneTop, stoneLit, stoneDark);
  drawMortarLines(ctx, ex, ey - 4 * s, pW, 5 * s, 2, "rgba(30,25,20,0.1)", s);

  // Organic rubble cap on parapet top (iso-projected)
  const pI = pW * ISO_COS;
  const pDiso = pW * ISO_SIN;
  const pTopY = ey - 5 * s;
  ctx.fillStyle = stoneLit;
  drawOrganicBlobAt(ctx, ex, pTopY + pDiso, pI * 0.8, pDiso * 0.8, ex * 0.7, 0.35);
  ctx.fill();

  // Merlon stubs as organic blobs (not prisms)
  ctx.fillStyle = stoneTop;
  drawOrganicBlobAt(ctx, ex - pI * 0.6, pTopY + pDiso * 0.3, pW * 0.26, pW * 0.14, ex * 1.3, 0.3);
  ctx.fill();
  drawOrganicBlobAt(ctx, ex - pI * 0.1, pTopY + pDiso * 0.7, pW * 0.21, pW * 0.11, ex * 1.7, 0.25);
  ctx.fill();

  // Embrasure gap (iso-projected dark slot)
  ctx.fillStyle = "rgba(10,6,3,0.4)";
  drawIsoFaceParallelogram(ctx, ex, pTopY + pDiso * 0.5, pW * 0.21, pW * 0.14, pW * 0.03);
  ctx.fill();

  // Barrel (isometric cylinder approximation)
  if (hasBarrel) {
    const bx = ex + 3 * s * ISO_COS;
    const by = ey - 2 * s + 3 * s * ISO_SIN;
    // Barrel body (iso ellipse)
    ctx.fillStyle = "#6a4a2a";
    ctx.beginPath();
    ctx.ellipse(bx, by, 2 * s, 1 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Barrel top (iso ellipse, lighter)
    ctx.fillStyle = "#7a5a3a";
    ctx.beginPath();
    ctx.ellipse(bx, by - 1.5 * s, 1.8 * s, 0.9 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Iron bands
    ctx.strokeStyle = "#4a3a1a";
    ctx.lineWidth = 0.35 * s;
    ctx.beginPath();
    ctx.ellipse(bx, by - 0.5 * s, 2 * s, 1 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Sack (organic blob on iso ground)
    ctx.fillStyle = "#8a7a5a";
    drawOrganicBlobAt(ctx, bx + 2.5 * s, by + 0.5 * s, 1.5 * s, 0.7 * s, ex * 0.5, 0.2);
    ctx.fill();
  }

  // Scatter rubble as organic blobs
  drawStoneGreeble(ctx, ex, ey + 2 * s, s, ex * 0.1, stoneTop, stoneLit, stoneDark);
}

function drawCollapsedArch(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  s: number,
  stoneTop: string,
  stoneMid: string,
  stoneDark: string,
): void {
  const archR = 8 * s;
  const skew = archR * 0.08;
  // Remaining arch voussoirs (iso-projected curve via line segments)
  ctx.strokeStyle = stoneDark;
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const va = Math.PI + t * Math.PI * 0.7;
    const vx = ax + Math.cos(va) * archR * ISO_COS;
    const vy = ay - 5 * s + Math.sin(va) * archR + Math.cos(va) * archR * ISO_SIN * 0.3;
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.stroke();
  // Individual voussoir blobs along the arch
  for (let v = 0; v < 5; v++) {
    const va = Math.PI + (v / 6) * Math.PI * 0.7;
    const vx = ax + Math.cos(va) * archR * ISO_COS;
    const vy = ay - 5 * s + Math.sin(va) * archR + Math.cos(va) * archR * ISO_SIN * 0.3;
    ctx.fillStyle = v % 2 === 0 ? stoneMid : stoneTop;
    drawOrganicBlobAt(ctx, vx, vy, 1.2 * s, 0.8 * s, v * 2.3 + ax * 0.01, 0.25);
    ctx.fill();
  }
  // Keystone (iso trapezoid)
  ctx.fillStyle = stoneTop;
  const kx = ax - archR * ISO_COS * 0.02;
  const ky = ay - 5 * s - archR + 1 * s;
  ctx.beginPath();
  ctx.moveTo(kx - 1.5 * s + skew, ky + 2 * s);
  ctx.lineTo(kx - 1 * s + skew, ky - 1 * s);
  ctx.lineTo(kx + 1 * s + skew, ky - 1 * s);
  ctx.lineTo(kx + 1.5 * s - skew, ky + 2 * s);
  ctx.closePath();
  ctx.fill();
  // Collapsed rubble pile (organic blobs only)
  ctx.fillStyle = stoneMid;
  drawOrganicBlobAt(ctx, ax + 2 * s, ay + 1 * s, 6 * s, 3 * s, ax * 0.1, 0.25);
  ctx.fill();
  ctx.fillStyle = stoneDark;
  drawOrganicBlobAt(ctx, ax - 1 * s, ay + 2 * s, 4 * s, 2 * s, ax * 0.2, 0.3);
  ctx.fill();
  // Fallen block blobs in rubble
  for (let fb = 0; fb < 4; fb++) {
    const fbx = ax + (fb - 2) * 3 * s + Math.sin(fb * 2.7) * s;
    const fby = ay + Math.cos(fb * 1.9) * 1.5 * s;
    const fbR = (0.9 + Math.sin(fb * 3.1) * 0.3) * s;
    ctx.fillStyle = fb % 2 === 0 ? stoneTop : stoneMid;
    drawOrganicBlobAt(ctx, fbx, fby, fbR * 1.2, fbR * 0.6, fb * 3.7, 0.3);
    ctx.fill();
  }
}

function drawButtress(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  s: number,
  bH: number,
  stoneTop: string,
  stoneLit: string,
  stoneDark: string,
): void {
  const bW = 3 * s;
  const iW = bW * ISO_COS;
  const iD = bW * ISO_SIN;
  // Right face (angled support, tapers from top to base)
  ctx.fillStyle = stoneLit;
  ctx.beginPath();
  ctx.moveTo(bx, by - bH);
  ctx.lineTo(bx + iW * 0.5, by - bH + iD * 0.5);
  ctx.lineTo(bx + iW * 2, by + iD * 1.5);
  ctx.lineTo(bx, by + iD * 1.5);
  ctx.closePath();
  ctx.fill();
  // Left face (darker)
  ctx.fillStyle = stoneDark;
  ctx.beginPath();
  ctx.moveTo(bx, by - bH);
  ctx.lineTo(bx - iW * 0.5, by - bH + iD * 0.5);
  ctx.lineTo(bx - iW * 1.5, by + iD * 1.2);
  ctx.lineTo(bx, by + iD * 1.5);
  ctx.closePath();
  ctx.fill();
  // Top face
  ctx.fillStyle = stoneTop;
  ctx.beginPath();
  ctx.moveTo(bx, by - bH);
  ctx.lineTo(bx + iW * 0.5, by - bH + iD * 0.5);
  ctx.lineTo(bx, by - bH + iD);
  ctx.lineTo(bx - iW * 0.5, by - bH + iD * 0.5);
  ctx.closePath();
  ctx.fill();
  // Rubble at base
  ctx.fillStyle = stoneDark;
  drawOrganicBlobAt(ctx, bx, by + iD * 1.5, iW * 1.5, iD * 0.8, bx * 0.3, 0.2);
  ctx.fill();
}

function drawCrackedSurface(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  s: number,
  seed: number,
): void {
  ctx.strokeStyle = "rgba(25,20,12,0.12)";
  ctx.lineWidth = 0.3 * s;
  for (let cr = 0; cr < 5; cr++) {
    const startA = (cr / 5) * Math.PI * 2 + seed * 0.2;
    const crx = cx + Math.cos(startA) * radius * 0.2;
    const cry = cy + Math.sin(startA) * radius * 0.2 * ISO_Y_RATIO;
    ctx.beginPath();
    ctx.moveTo(crx, cry);
    let px = crx;
    let py = cry;
    for (let seg = 0; seg < 4; seg++) {
      const segA = startA + (seg + 1) * 0.4 + Math.sin(seed + cr + seg * 1.7) * 0.5;
      const segR = radius * (0.15 + seg * 0.12);
      px = cx + Math.cos(segA) * segR;
      py = cy + Math.sin(segA) * segR * ISO_Y_RATIO;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Branch cracks
    if (cr % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(px, py);
      const brA = startA + 1.2;
      ctx.lineTo(
        px + Math.cos(brA) * radius * 0.15,
        py + Math.sin(brA) * radius * 0.15 * ISO_Y_RATIO,
      );
      ctx.stroke();
    }
  }
}

function drawVineCluster(
  ctx: CanvasRenderingContext2D,
  vx: number,
  vy: number,
  s: number,
  time: number,
  seed: number,
  vineH: number,
  mossColor: string,
): void {
  // Main vine stem with organic curves
  ctx.strokeStyle = mossColor;
  ctx.lineWidth = 0.7 * s;
  ctx.beginPath();
  ctx.moveTo(vx, vy);
  for (let seg = 1; seg <= 6; seg++) {
    const sway = Math.sin(time * 0.3 + seed + seg * 0.7) * 1.5 * s;
    ctx.quadraticCurveTo(
      vx + sway + Math.sin(seed + seg * 1.1) * 2.5 * s,
      vy - (seg - 0.5) * vineH * s / 6,
      vx + Math.sin(seed + seg * 1.7) * 2 * s,
      vy - seg * vineH * s / 6,
    );
  }
  ctx.stroke();
  // Branch vines
  ctx.lineWidth = 0.35 * s;
  for (let br = 0; br < 3; br++) {
    const bry = vy - (br + 1) * vineH * s / 4;
    const brx = vx + Math.sin(seed + br * 1.7) * 2 * s;
    const brDir = br % 2 === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(brx, bry);
    ctx.quadraticCurveTo(
      brx + brDir * 3 * s, bry - 1 * s,
      brx + brDir * 4.5 * s, bry + 0.5 * s,
    );
    ctx.stroke();
    // Leaf clusters on branches
    ctx.fillStyle = `rgba(65,95,35,${0.35 + Math.sin(time * 0.5 + br) * 0.05})`;
    for (let lf = 0; lf < 3; lf++) {
      const lfx = brx + brDir * (1.5 + lf * 1.2) * s;
      const lfy = bry + Math.sin(seed + lf * 2.3) * 1 * s;
      ctx.beginPath();
      ctx.ellipse(lfx, lfy, 1.3 * s, 0.7 * s, brDir * 0.4 + lf * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Leaf cluster at tip
  ctx.fillStyle = "rgba(55,85,30,0.4)";
  const tipY = vy - vineH * s;
  const tipX = vx + Math.sin(seed * 1.3) * 2 * s;
  for (let tl = 0; tl < 4; tl++) {
    const tla = (tl / 4) * Math.PI * 2 + seed * 0.3;
    ctx.beginPath();
    ctx.ellipse(
      tipX + Math.cos(tla) * 1.5 * s,
      tipY + Math.sin(tla) * 0.8 * s,
      1.4 * s, 0.6 * s, tla * 0.3, 0, Math.PI * 2,
    );
    ctx.fill();
  }
}

export function renderFortress(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s,
    time,
    seedX,
    seedY,
    variant,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
    mapTheme,
  } = p;

  const pal = getFortressPalette(mapTheme);

  if (!skipShadow) {
    drawDirectionalShadow(ctx, cx, cy + 8 * s, s, 48 * s, 20 * s, 68 * s, 0.38, pal.shadowRgb, z);
  }
  if (shadowOnly) return;

  const seed = seedX * 7.3 + seedY * 11.1;
  const ifVar = variant % 3;

  const { stoneTop, stoneLit, stoneMid, stoneDark, stoneDeep, mossGreen, lichYellow } = pal;

  // Tiny rubble stones scattered around the perimeter
  const rubble = [
    { x: -36, y: 9, sz: 0.9 }, { x: 32, y: 3, sz: 1.0 },
    { x: -20, y: 14, sz: 0.8 }, { x: 38, y: 7, sz: 0.7 },
    { x: -40, y: 5, sz: 0.7 }, { x: 14, y: 16, sz: 0.8 },
    { x: -28, y: 12, sz: 0.6 }, { x: 24, y: 11, sz: 0.7 },
  ];
  for (let ri = 0; ri < rubble.length; ri++) {
    const rb = rubble[ri];
    const rx = cx + rb.x * s;
    const ry = cy + rb.y * s;
    const rR = rb.sz * s;
    ctx.fillStyle = ri % 3 === 0 ? stoneMid : ri % 3 === 1 ? stoneLit : stoneTop;
    drawOrganicBlobAt(ctx, rx, ry, rR, rR * 0.4, seed + ri * 3.7, 0.2);
    ctx.fill();
  }

  // Sparse moss patches — subtle ground accents
  for (let mb = 0; mb < 3; mb++) {
    const ma = seed + mb * 2.3;
    const mx = cx + Math.sin(ma) * 22 * s;
    const my = cy + 5 * s + Math.cos(ma) * 7 * s;
    ctx.fillStyle = `rgba(${70 + (mb * 7) % 30},${90 + (mb * 5) % 20},${40 + (mb * 3) % 20},0.07)`;
    drawOrganicBlobAt(ctx, mx, my, (1.2 + Math.sin(ma) * 0.5) * s, (0.6 + Math.cos(ma) * 0.2) * s, ma, 0.2);
    ctx.fill();
  }

  if (ifVar === 0) {
    // Variant 0: Grand crumbled gatehouse with flanking towers, buttresses, and walkway

    // Main curtain wall
    const wallW = 42 * s;
    const wallH = 12 * s;
    drawRuinedWallSegment(ctx, cx, cy + 2 * s, wallW, wallH, s, seed, stoneTop, stoneDark, stoneDeep);
    const wI = wallW * ISO_COS;
    const wD = wallW * ISO_SIN;
    const wBase = cy + 2 * s;

    // Buttresses along wall (structural supports)
    drawButtress(ctx, cx - wI * 0.35, wBase + wD * 0.65, s, 8 * s, stoneTop, stoneMid, stoneDark);
    drawButtress(ctx, cx + wI * 0.4, wBase + wD * 0.6, s, 8 * s, stoneTop, stoneMid, stoneDark);

    // Arrow slits on wall faces, positioned on the iso face grid
    // Left face runs from (cx, wBase) → (cx-wI, wBase+wD) at bottom; height goes up
    // Right face runs from (cx, wBase) → (cx+wI, wBase+wD) at bottom
    for (let face = 0; face < 2; face++) {
      for (let i = 0; i < 3; i++) {
        const t = (i + 1) / 4;
        const slitX = face === 0 ? cx - wI * t : cx + wI * t;
        const slitBaseY = wBase + wD * t;
        drawArrowSlit(ctx, slitX, slitBaseY - wallH * 0.5, s);
      }
    }

    // Crenellations sit ON the top face edges of the wall prism
    const wallTopY = wBase - wallH;
    for (let i = 0; i < 7; i++) {
      const t = (i + 0.5) / 7;
      const skipL = Math.sin(seed + i * 3.1) > 0.5;
      const skipR = Math.cos(seed + i * 2.3) > 0.5;
      if (!skipL) {
        const cR = (2.5 + Math.sin(seed + i * 1.7) * 1.5) * s;
        const mcx = cx - wI * t;
        const mcy = wallTopY + wD * t;
        ctx.fillStyle = stoneMid;
        drawOrganicBlobAt(ctx, mcx, mcy, cR * 1.1, cR * 0.5, seed + i * 2.9, 0.3);
        ctx.fill();
        ctx.fillStyle = stoneTop;
        drawOrganicBlobAt(ctx, mcx, mcy - cR * 0.3, cR * 0.7, cR * 0.3, seed + i * 2.9 + 1, 0.25);
        ctx.fill();
      }
      if (!skipR) {
        const cR = (2.5 + Math.cos(seed + i * 2.1) * 1.5) * s;
        const mcx = cx + wI * t;
        const mcy = wallTopY + wD * t;
        ctx.fillStyle = stoneMid;
        drawOrganicBlobAt(ctx, mcx, mcy, cR * 1.1, cR * 0.5, seed + i * 3.3, 0.3);
        ctx.fill();
        ctx.fillStyle = stoneTop;
        drawOrganicBlobAt(ctx, mcx, mcy - cR * 0.3, cR * 0.7, cR * 0.3, seed + i * 3.3 + 1, 0.25);
        ctx.fill();
      }
    }

    // Stone greeble scatter along wall top
    drawStoneGreeble(ctx, cx - wI * 0.6, wallTopY + wD * 0.4 - 1 * s, s, seed + 10, stoneTop, stoneLit, stoneDark);

    // Left tower (tall, broken top with exposed interior)
    const tLx = cx - 28 * s;
    const tLy = cy + 4 * s;
    const tW = 12 * s;
    const tH = 42 * s;
    drawBrokenTower(ctx, tLx, tLy, tW, tH, 7, s, seed, stoneTop, stoneDark, stoneDeep);
    // Windows on left face: x centered on left face, y at face height
    // Left face center x: tLx - tW*ISO_COS*0.5, base y: tLy + tW*ISO_SIN
    const tLfX = tLx - tW * ISO_COS * 0.5;
    const tLfBaseY = tLy + tW * ISO_SIN;
    drawArchedWindow(ctx, tLfX, tLfBaseY - tH * 0.35, s, 2.5, 4);
    drawArchedWindow(ctx, tLfX, tLfBaseY - tH * 0.6, s, 2.2, 3.5);
    // Left tower ledge — interior floor at 55% height
    const tI = tW * ISO_COS;
    const tD = tW * ISO_SIN;
    const ledgeLY = tLy + tD - tH * 0.55;
    ctx.fillStyle = stoneDark;
    drawOrganicBlobAt(ctx, tLx - tI * 0.3, ledgeLY, tI * 0.7, tD * 0.6, seed + 44, 0.3);
    ctx.fill();
    ctx.fillStyle = stoneMid;
    drawOrganicBlobAt(ctx, tLx, ledgeLY - tD * 0.15, tI * 0.5, tD * 0.4, seed + 45, 0.25);
    ctx.fill();
    // Banner on left tower
    drawRuinsBanner(ctx, tLx, tLy - tH, s, time, 18, pal.bannerPrimary, pal.bannerSecondary, "shield");

    // Right tower (shorter, more ruined, tilted feel from uneven jagging)
    const tRx = cx + 28 * s;
    const tRy = cy - 4 * s;
    const tRH = 34 * s;
    drawBrokenTower(ctx, tRx, tRy, tW, tRH, 10, s, seed + 5, stoneTop, stoneDark, stoneDeep);
    // Window on right tower left face
    const tRfX = tRx - tW * ISO_COS * 0.5;
    const tRfBaseY = tRy + tW * ISO_SIN;
    drawArchedWindow(ctx, tRfX, tRfBaseY - tRH * 0.4, s, 2.3, 3.5);
    // Emplacement near right tower, on iso ground adjacent to base
    const tRBaseF = tRy + 2 * tW * ISO_SIN;
    drawDefensiveEmplacement(ctx, tRx + tW * ISO_COS, tRBaseF, s, stoneTop, stoneMid, stoneDark, true);
    // Small pennant on right
    drawRuinsBanner(ctx, tRx, tRy - tRH, s, time, 14, pal.bannerPrimary, pal.bannerSecondary, "cross");

    // Collapsed gate arch with voussoirs and rubble
    drawCollapsedArch(ctx, cx, cy - 2 * s, s, stoneTop, stoneMid, stoneDark);

    // Broken portcullis bars
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 1 * s;
    for (let pb = -3; pb <= 3; pb += 2) {
      const barH = cy - 10 * s + Math.abs(pb) * 1 * s;
      ctx.beginPath();
      ctx.moveTo(cx + pb * s, barH);
      ctx.lineTo(cx + pb * s, cy + 1 * s);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - 4 * s, cy - 3 * s);
    ctx.lineTo(cx + 2 * s, cy - 3 * s);
    ctx.stroke();

    // Wooden debris (broken beam)
    ctx.fillStyle = "#6a5030";
    ctx.save();
    ctx.translate(cx + 12 * s, cy + 6 * s);
    ctx.rotate(0.3);
    ctx.fillRect(-8 * s, -0.6 * s, 16 * s, 1.2 * s);
    ctx.restore();
    ctx.fillStyle = "#7a6040";
    ctx.save();
    ctx.translate(cx - 10 * s, cy + 8 * s);
    ctx.rotate(-0.15);
    ctx.fillRect(-5 * s, -0.5 * s, 10 * s, 1 * s);
    ctx.restore();

  } else if (ifVar === 1) {
    // Variant 1: L-shaped ruined fortress with watchtower, staircase, and courtyard

    // Main curtain wall
    const wallW = 48 * s;
    const wallH = 11 * s;
    drawRuinedWallSegment(ctx, cx - 6 * s, cy + 3 * s, wallW, wallH, s, seed, stoneTop, stoneDark, stoneDeep);
    const wI = wallW * ISO_COS;
    const wD = wallW * ISO_SIN;

    // Buttresses on main wall faces
    // Left face at t=0.5: (cx-6*s - wI*0.5, cy+3*s + wD*0.5)
    drawButtress(ctx, cx - 6 * s - wI * 0.5, cy + 3 * s + wD * 0.5, s, 7 * s, stoneTop, stoneLit, stoneDark);
    // Right face at t=0.3: (cx-6*s + wI*0.3, cy+3*s + wD*0.3)
    drawButtress(ctx, cx - 6 * s + wI * 0.3, cy + 3 * s + wD * 0.3, s, 7 * s, stoneTop, stoneLit, stoneDark);

    // Upper keep platform with organic rubble foundation
    const keepW = 32 * s;
    const keepH = 9 * s;
    // No heavy blob under keep — the wall prism itself provides the visual
    drawRuinedWallSegment(ctx, cx + 4 * s, cy - 17 * s, keepW, keepH, s, seed + 3, stoneTop, stoneMid, stoneDark);

    // Crenellations on keep top face edges
    // Keep wall at (cx+4*s, cy-17*s) size keepW height keepH
    // Top face: back(cx+4*s, keepTopY), left(cx+4*s - keepI, keepTopY + keepD), right(cx+4*s + keepI, keepTopY + keepD)
    const keepTopY = cy - 17 * s - keepH;
    const keepI = keepW * ISO_COS;
    const keepD = keepW * ISO_SIN;
    const kCx = cx + 4 * s;
    for (let i = 0; i < 5; i++) {
      const t = (i + 0.5) / 5;
      if (Math.sin(seed + i * 2.5) > -0.4) {
        const cR = (2 + Math.sin(seed + i * 1.3) * 1.2) * s;
        const ccx = kCx - keepI * t;
        const ccy = keepTopY + keepD * t;
        ctx.fillStyle = stoneMid;
        drawOrganicBlobAt(ctx, ccx, ccy, cR * 1.1, cR * 0.5, seed + i * 2.5, 0.3);
        ctx.fill();
      }
      if (Math.cos(seed + i * 2.7) > -0.3) {
        const cR = (2 + Math.cos(seed + i * 1.1) * 1.2) * s;
        const ccx = kCx + keepI * t;
        const ccy = keepTopY + keepD * t;
        ctx.fillStyle = stoneMid;
        drawOrganicBlobAt(ctx, ccx, ccy, cR * 1.1, cR * 0.5, seed + i * 2.7, 0.3);
        ctx.fill();
      }
    }

    // Ruined stone staircase (organic step blobs, some crumbled)
    for (let step = 0; step < 6; step++) {
      const stX = cx - 2 * s + step * 3 * s * ISO_COS;
      const stY = cy + 2 * s - step * 4 * s + step * 3 * s * ISO_SIN;
      const stW = (5.5 + Math.sin(seed + step * 2.3) * 1) * s;
      ctx.fillStyle = step % 2 === 0 ? stoneLit : stoneTop;
      drawOrganicBlobAt(ctx, stX, stY, stW, stW * 0.4, seed + step * 3.5, 0.2);
      ctx.fill();
      ctx.fillStyle = stoneDark;
      drawOrganicBlobAt(ctx, stX + 0.5 * s, stY + 0.3 * s, stW * 0.7, stW * 0.25, seed + step * 3.5 + 1, 0.15);
      ctx.fill();
    }

    // Corner watchtower (tallest, partially collapsed)
    const tW = 13 * s;
    const tH = 50 * s;
    const tX = cx + 24 * s;
    const tY = cy - 2 * s;
    drawBrokenTower(ctx, tX, tY, tW, tH, 8, s, seed + 1, stoneTop, stoneDeep, stoneDark);

    // Tower windows at three levels on left face
    const wTfX = tX - tW * ISO_COS * 0.5;
    const wTfBaseY = tY + tW * ISO_SIN;
    for (let w2 = 0; w2 < 3; w2++) {
      const wy = wTfBaseY - tH * (0.22 + w2 * 0.2);
      drawArchedWindow(ctx, wTfX, wy, s, 2.5, w2 === 2 ? 3 : 4);
    }
    // Watchtower floor ledge at 50% height
    const wTI = tW * ISO_COS;
    const wTD = tW * ISO_SIN;
    const ledgeTY = tY + wTD - tH * 0.5;
    ctx.fillStyle = stoneDark;
    drawOrganicBlobAt(ctx, tX - wTI * 0.3, ledgeTY, wTI * 0.7, wTD * 0.6, seed + 46, 0.3);
    ctx.fill();
    ctx.fillStyle = stoneMid;
    drawOrganicBlobAt(ctx, tX, ledgeTY - wTD * 0.15, wTI * 0.5, wTD * 0.4, seed + 47, 0.25);
    ctx.fill();

    // Banner on watchtower
    drawRuinsBanner(ctx, tX, tY - tH, s, time, 20, pal.bannerPrimary, pal.bannerSecondary, "star");

    // Arrow slits on main wall left face
    // Wall at (cx-6*s, cy+3*s) size wallW. Left face: (cx-6*s, cy+3*s) → (cx-6*s - wI, cy+3*s + wD)
    for (let asl = 0; asl < 5; asl++) {
      const at = (asl + 1) / 6;
      const asx = cx - 6 * s - wI * at;
      const asy = cy + 3 * s + wD * at - wallH * 0.5;
      drawArrowSlit(ctx, asx, asy, s);
    }

    // Emplacement on keep top face: back vertex at (kCx, keepTopY)
    drawDefensiveEmplacement(ctx, kCx, keepTopY, s, stoneTop, stoneMid, stoneDark, true);
    // Pennant on keep emplacement
    drawRuinsBanner(ctx, kCx, keepTopY - 6 * s, s, time, 13, pal.bannerPrimary, pal.bannerSecondary, "cross");

    // Stone greeble near staircase
    drawStoneGreeble(ctx, cx + 8 * s, cy - 8 * s, s, seed + 15, stoneTop, stoneLit, stoneDark);

    // Second emplacement at wall's left vertex (on ground near wall corner)
    drawDefensiveEmplacement(ctx, cx - 6 * s - wI, cy + 3 * s + wD, s, stoneTop, stoneMid, stoneDark);

    // Moss growth blobs on lower wall
    ctx.fillStyle = "rgba(65,90,40,0.18)";
    drawOrganicBlobAt(ctx, cx - 6 * s - wI * 0.5, cy + 3 * s + wD - wallH * 0.1, 7 * s, 4 * s, seed + 9, 0.22);
    ctx.fill();
    ctx.fillStyle = "rgba(75,100,45,0.15)";
    drawOrganicBlobAt(ctx, cx + 10 * s, cy - 10 * s, 5 * s, 3 * s, seed + 12, 0.2);
    ctx.fill();

    // Wooden scaffold remains (two posts + crossbar)
    ctx.strokeStyle = "#6a5030";
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 16 * s, cy + 1 * s);
    ctx.lineTo(cx - 16 * s, cy - 14 * s);
    ctx.moveTo(cx - 10 * s, cy + 1 * s);
    ctx.lineTo(cx - 10 * s, cy - 12 * s);
    ctx.stroke();
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 17 * s, cy - 10 * s);
    ctx.lineTo(cx - 9 * s, cy - 10 * s);
    ctx.stroke();

  } else {
    // Variant 2: Compact fortress ruin with central keep, twin bastions, courtyard well, and catapult platform

    // Main wall
    const wallW = 38 * s;
    const wallH = 11 * s;
    drawRuinedWallSegment(ctx, cx, cy + 3 * s, wallW, wallH, s, seed, stoneTop, stoneDark, stoneDeep);
    const wI = wallW * ISO_COS;
    const wD = wallW * ISO_SIN;

    // Crenellations on wall top face edges
    const wTopY = cy + 3 * s - wallH;
    for (let i = 0; i < 6; i++) {
      const t = (i + 0.5) / 6;
      if (Math.sin(seed + i * 2.9) > -0.3) {
        const cR = (2 + Math.sin(seed + i * 1.5) * 1.2) * s;
        const mcx2 = cx - wI * t;
        const mcy2 = wTopY + wD * t;
        ctx.fillStyle = stoneMid;
        drawOrganicBlobAt(ctx, mcx2, mcy2, cR * 1.1, cR * 0.5, seed + i * 2.7, 0.3);
        ctx.fill();
      }
      if (Math.cos(seed + i * 3.3) > -0.2) {
        const cR = (2 + Math.cos(seed + i * 1.8) * 1.2) * s;
        const mcx2 = cx + wI * t;
        const mcy2 = wTopY + wD * t;
        ctx.fillStyle = stoneMid;
        drawOrganicBlobAt(ctx, mcx2, mcy2, cR * 1.1, cR * 0.5, seed + i * 3.1, 0.3);
        ctx.fill();
      }
    }

    // Buttress on left face at t=0.4: (cx - wI*0.4, cy+3*s + wD*0.4)
    drawButtress(ctx, cx - wI * 0.4, cy + 3 * s + wD * 0.4, s, 7 * s, stoneTop, stoneLit, stoneDark);

    // Left bastion (squat, round-ish by stacking)
    const lBx = cx - 26 * s;
    const lBy = cy + 5 * s;
    const bW = 11 * s;
    const bH = 30 * s;
    drawBrokenTower(ctx, lBx, lBy, bW, bH, 6, s, seed + 2, stoneTop, stoneDeep, stoneDark);
    const bI = bW * ISO_COS;
    const bD = bW * ISO_SIN;
    // Bastion cap centered on tower top face
    const lCapCY = lBy - bH + bW * ISO_SIN;
    ctx.fillStyle = stoneLit;
    drawOrganicBlobAt(ctx, lBx, lCapCY, bI * 1.1, bD * 1.1, seed + 50, 0.3);
    ctx.fill();
    ctx.fillStyle = stoneTop;
    drawOrganicBlobAt(ctx, lBx, lCapCY - bD * 0.2, bI * 0.85, bD * 0.85, seed + 51, 0.25);
    ctx.fill();
    // Emplacement sits on tower top: y = tower's y - height (top back vertex)
    drawDefensiveEmplacement(ctx, lBx, lBy - bH, s, stoneTop, stoneMid, stoneDark, true);
    // Window on left bastion left face
    drawArchedWindow(ctx, lBx - bI * 0.5, lBy + bD - bH * 0.4, s, 2, 3.5);

    // Right bastion
    const rBx = cx + 26 * s;
    const rBy = cy - 2 * s;
    drawBrokenTower(ctx, rBx, rBy, bW, bH, 7, s, seed + 4, stoneTop, stoneDeep, stoneDark);
    // Right bastion cap centered on tower top face
    const rCapCY = rBy - bH + bW * ISO_SIN;
    ctx.fillStyle = stoneLit;
    drawOrganicBlobAt(ctx, rBx, rCapCY, bI * 1.1, bD * 1.1, seed + 52, 0.3);
    ctx.fill();
    ctx.fillStyle = stoneTop;
    drawOrganicBlobAt(ctx, rBx, rCapCY - bD * 0.2, bI * 0.85, bD * 0.85, seed + 53, 0.25);
    ctx.fill();
    drawDefensiveEmplacement(ctx, rBx, rBy - bH, s, stoneTop, stoneMid, stoneDark);
    // Window on right bastion left face
    drawArchedWindow(ctx, rBx - bI * 0.5, rBy + bD - bH * 0.4, s, 2, 3.5);

    // Central broken keep (tallest, heavily damaged)
    const ckW = 14 * s;
    const ckH = 48 * s;
    drawBrokenTower(ctx, cx, cy - 8 * s, ckW, ckH, 10, s, seed + 6, stoneLit, stoneDeep, stoneDark);

    // Keep floor ledges at 35% and 65% height
    const ckI = ckW * ISO_COS;
    const ckD = ckW * ISO_SIN;
    const keepBaseY = cy - 8 * s;
    // Ledge 1 at 35% height
    const kLedge1Y = keepBaseY + ckD - ckH * 0.35;
    ctx.fillStyle = stoneDark;
    drawOrganicBlobAt(ctx, cx - ckI * 0.3, kLedge1Y, ckI * 0.65, ckD * 0.6, seed + 54, 0.3);
    ctx.fill();
    ctx.fillStyle = stoneMid;
    drawOrganicBlobAt(ctx, cx, kLedge1Y - ckD * 0.15, ckI * 0.45, ckD * 0.4, seed + 55, 0.25);
    ctx.fill();
    // Ledge 2 at 65% height
    const kLedge2Y = keepBaseY + ckD - ckH * 0.65;
    ctx.fillStyle = stoneDark;
    drawOrganicBlobAt(ctx, cx + ckI * 0.2, kLedge2Y, ckI * 0.5, ckD * 0.5, seed + 56, 0.28);
    ctx.fill();

    // Keep windows on left face
    const kfX = cx - ckI * 0.5;
    const kfBaseY = keepBaseY + ckD;
    for (let w2 = 0; w2 < 3; w2++) {
      const wy = kfBaseY - ckH * (0.2 + w2 * 0.22);
      drawArchedWindow(ctx, kfX, wy, s, 2.5, w2 === 2 ? 3 : 4);
    }

    // Main banner on central keep
    drawRuinsBanner(ctx, cx, cy - 8 * s - ckH, s, time, 20, pal.bannerPrimary, pal.bannerSecondary, "shield");
    drawRuinsBanner(ctx, lBx, lBy - bH, s, time, 14, pal.bannerPrimary, pal.bannerSecondary, "cross");
    drawRuinsBanner(ctx, rBx, rBy - bH, s, time, 12, pal.bannerPrimary, pal.bannerSecondary, "star");

    // Courtyard well (organic stone ring)
    const wellX = cx + 6 * s;
    const wellY = cy + 1 * s;
    const wellR = 5 * s;
    ctx.fillStyle = stoneDark;
    drawOrganicBlobAt(ctx, wellX, wellY + wellR * ISO_SIN * 0.5, wellR * ISO_COS * 1.3, wellR * ISO_SIN * 1.3, seed + 60, 0.2);
    ctx.fill();
    ctx.fillStyle = stoneTop;
    drawOrganicBlobAt(ctx, wellX, wellY - 2 * s + wellR * ISO_SIN * 0.5, wellR * ISO_COS * 1.1, wellR * ISO_SIN * 1.1, seed + 61, 0.18);
    ctx.fill();
    // Well opening (dark iso diamond)
    ctx.fillStyle = "rgba(8,5,2,0.6)";
    const wellI = wellR * ISO_COS;
    const wellD = wellR * ISO_SIN;
    ctx.beginPath();
    ctx.moveTo(wellX, wellY - 2 * s);
    ctx.lineTo(wellX - wellI * 0.5, wellY - 2 * s + wellD * 0.5);
    ctx.lineTo(wellX, wellY - 2 * s + wellD);
    ctx.lineTo(wellX + wellI * 0.5, wellY - 2 * s + wellD * 0.5);
    ctx.closePath();
    ctx.fill();
    // Rope and bucket
    ctx.strokeStyle = "#6a5a3a";
    ctx.lineWidth = 0.4 * s;
    ctx.beginPath();
    ctx.moveTo(wellX, wellY - 3 * s + wellD * 0.7);
    ctx.lineTo(wellX, wellY - 7 * s);
    ctx.stroke();

    // Catapult platform (organic rubble base)
    const catX = cx - 14 * s;
    const catY = cy - 2 * s;
    ctx.fillStyle = stoneDark;
    drawOrganicBlobAt(ctx, catX, catY + 1 * s, 9 * s, 4.5 * s, seed + 62, 0.22);
    ctx.fill();
    ctx.fillStyle = stoneTop;
    drawOrganicBlobAt(ctx, catX, catY - 1 * s, 7.5 * s, 3.5 * s, seed + 63, 0.18);
    ctx.fill();
    // Wooden frame remnants
    ctx.strokeStyle = "#6a5030";
    ctx.lineWidth = 0.9 * s;
    ctx.beginPath();
    ctx.moveTo(catX - 2 * s, catY - 3 * s);
    ctx.lineTo(catX - 2 * s, catY - 10 * s);
    ctx.lineTo(catX + 3 * s, catY - 7 * s);
    ctx.stroke();
    ctx.lineWidth = 0.6 * s;
    ctx.beginPath();
    ctx.moveTo(catX + 2 * s, catY - 3 * s);
    ctx.lineTo(catX + 2 * s, catY - 9 * s);
    ctx.stroke();

    // Stone greeble around courtyard
    drawStoneGreeble(ctx, cx + 15 * s, cy + 3 * s, s, seed + 20, stoneTop, stoneLit, stoneDark);
    drawStoneGreeble(ctx, cx - 20 * s, cy + 6 * s, s, seed + 22, stoneTop, stoneLit, stoneDark);

    // Weathered stone overlays on central keep faces
    const keepWeath = ctx.createLinearGradient(cx, cy - 8 * s, cx, cy - 8 * s - ckH);
    keepWeath.addColorStop(0, "rgba(55,75,40,0.12)");
    keepWeath.addColorStop(0.3, "rgba(70,90,50,0.06)");
    keepWeath.addColorStop(0.6, "rgba(85,100,60,0.08)");
    keepWeath.addColorStop(1, "rgba(45,60,30,0.05)");
    prismFaceOverlay(ctx, cx, cy - 8 * s, ckW, ckH, "left", keepWeath);
  }

  // --- Shared detail layers (all variants) ---

  // Dense vine clusters creeping up walls
  for (let v = 0; v < 8; v++) {
    drawVineCluster(
      ctx,
      cx + Math.sin(seed + v * 2.1) * 24 * s,
      cy + 3 * s,
      s, time, seed + v * 1.7,
      3 + Math.sin(seed + v) * 1.5,
      mossGreen,
    );
  }

  // Additional small moss blobs on upper surfaces
  for (let um = 0; um < 5; um++) {
    const ua = seed + um * 3.7;
    ctx.fillStyle = `rgba(60,85,35,${0.12 + Math.sin(ua) * 0.04})`;
    drawOrganicBlobAt(
      ctx,
      cx + Math.sin(ua) * 18 * s,
      cy - 12 * s + Math.cos(ua) * 8 * s,
      (2.5 + Math.sin(ua * 1.3) * 1) * s,
      (1.2 + Math.cos(ua * 1.5) * 0.4) * s,
      ua, 0.3,
    );
    ctx.fill();
  }

  // Dust motes and debris particles
  for (let dp = 0; dp < 12; dp++) {
    const dAngle = (dp / 12) * Math.PI * 2 + time * 0.12;
    const dR = (30 + Math.sin(time * 0.4 + dp * 1.3) * 14) * s;
    const dy = cy - 22 * s + Math.cos(time * 0.25 + dp) * 14 * s;
    const dpSize = (0.6 + Math.sin(time * 0.5 + dp * 0.8) * 0.25) * s;
    ctx.fillStyle = `rgba(${140 + dp * 3},${120 + dp * 2},${90 + dp * 2},${0.35 + Math.sin(time + dp) * 0.1})`;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(dAngle) * dR, dy, dpSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tiny floating seeds/fluff (organic wind debris)
  ctx.fillStyle = "rgba(220,210,190,0.35)";
  for (let fl = 0; fl < 5; fl++) {
    const flA = time * 0.08 + fl * 1.3;
    const flR = (20 + Math.sin(time * 0.3 + fl * 2.1) * 15) * s;
    const flY = cy - 30 * s + Math.sin(time * 0.2 + fl * 1.7) * 18 * s;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(flA) * flR, flY, 0.5 * s, 0, Math.PI * 2);
    ctx.fill();
    // Trailing wisp
    ctx.strokeStyle = "rgba(220,210,190,0.15)";
    ctx.lineWidth = 0.2 * s;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(flA) * flR, flY);
    ctx.lineTo(cx + Math.cos(flA - 0.3) * (flR + 3 * s), flY + 1.5 * s);
    ctx.stroke();
  }
}

// =========================================================================
// SKULL THRONE
// =========================================================================

export function renderSkullThrone(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;

  if (!skipShadow) {
    const shRx = Math.min(34 * s, MAX_SHADOW_RX * z);
    const shRy = Math.min(16 * s, MAX_SHADOW_RY * z);
    const shGrad = ctx.createRadialGradient(
      cx + 2 * s,
      cy + 8 * s,
      0,
      cx + 2 * s,
      cy + 8 * s,
      shRx,
    );
    shGrad.addColorStop(0, "rgba(60,10,10,0.4)");
    shGrad.addColorStop(0.35, "rgba(0,0,0,0.3)");
    shGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(cx + 2 * s, cy + 8 * s, shRx, shRy, 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  if (shadowOnly) return;

  const pulse = 0.5 + Math.sin(time * 2.2) * 0.25;
  const bW = "#e8e0d0";
  const bL = "#d8d0c0";
  const bM = "#c0b0a0";
  const bD = "#a09080";
  const bSh = "#786858";
  const bVDk = "#5a4a38";
  const redGl = "#cc2020";

  // Dark crimson aura glow
  drawThroneAura(ctx, cx, cy, s, pulse);

  // Base platform (two stepped tiers)
  drawThroneBase(ctx, cx, cy, s, pulse, bW, bM, bD, bSh, bVDk);

  // Throne seat
  const seatBase = cy - 9 * s;
  const seatW = 15 * s;
  const seatH = 10 * s;
  drawThroneSeat(ctx, cx, seatBase, seatW, seatH, s, bM, bD, bSh, bL);

  const seatTop = seatBase - seatH;
  const seatI = seatW * ISO_COS;
  const seatD = seatW * ISO_SIN;

  // Red velvet cushion
  drawThroneCushion(ctx, cx, seatTop, seatI, seatD, s);

  // Backrest
  const bkW = 16 * s;
  const bkTW = 7 * s;
  const bkH = 55 * s;
  const bkTop = seatTop - bkH;
  drawThroneBackrest(
    ctx,
    cx,
    seatTop,
    bkTop,
    bkW,
    bkTW,
    bkH,
    s,
    bW,
    bL,
    bM,
    bD,
    bSh,
  );

  // Armrests with skull caps
  drawThroneArmrests(ctx, cx, seatTop, seatI, seatD, s, pulse, bL, bM, bD);

  // Crown spikes and skull
  const bkTD = bkTW * ISO_SIN;
  drawThroneCrown(ctx, cx, bkTop, bkTD, s, pulse, bW, bM, bD, bSh, redGl);

  // Red energy spine running up the backrest
  const bkD2 = bkW * ISO_SIN;
  drawThroneEnergySpine(ctx, cx, seatTop, bkTop, bkD2, bkTD, s, pulse, redGl);

  // Iron chains hanging from crown spikes
  drawThroneChains(ctx, cx, bkTop, bkTD, s, time);

  // Red soul particles
  drawThroneSouls(ctx, cx, bkTop, s, time);
}

function drawThroneAura(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  pulse: number,
): void {
  const auraG = ctx.createRadialGradient(
    cx,
    cy - 12 * s,
    2 * s,
    cx,
    cy - 12 * s,
    38 * s,
  );
  auraG.addColorStop(0, `rgba(180,20,20,${0.1 + pulse * 0.06})`);
  auraG.addColorStop(0.4, `rgba(100,10,10,${0.05 + pulse * 0.03})`);
  auraG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = auraG;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 12 * s, 38 * s, 20 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawThroneBase(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  pulse: number,
  bW: string,
  bM: string,
  bD: string,
  bSh: string,
  bVDk: string,
): void {
  // Tier 1: Wide base
  drawIsometricPrism(ctx, cx, cy, 30 * s, 30 * s, 4 * s, bD, bSh, bVDk);
  drawMortarLines(ctx, cx, cy, 30 * s, 4 * s, 2, "rgba(90,70,55,0.18)", s);

  // Tier 2: Inset step
  drawIsometricPrism(ctx, cx, cy - 4 * s, 24 * s, 24 * s, 5 * s, bM, bSh, bD);
  drawMortarLines(
    ctx,
    cx,
    cy - 4 * s,
    24 * s,
    5 * s,
    3,
    "rgba(80,65,50,0.15)",
    s,
  );

  // Bone sheen on tier 2 left face
  const t2Sheen = ctx.createLinearGradient(cx, cy - 4 * s, cx, cy - 9 * s);
  t2Sheen.addColorStop(0, "rgba(200,185,165,0.08)");
  t2Sheen.addColorStop(1, "rgba(180,165,145,0)");
  prismFaceOverlay(ctx, cx, cy - 4 * s, 24 * s, 5 * s, "left", t2Sheen);

  // Skulls scattered on the base tier ledge
  const baseSkulls: Array<[number, number, number, number]> = [
    [-16, 1, 2.8, 1],
    [16, 1, 2.8, -1],
    [-9, 5, 3.2, 1],
    [9, 5, 3.2, -1],
    [0, 7, 3.5, 1],
    [-20, -2, 2.4, 1],
    [20, -2, 2.4, -1],
  ];
  for (const [dx, dy, sz, f] of baseSkulls) {
    drawIsoSkull3D(
      ctx,
      cx + dx * s,
      cy + dy * s,
      sz * s,
      f,
      bW,
      bM,
      bD,
      "#cc2020",
      0.08 + pulse * 0.06,
    );
  }

  // Small scattered bones between skulls
  ctx.lineCap = "round";
  const scatteredBones: Array<[number, number, number]> = [
    [-12, 4, 0.8],
    [12, 4, 1.2],
    [-5, 6, 0.5],
    [5, 2, 0.9],
    [-17, 3, 0.6],
    [17, -1, 0.7],
  ];
  for (const [dx, dy, ang] of scatteredBones) {
    const bx = cx + dx * s;
    const by = cy + dy * s;
    ctx.strokeStyle = bSh;
    ctx.lineWidth = 0.9 * s;
    ctx.beginPath();
    ctx.moveTo(bx - Math.cos(ang) * 2.5 * s, by - Math.sin(ang) * 1 * s);
    ctx.lineTo(bx + Math.cos(ang) * 2.5 * s, by + Math.sin(ang) * 1 * s);
    ctx.stroke();
    ctx.fillStyle = bM;
    ctx.beginPath();
    ctx.arc(
      bx - Math.cos(ang) * 2.5 * s,
      by - Math.sin(ang) * 1 * s,
      0.7 * s,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      bx + Math.cos(ang) * 2.5 * s,
      by + Math.sin(ang) * 1 * s,
      0.7 * s,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawThroneSeat(
  ctx: CanvasRenderingContext2D,
  cx: number,
  seatBase: number,
  seatW: number,
  seatH: number,
  s: number,
  bM: string,
  bD: string,
  bSh: string,
  bL: string,
): void {
  drawIsometricPrism(ctx, cx, seatBase, seatW, seatW, seatH, bM, bSh, bD);
  drawMortarLines(ctx, cx, seatBase, seatW, seatH, 3, bSh, s);

  // Bone texture highlight line on seat
  const seatI = seatW * ISO_COS;
  const seatD = seatW * ISO_SIN;
  const seatTop = seatBase - seatH;
  ctx.strokeStyle = bL;
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx, seatBase + seatD * 2);
  ctx.lineTo(cx, seatTop + seatD * 2);
  ctx.stroke();

  // Subtle sheen on seat left face
  const seatSheen = ctx.createLinearGradient(
    cx - seatI,
    seatBase + seatD,
    cx,
    seatTop + seatD * 2,
  );
  seatSheen.addColorStop(0, "rgba(200,185,165,0.08)");
  seatSheen.addColorStop(1, "rgba(160,145,125,0)");
  prismFaceOverlay(ctx, cx, seatBase, seatW, seatH, "left", seatSheen);
}

function drawThroneCushion(
  ctx: CanvasRenderingContext2D,
  cx: number,
  seatTop: number,
  seatI: number,
  seatD: number,
  s: number,
): void {
  // Cushion base
  const cushG = ctx.createLinearGradient(cx, seatTop, cx, seatTop + 3 * s);
  cushG.addColorStop(0, "#7a1828");
  cushG.addColorStop(0.4, "#a02040");
  cushG.addColorStop(0.8, "#701828");
  cushG.addColorStop(1, "#501018");
  ctx.fillStyle = cushG;
  ctx.beginPath();
  ctx.moveTo(cx, seatTop + 0.5 * s);
  ctx.lineTo(cx + seatI * 0.85, seatTop + seatD * 0.85 + 0.5 * s);
  ctx.lineTo(cx, seatTop + seatD * 1.7 + 0.5 * s);
  ctx.lineTo(cx - seatI * 0.85, seatTop + seatD * 0.85 + 0.5 * s);
  ctx.closePath();
  ctx.fill();

  // Cushion highlight
  ctx.fillStyle = "rgba(200,80,100,0.12)";
  ctx.beginPath();
  ctx.ellipse(
    cx - seatI * 0.2,
    seatTop + seatD * 0.6,
    seatI * 0.3,
    seatD * 0.25,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawThroneBackrest(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bkBase: number,
  bkTop: number,
  bkW: number,
  bkTW: number,
  bkH: number,
  s: number,
  bW: string,
  bL: string,
  bM: string,
  bD: string,
  bSh: string,
): void {
  const bkI = bkW * ISO_COS;
  const bkD2 = bkW * ISO_SIN;
  const bkTI = bkTW * ISO_COS;
  const bkTD = bkTW * ISO_SIN;

  // Left face with rich gradient
  const bkLG = ctx.createLinearGradient(
    cx - bkI,
    bkBase + bkD2,
    cx,
    bkTop + bkTD,
  );
  bkLG.addColorStop(0, bSh);
  bkLG.addColorStop(0.3, "#8a7a6a");
  bkLG.addColorStop(0.6, "#7a6a5a");
  bkLG.addColorStop(1, "#6a5a4a");
  ctx.fillStyle = bkLG;
  ctx.beginPath();
  ctx.moveTo(cx - bkI, bkBase + bkD2);
  ctx.lineTo(cx, bkBase + bkD2 * 2);
  ctx.lineTo(cx, bkTop + bkTD * 2);
  ctx.lineTo(cx - bkTI, bkTop + bkTD);
  ctx.closePath();
  ctx.fill();

  // Right face
  const bkRG = ctx.createLinearGradient(
    cx + bkI,
    bkBase + bkD2,
    cx,
    bkTop + bkTD,
  );
  bkRG.addColorStop(0, bD);
  bkRG.addColorStop(0.3, "#9a8a7a");
  bkRG.addColorStop(0.6, "#8a7a6a");
  bkRG.addColorStop(1, "#7a6a5a");
  ctx.fillStyle = bkRG;
  ctx.beginPath();
  ctx.moveTo(cx + bkI, bkBase + bkD2);
  ctx.lineTo(cx, bkBase + bkD2 * 2);
  ctx.lineTo(cx, bkTop + bkTD * 2);
  ctx.lineTo(cx + bkTI, bkTop + bkTD);
  ctx.closePath();
  ctx.fill();

  // Front face (viewer-facing)
  const bkFG = ctx.createLinearGradient(cx, bkBase + bkD2, cx, bkTop + bkTD);
  bkFG.addColorStop(0, bM);
  bkFG.addColorStop(0.5, "#b0a090");
  bkFG.addColorStop(1, "#a09080");
  ctx.fillStyle = bkFG;
  ctx.beginPath();
  ctx.moveTo(cx - bkI, bkBase + bkD2);
  ctx.lineTo(cx + bkI, bkBase + bkD2);
  ctx.lineTo(cx + bkTI, bkTop + bkTD);
  ctx.lineTo(cx, bkTop);
  ctx.lineTo(cx - bkTI, bkTop + bkTD);
  ctx.closePath();
  ctx.fill();

  // Spine ridge and edge lines
  ctx.strokeStyle = bL;
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(cx, bkBase + bkD2 * 2);
  ctx.lineTo(cx, bkTop + bkTD * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(200,185,165,0.3)";
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.moveTo(cx - bkI, bkBase + bkD2);
  ctx.lineTo(cx - bkTI, bkTop + bkTD);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + bkI, bkBase + bkD2);
  ctx.lineTo(cx + bkTI, bkTop + bkTD);
  ctx.stroke();

  // Horizontal bone bands across the backrest
  ctx.strokeStyle = bL;
  ctx.lineWidth = 0.5 * s;
  for (const frac of [0.2, 0.4, 0.6, 0.8]) {
    const bandI = bkI + (bkTI - bkI) * frac;
    const bandD = bkD2 + (bkTD - bkD2) * frac;
    const bandY = bkBase + (bkTop - bkBase) * frac;
    ctx.beginPath();
    ctx.moveTo(cx - bandI, bandY + bandD);
    ctx.lineTo(cx, bandY + bandD * 2);
    ctx.stroke();
  }

  // Embedded skulls on backrest faces
  const embSkulls: Array<[number, number, number]> = [
    [0.2, -0.35, 3.2],
    [0.4, 0.25, 2.8],
    [0.6, -0.2, 3.0],
    [0.35, 0.45, 2.6],
    [0.55, -0.45, 2.6],
    [0.78, 0.1, 2.3],
  ];
  for (const [ht, xOff, sz] of embSkulls) {
    const esy = bkBase + (bkTop - bkBase) * ht;
    const eI = bkI + (bkTI - bkI) * ht;
    const eD = bkD2 + (bkTD - bkD2) * ht;
    const esx = cx + xOff * eI;
    const esy2 = esy + eD * (1 + xOff * 0.5);
    drawIsoSkull3D(ctx, esx, esy2, sz * s, xOff < 0 ? -1 : 1, bW, bM, bD);
  }
}

function drawThroneArmrests(
  ctx: CanvasRenderingContext2D,
  cx: number,
  seatTop: number,
  seatI: number,
  seatD: number,
  s: number,
  pulse: number,
  bL: string,
  bM: string,
  bD: string,
): void {
  for (const side of [-1, 1]) {
    const ax = cx + side * seatI * 1.08;
    const ay = seatTop + seatD + 1 * s;

    // Armrest body with gradient
    const armGrad = ctx.createLinearGradient(
      cx + side * seatI * 0.8,
      seatTop + seatD * 0.8,
      ax,
      ay - 5 * s,
    );
    armGrad.addColorStop(0, "#8a7a6a");
    armGrad.addColorStop(1, "#a09080");
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.moveTo(cx + side * seatI * 0.8, seatTop + seatD * 0.8);
    ctx.lineTo(ax, ay - 2 * s);
    ctx.lineTo(ax, ay - 9 * s);
    ctx.lineTo(cx + side * seatI * 0.8, seatTop + seatD * 0.8 - 6 * s);
    ctx.closePath();
    ctx.fill();

    // Armrest edge highlight
    ctx.strokeStyle = bL;
    ctx.lineWidth = 0.4 * s;
    ctx.beginPath();
    ctx.moveTo(cx + side * seatI * 0.8, seatTop + seatD * 0.8 - 6 * s);
    ctx.lineTo(ax, ay - 9 * s);
    ctx.stroke();

    // Skull cap on armrest
    drawIsoSkull3D(
      ctx,
      ax,
      ay - 6 * s,
      2.8 * s,
      side,
      bL,
      bM,
      bD,
      "#cc2020",
      0.35 + pulse * 0.3,
    );
  }
}

function drawThroneCrown(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bkTop: number,
  bkTD: number,
  s: number,
  pulse: number,
  bW: string,
  bM: string,
  bD: string,
  bSh: string,
  redGl: string,
): void {
  // Bone spike crown (taller center, descending outward)
  const spikeData: Array<[number, number, number]> = [
    [-12, 4, 8],
    [-6, 2, 11],
    [0, 0, 16],
    [6, 2, 11],
    [12, 4, 8],
  ];
  for (const [xOff, yOff, h] of spikeData) {
    drawIsometricPyramid(
      ctx,
      cx + xOff * s,
      bkTop + bkTD + yOff * s,
      h === 16 ? 2.8 * s : 2 * s,
      h * s,
      bW,
      bSh,
      bM,
    );
  }

  // Crown skull — large with glowing red eyes
  const cSkY = bkTop + bkTD + 10 * s;
  drawIsoSkull3D(ctx, cx, cSkY, 6 * s, 1, bW, bM, bD);

  // Cranium highlight
  ctx.fillStyle = "#ede4d6";
  ctx.beginPath();
  ctx.ellipse(
    cx - 1 * s,
    cSkY - 2.5 * s,
    3.8 * s,
    4.2 * s,
    -0.08,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Deep eye sockets
  const crEyeOff = 6 * 0.36 * s;
  const crEyeY = cSkY + 6 * 0.04 * s;
  ctx.fillStyle = "#1a0a04";
  ctx.beginPath();
  ctx.ellipse(cx - crEyeOff, crEyeY, 1.4 * s, 1.9 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + crEyeOff, crEyeY, 1.4 * s, 1.9 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing red eyes
  setShadowBlur(ctx, 14 * s, redGl);
  ctx.fillStyle = `rgba(220,30,30,${0.55 + pulse * 0.35})`;
  ctx.beginPath();
  ctx.arc(cx - crEyeOff, crEyeY, 1.1 * s, 0, Math.PI * 2);
  ctx.arc(cx + crEyeOff, crEyeY, 1.1 * s, 0, Math.PI * 2);
  ctx.fill();
  // Bright core
  ctx.fillStyle = `rgba(255,100,80,${0.3 + pulse * 0.25})`;
  ctx.beginPath();
  ctx.arc(cx - crEyeOff, crEyeY, 0.5 * s, 0, Math.PI * 2);
  ctx.arc(cx + crEyeOff, crEyeY, 0.5 * s, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
}

function drawThroneEnergySpine(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bkBase: number,
  bkTop: number,
  bkD2: number,
  bkTD: number,
  s: number,
  pulse: number,
  redGl: string,
): void {
  setShadowBlur(ctx, 6 * s, redGl);
  ctx.strokeStyle = `rgba(200,30,30,${0.25 + pulse * 0.2})`;
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(cx, bkBase + bkD2 * 0.3);
  ctx.lineTo(cx, bkTop + bkTD + 18 * s);
  ctx.stroke();

  // Diamond motif
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 2.5 * s, bkTop + bkTD + 22 * s);
  ctx.lineTo(cx, bkTop + bkTD + 16 * s);
  ctx.lineTo(cx + 2.5 * s, bkTop + bkTD + 22 * s);
  ctx.stroke();

  // Additional smaller V shapes along the spine
  const spineLen = bkBase + bkD2 * 0.3 - (bkTop + bkTD + 18 * s);
  for (let i = 0; i < 3; i++) {
    const t = (i + 1) / 4;
    const vy = bkTop + bkTD + 18 * s + spineLen * t;
    const vSize = (1.5 + i * 0.3) * s;
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - vSize, vy + 2 * s);
    ctx.lineTo(cx, vy);
    ctx.lineTo(cx + vSize, vy + 2 * s);
    ctx.stroke();
  }
  clearShadow(ctx);
}

function drawThroneChains(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bkTop: number,
  bkTD: number,
  s: number,
  time: number,
): void {
  ctx.lineCap = "round";
  for (const xOff of [-9, 0, 9]) {
    const chainTop = bkTop + bkTD + 3 * s;
    const chainLen = 16 + Math.abs(xOff) * 0.4;
    const chainSway = Math.sin(time * 1.0 + xOff * 0.3) * 1.2 * s;

    for (let link = 0; link < 5; link++) {
      const ly = chainTop + link * 3.2 * s;
      const lx = cx + xOff * s + chainSway * (link / 5);
      // Dark outline first
      ctx.strokeStyle = "#2a2a30";
      ctx.lineWidth = 1.1 * s;
      ctx.beginPath();
      ctx.ellipse(
        lx,
        ly,
        link % 2 === 0 ? 1.3 * s : 0.7 * s,
        link % 2 === 0 ? 0.7 * s : 1.5 * s,
        link % 2 === 1 ? 0.25 : 0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      // Lighter link body
      ctx.strokeStyle = "#505058";
      ctx.lineWidth = 0.65 * s;
      ctx.beginPath();
      ctx.ellipse(
        lx,
        ly,
        link % 2 === 0 ? 1.3 * s : 0.7 * s,
        link % 2 === 0 ? 0.7 * s : 1.5 * s,
        link % 2 === 1 ? 0.25 : 0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Weight at chain end
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.arc(
      cx + xOff * s + chainSway,
      chainTop + chainLen * s,
      1.3 * s,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#505058";
    ctx.lineWidth = 0.4 * s;
    ctx.stroke();
  }
}

function drawThroneSouls(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bkTop: number,
  s: number,
  time: number,
): void {
  for (let i = 0; i < 6; i++) {
    const pt = (time * 0.45 + i * 0.45) % 2.5;
    const ang = (i / 6) * Math.PI * 2 + time * 0.2;
    const dr = 14 * s + Math.sin(pt * Math.PI) * 8 * s;
    const px = cx + Math.cos(ang) * dr;
    const py = bkTop + 10 * s - pt * 12 * s;
    const pa = Math.max(0, (1 - pt / 2.5) * 0.35);
    ctx.fillStyle = `rgba(200,30,30,${pa})`;
    ctx.beginPath();
    ctx.arc(px, py, (1.5 - pt * 0.4) * s, 0, Math.PI * 2);
    ctx.fill();
    // Bright core on particle
    ctx.fillStyle = `rgba(255,100,80,${pa * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, py, (0.6 - pt * 0.15) * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// =========================================================================
// WAR MONUMENT
// =========================================================================

export function renderWarMonument(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s,
    time,
    seedX,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;

  if (!skipShadow) {
    const shRx = Math.min(55 * s, MAX_SHADOW_RX * z);
    const shRy = Math.min(24 * s, MAX_SHADOW_RY * z);
    const shGrad = ctx.createRadialGradient(
      cx + 4 * s,
      cy + 10 * s,
      0,
      cx + 4 * s,
      cy + 10 * s,
      shRx,
    );
    shGrad.addColorStop(0, "rgba(0,0,0,0.45)");
    shGrad.addColorStop(0.4, "rgba(0,0,0,0.2)");
    shGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(cx + 4 * s, cy + 10 * s, shRx, shRy, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (shadowOnly) return;

  const pulse = 0.5 + Math.sin(time * 2.0) * 0.25;

  // Scorched earth ring
  const earthGrad = ctx.createRadialGradient(
    cx,
    cy + 2 * s,
    8 * s,
    cx,
    cy + 2 * s,
    42 * s,
  );
  earthGrad.addColorStop(0, "rgba(30,25,20,0.4)");
  earthGrad.addColorStop(0.5, "rgba(20,15,10,0.2)");
  earthGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = earthGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2 * s, 42 * s, 18 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3-tier stepped base
  drawIsometricPrism(
    ctx,
    cx,
    cy,
    38 * s,
    38 * s,
    4 * s,
    "#353540",
    "#18181f",
    "#262630",
  );
  drawIsometricPrism(
    ctx,
    cx,
    cy - 4 * s,
    30 * s,
    30 * s,
    4 * s,
    "#3a3a46",
    "#1c1c26",
    "#2c2c38",
  );
  drawIsometricPrism(
    ctx,
    cx,
    cy - 8 * s,
    23 * s,
    23 * s,
    3 * s,
    "#404050",
    "#202030",
    "#30303e",
  );

  // Gradient overlay on tier 1 for weathered stone look
  const stoneSheen = ctx.createLinearGradient(cx, cy, cx, cy - 4 * s);
  stoneSheen.addColorStop(0, "rgba(60,60,75,0.12)");
  stoneSheen.addColorStop(1, "rgba(40,40,55,0)");
  prismFaceOverlay(ctx, cx, cy, 38 * s, 4 * s, "left", stoneSheen);

  // Pulsing rune diamonds around base
  setShadowBlur(ctx, 6 * s, "#ff4400");
  const baseI = 38 * s * ISO_COS;
  const baseD = 38 * s * ISO_SIN;
  for (let face = 0; face < 2; face++) {
    for (let i = 0; i < 3; i++) {
      const t = (i + 0.5) / 3;
      const rx = face === 0 ? cx - baseI * (1 - t) : cx + baseI * t;
      const ry =
        face === 0
          ? cy + baseD * (2 * t - 1) + baseD
          : cy + baseD * (1 - 2 * t) + baseD;
      ctx.strokeStyle = `rgba(255,80,20,${0.25 + pulse * 0.35})`;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(rx, ry - 3 * s);
      ctx.lineTo(rx + 2.5 * s, ry);
      ctx.lineTo(rx, ry + 2 * s);
      ctx.lineTo(rx - 2.5 * s, ry);
      ctx.closePath();
      ctx.stroke();
    }
  }
  clearShadow(ctx);

  // Main obelisk pillar
  const pillarW = 11 * s;
  const pillarH = 68 * s;
  const pillarBase = cy - 11 * s;
  drawIsometricPrism(
    ctx,
    cx,
    pillarBase,
    pillarW,
    pillarW,
    pillarH,
    "#484858",
    "#181824",
    "#2a2a3a",
  );

  // Face gradient overlays for polished stone
  const pillarSheen = ctx.createLinearGradient(
    cx,
    pillarBase,
    cx,
    pillarBase - pillarH,
  );
  pillarSheen.addColorStop(0, "rgba(70,70,90,0.15)");
  pillarSheen.addColorStop(0.5, "rgba(50,50,70,0.06)");
  pillarSheen.addColorStop(1, "rgba(30,30,50,0)");
  prismFaceOverlay(ctx, cx, pillarBase, pillarW, pillarH, "left", pillarSheen);

  // Engraving bands
  drawMortarLines(
    ctx,
    cx,
    pillarBase,
    pillarW,
    pillarH,
    9,
    "rgba(0,0,0,0.15)",
    s,
  );

  // Carved skull reliefs on pillar
  const pI = pillarW * ISO_COS;
  const pD = pillarW * ISO_SIN;
  for (let i = 0; i < 3; i++) {
    const skY = pillarBase - pillarH * (0.25 + i * 0.25);
    drawIsoSkull3D(
      ctx,
      cx,
      skY + pD * 2,
      2.5 * s,
      1,
      "rgba(80,80,100,0.6)",
      "rgba(60,60,80,0.4)",
      "rgba(40,40,60,0.3)",
    );
  }

  // Pyramidal cap with gold trim
  const capBase = pillarBase - pillarH;
  drawIsometricPyramid(
    ctx,
    cx,
    capBase,
    pillarW + 4 * s,
    18 * s,
    "#5a5a6c",
    "#1a1a26",
    "#3a3a4c",
  );
  ctx.strokeStyle = `rgba(200,170,80,${0.3 + pulse * 0.2})`;
  ctx.lineWidth = 1 * s;
  const capI = (pillarW + 4 * s) * ISO_COS;
  const capD = (pillarW + 4 * s) * ISO_SIN;
  ctx.beginPath();
  ctx.moveTo(cx, capBase);
  ctx.lineTo(cx + capI, capBase + capD);
  ctx.lineTo(cx, capBase + capD * 2);
  ctx.lineTo(cx - capI, capBase + capD);
  ctx.closePath();
  ctx.stroke();

  // Crossed swords at top
  const swordY = capBase - 12 * s;
  const bladeGrad = ctx.createLinearGradient(
    cx - 12 * s,
    swordY,
    cx + 12 * s,
    swordY,
  );
  bladeGrad.addColorStop(0, "#7a7a8a");
  bladeGrad.addColorStop(0.3, "#b0b0c0");
  bladeGrad.addColorStop(0.5, "#d0d0e0");
  bladeGrad.addColorStop(0.7, "#b0b0c0");
  bladeGrad.addColorStop(1, "#7a7a8a");
  ctx.strokeStyle = bladeGrad;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, swordY + 7 * s);
  ctx.lineTo(cx + 12 * s, swordY - 7 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, swordY + 7 * s);
  ctx.lineTo(cx - 12 * s, swordY - 7 * s);
  ctx.stroke();
  // Blade edge highlights
  ctx.strokeStyle = "rgba(200,200,220,0.3)";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 11 * s, swordY + 6 * s);
  ctx.lineTo(cx + 11 * s, swordY - 6 * s);
  ctx.stroke();
  // Hilts
  ctx.strokeStyle = "#5a4528";
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 12 * s, swordY + 6 * s);
  ctx.lineTo(cx - 12 * s, swordY + 10 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 12 * s, swordY + 6 * s);
  ctx.lineTo(cx + 12 * s, swordY + 10 * s);
  ctx.stroke();
  // Crossguards (gold)
  ctx.strokeStyle = "#8a7a50";
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, swordY + 6 * s);
  ctx.lineTo(cx - 10 * s, swordY + 6 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 10 * s, swordY + 6 * s);
  ctx.lineTo(cx + 14 * s, swordY + 6 * s);
  ctx.stroke();
  // Pommel gems
  setShadowBlur(ctx, 3 * s, "#ff4400");
  ctx.fillStyle = `rgba(255,60,20,${0.4 + pulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(cx - 12 * s, swordY + 10 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.arc(cx + 12 * s, swordY + 10 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Eternal flame
  const flameY = swordY - 6 * s;
  drawMultiFlame(
    ctx,
    cx,
    flameY,
    7 * s,
    22 * s,
    time,
    0,
    `rgba(255,60,0,${0.2 + pulse * 0.15})`,
    `rgba(255,120,20,${0.55 + pulse * 0.3})`,
    `rgba(255,230,100,${0.7 + pulse * 0.2})`,
    "#ff6600",
    16 * s,
  );

  // Tattered war banners
  for (const side of [-1, 1]) {
    const bx = cx + side * (pI + 3 * s);
    const by = pillarBase - pillarH * 0.55 + side * pD * 0.5;
    const bannerWave = Math.sin(time * 2.5 + side * 1.5) * 2.5 * s;
    const bannerWave2 = Math.cos(time * 3.2 + side) * 1.5 * s;
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(bx, by - 4 * s);
    ctx.lineTo(bx, by + 24 * s);
    ctx.stroke();
    ctx.fillStyle = "#6a6a6a";
    ctx.beginPath();
    ctx.arc(bx, by - 4 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
    const banGrad = ctx.createLinearGradient(
      bx,
      by,
      bx + side * 10 * s,
      by + 22 * s,
    );
    banGrad.addColorStop(0, side < 0 ? "#5a1818" : "#4a1515");
    banGrad.addColorStop(0.5, side < 0 ? "#3a0c0c" : "#300a0a");
    banGrad.addColorStop(1, "#200808");
    ctx.fillStyle = banGrad;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + side * 9 * s + bannerWave, by + 3 * s);
    ctx.lineTo(bx + side * 8 * s - bannerWave2, by + 12 * s);
    ctx.lineTo(bx + side * 10 * s + bannerWave, by + 15 * s);
    ctx.lineTo(bx + side * 7 * s - bannerWave2, by + 20 * s);
    ctx.lineTo(bx + side * 4 * s, by + 18 * s);
    ctx.lineTo(bx + side * 6 * s + bannerWave * 0.3, by + 24 * s);
    ctx.lineTo(bx, by + 20 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(200,160,60,${0.25 + pulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(
      bx + side * 5 * s + bannerWave * 0.3,
      by + 10 * s,
      2.5 * s,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Ember particles
  for (let i = 0; i < 4; i++) {
    const ePhase = time * 1.8 + i * 1.5 + seedX * 0.3;
    const eAlpha = Math.max(0, Math.sin(ePhase * 1.2) * 0.5);
    if (eAlpha > 0.08) {
      const ex = cx + Math.sin(ePhase * 0.7) * 8 * s;
      const ey = flameY - 5 * s - ((time * 12 + i * 10) % 35) * s;
      ctx.fillStyle = `rgba(255,160,40,${eAlpha})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Shield trophies
  const t1I = baseI;
  [
    { x: cx - t1I * 0.75, y: cy - 1 * s, f: 1 },
    { x: cx + t1I * 0.75, y: cy - 2.5 * s, f: -1 },
    { x: cx - t1I * 0.35, y: cy + baseD * 0.7, f: 1 },
    { x: cx + t1I * 0.35, y: cy - baseD * 0.2, f: -1 },
  ].forEach(({ x: shX, y: shY, f }) => {
    const shW = 4 * s;
    const shH = 5 * s;
    const shGr = ctx.createLinearGradient(shX, shY - shH, shX, shY + shH);
    shGr.addColorStop(0, "#505060");
    shGr.addColorStop(0.5, "#3a3a48");
    shGr.addColorStop(1, "#282834");
    ctx.fillStyle = shGr;
    ctx.beginPath();
    ctx.moveTo(shX, shY - shH);
    ctx.lineTo(shX + shW * f, shY - shH * 0.3);
    ctx.lineTo(shX + shW * 0.6 * f, shY + shH * 0.7);
    ctx.lineTo(shX, shY + shH);
    ctx.lineTo(shX - shW * 0.4 * f, shY + shH * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(200,170,80,${0.2 + pulse * 0.1})`;
    ctx.lineWidth = 0.5 * s;
    ctx.stroke();
  });

  // Torch braziers
  [
    { x: cx - baseI * 0.85, y: cy + baseD * 0.15 },
    { x: cx + baseI * 0.85, y: cy - baseD * 0.15 },
  ].forEach(({ x: bx, y: by }, bIdx) => {
    ctx.fillStyle = "#2a2a34";
    ctx.beginPath();
    ctx.moveTo(bx - 2.5 * s, by);
    ctx.lineTo(bx - 3.5 * s, by - 6 * s);
    ctx.lineTo(bx + 3.5 * s, by - 6 * s);
    ctx.lineTo(bx + 2.5 * s, by);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.ellipse(bx, by - 6 * s, 3.5 * s, 1.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    drawMultiFlame(
      ctx,
      bx,
      by - 6 * s,
      2.5 * s,
      12 * s,
      time,
      bIdx + 3,
      `rgba(255,100,20,${0.35 + pulse * 0.2})`,
      `rgba(255,200,60,${0.5 + pulse * 0.3})`,
      `rgba(255,240,150,${0.6 + pulse * 0.2})`,
      "#ff6600",
      8 * s,
    );
  });

  // Wreath on pillar front
  const wreathY = pillarBase - pillarH * 0.5;
  ctx.strokeStyle = `rgba(200,170,80,${0.18 + pulse * 0.12})`;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.ellipse(cx, wreathY + pD * 2, 4 * s, 4.4 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let leaf = 0; leaf < 12; leaf++) {
    const la = (leaf / 12) * Math.PI * 2;
    ctx.fillStyle = `rgba(180,155,60,${0.12 + pulse * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.cos(la) * 4 * s,
      wreathY + pD * 2 + Math.sin(la) * 4.4 * s,
      1.2 * s,
      0.5 * s,
      la + Math.PI * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Weathered stone cracks
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.4 * s;
  [0.2, 0.5, 0.8, 1.3, 1.7].forEach((seed) => {
    const crX = cx + Math.cos(seed * 4) * baseI * 0.7;
    const crY = cy + Math.sin(seed * 3) * baseD * 0.5;
    ctx.beginPath();
    ctx.moveTo(crX, crY);
    ctx.lineTo(crX + Math.cos(seed * 2) * 4 * s, crY + Math.sin(seed) * 2 * s);
    ctx.lineTo(
      crX + Math.cos(seed * 2 + 0.5) * 6 * s,
      crY + Math.sin(seed + 0.5) * 3 * s,
    );
    ctx.stroke();
  });

  // Smoke wisps
  for (let i = 0; i < 3; i++) {
    const smokePh = time * 0.8 + i * 1.2;
    const smokeAlpha = Math.max(0, 0.08 - ((time * 4 + i * 6) % 20) * 0.004);
    if (smokeAlpha > 0.01) {
      const smX = cx + Math.sin(smokePh * 0.6) * 6 * s;
      const smY = flameY - 22 * s - ((time * 6 + i * 8) % 30) * s;
      ctx.fillStyle = `rgba(40,40,50,${smokeAlpha})`;
      ctx.beginPath();
      ctx.ellipse(smX, smY, (3 + i) * s, (2 + i * 0.5) * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// =========================================================================
// BONE ALTAR
// =========================================================================

export function renderBoneAltar(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: rawCy,
    s,
    time,
    seedX,
    seedY,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const cy = rawCy - 6 * s;

  if (!skipShadow) {
    const shRx = Math.min(52 * s, MAX_SHADOW_RX * z);
    const shRy = Math.min(24 * s, MAX_SHADOW_RY * z);
    const shGrad = ctx.createRadialGradient(
      cx,
      cy + 10 * s,
      0,
      cx,
      cy + 10 * s,
      shRx,
    );
    shGrad.addColorStop(0, "rgba(15,40,20,0.5)");
    shGrad.addColorStop(0.35, "rgba(0,0,0,0.28)");
    shGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10 * s, shRx, shRy, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (shadowOnly) return;

  const pulse = 0.5 + Math.sin(time * 2.2) * 0.3;
  const boneW = "#ddd4c4";
  const boneL = "#c8baa8";
  const boneSh = "#9a8a78";
  const boneDk = "#6a5848";
  const boneVDk = "#4a3a2a";

  // --- Scorched ground with green/purple glow ---
  const groundGrad = ctx.createRadialGradient(
    cx,
    cy + 4 * s,
    4 * s,
    cx,
    cy + 4 * s,
    48 * s,
  );
  groundGrad.addColorStop(0, `rgba(40,80,30,${0.35 + pulse * 0.1})`);
  groundGrad.addColorStop(0.25, `rgba(50,25,60,${0.3 + pulse * 0.08})`);
  groundGrad.addColorStop(0.55, "rgba(20,15,10,0.2)");
  groundGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = groundGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4 * s, 48 * s, 22 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Corruption cracks radiating outward
  ctx.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + seedX * 0.1;
    const vLen = (20 + Math.sin(seedX + i * 3.1) * 10) * s;
    ctx.strokeStyle = `rgba(50,180,60,${0.08 + pulse * 0.06})`;
    ctx.lineWidth = 0.6 * s;
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(angle) * 14 * s,
      cy + 4 * s + Math.sin(angle) * 6 * s,
    );
    ctx.quadraticCurveTo(
      cx + Math.cos(angle + 0.15) * vLen * 0.65,
      cy + 4 * s + Math.sin(angle + 0.15) * vLen * 0.3,
      cx + Math.cos(angle - 0.1) * vLen,
      cy + 4 * s + Math.sin(angle - 0.1) * vLen * 0.45,
    );
    ctx.stroke();
  }

  // --- Outer ring of scattered bones on ground ---
  drawScatteredBones(ctx, cx, cy, s, seedX, boneL, boneSh, boneDk);

  // --- Main bone pile base (wide isometric mound) ---
  drawBonePileMound(ctx, cx, cy, s, boneW, boneL, boneSh, boneDk, boneVDk);

  // --- Middle tier skull cluster ---
  const midY = cy - 8 * s;
  drawBonePileMiddle(ctx, cx, midY, s, boneW, boneL, boneSh, boneDk, boneVDk);

  // --- Skulls piled on the mound (back row first for depth) ---
  const skullPositions: Array<{ x: number; y: number; r: number; f: number }> =
    [
      { x: cx - 10 * s, y: cy - 4 * s, r: 2.8 * s, f: 1 },
      { x: cx + 8 * s, y: cy - 5 * s, r: 2.6 * s, f: -1 },
      { x: cx + 1 * s, y: cy - 3 * s, r: 2.4 * s, f: 1 },
      { x: cx - 6 * s, y: cy - 10 * s, r: 3.0 * s, f: 1 },
      { x: cx + 7 * s, y: cy - 11 * s, r: 2.5 * s, f: -1 },
      { x: cx - 14 * s, y: cy - 2 * s, r: 2.2 * s, f: 1 },
      { x: cx + 14 * s, y: cy - 3 * s, r: 2.0 * s, f: -1 },
      { x: cx, y: cy - 15 * s, r: 3.5 * s, f: 1 },
      { x: cx - 4 * s, y: cy - 18 * s, r: 2.8 * s, f: -1 },
      { x: cx + 5 * s, y: cy - 17 * s, r: 2.6 * s, f: 1 },
    ];
  for (const sk of skullPositions) {
    const eyeGlow = `rgba(60,255,90,1)`;
    const eyeA = 0.35 + pulse * 0.45;
    drawIsoSkull3D(
      ctx,
      sk.x,
      sk.y,
      sk.r,
      sk.f,
      boneW,
      boneL,
      boneSh,
      eyeGlow,
      eyeA,
    );
  }

  // --- Top centerpiece skull (large, dramatic) ---
  const topSkY = cy - 22 * s;
  drawIsoSkull3D(ctx, cx, topSkY, 5.5 * s, 1, boneW, boneL, boneSh);
  ctx.fillStyle = "#e8ddd0";
  ctx.beginPath();
  ctx.ellipse(
    cx - 1.2 * s,
    topSkY - 2.5 * s,
    3.5 * s,
    4 * s,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  const topEyeOff = 5.5 * 0.36 * s;
  setShadowBlur(ctx, 4 * s, "#44ff88");
  ctx.fillStyle = `rgba(60,255,90,${0.5 + pulse * 0.45})`;
  ctx.beginPath();
  ctx.arc(cx - topEyeOff, topSkY + 5.5 * 0.04 * s, 1.1 * s, 0, Math.PI * 2);
  ctx.arc(cx + topEyeOff, topSkY + 5.5 * 0.04 * s, 1.1 * s, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // --- Green/purple fire engulfing the pile ---
  drawBonePileFire(ctx, cx, cy, s, time, pulse, seedX);

  // --- Embers and floating sparks ---
  drawBonePileEmbers(ctx, cx, cy, s, time, seedX);

  // --- Wispy souls escaping the pile ---
  for (let i = 0; i < 5; i++) {
    const wPhase = time * 1.3 + i * 1.7 + seedX;
    const wAlpha = Math.max(0, Math.sin(wPhase) * 0.25);
    if (wAlpha > 0.04) {
      const wx = cx + Math.sin(wPhase * 0.55 + i) * 18 * s;
      const wy = cy - 20 * s - ((time * 8 + i * 7) % 30) * s;
      const wColor =
        i % 2 === 0
          ? `rgba(80,255,110,${wAlpha})`
          : `rgba(170,100,255,${wAlpha * 0.8})`;
      ctx.fillStyle = wColor;
      ctx.beginPath();
      ctx.ellipse(
        wx,
        wy,
        1.8 * s,
        4 * s,
        Math.sin(wPhase * 0.3) * 0.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

function drawScatteredBones(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  seedX: number,
  boneL: string,
  boneSh: string,
  boneDk: string,
): void {
  ctx.lineCap = "round";
  const outerBones: Array<{ a: number; d: number; len: number }> = [
    { a: 0.2, d: 32, len: 5 },
    { a: 0.9, d: 30, len: 4 },
    { a: 1.6, d: 34, len: 5.5 },
    { a: 2.4, d: 28, len: 4.5 },
    { a: 3.1, d: 33, len: 5 },
    { a: 3.8, d: 30, len: 4 },
    { a: 4.5, d: 35, len: 6 },
    { a: 5.2, d: 29, len: 4.5 },
    { a: 5.8, d: 31, len: 5 },
  ];
  for (const bone of outerBones) {
    const bx =
      cx + Math.cos(bone.a) * (bone.d + Math.sin(seedX + bone.a) * 3) * s;
    const by =
      cy +
      4 * s +
      Math.sin(bone.a) * (bone.d * 0.45 + Math.cos(seedX + bone.a) * 2) * s;
    const bAng = bone.a * 0.6 + seedX * 0.05;
    const halfLen = bone.len * 0.5 * s;
    ctx.strokeStyle = boneSh;
    ctx.lineWidth = 1.4 * s;
    ctx.beginPath();
    ctx.moveTo(
      bx - Math.cos(bAng) * halfLen,
      by - Math.sin(bAng) * halfLen * 0.5,
    );
    ctx.lineTo(
      bx + Math.cos(bAng) * halfLen,
      by + Math.sin(bAng) * halfLen * 0.5,
    );
    ctx.stroke();
    ctx.strokeStyle = boneL;
    ctx.lineWidth = 0.9 * s;
    ctx.beginPath();
    ctx.moveTo(
      bx - Math.cos(bAng) * halfLen,
      by - Math.sin(bAng) * halfLen * 0.5,
    );
    ctx.lineTo(
      bx + Math.cos(bAng) * halfLen,
      by + Math.sin(bAng) * halfLen * 0.5,
    );
    ctx.stroke();
    ctx.fillStyle = boneL;
    ctx.beginPath();
    ctx.arc(
      bx - Math.cos(bAng) * halfLen,
      by - Math.sin(bAng) * halfLen * 0.5,
      1.1 * s,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      bx + Math.cos(bAng) * halfLen,
      by + Math.sin(bAng) * halfLen * 0.5,
      1.1 * s,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Small skulls scattered around outer edge
  const outerSkulls: Array<{ a: number; d: number; r: number }> = [
    { a: 0.5, d: 30, r: 1.8 },
    { a: 2.0, d: 32, r: 1.6 },
    { a: 3.5, d: 28, r: 1.9 },
    { a: 5.0, d: 33, r: 1.5 },
  ];
  for (const osk of outerSkulls) {
    const sx = cx + Math.cos(osk.a) * osk.d * s;
    const sy = cy + 4 * s + Math.sin(osk.a) * osk.d * 0.45 * s;
    drawIsoSkull3D(
      ctx,
      sx,
      sy,
      osk.r * s,
      Math.cos(osk.a) > 0 ? -1 : 1,
      boneL,
      boneSh,
      boneDk,
    );
  }
}

function drawBonePileMound(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  boneW: string,
  boneL: string,
  boneSh: string,
  boneDk: string,
  boneVDk: string,
): void {
  // Isometric mound shape - dark base shadow
  const moundRx = 26 * s;
  const moundRy = 12 * s;
  ctx.fillStyle = boneVDk;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    cy + 5 * s,
    moundRx + 2 * s,
    moundRy + 1 * s,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Main mound body with bone-colored gradient
  const moundGrad = ctx.createRadialGradient(
    cx - 4 * s,
    cy - 4 * s,
    2 * s,
    cx,
    cy + 2 * s,
    moundRx,
  );
  moundGrad.addColorStop(0, boneW);
  moundGrad.addColorStop(0.35, boneL);
  moundGrad.addColorStop(0.7, boneSh);
  moundGrad.addColorStop(1, boneDk);
  ctx.fillStyle = moundGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 3 * s, moundRx, moundRy, 0, 0, Math.PI * 2);
  ctx.fill();

  // Layered bone texture lines across the mound surface
  ctx.lineCap = "round";
  for (let row = 0; row < 5; row++) {
    const rowY = cy + (row - 1) * 3 * s;
    const rowRx = moundRx * (1 - Math.abs(row - 2) * 0.15);
    for (let b = 0; b < 4; b++) {
      const t = (b + 0.5) / 4;
      const bx = cx + (t - 0.5) * rowRx * 1.6;
      const by = rowY + Math.sin(b * 2.3 + row) * 1.5 * s;
      const bAng = b * 0.8 + row * 0.5;
      const bLen = (2 + Math.sin(b + row) * 1) * s;
      ctx.strokeStyle = row < 2 ? boneL : boneSh;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(bx - Math.cos(bAng) * bLen, by - Math.sin(bAng) * bLen * 0.4);
      ctx.lineTo(bx + Math.cos(bAng) * bLen, by + Math.sin(bAng) * bLen * 0.4);
      ctx.stroke();
    }
  }

  // Rib bones sticking out of the pile at angles
  const ribs: Array<{
    x: number;
    y: number;
    angle: number;
    len: number;
    curve: number;
  }> = [
    { x: cx - 18 * s, y: cy - 1 * s, angle: -0.6, len: 12, curve: -4 },
    { x: cx + 16 * s, y: cy - 2 * s, angle: 0.5, len: 11, curve: 3 },
    { x: cx - 8 * s, y: cy - 6 * s, angle: -0.3, len: 10, curve: -3 },
    { x: cx + 10 * s, y: cy - 5 * s, angle: 0.4, len: 9, curve: 4 },
    { x: cx - 20 * s, y: cy + 3 * s, angle: -0.8, len: 8, curve: -2 },
    { x: cx + 22 * s, y: cy + 1 * s, angle: 0.7, len: 7, curve: 2 },
  ];
  for (const rib of ribs) {
    const endX = rib.x + Math.cos(rib.angle) * rib.len * s;
    const endY = rib.y - Math.abs(Math.sin(rib.angle)) * rib.len * s - 2 * s;
    const cpX = (rib.x + endX) / 2 + rib.curve * s;
    const cpY = (rib.y + endY) / 2 - 3 * s;
    ctx.strokeStyle = boneDk;
    ctx.lineWidth = 1.6 * s;
    ctx.beginPath();
    ctx.moveTo(rib.x, rib.y);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();
    ctx.strokeStyle = boneL;
    ctx.lineWidth = 1.0 * s;
    ctx.beginPath();
    ctx.moveTo(rib.x, rib.y);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();
  }
}

function drawBonePileMiddle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  midY: number,
  s: number,
  boneW: string,
  boneL: string,
  boneSh: string,
  boneDk: string,
  boneVDk: string,
): void {
  // Smaller mound on top of base
  const midRx = 16 * s;
  const midRy = 7 * s;
  ctx.fillStyle = boneVDk;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    midY + 3 * s,
    midRx + 1 * s,
    midRy + 0.5 * s,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const midGrad = ctx.createRadialGradient(
    cx - 2 * s,
    midY - 3 * s,
    1 * s,
    cx,
    midY + 1 * s,
    midRx,
  );
  midGrad.addColorStop(0, boneW);
  midGrad.addColorStop(0.4, boneL);
  midGrad.addColorStop(0.75, boneSh);
  midGrad.addColorStop(1, boneDk);
  ctx.fillStyle = midGrad;
  ctx.beginPath();
  ctx.ellipse(cx, midY + 1 * s, midRx, midRy, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cross-bones detail on middle tier
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const bx = cx + (i - 1) * 8 * s;
    const by = midY + Math.sin(i * 1.5) * 2 * s;
    ctx.strokeStyle = boneSh;
    ctx.lineWidth = 1.0 * s;
    ctx.beginPath();
    ctx.moveTo(bx - 3 * s, by - 1.5 * s);
    ctx.lineTo(bx + 3 * s, by + 1.5 * s);
    ctx.moveTo(bx + 3 * s, by - 1.5 * s);
    ctx.lineTo(bx - 3 * s, by + 1.5 * s);
    ctx.stroke();
    ctx.fillStyle = boneL;
    for (const dx of [-3, 3]) {
      for (const dy of [-1.5, 1.5]) {
        ctx.beginPath();
        ctx.arc(bx + dx * s, by + dy * s, 0.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawBonePileFire(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  time: number,
  pulse: number,
  seedX: number,
): void {
  // Multiple fire columns rising from the bone pile
  const firePoints: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    idx: number;
    primary: "green" | "purple";
  }> = [
    { x: cx, y: cy - 22 * s, w: 9, h: 26, idx: 0, primary: "green" },
    { x: cx - 12 * s, y: cy - 8 * s, w: 6, h: 18, idx: 1, primary: "purple" },
    { x: cx + 11 * s, y: cy - 9 * s, w: 6, h: 17, idx: 2, primary: "green" },
    { x: cx - 6 * s, y: cy - 14 * s, w: 5, h: 15, idx: 3, primary: "purple" },
    { x: cx + 6 * s, y: cy - 13 * s, w: 5, h: 16, idx: 4, primary: "green" },
    { x: cx - 18 * s, y: cy - 2 * s, w: 4, h: 12, idx: 5, primary: "green" },
    { x: cx + 17 * s, y: cy - 3 * s, w: 4, h: 11, idx: 6, primary: "purple" },
  ];

  for (const fp of firePoints) {
    const fw = fp.w * s;
    const fh = fp.h * s;
    if (fp.primary === "green") {
      drawMultiFlame(
        ctx,
        fp.x,
        fp.y,
        fw,
        fh,
        time,
        fp.idx,
        `rgba(20,160,50,${0.25 + pulse * 0.2})`,
        `rgba(50,255,80,${0.4 + pulse * 0.3})`,
        `rgba(180,255,200,${0.55 + pulse * 0.25})`,
        "#33ff66",
        fh * 0.8,
      );
    } else {
      drawMultiFlame(
        ctx,
        fp.x,
        fp.y,
        fw,
        fh,
        time,
        fp.idx,
        `rgba(80,20,140,${0.25 + pulse * 0.2})`,
        `rgba(140,60,220,${0.4 + pulse * 0.3})`,
        `rgba(200,140,255,${0.55 + pulse * 0.25})`,
        "#aa55ff",
        fh * 0.8,
      );
    }
  }

  // Fire glow on the bones underneath
  setShadowBlur(ctx, 0, "transparent");
  const fireGlowGrad = ctx.createRadialGradient(
    cx,
    cy - 10 * s,
    2 * s,
    cx,
    cy - 10 * s,
    30 * s,
  );
  fireGlowGrad.addColorStop(0, `rgba(50,255,80,${0.12 + pulse * 0.08})`);
  fireGlowGrad.addColorStop(0.4, `rgba(140,80,220,${0.08 + pulse * 0.05})`);
  fireGlowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fireGlowGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10 * s, 30 * s, 16 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBonePileEmbers(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  time: number,
  seedX: number,
): void {
  for (let i = 0; i < 12; i++) {
    const phase = time * 2.5 + i * 1.3 + seedX * 0.5;
    const life = ((time * 0.8 + i * 0.7) % 3) / 3;
    if (life > 0.95) continue;
    const angle = (i / 12) * Math.PI * 2 + Math.sin(phase * 0.3) * 0.5;
    const dist = (8 + life * 22) * s;
    const ex = cx + Math.cos(angle) * dist + Math.sin(phase * 1.5) * 3 * s;
    const ey = cy - 5 * s - life * 35 * s + Math.sin(phase * 2) * 2 * s;
    const eAlpha = Math.max(0, (1 - life) * 0.6);
    const isGreen = i % 3 !== 2;
    ctx.fillStyle = isGreen
      ? `rgba(80,255,100,${eAlpha})`
      : `rgba(180,120,255,${eAlpha})`;
    ctx.beginPath();
    ctx.arc(ex, ey, (0.5 + (1 - life) * 0.8) * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// =========================================================================
// SUN OBELISK
// =========================================================================

export function renderSunObelisk(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s,
    time,
    seedX,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;

  if (!skipShadow) {
    const shRx = Math.min(50 * s, MAX_SHADOW_RX * z);
    const shRy = Math.min(22 * s, MAX_SHADOW_RY * z);
    const shGrad = ctx.createRadialGradient(
      cx + 5 * s,
      cy + 10 * s,
      0,
      cx + 5 * s,
      cy + 10 * s,
      shRx,
    );
    shGrad.addColorStop(0, "rgba(0,0,0,0.4)");
    shGrad.addColorStop(0.4, "rgba(0,0,0,0.15)");
    shGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(cx + 5 * s, cy + 10 * s, shRx, shRy, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (shadowOnly) return;

  const pulse = 0.5 + Math.sin(time * 1.8) * 0.3;

  // Sand dunes
  const sandGrad = ctx.createRadialGradient(
    cx,
    cy + 4 * s,
    4 * s,
    cx,
    cy + 4 * s,
    35 * s,
  );
  sandGrad.addColorStop(0, "#c4a55a");
  sandGrad.addColorStop(0.3, "#b89848");
  sandGrad.addColorStop(0.6, "#a88a3e");
  sandGrad.addColorStop(1, "rgba(180,148,60,0)");
  ctx.fillStyle = sandGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4 * s, 35 * s, 14 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sand ridges
  ctx.strokeStyle = "rgba(200,175,90,0.2)";
  ctx.lineWidth = 0.6 * s;
  for (let i = 0; i < 3; i++) {
    const ry = cy + 6 * s + i * 3 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 28 * s, ry);
    ctx.quadraticCurveTo(cx - 10 * s, ry - 2 * s, cx + 5 * s, ry + 1 * s);
    ctx.quadraticCurveTo(cx + 20 * s, ry - 1 * s, cx + 28 * s, ry + 2 * s);
    ctx.stroke();
  }

  // Obsidian stepped base
  drawIsometricPrism(
    ctx,
    cx,
    cy,
    26 * s,
    26 * s,
    4 * s,
    "#262626",
    "#080808",
    "#181818",
  );
  drawIsometricPrism(
    ctx,
    cx,
    cy - 4 * s,
    20 * s,
    20 * s,
    3 * s,
    "#2a2a2a",
    "#0c0c0c",
    "#1c1c1c",
  );

  // Gold trim
  ctx.strokeStyle = `rgba(220,180,60,${0.2 + pulse * 0.15})`;
  ctx.lineWidth = 0.6 * s;
  const bI = 26 * s * ISO_COS;
  const bD = 26 * s * ISO_SIN;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + bI, cy + bD);
  ctx.lineTo(cx, cy + bD * 2);
  ctx.lineTo(cx - bI, cy + bD);
  ctx.closePath();
  ctx.stroke();

  // Main obelisk body
  const soW = 10 * s;
  const soH = 75 * s;
  const soBase = cy - 7 * s;
  drawIsometricPrism(
    ctx,
    cx,
    soBase,
    soW,
    soW,
    soH,
    "#2c2c36",
    "#0c0c14",
    "#1c1c28",
  );

  // Polished obsidian sheen on left face
  const obsSheen = ctx.createLinearGradient(cx, soBase, cx, soBase - soH);
  obsSheen.addColorStop(0, "rgba(80,80,100,0.15)");
  obsSheen.addColorStop(0.3, "rgba(60,60,80,0.06)");
  obsSheen.addColorStop(0.7, "rgba(70,70,90,0.12)");
  obsSheen.addColorStop(1, "rgba(50,50,70,0)");
  prismFaceOverlay(ctx, cx, soBase, soW, soH, "left", obsSheen);

  const soI = soW * ISO_COS;
  const soD = soW * ISO_SIN;
  const soTop = soBase - soH;

  // Edge highlights
  ctx.strokeStyle = "rgba(60,60,80,0.3)";
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx - soI, soBase + soD);
  ctx.lineTo(cx - soI, soTop + soD);
  ctx.stroke();

  // Hieroglyphs on both faces
  setShadowBlur(ctx, 4 * s, "#ffaa00");
  for (let row = 0; row < 7; row++) {
    const ry = soBase - soH * ((row + 0.8) / 9);
    const glyphAlpha =
      0.25 + pulse * 0.4 + Math.sin(time * 1.5 + row * 0.5) * 0.1;
    ctx.fillStyle = `rgba(255,185,45,${glyphAlpha})`;
    const lx = cx - soI * 0.5;
    const ly = ry + soD * 0.8;
    if (row % 3 === 0) {
      ctx.beginPath();
      ctx.ellipse(lx, ly, 2 * s, 1 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lx, ly, 0.6 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (row % 3 === 1) {
      ctx.beginPath();
      ctx.ellipse(lx, ly - 1.5 * s, 1 * s, 1.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(lx - 0.4 * s, ly - 0.5 * s, 0.8 * s, 3 * s);
      ctx.fillRect(lx - 1.2 * s, ly + 0.3 * s, 2.4 * s, 0.6 * s);
    } else {
      ctx.beginPath();
      ctx.ellipse(lx, ly, 1.5 * s, 1 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(lx - 0.3 * s, ly - 1.5 * s, 0.6 * s, 1 * s);
    }
    const rx = cx + soI * 0.5;
    const ry2 = ry + soD * 1.2;
    if (row % 3 === 2) {
      ctx.beginPath();
      ctx.ellipse(rx, ry2, 2 * s, 1 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(rx - 1.5 * s, ry2 - 0.8 * s, 3 * s, 1.6 * s);
    }
  }
  clearShadow(ctx);

  // Pyramidion tip with gold cap
  drawIsometricPyramid(
    ctx,
    cx,
    soTop,
    soW + 3 * s,
    16 * s,
    "#3a3a44",
    "#0a0a14",
    "#2a2a34",
  );
  const capGrad = ctx.createLinearGradient(cx, soTop - 16 * s, cx, soTop);
  capGrad.addColorStop(0, `rgba(255,210,60,${0.4 + pulse * 0.25})`);
  capGrad.addColorStop(0.5, `rgba(220,170,40,${0.2 + pulse * 0.15})`);
  capGrad.addColorStop(1, "rgba(180,140,30,0)");
  ctx.fillStyle = capGrad;
  const capW = (soW + 3 * s) * ISO_COS;
  const capD2 = (soW + 3 * s) * ISO_SIN;
  ctx.beginPath();
  ctx.moveTo(cx, soTop - 16 * s + capD2);
  ctx.lineTo(cx + capW, soTop + capD2);
  ctx.lineTo(cx, soTop + capD2 * 2);
  ctx.lineTo(cx - capW, soTop + capD2);
  ctx.closePath();
  ctx.fill();

  // Radiant light from tip
  const tipY = soTop + soD - 16 * s;
  setShadowBlur(ctx, 22 * s, "#ffcc00");
  const tipGlow = ctx.createRadialGradient(cx, tipY, 0, cx, tipY, 22 * s);
  tipGlow.addColorStop(0, `rgba(255,210,50,${0.5 + pulse * 0.3})`);
  tipGlow.addColorStop(0.3, `rgba(255,170,30,${0.25 + pulse * 0.15})`);
  tipGlow.addColorStop(0.7, `rgba(255,130,10,${0.08 + pulse * 0.05})`);
  tipGlow.addColorStop(1, "rgba(255,100,0,0)");
  ctx.fillStyle = tipGlow;
  ctx.beginPath();
  ctx.arc(cx, tipY, 22 * s, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Sun rays
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + time * 0.25;
    const rayLen = (8 + Math.sin(time * 2.5 + i * 0.8) * 5) * s;
    const rayAlpha = 0.1 + pulse * 0.18 + Math.sin(time * 3 + i) * 0.06;
    ctx.strokeStyle = `rgba(255,200,60,${rayAlpha})`;
    ctx.lineWidth = (0.6 + Math.sin(i * 1.3) * 0.3) * s;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 5 * s, tipY + Math.sin(angle) * 3 * s);
    ctx.lineTo(
      cx + Math.cos(angle) * (5 * s + rayLen),
      tipY + Math.sin(angle) * (3 * s + rayLen * 0.5),
    );
    ctx.stroke();
  }

  // Sphinx guardians
  for (const side of [-1, 1]) {
    const spx = cx + side * 18 * s;
    const spy = cy + side * 8 * s;
    // Body
    const spBodyGr = ctx.createLinearGradient(
      spx - 5 * s,
      spy,
      spx + 5 * s,
      spy + 4 * s,
    );
    spBodyGr.addColorStop(0, "#a08850");
    spBodyGr.addColorStop(0.5, "#8a7440");
    spBodyGr.addColorStop(1, "#6a5a30");
    ctx.fillStyle = spBodyGr;
    ctx.beginPath();
    ctx.moveTo(spx - 5 * s * side, spy + 1 * s);
    ctx.lineTo(spx + 1 * s * side, spy - 2 * s);
    ctx.lineTo(spx + 6 * s * side, spy + 1 * s);
    ctx.lineTo(spx + 7 * s * side, spy + 4 * s);
    ctx.lineTo(spx - 6 * s * side, spy + 4 * s);
    ctx.closePath();
    ctx.fill();
    // Head with headdress
    ctx.fillStyle = "#b09860";
    ctx.beginPath();
    ctx.arc(spx + 0.5 * s * side, spy - 2.5 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c4aa70";
    ctx.beginPath();
    ctx.arc(spx + 0.5 * s * side, spy - 3 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();
    // Gold headdress stripe
    ctx.strokeStyle = `rgba(220,180,60,${0.3 + pulse * 0.15})`;
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.arc(
      spx + 0.5 * s * side,
      spy - 3.5 * s,
      2 * s,
      Math.PI * 0.8,
      Math.PI * 0.2,
    );
    ctx.stroke();
    // Eyes with glow
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.ellipse(
      spx + (0.5 - 0.6 * side) * s,
      spy - 2.8 * s,
      0.4 * s,
      0.5 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.ellipse(
      spx + (0.5 + 0.6 * side) * s,
      spy - 2.8 * s,
      0.4 * s,
      0.5 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = `rgba(255,210,60,${0.2 + pulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(
      spx + (0.5 - 0.6 * side) * s,
      spy - 2.8 * s,
      0.3 * s,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      spx + (0.5 + 0.6 * side) * s,
      spy - 2.8 * s,
      0.3 * s,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Paws
    ctx.fillStyle = "#8a7440";
    ctx.beginPath();
    ctx.moveTo(spx + 6 * s * side, spy + 4 * s);
    ctx.lineTo(spx + 8 * s * side, spy + 3 * s);
    ctx.lineTo(spx + 8 * s * side, spy + 5 * s);
    ctx.lineTo(spx + 6 * s * side, spy + 5 * s);
    ctx.closePath();
    ctx.fill();
  }

  // Turquoise gem accents
  setShadowBlur(ctx, 4 * s, "#00ccaa");
  [
    { x: cx - bI * 0.5, y: cy - 2 * s },
    { x: cx + bI * 0.5, y: cy - 2 * s },
    { x: cx, y: cy + bD - 2 * s },
    { x: cx, y: cy - bD - 2 * s },
  ].forEach(({ x: gx, y: gy }) => {
    ctx.fillStyle = `rgba(0,200,170,${0.3 + pulse * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(gx, gy - 1.5 * s);
    ctx.lineTo(gx + 1.2 * s, gy);
    ctx.lineTo(gx, gy + 1 * s);
    ctx.lineTo(gx - 1.2 * s, gy);
    ctx.closePath();
    ctx.fill();
  });
  clearShadow(ctx);

  // Sand drift
  ctx.fillStyle = "rgba(190,160,80,0.25)";
  ctx.beginPath();
  ctx.moveTo(cx + soI + 1 * s, soBase + soD);
  ctx.quadraticCurveTo(
    cx + soI + 6 * s,
    soBase + soD + 2 * s,
    cx + soI + 10 * s,
    soBase + soD + 4 * s,
  );
  ctx.lineTo(cx + soI + 1 * s, soBase + soD + 4 * s);
  ctx.closePath();
  ctx.fill();

  // Gold dust particles
  for (let gp = 0; gp < 5; gp++) {
    const gpPh = time * 0.9 + gp * 1.3;
    const gpAlpha = 0.15 + Math.sin(gpPh * 1.5) * 0.1;
    if (gpAlpha > 0.08) {
      const gpX = cx + Math.sin(gpPh * 0.4) * 18 * s;
      const gpY = soBase - soH * 0.3 - Math.abs(Math.sin(gpPh * 0.6)) * 30 * s;
      ctx.fillStyle = `rgba(255,210,80,${gpAlpha})`;
      ctx.beginPath();
      ctx.arc(gpX, gpY, 0.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Heat shimmer
  for (let i = 0; i < 5; i++) {
    const shimmerPh = time * 1.5 + i * 1.3;
    const shimmerA = 0.06 + Math.sin(shimmerPh) * 0.05;
    const shY = cy - 15 * s - i * 14 * s;
    const shX = cx + Math.sin(shimmerPh * 0.7) * 10 * s;
    ctx.fillStyle = `rgba(255,200,100,${shimmerA})`;
    ctx.beginPath();
    ctx.ellipse(shX, shY, 14 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// =========================================================================
// FROST CITADEL
// =========================================================================

export function renderFrostCitadel(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: rawCy,
    s,
    time,
    seedX,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const cy = rawCy - 18 * s;

  if (!skipShadow) {
    const shRx = Math.min(45 * s, MAX_SHADOW_RX * z);
    const shRy = Math.min(20 * s, MAX_SHADOW_RY * z);
    const shGrad = ctx.createRadialGradient(
      cx + 4 * s,
      cy + 12 * s,
      0,
      cx + 4 * s,
      cy + 12 * s,
      shRx,
    );
    shGrad.addColorStop(0, "rgba(0,20,60,0.45)");
    shGrad.addColorStop(0.4, "rgba(0,10,35,0.2)");
    shGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(cx + 4 * s, cy + 12 * s, shRx, shRy, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (shadowOnly) return;

  const pulse = 0.5 + Math.sin(time * 1.6) * 0.25;
  const fcBlack = "#060610";
  const fcDark = "#0e0e1c";
  const fcMid = "#181830";
  const fcLight = "#282848";
  const fcEdge = "#383860";
  const fcVein = "#3388ff";

  // Frozen ground
  const frostGrad = ctx.createRadialGradient(
    cx,
    cy + 3 * s,
    6 * s,
    cx,
    cy + 3 * s,
    38 * s,
  );
  frostGrad.addColorStop(0, "rgba(140,200,240,0.3)");
  frostGrad.addColorStop(0.3, "rgba(110,170,220,0.15)");
  frostGrad.addColorStop(0.6, "rgba(80,130,190,0.06)");
  frostGrad.addColorStop(1, "rgba(60,100,150,0)");
  ctx.fillStyle = frostGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 3 * s, 38 * s, 17 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Frost crack lines
  ctx.strokeStyle = "rgba(160,210,240,0.12)";
  ctx.lineWidth = 0.5 * s;
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 + 0.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * 10 * s, cy + Math.sin(ang) * 5 * s);
    ctx.lineTo(cx + Math.cos(ang) * 30 * s, cy + Math.sin(ang) * 14 * s);
    ctx.stroke();
  }

  // Fortress base platform
  const fcWallH = 8 * s;
  const fcBaseW = 28 * s;
  drawIsometricPrism(
    ctx,
    cx,
    cy,
    fcBaseW,
    fcBaseW,
    fcWallH,
    fcMid,
    fcBlack,
    fcDark,
  );
  const fcWI = fcBaseW * ISO_COS;
  const fcWD = fcBaseW * ISO_SIN;

  // Blue energy veins on walls
  setShadowBlur(ctx, 4 * s, fcVein);
  ctx.lineWidth = 0.7 * s;
  for (let i = 0; i < 3; i++) {
    const t = (i + 0.4) / 3;
    const vx = cx - fcWI * (1 - t * 0.85);
    const vy = cy + fcWD * (2 * t - 1) - 1 * s;
    ctx.strokeStyle = `rgba(51,136,255,${0.25 + pulse * 0.3 + Math.sin(time * 2 + i) * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(vx + 1 * s, vy + 4 * s);
    ctx.lineTo(vx - 1 * s, vy - 3 * s);
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const t = (i + 0.4) / 3;
    const vx = cx + fcWI * t * 0.85;
    const vy = cy + fcWD * (1 - 2 * t);
    ctx.strokeStyle = `rgba(51,136,255,${0.2 + pulse * 0.25 + Math.cos(time * 2.2 + i) * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(vx - 1 * s, vy + 4 * s);
    ctx.lineTo(vx, vy - 3 * s);
    ctx.stroke();
  }
  clearShadow(ctx);

  // Battlement rim
  const fcWallTopY = cy - fcWallH;
  drawIsometricPrism(
    ctx,
    cx,
    fcWallTopY,
    fcBaseW + 2 * s,
    fcBaseW + 2 * s,
    1.5 * s,
    fcEdge,
    fcMid,
    fcLight,
  );

  // Frozen waterfall streaks
  ctx.lineWidth = 1.5 * s;
  ctx.strokeStyle = "rgba(130,195,240,0.2)";
  ctx.beginPath();
  ctx.moveTo(cx - fcWI * 0.5, cy + fcWD * 0.3 - fcWallH + 1 * s);
  ctx.quadraticCurveTo(
    cx - fcWI * 0.48,
    cy + fcWD * 0.4,
    cx - fcWI * 0.53,
    cy + fcWD * 0.5 + 3 * s,
  );
  ctx.stroke();

  // Flanking spires
  const fcFlankBase = fcWallTopY - 1.5 * s;
  const drawFlankSpire = (side: number) => {
    const fsx = cx + side * fcWI * 0.6;
    const fsy = fcFlankBase - side * fcWD * 0.6;
    const fsW = 7 * s;
    const fsH = 38 * s;
    drawIsometricPrism(ctx, fsx, fsy, fsW, fsW, fsH, fcLight, fcBlack, fcDark);
    const fsTop = fsy - fsH;
    drawIsometricPyramid(
      ctx,
      fsx,
      fsTop,
      fsW * 0.5,
      14 * s,
      fcEdge,
      fcBlack,
      fcMid,
    );

    // Spire energy vein
    setShadowBlur(ctx, 3 * s, fcVein);
    ctx.strokeStyle = `rgba(51,136,255,${0.15 + pulse * 0.2})`;
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.moveTo(fsx, fsy + fsW * 0.25);
    ctx.lineTo(fsx + side * 0.5 * s, fsy - fsH * 0.5);
    ctx.stroke();
    clearShadow(ctx);

    // Aurora glow at peak
    const peakY = fsTop - 14 * s;
    const auroraPh = time * 1.2 + side * 0.8;
    const aHue = 200 + Math.sin(auroraPh) * 40;
    setShadowBlur(ctx, 10 * s, `hsl(${aHue}, 80%, 60%)`);
    const peakGlow = ctx.createRadialGradient(fsx, peakY, 0, fsx, peakY, 5 * s);
    peakGlow.addColorStop(0, `rgba(100,180,255,${0.35 + pulse * 0.2})`);
    peakGlow.addColorStop(1, "rgba(80,140,255,0)");
    ctx.fillStyle = peakGlow;
    ctx.beginPath();
    ctx.arc(fsx, peakY, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
  };

  drawFlankSpire(-1);

  // Central main spire
  const fcSpireW = 10 * s;
  const fcSpireH = 62 * s;
  drawIsometricPrism(
    ctx,
    cx,
    fcFlankBase,
    fcSpireW,
    fcSpireW,
    fcSpireH,
    fcLight,
    fcBlack,
    fcDark,
  );

  // Sheen overlay on central spire
  const spireSheen = ctx.createLinearGradient(
    cx,
    fcFlankBase,
    cx,
    fcFlankBase - fcSpireH,
  );
  spireSheen.addColorStop(0, "rgba(40,40,80,0.15)");
  spireSheen.addColorStop(0.5, "rgba(30,30,60,0.06)");
  spireSheen.addColorStop(1, "rgba(50,50,90,0.1)");
  prismFaceOverlay(
    ctx,
    cx,
    fcFlankBase,
    fcSpireW,
    fcSpireH,
    "left",
    spireSheen,
  );

  // Energy veins on central spire
  setShadowBlur(ctx, 3 * s, fcVein);
  ctx.strokeStyle = `rgba(51,136,255,${0.2 + pulse * 0.2})`;
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(cx, fcFlankBase + fcSpireW * 0.25);
  ctx.lineTo(cx - 1 * s, fcFlankBase - fcSpireH * 0.4);
  ctx.lineTo(cx + 0.5 * s, fcFlankBase - fcSpireH * 0.7);
  ctx.stroke();
  clearShadow(ctx);

  const fcSpireTop = fcFlankBase - fcSpireH;
  drawIsometricPyramid(
    ctx,
    cx,
    fcSpireTop,
    fcSpireW * 0.6,
    20 * s,
    fcEdge,
    fcBlack,
    fcMid,
  );

  // Main spire aurora orb
  const mainPeakY = fcSpireTop - 20 * s;
  const auroraPhase = time * 0.8;
  const auroraHue = 200 + Math.sin(auroraPhase) * 50;
  setShadowBlur(ctx, 20 * s, `hsl(${auroraHue}, 85%, 55%)`);
  const auroraGrad = ctx.createRadialGradient(
    cx,
    mainPeakY,
    0,
    cx,
    mainPeakY,
    14 * s,
  );
  auroraGrad.addColorStop(0, `rgba(100,200,255,${0.45 + pulse * 0.25})`);
  auroraGrad.addColorStop(0.3, `rgba(120,170,255,${0.2 + pulse * 0.12})`);
  auroraGrad.addColorStop(0.7, `rgba(100,140,255,${0.06 + pulse * 0.04})`);
  auroraGrad.addColorStop(1, "rgba(80,120,255,0)");
  ctx.fillStyle = auroraGrad;
  ctx.beginPath();
  ctx.arc(cx, mainPeakY, 14 * s, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  drawFlankSpire(1);

  // Aurora curtain wisps
  for (let i = 0; i < 4; i++) {
    const wPh = time * 0.5 + i * 1.6;
    const wy = mainPeakY - 4 * s - i * 7 * s;
    const wSpread = (14 + i * 6) * s;
    const wAlpha = 0.08 + pulse * 0.1 - i * 0.015;
    const wHue = 200 + Math.sin(wPh + i) * 30;
    ctx.strokeStyle = `hsla(${wHue},70%,65%,${wAlpha})`;
    ctx.lineWidth = (1.5 - i * 0.2) * s;
    ctx.beginPath();
    ctx.moveTo(cx - wSpread, wy + Math.sin(wPh) * 3 * s);
    ctx.quadraticCurveTo(
      cx,
      wy - 4 * s + Math.cos(wPh * 1.3) * 3 * s,
      cx + wSpread,
      wy + Math.sin(wPh + 1) * 3 * s,
    );
    ctx.stroke();
  }

  // Ice particle flurry
  for (let i = 0; i < 6; i++) {
    const iPh = time * 1.8 + i * 1.1 + seedX;
    const iAlpha = 0.2 + Math.sin(iPh * 2) * 0.2;
    if (iAlpha > 0.1) {
      const ix = cx + Math.sin(iPh * 0.5) * 35 * s;
      const iy = cy - 30 * s - ((time * 8 + i * 12) % 45) * s;
      ctx.fillStyle = `rgba(200,230,255,${iAlpha})`;
      ctx.beginPath();
      ctx.arc(ix, iy, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// =========================================================================
// INFERNAL GATE
// =========================================================================

export function renderInfernalGate(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s,
    time,
    seedX,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;

  // Flipped over Y axis: right pillar is now the "near" one (lower/right),
  // left pillar is the "far" one (upper/left)
  const flip = 1;

  if (!skipShadow) {
    const shRx = Math.min(60 * s, MAX_SHADOW_RX * z);
    const shRy = Math.min(28 * s, MAX_SHADOW_RY * z);
    const shGrad = ctx.createRadialGradient(
      cx,
      cy + 12 * s,
      0,
      cx,
      cy + 12 * s,
      shRx,
    );
    shGrad.addColorStop(0, "rgba(20,0,40,0.45)");
    shGrad.addColorStop(0.3, "rgba(0,0,0,0.35)");
    shGrad.addColorStop(0.6, "rgba(0,0,0,0.12)");
    shGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12 * s, shRx, shRy, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (shadowOnly) return;

  const pulse = 0.5 + Math.sin(time * 2.0) * 0.28;
  const obsCore = "#0a0a14";
  const obsDk = "#101020";
  const obsMd = "#1c1c30";
  const obsLt = "#2a2a42";
  const obsSheen = "#363650";

  // --- Corrupted ground with dark energy ---
  drawInfernalGround(ctx, cx, cy, s, pulse);

  // --- Obsidian foundation (wide stepped base) ---
  drawInfernalFoundation(
    ctx,
    cx,
    cy,
    s,
    time,
    pulse,
    obsCore,
    obsDk,
    obsMd,
    obsLt,
    obsSheen,
  );

  // Rune circle on the platform
  drawInfernalRuneCircle(ctx, cx, cy - 14 * s, s, time, pulse);

  // --- Twin obsidian pillars (flipped) ---
  const pW = 12 * s;
  const pH = 70 * s;
  const foundationH = 14 * s;
  const pillarOff = 18 * s;
  const lPx = cx + flip * pillarOff;
  const lPy = cy - foundationH - flip * pillarOff * ISO_Y_RATIO;
  const rPx = cx - flip * pillarOff;
  const rPy = cy - foundationH + flip * pillarOff * ISO_Y_RATIO;

  // Back pillar first (further from viewer)
  drawInfernalPillar(
    ctx,
    lPx,
    lPy,
    pW,
    pH,
    s,
    time,
    pulse,
    obsLt,
    obsMd,
    obsDk,
    obsCore,
  );
  // Front pillar
  drawInfernalPillar(
    ctx,
    rPx,
    rPy,
    pW,
    pH,
    s,
    time,
    pulse,
    obsLt,
    obsMd,
    obsDk,
    obsCore,
  );

  // --- Archway connecting pillars ---
  const archTopL = lPy - pH;
  const archTopR = rPy - pH;
  const archMidX = (lPx + rPx) / 2;
  const archMidY = (archTopL + archTopR) / 2 - 12 * s;

  drawInfernalArch(
    ctx,
    lPx,
    archTopL,
    rPx,
    archTopR,
    archMidX,
    archMidY,
    pW,
    s,
    time,
    pulse,
  );

  // --- Portal void inside the arch ---
  const portalCx = archMidX;
  const portalCy = archMidY + 22 * s;
  drawObsidianPortal(ctx, portalCx, portalCy, s, time, pulse);

  // --- Chains draped across pillars and arch ---
  drawInfernalChains(ctx, lPx, lPy, rPx, rPy, pH, s, time);

  // --- Vines creeping over the structure ---
  drawInfernalVines(
    ctx,
    lPx,
    lPy,
    rPx,
    rPy,
    archMidX,
    archMidY,
    pH,
    s,
    time,
    seedX,
  );

  // --- Ambient particles ---
  drawInfernalParticles(ctx, cx, cy, portalCy, s, time, seedX, pulse);
}

function drawInfernalFoundation(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  time: number,
  pulse: number,
  obsCore: string,
  obsDk: string,
  obsMd: string,
  obsLt: string,
  obsSheen: string,
): void {
  // Tier 1: Wide base slab
  drawIsometricPrism(ctx, cx, cy, 48 * s, 48 * s, 4 * s, obsMd, obsDk, obsCore);
  // Beveled edge detail on tier 1
  const t1I = 48 * s * ISO_COS;
  const t1D = 48 * s * ISO_SIN;
  ctx.strokeStyle = obsSheen;
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx - t1I, cy - 4 * s + t1D);
  ctx.lineTo(cx, cy - 4 * s + t1D * 2);
  ctx.lineTo(cx + t1I, cy - 4 * s + t1D);
  ctx.stroke();

  // Tier 2: Inset step
  drawIsometricPrism(
    ctx,
    cx,
    cy - 4 * s,
    42 * s,
    42 * s,
    4 * s,
    obsLt,
    obsMd,
    obsDk,
  );
  const t2I = 42 * s * ISO_COS;
  const t2D = 42 * s * ISO_SIN;
  ctx.strokeStyle = "rgba(60,60,90,0.15)";
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.moveTo(cx - t2I, cy - 8 * s + t2D);
  ctx.lineTo(cx, cy - 8 * s + t2D * 2);
  ctx.lineTo(cx + t2I, cy - 8 * s + t2D);
  ctx.stroke();

  // Tier 3: Inner platform where pillars sit
  drawIsometricPrism(
    ctx,
    cx,
    cy - 8 * s,
    36 * s,
    36 * s,
    6 * s,
    obsLt,
    obsMd,
    obsDk,
  );

  // Obsidian sheen overlays on the inner platform faces
  const platSheen = ctx.createLinearGradient(cx, cy - 8 * s, cx, cy - 14 * s);
  platSheen.addColorStop(0, "rgba(50,50,80,0.12)");
  platSheen.addColorStop(0.5, "rgba(40,40,65,0.04)");
  platSheen.addColorStop(1, "rgba(55,55,85,0.1)");
  prismFaceOverlay(ctx, cx, cy - 8 * s, 36 * s, 6 * s, "left", platSheen);
  prismFaceOverlay(ctx, cx, cy - 8 * s, 36 * s, 6 * s, "right", platSheen);

  // Carved rune grooves on the base faces
  const t3I = 36 * s * ISO_COS;
  const t3D = 36 * s * ISO_SIN;
  ctx.strokeStyle = `rgba(120,50,180,${0.06 + pulse * 0.04})`;
  ctx.lineWidth = 0.4 * s;
  for (let i = 0; i < 3; i++) {
    const t = (i + 0.5) / 3;
    // Left face runes
    const lx = cx - t3I * (1 - t);
    const ly = cy - 8 * s + t3D * (2 * t);
    ctx.beginPath();
    ctx.moveTo(lx, ly - 1.5 * s);
    ctx.lineTo(lx + 1 * s, ly - 3.5 * s);
    ctx.lineTo(lx - 1 * s, ly - 5 * s);
    ctx.stroke();
    // Right face runes
    const rx = cx + t3I * t;
    const ry = cy - 8 * s + t3D * (2 - 2 * t);
    ctx.beginPath();
    ctx.moveTo(rx, ry - 1.5 * s);
    ctx.lineTo(rx - 1 * s, ry - 3.5 * s);
    ctx.lineTo(rx + 1 * s, ry - 5 * s);
    ctx.stroke();
  }

  // Corner skull ornaments on tier 2 edges
  const cornerSkulls: Array<{ x: number; y: number; f: number }> = [
    { x: cx - t2I, y: cy - 8 * s + t2D - 2 * s, f: 1 },
    { x: cx + t2I, y: cy - 8 * s + t2D - 2 * s, f: -1 },
    { x: cx, y: cy - 8 * s + t2D * 2 - 2 * s, f: 1 },
    { x: cx, y: cy - 8 * s - 2 * s, f: -1 },
  ];
  for (const csk of cornerSkulls) {
    drawIsoSkull3D(
      ctx,
      csk.x,
      csk.y,
      2.5 * s,
      csk.f,
      "#b0a090",
      "#908070",
      "#605040",
      "#aa44ff",
      0.15 + pulse * 0.15,
    );
  }
}

function drawInfernalGround(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  pulse: number,
): void {
  const groundGrad = ctx.createRadialGradient(cx, cy, 6 * s, cx, cy, 52 * s);
  groundGrad.addColorStop(0, `rgba(40,10,60,${0.4 + pulse * 0.1})`);
  groundGrad.addColorStop(0.25, "rgba(25,8,35,0.3)");
  groundGrad.addColorStop(0.5, "rgba(10,5,15,0.15)");
  groundGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = groundGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 52 * s, 24 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark energy cracks
  ctx.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * Math.PI * 2 + 0.4;
    const crackLen = (22 + Math.sin(i * 2.7) * 8) * s;
    ctx.strokeStyle = `rgba(120,40,180,${0.06 + pulse * 0.04})`;
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * 16 * s, cy + Math.sin(ang) * 7 * s);
    ctx.quadraticCurveTo(
      cx + Math.cos(ang + 0.1) * crackLen * 0.6,
      cy + Math.sin(ang + 0.1) * crackLen * 0.28,
      cx + Math.cos(ang) * crackLen,
      cy + Math.sin(ang) * crackLen * 0.45,
    );
    ctx.stroke();
  }
}

function drawInfernalRuneCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  time: number,
  pulse: number,
): void {
  setShadowBlur(ctx, 5 * s, "#8833cc");
  ctx.strokeStyle = `rgba(130,50,200,${0.12 + pulse * 0.12})`;
  ctx.lineWidth = 0.7 * s;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 22 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + time * 0.08;
    const rx = cx + Math.cos(angle) * 22 * s;
    const ry = cy + Math.sin(angle) * 10 * s;
    ctx.fillStyle = `rgba(160,70,240,${0.2 + pulse * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(rx, ry - 1.8 * s);
    ctx.lineTo(rx + 1.2 * s, ry);
    ctx.lineTo(rx, ry + 1.2 * s);
    ctx.lineTo(rx - 1.2 * s, ry);
    ctx.closePath();
    ctx.fill();
  }
  clearShadow(ctx);
}

function drawInfernalPillar(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  pW: number,
  pH: number,
  s: number,
  time: number,
  pulse: number,
  obsLt: string,
  obsMd: string,
  obsDk: string,
  obsCore: string,
): void {
  // Pillar base plinth (wider footing)
  drawIsometricPrism(
    ctx,
    px,
    py,
    pW + 4 * s,
    pW + 4 * s,
    3 * s,
    obsMd,
    obsDk,
    obsCore,
  );
  // Main pillar body
  drawIsometricPrism(
    ctx,
    px,
    py - 3 * s,
    pW,
    pW,
    pH - 3 * s,
    obsLt,
    obsDk,
    obsCore,
  );

  // Obsidian reflective sheen
  const sheen = ctx.createLinearGradient(px, py - 3 * s, px, py - pH);
  sheen.addColorStop(0, "rgba(50,50,80,0.15)");
  sheen.addColorStop(0.3, "rgba(40,40,65,0.05)");
  sheen.addColorStop(0.6, "rgba(60,60,90,0.1)");
  sheen.addColorStop(1, "rgba(50,50,80,0.08)");
  prismFaceOverlay(ctx, px, py - 3 * s, pW, pH - 3 * s, "left", sheen);

  // Horizontal carved bands on pillar
  const pI = pW * ISO_COS;
  const pD = pW * ISO_SIN;
  ctx.strokeStyle = "rgba(60,60,100,0.12)";
  ctx.lineWidth = 0.4 * s;
  for (const bandFrac of [0.2, 0.4, 0.6, 0.8]) {
    const bandY = py - 3 * s - (pH - 3 * s) * bandFrac;
    ctx.beginPath();
    ctx.moveTo(px - pI, bandY + pD);
    ctx.lineTo(px, bandY + pD * 2);
    ctx.lineTo(px + pI, bandY + pD);
    ctx.stroke();
  }

  // Skull ornaments on pillar faces (3 per pillar, well-spaced)
  setShadowBlur(ctx, 3 * s, "#9944dd");
  for (let i = 0; i < 3; i++) {
    const skullY = py - 3 * s - (pH - 3 * s) * ((i + 1) / 4);
    drawIsoSkull3D(
      ctx,
      px,
      skullY + pD * 2,
      3.2 * s,
      1,
      "#b8a898",
      "#988878",
      "#685848",
      "#aa44ff",
      0.25 + pulse * 0.35,
    );
  }
  clearShadow(ctx);

  // Obsidian spike cap
  drawIsometricPyramid(
    ctx,
    px,
    py - pH,
    pW * 0.45,
    18 * s,
    obsLt,
    obsDk,
    obsMd,
  );
  ctx.fillStyle = `rgba(130,50,200,${0.12 + pulse * 0.12})`;
  ctx.beginPath();
  ctx.arc(px, py - pH + pW * 0.45 * ISO_SIN - 18 * s, 1.8 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawInfernalArch(
  ctx: CanvasRenderingContext2D,
  lPx: number,
  archTopL: number,
  rPx: number,
  archTopR: number,
  archMidX: number,
  archMidY: number,
  _pW: number,
  s: number,
  _time: number,
  pulse: number,
): void {
  // Thick arch body
  const archGrad = ctx.createLinearGradient(lPx, archTopL, rPx, archTopR);
  archGrad.addColorStop(0, "#181830");
  archGrad.addColorStop(0.3, "#222240");
  archGrad.addColorStop(0.5, "#2a2a4a");
  archGrad.addColorStop(0.7, "#222240");
  archGrad.addColorStop(1, "#181830");

  // Outer arch
  ctx.fillStyle = archGrad;
  ctx.beginPath();
  ctx.moveTo(lPx, archTopL + 2 * s);
  ctx.quadraticCurveTo(archMidX, archMidY - 4 * s, rPx, archTopR + 2 * s);
  ctx.lineTo(rPx, archTopR + 14 * s);
  ctx.quadraticCurveTo(archMidX, archMidY + 12 * s, lPx, archTopL + 14 * s);
  ctx.closePath();
  ctx.fill();

  // Inner arch cutout (darker)
  ctx.fillStyle = "#06060e";
  ctx.beginPath();
  ctx.moveTo(lPx + 4 * s, archTopL + 8 * s);
  ctx.quadraticCurveTo(
    archMidX,
    archMidY + 4 * s,
    rPx - 4 * s,
    archTopR + 8 * s,
  );
  ctx.lineTo(rPx - 4 * s, archTopR + 12 * s);
  ctx.quadraticCurveTo(
    archMidX,
    archMidY + 10 * s,
    lPx + 4 * s,
    archTopL + 12 * s,
  );
  ctx.closePath();
  ctx.fill();

  // Purple energy trim on arch edge
  setShadowBlur(ctx, 5 * s, "#8833cc");
  ctx.strokeStyle = `rgba(140,60,220,${0.15 + pulse * 0.15})`;
  ctx.lineWidth = 0.9 * s;
  ctx.beginPath();
  ctx.moveTo(lPx, archTopL + 4 * s);
  ctx.quadraticCurveTo(archMidX, archMidY - 2 * s, rPx, archTopR + 4 * s);
  ctx.stroke();
  clearShadow(ctx);

  // Keystone skull (large, centered)
  const ksX = archMidX;
  const ksY = archMidY + 1 * s;
  drawIsoSkull3D(ctx, ksX, ksY, 5 * s, 1, "#c0b0a0", "#a09080", "#706050");
  setShadowBlur(ctx, 4 * s, "#aa44ff");
  ctx.fillStyle = `rgba(160,60,240,${0.45 + pulse * 0.4})`;
  const ksEyeOff = 5 * 0.36 * s;
  ctx.beginPath();
  ctx.arc(ksX - ksEyeOff, ksY + 5 * 0.04 * s, 0.9 * s, 0, Math.PI * 2);
  ctx.arc(ksX + ksEyeOff, ksY + 5 * 0.04 * s, 0.9 * s, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Smaller skulls flanking keystone
  for (const sx of [-8, 8]) {
    const flanky = ksY + Math.abs(sx) * 0.3 * s;
    drawIsoSkull3D(
      ctx,
      ksX + sx * s,
      flanky,
      2.8 * s,
      sx < 0 ? 1 : -1,
      "#b0a090",
      "#908070",
      "#605040",
      "#aa44ff",
      0.2 + pulse * 0.25,
    );
  }
}

function drawObsidianPortal(
  ctx: CanvasRenderingContext2D,
  portalCx: number,
  portalCy: number,
  s: number,
  time: number,
  pulse: number,
): void {
  // Deep void gradient
  const voidGrad = ctx.createRadialGradient(
    portalCx,
    portalCy,
    0,
    portalCx,
    portalCy,
    15 * s,
  );
  voidGrad.addColorStop(0, `rgba(60,0,100,${0.7 + pulse * 0.25})`);
  voidGrad.addColorStop(0.2, `rgba(40,0,70,${0.6 + pulse * 0.2})`);
  voidGrad.addColorStop(0.5, `rgba(20,0,40,${0.4 + pulse * 0.15})`);
  voidGrad.addColorStop(0.8, `rgba(8,0,16,${0.2 + pulse * 0.08})`);
  voidGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.ellipse(portalCx, portalCy, 14 * s, 17 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swirling energy tendrils
  setShadowBlur(ctx, 6 * s, "#aa44ff");
  for (let i = 0; i < 6; i++) {
    const swirlAng = time * 1.2 + i * ((Math.PI * 2) / 6);
    const sr1 = 3 * s;
    const sr2 = 12 * s;
    const alpha = 0.15 + pulse * 0.15;
    ctx.strokeStyle =
      i % 2 === 0
        ? `rgba(160,60,240,${alpha})`
        : `rgba(100,180,255,${alpha * 0.7})`;
    ctx.lineWidth = (0.8 + Math.sin(time * 3 + i) * 0.3) * s;
    ctx.beginPath();
    ctx.moveTo(
      portalCx + Math.cos(swirlAng) * sr1,
      portalCy + Math.sin(swirlAng) * sr1 * 1.3,
    );
    ctx.quadraticCurveTo(
      portalCx + Math.cos(swirlAng + 0.7) * sr2 * 0.65,
      portalCy + Math.sin(swirlAng + 0.7) * sr2 * 1.05,
      portalCx + Math.cos(swirlAng + 1.4) * sr2,
      portalCy + Math.sin(swirlAng + 1.4) * sr2 * 1.3,
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // Distortion rings
  setShadowBlur(ctx, 4 * s, "#7722bb");
  for (let ring = 0; ring < 4; ring++) {
    const rPhase = time * 1.5 + ring * 0.7;
    const rR = (4 + ring * 3.5) * s;
    const rAlpha = 0.1 + pulse * 0.08 - ring * 0.02;
    ctx.strokeStyle = `rgba(140,60,220,${rAlpha})`;
    ctx.lineWidth = (0.6 - ring * 0.1) * s;
    ctx.beginPath();
    ctx.ellipse(
      portalCx,
      portalCy,
      rR + Math.sin(rPhase) * 1.5 * s,
      rR * 1.25 + Math.cos(rPhase) * 1.5 * s,
      rPhase * 0.15,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // Bright core
  ctx.fillStyle = `rgba(200,140,255,${0.15 + pulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(portalCx, portalCy, 3.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(240,220,255,${0.08 + pulse * 0.1})`;
  ctx.beginPath();
  ctx.arc(portalCx, portalCy, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawInfernalChains(
  ctx: CanvasRenderingContext2D,
  lPx: number,
  lPy: number,
  rPx: number,
  rPy: number,
  pH: number,
  s: number,
  time: number,
): void {
  // Two chain catenary curves between pillars at different heights
  const chainConfigs = [
    { heightFrac: 0.35, sag: 14, thickness: 0.9 },
    { heightFrac: 0.6, sag: 10, thickness: 0.75 },
  ];

  for (const cfg of chainConfigs) {
    const startY = lPy - pH * cfg.heightFrac;
    const endY = rPy - pH * cfg.heightFrac;
    const sag = cfg.sag * s;
    const sway = Math.sin(time * 0.7) * 2 * s;

    ctx.lineWidth = cfg.thickness * s;
    for (let seg = 0; seg < 10; seg++) {
      const t1 = seg / 10;
      const t2 = (seg + 1) / 10;
      const x1 = lPx + (rPx - lPx) * t1;
      const y1 =
        startY +
        (endY - startY) * t1 +
        Math.sin(t1 * Math.PI) * sag +
        sway * t1;
      const x2 = lPx + (rPx - lPx) * t2;
      const y2 =
        startY +
        (endY - startY) * t2 +
        Math.sin(t2 * Math.PI) * sag +
        sway * t2;

      const linkAngle = Math.atan2(y2 - y1, x2 - x1);
      const linkLen = Math.hypot(x2 - x1, y2 - y1);

      ctx.strokeStyle = seg % 2 === 0 ? "#44445a" : "#38384e";
      ctx.beginPath();
      ctx.ellipse(
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        seg % 2 === 0 ? linkLen * 0.55 : 1.2 * s,
        seg % 2 === 0 ? 1.2 * s : linkLen * 0.55,
        linkAngle,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Dangling skull at the chain's lowest point
    const midX = (lPx + rPx) / 2;
    const midY = (startY + endY) / 2 + sag + sway * 0.5;
    drawIsoSkull3D(
      ctx,
      midX,
      midY + 2 * s,
      2.2 * s,
      1,
      "#b0a090",
      "#908070",
      "#605040",
      "#aa44ff",
      0.2 + Math.sin(time * 2) * 0.15,
    );
  }
}

function drawInfernalVines(
  ctx: CanvasRenderingContext2D,
  lPx: number,
  lPy: number,
  rPx: number,
  rPy: number,
  archMidX: number,
  archMidY: number,
  pH: number,
  s: number,
  time: number,
  seedX: number,
): void {
  ctx.lineCap = "round";

  // Vine configs: start from pillar positions, crawl upward
  const vineSeeds: Array<{
    startX: number;
    startY: number;
    ctrlDx: number;
    ctrlDy: number;
    endDx: number;
    endDy: number;
    leaves: number;
  }> = [
    {
      startX: lPx - 6 * s,
      startY: lPy,
      ctrlDx: -8,
      ctrlDy: -25,
      endDx: -4,
      endDy: -50,
      leaves: 4,
    },
    {
      startX: lPx + 4 * s,
      startY: lPy - 10 * s,
      ctrlDx: 6,
      ctrlDy: -30,
      endDx: 2,
      endDy: -55,
      leaves: 3,
    },
    {
      startX: rPx + 6 * s,
      startY: rPy,
      ctrlDx: 8,
      ctrlDy: -28,
      endDx: 5,
      endDy: -52,
      leaves: 4,
    },
    {
      startX: rPx - 4 * s,
      startY: rPy - 8 * s,
      ctrlDx: -6,
      ctrlDy: -32,
      endDx: -3,
      endDy: -48,
      leaves: 3,
    },
    // Vines on the arch
    {
      startX: archMidX - 12 * s,
      startY: archMidY + 10 * s,
      ctrlDx: -4,
      ctrlDy: 8,
      endDx: -14,
      endDy: 20,
      leaves: 3,
    },
    {
      startX: archMidX + 12 * s,
      startY: archMidY + 10 * s,
      ctrlDx: 4,
      ctrlDy: 8,
      endDx: 14,
      endDy: 18,
      leaves: 3,
    },
    // Vine draping down from arch center
    {
      startX: archMidX,
      startY: archMidY + 6 * s,
      ctrlDx: -3,
      ctrlDy: 12,
      endDx: -5,
      endDy: 28,
      leaves: 5,
    },
    {
      startX: archMidX + 2 * s,
      startY: archMidY + 6 * s,
      ctrlDx: 4,
      ctrlDy: 14,
      endDx: 6,
      endDy: 26,
      leaves: 4,
    },
  ];

  for (let vi = 0; vi < vineSeeds.length; vi++) {
    const v = vineSeeds[vi];
    const vineWiggle = Math.sin(time * 0.4 + vi * 1.3 + seedX) * 1.5 * s;
    const cpX = v.startX + v.ctrlDx * s + vineWiggle;
    const cpY = v.startY + v.ctrlDy * s;
    const endX = v.startX + v.endDx * s + vineWiggle * 0.5;
    const endY = v.startY + v.endDy * s;

    // Dark vine stem
    ctx.strokeStyle = "#1a3518";
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(v.startX, v.startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();

    // Brighter vine highlight
    ctx.strokeStyle = "#2a5528";
    ctx.lineWidth = 0.6 * s;
    ctx.beginPath();
    ctx.moveTo(v.startX, v.startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();

    // Leaves along the vine
    for (let leaf = 0; leaf < v.leaves; leaf++) {
      const t = (leaf + 0.5) / v.leaves;
      const oneMinusT = 1 - t;
      const lx =
        oneMinusT * oneMinusT * v.startX +
        2 * oneMinusT * t * cpX +
        t * t * endX;
      const ly =
        oneMinusT * oneMinusT * v.startY +
        2 * oneMinusT * t * cpY +
        t * t * endY;
      const leafSide = (leaf + vi) % 2 === 0 ? -1 : 1;
      const leafSize = (1.5 + Math.sin(leaf * 2.1 + vi) * 0.5) * s;

      ctx.fillStyle = "#1e4420";
      ctx.beginPath();
      ctx.ellipse(
        lx + leafSide * 2 * s,
        ly,
        leafSize,
        leafSize * 0.45,
        leafSide * 0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#2a6030";
      ctx.beginPath();
      ctx.ellipse(
        lx + leafSide * 2 * s,
        ly - 0.2 * s,
        leafSize * 0.7,
        leafSize * 0.3,
        leafSide * 0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

function drawInfernalParticles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  portalCy: number,
  s: number,
  time: number,
  seedX: number,
  pulse: number,
): void {
  // Purple/violet embers drifting upward
  for (let i = 0; i < 10; i++) {
    const phase = time * 1.8 + i * 1.1 + seedX * 0.3;
    const life = ((time * 0.7 + i * 0.6) % 3.5) / 3.5;
    if (life > 0.92) continue;
    const angle = (i / 10) * Math.PI * 2 + Math.sin(phase * 0.3) * 0.6;
    const dist = (6 + life * 28) * s;
    const ex = cx + Math.cos(angle) * dist + Math.sin(phase * 1.2) * 3 * s;
    const ey = cy - 10 * s - life * 45 * s + Math.sin(phase * 1.8) * 2 * s;
    const eAlpha = Math.max(0, (1 - life) * 0.5);
    ctx.fillStyle =
      i % 3 === 0
        ? `rgba(200,100,255,${eAlpha})`
        : i % 3 === 1
          ? `rgba(120,60,200,${eAlpha})`
          : `rgba(80,180,255,${eAlpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(ex, ey, (0.4 + (1 - life) * 0.7) * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ghostly wisps escaping the portal
  for (let i = 0; i < 4; i++) {
    const wPhase = time * 1.1 + i * 1.9 + seedX;
    const wAlpha = Math.max(0, Math.sin(wPhase) * 0.2);
    if (wAlpha > 0.03) {
      const wx = cx + Math.sin(wPhase * 0.45 + i) * 14 * s;
      const wy = portalCy - 5 * s - ((time * 7 + i * 8) % 35) * s;
      ctx.fillStyle = `rgba(160,100,240,${wAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        wx,
        wy,
        2 * s,
        5 * s,
        Math.sin(wPhase * 0.25) * 0.35,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Ambient purple glow around entire structure
  const ambientGlow = ctx.createRadialGradient(
    cx,
    cy - 20 * s,
    5 * s,
    cx,
    cy - 20 * s,
    50 * s,
  );
  ambientGlow.addColorStop(0, `rgba(100,40,180,${0.06 + pulse * 0.04})`);
  ambientGlow.addColorStop(0.5, `rgba(60,20,120,${0.03 + pulse * 0.02})`);
  ambientGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ambientGlow;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 20 * s, 50 * s, 30 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

// =========================================================================
// NASSAU HALL — Princeton's iconic landmark
// =========================================================================

function drawIsoFaceQuad(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  W: number,
  D: number,
  H: number,
  u: number,
  v: number,
  wu: number,
  wv: number,
  face: "left" | "right",
): void {
  const iW = W * ISO_COS;
  const iD = D * ISO_SIN;
  const dir = face === "left" ? -1 : 1;

  const x0 = bx + dir * (1 - u) * iW;
  const y0 = by + (1 + u) * iD - v * H;
  const x1 = bx + dir * (1 - u - wu) * iW;
  const y1 = by + (1 + u + wu) * iD - v * H;

  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x1, y1 - wv * H);
  ctx.lineTo(x0, y0 - wv * H);
  ctx.closePath();
}

function drawWindowOnFace(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  W: number,
  D: number,
  H: number,
  s: number,
  u: number,
  v: number,
  wu: number,
  wv: number,
  face: "left" | "right",
  frameColor: string,
  glassColor: string,
  sillColor: string,
  arched: boolean = false,
): void {
  const iW = W * ISO_COS;
  const iD = D * ISO_SIN;
  const dir = face === "left" ? -1 : 1;

  const x0 = bx + dir * (1 - u) * iW;
  const y0 = by + (1 + u) * iD - v * H;
  const x1 = bx + dir * (1 - u - wu) * iW;
  const y1 = by + (1 + u + wu) * iD - v * H;
  const wH = wv * H;

  ctx.fillStyle = frameColor;
  ctx.beginPath();
  drawIsoFaceQuad(
    ctx,
    bx,
    by,
    W,
    D,
    H,
    u - 0.005,
    v - 0.008,
    wu + 0.01,
    wv + 0.016,
    face,
  );
  ctx.fill();

  ctx.fillStyle = glassColor;
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, W, D, H, u, v, wu, wv, face);
  ctx.fill();

  if (arched) {
    const topX0 = x0,
      topY0 = y0 - wH;
    const topX1 = x1,
      topY1 = y1 - wH;
    const aMidX = (topX0 + topX1) / 2;
    const aMidY = (topY0 + topY1) / 2;
    const hfx = (topX1 - topX0) / 2;
    const hfy = (topY1 - topY0) / 2;
    const archH = (wu * D) / 2;

    ctx.fillStyle = glassColor;
    ctx.beginPath();
    ctx.save();
    ctx.translate(aMidX, aMidY);
    ctx.transform(hfx, hfy, 0, archH, 0, 0);
    ctx.arc(0, 0, 1, Math.PI, 0);
    ctx.restore();
    ctx.fill();

    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 0.6 * s;
    ctx.beginPath();
    ctx.save();
    ctx.translate(aMidX, aMidY);
    ctx.transform(hfx, hfy, 0, archH, 0, 0);
    ctx.arc(0, 0, 1.06, Math.PI + 0.08, -0.08);
    ctx.restore();
    ctx.stroke();
  }

  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(midX, midY - wH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x0, y0 - wH * 0.5);
  ctx.lineTo(x1, y1 - wH * 0.5);
  ctx.stroke();

  ctx.fillStyle = sillColor;
  ctx.beginPath();
  const sillH = 0.006;
  drawIsoFaceQuad(
    ctx,
    bx,
    by,
    W,
    D,
    H,
    u - 0.003,
    v - 0.01,
    wu + 0.006,
    sillH,
    face,
  );
  ctx.fill();
}

function drawWingSection(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  W: number,
  D: number,
  H: number,
  roofH: number,
  s: number,
  colors: {
    sTop: string;
    sLeft: string;
    sRight: string;
    rfFront: string;
    rfSide: string;
    rfTop: string;
    rfDark: string;
    sDark: string;
    sLight: string;
    sCornice: string;
    glass: string;
    fTop: string;
    fLeft: string;
    fRight: string;
  },
): void {
  const Ws = W * s;
  const Ds = D * s;
  const Hs = H * s;
  const iW = Ws * ISO_COS;
  const iD = Ds * ISO_SIN;
  const wt = by - Hs;

  // Foundation (top aligns with wall base: back vertex at by + fndH so top = by)
  const fndH = 3 * s;
  drawIsometricPrism(
    ctx,
    bx,
    by + fndH,
    (W + 2) * s,
    (D + 2) * s,
    fndH,
    colors.fTop,
    colors.fLeft,
    colors.fRight,
  );

  // Walls
  drawIsometricPrism(
    ctx,
    bx,
    by,
    Ws,
    Ds,
    Hs,
    colors.sTop,
    colors.sLeft,
    colors.sRight,
  );

  // Mortar lines on left face
  drawMortarLines(ctx, bx, by, Ws, Hs, 4, "rgba(0,0,0,0.05)", s);

  // Mortar lines on right face
  ctx.strokeStyle = "rgba(0,0,0,0.04)";
  ctx.lineWidth = 0.4 * s;
  for (let row = 1; row < 4; row++) {
    const frac = row / 4;
    ctx.beginPath();
    ctx.moveTo(bx + iW, wt + iD + frac * Hs);
    ctx.lineTo(bx, wt + 2 * iD + frac * Hs);
    ctx.stroke();
  }

  // Pilaster strips on left face (matching pavilion)
  ctx.fillStyle = colors.sDark;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, Ws, Ds, Hs, 0, 0, 0.04, 1.0, "left");
  ctx.fill();
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, Ws, Ds, Hs, 0.96, 0, 0.04, 1.0, "left");
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Cornice on left face (extended beyond wall like pavilion)
  ctx.fillStyle = colors.sCornice;
  ctx.beginPath();
  ctx.moveTo(bx - iW - 0.5 * s, wt + iD - 0.5 * s);
  ctx.lineTo(bx + 0.5 * s, wt + 2 * iD - 0.5 * s);
  ctx.lineTo(bx + 0.5 * s, wt + 2 * iD + 1.5 * s);
  ctx.lineTo(bx - iW - 0.5 * s, wt + iD + 1.5 * s);
  ctx.closePath();
  ctx.fill();

  // Cornice on right face
  ctx.beginPath();
  ctx.moveTo(bx + iW + 0.5 * s, wt + iD - 0.5 * s);
  ctx.lineTo(bx - 0.5 * s, wt + 2 * iD - 0.5 * s);
  ctx.lineTo(bx - 0.5 * s, wt + 2 * iD + 1.5 * s);
  ctx.lineTo(bx + iW + 0.5 * s, wt + iD + 1.5 * s);
  ctx.closePath();
  ctx.fill();

  // Foundation trim on left face
  ctx.fillStyle = colors.sLight;
  ctx.beginPath();
  ctx.moveTo(bx - iW, by + iD - 2 * s);
  ctx.lineTo(bx, by + 2 * iD - 2 * s);
  ctx.lineTo(bx, by + 2 * iD);
  ctx.lineTo(bx - iW, by + iD);
  ctx.closePath();
  ctx.fill();

  // Foundation trim on right face
  ctx.beginPath();
  ctx.moveTo(bx + iW, by + iD - 2 * s);
  ctx.lineTo(bx, by + 2 * iD - 2 * s);
  ctx.lineTo(bx, by + 2 * iD);
  ctx.lineTo(bx + iW, by + iD);
  ctx.closePath();
  ctx.fill();

  // Gabled roof — ridge runs along iso axis (slope 0.5)
  const LT = { x: bx - iW, y: wt + iD };
  const FT = { x: bx, y: wt + 2 * iD };
  const RT = { x: bx + iW, y: wt + iD };
  const BT = { x: bx, y: wt };

  // Ridge at midpoints of opposite diamond edges, raised by roofH
  const rH = roofH * s;
  const RL = { x: (BT.x + LT.x) / 2, y: (BT.y + LT.y) / 2 - rH };
  const RR = { x: (FT.x + RT.x) / 2, y: (FT.y + RT.y) / 2 - rH };

  // Back slope (faces upper-right, drawn first)
  ctx.fillStyle = colors.rfDark;
  ctx.beginPath();
  ctx.moveTo(BT.x, BT.y);
  ctx.lineTo(RL.x, RL.y);
  ctx.lineTo(RR.x, RR.y);
  ctx.lineTo(RT.x, RT.y);
  ctx.closePath();
  ctx.fill();

  // Left gable end (triangle at the back-left end)
  ctx.fillStyle = colors.rfSide;
  ctx.beginPath();
  ctx.moveTo(BT.x, BT.y);
  ctx.lineTo(RL.x, RL.y);
  ctx.lineTo(LT.x, LT.y);
  ctx.closePath();
  ctx.fill();

  // Right gable end (triangle at the front-right end)
  ctx.beginPath();
  ctx.moveTo(RT.x, RT.y);
  ctx.lineTo(RR.x, RR.y);
  ctx.lineTo(FT.x, FT.y);
  ctx.closePath();
  ctx.fill();

  // Front slope (main visible face, drawn last)
  const fLG = ctx.createLinearGradient(RL.x, RL.y, FT.x, FT.y);
  fLG.addColorStop(0, colors.rfFront);
  fLG.addColorStop(0.5, colors.rfTop);
  fLG.addColorStop(1, colors.rfFront);
  ctx.fillStyle = fLG;
  ctx.beginPath();
  ctx.moveTo(LT.x, LT.y);
  ctx.lineTo(RL.x, RL.y);
  ctx.lineTo(RR.x, RR.y);
  ctx.lineTo(FT.x, FT.y);
  ctx.closePath();
  ctx.fill();

  // Ridge highlight (now follows iso axis at slope 0.5)
  ctx.strokeStyle = colors.rfTop;
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(RL.x, RL.y);
  ctx.lineTo(RR.x, RR.y);
  ctx.stroke();

  // Eave trim on front slope (LT → FT, iso-aligned)
  ctx.strokeStyle = colors.sCornice;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(LT.x - 0.5 * s, LT.y + 0.5 * s);
  ctx.lineTo(FT.x + 0.5 * s, FT.y + 0.5 * s);
  ctx.stroke();

  // Dormer windows on front slope (isometric mini-gable structures)
  const eDx = FT.x - LT.x,
    eDy = FT.y - LT.y;
  const eLen = Math.hypot(eDx, eDy);
  const eUx = eDx / eLen,
    eUy = eDy / eLen;

  for (let d = 0; d < 2; d++) {
    const t = (d + 0.5) / 3;
    const eaveX = LT.x + t * (FT.x - LT.x);
    const eaveY = LT.y + t * (FT.y - LT.y);
    const ridgeX = RL.x + t * (RR.x - RL.x);
    const ridgeYi = RL.y + t * (RR.y - RL.y);

    const dbX = eaveX + 0.3 * (ridgeX - eaveX);
    const dbY = eaveY + 0.3 * (ridgeYi - eaveY);

    const dHW = 2.8 * s;
    const dWallH = 3.5 * s;
    const dGableH = 2 * s;

    const bL = { x: dbX - dHW * eUx, y: dbY - dHW * eUy };
    const bR = { x: dbX + dHW * eUx, y: dbY + dHW * eUy };
    const tL = { x: bL.x, y: bL.y - dWallH };
    const tR = { x: bR.x, y: bR.y - dWallH };
    const peak = { x: (tL.x + tR.x) / 2, y: (tL.y + tR.y) / 2 - dGableH };

    // Dormer wall face (isometric parallelogram)
    ctx.fillStyle = colors.sLeft;
    ctx.beginPath();
    ctx.moveTo(bL.x, bL.y);
    ctx.lineTo(bR.x, bR.y);
    ctx.lineTo(tR.x, tR.y);
    ctx.lineTo(tL.x, tL.y);
    ctx.closePath();
    ctx.fill();

    // Gable triangle
    ctx.fillStyle = colors.rfSide;
    ctx.beginPath();
    ctx.moveTo(tL.x, tL.y);
    ctx.lineTo(tR.x, tR.y);
    ctx.lineTo(peak.x, peak.y);
    ctx.closePath();
    ctx.fill();

    // Gable & eave trim
    ctx.strokeStyle = colors.sCornice;
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.moveTo(tL.x - 0.3 * s, tL.y);
    ctx.lineTo(peak.x, peak.y - 0.3 * s);
    ctx.lineTo(tR.x + 0.3 * s, tR.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bL.x - 0.3 * s, bL.y + 0.3 * s);
    ctx.lineTo(bR.x + 0.3 * s, bR.y + 0.3 * s);
    ctx.stroke();

    // Window (isometric parallelogram inset from wall)
    const wi = 0.22;
    const wL = { x: bL.x + (bR.x - bL.x) * wi, y: bL.y + (bR.y - bL.y) * wi };
    const wR = {
      x: bL.x + (bR.x - bL.x) * (1 - wi),
      y: bL.y + (bR.y - bL.y) * (1 - wi),
    };
    const wTL = { x: wL.x, y: wL.y - dWallH * 0.72 };
    const wTR = { x: wR.x, y: wR.y - dWallH * 0.72 };

    ctx.fillStyle = colors.sDark;
    ctx.beginPath();
    ctx.moveTo(wL.x - 0.3 * s, wL.y + 0.3 * s);
    ctx.lineTo(wR.x + 0.3 * s, wR.y + 0.3 * s);
    ctx.lineTo(wTR.x + 0.3 * s, wTR.y - 0.3 * s);
    ctx.lineTo(wTL.x - 0.3 * s, wTL.y - 0.3 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors.glass;
    ctx.beginPath();
    ctx.moveTo(wL.x, wL.y);
    ctx.lineTo(wR.x, wR.y);
    ctx.lineTo(wTR.x, wTR.y);
    ctx.lineTo(wTL.x, wTL.y);
    ctx.closePath();
    ctx.fill();

    // Isometric arch on dormer window
    const wMidX = (wTL.x + wTR.x) / 2;
    const wMidY = (wTL.y + wTR.y) / 2;
    const wHfx = (wTR.x - wTL.x) / 2;
    const wHfy = (wTR.y - wTL.y) / 2;
    const wArchH = Math.hypot(wTR.x - wTL.x, wTR.y - wTL.y) * 0.35;
    ctx.fillStyle = colors.glass;
    ctx.beginPath();
    ctx.save();
    ctx.translate(wMidX, wMidY);
    ctx.transform(wHfx, wHfy, 0, wArchH, 0, 0);
    ctx.arc(0, 0, 1, Math.PI, 0);
    ctx.restore();
    ctx.fill();

    // Vertical muntin
    const wmX = (wL.x + wR.x) / 2;
    const wmY = (wL.y + wR.y) / 2;
    ctx.strokeStyle = colors.sDark;
    ctx.lineWidth = 0.3 * s;
    ctx.beginPath();
    ctx.moveTo(wmX, wmY);
    ctx.lineTo(wmX, (wTL.y + wTR.y) / 2);
    ctx.stroke();
  }

  // Arched windows on left face (matching pavilion style)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const u = 0.07 + col * 0.3;
      const v = 0.1 + row * 0.42;
      drawWindowOnFace(
        ctx,
        bx,
        by,
        Ws,
        Ds,
        Hs,
        s,
        u,
        v,
        0.17,
        0.3,
        "left",
        colors.sDark,
        colors.glass,
        colors.sLight,
        true,
      );
    }
  }

  // Arched windows on right face (matching style)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const u = 0.08 + col * 0.45;
      const v = 0.1 + row * 0.42;
      drawWindowOnFace(
        ctx,
        bx,
        by,
        Ws,
        Ds,
        Hs,
        s,
        u,
        v,
        0.2,
        0.3,
        "right",
        colors.sDark,
        colors.glass,
        colors.sLight,
        true,
      );
    }
  }
}

export function renderNassauHall(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 1.25;

  // === DIMENSIONS ===
  // Wings: W must equal D for correct 2:1 iso edge slopes
  // (slope = D*ISO_SIN / (W*ISO_COS) = D/(2W), equals 0.5 only when D=W)
  const wingW = 22;
  const wingD = 22;
  const wingH = 20;

  const pavW = 20;
  const pavD = 18;
  const pavH = 26;

  const roofH = 8;
  const pedH = 10;

  const bx = cx;
  const by = cy - 8 * s;

  // Wing offset along the iso ground axis (slope 0.5)
  // Both X and Y use the same distance value to stay on the iso axis
  const wingDist = pavW + 5;
  const lwBx = bx - wingDist * ISO_COS * s;
  const lwBy = by - wingDist * ISO_SIN * s;
  const rwBx = bx + wingDist * ISO_COS * s;
  const rwBy = by + wingDist * ISO_SIN * s;

  const pIW = pavW * ISO_COS * s;
  const pID = pavD * ISO_SIN * s;
  const pavWallTop = by - pavH * s;

  // === SHARED COLORS ===
  const C = {
    sTop: "#A1887F",
    sLeft: "#937363",
    sRight: "#6D4C41",
    rfFront: "#4A7C59",
    rfSide: "#3D6B4A",
    rfTop: "#5D8A6B",
    rfDark: "#2D5A3A",
    sDark: "#5D4037",
    sLight: "#BCAAA4",
    sCornice: "#EFEBE9",
    glass: "#1a1a2e",
    fTop: "#8D8D8D",
    fLeft: "#757575",
    fRight: "#5D5D5D",
  };
  const pTop = "#A89080";
  const pLeft = "#8D6E63";
  const pRight = "#6D4C41";
  const doorCol = "#3E2723";
  const gold = "#FFD700";

  // === 1. SHADOW ===
  if (!skipShadow) {
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 8 * s,
      s,
      55 * s,
      18 * s,
      70 * s,
      0.3,
      "0,0,0",
      z,
    );
  }
  if (shadowOnly) return;

  // === 2. LEFT WING (behind pavilion — drawn first) ===
  drawWingSection(ctx, lwBx, lwBy, wingW, wingD, wingH, roofH, s, C);

  // === 4. CENTRAL PAVILION (middle layer) ===
  // Foundation (top aligns with wall base)
  const pavFndH = 3 * s;
  drawIsometricPrism(
    ctx,
    bx,
    by + pavFndH,
    (pavW + 2) * s,
    (pavD + 1) * s,
    pavFndH,
    C.fTop,
    C.fLeft,
    C.fRight,
  );

  // Walls
  drawIsometricPrism(
    ctx,
    bx,
    by,
    pavW * s,
    pavD * s,
    pavH * s,
    pTop,
    pLeft,
    pRight,
  );

  // Mortar
  drawMortarLines(ctx, bx, by, pavW * s, pavH * s, 5, "rgba(0,0,0,0.04)", s);

  // Pilaster strips on left face
  ctx.fillStyle = C.sDark;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  drawIsoFaceQuad(
    ctx,
    bx,
    by,
    pavW * s,
    pavD * s,
    pavH * s,
    0,
    0,
    0.05,
    1.0,
    "left",
  );
  ctx.fill();
  ctx.beginPath();
  drawIsoFaceQuad(
    ctx,
    bx,
    by,
    pavW * s,
    pavD * s,
    pavH * s,
    0.95,
    0,
    0.05,
    1.0,
    "left",
  );
  ctx.fill();

  // Pilaster strips on right face
  ctx.beginPath();
  drawIsoFaceQuad(
    ctx,
    bx,
    by,
    pavW * s,
    pavD * s,
    pavH * s,
    0,
    0,
    0.05,
    1.0,
    "right",
  );
  ctx.fill();
  ctx.beginPath();
  drawIsoFaceQuad(
    ctx,
    bx,
    by,
    pavW * s,
    pavD * s,
    pavH * s,
    0.95,
    0,
    0.05,
    1.0,
    "right",
  );
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Cornice on left face
  ctx.fillStyle = C.sCornice;
  ctx.beginPath();
  ctx.moveTo(bx - pIW - 0.5 * s, pavWallTop + pID - 0.5 * s);
  ctx.lineTo(bx + 0.5 * s, pavWallTop + 2 * pID - 0.5 * s);
  ctx.lineTo(bx + 0.5 * s, pavWallTop + 2 * pID + 1.5 * s);
  ctx.lineTo(bx - pIW - 0.5 * s, pavWallTop + pID + 1.5 * s);
  ctx.closePath();
  ctx.fill();

  // Cornice on right face
  ctx.beginPath();
  ctx.moveTo(bx + pIW + 0.5 * s, pavWallTop + pID - 0.5 * s);
  ctx.lineTo(bx - 0.5 * s, pavWallTop + 2 * pID - 0.5 * s);
  ctx.lineTo(bx - 0.5 * s, pavWallTop + 2 * pID + 1.5 * s);
  ctx.lineTo(bx + pIW + 0.5 * s, pavWallTop + pID + 1.5 * s);
  ctx.closePath();
  ctx.fill();

  // Foundation trim on left face
  ctx.fillStyle = C.sLight;
  ctx.beginPath();
  ctx.moveTo(bx - pIW, by + pID - 2 * s);
  ctx.lineTo(bx, by + 2 * pID - 2 * s);
  ctx.lineTo(bx, by + 2 * pID);
  ctx.lineTo(bx - pIW, by + pID);
  ctx.closePath();
  ctx.fill();

  // Foundation trim on right face
  ctx.beginPath();
  ctx.moveTo(bx + pIW, by + pID - 2 * s);
  ctx.lineTo(bx, by + 2 * pID - 2 * s);
  ctx.lineTo(bx, by + 2 * pID);
  ctx.lineTo(bx + pIW, by + pID);
  ctx.closePath();
  ctx.fill();

  // === CUPOLA + DOME (drawn before pediment so gable covers cupola base) ===
  const cupolaY = pavWallTop + pID - pedH * s - 1 * s;
  const cupSize = 8;
  const cupH = 14 * s;
  const cupIW = cupSize * s * ISO_COS;
  const cupID = cupSize * s * ISO_SIN;

  // Cupola base platform
  drawIsometricPrism(
    ctx,
    bx,
    cupolaY + 2 * s,
    (cupSize + 2) * s,
    (cupSize + 2) * s,
    2 * s,
    "#D5D5D5",
    "#C0C0C0",
    "#A8A8A8",
  );

  // Cupola prism (W = D for correct iso)
  drawIsometricPrism(
    ctx,
    bx,
    cupolaY,
    cupSize * s,
    cupSize * s,
    cupH,
    "#F0F0F0",
    "#DEDEDE",
    "#C0C0C0",
  );

  // Arched openings on left face
  for (let i = 0; i < 3; i++) {
    const u = (i + 0.5) / 3.5;
    drawWindowOnFace(
      ctx,
      bx,
      cupolaY,
      cupSize * s,
      cupSize * s,
      cupH,
      s,
      u * 0.8 + 0.05,
      0.15,
      0.18,
      0.55,
      "left",
      "#D0D0D0",
      "#37474F",
      "#DEDEDE",
      true,
    );
  }

  // Arched openings on right face
  for (let i = 0; i < 2; i++) {
    const u = (i + 0.5) / 2.5;
    drawWindowOnFace(
      ctx,
      bx,
      cupolaY,
      cupSize * s,
      cupSize * s,
      cupH,
      s,
      u * 0.7 + 0.1,
      0.15,
      0.22,
      0.55,
      "right",
      "#B8B8B8",
      "#2D3A42",
      "#C0C0C0",
      true,
    );
  }

  // Cornice ring at top of cupola
  const cupTop = cupolaY - cupH + cupID;
  ctx.fillStyle = "#E0E0E0";
  ctx.beginPath();
  ctx.ellipse(
    bx,
    cupTop + cupID,
    cupIW + 1.5 * s,
    cupID + 0.8 * s,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#C8C8C8";
  ctx.lineWidth = 0.6 * s;
  ctx.stroke();

  // Dome
  const domeBase = cupTop + cupID;
  const domeH = 14 * s;
  const domeRx = cupIW + 1 * s;
  const domeRy = cupID + 0.5 * s;
  const domePeak = domeBase - domeH;

  // Dome back half (darker) — includes bottom ellipse arc so dome fully covers the cornice ring
  ctx.fillStyle = C.rfDark;
  ctx.beginPath();
  ctx.moveTo(bx - domeRx, domeBase);
  ctx.quadraticCurveTo(
    bx - domeRx * 0.55,
    domePeak + domeH * 0.08,
    bx,
    domePeak,
  );
  ctx.quadraticCurveTo(
    bx + domeRx * 0.55,
    domePeak + domeH * 0.08,
    bx + domeRx,
    domeBase,
  );
  ctx.ellipse(bx, domeBase, domeRx, domeRy, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Dome front half (lit gradient) — same shape so gradient covers the elliptical base area too
  const domeG = ctx.createLinearGradient(
    bx - domeRx,
    domePeak,
    bx + domeRx * 0.5,
    domeBase + domeRy,
  );
  domeG.addColorStop(0, C.rfTop);
  domeG.addColorStop(0.3, C.rfFront);
  domeG.addColorStop(0.6, C.rfSide);
  domeG.addColorStop(1, C.rfDark);
  ctx.fillStyle = domeG;
  ctx.beginPath();
  ctx.moveTo(bx - domeRx, domeBase);
  ctx.quadraticCurveTo(
    bx - domeRx * 0.55,
    domePeak + domeH * 0.08,
    bx,
    domePeak,
  );
  ctx.quadraticCurveTo(
    bx + domeRx * 0.55,
    domePeak + domeH * 0.08,
    bx + domeRx,
    domeBase,
  );
  ctx.ellipse(bx, domeBase, domeRx, domeRy, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Dome outline (upper arc only — base ring handles the bottom)
  ctx.strokeStyle = C.rfTop;
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(bx - domeRx, domeBase);
  ctx.quadraticCurveTo(
    bx - domeRx * 0.55,
    domePeak + domeH * 0.08,
    bx,
    domePeak,
  );
  ctx.quadraticCurveTo(
    bx + domeRx * 0.55,
    domePeak + domeH * 0.08,
    bx + domeRx,
    domeBase,
  );
  ctx.stroke();

  // Dome base ring (front arc only — back arc would show through the dome fill)
  ctx.strokeStyle = C.rfSide;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.ellipse(bx, domeBase, domeRx, domeRy, 0, 0, Math.PI);
  ctx.stroke();

  // Dome ribs (start from front arc of base ring, curve up to near peak)
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 0.4 * s;
  for (let r = 0; r < 5; r++) {
    const t = (r + 1) / 6;
    const ribAngle = t * Math.PI;
    const ribStartX = bx + Math.cos(ribAngle) * domeRx;
    const ribStartY = domeBase + Math.sin(ribAngle) * domeRy;
    ctx.beginPath();
    ctx.moveTo(ribStartX, ribStartY);
    ctx.quadraticCurveTo(
      ribStartX * 0.25 + bx * 0.75,
      domePeak + domeH * 0.15,
      bx,
      domePeak + domeH * 0.05,
    );
    ctx.stroke();
  }

  // Lantern atop dome
  const lanternH = 4 * s;
  const lanternR = 2.5 * s;
  drawIsometricPrism(
    ctx,
    bx,
    domePeak + lanternH,
    lanternR,
    lanternR,
    lanternH,
    "#F5F5F5",
    "#E0E0E0",
    "#CCCCCC",
  );

  // Pediment (left face triangular gable)
  const pavLT = { x: bx - pIW, y: pavWallTop + pID };
  const pavFT = { x: bx, y: pavWallTop + 2 * pID };
  const pedApex = {
    x: (pavLT.x + pavFT.x) / 2,
    y: (pavLT.y + pavFT.y) / 2 - pedH * s,
  };

  const pedG = ctx.createLinearGradient(pedApex.x, pedApex.y, pavFT.x, pavFT.y);
  pedG.addColorStop(0, C.rfTop);
  pedG.addColorStop(0.5, C.rfFront);
  pedG.addColorStop(1, C.rfSide);
  ctx.fillStyle = pedG;
  ctx.beginPath();
  ctx.moveTo(pavLT.x, pavLT.y);
  ctx.lineTo(pavFT.x, pavFT.y);
  ctx.lineTo(pedApex.x, pedApex.y);
  ctx.closePath();
  ctx.fill();

  // Pediment right face
  const pavRT = { x: bx + pIW, y: pavWallTop + pID };
  const pedApexR = {
    x: (pavRT.x + pavFT.x) / 2,
    y: (pavRT.y + pavFT.y) / 2 - pedH * s,
  };
  ctx.fillStyle = C.rfDark;
  ctx.beginPath();
  ctx.moveTo(pavRT.x, pavRT.y);
  ctx.lineTo(pavFT.x, pavFT.y);
  ctx.lineTo(pedApexR.x, pedApexR.y);
  ctx.closePath();
  ctx.fill();

  // Pediment border (drawn after both faces so it sits on top)
  ctx.strokeStyle = C.sCornice;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(pavLT.x - 0.5 * s, pavLT.y + 0.5 * s);
  ctx.lineTo(pedApex.x, pedApex.y - 1 * s);
  ctx.lineTo(pavFT.x + 0.5 * s, pavFT.y + 0.5 * s);
  ctx.stroke();

  // Oculus (isometric circle on left face)
  const ocCx = (pavLT.x + pavFT.x + pedApex.x) / 3;
  const ocCy = (pavLT.y + pavFT.y + pedApex.y) / 3 + 1 * s;
  const faceUx = ISO_COS;
  const faceUy = ISO_SIN;

  const drawIsoCircle = (cx: number, cy: number, r: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.transform(faceUx * r, faceUy * r, 0, -r, 0, 0);
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.restore();
  };

  ctx.fillStyle = C.rfDark;
  ctx.beginPath();
  drawIsoCircle(ocCx, ocCy, 3.5 * s);
  ctx.fill();
  ctx.strokeStyle = C.sCornice;
  ctx.lineWidth = 0.8 * s;
  ctx.stroke();
  ctx.fillStyle = C.rfFront;
  ctx.beginPath();
  drawIsoCircle(ocCx, ocCy, 2 * s);
  ctx.fill();

  // Pavilion windows (arched) on left face
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      if (row === 1 && col === 1) continue;
      const u = 0.06 + col * 0.32;
      const v = row === 0 ? 0.52 : 0.1;
      drawWindowOnFace(
        ctx,
        bx,
        by,
        pavW * s,
        pavD * s,
        pavH * s,
        s,
        u,
        v,
        0.2,
        0.28,
        "left",
        C.sDark,
        C.glass,
        C.sLight,
        true,
      );
    }
  }

  // Pavilion windows on right face (side of building)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const u = 0.12 + col * 0.42;
      const v = row === 0 ? 0.52 : 0.1;
      drawWindowOnFace(
        ctx,
        bx,
        by,
        pavW * s,
        pavD * s,
        pavH * s,
        s,
        u,
        v,
        0.2,
        0.28,
        "right",
        C.sDark,
        C.glass,
        C.sLight,
        true,
      );
    }
  }

  // Grand entrance door
  const dU = 0.3;
  const dWU = 0.4;
  const dV = 0.01;
  const dWV = 0.42;

  ctx.fillStyle = C.sDark;
  ctx.beginPath();
  drawIsoFaceQuad(
    ctx,
    bx,
    by,
    pavW * s,
    pavD * s,
    pavH * s,
    dU - 0.02,
    dV - 0.01,
    dWU + 0.04,
    dWV + 0.03,
    "left",
  );
  ctx.fill();

  const d0x = bx - (1 - dU) * pIW;
  const d0y = by + (1 + dU) * pID - dV * pavH * s;
  const d1x = bx - (1 - dU - dWU) * pIW;
  const d1y = by + (1 + dU + dWU) * pID - dV * pavH * s;
  const dH = dWV * pavH * s;
  const dCx = (d0x + d1x) / 2;
  const dCy = (d0y + d1y) / 2 - dH;
  const dHfx = (d1x - d0x) / 2;
  const dHfy = (d1y - d0y) / 2;
  const dArchH = (dWU * pavD * s) / 2;

  // Outer arch surround (isometric semi-ellipse)
  ctx.fillStyle = C.sDark;
  ctx.beginPath();
  ctx.save();
  ctx.translate(dCx, dCy);
  ctx.transform(dHfx + 1 * s, dHfy + 0.5 * s, 0, dArchH + 1 * s, 0, 0);
  ctx.arc(0, 0, 1, Math.PI, 0);
  ctx.restore();
  ctx.fill();

  // Keystone
  const keystoneY = dCy - dArchH;
  ctx.fillStyle = C.sLight;
  ctx.beginPath();
  ctx.moveTo(dCx - 1.2 * s, keystoneY + 0.8 * s);
  ctx.lineTo(dCx, keystoneY - 0.8 * s);
  ctx.lineTo(dCx + 1.2 * s, keystoneY + 0.8 * s);
  ctx.lineTo(dCx + 0.8 * s, dCy);
  ctx.lineTo(dCx - 0.8 * s, dCy);
  ctx.closePath();
  ctx.fill();

  const doorG = ctx.createLinearGradient(d0x, d0y, d1x, d1y);
  doorG.addColorStop(0, "#2D1B14");
  doorG.addColorStop(0.5, doorCol);
  doorG.addColorStop(1, "#2D1B14");
  ctx.fillStyle = doorG;
  ctx.beginPath();
  drawIsoFaceQuad(
    ctx,
    bx,
    by,
    pavW * s,
    pavD * s,
    pavH * s,
    dU,
    dV,
    dWU,
    dWV,
    "left",
  );
  ctx.fill();

  // Inner fanlight arch (isometric semi-ellipse)
  ctx.fillStyle = C.glass;
  ctx.beginPath();
  ctx.save();
  ctx.translate(dCx, dCy);
  ctx.transform(dHfx, dHfy, 0, dArchH, 0, 0);
  ctx.arc(0, 0, 1, Math.PI, 0);
  ctx.restore();
  ctx.fill();

  // Fanlight spokes (mapped to isometric ellipse)
  ctx.strokeStyle = C.sDark;
  ctx.lineWidth = 0.4 * s;
  for (let spoke = 0; spoke < 5; spoke++) {
    const a = Math.PI + (spoke + 1) * (Math.PI / 6);
    const ex = dCx + dHfx * Math.cos(a);
    const ey = dCy + dHfy * Math.cos(a) + dArchH * Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(dCx, dCy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // Door center divider
  ctx.strokeStyle = "#1a0f0a";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(dCx, (d0y + d1y) / 2);
  ctx.lineTo(dCx, dCy);
  ctx.stroke();

  // Door handles (isometric, positioned along the face direction)
  const handleBaseY = (d0y + d1y) / 2 - dH * 0.25;
  const handleDist = 1.5 * s;
  const handleR = 0.8 * s;
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.save();
  ctx.translate(dCx - handleDist * faceUx, handleBaseY - handleDist * faceUy);
  ctx.transform(faceUx * handleR, faceUy * handleR, 0, -handleR, 0, 0);
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.restore();
  ctx.fill();
  ctx.beginPath();
  ctx.save();
  ctx.translate(dCx + handleDist * faceUx, handleBaseY + handleDist * faceUy);
  ctx.transform(faceUx * handleR, faceUy * handleR, 0, -handleR, 0, 0);
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.restore();
  ctx.fill();

  // Isometric columns on pavilion left face (parallelogram-aligned)
  const colUs = [0.08, 0.32, 0.68, 0.92];
  colUs.forEach((u) => {
    const cWu = 0.06;
    const cVS = 0.03;
    const cVE = 0.9;

    // Base
    ctx.fillStyle = C.sCornice;
    ctx.beginPath();
    drawIsoFaceQuad(
      ctx,
      bx,
      by,
      pavW * s,
      pavD * s,
      pavH * s,
      u - 0.01,
      cVS,
      cWu + 0.02,
      0.025,
      "left",
    );
    ctx.fill();

    // Shaft — use gradient that follows the face
    const sX0 = bx - (1 - u) * pIW;
    const sX1 = bx - (1 - u - cWu) * pIW;
    const colG = ctx.createLinearGradient(sX0, 0, sX1, 0);
    colG.addColorStop(0, C.sLight);
    colG.addColorStop(0.3, C.sCornice);
    colG.addColorStop(0.7, C.sCornice);
    colG.addColorStop(1, C.sLight);
    ctx.fillStyle = colG;
    ctx.beginPath();
    drawIsoFaceQuad(
      ctx,
      bx,
      by,
      pavW * s,
      pavD * s,
      pavH * s,
      u,
      cVS + 0.025,
      cWu,
      cVE - cVS - 0.025,
      "left",
    );
    ctx.fill();

    // Fluting
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 0.3 * s;
    for (let fl = 0; fl < 2; fl++) {
      const flU = u + cWu * (0.3 + fl * 0.4);
      const flX = bx - (1 - flU) * pIW;
      const flYB = by + (1 + flU) * pID - (cVS + 0.04) * pavH * s;
      const flYT = flYB - (cVE - cVS - 0.06) * pavH * s;
      ctx.beginPath();
      ctx.moveTo(flX, flYB);
      ctx.lineTo(flX, flYT);
      ctx.stroke();
    }

    // Capital
    ctx.fillStyle = C.sCornice;
    ctx.beginPath();
    drawIsoFaceQuad(
      ctx,
      bx,
      by,
      pavW * s,
      pavD * s,
      pavH * s,
      u - 0.015,
      cVE,
      cWu + 0.03,
      0.035,
      "left",
    );
    ctx.fill();

    // Volutes
    const vX0 = bx - (1 - u + 0.01) * pIW;
    const vY0 = by + (1 + u - 0.01) * pID - (cVE + 0.02) * pavH * s;
    const vX1 = bx - (1 - u - cWu - 0.01) * pIW;
    const vY1 = by + (1 + u + cWu + 0.01) * pID - (cVE + 0.02) * pavH * s;
    ctx.fillStyle = C.sLight;
    ctx.beginPath();
    ctx.arc(vX0, vY0, 0.9 * s, 0, Math.PI * 2);
    ctx.arc(vX1, vY1, 0.9 * s, 0, Math.PI * 2);
    ctx.fill();
  });

  // === 5. RIGHT WING (in front of pavilion) ===
  drawWingSection(ctx, rwBx, rwBy, wingW, wingD, wingH, roofH, s, C);

  // === SPIRE + FLAG (drawn last so they render above all roofs) ===
  const spireBase = domePeak;
  const spireH = 18 * s;
  const spireTop = spireBase - spireH;

  const spireG = ctx.createLinearGradient(bx, spireBase, bx, spireTop);
  spireG.addColorStop(0, "#DAA520");
  spireG.addColorStop(0.4, gold);
  spireG.addColorStop(0.8, "#FFEB3B");
  spireG.addColorStop(1, gold);
  ctx.fillStyle = spireG;
  ctx.beginPath();
  ctx.moveTo(bx - 1.6 * s, spireBase);
  ctx.lineTo(bx - 0.8 * s, spireBase - spireH * 0.5);
  ctx.lineTo(bx, spireTop);
  ctx.lineTo(bx + 0.8 * s, spireBase - spireH * 0.5);
  ctx.lineTo(bx + 1.6 * s, spireBase);
  ctx.closePath();
  ctx.fill();

  // Golden orb
  setShadowBlur(ctx, 4 * s, gold);
  ctx.fillStyle = "#FFC107";
  ctx.beginPath();
  ctx.arc(bx, spireBase + 0.5 * s, 2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(bx, spireBase + 0.5 * s, 1.2 * s, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Spire tip
  ctx.fillStyle = "#FFF9C4";
  ctx.beginPath();
  ctx.arc(bx, spireTop + 1 * s, 0.8 * s, 0, Math.PI * 2);
  ctx.fill();

  // Princeton flag
  const flagAttachY = spireBase - spireH * 0.55;
  const sway1 = Math.sin(time * 2.0) * 1.5 * s;
  const sway2 = Math.sin(time * 2.0 + 1.2) * 2.2 * s;
  const sway3 = Math.sin(time * 2.0 + 2.4) * 1.8 * s;
  const flagW = 10 * s;
  const flagH = 5 * s;

  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(bx + 0.5 * s, flagAttachY);
  ctx.lineTo(bx + flagW, flagAttachY + sway1 * 0.15);
  ctx.stroke();

  ctx.fillStyle = "#F97316";
  ctx.beginPath();
  ctx.moveTo(bx + 1 * s, flagAttachY);
  ctx.quadraticCurveTo(
    bx + flagW * 0.4,
    flagAttachY + sway1 * 0.3,
    bx + flagW,
    flagAttachY + sway1 * 0.15,
  );
  ctx.quadraticCurveTo(
    bx + flagW * 0.7,
    flagAttachY - flagH * 0.35 + sway2 * 0.3,
    bx + flagW,
    flagAttachY - flagH * 0.35 + sway3 * 0.2,
  );
  ctx.lineTo(bx + 1 * s, flagAttachY - flagH * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(bx + 1 * s, flagAttachY - flagH * 0.35);
  ctx.quadraticCurveTo(
    bx + flagW * 0.5,
    flagAttachY - flagH * 0.35 + sway2 * 0.25,
    bx + flagW,
    flagAttachY - flagH * 0.35 + sway3 * 0.2,
  );
  ctx.quadraticCurveTo(
    bx + flagW * 0.7,
    flagAttachY - flagH * 0.7 + sway3 * 0.3,
    bx + flagW,
    flagAttachY - flagH * 0.7 + sway2 * 0.15,
  );
  ctx.lineTo(bx + 1 * s, flagAttachY - flagH * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#F97316";
  ctx.beginPath();
  ctx.moveTo(bx + 1 * s, flagAttachY - flagH * 0.7);
  ctx.quadraticCurveTo(
    bx + flagW * 0.5,
    flagAttachY - flagH * 0.7 + sway3 * 0.25,
    bx + flagW,
    flagAttachY - flagH * 0.7 + sway2 * 0.15,
  );
  ctx.quadraticCurveTo(
    bx + flagW * 0.7,
    flagAttachY - flagH + sway1 * 0.2,
    bx + flagW,
    flagAttachY - flagH + sway1 * 0.1,
  );
  ctx.lineTo(bx + 1 * s, flagAttachY - flagH);
  ctx.closePath();
  ctx.fill();

  // === 8. FRONT STEPS (stacked pyramid in front of entrance door) ===
  const fwdX = -ISO_SIN;
  const fwdY = ISO_COS;

  // Door center on the left face (u≈0.5), offset slightly outward from face
  const entrX = bx - pIW * 0.6 + fwdX * 4 * s;
  const entrY = by + 1.4 * pID + fwdY * 4 * s;

  // === 9. TIGER STATUES ===
  const drawTigerStatue = (tx: number, ty: number, facing: number) => {
    // Pedestal — warm sandstone, proper iso (W=D)
    const pedW = 5 * s;
    const pedH = 4 * s;
    drawIsometricPrism(
      ctx,
      tx,
      ty,
      pedW,
      pedW,
      pedH,
      "#C4B5A5",
      "#A89585",
      "#8D7565",
    );

    // Pedestal trim ring
    drawIsometricPrism(
      ctx,
      tx,
      ty - pedH + pedW * ISO_SIN,
      pedW + 0.8 * s,
      pedW + 0.8 * s,
      0.8 * s,
      "#D5C8B8",
      "#BCAA98",
      "#A08878",
    );

    const topY = ty - pedH + pedW * ISO_SIN;

    // Tiger body — warm bronze stone, seated pose
    const bodyRx = 3.8 * s;
    const bodyRy = 2.2 * s;
    const bodyY = topY - 3.5 * s;

    // Body shadow on pedestal
    ctx.fillStyle = "rgba(80,60,40,0.15)";
    ctx.beginPath();
    ctx.ellipse(
      tx,
      topY - 0.3 * s,
      bodyRx * 0.85,
      bodyRy * 0.6,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Haunches (back of seated tiger)
    const haunchG = ctx.createRadialGradient(
      tx - facing * 0.5 * s,
      bodyY,
      0,
      tx,
      bodyY,
      bodyRx,
    );
    haunchG.addColorStop(0, "#A89078");
    haunchG.addColorStop(0.6, "#8D7565");
    haunchG.addColorStop(1, "#6D5545");
    ctx.fillStyle = haunchG;
    ctx.beginPath();
    ctx.ellipse(tx, bodyY, bodyRx, bodyRy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front legs (iso parallelograms)
    const legW = 1.2 * s;
    const legSpread = 1.8 * s;
    ctx.fillStyle = "#8D7565";
    // Left front leg
    ctx.beginPath();
    ctx.moveTo(tx + facing * legSpread - legW * 0.5, bodyY + bodyRy * 0.3);
    ctx.lineTo(
      tx + facing * legSpread + legW * 0.5,
      bodyY + bodyRy * 0.3 + ((legW * ISO_SIN) / ISO_COS) * 0.5,
    );
    ctx.lineTo(tx + facing * legSpread + legW * 0.5, topY - 0.5 * s);
    ctx.lineTo(tx + facing * legSpread - legW * 0.5, topY - 0.5 * s);
    ctx.closePath();
    ctx.fill();
    // Right front leg
    ctx.fillStyle = "#7D6555";
    ctx.beginPath();
    ctx.moveTo(
      tx + facing * (legSpread + 2.5 * s) - legW * 0.5,
      bodyY + bodyRy * 0.1,
    );
    ctx.lineTo(
      tx + facing * (legSpread + 2.5 * s) + legW * 0.5,
      bodyY + bodyRy * 0.1 + ((legW * ISO_SIN) / ISO_COS) * 0.5,
    );
    ctx.lineTo(
      tx + facing * (legSpread + 2.5 * s) + legW * 0.5,
      topY - 0.5 * s,
    );
    ctx.lineTo(
      tx + facing * (legSpread + 2.5 * s) - legW * 0.5,
      topY - 0.5 * s,
    );
    ctx.closePath();
    ctx.fill();

    // Chest highlight
    ctx.fillStyle = "#B8A088";
    ctx.beginPath();
    ctx.ellipse(
      tx + facing * 2 * s,
      bodyY - 0.5 * s,
      2 * s,
      1.8 * s,
      facing * 0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Head
    const headX = tx + facing * 4 * s;
    const headY = bodyY - 3.5 * s;
    const headR = 2.5 * s;

    const headG = ctx.createRadialGradient(
      headX - facing * 0.5 * s,
      headY - 0.5 * s,
      0,
      headX,
      headY,
      headR,
    );
    headG.addColorStop(0, "#C4AA90");
    headG.addColorStop(0.5, "#A89078");
    headG.addColorStop(1, "#7D6555");
    ctx.fillStyle = headG;
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Muzzle
    ctx.fillStyle = "#B8A088";
    ctx.beginPath();
    ctx.ellipse(
      headX + facing * 1.5 * s,
      headY + 0.8 * s,
      1.5 * s,
      1 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Ears (triangular)
    ctx.fillStyle = "#8D7565";
    ctx.beginPath();
    ctx.moveTo(headX - 1.5 * s, headY - headR * 0.6);
    ctx.lineTo(headX - 0.8 * s, headY - headR - 1.5 * s);
    ctx.lineTo(headX + 0.2 * s, headY - headR * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + facing * 2 * s - 0.5 * s, headY - headR * 0.65);
    ctx.lineTo(headX + facing * 2 * s, headY - headR - 1.2 * s);
    ctx.lineTo(headX + facing * 2 * s + 0.8 * s, headY - headR * 0.5);
    ctx.closePath();
    ctx.fill();

    // Eyes (intense)
    ctx.fillStyle = "#3E2723";
    ctx.beginPath();
    ctx.ellipse(
      headX + facing * 0.8 * s,
      headY - 0.5 * s,
      0.7 * s,
      0.5 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.ellipse(
      headX + facing * 2.5 * s,
      headY - 0.5 * s,
      0.7 * s,
      0.5 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Eye gleam
    ctx.fillStyle = "#D4C4A8";
    ctx.beginPath();
    ctx.arc(
      headX + facing * 0.6 * s,
      headY - 0.7 * s,
      0.25 * s,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      headX + facing * 2.3 * s,
      headY - 0.7 * s,
      0.25 * s,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Nose
    ctx.fillStyle = "#5D4037";
    ctx.beginPath();
    ctx.ellipse(
      headX + facing * 2 * s,
      headY + 0.3 * s,
      0.5 * s,
      0.35 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Tail (curved, coming from the back)
    ctx.strokeStyle = "#8D7565";
    ctx.lineWidth = 1.2 * s;
    ctx.lineCap = "round";
    const tw = Math.sin(time * 1.2 + facing) * 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(tx - facing * 3 * s, bodyY);
    ctx.quadraticCurveTo(
      tx - facing * 5 * s + tw,
      bodyY - 4 * s,
      tx - facing * 3.5 * s,
      bodyY - 7 * s,
    );
    ctx.stroke();

    // Stripe marks on body (subtle)
    ctx.strokeStyle = "rgba(90,65,45,0.2)";
    ctx.lineWidth = 0.6 * s;
    for (let st = 0; st < 3; st++) {
      const sx = tx - 1.5 * s + st * 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(sx, bodyY - bodyRy * 0.6);
      ctx.lineTo(sx + 0.3 * s, bodyY + bodyRy * 0.3);
      ctx.stroke();
    }
  };

  // Tigers flank the staircase on the iso ground plane (proper iso diagonal)
  const tigerOffset = 14 * s;
  const statLX = entrX - (tigerOffset - 5 * s) * ISO_COS;
  const statLY = entrY - (tigerOffset - 5 * s) * ISO_SIN;
  const statRX = entrX + tigerOffset * ISO_COS;
  const statRY = entrY + tigerOffset * ISO_SIN;
  drawTigerStatue(statLX, statLY, -1);
  // Stacked iso platforms: largest at ground, shrinking upward
  const stepH = 1.2 * s;
  for (let step = 0; step < 4; step++) {
    const stepSize = (11 - step * 1.8) * s;
    drawIsometricPrism(
      ctx,
      entrX,
      entrY - step * stepH,
      stepSize,
      stepSize,
      stepH,
      "#D5CCC4",
      "#B0A090",
      "#8D7E72",
    );
  }
  drawTigerStatue(statRX, statRY, -1);

  // === 10. WARM AMBIENT GLOW ===
  const glowA = 0.04 + Math.sin(time * 0.5) * 0.02;
  if (glowA > 0.02) {
    setShadowBlur(ctx, 6 * s, "#FFE0B0");
    ctx.fillStyle = `rgba(255,224,176,${glowA})`;
    ctx.beginPath();
    ctx.ellipse(bx, by + pID, pIW * 0.8, pavH * 0.3 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
  }

  // Entrance light spill (warm glow from door, centered on entrance)
  const doorGlowA = 0.06 + Math.sin(time * 0.8) * 0.02;
  const doorGlow = ctx.createRadialGradient(
    entrX,
    entrY,
    0,
    entrX,
    entrY,
    8 * s,
  );
  doorGlow.addColorStop(0, `rgba(255,200,120,${doorGlowA})`);
  doorGlow.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = doorGlow;
  ctx.beginPath();
  ctx.ellipse(
    entrX + 2 * s * fwdX,
    entrY + 2 * s * fwdY,
    6 * s,
    3 * s,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}
