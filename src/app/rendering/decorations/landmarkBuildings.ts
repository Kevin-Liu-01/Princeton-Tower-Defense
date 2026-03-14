import { ISO_COS, ISO_SIN, ISO_Y_RATIO } from "../../constants";
import {
  drawIsometricPrism,
  drawIsometricPyramid,
  drawOrganicBlobAt,
} from "../helpers";
import { setShadowBlur, clearShadow } from "../performance";
import { drawDirectionalShadow, MAX_SHADOW_RX, MAX_SHADOW_RY } from "./shadowHelpers";

export interface LandmarkParams {
  ctx: CanvasRenderingContext2D;
  screenX: number;
  screenY: number;
  s: number;
  time: number;
  seedX: number;
  seedY: number;
  variant: number;
  skipShadow: boolean;
  shadowOnly: boolean;
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

function drawIcicleRow(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  count: number,
  maxLen: number,
  s: number,
  seed: number,
): void {
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const ix = startX + (endX - startX) * t;
    const iy = startY + (endY - startY) * t;
    const len = (maxLen * 0.5 + maxLen * 0.5 * Math.sin(seed + i * 2.3)) * s;
    const w = (0.7 + Math.sin(seed + i * 1.7) * 0.25) * s;
    const grad = ctx.createLinearGradient(ix, iy, ix, iy + len);
    grad.addColorStop(0, "rgba(180,220,245,0.9)");
    grad.addColorStop(0.35, "rgba(140,200,240,0.75)");
    grad.addColorStop(0.7, "rgba(100,175,230,0.5)");
    grad.addColorStop(1, "rgba(80,160,220,0.15)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(ix - w, iy);
    ctx.lineTo(ix + w, iy);
    ctx.lineTo(ix + w * 0.1, iy + len);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(220,240,255,0.35)";
    ctx.lineWidth = 0.25 * s;
    ctx.beginPath();
    ctx.moveTo(ix - w * 0.3, iy + s);
    ctx.lineTo(ix - w * 0.1, iy + len * 0.5);
    ctx.stroke();
  }
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
// ICE FORTRESS
// =========================================================================

export function renderIceFortress(p: LandmarkParams): void {
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
  } = p;

  if (!skipShadow) {
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 8 * s,
      s,
      44 * s,
      18 * s,
      65 * s,
      0.35,
      "0,50,70",
    );
  }
  if (shadowOnly) return;

  const pulse = 0.5 + Math.sin(time * 1.6) * 0.2;
  const seed = seedX * 7.3 + seedY * 11.1;
  const ifVar = variant % 3;
  const iceTop = "#d0e8f4";
  const iceLit = "#7ec8e8";
  const iceMid = "#4ba8d4";
  const iceDark = "#1e6ea0";
  const iceDeep = "#0d4870";
  const snowWhite = "#f0f6fa";

  // Snow mound base
  const snowG = ctx.createRadialGradient(
    cx - 5 * s,
    cy + 2 * s,
    0,
    cx,
    cy + 7 * s,
    46 * s,
  );
  snowG.addColorStop(0, "#ffffff");
  snowG.addColorStop(0.4, "#eaf2f8");
  snowG.addColorStop(0.8, "#cde0ec");
  snowG.addColorStop(1, "#b0cede");
  ctx.fillStyle = snowG;
  drawOrganicBlobAt(ctx, cx, cy + 7 * s, 46 * s, 15 * s, seed);
  ctx.fill();

  // Ice crystal formations at base
  [
    { x: cx - 34 * s, y: cy + 5 * s, h: 7, w: 2.2 },
    { x: cx + 32 * s, y: cy - 3 * s, h: 9, w: 2.5 },
    { x: cx - 20 * s, y: cy + 11 * s, h: 5, w: 1.8 },
    { x: cx + 38 * s, y: cy + 3 * s, h: 4, w: 1.5 },
  ].forEach(({ x: crx, y: cry, h, w }) => {
    const crGrad = ctx.createLinearGradient(crx, cry, crx, cry - h * s);
    crGrad.addColorStop(0, "rgba(100,180,230,0.5)");
    crGrad.addColorStop(0.5, "rgba(140,210,250,0.7)");
    crGrad.addColorStop(1, "rgba(200,240,255,0.35)");
    ctx.fillStyle = crGrad;
    ctx.beginPath();
    ctx.moveTo(crx - w * s, cry);
    ctx.lineTo(crx - w * 0.2 * s, cry - h * s);
    ctx.lineTo(crx + w * 0.3 * s, cry - h * 0.7 * s);
    ctx.lineTo(crx + w * s, cry);
    ctx.closePath();
    ctx.fill();
  });

