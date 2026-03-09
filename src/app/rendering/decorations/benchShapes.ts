import { ISO_TAN } from "../../constants";
import { drawDirectionalShadow } from "./shadowHelpers";

const T = ISO_TAN;

type Fill = string | CanvasGradient;

function isoBox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hw: number,
  hd: number,
  h: number,
  top: Fill,
  left: Fill,
  right: Fill,
  s: number,
): void {
  ctx.fillStyle = left;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx - hw, cy - h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = right;
  ctx.beginPath();
  ctx.moveTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx + hw, cy - h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hd - h);
  ctx.lineTo(cx + hw, cy - h);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx - hw, cy - h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.13)";
  ctx.lineWidth = 0.3 * s;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx + hw, cy);
  ctx.moveTo(cx, cy + hd);
  ctx.lineTo(cx, cy + hd - h);
  ctx.stroke();
}

function slatLinesOnTop(
  ctx: CanvasRenderingContext2D,
  bx: number,
  topY: number,
  hw: number,
  hd: number,
  n: number,
  s: number,
): void {
  ctx.strokeStyle = "rgba(0,0,0,0.16)";
  ctx.lineWidth = 0.35 * s;
  for (let i = 1; i < n; i++) {
    const d = i / n;
    const y = topY + hd * (2 * d - 1);
    const w = (1 - Math.abs(2 * d - 1)) * hw;
    ctx.beginPath();
    ctx.moveTo(bx - w, y);
    ctx.lineTo(bx + w, y);
    ctx.stroke();
  }
}

function faceHorizontalLines(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  h: number,
  n: number,
  s: number,
  color: string = "rgba(0,0,0,0.14)",
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.35 * s;
  for (let i = 1; i < n; i++) {
    const f = i / n;
    ctx.beginPath();
    ctx.moveTo(x1, y1 - f * h);
    ctx.lineTo(x2, y2 - f * h);
    ctx.stroke();
  }
}

// ─── Variant 0: Classic Park Bench (Wood + Cast Iron) ───────────

