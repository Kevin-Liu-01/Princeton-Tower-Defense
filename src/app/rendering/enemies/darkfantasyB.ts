// Princeton Tower Defense - Dark Fantasy Enemy Sprite Functions (Part B — Redesigned)
// Enemies 11-20: Fallen Paladin, Blackguard, Lich, Wraith, Bone Mage,
// Dark Priest, Revenant, Abomination, Hellhound, Doom Herald

import { drawRadialAura } from "./helpers";
import { setShadowBlur, clearShadow } from "../performance";
import { ISO_Y_RATIO } from "../../constants/isometric";
import {
  drawGlowingEyes,
  drawShadowWisps,
  drawPoisonBubbles,
  drawOrbitingDebris,
  drawAnimatedTendril,
  drawFloatingPiece,
  drawPulsingGlowRings,
  drawShiftingSegments,
  drawEnergyArc,
  getBreathScale,
  getIdleSway,
  drawEmberSparks,
  drawArcaneSparkles,
  drawFrostCrystals,
} from "./animationHelpers";
import { drawPathArm, drawPathLegs, drawTatteredCloak, drawShoulderOverlay, drawBeltOverlay, drawGorget, drawArmorSkirt } from "./darkFantasyHelpers";

const TAU = Math.PI * 2;

// ============================================================================
// 11. FALLEN PALADIN — Corrupted holy knight, cracked white/gold armor
// ============================================================================

export function drawFallenPaladinEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.9;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 4;
  const breath = getBreathScale(time, 1.3, 0.015);
  const sway = getIdleSway(time, 1.0, size * 0.003, size * 0.002);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const cx0 = x + sway.dx;
  const corruptPulse = 0.5 + Math.sin(time * 2) * 0.3;

  const holyWhite = "#e8e0d0";
  const holyGold = "#c8a030";
  const holyGoldDark = "#8a6a10";
  const corruptPurple = "#6a2080";
  const corruptDark = "#3a0a40";

  // === CORRUPTION ENERGY WISPS ===
  for (let i = 0; i < 6; i++) {
    const seed = i * 2.1;
    const phase = (time * 0.6 + seed) % 1;
    const px = cx0 + Math.sin(seed * 5) * size * 0.3;
    const py = y + size * 0.4 - phase * size * 0.7;
    ctx.globalAlpha = (1 - phase) * 0.25 * (phase < 0.1 ? phase / 0.1 : 1);
    ctx.fillStyle = corruptPurple;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.008 * (1 - phase * 0.4), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === HALF-HOLY HALF-CORRUPT CAPE ===
  const capeSwing = Math.sin(time * 2.3) * 0.07;
  ctx.save();
  ctx.translate(cx0, y - size * 0.28 - bodyBob);
  ctx.rotate(capeSwing);

  // Left half: holy white
  ctx.fillStyle = "rgba(220, 210, 190, 0.8)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, 0);
  for (let i = 0; i <= 4; i++) {
    const bx = -size * 0.16 + i * size * 0.04;
    const by = size * 0.55 + (i % 2) * size * 0.03 + Math.sin(time * 2.5 + i) * size * 0.012;
    ctx.lineTo(bx, by);
  }
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // Right half: corrupted purple
  ctx.fillStyle = "rgba(80, 20, 100, 0.8)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 4; i <= 8; i++) {
    const bx = -size * 0.16 + i * size * 0.04;
    const by = size * 0.55 + (i % 2) * size * 0.03 + Math.sin(time * 2.5 + i) * size * 0.012;
    ctx.lineTo(bx, by);
  }
  ctx.lineTo(size * 0.14, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // === ARMORED LEGS ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.28, width: 0.12, strideSpeed: 4, strideAmt: 0.25,
    color: holyWhite, colorDark: "#a8a090", footColor: "#a8a090", footLen: 0.12,
    style: 'armored', trimColor: holyGold,
  });

  // === ARMORED TORSO ===
  const torsoY = y - size * 0.1 - bodyBob;

  drawTatteredCloak(ctx, cx0, torsoY - size * 0.15 - bodyBob, size, size * 0.3, size * 0.35, "#4a3040", "#2a1520", time);

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  // Cracked white/gold armor
  const torsoGrad = ctx.createLinearGradient(cx0 - size * 0.15, torsoY - size * 0.2, cx0 + size * 0.15, torsoY + size * 0.1);
  torsoGrad.addColorStop(0, holyWhite);
  torsoGrad.addColorStop(0.5, "#c8c0b0");
  torsoGrad.addColorStop(1, "#a8a090");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.14, torsoY + size * 0.15);
  ctx.lineTo(cx0 - size * 0.16, torsoY - size * 0.06);
  ctx.quadraticCurveTo(cx0, torsoY - size * 0.22, cx0 + size * 0.16, torsoY - size * 0.06);
  ctx.lineTo(cx0 + size * 0.14, torsoY + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Gold trim
  ctx.strokeStyle = holyGold;
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.moveTo(cx0, torsoY - size * 0.2);
  ctx.lineTo(cx0, torsoY + size * 0.12);
  ctx.stroke();

  // Corruption cracks
  ctx.strokeStyle = `rgba(100, 30, 120, ${corruptPulse * 0.5})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.03, torsoY - size * 0.15);
  ctx.lineTo(cx0 + size * 0.08, torsoY - size * 0.05);
  ctx.lineTo(cx0 + size * 0.06, torsoY + size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.08, torsoY - size * 0.05);
  ctx.lineTo(cx0 + size * 0.12, torsoY - size * 0.02);
  ctx.stroke();

  // Rivets
  ctx.fillStyle = holyGold;
  for (const [rx, ry] of [[-0.12, -0.14], [0.12, -0.14], [-0.13, -0.02], [0.13, -0.02]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(cx0 + rx * size, torsoY + ry * size, size * 0.008, 0, TAU);
    ctx.fill();
  }

  ctx.restore();

  // Pauldrons (one gold, one corrupted)
  for (const side of [-1, 1]) {
    const padX = cx0 + side * size * 0.18;
    const padY = torsoY - size * 0.15 - bodyBob;
    const padColor = side === -1 ? holyGold : corruptPurple;
    const padGrad = ctx.createRadialGradient(padX, padY, 0, padX, padY, size * 0.06);
    padGrad.addColorStop(0, padColor);
    padGrad.addColorStop(1, side === -1 ? holyGoldDark : corruptDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.ellipse(padX, padY, size * 0.06, size * 0.042, side * 0.2, 0, TAU);
    ctx.fill();
  }

  drawShoulderOverlay(ctx, cx0 - size * 0.16, torsoY - size * 0.13 - bodyBob, size, -1, holyGold, holyGoldDark, 'plate');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, torsoY - size * 0.13 - bodyBob, size, 1, corruptPurple, corruptDark, 'plate');
  drawGorget(ctx, cx0, torsoY - size * 0.18 - bodyBob, size, size * 0.2, holyWhite, "#a8a090");
  drawArmorSkirt(ctx, cx0, torsoY + size * 0.08, size, size * 0.14, size * 0.08, "#c8c0b0", "#a8a090", 5);

  // === HOLY SWORD (half-corrupted) ===
  const swordSwing = -0.2 + Math.sin(walkPhase) * 0.08 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.8 : 0);
  drawPathArm(ctx, cx0 - size * 0.17, torsoY - size * 0.08 - bodyBob, size, time, zoom, -1, {
    color: "#c8c0b0", colorDark: "#a8a090", handColor: "#a8a090",
    upperLen: 0.24, foreLen: 0.2,
    shoulderAngle: swordSwing,
    elbowBend: 0.5,
    elbowAngle: 0.3,
    style: 'armored',
    onWeapon: (ctx) => {
      const sLen = size * 0.38;
      const sW = size * 0.036;

      ctx.fillStyle = "#c8b060";
      ctx.beginPath();
      ctx.moveTo(-sW, size * 0.1);
      ctx.lineTo(-sW * 0.3, size * 0.1 + sLen);
      ctx.lineTo(0, size * 0.1 + sLen);
      ctx.lineTo(0, size * 0.1);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#5a2070";
      ctx.beginPath();
      ctx.moveTo(0, size * 0.1);
      ctx.lineTo(0, size * 0.1 + sLen);
      ctx.lineTo(sW * 0.3, size * 0.1 + sLen);
      ctx.lineTo(sW, size * 0.1);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(160, 60, 200, ${corruptPulse * 0.4})`;
      ctx.lineWidth = size * 0.006;
      ctx.beginPath();
      ctx.moveTo(sW, size * 0.1);
      ctx.lineTo(sW * 0.3, size * 0.1 + sLen);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
      ctx.lineWidth = size * 0.006;
      ctx.beginPath();
      ctx.moveTo(-sW, size * 0.1);
      ctx.lineTo(-sW * 0.3, size * 0.1 + sLen);
      ctx.stroke();

      ctx.fillStyle = holyGold;
      ctx.fillRect(-size * 0.07, size * 0.08, size * 0.14, size * 0.024);

      ctx.fillStyle = "#5a4a30";
      ctx.fillRect(-size * 0.015, size * 0.0, size * 0.03, size * 0.08);
    },
  });

  // Energy arcs between corruption points when attacking
  if (isAttacking) {
    drawEnergyArc(ctx, cx0 + size * 0.08, torsoY - size * 0.05, cx0 + size * 0.12, torsoY + size * 0.1, time, zoom, {
      color: "rgba(160, 60, 200, 0.6)", segments: 4, amplitude: 5, width: 1.2,
    });
  }

  // === RIGHT ARM ===
  drawPathArm(ctx, cx0 + size * 0.17, torsoY - size * 0.08 - bodyBob, size, time, zoom, 1, {
    color: "#c8c0b0", colorDark: "#a8a090", handColor: "#a8a090",
    swingSpeed: 4, swingAmt: 0.15, baseAngle: 0.25,
    elbowBend: 0.65, upperLen: 0.27, foreLen: 0.22,
    style: 'armored',
  });

  // === GOLDEN HELM WITH CORRUPTION ===
  const helmX = cx0;
  const helmY = y - size * 0.3 - bodyBob;

  const helmGrad = ctx.createRadialGradient(helmX, helmY, 0, helmX, helmY, size * 0.11);
  helmGrad.addColorStop(0, holyWhite);
  helmGrad.addColorStop(0.6, "#c8c0b0");
  helmGrad.addColorStop(1, "#a8a090");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(helmX, helmY, size * 0.1, size * 0.11, 0, 0, TAU);
  ctx.fill();

  // Corruption cracks on helm
  ctx.strokeStyle = `rgba(100, 30, 120, ${corruptPulse * 0.4})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(helmX + size * 0.04, helmY - size * 0.06);
  ctx.lineTo(helmX + size * 0.06, helmY);
  ctx.lineTo(helmX + size * 0.04, helmY + size * 0.04);
  ctx.stroke();

  // T-visor
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(helmX - size * 0.065, helmY - size * 0.005, size * 0.13, size * 0.016);
  ctx.fillRect(helmX - size * 0.012, helmY - size * 0.005, size * 0.024, size * 0.055);

  // Dual eyes: gold left, purple right
  for (const [side, color, glow] of [[-1, "#ffd700", "rgba(255, 215, 0, 0.6)"], [1, "#a040d0", "rgba(160, 60, 200, 0.6)"]] as [number, string, string][]) {
    const ex = helmX + side * size * 0.035;
    const glowGrad = ctx.createRadialGradient(ex, helmY, 0, ex, helmY, size * 0.04);
    glowGrad.addColorStop(0, glow);
    glowGrad.addColorStop(1, glow.replace(/[\d.]+\)$/, "0)"));
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(ex, helmY, size * 0.04, 0, TAU);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(ex, helmY, size * 0.01, 0, TAU);
    ctx.fill();
  }

  // === BROKEN GOLDEN HALO ===
  const haloY = helmY - size * 0.14;
  ctx.strokeStyle = holyGold;
  ctx.lineWidth = size * 0.008;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(helmX, haloY, size * 0.08, size * 0.025, 0, 0.3, Math.PI * 1.4);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Floating halo fragments
  for (let f = 0; f < 3; f++) {
    const fAngle = Math.PI * 1.5 + f * 0.4 + time * 0.5;
    const fR = size * 0.08 + Math.sin(time * 2 + f) * size * 0.015;
    const fx = helmX + Math.cos(fAngle) * fR;
    const fy = haloY + Math.sin(fAngle) * size * 0.025 + Math.sin(time * 3 + f * 2) * size * 0.01;
    ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(time * 4 + f) * 0.2})`;
    ctx.beginPath();
    ctx.arc(fx, fy, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // === PULSING CORRUPTION RINGS ===
  drawPulsingGlowRings(ctx, cx0, y - size * 0.1, size * 0.4, time, zoom, {
    count: 2, speed: 1.0, color: "rgba(120, 40, 160, 0.4)", maxAlpha: 0.2, expansion: 1.3,
  });
}

// ============================================================================
// 12. BLACK GUARD — Midnight blue heavy tank with tower shield
// ============================================================================

