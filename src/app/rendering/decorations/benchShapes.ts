import { ISO_TAN } from "../../constants";
import { drawDirectionalShadow } from "./shadowHelpers";

const T = ISO_TAN; // 0.5 — correct 2:1 isometric depth ratio

type Fill = string | CanvasGradient;

// ── Isometric box primitive ────────────────────────────────────
// Draws a 3-face iso box centered at (cx, cy) with half-width hw,
// half-depth hd, and height h. For a square footprint use hd = hw * T.

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
  // Left face
  ctx.fillStyle = left;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx - hw, cy - h);
  ctx.closePath();
  ctx.fill();

  // Right face
  ctx.fillStyle = right;
  ctx.beginPath();
  ctx.moveTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx + hw, cy - h);
  ctx.closePath();
  ctx.fill();

  // Top face
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hd - h);
  ctx.lineTo(cx + hw, cy - h);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx - hw, cy - h);
  ctx.closePath();
  ctx.fill();

  // Edge outlines for definition
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

// ── Slat lines on an iso box top face ──────────────────────────

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

// ── Horizontal slat lines on a face ────────────────────────────

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

// ── Wood grain detail on an iso top face ───────────────────────

function woodGrainOnTop(
  ctx: CanvasRenderingContext2D,
  bx: number,
  topY: number,
  hw: number,
  hd: number,
  s: number,
  color: string = "rgba(80,55,30,0.08)",
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.25 * s;
  for (let g = 0; g < 5; g++) {
    const gx = bx - hw * 0.7 + g * hw * 0.35;
    const off = (g % 2 === 0 ? 0.3 : -0.2) * hd;
    ctx.beginPath();
    ctx.moveTo(gx, topY - hd * 0.6 + off);
    ctx.quadraticCurveTo(
      gx + hw * 0.05,
      topY + off,
      gx + hw * 0.1,
      topY + hd * 0.5 + off,
    );
    ctx.stroke();
  }
}

// ── Bolt / rivet detail ────────────────────────────────────────