function parkBench(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  s: number,
): void {
  const wTop = "#C49A6C";
  const wLit = "#A67B5B";
  const wMid = "#8B6B4A";
  const wDk = "#6A4F35";
  const wShd = "#4E3A27";
  const iDk = "#2D2D2D";
  const iMid = "#424242";
  const iLit = "#555555";
  const iHi = "#6A6A6A";

  const seatHW = 12 * s;
  const seatHD = 3 * s;
  const seatThk = 1.5 * s;
  const legH = 7 * s;
  const legHW = 0.8 * s;
  const legHD = seatHD;
  const backH = 8 * s;
  const backHD = 0.8 * s;
  const backHW = 11 * s;

  const seatY = by - legH;
  const seatTopY = seatY - seatThk;

  // --- Backrest panel ---
  const brY = seatTopY - (seatHD - backHD);

  const brLG = ctx.createLinearGradient(
    bx - backHW,
    brY - backH,
    bx - backHW,
    brY,
  );
  brLG.addColorStop(0, wLit);
  brLG.addColorStop(1, wMid);
  isoBox(ctx, bx, brY, backHW, backHD, backH, wTop, brLG, wShd, s);

  faceHorizontalLines(
    ctx,
    bx - backHW,
    brY,
    bx,
    brY + backHD,
    backH,
    3,
    s,
  );
  faceHorizontalLines(
    ctx,
    bx + backHW,
    brY,
    bx,
    brY + backHD,
    backH,
    3,
    s,
  );

  const railH = 1.3 * s;
  const railY = brY - backH;
  isoBox(
    ctx,
    bx,
    railY,
    backHW + 0.5 * s,
    backHD + 0.2 * s,
    railH,
    wTop,
    wLit,
    wDk,
    s,
  );

  // --- Iron side frames ---
  for (const dir of [-1, 1] as const) {
    const lx = bx + dir * (seatHW - legHW);

    isoBox(
      ctx,
      lx,
      by,
      legHW,
      legHD,
      legH + seatThk,
      iHi,
      iLit,
      iDk,
      s,
    );

    ctx.strokeStyle = iHi;
    ctx.lineWidth = 0.7 * s;
    const fcy = by - legH * 0.45;
    ctx.beginPath();
    ctx.arc(
      lx - legHW * 0.2,
      fcy + legHD * 0.35,
      2 * s,
      Math.PI * 0.3,
      Math.PI * 1.5,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(
      lx - legHW * 0.2,
      fcy - 2.2 * s + legHD * 0.5,
      1.2 * s,
      -Math.PI * 0.2,
      Math.PI * 1.1,
    );
    ctx.stroke();

    isoBox(
      ctx,
      lx,
      by + 0.3 * s,
      legHW + 0.5 * s,
      legHD + 0.3 * s,
      0.5 * s,
      iHi,
      iMid,
      iDk,
      s,
    );
  }

  // --- Seat planks ---
  const sLG = ctx.createLinearGradient(
    bx - seatHW,
    seatTopY,
    bx - seatHW,
    seatY,
  );
  sLG.addColorStop(0, wLit);
  sLG.addColorStop(1, wMid);
  const sTG = ctx.createLinearGradient(
    bx - seatHW,
    seatTopY,
    bx + seatHW,
    seatTopY,
  );
  sTG.addColorStop(0, wTop);
  sTG.addColorStop(0.35, "#B8885C");
  sTG.addColorStop(1, "#B08050");
  isoBox(ctx, bx, seatY, seatHW, seatHD, seatThk, sTG, sLG, wShd, s);

  slatLinesOnTop(ctx, bx, seatTopY, seatHW, seatHD, 4, s);

  ctx.strokeStyle = "rgba(80,55,30,0.07)";
  ctx.lineWidth = 0.3 * s;
  for (let g = 0; g < 4; g++) {
    const gx = bx - seatHW * 0.7 + g * seatHW * 0.5;
    ctx.beginPath();
    ctx.moveTo(gx, seatTopY - seatHD * 0.5);
    ctx.lineTo(gx + seatHW * 0.15, seatTopY + seatHD * 0.3);
    ctx.stroke();
  }
}

// ─── Variant 1: Rustic Log Bench ────────────────────────────────

function logBench(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  s: number,
): void {
  const barkDk = "#3E2723";
  const barkMd = "#5D4037";
  const barkLt = "#6D4C41";
  const woodIn = "#BCAAA4";
  const woodRing = "#A1887F";

  const stR = 3.5 * s;
  const stH = 7 * s;
  const logHW = 12 * s;
  const logR = 2.5 * s;

  // --- Stump supports (isometric cylinders) ---
  for (const dir of [-1, 1]) {
    const sx = bx + dir * 8 * s;

    const stGrad = ctx.createLinearGradient(
      sx - stR,
      by,
      sx + stR,
      by,
    );
    stGrad.addColorStop(0, barkLt);
    stGrad.addColorStop(0.45, barkMd);
    stGrad.addColorStop(1, barkDk);
    ctx.fillStyle = stGrad;
    ctx.beginPath();
    ctx.ellipse(sx, by, stR, stR * T, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(sx + stR, by - stH);
    ctx.ellipse(sx, by - stH, stR, stR * T, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = woodIn;
    ctx.beginPath();
    ctx.ellipse(sx, by - stH, stR, stR * T, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = woodRing;
    ctx.lineWidth = 0.4 * s;
    for (let r = 1; r <= 3; r++) {
      const rf = r / 4;
      ctx.beginPath();
      ctx.ellipse(
        sx,
        by - stH,
        stR * rf,
        stR * T * rf,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.fillStyle = barkMd;
    ctx.beginPath();
    ctx.arc(sx, by - stH, 0.5 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = barkDk;
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.ellipse(sx, by - stH, stR, stR * T, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.3 * s;
    ctx.beginPath();
    ctx.ellipse(sx, by, stR, stR * T, 0, 0, Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(30,18,10,0.18)";
    ctx.lineWidth = 0.4 * s;
    for (let b = 0; b < 3; b++) {
      const bt = (b + 0.5) / 3;
      ctx.beginPath();
      ctx.moveTo(sx - stR * 0.7, by - bt * stH);
      ctx.quadraticCurveTo(
        sx - stR * 0.4,
        by - bt * stH - 0.5 * s,
        sx - stR * 0.1,
        by - bt * stH + 0.3 * s,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + stR * 0.3, by - bt * stH);
      ctx.quadraticCurveTo(
        sx + stR * 0.55,
        by - bt * stH - 0.3 * s,
        sx + stR * 0.8,
        by - bt * stH + 0.2 * s,
      );
      ctx.stroke();
    }
  }

  // --- Split log seat ---
  const logY = by - stH;

  const logGrad = ctx.createLinearGradient(
    bx - logHW,
    logY,
    bx + logHW,
    logY,
  );
  logGrad.addColorStop(0, barkLt);
  logGrad.addColorStop(0.15, barkMd);
  logGrad.addColorStop(0.85, barkDk);
  logGrad.addColorStop(1, barkDk);
  ctx.fillStyle = logGrad;
  ctx.beginPath();
  ctx.moveTo(bx - logHW, logY);
  ctx.lineTo(bx - logHW, logY - logR * 0.4);
  ctx.quadraticCurveTo(
    bx - logHW,
    logY - logR * 1.4,
    bx,
    logY - logR * 1.5,
  );
  ctx.quadraticCurveTo(
    bx + logHW,
    logY - logR * 1.4,
    bx + logHW,
    logY - logR * 0.4,
  );
  ctx.lineTo(bx + logHW, logY);
  ctx.closePath();
  ctx.fill();

  const logTopGrad = ctx.createLinearGradient(
    bx - logHW,
    logY - logR * 1.2,
    bx + logHW,
    logY - logR * 1.2,
  );
  logTopGrad.addColorStop(0, woodIn);
  logTopGrad.addColorStop(0.3, "#D4C4B4");
  logTopGrad.addColorStop(1, woodRing);
  ctx.fillStyle = logTopGrad;
  ctx.beginPath();
  ctx.ellipse(
    bx,
    logY - logR * 0.7,
    logHW,
    logR * T * 1.2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.strokeStyle = "rgba(93,64,55,0.1)";
  ctx.lineWidth = 0.3 * s;
  for (let g = 0; g < 6; g++) {
    const gx = bx - logHW * 0.8 + g * logHW * 0.32;
    ctx.beginPath();
    ctx.moveTo(gx, logY - logR * 0.7 - logR * T * 0.5);
    ctx.lineTo(gx + logHW * 0.08, logY - logR * 0.7 + logR * T * 0.4);
    ctx.stroke();
  }

  ctx.strokeStyle = barkDk;
  ctx.lineWidth = 0.7 * s;
  ctx.beginPath();
  ctx.moveTo(bx - logHW, logY);
  ctx.quadraticCurveTo(bx, logY + logR * T * 0.5, bx + logHW, logY);
  ctx.stroke();

  const msx = bx + logHW * 0.82;
  const msy = logY - logR * 0.85;
  ctx.fillStyle = "#E8E0D0";
  ctx.fillRect(msx - 0.4 * s, msy, 0.8 * s, 1.6 * s);
  ctx.fillStyle = "#D32F2F";
  ctx.beginPath();
  ctx.ellipse(msx, msy - 0.2 * s, 1.5 * s, 0.85 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(msx - 0.5 * s, msy - 0.35 * s, 0.28 * s, 0, Math.PI * 2);
  ctx.arc(msx + 0.3 * s, msy - 0.45 * s, 0.2 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(76,175,80,0.22)";
  ctx.beginPath();
  ctx.ellipse(
    bx - 8 * s - stR * 0.2,
    by - stH * 0.3,
    1.2 * s,
    0.6 * s,
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

// ─── Variant 2: Ornate Iron Garden Bench ────────────────────────

function ironBench(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  s: number,
): void {
  const iDk = "#1A1A2E";
  const iMid = "#2C2C44";
  const iLt = "#3D3D5C";
  const iTop = "#4A4A6A";
  const iHi = "#6060888";
  const wSlat = "#A1887F";
  const wDk = "#8D6E63";
  const wTop = "#BCAAA4";

  const frameHW = 11 * s;
  const frameHD = 3 * s;
  const seatH = 7 * s;
  const seatThk = 1.3 * s;
  const backH = 9 * s;
  const legW = 1.2 * s;
  const legD = frameHD;

  // --- Iron frame legs ---
  for (const dir of [-1, 1]) {
    const lx = bx + dir * (frameHW - legW);
    isoBox(ctx, lx, by, legW, legD, seatH, iTop, iLt, iDk, s);

    ctx.strokeStyle = iTop;
    ctx.lineWidth = 0.8 * s;
    const fcy = by - seatH * 0.4;
    ctx.beginPath();
    ctx.arc(
      lx - legW * 0.2,
      fcy + legD * 0.3,
      2 * s,
      Math.PI * 0.25,
      Math.PI * 1.5,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(
      lx - legW * 0.2,
      fcy - 2.2 * s + legD * 0.45,
      1.3 * s,
      -Math.PI * 0.2,
      Math.PI * 1.0,
    );
    ctx.stroke();

    const fpHW = legW + 0.8 * s;
    const fpHD = legD + 0.4 * s;
    isoBox(ctx, lx, by + 0.3 * s, fpHW, fpHD, 0.6 * s, iTop, iMid, iDk, s);
  }

  // --- Iron frame strip under seat ---
  const stY = by - seatH;
  ctx.fillStyle = iLt;
  ctx.beginPath();
  ctx.moveTo(bx - frameHW, stY + 0.8 * s);
  ctx.lineTo(bx, stY + 0.8 * s + frameHD);
  ctx.lineTo(bx, stY + frameHD);
  ctx.lineTo(bx - frameHW, stY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = iDk;
  ctx.beginPath();
  ctx.moveTo(bx + frameHW, stY + 0.8 * s);
  ctx.lineTo(bx, stY + 0.8 * s + frameHD);
  ctx.lineTo(bx, stY + frameHD);
  ctx.lineTo(bx + frameHW, stY);
  ctx.closePath();
  ctx.fill();

  // --- Wood seat slab ---
  const sLG = ctx.createLinearGradient(
    bx - frameHW,
    stY - seatThk,
    bx - frameHW,
    stY,
  );
  sLG.addColorStop(0, wSlat);
  sLG.addColorStop(1, wDk);
  const sTG = ctx.createLinearGradient(
    bx - frameHW,
    stY - seatThk,
    bx + frameHW,
    stY - seatThk,
  );
  sTG.addColorStop(0, wTop);
  sTG.addColorStop(0.5, wSlat);
  sTG.addColorStop(1, "#A08070");
  isoBox(ctx, bx, stY, frameHW, frameHD, seatThk, sTG, sLG, wDk, s);

  slatLinesOnTop(ctx, bx, stY - seatThk, frameHW, frameHD, 4, s);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 0.3 * s;
  ctx.beginPath();
  ctx.moveTo(bx - frameHW, stY - seatThk);
  ctx.lineTo(bx, stY + frameHD - seatThk);
  ctx.stroke();

  // --- Backrest uprights ---
  const brBase = stY - seatThk - frameHD;
  for (const dir of [-1, 1]) {
    const ux = bx + dir * (frameHW - legW);
    isoBox(ctx, ux, brBase, legW, legW * T, backH, iTop, iLt, iDk, s);
  }

  // --- Top rail ---
  const railY = brBase - backH;
  isoBox(
    ctx,
    bx,
    railY,
    frameHW,
    legW * T,
    1.3 * s,
    iTop,
    iMid,
    iDk,
    s,
  );

  // --- Mid rail ---
  const midRailY = brBase - backH * 0.38;
  ctx.fillStyle = iLt;
  ctx.beginPath();
  ctx.moveTo(bx - frameHW, midRailY);
  ctx.lineTo(bx, midRailY + legW * T);
  ctx.lineTo(bx, midRailY + legW * T - 0.7 * s);
  ctx.lineTo(bx - frameHW, midRailY - 0.7 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = iDk;
  ctx.beginPath();
  ctx.moveTo(bx + frameHW, midRailY);
  ctx.lineTo(bx, midRailY + legW * T);
  ctx.lineTo(bx, midRailY + legW * T - 0.7 * s);
  ctx.lineTo(bx + frameHW, midRailY - 0.7 * s);
  ctx.closePath();
  ctx.fill();

  // --- Scrollwork on backrest ---
  ctx.strokeStyle = iTop;
  ctx.lineWidth = 0.65 * s;
  for (let sc = 0; sc < 3; sc++) {
    const scx = bx - frameHW * 0.5 + sc * frameHW * 0.5;
    const scy = brBase - backH * 0.6;
    const scr = 2.2 * s;
    ctx.beginPath();
    ctx.arc(scx, scy, scr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 0.35 * s;
    ctx.beginPath();
    ctx.arc(scx, scy, scr * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 0.65 * s;
  }

  for (let sc = 0; sc < 2; sc++) {
    const scx = bx - frameHW * 0.25 + sc * frameHW * 0.5;
    const scy = brBase - backH * 0.18;
    ctx.lineWidth = 0.45 * s;
    ctx.beginPath();
    ctx.arc(scx, scy, 1.4 * s, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ─── Variant 3: Stone Throne ────────────────────────────────────

function stoneThrone(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  s: number,
): void {
  const TI = 1 / Math.sqrt(3); // true isometric ratio (30°)

  const sTop = "#A0AAB0";
  const sTopHi = "#B4BEC4";
  const sLeft = "#607080";
  const sLeftLt = "#708090";
  const sRight = "#404A54";
  const sRightLt = "#505A64";

  const seatHW = 9 * s;
  const seatHD = seatHW * TI;
  const seatH = 7 * s;
  const backHW = seatHW;
  const backHD = seatHD;
  const backH = 16 * s;
  const armW = 2.5 * s;
  const armD = armW * TI;
  const armH = 5 * s;

  // Back and seat share the same footprint so the throne reads
  // as one continuous stone mass with proper 30° isometric edges.
  // backrest base = seat top (since seatHD == backHD, offset is 0)
  const bkY = by - seatH;

  // --- Backrest (drawn first, seat paints over lower portion) ---
  const bkLG = ctx.createLinearGradient(
    bx - backHW,
    bkY - backH,
    bx - backHW,
    bkY,
  );
  bkLG.addColorStop(0, sLeftLt);
  bkLG.addColorStop(1, sLeft);

  const bkRG = ctx.createLinearGradient(
    bx + backHW,
    bkY - backH,
    bx + backHW,
    bkY,
  );
  bkRG.addColorStop(0, sRightLt);
  bkRG.addColorStop(1, sRight);

  isoBox(ctx, bx, bkY, backHW, backHD, backH, sTop, bkLG, bkRG, s);

  // Crown points on top
  const crY = bkY - backH;
  ctx.fillStyle = sRightLt;
  ctx.beginPath();
  ctx.moveTo(bx - backHW, crY);
  ctx.lineTo(bx - backHW * 0.65, crY - 3.5 * s);
  ctx.lineTo(bx - backHW * 0.35, crY - 1.2 * s);
  ctx.lineTo(bx, crY - 5 * s);
  ctx.lineTo(bx + backHW * 0.35, crY - 1.2 * s);
  ctx.lineTo(bx + backHW * 0.65, crY - 3.5 * s);
  ctx.lineTo(bx + backHW, crY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,215,0,0.2)";
  ctx.lineWidth = 0.6 * s;
  ctx.stroke();

  // Gold emblem on right face (centered on the backrest portion above the seat)
  ctx.strokeStyle = "rgba(255,215,0,0.4)";
  ctx.lineWidth = 0.9 * s;
  const emX = bx + backHW * 0.5;
  const emY = bkY - backH * 0.5;
  ctx.beginPath();
  ctx.arc(emX, emY, 2.8 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(emX, emY - 2.8 * s);
  ctx.lineTo(emX, emY + 2.8 * s);
  ctx.moveTo(emX - 2.8 * s, emY);
  ctx.lineTo(emX + 2.8 * s, emY);
  ctx.stroke();

  // Dimmer emblem on left face
  ctx.strokeStyle = "rgba(255,215,0,0.2)";
  ctx.lineWidth = 0.7 * s;
  const emLX = bx - backHW * 0.5;
  const emLY = bkY + backHD - backH * 0.5;
  ctx.beginPath();
  ctx.arc(emLX, emLY, 2.3 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.moveTo(emLX, emLY - 2.3 * s);
  ctx.lineTo(emLX, emLY + 2.3 * s);
  ctx.moveTo(emLX - 2.3 * s, emLY);
  ctx.lineTo(emLX + 2.3 * s, emLY);
  ctx.stroke();

  // Stone panel lines on left face
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.3 * s;
  for (let i = 1; i < 4; i++) {
    const f = i / 4;
    ctx.beginPath();
    ctx.moveTo(bx - backHW, bkY - f * backH);
    ctx.lineTo(bx, bkY + backHD - f * backH);
    ctx.stroke();
  }

  // --- Seat block (drawn over backrest's lower portion) ---
  const stLG = ctx.createLinearGradient(
    bx - seatHW,
    by - seatH,
    bx - seatHW,
    by,
  );
  stLG.addColorStop(0, sLeftLt);
  stLG.addColorStop(1, sLeft);
  isoBox(ctx, bx, by, seatHW, seatHD, seatH, sTop, stLG, sRight, s);

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.moveTo(bx - seatHW, by - seatH * 0.5);
  ctx.lineTo(bx, by + seatHD - seatH * 0.5);
  ctx.lineTo(bx + seatHW, by - seatH * 0.5);
  ctx.stroke();

  // --- Armrests ---
  for (const dir of [-1, 1]) {
    const ax = bx + dir * (seatHW + armW + 0.5 * s);
    const aY = by - seatH;
    isoBox(ctx, ax, aY, armW, armD, armH, sTop, sLeft, sRight, s);

    const capW = armW + 0.5 * s;
    const capD = capW * TI;
    isoBox(
      ctx,
      ax,
      aY - armH,
      capW,
      capD,
      0.8 * s,
      sTopHi,
      sLeftLt,
      sRightLt,
      s,
    );
  }
}

// ─── Public entry point ─────────────────────────────────────────

export function drawBench(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  s: number,
  variant: number,
): void {
  const bv = variant % 4;
  drawDirectionalShadow(ctx, bx, by + 1 * s, s, 12 * s, 5 * s, 16 * s, 0.2);
  if (bv === 0) parkBench(ctx, bx, by, s);
  else if (bv === 1) logBench(ctx, bx, by, s);
  else if (bv === 2) ironBench(ctx, bx, by, s);
  else stoneThrone(ctx, bx, by, s);
}
