import type { Position } from "../../types";
import {
  normalizeSignedAngle,
  resolveWeaponRotation,
  WEAPON_LIMITS,
  TROOP_MASTERWORK_STYLES,
  drawTroopMasterworkFinish,
} from "./troopHelpers";

export function drawCentaurTroop(
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
  // EPIC ORNATE CENTAUR ARCHER - Golden War Champion of Princeton
  const gallop = Math.sin(time * 7.4) * 4.4;
  const legCycle = Math.sin(time * 7.4) * 0.44;
  const breathe = Math.sin(time * 2) * 0.5;
  const tailSwish = Math.sin(time * 5.6);
  const hairFlow = Math.sin(time * 4.6);
  const shimmer = Math.sin(time * 5) * 0.5 + 0.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  const centaurBrownDark = "#2b1c13";
  const centaurBrownMid = "#5a3d24";
  const centaurBrownLight = "#7d5d3f";
  const centaurLeafDark = "#22331e";
  const centaurLeafMid = "#395536";
  const centaurLeafLight = "#61804f";
  const centaurGoldDark = "#685026";
  const centaurGoldMid = "#9f7a3a";
  const centaurGoldLight = "#ceb270";

  // Attack animation - bow draw and release
  const isAttacking = attackPhase > 0;
  const bowDraw = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const bowBaseRotation = -0.52 + (isAttacking ? -bowDraw * 0.3 : -0.08);
  const bowX = x - size * 0.275;
  const bowY = y - size * 0.2 + gallop * 0.06;
  const bowRotation = resolveWeaponRotation(
    targetPos,
    bowX,
    bowY,
    bowBaseRotation,
    -Math.PI,
    isAttacking ? 1.0 : 0.52,
    WEAPON_LIMITS.bow,
  );
  const bowRotationDelta = normalizeSignedAngle(bowRotation - bowBaseRotation);

  // === MULTI-LAYERED FOREST AURA ===
  const auraIntensity = isAttacking ? 0.6 : 0.35;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Multiple layered auras for depth
  for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
    const layerOffset = auraLayer * 0.12;
    const auraGrad = ctx.createRadialGradient(
      x + size * 0.05,
      y + size * 0.1,
      size * (0.08 + layerOffset),
      x + size * 0.05,
      y + size * 0.1,
      size * (0.9 + layerOffset * 0.3),
    );
    auraGrad.addColorStop(
      0,
      `rgba(160, 194, 96, ${auraIntensity * auraPulse * (0.5 - auraLayer * 0.12)})`,
    );
    auraGrad.addColorStop(
      0.3,
      `rgba(109, 152, 74, ${auraIntensity * auraPulse * (0.35 - auraLayer * 0.08)})`,
    );
    auraGrad.addColorStop(
      0.6,
      `rgba(84, 113, 45, ${auraIntensity * auraPulse * (0.2 - auraLayer * 0.05)})`,
    );
    auraGrad.addColorStop(1, "rgba(47, 67, 28, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      x + size * 0.05,
      y + size * 0.15,
      size * (0.8 + layerOffset * 0.2),
      size * (0.55 + layerOffset * 0.15),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Floating forest-gold rune particles
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.5 + p * Math.PI * 0.2) % (Math.PI * 2);
    const pDist = size * 0.55 + Math.sin(time * 2.5 + p * 0.7) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + size * 0.1 + Math.sin(pAngle) * pDist * 0.38;
    const pAlpha = 0.5 + Math.sin(time * 4 + p * 0.6) * 0.3;
    // Outer glow
    ctx.fillStyle = `rgba(169, 199, 104, ${pAlpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    // Inner bright
    ctx.fillStyle = `rgba(231, 201, 126, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // === ENERGY RINGS (during attack) ===
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6 * attackIntensity;
      ctx.strokeStyle = `rgba(177, 207, 115, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + size * 0.1,
        size * (0.5 + ringPhase * 0.45),
        size * (0.32 + ringPhase * 0.28),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    // Golden spark particles
    for (let sp = 0; sp < 8; sp++) {
      const spAngle = time * 6 + (sp * Math.PI) / 4;
      const spDist = size * 0.35 + attackIntensity * size * 0.35;
      const spX = x + Math.cos(spAngle) * spDist;
      const spY = y + size * 0.1 + Math.sin(spAngle) * spDist * 0.4;
      ctx.fillStyle = `rgba(226, 203, 132, ${attackIntensity * 0.8})`;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === POWERFUL HORSE BODY WITH DETAILED COAT ===
  // Main body with brown-green coat gradient
  const bodyGrad = ctx.createRadialGradient(
    x + size * 0.02,
    y + size * 0.05,
    0,
    x + size * 0.08,
    y + size * 0.15,
    size * 0.55,
  );
  bodyGrad.addColorStop(0, centaurBrownLight);
  bodyGrad.addColorStop(0.25, "#80603c");
  bodyGrad.addColorStop(0.5, centaurBrownMid);
  bodyGrad.addColorStop(0.75, "#4f3a23");
  bodyGrad.addColorStop(1, centaurBrownDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08,
    y + size * 0.15 + gallop * 0.12,
    size * 0.46,
    size * 0.28,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Muscle definition highlights
  ctx.strokeStyle = "rgba(188, 164, 109, 0.4)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.1,
    y + size * 0.08 + gallop * 0.12,
    size * 0.14,
    0.4,
    2.2,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + size * 0.3,
    y + size * 0.06 + gallop * 0.12,
    size * 0.12,
    0.5,
    2.0,
  );
  ctx.stroke();

  // Muscle definition shadows
  ctx.strokeStyle = "rgba(71,53,34,0.55)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y + size * 0.14 + gallop * 0.12,
    size * 0.17,
    0.3,
    2.5,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + size * 0.28,
    y + size * 0.12 + gallop * 0.12,
    size * 0.15,
    0.4,
    2.3,
  );
  ctx.stroke();

  // Battle scars (honorable marks)
  ctx.strokeStyle = "rgba(100, 70, 30, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + size * 0.04 + gallop * 0.12);
  ctx.lineTo(x - size * 0.02, y + size * 0.16 + gallop * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y + size * 0.02 + gallop * 0.12);
  ctx.lineTo(x + size * 0.22, y + size * 0.12 + gallop * 0.12);
  ctx.stroke();

  // === ORNATE ARMORED BARDING ===
  // Chest armor plate with gradient
  const chestArmorGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y + size * 0.1,
    x - size * 0.1,
    y + size * 0.25,
  );
  chestArmorGrad.addColorStop(0, centaurLeafDark);
  chestArmorGrad.addColorStop(0.3, centaurLeafMid);
  chestArmorGrad.addColorStop(0.6, "#49663a");
  chestArmorGrad.addColorStop(1, "#2f4a29");
  ctx.fillStyle = chestArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.27, y + size * 0.03 + gallop * 0.12);
  ctx.lineTo(x - size * 0.38, y + size * 0.22 + gallop * 0.12);
  ctx.lineTo(x - size * 0.22, y + size * 0.28 + gallop * 0.12);
  ctx.lineTo(x - size * 0.08, y + size * 0.08 + gallop * 0.12);
  ctx.closePath();
  ctx.fill();

  // Armor edge highlight
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Engraved filigree on chest armor
  ctx.strokeStyle = centaurGoldLight;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.1 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x - size * 0.32,
    y + size * 0.16,
    x - size * 0.26,
    y + size * 0.2 + gallop * 0.12,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.08 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x - size * 0.26,
    y + size * 0.14,
    x - size * 0.2,
    y + size * 0.18 + gallop * 0.12,
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Chest armor gem
  ctx.fillStyle = centaurGoldMid;
  ctx.shadowColor = centaurGoldLight;
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.25,
    y + size * 0.14 + gallop * 0.12,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Back armor plate
  const backArmorGrad = ctx.createLinearGradient(
    x + size * 0.2,
    y + size * 0.0,
    x + size * 0.4,
    y + size * 0.2,
  );
  backArmorGrad.addColorStop(0, centaurLeafDark);
  backArmorGrad.addColorStop(0.5, centaurLeafMid);
  backArmorGrad.addColorStop(1, "#2f4a29");
  ctx.fillStyle = backArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y + gallop * 0.12);
  ctx.lineTo(x + size * 0.42, y + size * 0.08 + gallop * 0.12);
  ctx.lineTo(x + size * 0.38, y + size * 0.22 + gallop * 0.12);
  ctx.lineTo(x + size * 0.22, y + size * 0.18 + gallop * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Back armor gem
  ctx.fillStyle = centaurGoldLight;
  ctx.shadowColor = centaurGoldLight;
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(
    x + size * 0.32,
    y + size * 0.1 + gallop * 0.12,
    size * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Decorative medallion chain across body
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.22 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.26 + gallop * 0.12,
    x + size * 0.2,
    y + size * 0.22 + gallop * 0.12,
  );
  ctx.stroke();
  // Medallions on chain
  for (let med = 0; med < 5; med++) {
    const medX = x - size * 0.16 + med * size * 0.09;
    const medY =
      y + size * 0.24 + Math.sin(med * 0.8) * size * 0.015 + gallop * 0.12;
    ctx.fillStyle = centaurGoldLight;
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }

  // === POWERFUL LEGS WITH JOINTED ANATOMY ===
  const drawCentaurHorseLeg = (
    legX: number,
    legY: number,
    stride: number,
    phaseOffset: number,
  ) => {
    const upperLen = size * 0.16;
    const lowerLen = size * 0.18;
    const kneeSwing = Math.sin(time * 7 + phaseOffset) * size * 0.03;
    const fetlockSwing = Math.sin(time * 7 + phaseOffset + 0.9) * size * 0.026;
    ctx.save();
    ctx.translate(legX, legY);
    ctx.rotate(stride);

    // Upper leg muscle
    const upperGrad = ctx.createLinearGradient(
      -size * 0.05,
      0,
      size * 0.05,
      upperLen,
    );
    upperGrad.addColorStop(0, centaurBrownLight);
    upperGrad.addColorStop(0.6, centaurBrownMid);
    upperGrad.addColorStop(1, centaurBrownDark);
    ctx.fillStyle = upperGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, 0);
    ctx.quadraticCurveTo(
      -size * 0.065,
      upperLen * 0.55,
      kneeSwing - size * 0.04,
      upperLen,
    );
    ctx.lineTo(kneeSwing + size * 0.04, upperLen);
    ctx.quadraticCurveTo(size * 0.065, upperLen * 0.55, size * 0.05, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(214, 190, 140, 0.24)";
    ctx.beginPath();
    ctx.ellipse(
      kneeSwing - size * 0.006,
      upperLen * 0.46,
      size * 0.023,
      size * 0.043,
      0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Lower leg armor
    const fetlockX = kneeSwing + fetlockSwing;
    const lowerGrad = ctx.createLinearGradient(
      kneeSwing - size * 0.042,
      upperLen,
      fetlockX + size * 0.042,
      upperLen + lowerLen,
    );
    lowerGrad.addColorStop(0, centaurLeafDark);
    lowerGrad.addColorStop(0.45, centaurLeafMid);
    lowerGrad.addColorStop(1, "#2e4a27");
    ctx.fillStyle = lowerGrad;
    ctx.beginPath();
    ctx.moveTo(kneeSwing - size * 0.04, upperLen);
    ctx.lineTo(fetlockX - size * 0.034, upperLen + lowerLen);
    ctx.lineTo(fetlockX + size * 0.034, upperLen + lowerLen);
    ctx.lineTo(kneeSwing + size * 0.04, upperLen);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(183, 146, 69, 0.78)`;
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.moveTo(kneeSwing - size * 0.026, upperLen + size * 0.018);
    ctx.lineTo(fetlockX - size * 0.017, upperLen + lowerLen - size * 0.02);
    ctx.stroke();

    // Hoof angle and silhouette
    ctx.save();
    ctx.translate(fetlockX, upperLen + lowerLen);
    ctx.rotate(-0.2 + stride * 0.5);
    ctx.fillStyle = "#2b1f16";
    ctx.beginPath();
    ctx.moveTo(-size * 0.058, size * 0.005);
    ctx.lineTo(size * 0.055, -size * 0.007);
    ctx.lineTo(size * 0.052, size * 0.036);
    ctx.lineTo(-size * 0.051, size * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = centaurGoldMid;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.046, size * 0.013);
    ctx.lineTo(size * 0.044, size * 0.003);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  };

  drawCentaurHorseLeg(
    x - size * 0.2,
    y + size * 0.33 + gallop * 0.1,
    legCycle * 1.12,
    0.1,
  );
  drawCentaurHorseLeg(
    x - size * 0.05,
    y + size * 0.34 + gallop * 0.1,
    -legCycle * 0.9,
    1.15,
  );
  drawCentaurHorseLeg(
    x + size * 0.22,
    y + size * 0.34 + gallop * 0.1,
    -legCycle * 1.03,
    2.15,
  );
  drawCentaurHorseLeg(
    x + size * 0.37,
    y + size * 0.33 + gallop * 0.1,
    legCycle * 0.86,
    3.0,
  );

  // === MAJESTIC FLOWING TAIL ===
  const tailRootX = x + size * 0.5;
  const tailRootY = y + size * 0.07 + gallop * 0.12;
  for (let strand = 0; strand < 5; strand++) {
    const offset = (strand - 2) * size * 0.012;
    ctx.strokeStyle =
      strand < 2
        ? "#3f2e1d"
        : strand < 4
          ? "#5b4128"
          : "rgba(181, 151, 88, 0.78)";
    ctx.lineWidth = (7.2 - strand * 1.2) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tailRootX + offset, tailRootY + offset * 0.2);
    ctx.quadraticCurveTo(
      x + size * 0.72 + tailSwish * (11 - strand),
      y + size * (0.14 + strand * 0.012),
      x + size * 0.6 + tailSwish * (15 - strand),
      y + size * (0.44 - strand * 0.012),
    );
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(214, 187, 118, ${0.45 + Math.sin(time * 4) * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.61 + tailSwish * 14,
    y + size * 0.44,
    size * 0.024,
    size * 0.015,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === MUSCULAR HUMAN TORSO ===
  // Back muscles layer
  ctx.fillStyle = "#c89050";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.06 + gallop * 0.08 + breathe,
    size * 0.24,
    size * 0.2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Main torso with rich gradient
  const torsoGrad = ctx.createLinearGradient(
    x - size * 0.24,
    y - size * 0.25,
    x + size * 0.24,
    y + size * 0.05,
  );
  torsoGrad.addColorStop(0, "#c08040");
  torsoGrad.addColorStop(0.2, "#d8a060");
  torsoGrad.addColorStop(0.4, "#e8b878");
  torsoGrad.addColorStop(0.6, "#e8b070");
  torsoGrad.addColorStop(0.8, "#d8a060");
  torsoGrad.addColorStop(1, "#c08040");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.02 + gallop * 0.08 + breathe);
  ctx.lineTo(x - size * 0.28, y - size * 0.32 + gallop * 0.04 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.46 + gallop * 0.04 + breathe * 0.3,
    x + size * 0.28,
    y - size * 0.32 + gallop * 0.04 + breathe * 0.5,
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.02 + gallop * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest/pec definition
  ctx.strokeStyle = "rgba(180, 130, 80, 0.4)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.24 + gallop * 0.05 + breathe * 0.4);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.18 + gallop * 0.05 + breathe * 0.4,
    x + size * 0.18,
    y - size * 0.24 + gallop * 0.05 + breathe * 0.4,
  );
  ctx.stroke();
  // Ab definition lines
  ctx.strokeStyle = "rgba(139,90,50,0.35)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + gallop * 0.05 + breathe * 0.3);
  ctx.lineTo(x, y - size * 0.05 + gallop * 0.08 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.16 + gallop * 0.06 + breathe * 0.5);
  ctx.lineTo(x + size * 0.1, y - size * 0.16 + gallop * 0.06 + breathe * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.08 + gallop * 0.07 + breathe * 0.7);
  ctx.lineTo(x + size * 0.08, y - size * 0.08 + gallop * 0.07 + breathe * 0.7);
  ctx.stroke();

  // Ornate warrior sash with detail
  const sashGrad = ctx.createLinearGradient(
    x - size * 0.22,
    y - size * 0.26,
    x + size * 0.1,
    y - size * 0.04,
  );
  sashGrad.addColorStop(0, centaurLeafDark);
  sashGrad.addColorStop(0.5, centaurLeafMid);
  sashGrad.addColorStop(1, "#2e4a27");
  ctx.fillStyle = sashGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.27 + gallop * 0.05);
  ctx.lineTo(x + size * 0.14, y - size * 0.08 + gallop * 0.08);
  ctx.lineTo(x + size * 0.1, y - size * 0.02 + gallop * 0.08);
  ctx.lineTo(x - size * 0.26, y - size * 0.22 + gallop * 0.05);
  ctx.closePath();
  ctx.fill();
  // Sash gold trim
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Sash medallion
  ctx.fillStyle = centaurGoldLight;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.06,
    y - size * 0.16 + gallop * 0.06,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === POWERFUL ARMS WITH BRACERS ===
  // Left arm (drawing bow)
  ctx.save();
  ctx.translate(x - size * 0.3, y - size * 0.2 + gallop * 0.05);
  ctx.rotate(-0.72 - bowDraw * 0.12 + bowRotationDelta * 0.45);
  // Upper arm
  const armGrad = ctx.createRadialGradient(
    0,
    size * 0.08,
    0,
    0,
    size * 0.08,
    size * 0.12,
  );
  armGrad.addColorStop(0, "#e8b878");
  armGrad.addColorStop(1, "#c89050");
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.065, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.05,
    size * 0.22,
    size * 0.055,
    size * 0.11,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Ornate bracer
  ctx.fillStyle = centaurGoldDark;
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.06,
    size * 0.2,
    size * 0.06,
    size * 0.05,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1;
  ctx.stroke();
  // Bracer gem
  ctx.fillStyle = centaurLeafLight;
  ctx.shadowColor = centaurLeafLight;
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(-size * 0.06, size * 0.2, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Right arm (holding bowstring back)
  ctx.save();
  ctx.translate(x + size * 0.3, y - size * 0.2 + gallop * 0.05);
  ctx.rotate(0.7 + bowDraw * 0.2 + bowRotationDelta * 0.38);
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.065, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(
    size * 0.04,
    size * 0.2,
    size * 0.055,
    size * 0.11,
    0.25,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Bracer
  ctx.fillStyle = centaurGoldDark;
  ctx.beginPath();
  ctx.ellipse(
    size * 0.05,
    size * 0.18,
    size * 0.06,
    size * 0.05,
    0.25,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = centaurLeafLight;
  ctx.shadowColor = centaurLeafLight;
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(size * 0.05, size * 0.18, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === ORNATE HEAD ===
  // Neck with highlights
  const neckGrad = ctx.createLinearGradient(
    x - size * 0.06,
    y - size * 0.42,
    x + size * 0.06,
    y - size * 0.42,
  );
  neckGrad.addColorStop(0, "#c89050");
  neckGrad.addColorStop(0.5, "#e0a868");
  neckGrad.addColorStop(1, "#c89050");
  ctx.fillStyle = neckGrad;
  ctx.fillRect(
    x - size * 0.07,
    y - size * 0.42 + gallop * 0.04,
    size * 0.14,
    size * 0.12,
  );

  // Face with gradient
  const faceGrad = ctx.createRadialGradient(
    x - size * 0.02,
    y - size * 0.52 + gallop * 0.04,
    0,
    x,
    y - size * 0.5 + gallop * 0.04,
    size * 0.15,
  );
  faceGrad.addColorStop(0, "#f0c890");
  faceGrad.addColorStop(0.6, "#e8b878");
  faceGrad.addColorStop(1, "#d8a060");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.52 + gallop * 0.04, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // === FLOWING GOLDEN HAIR WITH DETAIL ===
  // Hair shadow layer
  ctx.fillStyle = "#9a7820";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.6 + gallop * 0.04);
  for (let i = 0; i < 10; i++) {
    const hairAngle = -1.0 + i * 0.24;
    const hairWave = Math.sin(time * 5.5 + i * 0.5) * 4 + hairFlow * 2.5;
    const hairLen = size * (0.22 + (i > 4 ? 0.12 : 0));
    ctx.lineTo(
      x + Math.cos(hairAngle) * hairLen + hairWave * 0.6,
      y -
        size * 0.52 +
        Math.sin(hairAngle) * hairLen * 0.85 +
        hairWave +
        gallop * 0.04,
    );
  }
  ctx.closePath();
  ctx.fill();

  // Main hair
  ctx.fillStyle = "#c09838";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y - size * 0.62 + gallop * 0.04);
  for (let i = 0; i < 9; i++) {
    const hairAngle = -0.95 + i * 0.25;
    const hairWave = Math.sin(time * 5 + i * 0.5) * 3.5 + hairFlow * 2;
    const hairLen = size * (0.2 + (i > 4 ? 0.1 : 0));
    ctx.lineTo(
      x + Math.cos(hairAngle) * hairLen + hairWave * 0.5,
      y -
        size * 0.52 +
        Math.sin(hairAngle) * hairLen * 0.82 +
        hairWave +
        gallop * 0.04,
    );
  }
  ctx.closePath();
  ctx.fill();

  // Hair highlight strands
  ctx.fillStyle = "#e0c058";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.64 + gallop * 0.04);
  for (let i = 0; i < 6; i++) {
    const hairAngle = -0.75 + i * 0.32;
    const hairWave = Math.sin(time * 5 + i * 0.6) * 2.5 + hairFlow * 1.5;
    ctx.lineTo(
      x + Math.cos(hairAngle) * size * 0.16 + hairWave * 0.35,
      y -
        size * 0.54 +
        Math.sin(hairAngle) * size * 0.13 +
        hairWave * 0.55 +
        gallop * 0.04,
    );
  }
  ctx.closePath();
  ctx.fill();

  // Brightest highlights
  ctx.strokeStyle = "#f0d878";
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.6;
  for (let strand = 0; strand < 4; strand++) {
    const strandAngle = -0.6 + strand * 0.4;
    const strandWave = Math.sin(time * 5 + strand * 0.8) * 2;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(strandAngle) * size * 0.08,
      y - size * 0.58 + gallop * 0.04,
    );
    ctx.quadraticCurveTo(
      x + Math.cos(strandAngle) * size * 0.14 + strandWave,
      y - size * 0.52 + Math.sin(strandAngle) * size * 0.08,
      x + Math.cos(strandAngle) * size * 0.18 + strandWave * 1.5,
      y - size * 0.46 + Math.sin(strandAngle) * size * 0.12 + gallop * 0.04,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === LEAF CROWN ===
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 2.3 * zoom;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.57 + gallop * 0.04,
    size * 0.14,
    Math.PI * 0.78,
    Math.PI * 0.22,
    true,
  );
  ctx.stroke();
  ctx.strokeStyle = centaurGoldDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.57 + gallop * 0.04,
    size * 0.122,
    Math.PI * 0.8,
    Math.PI * 0.2,
    true,
  );
  ctx.stroke();

  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 7; i++) {
      const leafAngle =
        side === -1 ? Math.PI * 0.77 - i * 0.115 : Math.PI * 0.23 + i * 0.115;
      const leafX = x + Math.cos(leafAngle) * size * 0.14;
      const leafY =
        y - size * 0.57 + Math.sin(leafAngle) * size * 0.14 + gallop * 0.04;
      const leafSize = size * (0.03 - i * 0.0018);
      ctx.fillStyle = i % 2 === 0 ? centaurLeafMid : centaurLeafLight;
      ctx.beginPath();
      ctx.ellipse(
        leafX,
        leafY,
        leafSize,
        leafSize * 0.44,
        leafAngle + Math.PI * 0.5 * side,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(38, 78, 36, 0.8)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        leafX - Math.cos(leafAngle) * leafSize * 0.4,
        leafY - Math.sin(leafAngle) * leafSize * 0.4,
      );
      ctx.lineTo(
        leafX + Math.cos(leafAngle) * leafSize * 0.45,
        leafY + Math.sin(leafAngle) * leafSize * 0.45,
      );
      ctx.stroke();
    }
  }

  // Center and side crown berries.
  ctx.fillStyle = centaurGoldLight;
  ctx.shadowColor = centaurGoldLight;
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.71 + gallop * 0.04, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    x - size * 0.12,
    y - size * 0.62 + gallop * 0.04,
    size * 0.013,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.12,
    y - size * 0.62 + gallop * 0.04,
    size * 0.013,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = `rgba(255, 249, 226, ${shimmer * 0.75})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.007,
    y - size * 0.714 + gallop * 0.04,
    size * 0.007,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Bronze battle helm details over the laurel crown.
  const centaurHelmGrad = ctx.createLinearGradient(
    x - size * 0.14,
    y - size * 0.64 + gallop * 0.04,
    x + size * 0.14,
    y - size * 0.5 + gallop * 0.04,
  );
  centaurHelmGrad.addColorStop(0, "#6d5b2a");
  centaurHelmGrad.addColorStop(0.5, "#a88a3b");
  centaurHelmGrad.addColorStop(1, "#6d5b2a");
  ctx.fillStyle = centaurHelmGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y - size * 0.58 + gallop * 0.04);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.66 + gallop * 0.04,
    x + size * 0.13,
    y - size * 0.58 + gallop * 0.04,
  );
  ctx.lineTo(x + size * 0.11, y - size * 0.53 + gallop * 0.04);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.56 + gallop * 0.04,
    x - size * 0.11,
    y - size * 0.53 + gallop * 0.04,
  );
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#806726";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.012,
    y - size * 0.62 + gallop * 0.04,
    size * 0.024,
    size * 0.11,
    size * 0.006,
  );
  ctx.fill();
  ctx.fillStyle = "#dabb66";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.085,
      y - size * 0.57 + gallop * 0.04,
      size * 0.009,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === FIERCE GLOWING EYES ===
  // Eye base
  ctx.fillStyle = "#577f45";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.05,
    y - size * 0.54 + gallop * 0.04,
    size * 0.028,
    size * 0.022,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.05,
    y - size * 0.54 + gallop * 0.04,
    size * 0.028,
    size * 0.022,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Eye glow
  ctx.fillStyle = "#8eb863";
  ctx.shadowColor = "#9ccd7a";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.05,
    y - size * 0.54 + gallop * 0.04,
    size * 0.02,
    size * 0.015,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.05,
    y - size * 0.54 + gallop * 0.04,
    size * 0.02,
    size * 0.015,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.045,
    y - size * 0.545 + gallop * 0.04,
    size * 0.01,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.055,
    y - size * 0.545 + gallop * 0.04,
    size * 0.01,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Determined eyebrows
  ctx.strokeStyle = centaurGoldDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.58 + gallop * 0.04);
  ctx.lineTo(x - size * 0.02, y - size * 0.6 + gallop * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.09, y - size * 0.58 + gallop * 0.04);
  ctx.lineTo(x + size * 0.02, y - size * 0.6 + gallop * 0.04);
  ctx.stroke();

  // Noble expression
  ctx.strokeStyle = "#b08060";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.47 + gallop * 0.04,
    size * 0.035,
    0.15,
    Math.PI - 0.15,
  );
  ctx.stroke();

  // === MASTERWORK RECURVE BOW === (richer silhouette + stronger read)
  ctx.save();
  ctx.translate(bowX, bowY);
  ctx.rotate(bowRotation);

  const bowBend = isAttacking ? 0.64 + bowDraw * 0.25 : 0.62;
  const outerRadius = size * 0.3;
  const innerRadius = size * 0.275;

  // Outer horn shell.
  ctx.strokeStyle = "#3a220e";
  ctx.lineWidth = 3.6 * zoom;
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    outerRadius,
    Math.PI - bowBend * Math.PI,
    Math.PI + bowBend * Math.PI,
  );
  ctx.stroke();

  // Main laminated wood body.
  const bowCoreGrad = ctx.createLinearGradient(-outerRadius, 0, size * 0.08, 0);
  bowCoreGrad.addColorStop(0, "#5b3918");
  bowCoreGrad.addColorStop(0.28, "#83592f");
  bowCoreGrad.addColorStop(0.62, "#714725");
  bowCoreGrad.addColorStop(1, "#5a3617");
  ctx.strokeStyle = bowCoreGrad;
  ctx.lineWidth = 2.8 * zoom;
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    innerRadius,
    Math.PI - bowBend * Math.PI,
    Math.PI + bowBend * Math.PI,
  );
  ctx.stroke();

  // Gold inlay channels.
  ctx.strokeStyle = "#d2ab4d";
  ctx.lineWidth = 1.25 * zoom;
  for (let mark = 0; mark < 3; mark++) {
    const mid = 0.47 + mark * 0.48;
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, Math.PI * (mid - 0.03), Math.PI * (mid + 0.03));
    ctx.stroke();
  }

  // Tip geometry.
  const topTipX = Math.cos(Math.PI - bowBend * Math.PI) * outerRadius;
  const topTipY = Math.sin(Math.PI - bowBend * Math.PI) * outerRadius;
  const botTipX = Math.cos(Math.PI + bowBend * Math.PI) * outerRadius;
  const botTipY = Math.sin(Math.PI + bowBend * Math.PI) * outerRadius;
  const hornTopX = topTipX - size * 0.02;
  const hornTopY = topTipY - size * 0.028;
  const hornBotX = botTipX - size * 0.02;
  const hornBotY = botTipY + size * 0.028;
  ctx.fillStyle = "#d8ba6f";
  ctx.beginPath();
  ctx.moveTo(topTipX - size * 0.01, topTipY);
  ctx.lineTo(hornTopX, hornTopY);
  ctx.lineTo(topTipX + size * 0.012, topTipY - size * 0.005);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(botTipX - size * 0.01, botTipY);
  ctx.lineTo(hornBotX, hornBotY);
  ctx.lineTo(botTipX + size * 0.012, botTipY + size * 0.005);
  ctx.closePath();
  ctx.fill();

  // Grip and gemstone.
  const gripGrad = ctx.createLinearGradient(
    -size * 0.255,
    -size * 0.04,
    -size * 0.17,
    size * 0.04,
  );
  gripGrad.addColorStop(0, "#2e1c0f");
  gripGrad.addColorStop(0.5, "#4a2a15");
  gripGrad.addColorStop(1, "#24160b");
  ctx.fillStyle = gripGrad;
  ctx.beginPath();
  ctx.roundRect(
    -size * 0.255,
    -size * 0.04,
    size * 0.085,
    size * 0.08,
    size * 0.014,
  );
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  ctx.fillStyle = centaurGoldLight;
  ctx.shadowColor = centaurGoldLight;
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(-size * 0.212, 0, size * 0.016, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Dual-layer string.
  const stringPull = -size * (0.2 + (isAttacking ? bowDraw * 0.24 : 0));
  if (isAttacking) {
    ctx.shadowColor = "#ffd06c";
    ctx.shadowBlur = 7 * zoom * bowDraw;
  }
  ctx.strokeStyle = isAttacking ? "#fff7db" : "#f6eed5";
  ctx.lineWidth = (isAttacking ? 2.6 : 2.1) * zoom;
  ctx.beginPath();
  ctx.moveTo(hornTopX, hornTopY);
  ctx.lineTo(stringPull, 0);
  ctx.lineTo(hornBotX, hornBotY);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 220, 145, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(topTipX, topTipY);
  ctx.lineTo(stringPull + size * 0.01, 0);
  ctx.lineTo(botTipX, botTipY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Nocked arrow.
  if (!isAttacking || attackPhase < 0.52) {
    const arrowOffset = isAttacking ? bowDraw * size * 0.11 : 0;
    const shaftGrad = ctx.createLinearGradient(
      stringPull - size * 0.44,
      0,
      stringPull,
      0,
    );
    shaftGrad.addColorStop(0, "#322010");
    shaftGrad.addColorStop(0.5, "#5b3f22");
    shaftGrad.addColorStop(1, "#2f1d10");
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(
      stringPull + arrowOffset * 0.5 - size * 0.44,
      -size * 0.015,
      size * 0.44,
      size * 0.03,
    );

    // Fletching.
    ctx.fillStyle = centaurLeafMid;
    ctx.beginPath();
    ctx.moveTo(stringPull + arrowOffset * 0.28 + size * 0.018, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.52 + size * 0.068, -size * 0.037);
    ctx.lineTo(stringPull + arrowOffset * 0.28 - size * 0.03, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.52 + size * 0.068, size * 0.037);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = centaurLeafLight;
    ctx.beginPath();
    ctx.moveTo(stringPull + arrowOffset * 0.3 + size * 0.008, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.42 + size * 0.042, -size * 0.021);
    ctx.lineTo(stringPull + arrowOffset * 0.3 - size * 0.015, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.42 + size * 0.042, size * 0.021);
    ctx.closePath();
    ctx.fill();

    // Arrow head.
    if (isAttacking) {
      ctx.shadowColor = "#ffcf74";
      ctx.shadowBlur = 8 * zoom * bowDraw;
    }
    const headGrad = ctx.createLinearGradient(
      stringPull - size * 0.47,
      -size * 0.04,
      stringPull - size * 0.47,
      size * 0.04,
    );
    headGrad.addColorStop(0, "#c7cfdd");
    headGrad.addColorStop(0.5, isAttacking ? "#f4f7ff" : "#e7ebf3");
    headGrad.addColorStop(1, "#9ea9ba");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(stringPull - size * 0.438, 0);
    ctx.lineTo(stringPull - size * 0.344, -size * 0.038);
    ctx.lineTo(stringPull - size * 0.368, 0);
    ctx.lineTo(stringPull - size * 0.344, size * 0.038);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
  drawTroopMasterworkFinish(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    TROOP_MASTERWORK_STYLES.centaur,
    { mounted: true },
  );
}
