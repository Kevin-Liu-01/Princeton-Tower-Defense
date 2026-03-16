// Princeton Tower Defense - Dark Fantasy Enemy Sprite Functions (Part B)
// Enemies 11-20: Fallen Paladin, Blackguard, Lich, Wraith, Bone Mage,
// Dark Priest, Revenant, Abomination, Hellhound, Doom Herald

import { drawRadialAura } from "./helpers";
import { setShadowBlur, clearShadow } from "../performance";
import {
  drawAnimatedArm,
  drawAnimatedLegs,
  drawGlowingEyes,
  drawShadowWisps,
  drawPoisonBubbles,
  drawOrbitingDebris,
  drawAnimatedTendril,
  drawFloatingPiece,
  drawPulsingGlowRings,
  drawShiftingSegments,
} from "./animationHelpers";

const TAU = Math.PI * 2;

// ============================================================================
// 11. FALLEN PALADIN — Corrupted holy knight with cracked white/gold armor
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
  const isAttacking = attackPhase > 0;
  const corruption = 0.5 + Math.sin(time * 3) * 0.3;
  const bob = Math.abs(Math.sin(time * 3.5)) * size * 0.012;
  const stance = Math.sin(time * 3.5) * size * 0.004;
  const headY = y - size * 0.48 - bob;
  const walkCycle = Math.sin(time * 3.5);
  const leftThighAngle = walkCycle * 0.25;
  const rightThighAngle = -walkCycle * 0.25;
  const leftKneeBend = Math.max(0, -walkCycle) * 0.4;
  const rightKneeBend = Math.max(0, walkCycle) * 0.4;
  const thighLen = size * 0.18;
  const shinLen = size * 0.16;

  // Corruption energy leaking from ground
  for (let v = 0; v < 6; v++) {
    const vPhase = (time * 1.2 + v * 0.4) % 1;
    const vx = x - size * 0.25 + v * size * 0.1;
    const vAlpha = (1 - vPhase) * corruption * 0.35;
    ctx.strokeStyle = `rgba(140, 50, 200, ${vAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(vx, y + size * 0.52);
    ctx.quadraticCurveTo(
      vx + Math.sin(time * 3 + v) * size * 0.04,
      y + size * 0.32 - vPhase * size * 0.22,
      vx + Math.cos(time * 2 + v) * size * 0.02,
      y + size * 0.18 - vPhase * size * 0.18,
    );
    ctx.stroke();
  }

  // Purple corruption particles rising
  for (let p = 0; p < 5; p++) {
    const pPhase = (time * 0.8 + p * 0.35) % 1;
    const px = x + Math.sin(time * 2 + p * 1.3) * size * 0.2;
    const py = y + size * 0.4 - pPhase * size * 0.7;
    const pAlpha = (1 - pPhase) * corruption * 0.45;
    const pSize = size * 0.012 * (1 - pPhase * 0.5);
    ctx.fillStyle = `rgba(180, 80, 255, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, TAU);
    ctx.fill();
  }

  // Ground shadow
  ctx.fillStyle = "rgba(60,20,80,0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.38, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Cape — half white, half purple
  const capeTop = y - size * 0.35 - bob;
  const capeBot = y + size * 0.42;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, capeTop);
  ctx.quadraticCurveTo(x - size * 0.28, (capeTop + capeBot) * 0.5 + Math.sin(time * 2) * size * 0.03, x - size * 0.22, capeBot);
  ctx.lineTo(x + size * 0.22, capeBot);
  ctx.quadraticCurveTo(x + size * 0.28, (capeTop + capeBot) * 0.5 - Math.sin(time * 2) * size * 0.03, x + size * 0.18, capeTop);
  ctx.closePath();
  ctx.clip();
  // White half
  const capeWhiteGrad = ctx.createLinearGradient(x - size * 0.25, capeTop, x, capeBot);
  capeWhiteGrad.addColorStop(0, "#e8e4d8");
  capeWhiteGrad.addColorStop(0.5, "#d0ccc0");
  capeWhiteGrad.addColorStop(1, "#b8b4a8");
  ctx.fillStyle = capeWhiteGrad;
  ctx.fillRect(x - size * 0.3, capeTop - size * 0.1, size * 0.3, capeBot - capeTop + size * 0.2);
  // Purple half
  const capePurpleGrad = ctx.createLinearGradient(x, capeTop, x + size * 0.25, capeBot);
  capePurpleGrad.addColorStop(0, `rgba(100, 40, 160, ${0.6 + corruption * 0.3})`);
  capePurpleGrad.addColorStop(0.5, `rgba(70, 20, 130, ${0.7 + corruption * 0.2})`);
  capePurpleGrad.addColorStop(1, `rgba(40, 10, 80, ${0.8})`);
  ctx.fillStyle = capePurpleGrad;
  ctx.fillRect(x, capeTop - size * 0.1, size * 0.3, capeBot - capeTop + size * 0.2);
  ctx.restore();
  // Cape edge detail
  ctx.strokeStyle = `rgba(160, 60, 220, ${corruption * 0.5})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, capeBot);
  ctx.quadraticCurveTo(x, capeBot + size * 0.03, x + size * 0.22, capeBot);
  ctx.stroke();

  // LEFT LEG — articulated: thigh → knee → shin → boot
  ctx.save();
  ctx.translate(x - size * 0.12, y + size * 0.18 + stance);
  ctx.rotate(leftThighAngle);
  // Thigh plate
  const lThighGrad = ctx.createLinearGradient(0, 0, 0, thighLen);
  lThighGrad.addColorStop(0, "#c8c0b0");
  lThighGrad.addColorStop(0.5, "#e0d8cc");
  lThighGrad.addColorStop(1, "#a8a090");
  ctx.fillStyle = lThighGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, 0);
  ctx.lineTo(-size * 0.05, thighLen);
  ctx.lineTo(size * 0.05, thighLen);
  ctx.lineTo(size * 0.055, 0);
  ctx.closePath();
  ctx.fill();
  // Corruption vein on thigh
  ctx.strokeStyle = `rgba(130, 50, 200, ${corruption * 0.5})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.02, size * 0.02);
  ctx.quadraticCurveTo(-size * 0.01, thighLen * 0.5, size * 0.01, thighLen * 0.85);
  ctx.stroke();
  // Knee joint
  ctx.fillStyle = "#b8b0a0";
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#8a8070";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.04, 0, TAU);
  ctx.stroke();
  // Shin
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  const lShinGrad = ctx.createLinearGradient(0, 0, 0, shinLen);
  lShinGrad.addColorStop(0, "#d0c8b8");
  lShinGrad.addColorStop(1, "#a09888");
  ctx.fillStyle = lShinGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.048, 0);
  ctx.lineTo(-size * 0.04, shinLen);
  ctx.lineTo(size * 0.04, shinLen);
  ctx.lineTo(size * 0.048, 0);
  ctx.closePath();
  ctx.fill();
  // Shin plate line
  ctx.strokeStyle = "#888070";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.01);
  ctx.lineTo(0, shinLen - size * 0.01);
  ctx.stroke();
  // Boot
  const bootGrad = ctx.createLinearGradient(-size * 0.06, shinLen, size * 0.06, shinLen + size * 0.04);
  bootGrad.addColorStop(0, "#8a7a60");
  bootGrad.addColorStop(1, "#6a5a40");
  ctx.fillStyle = bootGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, shinLen - size * 0.01);
  ctx.lineTo(-size * 0.065, shinLen + size * 0.03);
  ctx.lineTo(size * 0.065, shinLen + size * 0.03);
  ctx.lineTo(size * 0.05, shinLen - size * 0.01);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // RIGHT LEG — articulated
  ctx.save();
  ctx.translate(x + size * 0.12, y + size * 0.18 + stance);
  ctx.rotate(rightThighAngle);
  const rThighGrad = ctx.createLinearGradient(0, 0, 0, thighLen);
  rThighGrad.addColorStop(0, "#c8c0b0");
  rThighGrad.addColorStop(0.5, "#e0d8cc");
  rThighGrad.addColorStop(1, "#a8a090");
  ctx.fillStyle = rThighGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, 0);
  ctx.lineTo(-size * 0.05, thighLen);
  ctx.lineTo(size * 0.05, thighLen);
  ctx.lineTo(size * 0.055, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(130, 50, 200, ${corruption * 0.45})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, size * 0.01);
  ctx.quadraticCurveTo(size * 0.01, thighLen * 0.55, -size * 0.005, thighLen * 0.9);
  ctx.stroke();
  ctx.fillStyle = "#b8b0a0";
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  const rShinGrad = ctx.createLinearGradient(0, 0, 0, shinLen);
  rShinGrad.addColorStop(0, "#d0c8b8");
  rShinGrad.addColorStop(1, "#a09888");
  ctx.fillStyle = rShinGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.048, 0);
  ctx.lineTo(-size * 0.04, shinLen);
  ctx.lineTo(size * 0.04, shinLen);
  ctx.lineTo(size * 0.048, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#888070";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.01);
  ctx.lineTo(0, shinLen - size * 0.01);
  ctx.stroke();
  const rBootGrad = ctx.createLinearGradient(-size * 0.06, shinLen, size * 0.06, shinLen + size * 0.04);
  rBootGrad.addColorStop(0, "#8a7a60");
  rBootGrad.addColorStop(1, "#6a5a40");
  ctx.fillStyle = rBootGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, shinLen - size * 0.01);
  ctx.lineTo(-size * 0.065, shinLen + size * 0.03);
  ctx.lineTo(size * 0.065, shinLen + size * 0.03);
  ctx.lineTo(size * 0.05, shinLen - size * 0.01);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ARMORED TORSO — custom path, cracked white/gold with purple veins
  const armorGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  armorGrad.addColorStop(0, "#a09888");
  armorGrad.addColorStop(0.2, "#e8e0d0");
  armorGrad.addColorStop(0.35, "#f0e8d8");
  armorGrad.addColorStop(0.5, "#d8d0c0");
  armorGrad.addColorStop(0.65, "#f0e8d8");
  armorGrad.addColorStop(0.8, "#e8e0d0");
  armorGrad.addColorStop(1, "#a09888");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.2 + stance);
  ctx.lineTo(x - size * 0.32, y - size * 0.22 + stance - bob);
  ctx.quadraticCurveTo(x, y - size * 0.42 + stance - bob, x + size * 0.32, y - size * 0.22 + stance - bob);
  ctx.lineTo(x + size * 0.28, y + size * 0.2 + stance);
  ctx.closePath();
  ctx.fill();

  // Gold trim on armor edges
  ctx.strokeStyle = "#c8a840";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.2 + stance);
  ctx.lineTo(x - size * 0.32, y - size * 0.22 + stance - bob);
  ctx.quadraticCurveTo(x, y - size * 0.42 + stance - bob, x + size * 0.32, y - size * 0.22 + stance - bob);
  ctx.lineTo(x + size * 0.28, y + size * 0.2 + stance);
  ctx.stroke();

  // Center seam
  ctx.strokeStyle = "#b0a890";
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.35 + stance - bob);
  ctx.lineTo(x, y + size * 0.18 + stance);
  ctx.stroke();

  // Horizontal plate lines
  ctx.strokeStyle = "#9a9280";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, y - size * 0.1 + stance - bob);
  ctx.lineTo(x + size * 0.26, y - size * 0.1 + stance - bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.05 + stance);
  ctx.lineTo(x + size * 0.24, y + size * 0.05 + stance);
  ctx.stroke();

  // Gold rivets along plates
  ctx.fillStyle = "#d4b850";
  const rivetPositions = [
    [-0.22, -0.1], [0.22, -0.1], [-0.2, 0.05], [0.2, 0.05],
    [-0.1, -0.35], [0.1, -0.35], [0, -0.1], [0, 0.05],
  ];
  for (const [rx, ry] of rivetPositions) {
    ctx.beginPath();
    ctx.arc(x + rx * size, y + ry * size + stance - bob * (ry < 0 ? 1 : 0.5), size * 0.01, 0, TAU);
    ctx.fill();
  }

  // Purple corruption cracks across armor
  ctx.strokeStyle = `rgba(160, 50, 220, ${corruption * 0.7})`;
  ctx.lineWidth = 1.8 * zoom;
  const crackPaths: number[][][] = [
    [[-0.12, -0.2], [-0.05, -0.12], [0.03, -0.05], [0.08, 0.04]],
    [[0.06, -0.25], [0.04, -0.15], [-0.02, -0.06], [-0.08, 0.03]],
    [[-0.18, 0.0], [-0.08, 0.05], [0.0, 0.1], [0.1, 0.12]],
    [[0.15, -0.08], [0.08, 0.0], [0.02, 0.08]],
  ];
  for (const path of crackPaths) {
    ctx.beginPath();
    ctx.moveTo(x + path[0][0] * size, y + path[0][1] * size + stance - bob);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(x + path[i][0] * size, y + path[i][1] * size + stance - bob);
    }
    ctx.stroke();
  }
  // Corruption glow along cracks
  ctx.strokeStyle = `rgba(200, 100, 255, ${corruption * 0.3})`;
  ctx.lineWidth = 3.5 * zoom;
  for (const path of crackPaths) {
    ctx.beginPath();
    ctx.moveTo(x + path[0][0] * size, y + path[0][1] * size + stance - bob);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(x + path[i][0] * size, y + path[i][1] * size + stance - bob);
    }
    ctx.stroke();
  }

  // Pauldrons — gold with corruption
  for (let side = -1; side <= 1; side += 2) {
    const sx = x + side * size * 0.3;
    const sy = y - size * 0.3 - bob;
    const pGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 0.09);
    pGrad.addColorStop(0, "#f0e080");
    pGrad.addColorStop(0.4, "#c8a840");
    pGrad.addColorStop(0.7, "#a08830");
    pGrad.addColorStop(1, "#706020");
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.moveTo(sx - size * 0.06, sy + size * 0.04);
    ctx.quadraticCurveTo(sx, sy - size * 0.06, sx + size * 0.06, sy + size * 0.04);
    ctx.lineTo(sx + size * 0.07, sy + size * 0.02);
    ctx.quadraticCurveTo(sx, sy + size * 0.08, sx - size * 0.07, sy + size * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8a7020";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    // Corruption on one pauldron
    if (side === 1) {
      ctx.strokeStyle = `rgba(140, 50, 200, ${corruption * 0.5})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(sx - size * 0.03, sy);
      ctx.lineTo(sx + size * 0.04, sy + size * 0.03);
      ctx.stroke();
    }
  }

  // LEFT ARM — holy sword with corrupted glow
  ctx.save();
  ctx.translate(x - size * 0.28, y - size * 0.26 - bob);
  const lSwing = isAttacking ? Math.sin(time * 18) * 0.7 : Math.sin(time * 3.5) * 0.2;
  ctx.rotate(-0.3 + lSwing);
  // Upper arm armor
  const lArmGrad = ctx.createLinearGradient(0, 0, 0, size * 0.16);
  lArmGrad.addColorStop(0, "#d8d0c0");
  lArmGrad.addColorStop(1, "#b0a898");
  ctx.fillStyle = lArmGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, 0);
  ctx.lineTo(-size * 0.035, size * 0.14);
  ctx.lineTo(size * 0.035, size * 0.14);
  ctx.lineTo(size * 0.04, 0);
  ctx.closePath();
  ctx.fill();
  // Elbow
  ctx.fillStyle = "#c0b8a8";
  ctx.beginPath();
  ctx.arc(0, size * 0.14, size * 0.032, 0, TAU);
  ctx.fill();
  // Forearm
  ctx.rotate(0.4);
  ctx.fillStyle = "#d0c8b8";
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, size * 0.14);
  ctx.lineTo(-size * 0.03, size * 0.26);
  ctx.lineTo(size * 0.03, size * 0.26);
  ctx.lineTo(size * 0.035, size * 0.14);
  ctx.closePath();
  ctx.fill();
  // Hand
  ctx.fillStyle = "#a8987a";
  ctx.beginPath();
  ctx.arc(0, size * 0.27, size * 0.025, 0, TAU);
  ctx.fill();
  // Holy sword blade — path shape
  const bladeGrad = ctx.createLinearGradient(-size * 0.02, size * 0.28, size * 0.02, size * 0.58);
  bladeGrad.addColorStop(0, "#e0e8f0");
  bladeGrad.addColorStop(0.3, "#c0c8d8");
  bladeGrad.addColorStop(0.7, "#a0a8b8");
  bladeGrad.addColorStop(1, "#d0d8e0");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.28);
  ctx.lineTo(-size * 0.025, size * 0.32);
  ctx.lineTo(-size * 0.02, size * 0.54);
  ctx.lineTo(0, size * 0.58);
  ctx.lineTo(size * 0.02, size * 0.54);
  ctx.lineTo(size * 0.025, size * 0.32);
  ctx.closePath();
  ctx.fill();
  // Blade edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.lineTo(0, size * 0.56);
  ctx.stroke();
  // Corruption glow on one side of blade
  setShadowBlur(ctx, 4 * zoom, `rgba(160, 60, 240, ${corruption * 0.6})`);
  ctx.strokeStyle = `rgba(180, 80, 255, ${corruption * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.018, size * 0.33);
  ctx.lineTo(size * 0.015, size * 0.52);
  ctx.stroke();
  clearShadow(ctx);
  // Gold crossguard
  ctx.fillStyle = "#d4b040";
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, size * 0.27);
  ctx.lineTo(-size * 0.065, size * 0.3);
  ctx.lineTo(size * 0.065, size * 0.3);
  ctx.lineTo(size * 0.06, size * 0.27);
  ctx.closePath();
  ctx.fill();
  // Grip wrapping
  ctx.strokeStyle = "#8a6a30";
  ctx.lineWidth = 1 * zoom;
  for (let g = 0; g < 3; g++) {
    const gy = size * 0.25 + g * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(-size * 0.015, gy);
    ctx.lineTo(size * 0.015, gy + size * 0.008);
    ctx.stroke();
  }
  ctx.restore();

  // RIGHT ARM
  drawAnimatedArm(ctx, x + size * 0.28, y - size * 0.26 - bob, size, time, zoom, 1, {
    upperLen: 0.16, foreLen: 0.14, width: 0.045, swingSpeed: 3.5, swingAmt: 0.2,
    color: "#d0c8b8", colorDark: "#a09888", handRadius: 0.03,
    attackExtra: isAttacking ? 0.8 : 0,
  });

  // HEAD — cracked golden helm
  const helmGrad = ctx.createRadialGradient(x, headY, 0, x, headY, size * 0.15);
  helmGrad.addColorStop(0, "#f0e080");
  helmGrad.addColorStop(0.3, "#d4b850");
  helmGrad.addColorStop(0.6, "#b09030");
  helmGrad.addColorStop(1, "#807020");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, size * 0.13, size * 0.15, 0, 0, TAU);
  ctx.fill();

  // Helmet face plate with T-visor
  ctx.fillStyle = "#c8a840";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, headY - size * 0.04);
  ctx.lineTo(x - size * 0.1, headY + size * 0.06);
  ctx.lineTo(x - size * 0.06, headY + size * 0.1);
  ctx.lineTo(x + size * 0.06, headY + size * 0.1);
  ctx.lineTo(x + size * 0.1, headY + size * 0.06);
  ctx.lineTo(x + size * 0.08, headY - size * 0.04);
  ctx.closePath();
  ctx.fill();

  // T-shaped visor slit
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, headY + size * 0.01);
  ctx.lineTo(x + size * 0.06, headY + size * 0.01);
  ctx.lineTo(x + size * 0.06, headY + size * 0.03);
  ctx.lineTo(x + size * 0.01, headY + size * 0.03);
  ctx.lineTo(x + size * 0.01, headY + size * 0.07);
  ctx.lineTo(x - size * 0.01, headY + size * 0.07);
  ctx.lineTo(x - size * 0.01, headY + size * 0.03);
  ctx.lineTo(x - size * 0.06, headY + size * 0.03);
  ctx.closePath();
  ctx.fill();

  // Corruption cracks on helmet
  ctx.strokeStyle = `rgba(160, 50, 220, ${corruption * 0.65})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.04, headY - size * 0.08);
  ctx.lineTo(x + size * 0.06, headY - size * 0.02);
  ctx.lineTo(x + size * 0.08, headY + size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, headY - size * 0.06);
  ctx.lineTo(x - size * 0.03, headY + size * 0.01);
  ctx.stroke();

  // Eyes — one gold, one corrupted purple
  ctx.fillStyle = `rgba(240, 220, 100, ${0.7 + Math.sin(time * 4) * 0.2})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.03, headY + size * 0.02, size * 0.012, 0, TAU);
  ctx.fill();
  setShadowBlur(ctx, 5 * zoom, `rgba(180, 60, 240, ${corruption})`);
  ctx.fillStyle = `rgba(200, 80, 255, ${corruption})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.03, headY + size * 0.02, size * 0.014, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // BROKEN GOLDEN HALO above head
  ctx.strokeStyle = `rgba(240, 220, 100, ${0.55 - corruption * 0.25})`;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.12, size * 0.11, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.stroke();
  ctx.strokeStyle = `rgba(220, 200, 80, ${0.4 - corruption * 0.2})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.12, size * 0.11, Math.PI * 0.4, Math.PI * 0.7);
  ctx.stroke();
  // Corruption on broken halo segments
  setShadowBlur(ctx, 4 * zoom, `rgba(160, 50, 220, ${corruption * 0.6})`);
  ctx.strokeStyle = `rgba(180, 60, 240, ${corruption * 0.55})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.12, size * 0.11, -Math.PI * 0.15, Math.PI * 0.4);
  ctx.stroke();
  clearShadow(ctx);
  // Floating halo fragments
  for (let f = 0; f < 3; f++) {
    const fAngle = Math.PI * 0.7 + f * 0.3 + Math.sin(time * 1.5 + f) * 0.1;
    const fx = x + Math.cos(fAngle) * size * 0.13 + Math.sin(time * 2 + f) * size * 0.01;
    const fy = headY - size * 0.12 + Math.sin(fAngle) * size * 0.13 + Math.cos(time * 1.5 + f) * size * 0.008;
    ctx.fillStyle = `rgba(220, 200, 80, ${0.3 + Math.sin(time * 3 + f) * 0.15})`;
    ctx.beginPath();
    ctx.arc(fx, fy, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Pulsing corruption rings
  drawPulsingGlowRings(ctx, x, y - bob, size, time, zoom, {
    color: `rgba(160, 60, 220, ${corruption * 0.15})`,
    count: 2, speed: 1.5, lineWidth: 1.5,
  });
}

// ============================================================================
// 12. BLACKGUARD — Midnight blue heavy tank with tower shield
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
  const isAttacking = attackPhase > 0;
  const stance = Math.sin(time * 2) * size * 0.005;
  const bob = Math.abs(Math.sin(time * 2.5)) * size * 0.008;
  const headY = y - size * 0.5 - bob;
  const walkCycle = Math.sin(time * 2.5);
  const leftThighAngle = walkCycle * 0.15;
  const rightThighAngle = -walkCycle * 0.15;
  const leftKneeBend = Math.max(0, -walkCycle) * 0.3;
  const rightKneeBend = Math.max(0, walkCycle) * 0.3;
  const thighLen = size * 0.19;
  const shinLen = size * 0.17;
  const steelDark = "#1a1830";
  const steelMid = "#2a2848";
  const steelLight = "#3e3c62";
  const steelHighlight = "#565480";

  // Ground dust puffs
  for (let d = 0; d < 3; d++) {
    const dPhase = (time * 1.2 + d * 0.5) % 1;
    const dx = x + (d - 1) * size * 0.15 + Math.sin(time + d) * size * 0.02;
    const dAlpha = (1 - dPhase) * 0.15;
    ctx.fillStyle = `rgba(120, 110, 100, ${dAlpha})`;
    ctx.beginPath();
    ctx.ellipse(dx, y + size * 0.52 - dPhase * size * 0.05, size * 0.04 * (1 + dPhase), size * 0.015, 0, 0, TAU);
    ctx.fill();
  }

  // Ground shadow — wide
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.54, size * 0.42, size * 0.12, 0, 0, TAU);
  ctx.fill();

  // LEFT LEG — articulated heavy plate
  ctx.save();
  ctx.translate(x - size * 0.14, y + size * 0.2 + stance);
  ctx.rotate(leftThighAngle);
  const bgLThigh = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, thighLen);
  bgLThigh.addColorStop(0, steelMid);
  bgLThigh.addColorStop(0.5, steelHighlight);
  bgLThigh.addColorStop(1, steelDark);
  ctx.fillStyle = bgLThigh;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.lineTo(-size * 0.055, thighLen);
  ctx.lineTo(size * 0.055, thighLen);
  ctx.lineTo(size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.02);
  ctx.lineTo(0, thighLen - size * 0.01);
  ctx.stroke();
  // Knee cap
  const bgKneeGrad = ctx.createRadialGradient(0, thighLen, 0, 0, thighLen, size * 0.045);
  bgKneeGrad.addColorStop(0, steelHighlight);
  bgKneeGrad.addColorStop(1, steelDark);
  ctx.fillStyle = bgKneeGrad;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.045, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  // Shin plate
  const bgLShin = ctx.createLinearGradient(0, 0, 0, shinLen);
  bgLShin.addColorStop(0, steelMid);
  bgLShin.addColorStop(1, steelDark);
  ctx.fillStyle = bgLShin;
  ctx.beginPath();
  ctx.moveTo(-size * 0.053, 0);
  ctx.lineTo(-size * 0.045, shinLen);
  ctx.lineTo(size * 0.045, shinLen);
  ctx.lineTo(size * 0.053, 0);
  ctx.closePath();
  ctx.fill();
  // Heavy boot
  ctx.fillStyle = steelDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, shinLen - size * 0.01);
  ctx.lineTo(-size * 0.07, shinLen + size * 0.035);
  ctx.lineTo(size * 0.07, shinLen + size * 0.035);
  ctx.lineTo(size * 0.055, shinLen - size * 0.01);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = steelMid;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, shinLen + size * 0.015);
  ctx.lineTo(size * 0.06, shinLen + size * 0.015);
  ctx.stroke();
  ctx.restore();

  // RIGHT LEG — articulated heavy plate
  ctx.save();
  ctx.translate(x + size * 0.14, y + size * 0.2 + stance);
  ctx.rotate(rightThighAngle);
  const bgRThigh = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, thighLen);
  bgRThigh.addColorStop(0, steelMid);
  bgRThigh.addColorStop(0.5, steelHighlight);
  bgRThigh.addColorStop(1, steelDark);
  ctx.fillStyle = bgRThigh;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.lineTo(-size * 0.055, thighLen);
  ctx.lineTo(size * 0.055, thighLen);
  ctx.lineTo(size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.02);
  ctx.lineTo(0, thighLen - size * 0.01);
  ctx.stroke();
  const bgRKnee = ctx.createRadialGradient(0, thighLen, 0, 0, thighLen, size * 0.045);
  bgRKnee.addColorStop(0, steelHighlight);
  bgRKnee.addColorStop(1, steelDark);
  ctx.fillStyle = bgRKnee;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.045, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  const bgRShin = ctx.createLinearGradient(0, 0, 0, shinLen);
  bgRShin.addColorStop(0, steelMid);
  bgRShin.addColorStop(1, steelDark);
  ctx.fillStyle = bgRShin;
  ctx.beginPath();
  ctx.moveTo(-size * 0.053, 0);
  ctx.lineTo(-size * 0.045, shinLen);
  ctx.lineTo(size * 0.045, shinLen);
  ctx.lineTo(size * 0.053, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = steelDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, shinLen - size * 0.01);
  ctx.lineTo(-size * 0.07, shinLen + size * 0.035);
  ctx.lineTo(size * 0.07, shinLen + size * 0.035);
  ctx.lineTo(size * 0.055, shinLen - size * 0.01);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // MASSIVE ARMORED TORSO — custom path, very wide
  const bgArmorGrad = ctx.createLinearGradient(x - size * 0.38, y, x + size * 0.38, y);
  bgArmorGrad.addColorStop(0, steelDark);
  bgArmorGrad.addColorStop(0.2, steelMid);
  bgArmorGrad.addColorStop(0.35, steelHighlight);
  bgArmorGrad.addColorStop(0.5, steelLight);
  bgArmorGrad.addColorStop(0.65, steelHighlight);
  bgArmorGrad.addColorStop(0.8, steelMid);
  bgArmorGrad.addColorStop(1, steelDark);
  ctx.fillStyle = bgArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.22 + stance);
  ctx.lineTo(x - size * 0.36, y - size * 0.18 + stance - bob);
  ctx.quadraticCurveTo(x, y - size * 0.44 + stance - bob, x + size * 0.36, y - size * 0.18 + stance - bob);
  ctx.lineTo(x + size * 0.32, y + size * 0.22 + stance);
  ctx.closePath();
  ctx.fill();

  // Center seam
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + stance, y - size * 0.36 - bob);
  ctx.lineTo(x + stance, y + size * 0.2);
  ctx.stroke();

  // Horizontal plate lines
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.08 + stance - bob);
  ctx.lineTo(x + size * 0.3, y - size * 0.08 + stance - bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.08 + stance);
  ctx.lineTo(x + size * 0.28, y + size * 0.08 + stance);
  ctx.stroke();

  // Rivets
  ctx.fillStyle = steelHighlight;
  const bgRivets = [
    [-0.26, -0.08], [0.26, -0.08], [-0.24, 0.08], [0.24, 0.08],
    [-0.12, -0.35], [0.12, -0.35], [0, -0.08], [0, 0.08],
  ];
  for (const [rx, ry] of bgRivets) {
    ctx.beginPath();
    ctx.arc(x + rx * size + stance, y + ry * size - bob * 0.7, size * 0.012, 0, TAU);
    ctx.fill();
  }

  // TOWER SHIELD (left side) — tall rectangle with rounded top
  ctx.save();
  ctx.translate(x - size * 0.28 + stance, y - size * 0.05 - bob);
  ctx.rotate(-0.08 + (isAttacking ? Math.sin(time * 10) * 0.08 : 0));
  const shieldGrad = ctx.createLinearGradient(-size * 0.15, -size * 0.3, size * 0.03, size * 0.3);
  shieldGrad.addColorStop(0, steelDark);
  shieldGrad.addColorStop(0.2, steelHighlight);
  shieldGrad.addColorStop(0.5, steelLight);
  shieldGrad.addColorStop(0.8, steelMid);
  shieldGrad.addColorStop(1, steelDark);
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, -size * 0.18);
  ctx.quadraticCurveTo(-size * 0.07, -size * 0.32, 0, -size * 0.18);
  ctx.lineTo(0, size * 0.28);
  ctx.lineTo(-size * 0.07, size * 0.32);
  ctx.lineTo(-size * 0.14, size * 0.28);
  ctx.closePath();
  ctx.fill();
  // Shield border
  ctx.strokeStyle = "#48466e";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Shield boss (central circle)
  const bossGrad = ctx.createRadialGradient(-size * 0.07, 0, 0, -size * 0.07, 0, size * 0.06);
  bossGrad.addColorStop(0, "#8080a0");
  bossGrad.addColorStop(0.5, steelHighlight);
  bossGrad.addColorStop(1, steelDark);
  ctx.fillStyle = bossGrad;
  ctx.beginPath();
  ctx.arc(-size * 0.07, 0, size * 0.055, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#30304a";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();
  // Inner boss rivet
  ctx.fillStyle = steelHighlight;
  ctx.beginPath();
  ctx.arc(-size * 0.07, 0, size * 0.02, 0, TAU);
  ctx.fill();
  // Cross emblem on shield
  ctx.strokeStyle = "#505078";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.07, -size * 0.12);
  ctx.lineTo(-size * 0.07, size * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.02);
  ctx.lineTo(-size * 0.02, -size * 0.02);
  ctx.stroke();
  // Shield edge dents
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, size * 0.15);
  ctx.lineTo(-size * 0.12, size * 0.17);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.1);
  ctx.lineTo(0, -size * 0.08);
  ctx.stroke();
  ctx.restore();

  // RIGHT ARM with stubby mace
  ctx.save();
  ctx.translate(x + size * 0.3 + stance, y - size * 0.26 - bob);
  const maceSwing = isAttacking ? Math.sin(time * 14) * 0.8 : Math.sin(time * 2.5) * 0.15;
  ctx.rotate(0.2 + maceSwing);
  // Upper arm
  const bgRArm = ctx.createLinearGradient(0, 0, 0, size * 0.16);
  bgRArm.addColorStop(0, steelMid);
  bgRArm.addColorStop(1, steelDark);
  ctx.fillStyle = bgRArm;
  ctx.beginPath();
  ctx.moveTo(-size * 0.045, 0);
  ctx.lineTo(-size * 0.04, size * 0.15);
  ctx.lineTo(size * 0.04, size * 0.15);
  ctx.lineTo(size * 0.045, 0);
  ctx.closePath();
  ctx.fill();
  // Elbow
  ctx.fillStyle = steelLight;
  ctx.beginPath();
  ctx.arc(0, size * 0.15, size * 0.035, 0, TAU);
  ctx.fill();
  // Forearm
  ctx.fillStyle = steelMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, size * 0.15);
  ctx.lineTo(-size * 0.035, size * 0.28);
  ctx.lineTo(size * 0.035, size * 0.28);
  ctx.lineTo(size * 0.04, size * 0.15);
  ctx.closePath();
  ctx.fill();
  // Gauntlet
  ctx.fillStyle = steelDark;
  ctx.beginPath();
  ctx.arc(0, size * 0.29, size * 0.03, 0, TAU);
  ctx.fill();
  // Mace handle
  ctx.strokeStyle = "#4a3828";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.lineTo(0, size * 0.44);
  ctx.stroke();
  // Mace head — flanged
  ctx.fillStyle = steelLight;
  ctx.beginPath();
  ctx.arc(0, size * 0.46, size * 0.04, 0, TAU);
  ctx.fill();
  // Flanges
  ctx.fillStyle = steelMid;
  for (let fl = 0; fl < 6; fl++) {
    const fa = (fl / 6) * TAU;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.46);
    ctx.lineTo(Math.cos(fa) * size * 0.06, size * 0.46 + Math.sin(fa) * size * 0.06);
    ctx.lineTo(Math.cos(fa + 0.3) * size * 0.035, size * 0.46 + Math.sin(fa + 0.3) * size * 0.035);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // PAULDRONS — massive rounded
  for (let side = -1; side <= 1; side += 2) {
    const sx = x + side * size * 0.34 + stance;
    const sy = y - size * 0.34 - bob;
    const pGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 0.1);
    pGrad.addColorStop(0, steelHighlight);
    pGrad.addColorStop(0.5, steelMid);
    pGrad.addColorStop(1, steelDark);
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.moveTo(sx - size * 0.08, sy + size * 0.04);
    ctx.quadraticCurveTo(sx, sy - size * 0.08, sx + size * 0.08, sy + size * 0.04);
    ctx.quadraticCurveTo(sx, sy + size * 0.09, sx - size * 0.08, sy + size * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = steelDark;
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    // Rivet on pauldron
    ctx.fillStyle = steelHighlight;
    ctx.beginPath();
    ctx.arc(sx, sy - size * 0.02, size * 0.012, 0, TAU);
    ctx.fill();
  }

  // GREAT HELM — fully enclosed with narrow slit visor
  const helmGrad = ctx.createRadialGradient(x + stance, headY, 0, x + stance, headY, size * 0.16);
  helmGrad.addColorStop(0, steelHighlight);
  helmGrad.addColorStop(0.4, steelLight);
  helmGrad.addColorStop(0.7, steelMid);
  helmGrad.addColorStop(1, steelDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(x + stance, headY, size * 0.13, size * 0.16, 0, 0, TAU);
  ctx.fill();

  // Flat-top great helm shape
  ctx.fillStyle = steelMid;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12 + stance, headY - size * 0.12);
  ctx.lineTo(x - size * 0.13 + stance, headY - size * 0.06);
  ctx.lineTo(x + size * 0.13 + stance, headY - size * 0.06);
  ctx.lineTo(x + size * 0.12 + stance, headY - size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Vertical face plate line
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + stance, headY - size * 0.12);
  ctx.lineTo(x + stance, headY + size * 0.12);
  ctx.stroke();

  // Narrow slit visor
  ctx.fillStyle = "#050510";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08 + stance, headY + size * 0.005);
  ctx.lineTo(x + size * 0.08 + stance, headY + size * 0.005);
  ctx.lineTo(x + size * 0.08 + stance, headY + size * 0.025);
  ctx.lineTo(x - size * 0.08 + stance, headY + size * 0.025);
  ctx.closePath();
  ctx.fill();

  // Breathing holes
  for (let h = 0; h < 3; h++) {
    ctx.fillStyle = "#050510";
    ctx.beginPath();
    ctx.arc(x - size * 0.03 + h * size * 0.03 + stance, headY + size * 0.06, size * 0.005, 0, TAU);
    ctx.fill();
  }

  // Dim blue eye glow through visor
  const glow = 0.3 + Math.sin(time * 2.5) * 0.15;
  setShadowBlur(ctx, 4 * zoom, `rgba(80, 120, 200, ${glow})`);
  ctx.fillStyle = `rgba(80, 130, 220, ${glow})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.025 + stance, headY + size * 0.015, size * 0.01, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.025 + stance, headY + size * 0.015, size * 0.01, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Helm crest ridge
  ctx.strokeStyle = steelMid;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + stance, headY - size * 0.16);
  ctx.lineTo(x + stance, headY - size * 0.06);
  ctx.stroke();
}