export function drawBlackGuardEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.85;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 3.5;
  const breath = getBreathScale(time, 1.0, 0.012);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.01;
  const cx0 = x;

  const steelDark = "#1a1a2a";
  const steelMid = "#2a2a40";
  const steelLight = "#3a3a55";
  const steelHighlight = "#4a4a6a";

  // Ground tremor on heavy steps
  const stompPhase = Math.max(0, -Math.sin(walkPhase - 0.2));
  if (stompPhase > 0.85) {
    const intensity = (stompPhase - 0.85) * 5;
    ctx.strokeStyle = `rgba(60, 60, 80, ${intensity * 0.3})`;
    ctx.lineWidth = 1 * zoom;
    for (let c = 0; c < 4; c++) {
      const angle = c * (TAU / 4) + 0.5;
      const len = size * 0.06 * intensity;
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.52);
      ctx.lineTo(x + Math.cos(angle) * len, y + size * 0.52 + Math.sin(angle) * len * 0.35);
      ctx.stroke();
    }
  }

  // === HEAVY ARMORED LEGS ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.28, width: 0.12, strideSpeed: 3.5, strideAmt: 0.2,
    color: steelMid, colorDark: steelDark, footColor: steelDark, footLen: 0.12,
    shuffle: true,
    style: 'armored',
  });

  // === ARMORED TORSO ===
  const torsoY = y - size * 0.1 - bodyBob;

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  const torsoGrad = ctx.createLinearGradient(cx0 - size * 0.17, torsoY - size * 0.2, cx0 + size * 0.17, torsoY + size * 0.12);
  torsoGrad.addColorStop(0, steelLight);
  torsoGrad.addColorStop(0.4, steelMid);
  torsoGrad.addColorStop(0.7, steelDark);
  torsoGrad.addColorStop(1, steelMid);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.16, torsoY + size * 0.16);
  ctx.lineTo(cx0 - size * 0.18, torsoY - size * 0.06);
  ctx.quadraticCurveTo(cx0, torsoY - size * 0.24, cx0 + size * 0.18, torsoY - size * 0.06);
  ctx.lineTo(cx0 + size * 0.16, torsoY + size * 0.16);
  ctx.closePath();
  ctx.fill();

  // Center seam
  ctx.strokeStyle = steelHighlight;
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.moveTo(cx0, torsoY - size * 0.22);
  ctx.lineTo(cx0, torsoY + size * 0.14);
  ctx.stroke();

  // Plate lines
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 0.7 * zoom;
  for (let p = 0; p < 4; p++) {
    const py = torsoY - size * 0.14 + p * size * 0.07;
    ctx.beginPath();
    ctx.moveTo(cx0 - size * 0.15, py);
    ctx.lineTo(cx0 + size * 0.15, py);
    ctx.stroke();
  }

  // Rivets
  ctx.fillStyle = steelHighlight;
  for (const [rx, ry] of [[-0.14, -0.16], [0.14, -0.16], [-0.15, -0.04], [0.15, -0.04], [-0.14, 0.06], [0.14, 0.06]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(cx0 + rx * size, torsoY + ry * size, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Battle dents
  ctx.fillStyle = steelDark;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(cx0 + size * 0.06, torsoY - size * 0.08, size * 0.02, size * 0.015, 0.5, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx0 - size * 0.08, torsoY + size * 0.03, size * 0.018, size * 0.012, -0.3, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();

  // Rounded pauldrons
  for (const side of [-1, 1]) {
    const padGrad = ctx.createRadialGradient(cx0 + side * size * 0.2, torsoY - size * 0.16, 0, cx0 + side * size * 0.2, torsoY - size * 0.16, size * 0.07);
    padGrad.addColorStop(0, steelHighlight);
    padGrad.addColorStop(0.6, steelMid);
    padGrad.addColorStop(1, steelDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.ellipse(cx0 + side * size * 0.2, torsoY - size * 0.16 - bodyBob, size * 0.07, size * 0.05, side * 0.2, 0, TAU);
    ctx.fill();
  }

  drawShoulderOverlay(ctx, cx0 - size * 0.16, torsoY - size * 0.13 - bodyBob, size, -1, steelMid, steelDark, 'plate');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, torsoY - size * 0.13 - bodyBob, size, 1, steelMid, steelDark, 'plate');
  drawGorget(ctx, cx0, torsoY - size * 0.18 - bodyBob, size, size * 0.2, steelMid, steelDark);
  drawArmorSkirt(ctx, cx0, torsoY + size * 0.08, size, size * 0.14, size * 0.08, steelDark, steelDark, 4);
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.06, size, size * 0.12, steelMid, steelDark, steelHighlight);

  // === TOWER SHIELD (left) ===
  ctx.save();
  ctx.translate(cx0 - size * 0.22, torsoY - size * 0.02 - bodyBob);
  ctx.rotate(-0.08 + Math.sin(walkPhase) * 0.03);

  const shW = size * 0.18;
  const shH = size * 0.36;
  const shieldGrad = ctx.createLinearGradient(-shW, -shH / 2, shW, shH / 2);
  shieldGrad.addColorStop(0, steelDark);
  shieldGrad.addColorStop(0.3, steelMid);
  shieldGrad.addColorStop(0.7, steelLight);
  shieldGrad.addColorStop(1, steelDark);
  ctx.fillStyle = shieldGrad;
  ctx.fillRect(-shW / 2, -shH / 2, shW, shH);

  // Shield rim
  ctx.strokeStyle = steelHighlight;
  ctx.lineWidth = size * 0.011;
  ctx.strokeRect(-shW / 2, -shH / 2, shW, shH);

  // Shield boss
  ctx.fillStyle = steelHighlight;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.fillStyle = steelDark;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.02, 0, TAU);
  ctx.fill();

  // Dark cross emblem
  ctx.strokeStyle = "rgba(40, 40, 80, 0.6)";
  ctx.lineWidth = size * 0.016;
  ctx.beginPath();
  ctx.moveTo(0, -shH * 0.35);
  ctx.lineTo(0, shH * 0.35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-shW * 0.35, 0);
  ctx.lineTo(shW * 0.35, 0);
  ctx.stroke();

  // Impact dents
  ctx.fillStyle = steelDark;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.ellipse(shW * 0.2, -shH * 0.2, size * 0.015, size * 0.012, 0.5, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();

  // === MACE ARM (right) ===
  const maceSwing = Math.sin(walkPhase) * 0.12 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.7 : 0);
  drawPathArm(ctx, cx0 + size * 0.2, torsoY - size * 0.08 - bodyBob, size, time, zoom, 1, {
    color: steelMid, colorDark: steelDark, handColor: steelDark,
    upperLen: 0.24, foreLen: 0.2,
    shoulderAngle: 0.25 + maceSwing,
    elbowBend: 0.5,
    elbowAngle: 0.3,
    style: 'armored',
    onWeapon: (ctx) => {
      ctx.fillStyle = "#3a3530";
      ctx.fillRect(-size * 0.015, size * 0.06, size * 0.03, size * 0.15);

      const maceY = size * 0.06;
      ctx.fillStyle = steelHighlight;
      ctx.beginPath();
      ctx.arc(0, maceY, size * 0.035, 0, TAU);
      ctx.fill();

      for (let f = 0; f < 6; f++) {
        const fAngle = f * (TAU / 6);
        ctx.fillStyle = steelMid;
        ctx.beginPath();
        ctx.moveTo(Math.cos(fAngle) * size * 0.028, maceY + Math.sin(fAngle) * size * 0.028);
        ctx.lineTo(Math.cos(fAngle) * size * 0.055, maceY + Math.sin(fAngle) * size * 0.055);
        ctx.lineTo(Math.cos(fAngle + 0.3) * size * 0.028, maceY + Math.sin(fAngle + 0.3) * size * 0.028);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = "rgba(120, 20, 20, 0.4)";
      ctx.beginPath();
      ctx.arc(size * 0.025, maceY - size * 0.012, size * 0.011, 0, TAU);
      ctx.fill();
    },
  });

  // === GREAT HELM ===
  const helmX = cx0;
  const helmY = y - size * 0.32 - bodyBob;

  const helmGrad = ctx.createRadialGradient(helmX, helmY, 0, helmX, helmY, size * 0.12);
  helmGrad.addColorStop(0, steelHighlight);
  helmGrad.addColorStop(0.5, steelMid);
  helmGrad.addColorStop(1, steelDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(helmX, helmY, size * 0.1, size * 0.115, 0, 0, TAU);
  ctx.fill();

  // Flat top
  ctx.fillStyle = steelMid;
  ctx.fillRect(helmX - size * 0.08, helmY - size * 0.11, size * 0.16, size * 0.03);

  // Narrow visor slit
  ctx.fillStyle = "#050508";
  ctx.fillRect(helmX - size * 0.06, helmY, size * 0.12, size * 0.012);

  // Breathing holes
  for (let h = 0; h < 4; h++) {
    ctx.fillStyle = "#050508";
    ctx.beginPath();
    ctx.arc(helmX + size * 0.06, helmY + size * 0.03 + h * size * 0.012, size * 0.004, 0, TAU);
    ctx.fill();
  }

  // Dim blue eye glow
  drawGlowingEyes(ctx, helmX, helmY, size, time, {
    spacing: 0.03,
    eyeRadius: 0.008,
    pupilRadius: 0.004,
    irisColor: "#4060aa",
    pupilColor: "#8090cc",
    glowColor: "rgba(60, 80, 160, 0.5)",
    glowRadius: 0.04,
    pulseSpeed: 2,
    lookSpeed: 0.8,
    lookAmount: 0.003,
  });

  // Steam breath
  for (let w = 0; w < 2; w++) {
    const wPhase = (time * 0.4 + w * 0.5) % 1;
    ctx.globalAlpha = (1 - wPhase) * 0.1;
    ctx.fillStyle = "rgba(150, 160, 180, 0.4)";
    ctx.beginPath();
    ctx.arc(helmX + size * 0.08 + wPhase * size * 0.05, helmY + size * 0.04 - wPhase * size * 0.06, size * 0.012 * (1 + wPhase), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ============================================================================
// 13. LICH — Boss: Undead archmage with staff, spell circle, frost aura
// ============================================================================

export function drawLichEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.85;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 3;
  const breath = getBreathScale(time, 1.5, 0.02);
  const sway = getIdleSway(time, 0.8, size * 0.005, size * 0.004);
  const cx0 = x + sway.dx;
  const bodyBob = Math.sin(time * 2) * size * 0.01;

  const boneMid = bodyColor;
  const boneDark = bodyColorDark;
  const arcaneBlue = "#4080cc";
  const arcaneBright = "#80c0ff";

  // === ARCANE AURA ===
  drawRadialAura(ctx, cx0, y - size * 0.1, size * 0.8, [
    { offset: 0, color: "rgba(60, 120, 200, 0.12)" },
    { offset: 0.4, color: "rgba(40, 100, 180, 0.06)" },
    { offset: 0.7, color: "rgba(20, 80, 160, 0.02)" },
    { offset: 1, color: "rgba(10, 60, 140, 0)" },
  ]);

  // === FROST CRYSTALS ===
  drawFrostCrystals(ctx, cx0, y - size * 0.1, size * 0.65, time, zoom, {
    count: 6, speed: 1.5, color: "rgba(120, 200, 255, 0.6)", glowColor: "rgba(200, 240, 255, 0.4)", maxAlpha: 0.4,
  });

  // === ROTATING SPELL CIRCLE ===
  const spellRadius = size * 0.4;
  ctx.save();
  ctx.translate(cx0, y + size * 0.45);
  ctx.rotate(time * 0.5);
  ctx.strokeStyle = `rgba(80, 150, 220, ${0.2 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, spellRadius, spellRadius * 0.35, 0, 0, TAU);
  ctx.stroke();

  // Runes on circle
  for (let r = 0; r < 8; r++) {
    const angle = r * (TAU / 8);
    const rx = Math.cos(angle) * spellRadius * 0.9;
    const ry = Math.sin(angle) * spellRadius * 0.35 * 0.9;
    ctx.fillStyle = `rgba(100, 180, 240, ${0.3 + Math.sin(time * 3 + r) * 0.15})`;
    ctx.font = `${size * 0.04}px serif`;
    ctx.fillText("⬡", rx - size * 0.02, ry + size * 0.015);
  }

  // Connecting lines
  ctx.strokeStyle = "rgba(60, 130, 200, 0.15)";
  ctx.lineWidth = 0.5 * zoom;
  for (let r = 0; r < 8; r++) {
    const a1 = r * (TAU / 8);
    const a2 = ((r + 3) % 8) * (TAU / 8);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a1) * spellRadius * 0.85, Math.sin(a1) * spellRadius * 0.35 * 0.85);
    ctx.lineTo(Math.cos(a2) * spellRadius * 0.85, Math.sin(a2) * spellRadius * 0.35 * 0.85);
    ctx.stroke();
  }
  ctx.restore();

  // Frost ground effect
  ctx.fillStyle = "rgba(160, 220, 255, 0.08)";
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.5, size * 0.4, size * 0.4 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // === GRAND ROBES ===
  const torsoY = y - size * 0.05 - bodyBob;

  drawTatteredCloak(ctx, cx0, torsoY - size * 0.15 - bodyBob, size, size * 0.3, size * 0.35, "#1a1a3a", "#0a0a1a", time);

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  // Robe body
  const robeGrad = ctx.createLinearGradient(cx0 - size * 0.18, torsoY - size * 0.2, cx0 + size * 0.18, torsoY + size * 0.2);
  robeGrad.addColorStop(0, "#1a1a3a");
  robeGrad.addColorStop(0.3, "#2a2a5a");
  robeGrad.addColorStop(0.7, "#1a1a4a");
  robeGrad.addColorStop(1, "#0a0a2a");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY - size * 0.22);
  ctx.quadraticCurveTo(cx0 - size * 0.2, torsoY + size * 0.05, cx0 - size * 0.2, torsoY + size * 0.3);
  for (let i = 0; i <= 8; i++) {
    const bx = cx0 - size * 0.2 + i * size * 0.05;
    const by = torsoY + size * 0.3 + (i % 2) * size * 0.025 + Math.sin(time * 3 + i * 0.8) * size * 0.01;
    ctx.lineTo(bx, by);
  }
  ctx.quadraticCurveTo(cx0 + size * 0.2, torsoY + size * 0.05, cx0 + size * 0.1, torsoY - size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Gold trim
  ctx.strokeStyle = "#8a7030";
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.moveTo(cx0, torsoY - size * 0.2);
  ctx.lineTo(cx0, torsoY + size * 0.25);
  ctx.stroke();

  // Arcane symbols on robe
  ctx.fillStyle = `rgba(80, 150, 220, ${0.15 + Math.sin(time * 2) * 0.08})`;
  ctx.font = `${size * 0.05}px serif`;
  ctx.fillText("✧", cx0 - size * 0.06, torsoY + size * 0.05);
  ctx.fillText("✧", cx0 + size * 0.04, torsoY + size * 0.12);

  // Bone clasps at shoulders
  for (const side of [-1, 1]) {
    ctx.fillStyle = boneMid;
    ctx.beginPath();
    ctx.ellipse(cx0 + side * size * 0.1, torsoY - size * 0.2, size * 0.02, size * 0.015, side * 0.3, 0, TAU);
    ctx.fill();
  }

  ctx.restore();

  drawShoulderOverlay(ctx, cx0 - size * 0.16, torsoY - size * 0.13 - bodyBob, size, -1, boneMid, boneDark, 'tattered');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, torsoY - size * 0.13 - bodyBob, size, 1, boneMid, boneDark, 'tattered');

  // === CASTING ARM (left) ===
  drawPathArm(ctx, cx0 - size * 0.14, torsoY - size * 0.08, size, time, zoom, -1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    swingSpeed: 3, swingAmt: 0.2, baseAngle: 0.5,
    attackExtra: isAttacking ? 0.6 : 0, elbowBend: 0.5,
    upperLen: 0.26, foreLen: 0.22,
    style: 'bone',
  });

  // Arcane crackling from hand when attacking
  if (isAttacking) {
    const handX = cx0 - size * 0.25;
    const handY = torsoY + size * 0.1;
    drawEnergyArc(ctx, handX, handY, handX + size * 0.15, handY - size * 0.1, time, zoom, {
      color: "rgba(100, 180, 255, 0.6)", segments: 5, amplitude: 6, width: 1.5,
    });
  }

  // === STAFF ARM (right) ===
  const staffArmX = cx0 + size * 0.14;
  const staffArmY = torsoY - size * 0.08;
  drawPathArm(ctx, staffArmX, staffArmY, size, time, zoom, 1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.2, foreLen: 0.17,
    shoulderAngle: 0.15,
    elbowBend: 0.55,
    elbowAngle: 0.2,
    style: 'bone',
    onWeapon: (ctx) => {
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(-size * 0.012, size * 0.03, size * 0.024, size * 0.35);

      const orbY = size * 0.025;
      const orbGrad = ctx.createRadialGradient(0, orbY, 0, 0, orbY, size * 0.055);
      orbGrad.addColorStop(0, arcaneBright);
      orbGrad.addColorStop(0.4, arcaneBlue);
      orbGrad.addColorStop(1, "#203060");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(0, orbY, size * 0.055, 0, TAU);
      ctx.fill();

      const orbPulse = 0.5 + Math.sin(time * 3) * 0.3;
      ctx.fillStyle = `rgba(100, 180, 255, ${orbPulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(0, orbY, size * 0.08, 0, TAU);
      ctx.fill();
    },
  });

  // Orbiting energy around staff
  drawShiftingSegments(ctx, staffArmX + size * 0.03, staffArmY + size * 0.15, size * 0.5, time, zoom, {
    count: 4, orbitRadius: 0.12, segmentSize: 0.02, orbitSpeed: 2.5, bobSpeed: 3, bobAmt: 0.02,
    color: arcaneBlue, colorAlt: arcaneBright, shape: "diamond",
  });

  // === FLOATING SPELLBOOK ===
  const bookX = cx0 - size * 0.28;
  const bookY = y - size * 0.25 + Math.sin(time * 2.5) * size * 0.02;
  const bookRot = Math.sin(time * 1.5) * 0.1;

  ctx.save();
  ctx.translate(bookX, bookY);
  ctx.rotate(bookRot);

  // Book shadow
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(size * 0.01, size * 0.055, size * 0.04, size * 0.012, 0, 0, TAU);
  ctx.fill();

  // Book covers
  ctx.fillStyle = "#2a1a10";
  ctx.fillRect(-size * 0.035, -size * 0.04, size * 0.07, size * 0.08);
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(-size * 0.032, -size * 0.037, size * 0.064, size * 0.074);

  // Pages
  ctx.fillStyle = "#d8d0c0";
  ctx.fillRect(-size * 0.028, -size * 0.033, size * 0.056, size * 0.066);

  // Arcane symbol on page
  ctx.fillStyle = `rgba(60, 120, 200, ${0.4 + Math.sin(time * 4) * 0.2})`;
  ctx.font = `${size * 0.03}px serif`;
  ctx.fillText("☆", -size * 0.012, size * 0.005);

  // Glowing text lines
  ctx.strokeStyle = "rgba(80, 150, 220, 0.2)";
  ctx.lineWidth = 0.4 * zoom;
  for (let l = 0; l < 3; l++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, -size * 0.02 + l * size * 0.018);
    ctx.lineTo(size * 0.02, -size * 0.02 + l * size * 0.018);
    ctx.stroke();
  }

  ctx.restore();

  // === SKULL HEAD IN WIZARD HOOD ===
  const headX = cx0;
  const headY = y - size * 0.26 - bodyBob;

  // Hood
  ctx.fillStyle = "#1a1a3a";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, headY + size * 0.06);
  ctx.quadraticCurveTo(headX - size * 0.12, headY - size * 0.08, headX, headY - size * 0.15);
  ctx.quadraticCurveTo(headX + size * 0.12, headY - size * 0.08, headX + size * 0.1, headY + size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Skull
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.07, size * 0.075, 0, 0, TAU);
  ctx.fill();

  // Eye sockets
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#0a0a20";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.03, headY + size * 0.005, size * 0.02, size * 0.018, 0, 0, TAU);
    ctx.fill();
  }

  // Icy blue flame eyes
  drawGlowingEyes(ctx, headX, headY + size * 0.005, size, time, {
    spacing: 0.03,
    eyeRadius: 0.013,
    pupilRadius: 0.006,
    irisColor: arcaneBlue,
    pupilColor: arcaneBright,
    glowColor: "rgba(80, 160, 240, 0.7)",
    glowRadius: 0.05,
    pulseSpeed: 3,
    lookSpeed: 1,
    lookAmount: 0.005,
  });

  // Jaw
  ctx.fillStyle = boneDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.045, headY + size * 0.035);
  ctx.quadraticCurveTo(headX, headY + size * 0.08, headX + size * 0.045, headY + size * 0.035);
  ctx.closePath();
  ctx.fill();

  // === PHYLACTERY TETHER ===
  const phylX = cx0 + size * 0.2;
  const phylY = y - size * 0.15 + Math.sin(time * 2) * size * 0.02;
  ctx.strokeStyle = "rgba(80, 160, 220, 0.25)";
  ctx.lineWidth = size * 0.004;
  ctx.beginPath();
  ctx.moveTo(headX, headY);
  ctx.quadraticCurveTo(cx0 + size * 0.15, y - size * 0.3, phylX, phylY);
  ctx.stroke();

  // Phylactery
  ctx.fillStyle = "#2a4060";
  ctx.beginPath();
  ctx.moveTo(phylX, phylY - size * 0.02);
  ctx.lineTo(phylX + size * 0.012, phylY);
  ctx.lineTo(phylX, phylY + size * 0.02);
  ctx.lineTo(phylX - size * 0.012, phylY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(100, 200, 255, ${0.4 + Math.sin(time * 4) * 0.2})`;
  ctx.beginPath();
  ctx.arc(phylX, phylY, size * 0.006, 0, TAU);
  ctx.fill();

  // === OVERLAY EFFECTS ===
  drawPulsingGlowRings(ctx, cx0, y - size * 0.1, size * 0.45, time, zoom, {
    count: 3, speed: 1.0, color: "rgba(80, 160, 240, 0.4)", maxAlpha: 0.2, expansion: 1.5,
  });

  drawArcaneSparkles(ctx, cx0, y - size * 0.2, size * 0.55, time, zoom, {
    count: 7, speed: 1.5, color: "rgba(120, 200, 255, 0.7)", maxAlpha: 0.45,
  });

  drawShadowWisps(ctx, cx0, y - size * 0.15, size * 0.5, time, zoom, {
    count: 4, speed: 0.8, color: "rgba(40, 80, 140, 0.5)", maxAlpha: 0.2, wispLength: 0.35,
  });

  if (isAttacking) {
    const castProgress = 1 - attackPhase;
    for (let arc = 0; arc < 5; arc++) {
      const arcAngle = arc * (TAU / 5) + time * 8 + castProgress * Math.PI;
      const arcR = size * (0.15 + castProgress * 0.3);
      ctx.strokeStyle = `rgba(80, 160, 240, ${attackPhase * 0.6})`;
      ctx.lineWidth = (1.5 + attackPhase * 2) * zoom;
      ctx.beginPath();
      ctx.moveTo(cx0, y - size * 0.1 + bodyBob);
      ctx.lineTo(
        cx0 + Math.cos(arcAngle) * arcR,
        y - size * 0.1 + bodyBob + Math.sin(arcAngle) * arcR,
      );
      ctx.stroke();
    }
    const iceR = size * 0.3 * castProgress;
    ctx.strokeStyle = `rgba(120, 200, 255, ${attackPhase * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(cx0, y + size * 0.48, iceR, iceR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    if (attackPhase > 0.7) {
      const flashAlpha = (attackPhase - 0.7) * 3.3;
      ctx.fillStyle = `rgba(120, 200, 255, ${flashAlpha * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(cx0, y - size * 0.1, size * 0.25 * flashAlpha, size * 0.25 * flashAlpha * ISO_Y_RATIO, 0, 0, TAU);
      ctx.fill();
    }
  }
}

// ============================================================================
// 14. WRAITH — Ethereal spirit with chains and void form
// ============================================================================

export function drawWraithEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.8;
  const isAttacking = attackPhase > 0;
  const breath = getBreathScale(time, 2, 0.025);
  const sway = getIdleSway(time, 1.5, size * 0.008, size * 0.005);
  const cx0 = x + sway.dx;
  const floatBob = Math.sin(time * 2.5) * size * 0.015;
  const flicker = 0.7 + Math.sin(time * 8) * 0.15 + Math.sin(time * 13) * 0.08;

  // === VOID POOL BENEATH ===
  const poolGrad = ctx.createRadialGradient(cx0, y + size * 0.45, 0, cx0, y + size * 0.45, size * 0.35);
  poolGrad.addColorStop(0, "rgba(40, 10, 60, 0.3)");
  poolGrad.addColorStop(0.5, "rgba(30, 8, 50, 0.15)");
  poolGrad.addColorStop(1, "rgba(20, 5, 40, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.45, size * 0.35, size * 0.35 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Pool ripples
  for (let r = 0; r < 2; r++) {
    const ripplePhase = (time * 0.5 + r * 0.5) % 1;
    const rippleR = size * 0.1 + ripplePhase * size * 0.25;
    ctx.strokeStyle = `rgba(80, 30, 120, ${(1 - ripplePhase) * 0.15})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(cx0, y + size * 0.45, rippleR, rippleR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }

  // === GHOSTLY CHAINS ===
  for (const side of [-1, 1]) {
    const chainX = cx0 + side * size * 0.12;
    const chainSwing = Math.sin(time * 1.5 + side * 2) * 0.15;
    ctx.save();
    ctx.translate(chainX, y - size * 0.1 + floatBob);
    ctx.rotate(chainSwing);
    ctx.strokeStyle = "rgba(120, 120, 140, 0.4)";
    ctx.lineWidth = size * 0.006;
    for (let link = 0; link < 5; link++) {
      const ly = link * size * 0.035;
      ctx.beginPath();
      ctx.ellipse(0, ly, size * 0.01, size * 0.017, (link % 2) * Math.PI / 2, 0, TAU);
      ctx.stroke();
      // Link highlight
      ctx.fillStyle = `rgba(180, 180, 200, ${0.15 + Math.sin(time * 3 + link) * 0.08})`;
      ctx.beginPath();
      ctx.arc(size * 0.005, ly, size * 0.003, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // === ANIMATED TENDRILS (instead of legs) ===
  for (let t = 0; t < 5; t++) {
    const angle = Math.PI / 2 + (t - 2) * 0.25;
    drawAnimatedTendril(ctx, cx0 + (t - 2) * size * 0.06, y + size * 0.15 + floatBob, angle, size, time, zoom, {
      length: 0.25, width: 0.015, segments: 6, waveSpeed: 3, waveAmt: 0.04,
      color: `rgba(80, 40, 120, ${0.2 + t * 0.05})`, tipColor: "rgba(120, 60, 180, 0.2)",
    });
  }

  // === ETHEREAL BODY ===
  ctx.globalAlpha = flicker * 0.8;

  ctx.save();
  ctx.translate(cx0, y - size * 0.1 + floatBob);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -(y - size * 0.1 + floatBob));

  const bodyGrad = ctx.createRadialGradient(cx0, y - size * 0.1 + floatBob, size * 0.03, cx0, y - size * 0.1 + floatBob, size * 0.18);
  bodyGrad.addColorStop(0, "rgba(120, 80, 180, 0.5)");
  bodyGrad.addColorStop(0.5, "rgba(80, 40, 140, 0.35)");
  bodyGrad.addColorStop(1, "rgba(40, 15, 80, 0.1)");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(cx0, y - size * 0.1 + floatBob, size * 0.14, size * 0.2, 0, 0, TAU);
  ctx.fill();

  // Void core
  const coreGrad = ctx.createRadialGradient(cx0, y - size * 0.12 + floatBob, 0, cx0, y - size * 0.12 + floatBob, size * 0.06);
  coreGrad.addColorStop(0, "rgba(20, 5, 40, 0.6)");
  coreGrad.addColorStop(1, "rgba(60, 20, 100, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx0, y - size * 0.12 + floatBob, size * 0.06, 0, TAU);
  ctx.fill();

  ctx.restore();

  drawShoulderOverlay(ctx, cx0 - size * 0.16, y - size * 0.23 + floatBob, size, -1, "rgba(100, 60, 160, 0.4)", "rgba(60, 30, 100, 0.3)", 'tattered');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, y - size * 0.23 + floatBob, size, 1, "rgba(100, 60, 160, 0.4)", "rgba(60, 30, 100, 0.3)", 'tattered');

  // === SPECTRAL CLAWS ===
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawPathArm(ctx, cx0 + side * size * 0.12, y - size * 0.15 + floatBob, size, time, zoom, side, {
      color: "rgba(100, 60, 160, 0.4)", colorDark: "rgba(60, 30, 100, 0.3)",
      handColor: "rgba(140, 80, 200, 0.5)", handRadius: 0.052,
      swingSpeed: 2, swingAmt: 0.3, baseAngle: 0.4,
      attackExtra: isAttacking ? 0.6 : 0, elbowBend: 0.5,
      upperLen: 0.27, foreLen: 0.24,
      style: 'ghostly',
    });
  }

  // === HOODED HEAD ===
  const headX = cx0;
  const headY = y - size * 0.24 + floatBob;

  // Hood
  ctx.fillStyle = "rgba(40, 15, 60, 0.7)";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, headY + size * 0.05);
  ctx.quadraticCurveTo(headX - size * 0.12, headY - size * 0.08, headX, headY - size * 0.14);
  ctx.quadraticCurveTo(headX + size * 0.12, headY - size * 0.08, headX + size * 0.1, headY + size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Void face
  ctx.fillStyle = "rgba(10, 3, 20, 0.7)";
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.06, size * 0.07, 0, 0, TAU);
  ctx.fill();

  // Glowing eyes with trails
  for (const side of [-1, 1]) {
    const ex = headX + side * size * 0.025;
    const eyePulse = 0.5 + Math.sin(time * 4 + side) * 0.3;

    // Eye trail
    ctx.strokeStyle = `rgba(140, 60, 200, ${eyePulse * 0.3})`;
    ctx.lineWidth = size * 0.005;
    ctx.beginPath();
    ctx.moveTo(ex, headY);
    ctx.quadraticCurveTo(ex + side * size * 0.02, headY - size * 0.03, ex + side * size * 0.04, headY - size * 0.06);
    ctx.stroke();

    // Eye glow
    const eyeGrad = ctx.createRadialGradient(ex, headY, 0, ex, headY, size * 0.03);
    eyeGrad.addColorStop(0, `rgba(180, 100, 255, ${eyePulse * 0.7})`);
    eyeGrad.addColorStop(1, "rgba(100, 40, 180, 0)");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(ex, headY, size * 0.03, 0, TAU);
    ctx.fill();

    ctx.fillStyle = `rgba(220, 180, 255, ${eyePulse})`;
    ctx.beginPath();
    ctx.arc(ex, headY, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Wailing mouth
  const mouthOpen = 0.5 + (isAttacking ? 0.5 : Math.sin(time * 3) * 0.15);
  ctx.fillStyle = "rgba(60, 20, 100, 0.6)";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.035, size * 0.02, size * 0.015 * mouthOpen, 0, 0, TAU);
  ctx.fill();

  ctx.globalAlpha = 1;

  // Cold breath particles
  for (let i = 0; i < 3; i++) {
    const seed = i * 2.1;
    const phase = (time * 0.5 + seed) % 1;
    const bx = headX + Math.sin(seed * 3) * size * 0.03;
    const by = headY + size * 0.05 - phase * size * 0.08;
    ctx.globalAlpha = (1 - phase) * 0.2;
    ctx.fillStyle = "rgba(180, 200, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.006 * (1 + phase), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === OVERLAY: Shadow wisps + orbiting debris ===
  drawShadowWisps(ctx, cx0, y - size * 0.1, size * 0.5, time, zoom, {
    count: 5, speed: 1.2, color: "rgba(80, 30, 120, 0.5)", maxAlpha: 0.25, wispLength: 0.4,
  });

  drawOrbitingDebris(ctx, cx0, y - size * 0.1, size * 0.4, time, zoom, {
    count: 4, minRadius: 0.2, maxRadius: 0.35, speed: 1.5, particleSize: 0.012,
    color: "#6a3090", glowColor: "rgba(100, 50, 150, 0.3)", trailLen: 2,
  });

  if (isAttacking) {
    const phaseShift = 1 - attackPhase;
    ctx.globalAlpha = attackPhase * 0.4 * flicker;
    const ghostR = size * (0.3 + phaseShift * 0.4);
    ctx.strokeStyle = `rgba(180, 120, 255, ${attackPhase * 0.5})`;
    ctx.lineWidth = (2 + attackPhase * 3) * zoom;
    ctx.beginPath();
    ctx.arc(cx0, y - size * 0.05 + floatBob, ghostR, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;

    for (let t = 0; t < 4; t++) {
      const tAngle = t * Math.PI / 2 + time * 6;
      const tDist = size * (0.15 + phaseShift * 0.3);
      const tAlpha = attackPhase * 0.6 * (1 - phaseShift * 0.5);
      ctx.strokeStyle = `rgba(120, 60, 180, ${tAlpha})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cx0, y - size * 0.05 + floatBob);
      ctx.quadraticCurveTo(
        cx0 + Math.cos(tAngle) * tDist * 0.6,
        y - size * 0.05 + floatBob + Math.sin(tAngle) * tDist * 0.6,
        cx0 + Math.cos(tAngle + 0.5) * tDist,
        y - size * 0.05 + floatBob + Math.sin(tAngle + 0.5) * tDist,
      );
      ctx.stroke();
    }

    if (attackPhase > 0.6) {
      const wailInt = (attackPhase - 0.6) * 2.5;
      for (let w = 0; w < 3; w++) {
        const wR = size * (0.05 + w * 0.04 + (1 - wailInt) * 0.1);
        ctx.strokeStyle = `rgba(200, 160, 255, ${wailInt * 0.3 * (1 - w / 3)})`;
        ctx.lineWidth = zoom;
        ctx.beginPath();
        ctx.arc(cx0, y - size * 0.1 + floatBob, wR, Math.PI * 0.8, Math.PI * 0.2, true);
        ctx.stroke();
      }
    }
  }
}

// ============================================================================
// 15. BONE MAGE — Skeleton wizard with staff and spell circle
// ============================================================================

export function drawBoneMageEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.8;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 4;
  const breath = getBreathScale(time, 1.5, 0.018);
  const sway = getIdleSway(time, 1.0, size * 0.004, size * 0.003);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const cx0 = x + sway.dx;

  const boneMid = bodyColor;
  const boneDark = bodyColorDark;
  const boneWhite = bodyColorLight;
  const arcPurple = "#8040c0";

  // === ROTATING SPELL CIRCLE ===
  const spR = size * 0.35;
  ctx.save();
  ctx.translate(cx0, y + size * 0.45);
  ctx.rotate(time * 0.6);
  ctx.strokeStyle = `rgba(120, 60, 180, ${0.15 + Math.sin(time * 2) * 0.08})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, spR, spR * 0.35, 0, 0, TAU);
  ctx.stroke();

  // Pentagram lines
  for (let i = 0; i < 5; i++) {
    const a1 = i * (TAU / 5);
    const a2 = ((i + 2) % 5) * (TAU / 5);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a1) * spR * 0.85, Math.sin(a1) * spR * 0.35 * 0.85);
    ctx.lineTo(Math.cos(a2) * spR * 0.85, Math.sin(a2) * spR * 0.35 * 0.85);
    ctx.stroke();
  }
  ctx.restore();

  // === ARCANE SPARKLES ===
  drawArcaneSparkles(ctx, cx0, y - size * 0.1, size * 0.5, time, zoom, {
    count: 5, speed: 1.8, color: "rgba(160, 80, 220, 0.7)", maxAlpha: 0.4,
  });

  // === BONE LEGS ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.26, width: 0.12, strideSpeed: 4, strideAmt: 0.22,
    color: boneMid, colorDark: boneDark, footColor: boneDark, footLen: 0.12,
    style: 'bone',
  });

  // Bone dust from feet
  for (let i = 0; i < 3; i++) {
    const seed = i * 1.9;
    const phase = (time * 0.7 + seed) % 1;
    ctx.globalAlpha = (1 - phase) * 0.15;
    ctx.fillStyle = "#b0a090";
    ctx.beginPath();
    ctx.arc(cx0 + Math.sin(seed * 5) * size * 0.1, y + size * 0.48 - phase * size * 0.15, size * 0.006, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === DARK WIZARD ROBES ===
  const torsoY = y - size * 0.05 - bodyBob;

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  const robeGrad = ctx.createLinearGradient(cx0 - size * 0.15, torsoY - size * 0.18, cx0 + size * 0.15, torsoY + size * 0.15);
  robeGrad.addColorStop(0, "#1a0a2a");
  robeGrad.addColorStop(0.5, "#2a1a3a");
  robeGrad.addColorStop(1, "#0a0518");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.09, torsoY - size * 0.18);
  ctx.quadraticCurveTo(cx0 - size * 0.16, torsoY + size * 0.03, cx0 - size * 0.15, torsoY + size * 0.18);
  for (let i = 0; i <= 6; i++) {
    const bx = cx0 - size * 0.15 + i * size * 0.05;
    const by = torsoY + size * 0.18 + (i % 2) * size * 0.02 + Math.sin(time * 3.5 + i) * size * 0.008;
    ctx.lineTo(bx, by);
  }
  ctx.quadraticCurveTo(cx0 + size * 0.16, torsoY + size * 0.03, cx0 + size * 0.09, torsoY - size * 0.18);
  ctx.closePath();
  ctx.fill();

  // Glowing arcane symbols on robe
  const symAlpha = 0.2 + Math.sin(time * 2.5) * 0.1;
  ctx.fillStyle = `rgba(140, 80, 200, ${symAlpha})`;
  ctx.font = `${size * 0.04}px serif`;
  ctx.fillText("✧", cx0 - size * 0.04, torsoY + size * 0.02);
  ctx.fillText("◇", cx0 + size * 0.02, torsoY + size * 0.08);

  // Visible skeleton through semi-transparent robe
  ctx.strokeStyle = boneMid;
  ctx.lineWidth = size * 0.008;
  ctx.globalAlpha = 0.25;
  for (let r = 0; r < 3; r++) {
    const ry = torsoY - size * 0.08 + r * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(cx0 - size * 0.02, ry);
    ctx.quadraticCurveTo(cx0 - size * 0.06, ry + size * 0.01, cx0 - size * 0.08, ry + size * 0.02);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx0 + size * 0.02, ry);
    ctx.quadraticCurveTo(cx0 + size * 0.06, ry + size * 0.01, cx0 + size * 0.08, ry + size * 0.02);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Purple energy veins on visible bones
  ctx.strokeStyle = `rgba(140, 60, 200, ${0.2 + Math.sin(time * 3) * 0.1})`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.04, torsoY - size * 0.1);
  ctx.lineTo(cx0 - size * 0.06, torsoY);
  ctx.stroke();

  ctx.restore();

  drawShoulderOverlay(ctx, cx0 - size * 0.16, torsoY - size * 0.13 - bodyBob, size, -1, boneMid, boneDark, 'round');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, torsoY - size * 0.13 - bodyBob, size, 1, boneMid, boneDark, 'round');
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.06, size, size * 0.12, "#3a2a1a", "#1a0a10");

  // === CASTING ARM (left) ===
  drawPathArm(ctx, cx0 - size * 0.13, torsoY - size * 0.08, size, time, zoom, -1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    swingSpeed: 4, swingAmt: 0.25, baseAngle: 0.45,
    attackExtra: isAttacking ? 0.6 : 0, elbowBend: 0.5,
    upperLen: 0.24, foreLen: 0.2,
    style: 'bone',
  });

  // Energy arc between staff and hand when attacking
  if (isAttacking) {
    drawEnergyArc(ctx, cx0 - size * 0.22, torsoY + size * 0.05, cx0 + size * 0.15, torsoY - size * 0.05, time, zoom, {
      color: "rgba(140, 80, 220, 0.6)", segments: 5, amplitude: 7, width: 1.3,
    });
  }

  // === STAFF ARM (right) ===
  drawPathArm(ctx, cx0 + size * 0.13, torsoY - size * 0.08, size, time, zoom, 1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.22, foreLen: 0.18,
    shoulderAngle: 0.15,
    elbowBend: 0.5,
    elbowAngle: 0.2,
    style: 'bone',
    onWeapon: (ctx) => {
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(-size * 0.011, size * 0.02, size * 0.022, size * 0.3);

      ctx.fillStyle = boneWhite;
      ctx.beginPath();
      ctx.ellipse(0, size * 0.015, size * 0.028, size * 0.03, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#1a0a20";
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(side * size * 0.011, size * 0.015, size * 0.007, 0, TAU);
        ctx.fill();
      }

      const orbPulse = 0.5 + Math.sin(time * 3.5) * 0.3;
      ctx.fillStyle = `rgba(140, 60, 220, ${orbPulse * 0.6})`;
      ctx.beginPath();
      ctx.arc(0, -size * 0.01, size * 0.035, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(200, 140, 255, ${orbPulse * 0.8})`;
      ctx.beginPath();
      ctx.arc(0, -size * 0.01, size * 0.017, 0, TAU);
      ctx.fill();
    },
  });

  // === SKULL HEAD IN HOOD ===
  const headX = cx0;
  const headY = y - size * 0.25 - bodyBob;

  ctx.fillStyle = "#1a0a2a";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.09, headY + size * 0.05);
  ctx.quadraticCurveTo(headX - size * 0.1, headY - size * 0.06, headX, headY - size * 0.12);
  ctx.quadraticCurveTo(headX + size * 0.1, headY - size * 0.06, headX + size * 0.09, headY + size * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.065, size * 0.07, 0, 0, TAU);
  ctx.fill();

  for (const side of [-1, 1]) {
    ctx.fillStyle = "#0a0518";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.025, headY + size * 0.005, size * 0.018, size * 0.016, 0, 0, TAU);
    ctx.fill();
  }

  drawGlowingEyes(ctx, headX, headY + size * 0.005, size, time, {
    spacing: 0.025,
    eyeRadius: 0.012,
    pupilRadius: 0.005,
    irisColor: arcPurple,
    pupilColor: "#d0a0ff",
    glowColor: "rgba(140, 60, 220, 0.6)",
    glowRadius: 0.045,
    pulseSpeed: 4,
    lookSpeed: 1.5,
    lookAmount: 0.006,
  });

  // Floating rune fragments
  for (let f = 0; f < 3; f++) {
    drawFloatingPiece(ctx, cx0 + (f - 1) * size * 0.15, y - size * 0.4 + Math.sin(time + f) * size * 0.03, size, time, f * 2.1, {
      width: 0.03, height: 0.015, color: arcPurple, colorEdge: "#4a1060",
      bobSpeed: 2.5, bobAmt: 0.025, rotateSpeed: 2, rotateAmt: 0.15,
    });
  }
}

// ============================================================================
// 16. DARK PRIEST — Crimson-robed cleric with censer and lantern staff
// ============================================================================

export function drawDarkPriestEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.85;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 3.5;
  const breath = getBreathScale(time, 1.2, 0.015);
  const sway = getIdleSway(time, 0.9, size * 0.004, size * 0.003);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const cx0 = x + sway.dx;

  const boneMid = bodyColor;
  const boneDark = bodyColorDark;

  // === UNHOLY GROUND GLYPH ===
  const glyphAlpha = 0.12 + Math.sin(time * 1.5) * 0.06;
  ctx.strokeStyle = `rgba(180, 40, 40, ${glyphAlpha})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.48, size * 0.3, size * 0.3 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();

  // Glyph symbols
  drawArcaneSparkles(ctx, cx0, y + size * 0.45, size * 0.28, time, zoom, {
    count: 4, speed: 0.8, color: "rgba(200, 60, 60, 0.6)", maxAlpha: 0.2, sparkleSize: 0.08,
  });

  // === LEGS (mostly hidden by robes) ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.15, width: 0.12, strideSpeed: 3.5, strideAmt: 0.18,
    color: "#2a0a0a", colorDark: "#1a0505", footColor: "#1a0505", footLen: 0.12,
    style: 'armored',
  });

  // === CRIMSON ROBES ===
  const torsoY = y - size * 0.05 - bodyBob;

  drawTatteredCloak(ctx, cx0, torsoY - size * 0.15 - bodyBob, size, size * 0.3, size * 0.35, "#3a0808", "#1a0404", time);

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  const robeGrad = ctx.createLinearGradient(cx0 - size * 0.16, torsoY - size * 0.2, cx0 + size * 0.16, torsoY + size * 0.2);
  robeGrad.addColorStop(0, "#3a0808");
  robeGrad.addColorStop(0.3, "#5a1515");
  robeGrad.addColorStop(0.7, "#4a1010");
  robeGrad.addColorStop(1, "#2a0505");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY - size * 0.2);
  ctx.quadraticCurveTo(cx0 - size * 0.18, torsoY + size * 0.05, cx0 - size * 0.17, torsoY + size * 0.28);
  for (let i = 0; i <= 7; i++) {
    const bx = cx0 - size * 0.17 + i * size * 0.0486;
    const by = torsoY + size * 0.28 + (i % 2) * size * 0.02 + Math.sin(time * 3 + i * 0.9) * size * 0.008;
    ctx.lineTo(bx, by);
  }
  ctx.quadraticCurveTo(cx0 + size * 0.18, torsoY + size * 0.05, cx0 + size * 0.1, torsoY - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Inverted cross on chest
  ctx.strokeStyle = "#8a3030";
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.moveTo(cx0, torsoY - size * 0.1);
  ctx.lineTo(cx0, torsoY + size * 0.06);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.03, torsoY + size * 0.02);
  ctx.lineTo(cx0 + size * 0.03, torsoY + size * 0.02);
  ctx.stroke();

  // Corruption glow around cross
  ctx.fillStyle = `rgba(200, 50, 50, ${0.1 + Math.sin(time * 3) * 0.05})`;
  ctx.beginPath();
  ctx.arc(cx0, torsoY - size * 0.02, size * 0.05, 0, TAU);
  ctx.fill();

  // Book chained to belt
  ctx.fillStyle = "#2a1a10";
  ctx.fillRect(cx0 + size * 0.06, torsoY + size * 0.12, size * 0.035, size * 0.04);
  ctx.strokeStyle = "#6a6a70";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.04, torsoY + size * 0.12);
  ctx.lineTo(cx0 + size * 0.06, torsoY + size * 0.13);
  ctx.stroke();

  // Robe stole/collar
  ctx.fillStyle = "#7a2020";
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.08, torsoY - size * 0.18);
  ctx.lineTo(cx0 - size * 0.04, torsoY - size * 0.06);
  ctx.lineTo(cx0, torsoY - size * 0.16);
  ctx.lineTo(cx0 + size * 0.04, torsoY - size * 0.06);
  ctx.lineTo(cx0 + size * 0.08, torsoY - size * 0.18);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  drawGorget(ctx, cx0, torsoY - size * 0.18 - bodyBob, size, size * 0.2, "#3a0808", "#1a0404");

  // === CENSER ARM (left) ===
  const censerSwing = Math.sin(time * 2) * 0.2;
  drawPathArm(ctx, cx0 - size * 0.15, torsoY - size * 0.08, size, time, zoom, -1, {
    color: "#3a0808", colorDark: boneDark, handColor: boneDark,
    upperLen: 0.2, foreLen: 0.17,
    shoulderAngle: -0.3 + censerSwing,
    elbowBend: 0.55,
    elbowAngle: 0.25 + censerSwing * 0.5,
    style: 'bone',
    onWeapon: (ctx) => {
      ctx.strokeStyle = "#8a8a90";
      ctx.lineWidth = size * 0.008;
      ctx.beginPath();
      ctx.moveTo(0, size * 0.08);
      ctx.lineTo(0, size * 0.2);
      ctx.stroke();

      const censerY = size * 0.22;
      ctx.fillStyle = "#6a5a40";
      ctx.beginPath();
      ctx.moveTo(-size * 0.022, censerY);
      ctx.lineTo(-size * 0.03, censerY + size * 0.035);
      ctx.lineTo(size * 0.03, censerY + size * 0.035);
      ctx.lineTo(size * 0.022, censerY);
      ctx.closePath();
      ctx.fill();

      for (let s = 0; s < 4; s++) {
        const sPhase = (time * 0.6 + s * 0.25) % 1;
        ctx.globalAlpha = (1 - sPhase) * 0.2;
        ctx.fillStyle = "rgba(140, 130, 120, 0.4)";
        const smokeX = Math.sin(time * 2 + s * 1.5) * size * 0.02;
        ctx.beginPath();
        ctx.arc(smokeX, censerY - sPhase * size * 0.12, size * 0.01 * (1 + sPhase), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  });

  // === STAFF WITH LANTERN (right) ===
  drawPathArm(ctx, cx0 + size * 0.15, torsoY - size * 0.08, size, time, zoom, 1, {
    color: "#3a0808", colorDark: boneDark, handColor: boneDark,
    upperLen: 0.22, foreLen: 0.18,
    shoulderAngle: 0.12,
    elbowBend: 0.6,
    elbowAngle: 0.15,
    style: 'bone',
    onWeapon: (ctx) => {
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(-size * 0.011, size * 0.02, size * 0.022, size * 0.3);

      const lanternY = size * 0.01;
      ctx.fillStyle = "#4a3a20";
      ctx.beginPath();
      ctx.moveTo(-size * 0.022, lanternY);
      ctx.lineTo(-size * 0.03, lanternY + size * 0.04);
      ctx.lineTo(size * 0.03, lanternY + size * 0.04);
      ctx.lineTo(size * 0.022, lanternY);
      ctx.closePath();
      ctx.fill();

      const flameFlicker = 0.6 + Math.sin(time * 8) * 0.2;
      ctx.fillStyle = `rgba(255, 120, 40, ${flameFlicker * 0.6})`;
      ctx.beginPath();
      ctx.arc(0, lanternY + size * 0.02, size * 0.014, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 200, 100, ${flameFlicker * 0.3})`;
      ctx.beginPath();
      ctx.arc(0, lanternY + size * 0.02, size * 0.028, 0, TAU);
      ctx.fill();
    },
  });

  // Ember sparks from lantern
  drawEmberSparks(ctx, cx0 + size * 0.16, torsoY - size * 0.12, size * 0.15, time, zoom, {
    count: 3, speed: 1.5, color: "rgba(255, 120, 40, 0.4)", coreColor: "rgba(255, 220, 100, 0.7)", maxAlpha: 0.3,
  });

  // === HEAD IN DEEP HOOD ===
  const headX = cx0;
  const headY = y - size * 0.26 - bodyBob;

  // Deep hood
  ctx.fillStyle = "#2a0505";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, headY + size * 0.06);
  ctx.quadraticCurveTo(headX - size * 0.13, headY - size * 0.06, headX, headY - size * 0.15);
  ctx.quadraticCurveTo(headX + size * 0.13, headY - size * 0.06, headX + size * 0.1, headY + size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Pale skull face
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.01, size * 0.06, size * 0.065, 0, 0, TAU);
  ctx.fill();

  // Glowing red eyes
  drawGlowingEyes(ctx, headX, headY + size * 0.01, size, time, {
    spacing: 0.025,
    eyeRadius: 0.012,
    pupilRadius: 0.005,
    irisColor: "#cc3030",
    pupilColor: "#ff8080",
    glowColor: "rgba(200, 40, 40, 0.6)",
    glowRadius: 0.04,
    pulseSpeed: 3,
    lookSpeed: 1,
    lookAmount: 0.005,
  });

  // === PRAYER BEADS ===
  ctx.strokeStyle = "#3a2a20";
  ctx.lineWidth = size * 0.004;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.08, torsoY - size * 0.1);
  ctx.quadraticCurveTo(cx0 - size * 0.12, torsoY, cx0 - size * 0.06, torsoY + size * 0.08);
  ctx.stroke();
  for (let b = 0; b < 5; b++) {
    const t = b / 4;
    const bx = cx0 - size * 0.08 + t * size * 0.02 - Math.sin(t * Math.PI) * size * 0.04;
    const by = torsoY - size * 0.1 + t * size * 0.18;
    ctx.fillStyle = b === 2 ? "#8a3030" : "#5a3020";
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // === FLOATING UNHOLY SYMBOL ===
  const symX = cx0;
  const symY = y - size * 0.52 + Math.sin(time * 2) * size * 0.015;
  const symPulse = 0.3 + Math.sin(time * 3) * 0.15;
  ctx.fillStyle = `rgba(200, 50, 50, ${symPulse})`;
  ctx.beginPath();
  ctx.arc(symX, symY, size * 0.03, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(200, 50, 50, ${symPulse * 1.5})`;
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.moveTo(symX, symY - size * 0.015);
  ctx.lineTo(symX, symY + size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(symX - size * 0.01, symY + size * 0.008);
  ctx.lineTo(symX + size * 0.01, symY + size * 0.008);
  ctx.stroke();

  // Incense smoke wisps
  for (let w = 0; w < 3; w++) {
    const wPhase = (time * 0.4 + w * 0.33) % 1;
    ctx.globalAlpha = (1 - wPhase) * 0.12;
    ctx.fillStyle = "rgba(120, 100, 80, 0.3)";
    ctx.beginPath();
    ctx.arc(cx0 + Math.sin(time + w * 2) * size * 0.08, y - size * 0.2 - wPhase * size * 0.2, size * 0.015 * (1 + wPhase), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (isAttacking) {
    const ritualProgress = 1 - attackPhase;
    const runeR = size * 0.35;
    ctx.strokeStyle = `rgba(200, 50, 50, ${attackPhase * 0.6})`;
    ctx.lineWidth = (1.5 + attackPhase * 2) * zoom;
    ctx.beginPath();
    ctx.ellipse(cx0, y + size * 0.48, runeR, runeR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();

    for (let p = 0; p < 5; p++) {
      const pAngle = p * (TAU / 5) + ritualProgress * TAU;
      const px = cx0 + Math.cos(pAngle) * runeR * 0.8;
      const py = y + size * 0.48 + Math.sin(pAngle) * runeR * ISO_Y_RATIO * 0.8;
      ctx.fillStyle = `rgba(200, 50, 50, ${attackPhase * 0.7})`;
      ctx.beginPath();
      ctx.arc(px, py, size * 0.012, 0, TAU);
      ctx.fill();
    }

    for (let s = 0; s < 4; s++) {
      const sPhase = (attackPhase + s * 0.25) % 1;
      const sAngle = s * Math.PI / 2 + time * 4;
      const sDist = size * (0.4 - sPhase * 0.35);
      ctx.fillStyle = `rgba(180, 30, 30, ${attackPhase * 0.5 * sPhase})`;
      ctx.beginPath();
      ctx.arc(
        cx0 + Math.cos(sAngle) * sDist,
        y - size * 0.1 + Math.sin(sAngle) * sDist * 0.5,
        size * 0.015 * sPhase, 0, TAU,
      );
      ctx.fill();
    }

    if (attackPhase > 0.7) {
      const burstAlpha = (attackPhase - 0.7) * 3.3;
      ctx.fillStyle = `rgba(200, 50, 50, ${burstAlpha * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(cx0, y, size * 0.3 * burstAlpha, size * 0.3 * burstAlpha * ISO_Y_RATIO, 0, 0, TAU);
      ctx.fill();
    }
  }
}

// ============================================================================
// 17. REVENANT — Vengeful spectral warrior with fire and fury
// ============================================================================

export function drawRevenantEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.9;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 5;
  const breath = getBreathScale(time, 2, 0.02);
  const sway = getIdleSway(time, 1.5, size * 0.006, size * 0.004);
  const cx0 = x + sway.dx;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.013;
  const flicker = 0.75 + Math.sin(time * 10) * 0.12;

  // === FURY FLAME AURA ===
  drawRadialAura(ctx, cx0, y - size * 0.1, size * 0.7, [
    { offset: 0, color: "rgba(200, 80, 30, 0.12)" },
    { offset: 0.4, color: "rgba(180, 60, 20, 0.06)" },
    { offset: 0.7, color: "rgba(150, 40, 10, 0.02)" },
    { offset: 1, color: "rgba(120, 30, 5, 0)" },
  ]);

  // === EMBER SPARKS ===
  drawEmberSparks(ctx, cx0, y - size * 0.15, size * 0.55, time, zoom, {
    count: 8, speed: 1.8, color: "rgba(255, 120, 30, 0.5)", coreColor: "rgba(255, 220, 100, 0.8)", maxAlpha: 0.5,
  });

  // === RAGE FLAME POOL ===
  ctx.fillStyle = "rgba(200, 80, 20, 0.08)";
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.48, size * 0.35, size * 0.35 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // === MOTION BLUR AFTERIMAGES ===
  for (let t = 1; t <= 3; t++) {
    ctx.globalAlpha = 0.08 / t;
    ctx.fillStyle = "rgba(200, 100, 40, 0.3)";
    ctx.beginPath();
    ctx.ellipse(cx0 - t * size * 0.05, y - size * 0.05, size * 0.1, size * 0.18, 0, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === SPECTRAL ARMORED LEGS ===
  ctx.globalAlpha = flicker * 0.7;
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.26, width: 0.13, strideSpeed: 5, strideAmt: 0.28,
    color: "rgba(140, 80, 40, 0.6)", colorDark: "rgba(100, 50, 25, 0.5)",
    footColor: "rgba(80, 40, 20, 0.5)", footLen: 0.13,
    style: 'armored',
  });
  ctx.globalAlpha = 1;

  // === TORN SPECTRAL CAPE ===
  ctx.save();
  ctx.translate(cx0, y - size * 0.26 - bodyBob);
  const capeSwing = Math.sin(time * 3) * 0.1;
  ctx.rotate(capeSwing);
  ctx.globalAlpha = flicker * 0.6;

  ctx.fillStyle = "rgba(180, 80, 30, 0.5)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, 0);
  for (let i = 0; i <= 7; i++) {
    const bx = -size * 0.14 + i * size * 0.04;
    const by = size * 0.5 + (i % 2) * size * 0.035 + Math.sin(time * 3.5 + i * 0.7) * size * 0.015;
    ctx.lineTo(bx, by);
  }
  ctx.lineTo(size * 0.12, 0);
  ctx.closePath();
  ctx.fill();

  // Ember-edge effect on cape bottom
  for (let i = 0; i <= 7; i++) {
    const bx = -size * 0.14 + i * size * 0.04;
    const by = size * 0.5 + (i % 2) * size * 0.035 + Math.sin(time * 3.5 + i * 0.7) * size * 0.015;
    ctx.fillStyle = `rgba(255, 150, 50, ${0.2 + Math.sin(time * 5 + i) * 0.1})`;
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.008, 0, TAU);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  // === SPECTRAL ARMORED BODY ===
  const torsoY = y - size * 0.08 - bodyBob;

  ctx.globalAlpha = flicker * 0.5;
  drawTatteredCloak(ctx, cx0, torsoY - size * 0.15 - bodyBob, size, size * 0.3, size * 0.35, "rgba(180, 80, 30, 0.4)", "rgba(100, 40, 15, 0.3)", time);
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.globalAlpha = flicker * 0.8;
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  const bodyGrad = ctx.createRadialGradient(cx0, torsoY, size * 0.03, cx0, torsoY, size * 0.16);
  bodyGrad.addColorStop(0, "rgba(200, 120, 60, 0.6)");
  bodyGrad.addColorStop(0.5, "rgba(150, 80, 40, 0.4)");
  bodyGrad.addColorStop(1, "rgba(100, 50, 25, 0.2)");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.13, torsoY + size * 0.14);
  ctx.lineTo(cx0 - size * 0.15, torsoY - size * 0.06);
  ctx.quadraticCurveTo(cx0, torsoY - size * 0.2, cx0 + size * 0.15, torsoY - size * 0.06);
  ctx.lineTo(cx0 + size * 0.13, torsoY + size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Spectral armor lines
  ctx.strokeStyle = "rgba(220, 140, 60, 0.3)";
  ctx.lineWidth = 0.6 * zoom;
  for (let p = 0; p < 3; p++) {
    const py = torsoY - size * 0.1 + p * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(cx0 - size * 0.11, py);
    ctx.lineTo(cx0 + size * 0.11, py);
    ctx.stroke();
  }

  ctx.restore();
  ctx.globalAlpha = 1;

  // Spectral pauldron spikes
  for (const side of [-1, 1]) {
    ctx.globalAlpha = flicker * 0.6;
    ctx.fillStyle = "rgba(200, 120, 60, 0.5)";
    ctx.beginPath();
    ctx.moveTo(cx0 + side * size * 0.15, torsoY - size * 0.12 - bodyBob);
    ctx.lineTo(cx0 + side * size * 0.22, torsoY - size * 0.2 - bodyBob);
    ctx.lineTo(cx0 + side * size * 0.18, torsoY - size * 0.1 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  drawShoulderOverlay(ctx, cx0 - size * 0.16, torsoY - size * 0.13 - bodyBob, size, -1, "rgba(200, 120, 60, 0.5)", "rgba(100, 50, 25, 0.3)", 'plate');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, torsoY - size * 0.13 - bodyBob, size, 1, "rgba(200, 120, 60, 0.5)", "rgba(100, 50, 25, 0.3)", 'plate');

  // === LEFT ARM ===
  ctx.globalAlpha = flicker * 0.7;
  drawPathArm(ctx, cx0 - size * 0.15, torsoY - size * 0.08 - bodyBob, size, time, zoom, -1, {
    color: "rgba(150, 80, 40, 0.5)", colorDark: "rgba(100, 50, 25, 0.4)",
    handColor: "rgba(120, 60, 30, 0.5)",
    swingSpeed: 5, swingAmt: 0.2, baseAngle: 0.3,
    elbowBend: 0.55, upperLen: 0.26, foreLen: 0.22,
    style: 'armored',
  });
  ctx.globalAlpha = 1;

  // === FIRE-WREATHED GREATSWORD (right) ===
  const swordSwing = Math.sin(walkPhase) * 0.1 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.9 : 0);
  ctx.globalAlpha = flicker * 0.8;
  drawPathArm(ctx, cx0 + size * 0.16, torsoY - size * 0.08 - bodyBob, size, time, zoom, 1, {
    color: "rgba(150, 80, 40, 0.5)", colorDark: "rgba(100, 50, 25, 0.4)", handColor: "rgba(100, 50, 25, 0.4)",
    upperLen: 0.24, foreLen: 0.2,
    shoulderAngle: 0.25 + swordSwing,
    elbowBend: 0.5,
    elbowAngle: 0.3 + (isAttacking ? -0.4 : 0),
    style: 'armored',
    onWeapon: (ctx) => {
      const gsLen = size * 0.38;
      const gsW = size * 0.035;
      ctx.fillStyle = "rgba(180, 120, 60, 0.6)";
      ctx.beginPath();
      ctx.moveTo(-gsW, size * 0.1);
      ctx.lineTo(-gsW * 0.3, size * 0.1 + gsLen);
      ctx.lineTo(gsW * 0.3, size * 0.1 + gsLen);
      ctx.lineTo(gsW, size * 0.1);
      ctx.closePath();
      ctx.fill();

      for (let f = 0; f < 5; f++) {
        const fy = size * 0.13 + f * gsLen * 0.18;
        const fPhase = Math.sin(time * 10 + f * 2);
        ctx.fillStyle = `rgba(255, 130, 40, ${0.25 + fPhase * 0.1})`;
        ctx.beginPath();
        ctx.ellipse(gsW * 0.6 + fPhase * size * 0.012, fy, size * 0.022 * (1 + fPhase * 0.3), size * 0.02, fPhase * 0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 220, 100, ${0.15 + fPhase * 0.08})`;
        ctx.beginPath();
        ctx.ellipse(gsW * 0.6 + fPhase * size * 0.012, fy, size * 0.01, size * 0.011, 0, 0, TAU);
        ctx.fill();
      }

      drawEnergyArc(ctx, 0, size * 0.15, 0, size * 0.1 + gsLen * 0.8, time, zoom, {
        color: "rgba(255, 150, 50, 0.5)", segments: 4, amplitude: 5, width: 1.2,
      });

      ctx.fillStyle = "rgba(180, 120, 60, 0.6)";
      ctx.fillRect(-size * 0.06, size * 0.08, size * 0.12, size * 0.02);
    },
  });
  ctx.globalAlpha = 1;

  // === BURNING HEAD ===
  const headX = cx0;
  const headY = y - size * 0.26 - bodyBob;

  ctx.globalAlpha = flicker * 0.8;

  // Helm shape
  const helmGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.09);
  helmGrad.addColorStop(0, "rgba(180, 100, 40, 0.6)");
  helmGrad.addColorStop(1, "rgba(100, 50, 20, 0.3)");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.08, size * 0.09, 0, 0, TAU);
  ctx.fill();

  // Visor
  ctx.fillStyle = "rgba(10, 5, 0, 0.6)";
  ctx.fillRect(headX - size * 0.055, headY - size * 0.005, size * 0.11, size * 0.013);

  ctx.globalAlpha = 1;

  // Burning eyes with flame trails
  for (const side of [-1, 1]) {
    const ex = headX + side * size * 0.03;
    const eyePulse = 0.5 + Math.sin(time * 5 + side * 2) * 0.3;

    // Flame trail from eyes
    ctx.strokeStyle = `rgba(255, 140, 40, ${eyePulse * 0.4})`;
    ctx.lineWidth = size * 0.006;
    ctx.beginPath();
    ctx.moveTo(ex, headY);
    ctx.quadraticCurveTo(ex + side * size * 0.03, headY - size * 0.04, ex + side * size * 0.05, headY - size * 0.08);
    ctx.stroke();

    // Eye glow
    const eyeGrad = ctx.createRadialGradient(ex, headY, 0, ex, headY, size * 0.03);
    eyeGrad.addColorStop(0, `rgba(255, 200, 80, ${eyePulse * 0.8})`);
    eyeGrad.addColorStop(1, "rgba(255, 120, 30, 0)");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(ex, headY, size * 0.03, 0, TAU);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 240, 180, ${eyePulse})`;
    ctx.beginPath();
    ctx.arc(ex, headY, size * 0.007, 0, TAU);
    ctx.fill();
  }

  // Heat distortion particles
  for (let h = 0; h < 4; h++) {
    const hPhase = (time * 0.8 + h * 0.25) % 1;
    ctx.globalAlpha = (1 - hPhase) * 0.08;
    ctx.fillStyle = "rgba(255, 200, 100, 0.3)";
    ctx.beginPath();
    ctx.arc(cx0 + Math.sin(time * 3 + h * 2) * size * 0.1, y - size * 0.3 - hPhase * size * 0.2, size * 0.015 * (1 + hPhase), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === OVERLAY ===
  drawShadowWisps(ctx, cx0, y - size * 0.1, size * 0.5, time, zoom, {
    count: 4, speed: 1.5, color: "rgba(200, 100, 40, 0.5)", maxAlpha: 0.2, wispLength: 0.35,
  });

  drawPulsingGlowRings(ctx, cx0, y - size * 0.1, size * 0.4, time, zoom, {
    count: 2, speed: 1.5, color: "rgba(255, 140, 50, 0.4)", maxAlpha: 0.2, expansion: 1.3,
  });

  if (isAttacking) {
    const furyProgress = 1 - attackPhase;
    const swingAngle = furyProgress * Math.PI * 1.6 - Math.PI * 0.5;
    const swingR = size * 0.45;
    ctx.strokeStyle = `rgba(255, 140, 40, ${attackPhase * 0.7})`;
    ctx.lineWidth = (3 + attackPhase * 5) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx0 + size * 0.1, y - size * 0.1 + bodyBob, swingR, swingAngle - 0.6, swingAngle + 0.6);
    ctx.stroke();
    ctx.lineCap = "butt";

    for (let f = 0; f < 6; f++) {
      const fAngle = swingAngle + (f - 2.5) * 0.22;
      const fDist = swingR * (0.85 + Math.sin(time * 12 + f) * 0.15);
      ctx.fillStyle = `rgba(255, 200, 80, ${attackPhase * 0.5 * (1 - Math.abs(f - 2.5) / 3)})`;
      ctx.beginPath();
      ctx.arc(
        cx0 + size * 0.1 + Math.cos(fAngle) * fDist,
        y - size * 0.1 + bodyBob + Math.sin(fAngle) * fDist,
        size * 0.015, 0, TAU,
      );
      ctx.fill();
    }

    if (attackPhase > 0.8) {
      const flameFlash = (attackPhase - 0.8) * 5;
      const fGrad = ctx.createRadialGradient(cx0, y + bodyBob, 0, cx0, y + bodyBob, size * 0.3 * flameFlash);
      fGrad.addColorStop(0, `rgba(255, 160, 60, ${flameFlash * 0.25})`);
      fGrad.addColorStop(1, "rgba(255, 100, 20, 0)");
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.ellipse(cx0, y + bodyBob, size * 0.3 * flameFlash, size * 0.3 * flameFlash * ISO_Y_RATIO, 0, 0, TAU);
      ctx.fill();
    }
  }
}

// ============================================================================
// 18. ABOMINATION — Boss: Stitched hulking horror with four arms
// ============================================================================

export function drawAbominationEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 2.15;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 2;
  const breath = getBreathScale(time, 0.7, 0.025);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.018;
  const cx0 = x;

  const stompPhase = Math.max(0, -Math.sin(walkPhase - 0.3));
  if (stompPhase > 0.8) {
    const crackInt = (stompPhase - 0.8) * 5;
    ctx.strokeStyle = `rgba(80, 60, 50, ${crackInt * 0.3})`;
    ctx.lineWidth = 1.2 * zoom;
    for (let c = 0; c < 6; c++) {
      const angle = c * (TAU / 6) + 0.4;
      const len = size * 0.1 * crackInt;
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.54);
      ctx.lineTo(x + Math.cos(angle) * len, y + size * 0.54 + Math.sin(angle) * len * 0.35);
      ctx.stroke();
    }
  }

  // === CHAINS DRAGGING ===
  for (const chainOffset of [-size * 0.2, size * 0.15]) {
    const swing = Math.sin(time * 1.5 + chainOffset) * 0.12;
    ctx.save();
    ctx.translate(cx0 + chainOffset, y + size * 0.15 - bodyBob);
    ctx.rotate(swing + 0.5);
    ctx.strokeStyle = "#6a6a70";
    ctx.lineWidth = size * 0.007;
    for (let link = 0; link < 5; link++) {
      ctx.beginPath();
      ctx.ellipse(0, link * size * 0.03, size * 0.012, size * 0.015, (link % 2) * Math.PI / 2, 0, TAU);
      ctx.stroke();
    }
    // Chain ball
    ctx.fillStyle = "#4a4a50";
    ctx.beginPath();
    ctx.arc(0, 5 * size * 0.03, size * 0.02, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // === FLIES ===
  drawOrbitingDebris(ctx, cx0, y - size * 0.15, size * 0.5, time, zoom, {
    count: 6, minRadius: 0.25, maxRadius: 0.45, speed: 3.5, particleSize: 0.008,
    color: "#2a2a2a", glowColor: "rgba(40, 40, 40, 0.2)", trailLen: 1,
  });

  // === MISMATCHED LEGS ===
  // Left leg (thicker)
  drawPathLegs(ctx, cx0 - size * 0.03, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.28, width: 0.14, strideSpeed: 2, strideAmt: 0.15,
    color: bodyColor, colorDark: bodyColorDark, footColor: "#3a3530", footLen: 0.15,
    shuffle: true, phaseOffset: 0,
    style: 'fleshy',
  });

  // === BLOATED TORSO ===
  const torsoY = y - size * 0.06 - bodyBob;

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  const bodyGrad = ctx.createRadialGradient(cx0, torsoY, size * 0.06, cx0, torsoY, size * 0.22);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.4, bodyColor);
  bodyGrad.addColorStop(0.8, bodyColorDark);
  bodyGrad.addColorStop(1, "#2a2018");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(cx0, torsoY, size * 0.2, size * 0.22, 0, 0, TAU);
  ctx.fill();

  // Mismatched flesh patches
  ctx.fillStyle = "rgba(140, 120, 100, 0.3)";
  ctx.beginPath();
  ctx.ellipse(cx0 + size * 0.08, torsoY - size * 0.05, size * 0.06, size * 0.05, 0.4, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(100, 80, 70, 0.3)";
  ctx.beginPath();
  ctx.ellipse(cx0 - size * 0.1, torsoY + size * 0.06, size * 0.05, size * 0.04, -0.3, 0, TAU);
  ctx.fill();

  // Stitches with infection glow
  ctx.strokeStyle = "#3a3530";
  ctx.lineWidth = 1 * zoom;
  const stitchPath = [
    [-0.12, -0.08, -0.02, 0.12],
    [0.05, -0.1, 0.15, 0.05],
    [-0.08, 0.05, 0.08, 0.15],
  ] as [number, number, number, number][];
  for (const [sx, sy, ex, ey] of stitchPath) {
    ctx.beginPath();
    ctx.moveTo(cx0 + sx * size, torsoY + sy * size);
    ctx.lineTo(cx0 + ex * size, torsoY + ey * size);
    ctx.stroke();

    // Cross stitches
    const dx = (ex - sx) * size;
    const dy = (ey - sy) * size;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(len / (size * 0.03));
    for (let s = 0; s < steps; s++) {
      const t = (s + 0.5) / steps;
      const px = cx0 + sx * size + dx * t;
      const py = torsoY + sy * size + dy * t;
      const perpX = -dy / len * size * 0.01;
      const perpY = dx / len * size * 0.01;
      ctx.beginPath();
      ctx.moveTo(px + perpX, py + perpY);
      ctx.lineTo(px - perpX, py - perpY);
      ctx.stroke();
    }

    // Infection glow along stitch
    ctx.fillStyle = "rgba(180, 200, 60, 0.1)";
    ctx.beginPath();
    ctx.moveTo(cx0 + sx * size, torsoY + sy * size);
    ctx.lineTo(cx0 + ex * size, torsoY + ey * size);
    ctx.lineWidth = size * 0.03;
    ctx.strokeStyle = "rgba(180, 200, 60, 0.08)";
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // Metal plates and hooks
  ctx.fillStyle = "#5a5a60";
  ctx.fillRect(cx0 + size * 0.08, torsoY - size * 0.06, size * 0.06, size * 0.08);
  ctx.fillStyle = "#8a8a90";
  ctx.beginPath();
  ctx.arc(cx0 + size * 0.1, torsoY - size * 0.04, size * 0.007, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx0 + size * 0.12, torsoY + size * 0.0, size * 0.007, 0, TAU);
  ctx.fill();

  // Hook through shoulder
  ctx.strokeStyle = "#7a7a80";
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.14, torsoY - size * 0.12);
  ctx.quadraticCurveTo(cx0 - size * 0.16, torsoY - size * 0.16, cx0 - size * 0.12, torsoY - size * 0.18);
  ctx.stroke();

  // Exposed bone fragment
  ctx.fillStyle = "#d0c8b0";
  ctx.beginPath();
  ctx.ellipse(cx0 - size * 0.05, torsoY + size * 0.1, size * 0.02, size * 0.012, 0.5, 0, TAU);
  ctx.fill();

  ctx.restore();

  drawShoulderOverlay(ctx, cx0 - size * 0.16, torsoY - size * 0.13 - bodyBob, size, -1, bodyColor, bodyColorDark, 'round');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, torsoY - size * 0.13 - bodyBob, size, 1, bodyColor, bodyColorDark, 'round');
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.06, size, size * 0.12, "#5a5a60", "#3a3a40", "#8a8a90");

  // === FOUR ARMS ===
  // Upper large arms
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawPathArm(ctx, cx0 + side * size * 0.2, torsoY - size * 0.08 - bodyBob, size, time, zoom, side, {
      color: bodyColor, colorDark: bodyColorDark, handColor: bodyColorDark,
      swingSpeed: 2, swingAmt: 0.25, baseAngle: 0.35,
      attackExtra: isAttacking ? 0.5 : 0, elbowBend: 0.55,
      upperLen: 0.34, foreLen: 0.31, width: 0.12, handRadius: 0.06,
      style: 'fleshy',
    });
  }

  // Lower smaller arms
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawPathArm(ctx, cx0 + side * size * 0.15, torsoY + size * 0.02 - bodyBob, size, time, zoom, side, {
      color: bodyColorDark, colorDark: "#3a2a18", handColor: "#3a2a18",
      swingSpeed: 2.5, swingAmt: 0.2, baseAngle: 0.5,
      attackExtra: isAttacking ? 0.3 : 0, elbowBend: 0.5,
      upperLen: 0.24, foreLen: 0.2, width: 0.12, handRadius: 0.052,
      phaseOffset: Math.PI / 2,
      style: 'fleshy',
    });
  }

  // === SMALL HEAD ===
  const headX = cx0 + size * 0.02;
  const headY = y - size * 0.22 - bodyBob;

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.065, size * 0.07, 0.05, 0, TAU);
  ctx.fill();

  // Stitch across face
  ctx.strokeStyle = "#3a3530";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.04, headY - size * 0.02);
  ctx.lineTo(headX + size * 0.04, headY + size * 0.02);
  ctx.stroke();
  for (let s = 0; s < 3; s++) {
    const t = (s + 0.5) / 3;
    const sx = headX - size * 0.04 + t * size * 0.08;
    const sy = headY - size * 0.02 + t * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(sx - size * 0.005, sy - size * 0.008);
    ctx.lineTo(sx + size * 0.005, sy + size * 0.008);
    ctx.stroke();
  }

  // Mismatched eyes
  // Red eye
  ctx.fillStyle = "#cc2020";
  ctx.beginPath();
  ctx.arc(headX - size * 0.025, headY + size * 0.005, size * 0.012, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#1a0000";
  ctx.beginPath();
  ctx.arc(headX - size * 0.025, headY + size * 0.007, size * 0.005, 0, TAU);
  ctx.fill();

  // Green eye (smaller, different height)
  ctx.fillStyle = "#30aa30";
  ctx.beginPath();
  ctx.arc(headX + size * 0.028, headY - size * 0.005, size * 0.01, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#001a00";
  ctx.beginPath();
  ctx.arc(headX + size * 0.028, headY - size * 0.003, size * 0.004, 0, TAU);
  ctx.fill();

  // Slobber
  const droolPhase = (time * 0.5) % 1;
  ctx.strokeStyle = `rgba(160, 160, 120, ${0.25 + Math.sin(time * 3) * 0.1})`;
  ctx.lineWidth = size * 0.005;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.02, headY + size * 0.05);
  ctx.quadraticCurveTo(headX + size * 0.025, headY + size * 0.08 + droolPhase * size * 0.03, headX + size * 0.015, headY + size * 0.1 + droolPhase * size * 0.04);
  ctx.stroke();

  // Gore drip
  drawPoisonBubbles(ctx, cx0, y + size * 0.3, size * 0.25, time, zoom, {
    count: 3, speed: 0.5, color: "rgba(120, 30, 30, 0.4)", maxAlpha: 0.25, maxSize: 0.08,
  });

  if (isAttacking) {
    const slamPhase = 1 - attackPhase;
    for (let ring = 0; ring < 3; ring++) {
      const rPhase = Math.min(1, slamPhase + ring * 0.1);
      const rR = size * (0.2 + rPhase * 0.5);
      const rAlpha = (1 - rPhase) * 0.4 * attackPhase;
      ctx.strokeStyle = `rgba(120, 50, 30, ${rAlpha})`;
      ctx.lineWidth = (3 - rPhase * 2) * zoom;
      ctx.beginPath();
      ctx.ellipse(cx0, y + size * 0.48, rR, rR * ISO_Y_RATIO, 0, 0, TAU);
      ctx.stroke();
    }

    for (let claw = 0; claw < 4; claw++) {
      const clawAngle = (claw - 1.5) * 0.5 + slamPhase * Math.PI * 0.4;
      const clawLen = size * 0.2 * attackPhase;
      ctx.strokeStyle = `rgba(160, 60, 40, ${attackPhase * 0.6})`;
      ctx.lineWidth = (2 + attackPhase * 2) * zoom;
      ctx.beginPath();
      ctx.moveTo(cx0 + size * 0.15, y - size * 0.05 + bodyBob);
      ctx.lineTo(
        cx0 + size * 0.15 + Math.cos(clawAngle) * clawLen,
        y - size * 0.05 + bodyBob + Math.sin(clawAngle) * clawLen,
      );
      ctx.stroke();
    }

    for (let g = 0; g < 5; g++) {
      const gAngle = g * Math.PI / 2.5 + time * 3;
      const gDist = size * (0.1 + slamPhase * 0.3);
      ctx.fillStyle = `rgba(120, 30, 30, ${attackPhase * 0.5 * (1 - slamPhase * 0.5)})`;
      ctx.beginPath();
      ctx.arc(
        cx0 + Math.cos(gAngle) * gDist,
        y + bodyBob + Math.sin(gAngle) * gDist * 0.6 - slamPhase * size * 0.15,
        size * 0.02 * (1 - slamPhase * 0.5), 0, TAU,
      );
      ctx.fill();
    }
  }
}

// ============================================================================
// 19. HELLHOUND — Demonic quadruped with flaming mane
// ============================================================================

export function drawHellhoundEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.85;
  const isAttacking = attackPhase > 0;
  const gallopPhase = time * 7;
  const bodyBob = Math.abs(Math.sin(gallopPhase)) * size * 0.02;
  const cx0 = x;

  ctx.save();
  ctx.translate(cx0, 0);
  ctx.scale(-1, 1);
  ctx.translate(-cx0, 0);

  // === SCORCHED PAWPRINTS ===
  for (let p = 0; p < 3; p++) {
    const pPhase = (time * 0.3 + p * 0.33) % 1;
    const px = cx0 - size * 0.2 + p * size * 0.2;
    ctx.fillStyle = `rgba(80, 40, 20, ${(1 - pPhase) * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(px, y + size * 0.48, size * 0.02 * (1 - pPhase * 0.5), size * 0.01, 0, 0, TAU);
    ctx.fill();
  }

  // === EMBER SPARKS ===
  drawEmberSparks(ctx, cx0, y - size * 0.15, size * 0.5, time, zoom, {
    count: 7, speed: 2, color: "rgba(255, 120, 30, 0.5)", coreColor: "rgba(255, 230, 100, 0.8)", maxAlpha: 0.5,
  });

  // Ground scorch beneath
  ctx.fillStyle = "rgba(60, 30, 10, 0.1)";
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.46, size * 0.3, size * 0.3 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // === FIERY TAIL ===
  ctx.save();
  ctx.translate(cx0 - size * 0.22, y - size * 0.05 - bodyBob);
  const tailSwing = Math.sin(time * 4) * 0.3;
  ctx.rotate(-0.5 + tailSwing);

  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = size * 0.02;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.08, -size * 0.1, -size * 0.15, -size * 0.15);
  ctx.stroke();

  // Flame tip
  const flameTip = 0.5 + Math.sin(time * 8) * 0.3;
  ctx.fillStyle = `rgba(255, 140, 40, ${flameTip * 0.6})`;
  ctx.beginPath();
  ctx.arc(-size * 0.15, -size * 0.15, size * 0.02, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 220, 100, ${flameTip * 0.4})`;
  ctx.beginPath();
  ctx.arc(-size * 0.15, -size * 0.15, size * 0.035, 0, TAU);
  ctx.fill();

  ctx.lineCap = "butt";
  ctx.restore();

  // === FOUR ARTICULATED LEGS ===
  const legLen = size * 0.16;
  const legData = [
    { x: -0.14, y: 0.06, phase: 0, isFront: false },
    { x: -0.06, y: 0.06, phase: Math.PI * 0.5, isFront: false },
    { x: 0.08, y: 0.04, phase: Math.PI, isFront: true },
    { x: 0.16, y: 0.04, phase: Math.PI * 1.5, isFront: true },
  ];

  for (const leg of legData) {
    const swing = Math.sin(gallopPhase + leg.phase) * 0.35;
    const kneeBend = Math.max(0, -Math.sin(gallopPhase + leg.phase)) * 0.4;

    ctx.save();
    ctx.translate(cx0 + leg.x * size, y + leg.y * size + bodyBob);
    ctx.rotate(swing);

    // Upper leg with muscular shape
    const upperGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, legLen);
    upperGrad.addColorStop(0, bodyColorDark);
    upperGrad.addColorStop(0.5, bodyColor);
    upperGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = upperGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, -size * 0.01);
    ctx.quadraticCurveTo(-size * 0.055, legLen * 0.4, -size * 0.035, legLen * 0.85);
    ctx.lineTo(size * 0.035, legLen * 0.85);
    ctx.quadraticCurveTo(size * 0.055, legLen * 0.4, size * 0.04, -size * 0.01);
    ctx.closePath();
    ctx.fill();

    // Joint bulge
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(0, legLen * 0.85, size * 0.04, size * 0.03, 0, 0, TAU);
    ctx.fill();

    ctx.translate(0, legLen * 0.85);
    ctx.rotate(kneeBend);

    // Lower leg (thinner, sinewy)
    const lowerGrad = ctx.createLinearGradient(-size * 0.03, 0, size * 0.03, legLen * 0.8);
    lowerGrad.addColorStop(0, bodyColor);
    lowerGrad.addColorStop(0.5, bodyColorDark);
    lowerGrad.addColorStop(1, bodyColor);
    ctx.fillStyle = lowerGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.035, -size * 0.01);
    ctx.quadraticCurveTo(-size * 0.025, legLen * 0.4, -size * 0.03, legLen * 0.7);
    ctx.lineTo(size * 0.03, legLen * 0.7);
    ctx.quadraticCurveTo(size * 0.025, legLen * 0.4, size * 0.035, -size * 0.01);
    ctx.closePath();
    ctx.fill();

    // Paw
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(size * 0.01, legLen * 0.7, size * 0.045, size * 0.025, 0.1, 0, TAU);
    ctx.fill();

    // Claws (larger, sharper)
    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = "#2a2020";
      ctx.beginPath();
      ctx.moveTo(size * -0.01 + c * size * 0.02, legLen * 0.7 + size * 0.01);
      ctx.lineTo(size * -0.005 + c * size * 0.02, legLen * 0.7 + size * 0.035);
      ctx.lineTo(size * 0.005 + c * size * 0.02, legLen * 0.7 + size * 0.01);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // === MUSCULAR BODY ===
  const bodyGrad = ctx.createRadialGradient(cx0, y - size * 0.03 - bodyBob, size * 0.05, cx0, y - size * 0.03 - bodyBob, size * 0.2);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(cx0, y - size * 0.03 - bodyBob, size * 0.2, size * 0.12, 0, 0, TAU);
  ctx.fill();

  // Muscle definition
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(cx0 + size * 0.06, y - size * 0.05 - bodyBob, size * 0.06, size * 0.04, 0.3, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx0 - size * 0.06, y - size * 0.04 - bodyBob, size * 0.05, size * 0.035, -0.2, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Rib outline
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.5 * zoom;
  ctx.globalAlpha = 0.2;
  for (let r = 0; r < 3; r++) {
    const rx = cx0 - size * 0.02 + r * size * 0.04;
    ctx.beginPath();
    ctx.arc(rx, y - size * 0.02 - bodyBob, size * 0.05, -0.5, 0.8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === FLAMING MANE ===
  for (let f = 0; f < 8; f++) {
    const fX = cx0 - size * 0.1 + f * size * 0.03;
    const fY = y - size * 0.1 - bodyBob;
    const flameH = size * 0.06 + Math.sin(time * 10 + f * 1.5) * size * 0.025;
    const flameW = size * 0.015 + Math.sin(time * 7 + f) * size * 0.005;

    // Outer flame
    ctx.fillStyle = `rgba(255, 100, 20, ${0.4 + Math.sin(time * 8 + f) * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(fX - flameW, fY);
    ctx.quadraticCurveTo(fX - flameW * 0.5, fY - flameH * 0.6, fX, fY - flameH);
    ctx.quadraticCurveTo(fX + flameW * 0.5, fY - flameH * 0.6, fX + flameW, fY);
    ctx.closePath();
    ctx.fill();

    // Inner flame
    ctx.fillStyle = `rgba(255, 220, 80, ${0.3 + Math.sin(time * 9 + f * 2) * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(fX - flameW * 0.5, fY);
    ctx.quadraticCurveTo(fX, fY - flameH * 0.7, fX + flameW * 0.5, fY);
    ctx.closePath();
    ctx.fill();
  }

  // === BEAST HEAD ===
  const headX = cx0 + size * 0.22;
  const headY = y - size * 0.1 - bodyBob;

  // Snout
  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.1);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.6, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.09, size * 0.07, 0, 0, TAU);
  ctx.fill();

  // Snout extension
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.06, headY + size * 0.01, size * 0.05, size * 0.04, 0, 0, TAU);
  ctx.fill();

  // Ears
  for (const side of [-1, 1]) {
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.02, headY + side * size * 0.055);
    ctx.lineTo(headX - size * 0.06, headY + side * size * 0.09);
    ctx.lineTo(headX + size * 0.01, headY + side * size * 0.05);
    ctx.closePath();
    ctx.fill();
  }

  // Open jaws
  const jawOpen = isAttacking ? 0.4 : 0.15 + Math.sin(time * 3) * 0.05;

  // Upper jaw
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.08, headY - size * 0.01, size * 0.04, size * 0.02, -jawOpen * 0.5, 0, TAU);
  ctx.fill();

  // Lower jaw
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.08, headY + size * 0.02, size * 0.04, size * 0.02, jawOpen * 0.5, 0, TAU);
  ctx.fill();

  // Fangs
  ctx.fillStyle = "#e0d8c0";
  for (const [fx, fy, len] of [[0.09, -0.01, 0.02], [0.07, -0.008, 0.015], [0.09, 0.02, 0.018], [0.07, 0.022, 0.013]] as [number, number, number][]) {
    ctx.beginPath();
    ctx.moveTo(headX + fx * size, headY + fy * size);
    ctx.lineTo(headX + fx * size + size * 0.004, headY + fy * size + (fy < 0 ? -1 : 1) * len * size);
    ctx.lineTo(headX + fx * size + size * 0.008, headY + fy * size);
    ctx.closePath();
    ctx.fill();
  }

  // Burning eyes
  for (const side of [-1, 1]) {
    const ex = headX + size * 0.01;
    const ey = headY + side * size * 0.025;
    const eyePulse = 0.6 + Math.sin(time * 5 + side) * 0.2;

    const eyeGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, size * 0.025);
    eyeGrad.addColorStop(0, `rgba(255, 200, 60, ${eyePulse})`);
    eyeGrad.addColorStop(1, "rgba(255, 100, 20, 0)");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, size * 0.025, 0, TAU);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 240, 150, ${eyePulse})`;
    ctx.beginPath();
    ctx.arc(ex, ey, size * 0.008, 0, TAU);
    ctx.fill();

    // Smoke trail from eyes
    ctx.strokeStyle = `rgba(80, 40, 20, ${eyePulse * 0.3})`;
    ctx.lineWidth = size * 0.004;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.quadraticCurveTo(ex - size * 0.02, ey + side * size * 0.01, ex - size * 0.04, ey + side * size * 0.02 - size * 0.02);
    ctx.stroke();
  }

  // Nostril smoke
  for (let n = 0; n < 2; n++) {
    const nPhase = (time * 0.6 + n * 0.5) % 1;
    ctx.globalAlpha = (1 - nPhase) * 0.15;
    ctx.fillStyle = "rgba(80, 60, 40, 0.3)";
    ctx.beginPath();
    ctx.arc(headX + size * 0.1, headY + (n - 0.5) * size * 0.015 - nPhase * size * 0.04, size * 0.008 * (1 + nPhase), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Drool when attacking
  if (isAttacking) {
    ctx.strokeStyle = "rgba(255, 100, 30, 0.3)";
    ctx.lineWidth = size * 0.004;
    ctx.beginPath();
    ctx.moveTo(headX + size * 0.08, headY + size * 0.03);
    ctx.lineTo(headX + size * 0.08, headY + size * 0.06 + Math.sin(time * 6) * size * 0.01);
    ctx.stroke();
  }

  // Heat shimmer above mane
  for (let h = 0; h < 3; h++) {
    const hPhase = (time * 0.7 + h * 0.33) % 1;
    ctx.globalAlpha = (1 - hPhase) * 0.06;
    ctx.fillStyle = "rgba(255, 200, 100, 0.3)";
    ctx.beginPath();
    ctx.arc(cx0 - size * 0.05 + h * size * 0.05, y - size * 0.15 - bodyBob - hPhase * size * 0.15, size * 0.02 * (1 + hPhase), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ============================================================================
// 20. DOOM HERALD — Boss: Flying dark angel with bat wings and void halo
// ============================================================================

export function drawDoomHeraldEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 2.1;
  const isAttacking = attackPhase > 0;
  const breath = getBreathScale(time, 1.5, 0.02);
  const sway = getIdleSway(time, 0.8, size * 0.006, size * 0.005);
  const cx0 = x + sway.dx;
  const floatBob = Math.sin(time * 2) * size * 0.015;

  // === VOID AURA ===
  drawRadialAura(ctx, cx0, y - size * 0.1, size * 0.85, [
    { offset: 0, color: "rgba(60, 20, 80, 0.15)" },
    { offset: 0.3, color: "rgba(50, 15, 70, 0.08)" },
    { offset: 0.6, color: "rgba(40, 10, 60, 0.03)" },
    { offset: 1, color: "rgba(30, 5, 50, 0)" },
  ]);

  // === SHADOW TRAIL ON GROUND ===
  ctx.fillStyle = "rgba(30, 10, 50, 0.15)";
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.5, size * 0.4, size * 0.4 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // === DARK FEATHERS FALLING ===
  for (let f = 0; f < 4; f++) {
    const seed = f * 2.3;
    const phase = (time * 0.3 + seed) % 1;
    const fx = cx0 + Math.sin(seed * 4 + time * 0.5) * size * 0.3;
    const fy = y - size * 0.3 + phase * size * 0.8;
    const fRot = time * 2 + seed;
    ctx.save();
    ctx.globalAlpha = (1 - phase) * 0.2;
    ctx.translate(fx, fy);
    ctx.rotate(fRot);
    ctx.fillStyle = "#1a0a2a";
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.015);
    ctx.quadraticCurveTo(size * 0.008, 0, 0, size * 0.015);
    ctx.quadraticCurveTo(-size * 0.004, 0, 0, -size * 0.015);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // === BAT WINGS ===
  const wingFlap = Math.sin(time * 3) * 0.15;

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx0 + side * size * 0.12, y - size * 0.2 + floatBob);
    ctx.rotate(side * (0.3 + wingFlap));

    const wingSpan = size * 0.4;
    const wingH = size * 0.3;

    // Wing membrane
    const wingGrad = ctx.createLinearGradient(0, 0, side * wingSpan, 0);
    wingGrad.addColorStop(0, "rgba(30, 10, 50, 0.7)");
    wingGrad.addColorStop(0.5, "rgba(50, 20, 70, 0.5)");
    wingGrad.addColorStop(1, "rgba(40, 15, 60, 0.3)");
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(side * wingSpan * 0.3, -wingH * 0.3, side * wingSpan * 0.6, -wingH * 0.1);
    ctx.quadraticCurveTo(side * wingSpan * 0.9, wingH * 0.05, side * wingSpan, wingH * 0.2);
    ctx.quadraticCurveTo(side * wingSpan * 0.7, wingH * 0.4, side * wingSpan * 0.3, wingH * 0.35);
    ctx.lineTo(0, wingH * 0.15);
    ctx.closePath();
    ctx.fill();

    // Wing finger bones
    ctx.strokeStyle = "rgba(60, 30, 80, 0.6)";
    ctx.lineWidth = size * 0.006;
    for (let b = 0; b < 3; b++) {
      const bAngle = -0.3 + b * 0.25;
      const bLen = wingSpan * (0.7 + b * 0.1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(side * bLen * 0.4, Math.sin(bAngle) * wingH * 0.3, side * bLen * 0.8, wingH * (0.05 + b * 0.1));
      ctx.stroke();
    }

    // Veins on membrane
    ctx.strokeStyle = "rgba(80, 40, 100, 0.2)";
    ctx.lineWidth = 0.4 * zoom;
    for (let v = 0; v < 4; v++) {
      const vx1 = side * wingSpan * (0.1 + v * 0.15);
      const vy1 = -wingH * 0.1 + v * wingH * 0.1;
      ctx.beginPath();
      ctx.moveTo(vx1, vy1);
      ctx.lineTo(vx1 + side * size * 0.05, vy1 + size * 0.04);
      ctx.stroke();
    }

    // Wing edge glow when attacking
    if (isAttacking) {
      ctx.strokeStyle = `rgba(140, 60, 200, ${0.2 + Math.sin(time * 5) * 0.1})`;
      ctx.lineWidth = size * 0.008;
      ctx.beginPath();
      ctx.moveTo(side * wingSpan * 0.6, -wingH * 0.1);
      ctx.quadraticCurveTo(side * wingSpan * 0.9, wingH * 0.05, side * wingSpan, wingH * 0.2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // === ETHEREAL ROBES (no legs) ===
  const torsoY = y - size * 0.05 + floatBob;

  drawTatteredCloak(ctx, cx0, torsoY - size * 0.15 - floatBob, size, size * 0.3, size * 0.35, "#1a0a2a", "#0a0515", time);

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  const robeGrad = ctx.createLinearGradient(cx0 - size * 0.15, torsoY - size * 0.2, cx0 + size * 0.15, torsoY + size * 0.3);
  robeGrad.addColorStop(0, "#1a0a2a");
  robeGrad.addColorStop(0.4, "#2a1a3a");
  robeGrad.addColorStop(0.7, "#1a0a2a");
  robeGrad.addColorStop(1, "rgba(10, 5, 20, 0.5)");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY - size * 0.2);
  ctx.quadraticCurveTo(cx0 - size * 0.18, torsoY + size * 0.05, cx0 - size * 0.16, torsoY + size * 0.3);
  for (let i = 0; i <= 7; i++) {
    const bx = cx0 - size * 0.16 + i * size * 0.046;
    const by = torsoY + size * 0.3 + (i % 2) * size * 0.025 + Math.sin(time * 2.5 + i * 0.8) * size * 0.012;
    ctx.lineTo(bx, by);
  }
  ctx.quadraticCurveTo(cx0 + size * 0.18, torsoY + size * 0.05, cx0 + size * 0.1, torsoY - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Gold/silver trim
  ctx.strokeStyle = "rgba(140, 120, 80, 0.4)";
  ctx.lineWidth = size * 0.005;
  ctx.beginPath();
  ctx.moveTo(cx0, torsoY - size * 0.18);
  ctx.lineTo(cx0, torsoY + size * 0.25);
  ctx.stroke();

  // Shoulder clasps with void gems
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.ellipse(cx0 + side * size * 0.1, torsoY - size * 0.18, size * 0.02, size * 0.015, side * 0.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(120, 40, 180, ${0.5 + Math.sin(time * 3 + side) * 0.2})`;
    ctx.beginPath();
    ctx.arc(cx0 + side * size * 0.1, torsoY - size * 0.18, size * 0.008, 0, TAU);
    ctx.fill();
  }

  ctx.restore();

  drawShoulderOverlay(ctx, cx0 - size * 0.16, torsoY - size * 0.13 - floatBob, size, -1, "#c8b8a0", "#a89880", 'plate');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, torsoY - size * 0.13 - floatBob, size, 1, "#c8b8a0", "#a89880", 'plate');
  drawGorget(ctx, cx0, torsoY - size * 0.18 - floatBob, size, size * 0.2, "#c8b8a0", "#a89880");

  // Trailing robe tendrils
  for (let t = 0; t < 4; t++) {
    const angle = Math.PI / 2 + (t - 1.5) * 0.3;
    drawAnimatedTendril(ctx, cx0 + (t - 1.5) * size * 0.07, y + size * 0.25 + floatBob, angle, size, time, zoom, {
      length: 0.2, width: 0.012, segments: 6, waveSpeed: 2.5, waveAmt: 0.03,
      color: "rgba(30, 10, 50, 0.4)", tipColor: "rgba(60, 20, 80, 0.15)",
    });
  }

  // === STAFF OF DOOM ARM (right) ===
  drawPathArm(ctx, cx0 + size * 0.14, torsoY - size * 0.08 + floatBob, size, time, zoom, 1, {
    color: "#c8b8a0", colorDark: "#a89880", handColor: "#a89880",
    upperLen: 0.24, foreLen: 0.2,
    shoulderAngle: 0.15,
    elbowBend: 0.5,
    elbowAngle: 0.2,
    style: 'bone',
    onWeapon: (ctx) => {
      ctx.fillStyle = "#2a1a3a";
      ctx.fillRect(-size * 0.013, size * 0.02, size * 0.026, size * 0.35);

      const doomOrbY = size * 0.01;
      const doomPulse = 0.5 + Math.sin(time * 3) * 0.3;
      const doomGrad = ctx.createRadialGradient(0, doomOrbY, 0, 0, doomOrbY, size * 0.065);
      doomGrad.addColorStop(0, `rgba(180, 80, 255, ${doomPulse})`);
      doomGrad.addColorStop(0.4, "#6030a0");
      doomGrad.addColorStop(1, "#200a40");
      ctx.fillStyle = doomGrad;
      ctx.beginPath();
      ctx.arc(0, doomOrbY, size * 0.065, 0, TAU);
      ctx.fill();

      ctx.fillStyle = `rgba(140, 60, 220, ${doomPulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(0, doomOrbY, size * 0.09, 0, TAU);
      ctx.fill();

      if (isAttacking) {
        drawEnergyArc(ctx, 0, doomOrbY, size * 0.1, doomOrbY - size * 0.1, time, zoom, {
          color: "rgba(180, 80, 255, 0.6)", segments: 4, amplitude: 6, width: 1.5,
        });
        drawEnergyArc(ctx, 0, doomOrbY, -size * 0.08, doomOrbY + size * 0.08, time, zoom, {
          color: "rgba(140, 60, 200, 0.5)", segments: 3, amplitude: 5, width: 1,
        });
      }
    },
  });

  // === LEFT ARM ===
  drawPathArm(ctx, cx0 - size * 0.13, torsoY - size * 0.08 + floatBob, size, time, zoom, -1, {
    color: "#c8b8a0", colorDark: "#a89880", handColor: "#a89880",
    swingSpeed: 2, swingAmt: 0.2, baseAngle: 0.4,
    attackExtra: isAttacking ? 0.5 : 0, elbowBend: 0.45,
    upperLen: 0.28, foreLen: 0.24,
    style: 'armored',
  });

  // Spectral chains on wrists
  for (const side of [-1, 1]) {
    const chainX = cx0 + side * size * 0.2;
    const chainY = torsoY + size * 0.05 + floatBob;
    ctx.strokeStyle = "rgba(120, 120, 140, 0.3)";
    ctx.lineWidth = size * 0.005;
    for (let link = 0; link < 3; link++) {
      ctx.beginPath();
      ctx.ellipse(chainX, chainY + link * size * 0.02, size * 0.008, size * 0.012, (link % 2) * Math.PI / 2, 0, TAU);
      ctx.stroke();
    }
  }

  // === HOODED SKELETAL HEAD ===
  const headX = cx0;
  const headY = y - size * 0.26 + floatBob;

  // Hood
  ctx.fillStyle = "#1a0a2a";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, headY + size * 0.06);
  ctx.quadraticCurveTo(headX - size * 0.13, headY - size * 0.08, headX, headY - size * 0.16);
  ctx.quadraticCurveTo(headX + size * 0.13, headY - size * 0.08, headX + size * 0.1, headY + size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Skull
  ctx.fillStyle = "#c8b8a0";
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.065, size * 0.07, 0, 0, TAU);
  ctx.fill();

  // Eye sockets
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#0a0518";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.025, headY + size * 0.005, size * 0.02, size * 0.018, 0, 0, TAU);
    ctx.fill();
  }

  // Purple eye flames
  for (const side of [-1, 1]) {
    const ex = headX + side * size * 0.025;
    const eyePulse = 0.6 + Math.sin(time * 4 + side * 2) * 0.25;

    // Extended flame trail
    ctx.strokeStyle = `rgba(140, 60, 220, ${eyePulse * 0.4})`;
    ctx.lineWidth = size * 0.005;
    ctx.beginPath();
    ctx.moveTo(ex, headY + size * 0.005);
    ctx.quadraticCurveTo(ex + side * size * 0.015, headY - size * 0.03, ex + side * size * 0.03, headY - size * 0.07);
    ctx.stroke();

    // Eye glow
    const eyeGrad = ctx.createRadialGradient(ex, headY + size * 0.005, 0, ex, headY + size * 0.005, size * 0.03);
    eyeGrad.addColorStop(0, `rgba(200, 120, 255, ${eyePulse * 0.8})`);
    eyeGrad.addColorStop(1, "rgba(120, 40, 180, 0)");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(ex, headY + size * 0.005, size * 0.03, 0, TAU);
    ctx.fill();

    ctx.fillStyle = `rgba(230, 190, 255, ${eyePulse})`;
    ctx.beginPath();
    ctx.arc(ex, headY + size * 0.005, size * 0.007, 0, TAU);
    ctx.fill();
  }

  // Jaw
  ctx.fillStyle = "#a89880";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.04, headY + size * 0.035);
  ctx.quadraticCurveTo(headX, headY + size * 0.075, headX + size * 0.04, headY + size * 0.035);
  ctx.closePath();
  ctx.fill();

  // === VOID HALO ===
  const haloY = headY - size * 0.13;
  const haloR = size * 0.08;
  const haloPulse = 0.4 + Math.sin(time * 2) * 0.2;

  ctx.strokeStyle = `rgba(100, 40, 160, ${haloPulse})`;
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.ellipse(headX, haloY, haloR, haloR * 0.3, 0, 0, TAU);
  ctx.stroke();

  // Inner darker halo
  ctx.strokeStyle = `rgba(60, 20, 100, ${haloPulse * 0.6})`;
  ctx.lineWidth = size * 0.015;
  ctx.beginPath();
  ctx.ellipse(headX, haloY, haloR * 0.85, haloR * 0.25, 0, 0, TAU);
  ctx.stroke();

  // Orbiting void particles around halo
  for (let p = 0; p < 5; p++) {
    const pAngle = time * 1.5 + p * (TAU / 5);
    const px = headX + Math.cos(pAngle) * haloR * 1.1;
    const py = haloY + Math.sin(pAngle) * haloR * 0.35;
    ctx.fillStyle = `rgba(140, 60, 220, ${0.3 + Math.sin(time * 3 + p) * 0.15})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // === FALLING VOID PARTICLES ===
  for (let v = 0; v < 5; v++) {
    const seed = v * 1.89;
    const phase = (time * 0.4 + seed) % 1;
    const vx = cx0 + Math.sin(seed * 5 + time * 0.3) * size * 0.35;
    const vy = y - size * 0.4 + phase * size * 0.9;
    ctx.globalAlpha = (1 - phase) * 0.2 * (phase < 0.1 ? phase / 0.1 : 1);
    ctx.fillStyle = "#5a2080";
    ctx.beginPath();
    ctx.arc(vx, vy, size * 0.008 * (1 - phase * 0.3), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === OVERLAY EFFECTS ===
  drawShiftingSegments(ctx, cx0, y - size * 0.15 + floatBob, size, time, zoom, {
    count: 5, orbitRadius: 0.35, segmentSize: 0.025, orbitSpeed: 1.0, bobSpeed: 2, bobAmt: 0.03,
    color: "#3a1050", colorAlt: "#1a0530", shape: "shard", rotateWithOrbit: true,
  });

  drawPulsingGlowRings(ctx, cx0, y - size * 0.1, size * 0.5, time, zoom, {
    count: 3, speed: 0.8, color: "rgba(120, 50, 180, 0.4)", maxAlpha: 0.2, expansion: 1.8,
  });

  drawArcaneSparkles(ctx, cx0, y - size * 0.2, size * 0.55, time, zoom, {
    count: 6, speed: 1.2, color: "rgba(180, 100, 255, 0.7)", maxAlpha: 0.4,
  });

  drawShadowWisps(ctx, cx0, y - size * 0.1, size * 0.6, time, zoom, {
    count: 5, speed: 1.0, color: "rgba(80, 30, 100, 0.5)", maxAlpha: 0.25, wispLength: 0.45,
  });
}
