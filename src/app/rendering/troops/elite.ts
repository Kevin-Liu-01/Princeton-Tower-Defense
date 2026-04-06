import type { Position } from "../../types";
import {
  WEAPON_LIMITS,
  anchorWeaponToHand,
  drawArmoredSkirt,
  drawDetailedArm,
} from "./troopHelpers";
import type { ArmColors } from "./troopHelpers";
import { getScenePressure } from "../performance";

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

  // Anchor halberd to hand — arm swing drives hand position
  const eliteHalbArmLen = size * 0.2;
  const eliteHalbGripLocalY = size * 0.1;
  const eliteHalbShoulderX = x + size * 0.12;
  const eliteHalbShoulderY = y - size * 0.02 + breathe;
  const eliteHalbArmSwing = isAttacking
    ? 0.05 + halberdSwing * 0.4
    : 0.35 + stance * 0.02;
  const halberdBaseAngle = 0.4 + stance * 0.02 + halberdSwing;
  const halbAnchor = anchorWeaponToHand(
    eliteHalbShoulderX,
    eliteHalbShoulderY,
    eliteHalbArmLen,
    eliteHalbArmSwing,
    eliteHalbGripLocalY,
    halberdBaseAngle,
    targetPos,
    Math.PI / 2,
    isAttacking ? 1.15 : 0.62,
    WEAPON_LIMITS.rightPole,
  );
  const halberdX = halbAnchor.weaponX;
  const halberdY = halbAnchor.weaponY;
  const halberdAngle = halbAnchor.weaponAngle;

  // === ELITE AURA (always present, stronger during attack) ===
  const pressure = getScenePressure();
  const auraIntensity = isAttacking ? 0.6 : 0.3;
  const auraPulse = 0.8 + Math.sin(time * 4) * 0.2;

  const auraLayerCount = pressure.skipNonEssentialParticles
    ? 0
    : pressure.skipDecorativeEffects
      ? 1
      : 3;
  for (let auraLayer = 0; auraLayer < auraLayerCount; auraLayer++) {
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
  if (isAttacking && !pressure.skipDecorativeEffects) {
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

  // === ROYAL CAPE (multi-layered with rich fabric) ===
  const cw = capeWave * size * 0.025;
  const cw2s = capeWave2 * size * 0.015;
  const br = breathe;

  const capeLX = x - size * 0.2;
  const capeRX = x + size * 0.16;
  const capeTopY = y - size * 0.1 + br;
  const capeBotLX = x - size * 0.3 + cw * 1.5 - attackLunge * 0.15;
  const capeBotLY = y + size * 0.52;
  const capeBotRX = x + size * 0.14 + cw * 0.6;
  const capeBotRY = y + size * 0.48;
  const capeCtrlLX = x - size * 0.36 + cw * 2 - attackLunge * 0.12;
  const capeCtrlLY = y + size * 0.3 + hipBounce;

  // Drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.moveTo(capeLX + size * 0.015, capeTopY + size * 0.025);
  ctx.quadraticCurveTo(
    capeCtrlLX + size * 0.015,
    capeCtrlLY + size * 0.025,
    capeBotLX + size * 0.015,
    capeBotLY + size * 0.025,
  );
  ctx.lineTo(capeBotRX + size * 0.015, capeBotRY + size * 0.025);
  ctx.quadraticCurveTo(
    capeRX + size * 0.015,
    y + size * 0.2,
    capeRX + size * 0.015,
    capeTopY + size * 0.025,
  );
  ctx.closePath();
  ctx.fill();

  // Outer cape (deep royal purple-black)
  const outerGrad = ctx.createLinearGradient(
    capeLX,
    capeTopY,
    capeBotLX,
    capeBotLY,
  );
  outerGrad.addColorStop(0, "#14082a");
  outerGrad.addColorStop(0.3, "#1a0c32");
  outerGrad.addColorStop(0.6, "#100824");
  outerGrad.addColorStop(1, "#08041a");
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.moveTo(capeLX, capeTopY);
  ctx.quadraticCurveTo(capeCtrlLX, capeCtrlLY, capeBotLX, capeBotLY);
  ctx.lineTo(capeBotRX, capeBotRY);
  ctx.quadraticCurveTo(capeRX, y + size * 0.18, capeRX, capeTopY);
  ctx.closePath();
  ctx.fill();

  // Middle cape layer (rich purple)
  const midGrad = ctx.createLinearGradient(
    capeLX,
    capeTopY,
    capeBotLX,
    capeBotLY,
  );
  midGrad.addColorStop(0, "#2a1658");
  midGrad.addColorStop(0.3, "#221048");
  midGrad.addColorStop(0.6, "#1a0c3a");
  midGrad.addColorStop(1, "#0e0628");
  ctx.fillStyle = midGrad;
  ctx.beginPath();
  ctx.moveTo(capeLX + size * 0.025, capeTopY + size * 0.01);
  ctx.quadraticCurveTo(
    capeCtrlLX + size * 0.05,
    capeCtrlLY,
    capeBotLX + size * 0.04,
    capeBotLY - size * 0.06,
  );
  ctx.lineTo(capeBotRX - size * 0.02, capeBotRY - size * 0.05);
  ctx.quadraticCurveTo(
    capeRX - size * 0.02,
    y + size * 0.18,
    capeRX - size * 0.02,
    capeTopY + size * 0.01,
  );
  ctx.closePath();
  ctx.fill();

  // Inner lining (warm crimson, visible at bottom curl)
  const liningGrad = ctx.createLinearGradient(
    capeLX,
    y + size * 0.4,
    capeBotLX,
    capeBotLY,
  );
  liningGrad.addColorStop(0, "#602018");
  liningGrad.addColorStop(0.5, "#883020");
  liningGrad.addColorStop(1, "#502010");
  ctx.fillStyle = liningGrad;
  ctx.beginPath();
  ctx.moveTo(capeBotLX + size * 0.02, capeBotLY - size * 0.04);
  ctx.quadraticCurveTo(
    (capeBotLX + capeBotRX) * 0.5,
    capeBotLY + size * 0.01,
    capeBotRX - size * 0.01,
    capeBotRY - size * 0.03,
  );
  ctx.lineTo(capeBotRX - size * 0.03, capeBotRY - size * 0.08);
  ctx.quadraticCurveTo(
    (capeBotLX + capeBotRX) * 0.5,
    capeBotLY - size * 0.06,
    capeBotLX + size * 0.04,
    capeBotLY - size * 0.08,
  );
  ctx.closePath();
  ctx.fill();

  // Fabric fold shadows
  ctx.strokeStyle = "rgba(0,0,0,0.14)";
  ctx.lineWidth = 0.7 * zoom;
  for (let fold = 0; fold < 4; fold++) {
    const fT = (fold + 1) / 5;
    const fTopX = capeLX + (capeRX - capeLX) * fT;
    const fBotX = capeBotLX + (capeBotRX - capeBotLX) * fT;
    ctx.beginPath();
    ctx.moveTo(fTopX, capeTopY + size * 0.02);
    ctx.quadraticCurveTo(
      fTopX + cw * (1 - fT * 0.6),
      y + size * 0.28,
      fBotX,
      capeBotLY - size * 0.08,
    );
    ctx.stroke();
  }
  // Fold highlight (soft purple sheen)
  ctx.strokeStyle = `rgba(100, 60, 160, ${0.1 + shimmer * 0.08})`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(capeLX + size * 0.07, capeTopY + size * 0.02);
  ctx.quadraticCurveTo(
    capeLX + size * 0.06 + cw * 0.7,
    y + size * 0.28,
    capeBotLX + size * 0.08,
    capeBotLY - size * 0.08,
  );
  ctx.stroke();

  // Embroidered pattern (gold thread swirls, subtle)
  ctx.strokeStyle = `rgba(200, 170, 70, ${0.18 + shimmer * 0.12})`;
  ctx.lineWidth = 0.7 * zoom;
  for (let row = 0; row < 3; row++) {
    const rowY = y + size * (0.18 + row * 0.14);
    const rowW = size * (0.14 - row * 0.02);
    const rowOff = cw * (0.4 + row * 0.2);
    ctx.beginPath();
    ctx.moveTo(x - rowW + rowOff, rowY);
    ctx.quadraticCurveTo(
      x - rowW * 0.3 + rowOff,
      rowY - size * 0.025,
      x + rowOff,
      rowY,
    );
    ctx.quadraticCurveTo(
      x + rowW * 0.3 + rowOff,
      rowY + size * 0.025,
      x + rowW * 0.6 + rowOff,
      rowY,
    );
    ctx.stroke();
  }

  // Left edge trim (gold)
  ctx.strokeStyle = `rgba(255, 207, 122, ${0.55 + shimmer * 0.2})`;
  ctx.lineWidth = 2.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(capeLX, capeTopY);
  ctx.quadraticCurveTo(capeCtrlLX, capeCtrlLY, capeBotLX, capeBotLY);
  ctx.stroke();

  // Bottom hem (double gold trim)
  ctx.strokeStyle = `rgba(255, 207, 122, ${0.6 + shimmer * 0.18})`;
  ctx.lineWidth = 2.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(capeBotLX, capeBotLY);
  ctx.lineTo(capeBotRX, capeBotRY);
  ctx.stroke();
  ctx.strokeStyle = `rgba(180, 140, 50, ${0.35 + shimmer * 0.12})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(capeBotLX + size * 0.02, capeBotLY - size * 0.02);
  ctx.lineTo(capeBotRX - size * 0.01, capeBotRY - size * 0.02);
  ctx.stroke();

  // Cape clasp gem at shoulder
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = `rgba(255, 100, 0, ${0.5 + gemPulse * 0.3})`;
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.12,
    capeTopY + size * 0.02,
    size * 0.038,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  // Gem highlight
  ctx.fillStyle = `rgba(255, 240, 200, ${0.5 + gemPulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.126,
    capeTopY + size * 0.014,
    size * 0.013,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === LEGS (ornate articulated plate armor) ===
  for (let side = -1; side <= 1; side += 2) {
    const isLeft = side === -1;
    ctx.save();
    ctx.translate(
      isLeft
        ? x - stanceSpread + weightShift * 0.18
        : x + stanceSpread - weightShift * 0.18,
      y + size * 0.3 + hipBounce,
    );
    ctx.rotate(
      side * (-0.07 + stance * 0.018) +
        (isLeft ? -attackDrive * 0.06 : attackDrive * 0.06),
    );

    const lw = size * 0.14;
    const hlw = lw * 0.5;

    // --- Thigh plate (cuisse) ---
    const thighH = size * 0.1;
    const thighGrad = ctx.createLinearGradient(-hlw, 0, hlw, 0);
    thighGrad.addColorStop(0, "#3a3e48");
    thighGrad.addColorStop(0.2, "#6a7080");
    thighGrad.addColorStop(0.5, "#a0a8b8");
    thighGrad.addColorStop(0.8, "#6a7080");
    thighGrad.addColorStop(1, "#3a3e48");
    ctx.fillStyle = thighGrad;
    ctx.beginPath();
    ctx.roundRect(-hlw, 0, lw, thighH, size * 0.015);
    ctx.fill();

    // Thigh plate edge highlight
    ctx.strokeStyle = `rgba(200, 210, 225, ${0.3 + shimmer * 0.2})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(isLeft ? -hlw : hlw, size * 0.01);
    ctx.lineTo(isLeft ? -hlw : hlw, thighH - size * 0.01);
    ctx.stroke();

    // Thigh articulation bands
    ctx.strokeStyle = "#2e3340";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-hlw + size * 0.01, thighH * 0.4);
    ctx.lineTo(hlw - size * 0.01, thighH * 0.4);
    ctx.moveTo(-hlw + size * 0.01, thighH * 0.7);
    ctx.lineTo(hlw - size * 0.01, thighH * 0.7);
    ctx.stroke();
    // Band top-edge highlights
    ctx.strokeStyle = `rgba(200, 210, 225, 0.25)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-hlw + size * 0.01, thighH * 0.4 - 1);
    ctx.lineTo(hlw - size * 0.01, thighH * 0.4 - 1);
    ctx.moveTo(-hlw + size * 0.01, thighH * 0.7 - 1);
    ctx.lineTo(hlw - size * 0.01, thighH * 0.7 - 1);
    ctx.stroke();

    // Gold filigree on thigh
    ctx.strokeStyle = `rgba(201, 162, 39, ${0.25 + shimmer * 0.15})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, thighH * 0.15);
    ctx.quadraticCurveTo(
      size * 0.015,
      thighH * 0.3,
      -size * 0.01,
      thighH * 0.45,
    );
    ctx.stroke();

    // --- Knee cop (poleyn) ---
    const kneeY = thighH + size * 0.005;
    // Outer shell
    ctx.fillStyle = "#8a90a0";
    ctx.beginPath();
    ctx.ellipse(0, kneeY, size * 0.08, size * 0.055, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner raised plate
    const kneePlateGrad = ctx.createRadialGradient(
      0,
      kneeY,
      0,
      0,
      kneeY,
      size * 0.06,
    );
    kneePlateGrad.addColorStop(0, "#c8d0e0");
    kneePlateGrad.addColorStop(0.5, "#a0a8b8");
    kneePlateGrad.addColorStop(1, "#6a7080");
    ctx.fillStyle = kneePlateGrad;
    ctx.beginPath();
    ctx.ellipse(0, kneeY, size * 0.055, size * 0.038, 0, 0, Math.PI * 2);
    ctx.fill();
    // Knee fan guard (pointed extension below knee)
    ctx.fillStyle = "#7a8090";
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, kneeY + size * 0.03);
    ctx.lineTo(0, kneeY + size * 0.065);
    ctx.lineTo(size * 0.04, kneeY + size * 0.03);
    ctx.closePath();
    ctx.fill();
    // Knee gem
    ctx.fillStyle = "#ff3300";
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 3 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(0, kneeY, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Gem specular pip
    ctx.fillStyle = "rgba(255,255,200,0.7)";
    ctx.beginPath();
    ctx.arc(-size * 0.006, kneeY - size * 0.006, size * 0.006, 0, Math.PI * 2);
    ctx.fill();
    // Side rivets on knee cop (gold trim)
    for (const rx of [-size * 0.055, size * 0.055]) {
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(rx, kneeY, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,230,140,0.4)";
      ctx.beginPath();
      ctx.arc(
        rx - size * 0.003,
        kneeY - size * 0.003,
        size * 0.004,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // --- Greave (shin guard) ---
    const greaveTop = kneeY + size * 0.05;
    const greaveH = size * 0.12;
    const greaveGrad = ctx.createLinearGradient(
      -hlw,
      greaveTop,
      hlw,
      greaveTop,
    );
    greaveGrad.addColorStop(0, "#3a3e48");
    greaveGrad.addColorStop(0.15, "#6a7080");
    greaveGrad.addColorStop(0.45, "#a8b0c0");
    greaveGrad.addColorStop(0.55, "#a0a8b8");
    greaveGrad.addColorStop(0.85, "#6a7080");
    greaveGrad.addColorStop(1, "#3a3e48");
    ctx.fillStyle = greaveGrad;
    ctx.beginPath();
    ctx.roundRect(-hlw, greaveTop, lw, greaveH, [
      0,
      0,
      size * 0.02,
      size * 0.02,
    ]);
    ctx.fill();

    // Greave center ridge (raised shin line)
    ctx.strokeStyle = `rgba(200, 210, 230, ${0.35 + shimmer * 0.2})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, greaveTop + size * 0.01);
    ctx.lineTo(0, greaveTop + greaveH - size * 0.01);
    ctx.stroke();

    // Greave articulation bands
    ctx.strokeStyle = "#2e3340";
    ctx.lineWidth = 1 * zoom;
    for (const t of [0.3, 0.6]) {
      const bandY = greaveTop + greaveH * t;
      ctx.beginPath();
      ctx.moveTo(-hlw + size * 0.01, bandY);
      ctx.lineTo(hlw - size * 0.01, bandY);
      ctx.stroke();
    }

    // Greave edge highlight
    ctx.strokeStyle = `rgba(200, 210, 225, ${0.3 + shimmer * 0.2})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(isLeft ? -hlw : hlw, greaveTop + size * 0.01);
    ctx.lineTo(isLeft ? -hlw : hlw, greaveTop + greaveH - size * 0.01);
    ctx.stroke();

    // Gold filigree on greave
    ctx.strokeStyle = `rgba(201, 162, 39, ${0.2 + shimmer * 0.15})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.015, greaveTop + greaveH * 0.2);
    ctx.quadraticCurveTo(
      -size * 0.02,
      greaveTop + greaveH * 0.5,
      size * 0.01,
      greaveTop + greaveH * 0.8,
    );
    ctx.stroke();

    // --- Sabaton (armored boot) ---
    const bootTop = greaveTop + greaveH;
    const bootH = size * 0.07;
    const bootGrad = ctx.createLinearGradient(-hlw, bootTop, hlw, bootTop);
    bootGrad.addColorStop(0, "#2a2e38");
    bootGrad.addColorStop(0.3, "#3e4350");
    bootGrad.addColorStop(0.7, "#3e4350");
    bootGrad.addColorStop(1, "#2a2e38");
    ctx.fillStyle = bootGrad;
    ctx.beginPath();
    ctx.roundRect(-hlw - size * 0.01, bootTop, lw + size * 0.02, bootH, [
      0,
      0,
      size * 0.025,
      size * 0.025,
    ]);
    ctx.fill();

    // Boot cuff band
    ctx.fillStyle = "#5a6070";
    ctx.fillRect(-hlw - size * 0.01, bootTop, lw + size * 0.02, size * 0.025);
    // Gold buckle strap
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(
      -size * 0.03,
      bootTop + size * 0.035,
      size * 0.06,
      size * 0.018,
    );
    // Buckle highlight
    ctx.fillStyle = `rgba(255, 230, 140, ${0.4 + shimmer * 0.2})`;
    ctx.fillRect(
      -size * 0.015,
      bootTop + size * 0.038,
      size * 0.03,
      size * 0.012,
    );

    // Boot toe plate segments
    ctx.strokeStyle = "#2e3340";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-hlw, bootTop + bootH * 0.55);
    ctx.lineTo(hlw, bootTop + bootH * 0.55);
    ctx.stroke();

    // Sole
    ctx.fillStyle = "#1e2028";
    ctx.fillRect(
      -hlw - size * 0.01,
      bootTop + bootH - size * 0.015,
      lw + size * 0.02,
      size * 0.015,
    );

    ctx.restore();
  }

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
    y - size * 0.12,
    x + size * 0.2,
    y + size * 0.32,
  );
  plateGrad.addColorStop(0, "#3a3e4a");
  plateGrad.addColorStop(0.08, "#5a6070");
  plateGrad.addColorStop(0.2, "#8a92a8");
  plateGrad.addColorStop(0.35, "#a8b0c4");
  plateGrad.addColorStop(0.5, "#c4cce0");
  plateGrad.addColorStop(0.65, "#a8b0c4");
  plateGrad.addColorStop(0.8, "#7a8298");
  plateGrad.addColorStop(0.92, "#5a6070");
  plateGrad.addColorStop(1, "#3a3e4a");
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

  // Outer edge highlight (gold trim)
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.31 + breathe);
  ctx.lineTo(x - size * 0.265, y - size * 0.08 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.15 + breathe * 0.3,
    x + size * 0.265,
    y - size * 0.08 + breathe * 0.5,
  );
  ctx.lineTo(x + size * 0.24, y + size * 0.31 + breathe);
  ctx.stroke();

  // --- Sculpted pectoral contours ---
  for (let side = -1; side <= 1; side += 2) {
    // Upper pec highlight arc
    const pecHL = ctx.createLinearGradient(
      x + side * size * 0.02,
      y - size * 0.12,
      x + side * size * 0.18,
      y + size * 0.06,
    );
    pecHL.addColorStop(0, `rgba(210, 220, 240, ${0.35 + shimmer * 0.15})`);
    pecHL.addColorStop(0.5, `rgba(180, 195, 220, ${0.18 + shimmer * 0.08})`);
    pecHL.addColorStop(1, "rgba(160, 175, 200, 0)");
    ctx.strokeStyle = pecHL;
    ctx.lineWidth = 1.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, y - size * 0.1 + breathe * 0.4);
    ctx.quadraticCurveTo(
      x + side * size * 0.15,
      y - size * 0.04 + breathe * 0.55,
      x + side * size * 0.18,
      y + size * 0.06 + breathe * 0.65,
    );
    ctx.stroke();

    // Pectoral shadow crease
    ctx.strokeStyle = `rgba(30, 35, 50, 0.4)`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.05, y + size * 0.02 + breathe * 0.6);
    ctx.quadraticCurveTo(
      x + side * size * 0.13,
      y + size * 0.08 + breathe * 0.7,
      x + side * size * 0.2,
      y + size * 0.05 + breathe * 0.65,
    );
    ctx.stroke();
  }

  // --- Center sternum line (gold trim) ---
  const sternGrad = ctx.createLinearGradient(
    x,
    y - size * 0.1,
    x,
    y + size * 0.14,
  );
  sternGrad.addColorStop(0, `rgba(201, 162, 39, ${0.5 + shimmer * 0.2})`);
  sternGrad.addColorStop(0.5, `rgba(180, 145, 35, ${0.3 + shimmer * 0.1})`);
  sternGrad.addColorStop(1, "rgba(160, 130, 30, 0.1)");
  ctx.strokeStyle = sternGrad;
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.1 + breathe * 0.4);
  ctx.lineTo(x, y + size * 0.14 + breathe * 0.8);
  ctx.stroke();

  // --- Abdominal plate arcs (3 tiers) ---
  for (let seg = 0; seg < 3; seg++) {
    const segY = y + size * (0.06 + seg * 0.058) + breathe * (0.6 + seg * 0.1);
    const segW = size * (0.16 - seg * 0.012);
    ctx.strokeStyle = `rgba(30, 35, 50, 0.45)`;
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - segW, segY);
    ctx.quadraticCurveTo(x, segY + size * 0.01, x + segW, segY);
    ctx.stroke();

    ctx.strokeStyle = `rgba(200, 210, 230, ${0.18 + shimmer * 0.06})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - segW, segY - size * 0.005);
    ctx.quadraticCurveTo(x, segY + size * 0.005, x + segW, segY - size * 0.005);
    ctx.stroke();
  }

  // --- Gold filigree scrollwork ---
  ctx.globalAlpha = 0.85;
  for (let side = -1; side <= 1; side += 2) {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 0.9 * zoom;
    // Main S-curve
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y - size * 0.06 + breathe * 0.5);
    ctx.quadraticCurveTo(
      x + side * size * 0.2,
      y + size * 0.02 + breathe * 0.6,
      x + side * size * 0.12,
      y + size * 0.08 + breathe * 0.7,
    );
    ctx.quadraticCurveTo(
      x + side * size * 0.06,
      y + size * 0.12 + breathe * 0.75,
      x + side * size * 0.15,
      y + size * 0.16 + breathe * 0.8,
    );
    ctx.stroke();
    // Tendril curls
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.12, y + size * 0.08 + breathe * 0.7);
    ctx.quadraticCurveTo(
      x + side * size * 0.2,
      y + size * 0.1 + breathe * 0.72,
      x + side * size * 0.18,
      y + size * 0.14 + breathe * 0.78,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // --- Specular chest bloom ---
  const specGrad = ctx.createRadialGradient(
    x - size * 0.03,
    y - size * 0.06 + breathe * 0.45,
    0,
    x - size * 0.03,
    y - size * 0.06 + breathe * 0.45,
    size * 0.15,
  );
  specGrad.addColorStop(0, `rgba(230, 235, 255, ${0.28 + shimmer * 0.18})`);
  specGrad.addColorStop(0.4, `rgba(210, 220, 245, ${0.12 + shimmer * 0.08})`);
  specGrad.addColorStop(1, "rgba(190, 200, 230, 0)");
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.03,
    y - size * 0.06 + breathe * 0.45,
    size * 0.12,
    size * 0.16,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // --- Edge rivets with specular pips ---
  for (let side = -1; side <= 1; side += 2) {
    for (let rv = 0; rv < 4; rv++) {
      const rivX = x + side * size * 0.2;
      const rivY =
        y - size * 0.04 + rv * size * 0.08 + breathe * (0.45 + rv * 0.1);
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(rivX, rivY, size * 0.009, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,220,0.35)";
      ctx.beginPath();
      ctx.arc(
        rivX - size * 0.002,
        rivY - size * 0.002,
        size * 0.004,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // --- Princeton shield emblem ---
  // Outer shield frame
  ctx.fillStyle = "#9a8038";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.05 + breathe);
  ctx.lineTo(x - size * 0.11, y + size * 0.09 + breathe);
  ctx.lineTo(x, y + size * 0.2 + breathe);
  ctx.lineTo(x + size * 0.11, y + size * 0.09 + breathe);
  ctx.closePath();
  ctx.fill();

  // Inner shield body
  const emblemGrad = ctx.createLinearGradient(
    x - size * 0.08,
    y - size * 0.02,
    x + size * 0.08,
    y + size * 0.16,
  );
  emblemGrad.addColorStop(0, "#dab32f");
  emblemGrad.addColorStop(0.5, "#e8c840");
  emblemGrad.addColorStop(1, "#c9a227");
  ctx.fillStyle = emblemGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.02 + breathe);
  ctx.lineTo(x - size * 0.07, y + size * 0.08 + breathe);
  ctx.lineTo(x, y + size * 0.16 + breathe);
  ctx.lineTo(x + size * 0.07, y + size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();

  // Emblem inner line
  ctx.strokeStyle = "#9a8038";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + 0.005 * size + breathe);
  ctx.lineTo(x - size * 0.05, y + size * 0.075 + breathe);
  ctx.lineTo(x, y + size * 0.14 + breathe);
  ctx.lineTo(x + size * 0.05, y + size * 0.075 + breathe);
  ctx.closePath();
  ctx.stroke();

  // Center gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08 + breathe, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Gem specular pip
  ctx.fillStyle = `rgba(255, 255, 200, ${0.6 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.008,
    y + size * 0.072 + breathe,
    size * 0.008,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // --- Belt with ornate buckle and pouches ---
  // Belt strap
  const beltGrad = ctx.createLinearGradient(
    x - size * 0.21,
    y + size * 0.23 + breathe,
    x - size * 0.21,
    y + size * 0.28 + breathe,
  );
  beltGrad.addColorStop(0, "#4a3a20");
  beltGrad.addColorStop(0.5, "#3a2a1a");
  beltGrad.addColorStop(1, "#2a1a10");
  ctx.fillStyle = beltGrad;
  ctx.fillRect(
    x - size * 0.21,
    y + size * 0.23 + breathe,
    size * 0.42,
    size * 0.05,
  );

  // Belt trim lines
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.5 * zoom;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.235 + breathe);
  ctx.lineTo(x + size * 0.2, y + size * 0.235 + breathe);
  ctx.moveTo(x - size * 0.2, y + size * 0.275 + breathe);
  ctx.lineTo(x + size * 0.2, y + size * 0.275 + breathe);
  ctx.stroke();
  ctx.globalAlpha = 1;

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
  ctx.strokeStyle = "#9a8038";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

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
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.25 + breathe, size * 0.013, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Belt pouches with stitching
  for (let side = -1; side <= 1; side += 2) {
    const pouchX = x + side * (size * 0.15);
    const pouchY = y + size * 0.25 + breathe;
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(pouchX, pouchY, size * 0.055, size * 0.045);
    ctx.strokeStyle = "#6a5a3a";
    ctx.lineWidth = 0.4 * zoom;
    ctx.strokeRect(pouchX, pouchY, size * 0.055, size * 0.045);
    // Pouch flap
    ctx.fillStyle = "#5a4a30";
    ctx.fillRect(pouchX, pouchY, size * 0.055, size * 0.012);
  }

  // === ARMORED SKIRT (tassets) ===
  drawArmoredSkirt(
    ctx,
    x,
    y,
    size,
    zoom,
    stance,
    breathe,
    {
      armorPeak: "#b8c0d4",
      armorHigh: "#a0a8b8",
      armorMid: "#7a8298",
      armorDark: "#5a6070",
      trimColor: "#c9a227",
    },
    { plateCount: 5, widthFactor: 0.46, depthFactor: 0.15, topOffset: 0.26 },
  );

  // === ARMS (connecting to shield and halberd) ===
  const eliteArmColors: ArmColors = {
    upper: "#7a8298",
    upperLight: "#a0a8b8",
    upperDark: "#3a3e4a",
    vambrace: "#a0a8b8",
    vambraceLight: "#c4cce0",
    elbow: "#7a8298",
    hand: "#7a8298",
    trim: "#c9a227",
  };

  // Left arm → shield grip
  const eliteShieldX = x - size * 0.3;
  const eliteShieldY = y + size * 0.1 + breathe * 0.55 + hipBounce * 0.4;
  const eliteLShoulderX = x - size * 0.2;
  const eliteLShoulderY = y - size * 0.02 + breathe;
  const eliteArmToShieldAngle = Math.atan2(
    eliteShieldY - eliteLShoulderY,
    eliteShieldX - eliteLShoulderX,
  );

  ctx.save();
  ctx.translate(eliteLShoulderX, eliteLShoulderY);
  ctx.rotate(eliteArmToShieldAngle);
  drawDetailedArm(ctx, size, size * 0.2, zoom, eliteArmColors);
  ctx.restore();

  // Right arm → halberd (anchored to hand)
  ctx.save();
  ctx.translate(eliteHalbShoulderX, eliteHalbShoulderY);
  ctx.rotate(eliteHalbArmSwing);
  drawDetailedArm(ctx, size, eliteHalbArmLen, zoom, eliteArmColors);
  ctx.restore();

  // === SHOULDERS (elaborate layered pauldrons) ===
  // Left pauldron - multiple layers
  ctx.save();
  ctx.translate(x - size * 0.23, y - size * 0.04 + breathe);

  // Pauldron base layer
  const pauldronGradL = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.14);
  pauldronGradL.addColorStop(0, "#d8c068");
  pauldronGradL.addColorStop(0.6, "#9c8848");
  pauldronGradL.addColorStop(1, "#5c4c2a");
  ctx.fillStyle = pauldronGradL;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.14, size * 0.09, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Pauldron ridge layers
  ctx.fillStyle = "#c0a858";
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
  ctx.fillStyle = "#9c8848";
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
  ctx.fillStyle = "#7a6838";
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
  pauldronGradR.addColorStop(0, "#d8c068");
  pauldronGradR.addColorStop(0.6, "#9c8848");
  pauldronGradR.addColorStop(1, "#5c4c2a");
  ctx.fillStyle = pauldronGradR;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.14, size * 0.09, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c0a858";
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
  ctx.fillStyle = "#9c8848";
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

  ctx.fillStyle = "#7a6838";
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.025);
  ctx.lineTo(size * 0.18, -size * 0.07);
  ctx.lineTo(size * 0.08, size * 0.005);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Elite ornate kite shield with layered crest.
  const eliteShieldGlow = 0.68 + Math.sin(time * 4.2) * 0.32;
  ctx.save();
  ctx.translate(
    x - size * 0.3,
    y + size * 0.1 + breathe * 0.55 + hipBounce * 0.4,
  );
  ctx.rotate(-0.22 + stance * 0.03 - attackDrive * 0.08);
  ctx.scale(0.9, 0.9);

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

  // === HEAD (elaborate plumed helm with face guard) ===
  const hb = breathe;
  const armorBright = "#c4cce0";
  const armorMid = "#8a92a8";
  const armorDark = "#5a6070";
  const armorDeep = "#3a3e4a";
  const goldTrim = "#c9a227";
  const goldTrimBright = "#e8c840";

  // Gorget (layered neck armor with gold trim)
  const gorgetGrad = ctx.createLinearGradient(
    x - size * 0.1,
    y - size * 0.14,
    x + size * 0.1,
    y - size * 0.14,
  );
  gorgetGrad.addColorStop(0, armorDeep);
  gorgetGrad.addColorStop(0.25, armorDark);
  gorgetGrad.addColorStop(0.5, armorBright);
  gorgetGrad.addColorStop(0.75, armorDark);
  gorgetGrad.addColorStop(1, armorDeep);
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.08 + hb);
  ctx.lineTo(x - size * 0.115, y - size * 0.17 + hb);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.2,
    x + size * 0.115,
    y - size * 0.17 + hb,
  );
  ctx.lineTo(x + size * 0.09, y - size * 0.08 + hb);
  ctx.closePath();
  ctx.fill();
  // Gorget plate lines
  ctx.strokeStyle = `rgba(90, 72, 35, 0.4)`;
  ctx.lineWidth = 0.6 * zoom;
  for (let gl = 0; gl < 3; gl++) {
    const glY = y - size * (0.095 + gl * 0.022) + hb;
    ctx.beginPath();
    ctx.moveTo(x - size * (0.08 + gl * 0.005), glY);
    ctx.lineTo(x + size * (0.08 + gl * 0.005), glY);
    ctx.stroke();
  }
  // Gorget gold trim edge
  ctx.strokeStyle = goldTrim;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.08 + hb);
  ctx.lineTo(x - size * 0.115, y - size * 0.17 + hb);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.2,
    x + size * 0.115,
    y - size * 0.17 + hb,
  );
  ctx.lineTo(x + size * 0.09, y - size * 0.08 + hb);
  ctx.stroke();

  // Helm dome (rounded great helm with angular faceplate)
  const helmCY = y - size * 0.29 + hb;
  const helmBottom = y - size * 0.14 + hb;
  const helmGrad = ctx.createLinearGradient(
    x - size * 0.17,
    y - size * 0.43 + hb,
    x + size * 0.17,
    helmBottom,
  );
  helmGrad.addColorStop(0, armorDeep);
  helmGrad.addColorStop(0.15, armorDark);
  helmGrad.addColorStop(0.35, armorMid);
  helmGrad.addColorStop(0.48, armorBright);
  helmGrad.addColorStop(0.55, "#d8e0f0");
  helmGrad.addColorStop(0.65, armorMid);
  helmGrad.addColorStop(0.82, armorDark);
  helmGrad.addColorStop(1, armorDeep);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.145, y - size * 0.3 + hb);
  ctx.quadraticCurveTo(
    x - size * 0.175,
    y - size * 0.44 + hb * 0.5,
    x,
    y - size * 0.46 + hb * 0.5,
  );
  ctx.quadraticCurveTo(
    x + size * 0.175,
    y - size * 0.44 + hb * 0.5,
    x + size * 0.145,
    y - size * 0.3 + hb,
  );
  ctx.lineTo(x + size * 0.14, helmBottom - size * 0.04);
  ctx.quadraticCurveTo(
    x + size * 0.1,
    helmBottom + size * 0.01,
    x,
    helmBottom + size * 0.015,
  );
  ctx.quadraticCurveTo(
    x - size * 0.1,
    helmBottom + size * 0.01,
    x - size * 0.14,
    helmBottom - size * 0.04,
  );
  ctx.closePath();
  ctx.fill();

  // Helm center ridge (raised medial crest)
  const ridgeGrad = ctx.createLinearGradient(
    x - size * 0.015,
    helmCY,
    x + size * 0.015,
    helmCY,
  );
  ridgeGrad.addColorStop(0, armorDark);
  ridgeGrad.addColorStop(0.3, armorBright);
  ridgeGrad.addColorStop(0.5, "#d8e0f0");
  ridgeGrad.addColorStop(0.7, armorBright);
  ridgeGrad.addColorStop(1, armorDark);
  ctx.fillStyle = ridgeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.018, y - size * 0.45 + hb * 0.5);
  ctx.lineTo(x + size * 0.018, y - size * 0.45 + hb * 0.5);
  ctx.lineTo(x + size * 0.022, y - size * 0.27 + hb);
  ctx.lineTo(x - size * 0.022, y - size * 0.27 + hb);
  ctx.closePath();
  ctx.fill();

  // Brow ridge (overhanging visor shelf)
  const browY = y - size * 0.305 + hb;
  ctx.fillStyle = armorMid;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.155, browY);
  ctx.quadraticCurveTo(x, browY - size * 0.018, x + size * 0.155, browY);
  ctx.lineTo(x + size * 0.15, browY + size * 0.02);
  ctx.quadraticCurveTo(
    x,
    browY + size * 0.01,
    x - size * 0.15,
    browY + size * 0.02,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(240, 216, 88, ${0.35 + shimmer * 0.15})`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, browY);
  ctx.quadraticCurveTo(x, browY - size * 0.015, x + size * 0.14, browY);
  ctx.stroke();

  // Specular dome highlights
  ctx.fillStyle = `rgba(255, 240, 180, ${0.1 + shimmer * 0.08})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.04,
    y - size * 0.38 + hb * 0.6,
    size * 0.04,
    size * 0.055,
    -0.25,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(255, 248, 210, ${0.06 + shimmer * 0.04})`;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.02,
    y - size * 0.4 + hb * 0.5,
    size * 0.018,
    size * 0.025,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === VISOR — half-ellipse mouth guard with slit details ===
  const visorCY = y - size * 0.26 + hb;
  // Mouth guard plate (half-ellipse covering lower face)
  const mouthGrad = ctx.createLinearGradient(
    x - size * 0.1,
    visorCY,
    x + size * 0.1,
    visorCY,
  );
  mouthGrad.addColorStop(0, armorDeep);
  mouthGrad.addColorStop(0.3, armorDark);
  mouthGrad.addColorStop(0.5, armorMid);
  mouthGrad.addColorStop(0.7, armorDark);
  mouthGrad.addColorStop(1, armorDeep);
  ctx.fillStyle = mouthGrad;
  ctx.beginPath();
  ctx.ellipse(x, visorCY, size * 0.105, size * 0.055, 0, 0, Math.PI);
  ctx.fill();
  // Mouth guard edge highlight
  ctx.strokeStyle = `rgba(180, 195, 220, ${0.4 + shimmer * 0.15})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, visorCY, size * 0.105, size * 0.055, 0, 0.05, Math.PI - 0.05);
  ctx.stroke();

  // Visor slits (horizontal breathing lines)
  ctx.fillStyle = "#0a0a15";
  ctx.fillRect(x - size * 0.08, visorCY, size * 0.16, size * 0.01);
  ctx.fillRect(
    x - size * 0.065,
    visorCY + size * 0.02,
    size * 0.13,
    size * 0.008,
  );
  ctx.fillRect(
    x - size * 0.05,
    visorCY + size * 0.035,
    size * 0.1,
    size * 0.006,
  );

  // === EYE GLOW (fiery orange, layered) ===
  const eyeGlow = 0.55 + shimmer * 0.35 + (isAttacking ? 0.35 : 0);
  const eyeY = visorCY + size * 0.015;
  const eyeSpacing = size * 0.038;
  const eyeRx = size * 0.018;
  const eyeRy = size * 0.01;

  // Outer glow halo
  ctx.shadowColor = `rgba(255, 120, 20, ${0.6 + (isAttacking ? 0.3 : 0)})`;
  ctx.shadowBlur = 9 * zoom;
  ctx.fillStyle = `rgba(255, 120, 30, ${eyeGlow * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(
    x - eyeSpacing,
    eyeY,
    eyeRx * 1.7,
    eyeRy * 1.7,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + eyeSpacing,
    eyeY,
    eyeRx * 1.7,
    eyeRy * 1.7,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Main eye
  ctx.shadowColor = `rgba(255, 140, 40, ${0.45 + (isAttacking ? 0.2 : 0)})`;
  ctx.shadowBlur = 4 * zoom;
  ctx.fillStyle = `rgba(255, 140, 40, ${eyeGlow})`;
  ctx.beginPath();
  ctx.ellipse(x - eyeSpacing, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + eyeSpacing, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Bright pupil core
  ctx.fillStyle = `rgba(255, 240, 200, ${eyeGlow * 0.7})`;
  ctx.beginPath();
  ctx.ellipse(
    x - eyeSpacing,
    eyeY,
    eyeRx * 0.38,
    eyeRy * 0.45,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + eyeSpacing,
    eyeY,
    eyeRx * 0.38,
    eyeRy * 0.45,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Cheek guards with silver gradient
  for (let side = -1; side <= 1; side += 2) {
    const cheekGrad = ctx.createLinearGradient(
      x + side * size * 0.09,
      y - size * 0.3 + hb,
      x + side * size * 0.17,
      y - size * 0.2 + hb,
    );
    cheekGrad.addColorStop(0, armorMid);
    cheekGrad.addColorStop(0.5, armorDark);
    cheekGrad.addColorStop(1, armorDeep);
    ctx.fillStyle = cheekGrad;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.125, y - size * 0.305 + hb);
    ctx.lineTo(x + side * size * 0.165, y - size * 0.24 + hb);
    ctx.lineTo(x + side * size * 0.155, y - size * 0.18 + hb);
    ctx.lineTo(x + side * size * 0.09, y - size * 0.18 + hb);
    ctx.lineTo(x + side * size * 0.1, y - size * 0.28 + hb);
    ctx.closePath();
    ctx.fill();
    // Cheek rivet
    ctx.fillStyle = `rgba(240, 216, 88, ${0.55 + shimmer * 0.2})`;
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.13,
      y - size * 0.235 + hb,
      size * 0.007,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Breathing holes on faceplate
  ctx.fillStyle = "#10101a";
  for (let side = -1; side <= 1; side += 2) {
    for (let hole = 0; hole < 3; hole++) {
      ctx.beginPath();
      ctx.ellipse(
        x + side * size * 0.045,
        y - size * (0.22 - hole * 0.017) + hb,
        size * 0.006,
        size * 0.004,
        side * 0.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Ornate gold crown band
  ctx.strokeStyle = `rgba(240, 200, 50, ${0.7 + shimmer * 0.15})`;
  ctx.lineWidth = 2.8 * zoom;
  ctx.beginPath();
  ctx.arc(x, helmCY, size * 0.145, Math.PI * 1.12, Math.PI * 1.88);
  ctx.stroke();
  // Crown band inner highlight
  ctx.strokeStyle = `rgba(255, 240, 150, ${0.2 + shimmer * 0.1})`;
  ctx.lineWidth = 1.0 * zoom;
  ctx.beginPath();
  ctx.arc(x, helmCY, size * 0.14, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Crown points (refined fleur-de-lis style, gold trim)
  ctx.fillStyle = goldTrim;
  for (let cp = 0; cp < 5; cp++) {
    const cpAngle = Math.PI * 1.2 + cp * Math.PI * 0.15;
    const cpX = x + Math.cos(cpAngle) * size * 0.145;
    const cpY = helmCY + Math.sin(cpAngle) * size * 0.145;
    const cpH = cp === 2 ? size * 0.05 : size * 0.032;
    ctx.beginPath();
    ctx.moveTo(cpX - size * 0.008, cpY);
    ctx.lineTo(
      cpX + Math.cos(cpAngle) * cpH,
      cpY + Math.sin(cpAngle) * cpH - size * 0.01,
    );
    ctx.lineTo(cpX + size * 0.008, cpY);
    ctx.closePath();
    ctx.fill();
  }

  // Crown center gem (large ruby)
  ctx.fillStyle = "#ff2200";
  ctx.shadowColor = `rgba(255, 60, 20, ${0.6 + gemPulse * 0.3})`;
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.44 + hb * 0.5, size * 0.024, 0, Math.PI * 2);
  ctx.fill();
  // Gem highlight
  ctx.fillStyle = `rgba(255, 180, 160, ${0.35 + gemPulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.006,
    y - size * 0.445 + hb * 0.5,
    size * 0.008,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Side rivets along dome
  ctx.fillStyle = `rgba(210, 180, 80, ${0.5 + shimmer * 0.15})`;
  for (let rivet = 0; rivet < 3; rivet++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.075 + rivet * size * 0.075,
      y - size * 0.35 + hb,
      size * 0.007,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Elaborate multi-layered plume (sweeps left)
  // Plume shadow/depth layer
  ctx.fillStyle = "#cc4400";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.42 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.2 - capeWave * 2.5,
    y - size * 0.58,
    x - size * 0.28 - capeWave * 4,
    y - size * 0.4 + breathe,
  );
  ctx.quadraticCurveTo(
    x - size * 0.15,
    y - size * 0.35,
    x - size * 0.02,
    y - size * 0.4 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Main plume with gradient
  const plumeGrad = ctx.createLinearGradient(
    x,
    y - size * 0.55,
    x - size * 0.25,
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
    x - size * 0.2 - capeWave * 2.4 - plumeWhip * size * 0.035,
    y - size * 0.58,
    x - size * 0.28 - capeWave * 4 - plumeWhip * size * 0.045,
    y - size * 0.38 + breathe,
  );
  ctx.quadraticCurveTo(
    x - size * 0.12,
    y - size * 0.34,
    x,
    y - size * 0.4 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Plume highlight feather strokes (subtle, contained within the body)
  ctx.lineWidth = 0.8 * zoom;
  for (let feather = 0; feather < 4; feather++) {
    const fT = feather / 3;
    const fAlpha = 0.35 + fT * 0.15;
    ctx.strokeStyle = `rgba(255, 180, 80, ${fAlpha})`;
    const fStartX = x - size * 0.01;
    const fStartY = y - size * 0.42 + breathe;
    const fMidX =
      x -
      size * (0.08 + fT * 0.06) -
      capeWave * (0.4 + fT * 0.3) -
      plumeWhip * size * 0.008;
    const fMidY = y - size * (0.47 + fT * 0.04);
    const fEndX =
      x -
      size * (0.14 + fT * 0.05) -
      capeWave * (0.8 + fT * 0.4) -
      plumeWhip * size * 0.012;
    const fEndY = y - size * (0.4 - fT * 0.02) + breathe;
    ctx.beginPath();
    ctx.moveTo(fStartX, fStartY);
    ctx.quadraticCurveTo(fMidX, fMidY, fEndX, fEndY);
    ctx.stroke();
  }

  // Secondary smaller plume (inner accent)
  ctx.fillStyle = "#ff8800";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.01, y - size * 0.41 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.06 - capeWave * 0.6,
    y - size * 0.47,
    x - size * 0.1 - capeWave * 0.9,
    y - size * 0.37 + breathe,
  );
  ctx.quadraticCurveTo(
    x - size * 0.03,
    y - size * 0.35,
    x + size * 0.01,
    y - size * 0.39 + breathe,
  );
  ctx.closePath();
  ctx.fill();

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
  ctx.scale(1.3, 1.3);
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
