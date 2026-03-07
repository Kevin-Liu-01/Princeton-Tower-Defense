import type { Position } from "../../types";
import { resolveWeaponRotation, WEAPON_LIMITS } from "./helpers";

export function drawFScottHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breathe = Math.sin(time * 2) * 1;
  const goldPulse = Math.sin(time * 3) * 0.3 + 0.7;

  // Idle writing animation phase
  const writeCycle = (time * 0.8) % 1;
  const penStrokeX = Math.sin(writeCycle * Math.PI * 4) * size * 0.02;
  const penStrokeY = Math.sin(writeCycle * Math.PI * 2) * size * 0.01;

  drawAura(ctx, x, y, size, time, isAttacking, attackIntensity, goldPulse, zoom);
  drawFloatingLetters(ctx, x, y, size, time, goldPulse, zoom);

  if (isAttacking) {
    drawAttackRings(ctx, x, y, size, attackPhase, attackIntensity, zoom);
  }

  drawShadow(ctx, x, y, size);
  drawSuit(ctx, x, y, size, breathe, zoom);
  drawEpaulettes(ctx, x, y, size, time, zoom);
  drawAiguillette(ctx, x, y, size, time, zoom);
  drawVest(ctx, x, y, size, zoom);
  drawShirtAndTie(ctx, x, y, size, isAttacking, attackIntensity, zoom);
  drawArms(ctx, x, y, size, time, zoom, isAttacking, attackPhase, penStrokeX, penStrokeY);
  drawHead(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
  drawBook(ctx, x, y, size, time, zoom, isAttacking, writeCycle);
  drawPen(ctx, x, y, size, time, zoom, isAttacking, attackPhase, attackIntensity, penStrokeX, penStrokeY, targetPos);
  drawFloatingWords(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
  drawLiteraryAura(ctx, x, y, size, time, zoom, attackIntensity);
}

// ─── AURA ────────────────────────────────────────────────────────────────────

function drawAura(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, isAttacking: boolean, attackIntensity: number,
  goldPulse: number, zoom: number
) {
  const auraBase = isAttacking ? 0.4 : 0.22;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;
  for (let layer = 0; layer < 4; layer++) {
    const off = layer * 0.08;
    const g = ctx.createRadialGradient(
      x, y - size * 0.1, size * (0.1 + off),
      x, y - size * 0.1, size * (0.95 + off * 0.3)
    );
    const a = (auraBase - layer * 0.04) * auraPulse;
    g.addColorStop(0, `rgba(60, 200, 200, ${a * 0.5})`);
    g.addColorStop(0.3, `rgba(40, 170, 170, ${a * 0.35})`);
    g.addColorStop(0.6, `rgba(30, 140, 140, ${a * 0.2})`);
    g.addColorStop(1, "rgba(60, 200, 200, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.1, size * (0.85 + off * 0.15), size * (0.75 + off * 0.12), 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFloatingLetters(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, goldPulse: number, zoom: number
) {
  const letters = "GATSBY";
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.5 + p * Math.PI * 2 / 10) % (Math.PI * 2);
    const pDist = size * 0.6 + Math.sin(time * 2 + p * 0.7) * size * 0.1;
    const pRise = ((time * 0.5 + p * 0.4) % 1) * size * 0.25;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - size * 0.1 + Math.sin(pAngle) * pDist * 0.4 - pRise;
    const pAlpha = (0.6 - pRise / (size * 0.25) * 0.4) * goldPulse;
    ctx.fillStyle = `rgba(80, 210, 210, ${pAlpha})`;
    ctx.font = `italic ${8 * zoom}px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(letters[p % letters.length], px, py);
  }
}

// ─── ATTACK RINGS ────────────────────────────────────────────────────────────

function drawAttackRings(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  attackPhase: number, attackIntensity: number, zoom: number
) {
  for (let ring = 0; ring < 4; ring++) {
    const phase = (attackPhase * 2 + ring * 0.12) % 1;
    const alpha = (1 - phase) * 0.5 * attackIntensity;
    ctx.strokeStyle = `rgba(80, 210, 210, ${alpha})`;
    ctx.lineWidth = (3.5 - ring * 0.6) * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.12, size * (0.55 + phase * 0.5), size * (0.65 + phase * 0.5), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ─── SHADOW ──────────────────────────────────────────────────────────────────

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const g = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.45);
  g.addColorStop(0, "rgba(0,0,0,0.45)");
  g.addColorStop(0.6, "rgba(0,0,0,0.2)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.42, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── SUIT JACKET ─────────────────────────────────────────────────────────────

function drawSuit(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  breathe: number, zoom: number
) {
  const suitGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.1, x + size * 0.4, y + size * 0.3);
  suitGrad.addColorStop(0, "#1a1a28");
  suitGrad.addColorStop(0.25, "#2a2a3a");
  suitGrad.addColorStop(0.5, "#353548");
  suitGrad.addColorStop(0.75, "#2a2a3a");
  suitGrad.addColorStop(1, "#1a1a28");
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.5 + breathe);
  ctx.lineTo(x - size * 0.42, y - size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.28, x, y - size * 0.32);
  ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.28, x + size * 0.42, y - size * 0.1);
  ctx.lineTo(x + size * 0.38, y + size * 0.5 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0a0a15";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Pinstripes
  ctx.strokeStyle = "rgba(60, 60, 80, 0.3)";
  ctx.lineWidth = 0.8;
  for (let s = 0; s < 8; s++) {
    const sx = x - size * 0.32 + s * size * 0.09;
    ctx.beginPath();
    ctx.moveTo(sx, y - size * 0.15);
    ctx.lineTo(sx - size * 0.02, y + size * 0.45);
    ctx.stroke();
  }

  // Left lapel
  const lapelG = ctx.createLinearGradient(x - size * 0.25, y - size * 0.2, x - size * 0.08, y + size * 0.18);
  lapelG.addColorStop(0, "#1a1a28");
  lapelG.addColorStop(0.4, "#252535");
  lapelG.addColorStop(1, "#1a1a28");
  ctx.fillStyle = lapelG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.24);
  ctx.lineTo(x - size * 0.28, y + size * 0.18);
  ctx.lineTo(x - size * 0.1, y + size * 0.2);
  ctx.lineTo(x - size * 0.12, y - size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#40b0b0";
  ctx.shadowColor = "#50d0d0";
  ctx.shadowBlur = 3 * zoom;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Right lapel
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.24);
  ctx.lineTo(x + size * 0.28, y + size * 0.18);
  ctx.lineTo(x + size * 0.1, y + size * 0.2);
  ctx.lineTo(x + size * 0.12, y - size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#40b0b0";
  ctx.shadowColor = "#50d0d0";
  ctx.shadowBlur = 3 * zoom;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Lapel flower
  ctx.fillStyle = "#cc2233";
  ctx.beginPath();
  ctx.arc(x - size * 0.22, y - size * 0.08, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dd4455";
  ctx.beginPath();
  ctx.arc(x - size * 0.215, y - size * 0.085, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
}

// ─── EPAULETTES (TEAL) ──────────────────────────────────────────────────────

function drawEpaulettes(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number
) {
  for (let side = -1; side <= 1; side += 2) {
    const epX = x + side * size * 0.4;
    const epY = y - size * 0.22;

    ctx.save();
    ctx.translate(epX, epY);
    ctx.rotate(side * 0.15);

    const epW = size * 0.18;
    const epH = size * 0.08;

    // Base pad (dark navy)
    const padG = ctx.createLinearGradient(-epW, -epH, epW, epH);
    padG.addColorStop(0, "#1a2a30");
    padG.addColorStop(0.3, "#203840");
    padG.addColorStop(0.5, "#254048");
    padG.addColorStop(0.7, "#203840");
    padG.addColorStop(1, "#1a2a30");
    ctx.fillStyle = padG;
    ctx.beginPath();
    ctx.ellipse(0, 0, epW, epH, side * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Teal border
    ctx.strokeStyle = "#40c0c0";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Inner teal trim ring
    ctx.strokeStyle = "#309090";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, epW * 0.75, epH * 0.65, side * 0.1, 0, Math.PI * 2);
    ctx.stroke();

    // Teal fringe strands
    const fringeCount = 9;
    for (let f = 0; f < fringeCount; f++) {
      const fAngle = (side === -1 ? 0.2 : -0.2) + Math.PI * 0.3 + f * (Math.PI * 0.5 / (fringeCount - 1));
      const fx = Math.cos(fAngle) * epW;
      const fy = Math.sin(fAngle) * epH;
      const fLen = size * (0.06 + Math.sin(f * 1.3) * 0.015);
      const fWave = Math.sin(time * 3 + f * 0.6) * size * 0.008;

      const fringeG = ctx.createLinearGradient(fx, fy, fx + fWave, fy + fLen);
      fringeG.addColorStop(0, "#50d0d0");
      fringeG.addColorStop(0.4, "#70e8e8");
      fringeG.addColorStop(0.7, "#40b8b8");
      fringeG.addColorStop(1, "#2a9090");
      ctx.strokeStyle = fringeG;
      ctx.lineWidth = 1.8 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx + fWave * 0.6, fy + fLen * 0.5, fx + fWave, fy + fLen);
      ctx.stroke();

      // Tip bead
      ctx.fillStyle = "#60e0e0";
      ctx.beginPath();
      ctx.arc(fx + fWave, fy + fLen, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center star emblem (teal)
    ctx.fillStyle = "#60e8e8";
    ctx.shadowColor = "#50d0d0";
    ctx.shadowBlur = 5 * zoom;
    ctx.beginPath();
    for (let s = 0; s < 5; s++) {
      const sa = s * Math.PI * 2 / 5 - Math.PI / 2;
      const sa2 = sa + Math.PI / 5;
      const outerR = size * 0.035;
      const innerR = size * 0.015;
      if (s === 0) ctx.moveTo(Math.cos(sa) * outerR, Math.sin(sa) * outerR);
      else ctx.lineTo(Math.cos(sa) * outerR, Math.sin(sa) * outerR);
      ctx.lineTo(Math.cos(sa2) * innerR, Math.sin(sa2) * innerR);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Star highlight
    ctx.fillStyle = "#b0ffff";
    ctx.beginPath();
    ctx.arc(-size * 0.005, -size * 0.008, size * 0.008, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ─── AIGUILLETTE (teal braided cord from right shoulder) ────────────────────

function drawAiguillette(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number
) {
  const startX = x + size * 0.35;
  const startY = y - size * 0.18;
  const sway = Math.sin(time * 2) * size * 0.01;

  // Three braided loops draping across the chest
  for (let loop = 0; loop < 3; loop++) {
    const loopDepth = size * (0.12 + loop * 0.06);
    const loopWidth = size * (0.2 + loop * 0.05);
    const alpha = 0.7 - loop * 0.12;

    ctx.strokeStyle = `rgba(64, 192, 192, ${alpha})`;
    ctx.lineWidth = (2 - loop * 0.3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY + loop * size * 0.03);
    ctx.quadraticCurveTo(
      startX - loopWidth * 0.5 + sway,
      startY + loopDepth + loop * size * 0.02,
      startX - loopWidth + sway * 0.5,
      startY + loop * size * 0.04
    );
    ctx.stroke();

    // Subtle glow version underneath
    ctx.strokeStyle = `rgba(80, 220, 220, ${alpha * 0.25})`;
    ctx.lineWidth = (3.5 - loop * 0.4) * zoom;
    ctx.stroke();
  }

  // Tip ferrule
  ctx.fillStyle = "#50d0d0";
  ctx.beginPath();
  ctx.arc(startX - size * 0.35, startY + size * 0.04, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Pocket square (teal, peeking from left breast pocket)
  const pqX = x - size * 0.2;
  const pqY = y + size * 0.02;
  ctx.fillStyle = "#3ab8b8";
  ctx.beginPath();
  ctx.moveTo(pqX - size * 0.03, pqY);
  ctx.lineTo(pqX - size * 0.015, pqY - size * 0.06);
  ctx.lineTo(pqX + size * 0.005, pqY - size * 0.05);
  ctx.lineTo(pqX + size * 0.02, pqY - size * 0.065);
  ctx.lineTo(pqX + size * 0.035, pqY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a9898";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Decorative teal piping along jacket hem
  ctx.strokeStyle = "rgba(60, 190, 190, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y + size * 0.48);
  ctx.quadraticCurveTo(x, y + size * 0.52, x + size * 0.36, y + size * 0.48);
  ctx.stroke();

  // Teal pocket watch chain across vest
  ctx.strokeStyle = "#40b0b0";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y + size * 0.05);
  ctx.quadraticCurveTo(x + size * 0.08, y + size * 0.12, x + size * 0.14, y + size * 0.08);
  ctx.stroke();
  // Watch fob
  ctx.fillStyle = "#50d0d0";
  ctx.shadowColor = "#50d0d0";
  ctx.shadowBlur = 3 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.14, y + size * 0.08, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Watch fob highlight
  ctx.fillStyle = "#a0f0f0";
  ctx.beginPath();
  ctx.arc(x + size * 0.136, y + size * 0.075, size * 0.005, 0, Math.PI * 2);
  ctx.fill();
}

// ─── VEST ────────────────────────────────────────────────────────────────────

function drawVest(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, zoom: number
) {
  const vestGrad = ctx.createLinearGradient(x - size * 0.15, y - size * 0.18, x + size * 0.15, y + size * 0.3);
  vestGrad.addColorStop(0, "#5a4530");
  vestGrad.addColorStop(0.3, "#7a6545");
  vestGrad.addColorStop(0.5, "#8b7555");
  vestGrad.addColorStop(0.7, "#7a6545");
  vestGrad.addColorStop(1, "#5a4530");
  ctx.fillStyle = vestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.2);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.lineTo(x + size * 0.14, y - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Brocade pattern
  ctx.strokeStyle = "rgba(180, 150, 100, 0.3)";
  ctx.lineWidth = 0.8;
  for (let p = 0; p < 4; p++) {
    const py = y - size * 0.1 + p * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1, py);
    ctx.quadraticCurveTo(x, py - size * 0.02, x + size * 0.1, py);
    ctx.stroke();
  }

  // Vest border
  ctx.strokeStyle = "#4a3520";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.2);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.2);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.stroke();

  // Gold buttons
  for (let i = 0; i < 4; i++) {
    const by = y - size * 0.1 + i * size * 0.095;
    ctx.fillStyle = "#8b6914";
    ctx.beginPath();
    ctx.arc(x + size * 0.005, by + size * 0.005, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    const bg = ctx.createRadialGradient(x - size * 0.005, by - size * 0.005, 0, x, by, size * 0.022);
    bg.addColorStop(0, "#ffec8b");
    bg.addColorStop(0.5, "#daa520");
    bg.addColorStop(1, "#b8860b");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(x, by, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,220,0.5)";
    ctx.beginPath();
    ctx.arc(x - size * 0.008, by - size * 0.008, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── SHIRT & TIE ────────────────────────────────────────────────────────────

function drawShirtAndTie(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  isAttacking: boolean, attackIntensity: number, zoom: number
) {
  // Shirt
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.2, y - size * 0.08);
  ctx.quadraticCurveTo(x, y - size * 0.14, x + size * 0.2, y - size * 0.08);
  ctx.lineTo(x + size * 0.14, y - size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Collar points
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.18, y - size * 0.16);
  ctx.lineTo(x - size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.22);
  ctx.lineTo(x + size * 0.18, y - size * 0.16);
  ctx.lineTo(x + size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();

  // Tie
  ctx.shadowColor = "#50d0d0";
  ctx.shadowBlur = isAttacking ? 10 * zoom * attackIntensity : 4 * zoom;
  const tG = ctx.createLinearGradient(x, y - size * 0.18, x, y + size * 0.22);
  tG.addColorStop(0, "#40c0c0");
  tG.addColorStop(0.2, "#35a5a5");
  tG.addColorStop(0.5, "#2a8a8a");
  tG.addColorStop(0.8, "#206a6a");
  tG.addColorStop(1, "#185050");
  ctx.fillStyle = tG;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x - size * 0.07, y + size * 0.14);
  ctx.lineTo(x, y + size * 0.22);
  ctx.lineTo(x + size * 0.07, y + size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Tie stripes
  ctx.strokeStyle = "rgba(20, 60, 60, 0.4)";
  ctx.lineWidth = 1.5;
  for (let s = 0; s < 5; s++) {
    const sy = y - size * 0.1 + s * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.04, sy);
    ctx.lineTo(x + size * 0.04, sy + size * 0.03);
    ctx.stroke();
  }

  // Tie knot
  ctx.fillStyle = "#50d0d0";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.16, size * 0.045, size * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ─── ARMS ────────────────────────────────────────────────────────────────────

function drawArms(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
  isAttacking: boolean, attackPhase: number,
  penStrokeX: number, penStrokeY: number
) {
  // Left arm: curls inward to hold book at center body
  const leftGesture = isAttacking
    ? Math.sin(attackPhase * Math.PI) * 0.5
    : 0.15 + Math.sin(time * 1.2) * 0.03;

  ctx.save();
  ctx.translate(x - size * 0.38, y - size * 0.08);
  ctx.rotate(0.55 + leftGesture * 0.3);

  drawSuitSleeve(ctx, size, zoom, 1);

  // Left hand (holding book from beneath)
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(size * 0.01, size * 0.34, size * 0.04, size * 0.045, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(size * 0.01, size * 0.37, size * 0.022, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  ctx.restore();

  // Right arm: curls inward to write on book at center body
  const rightFlourish = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.5) * 0.6 + 0.3
    : 0.15 + Math.sin(time * 2) * 0.03;

  ctx.save();
  ctx.translate(x + size * 0.38, y - size * 0.1);
  ctx.rotate(-0.55 - rightFlourish * 0.3);

  drawSuitSleeve(ctx, size, zoom, -1);

  // Right hand (pen grip)
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(-size * 0.01 + (isAttacking ? 0 : penStrokeX * 0.3), size * 0.34 + (isAttacking ? 0 : penStrokeY * 0.3), size * 0.04, size * 0.045, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, size * 0.32);
  ctx.quadraticCurveTo(-size * 0.045, size * 0.34, -size * 0.04, size * 0.37);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, size * 0.37);
  ctx.lineTo(-size * 0.025, size * 0.43);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 0.005, size * 0.38, size * 0.025, 0.2 * Math.PI, 0.7 * Math.PI);
  ctx.stroke();

  ctx.restore();
}

function drawSuitSleeve(
  ctx: CanvasRenderingContext2D,
  size: number, zoom: number, dir: number
) {
  const sg = ctx.createLinearGradient(0, 0, dir * size * 0.1, size * 0.35);
  sg.addColorStop(0, "#2a2a3a");
  sg.addColorStop(0.5, "#353548");
  sg.addColorStop(1, "#1a1a28");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(dir * size * 0.07, size * 0.12, dir * size * 0.04, size * 0.3);
  ctx.lineTo(-dir * size * 0.06, size * 0.28);
  ctx.quadraticCurveTo(-dir * size * 0.08, size * 0.12, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0a0a15";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Cuff
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(-dir * size * 0.01, size * 0.29, size * 0.055, size * 0.022, -dir * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e8e8e8";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Cufflink (teal)
  ctx.fillStyle = "#40b8b8";
  ctx.beginPath();
  ctx.arc(-dir * size * 0.01, size * 0.29, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a0f0f0";
  ctx.beginPath();
  ctx.arc(-dir * size * 0.014, size * 0.286, size * 0.005, 0, Math.PI * 2);
  ctx.fill();
}

// ─── HEAD ────────────────────────────────────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
  isAttacking: boolean, attackIntensity: number
) {
  const headY = y - size * 0.5;

  // Face
  const fg = ctx.createRadialGradient(x - size * 0.05, headY - size * 0.05, 0, x, headY, size * 0.28);
  fg.addColorStop(0, "#ffe8d0");
  fg.addColorStop(0.5, "#ffe0bd");
  fg.addColorStop(1, "#f0c8a0");
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Jaw
  ctx.fillStyle = "#f5d5b0";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, headY + size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.1, headY + size * 0.22, x, headY + size * 0.26);
  ctx.quadraticCurveTo(x + size * 0.1, headY + size * 0.22, x + size * 0.16, headY + size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Cheekbone shadows
  ctx.fillStyle = "rgba(200, 160, 120, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.15, headY + size * 0.02, size * 0.06, size * 0.04, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.15, headY + size * 0.02, size * 0.06, size * 0.04, 0.3, 0, Math.PI * 2);
  ctx.fill();

  drawHair(ctx, x, headY, size, zoom);
  drawEyes(ctx, x, headY, size, time, zoom, isAttacking, attackIntensity);
  drawNoseAndMouth(ctx, x, headY, size, zoom);
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, size: number, zoom: number
) {
  const hg = ctx.createLinearGradient(x - size * 0.2, headY - size * 0.2, x + size * 0.2, headY - size * 0.1);
  hg.addColorStop(0, "#2a1810");
  hg.addColorStop(0.3, "#3a2515");
  hg.addColorStop(0.7, "#3a2515");
  hg.addColorStop(1, "#2a1810");
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.14, size * 0.27, size * 0.16, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Hair wave left
  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, headY - size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.28, headY, x - size * 0.26, headY + size * 0.1);
  ctx.stroke();

  // Hair right
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.24, headY - size * 0.02, x + size * 0.22, headY + size * 0.06);
  ctx.stroke();

  // Hair shine
  ctx.strokeStyle = "rgba(80, 60, 40, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, headY - size * 0.22);
  ctx.quadraticCurveTo(x, headY - size * 0.26, x + size * 0.1, headY - size * 0.22);
  ctx.stroke();

  // Part line
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, headY - size * 0.24);
  ctx.lineTo(x + size * 0.14, headY - size * 0.08);
  ctx.stroke();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, size: number,
  time: number, zoom: number,
  isAttacking: boolean, attackIntensity: number
) {
  // Socket shadows
  ctx.fillStyle = "rgba(180, 140, 100, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, headY - size * 0.02, size * 0.08, size * 0.05, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, headY - size * 0.02, size * 0.08, size * 0.05, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Whites
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, headY - size * 0.02, size * 0.065, size * 0.055, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1, headY - size * 0.02, size * 0.065, size * 0.055, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Irises
  if (isAttacking) {
    ctx.shadowColor = "#50d0d0";
    ctx.shadowBlur = 8 * zoom * attackIntensity;
    ctx.fillStyle = `rgba(60, 200, 200, ${0.85 + attackIntensity * 0.15})`;
  } else {
    ctx.fillStyle = "#4a6080";
  }
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Iris rings
  ctx.strokeStyle = isAttacking ? "#2a9090" : "#3a5070";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();

  // Pupils
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Highlights
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.115, headY - size * 0.035, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.085, headY - size * 0.035, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY - size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.1, headY - size * 0.11, x - size * 0.04, headY - size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.08);
  ctx.quadraticCurveTo(x + size * 0.1, headY - size * 0.11, x + size * 0.04, headY - size * 0.08);
  ctx.stroke();
}

function drawNoseAndMouth(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, size: number, zoom: number
) {
  // Nose
  ctx.strokeStyle = "#c8a888";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.02);
  ctx.lineTo(x - size * 0.02, headY + size * 0.08);
  ctx.quadraticCurveTo(x, headY + size * 0.1, x + size * 0.02, headY + size * 0.08);
  ctx.stroke();

  // Smile
  ctx.strokeStyle = "#a08070";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, headY + size * 0.14);
  ctx.quadraticCurveTo(x, headY + size * 0.16, x + size * 0.08, headY + size * 0.14);
  ctx.stroke();
}

// ─── BOOK ────────────────────────────────────────────────────────────────────

function drawBook(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
  isAttacking: boolean, writeCycle: number
) {
  // Book held at center of body, open and facing up
  const bookX = x - size * 0.02;
  const bookY = y + size * 0.28;
  const bookTilt = Math.sin(time * 1.2) * 0.015;

  ctx.save();
  ctx.translate(bookX, bookY);
  ctx.rotate(bookTilt);

  const bW = size * 0.28;
  const bH = size * 0.2;

  // Book shadow beneath
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(0, bH * 0.05, bW * 0.55, bH * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back cover (slightly visible)
  const backG = ctx.createLinearGradient(-bW * 0.5, 0, bW * 0.5, 0);
  backG.addColorStop(0, "#5a2a10");
  backG.addColorStop(0.5, "#6b3818");
  backG.addColorStop(1, "#5a2a10");
  ctx.fillStyle = backG;
  ctx.beginPath();
  ctx.roundRect(-bW * 0.5, -bH * 0.5, bW, bH, size * 0.008);
  ctx.fill();
  ctx.strokeStyle = "#4a1a08";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Book spine (center fold line)
  ctx.strokeStyle = "#3a1a08";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -bH * 0.5);
  ctx.lineTo(0, bH * 0.5);
  ctx.stroke();

  // Left page (creamy white)
  ctx.fillStyle = "#f8f0e0";
  ctx.beginPath();
  ctx.roundRect(-bW * 0.47, -bH * 0.46, bW * 0.45, bH * 0.92, size * 0.003);
  ctx.fill();

  // Right page
  ctx.fillStyle = "#faf4ea";
  ctx.beginPath();
  ctx.roundRect(bW * 0.02, -bH * 0.46, bW * 0.45, bH * 0.92, size * 0.003);
  ctx.fill();

  // Left page writing lines (already written)
  ctx.strokeStyle = "rgba(80, 60, 40, 0.2)";
  ctx.lineWidth = 0.6;
  for (let line = 0; line < 8; line++) {
    const ly = -bH * 0.36 + line * bH * 0.1;
    ctx.beginPath();
    ctx.moveTo(-bW * 0.43, ly);
    ctx.lineTo(-bW * 0.07, ly);
    ctx.stroke();
  }

  // Right page lines + ink animation
  for (let line = 0; line < 8; line++) {
    const ly = -bH * 0.36 + line * bH * 0.1;
    ctx.strokeStyle = "rgba(80, 60, 40, 0.15)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(bW * 0.06, ly);
    ctx.lineTo(bW * 0.43, ly);
    ctx.stroke();
  }

  if (!isAttacking) {
    const inkLine = Math.floor(writeCycle * 8);
    const inkProgress = (writeCycle * 8) % 1;
    if (inkLine < 8) {
      const iy = -bH * 0.36 + inkLine * bH * 0.1;
      ctx.strokeStyle = "rgba(20, 15, 10, 0.55)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(bW * 0.06, iy);
      ctx.lineTo(bW * 0.06 + bW * 0.37 * inkProgress, iy);
      ctx.stroke();
    }
  }

  // Teal title emboss on left page header
  ctx.fillStyle = "#40b0b0";
  ctx.font = `bold ${4.5 * zoom}px Georgia`;
  ctx.textAlign = "center";
  ctx.fillText("GATSBY", -bW * 0.24, -bH * 0.38);

  // Teal corner decorations on covers
  ctx.strokeStyle = "#309090";
  ctx.lineWidth = 0.8;
  const corners = [
    { cx: -bW * 0.47, cy: -bH * 0.47, dx: 1, dy: 1 },
    { cx: -bW * 0.02, cy: -bH * 0.47, dx: -1, dy: 1 },
    { cx: bW * 0.47, cy: -bH * 0.47, dx: -1, dy: 1 },
    { cx: bW * 0.02, cy: -bH * 0.47, dx: 1, dy: 1 },
  ];
  for (const c of corners) {
    ctx.beginPath();
    ctx.moveTo(c.cx, c.cy + c.dy * bH * 0.04);
    ctx.lineTo(c.cx, c.cy);
    ctx.lineTo(c.cx + c.dx * bW * 0.05, c.cy);
    ctx.stroke();
  }

  // Teal ribbon bookmark hanging out bottom
  ctx.strokeStyle = "#40c0c0";
  ctx.lineWidth = 1.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(bW * 0.15, bH * 0.48);
  ctx.quadraticCurveTo(bW * 0.18, bH * 0.62, bW * 0.12, bH * 0.7);
  ctx.stroke();

  ctx.restore();
}

// ─── PEN ─────────────────────────────────────────────────────────────────────

function drawPen(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
  isAttacking: boolean, attackPhase: number, attackIntensity: number,
  penStrokeX: number, penStrokeY: number,
  targetPos?: Position
) {
  const quillFlourish = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.2 : 0;

  // Pen positioned at center-right of body, pointing down at the book
  const penBaseX = x + size * 0.1 + (isAttacking ? 0 : penStrokeX);
  const penBaseY = y + size * 0.12 + (isAttacking ? 0 : penStrokeY);
  const penIdleRot = -0.8 + Math.sin(time * 2) * 0.04;
  const penBaseRot = isAttacking ? -0.3 + quillFlourish * 0.3 : penIdleRot;

  const penRot = resolveWeaponRotation(
    targetPos,
    penBaseX,
    penBaseY,
    penBaseRot,
    Math.PI / 2,
    isAttacking ? 1.2 : 0.66,
    WEAPON_LIMITS.rightMelee,
  );

  ctx.save();
  ctx.translate(penBaseX, penBaseY);
  ctx.rotate(penRot);

  if (isAttacking) {
    ctx.shadowColor = "#50d0d0";
    ctx.shadowBlur = 15 * zoom * attackIntensity;
  }

  // Pen body
  const pg = ctx.createLinearGradient(-size * 0.02, -size * 0.2, size * 0.02, -size * 0.2);
  pg.addColorStop(0, "#0a0a0a");
  pg.addColorStop(0.2, "#2a2a2a");
  pg.addColorStop(0.5, "#1a1a1a");
  pg.addColorStop(0.8, "#2a2a2a");
  pg.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.roundRect(-size * 0.025, -size * 0.2, size * 0.05, size * 0.28, size * 0.008);
  ctx.fill();

  // Body highlight
  ctx.strokeStyle = "rgba(100, 100, 100, 0.3)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, -size * 0.19);
  ctx.lineTo(-size * 0.015, size * 0.06);
  ctx.stroke();

  // Teal bands (instead of gold)
  const tbg = ctx.createLinearGradient(-size * 0.03, 0, size * 0.03, 0);
  tbg.addColorStop(0, "#2a8888");
  tbg.addColorStop(0.3, "#40b8b8");
  tbg.addColorStop(0.5, "#70e8e8");
  tbg.addColorStop(0.7, "#40b8b8");
  tbg.addColorStop(1, "#2a8888");
  ctx.fillStyle = tbg;
  ctx.fillRect(-size * 0.028, -size * 0.16, size * 0.056, size * 0.02);
  ctx.fillRect(-size * 0.028, -size * 0.09, size * 0.056, size * 0.012);
  ctx.fillRect(-size * 0.028, -size * 0.02, size * 0.056, size * 0.012);
  ctx.fillRect(-size * 0.028, size * 0.05, size * 0.056, size * 0.02);

  // Clip
  ctx.fillStyle = tbg;
  ctx.fillRect(size * 0.02, -size * 0.14, size * 0.012, size * 0.12);
  ctx.beginPath();
  ctx.arc(size * 0.026, -size * 0.14, size * 0.006, 0, Math.PI * 2);
  ctx.fill();

  // Nib section
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.2);
  ctx.lineTo(-size * 0.015, -size * 0.24);
  ctx.lineTo(size * 0.015, -size * 0.24);
  ctx.lineTo(size * 0.02, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Teal nib
  const ng = ctx.createLinearGradient(-size * 0.012, -size * 0.24, size * 0.012, -size * 0.24);
  ng.addColorStop(0, "#2a9090");
  ng.addColorStop(0.5, "#60e0e0");
  ng.addColorStop(1, "#2a9090");
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.24);
  ctx.lineTo(-size * 0.014, -size * 0.31);
  ctx.lineTo(0, -size * 0.35);
  ctx.lineTo(size * 0.014, -size * 0.31);
  ctx.closePath();
  ctx.fill();

  // Nib slit
  ctx.strokeStyle = "#1a5050";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(0, -size * 0.33);
  ctx.stroke();

  // Ink drops during attack
  if (isAttacking && attackPhase > 0.2) {
    const inkPhase = (attackPhase - 0.2) / 0.8;
    for (let d = 0; d < 3; d++) {
      const dy = -size * 0.37 - inkPhase * size * 0.15 - d * size * 0.04;
      const da = (1 - inkPhase) * (1 - d * 0.3);
      ctx.fillStyle = `rgba(20, 15, 10, ${da})`;
      ctx.beginPath();
      ctx.ellipse(Math.sin(time * 10 + d) * size * 0.008, dy, size * 0.01, size * 0.015, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── FLOATING WORDS ──────────────────────────────────────────────────────────

function drawFloatingWords(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
  isAttacking: boolean, attackIntensity: number
) {
  const count = isAttacking ? 8 : 5;
  const words = ["dream", "green", "light", "hope", "glory", "jazz", "Gatsby", "beauty"];
  for (let i = 0; i < count; i++) {
    const phase = (time * 0.6 + i * 0.4) % 3.5;
    const angle = -0.6 + (i / count) * 1.2;
    const wx = x - size * 0.3 + Math.sin(angle + phase * Math.PI * 0.4) * size * 0.65;
    const wy = y - size * 0.6 - phase * size * 0.3;
    const wa = (1 - phase / 3.5) * (isAttacking ? 0.95 : 0.6);
    const ws = 1 + (isAttacking ? attackIntensity * 0.3 : 0);

    ctx.fillStyle = `rgba(60, 200, 200, ${wa})`;
    ctx.shadowColor = "#50d0d0";
    ctx.shadowBlur = isAttacking ? 8 * zoom : 4 * zoom;
    ctx.font = `italic ${(10 + (isAttacking ? 4 : 0)) * zoom * ws}px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(words[i % words.length], wx, wy);
  }
  ctx.shadowBlur = 0;
}

// ─── LITERARY AURA ───────────────────────────────────────────────────────────

function drawLiteraryAura(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number, attackIntensity: number
) {
  const glow = 0.3 + Math.sin(time * 3.5) * 0.1 + attackIntensity * 0.3;
  ctx.strokeStyle = `rgba(60, 200, 200, ${glow})`;
  ctx.lineWidth = (2 + attackIntensity * 2) * zoom;
  ctx.setLineDash([5 * zoom, 4 * zoom]);
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.08, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = `rgba(80, 220, 220, ${glow * 0.4})`;
  ctx.lineWidth = (1.2 + attackIntensity * 1) * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.08, size * 0.5, size * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();
}
