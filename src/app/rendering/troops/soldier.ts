import type { Position } from "../../types";
import {
  WEAPON_LIMITS,
  anchorWeaponToHand,
  drawArmoredSkirt,
  drawDetailedArm,
} from "./troopHelpers";
import type { ArmColors } from "./troopHelpers";

export function drawSoldierTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
) {
  // ============================================================================
  // DINKY LEGIONNAIRE - Level 1 Princeton Recruit with Detailed Roman Style
  // A scrappy but determined young soldier with worn but proud equipment
  // ============================================================================

  // Animation parameters - subtle but lively
  const stance = Math.sin(time * 3.5) * 1.2;
  const breathe = Math.sin(time * 2.5) * 0.8;
  const weightShift = Math.sin(time * 1.8) * 0.5;
  const footTap = Math.abs(Math.sin(time * 2.8)) * 0.8;
  const shimmer = Math.sin(time * 4) * 0.5 + 0.5;
  const ambientSway = Math.sin(time * 1.2) * 0.3;

  // Attack animation calculations
  const isAttacking = attackPhase > 0;
  const attackSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2) * 1.8
    : 0;
  const attackLunge = isAttacking
    ? Math.sin(attackPhase * Math.PI) * size * 0.18
    : 0;
  const bodyTwist = isAttacking
    ? Math.sin(attackPhase * Math.PI) * 0.25
    : Math.sin(time * 1.4) * 0.03;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  ctx.save();
  ctx.translate(attackLunge * 0.5, 0);
  ctx.rotate(bodyTwist);

  // === AMBIENT DUST PARTICLES (kicked up while moving/attacking) ===
  if (isAttacking || footTap > 0.5) {
    for (let d = 0; d < 4; d++) {
      const dustPhase = (time * 2 + d * 0.4) % 1;
      const dustX =
        x +
        (Math.random() - 0.5) * size * 0.6 +
        Math.sin(time * 3 + d) * size * 0.2;
      const dustY = y + size * 0.55 - dustPhase * size * 0.3;
      const dustAlpha = (1 - dustPhase) * (isAttacking ? 0.4 : 0.15);
      const dustSize = (2 + d * 0.5) * zoom * (1 - dustPhase * 0.5);
      ctx.fillStyle = `rgba(139, 119, 101, ${dustAlpha})`;
      ctx.beginPath();
      ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === FLOWING CAPE (behind soldier) ===
  const cw1 = Math.sin(time * 2.8 + 0.5) * size * 0.02;
  const cw2 = Math.sin(time * 3.6) * size * 0.015;
  const cwAtk = isAttacking
    ? Math.sin(attackPhase * Math.PI * 3) * size * 0.04
    : 0;

  const capeLX = x - size * 0.22;
  const capeRX = x + size * 0.18;
  const capeTopY = y - size * 0.1;
  const capeBotLX = x - size * 0.3 + cw1 + cwAtk - attackLunge * 0.3;
  const capeBotLY = y + size * 0.5;
  const capeBotRX = x + size * 0.14 + cw2 - attackLunge * 0.15;
  const capeBotRY = y + size * 0.47;
  const capeMidCtrlLX = x - size * 0.34 + cw1 * 1.5 - attackLunge * 0.2;
  const capeMidCtrlLY = y + size * 0.18;

  // Drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.moveTo(capeLX + size * 0.01, capeTopY + size * 0.02);
  ctx.quadraticCurveTo(
    capeMidCtrlLX + size * 0.01,
    capeMidCtrlLY + size * 0.02,
    capeBotLX + size * 0.01,
    capeBotLY + size * 0.02
  );
  ctx.lineTo(capeBotRX + size * 0.01, capeBotRY + size * 0.02);
  ctx.quadraticCurveTo(
    capeRX + size * 0.01,
    y + size * 0.1,
    capeRX + size * 0.01,
    capeTopY + size * 0.02
  );
  ctx.closePath();
  ctx.fill();

  // Outer cape (dark Princeton crimson)
  const outerGrad = ctx.createLinearGradient(
    capeLX,
    capeTopY,
    capeBotLX,
    capeBotLY
  );
  outerGrad.addColorStop(0, "#5a1a06");
  outerGrad.addColorStop(0.3, "#7a2808");
  outerGrad.addColorStop(0.6, "#60200a");
  outerGrad.addColorStop(1, "#2a0e04");
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.moveTo(capeLX, capeTopY);
  ctx.quadraticCurveTo(capeMidCtrlLX, capeMidCtrlLY, capeBotLX, capeBotLY);
  ctx.lineTo(capeBotRX, capeBotRY);
  ctx.quadraticCurveTo(capeRX, y + size * 0.08, capeRX, capeTopY);
  ctx.closePath();
  ctx.fill();

  // Inner cape (brighter orange-red, slightly inset)
  const innerGrad = ctx.createLinearGradient(
    capeLX,
    capeTopY,
    capeBotLX,
    capeBotLY
  );
  innerGrad.addColorStop(0, "#992a08");
  innerGrad.addColorStop(0.25, "#c04010");
  innerGrad.addColorStop(0.5, "#a83510");
  innerGrad.addColorStop(0.75, "#88280c");
  innerGrad.addColorStop(1, "#502008");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(capeLX + size * 0.02, capeTopY + size * 0.01);
  ctx.quadraticCurveTo(
    capeMidCtrlLX + size * 0.04,
    capeMidCtrlLY + size * 0.01,
    capeBotLX + size * 0.03,
    capeBotLY - size * 0.04
  );
  ctx.lineTo(capeBotRX - size * 0.02, capeBotRY - size * 0.03);
  ctx.quadraticCurveTo(
    capeRX - size * 0.02,
    y + size * 0.09,
    capeRX - size * 0.01,
    capeTopY + size * 0.01
  );
  ctx.closePath();
  ctx.fill();

  // Fabric fold lines
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.7 * zoom;
  for (let fold = 0; fold < 3; fold++) {
    const fT = (fold + 1) / 4;
    const fX = capeLX + (capeRX - capeLX) * fT;
    const fBX = capeBotLX + (capeBotRX - capeBotLX) * fT;
    ctx.beginPath();
    ctx.moveTo(fX, capeTopY + size * 0.02);
    ctx.quadraticCurveTo(
      fX + cw1 * (1 - fT),
      y + size * 0.2,
      fBX,
      capeBotLY - size * 0.05
    );
    ctx.stroke();
  }

  // Left edge highlight
  ctx.strokeStyle = `rgba(255, 130, 60, ${0.25 + shimmer * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(capeLX, capeTopY);
  ctx.quadraticCurveTo(capeMidCtrlLX, capeMidCtrlLY, capeBotLX, capeBotLY);
  ctx.stroke();

  // Bottom hem trim
  ctx.strokeStyle = `rgba(200, 160, 60, ${0.3 + shimmer * 0.15})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(capeBotLX, capeBotLY);
  ctx.lineTo(capeBotRX, capeBotRY);
  ctx.stroke();

  // Clasp at shoulder
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.06, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 215, 100, ${0.5 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.085, y - size * 0.065, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // === LEGS (articulated legionary armor) ===
  const stanceSpread = size * (isAttacking ? 0.13 : 0.11);

  for (let side = -1; side <= 1; side += 2) {
    const isLeft = side === -1;
    ctx.save();
    ctx.translate(
      isLeft
        ? x - stanceSpread + weightShift * 0.5
        : x + stanceSpread - weightShift * 0.5,
      y + size * 0.32
    );
    ctx.rotate(
      side * (-0.08 + footTap * 0.03) +
        (isLeft ? -(isAttacking ? 0.18 : 0) : isAttacking ? 0.18 : 0)
    );

    const lw = size * 0.13;
    const hlw = lw * 0.5;

    // --- Pteruges (leather skirt strips) ---
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(
      -hlw - size * 0.02,
      -size * 0.04,
      lw + size * 0.04,
      size * 0.05
    );
    ctx.fillStyle = "#704010";
    for (let strip = 0; strip < 3; strip++) {
      ctx.fillRect(
        -hlw + strip * size * 0.04,
        -size * 0.04,
        size * 0.035,
        size * 0.07
      );
    }

    // --- Thigh plate (cuisse) ---
    const thighH = size * 0.09;
    const thighGrad = ctx.createLinearGradient(-hlw, 0, hlw, 0);
    thighGrad.addColorStop(0, "#5a5a6a");
    thighGrad.addColorStop(0.2, "#7a7a8e");
    thighGrad.addColorStop(0.5, "#9a9aae");
    thighGrad.addColorStop(0.8, "#7a7a8e");
    thighGrad.addColorStop(1, "#5a5a6a");
    ctx.fillStyle = thighGrad;
    ctx.beginPath();
    ctx.roundRect(-hlw, 0, lw, thighH, size * 0.012);
    ctx.fill();

    // Thigh edge highlight
    ctx.strokeStyle = `rgba(200, 200, 220, ${0.25 + shimmer * 0.15})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(isLeft ? -hlw : hlw, size * 0.01);
    ctx.lineTo(isLeft ? -hlw : hlw, thighH - size * 0.01);
    ctx.stroke();

    // Thigh articulation band
    ctx.strokeStyle = "#4a4a5a";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-hlw + size * 0.01, thighH * 0.55);
    ctx.lineTo(hlw - size * 0.01, thighH * 0.55);
    ctx.stroke();
    ctx.strokeStyle = "rgba(180, 180, 200, 0.2)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-hlw + size * 0.01, thighH * 0.55 - 1);
    ctx.lineTo(hlw - size * 0.01, thighH * 0.55 - 1);
    ctx.stroke();

    // --- Knee cop (poleyn) ---
    const kneeY = thighH + size * 0.005;
    const kneeCopGrad = ctx.createRadialGradient(
      0,
      kneeY,
      0,
      0,
      kneeY,
      size * 0.055
    );
    kneeCopGrad.addColorStop(0, "#b0b0c4");
    kneeCopGrad.addColorStop(0.5, "#8a8a9e");
    kneeCopGrad.addColorStop(1, "#5a5a6e");
    ctx.fillStyle = kneeCopGrad;
    ctx.beginPath();
    ctx.ellipse(0, kneeY, size * 0.065, size * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();

    // Knee raised center
    ctx.fillStyle = `rgba(190, 190, 210, ${0.5 + shimmer * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(0, kneeY, size * 0.035, size * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();

    // Knee rivet
    ctx.fillStyle = "#8a7a3a";
    ctx.beginPath();
    ctx.arc(0, kneeY, size * 0.01, 0, Math.PI * 2);
    ctx.fill();

    // --- Greave (shin guard) ---
    const greaveTop = kneeY + size * 0.035;
    const greaveH = size * 0.11;
    const greaveGrad = ctx.createLinearGradient(
      -hlw,
      greaveTop,
      hlw,
      greaveTop
    );
    greaveGrad.addColorStop(0, "#5a5a6a");
    greaveGrad.addColorStop(0.15, "#7a7a90");
    greaveGrad.addColorStop(0.45, "#9a9ab0");
    greaveGrad.addColorStop(0.55, "#8a8aa0");
    greaveGrad.addColorStop(0.85, "#7a7a90");
    greaveGrad.addColorStop(1, "#5a5a6a");
    ctx.fillStyle = greaveGrad;
    ctx.beginPath();
    ctx.moveTo(-hlw, greaveTop);
    ctx.lineTo(-hlw - size * 0.005, greaveTop + greaveH);
    ctx.lineTo(hlw + size * 0.005, greaveTop + greaveH);
    ctx.lineTo(hlw, greaveTop);
    ctx.closePath();
    ctx.fill();

    // Greave center ridge
    ctx.strokeStyle = `rgba(200, 200, 220, ${0.25 + shimmer * 0.15})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, greaveTop + size * 0.01);
    ctx.lineTo(0, greaveTop + greaveH - size * 0.01);
    ctx.stroke();

    // Greave articulation bands
    ctx.strokeStyle = "#4a4a5a";
    ctx.lineWidth = 0.8 * zoom;
    for (const t of [0.35, 0.65]) {
      const bandY = greaveTop + greaveH * t;
      ctx.beginPath();
      ctx.moveTo(-hlw + size * 0.005, bandY);
      ctx.lineTo(hlw - size * 0.005, bandY);
      ctx.stroke();
    }

    // Greave edge highlight
    ctx.strokeStyle = `rgba(200, 200, 220, ${0.2 + shimmer * 0.15})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(isLeft ? -hlw : hlw, greaveTop + size * 0.01);
    ctx.lineTo(isLeft ? -hlw : hlw, greaveTop + greaveH - size * 0.01);
    ctx.stroke();

    // --- Caliga (hobnailed military sandal) ---
    const bootTop = greaveTop + greaveH;
    const bootH = size * 0.06;

    // Ankle strap
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(-hlw - size * 0.005, bootTop, lw + size * 0.01, size * 0.02);

    // Sandal body
    ctx.fillStyle = "#4a2a10";
    ctx.beginPath();
    ctx.roundRect(
      -hlw - size * 0.01,
      bootTop + size * 0.015,
      lw + size * 0.02,
      bootH,
      [0, 0, size * 0.02, size * 0.02]
    );
    ctx.fill();

    // Sandal straps (crossed lacing)
    ctx.strokeStyle = "#6a4a2a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-hlw + size * 0.01, bootTop + size * 0.02);
    ctx.lineTo(size * 0.005, bootTop + bootH * 0.6);
    ctx.moveTo(hlw - size * 0.01, bootTop + size * 0.02);
    ctx.lineTo(-size * 0.005, bootTop + bootH * 0.6);
    ctx.stroke();

    // Hobnail dots on sole
    ctx.fillStyle = "#8a8a8a";
    for (let n = 0; n < 3; n++) {
      ctx.beginPath();
      ctx.arc(
        -size * 0.025 + n * size * 0.025,
        bootTop + bootH + size * 0.01,
        size * 0.006,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }

  // === TORSO - SEGMENTED LORICA ARMOR ===
  const steelDeep = "#3a3a4a";
  const steelDark = "#5a5a6e";
  const steelMid = "#7a7a92";
  const steelHigh = "#9a9ab0";
  const steelBright = "#b0b0c4";

  // Base metal undercoat (visible at edges)
  ctx.fillStyle = steelDeep;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.35);
  ctx.lineTo(x - size * 0.27, y - size * 0.08);
  ctx.lineTo(x + size * 0.27, y - size * 0.08);
  ctx.lineTo(x + size * 0.24, y + size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Main chest plate (rich metallic-orange with deep gradient)
  const chestGrad = ctx.createLinearGradient(
    x - size * 0.25,
    y - size * 0.12,
    x + size * 0.25,
    y + size * 0.32
  );
  chestGrad.addColorStop(0, "#6a2800");
  chestGrad.addColorStop(0.1, "#8a3800");
  chestGrad.addColorStop(0.25, "#c05000");
  chestGrad.addColorStop(0.4, "#e86000");
  chestGrad.addColorStop(0.5, "#ff6a05");
  chestGrad.addColorStop(0.6, "#e86000");
  chestGrad.addColorStop(0.75, "#c05000");
  chestGrad.addColorStop(0.9, "#8a3800");
  chestGrad.addColorStop(1, "#6a2800");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.32 + breathe);
  ctx.lineTo(x - size * 0.25, y - size * 0.1 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.22 + breathe * 0.3,
    x + size * 0.25,
    y - size * 0.1 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.32 + breathe);
  ctx.closePath();
  ctx.fill();

  // Muscle cuirass pectoral shaping (defined chest contour)
  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 1.4 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.17, y + size * 0.01 + breathe * 0.4);
    ctx.quadraticCurveTo(
      x + side * size * 0.06,
      y + size * 0.09 + breathe * 0.5,
      x,
      y + size * 0.04 + breathe * 0.45
    );
    ctx.stroke();
  }
  // Center sternum line
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.08 + breathe * 0.3);
  ctx.lineTo(x, y + size * 0.15 + breathe * 0.6);
  ctx.stroke();

  // Segmented armor bands (lorica segmentata) with full gradient per band
  for (let band = 0; band < 5; band++) {
    const bandY =
      y - size * 0.05 + band * size * 0.075 + breathe * (0.3 + band * 0.15);
    const bandH = size * 0.068;
    const bandW = size * (0.42 - band * 0.008);
    const bandGrad = ctx.createLinearGradient(
      x - bandW * 0.5,
      bandY,
      x + bandW * 0.5,
      bandY
    );
    bandGrad.addColorStop(0, "#7a3000");
    bandGrad.addColorStop(0.2, "#c05000");
    bandGrad.addColorStop(0.45, "#e86800");
    bandGrad.addColorStop(0.55, "#ff7010");
    bandGrad.addColorStop(0.8, "#c05000");
    bandGrad.addColorStop(1, "#7a3000");
    ctx.fillStyle = bandGrad;
    ctx.beginPath();
    ctx.roundRect(x - bandW * 0.5, bandY, bandW, bandH, size * 0.004);
    ctx.fill();
    // Band bottom groove
    ctx.strokeStyle = "rgba(0,0,0,0.28)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - bandW * 0.48, bandY + bandH);
    ctx.lineTo(x + bandW * 0.48, bandY + bandH);
    ctx.stroke();
    // Band top highlight
    ctx.strokeStyle = `rgba(255, 200, 130, ${0.2 + shimmer * 0.12})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - bandW * 0.45, bandY + size * 0.003);
    ctx.lineTo(x + bandW * 0.45, bandY + size * 0.003);
    ctx.stroke();
  }

  // Upper chest specular sheen
  ctx.fillStyle = `rgba(255, 220, 180, ${0.08 + shimmer * 0.07})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.04,
    y - size * 0.04 + breathe * 0.4,
    size * 0.1,
    size * 0.06,
    -0.25,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Secondary smaller highlight
  ctx.fillStyle = `rgba(255, 240, 210, ${0.04 + shimmer * 0.04})`;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.02,
    y - size * 0.06 + breathe * 0.35,
    size * 0.04,
    size * 0.025,
    0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Shoulder guards (layered pauldrons with plates)
  for (let side = -1; side <= 1; side += 2) {
    const pX = x + side * size * 0.26;
    const pY = y - size * 0.02 + breathe * 0.3;
    const pAngle = side * 0.2;

    // Shadow layer
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(
      pX + side * size * 0.012,
      pY + size * 0.018,
      size * 0.11,
      size * 0.068,
      pAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Lower plate
    const lowerGrad = ctx.createLinearGradient(
      pX - side * size * 0.1,
      pY + size * 0.02,
      pX + side * size * 0.1,
      pY + size * 0.06
    );
    lowerGrad.addColorStop(0, steelDark);
    lowerGrad.addColorStop(0.5, steelMid);
    lowerGrad.addColorStop(1, steelDark);
    ctx.fillStyle = lowerGrad;
    ctx.beginPath();
    ctx.ellipse(
      pX,
      pY + size * 0.015,
      size * 0.105,
      size * 0.055,
      pAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Upper plate (overlaps lower)
    const upperGrad = ctx.createLinearGradient(
      pX - side * size * 0.08,
      pY - size * 0.04,
      pX + side * size * 0.08,
      pY + size * 0.04
    );
    upperGrad.addColorStop(0, steelDark);
    upperGrad.addColorStop(0.25, steelMid);
    upperGrad.addColorStop(0.5, steelBright);
    upperGrad.addColorStop(0.75, steelMid);
    upperGrad.addColorStop(1, steelDark);
    ctx.fillStyle = upperGrad;
    ctx.beginPath();
    ctx.ellipse(
      pX,
      pY - size * 0.008,
      size * 0.095,
      size * 0.05,
      pAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Pauldron edge highlight arc
    ctx.strokeStyle = `rgba(200, 200, 220, ${0.18 + shimmer * 0.12})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      pX,
      pY - size * 0.008,
      size * 0.095,
      size * 0.05,
      pAngle,
      Math.PI * 1.1,
      Math.PI * 1.8
    );
    ctx.stroke();

    // Rivets (3 per pauldron)
    for (let r = -1; r <= 1; r++) {
      const rx = pX + r * side * size * 0.035;
      const ry = pY - size * 0.005;
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 220, 130, ${0.35 + shimmer * 0.2})`;
      ctx.beginPath();
      ctx.arc(
        rx - size * 0.002,
        ry - size * 0.003,
        size * 0.005,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // === LEATHER BELT WITH POUCHES ===
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(
    x - size * 0.22,
    y + size * 0.24 + breathe,
    size * 0.44,
    size * 0.07
  );
  // Belt buckle
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(
    x - size * 0.05,
    y + size * 0.25 + breathe,
    size * 0.1,
    size * 0.05
  );
  ctx.fillStyle = `rgba(255, 220, 130, ${0.4 + shimmer * 0.3})`;
  ctx.fillRect(
    x - size * 0.04,
    y + size * 0.255 + breathe,
    size * 0.03,
    size * 0.035
  );
  // Belt studs
  ctx.fillStyle = "#8a7020";
  for (let stud = 0; stud < 3; stud++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.15 + stud * size * 0.04,
      y + size * 0.275 + breathe,
      size * 0.012,
      0,
      Math.PI * 2
    );
    ctx.arc(
      x + size * 0.08 + stud * size * 0.04,
      y + size * 0.275 + breathe,
      size * 0.012,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  // Small pouch on belt
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(
    x + size * 0.12,
    y + size * 0.26 + breathe,
    size * 0.06,
    size * 0.08
  );
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(
    x + size * 0.12,
    y + size * 0.26 + breathe,
    size * 0.06,
    size * 0.02
  );

  // === ARMORED SKIRT (pteruges plates) ===
  drawArmoredSkirt(
    ctx,
    x,
    y,
    size,
    zoom,
    stance,
    breathe,
    {
      armorDark: "#8a3800",
      armorHigh: "#e86000",
      armorMid: "#c05000",
      armorPeak: "#ff6a05",
      trimColor: "#c9a227",
    },
    { depthFactor: 0.14, plateCount: 5, topOffset: 0.28, widthFactor: 0.44 }
  );

  // === SHIELD ARM + SCUTUM SHIELD ===
  const shieldX = x - size * 0.42 + (isAttacking ? attackLunge * 0.9 : 0);
  const shieldY =
    y + size * 0.08 - (isAttacking ? size * 0.12 * attackSwing : 0);
  const shieldRot = isAttacking
    ? -0.35 - attackSwing * 0.35
    : -0.25 + ambientSway * 0.1;

  const shieldShoulderX = x - size * 0.24;
  const shieldShoulderY = y + 0 + breathe * 0.3;
  const shieldArmLen = size * 0.22;
  const armToShieldAngle = Math.atan2(
    shieldY - shieldShoulderY,
    shieldX - shieldShoulderX
  );
  const soldierShieldArmColors: ArmColors = {
    elbow: "#b09060",
    hand: "#d0a87a",
    trim: "#7a5a3a",
    upper: "#c08a5a",
    upperDark: "#8a6030",
    upperLight: "#dbb896",
    vambrace: "#5a3a1a",
    vambraceLight: "#7a5a3a",
  };

  ctx.save();
  ctx.translate(shieldShoulderX, shieldShoulderY);
  ctx.rotate(armToShieldAngle);
  drawDetailedArm(ctx, size, shieldArmLen, zoom, soldierShieldArmColors);
  ctx.restore();

  // Shield itself
  ctx.save();
  ctx.translate(shieldX, shieldY);
  ctx.rotate(shieldRot);

  // Shield outer rim (bronze/gold) — tall scutum shape
  const shW = size * 0.34;
  const shH = size * 0.56;
  ctx.fillStyle = "#a08040";
  ctx.beginPath();
  ctx.roundRect(-shW * 0.5, -shH * 0.5, shW, shH, size * 0.04);
  ctx.fill();

  // Shield main body (red with gradient)
  const bodyW = shW - size * 0.06;
  const bodyH = shH - size * 0.06;
  const shieldBodyGrad = ctx.createLinearGradient(
    -bodyW * 0.5,
    -bodyH * 0.5,
    bodyW * 0.5,
    bodyH * 0.5
  );
  shieldBodyGrad.addColorStop(0, "#8b1a1a");
  shieldBodyGrad.addColorStop(0.3, "#b32222");
  shieldBodyGrad.addColorStop(0.7, "#a01c1c");
  shieldBodyGrad.addColorStop(1, "#701515");
  ctx.fillStyle = shieldBodyGrad;
  ctx.beginPath();
  ctx.roundRect(-bodyW * 0.5, -bodyH * 0.5, bodyW, bodyH, size * 0.025);
  ctx.fill();

  // Horizontal reinforcement bands
  ctx.strokeStyle = "#a08040";
  ctx.lineWidth = 1.2 * zoom;
  for (const bandY of [-bodyH * 0.28, 0, bodyH * 0.28]) {
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.45, bandY);
    ctx.lineTo(bodyW * 0.45, bandY);
    ctx.stroke();
  }

  // Shield boss (center metal dome)
  const bossGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.08);
  bossGrad.addColorStop(0, `rgba(255, 255, 255, ${0.6 + shimmer * 0.3})`);
  bossGrad.addColorStop(0.3, "#c0c0c0");
  bossGrad.addColorStop(0.7, "#8a8a9a");
  bossGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = bossGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.07, 0, Math.PI * 2);
  ctx.fill();

  // Shield decorative wings/pattern
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.02);
  ctx.quadraticCurveTo(-size * 0.12, -size * 0.08, -size * 0.13, -size * 0.02);
  ctx.quadraticCurveTo(-size * 0.12, size * 0.04, -size * 0.08, size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.02);
  ctx.quadraticCurveTo(size * 0.12, -size * 0.08, size * 0.13, -size * 0.02);
  ctx.quadraticCurveTo(size * 0.12, size * 0.04, size * 0.08, size * 0.02);
  ctx.closePath();
  ctx.fill();

  // Shield rivets around boss
  ctx.fillStyle = "#8a7a3a";
  for (let r = 0; r < 6; r++) {
    const rivetAngle = (r / 6) * Math.PI * 2;
    const rx = Math.cos(rivetAngle) * size * 0.1;
    const ry = Math.sin(rivetAngle) * size * 0.1;
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top and bottom decorative strips
  ctx.fillStyle = "#c9a227";
  ctx.globalAlpha = 0.35;
  ctx.fillRect(-bodyW * 0.35, -bodyH * 0.46, bodyW * 0.7, size * 0.02);
  ctx.fillRect(-bodyW * 0.35, bodyH * 0.44, bodyW * 0.7, size * 0.02);
  ctx.globalAlpha = 1;

  // Shield edge highlight
  ctx.strokeStyle = `rgba(255, 200, 100, ${0.25 + shimmer * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-bodyW * 0.5, -bodyH * 0.35);
  ctx.lineTo(-bodyW * 0.5, bodyH * 0.35);
  ctx.stroke();

  // Shield spike for attack
  if (isAttacking) {
    ctx.fillStyle = "#d0d0d0";
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.12 - attackIntensity * size * 0.05);
    ctx.lineTo(-size * 0.025, 0);
    ctx.lineTo(size * 0.025, 0);
    ctx.closePath();
    ctx.fill();
    // Spike glint
    ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * attackIntensity})`;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.08, size * 0.008, size * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // === GLADIUS SWORD ARM + MASTERWORK GLADIUS ===
  // Anchor sword to hand — arm swing drives hand position
  const soldierArmLen = size * 0.22;
  const soldierGripLocalY = size * 0.1;
  const swordShoulderX = x + size * 0.24;
  const swordShoulderY = y + breathe * 0.3;

  const soldierArmSwing = isAttacking
    ? -0.4 + (1 - attackPhase) * 0.8
    : 0 + stance * 0.03;

  const swordBaseAngle = isAttacking
    ? 1.02 - attackPhase * 2.04
    : 0.42 + stance * 0.04;

  const soldierSword = anchorWeaponToHand(
    swordShoulderX,
    swordShoulderY,
    soldierArmLen,
    soldierArmSwing,
    soldierGripLocalY,
    swordBaseAngle,
    targetPos,
    Math.PI / 2,
    isAttacking ? 1.45 : 0.7,
    WEAPON_LIMITS.rightMelee
  );
  const swordX = soldierSword.weaponX;
  const swordY = soldierSword.weaponY;
  const swordAngle = soldierSword.weaponAngle;

  const soldierSwordArmColors: ArmColors = {
    elbow: "#b09060",
    hand: "#d0a87a",
    trim: "#7a5a3a",
    upper: "#c08a5a",
    upperDark: "#8a6030",
    upperLight: "#dbb896",
    vambrace: "#5a3a1a",
    vambraceLight: "#7a5a3a",
  };

  ctx.save();
  ctx.translate(swordShoulderX, swordShoulderY);
  ctx.rotate(soldierArmSwing);
  drawDetailedArm(ctx, size, soldierArmLen, zoom, soldierSwordArmColors);
  ctx.restore();

  // Gladius sword
  ctx.save();
  ctx.translate(swordX, swordY);
  ctx.rotate(swordAngle);

  const swordGlow = isAttacking
    ? 0.45 + attackIntensity * 0.35
    : 0.2 + shimmer * 0.15;

  // Grip and wrapping.
  const gripGrad = ctx.createLinearGradient(
    -size * 0.022,
    size * 0.035,
    size * 0.022,
    size * 0.18
  );
  gripGrad.addColorStop(0, "#2d1f14");
  gripGrad.addColorStop(0.5, "#4d3728");
  gripGrad.addColorStop(1, "#24170f");
  ctx.fillStyle = gripGrad;
  ctx.fillRect(-size * 0.022, size * 0.035, size * 0.044, size * 0.14);
  ctx.strokeStyle = "#6d553f";
  ctx.lineWidth = 1.1 * zoom;
  for (let wrap = 0; wrap < 5; wrap++) {
    const wy = size * (0.05 + wrap * 0.028);
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, wy);
    ctx.lineTo(size * 0.02, wy + size * 0.011);
    ctx.stroke();
  }

  // Pommel and guard.
  const pommelGrad = ctx.createRadialGradient(
    -size * 0.008,
    size * 0.19,
    size * 0.003,
    0,
    size * 0.19,
    size * 0.032
  );
  pommelGrad.addColorStop(0, "#ffe4a6");
  pommelGrad.addColorStop(0.5, "#d5a240");
  pommelGrad.addColorStop(1, "#8d6420");
  ctx.fillStyle = pommelGrad;
  ctx.beginPath();
  ctx.arc(0, size * 0.19, size * 0.028, 0, Math.PI * 2);
  ctx.fill();

  const guardGrad = ctx.createLinearGradient(
    -size * 0.055,
    size * 0.03,
    size * 0.055,
    size * 0.06
  );
  guardGrad.addColorStop(0, "#8d5f1a");
  guardGrad.addColorStop(0.5, "#d6a847");
  guardGrad.addColorStop(1, "#8b5c16");
  ctx.fillStyle = guardGrad;
  ctx.beginPath();
  ctx.roundRect(
    -size * 0.055,
    size * 0.028,
    size * 0.11,
    size * 0.03,
    size * 0.01
  );
  ctx.fill();
  ctx.fillStyle = "#e3bf65";
  ctx.beginPath();
  ctx.arc(-size * 0.048, size * 0.043, size * 0.011, 0, Math.PI * 2);
  ctx.arc(size * 0.048, size * 0.043, size * 0.011, 0, Math.PI * 2);
  ctx.fill();

  // Blade core with fuller.
  const bladeLength = size * 0.45;
  const bladeWidth = size * 0.035;
  const bladeGrad = ctx.createLinearGradient(
    -bladeWidth,
    -bladeLength,
    bladeWidth,
    -bladeLength
  );
  bladeGrad.addColorStop(0, "#8f97a5");
  bladeGrad.addColorStop(0.22, "#dbe4ef");
  bladeGrad.addColorStop(0.5, "#ffffff");
  bladeGrad.addColorStop(0.78, "#ced8e6");
  bladeGrad.addColorStop(1, "#7f8898");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(0, -bladeLength);
  ctx.lineTo(-bladeWidth - size * 0.005, -bladeLength * 0.86);
  ctx.lineTo(-bladeWidth, size * 0.02);
  ctx.lineTo(bladeWidth, size * 0.02);
  ctx.lineTo(bladeWidth + size * 0.005, -bladeLength * 0.86);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 + shimmer * 0.35})`;
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-bladeWidth + size * 0.004, size * 0.01);
  ctx.lineTo(-bladeWidth, -bladeLength * 0.82);
  ctx.lineTo(0, -bladeLength);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bladeWidth - size * 0.004, size * 0.01);
  ctx.lineTo(bladeWidth, -bladeLength * 0.82);
  ctx.lineTo(0, -bladeLength);
  ctx.stroke();

  // Fuller and etched runes.
  ctx.strokeStyle = "rgba(98, 108, 124, 0.45)";
  ctx.lineWidth = 1.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -bladeLength * 0.78);
  ctx.lineTo(0, -size * 0.005);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 183, 96, ${0.22 + swordGlow * 0.35})`;
  ctx.lineWidth = 0.9 * zoom;
  for (let rune = 0; rune < 3; rune++) {
    const runeY = -bladeLength * (0.63 - rune * 0.16);
    ctx.beginPath();
    ctx.moveTo(-size * 0.01, runeY);
    ctx.lineTo(size * 0.01, runeY - size * 0.012);
    ctx.lineTo(size * 0.005, runeY + size * 0.01);
    ctx.stroke();
  }

  // Tip glint.
  ctx.fillStyle = `rgba(255,255,255,${0.72 + swordGlow * 0.28})`;
  ctx.beginPath();
  ctx.ellipse(
    0,
    -bladeLength * 0.92,
    size * 0.018,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  if (isAttacking && attackPhase < 0.62) {
    const trailAlpha = 0.86 - attackPhase * 1.3;
    for (let trail = 0; trail < 3; trail++) {
      ctx.strokeStyle = `rgba(255, 224, 173, ${trailAlpha * (0.9 - trail * 0.25)})`;
      ctx.lineWidth = (4.2 - trail * 1.1) * zoom;
      ctx.beginPath();
      ctx.moveTo(0, -bladeLength);
      ctx.quadraticCurveTo(
        -size * (0.1 + trail * 0.03),
        -size * 0.2,
        -size * (0.02 + trail * 0.05),
        size * 0.02
      );
      ctx.stroke();
    }
    for (let sp = 0; sp < 5; sp++) {
      const sparkX =
        -size * 0.06 + Math.sin(time * 16 + sp * 1.3) * size * 0.11;
      const sparkY = -size * 0.24 - sp * size * 0.065;
      ctx.fillStyle = `rgba(255, 220, 145, ${trailAlpha * (0.85 - sp * 0.12)})`;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, size * 0.013, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // === HEAD ===
  // Rear neck guard (behind head, not over face)
  const neckGuardGrad = ctx.createLinearGradient(
    x - size * 0.18,
    y - size * 0.32,
    x + size * 0.18,
    y - size * 0.15
  );
  neckGuardGrad.addColorStop(0, "#4a4a5a");
  neckGuardGrad.addColorStop(0.4, "#6a6a7e");
  neckGuardGrad.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = neckGuardGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.32);
  ctx.quadraticCurveTo(
    x - size * 0.19,
    y - size * 0.25,
    x - size * 0.13,
    y - size * 0.14
  );
  ctx.lineTo(x + size * 0.13, y - size * 0.14);
  ctx.quadraticCurveTo(
    x + size * 0.19,
    y - size * 0.25,
    x + size * 0.14,
    y - size * 0.32
  );
  ctx.closePath();
  ctx.fill();
  // Neck guard plate lines
  ctx.strokeStyle = "rgba(90, 90, 105, 0.4)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.23);
  ctx.lineTo(x + size * 0.14, y - size * 0.23);
  ctx.moveTo(x - size * 0.13, y - size * 0.19);
  ctx.lineTo(x + size * 0.13, y - size * 0.19);
  ctx.stroke();

  // Neck with shadow and muscle definition
  const neckGrad = ctx.createLinearGradient(
    x - size * 0.05,
    y - size * 0.18,
    x + size * 0.05,
    y - size * 0.18
  );
  neckGrad.addColorStop(0, "#c09070");
  neckGrad.addColorStop(0.3, "#dbb896");
  neckGrad.addColorStop(0.7, "#d8b490");
  neckGrad.addColorStop(1, "#b88060");
  ctx.fillStyle = neckGrad;
  ctx.fillRect(x - size * 0.055, y - size * 0.18, size * 0.11, size * 0.1);
  // Neck shadow from helmet
  ctx.fillStyle = "rgba(80, 50, 30, 0.2)";
  ctx.fillRect(x - size * 0.055, y - size * 0.18, size * 0.11, size * 0.03);

  // Face (head shape with jaw definition)
  const faceGrad = ctx.createRadialGradient(
    x - size * 0.02,
    y - size * 0.34,
    size * 0.02,
    x,
    y - size * 0.31,
    size * 0.16
  );
  faceGrad.addColorStop(0, "#ecc8a0");
  faceGrad.addColorStop(0.4, "#dbb896");
  faceGrad.addColorStop(0.7, "#d0a880");
  faceGrad.addColorStop(1, "#b88a68");
  ctx.fillStyle = faceGrad;
  // Skull + jawline (not just a circle)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y - size * 0.36);
  ctx.quadraticCurveTo(x - size * 0.16, y - size * 0.44, x, y - size * 0.46);
  ctx.quadraticCurveTo(
    x + size * 0.16,
    y - size * 0.44,
    x + size * 0.13,
    y - size * 0.36
  );
  ctx.lineTo(x + size * 0.12, y - size * 0.24);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.18, x, y - size * 0.17);
  ctx.quadraticCurveTo(
    x - size * 0.08,
    y - size * 0.18,
    x - size * 0.12,
    y - size * 0.24
  );
  ctx.closePath();
  ctx.fill();

  // Cheekbone highlights
  ctx.fillStyle = "rgba(240, 210, 170, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.07,
    y - size * 0.32,
    size * 0.035,
    size * 0.025,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.07,
    y - size * 0.32,
    size * 0.035,
    size * 0.025,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Shadow under brow/helmet edge
  ctx.fillStyle = "rgba(100, 60, 30, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.37, size * 0.12, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();

  // === ROMAN HORSEHAIR CRISTA (rendered behind helmet) ===
  const crestWind =
    Math.sin(time * 4.2) * 1.5 + (isAttacking ? attackSwing * 2 : 0);
  const crestWhip = Math.sin(time * 5.3 + 0.8) * 0.8;
  const crestGusts = Math.sin(time * 3.1) * 0.4;

  const crestMountY = y - size * 0.52;
  const crestPeakH = size * 0.34;
  const crestSpreadFB = size * 0.22;

  // Rear horsehair drape (hair cascading down the back of the helmet)
  ctx.fillStyle = "rgba(120,30,0,0.55)";
  ctx.beginPath();
  ctx.moveTo(x + crestSpreadFB * 0.4, crestMountY);
  ctx.quadraticCurveTo(
    x + crestSpreadFB * 0.6 + crestWind * 0.6,
    crestMountY + size * 0.04,
    x + crestSpreadFB * 0.5 + crestWind * 1.2 + crestGusts,
    crestMountY + size * 0.2
  );
  ctx.quadraticCurveTo(
    x + crestSpreadFB * 0.2 + crestWind * 0.4,
    crestMountY + size * 0.12,
    x - crestSpreadFB * 0.1,
    crestMountY + size * 0.02
  );
  ctx.closePath();
  ctx.fill();

  // Shadow/depth layer for the main brush body
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.moveTo(x - crestSpreadFB * 0.45, crestMountY + size * 0.01);
  ctx.quadraticCurveTo(
    x - crestSpreadFB * 0.2 + crestWind * 0.3,
    crestMountY - crestPeakH * 0.85 + size * 0.02,
    x + crestWind * 0.5 + crestWhip * 0.3,
    crestMountY - crestPeakH + size * 0.02
  );
  ctx.quadraticCurveTo(
    x + crestSpreadFB * 0.3 + crestWind * 0.8,
    crestMountY - crestPeakH * 0.7 + size * 0.02,
    x + crestSpreadFB * 0.55 + crestWind * 1,
    crestMountY + size * 0.02
  );
  ctx.closePath();
  ctx.fill();

  // Base crest layer (deep crimson horsehair)
  const crestBaseGrad = ctx.createLinearGradient(
    x,
    crestMountY,
    x,
    crestMountY - crestPeakH
  );
  crestBaseGrad.addColorStop(0, "#6a1800");
  crestBaseGrad.addColorStop(0.25, "#8a2200");
  crestBaseGrad.addColorStop(0.5, "#aa3300");
  crestBaseGrad.addColorStop(0.75, "#cc4400");
  crestBaseGrad.addColorStop(1, "#dd5500");
  ctx.fillStyle = crestBaseGrad;
  ctx.beginPath();
  ctx.moveTo(x - crestSpreadFB * 0.42, crestMountY);
  ctx.quadraticCurveTo(
    x - crestSpreadFB * 0.18 + crestWind * 0.3,
    crestMountY - crestPeakH * 0.88,
    x + crestWind * 0.5 + crestWhip * 0.3,
    crestMountY - crestPeakH
  );
  ctx.quadraticCurveTo(
    x + crestSpreadFB * 0.28 + crestWind * 0.8,
    crestMountY - crestPeakH * 0.72,
    x + crestSpreadFB * 0.52 + crestWind * 1,
    crestMountY
  );
  ctx.closePath();
  ctx.fill();

  // Main horsehair body (rich orange, slightly inset)
  const crestMainGrad = ctx.createLinearGradient(
    x,
    crestMountY,
    x + crestWind * 0.3,
    crestMountY - crestPeakH
  );
  crestMainGrad.addColorStop(0, "#992800");
  crestMainGrad.addColorStop(0.2, "#cc4400");
  crestMainGrad.addColorStop(0.45, "#ee5500");
  crestMainGrad.addColorStop(0.7, "#ff6611");
  crestMainGrad.addColorStop(1, "#ff7722");
  ctx.fillStyle = crestMainGrad;
  ctx.beginPath();
  ctx.moveTo(x - crestSpreadFB * 0.34, crestMountY);
  ctx.quadraticCurveTo(
    x - crestSpreadFB * 0.12 + crestWind * 0.35,
    crestMountY - crestPeakH * 0.92,
    x + crestWind * 0.55 + crestWhip * 0.25,
    crestMountY - crestPeakH * 0.96
  );
  ctx.quadraticCurveTo(
    x + crestSpreadFB * 0.22 + crestWind * 0.75,
    crestMountY - crestPeakH * 0.68,
    x + crestSpreadFB * 0.44 + crestWind * 0.9,
    crestMountY
  );
  ctx.closePath();
  ctx.fill();

  // Bright highlight layer (inner flame of the crest)
  const crestHiGrad = ctx.createLinearGradient(
    x,
    crestMountY - crestPeakH * 0.3,
    x,
    crestMountY - crestPeakH * 0.95
  );
  crestHiGrad.addColorStop(0, "rgba(255,136,68,0.0)");
  crestHiGrad.addColorStop(0.3, "rgba(255,153,68,0.6)");
  crestHiGrad.addColorStop(0.7, "rgba(255,170,85,0.7)");
  crestHiGrad.addColorStop(1, "rgba(255,187,102,0.5)");
  ctx.fillStyle = crestHiGrad;
  ctx.beginPath();
  ctx.moveTo(x - crestSpreadFB * 0.2, crestMountY - crestPeakH * 0.15);
  ctx.quadraticCurveTo(
    x - crestSpreadFB * 0.05 + crestWind * 0.4,
    crestMountY - crestPeakH * 0.9,
    x + crestWind * 0.5 + crestWhip * 0.2,
    crestMountY - crestPeakH * 0.88
  );
  ctx.quadraticCurveTo(
    x + crestSpreadFB * 0.15 + crestWind * 0.65,
    crestMountY - crestPeakH * 0.6,
    x + crestSpreadFB * 0.3 + crestWind * 0.7,
    crestMountY - crestPeakH * 0.1
  );
  ctx.closePath();
  ctx.fill();

  // Individual horsehair strands (flowing curves for texture)
  for (let strand = 0; strand < 7; strand++) {
    const strandT = strand / 6;
    const strandPhase = time * (4 + strand * 0.4) + strand * 1.1;
    const strandBend = Math.sin(strandPhase) * (1.5 + strandT * 2);
    const strandAlpha = 0.2 + Math.sin(time * 2.5 + strand * 0.9) * 0.1;
    const startX = x - crestSpreadFB * 0.3 + strandT * crestSpreadFB * 0.6;
    const startY = crestMountY;
    const peakScale = 0.7 + Math.sin(strandT * Math.PI) * 0.3;

    ctx.strokeStyle =
      strand % 2 === 0
        ? `rgba(255, 200, 120, ${strandAlpha})`
        : `rgba(255, 160, 80, ${strandAlpha})`;
    ctx.lineWidth = (0.8 + strandT * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX + crestWind * (0.3 + strandT * 0.5) + strandBend,
      crestMountY - crestPeakH * peakScale,
      startX +
        crestSpreadFB * (0.1 + strandT * 0.2) +
        crestWind * (0.6 + strandT * 0.4) +
        strandBend * 1.3,
      crestMountY - crestPeakH * peakScale * 0.2
    );
    ctx.stroke();
  }

  // Tip wisps (fine hair tips catching the wind at the peak)
  for (let wisp = 0; wisp < 4; wisp++) {
    const wispT = wisp / 3;
    const wispPhase = Math.sin(time * 6.5 + wisp * 1.7);
    const wispAlpha = 0.3 + wispPhase * 0.15;
    const wispX =
      x -
      crestSpreadFB * 0.05 +
      wispT * crestSpreadFB * 0.2 +
      crestWind * (0.4 + wispT * 0.2);
    const wispY = crestMountY - crestPeakH * (0.85 + wispT * 0.1);

    ctx.strokeStyle = `rgba(255, 180, 100, ${wispAlpha})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(wispX, wispY);
    ctx.quadraticCurveTo(
      wispX + crestWind * 0.8 + wispPhase * size * 0.04,
      wispY - size * 0.04,
      wispX + crestWind * 1.2 + wispPhase * size * 0.06,
      wispY + size * 0.02
    );
    ctx.stroke();
  }

  // Crest base clamp (gold decorative mount where hair meets helmet)
  const clampGrad = ctx.createLinearGradient(
    x - crestSpreadFB * 0.35,
    crestMountY,
    x + crestSpreadFB * 0.35,
    crestMountY
  );
  clampGrad.addColorStop(0, "#8a6a20");
  clampGrad.addColorStop(0.3, "#c9a237");
  clampGrad.addColorStop(0.5, "#e0be50");
  clampGrad.addColorStop(0.7, "#c9a237");
  clampGrad.addColorStop(1, "#8a6a20");
  ctx.fillStyle = clampGrad;
  ctx.beginPath();
  ctx.roundRect(
    x - crestSpreadFB * 0.35,
    crestMountY - size * 0.012,
    crestSpreadFB * 0.7,
    size * 0.035,
    size * 0.008
  );
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 230, 160, ${0.25 + shimmer * 0.2})`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.roundRect(
    x - crestSpreadFB * 0.35,
    crestMountY - size * 0.012,
    crestSpreadFB * 0.7,
    size * 0.035,
    size * 0.008
  );
  ctx.stroke();

  // === DETAILED GALEA HELMET (open-face bowl over the skull) ===
  const helmBowlY = y - size * 0.4;
  const helmGrad = ctx.createLinearGradient(
    x - size * 0.19,
    y - size * 0.54,
    x + size * 0.19,
    helmBowlY + size * 0.04
  );
  helmGrad.addColorStop(0, steelDeep);
  helmGrad.addColorStop(0.1, steelDark);
  helmGrad.addColorStop(0.28, steelMid);
  helmGrad.addColorStop(0.42, steelHigh);
  helmGrad.addColorStop(0.52, steelBright);
  helmGrad.addColorStop(0.62, steelHigh);
  helmGrad.addColorStop(0.78, steelMid);
  helmGrad.addColorStop(0.9, steelDark);
  helmGrad.addColorStop(1, steelDeep);
  ctx.fillStyle = helmGrad;
  // Bowl (half-dome sitting on top of the skull)
  ctx.beginPath();
  ctx.ellipse(x, helmBowlY, size * 0.18, size * 0.12, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Crown (taller curved dome rising above the bowl)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, helmBowlY);
  ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.51, x, y - size * 0.55);
  ctx.quadraticCurveTo(
    x + size * 0.2,
    y - size * 0.51,
    x + size * 0.18,
    helmBowlY
  );
  ctx.closePath();
  ctx.fill();

  // Center ridge (raised medial crest with double stroke)
  ctx.strokeStyle = `rgba(180, 180, 200, ${0.35 + shimmer * 0.15})`;
  ctx.lineWidth = 2.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.545);
  ctx.lineTo(x, helmBowlY);
  ctx.stroke();
  ctx.strokeStyle = `rgba(230, 230, 248, ${0.12 + shimmer * 0.08})`;
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.545);
  ctx.lineTo(x, helmBowlY);
  ctx.stroke();

  // Dome plate segment lines (curved to follow bowl shape)
  ctx.strokeStyle = "rgba(50, 50, 65, 0.28)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.43);
  ctx.quadraticCurveTo(x, y - size * 0.46, x + size * 0.14, y - size * 0.43);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, helmBowlY + size * 0.01);
  ctx.quadraticCurveTo(
    x,
    helmBowlY - size * 0.02,
    x + size * 0.16,
    helmBowlY + size * 0.01
  );
  ctx.stroke();

  // Primary specular highlight
  ctx.fillStyle = `rgba(220, 222, 245, ${0.13 + shimmer * 0.1})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.49,
    size * 0.04,
    size * 0.028,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Secondary specular (pinpoint)
  ctx.fillStyle = `rgba(245, 245, 255, ${0.08 + shimmer * 0.08})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.035,
    y - size * 0.51,
    size * 0.018,
    size * 0.01,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Crest holder bracket (tapered column with gradient)
  const bracketGrad = ctx.createLinearGradient(
    x - size * 0.03,
    y - size * 0.55,
    x + size * 0.03,
    y - size * 0.55
  );
  bracketGrad.addColorStop(0, steelDark);
  bracketGrad.addColorStop(0.4, steelHigh);
  bracketGrad.addColorStop(0.6, steelBright);
  bracketGrad.addColorStop(1, steelDark);
  ctx.fillStyle = bracketGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.032, helmBowlY + size * 0.01);
  ctx.lineTo(x - size * 0.022, y - size * 0.545);
  ctx.quadraticCurveTo(x, y - size * 0.565, x + size * 0.022, y - size * 0.545);
  ctx.lineTo(x + size * 0.032, helmBowlY + size * 0.01);
  ctx.closePath();
  ctx.fill();
  // Bracket rivets
  ctx.fillStyle = `rgba(200, 180, 100, ${0.5 + shimmer * 0.2})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.43, size * 0.006, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y - size * 0.47, size * 0.006, 0, Math.PI * 2);
  ctx.fill();

  // Brow guard (rim sitting at the bowl bottom edge, above the face)
  const browY = helmBowlY;
  const browGrad = ctx.createLinearGradient(
    x - size * 0.19,
    browY,
    x + size * 0.19,
    browY
  );
  browGrad.addColorStop(0, steelDark);
  browGrad.addColorStop(0.25, steelMid);
  browGrad.addColorStop(0.45, steelBright);
  browGrad.addColorStop(0.55, steelHigh);
  browGrad.addColorStop(0.75, steelMid);
  browGrad.addColorStop(1, steelDark);
  ctx.fillStyle = browGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.185, browY - size * 0.01);
  ctx.quadraticCurveTo(
    x,
    browY - size * 0.04,
    x + size * 0.185,
    browY - size * 0.01
  );
  ctx.lineTo(x + size * 0.18, browY + size * 0.025);
  ctx.quadraticCurveTo(
    x,
    browY + size * 0.005,
    x - size * 0.18,
    browY + size * 0.025
  );
  ctx.closePath();
  ctx.fill();
  // Brow gold trim (upper edge)
  ctx.strokeStyle = `rgba(210, 185, 120, ${0.55 + shimmer * 0.25})`;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, browY - size * 0.008);
  ctx.quadraticCurveTo(
    x,
    browY - size * 0.038,
    x + size * 0.18,
    browY - size * 0.008
  );
  ctx.stroke();
  // Brow lower shadow edge
  ctx.strokeStyle = "rgba(40, 40, 55, 0.35)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.175, browY + size * 0.024);
  ctx.quadraticCurveTo(
    x,
    browY + size * 0.006,
    x + size * 0.175,
    browY + size * 0.024
  );
  ctx.stroke();

  // Cheek guards (hang from bowl sides, leaving face center open)
  for (let side = -1; side <= 1; side += 2) {
    const cgGrad = ctx.createLinearGradient(
      x + side * size * 0.22,
      helmBowlY,
      x + side * size * 0.06,
      y - size * 0.18
    );
    cgGrad.addColorStop(0, steelDeep);
    cgGrad.addColorStop(0.25, steelDark);
    cgGrad.addColorStop(0.5, steelMid);
    cgGrad.addColorStop(0.75, steelHigh);
    cgGrad.addColorStop(1, steelMid);
    ctx.fillStyle = cgGrad;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.17, helmBowlY);
    ctx.lineTo(x + side * size * 0.21, y - size * 0.28);
    ctx.quadraticCurveTo(
      x + side * size * 0.18,
      y - size * 0.16,
      x + side * size * 0.06,
      y - size * 0.19
    );
    ctx.lineTo(x + side * size * 0.08, y - size * 0.36);
    ctx.closePath();
    ctx.fill();

    // Cheek guard edge highlight
    ctx.strokeStyle = `rgba(170, 170, 192, ${0.2 + shimmer * 0.1})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.17, helmBowlY);
    ctx.lineTo(x + side * size * 0.21, y - size * 0.28);
    ctx.stroke();

    // Hinge rivet at bowl junction
    ctx.fillStyle = `rgba(200, 170, 80, ${0.6 + shimmer * 0.2})`;
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.155,
      helmBowlY + size * 0.005,
      size * 0.009,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Lower jaw rivet
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.1,
      y - size * 0.22,
      size * 0.007,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Decorative cheek line (gold)
    ctx.strokeStyle = `rgba(200, 175, 110, ${0.3 + shimmer * 0.15})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.14, y - size * 0.36);
    ctx.quadraticCurveTo(
      x + side * size * 0.16,
      y - size * 0.28,
      x + side * size * 0.09,
      y - size * 0.22
    );
    ctx.stroke();
  }

  // Nasal guard (thin strip from brow down to nose tip)
  const nasalGrad = ctx.createLinearGradient(
    x - size * 0.015,
    browY,
    x + size * 0.015,
    browY
  );
  nasalGrad.addColorStop(0, steelDark);
  nasalGrad.addColorStop(0.35, steelHigh);
  nasalGrad.addColorStop(0.5, steelBright);
  nasalGrad.addColorStop(0.65, steelHigh);
  nasalGrad.addColorStop(1, steelDark);
  ctx.fillStyle = nasalGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.014, browY + size * 0.01);
  ctx.lineTo(x - size * 0.016, y - size * 0.27);
  ctx.quadraticCurveTo(x, y - size * 0.25, x + size * 0.016, y - size * 0.27);
  ctx.lineTo(x + size * 0.014, browY + size * 0.01);
  ctx.closePath();
  ctx.fill();
  // Nasal ridge center highlight
  ctx.strokeStyle = `rgba(200, 200, 220, ${0.25 + shimmer * 0.12})`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, browY + size * 0.015);
  ctx.lineTo(x, y - size * 0.28);
  ctx.stroke();

  // === FACE DETAILS ===
  // Eyes
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.055,
    y - size * 0.33,
    size * 0.028,
    size * (isAttacking ? 0.012 : 0.022),
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.055,
    y - size * 0.33,
    size * 0.028,
    size * (isAttacking ? 0.012 : 0.022),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.052, y - size * 0.335, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.058, y - size * 0.335, size * 0.01, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(x - size * 0.052, y - size * 0.332, size * 0.005, 0, Math.PI * 2);
  ctx.arc(x + size * 0.058, y - size * 0.332, size * 0.005, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows (lowered to sit below helmet brow guard)
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 1.8 * zoom;
  const browAnger = isAttacking ? 0.08 : 0;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * (0.345 - browAnger));
  ctx.quadraticCurveTo(
    x - size * 0.055,
    y - size * (0.36 + browAnger),
    x - size * 0.025,
    y - size * 0.35
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.09, y - size * (0.345 - browAnger));
  ctx.quadraticCurveTo(
    x + size * 0.055,
    y - size * (0.36 + browAnger),
    x + size * 0.025,
    y - size * 0.35
  );
  ctx.stroke();

  // Nose
  ctx.strokeStyle = "#c9a080";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32);
  ctx.lineTo(x - size * 0.015, y - size * 0.26);
  ctx.lineTo(x, y - size * 0.24);
  ctx.stroke();

  // Mouth
  if (isAttacking) {
    ctx.fillStyle = "#4a2a1a";
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.22,
      size * 0.045,
      size * 0.035 * (1 + attackPhase * 0.6),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(x - size * 0.025, y - size * 0.23, size * 0.05, size * 0.015);
  } else {
    ctx.strokeStyle = "#9b7b6b";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.035, y - size * 0.22);
    ctx.quadraticCurveTo(x, y - size * 0.2, x + size * 0.035, y - size * 0.22);
    ctx.stroke();
  }

  // Stubble/chin detail
  ctx.fillStyle = "rgba(90, 70, 50, 0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.2, size * 0.06, size * 0.04, 0, 0, Math.PI);
  ctx.fill();

  // Chin strap shadow under jaw
  ctx.strokeStyle = "rgba(60, 50, 40, 0.25)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.18);
  ctx.quadraticCurveTo(x, y - size * 0.16, x + size * 0.04, y - size * 0.18);
  ctx.stroke();

  // === PRINCETON "P" EMBLEM (rendered above everything) ===
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08 + breathe * 0.5, size * 0.085, 0, Math.PI * 2);
  ctx.fill();
  const emblemGrad = ctx.createRadialGradient(
    x - size * 0.02,
    y + size * 0.06 + breathe * 0.5,
    size * 0.01,
    x,
    y + size * 0.08 + breathe * 0.5,
    size * 0.08
  );
  emblemGrad.addColorStop(0, "#ff8822");
  emblemGrad.addColorStop(0.6, "#ff6600");
  emblemGrad.addColorStop(1, "#cc4400");
  ctx.fillStyle = emblemGrad;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08 + breathe * 0.5, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(201, 162, 39, ${0.5 + shimmer * 0.3})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08 + breathe * 0.5, size * 0.082, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 220, 170, ${0.22 + shimmer * 0.18})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.03,
    y + size * 0.05 + breathe * 0.5,
    size * 0.022,
    size * 0.014,
    -0.5,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${9 * zoom}px Georgia`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x, y + size * 0.09 + breathe * 0.5);

  ctx.restore();
}