function drawBolt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
): void {
  ctx.fillStyle = "rgba(60,60,60,0.5)";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(180,180,180,0.3)";
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

// ── Stone joint lines on an iso face ───────────────────────────

function stoneJointsOnFace(
  ctx: CanvasRenderingContext2D,
  blx: number,
  bly: number,
  brx: number,
  bry: number,
  h: number,
  rows: number,
  s: number,
): void {
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 0.4 * s;
  for (let r = 1; r < rows; r++) {
    const f = r / rows;
    ctx.beginPath();
    ctx.moveTo(blx, bly - f * h);
    ctx.lineTo(brx, bry - f * h);
    ctx.stroke();
    // Vertical joints staggered per row
    const cols = 2 + (r % 2);
    for (let c = 1; c <= cols; c++) {
      const ct = c / (cols + 1) + (r % 2 === 0 ? 0.04 : -0.04);
      const jx = blx + (brx - blx) * ct;
      const jy = bly + (bry - bly) * ct;
      const prevF = (r - 1) / rows;
      ctx.beginPath();
      ctx.moveTo(jx, jy - f * h);
      ctx.lineTo(jx, jy - prevF * h);
      ctx.stroke();
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Variant 0: Classic Park Bench (Wood + Cast Iron)
// ═══════════════════════════════════════════════════════════════

function parkBench(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  s: number,
): void {
  // Warm wood palette
  const wTop = "#C49A6C";
  const wLit = "#A67B5B";
  const wMid = "#8B6B4A";
  const wDk = "#6A4F35";
  const wShd = "#4E3A27";
  // Cast iron palette
  const iDk = "#2D2D2D";
  const iMid = "#424242";
  const iLit = "#555555";
  const iHi = "#6A6A6A";

  const seatHW = 12 * s;
  const seatHD = 3 * s;
  const seatThk = 1.8 * s;
  const legH = 7 * s;
  const legHW = 1 * s;
  const legHD = seatHD;
  const backH = 8 * s;
  const backHD = 0.8 * s;
  const backHW = 11 * s;

  const seatY = by - legH;
  const seatTopY = seatY - seatThk;

  // --- Backrest panel ---
  const brY = seatTopY - (seatHD - backHD);

  const brLG = ctx.createLinearGradient(bx - backHW, brY - backH, bx - backHW, brY);
  brLG.addColorStop(0, wLit);
  brLG.addColorStop(0.5, wMid);
  brLG.addColorStop(1, wDk);
  const brRG = ctx.createLinearGradient(bx + backHW, brY - backH, bx + backHW, brY);
  brRG.addColorStop(0, wShd);
  brRG.addColorStop(1, "#3E2E1F");
  isoBox(ctx, bx, brY, backHW, backHD, backH, wTop, brLG, brRG, s);

  // Horizontal slat lines on backrest
  faceHorizontalLines(ctx, bx - backHW, brY, bx, brY + backHD, backH, 4, s);
  faceHorizontalLines(ctx, bx + backHW, brY, bx, brY + backHD, backH, 4, s);

  // Wood grain on backrest faces
  ctx.strokeStyle = "rgba(60,40,20,0.07)";
  ctx.lineWidth = 0.25 * s;
  for (let g = 0; g < 3; g++) {
    const gy = brY - backH * (0.2 + g * 0.3);
    ctx.beginPath();
    ctx.moveTo(bx - backHW * 0.1, gy + backHD * 0.8);
    ctx.quadraticCurveTo(bx - backHW * 0.5, gy + backHD * 0.5, bx - backHW * 0.9, gy + backHD * 0.3);
    ctx.stroke();
  }

  // Top rail — slightly wider than backrest
  const railH = 1.5 * s;
  const railY = brY - backH;
  const railTG = ctx.createLinearGradient(bx - backHW, railY, bx + backHW, railY);
  railTG.addColorStop(0, wTop);
  railTG.addColorStop(0.4, "#D4AA7C");
  railTG.addColorStop(1, "#B08858");
  isoBox(ctx, bx, railY, backHW + 0.8 * s, backHD + 0.3 * s, railH, railTG, wLit, wDk, s);

  // --- Cast iron side frames ---
  for (const dir of [-1, 1] as const) {
    const lx = bx + dir * (seatHW - legHW);

    // Main upright
    const legLG = ctx.createLinearGradient(lx - legHW, by, lx - legHW, by - legH);
    legLG.addColorStop(0, iLit);
    legLG.addColorStop(1, iMid);
    isoBox(ctx, lx, by, legHW, legHD, legH + seatThk, iHi, legLG, iDk, s);

    // Decorative scrollwork on left face (visible side)
    ctx.strokeStyle = iHi;
    ctx.lineWidth = 0.7 * s;
    const fcy = by - legH * 0.45;
    // Main scroll curve
    ctx.beginPath();
    ctx.arc(lx - legHW * 0.2, fcy + legHD * 0.35, 2.2 * s, Math.PI * 0.3, Math.PI * 1.5);
    ctx.stroke();
    // Inner scroll
    ctx.beginPath();
    ctx.arc(lx - legHW * 0.2, fcy - 2 * s + legHD * 0.5, 1.3 * s, -Math.PI * 0.2, Math.PI * 1.1);
    ctx.stroke();
    // S-curve connector
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.moveTo(lx - legHW * 0.3, fcy + legHD * 0.35 + 2.2 * s);
    ctx.quadraticCurveTo(lx - legHW * 0.1, fcy + legHD * 0.35 + 3 * s, lx, fcy + legHD * 0.35 + 2.5 * s);
    ctx.stroke();

    // Foot pad (wider base)
    const fpLG = ctx.createLinearGradient(lx - legHW, by, lx + legHW, by);
    fpLG.addColorStop(0, iMid);
    fpLG.addColorStop(1, iDk);
    isoBox(ctx, lx, by + 0.3 * s, legHW + 0.6 * s, legHD + 0.3 * s, 0.6 * s, iHi, fpLG, iDk, s);

    // Bolts connecting seat to frame
    const boltY = seatY - seatThk * 0.5;
    drawBolt(ctx, lx - legHW * 0.3, boltY + legHD * 0.3, 0.6 * s);
    drawBolt(ctx, lx - legHW * 0.3, boltY + legHD * 0.7, 0.6 * s);
  }

  // --- Seat planks ---
  const sLG = ctx.createLinearGradient(bx - seatHW, seatTopY, bx - seatHW, seatY);
  sLG.addColorStop(0, wLit);
  sLG.addColorStop(0.5, wMid);
  sLG.addColorStop(1, wDk);
  const sTG = ctx.createLinearGradient(bx - seatHW, seatTopY, bx + seatHW, seatTopY);
  sTG.addColorStop(0, wTop);
  sTG.addColorStop(0.3, "#C49A6C");
  sTG.addColorStop(0.7, "#B8885C");
  sTG.addColorStop(1, "#B08050");
  isoBox(ctx, bx, seatY, seatHW, seatHD, seatThk, sTG, sLG, wShd, s);

  // Plank slat lines on top
  slatLinesOnTop(ctx, bx, seatTopY, seatHW, seatHD, 5, s);

  // Wood grain on seat top
  woodGrainOnTop(ctx, bx, seatTopY, seatHW, seatHD, s);

  // Edge highlight on front-left seat edge
  ctx.strokeStyle = "rgba(220,190,140,0.12)";
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(bx - seatHW, seatY - seatThk);
  ctx.lineTo(bx, seatY + seatHD - seatThk);
  ctx.stroke();
}

// ═══════════════════════════════════════════════════════════════
// Variant 1: Rustic Log Bench
// ═══════════════════════════════════════════════════════════════

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

    // Cylinder body with gradient
    const stGrad = ctx.createLinearGradient(sx - stR, by, sx + stR, by);
    stGrad.addColorStop(0, barkLt);
    stGrad.addColorStop(0.35, barkMd);
    stGrad.addColorStop(0.7, barkDk);
    stGrad.addColorStop(1, "#2A1B14");
    ctx.fillStyle = stGrad;
    ctx.beginPath();
    ctx.ellipse(sx, by, stR, stR * T, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(sx + stR, by - stH);
    ctx.ellipse(sx, by - stH, stR, stR * T, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();

    // Bark texture — vertical cracks
    ctx.strokeStyle = "rgba(30,18,10,0.2)";
    ctx.lineWidth = 0.4 * s;
    for (let b = 0; b < 4; b++) {
      const angle = 0.3 + b * 0.6;
      if (angle > Math.PI) break;
      const bx2 = sx + Math.cos(angle) * stR;
      ctx.beginPath();
      ctx.moveTo(bx2, by + Math.sin(angle) * stR * T);
      ctx.quadraticCurveTo(
        bx2 + (b % 2 === 0 ? 0.3 : -0.3) * s,
        by - stH * 0.5,
        bx2 + (b % 2 === 0 ? -0.2 : 0.4) * s,
        by - stH + Math.sin(angle) * stR * T,
      );
      ctx.stroke();
    }

    // Horizontal bark ridges
    ctx.strokeStyle = "rgba(30,18,10,0.12)";
    ctx.lineWidth = 0.3 * s;
    for (let r = 0; r < 3; r++) {
      const ry = by - stH * (0.2 + r * 0.3);
      ctx.beginPath();
      ctx.ellipse(sx, ry, stR + 0.2 * s, stR * T * 0.3, 0, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }

    // Stump top face — wood grain
    ctx.fillStyle = woodIn;
    ctx.beginPath();
    ctx.ellipse(sx, by - stH, stR, stR * T, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tree rings
    ctx.strokeStyle = woodRing;
    ctx.lineWidth = 0.4 * s;
    for (let r = 1; r <= 4; r++) {
      const rf = r / 5;
      ctx.beginPath();
      ctx.ellipse(sx, by - stH, stR * rf, stR * T * rf, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center pith
    ctx.fillStyle = barkMd;
    ctx.beginPath();
    ctx.arc(sx, by - stH, 0.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Bark rim on top
    ctx.strokeStyle = barkDk;
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.ellipse(sx, by - stH, stR, stR * T, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Bottom rim
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.3 * s;
    ctx.beginPath();
    ctx.ellipse(sx, by, stR, stR * T, 0, 0, Math.PI);
    ctx.stroke();

    // Moss patch on one stump
    if (dir === -1) {
      ctx.fillStyle = "rgba(76,175,80,0.25)";
      ctx.beginPath();
      ctx.ellipse(sx - stR * 0.5, by - stH * 0.4, 1.8 * s, 1 * s, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(56,142,60,0.18)";
      ctx.beginPath();
      ctx.ellipse(sx - stR * 0.3, by - stH * 0.25, 1.2 * s, 0.7 * s, -0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Split log seat ---
  const logY = by - stH;

  // Log body — half-cylinder shape
  const logGrad = ctx.createLinearGradient(bx - logHW, logY, bx + logHW, logY);
  logGrad.addColorStop(0, barkLt);
  logGrad.addColorStop(0.1, barkMd);
  logGrad.addColorStop(0.8, barkDk);
  logGrad.addColorStop(1, "#2A1B14");
  ctx.fillStyle = logGrad;
  ctx.beginPath();
  ctx.moveTo(bx - logHW, logY);
  ctx.lineTo(bx - logHW, logY - logR * 0.4);
  ctx.quadraticCurveTo(bx - logHW, logY - logR * 1.4, bx, logY - logR * 1.5);
  ctx.quadraticCurveTo(bx + logHW, logY - logR * 1.4, bx + logHW, logY - logR * 0.4);
  ctx.lineTo(bx + logHW, logY);
  ctx.closePath();
  ctx.fill();

  // Bark texture lines on log
  ctx.strokeStyle = "rgba(30,18,10,0.12)";
  ctx.lineWidth = 0.3 * s;
  for (let b = 0; b < 4; b++) {
    const bt = 0.15 + b * 0.2;
    const barkY = logY - logR * (0.3 + bt * 0.8);
    ctx.beginPath();
    ctx.moveTo(bx - logHW * 0.9, barkY + 0.5 * s);
    ctx.quadraticCurveTo(bx, barkY - 0.3 * s, bx + logHW * 0.9, barkY + 0.3 * s);
    ctx.stroke();
  }

  // Flat top face (sawn surface)
  const logTopGrad = ctx.createLinearGradient(bx - logHW, logY - logR, bx + logHW, logY - logR);
  logTopGrad.addColorStop(0, woodIn);
  logTopGrad.addColorStop(0.3, "#D4C4B4");
  logTopGrad.addColorStop(0.7, "#C8B8A8");
  logTopGrad.addColorStop(1, woodRing);
  ctx.fillStyle = logTopGrad;
  ctx.beginPath();
  ctx.ellipse(bx, logY - logR * 0.7, logHW, logR * T * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Grain lines on flat top
  ctx.strokeStyle = "rgba(93,64,55,0.1)";
  ctx.lineWidth = 0.3 * s;
  for (let g = 0; g < 7; g++) {
    const gx = bx - logHW * 0.85 + g * logHW * 0.28;
    const sway = (g % 2 === 0 ? 0.15 : -0.1) * logR * T;
    ctx.beginPath();
    ctx.moveTo(gx, logY - logR * 0.7 - logR * T * 0.6);
    ctx.quadraticCurveTo(
      gx + logHW * 0.04,
      logY - logR * 0.7 + sway,
      gx + logHW * 0.08,
      logY - logR * 0.7 + logR * T * 0.5,
    );
    ctx.stroke();
  }

  // Bottom bark edge
  ctx.strokeStyle = barkDk;
  ctx.lineWidth = 0.7 * s;
  ctx.beginPath();
  ctx.moveTo(bx - logHW, logY);
  ctx.quadraticCurveTo(bx, logY + logR * T * 0.5, bx + logHW, logY);
  ctx.stroke();

  // Highlight on top edge
  ctx.strokeStyle = "rgba(220,200,180,0.1)";
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.ellipse(bx, logY - logR * 0.7, logHW * 0.95, logR * T * 1.1, 0, Math.PI, Math.PI * 2);
  ctx.stroke();

  // End-grain cross-section (right end of log)
  const endX = bx + logHW;
  const endY = logY - logR * 0.35;
  ctx.fillStyle = woodIn;
  ctx.beginPath();
  ctx.ellipse(endX, endY, logR * 0.7, logR * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = woodRing;
  ctx.lineWidth = 0.3 * s;
  for (let r = 1; r <= 3; r++) {
    const rf = r / 4;
    ctx.beginPath();
    ctx.ellipse(endX, endY, logR * 0.7 * rf, logR * 0.9 * rf, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = barkDk;
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.ellipse(endX, endY, logR * 0.7, logR * 0.9, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Mushroom on right stump
  const msx = bx + 8 * s + stR * 0.7;
  const msy = by - stH * 0.4;
  ctx.fillStyle = "#E8E0D0";
  ctx.fillRect(msx - 0.4 * s, msy, 0.8 * s, 1.8 * s);
  ctx.fillStyle = "#D32F2F";
  ctx.beginPath();
  ctx.ellipse(msx, msy - 0.2 * s, 1.6 * s, 0.9 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(msx - 0.5 * s, msy - 0.4 * s, 0.3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(msx + 0.4 * s, msy - 0.5 * s, 0.22 * s, 0, Math.PI * 2);
  ctx.fill();
}

// ═══════════════════════════════════════════════════════════════
// Variant 2: Ornate Iron Garden Bench
// ═══════════════════════════════════════════════════════════════

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
  const iHi = "#606088";
  // Patina hints
  const patina = "rgba(80,140,120,0.12)";
  // Wood slat palette
  const wSlat = "#A1887F";
  const wDk = "#8D6E63";
  const wTop = "#BCAAA4";

  const frameHW = 11 * s;
  const frameHD = 3 * s;
  const seatH = 7 * s;
  const seatThk = 1.5 * s;
  const backH = 9 * s;
  const legW = 1.3 * s;
  const legD = frameHD;

  // --- Iron frame legs ---
  for (const dir of [-1, 1]) {
    const lx = bx + dir * (frameHW - legW);

    // Main leg upright
    const legLG = ctx.createLinearGradient(lx - legW, by, lx - legW, by - seatH);
    legLG.addColorStop(0, iLt);
    legLG.addColorStop(0.5, iMid);
    legLG.addColorStop(1, iLt);
    isoBox(ctx, lx, by, legW, legD, seatH, iTop, legLG, iDk, s);

    // Decorative scrollwork on left face
    ctx.strokeStyle = iHi;
    ctx.lineWidth = 0.8 * s;
    const fcy = by - seatH * 0.42;
    // Large scroll
    ctx.beginPath();
    ctx.arc(lx - legW * 0.2, fcy + legD * 0.3, 2.2 * s, Math.PI * 0.25, Math.PI * 1.5);
    ctx.stroke();
    // Small inner scroll
    ctx.beginPath();
    ctx.arc(lx - legW * 0.2, fcy - 2.2 * s + legD * 0.45, 1.3 * s, -Math.PI * 0.2, Math.PI * 1.0);
    ctx.stroke();
    // Connecting flourish
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.moveTo(lx - legW * 0.3, fcy + legD * 0.3 + 2.2 * s);
    ctx.quadraticCurveTo(lx, fcy + legD * 0.3 + 3 * s, lx + legW * 0.2, fcy + legD * 0.3 + 2 * s);
    ctx.stroke();

    // Patina spots
    ctx.fillStyle = patina;
    ctx.beginPath();
    ctx.ellipse(lx - legW * 0.5, by - seatH * 0.6, 1 * s, 0.7 * s, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Foot pad
    const fpLG = ctx.createLinearGradient(lx - legW, by, lx + legW, by);
    fpLG.addColorStop(0, iMid);
    fpLG.addColorStop(1, iDk);
    isoBox(ctx, lx, by + 0.3 * s, legW + 0.8 * s, legD + 0.4 * s, 0.6 * s, iTop, fpLG, iDk, s);
  }

  // --- Iron frame strip under seat ---
  const stY = by - seatH;
  // Left face strip
  ctx.fillStyle = iLt;
  ctx.beginPath();
  ctx.moveTo(bx - frameHW, stY + 0.8 * s);
  ctx.lineTo(bx, stY + 0.8 * s + frameHD);
  ctx.lineTo(bx, stY + frameHD);
  ctx.lineTo(bx - frameHW, stY);
  ctx.closePath();
  ctx.fill();
  // Right face strip
  ctx.fillStyle = iDk;
  ctx.beginPath();
  ctx.moveTo(bx + frameHW, stY + 0.8 * s);
  ctx.lineTo(bx, stY + 0.8 * s + frameHD);
  ctx.lineTo(bx, stY + frameHD);
  ctx.lineTo(bx + frameHW, stY);
  ctx.closePath();
  ctx.fill();

  // --- Wood seat slab ---
  const sLG = ctx.createLinearGradient(bx - frameHW, stY - seatThk, bx - frameHW, stY);
  sLG.addColorStop(0, wSlat);
  sLG.addColorStop(0.5, "#957060");
  sLG.addColorStop(1, wDk);
  const sTG = ctx.createLinearGradient(bx - frameHW, stY - seatThk, bx + frameHW, stY - seatThk);
  sTG.addColorStop(0, wTop);
  sTG.addColorStop(0.3, wSlat);
  sTG.addColorStop(0.7, "#A08070");
  sTG.addColorStop(1, "#988070");
  isoBox(ctx, bx, stY, frameHW, frameHD, seatThk, sTG, sLG, wDk, s);

  // Plank slat lines
  slatLinesOnTop(ctx, bx, stY - seatThk, frameHW, frameHD, 5, s);

  // Wood grain
  woodGrainOnTop(ctx, bx, stY - seatThk, frameHW, frameHD, s);

  // Highlight on front-left seat edge
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
    const upLG = ctx.createLinearGradient(ux, brBase, ux, brBase - backH);
    upLG.addColorStop(0, iMid);
    upLG.addColorStop(1, iLt);
    isoBox(ctx, ux, brBase, legW, legW * T, backH, iTop, upLG, iDk, s);
  }

  // --- Top rail ---
  const railY = brBase - backH;
  const railTG = ctx.createLinearGradient(bx - frameHW, railY, bx + frameHW, railY);
  railTG.addColorStop(0, iTop);
  railTG.addColorStop(0.5, iHi);
  railTG.addColorStop(1, iTop);
  isoBox(ctx, bx, railY, frameHW, legW * T, 1.5 * s, railTG, iMid, iDk, s);

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

  // --- Scrollwork circles on backrest ---
  ctx.strokeStyle = iHi;
  ctx.lineWidth = 0.65 * s;
  for (let sc = 0; sc < 3; sc++) {
    const scx = bx - frameHW * 0.5 + sc * frameHW * 0.5;
    const scy = brBase - backH * 0.62;
    const scr = 2.2 * s;
    // Outer circle
    ctx.beginPath();
    ctx.arc(scx, scy, scr, 0, Math.PI * 2);
    ctx.stroke();
    // Inner circle
    ctx.lineWidth = 0.35 * s;
    ctx.beginPath();
    ctx.arc(scx, scy, scr * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    // Radial spokes
    for (let sp = 0; sp < 4; sp++) {
      const angle = sp * Math.PI * 0.5 + 0.3;
      ctx.beginPath();
      ctx.moveTo(scx + Math.cos(angle) * scr * 0.45, scy + Math.sin(angle) * scr * 0.45);
      ctx.lineTo(scx + Math.cos(angle) * scr * 0.9, scy + Math.sin(angle) * scr * 0.9);
      ctx.stroke();
    }
    ctx.lineWidth = 0.65 * s;
  }

  // Small rosettes between main scrolls
  for (let sc = 0; sc < 2; sc++) {
    const scx = bx - frameHW * 0.25 + sc * frameHW * 0.5;
    const scy = brBase - backH * 0.2;
    ctx.lineWidth = 0.45 * s;
    ctx.beginPath();
    ctx.arc(scx, scy, 1.5 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = iHi;
    ctx.beginPath();
    ctx.arc(scx, scy, 0.4 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ═══════════════════════════════════════════════════════════════
// Variant 3: Stone Throne
// ═══════════════════════════════════════════════════════════════

function stoneThrone(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  s: number,
): void {
  // Stone palette
  const sTop = "#A0AAB0";
  const sTopHi = "#B4BEC4";
  const sLeft = "#607080";
  const sLeftLt = "#708090";
  const sRight = "#404A54";
  const sRightLt = "#505A64";

  const seatHW = 9 * s;
  const seatHD = seatHW * T;
  const seatH = 7 * s;
  const backHW = seatHW;
  const backHD = seatHD;
  const backH = 16 * s;
  const armW = 2.8 * s;
  const armD = armW * T;
  const armH = 5 * s;

  const bkY = by - seatH;

  // --- Backrest (drawn first, seat paints over lower portion) ---
  const bkLG = ctx.createLinearGradient(bx - backHW, bkY - backH, bx - backHW, bkY);
  bkLG.addColorStop(0, sLeftLt);
  bkLG.addColorStop(0.5, sLeft);
  bkLG.addColorStop(1, "#506070");

  const bkRG = ctx.createLinearGradient(bx + backHW, bkY - backH, bx + backHW, bkY);
  bkRG.addColorStop(0, sRightLt);
  bkRG.addColorStop(0.5, sRight);
  bkRG.addColorStop(1, "#354048");

  isoBox(ctx, bx, bkY, backHW, backHD, backH, sTop, bkLG, bkRG, s);

  // Stone block joints on both faces
  stoneJointsOnFace(ctx, bx - backHW, bkY, bx, bkY + backHD, backH, 5, s);
  stoneJointsOnFace(ctx, bx + backHW, bkY, bx, bkY + backHD, backH, 5, s);

  // Crown points on top of backrest
  const crY = bkY - backH;
  // Back-facing crown (darker)
  ctx.fillStyle = sRightLt;
  ctx.beginPath();
  ctx.moveTo(bx - backHW, crY);
  ctx.lineTo(bx - backHW * 0.68, crY - 3.5 * s);
  ctx.lineTo(bx - backHW * 0.38, crY - 1 * s);
  ctx.lineTo(bx, crY - 5 * s);
  ctx.lineTo(bx + backHW * 0.38, crY - 1 * s);
  ctx.lineTo(bx + backHW * 0.68, crY - 3.5 * s);
  ctx.lineTo(bx + backHW, crY);
  ctx.closePath();
  ctx.fill();
  // Crown highlight
  ctx.strokeStyle = "rgba(255,215,0,0.25)";
  ctx.lineWidth = 0.7 * s;
  ctx.stroke();

  // Crown front face (visible triangle tips)
  ctx.fillStyle = sLeft;
  ctx.beginPath();
  ctx.moveTo(bx, crY - 5 * s);
  ctx.lineTo(bx - 0.8 * s, crY - 4.5 * s);
  ctx.lineTo(bx, crY);
  ctx.lineTo(bx + 0.8 * s, crY - 4.5 * s);
  ctx.closePath();
  ctx.fill();

  // Gold gem on center crown point
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(bx, crY - 4.2 * s, 0.9 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,200,0.5)";
  ctx.beginPath();
  ctx.arc(bx - 0.2 * s, crY - 4.4 * s, 0.35 * s, 0, Math.PI * 2);
  ctx.fill();

  // Gold emblem on right face (sun motif)
  ctx.strokeStyle = "rgba(255,215,0,0.4)";
  ctx.lineWidth = 0.9 * s;
  const emX = bx + backHW * 0.5;
  const emY = bkY - backH * 0.5;
  ctx.beginPath();
  ctx.arc(emX, emY, 2.8 * s, 0, Math.PI * 2);
  ctx.stroke();
  // Sun rays
  ctx.lineWidth = 0.4 * s;
  for (let ray = 0; ray < 8; ray++) {
    const a = ray * Math.PI * 0.25;
    ctx.beginPath();
    ctx.moveTo(emX + Math.cos(a) * 2 * s, emY + Math.sin(a) * 2 * s);
    ctx.lineTo(emX + Math.cos(a) * 3.5 * s, emY + Math.sin(a) * 3.5 * s);
    ctx.stroke();
  }
  // Center dot
  ctx.fillStyle = "rgba(255,215,0,0.35)";
  ctx.beginPath();
  ctx.arc(emX, emY, 1 * s, 0, Math.PI * 2);
  ctx.fill();

  // Dimmer emblem on left face
  ctx.strokeStyle = "rgba(255,215,0,0.18)";
  ctx.lineWidth = 0.6 * s;
  const emLX = bx - backHW * 0.5;
  const emLY = bkY + backHD - backH * 0.5;
  ctx.beginPath();
  ctx.arc(emLX, emLY, 2.3 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 0.35 * s;
  for (let ray = 0; ray < 8; ray++) {
    const a = ray * Math.PI * 0.25;
    ctx.beginPath();
    ctx.moveTo(emLX + Math.cos(a) * 1.5 * s, emLY + Math.sin(a) * 1.5 * s);
    ctx.lineTo(emLX + Math.cos(a) * 2.8 * s, emLY + Math.sin(a) * 2.8 * s);
    ctx.stroke();
  }

  // --- Seat block (drawn over backrest's lower portion) ---
  const stLG = ctx.createLinearGradient(bx - seatHW, by - seatH, bx - seatHW, by);
  stLG.addColorStop(0, sLeftLt);
  stLG.addColorStop(0.5, sLeft);
  stLG.addColorStop(1, "#506070");
  const stRG = ctx.createLinearGradient(bx + seatHW, by - seatH, bx + seatHW, by);
  stRG.addColorStop(0, sRightLt);
  stRG.addColorStop(1, sRight);
  isoBox(ctx, bx, by, seatHW, seatHD, seatH, sTop, stLG, stRG, s);

  // Stone joints on seat
  stoneJointsOnFace(ctx, bx - seatHW, by, bx, by + seatHD, seatH, 2, s);
  stoneJointsOnFace(ctx, bx + seatHW, by, bx, by + seatHD, seatH, 2, s);

  // Worn/polished highlight on seat top
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.moveTo(bx, by - seatH - seatHD + 0.5 * s);
  ctx.lineTo(bx + seatHW * 0.7, by - seatH + 0.5 * s);
  ctx.lineTo(bx, by + seatHD - seatH + 0.5 * s);
  ctx.lineTo(bx - seatHW * 0.7, by - seatH + 0.5 * s);
  ctx.closePath();
  ctx.fill();

  // Dividing line between seat and backrest
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.moveTo(bx - seatHW, bkY);
  ctx.lineTo(bx, bkY + seatHD);
  ctx.lineTo(bx + seatHW, bkY);
  ctx.stroke();

  // --- Armrests ---
  for (const dir of [-1, 1]) {
    const ax = bx + dir * (seatHW + armW + 0.3 * s);
    const aY = by - seatH;

    // Armrest body
    const armLG = ctx.createLinearGradient(ax, aY, ax, aY - armH);
    armLG.addColorStop(0, sLeft);
    armLG.addColorStop(1, sLeftLt);
    isoBox(ctx, ax, aY, armW, armD, armH, sTop, armLG, sRight, s);

    // Carved channel on front face
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 0.3 * s;
    const chY = aY - armH * 0.5;
    ctx.beginPath();
    ctx.moveTo(ax - armW * 0.6, chY);
    ctx.lineTo(ax, chY + armD * 0.6);
    ctx.stroke();

    // Cap stone (wider flat top)
    const capW = armW + 0.6 * s;
    const capD = capW * T;
    isoBox(ctx, ax, aY - armH, capW, capD, 1 * s, sTopHi, sLeftLt, sRightLt, s);

    // Slight bevel highlight on cap
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 0.3 * s;
    ctx.beginPath();
    ctx.moveTo(ax - capW, aY - armH - 1 * s);
    ctx.lineTo(ax, aY - armH - capD - 1 * s);
    ctx.stroke();
  }

  // Weathering — subtle cracks on seat face
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 0.25 * s;
  ctx.beginPath();
  ctx.moveTo(bx - seatHW * 0.3, by - seatH * 0.7);
  ctx.quadraticCurveTo(bx - seatHW * 0.1, by - seatH * 0.5, bx - seatHW * 0.2, by - seatH * 0.2);
  ctx.stroke();
}

// ═══════════════════════════════════════════════════════════════
// Public entry point
// ═══════════════════════════════════════════════════════════════

export function drawBench(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  s: number,
  variant: number,
): void {
  const bv = variant % 4;
  drawDirectionalShadow(ctx, bx, by + 1 * s, s, 14 * s, 6 * s, 18 * s, 0.22);

  switch (bv) {
    case 0:
      parkBench(ctx, bx, by, s);
      break;
    case 1:
      logBench(ctx, bx, by, s);
      break;
    case 2:
      ironBench(ctx, bx, by, s);
      break;
    case 3:
      stoneThrone(ctx, bx, by, s);
      break;
  }
}