// ============================================================================
// 13. LICH (BOSS) — Undead archmage with staff, spell circle, floating book
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
  const isAttacking = attackPhase > 0;
  const auraFlare = isAttacking ? attackPhase : 0;
  const hover = Math.sin(time * 2) * size * 0.02;
  const headY = y - size * 0.48 + hover;
  const arcaneGlow = 0.5 + Math.sin(time * 3) * 0.3;
  const frostPulse = 0.4 + Math.sin(time * 4) * 0.3;

  // Arcane aura
  drawRadialAura(ctx, x, y + hover, size * 0.85 + auraFlare * size * 0.3, [
    { offset: 0, color: `rgba(60, 140, 220, ${(0.25 + auraFlare * 0.35) * arcaneGlow})` },
    { offset: 0.3, color: `rgba(40, 80, 180, ${0.15 * arcaneGlow})` },
    { offset: 0.6, color: `rgba(20, 40, 120, ${0.08 * arcaneGlow})` },
    { offset: 1, color: "rgba(0,0,0,0)" },
  ]);

  // SPELL CIRCLE on ground — animated rotating runes
  ctx.save();
  ctx.translate(x, y + size * 0.52);
  ctx.rotate(time * 0.2);
  // Outer circle
  ctx.strokeStyle = `rgba(80, 160, 240, ${arcaneGlow * 0.35 + auraFlare * 0.3})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.4, size * 0.12, 0, 0, TAU);
  ctx.stroke();
  // Middle circle
  ctx.strokeStyle = `rgba(100, 180, 255, ${arcaneGlow * 0.3})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.3, size * 0.09, 0, 0, TAU);
  ctx.stroke();
  // Inner circle
  ctx.strokeStyle = `rgba(120, 200, 255, ${arcaneGlow * 0.25})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.18, size * 0.055, 0, 0, TAU);
  ctx.stroke();
  // Rune symbols on outer circle
  for (let r = 0; r < 8; r++) {
    const ra = (r / 8) * TAU;
    const rx = Math.cos(ra) * size * 0.35;
    const ry = Math.sin(ra) * size * 0.105;
    ctx.fillStyle = `rgba(120, 200, 255, ${arcaneGlow * 0.5})`;
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(ra + time * 0.5);
    ctx.fillRect(-size * 0.012, -size * 0.012, size * 0.024, size * 0.024);
    ctx.restore();
  }
  // Connecting lines between circles
  for (let l = 0; l < 6; l++) {
    const la = (l / 6) * TAU;
    ctx.strokeStyle = `rgba(80, 160, 240, ${arcaneGlow * 0.2})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(Math.cos(la) * size * 0.18, Math.sin(la) * size * 0.055);
    ctx.lineTo(Math.cos(la) * size * 0.3, Math.sin(la) * size * 0.09);
    ctx.stroke();
  }
  ctx.restore();

  // Frost particles drifting around
  for (let fp = 0; fp < 8; fp++) {
    const fpAngle = time * 0.6 + fp * (TAU / 8);
    const fpR = size * 0.35 + Math.sin(time * 2 + fp) * size * 0.08;
    const fpx = x + Math.cos(fpAngle) * fpR;
    const fpy = y + Math.sin(fpAngle) * fpR * 0.4 + hover;
    const fpAlpha = frostPulse * 0.4 * (0.5 + Math.sin(time * 3 + fp) * 0.5);
    ctx.fillStyle = `rgba(180, 220, 255, ${fpAlpha})`;
    ctx.beginPath();
    ctx.arc(fpx, fpy, size * 0.008 + Math.sin(time * 4 + fp) * size * 0.003, 0, TAU);
    ctx.fill();
  }

  // Ground shadow
  ctx.fillStyle = "rgba(20,30,60,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.42, size * 0.12, 0, 0, TAU);
  ctx.fill();

  // GRAND ROBES — custom path torso, blue/purple with gold trim
  const robeTop = y - size * 0.15 + hover;
  const robeBot = y + size * 0.48 + hover;
  const robeSW = size * 0.22;
  const robeBW = size * 0.34;
  const robeGrad = ctx.createLinearGradient(x, robeTop, x, robeBot);
  robeGrad.addColorStop(0, "#2a1870");
  robeGrad.addColorStop(0.25, "#201060");
  robeGrad.addColorStop(0.5, "#181050");
  robeGrad.addColorStop(0.75, "#120840");
  robeGrad.addColorStop(1, "#0a0628");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - robeSW, robeTop);
  ctx.quadraticCurveTo(x - robeBW * 1.4, (robeTop + robeBot) * 0.5, x - robeBW, robeBot);
  ctx.lineTo(x + robeBW, robeBot);
  ctx.quadraticCurveTo(x + robeBW * 1.4, (robeTop + robeBot) * 0.5, x + robeSW, robeTop);
  ctx.closePath();
  ctx.fill();

  // Gold trim on robe edges
  ctx.strokeStyle = `rgba(200, 170, 60, ${0.5 + arcaneGlow * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - robeBW, robeBot);
  ctx.quadraticCurveTo(x, robeBot + size * 0.04, x + robeBW, robeBot);
  ctx.stroke();

  // Robe fabric folds
  ctx.strokeStyle = "rgba(20,10,40,0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let fold = -2; fold <= 2; fold++) {
    const foldX = x + fold * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(foldX, robeTop + size * 0.08);
    ctx.quadraticCurveTo(foldX + Math.sin(time + fold) * size * 0.02, (robeTop + robeBot) * 0.55, foldX + fold * size * 0.02, robeBot - size * 0.05);
    ctx.stroke();
  }

  // Arcane symbols woven into robe
  ctx.strokeStyle = `rgba(80, 160, 240, ${arcaneGlow * 0.25})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let sym = 0; sym < 4; sym++) {
    const symX = x - size * 0.12 + sym * size * 0.08;
    const symY = (robeTop + robeBot) * 0.5 + sym * size * 0.05;
    ctx.beginPath();
    ctx.arc(symX, symY, size * 0.015, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(symX - size * 0.01, symY);
    ctx.lineTo(symX + size * 0.01, symY);
    ctx.stroke();
  }

  // Tattered robe hem
  ctx.strokeStyle = "#0a0628";
  ctx.lineWidth = 1 * zoom;
  for (let t = 0; t < 8; t++) {
    const tx = x - robeBW + t * (robeBW * 2) / 7;
    const tLen = size * 0.03 + Math.sin(time * 2 + t) * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(tx, robeBot);
    ctx.lineTo(tx + Math.sin(time * 1.5 + t) * size * 0.01, robeBot + tLen);
    ctx.stroke();
  }

  // LEFT ARM — casting hand with energy
  ctx.save();
  ctx.translate(x - size * 0.2, y - size * 0.22 + hover);
  const castAngle = isAttacking ? Math.sin(time * 12) * 0.5 : -0.5 + Math.sin(time * 2) * 0.15;
  ctx.rotate(castAngle);
  // Robe sleeve
  ctx.fillStyle = "#201060";
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, 0);
  ctx.lineTo(-size * 0.05, size * 0.14);
  ctx.lineTo(size * 0.05, size * 0.14);
  ctx.lineTo(size * 0.04, 0);
  ctx.closePath();
  ctx.fill();
  // Skeletal hand
  ctx.fillStyle = "#d8d0c0";
  ctx.beginPath();
  ctx.arc(0, size * 0.16, size * 0.025, 0, TAU);
  ctx.fill();
  // Bony fingers
  ctx.strokeStyle = "#c0b8a8";
  ctx.lineWidth = 1 * zoom;
  for (let f = -2; f <= 2; f++) {
    ctx.beginPath();
    ctx.moveTo(0, size * 0.16);
    ctx.lineTo(f * size * 0.012, size * 0.2);
    ctx.stroke();
  }
  // Arcane energy at fingertips
  if (isAttacking) {
    setShadowBlur(ctx, 6 * zoom, `rgba(80, 180, 255, ${arcaneGlow})`);
    ctx.fillStyle = `rgba(100, 200, 255, ${arcaneGlow * 0.7})`;
    ctx.beginPath();
    ctx.arc(0, size * 0.2, size * 0.04, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }
  ctx.restore();

  // STAFF (right hand) — tall with floating crystal orb
  ctx.save();
  ctx.translate(x + size * 0.2, y - size * 0.2 + hover);
  const staffRot = isAttacking ? Math.sin(time * 10) * 0.3 : 0.12 + Math.sin(time * 1.5) * 0.06;
  ctx.rotate(staffRot);
  // Skeletal hand gripping
  ctx.fillStyle = "#d8d0c0";
  ctx.beginPath();
  ctx.arc(0, size * 0.06, size * 0.025, 0, TAU);
  ctx.fill();
  // Staff shaft — ornate
  const staffGrad = ctx.createLinearGradient(0, -size * 0.1, 0, size * 0.55);
  staffGrad.addColorStop(0, "#5a4830");
  staffGrad.addColorStop(0.3, "#7a6848");
  staffGrad.addColorStop(0.6, "#5a4830");
  staffGrad.addColorStop(1, "#3a2818");
  ctx.strokeStyle = staffGrad;
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.lineTo(0, size * 0.55);
  ctx.stroke();
  // Staff wrap bands
  ctx.strokeStyle = "#c8a840";
  ctx.lineWidth = 1.5 * zoom;
  for (let b = 0; b < 4; b++) {
    const by = size * 0.05 + b * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, by);
    ctx.lineTo(size * 0.02, by + size * 0.015);
    ctx.stroke();
  }
  // Staff top claw holding orb
  ctx.strokeStyle = "#6a5838";
  ctx.lineWidth = 1.5 * zoom;
  for (let c = -1; c <= 1; c += 2) {
    ctx.beginPath();
    ctx.moveTo(c * size * 0.015, -size * 0.06);
    ctx.quadraticCurveTo(c * size * 0.035, -size * 0.12, c * size * 0.02, -size * 0.16);
    ctx.stroke();
  }
  // FLOATING CRYSTAL ORB at staff top
  const orbY = -size * 0.18;
  const orbFloat = Math.sin(time * 3) * size * 0.008;
  const orbGrad = ctx.createRadialGradient(0, orbY + orbFloat, 0, 0, orbY + orbFloat, size * 0.055);
  orbGrad.addColorStop(0, `rgba(200, 240, 255, ${0.95 + auraFlare * 0.05})`);
  orbGrad.addColorStop(0.3, `rgba(100, 200, 255, 0.8)`);
  orbGrad.addColorStop(0.6, `rgba(60, 140, 220, 0.5)`);
  orbGrad.addColorStop(1, "rgba(40,80,180,0)");
  setShadowBlur(ctx, 8 * zoom, `rgba(80, 180, 255, ${arcaneGlow})`);
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(0, orbY + orbFloat, size * 0.055, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  // Orbiting energy around crystal
  for (let oe = 0; oe < 4; oe++) {
    const oeA = time * 2.5 + oe * (TAU / 4);
    const oex = Math.cos(oeA) * size * 0.08;
    const oey = orbY + orbFloat + Math.sin(oeA) * size * 0.04;
    ctx.fillStyle = `rgba(120, 200, 255, ${arcaneGlow * 0.5})`;
    ctx.beginPath();
    ctx.arc(oex, oey, size * 0.007, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // FLOATING BOOK nearby (left side)
  const bookAngle = Math.sin(time * 1.2) * 0.15;
  const bookX = x - size * 0.35 + Math.sin(time * 1.5) * size * 0.03;
  const bookY = y - size * 0.15 + hover + Math.cos(time * 1.8) * size * 0.02;
  ctx.save();
  ctx.translate(bookX, bookY);
  ctx.rotate(bookAngle);
  // Book cover
  ctx.fillStyle = "#3a1860";
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.05);
  ctx.lineTo(size * 0.04, -size * 0.05);
  ctx.lineTo(size * 0.04, size * 0.05);
  ctx.lineTo(-size * 0.04, size * 0.05);
  ctx.closePath();
  ctx.fill();
  // Pages
  ctx.fillStyle = "#e0d8c8";
  ctx.fillRect(-size * 0.035, -size * 0.045, size * 0.07, size * 0.09);
  // Spine
  ctx.strokeStyle = "#2a1050";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.05);
  ctx.lineTo(-size * 0.04, size * 0.05);
  ctx.stroke();
  // Arcane symbol on cover
  ctx.strokeStyle = `rgba(80, 160, 240, ${arcaneGlow * 0.6})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.02, 0, TAU);
  ctx.stroke();
  // Floating text particles from open pages
  for (let tp = 0; tp < 3; tp++) {
    const tpPhase = (time * 1.5 + tp * 0.4) % 1;
    ctx.fillStyle = `rgba(80, 160, 240, ${(1 - tpPhase) * arcaneGlow * 0.4})`;
    ctx.beginPath();
    ctx.arc(
      (tp - 1) * size * 0.015 + Math.sin(time * 2 + tp) * size * 0.01,
      -size * 0.05 - tpPhase * size * 0.08,
      size * 0.004, 0, TAU,
    );
    ctx.fill();
  }
  ctx.restore();

  // SKULL HEAD with grand wizard hood
  // Hood outer shape
  const hoodGrad = ctx.createRadialGradient(x, headY - size * 0.02, 0, x, headY, size * 0.18);
  hoodGrad.addColorStop(0, "#2a1870");
  hoodGrad.addColorStop(0.4, "#201060");
  hoodGrad.addColorStop(0.7, "#181050");
  hoodGrad.addColorStop(1, "#0a0628");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, headY + size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.16, headY - size * 0.08, x, headY - size * 0.2);
  ctx.quadraticCurveTo(x + size * 0.16, headY - size * 0.08, x + size * 0.14, headY + size * 0.08);
  ctx.quadraticCurveTo(x, headY + size * 0.14, x - size * 0.14, headY + size * 0.08);
  ctx.closePath();
  ctx.fill();
  // Hood point/tip
  ctx.fillStyle = "#181050";
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.2);
  ctx.lineTo(x + size * 0.03, headY - size * 0.28);
  ctx.lineTo(x + size * 0.01, headY - size * 0.18);
  ctx.closePath();
  ctx.fill();

  // Skull face visible inside hood
  const skullGrad = ctx.createRadialGradient(x, headY + size * 0.02, 0, x, headY + size * 0.02, size * 0.1);
  skullGrad.addColorStop(0, "#e0d8c8");
  skullGrad.addColorStop(0.5, "#c8c0b0");
  skullGrad.addColorStop(1, "#a09888");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.02, size * 0.085, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Eye sockets
  ctx.fillStyle = "#0a0a20";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.03, headY, size * 0.025, size * 0.03, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.03, headY, size * 0.025, size * 0.03, 0, 0, TAU);
  ctx.fill();

  // ICY BLUE FLAME EYES
  setShadowBlur(ctx, 8 * zoom, `rgba(80, 180, 255, ${arcaneGlow})`);
  ctx.fillStyle = `rgba(100, 200, 255, ${arcaneGlow})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.03, headY, size * 0.016, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.03, headY, size * 0.016, 0, TAU);
  ctx.fill();
  // Eye flame trails upward
  for (let ef = 0; ef < 3; ef++) {
    const efPhase = (time * 3 + ef * 0.3) % 1;
    const efAlpha = (1 - efPhase) * arcaneGlow * 0.5;
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = `rgba(120, 200, 255, ${efAlpha})`;
      ctx.beginPath();
      ctx.arc(
        x + side * size * 0.03 + Math.sin(time * 5 + ef + side) * size * 0.005,
        headY - efPhase * size * 0.06,
        size * 0.006 * (1 - efPhase),
        0, TAU,
      );
      ctx.fill();
    }
  }
  clearShadow(ctx);

  // Nose hole on skull
  ctx.fillStyle = "#1a1a30";
  ctx.beginPath();
  ctx.moveTo(x, headY + size * 0.04);
  ctx.lineTo(x - size * 0.008, headY + size * 0.055);
  ctx.lineTo(x + size * 0.008, headY + size * 0.055);
  ctx.closePath();
  ctx.fill();

  // Jaw with teeth
  ctx.strokeStyle = "#a09888";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, headY + size * 0.07);
  ctx.quadraticCurveTo(x, headY + size * 0.1 + Math.sin(time * 5) * size * 0.005, x + size * 0.05, headY + size * 0.07);
  ctx.stroke();

  // Gold trim on hood
  ctx.strokeStyle = `rgba(200, 170, 60, ${0.5})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, headY + size * 0.08);
  ctx.quadraticCurveTo(x, headY + size * 0.14, x + size * 0.14, headY + size * 0.08);
  ctx.stroke();

  // Orbiting ice shards
  drawShiftingSegments(ctx, x, y + hover, size, time, zoom, {
    color: "rgba(140, 220, 255, 0.5)",
    colorAlt: "rgba(80, 160, 240, 0.4)",
    count: 6, orbitRadius: 0.45, segmentSize: 0.025,
    orbitSpeed: 0.7, bobSpeed: 2, bobAmt: 0.04, shape: "shard", rotateWithOrbit: true,
  });

  // Phylactery tether
  const phylAngle = time * 1.1;
  const phylX = x + Math.cos(phylAngle) * size * 0.28;
  const phylY = y - size * 0.18 + Math.sin(time * 2.5) * size * 0.04 + hover;
  const phylGrad = ctx.createRadialGradient(phylX, phylY, 0, phylX, phylY, size * 0.04);
  phylGrad.addColorStop(0, `rgba(180, 255, 220, ${0.9})`);
  phylGrad.addColorStop(0.4, `rgba(60, 200, 140, 0.6)`);
  phylGrad.addColorStop(1, "rgba(20,100,80,0)");
  ctx.fillStyle = phylGrad;
  ctx.beginPath();
  ctx.arc(phylX, phylY, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(80, 220, 160, ${arcaneGlow * 0.3})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(phylX, phylY);
  ctx.quadraticCurveTo(x, y - size * 0.3 + hover, x, y - size * 0.38 + hover);
  ctx.stroke();

  // Frost aura ground effect
  for (let fa = 0; fa < 6; fa++) {
    const faAngle = (fa / 6) * TAU + time * 0.3;
    const faR = size * 0.35 + Math.sin(time * 2 + fa) * size * 0.05;
    const fax = x + Math.cos(faAngle) * faR;
    const fay = y + size * 0.5 + Math.sin(faAngle) * faR * 0.3;
    ctx.fillStyle = `rgba(120, 200, 255, ${frostPulse * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(fax, fay, size * 0.02, size * 0.008, faAngle, 0, TAU);
    ctx.fill();
  }

  // Shoulder bones/clasps visible above robe
  for (let side = -1; side <= 1; side += 2) {
    const claspX = x + side * size * 0.18;
    const claspY = y - size * 0.18 + hover;
    ctx.fillStyle = "#c8c0b0";
    ctx.beginPath();
    ctx.ellipse(claspX, claspY, size * 0.03, size * 0.025, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#60a0d0";
    ctx.beginPath();
    ctx.arc(claspX, claspY, size * 0.012, 0, TAU);
    ctx.fill();
  }

  // Arcane energy crackling between hands when attacking
  if (isAttacking) {
    setShadowBlur(ctx, 6 * zoom, `rgba(80, 180, 255, ${arcaneGlow})`);
    ctx.strokeStyle = `rgba(100, 200, 255, ${arcaneGlow * 0.6})`;
    ctx.lineWidth = 1.2 * zoom;
    for (let bolt = 0; bolt < 3; bolt++) {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.2, y - size * 0.1 + hover);
      const midX = x + Math.sin(time * 8 + bolt * 1.5) * size * 0.08;
      const midY = y - size * 0.2 + hover + Math.cos(time * 6 + bolt) * size * 0.05;
      ctx.quadraticCurveTo(midX, midY, x + size * 0.2, y - size * 0.1 + hover);
      ctx.stroke();
    }
    clearShadow(ctx);
  }

  // Hovering bone fragments (remnants of undeath)
  for (let bf = 0; bf < 4; bf++) {
    const bfAngle = time * 0.5 + bf * (TAU / 4);
    const bfR = size * 0.3 + Math.sin(time * 1.5 + bf) * size * 0.04;
    const bfx = x + Math.cos(bfAngle) * bfR;
    const bfy = y - size * 0.05 + Math.sin(bfAngle) * bfR * 0.35 + hover;
    ctx.save();
    ctx.translate(bfx, bfy);
    ctx.rotate(time * 1.5 + bf * 2);
    ctx.fillStyle = `rgba(200, 190, 170, ${0.3 + Math.sin(time * 2 + bf) * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.01, -size * 0.005);
    ctx.lineTo(0, -size * 0.015);
    ctx.lineTo(size * 0.01, -size * 0.005);
    ctx.lineTo(size * 0.005, size * 0.01);
    ctx.lineTo(-size * 0.005, size * 0.01);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Inner robe lining visible at openings (rich blue silk)
  ctx.strokeStyle = `rgba(60, 100, 180, 0.3)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, robeTop + size * 0.02);
  ctx.quadraticCurveTo(x, robeTop + size * 0.06, x + size * 0.08, robeTop + size * 0.02);
  ctx.stroke();

  // Pulsing arcane rings
  drawPulsingGlowRings(ctx, x, y + hover, size, time, zoom, {
    color: `rgba(80, 160, 240, ${0.12 + auraFlare * 0.15})`,
    count: 3, speed: 1, lineWidth: 1.5,
  });
}