  if (ifVar === 0) {
    // Variant 0: Central wall with two flanking towers and a gate
    const wallW = 42 * s;
    const wallH = 26 * s;
    drawIsometricPrism(
      ctx,
      cx,
      cy + 2 * s,
      wallW,
      wallW,
      wallH,
      iceTop,
      iceDark,
      iceDeep,
    );
    const wI = wallW * ISO_COS;
    const wD = wallW * ISO_SIN;
    const wBase = cy + 2 * s;

    // Ice sheen overlay on left face
    const sheen = ctx.createLinearGradient(
      cx - wI,
      wBase + wD,
      cx,
      wBase + wD * 2,
    );
    sheen.addColorStop(0, "rgba(130,210,245,0.18)");
    sheen.addColorStop(0.5, "rgba(80,180,230,0.06)");
    sheen.addColorStop(1, "rgba(60,160,220,0.12)");
    prismFaceOverlay(ctx, cx, wBase, wallW, wallH, "left", sheen);

    // Stone block lines
    drawMortarLines(ctx, cx, wBase, wallW, wallH, 5, "rgba(0,40,60,0.1)", s);

    // Arrow slits
    for (let face = 0; face < 2; face++) {
      for (let i = 0; i < 3; i++) {
        const t = (i + 0.5) / 3;
        const slitX = face === 0 ? cx - wI * (1 - t) : cx + wI * t;
        const slitY =
          face === 0
            ? wBase + wD * (2 * t) - wallH * 0.5
            : wBase + wD * (2 - 2 * t) - wallH * 0.5;
        ctx.fillStyle = "rgba(0,25,45,0.5)";
        ctx.fillRect(slitX - 0.5 * s, slitY - 2.5 * s, 1 * s, 5 * s);
      }
    }

    // Crenellations on top
    const wallTopY = wBase - wallH;
    for (let i = 0; i < 5; i++) {
      const t = (i + 0.5) / 5;
      drawIsometricPrism(
        ctx,
        cx - wI * (1 - t),
        wallTopY + wD * t,
        3.5 * s,
        3.5 * s,
        4 * s,
        snowWhite,
        iceMid,
        iceDark,
      );
      drawIsometricPrism(
        ctx,
        cx + wI * t,
        wallTopY + wD * (1 - t),
        3.5 * s,
        3.5 * s,
        4 * s,
        snowWhite,
        iceMid,
        iceDark,
      );
    }

    // Icicles on wall edges
    drawIcicleRow(ctx, cx - wI, wBase + wD, cx, wBase + wD * 2, 7, 6, s, seed);
    drawIcicleRow(
      ctx,
      cx,
      wBase + wD * 2,
      cx + wI,
      wBase + wD,
      6,
      5,
      s,
      seed + 3,
    );

    // Left tower
    const tLx = cx - 26 * s;
    const tLy = cy + 3 * s;
    const tW = 11 * s;
    const tH = 48 * s;
    drawIsometricPrism(ctx, tLx, tLy, tW, tW, tH, iceLit, iceDeep, iceDark);
    const tTopY = tLy - tH;
    drawIsometricPrism(
      ctx,
      tLx,
      tTopY,
      tW + 2 * s,
      tW + 2 * s,
      2 * s,
      iceTop,
      iceMid,
      iceDark,
    );
    drawIsometricPyramid(
      ctx,
      tLx,
      tTopY - 2 * s,
      tW * 0.6,
      14 * s,
      iceLit,
      iceDeep,
      iceMid,
    );
    // Tower windows
    for (let w2 = 0; w2 < 2; w2++) {
      const wy = tLy - tH * (0.35 + w2 * 0.25) + tW * ISO_SIN * 2;
      ctx.fillStyle = "rgba(0,30,50,0.5)";
      ctx.beginPath();
      ctx.arc(tLx, wy, 2.5 * s, Math.PI, 0);
      ctx.lineTo(tLx + 2.5 * s, wy + 4 * s);
      ctx.lineTo(tLx - 2.5 * s, wy + 4 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(100,200,255,${0.12 + pulse * 0.1})`;
      ctx.beginPath();
      ctx.arc(tLx, wy + 1 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    // Banner on left tower
    const banBase = tTopY + tW * ISO_SIN - tW * ISO_SIN - 2 * s;
    ctx.strokeStyle = "#455A64";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(tLx, banBase);
    ctx.lineTo(tLx, banBase - 16 * s);
    ctx.stroke();
    const banG = ctx.createLinearGradient(
      tLx,
      banBase - 16 * s,
      tLx + 10 * s,
      banBase - 8 * s,
    );
    banG.addColorStop(0, "#0D47A1");
    banG.addColorStop(1, "#1565C0");
    ctx.fillStyle = banG;
    const bWave = Math.sin(time * 2.5) * 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(tLx, banBase - 16 * s);
    ctx.lineTo(tLx + 10 * s + bWave, banBase - 14 * s);
    ctx.lineTo(tLx + 8 * s - bWave * 0.5, banBase - 10 * s);
    ctx.lineTo(tLx + 10 * s + bWave * 0.3, banBase - 6 * s);
    ctx.lineTo(tLx, banBase - 8 * s);
    ctx.closePath();
    ctx.fill();
    // Snowflake emblem on banner
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 0.6 * s;
    const bex = tLx + 5 * s;
    const bey = banBase - 11 * s;
    for (let be = 0; be < 6; be++) {
      const bea = (be / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(bex, bey);
      ctx.lineTo(bex + Math.cos(bea) * 3 * s, bey + Math.sin(bea) * 3 * s);
      ctx.stroke();
    }

    // Right tower
    const tRx = cx + 26 * s;
    const tRy = cy - 3 * s;
    drawIsometricPrism(ctx, tRx, tRy, tW, tW, tH, iceLit, iceDeep, iceDark);
    const tRTopY = tRy - tH;
    drawIsometricPrism(
      ctx,
      tRx,
      tRTopY,
      tW + 2 * s,
      tW + 2 * s,
      2 * s,
      iceTop,
      iceMid,
      iceDark,
    );
    drawIsometricPyramid(
      ctx,
      tRx,
      tRTopY - 2 * s,
      tW * 0.6,
      14 * s,
      iceLit,
      iceDeep,
      iceMid,
    );
    for (let w2 = 0; w2 < 2; w2++) {
      const wy = tRy - tH * (0.35 + w2 * 0.25) + tW * ISO_SIN * 2;
      ctx.fillStyle = "rgba(0,30,50,0.5)";
      ctx.beginPath();
      ctx.arc(tRx, wy, 2.5 * s, Math.PI, 0);
      ctx.lineTo(tRx + 2.5 * s, wy + 4 * s);
      ctx.lineTo(tRx - 2.5 * s, wy + 4 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(100,200,255,${0.12 + pulse * 0.1})`;
      ctx.beginPath();
      ctx.arc(tRx, wy + 1 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gate arch
    const gateG = ctx.createLinearGradient(cx, cy + 2 * s, cx, cy - 14 * s);
    gateG.addColorStop(0, "rgba(0,30,50,0.7)");
    gateG.addColorStop(1, "rgba(0,50,70,0.4)");
    ctx.fillStyle = gateG;
    ctx.beginPath();
    ctx.arc(cx, cy - 6 * s, 8 * s, Math.PI, 0);
    ctx.lineTo(cx + 8 * s, cy + 2 * s);
    ctx.lineTo(cx - 8 * s, cy + 2 * s);
    ctx.closePath();
    ctx.fill();
    // Portcullis
    ctx.strokeStyle = "#546E7A";
    ctx.lineWidth = 1.2 * s;
    for (let pb = -5; pb <= 5; pb += 2.5) {
      ctx.beginPath();
      ctx.moveTo(cx + pb * s, cy - 13 * s);
      ctx.lineTo(cx + pb * s, cy + 2 * s);
      ctx.stroke();
    }
    for (let ph = 0; ph < 3; ph++) {
      ctx.beginPath();
      ctx.moveTo(cx - 7 * s, cy - 2 * s - ph * 4 * s);
      ctx.lineTo(cx + 7 * s, cy - 2 * s - ph * 4 * s);
      ctx.stroke();
    }
  } else if (ifVar === 1) {
    // Variant 1: L-shaped fortress with upper keep
    const wallW = 48 * s;
    const wallH = 22 * s;
    drawIsometricPrism(
      ctx,
      cx - 6 * s,
      cy + 3 * s,
      wallW,
      wallW,
      wallH,
      iceTop,
      iceDark,
      iceDeep,
    );
    drawMortarLines(
      ctx,
      cx - 6 * s,
      cy + 3 * s,
      wallW,
      wallH,
      4,
      "rgba(0,40,60,0.1)",
      s,
    );

    // Upper keep
    const keepW = 30 * s;
    const keepH = 18 * s;
    drawIsometricPrism(
      ctx,
      cx + 4 * s,
      cy - 19 * s,
      keepW,
      keepW,
      keepH,
      iceTop,
      iceMid,
      iceDark,
    );
    drawMortarLines(
      ctx,
      cx + 4 * s,
      cy - 19 * s,
      keepW,
      keepH,
      3,
      "rgba(0,40,60,0.1)",
      s,
    );

    // Tall corner tower
    const tW = 12 * s;
    const tH = 56 * s;
    const tX = cx + 22 * s;
    const tY = cy - 1 * s;
    drawIsometricPrism(ctx, tX, tY, tW, tW, tH, iceLit, iceDeep, iceDark);
    const tTopY = tY - tH;
    drawIsometricPrism(
      ctx,
      tX,
      tTopY,
      tW + 3 * s,
      tW + 3 * s,
      2 * s,
      iceTop,
      iceMid,
      iceDark,
    );
    drawIsometricPyramid(
      ctx,
      tX,
      tTopY - 2 * s,
      tW * 0.55,
      16 * s,
      iceLit,
      iceDeep,
      iceMid,
    );

    // Tower windows
    for (let w2 = 0; w2 < 3; w2++) {
      const wy = tY - tH * (0.25 + w2 * 0.2) + tW * ISO_SIN * 2;
      ctx.fillStyle = "rgba(0,30,50,0.5)";
      ctx.beginPath();
      ctx.arc(tX, wy, 2.5 * s, Math.PI, 0);
      ctx.lineTo(tX + 2.5 * s, wy + 4 * s);
      ctx.lineTo(tX - 2.5 * s, wy + 4 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(100,200,255,${0.12 + pulse * 0.1})`;
      ctx.beginPath();
      ctx.arc(tX, wy + 1 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Banner on tower
    ctx.strokeStyle = "#455A64";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(tX, tTopY - 2 * s);
    ctx.lineTo(tX, tTopY - 18 * s);
    ctx.stroke();
    const banG = ctx.createLinearGradient(
      tX,
      tTopY - 18 * s,
      tX + 10 * s,
      tTopY - 10 * s,
    );
    banG.addColorStop(0, "#0D47A1");
    banG.addColorStop(1, "#1565C0");
    ctx.fillStyle = banG;
    const bWave = Math.sin(time * 2.5) * 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(tX, tTopY - 18 * s);
    ctx.lineTo(tX + 10 * s + bWave, tTopY - 16 * s);
    ctx.lineTo(tX + 8 * s - bWave * 0.5, tTopY - 12 * s);
    ctx.lineTo(tX + 10 * s + bWave * 0.3, tTopY - 8 * s);
    ctx.lineTo(tX, tTopY - 10 * s);
    ctx.closePath();
    ctx.fill();

    // Arrow slits on main wall
    for (let asl = 0; asl < 4; asl++) {
      const asx = cx - 24 * s + asl * 12 * s;
      ctx.fillStyle = "rgba(0,30,50,0.5)";
      ctx.beginPath();
      ctx.ellipse(asx, cy - 8 * s, 1.5 * s, 4.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(100,200,255,${0.08 + pulse * 0.06})`;
      ctx.beginPath();
      ctx.arc(asx, cy - 8 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Icicles from upper keep edge
    drawIcicleRow(
      ctx,
      cx - 10 * s,
      cy - 19 * s,
      cx + 14 * s,
      cy - 19 * s,
      6,
      6,
      s,
      seed + 2,
    );
  } else {
    // Variant 2: Compact fortress with central keep and 2 side towers
    const wallW = 36 * s;
    const wallH = 24 * s;
    drawIsometricPrism(
      ctx,
      cx,
      cy + 3 * s,
      wallW,
      wallW,
      wallH,
      iceTop,
      iceDark,
      iceDeep,
    );
    drawMortarLines(
      ctx,
      cx,
      cy + 3 * s,
      wallW,
      wallH,
      4,
      "rgba(0,40,60,0.1)",
      s,
    );

    // Left tower
    const stW = 10 * s;
    const stH = 44 * s;
    const lTx = cx - 24 * s;
    const lTy = cy + 5 * s;
    drawIsometricPrism(ctx, lTx, lTy, stW, stW, stH, iceLit, iceDeep, iceDark);
    drawIsometricPyramid(
      ctx,
      lTx,
      lTy - stH,
      stW * 0.55,
      12 * s,
      iceLit,
      iceDeep,
      iceMid,
    );

    // Right tower
    const rTx = cx + 24 * s;
    const rTy = cy - 1 * s;
    drawIsometricPrism(ctx, rTx, rTy, stW, stW, stH, iceLit, iceDeep, iceDark);
    drawIsometricPyramid(
      ctx,
      rTx,
      rTy - stH,
      stW * 0.55,
      12 * s,
      iceLit,
      iceDeep,
      iceMid,
    );

    // Central keep (tallest)
    const ckW = 13 * s;
    const ckH = 58 * s;
    drawIsometricPrism(
      ctx,
      cx,
      cy - 7 * s,
      ckW,
      ckW,
      ckH,
      iceLit,
      iceDeep,
      iceDark,
    );
    const ckTopY = cy - 7 * s - ckH;
    drawIsometricPrism(
      ctx,
      cx,
      ckTopY,
      ckW + 3 * s,
      ckW + 3 * s,
      2 * s,
      iceTop,
      iceMid,
      iceDark,
    );
    drawIsometricPyramid(
      ctx,
      cx,
      ckTopY - 2 * s,
      ckW * 0.5,
      18 * s,
      iceLit,
      iceDeep,
      iceMid,
    );

    // Keep windows
    for (let w2 = 0; w2 < 3; w2++) {
      const wy = cy - 7 * s - ckH * (0.25 + w2 * 0.2) + ckW * ISO_SIN * 2;
      ctx.fillStyle = "rgba(0,30,50,0.5)";
      ctx.beginPath();
      ctx.arc(cx, wy, 2.5 * s, Math.PI, 0);
      ctx.lineTo(cx + 2.5 * s, wy + 4 * s);
      ctx.lineTo(cx - 2.5 * s, wy + 4 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(100,200,255,${0.12 + pulse * 0.1})`;
      ctx.beginPath();
      ctx.arc(cx, wy + 1 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Banner on central keep
    ctx.strokeStyle = "#455A64";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx, ckTopY - 2 * s);
    ctx.lineTo(cx, ckTopY - 18 * s);
    ctx.stroke();
    const banG2 = ctx.createLinearGradient(
      cx,
      ckTopY - 18 * s,
      cx + 10 * s,
      ckTopY - 10 * s,
    );
    banG2.addColorStop(0, "#0D47A1");
    banG2.addColorStop(1, "#1565C0");
    ctx.fillStyle = banG2;
    ctx.beginPath();
    ctx.moveTo(cx, ckTopY - 18 * s);
    ctx.lineTo(cx + 10 * s, ckTopY - 16 * s);
    ctx.lineTo(cx + 8 * s, ckTopY - 12 * s);
    ctx.lineTo(cx + 10 * s, ckTopY - 8 * s);
    ctx.lineTo(cx, ckTopY - 10 * s);
    ctx.closePath();
    ctx.fill();

    // Frost aura around central keep
    const ifAura = ctx.createRadialGradient(
      cx,
      cy - 40 * s,
      0,
      cx,
      cy - 40 * s,
      30 * s,
    );
    ifAura.addColorStop(0, `rgba(128,222,234,${0.12 + pulse * 0.06})`);
    ifAura.addColorStop(0.6, "rgba(128,222,234,0.04)");
    ifAura.addColorStop(1, "transparent");
    ctx.fillStyle = ifAura;
    ctx.beginPath();
    ctx.arc(cx, cy - 40 * s, 30 * s, 0, Math.PI * 2);
    ctx.fill();

    // Crenellations on wall
    const wTopY = cy + 3 * s - wallH;
    const wI = wallW * ISO_COS;
    const wD = wallW * ISO_SIN;
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      drawIsometricPrism(
        ctx,
        cx - wI * (1 - t),
        wTopY + wD * t,
        3 * s,
        3 * s,
        3.5 * s,
        snowWhite,
        iceMid,
        iceDark,
      );
      drawIsometricPrism(
        ctx,
        cx + wI * t,
        wTopY + wD * (1 - t),
        3 * s,
        3 * s,
        3.5 * s,
        snowWhite,
        iceMid,
        iceDark,
      );
    }

    // Icicles on wall edges
    drawIcicleRow(
      ctx,
      cx - wI,
      cy + 3 * s + wD,
      cx,
      cy + 3 * s + wD * 2,
      6,
      5,
      s,
      seed,
    );
  }

  // Snow on all top surfaces
  ctx.fillStyle = "rgba(240,248,255,0.4)";
  drawOrganicBlobAt(ctx, cx, cy - 10 * s, 16 * s, 6 * s, seed + 5, 0.12);
  ctx.fill();

  // Frost particles
  ctx.fillStyle = "rgba(200,235,255,0.65)";
  for (let fp = 0; fp < 10; fp++) {
    const fAngle = (fp / 10) * Math.PI * 2 + time * 0.25;
    const fR = (32 + Math.sin(time * 0.7 + fp * 1.1) * 10) * s;
    const fy = cy - 28 * s + Math.cos(time * 0.4 + fp) * 10 * s;
    const fpSize = (0.9 + Math.sin(time * 0.8 + fp) * 0.3) * s;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(fAngle) * fR, fy, fpSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// =========================================================================
// SKULL THRONE
// =========================================================================

export function renderSkullThrone(p: LandmarkParams): void {
  const { ctx, screenX: cx, screenY: cy, s, time, skipShadow, shadowOnly } = p;

  if (!skipShadow) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(cx + 3 * s, cy + 8 * s, Math.min(30 * s, MAX_SHADOW_RX), Math.min(14 * s, MAX_SHADOW_RY), 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  if (shadowOnly) return;

  const pulse = 0.5 + Math.sin(time * 2.2) * 0.25;
  const bW = "#e8e0d0";
  const bL = "#d8d0c0";
  const bM = "#c0b0a0";
  const bD = "#a09080";
  const bSh = "#786858";
  const deep = "#2a1a0c";
  const redGl = "#cc2020";

  // Dark aura glow
  const auraG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35 * s);
  auraG.addColorStop(0, `rgba(200,30,30,${0.1 + pulse * 0.06})`);
  auraG.addColorStop(1, "transparent");
  ctx.fillStyle = auraG;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10 * s, 35 * s, 18 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base tier 1
  drawIsometricPrism(ctx, cx, cy, 28 * s, 28 * s, 5 * s, bD, bSh, bSh);
  drawMortarLines(ctx, cx, cy, 28 * s, 5 * s, 3, "rgba(90,70,55,0.2)", s);

  // Base tier 2
  drawIsometricPrism(ctx, cx, cy - 5 * s, 22 * s, 22 * s, 4 * s, bM, bSh, bD);

  // Base skulls scattered around platform
  const baseSkulls = [
    [-14, 3, 3.2, 1],
    [14, 3, 3.2, -1],
    [-8, 6, 3.5, 1],
    [8, 6, 3.5, -1],
    [0, 8, 3.8, 1],
    [-18, 0, 2.8, 1],
    [18, 0, 2.8, -1],
    [-5, -1, 3, 1],
    [5, -1, 3, -1],
  ] as const;
  for (const [dx, dy, sz, f] of baseSkulls) {
    drawIsoSkull3D(ctx, cx + dx * s, cy + dy * s, sz * s, f, bW, bM, bD);
  }

  // Throne seat
  const seatW = 14 * s;
  const seatH = 10 * s;
  const seatBase = cy - 9 * s;
  drawIsometricPrism(ctx, cx, seatBase, seatW, seatW, seatH, bM, bSh, bD);
  const seatI = seatW * ISO_COS;
  const seatD = seatW * ISO_SIN;
  const seatTop = seatBase - seatH;
  drawMortarLines(ctx, cx, seatBase, seatW, seatH, 3, bSh, s);
  ctx.strokeStyle = bL;
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx, seatBase + seatD * 2);
  ctx.lineTo(cx, seatTop + seatD * 2);
  ctx.stroke();

  // Red velvet cushion
  const cushG = ctx.createLinearGradient(cx, seatTop, cx, seatTop + 3 * s);
  cushG.addColorStop(0, "#6a1020");
  cushG.addColorStop(0.5, "#901838");
  cushG.addColorStop(1, "#501018");
  ctx.fillStyle = cushG;
  ctx.beginPath();
  ctx.moveTo(cx, seatTop + 0.5 * s);
  ctx.lineTo(cx + seatI * 0.85, seatTop + seatD * 0.85 + 0.5 * s);
  ctx.lineTo(cx, seatTop + seatD * 1.7 + 0.5 * s);
  ctx.lineTo(cx - seatI * 0.85, seatTop + seatD * 0.85 + 0.5 * s);
  ctx.closePath();
  ctx.fill();

  // Backrest (tapered bone tower)
  const bkW = 16 * s;
  const bkTW = 8 * s;
  const bkH = 55 * s;
  const bkBase = seatTop;
  const bkTop = bkBase - bkH;
  const bkI = bkW * ISO_COS;
  const bkD2 = bkW * ISO_SIN;
  const bkTI = bkTW * ISO_COS;
  const bkTD = bkTW * ISO_SIN;

  // Backrest left face with gradient
  const bkLG = ctx.createLinearGradient(
    cx - bkI,
    bkBase + bkD2,
    cx,
    bkTop + bkTD,
  );
  bkLG.addColorStop(0, bSh);
  bkLG.addColorStop(0.4, "#8a7a6a");
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
  bkRG.addColorStop(0.4, "#9a8a7a");
  bkRG.addColorStop(1, "#7a6a5a");
  ctx.fillStyle = bkRG;
  ctx.beginPath();
  ctx.moveTo(cx + bkI, bkBase + bkD2);
  ctx.lineTo(cx, bkBase + bkD2 * 2);
  ctx.lineTo(cx, bkTop + bkTD * 2);
  ctx.lineTo(cx + bkTI, bkTop + bkTD);
  ctx.closePath();
  ctx.fill();
  // Front face
  ctx.fillStyle = bM;
  ctx.beginPath();
  ctx.moveTo(cx - bkI, bkBase + bkD2);
  ctx.lineTo(cx + bkI, bkBase + bkD2);
  ctx.lineTo(cx + bkTI, bkTop + bkTD);
  ctx.lineTo(cx, bkTop);
  ctx.lineTo(cx - bkTI, bkTop + bkTD);
  ctx.closePath();
  ctx.fill();

  // Spine ridge lines on backrest
  ctx.strokeStyle = bL;
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(cx, bkBase + bkD2 * 2);
  ctx.lineTo(cx, bkTop + bkTD * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - bkI, bkBase + bkD2);
  ctx.lineTo(cx - bkTI, bkTop + bkTD);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + bkI, bkBase + bkD2);
  ctx.lineTo(cx + bkTI, bkTop + bkTD);
  ctx.stroke();

  // Embedded skulls on backrest
  const embSkulls = [
    [0.25, -0.3, 3.5],
    [0.45, 0.2, 3],
    [0.65, -0.2, 3.2],
    [0.35, 0.4, 2.8],
    [0.55, -0.45, 2.8],
    [0.8, 0.1, 2.5],
  ] as const;
  for (const [ht, xOff, sz] of embSkulls) {
    const esy = bkBase + (bkTop - bkBase) * ht;
    const eI = bkI + (bkTI - bkI) * ht;
    const eD = bkD2 + (bkTD - bkD2) * ht;
    const esx = cx + xOff * eI;
    const esy2 = esy + eD * (1 + xOff * 0.5);
    drawIsoSkull3D(ctx, esx, esy2, sz * s, xOff < 0 ? -1 : 1, bW, bM, bD);
  }

  // Armrests with skull caps
  for (const side of [-1, 1]) {
    const ax = cx + side * seatI * 1.05;
    const ay = seatTop + seatD + 1 * s;
    ctx.fillStyle = bD;
    ctx.beginPath();
    ctx.moveTo(cx + side * seatI * 0.8, seatTop + seatD * 0.8);
    ctx.lineTo(ax, ay - 2 * s);
    ctx.lineTo(ax, ay - 8 * s);
    ctx.lineTo(cx + side * seatI * 0.8, seatTop + seatD * 0.8 - 5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = bM;
    ctx.lineWidth = 0.5 * s;
    ctx.stroke();
    drawIsoSkull3D(
      ctx,
      ax,
      ay - 5 * s,
      2.5 * s,
      side,
      bL,
      bM,
      bD,
      `rgba(200,30,30,1)`,
      0.4 + pulse * 0.25,
    );
  }

  // Bone spikes at crown
  [-10, -5, 0, 5, 10].forEach((off, idx) => {
    const spkH = idx === 2 ? 16 * s : 10 * s;
    const spkW = idx === 2 ? 2.5 * s : 1.8 * s;
    const spkY = bkTop + bkTD + (idx === 2 ? -1 * s : 3 * s);
    drawIsometricPyramid(ctx, cx + off * s, spkY, spkW, spkH, bW, bSh, bM);
  });

  // Crown skull with glowing eyes
  const cSkY = bkTop + bkTD + 10 * s;
  drawIsoSkull3D(ctx, cx, cSkY, 5.5 * s, 1, bW, bM, bD);
  ctx.fillStyle = deep;
  const crEyeOff = 5.5 * 0.36 * s;
  ctx.beginPath();
  ctx.ellipse(
    cx - crEyeOff,
    cSkY + 5.5 * 0.04 * s,
    1.3 * s,
    1.8 * s,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    cx + crEyeOff,
    cSkY + 5.5 * 0.04 * s,
    1.3 * s,
    1.8 * s,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  setShadowBlur(ctx, 12 * s, redGl);
  ctx.fillStyle = `rgba(220,30,30,${0.5 + pulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(cx - crEyeOff, cSkY + 5.5 * 0.04 * s, 1.6 * s, 0, Math.PI * 2);
  ctx.arc(cx + crEyeOff, cSkY + 5.5 * 0.04 * s, 1.6 * s, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Red energy line on backrest
  setShadowBlur(ctx, 6 * s, redGl);
  ctx.strokeStyle = `rgba(200,30,30,${0.3 + pulse * 0.2})`;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(cx, bkBase + bkD2 * 0.3);
  ctx.lineTo(cx, bkTop + bkTD + 18 * s);
  ctx.stroke();
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 2.5 * s, bkTop + bkTD + 22 * s);
  ctx.lineTo(cx, bkTop + bkTD + 16 * s);
  ctx.lineTo(cx + 2.5 * s, bkTop + bkTD + 22 * s);
  ctx.stroke();
  clearShadow(ctx);

  // Iron chains hanging from backrest spikes
  ctx.lineCap = "round";
  for (const xOff of [-8, 0, 8]) {
    const chainTop = bkTop + bkTD + 4 * s;
    const chainLen = 18 + Math.abs(xOff) * 0.5;
    const chainSway = Math.sin(time * 1.2 + xOff * 0.3) * 1.5 * s;
    ctx.strokeStyle = "#4a4a50";
    ctx.lineWidth = 0.9 * s;
    for (let link = 0; link < 6; link++) {
      const ly = chainTop + link * 3 * s;
      const lx = cx + xOff * s + chainSway * (link / 6);
      ctx.beginPath();
      ctx.ellipse(
        lx,
        ly,
        link % 2 === 0 ? 1.2 * s : 1.8 * s,
        link % 2 === 0 ? 1.8 * s : 1.2 * s,
        link % 2 === 1 ? 0.3 : 0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.fillStyle = "#3a3a40";
    ctx.beginPath();
    ctx.arc(
      cx + xOff * s + chainSway,
      chainTop + chainLen * s,
      1.5 * s,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Red soul particles
  for (let i = 0; i < 5; i++) {
    const pt = (time * 0.5 + i * 0.5) % 2;
    const ang = (i / 5) * Math.PI * 2 + time * 0.25;
    const dr = 16 * s + Math.sin(pt * Math.PI) * 6 * s;
    const px = cx + Math.cos(ang) * dr;
    const py = bkTop + 8 * s - pt * 10 * s;
    const pa = Math.max(0, (1 - pt / 2) * 0.35);
    ctx.fillStyle = `rgba(150,20,20,${pa})`;
    ctx.beginPath();
    ctx.arc(px, py, (1.8 - pt * 0.5) * s, 0, Math.PI * 2);
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
  } = p;

  if (!skipShadow) {
    const shRx = Math.min(55 * s, MAX_SHADOW_RX);
    const shRy = Math.min(24 * s, MAX_SHADOW_RY);
    const shGrad = ctx.createRadialGradient(
      cx + 4 * s, cy + 10 * s, 0,
      cx + 4 * s, cy + 10 * s, shRx,
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
  } = p;
  const cy = rawCy - 8 * s;

  if (!skipShadow) {
    const shRx = Math.min(50 * s, MAX_SHADOW_RX);
    const shRy = Math.min(22 * s, MAX_SHADOW_RY);
    const shGrad = ctx.createRadialGradient(
      cx, cy + 8 * s, 0,
      cx, cy + 8 * s, shRx,
    );
    shGrad.addColorStop(0, "rgba(20,40,20,0.45)");
    shGrad.addColorStop(0.4, "rgba(0,0,0,0.25)");
    shGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8 * s, shRx, shRy, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (shadowOnly) return;

  const pulse = 0.5 + Math.sin(time * 2.2) * 0.3;
  const boneW = "#d4c8b8";
  const boneL = "#c4b8a8";
  const boneSh = "#8a7a6a";
  const boneDk = "#6a5a4a";

  // Corrupted ground
  const corruptGrad = ctx.createRadialGradient(cx, cy, 6 * s, cx, cy, 44 * s);
  corruptGrad.addColorStop(0, "rgba(50,20,60,0.5)");
  corruptGrad.addColorStop(0.3, "rgba(30,30,20,0.35)");
  corruptGrad.addColorStop(0.6, "rgba(15,20,10,0.2)");
  corruptGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = corruptGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 44 * s, 20 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark corruption veins
  ctx.strokeStyle = `rgba(50,20,60,${0.15 + pulse * 0.1})`;
  ctx.lineWidth = 0.8 * s;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + 0.3;
    const vLen = (25 + Math.sin(seedX + i * 2) * 8) * s;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 12 * s, cy + Math.sin(angle) * 5 * s);
    ctx.quadraticCurveTo(
      cx + Math.cos(angle + 0.2) * vLen * 0.6,
      cy + Math.sin(angle + 0.2) * vLen * 0.3,
      cx + Math.cos(angle) * vLen,
      cy + Math.sin(angle) * vLen * 0.45,
    );
    ctx.stroke();
  }

  // Scattered bones
  ctx.lineCap = "round";
  for (const ba of [0.3, 1.0, 1.8, 2.7, 3.6, 4.5, 5.4]) {
    const bx = cx + Math.cos(ba) * (26 + Math.sin(ba * 3) * 4) * s;
    const by = cy + Math.sin(ba) * (11 + Math.cos(ba * 2) * 3) * s;
    const bAng = ba * 0.7 + 0.3;
    ctx.strokeStyle = boneSh;
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(bx - Math.cos(bAng) * 3.5 * s, by - Math.sin(bAng) * 1.5 * s);
    ctx.lineTo(bx + Math.cos(bAng) * 3.5 * s, by + Math.sin(bAng) * 1.5 * s);
    ctx.stroke();
    ctx.fillStyle = boneL;
    ctx.beginPath();
    ctx.arc(
      bx - Math.cos(bAng) * 3.5 * s,
      by - Math.sin(bAng) * 1.5 * s,
      1 * s,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      bx + Math.cos(bAng) * 3.5 * s,
      by + Math.sin(bAng) * 1.5 * s,
      1 * s,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Glowing rune circle
  setShadowBlur(ctx, 6 * s, "#44ff44");
  ctx.strokeStyle = `rgba(80,255,80,${0.2 + pulse * 0.3})`;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 3 * s, 24 * s, 11 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + time * 0.15;
    const rx = cx + Math.cos(angle) * 24 * s;
    const ry = cy + 3 * s + Math.sin(angle) * 11 * s;
    ctx.fillStyle = `rgba(80,255,80,${0.3 + pulse * 0.35})`;
    ctx.beginPath();
    ctx.moveTo(rx, ry - 2 * s);
    ctx.lineTo(rx + 1.5 * s, ry);
    ctx.lineTo(rx, ry + 1.5 * s);
    ctx.lineTo(rx - 1.5 * s, ry);
    ctx.closePath();
    ctx.fill();
  }
  clearShadow(ctx);

  // Base bone platform
  drawIsometricPrism(
    ctx,
    cx,
    cy,
    32 * s,
    32 * s,
    5 * s,
    boneSh,
    boneDk,
    "#7a6a5a",
  );
  const plI = 32 * s * ISO_COS;

  // Tier 2
  drawIsometricPrism(
    ctx,
    cx,
    cy - 5 * s,
    24 * s,
    24 * s,
    7 * s,
    boneW,
    boneSh,
    boneDk,
  );
  // Bone texture overlay
  const boneSheen = ctx.createLinearGradient(cx, cy - 5 * s, cx, cy - 12 * s);
  boneSheen.addColorStop(0, "rgba(200,185,165,0.1)");
  boneSheen.addColorStop(1, "rgba(180,165,145,0)");
  prismFaceOverlay(ctx, cx, cy - 5 * s, 24 * s, 7 * s, "left", boneSheen);

  // Skull reliefs on tier 2
  const t2I = 24 * s * ISO_COS;
  const t2D = 24 * s * ISO_SIN;
  for (let face = 0; face < 2; face++) {
    for (let i = 0; i < 2; i++) {
      const t = (i + 0.5) / 2;
      const rx = face === 0 ? cx - t2I * (1 - t) : cx + t2I * t;
      const ry =
        cy - 5 * s + t2D * (face === 0 ? 2 * t - 1 : 1 - 2 * t) - 3.5 * s;
      drawIsoSkull3D(
        ctx,
        rx,
        ry,
        2.2 * s,
        face === 0 ? 1 : -1,
        boneL,
        boneSh,
        boneDk,
      );
    }
  }

  // Skulls sitting on ledge between tiers
  [
    { x: cx - plI * 0.65, y: cy - 5 * s + 32 * s * ISO_SIN * 0.3 },
    { x: cx - plI * 0.2, y: cy - 5 * s + 32 * s * ISO_SIN * 0.8 },
    { x: cx + plI * 0.35, y: cy - 5 * s + 32 * s * ISO_SIN * 0.55 },
    { x: cx + plI * 0.7, y: cy - 5 * s - 32 * s * ISO_SIN * 0.05 },
  ].forEach(({ x: lx, y: ly }) => {
    drawIsoSkull3D(ctx, lx, ly - 3 * s, 2 * s, 1, boneL, boneSh, boneDk);
  });

  // Tier 3
  drawIsometricPrism(
    ctx,
    cx,
    cy - 12 * s,
    16 * s,
    16 * s,
    6 * s,
    boneW,
    boneSh,
    boneDk,
  );

  // Top centerpiece skull (large, detailed)
  const topSkY = cy - 21 * s;
  drawIsoSkull3D(ctx, cx, topSkY, 5 * s, 1, boneW, boneL, boneSh);
  // Extra skull detail: cranium highlight
  ctx.fillStyle = "#ddd4c8";
  ctx.beginPath();
  ctx.ellipse(cx - 1 * s, topSkY - 2 * s, 3 * s, 3.5 * s, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Eye glow
  const eyeOff = 5 * 0.36 * s;
  ctx.fillStyle = `rgba(80,255,100,${0.4 + pulse * 0.4})`;
  ctx.beginPath();
  ctx.arc(cx - eyeOff, topSkY + 5 * 0.04 * s, 0.8 * s, 0, Math.PI * 2);
  ctx.arc(cx + eyeOff, topSkY + 5 * 0.04 * s, 0.8 * s, 0, Math.PI * 2);
  ctx.fill();

  // Green/purple necromantic flame
  const flameY = cy - 28 * s;
  drawMultiFlame(
    ctx,
    cx,
    flameY,
    7 * s,
    20 * s,
    time,
    0,
    `rgba(30,200,60,${0.3 + pulse * 0.25})`,
    `rgba(50,255,80,${0.45 + pulse * 0.3})`,
    `rgba(170,80,255,${0.55 + pulse * 0.3})`,
    "#33ff66",
    16 * s,
  );

  // Green wisps
  for (let i = 0; i < 3; i++) {
    const wPhase = time * 1.5 + i * 2 + seedX;
    const wAlpha = Math.max(0, Math.sin(wPhase) * 0.3);
    if (wAlpha > 0.05) {
      const wx = cx + Math.sin(wPhase * 0.6) * 12 * s;
      const wy = flameY - 4 * s - ((time * 10 + i * 8) % 25) * s;
      ctx.fillStyle = `rgba(80,255,100,${wAlpha})`;
      ctx.beginPath();
      ctx.ellipse(wx, wy, 2 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ritual candles at platform corners
  [
    { x: cx - plI * 0.85, y: cy + 32 * s * 0.25 * 0.15 - 5 * s },
    { x: cx + plI * 0.85, y: cy - 32 * s * 0.25 * 0.15 - 5 * s },
    { x: cx - plI * 0.3, y: cy + 32 * s * 0.25 * 0.7 - 5 * s },
    { x: cx + plI * 0.3, y: cy - 32 * s * 0.25 * 0.7 + 32 * s * 0.25 - 5 * s },
  ].forEach(({ x: cdx, y: cdy }, cdIdx) => {
    ctx.fillStyle = boneSh;
    ctx.fillRect(cdx - 0.6 * s, cdy, 1.2 * s, 3.5 * s);
    ctx.fillStyle = "#2a1a2a";
    ctx.beginPath();
    ctx.ellipse(cdx, cdy, 1.5 * s, 0.7 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    drawMultiFlame(
      ctx,
      cdx,
      cdy,
      1 * s,
      5 * s,
      time,
      cdIdx + 5,
      `rgba(50,255,80,${0.45 + pulse * 0.3})`,
      `rgba(150,255,180,${0.6 + pulse * 0.2})`,
      `rgba(200,255,220,${0.7 + pulse * 0.15})`,
      "#44ff66",
      5 * s,
    );
  });

  // Rib cage frame around tier 3
  const ribBaseY = cy - 12 * s;
  const ribI = 16 * s * ISO_COS;
  for (const side of [-1, 1]) {
    for (let rib = 0; rib < 3; rib++) {
      const ribT = (rib + 0.5) / 3;
      const ribStartX = cx + side * ribI * ribT;
      const ribStartY =
        ribBaseY +
        (side < 0
          ? 16 * s * ISO_SIN * ribT
          : -16 * s * ISO_SIN * ribT + 16 * s * ISO_SIN);
      ctx.strokeStyle = boneL;
      ctx.lineWidth = 0.8 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ribStartX, ribStartY - 6 * s);
      ctx.quadraticCurveTo(
        ribStartX + side * 3 * s,
        (ribStartY + cy - 16 * s) * 0.5 - 8 * s,
        ribStartX + side * 1 * s,
        cy - 16 * s,
      );
      ctx.stroke();
    }
  }

  // Corrupted mushrooms
  [
    { x: cx - 30 * s, y: cy + 8 * s, sz: 1.0 },
    { x: cx + 26 * s, y: cy - 6 * s, sz: 0.8 },
    { x: cx - 18 * s, y: cy + 12 * s, sz: 0.7 },
    { x: cx + 34 * s, y: cy + 2 * s, sz: 0.6 },
  ].forEach(({ x: mx, y: my, sz: msz }) => {
    ctx.fillStyle = "#4a3050";
    ctx.fillRect(
      mx - 0.4 * s * msz,
      my - 2 * s * msz,
      0.8 * s * msz,
      2.5 * s * msz,
    );
    const capGr = ctx.createRadialGradient(
      mx,
      my - 2.5 * s * msz,
      0,
      mx,
      my - 2.5 * s * msz,
      2.5 * s * msz,
    );
    capGr.addColorStop(0, "#6a3080");
    capGr.addColorStop(0.6, "#4a2060");
    capGr.addColorStop(1, "#2a1040");
    ctx.fillStyle = capGr;
    ctx.beginPath();
    ctx.ellipse(
      mx,
      my - 2.5 * s * msz,
      2.5 * s * msz,
      1.5 * s * msz,
      0,
      Math.PI,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = `rgba(100,255,120,${0.3 + pulse * 0.2})`;
    ctx.beginPath();
    ctx.arc(
      mx - 0.5 * s * msz,
      my - 3 * s * msz,
      0.3 * s * msz,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  // Floating bone fragments
  for (let fb = 0; fb < 4; fb++) {
    const fbPh = time * 1.2 + fb * 1.6;
    const fbX = cx + Math.sin(fbPh * 0.5) * 15 * s;
    const fbY = cy - 10 * s - Math.sin(fbPh * 0.8) * 8 * s - fb * 4 * s;
    const fbAlpha = 0.2 + Math.sin(fbPh) * 0.15;
    ctx.fillStyle = `rgba(200,185,165,${fbAlpha})`;
    ctx.beginPath();
    ctx.ellipse(fbX, fbY, 1.5 * s, 0.5 * s, fbPh * 0.4, 0, Math.PI * 2);
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
  } = p;

  if (!skipShadow) {
    const shRx = Math.min(50 * s, MAX_SHADOW_RX);
    const shRy = Math.min(22 * s, MAX_SHADOW_RY);
    const shGrad = ctx.createRadialGradient(
      cx + 5 * s, cy + 10 * s, 0,
      cx + 5 * s, cy + 10 * s, shRx,
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
  } = p;
  const cy = rawCy - 18 * s;

  if (!skipShadow) {
    const shRx = Math.min(45 * s, MAX_SHADOW_RX);
    const shRy = Math.min(20 * s, MAX_SHADOW_RY);
    const shGrad = ctx.createRadialGradient(
      cx + 4 * s, cy + 12 * s, 0,
      cx + 4 * s, cy + 12 * s, shRx,
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
  } = p;

  if (!skipShadow) {
    const shRx = Math.min(60 * s, MAX_SHADOW_RX);
    const shRy = Math.min(26 * s, MAX_SHADOW_RY);
    const shGrad = ctx.createRadialGradient(
      cx, cy + 10 * s, 0,
      cx, cy + 10 * s, shRx,
    );
    shGrad.addColorStop(0, "rgba(180,40,0,0.35)");
    shGrad.addColorStop(0.25, "rgba(0,0,0,0.4)");
    shGrad.addColorStop(0.6, "rgba(0,0,0,0.15)");
    shGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10 * s, shRx, shRy, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (shadowOnly) return;

  const pulse = 0.5 + Math.sin(time * 2.5) * 0.25;
  const igLava = "#ff4400";
  const igObs = "#101018";
  const igObsDk = "#080810";
  const igObsMd = "#1a1a26";
  const igObsLt = "#2a2a3c";

  // Scorched earth with lava cracks
  const scorchGrad = ctx.createRadialGradient(cx, cy, 8 * s, cx, cy, 50 * s);
  scorchGrad.addColorStop(0, "rgba(50,12,0,0.55)");
  scorchGrad.addColorStop(0.3, "rgba(30,8,0,0.35)");
  scorchGrad.addColorStop(0.6, "rgba(15,4,0,0.15)");
  scorchGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = scorchGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 50 * s, 22 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(255,80,10,${0.1 + pulse * 0.1})`;
  ctx.lineWidth = 0.6 * s;
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 + 0.7;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * 14 * s, cy + Math.sin(ang) * 6 * s);
    ctx.lineTo(cx + Math.cos(ang) * 35 * s, cy + Math.sin(ang) * 15 * s);
    ctx.stroke();
  }

  // Base platform
  drawIsometricPrism(
    ctx,
    cx,
    cy,
    40 * s,
    40 * s,
    5 * s,
    igObsMd,
    igObsDk,
    igObs,
  );
  drawIsometricPrism(
    ctx,
    cx,
    cy - 5 * s,
    34 * s,
    34 * s,
    2 * s,
    igObsLt,
    igObsMd,
    igObsDk,
  );

  // Lava pool in center
  const lavaGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16 * s);
  lavaGrad.addColorStop(0, `rgba(255,200,50,${0.65 + pulse * 0.3})`);
  lavaGrad.addColorStop(0.3, `rgba(255,120,20,${0.55 + pulse * 0.25})`);
  lavaGrad.addColorStop(0.7, `rgba(200,40,0,${0.35 + pulse * 0.15})`);
  lavaGrad.addColorStop(1, `rgba(120,15,0,${0.2 + pulse * 0.08})`);
  ctx.fillStyle = lavaGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 16 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Lava crust
  ctx.strokeStyle = `rgba(80,20,0,${0.2 + pulse * 0.1})`;
  ctx.lineWidth = 0.5 * s;
  for (let i = 0; i < 3; i++) {
    const crustAng = (i / 3) * Math.PI + time * 0.1;
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.cos(crustAng) * 4 * s,
      cy + Math.sin(crustAng) * 2 * s,
      5 * s,
      2 * s,
      crustAng,
      0,
      Math.PI,
    );
    ctx.stroke();
  }
  // Bubbles
  for (let i = 0; i < 4; i++) {
    const bPh = time * 3.5 + i * 1.7 + seedX;
    const bAlpha = Math.max(0, Math.sin(bPh) * 0.55);
    if (bAlpha > 0.05) {
      const bx = cx + Math.cos(bPh * 0.6) * 10 * s;
      const by = cy + Math.sin(bPh * 0.4) * 4 * s;
      ctx.fillStyle = `rgba(255,210,70,${bAlpha})`;
      ctx.beginPath();
      ctx.arc(bx, by, (1 + Math.sin(bPh * 2) * 0.5) * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Twin obsidian pillars
  const igPW = 11 * s;
  const igPH = 65 * s;
  const igPillarOff = 18 * s;
  const igLPx = cx - igPillarOff;
  const igLPy = cy + igPillarOff * 0.36;
  const igRPx = cx + igPillarOff;
  const igRPy = cy - igPillarOff * 0.36;
  drawIsometricPrism(
    ctx,
    igLPx,
    igLPy,
    igPW,
    igPW,
    igPH,
    igObsLt,
    igObsDk,
    igObs,
  );
  drawIsometricPrism(
    ctx,
    igRPx,
    igRPy,
    igPW,
    igPW,
    igPH,
    igObsLt,
    igObsDk,
    igObs,
  );

  // Obsidian sheen overlays on pillars
  const pillarSheen = ctx.createLinearGradient(cx, cy, cx, cy - igPH);
  pillarSheen.addColorStop(0, "rgba(40,40,60,0.12)");
  pillarSheen.addColorStop(0.5, "rgba(30,30,50,0.04)");
  pillarSheen.addColorStop(1, "rgba(40,40,60,0.08)");
  prismFaceOverlay(ctx, igLPx, igLPy, igPW, igPH, "left", pillarSheen);
  prismFaceOverlay(ctx, igRPx, igRPy, igPW, igPH, "left", pillarSheen);

  // Skull decorations on pillars
  setShadowBlur(ctx, 3 * s, igLava);
  for (const { px, py } of [
    { px: igLPx, py: igLPy },
    { px: igRPx, py: igRPy },
  ]) {
    // Rune engravings
    ctx.strokeStyle = `rgba(255,80,20,${0.15 + pulse * 0.2})`;
    ctx.lineWidth = 0.5 * s;
    for (let i = 0; i < 4; i++) {
      const ry = py - igPH * ((i + 1) / 5);
      const rD = igPW * ISO_SIN;
      ctx.beginPath();
      ctx.moveTo(px - 1 * s, ry + rD * 2);
      ctx.lineTo(px + 1 * s, ry + rD * 2 - 3 * s);
      ctx.lineTo(px - 1 * s, ry + rD * 2 - 6 * s);
      ctx.stroke();
    }
    // Skulls on pillars
    for (let i = 0; i < 3; i++) {
      const sy = py - igPH * ((i + 1) / 4);
      const skD = igPW * ISO_SIN;
      drawIsoSkull3D(
        ctx,
        px,
        sy + skD * 2,
        3.5 * s,
        1,
        "#c8b8a8",
        "#a89888",
        "#786858",
        `rgba(255,50,15,1)`,
        0.3 + pulse * 0.3,
      );
    }
  }
  clearShadow(ctx);

  // Archway connecting pillars
  const igArchTopL = igLPy - igPH;
  const igArchTopR = igRPy - igPH;
  const igArchMidX = (igLPx + igRPx) / 2;
  const igArchMidY = (igArchTopL + igArchTopR) / 2 - 10 * s;

  const archGrad = ctx.createLinearGradient(
    igLPx,
    igArchTopL,
    igRPx,
    igArchTopR,
  );
  archGrad.addColorStop(0, "#1e1e2a");
  archGrad.addColorStop(0.5, "#2a2a3a");
  archGrad.addColorStop(1, "#1e1e2a");
  ctx.fillStyle = archGrad;
  ctx.beginPath();
  ctx.moveTo(igLPx, igArchTopL + 3 * s);
  ctx.quadraticCurveTo(
    igArchMidX,
    igArchMidY - 2 * s,
    igRPx,
    igArchTopR + 3 * s,
  );
  ctx.lineTo(igRPx, igArchTopR + 12 * s);
  ctx.quadraticCurveTo(
    igArchMidX,
    igArchMidY + 10 * s,
    igLPx,
    igArchTopL + 12 * s,
  );
  ctx.closePath();
  ctx.fill();

  // Arch lava trim
  setShadowBlur(ctx, 4 * s, igLava);
  ctx.strokeStyle = `rgba(255,80,10,${0.15 + pulse * 0.15})`;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.moveTo(igLPx, igArchTopL + 5 * s);
  ctx.quadraticCurveTo(igArchMidX, igArchMidY, igRPx, igArchTopR + 5 * s);
  ctx.stroke();
  clearShadow(ctx);

  // Horn caps on pillars
  for (const side of [-1, 1]) {
    const hx = side < 0 ? igLPx : igRPx;
    const hy = side < 0 ? igArchTopL : igArchTopR;
    drawIsometricPyramid(
      ctx,
      hx,
      hy,
      igPW * 0.5,
      20 * s,
      igObsLt,
      igObsDk,
      igObsMd,
    );
    ctx.fillStyle = `rgba(255,60,10,${0.15 + pulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(hx, hy + igPW * 0.125 - 20 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark portal energy
  const igPortCx = igArchMidX;
  const igPortCy = igArchMidY + 20 * s;
  const portalGrad = ctx.createRadialGradient(
    igPortCx,
    igPortCy,
    0,
    igPortCx,
    igPortCy,
    14 * s,
  );
  portalGrad.addColorStop(0, `rgba(100,0,150,${0.55 + pulse * 0.3})`);
  portalGrad.addColorStop(0.3, `rgba(60,0,100,${0.4 + pulse * 0.2})`);
  portalGrad.addColorStop(0.6, `rgba(30,0,50,${0.2 + pulse * 0.1})`);
  portalGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = portalGrad;
  ctx.beginPath();
  ctx.ellipse(igPortCx, igPortCy, 13 * s, 16 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swirl tendrils
  ctx.strokeStyle = `rgba(180,50,220,${0.2 + pulse * 0.2})`;
  ctx.lineWidth = 1 * s;
  for (let i = 0; i < 5; i++) {
    const swirlAngle = time * 1.5 + i * ((Math.PI * 2) / 5);
    const sr1 = 4 * s;
    const sr2 = 11 * s;
    ctx.beginPath();
    ctx.moveTo(
      igPortCx + Math.cos(swirlAngle) * sr1,
      igPortCy + Math.sin(swirlAngle) * sr1 * 1.3,
    );
    ctx.quadraticCurveTo(
      igPortCx + Math.cos(swirlAngle + 0.6) * sr2 * 0.7,
      igPortCy + Math.sin(swirlAngle + 0.6) * sr2 * 1.1,
      igPortCx + Math.cos(swirlAngle + 1.2) * sr2,
      igPortCy + Math.sin(swirlAngle + 1.2) * sr2 * 1.3,
    );
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(200,100,255,${0.1 + pulse * 0.15})`;
  ctx.beginPath();
  ctx.arc(igPortCx, igPortCy, 3 * s, 0, Math.PI * 2);
  ctx.fill();

  // Flames on pillars
  setShadowBlur(ctx, 10 * s, igLava);
  for (const { px, py, idx } of [
    { px: igLPx, py: igLPy, idx: 0 },
    { px: igRPx, py: igRPy, idx: 1 },
  ]) {
    const flameBase = py - 5 * s;
    for (let i = 0; i < 4; i++) {
      const fPh = time * 6 + i * 1.8 + idx * 1.1;
      const fH = (10 + Math.sin(fPh) * 6) * s;
      const fW = (2.5 + Math.cos(fPh * 0.7) * 1) * s;
      const fx = px + (i - 1.5) * 3 * s;
      const fG = Math.floor(100 + Math.sin(fPh) * 60);
      ctx.fillStyle = `rgba(255,${fG},20,${0.3 + pulse * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(fx - fW * 1.3, flameBase);
      ctx.quadraticCurveTo(
        fx - fW * 0.4 + Math.sin(fPh) * s,
        flameBase - fH * 0.6,
        fx + Math.sin(fPh * 1.3) * 1.5 * s,
        flameBase - fH,
      );
      ctx.quadraticCurveTo(
        fx + fW * 0.4 - Math.cos(fPh) * s,
        flameBase - fH * 0.35,
        fx + fW * 1.3,
        flameBase,
      );
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(255,${Math.min(255, fG + 80)},60,${0.4 + pulse * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(fx - fW * 0.6, flameBase);
      ctx.quadraticCurveTo(
        fx,
        flameBase - fH * 0.5,
        fx + Math.sin(fPh) * 0.5 * s,
        flameBase - fH * 0.7,
      );
      ctx.quadraticCurveTo(fx, flameBase - fH * 0.25, fx + fW * 0.6, flameBase);
      ctx.closePath();
      ctx.fill();
    }
  }
  clearShadow(ctx);

  // Demon face on arch keystone
  const demonX = igArchMidX;
  const demonY = igArchMidY - 1 * s;
  ctx.fillStyle = "#2a2a3c";
  ctx.beginPath();
  ctx.ellipse(demonX, demonY, 5 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a28";
  ctx.beginPath();
  ctx.ellipse(demonX, demonY + 1 * s, 4 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  setShadowBlur(ctx, 4 * s, igLava);
  ctx.fillStyle = `rgba(255,40,0,${0.4 + pulse * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(
    demonX - 1.8 * s,
    demonY - 1.5 * s,
    1.2 * s,
    0.8 * s,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    demonX + 1.8 * s,
    demonY - 1.5 * s,
    1.2 * s,
    0.8 * s,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);
  ctx.fillStyle = "#0a0a12";
  ctx.beginPath();
  ctx.moveTo(demonX - 0.8 * s, demonY + 0.5 * s);
  ctx.lineTo(demonX, demonY + 2 * s);
  ctx.lineTo(demonX + 0.8 * s, demonY + 0.5 * s);
  ctx.closePath();
  ctx.fill();
  // Horns
  ctx.strokeStyle = "#1e1e2c";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(demonX - 2 * s, demonY - 4 * s);
  ctx.quadraticCurveTo(
    demonX - 4 * s,
    demonY - 7 * s,
    demonX - 3 * s,
    demonY - 10 * s,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(demonX + 2 * s, demonY - 4 * s);
  ctx.quadraticCurveTo(
    demonX + 4 * s,
    demonY - 7 * s,
    demonX + 3 * s,
    demonY - 10 * s,
  );
  ctx.stroke();

  // Chains between pillars
  const chainStartLY = igLPy - igPH * 0.4;
  const chainStartRY = igRPy - igPH * 0.4;
  const chainSag = 12 * s;
  const chainSway = Math.sin(time * 0.8) * 2 * s;
  ctx.strokeStyle = "#3a3a44";
  ctx.lineWidth = 0.8 * s;
  for (let seg = 0; seg < 8; seg++) {
    const t1 = seg / 8;
    const t2 = (seg + 1) / 8;
    const x1 = igLPx + (igRPx - igLPx) * t1;
    const y1 =
      chainStartLY +
      (chainStartRY - chainStartLY) * t1 +
      Math.sin(t1 * Math.PI) * chainSag +
      chainSway * t1;
    const x2 = igLPx + (igRPx - igLPx) * t2;
    const y2 =
      chainStartLY +
      (chainStartRY - chainStartLY) * t2 +
      Math.sin(t2 * Math.PI) * chainSag +
      chainSway * t2;
    ctx.beginPath();
    ctx.ellipse(
      (x1 + x2) / 2,
      (y1 + y2) / 2,
      seg % 2 === 0 ? Math.hypot(x2 - x1, y2 - y1) * 0.55 : 1.2 * s,
      seg % 2 === 0 ? 1.2 * s : Math.hypot(x2 - x1, y2 - y1) * 0.55,
      Math.atan2(y2 - y1, x2 - x1),
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Braziers flanking the gate
  for (const side of [-1, 1]) {
    const brx = side < 0 ? igLPx + side * 8 * s : igRPx + side * 8 * s;
    const bry = side < 0 ? igLPy - 2 * s : igRPy - 2 * s;
    ctx.fillStyle = igObsMd;
    ctx.beginPath();
    ctx.moveTo(brx - 3 * s, bry);
    ctx.lineTo(brx - 1 * s, bry - 8 * s);
    ctx.lineTo(brx + 1 * s, bry - 8 * s);
    ctx.lineTo(brx + 3 * s, bry);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = igObsDk;
    ctx.beginPath();
    ctx.ellipse(brx, bry - 8 * s, 3 * s, 1.3 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    drawMultiFlame(
      ctx,
      brx,
      bry - 8 * s,
      3 * s,
      15 * s,
      time,
      side < 0 ? 10 : 11,
      `rgba(255,80,15,${0.4 + pulse * 0.25})`,
      `rgba(255,200,60,${0.55 + pulse * 0.3})`,
      `rgba(255,240,140,${0.65 + pulse * 0.2})`,
      igLava,
      10 * s,
    );
  }

  // Fallen warrior debris
  [
    { x: cx - 30 * s, y: cy + 10 * s, type: "sword" as const },
    { x: cx + 28 * s, y: cy + 6 * s, type: "shield" as const },
    { x: cx - 24 * s, y: cy + 14 * s, type: "helmet" as const },
    { x: cx + 22 * s, y: cy + 12 * s, type: "bones" as const },
  ].forEach(({ x: dx, y: dy, type }) => {
    if (type === "sword") {
      ctx.strokeStyle = "#6a6a78";
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(dx - 4 * s, dy + 1 * s);
      ctx.lineTo(dx + 4 * s, dy - 1 * s);
      ctx.stroke();
      ctx.fillStyle = "#4a3828";
      ctx.fillRect(dx - 5 * s, dy + 0.5 * s, 2 * s, 1.5 * s);
    } else if (type === "shield") {
      ctx.fillStyle = "#3a3a44";
      ctx.beginPath();
      ctx.ellipse(dx, dy, 3 * s, 2 * s, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "helmet") {
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.ellipse(dx, dy, 2.5 * s, 1.5 * s, 0, 0, Math.PI);
      ctx.fill();
    } else {
      ctx.strokeStyle = "#b8a890";
      ctx.lineWidth = 0.6 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(dx - 2 * s, dy);
      ctx.lineTo(dx + 2 * s, dy + 0.5 * s);
      ctx.moveTo(dx - 1 * s, dy + 1 * s);
      ctx.lineTo(dx + 1.5 * s, dy - 0.5 * s);
      ctx.stroke();
    }
  });

  // Portal distortion rings
  setShadowBlur(ctx, 6 * s, "#aa44ff");
  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = time * 1.2 + ring * 0.8;
    const ringR = (5 + ring * 4) * s;
    const ringAlpha = 0.12 + pulse * 0.1 - ring * 0.03;
    ctx.strokeStyle = `rgba(180,80,255,${ringAlpha})`;
    ctx.lineWidth = (0.8 - ring * 0.15) * s;
    ctx.beginPath();
    ctx.ellipse(
      igPortCx,
      igPortCy,
      ringR + Math.sin(ringPhase) * 2 * s,
      ringR * 1.3 + Math.cos(ringPhase) * 2 * s,
      ringPhase * 0.2,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // Lava glow from beneath
  const underGlow = ctx.createRadialGradient(
    cx,
    cy + 5 * s,
    0,
    cx,
    cy + 5 * s,
    45 * s,
  );
  underGlow.addColorStop(0, `rgba(255,80,0,${0.08 + pulse * 0.05})`);
  underGlow.addColorStop(0.5, `rgba(200,30,0,${0.04 + pulse * 0.02})`);
  underGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = underGlow;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 5 * s, 45 * s, 20 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ember particle storm
  for (let i = 0; i < 8; i++) {
    const ePh = time * 2 + i * 0.9 + seedX;
    const eAlpha = Math.max(0, Math.sin(ePh * 1.5) * 0.55);
    if (eAlpha > 0.08) {
      const ex = cx + Math.sin(ePh * 0.5) * 35 * s;
      const ey = cy - 15 * s - ((time * 14 + i * 10) % 55) * s;
      ctx.fillStyle = `rgba(255,${Math.floor(120 + Math.sin(ePh) * 50)},30,${eAlpha})`;
      ctx.beginPath();
      ctx.arc(ex, ey, (0.6 + Math.sin(ePh) * 0.3) * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Smoke columns from braziers
  for (const side of [-1, 1]) {
    const smBaseX = side < 0 ? igLPx + side * 8 * s : igRPx + side * 8 * s;
    const smBaseY = side < 0 ? igLPy - 22 * s : igRPy - 22 * s;
    for (let si = 0; si < 3; si++) {
      const smAlpha = Math.max(
        0,
        0.08 - ((time * 4 + si * 5 + Math.abs(side) * 3) % 18) * 0.005,
      );
      if (smAlpha > 0.01) {
        const smPh = time * 0.6 + si * 1.1 + side;
        const smX = smBaseX + Math.sin(smPh * 0.5) * 4 * s;
        const smY = smBaseY - ((time * 5 + si * 6) % 25) * s;
        ctx.fillStyle = `rgba(30,20,20,${smAlpha})`;
        ctx.beginPath();
        ctx.ellipse(
          smX,
          smY,
          (2.5 + si) * s,
          (1.5 + si * 0.5) * s,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }
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
    const topX0 = x0, topY0 = y0 - wH;
    const topX1 = x1, topY1 = y1 - wH;
    const aMidX = (topX0 + topX1) / 2;
    const aMidY = (topY0 + topY1) / 2;
    const hfx = (topX1 - topX0) / 2;
    const hfy = (topY1 - topY0) / 2;
    const archH = wu * D / 2;

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
  const eDx = FT.x - LT.x, eDy = FT.y - LT.y;
  const eLen = Math.hypot(eDx, eDy);
  const eUx = eDx / eLen, eUy = eDy / eLen;

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
    const wR = { x: bL.x + (bR.x - bL.x) * (1 - wi), y: bL.y + (bR.y - bL.y) * (1 - wi) };
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
    const u = 0.25;
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
      0.4,
      0.3,
      "right",
      colors.sDark,
      colors.glass,
      colors.sLight,
      true,
    );
  }
}

export function renderNassauHall(p: LandmarkParams): void {
  const { ctx, screenX: cx, screenY: cy, s: sRaw, time, skipShadow, shadowOnly } = p;
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
  drawIsoFaceQuad(ctx, bx, by, pavW * s, pavD * s, pavH * s, 0, 0, 0.05, 1.0, "left");
  ctx.fill();
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, pavW * s, pavD * s, pavH * s, 0.95, 0, 0.05, 1.0, "left");
  ctx.fill();

  // Pilaster strips on right face
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, pavW * s, pavD * s, pavH * s, 0, 0, 0.05, 1.0, "right");
  ctx.fill();
  ctx.beginPath();
  drawIsoFaceQuad(ctx, bx, by, pavW * s, pavD * s, pavH * s, 0.95, 0, 0.05, 1.0, "right");
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

  // === CUPOLA + DOME + SPIRE + FLAG (drawn BEFORE pediment so gable covers cupola base) ===
  const cupolaY = pavWallTop + pID - pedH * s - 1 * s;
  const cupSize = 8;
  const cupH = 14 * s;
  const cupIW = cupSize * s * ISO_COS;
  const cupID = cupSize * s * ISO_SIN;

  // Cupola base platform
  drawIsometricPrism(ctx, bx, cupolaY + 2 * s, (cupSize + 2) * s, (cupSize + 2) * s, 2 * s, "#D5D5D5", "#C0C0C0", "#A8A8A8");

  // Cupola prism (W = D for correct iso)
  drawIsometricPrism(ctx, bx, cupolaY, cupSize * s, cupSize * s, cupH, "#F0F0F0", "#DEDEDE", "#C0C0C0");

  // Arched openings on left face
  for (let i = 0; i < 3; i++) {
    const u = (i + 0.5) / 3.5;
    drawWindowOnFace(ctx, bx, cupolaY, cupSize * s, cupSize * s, cupH, s, u * 0.8 + 0.05, 0.15, 0.18, 0.55, "left", "#D0D0D0", "#37474F", "#DEDEDE", true);
  }

  // Arched openings on right face
  for (let i = 0; i < 2; i++) {
    const u = (i + 0.5) / 2.5;
    drawWindowOnFace(ctx, bx, cupolaY, cupSize * s, cupSize * s, cupH, s, u * 0.7 + 0.1, 0.15, 0.22, 0.55, "right", "#B8B8B8", "#2D3A42", "#C0C0C0", true);
  }

  // Cornice ring at top of cupola
  const cupTop = cupolaY - cupH + cupID;
  ctx.fillStyle = "#E0E0E0";
  ctx.beginPath();
  ctx.ellipse(bx, cupTop + cupID, cupIW + 1.5 * s, cupID + 0.8 * s, 0, 0, Math.PI * 2);
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

  // Dome back half (darker)
  ctx.fillStyle = C.rfDark;
  ctx.beginPath();
  ctx.moveTo(bx - domeRx, domeBase);
  ctx.quadraticCurveTo(bx - domeRx * 0.55, domePeak + domeH * 0.08, bx, domePeak);
  ctx.quadraticCurveTo(bx + domeRx * 0.55, domePeak + domeH * 0.08, bx + domeRx, domeBase);
  ctx.ellipse(bx, domeBase, domeRx, domeRy, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Dome front half (lit gradient)
  const domeG = ctx.createLinearGradient(bx - domeRx, domePeak, bx + domeRx * 0.5, domeBase);
  domeG.addColorStop(0, C.rfTop);
  domeG.addColorStop(0.35, C.rfFront);
  domeG.addColorStop(0.7, C.rfSide);
  domeG.addColorStop(1, C.rfDark);
  ctx.fillStyle = domeG;
  ctx.beginPath();
  ctx.moveTo(bx - domeRx, domeBase);
  ctx.quadraticCurveTo(bx - domeRx * 0.55, domePeak + domeH * 0.08, bx, domePeak);
  ctx.quadraticCurveTo(bx + domeRx * 0.55, domePeak + domeH * 0.08, bx + domeRx, domeBase);
  ctx.closePath();
  ctx.fill();

  // Dome outline
  ctx.strokeStyle = C.rfTop;
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(bx - domeRx, domeBase);
  ctx.quadraticCurveTo(bx - domeRx * 0.55, domePeak + domeH * 0.08, bx, domePeak);
  ctx.quadraticCurveTo(bx + domeRx * 0.55, domePeak + domeH * 0.08, bx + domeRx, domeBase);
  ctx.stroke();

  // Dome ribs
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 0.4 * s;
  for (let r = 0; r < 5; r++) {
    const t = (r + 1) / 6;
    const rx = bx + (t - 0.5) * domeRx * 2;
    ctx.beginPath();
    ctx.moveTo(rx, domeBase);
    ctx.quadraticCurveTo(rx * 0.25 + bx * 0.75, domePeak + domeH * 0.15, bx, domePeak);
    ctx.stroke();
  }

  // Dome base ring
  ctx.strokeStyle = C.rfSide;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.ellipse(bx, domeBase, domeRx, domeRy, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Lantern atop dome
  const lanternH = 4 * s;
  const lanternR = 2.5 * s;
  drawIsometricPrism(ctx, bx, domePeak + lanternH, lanternR, lanternR, lanternH, "#F5F5F5", "#E0E0E0", "#CCCCCC");

  // Spire
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
  ctx.quadraticCurveTo(bx + flagW * 0.4, flagAttachY + sway1 * 0.3, bx + flagW, flagAttachY + sway1 * 0.15);
  ctx.quadraticCurveTo(bx + flagW * 0.7, flagAttachY - flagH * 0.35 + sway2 * 0.3, bx + flagW, flagAttachY - flagH * 0.35 + sway3 * 0.2);
  ctx.lineTo(bx + 1 * s, flagAttachY - flagH * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(bx + 1 * s, flagAttachY - flagH * 0.35);
  ctx.quadraticCurveTo(bx + flagW * 0.5, flagAttachY - flagH * 0.35 + sway2 * 0.25, bx + flagW, flagAttachY - flagH * 0.35 + sway3 * 0.2);
  ctx.quadraticCurveTo(bx + flagW * 0.7, flagAttachY - flagH * 0.7 + sway3 * 0.3, bx + flagW, flagAttachY - flagH * 0.7 + sway2 * 0.15);
  ctx.lineTo(bx + 1 * s, flagAttachY - flagH * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#F97316";
  ctx.beginPath();
  ctx.moveTo(bx + 1 * s, flagAttachY - flagH * 0.7);
  ctx.quadraticCurveTo(bx + flagW * 0.5, flagAttachY - flagH * 0.7 + sway3 * 0.25, bx + flagW, flagAttachY - flagH * 0.7 + sway2 * 0.15);
  ctx.quadraticCurveTo(bx + flagW * 0.7, flagAttachY - flagH + sway1 * 0.2, bx + flagW, flagAttachY - flagH + sway1 * 0.1);
  ctx.lineTo(bx + 1 * s, flagAttachY - flagH);
  ctx.closePath();
  ctx.fill();

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

  // Pediment border
  ctx.strokeStyle = C.sCornice;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(pavLT.x - 0.5 * s, pavLT.y + 0.5 * s);
  ctx.lineTo(pedApex.x, pedApex.y - 1 * s);
  ctx.lineTo(pavFT.x + 0.5 * s, pavFT.y + 0.5 * s);
  ctx.stroke();

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

  // Pediment top face (ridge between apexes)
  ctx.fillStyle = C.rfTop;
  ctx.beginPath();
  ctx.moveTo(pedApex.x, pedApex.y);
  ctx.lineTo(pavFT.x, pavFT.y - pedH * s * 0.4);
  ctx.lineTo(pedApexR.x, pedApexR.y);
  ctx.lineTo(pavFT.x, pavFT.y);
  ctx.closePath();
  ctx.fill();

  // Oculus
  const ocCx = (pavLT.x + pavFT.x + pedApex.x) / 3;
  const ocCy = (pavLT.y + pavFT.y + pedApex.y) / 3 + 1 * s;
  ctx.fillStyle = C.rfDark;
  ctx.beginPath();
  ctx.arc(ocCx, ocCy, 3.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.sCornice;
  ctx.lineWidth = 0.8 * s;
  ctx.stroke();
  ctx.fillStyle = C.rfFront;
  ctx.beginPath();
  ctx.arc(ocCx, ocCy, 2 * s, 0, Math.PI * 2);
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
        ctx, bx, by, pavW * s, pavD * s, pavH * s, s,
        u, v, 0.25, 0.28, "right", C.sDark, C.glass, C.sLight, true,
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
  const dArchH = dWU * pavD * s / 2;

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
    ctx, bx, by, pavW * s, pavD * s, pavH * s,
    dU, dV, dWU, dWV, "left",
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

  // Door handles
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(dCx - 1.5 * s, (d0y + d1y) / 2 - dH * 0.2, 0.8 * s, 0, Math.PI * 2);
  ctx.arc(dCx + 1.5 * s, (d0y + d1y) / 2 - dH * 0.2 - 0.3 * s, 0.8 * s, 0, Math.PI * 2);
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

  // === 8. FRONT STEPS (stacked pyramid in front of entrance door) ===
  const fwdX = -ISO_SIN;
  const fwdY = ISO_COS;
  const sideX = ISO_COS;
  const sideY = ISO_SIN;
  // Door center on the left face (u≈0.5), offset slightly outward from face
  const entrX = bx - pIW * 0.5 + fwdX * 4 * s;
  const entrY = by + 1.5 * pID + fwdY * 4 * s;

  // Stacked iso platforms: largest at ground, shrinking upward
  const stepH = 1.2 * s;
  for (let step = 0; step < 4; step++) {
    const stepSize = (11 - step * 1.8) * s;
    drawIsometricPrism(
      ctx, entrX, entrY - step * stepH,
      stepSize, stepSize, stepH,
      "#D5CCC4", "#B0A090", "#8D7E72",
    );
  }

  // === 9. TIGER STATUES ===
  const drawTigerStatue = (tx: number, ty: number, facing: number) => {
    // Pedestal — warm sandstone, proper iso (W=D)
    const pedW = 5 * s;
    const pedH = 4 * s;
    drawIsometricPrism(ctx, tx, ty, pedW, pedW, pedH, "#C4B5A5", "#A89585", "#8D7565");

    // Pedestal trim ring
    drawIsometricPrism(ctx, tx, ty - pedH + pedW * ISO_SIN, pedW + 0.8 * s, pedW + 0.8 * s, 0.8 * s, "#D5C8B8", "#BCAA98", "#A08878");

    const topY = ty - pedH + pedW * ISO_SIN;

    // Tiger body — warm bronze stone, seated pose
    const bodyRx = 3.8 * s;
    const bodyRy = 2.2 * s;
    const bodyY = topY - 3.5 * s;

    // Body shadow on pedestal
    ctx.fillStyle = "rgba(80,60,40,0.15)";
    ctx.beginPath();
    ctx.ellipse(tx, topY - 0.3 * s, bodyRx * 0.85, bodyRy * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Haunches (back of seated tiger)
    const haunchG = ctx.createRadialGradient(tx - facing * 0.5 * s, bodyY, 0, tx, bodyY, bodyRx);
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
    ctx.lineTo(tx + facing * legSpread + legW * 0.5, bodyY + bodyRy * 0.3 + legW * ISO_SIN / ISO_COS * 0.5);
    ctx.lineTo(tx + facing * legSpread + legW * 0.5, topY - 0.5 * s);
    ctx.lineTo(tx + facing * legSpread - legW * 0.5, topY - 0.5 * s);
    ctx.closePath();
    ctx.fill();
    // Right front leg
    ctx.fillStyle = "#7D6555";
    ctx.beginPath();
    ctx.moveTo(tx + facing * (legSpread + 2.5 * s) - legW * 0.5, bodyY + bodyRy * 0.1);
    ctx.lineTo(tx + facing * (legSpread + 2.5 * s) + legW * 0.5, bodyY + bodyRy * 0.1 + legW * ISO_SIN / ISO_COS * 0.5);
    ctx.lineTo(tx + facing * (legSpread + 2.5 * s) + legW * 0.5, topY - 0.5 * s);
    ctx.lineTo(tx + facing * (legSpread + 2.5 * s) - legW * 0.5, topY - 0.5 * s);
    ctx.closePath();
    ctx.fill();

    // Chest highlight
    ctx.fillStyle = "#B8A088";
    ctx.beginPath();
    ctx.ellipse(tx + facing * 2 * s, bodyY - 0.5 * s, 2 * s, 1.8 * s, facing * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headX = tx + facing * 4 * s;
    const headY = bodyY - 3.5 * s;
    const headR = 2.5 * s;

    const headG = ctx.createRadialGradient(headX - facing * 0.5 * s, headY - 0.5 * s, 0, headX, headY, headR);
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
    ctx.ellipse(headX + facing * 1.5 * s, headY + 0.8 * s, 1.5 * s, 1 * s, 0, 0, Math.PI * 2);
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
    ctx.ellipse(headX + facing * 0.8 * s, headY - 0.5 * s, 0.7 * s, 0.5 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(headX + facing * 2.5 * s, headY - 0.5 * s, 0.7 * s, 0.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye gleam
    ctx.fillStyle = "#D4C4A8";
    ctx.beginPath();
    ctx.arc(headX + facing * 0.6 * s, headY - 0.7 * s, 0.25 * s, 0, Math.PI * 2);
    ctx.arc(headX + facing * 2.3 * s, headY - 0.7 * s, 0.25 * s, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = "#5D4037";
    ctx.beginPath();
    ctx.ellipse(headX + facing * 2 * s, headY + 0.3 * s, 0.5 * s, 0.35 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail (curved, coming from the back)
    ctx.strokeStyle = "#8D7565";
    ctx.lineWidth = 1.2 * s;
    ctx.lineCap = "round";
    const tw = Math.sin(time * 1.2 + facing) * 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(tx - facing * 3 * s, bodyY);
    ctx.quadraticCurveTo(tx - facing * 5 * s + tw, bodyY - 4 * s, tx - facing * 3.5 * s, bodyY - 7 * s);
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
  const statLX = entrX - tigerOffset * ISO_COS;
  const statLY = entrY - tigerOffset * ISO_SIN;
  const statRX = entrX + tigerOffset * ISO_COS;
  const statRY = entrY + tigerOffset * ISO_SIN;
  drawTigerStatue(statLX, statLY, 1);
  drawTigerStatue(statRX, statRY, 1);

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
  const doorGlow = ctx.createRadialGradient(entrX, entrY, 0, entrX, entrY, 8 * s);
  doorGlow.addColorStop(0, `rgba(255,200,120,${doorGlowA})`);
  doorGlow.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = doorGlow;
  ctx.beginPath();
  ctx.ellipse(entrX + 2 * s * fwdX, entrY + 2 * s * fwdY, 6 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}
