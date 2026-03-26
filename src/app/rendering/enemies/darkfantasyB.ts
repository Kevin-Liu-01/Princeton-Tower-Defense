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

  // Pauldrons (one gold, one corrupted) — angular layered plates
  for (const side of [-1, 1]) {
    const padX = cx0 + side * size * 0.18;
    const padY = torsoY - size * 0.15 - bodyBob;
    const padColor = side === -1 ? holyGold : corruptPurple;
    const padDark = side === -1 ? holyGoldDark : corruptDark;
    const padGrad = ctx.createLinearGradient(padX - side * size * 0.06, padY - size * 0.04, padX + side * size * 0.06, padY + size * 0.04);
    padGrad.addColorStop(0, padColor);
    padGrad.addColorStop(1, padDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.moveTo(padX - side * size * 0.04, padY - size * 0.035);
    ctx.lineTo(padX + side * size * 0.02, padY - size * 0.042);
    ctx.lineTo(padX + side * size * 0.06, padY - size * 0.015);
    ctx.quadraticCurveTo(padX + side * size * 0.062, padY + size * 0.015, padX + side * size * 0.045, padY + size * 0.035);
    ctx.lineTo(padX - side * size * 0.015, padY + size * 0.042);
    ctx.quadraticCurveTo(padX - side * size * 0.045, padY + size * 0.02, padX - side * size * 0.04, padY - size * 0.035);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = padDark;
    ctx.lineWidth = size * 0.004;
    ctx.stroke();
    // Crack on corrupted side
    if (side === 1) {
      ctx.strokeStyle = "rgba(180, 80, 200, 0.4)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(padX + size * 0.01, padY - size * 0.02);
      ctx.lineTo(padX + size * 0.03, padY + size * 0.01);
      ctx.stroke();
    }
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

      // Crossguard — ornate holy design, cracked
      ctx.fillStyle = holyGold;
      ctx.beginPath();
      ctx.moveTo(-size * 0.07, size * 0.08 + size * 0.012);
      ctx.quadraticCurveTo(-size * 0.075, size * 0.08, -size * 0.07, size * 0.08 - size * 0.004);
      ctx.lineTo(size * 0.07, size * 0.08 - size * 0.004);
      ctx.quadraticCurveTo(size * 0.075, size * 0.08, size * 0.07, size * 0.08 + size * 0.012);
      ctx.quadraticCurveTo(size * 0.035, size * 0.08 + size * 0.02, 0, size * 0.08 + size * 0.024);
      ctx.quadraticCurveTo(-size * 0.035, size * 0.08 + size * 0.02, -size * 0.07, size * 0.08 + size * 0.012);
      ctx.closePath();
      ctx.fill();

      // Grip — tapered
      ctx.fillStyle = "#5a4a30";
      ctx.beginPath();
      ctx.moveTo(-size * 0.015, 0);
      ctx.quadraticCurveTo(-size * 0.018, size * 0.04, -size * 0.015, size * 0.08);
      ctx.lineTo(size * 0.015, size * 0.08);
      ctx.quadraticCurveTo(size * 0.018, size * 0.04, size * 0.015, 0);
      ctx.closePath();
      ctx.fill();
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
    upperLen: 0.27, foreLen: 0.22,
    shoulderAngle: 0.35 + Math.sin(time * 4) * 0.06 + (isAttacking ? -Math.sin(attackPhase * Math.PI) * 0.3 : 0),
    elbowAngle: -0.25 + Math.sin(time * 3 + 1) * 0.06 + (isAttacking ? -0.2 : 0),
    style: 'armored',
  });

  // === GOLDEN HELM WITH CORRUPTION ===
  const helmX = cx0;
  const helmY = y - size * 0.3 - bodyBob;

  // Angular holy helm — faceted plate with corruption spreading
  const helmGrad = ctx.createLinearGradient(helmX - size * 0.1, helmY - size * 0.1, helmX + size * 0.1, helmY + size * 0.08);
  helmGrad.addColorStop(0, holyWhite);
  helmGrad.addColorStop(0.4, "#c8c0b0");
  helmGrad.addColorStop(0.7, "#a8a090");
  helmGrad.addColorStop(1, "#c8c0b0");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.07, helmY + size * 0.1);
  ctx.lineTo(helmX - size * 0.09, helmY + size * 0.03);
  ctx.quadraticCurveTo(helmX - size * 0.1, helmY - size * 0.04, helmX - size * 0.08, helmY - size * 0.09);
  ctx.quadraticCurveTo(helmX - size * 0.04, helmY - size * 0.12, helmX, helmY - size * 0.11);
  ctx.quadraticCurveTo(helmX + size * 0.04, helmY - size * 0.12, helmX + size * 0.08, helmY - size * 0.09);
  ctx.quadraticCurveTo(helmX + size * 0.1, helmY - size * 0.04, helmX + size * 0.09, helmY + size * 0.03);
  ctx.lineTo(helmX + size * 0.07, helmY + size * 0.1);
  ctx.quadraticCurveTo(helmX + size * 0.04, helmY + size * 0.12, helmX, helmY + size * 0.11);
  ctx.quadraticCurveTo(helmX - size * 0.04, helmY + size * 0.12, helmX - size * 0.07, helmY + size * 0.1);
  ctx.closePath();
  ctx.fill();

  // Helm center ridge
  ctx.strokeStyle = "#d8d0c0";
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.moveTo(helmX, helmY - size * 0.11);
  ctx.lineTo(helmX, helmY + size * 0.04);
  ctx.stroke();

  // Corruption spreading across right side
  ctx.strokeStyle = `rgba(100, 30, 120, ${corruptPulse * 0.5})`;
  ctx.lineWidth = 1.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(helmX + size * 0.03, helmY - size * 0.08);
  ctx.lineTo(helmX + size * 0.05, helmY - size * 0.03);
  ctx.lineTo(helmX + size * 0.06, helmY + size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(helmX + size * 0.05, helmY - size * 0.03);
  ctx.lineTo(helmX + size * 0.08, helmY - size * 0.01);
  ctx.stroke();
  // Corruption stain on right side
  ctx.fillStyle = `rgba(80, 20, 100, ${corruptPulse * 0.15})`;
  ctx.beginPath();
  ctx.moveTo(helmX + size * 0.04, helmY - size * 0.06);
  ctx.quadraticCurveTo(helmX + size * 0.09, helmY - size * 0.02, helmX + size * 0.07, helmY + size * 0.05);
  ctx.quadraticCurveTo(helmX + size * 0.04, helmY + size * 0.03, helmX + size * 0.04, helmY - size * 0.06);
  ctx.closePath();
  ctx.fill();

  // T-visor cut into helm face
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.065, helmY - size * 0.003);
  ctx.lineTo(helmX + size * 0.065, helmY - size * 0.003);
  ctx.lineTo(helmX + size * 0.06, helmY + size * 0.013);
  ctx.lineTo(helmX - size * 0.06, helmY + size * 0.013);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.012, helmY - size * 0.003);
  ctx.lineTo(helmX + size * 0.012, helmY - size * 0.003);
  ctx.lineTo(helmX + size * 0.01, helmY + size * 0.055);
  ctx.lineTo(helmX - size * 0.01, helmY + size * 0.055);
  ctx.closePath();
  ctx.fill();

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
  drawPathLegs(ctx, cx0, y + size * 0.03 + bodyBob, size, time, zoom, {
    legLen: 0.32, width: 0.12, strideSpeed: 3.5, strideAmt: 0.2,
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

  // Battle dents — irregular depressions
  ctx.fillStyle = steelDark;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.045, torsoY - size * 0.088);
  ctx.quadraticCurveTo(cx0 + size * 0.065, torsoY - size * 0.085, cx0 + size * 0.075, torsoY - size * 0.075);
  ctx.quadraticCurveTo(cx0 + size * 0.07, torsoY - size * 0.065, cx0 + size * 0.05, torsoY - size * 0.07);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.07, torsoY + size * 0.02);
  ctx.quadraticCurveTo(cx0 - size * 0.09, torsoY + size * 0.03, cx0 - size * 0.085, torsoY + size * 0.04);
  ctx.quadraticCurveTo(cx0 - size * 0.07, torsoY + size * 0.038, cx0 - size * 0.07, torsoY + size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();

  // Spiked pauldrons — heavy angular plates with spikes
  for (const side of [-1, 1]) {
    const padCX = cx0 + side * size * 0.2;
    const padCY = torsoY - size * 0.16 - bodyBob;
    const padGrad = ctx.createLinearGradient(padCX - side * size * 0.07, padCY - size * 0.05, padCX + side * size * 0.07, padCY + size * 0.05);
    padGrad.addColorStop(0, steelHighlight);
    padGrad.addColorStop(0.4, steelMid);
    padGrad.addColorStop(1, steelDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.moveTo(padCX - side * size * 0.05, padCY - size * 0.04);
    ctx.lineTo(padCX + side * size * 0.03, padCY - size * 0.05);
    ctx.lineTo(padCX + side * size * 0.07, padCY - size * 0.025);
    ctx.quadraticCurveTo(padCX + side * size * 0.075, padCY + size * 0.015, padCX + side * size * 0.06, padCY + size * 0.04);
    ctx.lineTo(padCX - side * size * 0.02, padCY + size * 0.05);
    ctx.quadraticCurveTo(padCX - side * size * 0.055, padCY + size * 0.03, padCX - side * size * 0.05, padCY - size * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = steelDark;
    ctx.lineWidth = size * 0.005;
    ctx.stroke();
    // Spike on outer edge
    ctx.fillStyle = steelMid;
    ctx.beginPath();
    ctx.moveTo(padCX + side * size * 0.055, padCY - size * 0.035);
    ctx.lineTo(padCX + side * size * 0.09, padCY - size * 0.065);
    ctx.lineTo(padCX + side * size * 0.065, padCY - size * 0.015);
    ctx.closePath();
    ctx.fill();
  }

  drawShoulderOverlay(ctx, cx0 - size * 0.16, torsoY - size * 0.13 - bodyBob, size, -1, steelMid, steelDark, 'plate');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, torsoY - size * 0.13 - bodyBob, size, 1, steelMid, steelDark, 'plate');
  drawGorget(ctx, cx0, torsoY - size * 0.18 - bodyBob, size, size * 0.2, steelMid, steelDark);
  drawArmorSkirt(ctx, cx0, torsoY + size * 0.08, size, size * 0.16, size * 0.12, steelDark, steelDark, 4);
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
  ctx.beginPath();
  ctx.moveTo(-shW * 0.35, -shH / 2);
  ctx.quadraticCurveTo(0, -shH * 0.55, shW * 0.35, -shH / 2);
  ctx.quadraticCurveTo(shW * 0.5, -shH * 0.3, shW / 2, 0);
  ctx.quadraticCurveTo(shW * 0.45, shH * 0.35, 0, shH / 2);
  ctx.quadraticCurveTo(-shW * 0.45, shH * 0.35, -shW / 2, 0);
  ctx.quadraticCurveTo(-shW * 0.5, -shH * 0.3, -shW * 0.35, -shH / 2);
  ctx.closePath();
  ctx.fill();

  // Shield rim
  ctx.strokeStyle = steelHighlight;
  ctx.lineWidth = size * 0.011;
  ctx.stroke();

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
      // Mace handle — reinforced with grip bands
      ctx.fillStyle = "#3a3530";
      ctx.beginPath();
      ctx.moveTo(-size * 0.013, size * 0.06);
      ctx.bezierCurveTo(-size * 0.016, size * 0.1, -size * 0.012, size * 0.15, -size * 0.014, size * 0.21);
      ctx.lineTo(size * 0.014, size * 0.21);
      ctx.bezierCurveTo(size * 0.012, size * 0.15, size * 0.016, size * 0.1, size * 0.013, size * 0.06);
      ctx.closePath();
      ctx.fill();
      // Grip bands
      ctx.strokeStyle = "#2a2520";
      ctx.lineWidth = 0.5 * zoom;
      for (let gb = 0; gb < 3; gb++) {
        const gy = size * 0.09 + gb * size * 0.04;
        ctx.beginPath();
        ctx.moveTo(-size * 0.014, gy);
        ctx.lineTo(size * 0.014, gy);
        ctx.stroke();
      }

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

  // Menacing great helm — flat-topped angular bucket with face plate
  const helmGrad = ctx.createLinearGradient(helmX - size * 0.1, helmY - size * 0.1, helmX + size * 0.1, helmY + size * 0.08);
  helmGrad.addColorStop(0, steelHighlight);
  helmGrad.addColorStop(0.3, steelMid);
  helmGrad.addColorStop(0.7, steelDark);
  helmGrad.addColorStop(1, steelMid);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.08, helmY + size * 0.1);
  ctx.lineTo(helmX - size * 0.095, helmY + size * 0.02);
  ctx.lineTo(helmX - size * 0.1, helmY - size * 0.05);
  ctx.lineTo(helmX - size * 0.08, helmY - size * 0.1);
  ctx.lineTo(helmX + size * 0.08, helmY - size * 0.1);
  ctx.lineTo(helmX + size * 0.1, helmY - size * 0.05);
  ctx.lineTo(helmX + size * 0.095, helmY + size * 0.02);
  ctx.lineTo(helmX + size * 0.08, helmY + size * 0.1);
  ctx.quadraticCurveTo(helmX + size * 0.04, helmY + size * 0.12, helmX, helmY + size * 0.115);
  ctx.quadraticCurveTo(helmX - size * 0.04, helmY + size * 0.12, helmX - size * 0.08, helmY + size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Flat top cap — separate plate
  ctx.fillStyle = steelMid;
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.08, helmY - size * 0.1);
  ctx.lineTo(helmX - size * 0.075, helmY - size * 0.115);
  ctx.lineTo(helmX + size * 0.075, helmY - size * 0.115);
  ctx.lineTo(helmX + size * 0.08, helmY - size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Helm plate seams
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(helmX, helmY - size * 0.115);
  ctx.lineTo(helmX, helmY + size * 0.04);
  ctx.stroke();

  // Narrow visor slit — cut into helm
  ctx.fillStyle = "#050508";
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.065, helmY + size * 0.002);
  ctx.lineTo(helmX + size * 0.065, helmY + size * 0.002);
  ctx.lineTo(helmX + size * 0.06, helmY + size * 0.014);
  ctx.lineTo(helmX - size * 0.06, helmY + size * 0.014);
  ctx.closePath();
  ctx.fill();

  // Breathing holes — angled slots on right side
  ctx.lineWidth = 0.5 * zoom;
  for (let h = 0; h < 4; h++) {
    ctx.fillStyle = "#050508";
    const hY = helmY + size * 0.03 + h * size * 0.013;
    ctx.beginPath();
    ctx.moveTo(helmX + size * 0.05, hY);
    ctx.lineTo(helmX + size * 0.07, hY - size * 0.003);
    ctx.lineTo(helmX + size * 0.07, hY + size * 0.003);
    ctx.lineTo(helmX + size * 0.05, hY + size * 0.005);
    ctx.closePath();
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
  const boneWhite = bodyColorLight;
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

  // === ICE CRYSTAL PARTICLE TRAIL ===
  for (let ic = 0; ic < 6; ic++) {
    const icSeed = ic * 1.47;
    const icPhase = (time * 0.6 + icSeed) % 1;
    const icAngle = icSeed * 3.7 + time * 0.4;
    const icDist = size * (0.15 + icPhase * 0.25);
    const icX = cx0 + Math.cos(icAngle) * icDist;
    const icY = y - size * 0.1 + Math.sin(icAngle * 0.7) * icDist * 0.5 - icPhase * size * 0.1;
    const icAlpha = (1 - icPhase) * 0.5 * (icPhase < 0.1 ? icPhase * 10 : 1);
    const icRot = time * 2 + icSeed;
    const icSize = size * 0.012 * (1 - icPhase * 0.3);
    ctx.save();
    ctx.globalAlpha = icAlpha;
    ctx.translate(icX, icY);
    ctx.rotate(icRot);
    ctx.strokeStyle = "rgba(160, 220, 255, 0.8)";
    ctx.lineWidth = 0.5 * zoom;
    for (let spoke = 0; spoke < 6; spoke++) {
      const sAngle = spoke * (TAU / 6);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sAngle) * icSize, Math.sin(sAngle) * icSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(Math.cos(sAngle) * icSize * 0.5, Math.sin(sAngle) * icSize * 0.5);
      ctx.lineTo(Math.cos(sAngle + 0.3) * icSize * 0.7, Math.sin(sAngle + 0.3) * icSize * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;

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

  // === ARCANE KNOWLEDGE CIRCLES ===
  for (let ring = 0; ring < 2; ring++) {
    const ringR = size * (0.5 + ring * 0.15);
    const ringSpeed = (ring === 0 ? 0.7 : -0.5);
    const nodeCount = ring === 0 ? 6 : 8;
    ctx.save();
    ctx.translate(cx0, y + size * 0.2);
    ctx.rotate(time * ringSpeed);
    ctx.strokeStyle = `rgba(80, 180, 240, ${0.12 + ring * 0.04 + Math.sin(time * 2 + ring) * 0.04})`;
    ctx.lineWidth = (0.6 + ring * 0.3) * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, ringR, ringR * 0.35, 0, 0, TAU);
    ctx.stroke();
    for (let n = 0; n < nodeCount; n++) {
      const nAngle = n * (TAU / nodeCount);
      const nx = Math.cos(nAngle) * ringR;
      const ny = Math.sin(nAngle) * ringR * 0.35;
      const nodeGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, size * 0.012);
      nodeGrad.addColorStop(0, `rgba(140, 220, 255, ${0.6 + Math.sin(time * 3 + n) * 0.2})`);
      nodeGrad.addColorStop(1, "rgba(80, 160, 240, 0)");
      ctx.fillStyle = nodeGrad;
      ctx.beginPath();
      ctx.arc(nx, ny, size * 0.012, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

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

  // Spectral robe shimmer overlay
  const shimmerPhase = time * 1.5;
  for (let sh = 0; sh < 3; sh++) {
    const shY = torsoY - size * 0.1 + sh * size * 0.1;
    const shAlpha = 0.06 + Math.sin(shimmerPhase + sh * 1.2) * 0.04;
    const shimGrad = ctx.createLinearGradient(cx0 - size * 0.18, shY, cx0 + size * 0.18, shY);
    shimGrad.addColorStop(0, `rgba(100, 180, 255, 0)`);
    shimGrad.addColorStop(0.3 + Math.sin(shimmerPhase + sh) * 0.15, `rgba(120, 200, 255, ${shAlpha})`);
    shimGrad.addColorStop(0.7 - Math.sin(shimmerPhase + sh) * 0.15, `rgba(100, 180, 255, ${shAlpha * 0.5})`);
    shimGrad.addColorStop(1, `rgba(80, 160, 240, 0)`);
    ctx.fillStyle = shimGrad;
    ctx.fillRect(cx0 - size * 0.18, shY - size * 0.04, size * 0.36, size * 0.08);
  }

  // Floating tattered robe edges
  for (let te = 0; te < 5; te++) {
    const teX = cx0 - size * 0.18 + te * size * 0.09;
    const teY = torsoY + size * 0.3 + Math.sin(time * 2.5 + te * 1.1) * size * 0.015;
    const teLen = size * 0.04 + Math.sin(time * 1.8 + te * 0.9) * size * 0.01;
    ctx.strokeStyle = `rgba(30, 30, 70, ${0.25 + Math.sin(time * 3 + te) * 0.1})`;
    ctx.lineWidth = size * 0.004;
    ctx.beginPath();
    ctx.moveTo(teX, teY);
    ctx.quadraticCurveTo(teX + Math.sin(time * 2 + te) * size * 0.01, teY + teLen * 0.5, teX + Math.sin(time * 3 + te) * size * 0.015, teY + teLen);
    ctx.stroke();
  }

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

  // === CASTING ARM (left) — thrust forward in arcane pose ===
  drawPathArm(ctx, cx0 - size * 0.14, torsoY - size * 0.08, size, time, zoom, -1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.26, foreLen: 0.22,
    shoulderAngle: -0.4 + Math.sin(time * 3) * 0.08 + (isAttacking ? -0.3 : 0),
    elbowAngle: 0.3 + (isAttacking ? -0.2 : Math.sin(time * 4) * 0.08),
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
    shoulderAngle: 0.15 + Math.sin(time * 1.5) * 0.06 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.4 : 0),
    elbowBend: 0.55,
    elbowAngle: 0.2 + Math.sin(time * 2) * 0.05 + (isAttacking ? -0.3 : 0),
    style: 'bone',
    onWeapon: (ctx) => {
      // Gnarled wooden staff shaft with twisting grain
      const staffTop = size * 0.03;
      const staffBot = size * 0.38;
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.moveTo(-size * 0.01, staffTop);
      ctx.bezierCurveTo(-size * 0.015, staffTop + (staffBot - staffTop) * 0.25, -size * 0.008, staffTop + (staffBot - staffTop) * 0.5, -size * 0.013, staffBot);
      ctx.lineTo(size * 0.013, staffBot);
      ctx.bezierCurveTo(size * 0.008, staffTop + (staffBot - staffTop) * 0.5, size * 0.015, staffTop + (staffBot - staffTop) * 0.25, size * 0.01, staffTop);
      ctx.closePath();
      ctx.fill();
      // Wood grain lines
      ctx.strokeStyle = "#2a1a0a";
      ctx.lineWidth = 0.4 * zoom;
      for (let g = 0; g < 3; g++) {
        const gy = staffTop + (staffBot - staffTop) * (0.2 + g * 0.25);
        ctx.beginPath();
        ctx.moveTo(-size * 0.01, gy);
        ctx.quadraticCurveTo(size * 0.005, gy + size * 0.01, size * 0.01, gy - size * 0.005);
        ctx.stroke();
      }
      // Prong cradle holding the orb
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = size * 0.008;
      for (const ps of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(ps * size * 0.005, staffTop + size * 0.01);
        ctx.quadraticCurveTo(ps * size * 0.03, staffTop - size * 0.02, ps * size * 0.015, staffTop - size * 0.035);
        ctx.stroke();
      }

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

      // Energy surge tendrils from staff orb
      for (let et = 0; et < 4; et++) {
        const etAngle = time * 3 + et * (TAU / 4);
        const etLen = size * (0.06 + Math.sin(time * 5 + et * 1.5) * 0.02);
        const etMidX = Math.cos(etAngle + Math.sin(time * 4 + et) * 0.3) * etLen * 0.5;
        const etMidY = orbY + Math.sin(etAngle + Math.sin(time * 4 + et) * 0.3) * etLen * 0.5;
        const etEndX = Math.cos(etAngle) * etLen;
        const etEndY = orbY + Math.sin(etAngle) * etLen;
        ctx.strokeStyle = `rgba(120, 200, 255, ${0.3 + Math.sin(time * 6 + et) * 0.15})`;
        ctx.lineWidth = (0.8 + Math.sin(time * 5 + et) * 0.4) * zoom;
        ctx.beginPath();
        ctx.moveTo(0, orbY);
        ctx.quadraticCurveTo(etMidX, etMidY, etEndX, etEndY);
        ctx.stroke();
      }
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

  // Book covers — leather-bound with rounded spine
  ctx.fillStyle = "#2a1a10";
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, -size * 0.04);
  ctx.lineTo(size * 0.03, -size * 0.04);
  ctx.quadraticCurveTo(size * 0.038, -size * 0.035, size * 0.038, -size * 0.025);
  ctx.lineTo(size * 0.038, size * 0.03);
  ctx.quadraticCurveTo(size * 0.038, size * 0.038, size * 0.03, size * 0.04);
  ctx.lineTo(-size * 0.035, size * 0.04);
  ctx.closePath();
  ctx.fill();
  // Spine
  ctx.fillStyle = "#1a0d08";
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, -size * 0.04);
  ctx.quadraticCurveTo(-size * 0.045, 0, -size * 0.035, size * 0.04);
  ctx.lineTo(-size * 0.03, size * 0.04);
  ctx.quadraticCurveTo(-size * 0.04, 0, -size * 0.03, -size * 0.04);
  ctx.closePath();
  ctx.fill();
  // Cover embossing — arcane border
  ctx.strokeStyle = "#5a3a18";
  ctx.lineWidth = 0.4 * zoom;
  ctx.strokeRect(-size * 0.025, -size * 0.032, size * 0.055, size * 0.064);

  // Pages — slightly fanned
  ctx.fillStyle = "#d8d0c0";
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, -size * 0.033);
  ctx.lineTo(size * 0.025, -size * 0.033);
  ctx.quadraticCurveTo(size * 0.032, -size * 0.028, size * 0.032, -size * 0.02);
  ctx.lineTo(size * 0.032, size * 0.028);
  ctx.quadraticCurveTo(size * 0.032, size * 0.033, size * 0.025, size * 0.033);
  ctx.lineTo(-size * 0.028, size * 0.033);
  ctx.closePath();
  ctx.fill();
  // Page edges
  ctx.strokeStyle = "#c0b8a8";
  ctx.lineWidth = 0.3 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.032, -size * 0.028);
  ctx.lineTo(size * 0.032, size * 0.028);
  ctx.stroke();

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

  // Skull — gaunt, aged, with prominent cheekbones
  const skullGrad = ctx.createLinearGradient(headX - size * 0.07, headY - size * 0.05, headX + size * 0.07, headY + size * 0.05);
  skullGrad.addColorStop(0, boneDark);
  skullGrad.addColorStop(0.4, boneMid);
  skullGrad.addColorStop(0.7, boneWhite);
  skullGrad.addColorStop(1, boneDark);
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.075);
  ctx.quadraticCurveTo(headX + size * 0.045, headY - size * 0.075, headX + size * 0.065, headY - size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.07, headY + size * 0.005, headX + size * 0.06, headY + size * 0.035);
  ctx.quadraticCurveTo(headX + size * 0.04, headY + size * 0.06, headX, headY + size * 0.055);
  ctx.quadraticCurveTo(headX - size * 0.04, headY + size * 0.06, headX - size * 0.06, headY + size * 0.035);
  ctx.quadraticCurveTo(headX - size * 0.07, headY + size * 0.005, headX - size * 0.065, headY - size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.045, headY - size * 0.075, headX, headY - size * 0.075);
  ctx.closePath();
  ctx.fill();
  // Suture lines
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.4 * zoom;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.075);
  ctx.lineTo(headX, headY - size * 0.03);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Eye sockets — deep angular cavities
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#0a0a20";
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.012, headY - size * 0.005);
    ctx.quadraticCurveTo(headX + side * size * 0.03, headY - size * 0.015, headX + side * size * 0.048, headY);
    ctx.quadraticCurveTo(headX + side * size * 0.05, headY + size * 0.015, headX + side * size * 0.038, headY + size * 0.022);
    ctx.quadraticCurveTo(headX + side * size * 0.025, headY + size * 0.025, headX + side * size * 0.015, headY + size * 0.018);
    ctx.quadraticCurveTo(headX + side * size * 0.01, headY + size * 0.008, headX + side * size * 0.012, headY - size * 0.005);
    ctx.closePath();
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

  // Phylactery outer glow
  const phylPulse = 0.5 + Math.sin(time * 3) * 0.3;
  const phylGlowOuter = ctx.createRadialGradient(phylX, phylY, 0, phylX, phylY, size * 0.06);
  phylGlowOuter.addColorStop(0, `rgba(80, 200, 255, ${phylPulse * 0.25})`);
  phylGlowOuter.addColorStop(0.5, `rgba(60, 180, 240, ${phylPulse * 0.1})`);
  phylGlowOuter.addColorStop(1, "rgba(40, 160, 220, 0)");
  ctx.fillStyle = phylGlowOuter;
  ctx.beginPath();
  ctx.arc(phylX, phylY, size * 0.06, 0, TAU);
  ctx.fill();

  // Phylactery crystal body
  ctx.fillStyle = "#2a4060";
  ctx.beginPath();
  ctx.moveTo(phylX, phylY - size * 0.02);
  ctx.lineTo(phylX + size * 0.012, phylY);
  ctx.lineTo(phylX, phylY + size * 0.02);
  ctx.lineTo(phylX - size * 0.012, phylY);
  ctx.closePath();
  ctx.fill();

  // Phylactery inner glow
  const phylGlowInner = ctx.createRadialGradient(phylX, phylY, 0, phylX, phylY, size * 0.015);
  phylGlowInner.addColorStop(0, `rgba(180, 240, 255, ${phylPulse * 0.9})`);
  phylGlowInner.addColorStop(0.5, `rgba(100, 200, 255, ${phylPulse * 0.5})`);
  phylGlowInner.addColorStop(1, "rgba(60, 160, 240, 0)");
  ctx.fillStyle = phylGlowInner;
  ctx.beginPath();
  ctx.arc(phylX, phylY, size * 0.015, 0, TAU);
  ctx.fill();

  // Phylactery sparkle motes
  for (let pm = 0; pm < 3; pm++) {
    const pmAngle = time * 2.5 + pm * (TAU / 3);
    const pmDist = size * 0.025;
    const pmX = phylX + Math.cos(pmAngle) * pmDist;
    const pmY = phylY + Math.sin(pmAngle) * pmDist;
    ctx.fillStyle = `rgba(160, 230, 255, ${0.3 + Math.sin(time * 4 + pm) * 0.2})`;
    ctx.beginPath();
    ctx.arc(pmX, pmY, size * 0.003, 0, TAU);
    ctx.fill();
  }

  // === SOUL HARVEST WISPS ===
  for (let sw = 0; sw < 5; sw++) {
    const swSeed = sw * 2.13;
    const swPhase = (time * 0.35 + swSeed) % 1;
    const swStartAngle = swSeed * 4.2;
    const swStartDist = size * 0.5;
    const swStartX = cx0 + Math.cos(swStartAngle) * swStartDist * (1 - swPhase);
    const swStartY = y - size * 0.1 + Math.sin(swStartAngle * 0.7) * swStartDist * 0.4 * (1 - swPhase);
    const swAlpha = swPhase < 0.1 ? swPhase * 10 : swPhase > 0.8 ? (1 - swPhase) * 5 : 1;
    const swSize = size * 0.008 * (1 - swPhase * 0.5);
    const swGrad = ctx.createRadialGradient(swStartX, swStartY, 0, swStartX, swStartY, swSize * 3);
    swGrad.addColorStop(0, `rgba(140, 220, 255, ${swAlpha * 0.5})`);
    swGrad.addColorStop(0.5, `rgba(80, 180, 240, ${swAlpha * 0.2})`);
    swGrad.addColorStop(1, "rgba(60, 160, 220, 0)");
    ctx.fillStyle = swGrad;
    ctx.beginPath();
    ctx.arc(swStartX, swStartY, swSize * 3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(200, 240, 255, ${swAlpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(swStartX, swStartY, swSize, 0, TAU);
    ctx.fill();
  }

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

  const bY = y - size * 0.1 + floatBob;
  const bodyGrad = ctx.createRadialGradient(cx0, bY, size * 0.03, cx0, bY, size * 0.18);
  bodyGrad.addColorStop(0, "rgba(120, 80, 180, 0.5)");
  bodyGrad.addColorStop(0.5, "rgba(80, 40, 140, 0.35)");
  bodyGrad.addColorStop(1, "rgba(40, 15, 80, 0.1)");
  ctx.fillStyle = bodyGrad;
  const waveA = Math.sin(time * 2.5) * size * 0.012;
  const waveB = Math.sin(time * 3.2) * size * 0.01;
  ctx.beginPath();
  ctx.moveTo(cx0, bY - size * 0.2);
  ctx.bezierCurveTo(cx0 + size * 0.08 + waveA, bY - size * 0.18, cx0 + size * 0.14, bY - size * 0.1, cx0 + size * 0.13 + waveB, bY - size * 0.02);
  ctx.bezierCurveTo(cx0 + size * 0.15, bY + size * 0.06, cx0 + size * 0.12 + waveA, bY + size * 0.14, cx0 + size * 0.06, bY + size * 0.2);
  ctx.bezierCurveTo(cx0 + size * 0.02, bY + size * 0.22, cx0 - size * 0.02, bY + size * 0.22, cx0 - size * 0.06, bY + size * 0.2);
  ctx.bezierCurveTo(cx0 - size * 0.12 - waveA, bY + size * 0.14, cx0 - size * 0.15, bY + size * 0.06, cx0 - size * 0.13 - waveB, bY - size * 0.02);
  ctx.bezierCurveTo(cx0 - size * 0.14, bY - size * 0.1, cx0 - size * 0.08 - waveA, bY - size * 0.18, cx0, bY - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Overlapping translucent wisp layers
  for (let wl = 0; wl < 3; wl++) {
    const wlPhase = time * 1.5 + wl * 1.2;
    const wlDx = Math.sin(wlPhase) * size * 0.02;
    const wlAlpha = 0.12 + Math.sin(wlPhase * 0.7) * 0.05;
    ctx.fillStyle = `rgba(100, 60, 160, ${wlAlpha})`;
    ctx.beginPath();
    ctx.moveTo(cx0 + wlDx, bY - size * 0.15);
    ctx.bezierCurveTo(cx0 + size * 0.1 + wlDx, bY - size * 0.08, cx0 + size * 0.08, bY + size * 0.08, cx0 + size * 0.03, bY + size * 0.18);
    ctx.bezierCurveTo(cx0, bY + size * 0.14, cx0 - size * 0.03, bY + size * 0.16, cx0 - size * 0.06, bY + size * 0.15);
    ctx.bezierCurveTo(cx0 - size * 0.1, bY + size * 0.06, cx0 - size * 0.12 - wlDx, bY - size * 0.06, cx0 + wlDx, bY - size * 0.15);
    ctx.closePath();
    ctx.fill();
  }

  // Void core
  const coreGrad = ctx.createRadialGradient(cx0, bY - size * 0.02, 0, cx0, bY - size * 0.02, size * 0.06);
  coreGrad.addColorStop(0, "rgba(20, 5, 40, 0.6)");
  coreGrad.addColorStop(1, "rgba(60, 20, 100, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx0, bY - size * 0.02, size * 0.06, 0, TAU);
  ctx.fill();

  ctx.restore();

  drawShoulderOverlay(ctx, cx0 - size * 0.16, y - size * 0.23 + floatBob, size, -1, "rgba(100, 60, 160, 0.4)", "rgba(60, 30, 100, 0.3)", 'tattered');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, y - size * 0.23 + floatBob, size, 1, "rgba(100, 60, 160, 0.4)", "rgba(60, 30, 100, 0.3)", 'tattered');

  // === SPECTRAL CLAWS ===
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawPathArm(ctx, cx0 + side * size * 0.12, y - size * 0.15 + floatBob, size, time, zoom, side, {
      color: "rgba(100, 60, 160, 0.4)", colorDark: "rgba(60, 30, 100, 0.3)",
      handColor: "rgba(140, 80, 200, 0.5)", handRadius: 0.052,
      upperLen: 0.27, foreLen: 0.24,
      shoulderAngle: side * 0.4 + Math.sin(time * 2 + side * Math.PI) * 0.12 + (isAttacking ? side * 0.3 : 0),
      elbowAngle: side * -0.3 + Math.sin(time * 3 + side) * 0.1,
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

  // Void face — gaunt spectral skull outline
  ctx.fillStyle = "rgba(10, 3, 20, 0.7)";
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.07);
  ctx.quadraticCurveTo(headX + size * 0.04, headY - size * 0.065, headX + size * 0.055, headY - size * 0.035);
  ctx.quadraticCurveTo(headX + size * 0.06, headY, headX + size * 0.05, headY + size * 0.025);
  ctx.quadraticCurveTo(headX + size * 0.045, headY + size * 0.05, headX + size * 0.025, headY + size * 0.065);
  ctx.quadraticCurveTo(headX, headY + size * 0.072, headX - size * 0.025, headY + size * 0.065);
  ctx.quadraticCurveTo(headX - size * 0.045, headY + size * 0.05, headX - size * 0.05, headY + size * 0.025);
  ctx.quadraticCurveTo(headX - size * 0.06, headY, headX - size * 0.055, headY - size * 0.035);
  ctx.quadraticCurveTo(headX - size * 0.04, headY - size * 0.065, headX, headY - size * 0.07);
  ctx.closePath();
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

  // === CASTING ARM (left) — arcane thrust ===
  drawPathArm(ctx, cx0 - size * 0.13, torsoY - size * 0.08, size, time, zoom, -1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.24, foreLen: 0.2,
    shoulderAngle: -0.4 + Math.sin(time * 4) * 0.08 + (isAttacking ? -0.3 : 0),
    elbowAngle: 0.3 + (isAttacking ? -0.2 : Math.sin(time * 5) * 0.08),
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
    shoulderAngle: 0.15 + Math.sin(time * 1.8) * 0.08 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.45 : 0),
    elbowBend: 0.5,
    elbowAngle: 0.2 + Math.sin(time * 2.5) * 0.06 + (isAttacking ? -0.35 : 0),
    style: 'bone',
    onWeapon: (ctx) => {
      // Bone staff shaft with notched segments
      const bsTop = size * 0.02;
      const bsBot = size * 0.32;
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.moveTo(-size * 0.009, bsTop);
      ctx.bezierCurveTo(-size * 0.013, bsTop + (bsBot - bsTop) * 0.3, -size * 0.006, bsTop + (bsBot - bsTop) * 0.5, -size * 0.011, bsBot);
      ctx.lineTo(size * 0.011, bsBot);
      ctx.bezierCurveTo(size * 0.006, bsTop + (bsBot - bsTop) * 0.5, size * 0.013, bsTop + (bsBot - bsTop) * 0.3, size * 0.009, bsTop);
      ctx.closePath();
      ctx.fill();
      // Bone joint notches
      ctx.strokeStyle = "#2a1a0a";
      ctx.lineWidth = 0.4 * zoom;
      for (let n = 0; n < 4; n++) {
        const ny = bsTop + (bsBot - bsTop) * (0.15 + n * 0.2);
        ctx.beginPath();
        ctx.moveTo(-size * 0.01, ny);
        ctx.lineTo(size * 0.01, ny);
        ctx.stroke();
      }

      // Skull topper on staff
      ctx.fillStyle = boneWhite;
      ctx.beginPath();
      ctx.moveTo(0, size * 0.015 - size * 0.03);
      ctx.quadraticCurveTo(size * 0.028, size * 0.015 - size * 0.02, size * 0.026, size * 0.015 + size * 0.01);
      ctx.quadraticCurveTo(size * 0.02, size * 0.015 + size * 0.03, 0, size * 0.015 + size * 0.025);
      ctx.quadraticCurveTo(-size * 0.02, size * 0.015 + size * 0.03, -size * 0.026, size * 0.015 + size * 0.01);
      ctx.quadraticCurveTo(-size * 0.028, size * 0.015 - size * 0.02, 0, size * 0.015 - size * 0.03);
      ctx.closePath();
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

  // Skull — narrow with ritual markings
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.07);
  ctx.quadraticCurveTo(headX + size * 0.04, headY - size * 0.07, headX + size * 0.06, headY - size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.065, headY + size * 0.005, headX + size * 0.055, headY + size * 0.035);
  ctx.quadraticCurveTo(headX + size * 0.035, headY + size * 0.06, headX, headY + size * 0.055);
  ctx.quadraticCurveTo(headX - size * 0.035, headY + size * 0.06, headX - size * 0.055, headY + size * 0.035);
  ctx.quadraticCurveTo(headX - size * 0.065, headY + size * 0.005, headX - size * 0.06, headY - size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.04, headY - size * 0.07, headX, headY - size * 0.07);
  ctx.closePath();
  ctx.fill();
  // Ritual rune markings etched on forehead
  ctx.strokeStyle = arcPurple;
  ctx.lineWidth = 0.5 * zoom;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.02, headY - size * 0.05);
  ctx.lineTo(headX, headY - size * 0.035);
  ctx.lineTo(headX + size * 0.02, headY - size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.035);
  ctx.lineTo(headX, headY - size * 0.015);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Eye sockets — angular
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#0a0518";
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.01, headY - size * 0.005);
    ctx.quadraticCurveTo(headX + side * size * 0.025, headY - size * 0.012, headX + side * size * 0.04, headY);
    ctx.quadraticCurveTo(headX + side * size * 0.042, headY + size * 0.015, headX + side * size * 0.032, headY + size * 0.02);
    ctx.quadraticCurveTo(headX + side * size * 0.02, headY + size * 0.022, headX + side * size * 0.012, headY + size * 0.015);
    ctx.quadraticCurveTo(headX + side * size * 0.008, headY + size * 0.005, headX + side * size * 0.01, headY - size * 0.005);
    ctx.closePath();
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

  // Book chained to belt — small leather-bound tome
  const bkX = cx0 + size * 0.06;
  const bkY = torsoY + size * 0.12;
  ctx.fillStyle = "#2a1a10";
  ctx.beginPath();
  ctx.moveTo(bkX, bkY);
  ctx.lineTo(bkX + size * 0.033, bkY);
  ctx.quadraticCurveTo(bkX + size * 0.038, bkY + size * 0.02, bkX + size * 0.033, bkY + size * 0.04);
  ctx.lineTo(bkX, bkY + size * 0.04);
  ctx.quadraticCurveTo(bkX - size * 0.005, bkY + size * 0.02, bkX, bkY);
  ctx.closePath();
  ctx.fill();
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
    shoulderAngle: 0.12 + Math.sin(time * 1.2) * 0.05 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.35 : 0),
    elbowBend: 0.6,
    elbowAngle: 0.15 + Math.sin(time * 1.8) * 0.04 + (isAttacking ? -0.25 : 0),
    style: 'bone',
    onWeapon: (ctx) => {
      // Gnarled ritual staff
      const rsTop = size * 0.02;
      const rsBot = size * 0.32;
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.moveTo(-size * 0.009, rsTop);
      ctx.bezierCurveTo(-size * 0.014, rsTop + (rsBot - rsTop) * 0.25, -size * 0.006, rsTop + (rsBot - rsTop) * 0.55, -size * 0.012, rsBot);
      ctx.lineTo(size * 0.012, rsBot);
      ctx.bezierCurveTo(size * 0.006, rsTop + (rsBot - rsTop) * 0.55, size * 0.014, rsTop + (rsBot - rsTop) * 0.25, size * 0.009, rsTop);
      ctx.closePath();
      ctx.fill();
      // Wood grain
      ctx.strokeStyle = "#2a1a0a";
      ctx.lineWidth = 0.3 * zoom;
      for (let wg = 0; wg < 3; wg++) {
        const wy = rsTop + (rsBot - rsTop) * (0.2 + wg * 0.25);
        ctx.beginPath();
        ctx.moveTo(-size * 0.009, wy);
        ctx.quadraticCurveTo(size * 0.003, wy + size * 0.008, size * 0.009, wy - size * 0.003);
        ctx.stroke();
      }

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

  // Pale skull face — gaunt, angular
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(headX, headY + size * 0.01 - size * 0.065);
  ctx.quadraticCurveTo(headX + size * 0.04, headY - size * 0.055, headX + size * 0.058, headY - size * 0.02);
  ctx.quadraticCurveTo(headX + size * 0.06, headY + size * 0.02, headX + size * 0.048, headY + size * 0.05);
  ctx.quadraticCurveTo(headX + size * 0.025, headY + size * 0.075, headX, headY + size * 0.07);
  ctx.quadraticCurveTo(headX - size * 0.025, headY + size * 0.075, headX - size * 0.048, headY + size * 0.05);
  ctx.quadraticCurveTo(headX - size * 0.06, headY + size * 0.02, headX - size * 0.058, headY - size * 0.02);
  ctx.quadraticCurveTo(headX - size * 0.04, headY - size * 0.055, headX, headY + size * 0.01 - size * 0.065);
  ctx.closePath();
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

  // === LEFT ARM — spectral reaching ===
  ctx.globalAlpha = flicker * 0.7;
  drawPathArm(ctx, cx0 - size * 0.15, torsoY - size * 0.08 - bodyBob, size, time, zoom, -1, {
    color: "rgba(150, 80, 40, 0.5)", colorDark: "rgba(100, 50, 25, 0.4)",
    handColor: "rgba(120, 60, 30, 0.5)",
    upperLen: 0.26, foreLen: 0.22,
    shoulderAngle: -0.3 + Math.sin(time * 5) * 0.08 + (isAttacking ? -0.25 : 0),
    elbowAngle: 0.3 + Math.sin(time * 4 + 1) * 0.08 + (isAttacking ? -0.2 : 0),
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

      // Spectral crossguard
      ctx.fillStyle = "rgba(180, 120, 60, 0.6)";
      ctx.beginPath();
      ctx.moveTo(-size * 0.06, size * 0.09);
      ctx.quadraticCurveTo(-size * 0.065, size * 0.085, -size * 0.06, size * 0.08);
      ctx.lineTo(size * 0.06, size * 0.08);
      ctx.quadraticCurveTo(size * 0.065, size * 0.085, size * 0.06, size * 0.09);
      ctx.quadraticCurveTo(size * 0.03, size * 0.095, 0, size * 0.1);
      ctx.quadraticCurveTo(-size * 0.03, size * 0.095, -size * 0.06, size * 0.09);
      ctx.closePath();
      ctx.fill();
    },
  });
  ctx.globalAlpha = 1;

  // === BURNING HEAD ===
  const headX = cx0;
  const headY = y - size * 0.26 - bodyBob;

  ctx.globalAlpha = flicker * 0.8;

  // Spectral helm — angular, semi-transparent with fragmented edges
  const helmGrad = ctx.createLinearGradient(headX - size * 0.08, headY - size * 0.08, headX + size * 0.08, headY + size * 0.06);
  helmGrad.addColorStop(0, "rgba(180, 100, 40, 0.6)");
  helmGrad.addColorStop(0.5, "rgba(150, 80, 30, 0.4)");
  helmGrad.addColorStop(1, "rgba(100, 50, 20, 0.3)");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headY + size * 0.085);
  ctx.lineTo(headX - size * 0.075, headY + size * 0.02);
  ctx.quadraticCurveTo(headX - size * 0.08, headY - size * 0.04, headX - size * 0.06, headY - size * 0.075);
  ctx.quadraticCurveTo(headX - size * 0.03, headY - size * 0.09, headX, headY - size * 0.085);
  ctx.quadraticCurveTo(headX + size * 0.03, headY - size * 0.09, headX + size * 0.06, headY - size * 0.075);
  ctx.quadraticCurveTo(headX + size * 0.08, headY - size * 0.04, headX + size * 0.075, headY + size * 0.02);
  ctx.lineTo(headX + size * 0.06, headY + size * 0.085);
  ctx.quadraticCurveTo(headX + size * 0.03, headY + size * 0.1, headX, headY + size * 0.09);
  ctx.quadraticCurveTo(headX - size * 0.03, headY + size * 0.1, headX - size * 0.06, headY + size * 0.085);
  ctx.closePath();
  ctx.fill();
  // Fragmented edge detail — broken pieces floating off
  ctx.strokeStyle = "rgba(180, 100, 40, 0.3)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.065, headY - size * 0.03);
  ctx.lineTo(headX + size * 0.08, headY - size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.07, headY + size * 0.05);
  ctx.lineTo(headX - size * 0.085, headY + size * 0.06);
  ctx.stroke();

  // Visor slit
  ctx.fillStyle = "rgba(10, 5, 0, 0.6)";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.055, headY - size * 0.003);
  ctx.lineTo(headX + size * 0.055, headY - size * 0.003);
  ctx.lineTo(headX + size * 0.05, headY + size * 0.011);
  ctx.lineTo(headX - size * 0.05, headY + size * 0.011);
  ctx.closePath();
  ctx.fill();

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

  // === GROUND TOXIC PUDDLE ===
  const puddlePulse = 0.5 + Math.sin(time * 1.5) * 0.15;
  const puddleR = size * (0.38 + Math.sin(time * 0.8) * 0.04);
  const toxPudGrad = ctx.createRadialGradient(cx0, y + size * 0.52, 0, cx0, y + size * 0.52, puddleR);
  toxPudGrad.addColorStop(0, `rgba(60, 140, 30, ${puddlePulse * 0.18})`);
  toxPudGrad.addColorStop(0.3, `rgba(50, 120, 25, ${puddlePulse * 0.12})`);
  toxPudGrad.addColorStop(0.6, `rgba(40, 100, 20, ${puddlePulse * 0.06})`);
  toxPudGrad.addColorStop(1, "rgba(30, 80, 15, 0)");
  ctx.fillStyle = toxPudGrad;
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.52, puddleR, puddleR * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();
  for (let pr = 0; pr < 2; pr++) {
    const prPhase = (time * 0.4 + pr * 0.5) % 1;
    const prR = size * 0.08 + prPhase * size * 0.25;
    ctx.strokeStyle = `rgba(80, 160, 40, ${(1 - prPhase) * 0.12})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.ellipse(cx0, y + size * 0.52, prR, prR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
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

  // === TOXIC FUME CLOUDS ===
  for (let tf = 0; tf < 5; tf++) {
    const tfSeed = tf * 1.73;
    const tfPhase = (time * 0.3 + tfSeed) % 1;
    const tfX = cx0 + Math.sin(tfSeed * 3.1 + time * 0.5) * size * 0.2;
    const tfY = y - size * 0.05 - tfPhase * size * 0.35;
    const tfAlpha = tfPhase < 0.1 ? tfPhase * 10 : (1 - tfPhase);
    const tfR = size * (0.02 + tfPhase * 0.03);
    const fumeGrad = ctx.createRadialGradient(tfX, tfY, 0, tfX, tfY, tfR);
    fumeGrad.addColorStop(0, `rgba(100, 160, 40, ${tfAlpha * 0.18})`);
    fumeGrad.addColorStop(0.5, `rgba(80, 140, 30, ${tfAlpha * 0.1})`);
    fumeGrad.addColorStop(1, "rgba(60, 120, 20, 0)");
    ctx.fillStyle = fumeGrad;
    ctx.beginPath();
    ctx.arc(tfX, tfY, tfR, 0, TAU);
    ctx.fill();
  }

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

  // Bloated misshapen body — asymmetric bezier bulges of stitched-together flesh
  const bodyGrad = ctx.createRadialGradient(cx0 - size * 0.02, torsoY + size * 0.02, size * 0.05, cx0, torsoY, size * 0.22);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.4, bodyColor);
  bodyGrad.addColorStop(0.8, bodyColorDark);
  bodyGrad.addColorStop(1, "#2a2018");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.12, torsoY - size * 0.2);
  ctx.quadraticCurveTo(cx0 - size * 0.2, torsoY - size * 0.12, cx0 - size * 0.2, torsoY - size * 0.02);
  ctx.quadraticCurveTo(cx0 - size * 0.21, torsoY + size * 0.08, cx0 - size * 0.17, torsoY + size * 0.16);
  ctx.quadraticCurveTo(cx0 - size * 0.1, torsoY + size * 0.22, cx0, torsoY + size * 0.21);
  ctx.quadraticCurveTo(cx0 + size * 0.1, torsoY + size * 0.23, cx0 + size * 0.17, torsoY + size * 0.17);
  ctx.quadraticCurveTo(cx0 + size * 0.22, torsoY + size * 0.1, cx0 + size * 0.2, torsoY);
  ctx.quadraticCurveTo(cx0 + size * 0.19, torsoY - size * 0.1, cx0 + size * 0.14, torsoY - size * 0.18);
  ctx.quadraticCurveTo(cx0 + size * 0.06, torsoY - size * 0.22, cx0 - size * 0.04, torsoY - size * 0.21);
  ctx.quadraticCurveTo(cx0 - size * 0.1, torsoY - size * 0.22, cx0 - size * 0.12, torsoY - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Mismatched flesh patches — different skin tones stitched together
  ctx.fillStyle = "rgba(140, 120, 100, 0.3)";
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.04, torsoY - size * 0.08);
  ctx.quadraticCurveTo(cx0 + size * 0.1, torsoY - size * 0.09, cx0 + size * 0.13, torsoY - size * 0.04);
  ctx.quadraticCurveTo(cx0 + size * 0.12, torsoY + size * 0.02, cx0 + size * 0.07, torsoY + size * 0.01);
  ctx.quadraticCurveTo(cx0 + size * 0.03, torsoY - size * 0.02, cx0 + size * 0.04, torsoY - size * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(100, 80, 70, 0.3)";
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.07, torsoY + size * 0.03);
  ctx.quadraticCurveTo(cx0 - size * 0.13, torsoY + size * 0.04, cx0 - size * 0.14, torsoY + size * 0.08);
  ctx.quadraticCurveTo(cx0 - size * 0.1, torsoY + size * 0.12, cx0 - size * 0.05, torsoY + size * 0.1);
  ctx.quadraticCurveTo(cx0 - size * 0.04, torsoY + size * 0.06, cx0 - size * 0.07, torsoY + size * 0.03);
  ctx.closePath();
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

    // Enhanced toxic stitching glow
    const stitchGlowPulse = 0.5 + Math.sin(time * 2.5 + sx * 3) * 0.3;
    ctx.lineWidth = size * 0.04;
    ctx.strokeStyle = `rgba(80, 200, 40, ${stitchGlowPulse * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(cx0 + sx * size, torsoY + sy * size);
    ctx.lineTo(cx0 + ex * size, torsoY + ey * size);
    ctx.stroke();
    ctx.lineWidth = size * 0.02;
    ctx.strokeStyle = `rgba(120, 220, 60, ${stitchGlowPulse * 0.18})`;
    ctx.beginPath();
    ctx.moveTo(cx0 + sx * size, torsoY + sy * size);
    ctx.lineTo(cx0 + ex * size, torsoY + ey * size);
    ctx.stroke();
    ctx.lineWidth = size * 0.008;
    ctx.strokeStyle = `rgba(180, 255, 100, ${stitchGlowPulse * 0.25})`;
    ctx.beginPath();
    ctx.moveTo(cx0 + sx * size, torsoY + sy * size);
    ctx.lineTo(cx0 + ex * size, torsoY + ey * size);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // Metal plates and hooks — bolted armor fragment
  ctx.fillStyle = "#5a5a60";
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.08, torsoY - size * 0.055);
  ctx.lineTo(cx0 + size * 0.135, torsoY - size * 0.06);
  ctx.lineTo(cx0 + size * 0.14, torsoY + size * 0.015);
  ctx.lineTo(cx0 + size * 0.085, torsoY + size * 0.02);
  ctx.closePath();
  ctx.fill();
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

  // === MUTATION BULGES ===
  const bulgePositions = [
    { bx: 0.12, by: -0.03, br: 0.035, speed: 2.0 },
    { bx: -0.08, by: 0.08, br: 0.025, speed: 2.5 },
    { bx: 0.05, by: -0.12, br: 0.02, speed: 1.8 },
    { bx: -0.14, by: 0.02, br: 0.03, speed: 2.2 },
  ];
  for (const bulge of bulgePositions) {
    const bPulse = 0.5 + Math.sin(time * bulge.speed + bulge.bx * 10) * 0.3;
    const bR = size * bulge.br * (1 + bPulse * 0.15);
    const bGrad = ctx.createRadialGradient(
      cx0 + bulge.bx * size, torsoY + bulge.by * size, 0,
      cx0 + bulge.bx * size, torsoY + bulge.by * size, bR,
    );
    bGrad.addColorStop(0, `rgba(140, 120, 80, ${bPulse * 0.2})`);
    bGrad.addColorStop(0.5, `rgba(120, 100, 60, ${bPulse * 0.12})`);
    bGrad.addColorStop(1, "rgba(100, 80, 50, 0)");
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(cx0 + bulge.bx * size, torsoY + bulge.by * size, bR, 0, TAU);
    ctx.fill();
    const hlGrad = ctx.createRadialGradient(
      cx0 + bulge.bx * size - bR * 0.3, torsoY + bulge.by * size - bR * 0.3, 0,
      cx0 + bulge.bx * size, torsoY + bulge.by * size, bR * 0.6,
    );
    hlGrad.addColorStop(0, `rgba(180, 160, 120, ${bPulse * 0.15})`);
    hlGrad.addColorStop(1, "rgba(160, 140, 100, 0)");
    ctx.fillStyle = hlGrad;
    ctx.beginPath();
    ctx.arc(cx0 + bulge.bx * size, torsoY + bulge.by * size, bR * 0.6, 0, TAU);
    ctx.fill();
  }

  ctx.restore();

  drawShoulderOverlay(ctx, cx0 - size * 0.16, torsoY - size * 0.13 - bodyBob, size, -1, bodyColor, bodyColorDark, 'round');
  drawShoulderOverlay(ctx, cx0 + size * 0.16, torsoY - size * 0.13 - bodyBob, size, 1, bodyColor, bodyColorDark, 'round');
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.06, size, size * 0.12, "#5a5a60", "#3a3a40", "#8a8a90");

  // === FOUR ARMS ===
  // Upper large arms — aggressive reaching
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawPathArm(ctx, cx0 + side * size * 0.2, torsoY - size * 0.08 - bodyBob, size, time, zoom, side, {
      color: bodyColor, colorDark: bodyColorDark, handColor: bodyColorDark,
      upperLen: 0.34, foreLen: 0.31, width: 0.12, handRadius: 0.06,
      shoulderAngle: side * 0.35 + (isAttacking ? side * 0.35 : Math.sin(time * 2 + side) * 0.12),
      elbowAngle: side * -0.3 + (isAttacking ? side * -0.25 : Math.sin(time * 2.5 + side * 2) * 0.08),
      style: 'fleshy',
    });
  }

  // Lower smaller arms — grasping underneath
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawPathArm(ctx, cx0 + side * size * 0.15, torsoY + size * 0.02 - bodyBob, size, time, zoom, side, {
      color: bodyColorDark, colorDark: "#3a2a18", handColor: "#3a2a18",
      upperLen: 0.24, foreLen: 0.2, width: 0.12, handRadius: 0.052,
      shoulderAngle: side * 0.8 + Math.sin(time * 2.5 + side * 1.5) * 0.12,
      elbowAngle: 0.7 + Math.sin(time * 3 + side * Math.PI) * 0.08,
      style: 'fleshy',
    });
  }

  // === SMALL HEAD ===
  const headX = cx0 + size * 0.02;
  const headY = y - size * 0.22 - bodyBob;

  // Misshapen stitched-together head — lopsided, lumpy
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.01, headY - size * 0.065);
  ctx.quadraticCurveTo(headX + size * 0.04, headY - size * 0.07, headX + size * 0.06, headY - size * 0.035);
  ctx.quadraticCurveTo(headX + size * 0.07, headY + size * 0.01, headX + size * 0.06, headY + size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.03, headY + size * 0.07, headX, headY + size * 0.065);
  ctx.quadraticCurveTo(headX - size * 0.04, headY + size * 0.07, headX - size * 0.065, headY + size * 0.035);
  ctx.quadraticCurveTo(headX - size * 0.07, headY + size * 0.0, headX - size * 0.06, headY - size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.04, headY - size * 0.065, headX - size * 0.01, headY - size * 0.065);
  ctx.closePath();
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

  // Mismatched eyes with glow cluster
  const eyeClusterData = [
    { ex: -0.025, ey: 0.005, er: 0.012, pr: 0.005, color: "#cc2020", pupil: "#1a0000", glow: "rgba(200, 40, 40, VAR)", py: 0.007 },
    { ex: 0.028, ey: -0.005, er: 0.01, pr: 0.004, color: "#30aa30", pupil: "#001a00", glow: "rgba(50, 180, 50, VAR)", py: -0.003 },
    { ex: 0.005, ey: -0.015, er: 0.007, pr: 0.003, color: "#ccaa20", pupil: "#1a1a00", glow: "rgba(200, 180, 40, VAR)", py: -0.014 },
    { ex: -0.01, ey: 0.025, er: 0.006, pr: 0.0025, color: "#cc2020", pupil: "#1a0000", glow: "rgba(200, 40, 40, VAR)", py: 0.026 },
    { ex: 0.02, ey: 0.015, er: 0.005, pr: 0.002, color: "#30aa30", pupil: "#001a00", glow: "rgba(50, 180, 50, VAR)", py: 0.016 },
  ];
  for (let ei = 0; ei < eyeClusterData.length; ei++) {
    const eye = eyeClusterData[ei];
    const eyePulse = 0.5 + Math.sin(time * (2.5 + ei * 0.3) + ei * 1.2) * 0.3;
    const eyeGlowR = size * eye.er * 2.5;
    const eGrad = ctx.createRadialGradient(
      headX + eye.ex * size, headY + eye.ey * size, 0,
      headX + eye.ex * size, headY + eye.ey * size, eyeGlowR,
    );
    eGrad.addColorStop(0, eye.glow.replace("VAR", `${eyePulse * 0.3}`));
    eGrad.addColorStop(1, eye.glow.replace("VAR", "0"));
    ctx.fillStyle = eGrad;
    ctx.beginPath();
    ctx.arc(headX + eye.ex * size, headY + eye.ey * size, eyeGlowR, 0, TAU);
    ctx.fill();
    ctx.fillStyle = eye.color;
    ctx.beginPath();
    ctx.arc(headX + eye.ex * size, headY + eye.ey * size, size * eye.er, 0, TAU);
    ctx.fill();
    ctx.fillStyle = eye.pupil;
    ctx.beginPath();
    ctx.arc(headX + eye.ex * size, headY + eye.py * size, size * eye.pr, 0, TAU);
    ctx.fill();
  }

  // Slobber
  const droolPhase = (time * 0.5) % 1;
  ctx.strokeStyle = `rgba(160, 160, 120, ${0.25 + Math.sin(time * 3) * 0.1})`;
  ctx.lineWidth = size * 0.005;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.02, headY + size * 0.05);
  ctx.quadraticCurveTo(headX + size * 0.025, headY + size * 0.08 + droolPhase * size * 0.03, headX + size * 0.015, headY + size * 0.1 + droolPhase * size * 0.04);
  ctx.stroke();

  // === CHEMICAL OOZE DRIPS ===
  for (let od = 0; od < 4; od++) {
    const odSeed = od * 1.37;
    const odPhase = (time * 0.4 + odSeed) % 1;
    const odStartX = cx0 + (od - 1.5) * size * 0.08;
    const odX = odStartX + Math.sin(odPhase * 3 + odSeed) * size * 0.01;
    const odY = y + size * 0.15 + odPhase * size * 0.35;
    const odAlpha = odPhase < 0.1 ? odPhase * 10 : (1 - odPhase);
    const odR = size * (0.008 + Math.sin(odPhase * Math.PI) * 0.004);
    const odColor = od % 2 === 0 ? `rgba(80, 160, 40, ${odAlpha * 0.6})` : `rgba(120, 100, 40, ${odAlpha * 0.5})`;
    const odGlowGrad = ctx.createRadialGradient(odX, odY, 0, odX, odY, odR * 3);
    odGlowGrad.addColorStop(0, od % 2 === 0 ? `rgba(80, 180, 40, ${odAlpha * 0.2})` : `rgba(140, 120, 40, ${odAlpha * 0.15})`);
    odGlowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = odGlowGrad;
    ctx.beginPath();
    ctx.arc(odX, odY, odR * 3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = odColor;
    ctx.beginPath();
    ctx.arc(odX, odY, odR, 0, TAU);
    ctx.fill();
    ctx.fillStyle = od % 2 === 0 ? `rgba(160, 240, 80, ${odAlpha * 0.4})` : `rgba(200, 180, 80, ${odAlpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(odX - odR * 0.3, odY - odR * 0.3, odR * 0.4, 0, TAU);
    ctx.fill();
  }

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

    // Joint bulge — angular kneecap shape
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(-size * 0.035, legLen * 0.85 - size * 0.02);
    ctx.quadraticCurveTo(0, legLen * 0.85 - size * 0.03, size * 0.035, legLen * 0.85 - size * 0.02);
    ctx.quadraticCurveTo(size * 0.04, legLen * 0.85 + size * 0.01, size * 0.03, legLen * 0.85 + size * 0.025);
    ctx.quadraticCurveTo(0, legLen * 0.85 + size * 0.03, -size * 0.03, legLen * 0.85 + size * 0.025);
    ctx.quadraticCurveTo(-size * 0.04, legLen * 0.85 + size * 0.01, -size * 0.035, legLen * 0.85 - size * 0.02);
    ctx.closePath();
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

    // Paw — broad, muscular
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(-size * 0.025, legLen * 0.7 - size * 0.015);
    ctx.quadraticCurveTo(size * 0.01, legLen * 0.7 - size * 0.025, size * 0.045, legLen * 0.7 - size * 0.01);
    ctx.quadraticCurveTo(size * 0.055, legLen * 0.7 + size * 0.01, size * 0.04, legLen * 0.7 + size * 0.02);
    ctx.quadraticCurveTo(size * 0.01, legLen * 0.7 + size * 0.025, -size * 0.025, legLen * 0.7 + size * 0.015);
    ctx.quadraticCurveTo(-size * 0.035, legLen * 0.7, -size * 0.025, legLen * 0.7 - size * 0.015);
    ctx.closePath();
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

  // === MUSCULAR BODY — powerful canine torso with barrel chest
  const bCY = y - size * 0.03 - bodyBob;
  const bodyGrad = ctx.createRadialGradient(cx0, bCY, size * 0.05, cx0, bCY, size * 0.22);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.4, bodyColor);
  bodyGrad.addColorStop(0.8, bodyColorDark);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.18, bCY - size * 0.06);
  ctx.quadraticCurveTo(cx0 + size * 0.22, bCY - size * 0.02, cx0 + size * 0.2, bCY + size * 0.04);
  ctx.quadraticCurveTo(cx0 + size * 0.16, bCY + size * 0.1, cx0 + size * 0.08, bCY + size * 0.12);
  ctx.quadraticCurveTo(cx0, bCY + size * 0.13, cx0 - size * 0.08, bCY + size * 0.11);
  ctx.quadraticCurveTo(cx0 - size * 0.18, bCY + size * 0.08, cx0 - size * 0.22, bCY + size * 0.02);
  ctx.quadraticCurveTo(cx0 - size * 0.22, bCY - size * 0.04, cx0 - size * 0.18, bCY - size * 0.08);
  ctx.quadraticCurveTo(cx0 - size * 0.12, bCY - size * 0.12, cx0 - size * 0.04, bCY - size * 0.13);
  ctx.quadraticCurveTo(cx0 + size * 0.06, bCY - size * 0.13, cx0 + size * 0.14, bCY - size * 0.1);
  ctx.quadraticCurveTo(cx0 + size * 0.2, bCY - size * 0.08, cx0 + size * 0.18, bCY - size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Bony spinal ridges along back
  ctx.fillStyle = bodyColorDark;
  for (let sp = 0; sp < 6; sp++) {
    const spx = cx0 - size * 0.12 + sp * size * 0.05;
    const spy = bCY - size * 0.11 + Math.abs(sp - 2.5) * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(spx - size * 0.008, spy + size * 0.01);
    ctx.lineTo(spx, spy - size * 0.02);
    ctx.lineTo(spx + size * 0.008, spy + size * 0.01);
    ctx.closePath();
    ctx.fill();
  }

  // Magma cracks across body (hellfire beneath skin)
  setShadowBlur(ctx, 4 * zoom, "#ff6600");
  ctx.strokeStyle = `rgba(255, 120, 30, ${0.4 + Math.sin(time * 3) * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  for (let cr = 0; cr < 5; cr++) {
    const crx = cx0 - size * 0.12 + cr * size * 0.06;
    const cry = bCY;
    ctx.beginPath();
    ctx.moveTo(crx, cry - size * 0.04);
    ctx.quadraticCurveTo(crx + size * 0.02, cry, crx - size * 0.01, cry + size * 0.04);
    ctx.stroke();
  }
  clearShadow(ctx);

  // Muscle definition — bulging contour lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.7 * zoom;
  ctx.globalAlpha = 0.35;
  // Shoulder muscle
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.08, bCY - size * 0.09);
  ctx.quadraticCurveTo(cx0 + size * 0.14, bCY - size * 0.06, cx0 + size * 0.12, bCY - size * 0.02);
  ctx.stroke();
  // Rib area
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.04, bCY + size * 0.04);
  ctx.quadraticCurveTo(cx0 - size * 0.1, bCY + size * 0.02, cx0 - size * 0.14, bCY - size * 0.02);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Exposed rib cage with hellfire glowing through
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let r = 0; r < 4; r++) {
    const rx = cx0 - size * 0.03 + r * size * 0.04;
    const ribGlow = 0.15 + Math.sin(time * 4 + r * 1.2) * 0.08;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(rx, y - size * 0.02 - bodyBob, size * 0.055, -0.6, 0.8);
    ctx.stroke();
    ctx.globalAlpha = ribGlow;
    ctx.strokeStyle = "rgba(255,100,20,0.5)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(rx, y - size * 0.02 - bodyBob, size * 0.05, -0.4, 0.6);
    ctx.stroke();
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 0.8 * zoom;
  }
  ctx.globalAlpha = 1;

  // Spinal ridges (bony protrusions along back)
  for (let sp = 0; sp < 8; sp++) {
    const spx = cx0 - size * 0.12 + sp * size * 0.035;
    const spy = y - size * 0.12 - bodyBob;
    const spH = size * 0.02 + Math.sin(time * 6 + sp * 1.1) * size * 0.005;
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(spx - size * 0.006, spy + size * 0.01);
    ctx.lineTo(spx, spy - spH);
    ctx.lineTo(spx + size * 0.006, spy + size * 0.01);
    ctx.fill();
    // Ember glow at tips
    ctx.fillStyle = `rgba(255,140,40,${0.3 + Math.sin(time * 7 + sp) * 0.15})`;
    ctx.beginPath();
    ctx.arc(spx, spy - spH, size * 0.004, 0, TAU);
    ctx.fill();
  }

  // === FLAMING MANE (denser, more intense) ===
  for (let f = 0; f < 12; f++) {
    const fX = cx0 - size * 0.12 + f * size * 0.025;
    const fY = y - size * 0.11 - bodyBob;
    const flameH = size * 0.07 + Math.sin(time * 10 + f * 1.5) * size * 0.03;
    const flameW = size * 0.017 + Math.sin(time * 7 + f) * size * 0.006;

    // Outer flame
    ctx.fillStyle = `rgba(255, 80, 10, ${0.45 + Math.sin(time * 8 + f) * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(fX - flameW, fY);
    ctx.quadraticCurveTo(fX - flameW * 0.5, fY - flameH * 0.6, fX, fY - flameH);
    ctx.quadraticCurveTo(fX + flameW * 0.5, fY - flameH * 0.6, fX + flameW, fY);
    ctx.closePath();
    ctx.fill();

    // Core flame (white-hot)
    ctx.fillStyle = `rgba(255, 230, 100, ${0.35 + Math.sin(time * 9 + f * 2) * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(fX - flameW * 0.4, fY);
    ctx.quadraticCurveTo(fX, fY - flameH * 0.75, fX + flameW * 0.4, fY);
    ctx.closePath();
    ctx.fill();
  }

  // === BEAST HEAD (larger, more monstrous) ===
  const headX = cx0 + size * 0.22;
  const headY = y - size * 0.1 - bodyBob;

  // Broad canine skull — angular, wolfish with strong jaw line
  const headGrad = ctx.createRadialGradient(headX - size * 0.01, headY, size * 0.02, headX, headY, size * 0.11);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.5, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.08, headY - size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.06, headY - size * 0.075, headX, headY - size * 0.08);
  ctx.quadraticCurveTo(headX + size * 0.06, headY - size * 0.07, headX + size * 0.09, headY - size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.1, headY - size * 0.01, headX + size * 0.095, headY + size * 0.02);
  ctx.quadraticCurveTo(headX + size * 0.08, headY + size * 0.06, headX + size * 0.04, headY + size * 0.075);
  ctx.quadraticCurveTo(headX, headY + size * 0.08, headX - size * 0.04, headY + size * 0.07);
  ctx.quadraticCurveTo(headX - size * 0.08, headY + size * 0.05, headX - size * 0.1, headY + size * 0.02);
  ctx.quadraticCurveTo(headX - size * 0.1, headY - size * 0.01, headX - size * 0.08, headY - size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Heavy brow ridge (demonic)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headY - size * 0.04);
  ctx.quadraticCurveTo(headX, headY - size * 0.065, headX + size * 0.06, headY - size * 0.03);
  ctx.quadraticCurveTo(headX, headY - size * 0.045, headX - size * 0.06, headY - size * 0.04);
  ctx.fill();

  // Snout extension (broader)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.05, headY - size * 0.025);
  ctx.quadraticCurveTo(headX + size * 0.12, headY - size * 0.01, headX + size * 0.13, headY + size * 0.01);
  ctx.quadraticCurveTo(headX + size * 0.12, headY + size * 0.04, headX + size * 0.05, headY + size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Snarl wrinkles
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.globalAlpha = 0.3;
  for (let w = 0; w < 3; w++) {
    ctx.beginPath();
    ctx.moveTo(headX + size * 0.06 + w * size * 0.02, headY - size * 0.015);
    ctx.quadraticCurveTo(headX + size * 0.07 + w * size * 0.02, headY + size * 0.005, headX + size * 0.06 + w * size * 0.02, headY + size * 0.025);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Ears (pointed, bat-like)
  for (const side of [-1, 1]) {
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.02, headY + side * size * 0.055);
    ctx.lineTo(headX - size * 0.07, headY + side * size * 0.1);
    ctx.lineTo(headX + size * 0.01, headY + side * size * 0.05);
    ctx.closePath();
    ctx.fill();
    // Glow inside ears
    ctx.fillStyle = "rgba(255,80,20,0.15)";
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.02, headY + side * size * 0.06);
    ctx.lineTo(headX - size * 0.05, headY + side * size * 0.085);
    ctx.lineTo(headX + size * 0.005, headY + side * size * 0.055);
    ctx.closePath();
    ctx.fill();
  }

  // Open jaws (always snarling, wider)
  const jawOpen = isAttacking ? 0.5 : 0.2 + Math.sin(time * 3) * 0.06;

  // Jaw interior (hellfire glow)
  setShadowBlur(ctx, 5 * zoom, "#ff4400");
  ctx.fillStyle = `rgba(180, 40, 10, ${0.7 + jawOpen * 0.3})`;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.07, headY);
  ctx.quadraticCurveTo(headX + size * 0.11, headY - jawOpen * size * 0.12, headX + size * 0.13, headY - jawOpen * size * 0.06);
  ctx.lineTo(headX + size * 0.13, headY + size * 0.01 + jawOpen * size * 0.06);
  ctx.quadraticCurveTo(headX + size * 0.11, headY + size * 0.01 + jawOpen * size * 0.12, headX + size * 0.07, headY + size * 0.02);
  ctx.closePath();
  ctx.fill();
  // Inner hellfire glow
  ctx.fillStyle = `rgba(255, 150, 30, ${jawOpen * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.09, headY + size * 0.005, size * 0.02, size * 0.015 * jawOpen * 3, 0, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Upper jaw
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.09, headY - size * 0.01, size * 0.045, size * 0.022, -jawOpen * 0.5, 0, TAU);
  ctx.fill();

  // Lower jaw
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.09, headY + size * 0.025, size * 0.045, size * 0.022, jawOpen * 0.5, 0, TAU);
  ctx.fill();

  // Massive fangs (glowing tips)
  ctx.fillStyle = "#e0d8c0";
  const fangData: [number, number, number][] = [
    [0.1, -0.012, 0.025], [0.08, -0.01, 0.02], [0.12, -0.008, 0.018],
    [0.1, 0.025, 0.022], [0.08, 0.023, 0.017], [0.12, 0.022, 0.015],
  ];
  for (const [fx, fy, len] of fangData) {
    const isUpper = fy < 0;
    ctx.beginPath();
    ctx.moveTo(headX + fx * size - size * 0.005, headY + fy * size);
    ctx.lineTo(headX + fx * size, headY + fy * size + (isUpper ? 1 : -1) * len * size);
    ctx.lineTo(headX + fx * size + size * 0.005, headY + fy * size);
    ctx.closePath();
    ctx.fill();
  }

  // Burning eyes (more intense, with fire trails)
  for (const side of [-1, 1]) {
    const ex = headX + size * 0.02;
    const ey = headY + side * size * 0.028;
    const eyePulse = 0.7 + Math.sin(time * 5 + side) * 0.2;

    // Eye glow aura
    setShadowBlur(ctx, 8 * zoom, "#ff6600");
    const eyeGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, size * 0.028);
    eyeGrad.addColorStop(0, `rgba(255, 240, 100, ${eyePulse})`);
    eyeGrad.addColorStop(0.4, `rgba(255, 150, 30, ${eyePulse * 0.7})`);
    eyeGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, size * 0.028, 0, TAU);
    ctx.fill();

    // Eye core
    ctx.fillStyle = `rgba(255, 255, 200, ${eyePulse})`;
    ctx.beginPath();
    ctx.arc(ex, ey, size * 0.01, 0, TAU);
    ctx.fill();
    clearShadow(ctx);

    // Fire trail streaming from eyes
    ctx.strokeStyle = `rgba(255, 100, 20, ${eyePulse * 0.35})`;
    ctx.lineWidth = size * 0.006;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.quadraticCurveTo(
      ex - size * 0.03, ey + side * size * 0.015,
      ex - size * 0.06, ey + side * size * 0.01 - size * 0.03,
    );
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 180, 60, ${eyePulse * 0.2})`;
    ctx.lineWidth = size * 0.003;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.quadraticCurveTo(
      ex - size * 0.025, ey + side * size * 0.02,
      ex - size * 0.05, ey + side * size * 0.025 - size * 0.025,
    );
    ctx.stroke();
  }

  // Molten saliva dripping (persistent, not just when attacking)
  ctx.strokeStyle = `rgba(255, 120, 30, ${0.25 + jawOpen * 0.3})`;
  ctx.lineWidth = size * 0.005;
  for (let d = 0; d < 3; d++) {
    const dPhase = (time * 0.8 + d * 0.33) % 1;
    const dx = headX + size * (0.08 + d * 0.015);
    const dStartY = headY + size * 0.03;
    const dEndY = dStartY + dPhase * size * 0.06;
    ctx.globalAlpha = (1 - dPhase) * 0.5;
    ctx.beginPath();
    ctx.moveTo(dx, dStartY);
    ctx.lineTo(dx + Math.sin(time * 4 + d) * size * 0.005, dEndY);
    ctx.stroke();
    // Drip blob
    ctx.fillStyle = `rgba(255, 140, 40, ${(1 - dPhase) * 0.4})`;
    ctx.beginPath();
    ctx.arc(dx + Math.sin(time * 4 + d) * size * 0.005, dEndY, size * 0.004, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Nostril smoke (thicker)
  for (let n = 0; n < 3; n++) {
    const nPhase = (time * 0.6 + n * 0.33) % 1;
    ctx.globalAlpha = (1 - nPhase) * 0.18;
    ctx.fillStyle = "rgba(80, 60, 40, 0.3)";
    ctx.beginPath();
    ctx.arc(headX + size * 0.12, headY + (n - 1) * size * 0.012 - nPhase * size * 0.05, size * 0.01 * (1 + nPhase), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Heat shimmer above mane (more intense)
  for (let h = 0; h < 5; h++) {
    const hPhase = (time * 0.7 + h * 0.2) % 1;
    ctx.globalAlpha = (1 - hPhase) * 0.08;
    ctx.fillStyle = "rgba(255, 200, 100, 0.3)";
    ctx.beginPath();
    ctx.arc(cx0 - size * 0.08 + h * size * 0.04, y - size * 0.18 - bodyBob - hPhase * size * 0.18, size * 0.022 * (1 + hPhase), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === FLAME TRAIL ===
  for (let fl = 1; fl <= 5; fl++) {
    const flOffset = fl * size * 0.05;
    const flAlpha = 0.18 / fl;
    const flFlicker = Math.sin(time * 10 + fl * 2.3) * size * 0.008;
    const flR = size * (0.1 + fl * 0.015);
    const flGrad = ctx.createRadialGradient(
      cx0 - flOffset, y - size * 0.03 - bodyBob + flFlicker, 0,
      cx0 - flOffset, y - size * 0.03 - bodyBob + flFlicker, flR,
    );
    flGrad.addColorStop(0, `rgba(255, 200, 60, ${flAlpha})`);
    flGrad.addColorStop(0.4, `rgba(255, 120, 20, ${flAlpha * 0.6})`);
    flGrad.addColorStop(0.7, `rgba(200, 60, 10, ${flAlpha * 0.3})`);
    flGrad.addColorStop(1, "rgba(120, 30, 5, 0)");
    ctx.fillStyle = flGrad;
    ctx.beginPath();
    ctx.ellipse(cx0 - flOffset, y - size * 0.03 - bodyBob + flFlicker, flR * 0.8, flR * 0.5, 0, 0, TAU);
    ctx.fill();
  }

  // === BLAZING PAW PRINTS ===
  for (const leg of legData) {
    const pawImpact = Math.max(0, -Math.sin(gallopPhase + leg.phase - 0.3));
    if (pawImpact > 0.6) {
      const ppIntensity = (pawImpact - 0.6) * 2.5;
      const ppX = cx0 + leg.x * size;
      const ppY = y + size * 0.48;
      const ppR = size * 0.03 * ppIntensity;
      const ppGrad = ctx.createRadialGradient(ppX, ppY, 0, ppX, ppY, ppR);
      ppGrad.addColorStop(0, `rgba(255, 220, 80, ${ppIntensity * 0.5})`);
      ppGrad.addColorStop(0.4, `rgba(255, 140, 30, ${ppIntensity * 0.3})`);
      ppGrad.addColorStop(0.7, `rgba(200, 80, 10, ${ppIntensity * 0.12})`);
      ppGrad.addColorStop(1, "rgba(120, 40, 5, 0)");
      ctx.fillStyle = ppGrad;
      ctx.beginPath();
      ctx.arc(ppX, ppY, ppR, 0, TAU);
      ctx.fill();
    }
  }

  // === INFERNAL EYE BLAZE ===
  for (const side of [-1, 1]) {
    const iex = headX + size * 0.02;
    const iey = headY + side * size * 0.028;
    const iePulse = 0.7 + Math.sin(time * 6 + side * 1.5) * 0.25;
    const ieR = size * 0.05;
    const ieGrad = ctx.createRadialGradient(iex, iey, 0, iex, iey, ieR);
    ieGrad.addColorStop(0, `rgba(255, 255, 180, ${iePulse * 0.6})`);
    ieGrad.addColorStop(0.25, `rgba(255, 200, 60, ${iePulse * 0.4})`);
    ieGrad.addColorStop(0.5, `rgba(255, 120, 20, ${iePulse * 0.2})`);
    ieGrad.addColorStop(1, "rgba(200, 60, 0, 0)");
    ctx.fillStyle = ieGrad;
    ctx.beginPath();
    ctx.arc(iex, iey, ieR, 0, TAU);
    ctx.fill();
    for (let ew = 0; ew < 2; ew++) {
      const ewPhase = (time * 2 + ew * 0.5 + side) % 1;
      const ewX = iex + Math.sin(time * 3 + ew * 2 + side) * size * 0.008;
      const ewY = iey - ewPhase * size * 0.05;
      const ewAlpha = (1 - ewPhase) * iePulse * 0.4;
      ctx.fillStyle = `rgba(255, 180, 40, ${ewAlpha})`;
      ctx.beginPath();
      ctx.arc(ewX, ewY, size * 0.006 * (1 - ewPhase * 0.5), 0, TAU);
      ctx.fill();
    }
  }

  // === BODY FIRE AURA ===
  const auraPulse = 0.4 + Math.sin(time * 3.5) * 0.15;
  const auraR = size * 0.28;
  const auraGrad = ctx.createRadialGradient(cx0, y - size * 0.03 - bodyBob, size * 0.08, cx0, y - size * 0.03 - bodyBob, auraR);
  auraGrad.addColorStop(0, `rgba(255, 180, 50, ${auraPulse * 0.15})`);
  auraGrad.addColorStop(0.4, `rgba(255, 120, 20, ${auraPulse * 0.1})`);
  auraGrad.addColorStop(0.7, `rgba(200, 60, 10, ${auraPulse * 0.05})`);
  auraGrad.addColorStop(1, "rgba(150, 30, 5, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(cx0, y - size * 0.03 - bodyBob, auraR, auraR * 0.65, 0, 0, TAU);
  ctx.fill();

  // === EMBER PARTICLE SPRAY ===
  for (let em = 0; em < 6; em++) {
    const emSeed = em * 1.57;
    const emPhase = (time * 1.8 + emSeed) % 1;
    const emX = cx0 - emPhase * size * 0.3 + Math.sin(emSeed * 5 + time * 2) * size * 0.08;
    const emY = y - size * 0.05 + Math.cos(emSeed * 3.7 + time * 1.5) * size * 0.1 - emPhase * size * 0.08;
    const emAlpha = (1 - emPhase) * 0.6 * (emPhase < 0.1 ? emPhase * 10 : 1);
    const emR = size * 0.008 * (1 - emPhase * 0.5);
    const emGrad = ctx.createRadialGradient(emX, emY, 0, emX, emY, emR * 2);
    emGrad.addColorStop(0, `rgba(255, 240, 120, ${emAlpha})`);
    emGrad.addColorStop(0.5, `rgba(255, 160, 40, ${emAlpha * 0.5})`);
    emGrad.addColorStop(1, "rgba(200, 80, 10, 0)");
    ctx.fillStyle = emGrad;
    ctx.beginPath();
    ctx.arc(emX, emY, emR * 2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 200, ${emAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(emX, emY, emR * 0.6, 0, TAU);
    ctx.fill();
  }

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

  // === MULTI-LAYERED DOOM AURA ===
  for (let al = 0; al < 3; al++) {
    const auraR = size * (0.55 + al * 0.15);
    const auraPulse = 0.5 + Math.sin(time * (1.5 - al * 0.3) + al * 0.8) * 0.2;
    const auraGrad = ctx.createRadialGradient(cx0, y - size * 0.1, auraR * 0.3, cx0, y - size * 0.1, auraR);
    auraGrad.addColorStop(0, `rgba(60, 20, 100, ${auraPulse * 0.06})`);
    auraGrad.addColorStop(0.5, `rgba(40, 10, 80, ${auraPulse * 0.04})`);
    auraGrad.addColorStop(1, "rgba(20, 5, 60, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx0, y - size * 0.1, auraR, 0, TAU);
    ctx.fill();
  }

  // === GROUND DARKNESS SPREAD ===
  const darkSpreadR = size * (0.45 + Math.sin(time * 0.8) * 0.05);
  const darkGrad = ctx.createRadialGradient(cx0, y + size * 0.5, 0, cx0, y + size * 0.5, darkSpreadR);
  darkGrad.addColorStop(0, "rgba(20, 5, 40, 0.2)");
  darkGrad.addColorStop(0.4, "rgba(15, 3, 30, 0.12)");
  darkGrad.addColorStop(0.7, "rgba(10, 2, 20, 0.05)");
  darkGrad.addColorStop(1, "rgba(5, 1, 10, 0)");
  ctx.fillStyle = darkGrad;
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.5, darkSpreadR, darkSpreadR * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();
  for (let dt = 0; dt < 6; dt++) {
    const dtAngle = dt * (TAU / 6) + time * 0.3;
    const dtLen = size * (0.2 + Math.sin(time * 1.5 + dt * 1.1) * 0.06);
    const dtEndX = cx0 + Math.cos(dtAngle) * dtLen;
    const dtEndY = y + size * 0.5 + Math.sin(dtAngle) * dtLen * ISO_Y_RATIO;
    ctx.strokeStyle = `rgba(30, 10, 50, ${0.15 + Math.sin(time * 2 + dt) * 0.05})`;
    ctx.lineWidth = size * 0.006;
    ctx.beginPath();
    ctx.moveTo(cx0, y + size * 0.5);
    ctx.quadraticCurveTo(
      cx0 + Math.cos(dtAngle + 0.2) * dtLen * 0.5,
      y + size * 0.5 + Math.sin(dtAngle + 0.2) * dtLen * 0.5 * ISO_Y_RATIO,
      dtEndX, dtEndY,
    );
    ctx.stroke();
  }

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

    // Pulsing dark membrane glow
    const memPulse = 0.4 + Math.sin(time * 2.5 + side * 1.5) * 0.2;
    const memGrad = ctx.createRadialGradient(
      side * wingSpan * 0.4, wingH * 0.1, 0,
      side * wingSpan * 0.4, wingH * 0.1, wingSpan * 0.5,
    );
    memGrad.addColorStop(0, `rgba(100, 30, 160, ${memPulse * 0.12})`);
    memGrad.addColorStop(0.5, `rgba(60, 15, 100, ${memPulse * 0.06})`);
    memGrad.addColorStop(1, "rgba(30, 5, 60, 0)");
    ctx.fillStyle = memGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(side * wingSpan * 0.3, -wingH * 0.3, side * wingSpan * 0.6, -wingH * 0.1);
    ctx.quadraticCurveTo(side * wingSpan * 0.9, wingH * 0.05, side * wingSpan, wingH * 0.2);
    ctx.quadraticCurveTo(side * wingSpan * 0.7, wingH * 0.4, side * wingSpan * 0.3, wingH * 0.35);
    ctx.lineTo(0, wingH * 0.15);
    ctx.closePath();
    ctx.fill();

    // Crimson edge highlight
    const edgePulse = 0.3 + Math.sin(time * 3 + side) * 0.15;
    ctx.strokeStyle = `rgba(160, 40, 60, ${edgePulse})`;
    ctx.lineWidth = size * 0.004;
    ctx.beginPath();
    ctx.moveTo(side * wingSpan * 0.6, -wingH * 0.1);
    ctx.quadraticCurveTo(side * wingSpan * 0.9, wingH * 0.05, side * wingSpan, wingH * 0.2);
    ctx.stroke();

    // Trailing feather particles
    for (let fp = 0; fp < 3; fp++) {
      const fpSeed = fp * 1.8 + side * 3;
      const fpPhase = (time * 0.25 + fpSeed * 0.3) % 1;
      const fpX = side * wingSpan * (0.3 + fp * 0.2) + Math.sin(time + fpSeed) * size * 0.02;
      const fpY = wingH * (0.1 + fp * 0.08) + fpPhase * wingH * 0.4;
      const fpAlpha = (1 - fpPhase) * 0.25;
      ctx.globalAlpha = fpAlpha;
      ctx.fillStyle = "#2a0a40";
      ctx.beginPath();
      ctx.moveTo(fpX, fpY - size * 0.01);
      ctx.quadraticCurveTo(fpX + size * 0.005, fpY, fpX, fpY + size * 0.01);
      ctx.quadraticCurveTo(fpX - size * 0.003, fpY, fpX, fpY - size * 0.01);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

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

  // === FLOATING DOOM RUNES ===
  const runeSymbols = ["⬡", "◇", "△", "☆", "⬢"];
  for (let dr = 0; dr < 5; dr++) {
    const drAngle = time * 0.8 + dr * (TAU / 5);
    const drDist = size * (0.3 + Math.sin(time * 1.5 + dr * 1.3) * 0.04);
    const drX = cx0 + Math.cos(drAngle) * drDist;
    const drY = y - size * 0.1 + floatBob + Math.sin(drAngle) * drDist * 0.35;
    const drBob = Math.sin(time * 2 + dr * 0.8) * size * 0.01;
    const drAlpha = 0.3 + Math.sin(time * 2.5 + dr * 1.1) * 0.15;
    const drGlowGrad = ctx.createRadialGradient(drX, drY + drBob, 0, drX, drY + drBob, size * 0.025);
    drGlowGrad.addColorStop(0, `rgba(140, 60, 220, ${drAlpha * 0.4})`);
    drGlowGrad.addColorStop(1, "rgba(80, 30, 140, 0)");
    ctx.fillStyle = drGlowGrad;
    ctx.beginPath();
    ctx.arc(drX, drY + drBob, size * 0.025, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.translate(drX, drY + drBob);
    ctx.rotate(time * 1.5 + dr * 0.7);
    ctx.fillStyle = `rgba(180, 100, 255, ${drAlpha})`;
    ctx.font = `${size * 0.035}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(runeSymbols[dr], 0, 0);
    ctx.restore();
  }

  // === STAFF OF DOOM ARM (right) ===
  drawPathArm(ctx, cx0 + size * 0.14, torsoY - size * 0.08 + floatBob, size, time, zoom, 1, {
    color: "#c8b8a0", colorDark: "#a89880", handColor: "#a89880",
    upperLen: 0.24, foreLen: 0.2,
    shoulderAngle: 0.15 + Math.sin(time * 2) * 0.08 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.5 : 0),
    elbowBend: 0.5,
    elbowAngle: 0.2 + Math.sin(time * 2.5) * 0.06 + (isAttacking ? -0.35 : 0),
    style: 'bone',
    onWeapon: (ctx) => {
      // Dark staff — twisted with arcane notches
      const dsTop = size * 0.02;
      const dsBot = size * 0.37;
      ctx.fillStyle = "#2a1a3a";
      ctx.beginPath();
      ctx.moveTo(-size * 0.011, dsTop);
      ctx.bezierCurveTo(-size * 0.016, dsTop + (dsBot - dsTop) * 0.3, -size * 0.008, dsTop + (dsBot - dsTop) * 0.55, -size * 0.013, dsBot);
      ctx.lineTo(size * 0.013, dsBot);
      ctx.bezierCurveTo(size * 0.008, dsTop + (dsBot - dsTop) * 0.55, size * 0.016, dsTop + (dsBot - dsTop) * 0.3, size * 0.011, dsTop);
      ctx.closePath();
      ctx.fill();
      // Arcane rune notches
      ctx.strokeStyle = "rgba(120, 60, 200, 0.4)";
      ctx.lineWidth = 0.5 * zoom;
      for (let rn = 0; rn < 4; rn++) {
        const ry = dsTop + (dsBot - dsTop) * (0.15 + rn * 0.2);
        ctx.beginPath();
        ctx.moveTo(-size * 0.012, ry);
        ctx.lineTo(size * 0.012, ry + size * 0.005);
        ctx.stroke();
      }
      // Prong cradle
      ctx.strokeStyle = "#2a1a3a";
      ctx.lineWidth = size * 0.007;
      for (const ps of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(ps * size * 0.005, dsTop + size * 0.01);
        ctx.quadraticCurveTo(ps * size * 0.025, dsTop - size * 0.015, ps * size * 0.012, dsTop - size * 0.03);
        ctx.stroke();
      }

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
    upperLen: 0.28, foreLen: 0.24,
    shoulderAngle: -0.35 + Math.sin(time * 2) * 0.08 + (isAttacking ? -0.25 : 0),
    elbowAngle: 0.3 + Math.sin(time * 3) * 0.08,
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

  // === HERALD'S PROCLAMATION EFFECT ===
  for (let pw = 0; pw < 3; pw++) {
    const pwPhase = (time * 0.6 + pw * 0.33) % 1;
    const pwR = size * (0.1 + pwPhase * 0.3);
    const pwAlpha = (1 - pwPhase) * 0.15;
    ctx.strokeStyle = `rgba(120, 50, 180, ${pwAlpha})`;
    ctx.lineWidth = (1.5 - pwPhase) * zoom;
    ctx.beginPath();
    ctx.arc(cx0, y - size * 0.15 + floatBob, pwR, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();
    ctx.strokeStyle = `rgba(80, 30, 140, ${pwAlpha * 0.6})`;
    ctx.lineWidth = (1 - pwPhase * 0.5) * zoom;
    ctx.beginPath();
    ctx.arc(cx0, y - size * 0.15 + floatBob, pwR * 0.85, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();
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

  // Skull — angular, dark angel death mask
  ctx.fillStyle = "#c8b8a0";
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.07);
  ctx.quadraticCurveTo(headX + size * 0.04, headY - size * 0.07, headX + size * 0.06, headY - size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.065, headY + size * 0.005, headX + size * 0.055, headY + size * 0.035);
  ctx.quadraticCurveTo(headX + size * 0.035, headY + size * 0.06, headX, headY + size * 0.055);
  ctx.quadraticCurveTo(headX - size * 0.035, headY + size * 0.06, headX - size * 0.055, headY + size * 0.035);
  ctx.quadraticCurveTo(headX - size * 0.065, headY + size * 0.005, headX - size * 0.06, headY - size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.04, headY - size * 0.07, headX, headY - size * 0.07);
  ctx.closePath();
  ctx.fill();

  // Eye sockets — deep angular voids
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#0a0518";
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.01, headY - size * 0.005);
    ctx.quadraticCurveTo(headX + side * size * 0.025, headY - size * 0.013, headX + side * size * 0.042, headY);
    ctx.quadraticCurveTo(headX + side * size * 0.045, headY + size * 0.015, headX + side * size * 0.035, headY + size * 0.022);
    ctx.quadraticCurveTo(headX + side * size * 0.02, headY + size * 0.024, headX + side * size * 0.012, headY + size * 0.015);
    ctx.quadraticCurveTo(headX + side * size * 0.008, headY + size * 0.005, headX + side * size * 0.01, headY - size * 0.005);
    ctx.closePath();
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

  // === DARK INVERTED HALO ===
  const haloY = headY - size * 0.13;
  const haloR = size * 0.08;
  const haloPulse = 0.4 + Math.sin(time * 2) * 0.2;

  // Halo dark glow aura
  const haloGlowGrad = ctx.createRadialGradient(headX, haloY, haloR * 0.5, headX, haloY, haloR * 1.8);
  haloGlowGrad.addColorStop(0, `rgba(80, 30, 130, ${haloPulse * 0.12})`);
  haloGlowGrad.addColorStop(0.5, `rgba(50, 15, 90, ${haloPulse * 0.06})`);
  haloGlowGrad.addColorStop(1, "rgba(30, 5, 60, 0)");
  ctx.fillStyle = haloGlowGrad;
  ctx.beginPath();
  ctx.arc(headX, haloY, haloR * 1.8, 0, TAU);
  ctx.fill();

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

  // Inverted halo spikes (dark energy rising)
  for (let hs = 0; hs < 8; hs++) {
    const hsAngle = hs * (TAU / 8) + time * 0.5;
    const hsX = headX + Math.cos(hsAngle) * haloR * 0.9;
    const hsBaseY = haloY + Math.sin(hsAngle) * haloR * 0.28;
    const hsLen = size * (0.015 + Math.sin(time * 3 + hs * 1.2) * 0.005);
    ctx.strokeStyle = `rgba(100, 40, 160, ${haloPulse * 0.5})`;
    ctx.lineWidth = size * 0.003;
    ctx.beginPath();
    ctx.moveTo(hsX, hsBaseY);
    ctx.lineTo(hsX, hsBaseY - hsLen);
    ctx.stroke();
  }

  // Orbiting void particles around halo
  for (let p = 0; p < 5; p++) {
    const pAngle = time * 1.5 + p * (TAU / 5);
    const px = headX + Math.cos(pAngle) * haloR * 1.1;
    const py = haloY + Math.sin(pAngle) * haloR * 0.35;
    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, size * 0.012);
    pGrad.addColorStop(0, `rgba(180, 80, 255, ${0.4 + Math.sin(time * 3 + p) * 0.2})`);
    pGrad.addColorStop(1, "rgba(100, 40, 180, 0)");
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.012, 0, TAU);
    ctx.fill();
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