// ============================================================================
// 14. WRAITH — Ethereal spirit with ghostly chains and trailing form
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
  const isAttacking = attackPhase > 0;
  const hover = Math.sin(time * 2.5) * size * 0.03;
  const flicker = 0.5 + Math.sin(time * 6) * 0.25;
  const waver = Math.sin(time * 4) * 0.05;
  const headY = y - size * 0.35 + hover;

  // Void pool beneath (no legs)
  const voidGrad = ctx.createRadialGradient(x, y + size * 0.48, 0, x, y + size * 0.48, size * 0.42);
  voidGrad.addColorStop(0, `rgba(20, 10, 50, ${flicker * 0.45})`);
  voidGrad.addColorStop(0.4, `rgba(15, 5, 35, ${flicker * 0.25})`);
  voidGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.42, size * 0.13, 0, 0, TAU);
  ctx.fill();

  // Ghostly chains hanging below body
  ctx.strokeStyle = `rgba(160, 150, 180, ${flicker * 0.5})`;
  ctx.lineWidth = 1.8 * zoom;
  for (let ch = 0; ch < 4; ch++) {
    const chx = x - size * 0.15 + ch * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(chx, y + size * 0.12 + hover);
    for (let seg = 0; seg < 6; seg++) {
      const segY = y + size * 0.18 + seg * size * 0.055 + hover;
      const segX = chx + Math.sin(time * 3 + ch * 0.8 + seg * 0.6) * size * 0.035;
      ctx.lineTo(segX, segY);
    }
    ctx.stroke();
    // Chain link highlights
    ctx.strokeStyle = `rgba(200, 190, 220, ${flicker * 0.3})`;
    ctx.lineWidth = 0.6 * zoom;
    for (let link = 0; link < 4; link++) {
      const linkY = y + size * 0.2 + link * size * 0.055 + hover;
      const linkX = chx + Math.sin(time * 3 + ch * 0.8 + link * 0.6) * size * 0.035;
      ctx.beginPath();
      ctx.ellipse(linkX, linkY, size * 0.01, size * 0.007, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(160, 150, 180, ${flicker * 0.5})`;
    ctx.lineWidth = 1.8 * zoom;
  }

  // Trailing wisps below body (tendrils instead of legs)
  for (let td = 0; td < 6; td++) {
    drawAnimatedTendril(
      ctx, x + (td - 2.5) * size * 0.07, y + size * 0.18 + hover,
      Math.PI * 0.5 + (td - 2.5) * 0.12, size, time, zoom, {
        color: `rgba(150, 150, 180, ${flicker * 0.35})`,
        tipColor: "rgba(100, 100, 130, 0.08)",
        length: 0.32, width: 0.022, segments: 10, waveSpeed: 2 + td * 0.25, waveAmt: 0.07, tipRadius: 0.006,
      },
    );
  }

  // SEMI-TRANSPARENT FLOWING BODY — custom path
  ctx.save();
  ctx.globalAlpha = flicker * 0.85;
  const bodyGrad = ctx.createRadialGradient(x, y - size * 0.08 + hover, 0, x, y + size * 0.1 + hover, size * 0.42);
  bodyGrad.addColorStop(0, `rgba(190, 190, 215, ${flicker * 0.65})`);
  bodyGrad.addColorStop(0.25, `rgba(155, 155, 180, ${flicker * 0.5})`);
  bodyGrad.addColorStop(0.55, `rgba(115, 115, 145, ${flicker * 0.3})`);
  bodyGrad.addColorStop(1, "rgba(80, 80, 110, 0)");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.32 + hover);
  ctx.quadraticCurveTo(x - size * 0.28, y - size * 0.04 + hover, x - size * 0.14, y - size * 0.28 + hover);
  ctx.quadraticCurveTo(x - size * 0.04, y - size * 0.4 + hover, x + size * 0.04, y - size * 0.4 + hover);
  ctx.quadraticCurveTo(x + size * 0.14, y - size * 0.28 + hover, x + size * 0.28, y - size * 0.04 + hover);
  ctx.lineTo(x + size * 0.22, y + size * 0.32 + hover);
  // Wavy bottom edge
  for (let w = 0; w < 7; w++) {
    const wx = x + size * 0.22 - w * size * 0.065;
    const waveY = y + size * 0.32 + Math.sin(time * 3 + w * 0.8) * size * 0.035 + hover;
    ctx.lineTo(wx, waveY);
  }
  ctx.closePath();
  ctx.fill();

  // Internal wispy texture
  ctx.strokeStyle = `rgba(200, 200, 225, ${flicker * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let wt = 0; wt < 5; wt++) {
    const wtx = x - size * 0.12 + wt * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(wtx, y - size * 0.15 + hover);
    ctx.quadraticCurveTo(
      wtx + Math.sin(time * 2 + wt) * size * 0.04,
      y + size * 0.05 + hover,
      wtx + Math.sin(time * 1.5 + wt) * size * 0.03,
      y + size * 0.25 + hover,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // ARMS — ethereal, reaching forward with spectral claws
  ctx.save();
  ctx.globalAlpha = flicker * 0.75;
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.2, y - size * 0.18 + hover);
    const reachAngle = side * (0.5 + (isAttacking ? Math.sin(time * 12) * 0.4 : Math.sin(time * 2.5 + side) * 0.15));
    ctx.rotate(reachAngle);
    // Upper arm
    const armGrad = ctx.createLinearGradient(0, 0, 0, size * 0.14);
    armGrad.addColorStop(0, `rgba(170, 170, 195, ${flicker * 0.6})`);
    armGrad.addColorStop(1, `rgba(130, 130, 160, ${flicker * 0.4})`);
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, 0);
    ctx.lineTo(-size * 0.025, size * 0.13);
    ctx.lineTo(size * 0.025, size * 0.13);
    ctx.lineTo(size * 0.03, 0);
    ctx.closePath();
    ctx.fill();
    // Forearm
    ctx.rotate(0.3 * side);
    ctx.fillStyle = `rgba(155, 155, 180, ${flicker * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.025, size * 0.13);
    ctx.lineTo(-size * 0.02, size * 0.24);
    ctx.lineTo(size * 0.02, size * 0.24);
    ctx.lineTo(size * 0.025, size * 0.13);
    ctx.closePath();
    ctx.fill();
    // Spectral claws
    ctx.strokeStyle = `rgba(180, 180, 210, ${flicker * 0.6})`;
    ctx.lineWidth = 1.2 * zoom;
    for (let cl = -1; cl <= 1; cl++) {
      ctx.beginPath();
      ctx.moveTo(cl * size * 0.01, size * 0.24);
      ctx.lineTo(cl * size * 0.02, size * 0.3);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // HOODED HEAD — void face with glowing eyes
  const hoodGrad = ctx.createRadialGradient(x, headY, 0, x, headY, size * 0.16);
  hoodGrad.addColorStop(0, `rgba(65, 65, 90, ${flicker * 0.85})`);
  hoodGrad.addColorStop(0.5, `rgba(45, 45, 65, ${flicker * 0.65})`);
  hoodGrad.addColorStop(1, `rgba(22, 22, 42, ${flicker * 0.35})`);
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, headY + size * 0.06);
  ctx.quadraticCurveTo(x - size * 0.15, headY - size * 0.06, x, headY - size * 0.17);
  ctx.quadraticCurveTo(x + size * 0.15, headY - size * 0.06, x + size * 0.13, headY + size * 0.06);
  ctx.quadraticCurveTo(x, headY + size * 0.12, x - size * 0.13, headY + size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Void face inside hood
  ctx.fillStyle = `rgba(8, 5, 15, ${flicker * 0.8})`;
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.01, size * 0.08, size * 0.08, 0, 0, TAU);
  ctx.fill();

  // PURPLE GLOWING EYES
  setShadowBlur(ctx, 10 * zoom, `rgba(160, 100, 255, ${flicker})`);
  ctx.fillStyle = `rgba(180, 120, 255, ${flicker})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.035, headY, size * 0.02, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.035, headY, size * 0.02, 0, TAU);
  ctx.fill();
  // Eye trail wisps
  for (let et = 0; et < 2; et++) {
    const etPhase = (time * 4 + et * 0.5) % 1;
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = `rgba(160, 100, 255, ${(1 - etPhase) * flicker * 0.4})`;
      ctx.beginPath();
      ctx.arc(
        x + side * size * 0.035 + side * etPhase * size * 0.03,
        headY - etPhase * size * 0.02,
        size * 0.008 * (1 - etPhase * 0.5),
        0, TAU,
      );
      ctx.fill();
    }
  }
  clearShadow(ctx);

  // Spectral rune sigils drifting on body
  ctx.save();
  ctx.globalAlpha = flicker * 0.3;
  for (let rune = 0; rune < 5; rune++) {
    const runePhase = (time * 0.4 + rune * 0.35) % 1;
    const runeX = x + Math.sin(time * 1.2 + rune * 1.8) * size * 0.12;
    const runeY = y - size * 0.15 + runePhase * size * 0.3 + hover;
    const runeAlpha = (1 - Math.abs(runePhase - 0.5) * 2) * flicker * 0.5;
    ctx.strokeStyle = `rgba(160, 140, 220, ${runeAlpha})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(runeX, runeY, size * 0.012, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(runeX - size * 0.008, runeY);
    ctx.lineTo(runeX + size * 0.008, runeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(runeX, runeY - size * 0.008);
    ctx.lineTo(runeX, runeY + size * 0.008);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Wailing mouth shape on face (spectral scream)
  const mouthOpen = isAttacking ? 0.4 + Math.sin(time * 15) * 0.3 : 0.1 + Math.sin(time * 3) * 0.05;
  ctx.fillStyle = `rgba(5, 2, 12, ${flicker * 0.7})`;
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.05, size * 0.03, size * 0.02 * (1 + mouthOpen), 0, 0, TAU);
  ctx.fill();
  // Scream energy particles emitting from mouth when attacking
  if (isAttacking) {
    for (let sp = 0; sp < 4; sp++) {
      const spPhase = (time * 3 + sp * 0.3) % 1;
      const spx = x + Math.sin(time * 5 + sp) * size * 0.02;
      const spy = headY + size * 0.05 - spPhase * size * 0.08;
      ctx.fillStyle = `rgba(160, 140, 220, ${(1 - spPhase) * flicker * 0.4})`;
      ctx.beginPath();
      ctx.arc(spx, spy, size * 0.005 * (1 - spPhase), 0, TAU);
      ctx.fill();
    }
  }

  // Ghostly mist around lower body
  ctx.save();
  ctx.globalAlpha = flicker * 0.35;
  for (let mist = 0; mist < 8; mist++) {
    const mistPhase = (time * 0.5 + mist * 0.2) % 1;
    const mistX = x + Math.sin(time * 1.5 + mist * 1.1) * size * 0.25;
    const mistY = y + size * 0.1 + mistPhase * size * 0.3 + hover;
    const mistAlpha = (1 - mistPhase) * 0.25;
    const mistRad = size * 0.03 * (1 + mistPhase * 0.6);
    ctx.fillStyle = `rgba(140, 140, 180, ${mistAlpha})`;
    ctx.beginPath();
    ctx.ellipse(mistX, mistY, mistRad, mistRad * 0.5, 0, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Shattered chain fragments floating nearby
  for (let cf = 0; cf < 3; cf++) {
    const cfAngle = time * 0.8 + cf * (TAU / 3);
    const cfR = size * 0.3 + Math.sin(time * 1.5 + cf) * size * 0.05;
    const cfx = x + Math.cos(cfAngle) * cfR;
    const cfy = y - size * 0.05 + Math.sin(cfAngle) * cfR * 0.3 + hover;
    ctx.save();
    ctx.translate(cfx, cfy);
    ctx.rotate(time * 2 + cf);
    ctx.globalAlpha = flicker * 0.5;
    ctx.strokeStyle = "#a098b0";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.012, size * 0.008, 0, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Hood draping fabric lines
  ctx.strokeStyle = `rgba(50, 50, 75, ${flicker * 0.4})`;
  ctx.lineWidth = 0.6 * zoom;
  for (let hf = -1; hf <= 1; hf += 2) {
    ctx.beginPath();
    ctx.moveTo(x + hf * size * 0.08, headY - size * 0.08);
    ctx.quadraticCurveTo(
      x + hf * size * 0.12,
      headY + size * 0.02,
      x + hf * size * 0.1,
      headY + size * 0.1,
    );
    ctx.stroke();
  }

  // Secondary ghostly hand marks on body (past victims)
  ctx.save();
  ctx.globalAlpha = flicker * 0.15;
  for (let hm = 0; hm < 3; hm++) {
    const hmx = x + (hm - 1) * size * 0.1;
    const hmy = y + size * 0.05 + hm * size * 0.04 + hover;
    ctx.fillStyle = "rgba(100, 100, 140, 0.5)";
    ctx.beginPath();
    ctx.ellipse(hmx, hmy, size * 0.025, size * 0.015, (hm - 1) * 0.3, 0, TAU);
    ctx.fill();
    // Fingers
    for (let fg = -2; fg <= 2; fg++) {
      ctx.beginPath();
      ctx.moveTo(hmx + fg * size * 0.006, hmy);
      ctx.lineTo(hmx + fg * size * 0.008, hmy - size * 0.015);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Ethereal glow aura
  drawRadialAura(ctx, x, y + hover, size * 0.5, [
    { offset: 0, color: `rgba(140, 120, 200, ${flicker * 0.15})` },
    { offset: 0.5, color: `rgba(100, 80, 160, ${flicker * 0.08})` },
    { offset: 1, color: "rgba(0,0,0,0)" },
  ]);

  // Shadow wisps around body
  drawShadowWisps(ctx, x, y + hover, size * 0.42, time, zoom, {
    color: "rgba(130, 120, 170, 0.3)", count: 6, speed: 1.5, maxAlpha: 0.25, wispLength: 0.45,
  });

  // Cold breath exhale from void face
  for (let cb = 0; cb < 3; cb++) {
    const cbPhase = (time * 1.5 + cb * 0.4) % 1;
    const cbx = x + Math.sin(time * 2 + cb) * size * 0.02;
    const cby = headY + size * 0.08 + cbPhase * size * 0.06;
    const cbAlpha = (1 - cbPhase) * flicker * 0.25;
    ctx.fillStyle = `rgba(160, 160, 200, ${cbAlpha})`;
    ctx.beginPath();
    ctx.ellipse(cbx, cby, size * 0.01 * (1 + cbPhase), size * 0.006, 0, 0, TAU);
    ctx.fill();
  }

  // Spectral crown/circlet barely visible
  ctx.strokeStyle = `rgba(140, 130, 180, ${flicker * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.1, size * 0.08, -Math.PI * 0.7, -Math.PI * 0.3);
  ctx.stroke();
  // Crown jewel
  ctx.fillStyle = `rgba(160, 100, 255, ${flicker * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.17, size * 0.008, 0, TAU);
  ctx.fill();

  // Orbiting spectral fragments
  drawOrbitingDebris(ctx, x, y + hover, size, time, zoom, {
    color: `rgba(160, 150, 200, ${flicker * 0.4})`, glowColor: `rgba(120, 110, 170, ${flicker * 0.3})`,
    count: 4, minRadius: 0.35, maxRadius: 0.45, particleSize: 0.015, speed: 0.6,
  });
}

// ============================================================================
// 15. BONE MAGE — Skeleton wizard with staff, spell circle, rune fragments
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
  const isAttacking = attackPhase > 0;
  const auraFlare = isAttacking ? attackPhase : 0;
  const bob = Math.sin(time * 2.5) * size * 0.012;
  const headY = y - size * 0.44 - bob;
  const boneW = bodyColorLight;
  const boneM = bodyColor;
  const boneD = bodyColorDark;
  const arcaneP = 0.5 + Math.sin(time * 4) * 0.3;
  const walkCycle = Math.sin(time * 3);
  const leftThighAngle = walkCycle * 0.2;
  const rightThighAngle = -walkCycle * 0.2;
  const leftKneeBend = Math.max(0, -walkCycle) * 0.35;
  const rightKneeBend = Math.max(0, walkCycle) * 0.35;
  const thighLen = size * 0.16;
  const shinLen = size * 0.15;

  // SPELL CIRCLE at feet
  ctx.save();
  ctx.translate(x, y + size * 0.5);
  ctx.rotate(time * 0.5);
  ctx.strokeStyle = `rgba(140, 60, 220, ${arcaneP * 0.4 + auraFlare * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.32, size * 0.095, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.22, size * 0.065, 0, 0, TAU);
  ctx.stroke();
  // Rotating rune marks
  for (let r = 0; r < 6; r++) {
    const ra = (r / 6) * TAU;
    const rx = Math.cos(ra) * size * 0.27;
    const ry = Math.sin(ra) * size * 0.08;
    ctx.fillStyle = `rgba(180, 100, 255, ${arcaneP * 0.55})`;
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(-time * 0.5 + ra);
    ctx.fillRect(-size * 0.01, -size * 0.01, size * 0.02, size * 0.02);
    ctx.restore();
  }
  // Pentagram-like connecting lines
  for (let p = 0; p < 5; p++) {
    const pa1 = (p / 5) * TAU;
    const pa2 = ((p + 2) / 5) * TAU;
    ctx.strokeStyle = `rgba(140, 60, 220, ${arcaneP * 0.2})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(Math.cos(pa1) * size * 0.22, Math.sin(pa1) * size * 0.065);
    ctx.lineTo(Math.cos(pa2) * size * 0.22, Math.sin(pa2) * size * 0.065);
    ctx.stroke();
  }
  ctx.restore();

  // Ground shadow
  ctx.fillStyle = "rgba(30,10,50,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.3, size * 0.08, 0, 0, TAU);
  ctx.fill();

  // LEFT LEG — articulated bone
  ctx.save();
  ctx.translate(x - size * 0.1, y + size * 0.16);
  ctx.rotate(leftThighAngle);
  // Thigh bone
  const bmLThigh = ctx.createLinearGradient(0, 0, 0, thighLen);
  bmLThigh.addColorStop(0, boneW);
  bmLThigh.addColorStop(1, boneD);
  ctx.fillStyle = bmLThigh;
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, 0);
  ctx.lineTo(-size * 0.03, thighLen);
  ctx.lineTo(size * 0.03, thighLen);
  ctx.lineTo(size * 0.035, 0);
  ctx.closePath();
  ctx.fill();
  // Knee
  ctx.fillStyle = boneM;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.03, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  // Shin
  ctx.fillStyle = boneD;
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, 0);
  ctx.lineTo(-size * 0.022, shinLen);
  ctx.lineTo(size * 0.022, shinLen);
  ctx.lineTo(size * 0.028, 0);
  ctx.closePath();
  ctx.fill();
  // Foot bone
  ctx.fillStyle = boneM;
  ctx.beginPath();
  ctx.ellipse(0, shinLen + size * 0.01, size * 0.04, size * 0.018, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // RIGHT LEG — articulated bone
  ctx.save();
  ctx.translate(x + size * 0.1, y + size * 0.16);
  ctx.rotate(rightThighAngle);
  const bmRThigh = ctx.createLinearGradient(0, 0, 0, thighLen);
  bmRThigh.addColorStop(0, boneW);
  bmRThigh.addColorStop(1, boneD);
  ctx.fillStyle = bmRThigh;
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, 0);
  ctx.lineTo(-size * 0.03, thighLen);
  ctx.lineTo(size * 0.03, thighLen);
  ctx.lineTo(size * 0.035, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = boneM;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.03, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  ctx.fillStyle = boneD;
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, 0);
  ctx.lineTo(-size * 0.022, shinLen);
  ctx.lineTo(size * 0.022, shinLen);
  ctx.lineTo(size * 0.028, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = boneM;
  ctx.beginPath();
  ctx.ellipse(0, shinLen + size * 0.01, size * 0.04, size * 0.018, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // DARK WIZARD ROBES — custom path over bone torso
  const robeTop = y - size * 0.12 - bob;
  const robeBot = y + size * 0.22;
  const robeGrad = ctx.createLinearGradient(x, robeTop, x, robeBot);
  robeGrad.addColorStop(0, "#1a102a");
  robeGrad.addColorStop(0.5, "#120820");
  robeGrad.addColorStop(1, "#0a0515");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, robeTop);
  ctx.quadraticCurveTo(x - size * 0.2, (robeTop + robeBot) * 0.5, x - size * 0.18, robeBot);
  ctx.lineTo(x + size * 0.18, robeBot);
  ctx.quadraticCurveTo(x + size * 0.2, (robeTop + robeBot) * 0.5, x + size * 0.16, robeTop);
  ctx.closePath();
  ctx.fill();

  // Arcane symbols on robe
  ctx.strokeStyle = `rgba(160, 80, 240, ${arcaneP * 0.3})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let sym = 0; sym < 3; sym++) {
    const symX = x - size * 0.06 + sym * size * 0.06;
    const symY = y + size * 0.02 - bob;
    ctx.beginPath();
    ctx.arc(symX, symY, size * 0.015, 0, TAU);
    ctx.stroke();
  }

  // BONE TORSO visible through open robe front
  const torsoGrad = ctx.createLinearGradient(x - size * 0.08, y - size * 0.15, x + size * 0.08, y + size * 0.08);
  torsoGrad.addColorStop(0, boneD);
  torsoGrad.addColorStop(0.5, boneW);
  torsoGrad.addColorStop(1, boneD);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y + size * 0.12 - bob);
  ctx.lineTo(x - size * 0.08, y - size * 0.18 - bob);
  ctx.quadraticCurveTo(x, y - size * 0.22 - bob, x + size * 0.08, y - size * 0.18 - bob);
  ctx.lineTo(x + size * 0.05, y + size * 0.12 - bob);
  ctx.closePath();
  ctx.fill();

  // Rib cage lines
  ctx.strokeStyle = boneD;
  ctx.lineWidth = 0.8 * zoom;
  for (let r = 0; r < 4; r++) {
    const ry = y - size * 0.15 + r * size * 0.055 - bob;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.06, ry);
    ctx.quadraticCurveTo(x, ry + size * 0.015, x + size * 0.06, ry);
    ctx.stroke();
  }

  // Purple energy veins on bones
  ctx.strokeStyle = `rgba(160, 80, 240, ${arcaneP * 0.55})`;
  ctx.lineWidth = 1 * zoom;
  for (let v = 0; v < 3; v++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.06 + v * size * 0.04, y - size * 0.18 - bob);
    ctx.quadraticCurveTo(
      x + Math.sin(time * 2 + v) * size * 0.025,
      y - size * 0.06 - bob,
      x - size * 0.04 + v * size * 0.04,
      y + size * 0.06 - bob,
    );
    ctx.stroke();
  }

  // STAFF (right hand) — skull-topped with glowing purple orb
  ctx.save();
  ctx.translate(x + size * 0.16, y - size * 0.2 - bob);
  const staffRot = isAttacking ? Math.sin(time * 12) * 0.4 : Math.sin(time * 2) * 0.1;
  ctx.rotate(0.2 + staffRot);
  // Bone hand
  ctx.fillStyle = boneW;
  ctx.beginPath();
  ctx.arc(0, size * 0.06, size * 0.025, 0, TAU);
  ctx.fill();
  // Staff shaft
  const staffBodyGrad = ctx.createLinearGradient(0, -size * 0.05, 0, size * 0.48);
  staffBodyGrad.addColorStop(0, "#5a4830");
  staffBodyGrad.addColorStop(0.5, "#7a6040");
  staffBodyGrad.addColorStop(1, "#3a2818");
  ctx.strokeStyle = staffBodyGrad;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.05);
  ctx.lineTo(0, size * 0.48);
  ctx.stroke();
  // Skull on staff top
  ctx.fillStyle = "#d0c8b8";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.07, size * 0.035, size * 0.04, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#1a0a2e";
  ctx.beginPath();
  ctx.arc(-size * 0.012, -size * 0.075, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.012, -size * 0.075, size * 0.008, 0, TAU);
  ctx.fill();
  // Glowing orb in skull's mouth
  const staffOrbGrad = ctx.createRadialGradient(0, -size * 0.045, 0, 0, -size * 0.045, size * 0.04);
  staffOrbGrad.addColorStop(0, `rgba(200, 120, 255, ${arcaneP * 0.85 + auraFlare * 0.15})`);
  staffOrbGrad.addColorStop(0.5, `rgba(140, 60, 220, ${arcaneP * 0.5})`);
  staffOrbGrad.addColorStop(1, "rgba(100,30,180,0)");
  setShadowBlur(ctx, 6 * zoom, `rgba(160, 80, 240, ${arcaneP})`);
  ctx.fillStyle = staffOrbGrad;
  ctx.beginPath();
  ctx.arc(0, -size * 0.045, size * 0.035, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  ctx.restore();

  // LEFT ARM — casting with purple energy
  ctx.save();
  ctx.translate(x - size * 0.16, y - size * 0.2 - bob);
  const castAngle = isAttacking ? -0.6 + Math.sin(time * 14) * 0.4 : -0.5 + Math.sin(time * 2) * 0.15;
  ctx.rotate(castAngle);
  // Sleeve
  ctx.fillStyle = "#120820";
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, 0);
  ctx.lineTo(-size * 0.04, size * 0.12);
  ctx.lineTo(size * 0.04, size * 0.12);
  ctx.lineTo(size * 0.035, 0);
  ctx.closePath();
  ctx.fill();
  // Bone forearm
  ctx.fillStyle = boneW;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, size * 0.12);
  ctx.lineTo(-size * 0.02, size * 0.22);
  ctx.lineTo(size * 0.02, size * 0.22);
  ctx.lineTo(size * 0.025, size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Skeletal hand
  ctx.fillStyle = boneM;
  ctx.beginPath();
  ctx.arc(0, size * 0.24, size * 0.022, 0, TAU);
  ctx.fill();
  // Purple energy crackling from hand
  if (isAttacking || arcaneP > 0.5) {
    setShadowBlur(ctx, 5 * zoom, `rgba(160, 80, 240, ${arcaneP * 0.7})`);
    for (let e = 0; e < 3; e++) {
      const ea = (e / 3) * TAU + time * 5;
      ctx.strokeStyle = `rgba(180, 100, 255, ${arcaneP * 0.6})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, size * 0.24);
      ctx.lineTo(
        Math.cos(ea) * size * 0.05 + Math.sin(time * 8 + e) * size * 0.02,
        size * 0.24 + Math.sin(ea) * size * 0.05,
      );
      ctx.stroke();
    }
    clearShadow(ctx);
  }
  ctx.restore();

  // SKULL HEAD with hood
  // Hood shape
  const bmHoodGrad = ctx.createRadialGradient(x, headY - size * 0.02, 0, x, headY, size * 0.16);
  bmHoodGrad.addColorStop(0, "#1a102a");
  bmHoodGrad.addColorStop(0.5, "#120820");
  bmHoodGrad.addColorStop(1, "#0a0515");
  ctx.fillStyle = bmHoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, headY + size * 0.06);
  ctx.quadraticCurveTo(x - size * 0.14, headY - size * 0.06, x, headY - size * 0.16);
  ctx.quadraticCurveTo(x + size * 0.14, headY - size * 0.06, x + size * 0.12, headY + size * 0.06);
  ctx.quadraticCurveTo(x, headY + size * 0.1, x - size * 0.12, headY + size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Skull face
  const bmSkullGrad = ctx.createRadialGradient(x, headY + size * 0.01, 0, x, headY + size * 0.01, size * 0.08);
  bmSkullGrad.addColorStop(0, boneW);
  bmSkullGrad.addColorStop(0.6, boneM);
  bmSkullGrad.addColorStop(1, boneD);
  ctx.fillStyle = bmSkullGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.01, size * 0.075, size * 0.085, 0, 0, TAU);
  ctx.fill();

  // Purple glowing eyes
  setShadowBlur(ctx, 6 * zoom, `rgba(160, 80, 240, ${arcaneP})`);
  ctx.fillStyle = `rgba(180, 100, 255, ${arcaneP})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.03, headY - size * 0.005, size * 0.016, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.03, headY - size * 0.005, size * 0.016, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Jaw
  ctx.strokeStyle = boneD;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, headY + size * 0.055);
  ctx.quadraticCurveTo(x, headY + size * 0.08, x + size * 0.04, headY + size * 0.055);
  ctx.stroke();

  // Floating rune fragments
  for (let fr = 0; fr < 4; fr++) {
    drawFloatingPiece(ctx, x + (fr - 1.5) * size * 0.18, y - size * 0.3 - bob, size, time, fr * (TAU / 4), {
      color: `rgba(160, 80, 240, ${arcaneP * 0.4})`,
      colorEdge: `rgba(120, 40, 200, ${arcaneP * 0.3})`,
      width: 0.02, height: 0.02, bobSpeed: 2 + fr * 0.3, bobAmt: 0.04, rotateSpeed: 1.5 - fr * 0.3,
    });
  }
}

// ============================================================================
// 16. DARK PRIEST — Deep crimson/black robed cleric with censer and staff
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
  const isAttacking = attackPhase > 0;
  const sway = Math.sin(time * 2) * size * 0.006;
  const bob = Math.abs(Math.sin(time * 3)) * size * 0.008;
  const headY = y - size * 0.46 - bob;
  const unholyGlow = 0.4 + Math.sin(time * 3.5) * 0.3;
  const walkCycle = Math.sin(time * 3);
  const thighLen = size * 0.16;
  const shinLen = size * 0.14;

  // Unholy ground glyph
  ctx.save();
  ctx.translate(x, y + size * 0.5);
  ctx.rotate(time * 0.15);
  ctx.strokeStyle = `rgba(180, 40, 60, ${unholyGlow * 0.3})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.28, size * 0.08, 0, 0, TAU);
  ctx.stroke();
  for (let g = 0; g < 5; g++) {
    const ga = (g / 5) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ga) * size * 0.12, Math.sin(ga) * size * 0.035);
    ctx.lineTo(Math.cos(ga) * size * 0.26, Math.sin(ga) * size * 0.075);
    ctx.stroke();
  }
  ctx.restore();

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.32, size * 0.09, 0, 0, TAU);
  ctx.fill();

  // ARTICULATED LEGS under robes (peek out at bottom)
  ctx.save();
  ctx.translate(x - size * 0.08, y + size * 0.22);
  ctx.rotate(walkCycle * 0.18);
  ctx.fillStyle = "#1a0a0a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, 0);
  ctx.lineTo(-size * 0.03, thighLen + shinLen);
  ctx.lineTo(size * 0.03, thighLen + shinLen);
  ctx.lineTo(size * 0.035, 0);
  ctx.closePath();
  ctx.fill();
  // Boot
  ctx.fillStyle = "#2a1515";
  ctx.beginPath();
  ctx.ellipse(0, thighLen + shinLen + size * 0.01, size * 0.045, size * 0.02, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(x + size * 0.08, y + size * 0.22);
  ctx.rotate(-walkCycle * 0.18);
  ctx.fillStyle = "#1a0a0a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, 0);
  ctx.lineTo(-size * 0.03, thighLen + shinLen);
  ctx.lineTo(size * 0.03, thighLen + shinLen);
  ctx.lineTo(size * 0.035, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2a1515";
  ctx.beginPath();
  ctx.ellipse(0, thighLen + shinLen + size * 0.01, size * 0.045, size * 0.02, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // DARK CRIMSON ROBES — custom path torso
  const robeTop = y - size * 0.15 - bob;
  const robeBot = y + size * 0.4;
  const robeGrad = ctx.createLinearGradient(x + sway, robeTop, x + sway, robeBot);
  robeGrad.addColorStop(0, "#3a1218");
  robeGrad.addColorStop(0.3, "#2a0a0e");
  robeGrad.addColorStop(0.6, "#1a0608");
  robeGrad.addColorStop(1, "#0d0305");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x + sway - size * 0.2, robeTop);
  ctx.quadraticCurveTo(x + sway - size * 0.28, (robeTop + robeBot) * 0.5, x + sway - size * 0.25, robeBot);
  ctx.lineTo(x + sway + size * 0.25, robeBot);
  ctx.quadraticCurveTo(x + sway + size * 0.28, (robeTop + robeBot) * 0.5, x + sway + size * 0.2, robeTop);
  ctx.closePath();
  ctx.fill();

  // Robe fabric folds
  ctx.strokeStyle = "rgba(80,20,30,0.3)";
  ctx.lineWidth = 0.8 * zoom;
  for (let fold = -2; fold <= 2; fold++) {
    const foldX = x + sway + fold * size * 0.07;
    ctx.beginPath();
    ctx.moveTo(foldX, robeTop + size * 0.06);
    ctx.quadraticCurveTo(foldX + fold * size * 0.01, (robeTop + robeBot) * 0.55, foldX + fold * size * 0.015, robeBot - size * 0.04);
    ctx.stroke();
  }

  // Robe hem tatter
  ctx.strokeStyle = "#0d0305";
  ctx.lineWidth = 0.8 * zoom;
  for (let t = 0; t < 6; t++) {
    const tx = x + sway - size * 0.22 + t * size * 0.09;
    ctx.beginPath();
    ctx.moveTo(tx, robeBot);
    ctx.lineTo(tx + Math.sin(time * 2 + t) * size * 0.008, robeBot + size * 0.02 + Math.sin(time + t) * size * 0.01);
    ctx.stroke();
  }

  // CORRUPTED HOLY SYMBOL on chest
  const symCX = x + sway;
  const symCY = y - size * 0.08 - bob;
  setShadowBlur(ctx, 5 * zoom, `rgba(200, 40, 40, ${unholyGlow})`);
  ctx.strokeStyle = `rgba(220, 50, 50, ${unholyGlow * 0.8})`;
  ctx.lineWidth = 1.8 * zoom;
  // Inverted cross
  ctx.beginPath();
  ctx.moveTo(symCX, symCY - size * 0.03);
  ctx.lineTo(symCX, symCY + size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(symCX - size * 0.025, symCY + size * 0.02);
  ctx.lineTo(symCX + size * 0.025, symCY + size * 0.02);
  ctx.stroke();
  // Glow ring around symbol
  ctx.strokeStyle = `rgba(200, 40, 40, ${unholyGlow * 0.35})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(symCX, symCY + size * 0.01, size * 0.04, 0, TAU);
  ctx.stroke();
  clearShadow(ctx);

  // Book chained to belt
  const bookX = x + size * 0.15 + sway;
  const bookY = y + size * 0.12 - bob;
  ctx.fillStyle = "#3a1010";
  ctx.fillRect(bookX - size * 0.025, bookY - size * 0.03, size * 0.05, size * 0.06);
  ctx.strokeStyle = "#6a5848";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(bookX, bookY - size * 0.03);
  ctx.lineTo(bookX - size * 0.03, y + size * 0.05 - bob);
  ctx.stroke();

  // CENSER ARM (left) — swinging on chain with smoke
  ctx.save();
  ctx.translate(x - size * 0.2 + sway, y - size * 0.22 - bob);
  const censerSwing = Math.sin(time * 3) * 0.45;
  ctx.rotate(-0.3 + censerSwing);
  // Arm sleeve
  ctx.fillStyle = "#1a0608";
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, 0);
  ctx.lineTo(-size * 0.035, size * 0.13);
  ctx.lineTo(size * 0.035, size * 0.13);
  ctx.lineTo(size * 0.04, 0);
  ctx.closePath();
  ctx.fill();
  // Hand
  ctx.fillStyle = "#c0b0a0";
  ctx.beginPath();
  ctx.arc(0, size * 0.14, size * 0.022, 0, TAU);
  ctx.fill();
  // Chain
  ctx.strokeStyle = "#8a8090";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.15);
  ctx.lineTo(0, size * 0.3);
  ctx.stroke();
  // Censer body
  const censerGrad = ctx.createRadialGradient(0, size * 0.32, 0, 0, size * 0.32, size * 0.03);
  censerGrad.addColorStop(0, "#8a7868");
  censerGrad.addColorStop(1, "#5a4838");
  ctx.fillStyle = censerGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, size * 0.28);
  ctx.lineTo(-size * 0.03, size * 0.32);
  ctx.lineTo(-size * 0.025, size * 0.36);
  ctx.lineTo(size * 0.025, size * 0.36);
  ctx.lineTo(size * 0.03, size * 0.32);
  ctx.lineTo(size * 0.025, size * 0.28);
  ctx.closePath();
  ctx.fill();
  // Smoke particles from censer
  for (let s = 0; s < 5; s++) {
    const sPhase = (time * 1.5 + s * 0.25) % 1;
    const sx = Math.sin(time * 2 + s * 0.7) * size * 0.04;
    const sy = size * 0.3 - sPhase * size * 0.2;
    const sAlpha = (1 - sPhase) * 0.35;
    const sRad = size * 0.012 * (1 + sPhase * 0.8);
    ctx.fillStyle = `rgba(100, 60, 80, ${sAlpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sRad, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // STAFF ARM (right) — staff with lantern top
  ctx.save();
  ctx.translate(x + size * 0.2 + sway, y - size * 0.22 - bob);
  const staffAngle = isAttacking ? Math.sin(time * 10) * 0.3 : 0.15 + Math.sin(time * 1.5) * 0.06;
  ctx.rotate(staffAngle);
  // Arm
  ctx.fillStyle = "#1a0608";
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, 0);
  ctx.lineTo(-size * 0.03, size * 0.12);
  ctx.lineTo(size * 0.03, size * 0.12);
  ctx.lineTo(size * 0.035, 0);
  ctx.closePath();
  ctx.fill();
  // Hand
  ctx.fillStyle = "#c0b0a0";
  ctx.beginPath();
  ctx.arc(0, size * 0.13, size * 0.022, 0, TAU);
  ctx.fill();
  // Staff shaft
  ctx.strokeStyle = "#4a3020";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.05);
  ctx.lineTo(0, size * 0.5);
  ctx.stroke();
  // Lantern at top
  ctx.fillStyle = "#6a5838";
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, size * 0.02);
  ctx.lineTo(-size * 0.025, size * 0.05);
  ctx.lineTo(size * 0.025, size * 0.05);
  ctx.lineTo(size * 0.02, size * 0.02);
  ctx.closePath();
  ctx.fill();
  // Lantern glow
  const lanternGrad = ctx.createRadialGradient(0, size * 0.01, 0, 0, size * 0.01, size * 0.04);
  lanternGrad.addColorStop(0, `rgba(220, 60, 40, ${unholyGlow * 0.7})`);
  lanternGrad.addColorStop(0.5, `rgba(180, 40, 30, ${unholyGlow * 0.4})`);
  lanternGrad.addColorStop(1, "rgba(120,20,15,0)");
  ctx.fillStyle = lanternGrad;
  ctx.beginPath();
  ctx.arc(0, size * 0.01, size * 0.035, 0, TAU);
  ctx.fill();
  ctx.restore();

  // DEEP HOOD — pale face visible
  const hoodGrad = ctx.createRadialGradient(x + sway, headY, 0, x + sway, headY, size * 0.16);
  hoodGrad.addColorStop(0, "#3a1218");
  hoodGrad.addColorStop(0.4, "#2a0a0e");
  hoodGrad.addColorStop(0.7, "#1a0608");
  hoodGrad.addColorStop(1, "#0d0305");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x + sway - size * 0.13, headY + size * 0.07);
  ctx.quadraticCurveTo(x + sway - size * 0.15, headY - size * 0.06, x + sway, headY - size * 0.18);
  ctx.quadraticCurveTo(x + sway + size * 0.15, headY - size * 0.06, x + sway + size * 0.13, headY + size * 0.07);
  ctx.quadraticCurveTo(x + sway, headY + size * 0.12, x + sway - size * 0.13, headY + size * 0.07);
  ctx.closePath();
  ctx.fill();

  // Pale face in deep shadow
  ctx.fillStyle = "#c0b0a0";
  ctx.beginPath();
  ctx.ellipse(x + sway, headY + size * 0.02, size * 0.06, size * 0.07, 0, 0, TAU);
  ctx.fill();
  // Face shadow
  ctx.fillStyle = "rgba(10,3,3,0.5)";
  ctx.beginPath();
  ctx.ellipse(x + sway, headY, size * 0.055, size * 0.035, 0, 0, TAU);
  ctx.fill();

  // Glowing red eyes
  drawGlowingEyes(ctx, x + sway, headY + size * 0.01, size, time, {
    spacing: 0.03, eyeRadius: 0.016, pupilRadius: 0.007, glowRadius: 0.04,
    irisColor: `rgba(220, 50, 50, ${unholyGlow})`, glowColor: `rgba(200, 30, 30, ${unholyGlow * 0.45})`,
    pulseSpeed: 3.5,
  });

  // Incense smoke trails rising
  for (let trail = 0; trail < 6; trail++) {
    const tPhase = (time * 0.8 + trail * 0.28) % 1;
    const tx = x + sway + Math.sin(time * 1.5 + trail * 0.8) * size * 0.14;
    const ty = y - tPhase * size * 0.55;
    ctx.fillStyle = `rgba(90, 50, 70, ${(1 - tPhase) * 0.22})`;
    ctx.beginPath();
    ctx.arc(tx, ty, size * 0.012 * (1 + tPhase), 0, TAU);
    ctx.fill();
  }

  // Prayer beads hanging from belt
  ctx.strokeStyle = "#5a4838";
  ctx.lineWidth = 0.8 * zoom;
  const beadStartX = x - size * 0.1 + sway;
  const beadStartY = y + size * 0.12 - bob;
  ctx.beginPath();
  ctx.moveTo(beadStartX, beadStartY);
  ctx.quadraticCurveTo(beadStartX - size * 0.04, beadStartY + size * 0.08, beadStartX - size * 0.02, beadStartY + size * 0.14);
  ctx.stroke();
  for (let bead = 0; bead < 5; bead++) {
    const bt = bead / 4;
    const bx = beadStartX - size * 0.04 * Math.sin(bt * Math.PI) - bt * size * 0.02;
    const by = beadStartY + bt * size * 0.14;
    ctx.fillStyle = bead % 2 === 0 ? "#4a2020" : "#2a1010";
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Floating unholy symbol above head
  const symFY = headY - size * 0.2 + Math.sin(time * 2) * size * 0.025;
  setShadowBlur(ctx, 6 * zoom, `rgba(200, 40, 40, ${unholyGlow})`);
  ctx.strokeStyle = `rgba(220, 50, 50, ${unholyGlow})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.arc(x + sway, symFY, size * 0.045, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + sway, symFY + size * 0.045);
  ctx.lineTo(x + sway, symFY - size * 0.045);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.035 + sway, symFY + size * 0.01);
  ctx.lineTo(x + size * 0.035 + sway, symFY + size * 0.01);
  ctx.stroke();
  clearShadow(ctx);

  // Dark energy particles floating upward
  for (let dp = 0; dp < 4; dp++) {
    const dpPhase = (time * 1.2 + dp * 0.4) % 1;
    const dpx = x + sway + Math.sin(time * 2 + dp * 1.5) * size * 0.15;
    const dpy = y + size * 0.3 - dpPhase * size * 0.6;
    ctx.fillStyle = `rgba(180, 30, 40, ${(1 - dpPhase) * unholyGlow * 0.35})`;
    ctx.beginPath();
    ctx.arc(dpx, dpy, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // Robe collar/stole detail
  ctx.fillStyle = "#3a1218";
  ctx.beginPath();
  ctx.moveTo(x + sway - size * 0.1, y - size * 0.15 - bob);
  ctx.quadraticCurveTo(x + sway, y - size * 0.18 - bob, x + sway + size * 0.1, y - size * 0.15 - bob);
  ctx.lineTo(x + sway + size * 0.06, y - size * 0.08 - bob);
  ctx.quadraticCurveTo(x + sway, y - size * 0.06 - bob, x + sway - size * 0.06, y - size * 0.08 - bob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(180, 40, 50, ${unholyGlow * 0.3})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();
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
  const isAttacking = attackPhase > 0;
  const rage = 0.5 + Math.sin(time * 5) * 0.3;
  const flicker = 0.6 + Math.sin(time * 8) * 0.25;
  const hover = Math.sin(time * 3) * size * 0.015;
  const headY = y - size * 0.44 + hover;
  const walkCycle = Math.sin(time * 4);
  const thighLen = size * 0.17;
  const shinLen = size * 0.15;

  // FURY AURA — red/orange glow
  drawRadialAura(ctx, x, y + hover, size * 0.55, [
    { offset: 0, color: `rgba(220, 60, 20, ${rage * 0.25})` },
    { offset: 0.4, color: `rgba(180, 40, 15, ${rage * 0.12})` },
    { offset: 1, color: "rgba(0,0,0,0)" },
  ]);

  // Rage flame rising pool
  const poolGrad = ctx.createRadialGradient(x, y + size * 0.48, 0, x, y + size * 0.48, size * 0.38);
  poolGrad.addColorStop(0, `rgba(200, 40, 20, ${rage * 0.3})`);
  poolGrad.addColorStop(0.5, `rgba(150, 20, 10, ${rage * 0.15})`);
  poolGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.38, size * 0.11, 0, 0, TAU);
  ctx.fill();

  // Ground shadow
  ctx.fillStyle = "rgba(40,10,5,0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.32, size * 0.09, 0, 0, TAU);
  ctx.fill();

  // Rage flames rising around body
  for (let f = 0; f < 8; f++) {
    const fPhase = (time * 2.5 + f * 0.25) % 1;
    const fx = x - size * 0.25 + f * size * 0.07 + Math.sin(time * 4 + f) * size * 0.03;
    const fy = y + size * 0.42 - fPhase * size * 0.55 + hover;
    const fAlpha = (1 - fPhase) * rage * 0.45;
    ctx.fillStyle = `rgba(255, ${60 + fPhase * 120}, 20, ${fAlpha})`;
    ctx.beginPath();
    ctx.ellipse(fx, fy, size * 0.015, size * 0.04 * (1 - fPhase * 0.4), 0, 0, TAU);
    ctx.fill();
  }

  // Speed motion lines
  ctx.strokeStyle = `rgba(200, 80, 40, ${rage * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  for (let ml = 0; ml < 4; ml++) {
    const mly = y - size * 0.2 + ml * size * 0.12 + hover;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.25, mly);
    ctx.lineTo(x + size * 0.45, mly + size * 0.01);
    ctx.stroke();
  }

  // SPECTRAL LEGS — semi-transparent articulated
  ctx.save();
  ctx.globalAlpha = flicker * 0.65;
  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.11, y + size * 0.16 + hover);
  ctx.rotate(walkCycle * 0.25);
  const revLThigh = ctx.createLinearGradient(0, 0, 0, thighLen);
  revLThigh.addColorStop(0, bodyColor);
  revLThigh.addColorStop(1, bodyColorDark);
  ctx.fillStyle = revLThigh;
  ctx.beginPath();
  ctx.moveTo(-size * 0.045, 0);
  ctx.lineTo(-size * 0.04, thighLen);
  ctx.lineTo(size * 0.04, thighLen);
  ctx.lineTo(size * 0.045, 0);
  ctx.closePath();
  ctx.fill();
  // Knee
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.035, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(Math.max(0, -walkCycle) * 0.35);
  // Shin
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.038, 0);
  ctx.lineTo(-size * 0.032, shinLen);
  ctx.lineTo(size * 0.032, shinLen);
  ctx.lineTo(size * 0.038, 0);
  ctx.closePath();
  ctx.fill();
  // Spectral boot
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(0, shinLen + size * 0.01, size * 0.05, size * 0.022, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.11, y + size * 0.16 + hover);
  ctx.rotate(-walkCycle * 0.25);
  const revRThigh = ctx.createLinearGradient(0, 0, 0, thighLen);
  revRThigh.addColorStop(0, bodyColor);
  revRThigh.addColorStop(1, bodyColorDark);
  ctx.fillStyle = revRThigh;
  ctx.beginPath();
  ctx.moveTo(-size * 0.045, 0);
  ctx.lineTo(-size * 0.04, thighLen);
  ctx.lineTo(size * 0.04, thighLen);
  ctx.lineTo(size * 0.045, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.035, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(Math.max(0, walkCycle) * 0.35);
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.038, 0);
  ctx.lineTo(-size * 0.032, shinLen);
  ctx.lineTo(size * 0.032, shinLen);
  ctx.lineTo(size * 0.038, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(0, shinLen + size * 0.01, size * 0.05, size * 0.022, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.restore();

  // SPECTRAL ARMORED TORSO — custom path
  const armorGrad = ctx.createLinearGradient(x - size * 0.3, y, x + size * 0.3, y);
  armorGrad.addColorStop(0, `rgba(100, 100, 130, ${flicker * 0.25})`);
  armorGrad.addColorStop(0.2, `rgba(160, 160, 190, ${flicker * 0.6})`);
  armorGrad.addColorStop(0.5, `rgba(190, 190, 215, ${flicker * 0.75})`);
  armorGrad.addColorStop(0.8, `rgba(160, 160, 190, ${flicker * 0.6})`);
  armorGrad.addColorStop(1, `rgba(100, 100, 130, ${flicker * 0.25})`);
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y + size * 0.18 + hover);
  ctx.lineTo(x - size * 0.28, y - size * 0.2 + hover);
  ctx.quadraticCurveTo(x, y - size * 0.38 + hover, x + size * 0.28, y - size * 0.2 + hover);
  ctx.lineTo(x + size * 0.25, y + size * 0.18 + hover);
  ctx.closePath();
  ctx.fill();

  // Plate details
  ctx.strokeStyle = `rgba(210, 210, 230, ${flicker * 0.35})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + hover);
  ctx.lineTo(x, y + size * 0.14 + hover);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.06 + hover);
  ctx.lineTo(x + size * 0.22, y - size * 0.06 + hover);
  ctx.stroke();

  // TORN SPECTRAL CAPE
  ctx.save();
  ctx.globalAlpha = flicker * 0.5;
  const capeGrad = ctx.createLinearGradient(x, y - size * 0.3, x, y + size * 0.4);
  capeGrad.addColorStop(0, `rgba(160, 160, 190, 0.4)`);
  capeGrad.addColorStop(1, `rgba(80, 80, 110, 0.1)`);
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.25 + hover);
  ctx.quadraticCurveTo(x - size * 0.22, y + hover, x - size * 0.18, y + size * 0.35 + hover);
  ctx.lineTo(x + size * 0.18, y + size * 0.35 + hover);
  ctx.quadraticCurveTo(x + size * 0.22, y + hover, x + size * 0.15, y - size * 0.25 + hover);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // LEFT ARM
  drawAnimatedArm(ctx, x - size * 0.22, y - size * 0.24 + hover, size, time, zoom, -1, {
    upperLen: 0.16, foreLen: 0.14, width: 0.042, swingSpeed: 4, swingAmt: 0.22,
    color: `rgba(160, 160, 185, ${flicker * 0.65})`, colorDark: `rgba(110, 110, 140, ${flicker * 0.5})`, handRadius: 0.03,
    attackExtra: isAttacking ? 1 : 0,
  });

  // GHOSTLY GREATSWORD wreathed in fire (right hand)
  ctx.save();
  ctx.translate(x + size * 0.22, y - size * 0.22 + hover);
  const swordSwing = isAttacking ? Math.sin(time * 16) * 0.9 : Math.sin(time * 3) * 0.2;
  ctx.rotate(0.3 + swordSwing);
  ctx.globalAlpha = flicker * 0.8;
  // Blade shape
  const bladeGrad = ctx.createLinearGradient(-size * 0.015, 0, size * 0.015, size * 0.45);
  bladeGrad.addColorStop(0, "rgba(200,200,220,0.8)");
  bladeGrad.addColorStop(0.5, "rgba(170,170,195,0.6)");
  bladeGrad.addColorStop(1, "rgba(140,140,170,0.4)");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.08);
  ctx.lineTo(-size * 0.02, size * 0.12);
  ctx.lineTo(-size * 0.018, size * 0.42);
  ctx.lineTo(0, size * 0.46);
  ctx.lineTo(size * 0.018, size * 0.42);
  ctx.lineTo(size * 0.02, size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Blade highlight
  ctx.strokeStyle = "rgba(230,230,255,0.4)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.1);
  ctx.lineTo(0, size * 0.44);
  ctx.stroke();
  // Fire wreathing the blade
  for (let bf = 0; bf < 6; bf++) {
    const bfy = size * 0.1 + bf * size * 0.06;
    const bfx = Math.sin(time * 8 + bf * 1.2) * size * 0.025;
    const bfAlpha = rage * 0.5 * (1 - bf * 0.08);
    ctx.fillStyle = `rgba(255, ${80 + bf * 20}, 20, ${bfAlpha})`;
    ctx.beginPath();
    ctx.ellipse(bfx, bfy, size * 0.02, size * 0.035, 0, 0, TAU);
    ctx.fill();
  }
  // Crossguard
  ctx.fillStyle = "rgba(140,140,160,0.6)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, size * 0.06);
  ctx.lineTo(-size * 0.065, size * 0.09);
  ctx.lineTo(size * 0.065, size * 0.09);
  ctx.lineTo(size * 0.06, size * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // HEAD with burning eyes and flame trails
  const headGrad = ctx.createRadialGradient(x, headY, 0, x, headY, size * 0.13);
  headGrad.addColorStop(0, `rgba(190, 190, 210, ${flicker * 0.85})`);
  headGrad.addColorStop(0.5, `rgba(140, 140, 170, ${flicker * 0.65})`);
  headGrad.addColorStop(1, `rgba(90, 90, 120, ${flicker * 0.35})`);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, size * 0.11, size * 0.13, 0, 0, TAU);
  ctx.fill();

  // Burning red eyes with flame trails
  setShadowBlur(ctx, 10 * zoom, `rgba(255, 50, 20, ${rage})`);
  ctx.fillStyle = `rgba(255, 80, 30, ${rage})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.035, headY - size * 0.01, size * 0.02, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.035, headY - size * 0.01, size * 0.02, 0, TAU);
  ctx.fill();
  // Flame trails from eyes
  for (let ft = 0; ft < 3; ft++) {
    const ftPhase = (time * 4 + ft * 0.4) % 1;
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = `rgba(255, ${60 + ftPhase * 80}, 20, ${(1 - ftPhase) * rage * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        x + side * size * 0.035 + side * ftPhase * size * 0.04,
        headY - size * 0.01 - ftPhase * size * 0.04,
        size * 0.008 * (1 - ftPhase * 0.5),
        0, TAU,
      );
      ctx.fill();
    }
  }
  clearShadow(ctx);

  // Afterimage/motion blur effect (multiple fading copies behind)
  ctx.save();
  for (let ai = 1; ai <= 3; ai++) {
    const aiAlpha = flicker * 0.12 * (1 - ai * 0.25);
    const aiOffset = ai * size * 0.04;
    ctx.globalAlpha = aiAlpha;
    ctx.fillStyle = `rgba(180, 80, 40, 0.3)`;
    ctx.beginPath();
    ctx.ellipse(x + aiOffset, y - size * 0.1 + hover, size * 0.15, size * 0.2, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(160, 60, 30, 0.25)`;
    ctx.beginPath();
    ctx.ellipse(x + aiOffset, headY, size * 0.09, size * 0.1, 0, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Spectral pauldron spikes
  for (let side = -1; side <= 1; side += 2) {
    const spX = x + side * size * 0.2;
    const spY = y - size * 0.3 + hover;
    ctx.fillStyle = `rgba(170, 170, 200, ${flicker * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(spX - size * 0.05, spY + size * 0.03);
    ctx.lineTo(spX, spY - size * 0.05);
    ctx.lineTo(spX + size * 0.05, spY + size * 0.03);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(200, 200, 225, ${flicker * 0.3})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  }

  // Rage aura heat distortion particles
  for (let hp = 0; hp < 6; hp++) {
    const hpPhase = (time * 1.8 + hp * 0.3) % 1;
    const hpx = x + Math.sin(time * 3 + hp * 1.2) * size * 0.2;
    const hpy = y - size * 0.1 + hover - hpPhase * size * 0.3;
    const hpAlpha = (1 - hpPhase) * rage * 0.2;
    ctx.fillStyle = `rgba(255, 160, 60, ${hpAlpha})`;
    ctx.beginPath();
    ctx.ellipse(hpx, hpy, size * 0.008, size * 0.015, 0, 0, TAU);
    ctx.fill();
  }

  // Spectral helm visor shape
  ctx.fillStyle = `rgba(15, 10, 25, ${flicker * 0.6})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, headY + size * 0.01);
  ctx.lineTo(x + size * 0.06, headY + size * 0.01);
  ctx.lineTo(x + size * 0.05, headY + size * 0.03);
  ctx.lineTo(x - size * 0.05, headY + size * 0.03);
  ctx.closePath();
  ctx.fill();

  // Belt/waist sash detail
  ctx.strokeStyle = `rgba(180, 180, 210, ${flicker * 0.35})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y + size * 0.14 + hover);
  ctx.quadraticCurveTo(x, y + size * 0.16 + hover, x + size * 0.18, y + size * 0.14 + hover);
  ctx.stroke();

  // Shadow wisps
  drawShadowWisps(ctx, x, y + hover, size * 0.38, time, zoom, {
    color: "rgba(200, 60, 30, 0.3)", count: 5, speed: 1.8, maxAlpha: 0.28, wispLength: 0.38,
  });

  // Pulsing rage rings
  drawPulsingGlowRings(ctx, x, y + hover, size, time, zoom, {
    color: `rgba(220, 60, 20, ${rage * 0.12})`,
    count: 2, speed: 1.5, lineWidth: 1.5,
  });
}

// ============================================================================
// 18. ABOMINATION (BOSS) — Stitched hulking horror with 4 arms
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
  const isAttacking = attackPhase > 0;
  const lurch = Math.sin(time * 2) * size * 0.018;
  const breathe = Math.sin(time * 1.5) * 0.04;
  const bob = Math.abs(Math.sin(time * 2.5)) * size * 0.018;
  const headY = y - size * 0.45 - bob;
  const walkCycle = Math.sin(time * 2);
  const thighLen = size * 0.22;
  const shinLen = size * 0.2;

  // Heavy ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.56, size * 0.5, size * 0.15, 0, 0, TAU);
  ctx.fill();

  // Ground impact cracks
  ctx.strokeStyle = "rgba(60,50,40,0.3)";
  ctx.lineWidth = 1.2 * zoom;
  for (let cr = 0; cr < 5; cr++) {
    const crAngle = (cr / 5) * TAU + Math.sin(time * 0.5) * 0.1;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(crAngle) * size * 0.15, y + size * 0.52 + Math.sin(crAngle) * size * 0.04);
    ctx.lineTo(x + Math.cos(crAngle) * size * 0.35, y + size * 0.52 + Math.sin(crAngle) * size * 0.1);
    ctx.stroke();
  }

  // Chains dragging on ground
  ctx.strokeStyle = "#6a6878";
  ctx.lineWidth = 2.5 * zoom;
  for (let ch = 0; ch < 3; ch++) {
    const chx = x - size * 0.32 + ch * size * 0.32;
    ctx.beginPath();
    ctx.moveTo(chx, y + size * 0.32 - bob);
    for (let seg = 0; seg < 5; seg++) {
      ctx.lineTo(
        chx + Math.sin(time * 1.5 + ch + seg) * size * 0.05,
        y + size * 0.38 + seg * size * 0.05,
      );
    }
    ctx.stroke();
  }
  // Chain ball (dragging)
  ctx.fillStyle = "#5a5868";
  ctx.beginPath();
  ctx.arc(x + size * 0.35, y + size * 0.55, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#6a6878";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y + size * 0.42 - bob);
  ctx.lineTo(x + size * 0.35, y + size * 0.55);
  ctx.stroke();

  // MASSIVE MISMATCHED LEGS — articulated, different sizes
  // Left leg (larger)
  ctx.save();
  ctx.translate(x - size * 0.15 + lurch, y + size * 0.22);
  ctx.rotate(walkCycle * 0.12);
  const abLThigh = ctx.createLinearGradient(-size * 0.07, 0, size * 0.07, thighLen);
  abLThigh.addColorStop(0, bodyColor);
  abLThigh.addColorStop(0.5, bodyColorLight);
  abLThigh.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abLThigh;
  ctx.beginPath();
  ctx.moveTo(-size * 0.07, 0);
  ctx.lineTo(-size * 0.065, thighLen);
  ctx.lineTo(size * 0.065, thighLen);
  ctx.lineTo(size * 0.07, 0);
  ctx.closePath();
  ctx.fill();
  // Stitch on thigh
  ctx.strokeStyle = "#4a3828";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, thighLen * 0.3);
  ctx.lineTo(size * 0.04, thighLen * 0.5);
  ctx.stroke();
  for (let st = 0; st < 3; st++) {
    const t = 0.3 + st * 0.07;
    const sx = -size * 0.04 + (size * 0.08) * ((t - 0.3) / 0.14);
    const sy = thighLen * (0.3 + (0.2) * ((t - 0.3) / 0.14));
    ctx.beginPath();
    ctx.moveTo(sx - size * 0.012, sy - size * 0.012);
    ctx.lineTo(sx + size * 0.012, sy + size * 0.012);
    ctx.stroke();
  }
  // Knee
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.05, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(Math.max(0, -walkCycle) * 0.25);
  // Shin
  const abLShin = ctx.createLinearGradient(0, 0, 0, shinLen);
  abLShin.addColorStop(0, bodyColor);
  abLShin.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abLShin;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.lineTo(-size * 0.05, shinLen);
  ctx.lineTo(size * 0.05, shinLen);
  ctx.lineTo(size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  // Heavy boot/wrapping
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, shinLen - size * 0.01);
  ctx.lineTo(-size * 0.08, shinLen + size * 0.04);
  ctx.lineTo(size * 0.08, shinLen + size * 0.04);
  ctx.lineTo(size * 0.06, shinLen - size * 0.01);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right leg (slightly smaller, different color patch)
  ctx.save();
  ctx.translate(x + size * 0.12 + lurch, y + size * 0.22);
  ctx.rotate(-walkCycle * 0.12);
  const abRThigh = ctx.createLinearGradient(0, 0, 0, thighLen * 0.9);
  abRThigh.addColorStop(0, "#8a7060");
  abRThigh.addColorStop(0.5, bodyColor);
  abRThigh.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abRThigh;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.lineTo(-size * 0.055, thighLen * 0.9);
  ctx.lineTo(size * 0.055, thighLen * 0.9);
  ctx.lineTo(size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, thighLen * 0.9, size * 0.045, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen * 0.9);
  ctx.rotate(Math.max(0, walkCycle) * 0.25);
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.lineTo(-size * 0.04, shinLen * 0.9);
  ctx.lineTo(size * 0.04, shinLen * 0.9);
  ctx.lineTo(size * 0.05, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, shinLen * 0.9 - size * 0.01);
  ctx.lineTo(-size * 0.07, shinLen * 0.9 + size * 0.035);
  ctx.lineTo(size * 0.07, shinLen * 0.9 + size * 0.035);
  ctx.lineTo(size * 0.055, shinLen * 0.9 - size * 0.01);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // HULKING TORSO — custom path, massive and bloated
  ctx.save();
  ctx.translate(x + lurch, y - size * 0.08 - bob);
  ctx.rotate(breathe);
  const torsoGrad = ctx.createRadialGradient(0, 0, 0, 0, size * 0.05, size * 0.35);
  torsoGrad.addColorStop(0, bodyColorLight);
  torsoGrad.addColorStop(0.25, bodyColor);
  torsoGrad.addColorStop(0.6, bodyColorDark);
  torsoGrad.addColorStop(1, "#1a1210");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, size * 0.25);
  ctx.lineTo(-size * 0.34, -size * 0.08);
  ctx.quadraticCurveTo(-size * 0.25, -size * 0.32, 0, -size * 0.34);
  ctx.quadraticCurveTo(size * 0.25, -size * 0.32, size * 0.34, -size * 0.08);
  ctx.lineTo(size * 0.3, size * 0.25);
  ctx.quadraticCurveTo(0, size * 0.35, -size * 0.3, size * 0.25);
  ctx.closePath();
  ctx.fill();

  // Bloated belly bulge
  ctx.fillStyle = `rgba(${bodyColorLight}, 0.3)`.includes("rgba") ? bodyColorLight : bodyColor;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.08, size * 0.18, size * 0.15, 0.1, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  // VISIBLE STITCHES — cross-stitch pattern
  ctx.strokeStyle = "#4a3828";
  ctx.lineWidth = 1.8 * zoom;
  const stitchLines: number[][][] = [
    [[-0.18, -0.18], [0.12, -0.1]],
    [[-0.12, 0.02], [0.18, 0.1]],
    [[0.0, -0.25], [0.0, 0.2]],
    [[-0.22, 0.12], [0.06, 0.22]],
    [[0.1, -0.15], [0.22, 0.05]],
  ];
  for (const line of stitchLines) {
    ctx.beginPath();
    ctx.moveTo(line[0][0] * size, line[0][1] * size);
    ctx.lineTo(line[1][0] * size, line[1][1] * size);
    ctx.stroke();
    const dx = line[1][0] - line[0][0];
    const dy = line[1][1] - line[0][1];
    for (let st = 0; st < 5; st++) {
      const t = (st + 0.5) / 5;
      const sx = (line[0][0] + dx * t) * size;
      const sy = (line[0][1] + dy * t) * size;
      ctx.beginPath();
      ctx.moveTo(sx - size * 0.015, sy - size * 0.015);
      ctx.lineTo(sx + size * 0.015, sy + size * 0.015);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + size * 0.015, sy - size * 0.015);
      ctx.lineTo(sx - size * 0.015, sy + size * 0.015);
      ctx.stroke();
    }
  }

  // Different colored flesh patches
  ctx.fillStyle = "rgba(130, 100, 75, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.12, -size * 0.12, size * 0.1, size * 0.12, 0.3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(85, 110, 75, 0.25)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.1, size * 0.08, size * 0.12, size * 0.1, -0.2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(110, 80, 100, 0.2)";
  ctx.beginPath();
  ctx.ellipse(size * 0.05, size * 0.18, size * 0.08, size * 0.06, 0.4, 0, TAU);
  ctx.fill();

  // Metal plates bolted on
  ctx.fillStyle = "#5a5868";
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.22);
  ctx.lineTo(-size * 0.08, -size * 0.24);
  ctx.lineTo(-size * 0.06, -size * 0.16);
  ctx.lineTo(-size * 0.13, -size * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#7a7888";
  for (const [bx, by] of [[-0.14, -0.22], [-0.07, -0.23], [-0.12, -0.15], [-0.065, -0.165]] as number[][]) {
    ctx.beginPath();
    ctx.arc(bx * size, by * size, size * 0.008, 0, TAU);
    ctx.fill();
  }
  // Second plate
  ctx.fillStyle = "#5a5868";
  ctx.beginPath();
  ctx.moveTo(size * 0.08, size * 0.02);
  ctx.lineTo(size * 0.18, -size * 0.02);
  ctx.lineTo(size * 0.2, size * 0.06);
  ctx.lineTo(size * 0.1, size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // FOUR ARMS (2 large upper, 2 small lower)
  // Upper left (large)
  drawAnimatedArm(ctx, x - size * 0.32 + lurch, y - size * 0.26 - bob, size, time, zoom, -1, {
    upperLen: 0.22, foreLen: 0.2, width: 0.065, swingSpeed: 2, swingAmt: 0.22,
    color: bodyColor, colorDark: bodyColorDark, handColor: bodyColorDark, handRadius: 0.055,
    attackExtra: isAttacking ? 1.3 : 0,
  });
  // Lower left (small, mismatched)
  drawAnimatedArm(ctx, x - size * 0.28 + lurch, y - size * 0.05 - bob, size, time, zoom, -1, {
    upperLen: 0.15, foreLen: 0.13, width: 0.048, swingSpeed: 2.5, swingAmt: 0.2,
    phaseOffset: Math.PI * 0.7, color: "#8a7060", colorDark: bodyColorDark, handRadius: 0.038,
    attackExtra: isAttacking ? 0.9 : 0,
  });
  // Upper right (large)
  drawAnimatedArm(ctx, x + size * 0.32 + lurch, y - size * 0.26 - bob, size, time, zoom, 1, {
    upperLen: 0.22, foreLen: 0.2, width: 0.065, swingSpeed: 2, swingAmt: 0.22,
    phaseOffset: Math.PI, color: bodyColor, colorDark: bodyColorDark, handColor: bodyColorDark, handRadius: 0.055,
    attackExtra: isAttacking ? 1.3 : 0,
  });
  // Lower right (small)
  drawAnimatedArm(ctx, x + size * 0.28 + lurch, y - size * 0.05 - bob, size, time, zoom, 1, {
    upperLen: 0.15, foreLen: 0.13, width: 0.048, swingSpeed: 2.5, swingAmt: 0.2,
    phaseOffset: Math.PI * 1.7, color: "#85a070", colorDark: bodyColorDark, handRadius: 0.038,
    attackExtra: isAttacking ? 0.9 : 0,
  });

  // TINY HEAD on hulking body
  const abHeadGrad = ctx.createRadialGradient(x + lurch, headY, 0, x + lurch, headY, size * 0.1);
  abHeadGrad.addColorStop(0, bodyColorLight);
  abHeadGrad.addColorStop(0.5, bodyColor);
  abHeadGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abHeadGrad;
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY, size * 0.09, size * 0.1, 0.1, 0, TAU);
  ctx.fill();

  // Stitch across face
  ctx.strokeStyle = "#4a3828";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06 + lurch, headY - size * 0.04);
  ctx.lineTo(x + size * 0.06 + lurch, headY + size * 0.02);
  ctx.stroke();
  for (let fs = 0; fs < 4; fs++) {
    const t = (fs + 0.5) / 4;
    const fsx = x - size * 0.06 + lurch + t * size * 0.12;
    const fsy = headY - size * 0.04 + t * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(fsx - size * 0.01, fsy - size * 0.01);
    ctx.lineTo(fsx + size * 0.01, fsy + size * 0.01);
    ctx.stroke();
  }

  // Mismatched eyes
  ctx.fillStyle = "#e04040";
  ctx.beginPath();
  ctx.arc(x - size * 0.03 + lurch, headY - size * 0.02, size * 0.02, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#40c040";
  ctx.beginPath();
  ctx.arc(x + size * 0.04 + lurch, headY, size * 0.016, 0, TAU);
  ctx.fill();

  // Drool/slobber
  ctx.strokeStyle = "rgba(150,160,140,0.4)";
  ctx.lineWidth = 1 * zoom;
  const droolLen = size * 0.04 + Math.sin(time * 2) * size * 0.02;
  ctx.beginPath();
  ctx.moveTo(x + lurch, headY + size * 0.08);
  ctx.lineTo(x + lurch + Math.sin(time * 3) * size * 0.01, headY + size * 0.08 + droolLen);
  ctx.stroke();

  // Gore/fluid dripping from body
  for (let drip = 0; drip < 4; drip++) {
    const dripX = x + (drip - 1.5) * size * 0.12 + lurch;
    const dripPhase = (time * 0.6 + drip * 0.4) % 1;
    const dripLen = size * 0.03 + dripPhase * size * 0.04;
    ctx.strokeStyle = `rgba(100, 60, 40, ${(1 - dripPhase) * 0.4})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(dripX, y + size * 0.18 - bob);
    ctx.lineTo(dripX + Math.sin(time + drip) * size * 0.005, y + size * 0.18 - bob + dripLen);
    ctx.stroke();
    ctx.fillStyle = `rgba(100, 60, 40, ${(1 - dripPhase) * 0.3})`;
    ctx.beginPath();
    ctx.arc(dripX + Math.sin(time + drip) * size * 0.005, y + size * 0.18 - bob + dripLen, size * 0.005, 0, TAU);
    ctx.fill();
  }

  // Exposed bone fragments poking through flesh
  ctx.fillStyle = "#d8d0c0";
  ctx.save();
  ctx.translate(x + lurch, y - size * 0.08 - bob);
  // Rib fragment
  ctx.beginPath();
  ctx.moveTo(size * 0.2, -size * 0.15);
  ctx.lineTo(size * 0.24, -size * 0.18);
  ctx.lineTo(size * 0.22, -size * 0.14);
  ctx.closePath();
  ctx.fill();
  // Spine bump
  ctx.beginPath();
  ctx.arc(0, -size * 0.28, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.02, -size * 0.25, size * 0.012, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Flies buzzing around
  for (let fly = 0; fly < 5; fly++) {
    const flyAngle = time * 4 + fly * (TAU / 5);
    const flyR = size * 0.22 + Math.sin(time * 3 + fly) * size * 0.05;
    const flyx = x + lurch + Math.cos(flyAngle) * flyR;
    const flyy = y - size * 0.15 - bob + Math.sin(flyAngle) * flyR * 0.4;
    ctx.fillStyle = "rgba(30,30,30,0.5)";
    ctx.beginPath();
    ctx.arc(flyx, flyy, size * 0.004, 0, TAU);
    ctx.fill();
  }

  // Navel/belly button stitch detail
  ctx.save();
  ctx.translate(x + lurch + size * 0.02, y + size * 0.02 - bob);
  ctx.strokeStyle = "#4a3828";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.015, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, 0);
  ctx.lineTo(size * 0.01, 0);
  ctx.stroke();
  ctx.restore();

  // Hook through shoulder
  ctx.save();
  ctx.translate(x - size * 0.2 + lurch, y - size * 0.25 - bob);
  ctx.rotate(-0.3);
  ctx.strokeStyle = "#8a8090";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.04);
  ctx.quadraticCurveTo(size * 0.03, 0, 0, size * 0.04);
  ctx.stroke();
  ctx.fillStyle = "#6a6070";
  ctx.beginPath();
  ctx.arc(0, -size * 0.04, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Ground impact tremor lines
  ctx.strokeStyle = `rgba(80, 70, 60, ${0.15 + (isAttacking ? 0.15 : 0)})`;
  ctx.lineWidth = 1 * zoom;
  for (let tr = 0; tr < 4; tr++) {
    const trAngle = (tr / 4) * Math.PI + Math.PI * 0.5;
    const trR1 = size * 0.42;
    const trR2 = size * 0.52;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(trAngle) * trR1, y + size * 0.54 + Math.sin(trAngle) * trR1 * 0.3);
    ctx.lineTo(x + Math.cos(trAngle) * trR2, y + size * 0.54 + Math.sin(trAngle) * trR2 * 0.3);
    ctx.stroke();
  }

  // Drool strand from mouth
  ctx.strokeStyle = `rgba(140, 150, 130, ${0.3 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 0.8 * zoom;
  const droolX = x + lurch;
  const droolY = headY + size * 0.08;
  const droolEnd = droolY + size * 0.06 + Math.sin(time * 1.5) * size * 0.03;
  ctx.beginPath();
  ctx.moveTo(droolX, droolY);
  ctx.quadraticCurveTo(droolX + Math.sin(time * 3) * size * 0.015, (droolY + droolEnd) * 0.5, droolX + Math.sin(time * 2) * size * 0.01, droolEnd);
  ctx.stroke();

  // Exposed sinew detail on mismatched patches
  ctx.strokeStyle = "rgba(150, 80, 60, 0.3)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.save();
  ctx.translate(x + lurch, y - size * 0.08 - bob);
  for (let sinew = 0; sinew < 3; sinew++) {
    const sx = -size * 0.08 + sinew * size * 0.1;
    const sy = size * 0.08 + sinew * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + size * 0.03, sy - size * 0.02, sx + size * 0.06, sy + size * 0.01);
    ctx.stroke();
  }
  ctx.restore();

  // Orbiting chain debris
  drawOrbitingDebris(ctx, x, y - bob, size, time, zoom, {
    color: "#7a7888", glowColor: "#5a5868",
    count: 5, minRadius: 0.48, maxRadius: 0.58, particleSize: 0.028, speed: 0.35,
  });

  // Poison/bile bubbles near belly
  drawPoisonBubbles(ctx, x + lurch, y + size * 0.05 - bob, size * 0.2, time, zoom, {
    count: 4, color: "rgba(120, 140, 80, 0.4)", maxRadius: 0.06, speed: 0.8,
  });

  // Third metal plate on back
  ctx.save();
  ctx.translate(x + lurch, y - size * 0.08 - bob);
  ctx.fillStyle = "#5a5868";
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.28);
  ctx.lineTo(size * 0.08, -size * 0.3);
  ctx.lineTo(size * 0.1, -size * 0.22);
  ctx.lineTo(-size * 0.04, -size * 0.2);
  ctx.closePath();
  ctx.fill();
  // Bolts on back plate
  ctx.fillStyle = "#7a7888";
  for (const [bx, by] of [[-0.05, -0.27], [0.07, -0.29], [0.09, -0.225], [-0.035, -0.21]] as number[][]) {
    ctx.beginPath();
    ctx.arc(bx * size, by * size, size * 0.008, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // Stretched skin/sinew between patches
  ctx.strokeStyle = "rgba(160, 100, 80, 0.2)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.save();
  ctx.translate(x + lurch, y - size * 0.08 - bob);
  for (let stretch = 0; stretch < 4; stretch++) {
    const sx1 = -size * 0.15 + stretch * size * 0.08;
    const sy1 = -size * 0.1 + stretch * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.quadraticCurveTo(sx1 + size * 0.04, sy1 + size * 0.02, sx1 + size * 0.08, sy1 - size * 0.01);
    ctx.stroke();
  }
  ctx.restore();

  // Belly distension detail (bloated appearance)
  ctx.save();
  ctx.translate(x + lurch, y - size * 0.08 - bob);
  ctx.strokeStyle = "rgba(80, 60, 50, 0.2)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.1, size * 0.15, size * 0.12, 0.1, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  ctx.restore();
}

// ============================================================================
// 19. HELLHOUND — Demonic quadruped with flaming mane and four legs
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
  const isAttacking = attackPhase > 0;
  const gallop = Math.sin(time * 10) * size * 0.02;
  const bounce = Math.abs(Math.sin(time * 10)) * size * 0.018;
  const breathe = Math.sin(time * 4) * 0.03;
  const bodyY = y - size * 0.05 - bounce;
  const headX = x - size * 0.24;
  const headY = bodyY - size * 0.14;
  const flamePulse = 0.5 + Math.sin(time * 6) * 0.3;
  const legPhase = time * 10;

  // Scorched pawprints trailing behind
  for (let p = 0; p < 4; p++) {
    const px = x + size * 0.18 + p * size * 0.1;
    const pAlpha = 0.22 - p * 0.05;
    ctx.fillStyle = `rgba(200, 80, 20, ${pAlpha})`;
    ctx.beginPath();
    ctx.ellipse(px, y + size * 0.44, size * 0.028, size * 0.014, 0, 0, TAU);
    ctx.fill();
    // Scorch marks
    ctx.strokeStyle = `rgba(60, 20, 10, ${pAlpha * 0.5})`;
    ctx.lineWidth = 0.6 * zoom;
    for (let s = 0; s < 3; s++) {
      const sa = (s / 3) * TAU;
      ctx.beginPath();
      ctx.moveTo(px, y + size * 0.44);
      ctx.lineTo(px + Math.cos(sa) * size * 0.02, y + size * 0.44 + Math.sin(sa) * size * 0.01);
      ctx.stroke();
    }
  }

  // Ember particles floating
  for (let em = 0; em < 6; em++) {
    const emPhase = (time * 1.5 + em * 0.3) % 1;
    const emx = x + Math.sin(time * 2 + em * 1.1) * size * 0.3;
    const emy = bodyY - size * 0.1 - emPhase * size * 0.35;
    ctx.fillStyle = `rgba(255, ${120 + em * 20}, 30, ${(1 - emPhase) * flamePulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(emx, emy, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // Ground shadow
  ctx.fillStyle = "rgba(40,10,5,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.44, size * 0.38, size * 0.09, 0, 0, TAU);
  ctx.fill();

  // FIERY TAIL
  ctx.save();
  ctx.translate(x + size * 0.28, bodyY + size * 0.02);
  const tailWag = Math.sin(time * 6) * 0.45;
  ctx.rotate(tailWag);
  // Tail bone
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.18, -size * 0.06, size * 0.28, Math.sin(time * 8) * size * 0.1);
  ctx.stroke();
  // Fire along tail
  for (let tf = 0; tf < 5; tf++) {
    const t = tf / 4;
    const tfx = t * size * 0.28;
    const tfy = Math.sin(time * 8) * size * 0.1 * t - size * 0.06 * t * (1 - t) * 4;
    ctx.fillStyle = `rgba(255, ${100 + tf * 20}, 20, ${flamePulse * (0.6 - tf * 0.08)})`;
    ctx.beginPath();
    ctx.ellipse(tfx, tfy, size * 0.015, size * 0.03, 0, 0, TAU);
    ctx.fill();
  }
  // Flame tip
  setShadowBlur(ctx, 4 * zoom, `rgba(255, 120, 20, ${flamePulse})`);
  ctx.fillStyle = `rgba(255, 180, 60, ${flamePulse * 0.8})`;
  ctx.beginPath();
  ctx.arc(size * 0.28, Math.sin(time * 8) * size * 0.1, size * 0.025, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  ctx.restore();

  // BACK LEGS — articulated with walking cycle
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + size * 0.18, bodyY + size * 0.12);
    const backLegAngle = Math.sin(legPhase + side * Math.PI * 0.5) * 0.4;
    ctx.rotate(backLegAngle);
    // Thigh
    const bkThighGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, size * 0.12);
    bkThighGrad.addColorStop(0, bodyColor);
    bkThighGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = bkThighGrad;
    ctx.beginPath();
    ctx.moveTo(side * size * 0.015 - size * 0.04, 0);
    ctx.lineTo(side * size * 0.015 - size * 0.035, size * 0.12);
    ctx.lineTo(side * size * 0.015 + size * 0.035, size * 0.12);
    ctx.lineTo(side * size * 0.015 + size * 0.04, 0);
    ctx.closePath();
    ctx.fill();
    // Hock joint
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(side * size * 0.015, size * 0.12, size * 0.025, 0, TAU);
    ctx.fill();
    // Lower leg
    ctx.translate(side * size * 0.015, size * 0.12);
    ctx.rotate(-backLegAngle * 0.6);
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, 0);
    ctx.lineTo(-size * 0.025, size * 0.1);
    ctx.lineTo(size * 0.025, size * 0.1);
    ctx.lineTo(size * 0.03, 0);
    ctx.closePath();
    ctx.fill();
    // Paw with claws
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.11, size * 0.04, size * 0.02, 0, 0, TAU);
    ctx.fill();
    // Claws
    ctx.fillStyle = "#1a0a05";
    for (let cl = -1; cl <= 1; cl++) {
      ctx.beginPath();
      ctx.moveTo(cl * size * 0.02, size * 0.1);
      ctx.lineTo(cl * size * 0.025, size * 0.13);
      ctx.lineTo(cl * size * 0.015, size * 0.1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // FRONT LEGS — articulated
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x - size * 0.16, bodyY + size * 0.1);
    const frontLegAngle = Math.sin(legPhase + Math.PI + side * Math.PI * 0.5) * 0.4;
    ctx.rotate(frontLegAngle);
    const frThighGrad = ctx.createLinearGradient(-size * 0.035, 0, size * 0.035, size * 0.11);
    frThighGrad.addColorStop(0, bodyColorLight);
    frThighGrad.addColorStop(1, bodyColor);
    ctx.fillStyle = frThighGrad;
    ctx.beginPath();
    ctx.moveTo(side * size * 0.012 - size * 0.035, 0);
    ctx.lineTo(side * size * 0.012 - size * 0.03, size * 0.11);
    ctx.lineTo(side * size * 0.012 + size * 0.03, size * 0.11);
    ctx.lineTo(side * size * 0.012 + size * 0.035, 0);
    ctx.closePath();
    ctx.fill();
    // Wrist
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(side * size * 0.012, size * 0.11, size * 0.022, 0, TAU);
    ctx.fill();
    ctx.translate(side * size * 0.012, size * 0.11);
    ctx.rotate(-frontLegAngle * 0.5);
    // Lower front leg
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(-size * 0.025, 0);
    ctx.lineTo(-size * 0.02, size * 0.09);
    ctx.lineTo(size * 0.02, size * 0.09);
    ctx.lineTo(size * 0.025, 0);
    ctx.closePath();
    ctx.fill();
    // Front paw
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.035, size * 0.018, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // MAIN BODY — muscular beast torso, custom path
  ctx.save();
  ctx.translate(x, bodyY);
  ctx.rotate(breathe);
  const bodyGrad = ctx.createLinearGradient(-size * 0.32, -size * 0.12, size * 0.32, size * 0.12);
  bodyGrad.addColorStop(0, bodyColorDark);
  bodyGrad.addColorStop(0.2, bodyColor);
  bodyGrad.addColorStop(0.4, bodyColorLight);
  bodyGrad.addColorStop(0.6, bodyColor);
  bodyGrad.addColorStop(0.8, bodyColorLight);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, size * 0.08);
  ctx.quadraticCurveTo(-size * 0.32, -size * 0.06, -size * 0.22, -size * 0.14);
  ctx.quadraticCurveTo(0, -size * 0.18, size * 0.22, -size * 0.14);
  ctx.quadraticCurveTo(size * 0.32, -size * 0.06, size * 0.3, size * 0.08);
  ctx.quadraticCurveTo(0, size * 0.16, -size * 0.3, size * 0.08);
  ctx.closePath();
  ctx.fill();
  // Muscle definition
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.12);
  ctx.quadraticCurveTo(-size * 0.08, 0, -size * 0.15, size * 0.06);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.12, -size * 0.12);
  ctx.quadraticCurveTo(size * 0.08, 0, size * 0.15, size * 0.06);
  ctx.stroke();
  ctx.restore();

  // FLAMING MANE along spine
  for (let f = 0; f < 10; f++) {
    const fx = x - size * 0.18 + f * size * 0.045;
    const fHeight = size * 0.07 * (1 + Math.sin(time * 8 + f) * 0.45);
    const fAlpha = flamePulse * (0.75 - Math.abs(f - 4.5) * 0.06);
    // Outer flame
    ctx.fillStyle = `rgba(255, ${90 + f * 12}, 15, ${fAlpha})`;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.02, bodyY - size * 0.1);
    ctx.quadraticCurveTo(fx + Math.sin(time * 6 + f) * size * 0.015, bodyY - size * 0.1 - fHeight, fx + size * 0.02, bodyY - size * 0.1);
    ctx.closePath();
    ctx.fill();
    // Inner hot core
    ctx.fillStyle = `rgba(255, 220, 100, ${fAlpha * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.01, bodyY - size * 0.1);
    ctx.quadraticCurveTo(fx, bodyY - size * 0.1 - fHeight * 0.6, fx + size * 0.01, bodyY - size * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  // HEAD — beast head with snout
  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.11);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.4, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.06, headY - size * 0.07);
  ctx.quadraticCurveTo(headX - size * 0.02, headY - size * 0.1, headX - size * 0.08, headY - size * 0.05);
  ctx.quadraticCurveTo(headX - size * 0.12, headY, headX - size * 0.08, headY + size * 0.05);
  ctx.quadraticCurveTo(headX, headY + size * 0.08, headX + size * 0.08, headY + size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.1, headY, headX + size * 0.06, headY - size * 0.07);
  ctx.closePath();
  ctx.fill();

  // Snout
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.08, headY - size * 0.02);
  ctx.quadraticCurveTo(headX - size * 0.14, headY + size * 0.01, headX - size * 0.12, headY + size * 0.05);
  ctx.quadraticCurveTo(headX - size * 0.08, headY + size * 0.06, headX - size * 0.05, headY + size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Open jaws with fangs
  ctx.fillStyle = "#1a0505";
  const jawOpen = isAttacking ? size * 0.015 : size * 0.005;
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.1, headY + size * 0.04, size * 0.045, size * 0.02 + jawOpen, 0.1, 0, TAU);
  ctx.fill();
  // Upper fangs
  ctx.fillStyle = "#eae0d0";
  for (let fang = 0; fang < 3; fang++) {
    const fangX = headX - size * 0.12 + fang * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(fangX, headY + size * 0.025);
    ctx.lineTo(fangX - size * 0.004, headY + size * 0.05 + fang * size * 0.003);
    ctx.lineTo(fangX + size * 0.004, headY + size * 0.025);
    ctx.closePath();
    ctx.fill();
  }
  // Lower fangs
  for (let fang = 0; fang < 2; fang++) {
    const fangX = headX - size * 0.11 + fang * size * 0.025;
    ctx.beginPath();
    ctx.moveTo(fangX, headY + size * 0.055);
    ctx.lineTo(fangX, headY + size * 0.035);
    ctx.lineTo(fangX + size * 0.006, headY + size * 0.055);
    ctx.closePath();
    ctx.fill();
  }

  // Ears
  for (let ear = -1; ear <= 1; ear += 2) {
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(headX + size * 0.02, headY - size * 0.06);
    ctx.lineTo(headX + ear * size * 0.04, headY - size * 0.12);
    ctx.lineTo(headX + ear * size * 0.06, headY - size * 0.04);
    ctx.closePath();
    ctx.fill();
  }

  // BURNING RED EYES
  setShadowBlur(ctx, 8 * zoom, `rgba(255, 40, 20, ${flamePulse})`);
  ctx.fillStyle = `rgba(255, 60, 20, ${flamePulse})`;
  ctx.beginPath();
  ctx.arc(headX - size * 0.04, headY - size * 0.03, size * 0.02, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + size * 0.02, headY - size * 0.025, size * 0.017, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Nostril smoke
  for (let ns = 0; ns < 3; ns++) {
    const nsPhase = (time * 2 + ns * 0.4) % 1;
    ctx.fillStyle = `rgba(80, 40, 20, ${(1 - nsPhase) * 0.28})`;
    ctx.beginPath();
    ctx.arc(
      headX - size * 0.12 + Math.sin(time * 3 + ns) * size * 0.012,
      headY + size * 0.01 - nsPhase * size * 0.07,
      size * 0.009 * (1 + nsPhase * 0.6),
      0, TAU,
    );
    ctx.fill();
  }

  // Drool/saliva strands from open jaws
  if (isAttacking || Math.sin(time * 3) > 0.3) {
    ctx.strokeStyle = "rgba(180, 160, 130, 0.3)";
    ctx.lineWidth = 0.6 * zoom;
    for (let dr = 0; dr < 2; dr++) {
      const drx = headX - size * 0.1 + dr * size * 0.015;
      ctx.beginPath();
      ctx.moveTo(drx, headY + size * 0.04);
      ctx.lineTo(drx + Math.sin(time * 4 + dr) * size * 0.005, headY + size * 0.08 + Math.sin(time * 2) * size * 0.01);
      ctx.stroke();
    }
  }

  // Neck ridge muscle detail
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.06, headY + size * 0.02);
  ctx.quadraticCurveTo(x - size * 0.08, bodyY - size * 0.12, x - size * 0.15, bodyY - size * 0.08);
  ctx.stroke();

  // Rib cage outline under skin
  ctx.strokeStyle = `rgba(${bodyColorDark}, 0.2)`.includes("rgba") ? bodyColorDark : "rgba(40,20,10,0.2)";
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 0.8 * zoom;
  for (let rib = 0; rib < 4; rib++) {
    const ribY = bodyY - size * 0.06 + rib * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.12, ribY);
    ctx.quadraticCurveTo(x, ribY + size * 0.01, x + size * 0.12, ribY);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Heat shimmer/distortion above flaming mane
  ctx.save();
  ctx.globalAlpha = flamePulse * 0.15;
  for (let heat = 0; heat < 4; heat++) {
    const hx = x - size * 0.1 + heat * size * 0.07;
    const hy = bodyY - size * 0.2 - Math.sin(time * 3 + heat) * size * 0.02;
    ctx.fillStyle = "rgba(255, 200, 100, 0.3)";
    ctx.beginPath();
    ctx.ellipse(hx, hy, size * 0.015, size * 0.025, 0, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Claw scratch marks on ground behind
  ctx.strokeStyle = "rgba(60, 30, 15, 0.2)";
  ctx.lineWidth = 1 * zoom;
  for (let scratch = 0; scratch < 3; scratch++) {
    const sx = x + size * 0.2 + scratch * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(sx, y + size * 0.42);
    ctx.lineTo(sx + size * 0.06, y + size * 0.44);
    ctx.stroke();
  }
}

// ============================================================================
// 20. DOOM HERALD (BOSS) — Flying dark angel with bat wings, void halo, staff
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
  const isAttacking = attackPhase > 0;
  const auraFlare = isAttacking ? attackPhase : 0;
  const hover = Math.sin(time * 2) * size * 0.028;
  const wingFlap = Math.sin(time * 4) * 0.35;
  const headY = y - size * 0.5 + hover;
  const voidPulse = 0.5 + Math.sin(time * 3) * 0.3;

  // Shadow trail beneath (spreading darkness)
  for (let t = 0; t < 8; t++) {
    const tPhase = (time * 0.8 + t * 0.18) % 1;
    const tx = x + t * size * 0.05 - size * 0.1;
    const ty = y + size * 0.54 + t * size * 0.015;
    ctx.fillStyle = `rgba(15, 5, 25, ${(1 - tPhase) * 0.22})`;
    ctx.beginPath();
    ctx.ellipse(tx, ty, size * 0.09 * (1 + tPhase * 0.6), size * 0.028, 0, 0, TAU);
    ctx.fill();
  }

  // Dark feathers falling
  for (let feather = 0; feather < 5; feather++) {
    const fPhase = (time * 0.5 + feather * 0.35) % 1;
    const fx = x + Math.sin(time + feather * 1.5) * size * 0.4;
    const fy = y - size * 0.3 + fPhase * size * 0.9;
    const fRot = time * 2 + feather;
    const fAlpha = (1 - fPhase) * 0.35;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(fRot);
    ctx.fillStyle = `rgba(30, 15, 50, ${fAlpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.005, size * 0.02, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // VOID AURA — deep purple/black pulsing
  drawRadialAura(ctx, x, y + hover, size * 0.95 + auraFlare * size * 0.35, [
    { offset: 0, color: `rgba(50, 12, 75, ${(0.32 + auraFlare * 0.32) * voidPulse})` },
    { offset: 0.25, color: `rgba(30, 8, 50, ${0.22 * voidPulse})` },
    { offset: 0.55, color: `rgba(15, 4, 28, ${0.12 * voidPulse})` },
    { offset: 1, color: "rgba(0,0,0,0)" },
  ]);

  // Ground shadow
  ctx.fillStyle = "rgba(20,5,30,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.56, size * 0.48, size * 0.14, 0, 0, TAU);
  ctx.fill();

  // ===== MASSIVE BAT-LIKE WINGS =====

  // LEFT WING — with membrane, finger bones, tears
  ctx.save();
  ctx.translate(x - size * 0.22, y - size * 0.22 + hover);
  ctx.rotate(-0.4 - wingFlap);
  // Wing membrane gradient
  const wingGradL = ctx.createLinearGradient(0, 0, -size * 1.0, 0);
  wingGradL.addColorStop(0, "#1e0c35");
  wingGradL.addColorStop(0.2, "#2e1258");
  wingGradL.addColorStop(0.5, "#1e0a38");
  wingGradL.addColorStop(0.8, "#120628");
  wingGradL.addColorStop(1, "#0a0418");
  ctx.fillStyle = wingGradL;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Wing top edge with finger bone points
  ctx.quadraticCurveTo(-size * 0.2, -size * 0.45, -size * 0.5, -size * 0.4);
  ctx.lineTo(-size * 0.65, -size * 0.38);
  ctx.quadraticCurveTo(-size * 0.75, -size * 0.35, -size * 0.9, -size * 0.3);
  // Scalloped bottom edge (between finger bones)
  ctx.quadraticCurveTo(-size * 0.88, -size * 0.15, -size * 0.78, -size * 0.05);
  ctx.quadraticCurveTo(-size * 0.82, size * 0.05, -size * 0.7, size * 0.1);
  ctx.quadraticCurveTo(-size * 0.65, size * 0.18, -size * 0.52, size * 0.15);
  ctx.quadraticCurveTo(-size * 0.48, size * 0.22, -size * 0.35, size * 0.18);
  ctx.quadraticCurveTo(-size * 0.2, size * 0.2, 0, size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Wing finger bone ridges
  ctx.strokeStyle = "#3a1a72";
  ctx.lineWidth = 2 * zoom;
  const wingBones = [
    { sx: 0, sy: 0, ex: -0.5, ey: -0.4 },
    { sx: 0, sy: 0, ex: -0.65, ey: -0.38 },
    { sx: 0, sy: 0, ex: -0.9, ey: -0.3 },
    { sx: 0, sy: 0, ex: -0.78, ey: -0.05 },
    { sx: 0, sy: 0, ex: -0.52, ey: 0.15 },
  ];
  for (const bone of wingBones) {
    ctx.beginPath();
    ctx.moveTo(bone.sx * size, bone.sy * size);
    ctx.quadraticCurveTo(
      (bone.sx + bone.ex) * 0.4 * size,
      (bone.sy + bone.ey) * 0.4 * size + size * 0.03,
      bone.ex * size,
      bone.ey * size,
    );
    ctx.stroke();
  }

  // Membrane vein details
  ctx.strokeStyle = "rgba(60, 25, 100, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  for (let v = 0; v < 6; v++) {
    const vx1 = -size * (0.15 + v * 0.12);
    const vy1 = -size * (0.1 + Math.sin(v) * 0.08);
    ctx.beginPath();
    ctx.moveTo(vx1, vy1);
    ctx.quadraticCurveTo(vx1 - size * 0.05, vy1 + size * 0.08, vx1 - size * 0.03, vy1 + size * 0.15);
    ctx.stroke();
  }

  // Membrane tears/holes
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.45, -size * 0.08, size * 0.02, size * 0.035, 0.3, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-size * 0.68, -size * 0.12, size * 0.015, size * 0.025, -0.2, 0, TAU);
  ctx.fill();
  ctx.restore();

  // RIGHT WING — mirrored
  ctx.save();
  ctx.translate(x + size * 0.22, y - size * 0.22 + hover);
  ctx.rotate(0.4 + wingFlap);
  const wingGradR = ctx.createLinearGradient(0, 0, size * 1.0, 0);
  wingGradR.addColorStop(0, "#1e0c35");
  wingGradR.addColorStop(0.2, "#2e1258");
  wingGradR.addColorStop(0.5, "#1e0a38");
  wingGradR.addColorStop(0.8, "#120628");
  wingGradR.addColorStop(1, "#0a0418");
  ctx.fillStyle = wingGradR;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.2, -size * 0.45, size * 0.5, -size * 0.4);
  ctx.lineTo(size * 0.65, -size * 0.38);
  ctx.quadraticCurveTo(size * 0.75, -size * 0.35, size * 0.9, -size * 0.3);
  ctx.quadraticCurveTo(size * 0.88, -size * 0.15, size * 0.78, -size * 0.05);
  ctx.quadraticCurveTo(size * 0.82, size * 0.05, size * 0.7, size * 0.1);
  ctx.quadraticCurveTo(size * 0.65, size * 0.18, size * 0.52, size * 0.15);
  ctx.quadraticCurveTo(size * 0.48, size * 0.22, size * 0.35, size * 0.18);
  ctx.quadraticCurveTo(size * 0.2, size * 0.2, 0, size * 0.14);
  ctx.closePath();
  ctx.fill();
  // Right wing bones
  ctx.strokeStyle = "#3a1a72";
  ctx.lineWidth = 2 * zoom;
  for (const bone of wingBones) {
    ctx.beginPath();
    ctx.moveTo(-bone.sx * size, bone.sy * size);
    ctx.quadraticCurveTo(
      -(bone.sx + bone.ex) * 0.4 * size,
      (bone.sy + bone.ey) * 0.4 * size + size * 0.03,
      -bone.ex * size,
      bone.ey * size,
    );
    ctx.stroke();
  }
  // Right wing veins
  ctx.strokeStyle = "rgba(60, 25, 100, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  for (let v = 0; v < 6; v++) {
    const vx1 = size * (0.15 + v * 0.12);
    const vy1 = -size * (0.1 + Math.sin(v) * 0.08);
    ctx.beginPath();
    ctx.moveTo(vx1, vy1);
    ctx.quadraticCurveTo(vx1 + size * 0.05, vy1 + size * 0.08, vx1 + size * 0.03, vy1 + size * 0.15);
    ctx.stroke();
  }
  // Right wing tears
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(size * 0.5, -size * 0.1, size * 0.018, size * 0.03, -0.3, 0, TAU);
  ctx.fill();
  ctx.restore();

  // ===== ETHEREAL ROBES (no legs — floating) =====
  const robeTop = y - size * 0.12 + hover;
  const robeBot = y + size * 0.48 + hover;
  const robeSW = size * 0.22;
  const robeBW = size * 0.34;
  const robeGrad = ctx.createLinearGradient(x, robeTop, x, robeBot);
  robeGrad.addColorStop(0, "#221248");
  robeGrad.addColorStop(0.3, "#180a35");
  robeGrad.addColorStop(0.6, "#120630");
  robeGrad.addColorStop(1, "#080418");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - robeSW, robeTop);
  ctx.quadraticCurveTo(x - robeBW * 1.38, (robeTop + robeBot) * 0.5, x - robeBW, robeBot);
  ctx.lineTo(x + robeBW, robeBot);
  ctx.quadraticCurveTo(x + robeBW * 1.38, (robeTop + robeBot) * 0.5, x + robeSW, robeTop);
  ctx.closePath();
  ctx.fill();

  // Robe fabric folds
  ctx.strokeStyle = "rgba(30,15,50,0.35)";
  ctx.lineWidth = 0.8 * zoom;
  for (let fold = -3; fold <= 3; fold++) {
    const foldX = x + fold * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(foldX, robeTop + size * 0.08);
    ctx.quadraticCurveTo(
      foldX + Math.sin(time + fold) * size * 0.02,
      (robeTop + robeBot) * 0.55,
      foldX + fold * size * 0.02,
      robeBot - size * 0.05,
    );
    ctx.stroke();
  }

  // Robe trim — glowing purple
  ctx.strokeStyle = `rgba(140, 60, 220, ${voidPulse * 0.35})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - robeBW, robeBot);
  ctx.quadraticCurveTo(x, robeBot + size * 0.04, x + robeBW, robeBot);
  ctx.stroke();

  // Trailing robe wisps/tendrils
  for (let td = 0; td < 5; td++) {
    drawAnimatedTendril(
      ctx, x + (td - 2) * size * 0.1, y + size * 0.5 + hover,
      Math.PI * 0.5 + (td - 2) * 0.12, size, time, zoom, {
        color: "rgba(30, 15, 60, 0.4)",
        tipColor: "rgba(15, 5, 30, 0.12)",
        length: 0.28, width: 0.022, segments: 10, waveSpeed: 1.5 + td * 0.25, waveAmt: 0.06, tipRadius: 0.008,
      },
    );
  }

  // ===== ARMS =====
  drawAnimatedArm(ctx, x - size * 0.18, y - size * 0.24 + hover, size, time, zoom, -1, {
    upperLen: 0.18, foreLen: 0.16, width: 0.042, swingSpeed: 2, swingAmt: 0.15,
    color: "#140830", colorDark: "#080418", handColor: "#a090b0", handRadius: 0.032,
    attackExtra: isAttacking ? 0.6 : 0,
  });

  // STAFF OF DOOM (right hand) — ornate with doom orb
  ctx.save();
  ctx.translate(x + size * 0.2, y - size * 0.22 + hover);
  const staffAngle = isAttacking ? Math.sin(time * 10) * 0.45 : 0.15 + Math.sin(time * 1.5) * 0.08;
  ctx.rotate(staffAngle);
  // Skeletal hand gripping
  ctx.fillStyle = "#a090b0";
  ctx.beginPath();
  ctx.arc(0, size * 0.05, size * 0.028, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#8a78a0";
  ctx.lineWidth = 0.8 * zoom;
  for (let fg = -2; fg <= 2; fg++) {
    ctx.beginPath();
    ctx.moveTo(0, size * 0.05);
    ctx.lineTo(fg * size * 0.008, size * 0.07);
    ctx.stroke();
  }
  // Staff shaft — dark ornate wood
  const staffShaftGrad = ctx.createLinearGradient(0, -size * 0.08, 0, size * 0.55);
  staffShaftGrad.addColorStop(0, "#3a2240");
  staffShaftGrad.addColorStop(0.3, "#4a2a50");
  staffShaftGrad.addColorStop(0.6, "#3a2240");
  staffShaftGrad.addColorStop(1, "#2a1830");
  ctx.strokeStyle = staffShaftGrad;
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.08);
  ctx.lineTo(0, size * 0.55);
  ctx.stroke();
  // Staff bands
  ctx.strokeStyle = "#8a6ab0";
  ctx.lineWidth = 1.5 * zoom;
  for (let b = 0; b < 5; b++) {
    const by = size * 0.02 + b * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.022, by);
    ctx.lineTo(size * 0.022, by + size * 0.012);
    ctx.stroke();
  }
  // Rune engravings on staff
  ctx.strokeStyle = `rgba(140, 80, 220, ${voidPulse * 0.4})`;
  ctx.lineWidth = 0.6 * zoom;
  for (let rn = 0; rn < 3; rn++) {
    const ry = size * 0.15 + rn * size * 0.12;
    ctx.beginPath();
    ctx.arc(0, ry, size * 0.01, 0, TAU);
    ctx.stroke();
  }
  // Staff top claw cradle
  ctx.strokeStyle = "#4a2a50";
  ctx.lineWidth = 2 * zoom;
  for (let cl = -1; cl <= 1; cl += 2) {
    ctx.beginPath();
    ctx.moveTo(cl * size * 0.018, -size * 0.06);
    ctx.quadraticCurveTo(cl * size * 0.04, -size * 0.14, cl * size * 0.022, -size * 0.19);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.06);
  ctx.lineTo(0, -size * 0.15);
  ctx.stroke();
  // DOOM ORB at staff top
  const doomOrbY = -size * 0.2;
  const doomFloat = Math.sin(time * 3) * size * 0.01;
  const doomOrbGrad = ctx.createRadialGradient(0, doomOrbY + doomFloat, 0, 0, doomOrbY + doomFloat, size * 0.065);
  doomOrbGrad.addColorStop(0, `rgba(200, 100, 255, ${0.95 + auraFlare * 0.05})`);
  doomOrbGrad.addColorStop(0.3, `rgba(140, 60, 220, 0.75)`);
  doomOrbGrad.addColorStop(0.6, `rgba(80, 30, 160, 0.4)`);
  doomOrbGrad.addColorStop(1, "rgba(40,15,80,0)");
  setShadowBlur(ctx, 10 * zoom, `rgba(160, 80, 255, ${voidPulse})`);
  ctx.fillStyle = doomOrbGrad;
  ctx.beginPath();
  ctx.arc(0, doomOrbY + doomFloat, size * 0.065, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  // Energy crackling around orb
  for (let oe = 0; oe < 5; oe++) {
    const oeA = time * 3 + oe * (TAU / 5);
    const oex = Math.cos(oeA) * size * 0.09;
    const oey = doomOrbY + doomFloat + Math.sin(oeA) * size * 0.05;
    ctx.strokeStyle = `rgba(180, 120, 255, ${voidPulse * 0.5})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, doomOrbY + doomFloat);
    ctx.lineTo(oex, oey);
    ctx.stroke();
    ctx.fillStyle = `rgba(200, 140, 255, ${voidPulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(oex, oey, size * 0.006, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // ===== HOODED SKELETAL HEAD =====
  // Hood — grand pointed
  const hoodGrad = ctx.createRadialGradient(x, headY - size * 0.02, 0, x, headY, size * 0.18);
  hoodGrad.addColorStop(0, "#221248");
  hoodGrad.addColorStop(0.4, "#180a35");
  hoodGrad.addColorStop(0.7, "#120630");
  hoodGrad.addColorStop(1, "#080418");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, headY + size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.16, headY - size * 0.06, x, headY - size * 0.22);
  ctx.quadraticCurveTo(x + size * 0.16, headY - size * 0.06, x + size * 0.14, headY + size * 0.08);
  ctx.quadraticCurveTo(x, headY + size * 0.14, x - size * 0.14, headY + size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Skeletal face inside hood
  const faceGrad = ctx.createRadialGradient(x, headY + size * 0.02, 0, x, headY + size * 0.02, size * 0.08);
  faceGrad.addColorStop(0, "#b8a8c0");
  faceGrad.addColorStop(0.5, "#9888a0");
  faceGrad.addColorStop(1, "#786880");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.02, size * 0.07, size * 0.085, 0, 0, TAU);
  ctx.fill();

  // Eye sockets
  ctx.fillStyle = "#0a0518";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.025, headY, size * 0.022, size * 0.028, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.025, headY, size * 0.022, size * 0.028, 0, 0, TAU);
  ctx.fill();

  // PURPLE EYE FLAMES
  setShadowBlur(ctx, 12 * zoom, `rgba(180, 80, 255, ${voidPulse})`);
  ctx.fillStyle = `rgba(200, 100, 255, ${voidPulse})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.025, headY, size * 0.016, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.025, headY, size * 0.016, 0, TAU);
  ctx.fill();
  // Eye flame trails
  for (let ef = 0; ef < 4; ef++) {
    const efPhase = (time * 3.5 + ef * 0.25) % 1;
    const efAlpha = (1 - efPhase) * voidPulse * 0.5;
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = `rgba(180, 100, 255, ${efAlpha})`;
      ctx.beginPath();
      ctx.arc(
        x + side * size * 0.025 + Math.sin(time * 5 + ef + side) * size * 0.006,
        headY - efPhase * size * 0.07,
        size * 0.006 * (1 - efPhase * 0.5),
        0, TAU,
      );
      ctx.fill();
    }
  }
  clearShadow(ctx);

  // Nose cavity
  ctx.fillStyle = "#1a1028";
  ctx.beginPath();
  ctx.moveTo(x, headY + size * 0.035);
  ctx.lineTo(x - size * 0.007, headY + size * 0.05);
  ctx.lineTo(x + size * 0.007, headY + size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Jaw with teeth
  ctx.strokeStyle = "#9888a0";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, headY + size * 0.06);
  ctx.quadraticCurveTo(x, headY + size * 0.085 + Math.sin(time * 4) * size * 0.004, x + size * 0.04, headY + size * 0.06);
  ctx.stroke();

  // Hood trim
  ctx.strokeStyle = `rgba(140, 80, 220, ${voidPulse * 0.35})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, headY + size * 0.08);
  ctx.quadraticCurveTo(x, headY + size * 0.14, x + size * 0.14, headY + size * 0.08);
  ctx.stroke();

  // ===== VOID HALO — inverted dark circle above head =====
  ctx.save();
  ctx.translate(x, headY - size * 0.18);
  // Outer void ring
  ctx.strokeStyle = `rgba(120, 50, 200, ${voidPulse * 0.75})`;
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.035, 0, 0, TAU);
  ctx.stroke();
  // Inner void darkness
  const haloVoidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.1);
  haloVoidGrad.addColorStop(0, `rgba(10, 2, 18, ${voidPulse * 0.7})`);
  haloVoidGrad.addColorStop(0.5, `rgba(40, 15, 70, ${voidPulse * 0.4})`);
  haloVoidGrad.addColorStop(1, "rgba(60,25,100,0)");
  ctx.fillStyle = haloVoidGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.03, 0, 0, TAU);
  ctx.fill();
  // Halo energy particles orbiting
  for (let hp = 0; hp < 8; hp++) {
    const hpa = (hp / 8) * TAU + time * 1.8;
    const hpx = Math.cos(hpa) * size * 0.12;
    const hpy = Math.sin(hpa) * size * 0.035;
    const hpAlpha = voidPulse * (0.45 + Math.sin(time * 4 + hp) * 0.2);
    ctx.fillStyle = `rgba(200, 120, 255, ${hpAlpha})`;
    ctx.beginPath();
    ctx.arc(hpx, hpy, size * 0.009, 0, TAU);
    ctx.fill();
  }
  // Anti-light tendrils from halo downward
  ctx.strokeStyle = `rgba(80, 30, 140, ${voidPulse * 0.25})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let ht = 0; ht < 4; ht++) {
    const htx = (ht - 1.5) * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(htx, size * 0.03);
    ctx.quadraticCurveTo(htx + Math.sin(time * 2 + ht) * size * 0.015, size * 0.08, htx, size * 0.12);
    ctx.stroke();
  }
  ctx.restore();

  // ===== ORBITING VOID SHARDS =====
  drawShiftingSegments(ctx, x, y + hover, size, time, zoom, {
    color: "rgba(160, 70, 240, 0.45)",
    colorAlt: "rgba(110, 35, 195, 0.35)",
    count: 7, orbitRadius: 0.55, segmentSize: 0.022,
    orbitSpeed: 0.55, bobSpeed: 2, bobAmt: 0.055, shape: "shard", rotateWithOrbit: true,
  });

  // ===== PULSING DOOM RINGS =====
  drawPulsingGlowRings(ctx, x, y + hover, size, time, zoom, {
    color: `rgba(130, 45, 210, ${0.13 + auraFlare * 0.18})`,
    count: 4, speed: 0.9, lineWidth: 1.8,
  });

  // Shadow wisps trailing
  drawShadowWisps(ctx, x, y + hover, size * 0.5, time, zoom, {
    color: "rgba(80, 30, 140, 0.25)", count: 6, speed: 1.2, maxAlpha: 0.22, wispLength: 0.5,
  });

  // Robe arcane symbols glowing intermittently
  ctx.save();
  ctx.globalAlpha = voidPulse * 0.25;
  for (let sym = 0; sym < 6; sym++) {
    const symX = x + (sym - 2.5) * size * 0.07;
    const symY = y + size * 0.1 + sym * size * 0.04 + hover;
    const symAlpha = (0.3 + Math.sin(time * 2 + sym * 1.2) * 0.2);
    ctx.strokeStyle = `rgba(140, 80, 220, ${symAlpha})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.arc(symX, symY, size * 0.012, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(symX, symY - size * 0.008);
    ctx.lineTo(symX, symY + size * 0.008);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Doom energy ground circle
  ctx.save();
  ctx.translate(x, y + size * 0.54);
  ctx.rotate(-time * 0.15);
  ctx.strokeStyle = `rgba(120, 50, 200, ${voidPulse * 0.2})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.42, size * 0.12, 0, 0, TAU);
  ctx.stroke();
  for (let gr = 0; gr < 6; gr++) {
    const gra = (gr / 6) * TAU;
    ctx.fillStyle = `rgba(160, 80, 240, ${voidPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(Math.cos(gra) * size * 0.38, Math.sin(gra) * size * 0.11, size * 0.01, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // Spectral chains binding wrists (visible on arms)
  ctx.strokeStyle = `rgba(120, 100, 160, ${voidPulse * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    const chainX = x + side * size * 0.22;
    const chainY = y - size * 0.1 + hover;
    for (let link = 0; link < 3; link++) {
      ctx.beginPath();
      ctx.ellipse(
        chainX + Math.sin(time * 2 + link + side) * size * 0.01,
        chainY + link * size * 0.03,
        size * 0.012, size * 0.008,
        0, 0, TAU,
      );
      ctx.stroke();
    }
  }

  // Robe shoulder clasps with void gems
  for (let side = -1; side <= 1; side += 2) {
    const clX = x + side * size * 0.2;
    const clY = y - size * 0.2 + hover;
    ctx.fillStyle = "#2a1848";
    ctx.beginPath();
    ctx.ellipse(clX, clY, size * 0.035, size * 0.025, 0, 0, TAU);
    ctx.fill();
    const gemGrad = ctx.createRadialGradient(clX, clY, 0, clX, clY, size * 0.015);
    gemGrad.addColorStop(0, `rgba(200, 120, 255, ${voidPulse * 0.8})`);
    gemGrad.addColorStop(1, `rgba(100, 40, 180, ${voidPulse * 0.3})`);
    ctx.fillStyle = gemGrad;
    ctx.beginPath();
    ctx.arc(clX, clY, size * 0.015, 0, TAU);
    ctx.fill();
  }

  // Falling void particles (like inverted snow)
  for (let vp = 0; vp < 8; vp++) {
    const vpPhase = (time * 0.6 + vp * 0.22) % 1;
    const vpx = x + Math.sin(time * 1.2 + vp * 1.6) * size * 0.45;
    const vpy = y - size * 0.4 + vpPhase * size * 1.0;
    const vpAlpha = (1 - Math.abs(vpPhase - 0.5) * 2) * voidPulse * 0.35;
    ctx.fillStyle = `rgba(80, 30, 140, ${vpAlpha})`;
    ctx.beginPath();
    ctx.arc(vpx, vpy + hover, size * 0.005, 0, TAU);
    ctx.fill();
  }

  // Doom text/whispers emanating (small flickering marks)
  ctx.save();
  ctx.globalAlpha = voidPulse * 0.2;
  for (let whisper = 0; whisper < 5; whisper++) {
    const wPhase = (time * 0.8 + whisper * 0.35) % 1;
    const wx = x + Math.sin(time * 1.5 + whisper * 2) * size * 0.35;
    const wy = y + hover - wPhase * size * 0.4;
    ctx.strokeStyle = `rgba(160, 100, 240, ${(1 - wPhase) * 0.5})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(wx - size * 0.01, wy);
    ctx.lineTo(wx + size * 0.01, wy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx + size * 0.005, wy - size * 0.005);
    ctx.lineTo(wx + size * 0.015, wy + size * 0.002);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Wing edge glow when attacking
  if (isAttacking) {
    setShadowBlur(ctx, 6 * zoom, `rgba(160, 80, 255, ${voidPulse * 0.5})`);
    ctx.strokeStyle = `rgba(180, 100, 255, ${voidPulse * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.22, y - size * 0.22 + hover);
      ctx.quadraticCurveTo(
        x + side * size * 0.6, y - size * 0.5 + hover,
        x + side * size * 0.9, y - size * 0.3 + hover,
      );
      ctx.stroke();
    }
    clearShadow(ctx);
  }
}
