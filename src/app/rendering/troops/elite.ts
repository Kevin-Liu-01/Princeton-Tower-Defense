import type { Position } from "../../types";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
} from "./troopHelpers";

export function drawEliteTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
) {
  const stance = Math.sin(time * 3) * 1.2;
  const breathe = Math.sin(time * 2) * 0.5;
  const capeWave = Math.sin(time * 3.5);
  const capeWave2 = Math.sin(time * 4.2 + 0.5);
  const shimmer = Math.sin(time * 6) * 0.5 + 0.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  const weightShift = Math.sin(time * 1.9) * size * 0.03;
  const hipBounce = Math.abs(Math.sin(time * 3.2)) * size * 0.012;
  const plumeWhip = Math.sin(time * 4.8 + 0.7);
  const heraldicColor = color || "#ff7a2f";

  // Attack animation - halberd swing
  const isAttacking = attackPhase > 0;
  const attackDrive = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const attackSnap = isAttacking ? Math.sin(attackPhase * Math.PI * 2.2) : 0;
  const attackLunge = attackDrive * size * 0.16;
  const bodyLean = isAttacking
    ? attackSnap * 0.18
    : Math.sin(time * 1.7) * 0.03;
  const stanceSpread = size * (isAttacking ? 0.13 : 0.11);
  const halberdSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.5) * 1.8
    : 0;
  const halberdX =
    x + size * 0.27 + (isAttacking ? halberdSwing * size * 0.18 : 0);
  const halberdY =
    y - size * 0.12 - (isAttacking ? Math.abs(halberdSwing) * size * 0.12 : 0);
  const halberdBaseAngle = 0.15 + stance * 0.02 + halberdSwing;
  const halberdAngle = resolveWeaponRotation(
    targetPos,
    halberdX,
    halberdY,
    halberdBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.15 : 0.62,
    WEAPON_LIMITS.rightPole,
  );

  // === ELITE AURA (always present, stronger during attack) ===
  const auraIntensity = isAttacking ? 0.6 : 0.3;
  const auraPulse = 0.8 + Math.sin(time * 4) * 0.2;

  // Multiple layered aura rings for depth
  for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
    const layerOffset = auraLayer * 0.15;
    const auraGrad = ctx.createRadialGradient(
      x,
      y + size * 0.1,
      size * (0.05 + layerOffset),
      x,
      y + size * 0.1,
      size * (0.6 + layerOffset),
    );
    auraGrad.addColorStop(
      0,
      `rgba(255, 108, 0, ${auraIntensity * auraPulse * (0.4 - auraLayer * 0.1)})`,
    );
    auraGrad.addColorStop(
      0.4,
      `rgba(255, 140, 40, ${auraIntensity * auraPulse * (0.25 - auraLayer * 0.06)})`,
    );
    auraGrad.addColorStop(
      0.7,
      `rgba(255, 180, 80, ${auraIntensity * auraPulse * (0.15 - auraLayer * 0.04)})`,
    );
    auraGrad.addColorStop(1, "rgba(255, 108, 0, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + size * 0.15,
      size * (0.7 + layerOffset * 0.3),
      size * (0.55 + layerOffset * 0.2),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Floating rune particles around the elite
  for (let p = 0; p < 6; p++) {
    const pAngle = (time * 0.8 + (p * Math.PI) / 3) % (Math.PI * 2);
    const pRadius = size * 0.5 + Math.sin(time * 2 + p) * size * 0.1;
    const pX = x + Math.cos(pAngle) * pRadius;
    const pY = y + Math.sin(pAngle) * pRadius * 0.4 + size * 0.1;
    const pAlpha = 0.4 + Math.sin(time * 3 + p * 0.7) * 0.3;
    ctx.fillStyle = `rgba(255, 180, 60, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(pX, pY, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Energy rings during attack
  if (isAttacking) {
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6;
      ctx.strokeStyle = `rgba(255, 150, 50, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + size * 0.1,
        size * (0.35 + ringPhase * 0.4),
        size * (0.22 + ringPhase * 0.25),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  // A wider elite stance plus a subtle body lean sells the upgraded silhouette.
  ctx.save();
  ctx.translate(
    x + weightShift * 0.35 + attackLunge * 0.18,
    y + hipBounce * 0.15,
  );
  ctx.rotate(bodyLean);
  ctx.scale(1.08 + attackDrive * 0.05, 1);
  ctx.translate(
    -(x + weightShift * 0.35 + attackLunge * 0.18),
    -(y + hipBounce * 0.15),
  );

  // === ROYAL CAPE (multi-layered with intricate patterns) ===
  // Cape shadow layer (deepest)
  ctx.fillStyle = "#050515";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.1 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.38 + capeWave * 7 - attackLunge * 0.18,
    y + size * 0.3 + hipBounce,
    x - size * 0.32 + capeWave * 8,
    y + size * 0.74,
  );
  ctx.lineTo(x + size * 0.2 + capeWave * 4.5, y + size * 0.66);
  ctx.quadraticCurveTo(
    x + size * 0.12,
    y + size * 0.22,
    x + size * 0.16,
    y - size * 0.08 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Cape inner layer (royal purple)
  const capeInnerGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y - size * 0.1,
    x + size * 0.1,
    y + size * 0.6,
  );
  capeInnerGrad.addColorStop(0, "#1a0a3a");
  capeInnerGrad.addColorStop(0.3, "#0d0520");
  capeInnerGrad.addColorStop(0.7, "#150830");
  capeInnerGrad.addColorStop(1, "#0a0418");
  ctx.fillStyle = capeInnerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.11 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.31 + capeWave * 5.5 - attackLunge * 0.12,
    y + size * 0.27,
    x - size * 0.25 + capeWave * 6,
    y + size * 0.64,
  );
  ctx.lineTo(x + size * 0.16 + capeWave * 3.4, y + size * 0.58);
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y + size * 0.17,
    x + size * 0.14,
    y - size * 0.09 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Cape middle layer with gradient
  const capeGrad = ctx.createLinearGradient(
    x - size * 0.15,
    y,
    x + size * 0.1,
    y + size * 0.5,
  );
  capeGrad.addColorStop(0, "#2a1a5a");
  capeGrad.addColorStop(0.4, "#1d1045");
  capeGrad.addColorStop(1, "#120830");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.13 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.26 + capeWave * 4.2 - attackLunge * 0.08,
    y + size * 0.18,
    x - size * 0.21 + capeWave * 4.8,
    y + size * 0.53,
  );
  ctx.lineTo(x + size * 0.14 + capeWave * 2.6, y + size * 0.49);
  ctx.quadraticCurveTo(
    x + size * 0.07,
    y + size * 0.12,
    x + size * 0.12,
    y - size * 0.11 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Cape embroidered pattern (gold thread design)
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = heraldicColor;
  ctx.lineWidth = 0.8;
  // Decorative swirl patterns on cape
  for (let row = 0; row < 3; row++) {
    const rowY = y + size * (0.15 + row * 0.12);
    const waveOffset = capeWave * (2 + row);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1 + waveOffset, rowY);
    ctx.quadraticCurveTo(
      x - size * 0.05 + waveOffset,
      rowY - size * 0.03,
      x + waveOffset,
      rowY,
    );
    ctx.quadraticCurveTo(
      x + size * 0.05 + waveOffset,
      rowY + size * 0.03,
      x + size * 0.08 + waveOffset,
      rowY,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Cape outer gold trim with decorative pattern
  ctx.strokeStyle = `rgba(255, 207, 122, ${0.72 + shimmer * 0.18})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.23 + capeWave * 4.6, y + size * 0.54);
  ctx.lineTo(x + size * 0.14 + capeWave * 2.4, y + size * 0.49);
  ctx.stroke();

  // Inner trim line
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22 + capeWave * 4.6, y + size * 0.52);
  ctx.lineTo(x + size * 0.13 + capeWave * 2.4, y + size * 0.47);
  ctx.stroke();

  // Cape clasp gem at shoulder
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.1,
    y - size * 0.08 + breathe,
    size * 0.035,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  // Gem highlight
  ctx.fillStyle = "rgba(255,255,200,0.7)";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.11,
    y - size * 0.09 + breathe,
    size * 0.012,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === LEGS (ornate greaves with engravings) ===
  // Left leg
  ctx.save();
  ctx.translate(
    x - stanceSpread + weightShift * 0.18,
    y + size * 0.28 + hipBounce,
  );
  ctx.rotate(-0.09 + stance * 0.018 - attackDrive * 0.06);
  ctx.scale(1.18, 1);

  // Greave base with metallic gradient
  const legGradL = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  legGradL.addColorStop(0, "#4a4a5a");
  legGradL.addColorStop(0.3, "#6a6a7a");
  legGradL.addColorStop(0.7, "#7a7a8a");
  legGradL.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = legGradL;
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);

  // Leg armor segments
  ctx.strokeStyle = "#3a3a4a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, size * 0.06);
  ctx.lineTo(size * 0.055, size * 0.06);
  ctx.moveTo(-size * 0.055, size * 0.12);
  ctx.lineTo(size * 0.055, size * 0.12);
  ctx.stroke();

  // Ornate knee guard with layered design
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.045, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  // Knee gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, size * 0.08, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Detailed boot with buckles
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  // Boot cuff
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(-size * 0.07, size * 0.17, size * 0.14, size * 0.025);
  // Gold buckle
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.025, size * 0.19, size * 0.05, size * 0.02);
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(
    x + stanceSpread - weightShift * 0.18,
    y + size * 0.28 + hipBounce,
  );
  ctx.rotate(0.09 - stance * 0.018 + attackDrive * 0.06);
  ctx.scale(1.18, 1);

  // Greave base
  const legGradR = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  legGradR.addColorStop(0, "#5a5a6a");
  legGradR.addColorStop(0.3, "#7a7a8a");
  legGradR.addColorStop(0.7, "#6a6a7a");
  legGradR.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = legGradR;
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);

  // Leg armor segments
  ctx.strokeStyle = "#3a3a4a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, size * 0.06);
  ctx.lineTo(size * 0.055, size * 0.06);
  ctx.moveTo(-size * 0.055, size * 0.12);
  ctx.lineTo(size * 0.055, size * 0.12);
  ctx.stroke();

  // Ornate knee guard
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.045, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  // Knee gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, size * 0.08, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Boot with buckles
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(-size * 0.07, size * 0.17, size * 0.14, size * 0.025);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.025, size * 0.19, size * 0.05, size * 0.02);
  ctx.restore();

  // === BODY (highly ornate plate armor with filigree) ===
  // Back plate
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.29, y - size * 0.11 + breathe * 0.5);
  ctx.lineTo(x + size * 0.29, y - size * 0.11 + breathe * 0.5);
  ctx.lineTo(x + size * 0.25, y + size * 0.34 + breathe);
  ctx.closePath();
  ctx.fill();

  // Front chest plate with elaborate metallic gradient
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y - size * 0.1,
    x + size * 0.2,
    y + size * 0.3,
  );
  plateGrad.addColorStop(0, "#5a5a6a");
  plateGrad.addColorStop(0.15, "#7a7a8a");
  plateGrad.addColorStop(0.3, "#9a9aaa");
  plateGrad.addColorStop(0.5, "#8a8a9a");
  plateGrad.addColorStop(0.7, "#9a9aaa");
  plateGrad.addColorStop(0.85, "#7a7a8a");
  plateGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.32 + breathe);
  ctx.lineTo(x - size * 0.27, y - size * 0.09 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.16 + breathe * 0.3,
    x + size * 0.27,
    y - size * 0.09 + breathe * 0.5,
  );
  ctx.lineTo(x + size * 0.24, y + size * 0.32 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest plate edge highlight
  ctx.strokeStyle = "#a0a0b0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.3 + breathe);
  ctx.lineTo(x - size * 0.26, y - size * 0.07 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.14 + breathe * 0.3,
    x + size * 0.26,
    y - size * 0.07 + breathe * 0.5,
  );
  ctx.stroke();

  // Armor segment lines (muscle cuirass detail)
  ctx.strokeStyle = "#4a4a5a";
  ctx.lineWidth = 1.2;
  // Center line
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.06 + breathe);
  ctx.lineTo(x, y + size * 0.22 + breathe);
  ctx.stroke();
  // Pectoral lines
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.02 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.08,
    y + size * 0.08,
    x - size * 0.02,
    y + size * 0.04 + breathe,
  );
  ctx.moveTo(x + size * 0.15, y + size * 0.02 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y + size * 0.08,
    x + size * 0.02,
    y + size * 0.04 + breathe,
  );
  ctx.stroke();
  // Abdominal segments
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + size * 0.12 + breathe);
  ctx.lineTo(x + size * 0.12, y + size * 0.12 + breathe);
  ctx.moveTo(x - size * 0.1, y + size * 0.18 + breathe);
  ctx.lineTo(x + size * 0.1, y + size * 0.18 + breathe);
  ctx.stroke();

  // Gold filigree patterns on armor
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.8;
  // Left filigree swirl
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.02 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.18,
    y + size * 0.06,
    x - size * 0.12,
    y + size * 0.08 + breathe,
  );
  ctx.quadraticCurveTo(
    x - size * 0.08,
    y + size * 0.1,
    x - size * 0.14,
    y + size * 0.14 + breathe,
  );
  ctx.stroke();
  // Right filigree swirl
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.02 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.18,
    y + size * 0.06,
    x + size * 0.12,
    y + size * 0.08 + breathe,
  );
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y + size * 0.1,
    x + size * 0.14,
    y + size * 0.14 + breathe,
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Ornate gold chest emblem (Princeton shield with detail)
  // Shield base
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.04 + breathe);
  ctx.lineTo(x - size * 0.1, y + size * 0.08 + breathe);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.lineTo(x + size * 0.1, y + size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();
  // Shield inner detail
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.01 + breathe);
  ctx.lineTo(x - size * 0.06, y + size * 0.07 + breathe);
  ctx.lineTo(x, y + size * 0.14 + breathe);
  ctx.lineTo(x + size * 0.06, y + size * 0.07 + breathe);
  ctx.closePath();
  ctx.fill();
  // Center gem on shield
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.07 + breathe, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Gem sparkle
  ctx.fillStyle = `rgba(255, 255, 200, ${shimmer * 0.8})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.01,
    y + size * 0.06 + breathe,
    size * 0.008,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Belt with ornate buckle and pouches
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(
    x - size * 0.21,
    y + size * 0.23 + breathe,
    size * 0.42,
    size * 0.05,
  );
  // Belt buckle
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.065,
    y + size * 0.22 + breathe,
    size * 0.13,
    size * 0.06,
    size * 0.01,
  );
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.045,
    y + size * 0.232 + breathe,
    size * 0.09,
    size * 0.04,
    size * 0.005,
  );
  ctx.fill();
  // Buckle gem
  ctx.fillStyle = "#ff4400";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.25 + breathe, size * 0.013, 0, Math.PI * 2);
  ctx.fill();
  // Belt pouches
  ctx.fillStyle = "#4a3a2a";
  ctx.fillRect(
    x - size * 0.18,
    y + size * 0.25 + breathe,
    size * 0.055,
    size * 0.045,
  );
  ctx.fillRect(
    x + size * 0.125,
    y + size * 0.25 + breathe,
    size * 0.055,
    size * 0.045,
  );

  // === ARMS (connecting to shield and halberd) ===
  // Left arm → shield grip
  const eliteShieldX = x - size * 0.3;
  const eliteShieldY = y + size * 0.04 + breathe * 0.55 + hipBounce * 0.4;
  const eliteLShoulderX = x - size * 0.2;
  const eliteLShoulderY = y - size * 0.02 + breathe;
  const eliteArmToShieldAngle = Math.atan2(
    eliteShieldY - eliteLShoulderY,
    eliteShieldX - eliteLShoulderX,
  );

  ctx.save();
  ctx.translate(eliteLShoulderX, eliteLShoulderY);
  ctx.rotate(eliteArmToShieldAngle);
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(-size * 0.035, -size * 0.035, size * 0.18, size * 0.07);
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(size * 0.1, -size * 0.04, size * 0.1, size * 0.08);
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.arc(size * 0.2, 0, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm → halberd grip (shaft at local (0, size*0.1))
  const halbGripLocalY = size * 0.1;
  const halbGripWX = halberdX - Math.sin(halberdAngle) * halbGripLocalY;
  const halbGripWY = halberdY + Math.cos(halberdAngle) * halbGripLocalY;
  const eliteRShoulderX = x + size * 0.2;
  const eliteRShoulderY = y - size * 0.02 + breathe;
  const eliteArmToHalbAngle = Math.atan2(
    halbGripWY - eliteRShoulderY,
    halbGripWX - eliteRShoulderX,
  );

  ctx.save();
  ctx.translate(eliteRShoulderX, eliteRShoulderY);
  ctx.rotate(eliteArmToHalbAngle);
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(-size * 0.035, -size * 0.035, size * 0.18, size * 0.07);
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(size * 0.1, -size * 0.04, size * 0.1, size * 0.08);
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.arc(size * 0.2, 0, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === SHOULDERS (elaborate layered pauldrons) ===
  // Left pauldron - multiple layers
  ctx.save();
  ctx.translate(x - size * 0.23, y - size * 0.04 + breathe);

  // Pauldron base layer
  const pauldronGradL = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.14);
  pauldronGradL.addColorStop(0, "#8a8a9a");
  pauldronGradL.addColorStop(0.6, "#6a6a7a");
  pauldronGradL.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = pauldronGradL;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.14, size * 0.09, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Pauldron ridge layers
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(
    size * 0.025,
    size * 0.03,
    size * 0.1,
    size * 0.055,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.ellipse(
    size * 0.045,
    size * 0.05,
    size * 0.07,
    size * 0.04,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Gold trim and rivets
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.14, size * 0.09, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Decorative rivets
  ctx.fillStyle = "#dab32f";
  for (let rivet = 0; rivet < 4; rivet++) {
    const rivetAngle = -0.3 + rivet * Math.PI * 0.5;
    const rivetX = Math.cos(rivetAngle) * size * 0.09;
    const rivetY = Math.sin(rivetAngle) * size * 0.06;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pauldron spike
  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.025);
  ctx.lineTo(-size * 0.18, -size * 0.07);
  ctx.lineTo(-size * 0.08, size * 0.005);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right pauldron
  ctx.save();
  ctx.translate(x + size * 0.23, y - size * 0.04 + breathe);

  const pauldronGradR = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.14);
  pauldronGradR.addColorStop(0, "#8a8a9a");
  pauldronGradR.addColorStop(0.6, "#6a6a7a");
  pauldronGradR.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = pauldronGradR;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.14, size * 0.09, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.025,
    size * 0.03,
    size * 0.1,
    size * 0.055,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.045,
    size * 0.05,
    size * 0.07,
    size * 0.04,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.14, size * 0.09, 0.3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#dab32f";
  for (let rivet = 0; rivet < 4; rivet++) {
    const rivetAngle = 0.3 + rivet * Math.PI * 0.5;
    const rivetX = Math.cos(rivetAngle) * size * 0.09;
    const rivetY = Math.sin(rivetAngle) * size * 0.06;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.025);
  ctx.lineTo(size * 0.18, -size * 0.07);
  ctx.lineTo(size * 0.08, size * 0.005);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === HEAD (elaborate plumed helm with face guard) ===
  // Gorget (neck armor)
  const gorgetGrad = ctx.createLinearGradient(
    x - size * 0.08,
    y - size * 0.14,
    x + size * 0.08,
    y - size * 0.14,
  );
  gorgetGrad.addColorStop(0, "#4a4a5a");
  gorgetGrad.addColorStop(0.5, "#6a6a7a");
  gorgetGrad.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.08 + breathe);
  ctx.lineTo(x - size * 0.1, y - size * 0.16 + breathe);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.18,
    x + size * 0.1,
    y - size * 0.16 + breathe,
  );
  ctx.lineTo(x + size * 0.08, y - size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();
  // Gorget gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Helm base with gradient
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.03,
    y - size * 0.32 + breathe,
    size * 0.02,
    x,
    y - size * 0.28 + breathe,
    size * 0.14,
  );
  helmGrad.addColorStop(0, "#9a9aaa");
  helmGrad.addColorStop(0.4, "#7a7a8a");
  helmGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.28 + breathe, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // Helm ridge/crest base
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.42 + breathe);
  ctx.lineTo(x - size * 0.025, y - size * 0.26 + breathe);
  ctx.lineTo(x + size * 0.025, y - size * 0.26 + breathe);
  ctx.lineTo(x + size * 0.02, y - size * 0.42 + breathe);
  ctx.closePath();
  ctx.fill();

  // Visor with slit detail
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.26 + breathe,
    size * 0.1,
    size * 0.05,
    0,
    0,
    Math.PI,
  );
  ctx.fill();
  // Visor slits
  ctx.fillStyle = "#0a0a15";
  ctx.fillRect(
    x - size * 0.08,
    y - size * 0.26 + breathe,
    size * 0.16,
    size * 0.01,
  );
  ctx.fillRect(
    x - size * 0.06,
    y - size * 0.24 + breathe,
    size * 0.12,
    size * 0.008,
  );

  // Eye glow behind visor
  ctx.fillStyle = `rgba(255, 100, 0, ${0.4 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.03,
    y - size * 0.26 + breathe,
    size * 0.015,
    size * 0.008,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.03,
    y - size * 0.26 + breathe,
    size * 0.015,
    size * 0.008,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Extra elite helmet details.
  ctx.fillStyle = "#7b7c8d";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.013,
    y - size * 0.33 + breathe,
    size * 0.026,
    size * 0.11,
    size * 0.006,
  );
  ctx.fill();
  ctx.fillStyle = "#8c8ea2";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.1, y - size * 0.29 + breathe);
    ctx.lineTo(x + side * size * 0.13, y - size * 0.24 + breathe);
    ctx.lineTo(x + side * size * 0.08, y - size * 0.2 + breathe);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "#d3b46f";
  for (let rivet = 0; rivet < 3; rivet++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.075 + rivet * size * 0.075,
      y - size * 0.34 + breathe,
      size * 0.008,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Ornate gold crown band with gems
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.28 + breathe,
    size * 0.14,
    Math.PI * 1.15,
    Math.PI * 1.85,
  );
  ctx.stroke();

  // Crown points
  ctx.fillStyle = "#c9a227";
  for (let cp = 0; cp < 3; cp++) {
    const cpAngle = Math.PI * 1.3 + cp * Math.PI * 0.2;
    const cpX = x + Math.cos(cpAngle) * size * 0.14;
    const cpY = y - size * 0.28 + breathe + Math.sin(cpAngle) * size * 0.14;
    ctx.beginPath();
    ctx.moveTo(cpX, cpY);
    ctx.lineTo(
      cpX + Math.cos(cpAngle) * size * 0.04,
      cpY + Math.sin(cpAngle) * size * 0.04 - size * 0.02,
    );
    ctx.lineTo(
      cpX + Math.cos(cpAngle + 0.3) * size * 0.02,
      cpY + Math.sin(cpAngle + 0.3) * size * 0.02,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Crown center gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + breathe, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Elaborate multi-layered plume
  // Plume shadow/depth layer
  ctx.fillStyle = "#cc4400";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.42 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.2 + capeWave * 2.5,
    y - size * 0.58,
    x + size * 0.28 + capeWave * 4,
    y - size * 0.4 + breathe,
  );
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y - size * 0.35,
    x + size * 0.02,
    y - size * 0.4 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Main plume with gradient
  const plumeGrad = ctx.createLinearGradient(
    x,
    y - size * 0.55,
    x + size * 0.25,
    y - size * 0.35,
  );
  plumeGrad.addColorStop(0, "#ff7700");
  plumeGrad.addColorStop(0.3, "#ff5500");
  plumeGrad.addColorStop(0.7, "#ff6600");
  plumeGrad.addColorStop(1, "#dd4400");
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.42 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.2 + capeWave * 2.4 + plumeWhip * size * 0.035,
    y - size * 0.58,
    x + size * 0.28 + capeWave * 4 + plumeWhip * size * 0.045,
    y - size * 0.38 + breathe,
  );
  ctx.quadraticCurveTo(
    x + size * 0.12,
    y - size * 0.34,
    x,
    y - size * 0.4 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Plume highlight feathers
  ctx.strokeStyle = "#ffaa44";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  for (let feather = 0; feather < 4; feather++) {
    const fOffset = feather * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.02, y - size * 0.42 + breathe);
    ctx.quadraticCurveTo(
      x +
        size * (0.1 + fOffset) +
        capeWave * (1.5 + feather * 0.3) +
        plumeWhip * size * 0.02,
      y - size * (0.48 + fOffset * 0.3),
      x +
        size * (0.15 + fOffset) +
        capeWave * (2 + feather * 0.4) +
        plumeWhip * size * 0.03,
      y - size * 0.38 + breathe,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Secondary smaller plume
  ctx.fillStyle = "#ff8800";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.4 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.08 + capeWave2 * 1.5,
    y - size * 0.48,
    x + size * 0.12 + capeWave2 * 2,
    y - size * 0.36 + breathe,
  );
  ctx.quadraticCurveTo(
    x + size * 0.04,
    y - size * 0.34,
    x - size * 0.02,
    y - size * 0.38 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Elite ornate kite shield with layered crest.
  const eliteShieldGlow = 0.68 + Math.sin(time * 4.2) * 0.32;
  ctx.save();
  ctx.translate(
    x - size * 0.3,
    y + size * 0.04 + breathe * 0.55 + hipBounce * 0.4,
  );
  ctx.rotate(-0.22 + stance * 0.03 - attackDrive * 0.08);
  ctx.scale(0.75, 0.75);

  // Shield shadow
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.moveTo(size * 0.02, -size * 0.27);
  ctx.lineTo(-size * 0.16, -size * 0.15);
  ctx.lineTo(-size * 0.14, size * 0.2);
  ctx.lineTo(size * 0.02, size * 0.29);
  ctx.lineTo(size * 0.17, size * 0.2);
  ctx.lineTo(size * 0.19, -size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Shield outer body (dark steel)
  const shieldOuterGrad = ctx.createLinearGradient(
    -size * 0.17,
    0,
    size * 0.17,
    0,
  );
  shieldOuterGrad.addColorStop(0, "#1e2430");
  shieldOuterGrad.addColorStop(0.3, "#3a4460");
  shieldOuterGrad.addColorStop(0.5, "#4a5672");
  shieldOuterGrad.addColorStop(0.7, "#3a4460");
  shieldOuterGrad.addColorStop(1, "#1e2430");
  ctx.fillStyle = shieldOuterGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.29);
  ctx.lineTo(-size * 0.17, -size * 0.17);
  ctx.lineTo(-size * 0.15, size * 0.21);
  ctx.lineTo(0, size * 0.29);
  ctx.lineTo(size * 0.15, size * 0.21);
  ctx.lineTo(size * 0.17, -size * 0.17);
  ctx.closePath();
  ctx.fill();

  // Inner field (deep navy with vertical gradient)
  const shieldFieldGrad = ctx.createLinearGradient(
    0,
    -size * 0.22,
    0,
    size * 0.22,
  );
  shieldFieldGrad.addColorStop(0, "#2a3352");
  shieldFieldGrad.addColorStop(0.5, "#1e2744");
  shieldFieldGrad.addColorStop(1, "#161d36");
  ctx.fillStyle = shieldFieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.22);
  ctx.lineTo(-size * 0.12, -size * 0.12);
  ctx.lineTo(-size * 0.1, size * 0.16);
  ctx.lineTo(0, size * 0.22);
  ctx.lineTo(size * 0.1, size * 0.16);
  ctx.lineTo(size * 0.12, -size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Filigree engravings (gold swirls)
  ctx.strokeStyle = "rgba(208, 179, 122, 0.5)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.07, -size * 0.13);
  ctx.quadraticCurveTo(-size * 0.09, -size * 0.06, -size * 0.04, -size * 0.01);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.07, -size * 0.13);
  ctx.quadraticCurveTo(size * 0.09, -size * 0.06, size * 0.04, -size * 0.01);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, size * 0.08);
  ctx.quadraticCurveTo(-size * 0.07, size * 0.13, -size * 0.02, size * 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.04, size * 0.08);
  ctx.quadraticCurveTo(size * 0.07, size * 0.13, size * 0.02, size * 0.16);
  ctx.stroke();

  // Cross emblem (thicker, with glow)
  ctx.strokeStyle = `rgba(220, 195, 130, ${0.7 + eliteShieldGlow * 0.2})`;
  ctx.lineWidth = 2.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.18);
  ctx.lineTo(0, size * 0.17);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.075, -size * 0.01);
  ctx.lineTo(size * 0.075, -size * 0.01);
  ctx.stroke();
  // Cross glow layer
  ctx.strokeStyle = `rgba(255, 220, 150, ${0.15 + eliteShieldGlow * 0.12})`;
  ctx.lineWidth = 4.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.16);
  ctx.lineTo(0, size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.065, -size * 0.01);
  ctx.lineTo(size * 0.065, -size * 0.01);
  ctx.stroke();

  // Outer gold trim border (double line)
  ctx.strokeStyle = "#d4b86a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.29);
  ctx.lineTo(-size * 0.17, -size * 0.17);
  ctx.lineTo(-size * 0.15, size * 0.21);
  ctx.lineTo(0, size * 0.29);
  ctx.lineTo(size * 0.15, size * 0.21);
  ctx.lineTo(size * 0.17, -size * 0.17);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = "#a38940";
  ctx.lineWidth = 1.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(-size * 0.14, -size * 0.15);
  ctx.lineTo(-size * 0.12, size * 0.18);
  ctx.lineTo(0, size * 0.25);
  ctx.lineTo(size * 0.12, size * 0.18);
  ctx.lineTo(size * 0.14, -size * 0.15);
  ctx.closePath();
  ctx.stroke();

  // Central boss (metal dome with highlight)
  const bossGrad = ctx.createRadialGradient(
    -size * 0.008,
    -size * 0.02,
    size * 0.005,
    0,
    0,
    size * 0.04,
  );
  bossGrad.addColorStop(0, "#f0e8d0");
  bossGrad.addColorStop(0.4, "#c8a848");
  bossGrad.addColorStop(1, "#7a6530");
  ctx.fillStyle = bossGrad;
  ctx.beginPath();
  ctx.arc(0, -size * 0.01, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d4b86a";
  ctx.lineWidth = 1.0 * zoom;
  ctx.stroke();

  // Corner rivets
  const rivetPositions = [
    [0, -size * 0.25],
    [-size * 0.13, -size * 0.04],
    [size * 0.13, -size * 0.04],
    [-size * 0.08, size * 0.16],
    [size * 0.08, size * 0.16],
  ];
  for (const [rx, ry] of rivetPositions) {
    ctx.fillStyle = "#c8b060";
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8d898";
    ctx.beginPath();
    ctx.arc(rx - size * 0.003, ry - size * 0.003, size * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing center gem
  ctx.shadowColor = "rgba(255, 157, 62, 0.6)";
  ctx.shadowBlur = 6 * zoom * eliteShieldGlow;
  ctx.fillStyle = `rgba(255, 157, 62, ${0.6 + eliteShieldGlow * 0.35})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.01, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Shield edge highlight (specular)
  ctx.strokeStyle = "rgba(180, 200, 230, 0.25)";
  ctx.lineWidth = 1.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.28);
  ctx.lineTo(-size * 0.16, -size * 0.16);
  ctx.stroke();
  ctx.restore();

  // Extra elite accessories: pauldron tassels and chained relic seals.
  for (let side = -1; side <= 1; side += 2) {
    const tasselX = x + side * size * 0.2;
    const tasselY = y + size * 0.08 + breathe;
    ctx.strokeStyle = "rgba(216, 179, 104, 0.72)";
    ctx.lineWidth = 1.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(tasselX, tasselY);
    ctx.quadraticCurveTo(
      tasselX + side * size * 0.028,
      tasselY + size * 0.08,
      tasselX + side * size * 0.02,
      tasselY + size * 0.18,
    );
    ctx.stroke();
    ctx.fillStyle = "#d5a54c";
    ctx.beginPath();
    ctx.roundRect(
      tasselX + side * size * 0.006 - size * 0.012,
      tasselY + size * 0.17,
      size * 0.024,
      size * 0.03,
      size * 0.008,
    );
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(210, 183, 127, 0.66)";
  ctx.lineWidth = 1.3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.23 + breathe);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.29 + breathe,
    x + size * 0.14,
    y + size * 0.23 + breathe,
  );
  ctx.stroke();
  for (let link = 0; link < 3; link++) {
    const linkX = x - size * 0.09 + link * size * 0.09;
    const linkY =
      y + size * 0.25 + breathe + Math.sin(link * 1.2) * size * 0.008;
    ctx.fillStyle = link % 2 === 0 ? "#c79b44" : "#ff7a2f";
    ctx.beginPath();
    ctx.arc(linkX, linkY, size * 0.013, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distinct elite halberd profile: crescent blade, beak hook, pennant, and rune edge.
  ctx.save();
  ctx.translate(halberdX, halberdY);
  ctx.rotate(halberdAngle);
  const edgeGlow = isAttacking
    ? 0.55 + Math.abs(halberdSwing) * 0.4
    : 0.28 + shimmer * 0.18;
  const bannerWave =
    Math.sin(time * 6 + attackPhase * Math.PI * 1.6) *
    size *
    (isAttacking ? 0.05 : 0.03);

  // Halberd shaft (drawn first so blade elements render on top)
  const shaftGrad = ctx.createLinearGradient(-size * 0.03, 0, size * 0.03, 0);
  shaftGrad.addColorStop(0, "#3e2510");
  shaftGrad.addColorStop(0.3, "#6b4422");
  shaftGrad.addColorStop(0.55, "#7d5530");
  shaftGrad.addColorStop(0.8, "#5a3a1b");
  shaftGrad.addColorStop(1, "#3a2212");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.028, -size * 0.53, size * 0.056, size * 0.88);
  // Wood grain highlight
  ctx.fillStyle = "rgba(160, 120, 65, 0.22)";
  ctx.fillRect(-size * 0.008, -size * 0.5, size * 0.016, size * 0.82);
  // Metal grip bands
  const bandColor = "#9a8a60";
  const bandHighlight = "#c4b47a";
  for (const bandY of [-size * 0.08, size * 0.1, size * 0.28]) {
    ctx.fillStyle = bandColor;
    ctx.fillRect(-size * 0.035, bandY, size * 0.07, size * 0.028);
    ctx.fillStyle = bandHighlight;
    ctx.fillRect(-size * 0.035, bandY, size * 0.07, size * 0.008);
  }

  if (isAttacking && Math.abs(halberdSwing) > 0.25) {
    ctx.strokeStyle = `rgba(255, 194, 110, ${0.24 + attackDrive * 0.34})`;
    ctx.lineWidth = 5 * zoom;
    ctx.beginPath();
    ctx.arc(
      0,
      -size * 0.42,
      size * 0.3,
      -Math.PI * 0.52,
      -Math.PI * 0.52 + halberdSwing * 0.92,
    );
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 248, 220, ${0.16 + attackDrive * 0.22})`;
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.arc(
      0,
      -size * 0.42,
      size * 0.25,
      -Math.PI * 0.52,
      -Math.PI * 0.52 + halberdSwing * 0.88,
    );
    ctx.stroke();
    for (let spark = 0; spark < 5; spark++) {
      const sparkAngle = -Math.PI * 0.52 + halberdSwing * (0.45 + spark * 0.08);
      const sparkRadius = size * (0.22 + spark * 0.03);
      ctx.fillStyle = `rgba(255, 224, 166, ${0.75 - spark * 0.12})`;
      ctx.beginPath();
      ctx.arc(
        Math.cos(sparkAngle) * sparkRadius,
        -size * 0.42 + Math.sin(sparkAngle) * sparkRadius,
        size * 0.015,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  const crescentGrad = ctx.createLinearGradient(
    -size * 0.2,
    -size * 0.5,
    size * 0.02,
    -size * 0.28,
  );
  crescentGrad.addColorStop(0, "#c3c9d8");
  crescentGrad.addColorStop(0.5, "#eef1ff");
  crescentGrad.addColorStop(1, "#9ea6bb");
  ctx.fillStyle = crescentGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.53);
  ctx.quadraticCurveTo(-size * 0.17, -size * 0.45, -size * 0.2, -size * 0.31);
  ctx.quadraticCurveTo(-size * 0.14, -size * 0.35, -size * 0.04, -size * 0.34);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(243, 247, 255, ${0.36 + edgeGlow * 0.3})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.53);
  ctx.quadraticCurveTo(-size * 0.17, -size * 0.45, -size * 0.2, -size * 0.31);
  ctx.stroke();

  ctx.fillStyle = "#b0b9cc";
  ctx.beginPath();
  ctx.moveTo(size * 0.02, -size * 0.46);
  ctx.quadraticCurveTo(size * 0.13, -size * 0.44, size * 0.11, -size * 0.39);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.34, size * 0.01, -size * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#8d97ad";
  ctx.beginPath();
  ctx.moveTo(size * 0.022, -size * 0.42);
  ctx.quadraticCurveTo(size * 0.16, -size * 0.39, size * 0.14, -size * 0.33);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.28, size * 0.03, -size * 0.32);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d8dff3";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.68);
  ctx.lineTo(-size * 0.055, -size * 0.54);
  ctx.lineTo(size * 0.055, -size * 0.54);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 225, 160, ${0.35 + edgeGlow * 0.28})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.62);
  ctx.lineTo(-size * 0.01, -size * 0.54);
  ctx.moveTo(size * 0.01, -size * 0.62);
  ctx.lineTo(size * 0.01, -size * 0.54);
  ctx.stroke();

  // Rune marks on the blade face.
  ctx.strokeStyle = `rgba(255, 171, 82, ${0.32 + edgeGlow * 0.35})`;
  ctx.lineWidth = 0.9 * zoom;
  for (let rune = 0; rune < 3; rune++) {
    const runeY = -size * (0.46 - rune * 0.065);
    ctx.beginPath();
    ctx.moveTo(-size * 0.07, runeY);
    ctx.lineTo(-size * 0.05, runeY - size * 0.018);
    ctx.lineTo(-size * 0.035, runeY + size * 0.012);
    ctx.stroke();
  }

  ctx.fillStyle = heraldicColor;
  ctx.beginPath();
  ctx.moveTo(size * 0.015, -size * 0.2);
  ctx.lineTo(size * 0.22, -size * 0.15 + bannerWave);
  ctx.lineTo(size * 0.12, -size * 0.03 + bannerWave * 0.55);
  ctx.lineTo(size * 0.2, size * 0.02 + bannerWave * 0.2);
  ctx.lineTo(size * 0.015, -size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 228, 179, ${0.25 + edgeGlow * 0.3})`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.stroke();

  // Counterweight spike and accent collar for stronger silhouette.
  ctx.fillStyle = "#c7aa6b";
  ctx.beginPath();
  ctx.roundRect(
    -size * 0.04,
    -size * 0.525,
    size * 0.08,
    size * 0.02,
    size * 0.005,
  );
  ctx.fill();
  ctx.fillStyle = "#c0c8d8";
  ctx.beginPath();
  ctx.moveTo(size * 0.012, size * 0.33);
  ctx.lineTo(size * 0.055, size * 0.28);
  ctx.lineTo(size * 0.052, size * 0.36);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}
