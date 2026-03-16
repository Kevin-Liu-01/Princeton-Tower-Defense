import type { Position } from "../../types";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  drawHorseTail,
  drawMuscularHorseBody,
  drawMuscularHorseLeg,
} from "./troopHelpers";
import type { HorseLegColors } from "./troopHelpers";

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
  const bodyY = y + size * 0.15 + gallop * 0.12;
  drawMuscularHorseBody(
    ctx,
    x + size * 0.08,
    bodyY,
    size * 0.46,
    size * 0.28,
    size,
    zoom,
    {
      coatLight: centaurBrownLight,
      coatMid: centaurBrownMid,
      coatDark: centaurBrownDark,
      muscleHighlight: "rgba(188, 164, 109, 0.22)",
      muscleShadow: "rgba(71, 53, 34, 0.35)",
    },
  );

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
  const centaurLegColors: HorseLegColors = {
    thighLight: centaurBrownLight,
    thighMid: centaurBrownMid,
    thighDark: centaurBrownDark,
    greaveTop: centaurLeafDark,
    greaveMid: centaurLeafMid,
    greaveBottom: "#2e4a27",
    hoofColor: "#2b1f16",
    trimColor: centaurGoldMid,
  };
  drawMuscularHorseLeg(
    ctx, x - size * 0.2, y + size * 0.33 + gallop * 0.1,
    size, zoom, time, legCycle * 1.12, 0.1, 7, centaurLegColors,
  );
  drawMuscularHorseLeg(
    ctx, x - size * 0.05, y + size * 0.34 + gallop * 0.1,
    size, zoom, time, -legCycle * 0.9, 1.15, 7, centaurLegColors,
  );
  drawMuscularHorseLeg(
    ctx, x + size * 0.22, y + size * 0.34 + gallop * 0.1,
    size, zoom, time, -legCycle * 1.03, 2.15, 7, centaurLegColors,
  );
  drawMuscularHorseLeg(
    ctx, x + size * 0.37, y + size * 0.33 + gallop * 0.1,
    size, zoom, time, legCycle * 0.86, 3.0, 7, centaurLegColors,
  );

  // === MAJESTIC FLOWING TAIL ===
  drawHorseTail(
    ctx,
    x + size * 0.5,
    y + size * 0.07 + gallop * 0.12,
    size,
    zoom,
    time,
    5.6,
    3.8,
    {
      base: "#2b1c13",
      mid: "#5b4128",
      highlight: "#9e7e52",
      accent: "rgba(181, 151, 88, 0.45)",
      glowRgb: "214, 187, 118",
    },
    0.2 + Math.sin(time * 4) * 0.1,
  );

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

  // === POWERFUL ARMS WITH BRACERS (connecting to bow) ===
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

  // Left arm → bow grip (holding the bow body)
  const centLShoulderX = x - size * 0.26;
  const centLShoulderY = y - size * 0.18 + gallop * 0.05;
  const centArmToBowAngle = Math.atan2(
    bowY - centLShoulderY,
    bowX - centLShoulderX,
  );

  ctx.save();
  ctx.translate(centLShoulderX, centLShoulderY);
  ctx.rotate(centArmToBowAngle);
  // Upper arm
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.ellipse(size * 0.08, 0, size * 0.13, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(size * 0.18, 0, size * 0.11, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ornate bracer
  ctx.fillStyle = centaurGoldDark;
  ctx.beginPath();
  ctx.ellipse(size * 0.17, 0, size * 0.06, size * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1;
  ctx.stroke();
  // Bracer gem
  ctx.fillStyle = centaurLeafLight;
  ctx.shadowColor = centaurLeafLight;
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(size * 0.17, 0, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Hand gripping bow
  ctx.fillStyle = "#d8a860";
  ctx.beginPath();
  ctx.arc(size * 0.24, 0, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm → bowstring nock point (pulled back behind the centaur)
  const centRShoulderX = x + size * 0.26;
  const centRShoulderY = y - size * 0.18 + gallop * 0.05;
  // Nock point: behind the bow, pulled right by bowDraw
  const nockX = bowX + size * (0.15 + bowDraw * 0.18);
  const nockY = bowY;
  const centArmToNockAngle = Math.atan2(
    nockY - centRShoulderY,
    nockX - centRShoulderX,
  );

  ctx.save();
  ctx.translate(centRShoulderX, centRShoulderY);
  ctx.rotate(centArmToNockAngle);
  // Upper arm
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.ellipse(size * 0.08, 0, size * 0.13, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(size * 0.16, 0, size * 0.11, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bracer
  ctx.fillStyle = centaurGoldDark;
  ctx.beginPath();
  ctx.ellipse(size * 0.15, 0, size * 0.06, size * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = centaurLeafLight;
  ctx.shadowColor = centaurLeafLight;
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(size * 0.15, 0, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Hand pinching the bowstring
  ctx.fillStyle = "#d8a860";
  ctx.beginPath();
  ctx.arc(size * 0.22, 0, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
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

  // === MASTERWORK RECURVE BOW ===
  ctx.save();
  ctx.translate(bowX, bowY);
  ctx.rotate(bowRotation);

  const bowBend = isAttacking ? 0.64 + bowDraw * 0.25 : 0.62;
  const bowRadius = size * 0.28;
  const bendAmt = bowBend * Math.PI;
  const arcStart = Math.PI - bendAmt;
  const arcEnd = Math.PI + bendAmt;

  // Tip positions on the arc
  const topTipX = Math.cos(arcStart) * bowRadius;
  const topTipY = Math.sin(arcStart) * bowRadius;
  const botTipX = Math.cos(arcEnd) * bowRadius;
  const botTipY = Math.sin(arcEnd) * bowRadius;

  // Recurve horn kicks at tips
  const recurveKick = size * 0.04;
  const hornTopX = topTipX + recurveKick * 0.4;
  const hornTopY = topTipY - recurveKick;
  const hornBotX = botTipX + recurveKick * 0.4;
  const hornBotY = botTipY + recurveKick;

  // --- Bow arc body (clean arc) ---
  // Dark outer edge
  ctx.strokeStyle = "#2e1a0a";
  ctx.lineWidth = 3.0 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, bowRadius, arcStart, arcEnd);
  ctx.stroke();

  // Wood core with gradient
  const limbGrad = ctx.createLinearGradient(
    -bowRadius, -bowRadius * 0.5, -bowRadius * 0.3, bowRadius * 0.5,
  );
  limbGrad.addColorStop(0, "#5c3818");
  limbGrad.addColorStop(0.25, "#8a5e34");
  limbGrad.addColorStop(0.5, "#7a5028");
  limbGrad.addColorStop(0.75, "#8a5e34");
  limbGrad.addColorStop(1, "#5c3818");
  ctx.strokeStyle = limbGrad;
  ctx.lineWidth = 2.0 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, bowRadius, arcStart, arcEnd);
  ctx.stroke();

  // Inner highlight along belly of the arc
  ctx.strokeStyle = "rgba(196, 158, 96, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, bowRadius - size * 0.008, arcStart + 0.1, arcEnd - 0.1);
  ctx.stroke();

  // Gold inlay accent marks along the arc
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.0 * zoom;
  for (let mark = 0; mark < 3; mark++) {
    const markAngle = Math.PI + (mark - 1) * bendAmt * 0.45;
    ctx.beginPath();
    ctx.arc(0, 0, bowRadius, markAngle - 0.04, markAngle + 0.04);
    ctx.stroke();
  }

  // --- Recurve horn tips ---
  for (const side of [-1, 1] as const) {
    const tipX = side === -1 ? topTipX : botTipX;
    const tipY = side === -1 ? topTipY : botTipY;
    const hornX = side === -1 ? hornTopX : hornBotX;
    const hornY = side === -1 ? hornTopY : hornBotY;

    ctx.strokeStyle = "#4a3018";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(
      tipX + recurveKick * 0.7,
      tipY - side * recurveKick * 0.5,
      hornX,
      hornY,
    );
    ctx.stroke();

    // Gold accent on horn
    ctx.strokeStyle = centaurGoldMid;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(
      tipX + recurveKick * 0.7,
      tipY - side * recurveKick * 0.5,
      hornX,
      hornY,
    );
    ctx.stroke();

    // Nock notch
    ctx.fillStyle = "#1a0f08";
    ctx.beginPath();
    ctx.arc(hornX, hornY, size * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Leather grip wrap ---
  const gripCx = -bowRadius;
  const gripH = size * 0.055;
  const gripW = size * 0.05;
  const gripGrad = ctx.createLinearGradient(
    gripCx - gripW * 0.5, -gripH, gripCx + gripW * 0.5, gripH,
  );
  gripGrad.addColorStop(0, "#2e1c0f");
  gripGrad.addColorStop(0.4, "#4a2a15");
  gripGrad.addColorStop(1, "#24160b");
  ctx.fillStyle = gripGrad;
  ctx.beginPath();
  ctx.roundRect(gripCx - gripW * 0.5, -gripH, gripW, gripH * 2, size * 0.008);
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  // Wrap stitch lines
  ctx.strokeStyle = "rgba(80, 50, 25, 0.55)";
  ctx.lineWidth = 0.5 * zoom;
  for (let w = 0; w < 3; w++) {
    const wy = -gripH + (w + 0.5) * (gripH * 2) / 3;
    ctx.beginPath();
    ctx.moveTo(gripCx - gripW * 0.35, wy);
    ctx.lineTo(gripCx + gripW * 0.35, wy + size * 0.006);
    ctx.stroke();
  }

  // Grip gemstone
  ctx.fillStyle = centaurGoldLight;
  ctx.shadowColor = centaurGoldLight;
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(gripCx, 0, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = centaurLeafLight;
  ctx.beginPath();
  ctx.arc(gripCx, 0, size * 0.007, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // --- Bowstring - straight lines ---
  const stringPull = -size * (0.2 + (isAttacking ? bowDraw * 0.24 : 0));
  ctx.lineCap = "round";
  if (isAttacking) {
    ctx.shadowColor = "rgba(255, 215, 120, 0.6)";
    ctx.shadowBlur = 4 * zoom * bowDraw;
  }
  ctx.strokeStyle = isAttacking ? "#f5ecd4" : "#ddd5be";
  ctx.lineWidth = (isAttacking ? 1.0 : 0.8) * zoom;
  ctx.beginPath();
  ctx.moveTo(hornTopX, hornTopY);
  ctx.lineTo(stringPull, 0);
  ctx.lineTo(hornBotX, hornBotY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Nocked arrow
  if (!isAttacking || attackPhase < 0.52) {
    const arrowOffset = isAttacking ? bowDraw * size * 0.11 : 0;
    const shaftStart = stringPull + arrowOffset * 0.5 - size * 0.4;
    const shaftEnd = stringPull + arrowOffset * 0.5;
    const shaftW = size * 0.01;

    // Arrow shaft
    const shaftGrad = ctx.createLinearGradient(shaftStart, 0, shaftEnd, 0);
    shaftGrad.addColorStop(0, "#3a2414");
    shaftGrad.addColorStop(0.5, "#5c3e24");
    shaftGrad.addColorStop(1, "#3a2414");
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(shaftStart, -shaftW, shaftEnd - shaftStart, shaftW * 2);

    // Fletching vanes (three angled feathers)
    const fletchX = shaftEnd - size * 0.02;
    for (let f = -1; f <= 1; f++) {
      ctx.fillStyle = f === 0 ? centaurLeafLight : centaurLeafMid;
      ctx.globalAlpha = f === 0 ? 0.9 : 0.7;
      ctx.beginPath();
      ctx.moveTo(fletchX, 0);
      ctx.lineTo(fletchX + size * 0.055, f * size * 0.022 - size * 0.003);
      ctx.lineTo(fletchX + size * 0.06, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Nock (string notch)
    ctx.fillStyle = "#221408";
    ctx.fillRect(shaftEnd - size * 0.004, -shaftW * 1.3, size * 0.008, shaftW * 2.6);

    // Arrowhead - broadhead style
    const headX = shaftStart;
    if (isAttacking) {
      ctx.shadowColor = "#ffcf74";
      ctx.shadowBlur = 6 * zoom * bowDraw;
    }
    const headGrad = ctx.createLinearGradient(
      headX - size * 0.06,
      -size * 0.025,
      headX - size * 0.06,
      size * 0.025,
    );
    headGrad.addColorStop(0, "#bcc4d4");
    headGrad.addColorStop(0.5, isAttacking ? "#eef1fa" : "#dde2ec");
    headGrad.addColorStop(1, "#96a0b2");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.065, 0);
    ctx.lineTo(headX - size * 0.01, -size * 0.024);
    ctx.lineTo(headX + size * 0.005, 0);
    ctx.lineTo(headX - size * 0.01, size * 0.024);
    ctx.closePath();
    ctx.fill();

    // Arrowhead edge highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.06, 0);
    ctx.lineTo(headX - size * 0.012, -size * 0.02);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}
